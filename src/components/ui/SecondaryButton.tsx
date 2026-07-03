import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { motion, radius } from '@/theme/tokens';

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
// label voice for every full-width button). Owner order (glass-unification
// pass 2): the flat transparent-interior + hairlineStrong border treatment is
// gone — this is now a bare GlassView('regular'), no tintColor (unlike
// PrimaryButton), same uniform perimeter rim family as the tab bar/CTA but at
// 14% (a visibly quieter second voice next to the tinted primary). The gap
// below the primary stays the call site's job, not this component's, so it
// stays reusable standalone (e.g. calibration's lone "Done").
const RIM_COLOR = 'rgba(255,255,255,0.14)';

export function SecondaryButton({
  label,
  onPress,
  haptic = 'select',
  accessibilityLabel,
  disabled = false,
  style,
}: SecondaryButtonProps) {
  const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      haptic={haptic}
      onPress={onPress}
      scaleTo={motion.pressScale}
      style={[styles.base, style]}>
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
      <AppText color="primary" style={styles.label} variant="heading">
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: RIM_COLOR,
    borderRadius: radius.pill,
    // geometry unchanged from the pre-glass treatment — only the rim color/
    // alpha and the fill material changed.
    borderWidth: 1.5,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  glassFill: {
    ...StyleSheet.absoluteFillObject,
  },
  // owner order: white label on the bare glass (current geometry — heading
  // variant/size — kept, only the color is now literal white rather than the
  // near-white text.primary token).
  label: {
    color: '#FFFFFF',
  },
});
