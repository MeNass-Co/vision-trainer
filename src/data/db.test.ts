import { describe, expect, it, vi } from 'vitest';

import { MIGRATION_STEPS, runMigrations, type MigrationTarget } from './db';

vi.mock('expo-sqlite', () => ({ openDatabaseAsync: vi.fn() }));

function createFakeDb(initialVersion = 0) {
  const executed: string[] = [];
  let userVersion = initialVersion;

  const db: MigrationTarget = {
    async execAsync(source) {
      executed.push(source);
      const match = /PRAGMA user_version = (\d+)/.exec(source);
      if (match) userVersion = Number(match[1]);
    },
    async getFirstAsync<T>(source: string): Promise<T | null> {
      if (source === 'PRAGMA user_version') {
        return { user_version: userVersion } as T;
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
});
