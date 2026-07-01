import { contrastFromLog10, type QuestStaircase } from '@/psychophysics/quest';
import type { ContrastCondition, GaborStimulus, TrialInterval } from '@/types';

/** Roughly one attention probe per ten trials. */
export const CATCH_TRIAL_RATE = 0.1;

/**
 * Catch trials are SUPRATHRESHOLD lapse probes (contrast 0.9, the engine's
 * ceiling), not blanks. In 2AFC a blank-blank trial is answered at chance by
 * construction (expected error rate 0.5), which would trip the lapse > 0.15
 * reliability gate for every attentive observer. The coherent 2AFC attention
 * probe is a near-maximum-contrast trial: an attentive observer scores ~100%,
 * so a miss is a lapse — exactly the semantics QuestStaircase.record() applies
 * to `catchTrial` (miss ⇒ lapse, posterior untouched).
 */
export const CATCH_TRIAL_CONTRAST = 0.9;

export type TrialPlan = {
  /** The two intervals; exactly one holds a stimulus, the other is null (blank). */
  intervals: [GaborStimulus | null, GaborStimulus | null];
  targetInterval: TrialInterval;
  /** Suprathreshold attention probe: scored for lapses, never fed to QUEST. */
  catchTrial: boolean;
  /** The intensity actually presented — recorded verbatim into QUEST. */
  intensityLog10: number;
};

export function buildTrialPlan(input: {
  quest: QuestStaircase;
  condition: ContrastCondition;
  random: () => number;
  backgroundLuminanceCdM2: number;
  defaultDurationMs: number;
}): TrialPlan {
  const { condition, random } = input;
  const catchTrial = random() < CATCH_TRIAL_RATE;
  const intensityLog10 = catchTrial
    ? Math.log10(CATCH_TRIAL_CONTRAST)
    : input.quest.nextIntensity();
  const targetInterval: TrialInterval = random() < 0.5 ? 1 : 2;
  const stimulus: GaborStimulus = {
    spatialFrequencyCpd: condition.spatialFrequencyCpd,
    orientationDeg: condition.orientationDeg,
    contrast: contrastFromLog10(intensityLog10),
    phaseRad: random() * Math.PI * 2,
    durationMs: condition.durationMs ?? input.defaultDurationMs,
    gaborSizeDeg: condition.gaborSizeDeg,
    backgroundLuminanceCdM2: input.backgroundLuminanceCdM2,
  };

  return {
    intervals: targetInterval === 1 ? [stimulus, null] : [null, stimulus],
    targetInterval,
    catchTrial,
    intensityLog10,
  };
}
