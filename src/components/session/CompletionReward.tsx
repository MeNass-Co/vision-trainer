import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState, type ComponentType, type ComponentProps } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { CelestialGabor } from '@/components/home/CelestialGabor';
import { AppText, Bloom, GlassCard, PressableScale } from '@/components/ui';
import { t, tPlural } from '@/i18n';
import { useTodayData } from '@/presenters';
import { haptics } from '@/theme/haptics';
import { easings } from '@/theme/motion';
import {
  ACCENT,
  ACCENT_CORE,
  ACCENT_GLOW,
  material,
  motion,
  radius,
  space,
  surface,
  tabularFigures,
  text,
  type as typeScale,
} from '@/theme/tokens';

export type CompletionRewardProps = {
  accuracyTarget: number;
  actionLabel?: string;
  correctCount: number;
  total: number;
  onDone: () => void;
  reduceMotion?: boolean;
  subtitle?: string;
};

type CountUpTextInputProps = ComponentProps<typeof TextInput> & {
  animatedProps: Partial<{ text: string }>;
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput) as unknown as ComponentType<
  CountUpTextInputProps
>;
// Bloom reads as a soft halo around the ring, not a screen-filling wash —
// contained within the card like the inter-block score's Bloom treatment.
const BLOOM_INSET = 44;
// Small-emblem technique borrowed from ProgressEmptySky's dormant orb: reserve
// the true intrinsic layout box, then transform:scale it down so it renders at
// EMBLEM_SIZE — a badge, never a text backdrop (owner verdict on the disaster).
const CELESTIAL_NATIVE_SIZE = 300;
const EMBLEM_SIZE = 64;

