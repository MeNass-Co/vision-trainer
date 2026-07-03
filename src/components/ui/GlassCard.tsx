import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { hairline, material, radius as radiusTokens } from '@/theme/tokens';

export type GlassCardTier = 'surface' | 'content';

export type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /**
   * Tier 2 'surface' (settings sections, calibration slider) vs Tier 3
   * 'content' (Vision profile / spatial-frequency / trend / science / paywall
   * plan cards) — same hue family, graded transparency. Chrome (tab bar,
   * SheetCloseButton) stays bespoke and never routes through this component.
   */
  tier?: GlassCardTier;
};

const TIER_TINT: Record<GlassCardTier, string> = {
  surface: material.glassSurface,
  content: material.glassContent,
};

/**
 * ONE material, app-wide (native-revamp Phase 4 final wave). Same bare
 * GlassView('regular') primitive CustomTabBar already ships — no manual
 * `tintColor` prop on the GlassView itself, which is what read grey/flat in
 * the older GlassSurface approach. Color instead comes from a plain tint
 * overlay layered ON TOP of the system glass, so the starfield still
 * refracts through underneath it; the cyan hairline is a second overlay, not
 * a native border, so both tiers share pixel-identical treatment.
 */
export function GlassCard({ children, style, radius = radiusTokens.lg, tier = 'content' }: GlassCardProps) {
  const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  const tint = TIER_TINT[tier];
  const shapeStyle = { borderRadius: radius };

  const overlays = (
    <>
      <View pointerEvents="none" style={[styles.tint, shapeStyle, { backgroundColor: tint }]} />
      <View pointerEvents="none" style={[styles.hairlineBorder, shapeStyle]} />
    </>
  );

  if (liquidGlass) {
    return (
      <GlassView colorScheme="dark" glassEffectStyle="regular" style={[styles.card, shapeStyle, style]}>
        {overlays}
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      intensity={Platform.OS === 'ios' ? 55 : 62}
      style={[styles.card, shapeStyle, style]}
      tint="dark">
      {overlays}
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  hairlineBorder: {
    ...StyleSheet.absoluteFillObject,
    borderColor: material.hairlineGlassAccent,
    borderWidth: hairline.px1,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
});
