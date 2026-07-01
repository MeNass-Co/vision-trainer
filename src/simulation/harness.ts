/**
 * Longitudinal validation harness — pure TS, no React/RN imports.
 *
 * This module wires the REAL production pipeline (guidedProtocol → programPlanner
 * → sessionPlanner → trialPlan → QuestStaircase → sessionResult) to a synthetic
 * human observer, so we can play a simulated month of guided training and inspect
 * whether the system converges, progresses, and stays sane. No production logic
 * is reimplemented here; every planning/threshold call goes through the same
 * exported functions the app uses. The only production change is a pure export
 * extracted from quest.ts (weibullProbabilityCorrect / questThresholdScale) so
 * the observer and the estimator share one psychometric source of truth.
 */
import {
  QuestStaircase,
  questThresholdScale,
  weibullProbabilityCorrect,
  type QuestParameters,
} from '@/psychophysics/quest';
import { populationNormContrast } from '@/progress/norms';
import { buildGuidedSessionBlocks } from '@/session/guidedProtocol';
import {
  buildBlockThreshold,
  buildGuidedSessionLog,
  GUIDED_STIM_DURATION_MS,
} from '@/session/sessionResult';
import { buildTrialPlan } from '@/session/trialPlan';
import type {
  ContrastCondition,
  GoalType,
  SessionLog,
  ThresholdEstimate,
} from '@/types';

/** Deterministic PRNG — same generator the production controller/tests use. */
export function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// The production QUEST params fix pThreshold=0.79, gamma=0.5, delta=0.03 (see
// guidedProtocol.questParamsForCondition and calibrationQuest). The threshold
// PARAMETER QUEST estimates is the Weibull location defined at this scale; the
// observer must use the identical scale so that its true alpha (log10 contrast)
// coincides with what QUEST reports. delta here only sets the estimator's upper
// asymptote — the observer supplies its own lapse below.
export const OBSERVER_GAMMA = 0.5;
export const OBSERVER_BETA = 3.5;
const PRODUCTION_P_THRESHOLD = 0.79;
const PRODUCTION_DELTA = 0.03;
export const OBSERVER_THRESHOLD_SCALE = questThresholdScale(
  PRODUCTION_P_THRESHOLD,
  OBSERVER_GAMMA,
  PRODUCTION_DELTA
);

export type Observer = {
  /** log10-contrast offset added on top of the population-norm CSF curve. */
  skillLog10: number;
  /** Attention lapse rate (upper-asymptote miss probability). */
  lapse: number;
};

/**
 * The observer's TRUE threshold (log10 contrast, defined at pThreshold=0.79) for
 * a given condition. Anchored to the population CSF so different spatial
 * frequencies / paradigms carry realistic relative difficulty; `skillLog10`
 * shifts the whole curve (negative = better than norm). This is the alpha QUEST
 * should recover.
 */
export function observerTrueThresholdLog10(observer: Observer, condition: ContrastCondition): number {
  const norm = populationNormContrast(condition.spatialFrequencyCpd, condition.paradigm);
  return Math.log10(norm) + observer.skillLog10;
}

/** Probability the observer answers a 2AFC trial correctly at a given contrast. */
export function observerProbabilityCorrect(
  observer: Observer,
  intensityLog10: number,
  thresholdLog10: number
): number {
  return weibullProbabilityCorrect({
    intensityLog10,
    thresholdLog10,
    beta: OBSERVER_BETA,
    gamma: OBSERVER_GAMMA,
    upperLapse: observer.lapse,
    thresholdScale: OBSERVER_THRESHOLD_SCALE,
  });
}

export type PlayedBlock = {
  condition: ContrastCondition;
  role: 'warm-up' | 'training' | 'assessment';
  paradigm: ContrastCondition['paradigm'];
  trueThresholdLog10: number;
  estimatedThresholdLog10: number;
  estimateSdLog10: number;
  ciLowContrast: number;
  ciHighContrast: number;
  thresholdContrast: number;
  trialCount: number;
  lapseRate: number;
  catchCount: number;
  catchMisses: number;
  informativeIntensities: number[];
  threshold: ThresholdEstimate;
};

