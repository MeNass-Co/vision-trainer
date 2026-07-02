import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { AppText, Bloom, FadeIn, GlassSurface, PressableScale, PrimaryButton, Screen } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { ACCENT_GLOW, material, radius, space, surface } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

const BENEFITS = [
  'Adaptive sessions adjusted to your readings',
  'Progress graphs with confidence and retest states',
  'Private by design. Your readings stay on this device.',
] as const;

export default function PaywallScreen() {
  const router = useRouter();
  const reduceMotion = useEffectiveReducedMotion();

  // Onboarding completion is persisted here, once the paywall has actually
  // mounted: flipping it inside onboarding's completion handler raced the root
  // route gate (segments still read 'onboarding' when the flag flips, so the
  // gate's replace toward the tabs stomped the in-flight replace to this
  // screen). Re-entry from Settings makes this a no-op rewrite.
  useEffect(() => {
    useAppStore.getState().updateSetting('onboardingComplete', true);
  }, []);

  // Early access: no purchase can occur yet, so no prices and no subscription
  // claims are shown. Membership state is still recorded for the future gate.
  const startTraining = () => {
    const store = useAppStore.getState();
    store.updateSetting('subscriptionStatus', 'trialing');
    store.updateSetting('trialStartedAt', new Date().toISOString());
    router.replace('/(tabs)' as Href);
  };

  const maybeLater = () => {
    useAppStore.getState().updateSetting('subscriptionStatus', 'free');
    router.replace('/(tabs)' as Href);
  };

  return (
    <Screen padded background={<AmbientGradient constellation reduceMotion={reduceMotion} />}>
      <View style={styles.screen}>
        <FadeIn duration={360} style={styles.hero}>
          <View style={styles.glow}>
            <Bloom color={ACCENT_GLOW} opacity={0.7} rx="68%" ry="46%" />
          </View>
          <AppText style={styles.kicker} uppercase color="muted" variant="micro">
            Early access
          </AppText>
          <AppText style={styles.title} variant="title">
            Train your vision with adaptive 5-minute sessions.
          </AppText>
          <AppText color="secondary" style={styles.subtitle} variant="body">
            Your first week helps you understand your baseline and see whether the routine fits.
            Real change takes consistency.
          </AppText>
        </FadeIn>

        <FadeIn delay={80}>
          <GlassSurface radius={material.radius} style={styles.plan}>
            <View style={styles.planHeader}>
              <View>
                <AppText color="primary" variant="heading">
                  Vision Trainer
                </AppText>
                <AppText color="muted" variant="caption">
                  Everything included during early access.
                </AppText>
              </View>
            </View>

            <View style={styles.benefits}>
              {BENEFITS.map((benefit) => (
                <View key={benefit} style={styles.benefitRow}>
                  <View style={styles.dot} />
                  <AppText color="secondary" style={styles.benefitText} variant="caption">
                    {benefit}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.practiceNote}>
              <View style={styles.practiceDot} />
              <AppText color="muted" style={styles.practiceText} variant="caption">
                Built for practice, not promises. Readings only track this routine.
              </AppText>
            </View>
          </GlassSurface>
        </FadeIn>

        <FadeIn delay={160} style={styles.actions}>
          <PrimaryButton label="Start training" onPress={startTraining} />
          <PressableScale accessibilityRole="button" onPress={maybeLater} style={styles.secondaryAction}>
            <AppText color="secondary" variant="caption">
              Maybe later
            </AppText>
          </PressableScale>
          <AppText color="muted" style={styles.earlyAccessNote} variant="micro">
            Free while in early access.
          </AppText>
        </FadeIn>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: space.md,
  },
  benefitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.sm,
  },
  benefitText: {
    flex: 1,
    lineHeight: 20,
  },
  benefits: {
    gap: space.md,
  },
  dot: {
    backgroundColor: 'rgba(91,233,236,0.86)',
    borderRadius: radius.pill,
    height: 7,
    width: 7,
  },
  earlyAccessNote: {
    textAlign: 'center',
  },
  glow: {
    height: 180,
    position: 'absolute',
    top: -42,
    width: 220,
  },
  hero: {
    alignItems: 'center',
    gap: space.md,
    paddingTop: space.xxl,
  },
  kicker: {
    letterSpacing: 1.8,
  },
  plan: {
    gap: space.lg,
    padding: space.lg,
  },
  planHeader: {
    alignItems: 'center',
    borderBottomColor: surface.hairline,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: space.md,
  },
  practiceDot: {
    backgroundColor: 'rgba(91,233,236,0.82)',
    borderRadius: radius.pill,
    height: 5,
    marginTop: 7,
    width: 5,
  },
  practiceNote: {
    alignItems: 'flex-start',
    borderTopColor: surface.hairline,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: space.sm,
    paddingTop: space.md,
  },
  practiceText: {
    flex: 1,
    lineHeight: 18,
  },
  screen: {
    flex: 1,
    gap: space.xl,
    justifyContent: 'space-between',
    paddingBottom: space.xl,
  },
  secondaryAction: {
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingVertical: space.sm,
  },
  subtitle: {
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
});
