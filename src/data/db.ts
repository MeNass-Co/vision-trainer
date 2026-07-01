import * as SQLite from 'expo-sqlite';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('vision-trainer.db').catch((error) => {
      // Don't cache a rejected open — let the next caller retry.
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

/** The subset of the sqlite connection the migration ladder needs (unit-testable). */
export type MigrationTarget = {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string): Promise<T | null>;
};

export type MigrationStep = {
  /** The `PRAGMA user_version` this step upgrades the database to. */
  toVersion: number;
  statements: string;
  /**
   * ALTER TABLE ADD COLUMN has no IF NOT EXISTS form, so a step whose
   * statements cannot be natively idempotent reports here whether its schema
   * change already landed (crash between the statements and the version
   * bump); runMigrations then only re-stamps the version.
   */
  alreadyApplied?(db: MigrationTarget): Promise<boolean>;
};

/**
 * Ordered schema ladder keyed on `PRAGMA user_version`. Each step upgrades the
 * schema from `toVersion - 1` to `toVersion`; future schema changes append a
 * new step instead of editing an existing one. Every step must stay idempotent
 * (IF NOT EXISTS et al.) so a crash between the statements and the version
 * bump reruns safely on the next launch — or, when SQL cannot express that,
 * declare `alreadyApplied` so the rerun skips the statements.
 */
export const MIGRATION_STEPS: readonly MigrationStep[] = [
  {
    toVersion: 1,
    statements: `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT NOT NULL,
        payload TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS thresholds (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL,
        condition_key TEXT NOT NULL,
        spatial_frequency REAL NOT NULL,
        created_at TEXT NOT NULL,
        payload TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_thresholds_freq ON thresholds (spatial_frequency, created_at);
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        payload TEXT NOT NULL
      );
    `,
  },
  {
    // Stamp each session with the stimulus engine that measured it (see
    // STIMULUS_VERSION in core/gaborStops): rows written before the column
    // existed all predate the calibrated engine, so backfill them as legacy 1.
    toVersion: 2,
    statements: `
      ALTER TABLE sessions ADD COLUMN stimulus_version INTEGER;
      UPDATE sessions SET stimulus_version = 1;
    `,
    async alreadyApplied(db) {
      const row = await db.getFirstAsync<{ found: number }>(
        "SELECT COUNT(*) AS found FROM pragma_table_info('sessions') WHERE name = 'stimulus_version'"
      );
      return (row?.found ?? 0) > 0;
    },
  },
];

export async function runMigrations(db: MigrationTarget): Promise<void> {
  // busy_timeout is per-connection: colliding writers wait instead of throwing
  // "database is locked" immediately (sqlite default is 0ms).
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
  `);

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  for (const step of MIGRATION_STEPS) {
    if (version >= step.toVersion) continue;
    if (!step.alreadyApplied || !(await step.alreadyApplied(db))) {
      await db.execAsync(step.statements);
    }
    await db.execAsync(`PRAGMA user_version = ${step.toVersion}`);
    version = step.toVersion;
  }
}

export async function migrate(): Promise<void> {
  const db = await getDatabase();
  await runMigrations(db);
}
