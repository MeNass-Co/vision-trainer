import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CalibrationCard } from '@/components/calibration/CalibrationCard';
import { AmbientGradient } from '@/components/home/AmbientGradient';
import { BreathingOrb } from '@/components/onboarding/BreathingOrb';
import { StepReveal } from '@/components/onboarding/StepReveal';
import { AppText, FadeIn, PressableScale, PrimaryButton, Screen } from '@/components/ui';
import { notificationService } from '@/services/notifications';
import { useAppStore } from '@/store/useAppStore';
import { ACCENT, ACCENT_GLOW, motion, radius, space, surface, text, type } from '@/theme/tokens';
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
                />
                {currentStep.id === 'reminders' ? (
                  <PressableScale onPress={advance} style={styles.secondaryChoice}>
                    <AppText color="muted" variant="caption">
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
        <Footer onBack={() => setStep((current) => Math.max(current - 1, 0))} step={step} />
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
              <AppText color="muted" variant="micro">
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

type FooterProps = {
  onBack: () => void;
  step: number;
};

function Footer({ onBack, step }: FooterProps) {
  return (
    <View style={styles.footer}>
      <ProgressBar step={step} />
      <View style={styles.footerNav}>
        {step > 0 ? (
          <PressableScale hitSlop={space.sm} onPress={onBack} style={styles.backButton}>
            <AppText color="muted" variant="caption">
              Back
            </AppText>
          </PressableScale>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>
    </View>
  );
}

type ProgressBarProps = {
  step: number;
};

function ProgressBar({ step }: ProgressBarProps) {
  const fill = useSharedValue((step + 1) / STEPS.length);

  useEffect(() => {
    fill.value = withTiming((step + 1) / STEPS.length, { duration: 320 });
  }, [fill, step]);

  // Contained 2px bar inside a fixed-height track: animating width reflows nothing else.
  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <View style={styles.progressTrack}>
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
    alignSelf: 'flex-start',
    paddingVertical: space.xs,
  },
  backPlaceholder: {
    height: 26,
  },
  copy: {
    gap: space.base,
    maxWidth: 340,
  },
  focusHero: {
    color: text.primary,
    fontFamily: type.hero.fontFamily,
    fontSize: type.hero.fontSize,
    lineHeight: type.hero.lineHeight,
  },
  footer: {
    gap: space.sm,
    paddingTop: space.sm,
  },
  footerNav: {
    minHeight: 28,
  },
  goalChoice: {
    alignItems: 'center',
    backgroundColor: surface.raised,
    borderColor: surface.hairline,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: space.md,
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  goalChoiceSelected: {
    backgroundColor: 'rgba(51, 210, 214, 0.12)',
    borderColor: ACCENT_GLOW,
  },
  goalDot: {
    backgroundColor: surface.hairline,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  goalDotSelected: {
    backgroundColor: ACCENT,
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
    gap: space.xl,
    paddingVertical: space.xxl,
  },
  page: {
    flex: 1,
  },
  progressFill: {
    backgroundColor: ACCENT,
    borderRadius: radius.pill,
    height: 3,
  },
  progressTrack: {
    backgroundColor: surface.hairlineStrong,
    borderRadius: radius.pill,
    height: 3,
    overflow: 'hidden',
    width: '100%',
  },
  remindersNotice: {
    textAlign: 'center',
  },
  screen: {
    flex: 1,
    paddingBottom: space.lg,
    paddingHorizontal: 0,
  },
  secondaryChoice: {
    alignItems: 'center',
    paddingVertical: space.md,
  },
});
