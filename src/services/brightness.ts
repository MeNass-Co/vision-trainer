import * as Brightness from 'expo-brightness';
import { Platform } from 'react-native';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

// expo-brightness's restoreSystemBrightnessAsync is a verified NO-OP on iOS
// (it early-returns unless android). So we capture the level ourselves before
// the first session apply and set it back explicitly on iOS; Android keeps
// using the real system restore.
let capturedBrightness: number | null = null;
let capturePromise: Promise<void> | null = null;

async function captureCurrentBrightness(): Promise<void> {
  if (capturedBrightness !== null) return;
  if (!capturePromise) {
    capturePromise = Brightness.getBrightnessAsync()
      .then((value) => {
        if (capturedBrightness === null) capturedBrightness = value;
      })
      .catch(() => {})
      .finally(() => {
        capturePromise = null;
      });
  }
  await capturePromise;
}

export async function applySessionBrightness(value: number): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await captureCurrentBrightness();
    await Brightness.setBrightnessAsync(clamp01(value));
  } catch {}
}

export async function getCurrentBrightness(): Promise<number | null> {
  if (Platform.OS === 'web') return null;
  try {
    return await Brightness.getBrightnessAsync();
  } catch {
    return null;
  }
}

export async function restoreCapturedBrightness(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (capturedBrightness === null) return;
  const value = capturedBrightness;
  capturedBrightness = null;
  try {
    if (Platform.OS === 'android') {
      await Brightness.restoreSystemBrightnessAsync();
    } else {
      await Brightness.setBrightnessAsync(clamp01(value));
    }
  } catch {}
}
