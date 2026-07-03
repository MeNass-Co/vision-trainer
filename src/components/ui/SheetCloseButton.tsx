import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { PressableScale } from '@/components/ui/PressableScale';
import { material, radius, text } from '@/theme/tokens';

// modal-sheet spec (design/references/modal-sheet/spec.md): rows 4-8, 20, 22.
const CHIP_SIZE = 44;
const ICON_SIZE = 17;
const ICON_STROKE = 2;

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
      <Svg height={ICON_SIZE} width={ICON_SIZE}>
        <Path
          d="M2.5 2.5L14.5 14.5M14.5 2.5L2.5 14.5"
          stroke={text.primary}
          strokeLinecap="round"
          strokeWidth={ICON_STROKE}
        />
      </Svg>
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
});