export type PlayedSession = {
  blocks: PlayedBlock[];
  sessionLog: SessionLog;
  thresholds: ThresholdEstimate[];
  flashCount: number;
};

const BACKGROUND_LUMINANCE = 50;
const CLAMP_MIN_LOG10 = -3;
const CLAMP_MAX_LOG10 = Math.log10(0.9);

/**
 * Plays ONE guided session exactly as the controller does: build blocks from the
 * accumulated history, one QuestStaircase per block, feed each trial's presented
 * contrast to the observer, submit the response (with the catch flag) to QUEST,
 * then read the block threshold via the real sessionResult builder. `sessionIndex`
 * is the number of already-completed sessions (production's `sessionsCompleted`).
 */
export function playSession(input: {
  sessionIndex: number;
  observer: Observer;
  priorThresholds: ThresholdEstimate[];
  goal: GoalType;
  random: () => number;
  createdAtIso: string;
}): PlayedSession {
  const blocks = buildGuidedSessionBlocks({
    sessionsCompleted: input.sessionIndex,
    thresholds: input.priorThresholds,
    visionGoal: input.goal,
  });

  const played: PlayedBlock[] = [];
  const thresholds: ThresholdEstimate[] = [];
  let flashCount = 0;

  for (const block of blocks) {
    const quest = new QuestStaircase(block.questParams);
    const trueThresholdLog10 = observerTrueThresholdLog10(input.observer, block.condition);
    const informativeIntensities: number[] = [];
    let catchCount = 0;
    let catchMisses = 0;

    for (let trial = 0; trial < block.trialsPerBlock; trial += 1) {
      const plan = buildTrialPlan({
        quest,
        condition: block.condition,
        random: input.random,
        backgroundLuminanceCdM2: BACKGROUND_LUMINANCE,
        defaultDurationMs: GUIDED_STIM_DURATION_MS,
      });
      const pCorrect = observerProbabilityCorrect(
        input.observer,
        plan.intensityLog10,
        trueThresholdLog10
      );
      const correct = input.random() < pCorrect;
      quest.record(plan.intensityLog10, correct, plan.catchTrial);

      flashCount += 1;
      if (plan.catchTrial) {
        catchCount += 1;
        if (!correct) catchMisses += 1;
      } else {
        informativeIntensities.push(plan.intensityLog10);
      }
    }

    const estimate = quest.estimate();
    const threshold = buildBlockThreshold({
      sessionId: `sim-session-${input.sessionIndex}`,
      blockId: block.id,
      spatialFrequencyCpd: block.condition.spatialFrequencyCpd,
      orientationDeg: block.condition.orientationDeg,
      durationMs: block.condition.durationMs ?? GUIDED_STIM_DURATION_MS,
      estimate,
      gaborSizeDeg: block.condition.gaborSizeDeg,
      paradigm: block.condition.paradigm,
      trialCount: quest.trialCount(),
      lapseRate: quest.lapseRate(),
      createdAtIso: input.createdAtIso,
    });
    thresholds.push(threshold);

    played.push({
      condition: block.condition,
      role: block.role,
      paradigm: block.condition.paradigm,
      trueThresholdLog10,
      estimatedThresholdLog10: estimate.thresholdLog10,
      estimateSdLog10: estimate.sdLog10,
      ciLowContrast: threshold.ciLow,
      ciHighContrast: threshold.ciHigh,
      thresholdContrast: threshold.thresholdContrast,
      trialCount: quest.trialCount(),
      lapseRate: quest.lapseRate(),
      catchCount,
      catchMisses,
      informativeIntensities,
      threshold,
    });
  }

  const sessionLog = buildGuidedSessionLog({
    id: `sim-session-${input.sessionIndex}`,
    startedAtIso: input.createdAtIso,
    completedAtIso: input.createdAtIso,
    calibrationId: 'sim-calibration',
    plannedBlocks: blocks.map((block) => block.plannedBlock),
    completedTrials: flashCount,
  });

  return { blocks: played, sessionLog, thresholds, flashCount };
}

export type LongitudinalDay = {
  dayIndex: number;
  session: PlayedSession;
  /** Observer's skill offset in force during this day. */
  skillLog10: number;
};

