import type { SettingsState } from '@/presenters/types';

export const TRIAL_LENGTH_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Pure helper for the future IAP gate. Nothing is enforced anywhere yet;
 * screens keep reading `subscriptionStatus` as-is until purchases land.
 *
 * A null start means no trial ever began, so nothing has expired. A malformed
 * timestamp also reports not-expired: with no enforcement wired up this is a
 * no-op either way, and it never punishes a user for a corrupt row.
 */
export function isTrialExpired(
  trialStartedAt: string | null,
  days: number = TRIAL_LENGTH_DAYS,
  now: Date = new Date()
): boolean {
  if (trialStartedAt === null) return false;

  const startedMs = Date.parse(trialStartedAt);
  if (!Number.isFinite(startedMs)) return false;

  return now.getTime() - startedMs > days * MS_PER_DAY;
}

/**
 * The subscription status the app should act on: a 'trialing' record whose
 * trial window has lapsed is effectively 'free'. Everything else passes through.
 */
export function effectiveSubscription(
  settings: Pick<SettingsState, 'subscriptionStatus' | 'trialStartedAt'>,
  now: Date = new Date()
): SettingsState['subscriptionStatus'] {
  if (
    settings.subscriptionStatus === 'trialing' &&
    isTrialExpired(settings.trialStartedAt, TRIAL_LENGTH_DAYS, now)
  ) {
    return 'free';
  }

  return settings.subscriptionStatus;
}
