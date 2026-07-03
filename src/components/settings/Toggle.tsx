import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/ui';
import { haptics } from '@/theme/haptics';
import { ACCENT, motion, radius, surface } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

export type ToggleProps = {
  accessibilityLabel?: string;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  value: boolean;
};

// Stock UISwitch geometry (toggle/spec.md) — track is the invariant every reference converges on.
const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const KNOB_SIZE = 27;
const KNOB_INSET = 2;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;
// Thumb is flat white in both states, unchanged from stock (spec row 9) — not a themed token.
const KNOB_FILL = '#FFFFFF';

export function Toggle({ accessibilityLabel, disabled = false, onChange, value }: ToggleProps) {
  const progress = useSharedValue(value ? 1 : 0);
  const reduceMotion = useEffectiveReducedMotion();

  useEffect(() => {
    const target = value ? 1 : 0;
    progress.value = reduceMotion ? target : withSpring(target, motion.spring.toggle);
  }, [progress, reduceMotion, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [surface.controlTrackOff, ACCENT]),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * KNOB_TRAVEL }],
  }));
  const handleChange = () => {
    const nextValue = !value;

    // Commit-frame feedback: the tick lands exactly as the knob crosses, not on touch-down.
    haptics.select();
    const target = nextValue ? 1 : 0;
    progress.value = reduceMotion ? target : withSpring(target, motion.spring.toggle);
    onChange(nextValue);
  };

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      haptic="none"
      onPress={handleChange}
      scaleTo={0.94}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  knob: {
    backgroundColor: KNOB_FILL,
    borderRadius: radius.pill,
    height: KNOB_SIZE,
    // Thumb shadow (spec row 17): black 6% opacity, ~2pt blur, offset (0, +1) downward.
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    width: KNOB_SIZE,
  },
  track: {
    borderRadius: radius.pill,
    height: TRACK_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: KNOB_INSET,
    width: TRACK_WIDTH,
  },
});
