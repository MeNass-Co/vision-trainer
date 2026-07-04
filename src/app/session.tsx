import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { GaborCanvas, type GaborCanvasHandle } from '@/components/GaborCanvas';
import { AmbientGradient } from '@/components/home/AmbientGradient';
import { CompletionReward } from '@/components/session/CompletionReward';
import { KinoEdgeArc } from '@/components/session/KinoEdgeArc';
import { PostSessionInsight } from '@/components/session/PostSessionInsight';
import { ResponseTap } from '@/components/session/ResponseTap';
import { RewardBurst } from '@/components/session/RewardBurst';
import { AppText, Bloom, FadeIn, GlassSurface, PressableScale, PrimaryButton } from '@/components/ui';
import { viewingDistanceReminder } from '@/core/displayCalibration';
import { usePostSessionInsight, useSessionController } from '@/presenters';
import { applySessionBrightness, restoreCapturedBrightness } from '@/services/brightness';
import { setSessionActive } from '@/services/notifications';
import { useAppStore } from '@/store/useAppStore';
import { haptics } from '@/theme/haptics';
import { easings } from '@/theme/motion';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';
import {
  ACCENT,
  ACCENT_CORE,
  ACCENT_GLOW,
  material,
  motion,
  radius,
  space,
  surface,
  text,
  verdict,
} from '@/theme/tokens';
import type { GaborStimulus, TrialInterval } from '@/types';

type UiPhase =
  | 'idle'
  | 'ready'
  | 'fixation'
  | 'interval-1'
  | 'isi'
  | 'interval-2'
  | 'response'
  | 'feedback'
  | 'block-fold'
  | 'paused';

type ChoiceResolver = (choice: TrialInterval | null) => void;

