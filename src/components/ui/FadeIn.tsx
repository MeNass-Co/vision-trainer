import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

export type FadeInProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function FadeIn({ children, delay = 0, duration = 280, style }: FadeInProps) {
  const progress = useSharedValue(0);
  const reduceMotion = useEffectiveReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
  }, [delay, duration, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: 8 * (1 - progress.value) }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
