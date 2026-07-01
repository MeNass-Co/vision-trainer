import { describe, expect, it, vi } from 'vitest';

import type { SettingsState } from '@/presenters/types';
import type { SessionLog, ThresholdEstimate } from '@/types';
import { DEFAULT_SETTINGS } from '../store/defaults';
import {
  payloadToSettings,
  rowToSession,
  rowToThreshold,
  sessionToRow,
  settingsToPayload,
  thresholdToRow,
} from './mappers';

vi.mock('@/store/defaults', () => ({
  DEFAULT_SETTINGS: {
    dichopticEnabled: false,
    displayBrightness: 0.85,
    monocularWeakEye: 'off',
    hapticsEnabled: true,
    soundEnabled: false,
    reduceMotion: false,
    remindersEnabled: false,
    onboardingComplete: false,
    subscriptionStatus: 'free',
    trialStartedAt: null,
    visionGoal: 'unspecified',
  },
}));

describe('data mappers', () => {
  it('round-trips a full session and populates the completed-at index', () => {
    const session: SessionLog = {
      id: 'session-1',
      startedAt: '2026-05-31T08:00:00.000Z',
      completedAt: '2026-05-31T08:12:00.000Z',
      status: 'completed',
      eyeMode: 'both',
      sessionType: 'guided',
      calibrationId: 'calibration-1',
      protocolVersion: '1.0.0',
      stimulusVersion: 2,
      plannedBlocks: [
        {
          id: 'block-1',
          label: 'Contrast detection',
          paradigm: 'contrast-detection',
          condition: {
            paradigm: 'contrast-detection',
            spatialFrequencyCpd: 6,
            orientationDeg: 90,
            trialsPerBlock: 20,
            durationMs: 200,
            gaborSizeDeg: 2,
          },
          role: 'assessment',
        },
      ],
      completedTrials: 20,
      metadata: { source: 'test', dichoptic: false, score: 0.92 },
    };

    const row = sessionToRow(session);

    expect(row.completed_at).toBe('2026-05-31T08:12:00.000Z');
    expect(row.stimulus_version).toBe(2);
    expect(rowToSession(row)).toEqual(session);
  });

  it('returns null for corrupt session rows', () => {
    expect(rowToSession({
      completed_at: null,
      id: 'session-corrupt',
      payload: '{bad json',
      started_at: '2026-05-31T08:00:00.000Z',
      status: 'completed',
      stimulus_version: null,
    })).toBeNull();
    expect(rowToSession({
      completed_at: null,
      id: 'session-invalid',
      payload: JSON.stringify({ id: 'session-invalid' }),
      started_at: '2026-05-31T08:00:00.000Z',
      status: 'completed',
      stimulus_version: null,
    })).toBeNull();
  });

  it('round-trips a full threshold and populates its indexed columns', () => {
    const threshold: ThresholdEstimate = {
      id: 'threshold-1',
      sessionId: 'session-1',
      blockId: 'block-1',
      conditionKey: 'contrast-detection:6:90',
      paradigm: 'contrast-detection',
      spatialFrequencyCpd: 6,
      orientationDeg: 90,
      thresholdContrast: 0.08,
      thresholdLog10: -1.09691,
      ciLow: 0.06,
      ciHigh: 0.1,
      trialCount: 20,
      lapseRate: 0.02,
      createdAt: '2026-05-31T08:12:00.000Z',
    };

    const row = thresholdToRow(threshold);

    expect(row.spatial_frequency).toBe(6);
    expect(row.condition_key).toBe('contrast-detection:6:90');
    expect(rowToThreshold(row)).toEqual(threshold);
  });

  it('returns null for corrupt threshold rows', () => {
    expect(rowToThreshold({
      condition_key: 'contrast-detection:6:90',
      created_at: '2026-05-31T08:12:00.000Z',
      id: 'threshold-corrupt',
      payload: '{bad json',
      session_id: 'session-1',
      spatial_frequency: 6,
    })).toBeNull();
    expect(rowToThreshold({
      condition_key: 'contrast-detection:6:90',
      created_at: '2026-05-31T08:12:00.000Z',
      id: 'threshold-invalid',
      payload: JSON.stringify({ id: 'threshold-invalid' }),
      session_id: 'session-1',
      spatial_frequency: 6,
    })).toBeNull();
  });

  it('rejects thresholds with non-finite or non-positive numeric fields', () => {
    const base: ThresholdEstimate = {
      id: 'threshold-numeric',
      sessionId: 'session-1',
      blockId: 'block-1',
      conditionKey: 'contrast-detection:6:90',
      paradigm: 'contrast-detection',
      spatialFrequencyCpd: 6,
      orientationDeg: 90,
      thresholdContrast: 0.08,
      thresholdLog10: -1.09691,
      ciLow: 0.06,
      ciHigh: 0.1,
      trialCount: 20,
      lapseRate: 0.02,
      createdAt: '2026-05-31T08:12:00.000Z',
    };
    const rowFor = (payload: string) => ({
      condition_key: base.conditionKey,
      created_at: base.createdAt,
      id: base.id,
      payload,
      session_id: base.sessionId,
      spatial_frequency: base.spatialFrequencyCpd,
    });

    expect(rowToThreshold(rowFor(JSON.stringify({ ...base, thresholdContrast: 0 })))).toBeNull();
    expect(rowToThreshold(rowFor(JSON.stringify({ ...base, thresholdContrast: -0.05 })))).toBeNull();
    // NaN cannot survive JSON.stringify (becomes null); both forms must be rejected.
    expect(rowToThreshold(rowFor(JSON.stringify({ ...base, thresholdContrast: NaN })))).toBeNull();
    // A raw 1e999 literal parses to Infinity.
    expect(
      rowToThreshold(
        rowFor(JSON.stringify(base).replace('"thresholdContrast":0.08', '"thresholdContrast":1e999'))
      )
    ).toBeNull();
    expect(
      rowToThreshold(
        rowFor(JSON.stringify(base).replace('"thresholdLog10":-1.09691', '"thresholdLog10":-1e999'))
      )
    ).toBeNull();
    expect(rowToThreshold(rowFor(JSON.stringify({ ...base, ciLow: NaN })))).toBeNull();
    // Sanity: the untouched base row still passes.
    expect(rowToThreshold(rowFor(JSON.stringify(base)))).toEqual(base);
  });

  it('repairs missing defaultable fields instead of dropping the row', () => {
    const threshold: Record<string, unknown> = {
      id: 'threshold-repair',
      sessionId: 'session-1',
      blockId: 'block-1',
      conditionKey: 'contrast-detection:6:90',
      paradigm: 'contrast-detection',
      spatialFrequencyCpd: 6,
      orientationDeg: 90,
      thresholdContrast: 0.08,
      thresholdLog10: -1.09691,
      ciLow: 0.06,
      ciHigh: 0.1,
      trialCount: 20,
      createdAt: '2026-05-31T08:12:00.000Z',
      // lapseRate intentionally missing (older builds).
    };
    const repairedThreshold = rowToThreshold({
      condition_key: 'contrast-detection:6:90',
      created_at: '2026-05-31T08:12:00.000Z',
      id: 'threshold-repair',
      payload: JSON.stringify(threshold),
      session_id: 'session-1',
      spatial_frequency: 6,
    });

    expect(repairedThreshold).not.toBeNull();
    expect(repairedThreshold?.lapseRate).toBe(0);

    const session: Record<string, unknown> = {
      id: 'session-repair',
      startedAt: '2026-05-31T08:00:00.000Z',
      status: 'completed',
      eyeMode: 'both',
      sessionType: 'guided',
      calibrationId: 'calibration-1',
      protocolVersion: '1.0.0',
      plannedBlocks: [],
      completedTrials: 20,
      // metadata and stimulusVersion intentionally missing (older builds).
    };
    const repairedSession = rowToSession({
      completed_at: null,
      id: 'session-repair',
      payload: JSON.stringify(session),
      started_at: '2026-05-31T08:00:00.000Z',
      status: 'completed',
      stimulus_version: null,
    });

    expect(repairedSession).not.toBeNull();
    expect(repairedSession?.metadata).toEqual({});
    // Pre-stamp sessions were measured by the legacy v1 stripe engine.
    expect(repairedSession?.stimulusVersion).toBe(1);
    // A present-but-invalid stamp is still rejected, never silently defaulted.
    expect(rowToSession({
      completed_at: null,
      id: 'session-repair',
      payload: JSON.stringify({ ...session, metadata: {}, stimulusVersion: 'v2' }),
      started_at: '2026-05-31T08:00:00.000Z',
      status: 'completed',
      stimulus_version: null,
    })).toBeNull();
  });

  it('still rejects rows missing load-bearing fields', () => {
    expect(rowToSession({
      completed_at: null,
      id: 'session-no-start',
      payload: JSON.stringify({ id: 'session-no-start', status: 'completed' }),
      started_at: '2026-05-31T08:00:00.000Z',
      status: 'completed',
      stimulus_version: null,
    })).toBeNull();
    expect(rowToThreshold({
      condition_key: 'contrast-detection:6:90',
      created_at: '2026-05-31T08:12:00.000Z',
      id: 'threshold-no-contrast',
      payload: JSON.stringify({ id: 'threshold-no-contrast', sessionId: 'session-1' }),
      session_id: 'session-1',
      spatial_frequency: 6,
    })).toBeNull();
  });

  it('returns defaults for malformed settings JSON', () => {
    expect(payloadToSettings('{bad json')).toEqual(DEFAULT_SETTINGS);
  });

  it('merges partial settings over defaults', () => {
    expect(payloadToSettings('{"soundEnabled":true}')).toEqual({
      ...DEFAULT_SETTINGS,
      soundEnabled: true,
    });
  });

  it('sanitizes settings fields before merging over defaults', () => {
    expect(payloadToSettings(JSON.stringify({
      dichopticEnabled: 1,
      displayBrightness: 2,
      hapticsEnabled: 0,
      monocularWeakEye: 'center',
      onboardingComplete: 'yes',
      reduceMotion: '',
      remindersEnabled: null,
      soundEnabled: 'enabled',
      subscriptionStatus: 'trialing',
      trialStartedAt: '2026-06-09T10:00:00.000Z',
      visionGoal: 'sports',
      unknown: true,
    }))).toEqual({
      ...DEFAULT_SETTINGS,
      dichopticEnabled: true,
      displayBrightness: 1,
      hapticsEnabled: false,
      onboardingComplete: true,
      remindersEnabled: false,
      soundEnabled: true,
      subscriptionStatus: 'trialing',
      trialStartedAt: '2026-06-09T10:00:00.000Z',
      visionGoal: 'sports',
    });
    expect(payloadToSettings('{"displayBrightness":-1,"monocularWeakEye":"right"}')).toEqual({
      ...DEFAULT_SETTINGS,
      displayBrightness: 0,
      monocularWeakEye: 'right',
    });
    expect(payloadToSettings('{"displayBrightness":"bright"}')).toEqual(DEFAULT_SETTINGS);
  });

  it('migrates legacy condition-flavored goal values and the legacy field name', () => {
    expect(payloadToSettings('{"visionGoal":"myopia"}').visionGoal).toBe('distance');
    expect(payloadToSettings('{"visionGoal":"presbyopia"}').visionGoal).toBe('near');
    expect(payloadToSettings('{"visionGoal":"sports-vision"}').visionGoal).toBe('sports');
    // Very early builds stored the goal under 'diagnosisType'.
    expect(payloadToSettings('{"diagnosisType":"myopia"}').visionGoal).toBe('distance');
    // Current field wins over the legacy one when both are present.
    expect(
      payloadToSettings('{"visionGoal":"sports","diagnosisType":"myopia"}').visionGoal
    ).toBe('sports');
    // Unknown values still fall back to the default.
    expect(payloadToSettings('{"visionGoal":"astigmatism"}').visionGoal).toBe('unspecified');
  });

  it('round-trips full settings', () => {
    const settings: SettingsState = {
      dichopticEnabled: true,
      displayBrightness: 0.72,
      monocularWeakEye: 'left',
      hapticsEnabled: false,
      soundEnabled: true,
      reduceMotion: true,
      remindersEnabled: true,
      onboardingComplete: true,
      subscriptionStatus: 'active',
      trialStartedAt: '2026-06-09T10:00:00.000Z',
      visionGoal: 'near',
    };

    expect(payloadToSettings(settingsToPayload(settings))).toEqual(settings);
  });
});
