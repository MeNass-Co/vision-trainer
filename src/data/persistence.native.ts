import type { SessionLog, ThresholdEstimate } from '@/types';
import type { SettingsState } from '@/presenters/types';

import { getDatabase, migrate } from './db';
import {
  payloadToSettings,
  rowToSession,
  rowToThreshold,
  sessionToRow,
  settingsToPayload,
  thresholdToRow,
  type SessionRow,
  type ThresholdRow,
} from './mappers';
import type { Persistence } from './persistence';

export const sqlitePersistence: Persistence = {
  async init() {
    await migrate();
  },

  async loadSessions() {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SessionRow>(
      'SELECT id, started_at, completed_at, status, payload FROM sessions ORDER BY started_at ASC'
    );
    const sessions = rows.map(rowToSession).filter((session): session is SessionLog => session !== null);
    if (sessions.length < rows.length) {
      console.warn(`[data] dropped ${rows.length - sessions.length} invalid session row(s) on load`);
    }
    return sessions;
  },

  async loadThresholds() {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ThresholdRow>(
      'SELECT id, session_id, condition_key, spatial_frequency, created_at, payload FROM thresholds ORDER BY created_at ASC'
    );
    const thresholds = rows
      .map(rowToThreshold)
      .filter((threshold): threshold is ThresholdEstimate => threshold !== null);
    if (thresholds.length < rows.length) {
      console.warn(`[data] dropped ${rows.length - thresholds.length} invalid threshold row(s) on load`);
    }
    return thresholds;
  },

  async loadSettings() {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM settings WHERE id = 1'
    );
    return row ? payloadToSettings(row.payload) : null;
  },

  async saveSettings(settings) {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (id, payload) VALUES (1, ?)',
      settingsToPayload(settings)
    );
  },

  async saveSessionResult(session, thresholds) {
    const db = await getDatabase();
    const sessionRow = sessionToRow(session);
    const thresholdRows = thresholds.map(thresholdToRow);
    await db.withExclusiveTransactionAsync(async (txn) => {
      // withExclusiveTransactionAsync opens a NEW connection per transaction;
      // busy_timeout is per-connection, so set it here too. The wrapper issues a
      // deferred BEGIN (no lock taken yet), so this runs before any lock attempt.
      await txn.execAsync('PRAGMA busy_timeout = 5000;');
      await txn.runAsync(
        'INSERT OR REPLACE INTO sessions (id, started_at, completed_at, status, payload) VALUES (?, ?, ?, ?, ?)',
        sessionRow.id,
        sessionRow.started_at,
        sessionRow.completed_at,
        sessionRow.status,
        sessionRow.payload
      );
      for (const row of thresholdRows) {
        await txn.runAsync(
          'INSERT OR REPLACE INTO thresholds (id, session_id, condition_key, spatial_frequency, created_at, payload) VALUES (?, ?, ?, ?, ?, ?)',
          row.id,
          row.session_id,
          row.condition_key,
          row.spatial_frequency,
          row.created_at,
          row.payload
        );
      }
    });
  },
};

/** Native platforms (iOS/Android) use the real on-device sqlite store. */
export const activePersistence: Persistence = sqlitePersistence;
