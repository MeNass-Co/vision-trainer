import { afterEach, describe, expect, it, vi } from 'vitest';
import { Platform } from 'react-native';

import {
  applySessionBrightness,
  getCurrentBrightness,
  restoreCapturedBrightness,
} from './brightness';

const mocks = vi.hoisted(() => ({
  getBrightnessAsync: vi.fn<() => Promise<number>>(),
  restoreSystemBrightnessAsync: vi.fn<() => Promise<void>>(),
  setBrightnessAsync: vi.fn<(value: number) => Promise<void>>(),
}));

vi.mock('expo-brightness', () => mocks);

const platform = Platform as { OS: string };

describe('brightness service', () => {
  afterEach(async () => {
    // Drain any captured level so module-level state never leaks across tests.
    platform.OS = 'ios';
    await restoreCapturedBrightness();
    vi.clearAllMocks();
  });

  it('captures the current level once before the first apply (iOS)', async () => {
    mocks.getBrightnessAsync.mockResolvedValue(0.42);
    mocks.setBrightnessAsync.mockResolvedValue(undefined);

    await applySessionBrightness(0.9);
    await applySessionBrightness(0.8);

    expect(mocks.getBrightnessAsync).toHaveBeenCalledTimes(1);
    expect(mocks.setBrightnessAsync).toHaveBeenNthCalledWith(1, 0.9);
    expect(mocks.setBrightnessAsync).toHaveBeenNthCalledWith(2, 0.8);
  });

  it('restores the captured level via setBrightnessAsync on iOS, never restoreSystemBrightnessAsync', async () => {
    mocks.getBrightnessAsync.mockResolvedValue(0.42);
    mocks.setBrightnessAsync.mockResolvedValue(undefined);

    await applySessionBrightness(0.9);
    await restoreCapturedBrightness();

    expect(mocks.setBrightnessAsync).toHaveBeenLastCalledWith(0.42);
    expect(mocks.restoreSystemBrightnessAsync).not.toHaveBeenCalled();
  });

  it('restore is a no-op when nothing was captured', async () => {
    await restoreCapturedBrightness();

    expect(mocks.setBrightnessAsync).not.toHaveBeenCalled();
    expect(mocks.restoreSystemBrightnessAsync).not.toHaveBeenCalled();
  });

  it('re-captures after a restore (background then active cycle)', async () => {
    mocks.setBrightnessAsync.mockResolvedValue(undefined);
    mocks.getBrightnessAsync.mockResolvedValueOnce(0.42);

    await applySessionBrightness(0.9);
    await restoreCapturedBrightness();

    mocks.getBrightnessAsync.mockResolvedValueOnce(0.55);
    await applySessionBrightness(0.9);
    await restoreCapturedBrightness();

    expect(mocks.getBrightnessAsync).toHaveBeenCalledTimes(2);
    expect(mocks.setBrightnessAsync).toHaveBeenLastCalledWith(0.55);
  });

  it('uses restoreSystemBrightnessAsync on Android where it works', async () => {
    platform.OS = 'android';
    mocks.getBrightnessAsync.mockResolvedValue(0.42);
    mocks.setBrightnessAsync.mockResolvedValue(undefined);

    await applySessionBrightness(0.9);
    await restoreCapturedBrightness();

    expect(mocks.restoreSystemBrightnessAsync).toHaveBeenCalledTimes(1);
    expect(mocks.setBrightnessAsync).toHaveBeenCalledTimes(1);
    expect(mocks.setBrightnessAsync).toHaveBeenCalledWith(0.9);
  });

  it('clamps the applied level to [0, 1]', async () => {
    mocks.getBrightnessAsync.mockResolvedValue(0.42);
    mocks.setBrightnessAsync.mockResolvedValue(undefined);

    await applySessionBrightness(1.4);
    await applySessionBrightness(-0.2);

    expect(mocks.setBrightnessAsync).toHaveBeenNthCalledWith(1, 1);
    expect(mocks.setBrightnessAsync).toHaveBeenNthCalledWith(2, 0);
  });

  it('still applies when the capture read fails, and restore stays a no-op', async () => {
    mocks.getBrightnessAsync.mockRejectedValue(new Error('nope'));
    mocks.setBrightnessAsync.mockResolvedValue(undefined);

    await applySessionBrightness(0.9);
    expect(mocks.setBrightnessAsync).toHaveBeenCalledWith(0.9);

    mocks.setBrightnessAsync.mockClear();
    await restoreCapturedBrightness();
    expect(mocks.setBrightnessAsync).not.toHaveBeenCalled();
  });

  it('guards every call on web', async () => {
    platform.OS = 'web';

    await applySessionBrightness(0.9);
    await restoreCapturedBrightness();
    await expect(getCurrentBrightness()).resolves.toBeNull();

    expect(mocks.getBrightnessAsync).not.toHaveBeenCalled();
    expect(mocks.setBrightnessAsync).not.toHaveBeenCalled();
    expect(mocks.restoreSystemBrightnessAsync).not.toHaveBeenCalled();
  });
});