const CHECKMARK_LENGTH = 28;
const READY_GLOW = 'rgba(51,210,214,0.06)';
const AnimatedPath = Animated.createAnimatedComponent(Path);
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function SessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useEffectiveReducedMotion();
  const controller = useSessionController();
  const canvasRef = useRef<GaborCanvasHandle>(null);
  const isMountedRef = useRef(true);
  const trialRunningRef = useRef(false);
  const foldRunningRef = useRef(false);
  const continueRunningRef = useRef(false);
  const choiceResolverRef = useRef<ChoiceResolver | null>(null);
  // Bumped whenever a suspend interrupts the trial loop: in-flight runTrial
  // continuations compare their captured epoch and bail without recording.
  const interruptionEpochRef = useRef(0);
  const statusRef = useRef(controller.status);
  const rewardChordCancelRef = useRef<(() => void) | null>(null);
  const blockStartCorrectCountRef = useRef(0);
  const [uiPhase, setUiPhase] = useState<UiPhase>('ready');
  const [burst, setBurst] = useState(0);
  const [bigBurst, setBigBurst] = useState(false);
  const [blockCorrectCount, setBlockCorrectCount] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showBlockSummary, setShowBlockSummary] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [insightSessionId, setInsightSessionId] = useState<string | null>(null);
  const { data: postSessionInsight } = usePostSessionInsight(insightSessionId);
  const fieldScale = useSharedValue(1);
  const fieldOpacity = useSharedValue(1);
  const fieldRotation = useSharedValue(0);
  const feedbackRingScale = useSharedValue(0.7);
  const feedbackRingOpacity = useSharedValue(0);
  const checkDraw = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const bornProgress = useSharedValue(reduceMotion ? 1 : 0);

  const fieldStyle = useAnimatedStyle(() => ({
    opacity: fieldOpacity.value,
    transform: [
      { perspective: 900 },
      { scale: fieldScale.value },
      { rotateX: `${fieldRotation.value}deg` },
    ],
  }));
  const feedbackRingStyle = useAnimatedStyle(() => ({
    opacity: feedbackRingOpacity.value,
    transform: [{ scale: feedbackRingScale.value }],
  }));
  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));
  const checkmarkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECKMARK_LENGTH * (1 - checkDraw.value),
  }));
  const readyHaloStyle = useAnimatedStyle(() => {
    const p = interpolate(bornProgress.value, [0, 0.55], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [{ scale: 0.62 + p * 0.38 }],
    };
  });
  const readyWashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bornProgress.value, [0.05, 0.5], [0, 1], Extrapolation.CLAMP),
  }));
  const metaRiseStyle = useAnimatedStyle(() => {
    const p = interpolate(bornProgress.value, [0.45, 0.7], [0, 1], Extrapolation.CLAMP);
    return { opacity: p, transform: [{ translateY: 10 * (1 - p) }] };
  });
  const heroRiseStyle = useAnimatedStyle(() => {
    const p = interpolate(bornProgress.value, [0.55, 0.82], [0, 1], Extrapolation.CLAMP);
    return { opacity: p, transform: [{ translateY: 10 * (1 - p) }] };
  });
  const instructionRiseStyle = useAnimatedStyle(() => {
    const p = interpolate(bornProgress.value, [0.65, 0.92], [0, 1], Extrapolation.CLAMP);
    return { opacity: p, transform: [{ translateY: 10 * (1 - p) }] };
  });
  const beginRiseStyle = useAnimatedStyle(() => {
    const p = interpolate(bornProgress.value, [0.75, 1], [0, 1], Extrapolation.CLAMP);
    return { opacity: p, transform: [{ translateY: 10 * (1 - p) }] };
  });

  useEffect(() => {
    void applySessionBrightness(useAppStore.getState().settings.displayBrightness);
    // A reminder banner dropping over the canvas mid-trial would corrupt the
    // presented interval; the handler suppresses banners while a session runs.
    setSessionActive(true);

    return () => {
      setSessionActive(false);
      void restoreCapturedBrightness();
    };
  }, []);

  useEffect(() => {
    statusRef.current = controller.status;
  }, [controller.status]);

  // Suspend handling: setTimeout freezes in the background and fires late on
  // resume, which would corrupt the presented interval timing. On any exit from
  // the foreground we hand the system its brightness back and abort the
  // in-flight trial WITHOUT recording it; the same trial plan replays on
  // resume (trialRef is only consumed by respond(), so QUEST never sees the
  // interruption).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        if (statusRef.current === 'running' || statusRef.current === 'block-complete') {
          void applySessionBrightness(useAppStore.getState().settings.displayBrightness);
        }
        return;
      }
      if (nextAppState !== 'background' && nextAppState !== 'inactive') return;

      void restoreCapturedBrightness();
      if (statusRef.current !== 'running') return;

      interruptionEpochRef.current += 1;
      canvasRef.current?.clear();
      choiceResolverRef.current?.(null);
      choiceResolverRef.current = null;
      trialRunningRef.current = false;
      if (isMountedRef.current) setUiPhase('paused');
    });

    return () => subscription.remove();
  }, []);

  const isStillMounted = useCallback(async (ms: number) => {
    await delay(ms);
    return isMountedRef.current;
  }, []);

  const setPhase = useCallback((phase: UiPhase) => {
    if (isMountedRef.current) setUiPhase(phase);
  }, []);

  const presentInterval = useCallback(
    async (stimulus: GaborStimulus | null, durationMs: number) => {
      if (!isMountedRef.current) return false;

      if (stimulus) {
        await canvasRef.current?.present(stimulus);
      } else {
        canvasRef.current?.clear();
        if (!(await isStillMounted(durationMs))) return false;
      }

      return isMountedRef.current;
    },
    [isStillMounted]
  );

  const waitForChoice = useCallback(
    () =>
      new Promise<TrialInterval | null>((resolve) => {
        choiceResolverRef.current = resolve;
      }),
    []
  );

  const handleChoice = useCallback((choice: TrialInterval) => {
    const resolve = choiceResolverRef.current;

    choiceResolverRef.current = null;
    resolve?.(choice);
  }, []);

  const runTrial = useCallback(async () => {
    if (trialRunningRef.current || !isMountedRef.current) return;

    trialRunningRef.current = true;
    // Captured once per attempt: a background/inactive interruption bumps the
    // epoch, so every await below bails without recording and the same trial
    // plan replays after "Resume".
    const epoch = interruptionEpochRef.current;
    const live = () => epoch === interruptionEpochRef.current;

    setPhase('fixation');
    if (!(await isStillMounted(500)) || !live()) return;

    const trial = controller.currentTrial();
    const stimulus = trial.intervals[0] ?? trial.intervals[1];
    const durationMs = stimulus?.durationMs ?? 150;

    setPhase('interval-1');
    if (!(await presentInterval(trial.intervals[0], durationMs)) || !live()) return;

    setPhase('isi');
    canvasRef.current?.clear();
    if (!(await isStillMounted(400)) || !live()) return;

    setPhase('interval-2');
    if (!(await presentInterval(trial.intervals[1], durationMs)) || !live()) return;

    canvasRef.current?.clear();
    setPhase('response');
    const choice = await waitForChoice();

    if (!choice || !isMountedRef.current || !live()) return;

    const finishesBlock = controller.trialIndex + 1 >= controller.trialsPerBlock;
    const { correct } = controller.respond(choice);

    setPhase('feedback');
    if (correct) {
      setBigBurst(finishesBlock);
      setBurst((current) => current + 1);
      feedbackRingScale.value = 0.7;
      feedbackRingOpacity.value = 1;
      feedbackRingScale.value = withSpring(finishesBlock ? 1.45 : 1.2, motion.spring.reward);
      feedbackRingOpacity.value = withTiming(0, { duration: 420 });
      checkDraw.value = 0;
      checkOpacity.value = 1;
      checkDraw.value = withTiming(1, { duration: 160, easing: easings.out });
      checkOpacity.value = withDelay(300, withTiming(0, { duration: 200 }));
      haptics.correct();
    } else {
      checkOpacity.value = 0;
      haptics.wrong();
    }

    if (!(await isStillMounted(450)) || !live()) return;

    trialRunningRef.current = false;
    fieldScale.value = 1;
    fieldOpacity.value = 1;
    fieldRotation.value = 0;
    setPhase('idle');
  }, [
    checkDraw,
    checkOpacity,
    controller,
    feedbackRingOpacity,
    feedbackRingScale,
    fieldOpacity,
    fieldRotation,
    fieldScale,
    isStillMounted,
    presentInterval,
    setPhase,
    waitForChoice,
  ]);

  const startBlockFold = useCallback(async () => {
    if (foldRunningRef.current || !isMountedRef.current) return;

    foldRunningRef.current = true;
    setPhase('block-fold');
    fieldScale.value = withSpring(1, motion.spring.input);
    fieldOpacity.value = withTiming(0, { duration: 240 });
    fieldRotation.value = withSpring(0, motion.spring.input);

    if (!(await isStillMounted(240))) return;

    setBlockCorrectCount(controller.correctCount - blockStartCorrectCountRef.current);
    setShowBlockSummary(true);
  }, [controller.correctCount, fieldOpacity, fieldRotation, fieldScale, isStillMounted, setPhase]);

  const handleContinue = useCallback(async () => {
    if (continueRunningRef.current || !showBlockSummary || !isMountedRef.current) return;
    continueRunningRef.current = true;
    try {
      setShowBlockSummary(false);
      blockStartCorrectCountRef.current = controller.correctCount;
      controller.advanceBlock();
      fieldScale.value = withSpring(1, motion.spring.input);
      fieldOpacity.value = withTiming(1, { duration: 450 });
      fieldRotation.value = withSpring(0, motion.spring.input);

      if (!(await isStillMounted(450))) return;

      foldRunningRef.current = false;
      setPhase('idle');
    } finally {
      continueRunningRef.current = false;
    }
  }, [
    controller,
    fieldOpacity,
    fieldRotation,
    fieldScale,
    isStillMounted,
    setPhase,
    showBlockSummary,
  ]);

  const handleAutoAdvance = useCallback(async () => {
    if (continueRunningRef.current || !isMountedRef.current) return;

    continueRunningRef.current = true;
    try {
      blockStartCorrectCountRef.current = controller.correctCount;
      controller.advanceBlock();
      fieldScale.value = 1;
      fieldOpacity.value = 1;
      fieldRotation.value = 0;

      if (!(await isStillMounted(80))) return;

      foldRunningRef.current = false;
      setPhase('idle');
    } finally {
      continueRunningRef.current = false;
    }
  }, [controller, fieldOpacity, fieldRotation, fieldScale, isStillMounted, setPhase]);

  const handleBegin = useCallback(() => {
    if (!canvasReady) return;

    controller.begin();
    setPhase('idle');
  }, [canvasReady, controller, setPhase]);

  const handleResume = useCallback(() => {
    // Back to 'idle': the status effect restarts runTrial, which replays the
    // interrupted trial plan (nothing was recorded, the index never advanced).
    setPhase('idle');
  }, [setPhase]);

  const handleAbortConfirm = useCallback(() => {
    controller.abandonSession();
    canvasRef.current?.clear();
    router.replace('/(tabs)' as Href);
  }, [controller, router]);

  const handleClose = useCallback(() => {
    // A live session with at least one converged block holds real measurements:
    // confirm before ending, keep what was earned. Zero blocks = nothing to lose.
    // Native alert, not a bespoke overlay: correct system layering for free — it
    // can never fuse with the inter-block card beneath, and "Keep training" (the
    // cancel action) just dismisses, returning to whatever was already showing.
    if (
      (controller.status === 'running' || controller.status === 'block-complete') &&
      controller.completedBlockCount > 0
    ) {
      Alert.alert('End session?', 'Completed blocks will be kept.', [
        { text: 'Keep training', style: 'cancel' },
        { text: 'End session', style: 'destructive', onPress: handleAbortConfirm },
      ]);
      return;
    }
    canvasRef.current?.clear();
    router.back();
  }, [controller.completedBlockCount, controller.status, handleAbortConfirm, router]);

  const handleCompletionDone = useCallback(() => {
    // Continue is gated on a confirmed save: never guess at "the latest
    // completed session" — the insight must belong to THIS session's real id.
    if (controller.saveState !== 'saved' || !controller.savedSessionId) return;

    canvasRef.current?.clear();
    setInsightSessionId(controller.savedSessionId);
    setShowCompletion(false);
    setShowInsight(true);
  }, [controller.savedSessionId, controller.saveState]);

  const handleDiscard = useCallback(() => {
    canvasRef.current?.clear();
    router.replace('/(tabs)' as Href);
  }, [router]);

  const handleInsightDone = useCallback(() => {
    canvasRef.current?.clear();
    router.replace('/(tabs)' as Href);
  }, [router]);

  const handleInsightProgress = useCallback(() => {
    canvasRef.current?.clear();
    router.replace('/(tabs)/progress' as Href);
  }, [router]);

  useEffect(() => {
    if (controller.status === 'running' && uiPhase === 'idle' && !trialRunningRef.current) {
      void runTrial();
    } else if (
      controller.status === 'block-complete' &&
      uiPhase === 'idle' &&
      !foldRunningRef.current
    ) {
      if (controller.showBlockBreak) {
        void startBlockFold();
      } else {
        void handleAutoAdvance();
      }
    } else if (
      controller.status === 'complete' &&
      uiPhase === 'idle' &&
      !showCompletion &&
      // Once the user advances to the insight, the reward must never remount —
      // without this guard the effect re-lights showCompletion one frame after
      // handleCompletionDone's swap, stacking both end screens translucently.
      !showInsight
    ) {
      setShowCompletion(true);
      setBigBurst(true);
      setBurst((current) => current + 1);
      rewardChordCancelRef.current = haptics.rewardChord();
    }
  }, [
    controller.showBlockBreak,
    controller.status,
    handleAutoAdvance,
    runTrial,
    showCompletion,
    showInsight,
    startBlockFold,
    uiPhase,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup; the canvas ref is stable for the screen's lifetime (red-line measurement path, do not restructure)
      canvasRef.current?.clear();
      choiceResolverRef.current?.(null);
      choiceResolverRef.current = null;
      rewardChordCancelRef.current?.();
      rewardChordCancelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      bornProgress.value = 1;
      return;
    }
    bornProgress.value = 0;
    bornProgress.value = withDelay(0, withTiming(1, { duration: 520, easing: easings.out }));
    return () => cancelAnimation(bornProgress);
  }, [bornProgress, reduceMotion]);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.field, fieldStyle]}>
        <GaborCanvas
          calibration={controller.calibration}
          onReadyChange={setCanvasReady}
          ref={canvasRef}
        />
        <KinoEdgeArc progress={controller.progress} />
        <View pointerEvents="none" style={styles.phaseLayer}>
          {uiPhase === 'fixation' ? <View style={styles.fixationDot} /> : null}
          {uiPhase === 'feedback' && !controller.lastCorrect ? (
            <View style={styles.wrongFeedbackDot} />
          ) : null}
          <Animated.View style={[styles.feedbackRing, feedbackRingStyle]} />
          <Animated.View style={[styles.checkmark, checkmarkStyle]}>
            <Svg height={28} width={28}>
              <AnimatedPath
                animatedProps={checkmarkProps}
                d="M4 14L11 21L24 7"
                fill="none"
                stroke={ACCENT}
                strokeDasharray={CHECKMARK_LENGTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
              />
            </Svg>
          </Animated.View>
        </View>
        <ResponseTap enabled={uiPhase === 'response'} onCommit={handleChoice} />
        <RewardBurst big={bigBurst} trigger={burst} />
        <TrialPhaseGuide phase={uiPhase} />
      </Animated.View>

      {controller.status === 'ready' && uiPhase === 'ready' ? (
        <View style={styles.readyOverlay}>
          <Animated.View style={[StyleSheet.absoluteFill, readyWashStyle]}>
            <AmbientGradient constellation reduceMotion={reduceMotion} />
          </Animated.View>

          {/* Center halo that CATCHES the Today orb's departing bloom — same hue ladder, blooms outward. */}
          <Animated.View pointerEvents="none" style={[styles.readyHalo, readyHaloStyle]}>
            <Bloom color={ACCENT_GLOW} core={ACCENT_CORE} edge={ACCENT_GLOW} />
          </Animated.View>

          {/* Existing soft top glow, fades in with the wash. */}
          <Animated.View style={[styles.readyGlow, readyWashStyle]} pointerEvents="none">
            <Bloom color={READY_GLOW} rx="70%" ry="42%" />
          </Animated.View>

          <View style={[styles.readyContent, { paddingBottom: insets.bottom + space.xxl }]}>
            <Animated.View style={metaRiseStyle}>
              <AppText color="muted" style={styles.readyMeta} uppercase variant="micro">
                {controller.blockLabel}
              </AppText>
            </Animated.View>
            <Animated.View style={heroRiseStyle}>
              <AppText style={styles.readyHero} variant="hero">
                Two flashes
              </AppText>
            </Animated.View>
            <Animated.View style={instructionRiseStyle}>
              <AppText color="secondary" style={styles.readyInstruction} variant="body">
                Pick the one with the pattern.
              </AppText>
              <AppText color="muted" style={styles.readyDistance} variant="caption">
                {viewingDistanceReminder(controller.calibration.viewingDistanceCm)}
              </AppText>
            </Animated.View>
            <Animated.View style={[styles.beginWrap, beginRiseStyle]}>
              <PrimaryButton
                disabled={!canvasReady}
                haptic="select"
                label={canvasReady ? 'Begin' : 'Preparing'}
                onPress={handleBegin}
              />
            </Animated.View>
          </View>
        </View>
      ) : null}

      {uiPhase === 'paused' ? (
        <View style={styles.readyOverlay}>
          <View style={[styles.readyContent, { paddingBottom: insets.bottom + space.xxl }]}>
            <AppText color="muted" style={styles.readyMeta} uppercase variant="micro">
              {controller.blockLabel}
            </AppText>
            <AppText style={styles.readyHero} variant="hero">
              Paused
            </AppText>
            <AppText color="secondary" style={styles.readyInstruction} variant="body">
              Your place is saved. The interrupted trial will replay.
            </AppText>
            <View style={styles.beginWrap}>
              <PrimaryButton haptic="select" label="Resume" onPress={handleResume} />
            </View>
          </View>
        </View>
      ) : null}

      {showBlockSummary ? (
        <View style={styles.centeredOverlay}>
          <FadeIn duration={motion.timing.entranceMs}>
            <GlassSurface radius={material.radius} style={styles.overlayCard}>
              <AppText color="muted" uppercase variant="micro">
                {controller.blockLabel} complete
              </AppText>
              <AppText color="muted" style={styles.blockCounter} tabular uppercase variant="micro">
                Block {controller.blockIndex + 1} of {controller.totalBlocks}
              </AppText>
              <View style={styles.blockScore}>
                <Bloom color={ACCENT_GLOW} style={styles.blockBloom} />
                <AppText style={styles.score} tabular variant="title">
                  {blockCorrectCount}/{controller.trialsPerBlock}
                </AppText>
              </View>
              <PressableScale onPress={() => void handleContinue()} style={styles.action}>
                <AppText color="inverse" variant="caption">
                  {controller.nextBlockLabel ? `Next: ${controller.nextBlockLabel}` : 'Continue'}
                </AppText>
              </PressableScale>
            </GlassSurface>
          </FadeIn>
        </View>
      ) : null}

      {showCompletion ? (
        <CompletionReward
          accuracyTarget={Math.round(
            (controller.correctCount / controller.totalTrials) * 100
          )}
          actionLabel={controller.saveState === 'saving' ? 'Saving' : 'Continue'}
          correctCount={controller.correctCount}
          onDone={handleCompletionDone}
          reduceMotion={reduceMotion}
          subtitle="Your session is ready to read"
          total={controller.totalTrials}
        />
      ) : null}

      {showCompletion && controller.saveState === 'failed' ? (
        <View style={styles.centeredOverlay}>
          <FadeIn duration={motion.timing.entranceMs}>
            <GlassSurface radius={material.radius} style={styles.saveFailedCard}>
              <AppText color="secondary" style={styles.saveFailedMessage} variant="body">
                {"Couldn't save this session."}
              </AppText>
              <PrimaryButton label="Retry" onPress={controller.retrySave} />
              <PressableScale
                accessibilityLabel="Discard session and exit"
                accessibilityRole="button"
                onPress={handleDiscard}
                style={styles.saveFailedDiscard}>
                <AppText color="muted" variant="caption">
                  Discard
                </AppText>
              </PressableScale>
            </GlassSurface>
          </FadeIn>
        </View>
      ) : null}

      {showInsight && postSessionInsight ? (
        <PostSessionInsight
          insight={postSessionInsight}
          onDone={handleInsightDone}
          onViewProgress={handleInsightProgress}
        />
      ) : null}

      <PressableScale
        accessibilityLabel="Close session"
        accessibilityRole="button"
        hitSlop={12}
        onPress={handleClose}
        style={[styles.close, { top: insets.top + space.sm }]}>
        <Svg height={14} width={14}>
          <Path d="M2 2L12 12M12 2L2 12" stroke={text.muted} strokeLinecap="round" strokeWidth={1.4} />
        </Svg>
      </PressableScale>
    </View>
  );
}

