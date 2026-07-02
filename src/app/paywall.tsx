import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { AppText, FadeIn, GaborMark, GlassSurface, PressableScale, PrimaryButton, Screen } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { material, radius, space, surface } from '@/theme/tokens';
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
    <Screen scroll padded background={<AmbientGradient constellation reduceMotion={reduceMotion} />}>
      <View style={styles.screen}>
        <FadeIn duration={360} style={styles.hero}>
          <GaborMark quiet size={168} style={styles.gabor} />
          <AppText style={styles.kicker} uppercase color="primary" variant="micro">
            Early access
          </AppText>
          <AppText style={styles.title} variant="title">
            Free while we finish the instrument.
          </AppText>
          <AppText color="secondary" style={styles.subtitle} variant="body">
            Build a baseline, test the routine, and keep your readings private on this device.
          </AppText>
        </FadeIn>

        <FadeIn delay={80} style={styles.actions}>
          <PrimaryButton label="Start training" onPress={startTraining} />
          <PressableScale accessibilityRole="button" onPress={maybeLater} style={styles.secondaryAction}>
            <AppText color="primary" variant="caption">
              Maybe later
            </AppText>
          </PressableScale>
          <AppText color="secondary" style={styles.earlyAccessNote} variant="caption">
            Free while in Early Access. No subscription is active.
          </AppText>
        </FadeIn>

        <FadeIn delay={140}>
          <GlassSurface radius={material.radius} style={styles.plan}>
            <View style={styles.planHeader}>
              <View>
                <AppText color="primary" variant="heading">
                  Vision Trainer
                </AppText>
                <AppText color="muted" variant="caption">
                  Early builds. No payment today.
                </AppText>
              </View>
              <View style={styles.planBadge}>
                <AppText color="accent" style={styles.planBadgeText} variant="micro">
                  FREE
                </AppText>
              </View>
            </View>

            <View style={styles.benefits}>
              {BENEFITS.map((benefit, index) => (
                <View key={benefit}>
                  {index > 0 ? <View style={styles.benefitRule} /> : null}
                  <View style={styles.benefitRow}>
                    <View style={styles.featureGlyph}>
                      <View style={styles.dot} />
                    </View>
                    <AppText color="secondary" style={styles.benefitText} variant="caption">
                      {benefit}
                    </AppText>
                  </View>
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 11,
  },
  benefitRule: {
    backgroundColor: surface.hairline,
    height: StyleSheet.hairlineWidth,
    marginLeft: 42,
  },
  benefitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.md,
    minHeight: 56,
    paddingVertical: space.sm,
  },
  benefitText: {
    flex: 1,
    lineHeight: 20,
  },
  benefits: {
    gap: 0,
  },
  dot: {
    backgroundColor: 'rgba(91,233,236,0.86)',
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  earlyAccessNote: {
    textAlign: 'center',
  },
  featureGlyph: {
    alignItems: 'center',
    backgroundColor: 'rgba(51, 210, 214, 0.10)',
    borderColor: 'rgba(91, 233, 236, 0.18)',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  gabor: {
    marginBottom: -space.sm,
  },
  hero: {
    alignItems: 'center',
    gap: space.md,
    paddingTop: space.lg,
  },
  kicker: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    letterSpacing: 1.2,
    overflow: 'hidden',
    paddingHorizontal: space.md,
    paddingVertical: 5,
  },
  plan: {
    gap: space.base,
    padding: 18,
  },
  planBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(51, 210, 214, 0.10)',
    borderColor: 'rgba(91, 233, 236, 0.30)',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  planBadgeText: {
    letterSpacing: 0.8,
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
    gap: space.lg,
    justifyContent: 'space-between',
    minHeight: 700,
    paddingBottom: space.xl,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: space.md,
  },
  subtitle: {
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
});
