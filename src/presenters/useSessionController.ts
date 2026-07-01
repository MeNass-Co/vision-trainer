import { useCallback, useMemo, useRef, useState } from 'react';

import { buildDeviceCalibration } from '@/core/deviceCalibration';
import { uuid } from '@/core/uuid';
import { QuestStaircase } from '@/psychophysics/quest';
import { buildGuidedSessionBlocks, type GuidedSessionBlock } from '@/session/guidedProtocol';
import { buildTrialPlan, type TrialPlan } from '@/session/trialPlan';
import {
  buildBlockThreshold,
  buildGuidedSessionLog,
  buildPartialSessionResult,
  GUIDED_STIM_DURATION_MS,
} from '@/session/sessionResult';
import { useAppStore } from '@/store/useAppStore';
import type {
  CalibrationProfile,
  SessionLog,
  ThresholdEstimate,
  TrialInterval,
} from '@/types';
import { now } from '@/utils/clock';

export type SessionStatus = 'ready' | 'running' | 'block-complete' | 'complete';

export type SessionSaveState = 'idle' | 'saving' | 'saved' | 'failed';

export type { TrialPlan } from '@/session/trialPlan';

export type SessionController = {
  calibration: CalibrationProfile;
  status: SessionStatus;
  blockIndex: number;
  totalBlocks: number;
  totalTrials: number;
  blockLabel: string;
  nextBlockLabel: string | null;
  trialIndex: number;
  trialsPerBlock: number;
  correctCount: number;
  lastCorrect: boolean | null;
  progress: number;
  showBlockBreak: boolean;
  saveState: SessionSaveState;
  /** The persisted session's real id, set only once the save succeeds. */
  savedSessionId: string | null;
  /** Blocks whose QUEST staircase converged to a recorded threshold. */
  completedBlockCount: number;
  currentTrial: () => TrialPlan;
  respond: (choice: TrialInterval) => { correct: boolean };
  begin: () => void;
  advanceBlock: () => void;
  /** Persist an early exit as an 'abandoned' log carrying the completed blocks' thresholds. */
  abandonSession: () => void;
  retrySave: () => void;
};

type SessionState = {
  status: SessionStatus;
  blockIndex: number;
  trialIndex: number;
  correctCount: number;
  completedTrials: number;
  lastCorrect: boolean | null;
};

const INITIAL_STATE: SessionState = {
  status: 'ready',
  blockIndex: 0,
  trialIndex: 0,
  correctCount: 0,
  completedTrials: 0,
  lastCorrect: null,
};

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function blocksForNextSession(): GuidedSessionBlock[] {
  const { sessions, settings, thresholds } = useAppStore.getState();

  return buildGuidedSessionBlocks({
    sessionsCompleted: sessions.length,
    thresholds,
    visionGoal: settings.visionGoal,
  });
}

