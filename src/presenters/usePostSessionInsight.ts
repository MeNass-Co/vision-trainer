import { useMemo } from 'react';

import { useAppStore } from '@/store/useAppStore';

import { derivePostSessionInsight } from './derive';
import type { Loadable, PostSessionInsightView } from './types';

export function usePostSessionInsight(sessionId: string | null): Loadable<PostSessionInsightView | null> {
  const hydrated = useAppStore((state) => state.hydrated);
  const sessions = useAppStore((state) => state.sessions);
  const thresholds = useAppStore((state) => state.thresholds);

  const data = useMemo(() => {
    // No fallback to "latest completed session": a null id must never surface
    // some other session's results as this one's.
    if (!sessionId) return null;

    return derivePostSessionInsight(sessions, thresholds, sessionId);
  }, [sessionId, sessions, thresholds]);

  return { data, isLoading: !hydrated };
}
