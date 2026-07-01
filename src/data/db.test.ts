import { describe, expect, it, vi } from 'vitest';

import { MIGRATION_STEPS, runMigrations, type MigrationTarget } from './db';

vi.mock('expo-sqlite', () => ({ openDatabaseAsync: vi.fn() }));

function createFakeDb(initialVersion = 0, options: { stimulusColumnExists?: boolean } = {}) {
  const executed: string[] = [];
  let userVersion = initialVersion;
  let stimulusColumnExists = options.stimulusColumnExists ?? false;

  const db: MigrationTarget = {
    async execAsync(source) {
      executed.push(source);
      const match = /PRAGMA user_version = (\d+)/.exec(source);
      if (match) userVersion = Number(match[1]);
      if (source.includes('ALTER TABLE sessions ADD COLUMN stimulus_version')) {
        // Mirror real sqlite: re-adding an existing column is an error.
        if (stimulusColumnExists) throw new Error('duplicate column name: stimulus_version');
        stimulusColumnExists = true;
      }
    },
    async getFirstAsync<T>(source: string): Promise<T | null> {
      if (source === 'PRAGMA user_version') {
        return { user_version: userVersion } as T;
      }
      if (source.includes("pragma_table_info('sessions')")) {
        return { found: stimulusColumnExists ? 1 : 0 } as T;
      }
      return null;
    },
  };

  return { db, executed, version: () => userVersion };
}

describe('sqlite migration ladder', () => {
  it('declares strictly ascending target versions starting at 1', () => {
    expect(MIGRATION_STEPS.length).toBeGreaterThan(0);
    expect(MIGRATION_STEPS[0].toVersion).toBe(1);
    for (let index = 1; index < MIGRATION_STEPS.length; index += 1) {
      expect(MIGRATION_STEPS[index].toVersion).toBeGreaterThan(MIGRATION_STEPS[index - 1].toVersion);
    }
  });

  it('runs every step once on a fresh database and stamps the final version', async () => {
    const fake = createFakeDb();

    await runMigrations(fake.db);

    const latest = MIGRATION_STEPS[MIGRATION_STEPS.length - 1].toVersion;
    expect(fake.version()).toBe(latest);
    expect(fake.executed.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS sessions'))).toBe(true);
    expect(fake.executed.some((sql) => sql.includes('PRAGMA busy_timeout = 5000'))).toBe(true);
  });

  it('is idempotent: a second run executes no schema statements', async () => {
    const fake = createFakeDb();
    await runMigrations(fake.db);
    const countAfterFirstRun = fake.executed.length;

    await runMigrations(fake.db);

    const secondRun = fake.executed.slice(countAfterFirstRun);
    expect(secondRun.some((sql) => sql.includes('CREATE TABLE'))).toBe(false);
    expect(secondRun.some((sql) => sql.includes('PRAGMA user_version ='))).toBe(false);
    expect(fake.version()).toBe(MIGRATION_STEPS[MIGRATION_STEPS.length - 1].toVersion);
  });

  it('skips steps already applied on a partially migrated database', async () => {
    const fake = createFakeDb(MIGRATION_STEPS[MIGRATION_STEPS.length - 1].toVersion);

    await runMigrations(fake.db);

    expect(fake.executed.some((sql) => sql.includes('CREATE TABLE'))).toBe(false);
  });

  it('adds the sessions.stimulus_version column and backfills it at version 2', async () => {
    const fake = createFakeDb();

    await runMigrations(fake.db);

    expect(
      fake.executed.some((sql) => sql.includes('ALTER TABLE sessions ADD COLUMN stimulus_version INTEGER'))
    ).toBe(true);
    expect(fake.executed.some((sql) => sql.includes('UPDATE sessions SET stimulus_version = 1'))).toBe(true);
  });

  it('re-stamps without re-running the alter when the column already landed (crash window)', async () => {
    // Crash after the step-2 statements but before its version bump: the
    // column exists while user_version still reads 1. The rerun must skip the
    // ALTER (which would throw "duplicate column name") and only re-stamp.
    const fake = createFakeDb(1, { stimulusColumnExists: true });

    await runMigrations(fake.db);

    expect(fake.executed.some((sql) => sql.includes('ALTER TABLE'))).toBe(false);
    expect(fake.version()).toBe(2);
  });

  it('backfills pre-existing session rows to legacy stimulus_version 1 on a real database', async () => {
    const { DatabaseSync } = await import('node:sqlite');
    const raw = new DatabaseSync(':memory:');
    const db: MigrationTarget = {
      async execAsync(source) {
        raw.exec(source);
      },
      async getFirstAsync<T>(source: string): Promise<T | null> {
        return (raw.prepare(source).get() as T | undefined) ?? null;
      },
    };
    // A version-1 database holding a session written before the stamp existed.
    raw.exec(MIGRATION_STEPS[0].statements);
    raw.exec('PRAGMA user_version = 1');
    raw.exec(
      "INSERT INTO sessions (id, started_at, completed_at, status, payload) VALUES ('session-legacy', '2026-05-31T08:00:00.000Z', NULL, 'completed', '{}')"
    );

    await runMigrations(db);

    const row = raw
      .prepare("SELECT stimulus_version FROM sessions WHERE id = 'session-legacy'")
      .get() as { stimulus_version: number };
    expect(row.stimulus_version).toBe(1);
    expect(raw.prepare('PRAGMA user_version').get()).toMatchObject({
      user_version: MIGRATION_STEPS[MIGRATION_STEPS.length - 1].toVersion,
    });
  });
});
