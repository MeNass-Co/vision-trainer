import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText, GaborMark, PressableScale, SecondaryButton } from '@/components/ui';
import { buildDeviceCalibration } from '@/core/deviceCalibration';
import { viewingDistanceReminder } from '@/core/displayCalibration';
import {
  applySessionBrightness,
  getCurrentBrightness,
  restoreCapturedBrightness,
} from '@/services/brightness';
import { useAppStore } from '@/store/useAppStore';
import { haptics } from '@/theme/haptics';
import { ACCENT, ACCENT_GLOW, radius, space, text } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

const BRIGHTNESS_MAX = 1;
const BRIGHTNESS_MIN = 0.2;
const BRIGHTNESS_RANGE = BRIGHTNESS_MAX - BRIGHTNESS_MIN;
const SLIDER_KNOB_SIZE = 28;

export type CalibrationCardProps = {
  onComplete: () => void;
  confirmLabel?: string;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function brightnessToProgress(value: number) {
  return (clamp(value, BRIGHTNESS_MIN, BRIGHTNESS_MAX) - BRIGHTNESS_MIN) / BRIGHTNESS_RANGE;
}

export function CalibrationCard({ onComplete, confirmLabel = 'This feels right' }: CalibrationCardProps) {
  const storedBrightness = useAppStore((state) => state.settings.displayBrightness);
  const [brightness, setBrightness] = useState(
    clamp(storedBrightness, BRIGHTNESS_MIN, BRIGHTNESS_MAX)
  );
  const [trackWidth, setTrackWidth] = useState(0);
  const lastHapticStepRef = useRef(Math.round(brightness * 10));
  const latestBrightnessRef = useRef(brightness);
  const progress = useSharedValue(brightnessToProgress(brightness));
  const reduceMotion = useEffectiveReducedMotion();
  const distanceLine = useMemo(
    () => viewingDistanceReminder(buildDeviceCalibration().viewingDistanceCm),
    []
  );

  useEffect(() => {
    let active = true;

    const loadInitialBrightness = async () => {
      const currentBrightness = await getCurrentBrightness();
      const initialBrightness = clamp(
        currentBrightness ?? storedBrightness,
        BRIGHTNESS_MIN,
        BRIGHTNESS_MAX
      );

      if (!active) return;

      latestBrightnessRef.current = initialBrightness;
      lastHapticStepRef.current = Math.round(initialBrightness * 10);
      setBrightness(initialBrightness);
      progress.value = reduceMotion
        ? brightnessToProgress(initialBrightness)
        : withTiming(brightnessToProgress(initialBrightness), { duration: 180 });
    };

    void loadInitialBrightness();

    return () => {
      active = false;
    };
  }, [progress, reduceMotion, storedBrightness]);

  useEffect(() => {
    // The slider drives the physical backlight live. However the step ends
    // (Back, abandoning the flow, or confirming) the phone gets its own
    // brightness back; sessions re-apply the calibrated level at session start.
    return () => {
      void restoreCapturedBrightness();
    };
  }, []);

  const commitBrightness = useCallback((nextBrightness: number) => {
    const calibratedBrightness = clamp(nextBrightness, BRIGHTNESS_MIN, BRIGHTNESS_MAX);
    const hapticStep = Math.round(calibratedBrightness * 10);

    latestBrightnessRef.current = calibratedBrightness;
    setBrightness(calibratedBrightness);
    void applySessionBrightness(calibratedBrightness);

    if (hapticStep !== lastHapticStepRef.current) {
      lastHapticStepRef.current = hapticStep;
      haptics.select();
    }
  }, []);

  const confirmBrightness = () => {
    const calibratedBrightness = clamp(latestBrightnessRef.current, BRIGHTNESS_MIN, BRIGHTNESS_MAX);

    useAppStore.getState().updateSetting('displayBrightness', calibratedBrightness);
    onComplete();
  };

  const gesture = useMemo(() => {
    const updateFromX = (x: number) => {
      'worklet';
      const travel = Math.max(trackWidth - SLIDER_KNOB_SIZE, 0);
      const nextProgress =
        travel === 0
          ? progress.value
          : Math.max(0, Math.min(1, (x - SLIDER_KNOB_SIZE / 2) / travel));
      const nextBrightness = BRIGHTNESS_MIN + nextProgress * BRIGHTNESS_RANGE;

      progress.value = nextProgress;
      runOnJS(commitBrightness)(nextBrightness);
    };
    const pan = Gesture.Pan()
      .activeOffsetX([-4, 4])
      .onBegin((event) => {
        updateFromX(event.x);
      })
      .onUpdate((event) => {
        updateFromX(event.x);
      });
    const tap = Gesture.Tap().onEnd((event) => {
      updateFromX(event.x);
    });

    return Gesture.Race(pan, tap);
  }, [commitBrightness, progress, trackWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  const knobStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [text.secondary, text.inverse]),
    shadowOpacity: 0.3 + progress.value * 0.35,
    transform: [{ translateX: progress.value * Math.max(trackWidth - SLIDER_KNOB_SIZE, 0) }],
  }));

  return (
    <View style={styles.calibration}>
      <View style={styles.calibrationReference}>
        <GaborMark size={212} />
        <AppText style={styles.calibrationCopy} variant="title">
          Set a comfortable glow for your room.
        </AppText>
        <AppText color="muted" style={styles.calibrationDistance} variant="caption">
          {distanceLine}
        </AppText>
      </View>

      <View style={styles.calibrationControls}>
        <GestureDetector gesture={gesture}>
          <View
            onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
            style={styles.slider}>
            <View pointerEvents="none" style={styles.sliderTrack}>
              <Animated.View style={[styles.sliderFill, fillStyle]} />
            </View>
            <Animated.View pointerEvents="none" style={[styles.sliderKnob, knobStyle]} />
          </View>
        </GestureDetector>
        <View style={styles.sliderLabels}>
          <AppText color="muted" variant="micro">
            Dim
          </AppText>
          <AppText color="secondary" style={styles.sliderValue} tabular variant="micro">
            {Math.round(brightness * 100)}%
          </AppText>
          <AppText color="muted" variant="micro">
            Bright
          </AppText>
        </View>
      </View>

      <SecondaryButton label={confirmLabel} onPress={confirmBrightness} />
    </View>
  );
}

