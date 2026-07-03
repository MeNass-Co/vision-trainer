import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { fontWeight, hairline, material, radius, space, surface, text, type as typo } from '@/theme/tokens';

export type ContextChipProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * screen-header spec (law 6, outline-chip family) — flat fill, no glass/blur.
 * - fill: `#171718` → our `surface.raised` remap (spec row 7)
 * - border: `material.hairlineOutline` (34% white) at `hairline.px1` (spec rows 8-9)
 * - radius: `radius.xs` (spec row 2)
 * - height is LOCKED to a fixed 20pt, not `lineHeight + 2×padding` — the reference
 *   chip is built from cap-height, not full line-height (spec row 35 note); using
 *   `type.micro.lineHeight` (15) + padding would overshoot the target by ~50%.
 * - type: `type.micro` with a bold override + tightened tracking (spec rows 14-16,
 *   19 — the reference reads bold with a tighter track than our default micro 1.4).
 */
export function ContextChip({ label, style }: ContextChipProps) {
  return (
    <View style={[styles.chip, style]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: surface.raised,
    borderColor: material.hairlineOutline,
    borderRadius: radius.xs,
    borderWidth: hairline.px1,
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  label: {
    ...typo.micro,
    color: text.primary,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
});
