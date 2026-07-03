import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { buildGuidedSessionBlocks } from '@/session/guidedProtocol';
import { useAppStore } from '@/store/useAppStore';
import { now } from '@/utils/clock';

import { deriveTodayView } from './derive';
import { humanBandLabel } from './reliability';
import type { Loadable, TodayView } from './types';

export function useTodayData(): Loadable<TodayView> {
  const hydrated = useAppStore((state) => state.hydrated);
  const sessions = useAppStore((state) => state.sessions);
  const settings = useAppStore((state) => state.settings);
  const thresholds = useAppStore((state) => state.thresholds);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((key) => key + 1);
    }, [])
  );

  const data = useMemo(() => {
    const view = deriveTodayView(sessions, thresholds, now());
    const nextBlocks = buildGuidedSessionBlocks({
      sessionsCompleted: sessions.length,
      thresholds,
      visionGoal: settings.visionGoal,
    });
    const nextTrainingBlock =
      nextBlocks.find((block) => block.role === 'training') ?? nextBlocks[0];
    if (!nextTrainingBlock || thresholds.length === 0) return view;

    return {
      ...view,
      // Human label, not the raw cpd number — Progress screen keeps cpd for its
      // per-contributor breakdown; Today's "Next" line reuses humanBandLabel's
      // band mapping so a newcomer reads "Broad shapes", not "1.5 cpd".
      nextTargetLabel: `${humanBandLabel(nextTrainingBlock.condition.spatialFrequencyCpd)} · 4 min`,
    };
    // refreshKey is an intentional extra dependency: it busts the memo when the
    // screen regains focus so "today" boundaries recompute against a fresh now().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, sessions, settings.visionGoal, thresholds]);
  return { data, isLoading: !hydrated };
}
