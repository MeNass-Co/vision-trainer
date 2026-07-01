import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CalibrationCard } from '@/components/calibration/CalibrationCard';
import { AmbientGradient } from '@/components/home/AmbientGradient';
import { FadeIn, PressableScale, Screen } from '@/components/ui';
import { radius, space, surface, text } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

export default function CalibrationScreen() {
  const router = useRouter();
  const reduceMotion = useEffectiveReducedMotion();

  return (
    <Screen padded warm background={<AmbientGradient constellation reduceMotion={reduceMotion} />}>
      <View style={styles.topBar}>
        <PressableScale
          accessibilityLabel="Close"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.close}>
          <Svg height={14} width={14}>
            <Path
              d="M2 2L12 12M12 2L2 12"
              stroke={text.muted}
              strokeLinecap="round"
              strokeWidth={1.4}
            />
          </Svg>
        </PressableScale>
      </View>
      <FadeIn duration={420} style={styles.body}>
        <CalibrationCard confirmLabel="Done" onComplete={() => router.back()} />
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
  close: {
    alignItems: 'center',
    borderColor: surface.hairline,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  topBar: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: space.md,
  },
});
