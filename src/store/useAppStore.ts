import { create } from 'zustand';

import type { SettingsState } from '@/presenters/types';
import type { SessionLog, ThresholdEstimate } from '@/types';
import { activePersistence as persistence } from '@/data/persistence';
import { setHapticsEnabled } from '@/theme/haptics';

import { DEFAULT_SETTINGS } from './defaults';

type AppState = {
  hydrated: boolean;
  hydrateFailed: boolean;
  settingsSaveFailed: boolean;
  settings: SettingsState;
  sessions: SessionLog[];
  thresholds: ThresholdEstimate[];
  hydrate: () => Promise<void>;
  retryHydrate: () => Promise<void>;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  recordSessionResult: (session: SessionLog, thresholds: ThresholdEstimate[]) => Promise<void>;
};

// Shared across re-entrant calls so React Strict Mode's dev double-mount runs
// init/load exactly once instead of racing two concurrent hydrations.
let hydration: Promise<void> | null = null;

export const useAppStore = create<AppState>((set, get) => {
  const loadIntoStore = async () => {
    await persistence.init();
    const [sessions, thresholds, settings] = await Promise.all([
      persistence.loadSessions(),
      persistence.loadThresholds(),
      persistence.loadSettings(),
    ]);
    const finalSettings = { ...DEFAULT_SETTINGS, ...(settings ?? {}) };

    setHapticsEnabled(finalSettings.hapticsEnabled);
    set({ sessions, thresholds, settings: finalSettings, hydrated: true, hydrateFailed: false });
  };

  return {
    hydrated: false,
    hydrateFailed: false,
    settingsSaveFailed: false,
    settings: DEFAULT_SETTINGS,
    sessions: [],
    thresholds: [],

    hydrate: () => {
      if (get().hydrated) return Promise.resolve();
      if (hydration) return hydration;
      hydration = (async () => {
        try {
          await loadIntoStore();
        } catch {
          // Degraded boot (e.g. sqlite unavailable): render with defaults/empty
          // state, but flag it so nothing persists over the real (unread) data.
          set({ hydrated: true, hydrateFailed: true });
        }
      })();
      return hydration;
    },

    retryHydrate: async () => {
      try {
        await loadIntoStore();
      } catch {
        set({ hydrateFailed: true });
      }
    },

    updateSetting: (key, value) => {
      const settings = { ...get().settings, [key]: value };

      set({ settings });
      if (key === 'hapticsEnabled') setHapticsEnabled(value as boolean);
      // Degraded boot: the on-disk record never loaded, so persisting now would
      // overwrite the user's real settings with defaults. Memory only until
      // retryHydrate succeeds.
      if (get().hydrateFailed) return;
      void persistence.saveSettings(settings).catch((error: unknown) => {
        console.warn('[settings] failed to persist', error);
        set({ settingsSaveFailed: true });
      });
    },

    recordSessionResult: async (session, thresholds) => {
      await persistence.saveSessionResult(session, thresholds);
      set((state) => ({
        sessions: [...state.sessions, session],
        thresholds: [...state.thresholds, ...thresholds],
      }));
    },
  };
});
