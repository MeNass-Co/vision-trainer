import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { ACCENT_CORE, motion, radius, surface } from '@/theme/tokens';

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

// Owner order (glass-unification pass 2): the flat isoluminant-ramp CTA is
// gone — this is now real Liquid Glass, same GlassView('regular') primitive
// as the tab bar / GlassCard. TRIED FIRST: the native `tintColor` prop set to
// ACCENT — rejected after an on-sim capture (design/captures/glass2-today.png,
// zoomed) showed it rendering as a near-fully-opaque flat cyan slab, zero
// visible blur/refraction, indistinguishable from the old solid gradient it
// was supposed to replace. Shipped instead: bare glass (no tintColor) + a
// plain translucent ACCENT overlay layered ON TOP, same pattern GlassCard
// already uses for its tint (a View, not a native recolor) — the backdrop
// still refracts through underneath it. Uniform 1pt perimeter rim, same
// color/alpha as the tab bar's active pill (`PILL_RIM_COLOR` in
// CustomTabBar) — one glass grammar app-wide.
//
// CTA law (VALIDATION.md #1): this component still governs EVERY full-width
// CTA in the app (Today, paywall, empty-state, onboarding, calibration,
// session) — geometry (48pt, radius.pill, margins) is untouched, only the
// material changed. Ghost = a softer secondary commit, unchanged geometry/
// type, flat surface fill (currently unused by any call site).
const RIM_COLOR = 'rgba(255,255,255,0.18)'; // same uniform rim as CustomTabBar's PILL_RIM_COLOR
const TINT_OVERLAY = 'rgba(51,210,214,0.35)'; // ACCENT #33D2D6 @ 35%, layered over bare glass

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
          <View pointerEvents="none" style={[styles.glassFill, styles.tintOverlay, disabled && styles.disabledFill]} />
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
  tintOverlay: {
    backgroundColor: TINT_OVERLAY,
  },
  // Label color law, re-measured for the glass material: `text.inverse` (near-
  // black, right for the old bright isoluminant ramp) measured ≈2.25:1 against
  // the new translucent teal glass fill — fails WCAG AA even at large-text
  // 3:1. White measured ≈8.17:1 (AAA). Sampled from a ×2 capture,
  // design/captures/glass2-today-cta-zoom.png.
  solidLabel: {
    color: '#FFFFFF',
  },
  // States law (spec rows 17-18): fill −90% opacity, label −60/65% opacity vs enabled.
  disabledFill: {
    opacity: 0.1,
  },
  disabledLabel: {
    opacity: 0.37,
  },
});