function TrialPhaseGuide({ phase }: { phase: UiPhase }) {
  const activeIndex =
    phase === 'interval-1' ? 0 : phase === 'isi' ? 1 : phase === 'interval-2' ? 2 : null;
  const label =
    phase === 'fixation'
      ? 'Ready'
      : phase === 'interval-1'
        ? 'Flash 1'
        : phase === 'isi'
          ? 'Wait'
          : phase === 'interval-2'
            ? 'Flash 2'
            : phase === 'response'
              ? 'Choose'
              : null;

  if (!label) return null;

  return (
    <View pointerEvents="none" style={styles.phaseGuide}>
      <View style={styles.phaseRail}>
        {['1', '·', '2'].map((item, index) => (
          <View
            key={`${item}-${index}`}
            style={[
              styles.phaseStep,
              activeIndex === index ? styles.phaseStepActive : styles.phaseStepIdle,
            ]}>
            <AppText color={activeIndex === index ? 'inverse' : 'muted'} tabular variant="micro">
              {item}
            </AppText>
          </View>
        ))}
      </View>
      <AppText color="primary" variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: surface.base,
    flex: 1,
  },
  field: {
    backgroundColor: surface.base,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  phaseLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  phaseGuide: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 10, 13, 0.62)',
    borderColor: 'rgba(239, 243, 244, 0.12)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: '58%',
    gap: space.xs,
    left: '50%',
    marginLeft: -68,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    position: 'absolute',
    width: 136,
    zIndex: 5,
  },
  phaseRail: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xs,
  },
  phaseStep: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  phaseStepActive: {
    backgroundColor: ACCENT_CORE,
  },
  phaseStepIdle: {
    backgroundColor: 'rgba(239, 243, 244, 0.08)',
    borderColor: surface.hairline,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fixationDot: {
    backgroundColor: text.secondary,
    borderRadius: radius.pill,
    height: 5,
    opacity: 0.7,
    width: 5,
  },
  wrongFeedbackDot: {
    backgroundColor: verdict.regressing,
    borderRadius: radius.pill,
    height: 10,
    opacity: 0.42,
    width: 10,
  },
  feedbackRing: {
    borderColor: ACCENT,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 72,
    position: 'absolute',
    width: 72,
  },
  checkmark: {
    position: 'absolute',
  },
  centeredOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: space.xl,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  readyOverlay: {
    backgroundColor: surface.base,
    bottom: 0,
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  readyGlow: {
    height: '55%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '6%',
  },
  readyHalo: {
    alignItems: 'center',
    height: '70%',
    justifyContent: 'center',
    left: '-15%',
    position: 'absolute',
    right: '-15%',
    top: '4%',
  },
  readyContent: {
    paddingHorizontal: space.lg,
  },
  readyMeta: {
    letterSpacing: 1.6,
  },
  readyHero: {
    marginTop: space.md,
  },
  readyInstruction: {
    marginTop: space.sm,
  },
  readyDistance: {
    marginTop: space.sm,
  },
  beginWrap: {
    marginTop: space.xl,
  },
  score: {
    lineHeight: 78,
  },
  overlayCard: {
    alignItems: 'center',
    gap: space.sm,
    minHeight: 268,
    paddingHorizontal: space.xl,
    paddingVertical: space.xl,
  },
  saveFailedCard: {
    alignItems: 'center',
    gap: space.md,
    minWidth: 260,
    paddingHorizontal: space.xl,
    paddingVertical: space.xl,
  },
  saveFailedDiscard: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  saveFailedMessage: {
    textAlign: 'center',
  },
  blockScore: {
    alignItems: 'center',
    height: 92,
    justifyContent: 'center',
    marginVertical: space.sm,
    width: 180,
  },
  blockBloom: {
    bottom: -space.lg,
    left: 0,
    right: 0,
    top: -space.lg,
  },
  blockCounter: {
    marginTop: -space.md,
  },
  action: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderColor: ACCENT_GLOW,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: space.md,
    minWidth: 112,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  close: {
    alignItems: 'center',
    borderColor: surface.hairline,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    left: space.base,
    position: 'absolute',
    width: 32,
  },
});
