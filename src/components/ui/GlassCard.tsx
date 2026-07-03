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

const TIER_SCRIM: Record<GlassCardTier, string> = {
  surface: material.glassSurface,
  content: material.glassContent,
};

/**
 * GlassCard v2 (owner verdict, glass-unification pass 3): base recipe is now
 * EXACTLY the tab bar's — bare GlassView('regular') + the same uniform 1pt
 * rim (`material.hairlineGlassAccent`, 16% white, no cyan tint) — because the
 * bar is the one element that read as real liquid glass; v1's dark tint
 * overlays (0.35/0.55) on top of the glass killed the material and made
 * cards read as flat semi-transparent hex boxes instead. Tier difference is
 * now minimal: 'surface' mounts NO scrim view at all (zero interference with
 * the glass); 'content' gets only a thin near-black legibility scrim, just
 * enough to hold body text ≥4.5:1 over the starfield backdrop.
 */
export function GlassCard({ children, style, radius = radiusTokens.lg, tier = 'content' }: GlassCardProps) {
  const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  const scrim = TIER_SCRIM[tier];
  const shapeStyle = { borderRadius: radius };

  const overlays = (
    <>
      {scrim !== 'transparent' ? (
        <View pointerEvents="none" style={[styles.tint, shapeStyle, { backgroundColor: scrim }]} />
      ) : null}
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
