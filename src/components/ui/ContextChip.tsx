import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { fontWeight, text, type as typo } from '@/theme/tokens';

export type ContextChipProps = {
  label: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Quiet editorial label (orchestrator polish pass) — replaces the old
 * outline-chip family entirely. No box, no border, no fill: just caps type
 * that pairs quietly with a plain caption sitting next to it in the same row
 * (e.g. the "14 day streak" caption on Today). Same component API as before
 * (`label` + `style`) so screens don't need to change how they consume it —
 * only `style` now targets text, not a box.
 */
export function ContextChip({ label, style }: ContextChipProps) {
  return <Text style={[styles.label, style]}>{label.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...typo.micro,
    color: text.secondary,
    fontWeight: fontWeight.semibold,
  },
});
