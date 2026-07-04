import type { GoalType } from '@/types';
import type { MeasurementConfidenceView } from './reliability';

export type Verdict = 'improving' | 'holding' | 'regressing';

export type TodayView = {
  /** log10 contrast sensitivity — the hero figure */
  contrastSensitivity: number;
  /** 0..1 — today's target completion, drives the arc fill */
  dailyProgress: number;
  streakDays: number;
  sessionDoneToday: boolean;
  /** 0=Sun ... 6=Sat */
  todayIndex: number;
  /** completion flags for this local week, Sun..Sat — drives the week dots honestly */
  weekDays: boolean[];
  /** calendar day-of-month numbers for this local week, Sun..Sat — week-strip date cells */
  weekDates: number[];
  /** e.g. "6 cpd · 4 min" */
  nextTargetLabel: string;
  verdict: Verdict;
  measurementConfidence: MeasurementConfidenceView;
};

// `date` = calendar day-of-month (progress-chart spec rows 21/41-42's two-line day label).
export type SparkPoint = { day: string; date: number; value: number };
export type CsfPoint = { spatialFrequency: number; sensitivity: number };
export type CsfReferenceCurve = { label: string; points: CsfPoint[] };

export type ProgressView = {
  /** Cash-App oversized numeral */
  headlineAcuity: number;
  previousAcuity: number;
  verdict: Verdict;
  /** signed delta vs previous period */
  delta: number;
  sparkline: SparkPoint[];
  csf: CsfPoint[];
  csfReferences: CsfReferenceCurve[];
  contributors: { label: string; bandLabel: string; sensitivity: number; norm: number }[];
  measurementConfidence: MeasurementConfidenceView;
};

export type PostSessionInsightStatus = 'provisional' | 'reliable' | 'needs-retest';

export type PostSessionInsightView = {
  status: PostSessionInsightStatus;
  title: string;
  confidenceLabel: string;
  measuredBandsLabel: string;
  summary: string;
  detail: string;
  // Localized display text (session.insight.delta.* keys) — was an English
  // literal union; widened for i18n. Branch on `deltaPercent`, never on this.
  deltaLabel: string;
  deltaPercent: number | null;
  sessionsUntilReliable: number;
  measurementConfidence: MeasurementConfidenceView;
};

export type SettingsState = {
  dichopticEnabled: boolean;
  displayBrightness: number;
  monocularWeakEye: 'left' | 'right' | 'off';
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  reduceMotion: boolean;
  remindersEnabled: boolean;
  onboardingComplete: boolean;
  subscriptionStatus: 'free' | 'trialing' | 'active';
  trialStartedAt: string | null;
  visionGoal: GoalType | 'unspecified';
};

export type Loadable<T> = { data: T; isLoading: boolean };

export type SettingsController = {
  state: SettingsState;
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
};
