import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { ACCENT_CORE, accent, motion, radius, surface } from '@/theme/tokens';

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'ghost';
  haptic?: PressableScaleProps['haptic'];
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

// CTA law (VALIDATION.md #1): this component governs EVERY full-width CTA in the
// app (Today, paywall, empty-state, onboarding, calibration, session). One committing
// action per screen = the solid pill with the isoluminant cyan-mint ramp (law #3).
// Ghost = a softer secondary commit, unchanged geometry/type, flat surface fill.
export function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
  haptic = 'select',
  accessibilityLabel,
  disabled = false,
  style,
  children,
}: PrimaryButtonProps) {
  const isSolid = variant === 'solid';

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      haptic={haptic}
      onPress={onPress}
      scaleTo={motion.pressScale}
      style={[styles.base, isSolid ? styles.solid : styles.ghost, disabled && isSolid && styles.solidDisabledGlow, style]}>
      {isSolid ? (
        // Law #3: horizontal (90°) 5-stop isoluminant ramp, 0 vertical variance —
        // no top sheen/highlight layered on top (the reference fill is flat on the y-axis).
        <LinearGradient
          colors={accent.ctaRamp}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          pointerEvents="none"
          start={{ x: 0, y: 0.5 }}
          style={[StyleSheet.absoluteFill, disabled && styles.disabledFill]}
        />
      ) : null}
      <AppText
        color={isSolid ? 'inverse' : 'primary'}
        style={disabled && isSolid ? styles.disabledLabel : undefined}
        variant="heading">
        {label}
      </AppText>
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  solid: {
    backgroundColor: accent.ctaRamp[accent.ctaRamp.length - 1],
    // iOS-only cyan glow (premium CTA signature; unmeasurable from the reference PNG —
    // spec row 10 flags no isolable local bloom, best-effort low ambient echo).
    // No Android `elevation` — it would ignore shadowColor and stamp a grey box instead.
    shadowColor: ACCENT_CORE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
  },
  solidDisabledGlow: {
    shadowOpacity: 0,
  },
  ghost: {
    backgroundColor: surface.raised,
    borderColor: surface.hairlineStrong,
    borderWidth: 1,
  },
  // States law (spec rows 17-18): fill −90% opacity, label −60/65% opacity vs enabled.
  disabledFill: {
    opacity: 0.1,
  },
  disabledLabel: {
    opacity: 0.37,
  },
});
