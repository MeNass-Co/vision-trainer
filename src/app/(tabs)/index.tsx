import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { CelestialGabor } from '@/components/home/CelestialGabor';
import { AppText, ContextChip, FadeIn, PrimaryButton, Screen, Shimmer } from '@/components/ui';
import { TAB_BAR_CLEARANCE } from '@/components/ui/CustomTabBar';
import { useTodayData } from '@/presenters';
import type { TodayView } from '@/presenters/types';
import { accent, motion, radius, space, text as textTokens, type as typo } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

// week-strip law (VALIDATION.md #10): today = 35pt filled white circle w/ dark
// text; state-cell box height = circle diameter so a plain digit and the
// circle share one flexbox-centered axis (spec row 8) with no pixel math.
// Dot re-measured at the Fable lock: the reference dot is a HOLLOW RING —
// outer Ø 21px/7.0pt, stroke 3px/1.0pt on all four sides, center = pure
// background (target.png days 8 & 11, PIL scanlines) — not a filled disc.
const TODAY_CIRCLE_DIAMETER = 35;
const DOT_DIAMETER = 7;
const DOT_STROKE = 1;

type WeekRowProps = {
  activeIndex?: number;
  weekDays: boolean[];
  weekDates: number[];
  reduceMotion: boolean;
};

function WeekRow({ activeIndex = 3, weekDays, weekDates, reduceMotion }: WeekRowProps) {
  return (
    <View style={styles.weekRow}>
      {DAYS.map((day, index) => {
        const isToday = index === activeIndex;
        // Honest per-day truth: a day is only "completed" if a session actually
        // landed on that calendar day. The app has no per-day schedule concept
        // (no program/recommended-day model exists — see week-strip-diff.md),
        // so "scheduled" future days are not fabricated: future/no-activity days
        // render as plain white digits with no dot, an intentional narrowing of
        // spec row 26 to what our data can honestly say.
        const isCompleted = weekDays[index] ?? false;
        const isPast = index < activeIndex;
        const showDot = isCompleted && !isToday;

        let digitColor: string = textTokens.primary;
        if (isCompleted) {
          digitColor = accent.core;
        } else if (isPast) {
          digitColor = textTokens.faint;
        }

        return (
          <View key={`${day}-${index}`} style={styles.dayCell}>
            <AppText color="primary" variant="micro">
              {day}
            </AppText>
            <View style={styles.stateCell}>
              {isToday ? (
                <TodayCircle digit={weekDates[index]} reduceMotion={reduceMotion} />
              ) : (
                <Text style={[styles.numeral, { color: digitColor }]}>{weekDates[index]}</Text>
              )}
            </View>
            <View style={styles.dotSlot}>{showDot ? <View style={styles.dot} /> : null}</View>
          </View>
        );
      })}
    </View>
  );
}

