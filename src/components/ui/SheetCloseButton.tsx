import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import { Platform, StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { material, radius, text } from '@/theme/tokens';

// modal-sheet spec (design/references/modal-sheet/spec.md): rows 4-8, 20, 22.
const CHIP_SIZE = 44;
const ICON_SIZE = 17;
// Chrome-family rim consistency (CustomTabBar's `styles.bar`/`styles.pill`,
// scaled down): a flat, uniform 1pt border — same brightness all the way
// around the circle — not a directional top-only highlight. Owner correction
// (round 2): the first pass's top-left gradient read as a light source; a
// real UIGlassEffect rim is symmetric.
const RIM_COLOR = 'rgba(255,255,255,0.16)';

export type SheetCloseButtonProps = {
  onPress: () => void;
};

/**
 * Filled circular close chip for native modal sheets (calibration, science).
 * ONE-material pass: Tier 1 'chrome' glass — the same bare GlassView('regular')
 * primitive CustomTabBar ships, barely tinted (no overlay token, unlike the
 * Tier 2/3 GlassCard family). Falls back to the old flat `fillChip` where
 * Liquid Glass isn't available.
 */
export function SheetCloseButton({ onPress }: SheetCloseButtonProps) {
  const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  const Chrome = liquidGlass ? GlassView : View;
  const chromeProps = liquidGlass
    ? { colorScheme: 'dark' as const, glassEffectStyle: 'regular' as const }
    : {};

  return (
    <PressableScale
      accessibilityLabel="Close"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={styles.chipWrap}>
      <Chrome {...chromeProps} style={[styles.chip, !liquidGlass && styles.chipFallbackFill]}>
        {/* Taste-iteration-3 (SF Symbols everywhere): one icon language app-wide,
            same SymbolView primitive the tab bar already uses. */}
        <SymbolView
          name="xmark"
          resizeMode="scaleAspectFit"
          size={ICON_SIZE}
          style={styles.iconGlyph}
          tintColor={text.primary}
          type="monochrome"
          weight="semibold"
        />
      </Chrome>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderColor: RIM_COLOR,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: CHIP_SIZE,
    justifyContent: 'center',
    overflow: 'hidden',
    width: CHIP_SIZE,
  },
  chipFallbackFill: {
    backgroundColor: material.fillChip,
  },
  chipWrap: {
    height: CHIP_SIZE,
    width: CHIP_SIZE,
  },
  iconGlyph: {
    height: ICON_SIZE,
    width: ICON_SIZE,
  },
});
