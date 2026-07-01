import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { haptics, setHapticsEnabled } from './haptics';

const mocks = vi.hoisted(() => ({
  impactAsync: vi.fn(() => Promise.resolve()),
  notificationAsync: vi.fn(() => Promise.resolve()),
  selectionAsync: vi.fn(() => Promise.resolve()),
}));

vi.mock('expo-haptics', () => ({
  ...mocks,
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

describe('haptics.rewardChord', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setHapticsEnabled(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('fires the success note now and two light impacts at 120ms and 240ms', () => {
    const cancel = haptics.rewardChord();

    expect(mocks.notificationAsync).toHaveBeenCalledWith('success');
    expect(mocks.impactAsync).not.toHaveBeenCalled();

    vi.advanceTimersByTime(240);
    expect(mocks.impactAsync).toHaveBeenCalledTimes(2);
    expect(mocks.impactAsync).toHaveBeenCalledWith('light');
    cancel();
  });

  it('cancel clears both pending impacts', () => {
    const cancel = haptics.rewardChord();

    cancel();
    vi.advanceTimersByTime(1000);

    expect(mocks.impactAsync).not.toHaveBeenCalled();
  });

  it('cancel after the first impact clears only the second', () => {
    const cancel = haptics.rewardChord();

    vi.advanceTimersByTime(120);
    expect(mocks.impactAsync).toHaveBeenCalledTimes(1);

    cancel();
    vi.advanceTimersByTime(1000);
    expect(mocks.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('returns a safe no-op cancel when haptics are disabled', () => {
    setHapticsEnabled(false);

    const cancel = haptics.rewardChord();
    vi.advanceTimersByTime(1000);

    expect(mocks.notificationAsync).not.toHaveBeenCalled();
    expect(mocks.impactAsync).not.toHaveBeenCalled();
    expect(() => cancel()).not.toThrow();
  });
});
