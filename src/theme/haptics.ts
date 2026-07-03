import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let enabled = true;

const ok = Platform.OS !== 'web';
const run = (fn: () => Promise<unknown>) => {
  if (!ok || !enabled) return;
  try {
    fn().catch(() => {});
  } catch {}
};

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

export const haptics = {
  // Token addendum (VALIDATION.md) — additive: motion.haptics.tick = 'light'.
  tick: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  select: () => run(() => Haptics.selectionAsync()),
  correct: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  wrong: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  milestone: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  numberSettle: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  rewardChord: (): (() => void) => {
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    if (!ok || !enabled) return () => {};
    const timeouts = [
      setTimeout(() => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)), 120),
      setTimeout(() => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)), 240),
    ];
    return () => {
      for (const timeout of timeouts) clearTimeout(timeout);
    };
  }
} as const;