function TodayCircle({ digit, reduceMotion }: { digit: number; reduceMotion: boolean }) {
  const breathe = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(breathe);
    if (reduceMotion) {
      breathe.value = 0;
      return;
    }
    breathe.value = withRepeat(
      withTiming(1, { duration: motion.timing.breatheMs, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    return () => cancelAnimation(breathe);
  }, [breathe, reduceMotion]);

  const breatheStyle = useAnimatedStyle(() => ({
    opacity: 1 - breathe.value * 0.06,
  }));

  return (
    <Animated.View style={[styles.todayCircle, breatheStyle]}>
      <Text style={styles.todayDigit}>{digit}</Text>
    </Animated.View>
  );
}

export default function TodayScreen() {
  const router = useRouter();
  const reduceMotion = useEffectiveReducedMotion();
  const { data, isLoading } = useTodayData();
  const insets = useSafeAreaInsets();

  return (
    <Screen
      background={<AmbientGradient constellation reduceMotion={reduceMotion} />}
      padded
      // The floating glass tab bar is now a real overlay (position: absolute),
      // not a flex row, so it no longer reserves its own space — the CTA needs
      // explicit clearance to sit above it instead of underneath the glass.
      style={{ paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }}>
      {isLoading ? (
        <LoadingToday />
      ) : (
        <TodayContent data={data} reduceMotion={reduceMotion} router={router} />
      )}
    </Screen>
  );
}

type TodayContentProps = {
  data: TodayView;
  reduceMotion: boolean;
  router: ReturnType<typeof useRouter>;
};

function TodayContent({ data, reduceMotion, router }: TodayContentProps) {
  const navigatingRef = useRef(false);
  const discContrast =
    data.contrastSensitivity > 0 ? Math.min(1, 0.5 + data.contrastSensitivity * 0.22) : 0.32;

  useFocusEffect(
    useCallback(() => {
      navigatingRef.current = false;

      return () => {
        navigatingRef.current = false;
      };
    }, [])
  );

  const startSession = useCallback(() => {
    if (navigatingRef.current) {
      return;
    }

    navigatingRef.current = true;
    router.push('/session' as Href);
  }, [router]);

  return (
    <>
      <FadeIn duration={motion.timing.entranceMs} style={styles.eyebrow}>
        <ContextChip label="Today" />
        {data.streakDays > 0 ? (
          <AppText color="secondary" tabular variant="caption">
            {`${data.streakDays} day streak`}
          </AppText>
        ) : null}
      </FadeIn>
      <View style={styles.spacer}>
        <FadeIn delay={20}>
          <View style={styles.orbScale}>
            <CelestialGabor
              contrast={discContrast}
              progress={data.sessionDoneToday ? 1 : data.streakDays === 0 ? 0.08 : 0.5}
              reduceMotion={reduceMotion}
              resolveOnMount
            />
          </View>
        </FadeIn>
      </View>
      <View style={styles.bottomBlock}>
        <FadeIn>
          <WeekRow
            activeIndex={data.todayIndex}
            reduceMotion={reduceMotion}
            weekDates={data.weekDates}
            weekDays={data.weekDays}
          />
        </FadeIn>
        <FadeIn delay={40} style={styles.titleBlock}>
          <AppText color="primary" variant="hero">
            {data.sessionDoneToday
              ? 'Come back\ntomorrow'
              : data.streakDays === 0
                ? 'Set your\nbaseline'
                : 'Ready when\nyou are'}
          </AppText>
          <View style={styles.sessionMeta}>
            {data.streakDays === 0 && !data.sessionDoneToday ? null : (
              <AppText color="muted" variant="caption">
                {`Next · ${data.nextTargetLabel}`}
              </AppText>
            )}
            <AppText color={data.measurementConfidence.tier === 'needs-retest' ? 'accent' : 'muted'} variant="micro">
              {data.measurementConfidence.label}
            </AppText>
          </View>
        </FadeIn>
        <FadeIn delay={80}>
          <PrimaryButton
            accessibilityLabel={data.sessionDoneToday ? 'Optional practice' : 'Start session'}
            haptic="select"
            label={data.sessionDoneToday ? 'Optional practice' : 'Start session'}
            onPress={startSession}
            style={styles.startCta}
          />
        </FadeIn>
      </View>
    </>
  );
}

function LoadingToday() {
  return (
    <>
      <FadeIn style={styles.eyebrow}>
        <Shimmer height={14} radius={radius.pill} width={48} />
        <Shimmer height={26} radius={radius.pill} width={92} />
      </FadeIn>
      <View style={styles.spacer} />
      <View style={styles.bottomBlock}>
        <FadeIn>
          <Shimmer height={34} radius={radius.pill} width="100%" />
        </FadeIn>
        <FadeIn delay={40} style={styles.loadingTitle}>
          <Shimmer height={40} radius={radius.md} width="100%" />
          <Shimmer height={40} radius={radius.md} style={styles.loadingTitleShort} width="100%" />
        </FadeIn>
        <FadeIn delay={80}>
          <Shimmer height={58} radius={radius.pill} width="100%" />
        </FadeIn>
      </View>
    </>
  );
}

export const styles = StyleSheet.create({
  bottomBlock: {
    gap: space.lg,
    paddingBottom: space.xl,
  },
  dayCell: {
    alignItems: 'center',
    flex: 1,
  },
  // week-strip Fable-lock re-measure: HOLLOW RING, outer Ø 7.0pt, 1.0pt stroke,
  // transparent center; accent.core (the row's one "live" signal, hue-identical
  // to the completed-digit tint — spec rows 15/16, color mapping unchanged).
  dot: {
    borderColor: accent.core,
    borderRadius: DOT_DIAMETER / 2,
    borderWidth: DOT_STROKE,
    height: DOT_DIAMETER,
    width: DOT_DIAMETER,
  },
  // Fixed-height slot below the digit/circle so a dot toggling on/off never
  // shifts layout (spec row 2: the whole strip is a reserved slot). marginTop
  // tuned against a live capture to hit spec row 9's measured 18.5pt digit-
  // bottom-to-dot-top gap (no named token at this exact value).
  dotSlot: {
    alignItems: 'center',
    height: 10,
    justifyContent: 'center',
    marginTop: 5.5,
  },
  eyebrow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingTitle: {
    gap: space.sm,
    width: '60%',
  },
  loadingTitleShort: {
    width: '75%',
  },
  orbScale: {
    transform: [{ scale: 1.08 }],
  },
  sessionMeta: {
    gap: space.xs,
  },
  // CTA law (VALIDATION.md #1): 32pt total edge-to-button margin. Parent Screen
  // already pads space.lg (24pt), so the CTA adds the remaining space.xl − space.lg.
  startCta: {
    marginHorizontal: space.xl - space.lg,
  },
  spacer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.base,
  },
  // screen-header law 6 (gap ramp transfer): title→caption ≈10pt (spec row 30,
  // measured ascender/descender-bbox to bbox), tightened from the previous
  // space.sm(8pt) CSS gap toward the reference's measured 10pt.
  titleBlock: {
    gap: 10,
  },
  // week-strip spec row 21: type.numeral (18pt bold), no dedicated color here —
  // color is assigned per-state at the call site (accent.core / text.faint / text.primary).
  numeral: {
    fontWeight: typo.numeral.fontWeight,
    fontSize: typo.numeral.fontSize,
    letterSpacing: typo.numeral.letterSpacing,
    lineHeight: typo.numeral.lineHeight,
  },
  // Fixed-height box (= circle diameter) so a plain digit and the today-circle
  // share one flexbox-centered vertical axis with no manual pixel math —
  // satisfies spec row 8 ("center all state-cells on one shared row-center,
  // do not top-align") for free.
  stateCell: {
    alignItems: 'center',
    height: TODAY_CIRCLE_DIAMETER,
    justifyContent: 'center',
    // Tuned against a live capture to hit spec row 7's measured 18.7pt
    // letter-bottom-to-digit-top gap (no named token at this exact value).
    marginTop: 4,
  },
  // week-strip spec row 5/17/18: 35pt filled white circle, dark (`text.inverse`)
  // digit inside.
  todayCircle: {
    alignItems: 'center',
    backgroundColor: textTokens.primary,
    borderRadius: TODAY_CIRCLE_DIAMETER / 2,
    height: TODAY_CIRCLE_DIAMETER,
    justifyContent: 'center',
    width: TODAY_CIRCLE_DIAMETER,
  },
  todayDigit: {
    color: textTokens.inverse,
    fontWeight: typo.numeral.fontWeight,
    fontSize: typo.numeral.fontSize,
    letterSpacing: typo.numeral.letterSpacing,
    lineHeight: typo.numeral.lineHeight,
  },
  // Bleeds -space.md (12pt) past the Screen's space.lg (24pt) padding on each
  // side so the row's usable width is 393 − 2×12 = 369pt ≈ 7×52.7pt — the
  // exact equal-center pitch spec row 10 measured. Equal-width flex cells
  // (dayCell: flex 1) then center their content automatically, which is what
  // produces "equal-center, not equal-gap" distribution (spec's own finding)
  // without manual gap math.
  weekRow: {
    flexDirection: 'row',
    marginHorizontal: -space.md,
  },
});
