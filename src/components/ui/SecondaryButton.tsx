import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { motion, radius, surface } from '@/theme/tokens';

export type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  haptic?: PressableScaleProps['haptic'];
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Secondary-button law (VALIDATION.md #2): geometry is inherited wholesale from
// PrimaryButton — 48pt height, radius.pill stadium, full-bleed width (same
// margins as the primary it sits under), identical label type (CTA law #1: one
// label voice for every full-width button). Waking Up contributes only the
// *treatment*: a truly transparent interior (no fill token), a
// surface.hairlineStrong 1.5pt border, and a space.md gap below the primary —
// the gap is the call site's job (siblings share a `gap` container), not this
// component's, so it stays reusable standalone (e.g. calibration's lone "Done").
export function SecondaryButton({
  label,
  onPress,
  haptic = 'select',
  accessibilityLabel,
  disabled = false,
  style,
}: SecondaryButtonProps) {
  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      haptic={haptic}
      onPress={onPress}
      scaleTo={motion.pressScale}
      style={[styles.base, style]}>
      <AppText color="primary" variant="heading">
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: surface.hairlineStrong,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
});
