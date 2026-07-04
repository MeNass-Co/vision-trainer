import { type Href, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalibrationCard } from '@/components/calibration/CalibrationCard';
import { AmbientGradient } from '@/components/home/AmbientGradient';
import { FadeIn, Screen, SheetCloseButton } from '@/components/ui';
import { t } from '@/i18n';
import { space } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

export default function CalibrationScreen() {
  const router = useRouter();
  const reduceMotion = useEffectiveReducedMotion();
  const insets = useSafeAreaInsets();
  // Screen (non-scroll) sets content top padding to `insets.top + space.lg` — its
  // shared header rhythm. The sheet's close chip must instead sit at `space.base`
  // from the SHEET's own top edge (modal-sheet spec row 5), so pull it up locally
  // by the delta and push the following body down by the same amount so it
  // doesn't visually jump into the status area.
  const chipTopOffset = insets.top + space.lg - space.base;
  const exitCalibration = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)' as Href);
  };

  return (
    <Screen
      padded
      sheet
      warm
      background={<AmbientGradient constellation reduceMotion={reduceMotion} />}>
      <View
        style={[
          styles.topBar,
          { marginBottom: space.md + chipTopOffset, marginTop: -chipTopOffset },
        ]}>
        <SheetCloseButton onPress={exitCalibration} />
      </View>
      <FadeIn duration={420} style={styles.body}>
        <CalibrationCard confirmLabel={t('calibration.done')} onComplete={exitCalibration} />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.lg,
  },
  topBar: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // Screen's own horizontal padding is space.lg (24); the sheet's close chip
    // sits at space.base (16) from the sheet edge (modal-sheet spec rows 5-6).
    // Vertical marginTop/marginBottom are set inline (see chipTopOffset above) —
    // they depend on the safe-area inset, which isn't known at StyleSheet.create time.
    marginRight: space.base - space.lg,
  },
});
