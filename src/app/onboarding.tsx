import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { CalibrationCard } from '@/components/calibration/CalibrationCard';
import { AmbientGradient } from '@/components/home/AmbientGradient';
import { BreathingOrb } from '@/components/onboarding/BreathingOrb';
import { StepReveal } from '@/components/onboarding/StepReveal';
import { AppText, FadeIn, PressableScale, PrimaryButton, Screen } from '@/components/ui';
import { notificationService } from '@/services/notifications';
import { useAppStore } from '@/store/useAppStore';
import { ACCENT, ACCENT_GLOW, material, motion, radius, space, surface, text, type } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';
import type { GoalType } from '@/types';

const BASE_ORB = 180;
const REMINDER_HOUR = 19;
const REMINDER_MINUTE = 0;

const STEPS = [
  { id: 'welcome', buttonLabel: 'Begin' },
  { id: 'science', buttonLabel: 'Continue' },
  { id: 'vision', buttonLabel: 'Continue' },
  { id: 'accent', buttonLabel: 'Got it' },
  { id: 'reminders', buttonLabel: 'Enable reminders' },
  { id: 'calibration', buttonLabel: '' },
  { id: 'ready', buttonLabel: 'Start training' },
] as const;

const GOAL_OPTIONS: { value: GoalType; label: string; detail: string }[] = [
  { value: 'distance', label: 'Distance clarity', detail: 'Sharper contrast at farther targets.' },
  { value: 'near', label: 'Near work', detail: 'Comfort for reading and close focus.' },
  { value: 'sports', label: 'Fast reactions', detail: 'Faster visual pickup and motion decisions.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const reduceMotion = useEffectiveReducedMotion();
  const { width } = useWindowDimensions();
  const viewportWidth = Platform.OS === 'web' && typeof globalThis.innerWidth === 'number' ? globalThis.innerWidth : width;
  const webContentWidth = Platform.OS === 'web' ? Math.max(0, viewportWidth - space.lg * 2) : undefined;
  const [step, setStep] = useState(0);
  const currentStep = STEPS[step];
  const [selectedGoal, setSelectedGoal] = useState<GoalType>(() => {
    const storedGoal = useAppStore.getState().settings.visionGoal;
    return storedGoal === 'unspecified' ? 'distance' : storedGoal;
  });
  // The reminders step only records intent; scheduling and persistence run at
  // completion, so killing the app mid-flow leaves zero scheduled notifications.
  const [remindersIntent, setRemindersIntent] = useState(false);
  const [remindersBlocked, setRemindersBlocked] = useState(false);
  const reminderRequestInFlightRef = useRef(false);
  const blockedAdvancePendingRef = useRef(false);

  const advance = () => {
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handleEnableReminders = async () => {
    if (reminderRequestInFlightRef.current || blockedAdvancePendingRef.current) return;

    reminderRequestInFlightRef.current = true;
    try {
      const permission = await notificationService.requestRemindersPermission();
      if (permission.granted) {
        setRemindersIntent(true);
        advance();
        return;
      }
      if (!permission.canAskAgain) {
        // Permanently denied: show a brief notice, then continue without reminders.
        blockedAdvancePendingRef.current = true;
        setRemindersBlocked(true);
        setTimeout(() => {
          blockedAdvancePendingRef.current = false;
          advance();
        }, 1400);
        return;
      }
      advance();
    } catch {
      // Permission request failed — continue without reminders, never strand the user.
      advance();
    } finally {
      reminderRequestInFlightRef.current = false;
    }
  };

  const handleCalibration = () => {
    advance();
  };

  const handleGoalContinue = () => {
    useAppStore.getState().updateSetting('visionGoal', selectedGoal);
    advance();
  };

  const handleStart = () => {
    // onboardingComplete is NOT flipped here: even navigating first, the flag
    // flip re-renders the root gate while segments still read 'onboarding' and
    // its replace toward the tabs stomps this one (observed on web). The
    // paywall persists the flag on mount, once the handoff has really landed.
    router.replace('/paywall' as Href);
    if (remindersIntent) {
      // Deferred side effect from the reminders step, executed only at completion.
      void notificationService
        .scheduleDailyReminder(REMINDER_HOUR, REMINDER_MINUTE)
        .then(() => useAppStore.getState().updateSetting('remindersEnabled', true))
        .catch(() => {
          // Scheduling failed; the setting stays off and can be enabled in Settings.
        });
    }
  };

  return (
    <Screen padded warm background={<AmbientGradient constellation reduceMotion={reduceMotion} />}>
      <View style={styles.screen}>
        <TopChrome
          contentWidth={webContentWidth}
          onBack={() => setStep((current) => Math.max(current - 1, 0))}
          step={step}
          totalSteps={STEPS.length}
        />
        {currentStep.id === 'calibration' ? (
          <FadeIn key="calibration" duration={420} style={styles.page}>
            <CalibrationCard onComplete={handleCalibration} />
          </FadeIn>
        ) : (
          <View style={styles.page}>
            <View style={styles.hero}>
              <PersistentOrb step={step} />
              <View key={currentStep.id} style={styles.copy}>
                <StepCopy step={step} />
                {currentStep.id === 'vision' ? (
                  <GoalChoices selected={selectedGoal} onSelect={setSelectedGoal} />
                ) : null}
              </View>
            </View>
            <FadeIn key={`actions-${currentStep.id}`} delay={240} duration={motion.timing.entranceMs}>
              <View style={styles.actions}>
                <PrimaryButton
                  haptic={currentStep.id === 'ready' ? 'milestone' : 'selection'}
                  label={currentStep.buttonLabel}
                  onPress={
                    currentStep.id === 'vision'
                      ? handleGoalContinue
                      : currentStep.id === 'reminders'
                      ? () => {
                          void handleEnableReminders();
                        }
                      : currentStep.id === 'ready'
                        ? handleStart
                        : advance
                  }
                  style={webContentWidth === undefined ? undefined : { width: webContentWidth }}
                />
                {currentStep.id === 'reminders' ? (
                  <PressableScale onPress={advance} style={styles.secondaryChoice}>
                    <AppText color="secondary" variant="caption">
                      Not now
                    </AppText>
                  </PressableScale>
                ) : null}
                {currentStep.id === 'reminders' && remindersBlocked ? (
                  <AppText color="muted" style={styles.remindersNotice} variant="micro">
                    Reminders are off in iOS Settings.
                  </AppText>
                ) : null}
              </View>
            </FadeIn>
          </View>
        )}
      </View>
    </Screen>
  );
}

type PersistentOrbProps = {
  step: number;
};

// Co-Star/Linear: one orb is the constant of the flow. It scales between steps with a spring
// instead of remounting per step (which stutters), so the eye tracks a single living object.
function PersistentOrb({ step }: PersistentOrbProps) {
  const target = (step === 2 ? 180 : 152) / BASE_ORB;
  const orbScale = useSharedValue(target);

  useEffect(() => {
    orbScale.value = withSpring(target, motion.spring.snap);
  }, [orbScale, target]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
  }));

  return (
    <Animated.View style={orbStyle}>
      <BreathingOrb resolveOnMount size={BASE_ORB} />
    </Animated.View>
  );
}

