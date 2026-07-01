import { useReducedMotion } from 'react-native-reanimated';

import { useAppStore } from '@/store/useAppStore';

/**
 * The single reduce-motion truth for the app: the OS accessibility setting OR
 * the in-app "Reduce motion" toggle. Every animated surface reads this instead
 * of Reanimated's `useReducedMotion()` directly, so the Settings row actually
 * governs motion rather than being a placebo.
 */
export function useEffectiveReducedMotion(): boolean {
  const systemReducedMotion = useReducedMotion();
  const settingReducedMotion = useAppStore((state) => state.settings.reduceMotion);

  return systemReducedMotion || settingReducedMotion;
}
