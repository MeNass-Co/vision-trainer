import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppText, GaborMark, GlassCard, PressableScale, PrimaryButton } from '@/components/ui';
import { buildDeviceCalibration } from '@/core/deviceCalibration';
import { viewingDistanceReminder } from '@/core/displayCalibration';
import {
  applySessionBrightness,
  getCurrentBrightness,
  restoreCapturedBrightness,
} from '@/services/brightness';
import { useAppStore } from '@/store/useAppStore';
import { haptics } from '@/theme/haptics';
import { ACCENT, ACCENT_CORE, motion, radius, space, surface, text } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

const BRIGHTNESS_MAX = 1;
const BRIGHTNESS_MIN = 0.2;
const BRIGHTNESS_RANGE = BRIGHTNESS_MAX - BRIGHTNESS_MIN;
// slider spec.md row 5: thumb diameter 16.0pt (== space.base). row 1: track height 8.0pt (== space.sm).
const SLIDER_KNOB_SIZE = space.base;
const SLIDER_TRACK_HEIGHT = space.sm;

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

function edgeForProgress(progressValue: number): 'min' | 'max' | null {
  if (progressValue <= 0) return 'min';
  if (progressValue >= 1) return 'max';
  return null;
}

export function CalibrationCard({ onComplete, confirmLabel = 'This feels right' }: CalibrationCardProps) {
  const storedBrightness = useAppStore((state) => state.settings.displayBrightness);
  const [brightness, setBrightness] = useState(
    clamp(storedBrightness, BRIGHTNESS_MIN, BRIGHTNESS_MAX)
  );
  const [trackWidth, setTrackWidth] = useState(0);
  // VALIDATION.md motion row: "haptic tick at 0%/100% only" — track which edge (if any)
  // we last ticked at, so holding at an edge doesn't re-fire and leaving it re-arms.
  const lastEdgeRef = useRef<'min' | 'max' | null>(edgeForProgress(brightnessToProgress(brightness)));
  const latestBrightnessRef = useRef(brightness);
  const progress = useSharedValue(brightnessToProgress(brightness));
  const thumbScale = useSharedValue(1);
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
      lastEdgeRef.current = edgeForProgress(brightnessToProgress(initialBrightness));
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
    const edge = edgeForProgress(brightnessToProgress(calibratedBrightness));

    latestBrightnessRef.current = calibratedBrightness;
    setBrightness(calibratedBrightness);
    void applySessionBrightness(calibratedBrightness);

    // Slider motion law (VALIDATION.md): haptic tick at 0%/100% only, once per arrival.
    if (edge && edge !== lastEdgeRef.current) {
      haptics.tick();
    }
    lastEdgeRef.current = edge;
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
      .hitSlop({ top: 14, bottom: 14 })
      .onBegin((event) => {
        // VALIDATION.md motion row: thumb scale 1.15 while grabbed, spring.input.
        thumbScale.value = withSpring(1.15, motion.spring.input);
        updateFromX(event.x);
      })
      .onUpdate((event) => {
        updateFromX(event.x);
      })
      .onFinalize(() => {
        thumbScale.value = withSpring(1, motion.spring.input);
      });
    const tap = Gesture.Tap()
      .hitSlop({ top: 14, bottom: 14 })
      .onEnd((event) => {
        updateFromX(event.x);
      });

    return Gesture.Race(pan, tap);
  }, [commitBrightness, progress, thumbScale, trackWidth]);

  // Fill runs flush to the thumb's center — the junction always hides under the
  // knob, so no sliver of unfilled track is ever exposed at any position.
  const fillAnimatedStyle = useAnimatedStyle(() => {
    const travel = Math.max(trackWidth - SLIDER_KNOB_SIZE, 0);
    const thumbCenter = progress.value * travel + SLIDER_KNOB_SIZE / 2;
    return { width: thumbCenter };
  });
  const knobAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * Math.max(trackWidth - SLIDER_KNOB_SIZE, 0) },
      { scale: thumbScale.value },
    ],
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

      {/* ONE-material pass: Tier 2 'surface' glass, same treatment as settings
          section cards — the bespoke rgba fill+border is gone. */}
      <GlassCard radius={radius.lg} style={styles.calibrationControls} tier="surface">
        <GestureDetector gesture={gesture}>
          <View
            onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
            style={styles.slider}>
            <View pointerEvents="none" style={styles.sliderTrack}>
              <Animated.View style={[styles.sliderFill, fillAnimatedStyle]}>
                <LinearGradient
                  colors={[ACCENT_CORE, ACCENT]}
                  end={{ x: 1, y: 0.5 }}
                  start={{ x: 0, y: 0.5 }}
                  style={styles.fillGradient}
                />
              </Animated.View>
            </View>
            <Animated.View pointerEvents="none" style={[styles.sliderKnob, knobAnimatedStyle]} />
          </View>
        </GestureDetector>
        <View style={styles.sliderLabels}>
          <AppText color="secondary" uppercase variant="micro">
            Dim
          </AppText>
          <AppText color="primary" tabular variant="bodyStrong">
            {Math.round(brightness * 100)}%
          </AppText>
          <AppText color="secondary" uppercase variant="micro">
            Bright
          </AppText>
        </View>
      </GlassCard>

      <PrimaryButton label={confirmLabel} onPress={confirmBrightness} style={styles.confirmButton} />
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
  // ONE-material pass: fill/border now come from GlassCard (Tier 2 'surface') — this style only carries gap/padding.
  calibrationControls: {
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
  confirmButton: {
    width: '100%',
  },
  slider: {
    // spec.md rows 5+6: thumb (16pt) sits centered on the track (8pt) with 4pt
    // overhang each side — the wrapper is exactly the thumb's own diameter tall;
    // touch generosity comes from gesture hitSlop, not extra visual height.
    height: SLIDER_KNOB_SIZE,
    justifyContent: 'center',
    width: '100%',
  },
  // Fill container: width is animated (spec row 7 quirk); the 3 children below
  sliderFill: {
    height: '100%',
    overflow: 'hidden',
  },
  // Smooth luminance ramp — bright at the origin, our accent at the thumb.
  fillGradient: {
    height: '100%',
    width: '100%',
  },
  sliderKnob: {
    backgroundColor: text.primary,
    borderRadius: radius.pill,
    height: SLIDER_KNOB_SIZE,
    left: 0,
    position: 'absolute',
    // spec.md rows 28–30: pure downward contact shadow, ~2.7pt blur, zero lateral spread.
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0.3 },
    shadowOpacity: 0.3,
    shadowRadius: 2.7,
    width: SLIDER_KNOB_SIZE,
  },
  sliderLabels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderTrack: {
    // spec.md row 13: nearest sibling token to the reference's near-neutral grey.
    backgroundColor: surface.hairlineStrong,
    borderRadius: radius.pill,
    height: SLIDER_TRACK_HEIGHT,
    overflow: 'hidden',
    width: '100%',
  },
});
