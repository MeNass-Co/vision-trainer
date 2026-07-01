import type { SessionLog, ThresholdEstimate } from '@/types';
import type { SettingsState } from '@/presenters/types';
import { DEFAULT_SETTINGS } from '@/store/defaults';

export type SessionRow = {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  payload: string;
};

export type ThresholdRow = {
  id: string;
  session_id: string;
  condition_key: string;
  spatial_frequency: number;
  created_at: string;
  payload: string;
};

export function sessionToRow(session: SessionLog): SessionRow {
  return {
    id: session.id,
    started_at: session.startedAt,
    completed_at: session.completedAt ?? null,
    status: session.status,
    payload: JSON.stringify(session),
  };
}

type ParsedPayload = Record<string, unknown>;

function isRecord(value: unknown): value is ParsedPayload {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Rows written by older builds may lack fields with safe, non-load-bearing
 * defaults; fill those instead of dropping the whole row. Identity fields,
 * timestamps, and measurement numerics stay strictly validated below —
 * a truly malformed row is still rejected, never invented.
 */
function repairSessionPayload(value: ParsedPayload): ParsedPayload {
  return { metadata: {}, ...value };
}

function repairThresholdPayload(value: ParsedPayload): ParsedPayload {
  return { lapseRate: 0, ...value };
}

function hasValidSessionShape(value: unknown): value is SessionLog {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.startedAt === 'string' &&
    (value.completedAt === undefined || typeof value.completedAt === 'string') &&
    (value.status === 'in-progress' || value.status === 'completed' || value.status === 'abandoned') &&
    typeof value.eyeMode === 'string' &&
    typeof value.sessionType === 'string' &&
    typeof value.calibrationId === 'string' &&
    typeof value.protocolVersion === 'string' &&
    Array.isArray(value.plannedBlocks) &&
    isFiniteNumber(value.completedTrials) &&
    isRecord(value.metadata)
  );
}

function hasValidThresholdShape(value: unknown): value is ThresholdEstimate {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.sessionId === 'string' &&
    typeof value.blockId === 'string' &&
    typeof value.conditionKey === 'string' &&
    typeof value.paradigm === 'string' &&
    isFiniteNumber(value.spatialFrequencyCpd) &&
    isFiniteNumber(value.orientationDeg) &&
    isFiniteNumber(value.thresholdContrast) &&
    value.thresholdContrast > 0 &&
    isFiniteNumber(value.thresholdLog10) &&
    isFiniteNumber(value.ciLow) &&
    isFiniteNumber(value.ciHigh) &&
    isFiniteNumber(value.trialCount) &&
    isFiniteNumber(value.lapseRate) &&
    typeof value.createdAt === 'string'
  );
}

function isMonocularWeakEye(value: unknown): value is SettingsState['monocularWeakEye'] {
  return value === 'left' || value === 'right' || value === 'off';
}

function isVisionGoal(value: unknown): value is SettingsState['visionGoal'] {
  return value === 'myopia' || value === 'presbyopia' || value === 'sports-vision' || value === 'unspecified';
}

function isSubscriptionStatus(value: unknown): value is SettingsState['subscriptionStatus'] {
  return value === 'free' || value === 'trialing' || value === 'active';
}

function isIsoStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function clampBrightness(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SETTINGS.displayBrightness;
  }

  return Math.min(1, Math.max(0, value));
}

export function rowToSession(row: SessionRow): SessionLog | null {
  try {
    const parsed = JSON.parse(row.payload) as unknown;
    if (!isRecord(parsed)) return null;
    const repaired = repairSessionPayload(parsed);
    return hasValidSessionShape(repaired) ? repaired : null;
  } catch {
    return null;
  }
}

export function thresholdToRow(threshold: ThresholdEstimate): ThresholdRow {
  return {
    id: threshold.id,
    session_id: threshold.sessionId,
    condition_key: threshold.conditionKey,
    spatial_frequency: threshold.spatialFrequencyCpd,
    created_at: threshold.createdAt,
    payload: JSON.stringify(threshold),
  };
}

export function rowToThreshold(row: ThresholdRow): ThresholdEstimate | null {
  try {
    const parsed = JSON.parse(row.payload) as unknown;
    if (!isRecord(parsed)) return null;
    const repaired = repairThresholdPayload(parsed);
    return hasValidThresholdShape(repaired) ? repaired : null;
  } catch {
    return null;
  }
}

export function settingsToPayload(settings: SettingsState): string {
  return JSON.stringify(settings);
}

export function payloadToSettings(payload: string): SettingsState {
  try {
    const parsed = JSON.parse(payload) as unknown;
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };
    const record = parsed as ParsedPayload;

    return {
      ...DEFAULT_SETTINGS,
      dichopticEnabled:
        'dichopticEnabled' in record ? Boolean(record.dichopticEnabled) : DEFAULT_SETTINGS.dichopticEnabled,
      displayBrightness:
        'displayBrightness' in record ? clampBrightness(record.displayBrightness) : DEFAULT_SETTINGS.displayBrightness,
      hapticsEnabled: 'hapticsEnabled' in record ? Boolean(record.hapticsEnabled) : DEFAULT_SETTINGS.hapticsEnabled,
      monocularWeakEye: isMonocularWeakEye(record.monocularWeakEye)
        ? record.monocularWeakEye
        : DEFAULT_SETTINGS.monocularWeakEye,
      onboardingComplete:
        'onboardingComplete' in record ? Boolean(record.onboardingComplete) : DEFAULT_SETTINGS.onboardingComplete,
      reduceMotion: 'reduceMotion' in record ? Boolean(record.reduceMotion) : DEFAULT_SETTINGS.reduceMotion,
      remindersEnabled:
        'remindersEnabled' in record ? Boolean(record.remindersEnabled) : DEFAULT_SETTINGS.remindersEnabled,
      soundEnabled: 'soundEnabled' in record ? Boolean(record.soundEnabled) : DEFAULT_SETTINGS.soundEnabled,
      subscriptionStatus: isSubscriptionStatus(record.subscriptionStatus)
        ? record.subscriptionStatus
        : DEFAULT_SETTINGS.subscriptionStatus,
      trialStartedAt: isIsoStringOrNull(record.trialStartedAt)
        ? record.trialStartedAt
        : DEFAULT_SETTINGS.trialStartedAt,
      visionGoal: isVisionGoal(record.visionGoal) ? record.visionGoal : DEFAULT_SETTINGS.visionGoal,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