// FUTURE(free-practice): Halide drag-as-dial lives in a separate practice mode, not the guided spine.
export function useSessionController(): SessionController {
  const calibration = useMemo(() => buildDeviceCalibration(), []);
  const [state, setState] = useState(INITIAL_STATE);
  const [saveState, setSaveState] = useState<SessionSaveState>('idle');
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const stateRef = useRef(state);
  const pendingSaveRef = useRef<{ session: SessionLog; thresholds: ThresholdEstimate[] } | null>(
    null
  );
  const saveInFlightRef = useRef(false);
  const trialRef = useRef<TrialPlan | null>(null);
  const sessionIdRef = useRef('');
  const startedAtRef = useRef('');
  const questsRef = useRef<QuestStaircase[]>([]);
  const blocksRef = useRef<GuidedSessionBlock[]>(blocksForNextSession());
  const thresholdsRef = useRef<ThresholdEstimate[]>([]);
  // Seeded per session from the wall clock so trial sequences (target sides,
  // phases, catch-trial placement) differ across users and launches; mulberry32
  // keeps a session's sequence reproducible from its seed for debugging.
  const randomRef = useRef<(() => number) | null>(null);

  const nextRandom = useCallback(() => {
    randomRef.current ??= mulberry32(now().getTime() >>> 0);
    return randomRef.current();
  }, []);

  const updateState = useCallback((nextState: SessionState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const buildTrial = useCallback((blockIndex: number): TrialPlan => {
    const block = blocksRef.current[blockIndex] ?? blocksRef.current[0];

    return buildTrialPlan({
      quest: questsRef.current[blockIndex],
      condition: block.condition,
      random: nextRandom,
      backgroundLuminanceCdM2: calibration.backgroundLuminanceCdM2,
      defaultDurationMs: GUIDED_STIM_DURATION_MS,
    });
  }, [calibration.backgroundLuminanceCdM2, nextRandom]);

  const currentTrial = useCallback(() => {
    if (!trialRef.current) {
      trialRef.current = buildTrial(stateRef.current.blockIndex);
    }

    return trialRef.current;
  }, [buildTrial]);

  const begin = useCallback(() => {
    if (stateRef.current.status !== 'ready') return;

    const blocks = blocksForNextSession();

    sessionIdRef.current = `session-${uuid()}`;
    startedAtRef.current = now().toISOString();
    randomRef.current = mulberry32(now().getTime() >>> 0);
    blocksRef.current = blocks;
    questsRef.current = blocks.map((block) => new QuestStaircase(block.questParams));
    thresholdsRef.current = [];
    trialRef.current = buildTrial(0);
    pendingSaveRef.current = null;
    setSaveState('idle');
    setSavedSessionId(null);
    updateState({ ...INITIAL_STATE, status: 'running' });
  }, [buildTrial, updateState]);

  // Save-state handling around session completion only — the trial path above
  // and in respond() is untouched (measurement red line).
  const persistSession = useCallback(
    async (session: SessionLog, thresholds: ThresholdEstimate[]) => {
      if (saveInFlightRef.current) return;

      saveInFlightRef.current = true;
      pendingSaveRef.current = { session, thresholds };
      setSaveState('saving');
      try {
        await useAppStore.getState().recordSessionResult(session, thresholds);
        setSavedSessionId(session.id);
        setSaveState('saved');
      } catch (error: unknown) {
        console.warn('[session] failed to persist result', error);
        setSaveState('failed');
      } finally {
        saveInFlightRef.current = false;
      }
    },
    []
  );

  const retrySave = useCallback(() => {
    const pending = pendingSaveRef.current;

    if (!pending || stateRef.current.status !== 'complete') return;
    void persistSession(pending.session, pending.thresholds);
  }, [persistSession]);

  const respond = useCallback(
    (choice: TrialInterval) => {
      const currentState = stateRef.current;
      const trial = trialRef.current;

      if (currentState.status !== 'running' || !trial) {
        return { correct: false };
      }

      const correct = choice === trial.targetInterval;
      questsRef.current[currentState.blockIndex].record(
        trial.intensityLog10,
        correct,
        trial.catchTrial
      );
      const completedTrials = currentState.completedTrials + 1;
      const nextTrialIndex = currentState.trialIndex + 1;
      const blocks = blocksRef.current;
      const block = blocks[currentState.blockIndex];
      const finishedBlock = nextTrialIndex >= block.trialsPerBlock;
      const finishedSession = finishedBlock && currentState.blockIndex + 1 >= blocks.length;

      if (finishedBlock) {
        const bi = currentState.blockIndex;
        const quest = questsRef.current[bi];
        const condition = blocks[bi].condition;
        thresholdsRef.current.push(buildBlockThreshold({
          sessionId: sessionIdRef.current,
          blockId: blocks[bi].id,
          spatialFrequencyCpd: condition.spatialFrequencyCpd,
          orientationDeg: condition.orientationDeg,
          durationMs: condition.durationMs ?? GUIDED_STIM_DURATION_MS,
          estimate: quest.estimate(),
          gaborSizeDeg: condition.gaborSizeDeg,
          paradigm: condition.paradigm,
          trialCount: quest.trialCount(),
          lapseRate: quest.lapseRate(),
          createdAtIso: now().toISOString(),
        }));
      }

      if (finishedSession) {
        const session = buildGuidedSessionLog({
          id: sessionIdRef.current,
          startedAtIso: startedAtRef.current,
          completedAtIso: now().toISOString(),
          calibrationId: calibration.id,
          plannedBlocks: blocks.map((block) => block.plannedBlock),
          completedTrials,
        });
        void persistSession(session, [...thresholdsRef.current]);
      }

      trialRef.current = finishedBlock ? null : buildTrial(currentState.blockIndex);

      updateState({
        ...currentState,
        status: finishedSession ? 'complete' : finishedBlock ? 'block-complete' : 'running',
        trialIndex: finishedBlock ? currentState.trialIndex : nextTrialIndex,
        correctCount: currentState.correctCount + (correct ? 1 : 0),
        completedTrials,
        lastCorrect: correct,
      });

      return { correct };
    },
    [buildTrial, calibration.id, persistSession, updateState]
  );

  const abandonSession = useCallback(() => {
    const currentState = stateRef.current;

    // Only a live session with at least one converged block has anything worth
    // keeping; a finished session already persisted through respond().
    if (currentState.status !== 'running' && currentState.status !== 'block-complete') return;
    if (thresholdsRef.current.length === 0) return;

    const session = buildPartialSessionResult({
      id: sessionIdRef.current,
      startedAtIso: startedAtRef.current,
      completedAtIso: now().toISOString(),
      calibrationId: calibration.id,
      plannedBlocks: blocksRef.current.map((block) => block.plannedBlock),
      completedTrials: currentState.completedTrials,
    });
    void persistSession(session, [...thresholdsRef.current]);
  }, [calibration.id, persistSession]);

  const advanceBlock = useCallback(() => {
    const currentState = stateRef.current;

    if (currentState.status !== 'block-complete') return;

    const blockIndex = currentState.blockIndex + 1;
    trialRef.current = buildTrial(blockIndex);
    updateState({
      ...currentState,
      status: 'running',
      blockIndex,
      trialIndex: 0,
      lastCorrect: null,
    });
  }, [buildTrial, updateState]);

  const totalTrials = blocksRef.current.reduce((sum, block) => sum + block.trialsPerBlock, 0);
  // Mirrors thresholdsRef.current.length, but derived from reactive state so
  // consumers re-render: a block's threshold is pushed the instant it finishes.
  const completedBlockCount =
    state.status === 'complete'
      ? blocksRef.current.length
      : state.status === 'block-complete'
        ? state.blockIndex + 1
        : state.status === 'running'
          ? state.blockIndex
          : 0;

  return {
    calibration,
    status: state.status,
    blockIndex: state.blockIndex,
    totalBlocks: blocksRef.current.length,
    totalTrials,
    blockLabel: blocksRef.current[state.blockIndex]?.label ?? blocksRef.current[0].label,
    nextBlockLabel: blocksRef.current[state.blockIndex + 1]?.label ?? null,
    trialIndex: state.trialIndex,
    trialsPerBlock: blocksRef.current[state.blockIndex]?.trialsPerBlock ?? blocksRef.current[0].trialsPerBlock,
    correctCount: state.correctCount,
    lastCorrect: state.lastCorrect,
    progress: state.completedTrials / totalTrials,
    showBlockBreak: blocksRef.current[state.blockIndex]?.showBreak,
    saveState,
    savedSessionId,
    completedBlockCount,
    currentTrial,
    respond,
    begin,
    advanceBlock,
    abandonSession,
    retrySave,
  };
}