type FocusInTextProps = {
  children: string;
};

// Open: the welcome title collapses its letter-spacing into focus - the type itself is the entrance.
function FocusInText({ children }: FocusInTextProps) {
  const progress = useSharedValue(0);
  const reduceMotion = useEffectiveReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }

    progress.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });

    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    letterSpacing: interpolate(progress.value, [0, 1], [8, type.hero.letterSpacing]),
  }));

  return <Animated.Text style={[styles.focusHero, textStyle]}>{children}</Animated.Text>;
}

type StepCopyProps = {
  step: number;
};

function StepCopy({ step }: StepCopyProps) {
  return (
    <>
      {step === 0 ? (
        <>
          <FocusInText>{'Train the\nway you see'}</FocusInText>
          <StepReveal delay={200} duration={320}>
            <AppText color="secondary" variant="caption">
              A quieter daily practice for sharper contrast.
            </AppText>
          </StepReveal>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <StepReveal delay={0}>
            <AppText variant="title">
              Your brain sharpens contrast with practice. Measurably.
            </AppText>
          </StepReveal>
          <StepReveal delay={120} duration={320}>
            <AppText color="secondary">
              Short, consistent sessions help perceptual learning settle in over time.
            </AppText>
          </StepReveal>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <StepReveal delay={0}>
            <AppText variant="title">What should training optimise for?</AppText>
          </StepReveal>
          <StepReveal delay={120} duration={320}>
            <AppText color="secondary">
              The first calibration stays broad. Your goal shapes the training plan after that.
            </AppText>
          </StepReveal>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <StepReveal delay={0}>
            <AppText variant="title">
              This colour means <AppText color="accent" variant="title">action.</AppText>
            </AppText>
          </StepReveal>
          <StepReveal delay={120} duration={320}>
            <AppText color="muted" variant="caption">
              The glow marks anything you can start or commit.
            </AppText>
          </StepReveal>
        </>
      ) : null}
      {step === 4 ? (
        <>
          <StepReveal delay={0}>
            <AppText variant="title">A gentle cue keeps the practice close.</AppText>
          </StepReveal>
          <StepReveal delay={120} duration={320}>
            <AppText color="secondary">
              {"Daily reminders make it easier to keep your streak and retain each session's gains."}
            </AppText>
          </StepReveal>
        </>
      ) : null}
      {step === 6 ? (
        <>
          <StepReveal delay={0}>
            <AppText variant="hero">{"You're set"}</AppText>
          </StepReveal>
          <StepReveal delay={120} duration={320}>
            <AppText color="secondary" variant="caption">
              Your first session will set a baseline.
            </AppText>
          </StepReveal>
        </>
      ) : null}
    </>
  );
}

