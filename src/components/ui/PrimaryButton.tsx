import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { accent, ACCENT_CORE, motion, radius, surface, text } from '@/theme/tokens';

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

// Owner order (glass-unification pass 3): "couleur qui pète et liquid glass
// ne sont pas mutuellement exclusifs" — v2's flat single-hue TINT_OVERLAY
// read as a dull teal wash, not vivid. Fix: bare GlassView('regular') (same
// primitive as the tab bar / GlassCard) with `accent.ctaRamp`'s 5-stop
// horizontal gradient laid over it as a TRANSLUCENT veil (each stop at
// ~0.6 alpha) instead of one flat color — the starfield ghosts faintly
// THROUGH the luminous gradient, i.e. colored liquid glass, not a solid CTA
// slab. Uniform 1pt perimeter rim, same color/alpha as the tab bar's active
// pill (`PILL_RIM_COLOR` in CustomTabBar) — one glass grammar app-wide.
//
// CTA law (VALIDATION.md #1): this component still governs EVERY full-width
// CTA in the app (Today, paywall, empty-state, onboarding, calibration,
// session) — geometry (48pt, radius.pill, margins) is untouched, only the
// material changed. Ghost = a softer secondary commit, unchanged geometry/
// type, flat surface fill (currently unused by any call site).
const RIM_COLOR = 'rgba(255,255,255,0.18)'; // same uniform rim as CustomTabBar's PILL_RIM_COLOR
const CTA_VEIL_ALPHA = 0.8; // orchestrator retune: 0.6 read sage/dull — vivid first, residual translucency second
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};
// accent.ctaRamp @ CTA_VEIL_ALPHA, layered over bare glass as a horizontal veil.
const CTA_VEIL_COLORS = accent.ctaRamp.map((hex) => hexToRgba(hex, CTA_VEIL_ALPHA)) as unknown as [
  string,
  string,
  ...string[],
];

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
  const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

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
        <>
          {liquidGlass ? (
            <GlassView
              colorScheme="dark"
              glassEffectStyle="regular"
              isInteractive
              pointerEvents="none"
              style={styles.glassFill}
            />
          ) : (
            <BlurView
              experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
              intensity={Platform.OS === 'ios' ? 55 : 62}
              pointerEvents="none"
              style={styles.glassFill}
              tint="dark"
            />
          )}
          <LinearGradient
            colors={CTA_VEIL_COLORS}
            end={{ x: 1, y: 0.5 }}
            pointerEvents="none"
            start={{ x: 0, y: 0.5 }}
            style={[styles.glassFill, disabled && styles.disabledFill]}
          />
        </>
      ) : null}
      <AppText
        color="primary"
        style={[isSolid && styles.solidLabel, disabled && isSolid && styles.disabledLabel]}
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
    backgroundColor: 'transparent',
    // Uniform perimeter rim, identical treatment to the tab bar's glass — no
    // directional light source, same brightness on all four edges.
    borderColor: RIM_COLOR,
    borderWidth: 1,
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
  glassFill: {
    ...StyleSheet.absoluteFillObject,
  },
  // Label color law (glass-unification pass 3, re-measured for the ctaRamp
  // veil): white was tried first (matched the tab bar/rim's neutral voice)
  // but sampled at only ≈2.9:1 against the bright pastel veil (design/
  // captures/glassv2-today.png, ×3 crop) — fails even the 20pt/medium "large
  // text" 3:1 floor. `text.inverse` (near-black) sampled ≈6.3:1 — clears AA
  // with margin and reads as "alive": dark ink on a luminous colored-glass
  // pill, not a washed-out label.
  solidLabel: {
    color: text.inverse,
  },
  // States law (spec rows 17-18): fill −90% opacity, label −60/65% opacity vs enabled.
  disabledFill: {
    opacity: 0.1,
  },
  disabledLabel: {
    opacity: 0.37,
  },
});
