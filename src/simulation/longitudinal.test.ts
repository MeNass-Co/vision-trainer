/**
 * Longitudinal validation harness — proves the guided training pipeline converges,
 * progresses, and stays sane across a simulated month of real usage.
 *
 * Nothing here reimplements production logic: sessions are built and scored through
 * the real guidedProtocol / programPlanner / trialPlan / QuestStaircase / sessionResult
 * APIs (see harness.ts). The observer and the QUEST estimator share ONE psychometric
 * function (weibullProbabilityCorrect, a pure export lifted verbatim out of quest.ts),
 * so the two speak the identical Weibull family in log10-contrast units:
 *
 *   p(correct) = gamma + (1 - gamma - lapse) * (1 - exp(-scale * 10^(beta*(x - alpha))))
 *
 * with gamma=0.5 (2AFC), beta=3.5, and `scale` fixed by pThreshold=0.79 so that the
 * threshold parameter QUEST estimates is the observer's true alpha.
 *
 * Determinism: the observer/trial stream is driven by a seeded mulberry32; the
 * planner's tie-breaking (Math.random) is stubbed per-test with a fresh seed.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QuestStaircase } from '@/psychophysics/quest';
import { isThresholdSuspicious } from '@/presenters/reliability';
import { buildTrialPlan } from '@/session/trialPlan';

import {
  buildConvergenceParams,
  kendallTau,
  linearSlope,
  mean,
  median,
  mulberry32,
  observerProbabilityCorrect,
  runLongitudinal,
  type LongitudinalRun,
  type PlayedBlock,
  QUEST_CLAMP_MAX_LOG10,
  QUEST_CLAMP_MIN_LOG10,
} from './harness';

beforeEach(() => {
  // Deterministic planner tie-breaking so every run is reproducible; the trial
  // stream itself uses the harness's own seeded PRNG, independent of this.
  const rnd = mulberry32(20260701);
  vi.spyOn(Math, 'random').mockImplementation(rnd);
});
afterEach(() => vi.restoreAllMocks());

const CONTRAST_CONDITION = {
  paradigm: 'contrast-detection' as const,
  spatialFrequencyCpd: 6,
  orientationDeg: 90 as const,
  trialsPerBlock: 100,
  durationMs: 120,
  gaborSizeDeg: 3,
};

// ---------------------------------------------------------------------------
// A. Single-session convergence: static observer, known alpha.
// ---------------------------------------------------------------------------
describe('A. single-session QUEST convergence', () => {
  it('recovers the true threshold within tolerance across 25 seeds', () => {
    // Ground truth alpha = log10(0.02); the QUEST prior is deliberately offset by
    // +0.4 log10 (worse than truth) so this measures convergence, not a lucky
    // centred start. 100 trials (~90 informative after ~10% catch) is the regime
    // where QUEST typically lands within ~0.1-0.15 log10 (PsychoPy/Watson).
    const alpha = Math.log10(0.02);
    const params = buildConvergenceParams(alpha + 0.4);
    const errors: number[] = [];

    for (let seed = 0; seed < 25; seed += 1) {
      const rnd = mulberry32(1000 + seed);
      const quest = new QuestStaircase(params);
      for (let trial = 0; trial < 100; trial += 1) {
        const plan = buildTrialPlan({
          quest,
          condition: CONTRAST_CONDITION,
          random: rnd,
          backgroundLuminanceCdM2: 50,
          defaultDurationMs: 120,
        });
        const p = observerProbabilityCorrect({ skillLog10: 0, lapse: 0.02 }, plan.intensityLog10, alpha);
        quest.record(plan.intensityLog10, rnd() < p, plan.catchTrial);
      }
      const estimate = quest.estimate();
      expect(Number.isFinite(estimate.thresholdLog10)).toBe(true);
      errors.push(Math.abs(estimate.thresholdLog10 - alpha));
    }

    const medianError = median(errors);
    const worstError = Math.max(...errors);
    // Empirically median ~0.026, worst ~0.059 log10. Tolerances sit comfortably
    // inside the a-priori ~0.1-0.15 log10 expectation with margin for seed drift.
    expect(medianError).toBeLessThan(0.06);
    expect(worstError).toBeLessThan(0.15);
  });
});

// ---------------------------------------------------------------------------
// Shared longitudinal runs (cheap; recomputed per test under the mocked clock).
// ---------------------------------------------------------------------------
function learningRun(seed = 7): LongitudinalRun {
  return runLongitudinal({
    seed,
    days: 30,
    goal: 'sports',
    startSkillLog10: 0.3,
    learningPerDayLog10: -0.02, // ~0.02 log10/day perceptual learning toward a floor
    skillFloorLog10: -0.3,
    lapse: 0.02,
  });
}

function staticRun(seed = 7): LongitudinalRun {
  return runLongitudinal({
    seed,
    days: 30,
    goal: 'sports',
    startSkillLog10: 0.3,
    learningPerDayLog10: 0,
    skillFloorLog10: -0.3,
    lapse: 0.02,
  });
}

function perDayMedian(run: LongitudinalRun, pick: (b: PlayedBlock) => number): number[] {
  return run.days.map((day) => median(day.session.blocks.map(pick)));
}

// ---------------------------------------------------------------------------
// B. No degeneracy: intensities never pin for a whole block; estimates finite;
//    every session terminates with output.
// ---------------------------------------------------------------------------
describe('B. no degeneracy across all simulated sessions', () => {
  it('produces varied, finite, in-bounds measurements for every block', () => {
    const runs = [learningRun(), staticRun(), learningRun(42)];
    let blockCount = 0;

    for (const run of runs) {
      expect(run.days).toHaveLength(30);
      for (const day of run.days) {
        expect(day.session.blocks.length).toBeGreaterThan(0);
        for (const block of day.session.blocks) {
          blockCount += 1;
          // Estimates never NaN/Infinity.
          expect(Number.isFinite(block.estimatedThresholdLog10)).toBe(true);
          expect(Number.isFinite(block.estimateSdLog10)).toBe(true);
          // Threshold contrast within the engine's physical bounds.
          expect(block.thresholdContrast).toBeGreaterThan(0.001);
          expect(block.thresholdContrast).toBeLessThanOrEqual(0.9);
          // At least one informative (non-catch) trial was presented.
          expect(block.informativeIntensities.length).toBeGreaterThan(0);
          for (const x of block.informativeIntensities) {
            expect(Number.isFinite(x)).toBe(true);
          }
          // The staircase MOVED — it is not stuck at a single value, and it did
          // not pin every trial to the floor or the ceiling for the whole block.
          const unique = new Set(block.informativeIntensities.map((x) => x.toFixed(4)));
          expect(unique.size).toBeGreaterThanOrEqual(2);
          const allAtFloor = block.informativeIntensities.every(
            (x) => Math.abs(x - QUEST_CLAMP_MIN_LOG10) < 1e-6
          );
          const allAtCeil = block.informativeIntensities.every(
            (x) => Math.abs(x - QUEST_CLAMP_MAX_LOG10) < 1e-6
          );
          expect(allAtFloor).toBe(false);
          expect(allAtCeil).toBe(false);
        }
      }
    }
    expect(blockCount).toBeGreaterThan(100);
  });
});

// ---------------------------------------------------------------------------
// C. Learning observer tracked: improving threshold => estimates trend down with it.
// ---------------------------------------------------------------------------
describe('C. tracks a learning observer', () => {
  it('per-day estimates fall monotonically with the true improving threshold', () => {
    const run = learningRun();
    const dayIndex = run.days.map((d) => d.dayIndex);
    const perDayEst = perDayMedian(run, (b) => b.estimatedThresholdLog10);
    const perDayTrue = perDayMedian(run, (b) => b.trueThresholdLog10);

    // Kendall's tau-b: rank-based, so condition-mix noise (which spatial band is
    // trained each day) does not corrupt it, and the 0.6 log10 learning signal
    // over 30 days dominates. Empirically tau(day,est) ~ -0.72, tau(true,est) ~ +0.73.
    expect(kendallTau(dayIndex, perDayEst)).toBeLessThan(-0.5);
    expect(kendallTau(perDayTrue, perDayEst)).toBeGreaterThan(0.5);

    // Post walk-in (see D for the transient): the downward trend is real learning,
    // not just the estimator descending from its deliberately-easy day-1 start.
    const steady = run.days.filter((d) => d.dayIndex >= 7);
    const steadyDay = steady.map((d) => d.dayIndex);
    const steadyEst = steady.map((d) => median(d.session.blocks.map((b) => b.estimatedThresholdLog10)));
    expect(kendallTau(steadyDay, steadyEst)).toBeLessThan(-0.3);
  });
});

// ---------------------------------------------------------------------------
// D. Static observer stable: no learning => no systematic estimator drift.
// ---------------------------------------------------------------------------
describe('D. no drift for a static observer', () => {
  it('shows no systematic residual drift once locked on', () => {
    const run = staticRun();

    // NOTE — measurement walk-in (documented, not a bug): the first guided session
    // starts near the contrast ceiling and THRESHOLD_LOCKED_RANGE caps each
    // session's grid travel to 1.6 log10 from the prior, so a realistic observer
    // (alpha far below the easy start) is only reached after ~2-3 sessions. We
    // therefore assess steady-state drift AFTER the walk-in (dayIndex >= 10), on
    // the residual (estimate - trueAlpha), which removes the condition-mix term.
    const steady = run.days.filter((d) => d.dayIndex >= 10);
    const steadyDay = steady.map((d) => d.dayIndex);
    const steadyResid = steady.map((d) =>
      median(d.session.blocks.map((b) => b.estimatedThresholdLog10 - b.trueThresholdLog10))
    );

    // Empirically slope ~0.003 log10/day, mean residual ~-0.03. A flat estimator.
    expect(Math.abs(linearSlope(steadyDay, steadyResid))).toBeLessThan(0.01);
    expect(Math.abs(mean(steadyResid))).toBeLessThan(0.15);

    // First vs second half of the steady window: no creeping bias.
    const firstHalf = median(steadyResid.slice(0, 10));
    const secondHalf = median(steadyResid.slice(10));
    expect(Math.abs(firstHalf - secondHalf)).toBeLessThan(0.1);

    // The raw estimate shows no strong monotone time trend either (contrast the
    // learning run's tau ~ -0.72).
    const dayIndex = run.days.map((d) => d.dayIndex);
    const perDayEst = perDayMedian(run, (b) => b.estimatedThresholdLog10);
    expect(Math.abs(kendallTau(dayIndex, perDayEst))).toBeLessThan(0.4);
  });
});

// ---------------------------------------------------------------------------
// E. Lapse machinery honest.
// ---------------------------------------------------------------------------
describe('E. catch-trial lapse estimate is honest', () => {
  it('recovers a low lapse (0.02) when pooled across many sessions', () => {
    // A single session yields only ~10 catch trials, so per-session lapse is far
    // too noisy (binomial SE ~0.044 at n=10) — the estimate MUST be pooled. Over
    // 4 seeded months (~1160 catch trials) the binomial SE is ~sqrt(.02*.98/1160)
    // ~= 0.0041, so a +-0.01 window is ~2.4 SE. Empirically the pooled rate ~0.021.
    let catchTrials = 0;
    let catchMisses = 0;
    for (const seed of [1, 2, 3, 4]) {
      const run = runLongitudinal({
        seed,
        days: 30,
        goal: 'sports',
        startSkillLog10: 0.2,
        learningPerDayLog10: -0.015,
        skillFloorLog10: -0.3,
        lapse: 0.02,
      });
      for (const block of run.allBlocks) {
        catchTrials += block.catchCount;
        catchMisses += block.catchMisses;
      }
    }
    expect(catchTrials).toBeGreaterThan(800);
    const pooledLapse = catchMisses / catchTrials;
    expect(Math.abs(pooledLapse - 0.02)).toBeLessThan(0.01);
  });

  it('flags a clear majority of an inattentive observer (lapse 0.3) sessions', () => {
    const run = runLongitudinal({
      seed: 5,
      days: 30,
      goal: 'sports',
      startSkillLog10: 0.2,
      learningPerDayLog10: 0,
      skillFloorLog10: -0.3,
      lapse: 0.3,
    });
    // The reliability gate (reliability.isThresholdSuspicious) trips on lapse > 0.15;
    // a session is unreliable if ANY of its block thresholds trip. With ~10 catch
    // trials/session at true lapse 0.3, P(at least one miss) ~ 1 - 0.7^10 ~ 0.97,
    // so nearly every session is flagged. Empirically 29/30.
    const flaggedSessions = run.days.filter((d) =>
      d.session.thresholds.some(isThresholdSuspicious)
    ).length;
    expect(flaggedSessions / run.days.length).toBeGreaterThan(0.8);

    // Sanity: the measured per-block lapse centres on the true 0.3, not near 0.02.
    expect(mean(run.allBlocks.map((b) => b.lapseRate))).toBeGreaterThan(0.2);
  });
});

// ---------------------------------------------------------------------------
// F. Program advancement: the guided program's phase/band contract over weeks.
// ---------------------------------------------------------------------------
describe('F. guided program advances per its contract', () => {
  it('follows the phase paradigm schedule and rotates trained bands', () => {
    const run = learningRun(11);
    const trainingParadigms = (dayIndex: number): Set<string> =>
      new Set(
        run.days[dayIndex].session.blocks
          .filter((b) => b.role === 'training')
          .map((b) => b.paradigm)
      );

    // Sports program (programConfig.SPORTS_CONFIG):
    //   phase [1,2]  -> contrast-detection only
    //   phase [3,7]  -> adds backward-masking
    //   phase [8,20] -> adds spatial-masking + pedestal-discrimination
    // Day 1 (sessionIndex 0) is the calibration session: warm-up + assessment,
    // no training blocks. Day 2 (session 2) is the first program training day.
    const day2Training = trainingParadigms(1);
    expect(day2Training.size).toBeGreaterThan(0);
    expect([...day2Training].every((p) => p === 'contrast-detection')).toBe(true);

    // Backward-masking appears within the phase-2 window (sessions 3-7 => idx 2-6).
    const backwardAppears = [2, 3, 4, 5, 6].some((i) => trainingParadigms(i).has('backward-masking'));
    expect(backwardAppears).toBe(true);

    // Spatial-masking appears only in phase 3 (sessions >= 8 => idx >= 7).
    const spatialAppears = run.days
      .filter((d) => d.dayIndex >= 7)
      .some((d) => d.session.blocks.some((b) => b.role === 'training' && b.paradigm === 'spatial-masking'));
    expect(spatialAppears).toBe(true);
    // ...and never before it (weakest-first prioritisation stays inside the phase).
    const spatialBeforePhase3 = run.days
      .filter((d) => d.dayIndex < 7)
      .some((d) => d.session.blocks.some((b) => b.role === 'training' && b.paradigm === 'spatial-masking'));
    expect(spatialBeforePhase3).toBe(false);

    // Band prioritisation is adaptive: the planner does not lock onto one spatial
    // frequency but rotates through several as bands improve.
    const trainedSfs = new Set(
      run.allBlocks.filter((b) => b.role === 'training').map((b) => b.condition.spatialFrequencyCpd)
    );
    expect(trainedSfs.size).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// G. Daily cap respected: no simulated day exceeds the 100-flash cap.
// ---------------------------------------------------------------------------
describe('G. daily flash cap is respected', () => {
  it('never exceeds 100 flashes/day and hits exactly 100 post-baseline', () => {
    for (const run of [learningRun(), staticRun(), learningRun(3)]) {
      run.days.forEach((day) => {
        expect(day.session.flashCount).toBeLessThanOrEqual(100);
        if (day.dayIndex === 0) {
          // Calibration session is deliberately short (two 10-trial blocks).
          expect(day.session.flashCount).toBe(20);
        } else {
          expect(day.session.flashCount).toBe(100);
        }
      });
    }
  });
});
