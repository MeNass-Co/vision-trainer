import { describe, expect, it, vi } from 'vitest';

import { useAppStore } from './useAppStore';

const mockPersistence = vi.hoisted(() => ({
  init: vi.fn(async () => {}),
  loadSessions: vi.fn(async () => []),
  loadThresholds: vi.fn(async () => []),
  loadSettings: vi.fn(async () => null),
  saveSettings: vi.fn(async () => {}),
  saveSessionResult: vi.fn(async () => {}),
}));

vi.mock('@/data/persistence', () => ({ activePersistence: mockPersistence }));
vi.mock('@/theme/haptics', () => ({ setHapticsEnabled: vi.fn() }));

// These tests share the store singleton and run in declaration order,
// walking one degraded-boot narrative: fail, stay memory-only, retry, recover.
describe('useAppStore degraded boot', () => {
  it('flags a failed hydration but still marks the app hydrated', async () => {
    mockPersistence.init.mockRejectedValueOnce(new Error('sqlite unavailable'));

    await useAppStore.getState().hydrate();

    expect(useAppStore.getState().hydrated).toBe(true);
    expect(useAppStore.getState().hydrateFailed).toBe(true);
  });

  it('updates settings in memory but skips persistence while degraded', async () => {
    useAppStore.getState().updateSetting('soundEnabled', true);

    expect(useAppStore.getState().settings.soundEnabled).toBe(true);
    // Flush any stray microtasks: the save must never have been attempted.
    await Promise.resolve();
    expect(mockPersistence.saveSettings).not.toHaveBeenCalled();
  });

  it('retryHydrate clears the flag and re-enables persistence', async () => {
    await useAppStore.getState().retryHydrate();

    expect(useAppStore.getState().hydrateFailed).toBe(false);
    expect(useAppStore.getState().hydrated).toBe(true);

    useAppStore.getState().updateSetting('soundEnabled', true);
    await vi.waitFor(() => {
      expect(mockPersistence.saveSettings).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps the failed flag when the retry itself fails', async () => {
    mockPersistence.init.mockRejectedValueOnce(new Error('still broken'));

    await useAppStore.getState().retryHydrate();

    expect(useAppStore.getState().hydrateFailed).toBe(true);
  });

  it('warns and flags when a settings save fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Recover from the previous test's failed retry first.
    await useAppStore.getState().retryHydrate();
    expect(useAppStore.getState().hydrateFailed).toBe(false);

    mockPersistence.saveSettings.mockRejectedValueOnce(new Error('disk full'));
    useAppStore.getState().updateSetting('hapticsEnabled', false);

    await vi.waitFor(() => {
      expect(useAppStore.getState().settingsSaveFailed).toBe(true);
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