export type LongitudinalRun = {
  days: LongitudinalDay[];
  allBlocks: PlayedBlock[];
  allThresholds: ThresholdEstimate[];
  allSessions: SessionLog[];
};

/**
 * Plays N consecutive days. Between days the observer's true threshold optionally
 * improves by `learningPerDayLog10` (perceptual learning) toward `skillFloorLog10`.
 * The planner sees the accumulated session logs and thresholds each day, exactly
 * as production replays them.
 */
export function runLongitudinal(input: {
  seed: number;
  days: number;
  goal: GoalType;
  startSkillLog10: number;
  learningPerDayLog10: number;
  skillFloorLog10: number;
  lapse: number;
}): LongitudinalRun {
  const random = mulberry32(input.seed);
  const days: LongitudinalDay[] = [];
  const allThresholds: ThresholdEstimate[] = [];
  const allSessions: SessionLog[] = [];
  const allBlocks: PlayedBlock[] = [];
  let skillLog10 = input.startSkillLog10;

  for (let dayIndex = 0; dayIndex < input.days; dayIndex += 1) {
    const observer: Observer = { skillLog10, lapse: input.lapse };
    const session = playSession({
      sessionIndex: dayIndex,
      observer,
      priorThresholds: allThresholds,
      goal: input.goal,
      random,
      createdAtIso: isoForDay(dayIndex),
    });

    days.push({ dayIndex, session, skillLog10 });
    allThresholds.push(...session.thresholds);
    allSessions.push(session.sessionLog);
    allBlocks.push(...session.blocks);

    // Perceptual learning applied between days, clamped at a floor.
    skillLog10 = Math.max(
      input.skillFloorLog10,
      skillLog10 + input.learningPerDayLog10
    );
  }

  return { days, allBlocks, allThresholds, allSessions };
}

/** Monotone, spread-out ISO timestamps so createdAt ordering is well-defined. */
function isoForDay(dayIndex: number): string {
  const base = Date.UTC(2026, 0, 1, 9, 0, 0);
  return new Date(base + dayIndex * 24 * 60 * 60 * 1000).toISOString();
}

export const QUEST_CLAMP_MIN_LOG10 = CLAMP_MIN_LOG10;
export const QUEST_CLAMP_MAX_LOG10 = CLAMP_MAX_LOG10;

/** A synthetic post-lock-on QUEST block for single-session convergence tests. */
export function buildConvergenceParams(priorThresholdLog10: number): QuestParameters {
  return {
    tGuess: priorThresholdLog10,
    tGuessSd: 0.45,
    pThreshold: PRODUCTION_P_THRESHOLD,
    beta: OBSERVER_BETA,
    delta: PRODUCTION_DELTA,
    gamma: OBSERVER_GAMMA,
    grain: 0.01,
    range: 1.6,
  };
}

// ---- Small statistics helpers (rank correlations, linear slope, median) ----

export function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function mean(values: number[]): number {
  return values.length === 0 ? NaN : values.reduce((s, v) => s + v, 0) / values.length;
}

/** Kendall's tau-b rank correlation — robust to condition-mix noise, no distributional assumption. */
export function kendallTau(x: number[], y: number[]): number {
  const n = x.length;
  let concordant = 0;
  let discordant = 0;
  let tiesX = 0;
  let tiesY = 0;
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const dx = x[i] - x[j];
      const dy = y[i] - y[j];
      const s = Math.sign(dx) * Math.sign(dy);
      if (s > 0) concordant += 1;
      else if (s < 0) discordant += 1;
      else {
        if (dx === 0) tiesX += 1;
        if (dy === 0) tiesY += 1;
      }
    }
  }
  const n0 = (n * (n - 1)) / 2;
  const denom = Math.sqrt((n0 - tiesX) * (n0 - tiesY));
  return denom === 0 ? 0 : (concordant - discordant) / denom;
}

/** Ordinary-least-squares slope of y on x. */
export function linearSlope(x: number[], y: number[]): number {
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let den = 0;
  for (let i = 0; i < x.length; i += 1) {
    num += (x[i] - mx) * (y[i] - my);
    den += (x[i] - mx) ** 2;
  }
  return den === 0 ? 0 : num / den;
}
