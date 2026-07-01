import { describe, expect, it } from 'vitest';

import { QuestStaircase, type QuestParameters } from './quest';

const params: QuestParameters = {
  tGuess: -1.5,
  tGuessSd: 0.45,
  pThreshold: 0.79,
  beta: 3.5,
  delta: 0.03,
  gamma: 0.5,
  grain: 0.01,
  range: 1.6,
};

const regularHistory: [number, boolean][] = [
  [-1.5, true],
  [-1.6, true],
  [-1.7, false],
  [-1.55, true],
  [-1.62, false],
  [-1.5, true],
];

describe('QuestStaircase catch trials', () => {
  it('leaves the posterior untouched: estimate and next intensity match a catch-free twin', () => {
    const withCatch = new QuestStaircase(params);
    const withoutCatch = new QuestStaircase(params);

    for (const [intensity, correct] of regularHistory) {
      withCatch.record(intensity, correct);
      withoutCatch.record(intensity, correct);
      // Interleave catch trials (both outcomes) on one staircase only.
      withCatch.record(Math.log10(0.9), true, true);
      withCatch.record(Math.log10(0.9), false, true);
    }

    expect(withCatch.estimate()).toEqual(withoutCatch.estimate());
    expect(withCatch.nextIntensity()).toBe(withoutCatch.nextIntensity());
  });

  it('normalizes the lapse rate by the CATCH trial count, not all trials', () => {
    const quest = new QuestStaircase(params);

    for (let i = 0; i < 20; i += 1) {
      quest.record(-1.5, i % 3 !== 0);
    }
    quest.record(Math.log10(0.9), true, true);
    quest.record(Math.log10(0.9), true, true);
    quest.record(Math.log10(0.9), true, true);
    quest.record(Math.log10(0.9), false, true);

    expect(quest.catchTrialCount()).toBe(4);
    expect(quest.trialCount()).toBe(24);
    // 1 miss / 4 catch trials — NOT 1 / 24.
    expect(quest.lapseRate()).toBeCloseTo(0.25, 10);
  });

  it('reports a zero lapse rate when no catch trials were presented', () => {
    const quest = new QuestStaircase(params);

    quest.record(-1.5, false);
    quest.record(-1.5, true);

    expect(quest.catchTrialCount()).toBe(0);
    expect(quest.lapseRate()).toBe(0);
  });
});