const styles = StyleSheet.create({
  calibration: {
    alignItems: 'center',
    gap: space.lg,
    justifyContent: 'flex-end',
    minHeight: 500,
    paddingBottom: space.md,
  },
  calibrationControls: {
    backgroundColor: 'rgba(12, 20, 23, 0.58)',
    borderColor: 'rgba(207, 250, 251, 0.12)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: space.sm,
    paddingBottom: space.md,
    paddingHorizontal: space.base,
    paddingTop: space.md,
    width: '100%',
  },
  calibrationCopy: {
    maxWidth: 320,
    textAlign: 'center',
  },
  calibrationDistance: {
    marginTop: -space.md,
    maxWidth: 320,
    textAlign: 'center',
  },
  calibrationReference: {
    alignItems: 'center',
    gap: space.base,
    justifyContent: 'center',
  },
  slider: {
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  sliderFill: {
    backgroundColor: ACCENT,
    borderRadius: radius.pill,
    height: '100%',
    shadowColor: ACCENT_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  sliderKnob: {
    backgroundColor: text.primary,
    borderColor: 'rgba(207, 250, 251, 0.44)',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: SLIDER_KNOB_SIZE,
    left: 0,
    position: 'absolute',
    shadowColor: ACCENT_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    width: SLIDER_KNOB_SIZE,
  },
  sliderLabels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderTrack: {
    backgroundColor: 'rgba(40, 54, 58, 0.82)',
    borderRadius: radius.pill,
    height: 9,
    overflow: 'hidden',
    width: '100%',
  },
  sliderValue: {
    letterSpacing: 1.2,
  },
});