type GoalChoicesProps = {
  selected: GoalType;
  onSelect: (goal: GoalType) => void;
};

function GoalChoices({ selected, onSelect }: GoalChoicesProps) {
  return (
    <View style={styles.goalList}>
      {GOAL_OPTIONS.map((option) => {
        const isSelected = selected === option.value;

        return (
          <PressableScale
            accessibilityRole="button"
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.goalChoice, isSelected && styles.goalChoiceSelected]}>
            <View>
              <AppText color="primary" variant="caption">
                {option.label}
              </AppText>
              <AppText color={isSelected ? 'secondary' : 'muted'} style={styles.goalDetail} variant="caption">
                {option.detail}
              </AppText>
            </View>
            <View style={[styles.goalDot, isSelected && styles.goalDotSelected]} />
          </PressableScale>
        );
      })}
    </View>
  );
}

// onboarding-chrome (law 12): progress indicator lives at the TOP now — back
// chevron, "N of M" step label, then the two-layer bar — left-margin-aligned
// with the title/caption/CTA below. Step count is a formula (STEPS.length),
// never hardcoded, so this holds for any N.
type TopChromeProps = {
  contentWidth?: number;
  onBack: () => void;
  step: number;
  totalSteps: number;
};

function TopChrome({ contentWidth, onBack, step, totalSteps }: TopChromeProps) {
  return (
    <View style={[styles.topChrome, contentWidth === undefined ? undefined : { width: contentWidth }]}>
      <View style={styles.backRow}>
        {step > 0 ? (
          <PressableScale hitSlop={space.sm} onPress={onBack} style={styles.backButton}>
            <BackChevron />
          </PressableScale>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
      </View>
      <AppText color="primary" style={styles.stepLabel} variant="caption">
        {`${step + 1} of ${totalSteps}`}
      </AppText>
      <ProgressBar step={step} totalSteps={totalSteps} />
    </View>
  );
}

function BackChevron() {
  return (
    <Svg height={18} width={18}>
      <Path
        d="M11.5 4L6.5 9L11.5 14"
        fill="none"
        stroke={text.primary}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
    </Svg>
  );
}

type ProgressBarProps = {
  step: number;
  totalSteps: number;
};

// Two-layer bar (spec rows 9-14): 5pt ACCENT fill on a 1pt ~12%-white track,
// TOP-aligned (not vertically centered) so the thin track reads as a rail the
// thicker fill sits flush against. Square-cut corners (row 11) — no radius.
function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const fraction = (step + 1) / totalSteps;
  const fill = useSharedValue(fraction);

  useEffect(() => {
    // VALIDATION.md motion row: "Onboarding bar: fill width animates
    // entranceMs (280) with spring.snap on step advance."
    fill.value = withSpring(fraction, motion.spring.snap);
  }, [fill, fraction]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressTrack} />
      <Animated.View style={[styles.progressFill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: space.xs,
    paddingBottom: space.lg,
  },
  backButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  backButtonPlaceholder: {
    height: 24,
    width: 24,
  },
  backRow: {
    height: 24,
  },
  copy: {
    gap: space.base,
    maxWidth: 348,
  },
  focusHero: {
    color: text.primary,
    fontFamily: type.hero.fontFamily,
    fontSize: type.hero.fontSize,
    lineHeight: type.hero.lineHeight,
  },
  goalChoice: {
    alignItems: 'center',
    backgroundColor: 'rgba(14, 19, 22, 0.78)',
    borderColor: 'rgba(167, 178, 180, 0.18)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space.base,
    justifyContent: 'space-between',
    minHeight: 68,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  goalChoiceSelected: {
    backgroundColor: 'rgba(51, 210, 214, 0.14)',
    borderColor: 'rgba(91, 233, 236, 0.56)',
    borderWidth: 1.5,
  },
  goalDetail: {
    marginTop: 1,
  },
  goalDot: {
    backgroundColor: 'transparent',
    borderColor: surface.hairlineStrong,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    height: 18,
    width: 18,
  },
  goalDotSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    shadowColor: ACCENT_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  goalList: {
    gap: space.sm,
    width: '100%',
  },
  hero: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: space.lg,
    paddingBottom: space.xl,
    paddingTop: space.xl,
  },
  page: {
    flex: 1,
  },
  progressBarContainer: {
    height: 5,
    justifyContent: 'flex-start',
    marginTop: space.xs,
    width: '100%',
  },
  progressFill: {
    backgroundColor: ACCENT,
    borderRadius: 0,
    height: 5,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  progressTrack: {
    backgroundColor: material.hairlineOnGlass,
    borderRadius: 0,
    height: 1,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  remindersNotice: {
    textAlign: 'center',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 0,
  },
  secondaryChoice: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  stepLabel: {
    marginTop: space.xl,
  },
  topChrome: {
    paddingBottom: space.sm,
  },
});
