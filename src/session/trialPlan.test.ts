import { describe, expect, it } from 'vitest';

import { contrastFromLog10, QuestStaircase, type QuestParameters } from '@/psychophysics/quest';
import type { ContrastCondition } from '@/types';

import { buildTrialPlan, CATCH_TRIAL_CONTRAST, CATCH_TRIAL_RATE } from './trialPlan';

function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const questParams: QuestParameters = {
  tGuess: -1.5,
  tGuessSd: 0.45,
  pThreshold: 0.79,
  beta: 3.5,
  delta: 0.03,
  gamma: 0.5,
  grain: 0.01,
  range: 1.6,
};

const condition: ContrastCondition = {
  paradigm: 'contrast-detection',
  spatialFrequencyCpd: 3,
  orientationDeg: 0,
  trialsPerBlock: 10,
  durationMs: 150,
  gaborSizeDeg: 6,
};

function makePlan(quest: QuestStaircase, random: () => number) {
  return buildTrialPlan({
    quest,
    condition,
    random,
    backgroundLuminanceCdM2: 40,
    defaultDurationMs: 150,
  });
}

describe('buildTrialPlan', () => {
  it('produces ~10% catch trials over a seeded run and never feeds them to QUEST', () => {
    const quest = new QuestStaircase(questParams);
    const random = mulberry32(1234);
    const before = quest.estimate();
    const runs = 4000;
    let catchCount = 0;

    for (let i = 0; i < runs; i += 1) {
      if (makePlan(quest, random).catchTrial) catchCount += 1;
    }

    expect(catchCount / runs).toBeGreaterThan(CATCH_TRIAL_RATE - 0.02);
    expect(catchCount / runs).toBeLessThan(CATCH_TRIAL_RATE + 0.02);
    // Planning alone must never move the staircase.
    expect(quest.estimate()).toEqual(before);
    expect(quest.trialCount()).toBe(0);
  });

  it('presents catch trials at the suprathreshold probe contrast, others at the QUEST intensity', () => {
    const quest = new QuestStaircase(questParams);
    const random = mulberry32(42);

    for (let i = 0; i < 200; i += 1) {
      const plan = makePlan(quest, random);
      const stimulus = plan.intervals[plan.targetInterval - 1];

      expect(stimulus).not.toBeNull();
      expect(plan.intervals[plan.targetInterval === 1 ? 1 : 0]).toBeNull();
      // Recorded intensity = presented contrast, catch or not.
      expect(stimulus?.contrast).toBeCloseTo(contrastFromLog10(plan.intensityLog10), 10);
      if (plan.catchTrial) {
        expect(stimulus?.contrast).toBeCloseTo(CATCH_TRIAL_CONTRAST, 10);
      } else {
        expect(plan.intensityLog10).toBe(quest.nextIntensity());
      }
    }
  });

  it('randomizes the target interval across both positions', () => {
    const quest = new QuestStaircase(questParams);
    const random = mulberry32(7);
    const seen = new Set<number>();

    for (let i = 0; i < 50; i += 1) {
      seen.add(makePlan(quest, random).targetInterval);
    }

    expect(seen).toEqual(new Set([1, 2]));
  });

  it('carries the condition geometry and duration into the stimulus', () => {
    const quest = new QuestStaircase(questParams);
    const plan = makePlan(quest, mulberry32(99));
    const stimulus = plan.intervals[plan.targetInterval - 1];

    expect(stimulus?.spatialFrequencyCpd).toBe(3);
    expect(stimulus?.gaborSizeDeg).toBe(6);
    expect(stimulus?.durationMs).toBe(150);
    expect(stimulus?.backgroundLuminanceCdM2).toBe(40);
  });
});
