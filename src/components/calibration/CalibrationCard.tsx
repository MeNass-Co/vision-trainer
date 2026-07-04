import { Host, Slider } from '@expo/ui/swift-ui';
import { frame, tint } from '@expo/ui/swift-ui/modifiers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, GaborMark, GlassCard, PrimaryButton } from '@/components/ui';
import { buildDeviceCalibration } from '@/core/deviceCalibration';
import { viewingDistanceReminder } from '@/core/displayCalibration';
import {
  applySessionBrightness,
  getCurrentBrightness,
  restoreCapturedBrightness,
} from '@/services/brightness';
import { useAppStore } from '@/store/useAppStore';
import { haptics } from '@/theme/haptics';
import { ACCENT, radius, space } from '@/theme/tokens';

const BRIGHTNESS_MAX = 1;
const BRIGHTNESS_MIN = 0.2;
const BRIGHTNESS_RANGE = BRIGHTNESS_MAX - BRIGHTNESS_MIN;
// Native UISlider's own hit target/track height — generous enough to match
// the old hand-drawn control's touch geometry without a custom hitSlop.
const SLIDER_HEIGHT = 32;

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
  // VALIDATION.md motion row: "haptic tick at 0%/100% only" — track which edge (if any)
  // we last ticked at, so holding at an edge doesn't re-fire and leaving it re-arms.
  const lastEdgeRef = useRef<'min' | 'max' | null>(edgeForProgress(brightnessToProgress(brightness)));
  const latestBrightnessRef = useRef(brightness);
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
    };

    void loadInitialBrightness();

    return () => {
      active = false;
    };
  }, [storedBrightness]);

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
          section cards — the bespoke rgba fill+border is gone. THE GREAT
          NATIVE WAVE: the hand-drawn gesture-driven track/knob (hue gradient
          fill, reanimated grab-scale) dies by doctrine in favor of a real
          UISlider (via @expo/ui's SwiftUI Slider) — `tint` recolors its
          filled portion to ACCENT, same as UISlider's minimumTrackTintColor. */}
      <GlassCard radius={radius.lg} style={styles.calibrationControls} tier="surface">
        <Host matchContents={{ vertical: true }} style={styles.sliderHost}>
          <Slider
            max={BRIGHTNESS_MAX}
            min={BRIGHTNESS_MIN}
            modifiers={[tint(ACCENT), frame({ height: SLIDER_HEIGHT })]}
            onValueChange={commitBrightness}
            value={brightness}
          />
        </Host>
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
  sliderHost: {
    width: '100%',
  },
  sliderLabels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