export function CompletionReward({
  accuracyTarget,
  actionLabel,
  correctCount,
  total,
  onDone,
  reduceMotion = false,
  subtitle,
}: CompletionRewardProps) {
  // Defaults resolved via t() at render time (not destructuring literals) so
  // they follow the active locale — session.tsx normally passes both anyway.
  const resolvedActionLabel = actionLabel ?? t('session.completion.done');
  const resolvedSubtitle = subtitle ?? t('session.completion.subtitleDefault');
  const today = useTodayData();
  const streakNow = today.data.streakDays;
  const streakWasCounted = today.data.sessionDoneToday;
  const streakFrom = Math.max(streakNow - 1, 0);
  const showStreak = streakNow > 0;
  // Only celebrate the +1 once today's session is actually recorded — recordSessionResult
  // is fired without awaiting, so streakNow can lead sessionDoneToday for a frame. Gate the
  // count-up and milestone haptic on the live recorded state, never the optimistic streak.
  const streakIncrements = streakWasCounted && streakNow > streakFrom;
  const didSettleRef = useRef(false);
  const streakTargetRef = useRef(streakNow);
  // The CTA spends ~2.3s at opacity 0; while invisible it must not be tappable,
  // or a blind tap dismisses the reward the user never saw.
  const [ctaInteractive, setCtaInteractive] = useState(reduceMotion);
  // Reanimated writes the count-up text natively, so the TextInput never
  // relayouts — its width must be fixed up front. A per-digit constant drifted
  // under SF Pro's true tabular advance (~0.62em) and clipped "100" to "10";
  // instead an invisible Text twin renders the final string and reports the
  // exact width to use.
  const [accuracyWidth, setAccuracyWidth] = useState(0);
  const [streakWidth, setStreakWidth] = useState(0);
  // SF Symbol animations (THE GREAT NATIVE WAVE): the "Session complete" badge
  // plays a one-shot bounce as it lands with the card. `animationSpec` starts
  // undefined (no effect) and flips to a spec object once the card has faded
  // in — that prop transition is what fires the native bounce, same trigger
  // technique as the onboarding goal card's select bounce.
  const [badgeBounce, setBadgeBounce] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const skyIgnite = useSharedValue(0);
  const bloomOpacity = useSharedValue(0);
  const bloomScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(-40);
  const accuracy = useSharedValue(0);
  const streak = useSharedValue(streakFrom);
  const streakRowOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(12);
  const subtitleOpacity = useSharedValue(0);

  const handleNumberSettle = useCallback(() => {
    if (didSettleRef.current) return;

    didSettleRef.current = true;
    haptics.numberSettle();
  }, []);

  useEffect(() => {
    streakTargetRef.current = streakNow;
  }, [streakNow, streakWasCounted]);

  useEffect(() => {
    if (reduceMotion) return;

    // Fires alongside `cardOpacity`'s own 360ms delay (see the effect below) —
    // the badge bounces in right as the card itself lands.
    const timeout = setTimeout(() => setBadgeBounce(true), 360);
    return () => clearTimeout(timeout);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      backdropOpacity.value = 0.82;
      skyIgnite.value = 1;
      bloomOpacity.value = 0.5;
      bloomScale.value = 1;
      cardOpacity.value = 1;
      cardTranslateY.value = 0;
      accuracy.value = accuracyTarget;
      streak.value = streakTargetRef.current;
      streakRowOpacity.value = 1;
      ctaOpacity.value = 1;
      ctaTranslateY.value = 0;
      subtitleOpacity.value = 1;
      setCtaInteractive(true);
      return;
    }

    backdropOpacity.value = withTiming(0.82, { duration: 360 });
    skyIgnite.value = withDelay(60, withTiming(1, { duration: 460, easing: easings.out }));
    bloomOpacity.value = withSequence(
      withTiming(0.85, { duration: 300 }),
      withTiming(0.5, { duration: 300 })
    );
    bloomScale.value = withSpring(1, motion.spring.reward);
    cardOpacity.value = withDelay(360, withTiming(1, { duration: 200 }));
    cardTranslateY.value = withSpring(0, motion.spring.reward);
    accuracy.value = withDelay(
      520,
      withTiming(
        accuracyTarget,
        { duration: motion.timing.countUpRewardMs, easing: easings.out },
        (finished) => {
          if (finished) runOnJS(handleNumberSettle)();
        }
      )
    );
    streakRowOpacity.value = withDelay(1500, withTiming(1, { duration: 280, easing: easings.out }));
    ctaOpacity.value = withDelay(
      2300,
      withTiming(1, { duration: 280, easing: easings.out }, (finished) => {
        if (finished) runOnJS(setCtaInteractive)(true);
      })
    );
    ctaTranslateY.value = withDelay(2300, withSpring(0, motion.spring.snap));
    subtitleOpacity.value = withDelay(2300, withTiming(1, { duration: 280, easing: easings.out }));
  }, [
    accuracy,
    accuracyTarget,
    backdropOpacity,
    bloomOpacity,
    bloomScale,
    cardOpacity,
    cardTranslateY,
    ctaOpacity,
    ctaTranslateY,
    handleNumberSettle,
    reduceMotion,
    skyIgnite,
    streak,
    streakRowOpacity,
    subtitleOpacity,
  ]);

  useEffect(() => {
    if (reduceMotion) {
      streak.value = streakTargetRef.current;
      return;
    }

    const timeout = setTimeout(() => {
      const target = streakTargetRef.current;

      if (target > streakFrom) {
        streak.value = streakFrom;
        streak.value = withTiming(
          target,
          { duration: motion.timing.countUpProgressMs, easing: easings.out },
          (finished) => {
            if (finished && streakIncrements) runOnJS(haptics.milestone)();
          }
        );
      } else {
        streak.value = target;
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [
    reduceMotion,
    streak,
    streakFrom,
    streakIncrements,
  ]);

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const skyStyle = useAnimatedStyle(() => ({
    opacity: skyIgnite.value,
  }));
  const bloomStyle = useAnimatedStyle(() => ({
    opacity: bloomOpacity.value,
    transform: [{ scale: bloomScale.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));
  const accuracyProps = useAnimatedProps(() => ({
    text: `${Math.round(accuracy.value)}`,
  }));
  const streakProps = useAnimatedProps(() => ({
    text: `${Math.round(streak.value)}`,
  }));
  const streakRowStyle = useAnimatedStyle(() => ({
    opacity: streakRowOpacity.value,
    transform: [{ translateY: 8 * (1 - streakRowOpacity.value) }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={styles.backdrop}>
      <Animated.View pointerEvents="none" style={[styles.backdropFill, backdropAnimStyle]} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, skyStyle]}>
        <AmbientGradient constellation reduceMotion={reduceMotion} />
      </Animated.View>
      <Animated.View style={cardStyle}>
        <GlassCard radius={material.radius} style={styles.card} tier="content">
          {/* Celestial identity as a small emblem only (never a text backdrop,
              same scaled-orb technique as ProgressEmptySky's dormant-state icon) —
              the grating must never sit behind legible text. */}
          {/* Flexbox-centered native-size child scaled about its own center —
              the previous top-left-anchored transform drifted the orb off-center
              over the caps row (owner screenshot IMG_6015). */}
          <View pointerEvents="none" style={styles.emblemBox}>
            <View style={styles.emblemInner}>
              <CelestialGabor contrast={0.34} progress={accuracyTarget / 100} reduceMotion={reduceMotion} resolveOnMount />
            </View>
          </View>
          <View style={styles.completeRow}>
            <SymbolView
              animationSpec={badgeBounce ? { effect: { type: 'bounce', wholeSymbol: true } } : undefined}
              name="checkmark.seal.fill"
              resizeMode="scaleAspectFit"
              size={13}
              style={styles.completeGlyph}
              tintColor={ACCENT_CORE}
              type="monochrome"
              weight="medium"
            />
            <AppText color="muted" uppercase variant="micro">
              {t('session.completion.badge')}
            </AppText>
          </View>
          <View style={styles.scoreWrap}>
            <Animated.View pointerEvents="none" style={[styles.bloom, bloomStyle]}>
              <Bloom color={ACCENT_GLOW} />
            </Animated.View>
            {/* No ring (owner verdict: the number outgrew it and it shouldn't
                exist) — the score is one centered text lockup: digits + %
                sharing the same baseline, soft bloom halo behind. */}
            <View
              accessible
              accessibilityLabel={t('session.completion.accuracyA11y', { value: accuracyTarget })}
              style={styles.accuracy}>
              <Text
                onLayout={(event) =>
                  setAccuracyWidth(Math.ceil(event.nativeEvent.layout.width) + 2)
                }
                style={[styles.accuracyNumber, styles.ghost]}>
                {accuracyTarget}
              </Text>
              <AnimatedTextInput
                animatedProps={accuracyProps}
                defaultValue="0"
                editable={false}
                style={[
                  styles.accuracyNumber,
                  { width: accuracyWidth || String(accuracyTarget).length * 46 },
                ]}
                underlineColorAndroid="transparent"
              />
              <AppText style={styles.percent} tabular variant="title">
                %
              </AppText>
            </View>
          </View>
          <AppText color="secondary" style={styles.correctLine} tabular variant="caption">
            {t('session.completion.correctLine', { correct: correctCount, total })}
          </AppText>
          {showStreak ? (
            <Animated.View
              accessible
              accessibilityLabel={tPlural('today.streak', streakNow, { count: streakNow })}
              style={[styles.streakRow, streakRowStyle]}>
              <Text
                onLayout={(event) =>
                  setStreakWidth(Math.ceil(event.nativeEvent.layout.width) + 2)
                }
                style={[styles.streakNumber, styles.ghost]}>
                {streakNow}
              </Text>
              <AnimatedTextInput
                animatedProps={streakProps}
                defaultValue={`${streakFrom}`}
                editable={false}
                style={[
                  styles.streakNumber,
                  { width: streakWidth || String(streakNow).length * 24 },
                ]}
                underlineColorAndroid="transparent"
              />
              <AppText color="secondary" style={styles.streakLabel} variant="caption">
                {tPlural('session.completion.streakLabel', streakNow)}
              </AppText>
            </Animated.View>
          ) : null}
          <Animated.View pointerEvents="none" style={[styles.subtitleWrap, subtitleStyle]}>
            <AppText color="muted" variant="caption">
              {resolvedSubtitle}
            </AppText>
          </Animated.View>
          <Animated.View pointerEvents={ctaInteractive ? 'auto' : 'none'} style={ctaStyle}>
            <PressableScale
              accessibilityLabel={t('session.completion.finishA11y')}
              accessibilityRole="button"
              onPress={onDone}
              style={styles.action}>
              <AppText color="inverse" variant="caption">
                {resolvedActionLabel}
              </AppText>
            </PressableScale>
          </Animated.View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  accuracy: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  accuracyNumber: {
    color: text.primary,
    fontWeight: typeScale.display.fontWeight,
    fontSize: 68,
    fontVariant: [...tabularFigures.fontVariant],
    height: 82,
    letterSpacing: 0,
    lineHeight: 82,
    padding: 0,
    textAlign: 'right',
  },
  action: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderColor: ACCENT_GLOW,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: space.lg,
    minWidth: 112,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  backdrop: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: space.xl,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  backdropFill: {
    backgroundColor: surface.base,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bloom: {
    bottom: -BLOOM_INSET,
    left: -BLOOM_INSET,
    position: 'absolute',
    right: -BLOOM_INSET,
    top: -BLOOM_INSET,
  },
  card: {
    alignItems: 'center',
    minWidth: 292,
    paddingHorizontal: space.xl,
    paddingVertical: space.xl,
  },
  completeGlyph: {
    height: 13,
    width: 13,
  },
  completeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xs,
  },
  correctLine: {
    marginTop: -2,
  },
  emblemBox: {
    alignItems: 'center',
    height: EMBLEM_SIZE,
    justifyContent: 'center',
    marginBottom: space.sm,
    width: EMBLEM_SIZE,
  },
  emblemInner: {
    height: CELESTIAL_NATIVE_SIZE,
    transform: [{ scale: EMBLEM_SIZE / CELESTIAL_NATIVE_SIZE }],
    width: CELESTIAL_NATIVE_SIZE,
  },
  ghost: {
    opacity: 0,
    position: 'absolute',
  },
  percent: {
    color: text.primary,
    fontWeight: typeScale.title.fontWeight,
    fontSize: 28,
    lineHeight: 34,
    marginLeft: 4,
  },
  scoreWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.lg,
    paddingVertical: space.sm,
  },
  streakLabel: {
    marginLeft: 6,
  },
  streakNumber: {
    color: text.secondary,
    fontWeight: typeScale.title.fontWeight,
    fontSize: 34,
    fontVariant: [...tabularFigures.fontVariant],
    height: 40,
    letterSpacing: 0,
    lineHeight: 40,
    padding: 0,
    textAlign: 'right',
  },
  streakRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: space.md,
  },
  subtitleWrap: {
    alignItems: 'center',
    marginTop: space.lg,
  },
});
