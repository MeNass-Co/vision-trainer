import { describe, expect, it } from 'vitest';

import { effectiveSubscription, isTrialExpired } from './subscription';

const TRIAL_START = '2026-06-01T00:00:00.000Z';

function daysAfterStart(days: number): Date {
  return new Date(Date.parse(TRIAL_START) + days * 24 * 60 * 60 * 1000);
}

describe('isTrialExpired', () => {
  it('is not expired just inside the 7-day window', () => {
    expect(isTrialExpired(TRIAL_START, 7, daysAfterStart(6.9))).toBe(false);
  });

  it('is expired just past the 7-day window', () => {
    expect(isTrialExpired(TRIAL_START, 7, daysAfterStart(7.1))).toBe(true);
  });

  it('is not expired exactly at the boundary', () => {
    expect(isTrialExpired(TRIAL_START, 7, daysAfterStart(7))).toBe(false);
  });

  it('defaults to a 7-day window', () => {
    expect(isTrialExpired(TRIAL_START, undefined, daysAfterStart(7.1))).toBe(true);
    expect(isTrialExpired(TRIAL_START, undefined, daysAfterStart(6.9))).toBe(false);
  });

  it('honours a custom window length', () => {
    expect(isTrialExpired(TRIAL_START, 14, daysAfterStart(7.1))).toBe(false);
    expect(isTrialExpired(TRIAL_START, 14, daysAfterStart(14.1))).toBe(true);
  });

  it('never expires when no trial was started', () => {
    expect(isTrialExpired(null, 7, daysAfterStart(100))).toBe(false);
  });

  it('treats a malformed timestamp as not expired', () => {
    expect(isTrialExpired('not-a-date', 7, daysAfterStart(100))).toBe(false);
  });
});

describe('effectiveSubscription', () => {
  it('downgrades an expired trial to free', () => {
    expect(
      effectiveSubscription(
        { subscriptionStatus: 'trialing', trialStartedAt: TRIAL_START },
        daysAfterStart(7.1)
      )
    ).toBe('free');
  });

  it('keeps a live trial trialing', () => {
    expect(
      effectiveSubscription(
        { subscriptionStatus: 'trialing', trialStartedAt: TRIAL_START },
        daysAfterStart(6.9)
      )
    ).toBe('trialing');
  });

  it('passes active through regardless of trial age', () => {
    expect(
      effectiveSubscription(
        { subscriptionStatus: 'active', trialStartedAt: TRIAL_START },
        daysAfterStart(100)
      )
    ).toBe('active');
  });

  it('passes free through', () => {
    expect(
      effectiveSubscription({ subscriptionStatus: 'free', trialStartedAt: null }, daysAfterStart(1))
    ).toBe('free');
  });

  it('keeps a trialing record without a start date trialing', () => {
    expect(
      effectiveSubscription(
        { subscriptionStatus: 'trialing', trialStartedAt: null },
        daysAfterStart(100)
      )
    ).toBe('trialing');
  });
});
