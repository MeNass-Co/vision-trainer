import { SymbolView } from 'expo-symbols';
import { StyleSheet } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { material, radius, text } from '@/theme/tokens';

// modal-sheet spec (design/references/modal-sheet/spec.md): rows 4-8, 20, 22.
const CHIP_SIZE = 44;
const ICON_SIZE = 17;

export type SheetCloseButtonProps = {
  onPress: () => void;
};

/** Filled circular close chip for native modal sheets (calibration, science). */
export function SheetCloseButton({ onPress }: SheetCloseButtonProps) {
  return (
    <PressableScale
      accessibilityLabel="Close"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={styles.chip}>
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
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: material.fillChip,
    borderRadius: radius.pill,
    height: CHIP_SIZE,
    justifyContent: 'center',
    width: CHIP_SIZE,
  },
  iconGlyph: {
    height: ICON_SIZE,
    width: ICON_SIZE,
  },
});
