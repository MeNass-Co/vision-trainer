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
};

/**
 * Ordered schema ladder keyed on `PRAGMA user_version`. Each step upgrades the
 * schema from `toVersion - 1` to `toVersion`; future schema changes append a
 * new step instead of editing an existing one. Every step must stay idempotent
 * (IF NOT EXISTS et al.) so a crash between the statements and the version
 * bump reruns safely on the next launch.
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
    await db.execAsync(step.statements);
    await db.execAsync(`PRAGMA user_version = ${step.toVersion}`);
    version = step.toVersion;
  }
}

export async function migrate(): Promise<void> {
  const db = await getDatabase();
  await runMigrations(db);
}
