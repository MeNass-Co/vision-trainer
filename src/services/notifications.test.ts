import { describe, expect, it } from 'vitest';
import { notificationService, setSessionActive } from './notifications';

describe('notificationService (base/web)', () => {
  it('reports reminders as not permitted without throwing', async () => {
    await expect(notificationService.requestRemindersPermission()).resolves.toEqual({
      granted: false,
      canAskAgain: true,
    });
  });
  it('schedule/cancel are safe no-ops', async () => {
    await expect(notificationService.scheduleDailyReminder(19, 0)).resolves.toBeUndefined();
    await expect(notificationService.cancelDailyReminder()).resolves.toBeUndefined();
  });
  it('response listener and session flag are safe no-ops', () => {
    expect(() => setSessionActive(true)).not.toThrow();
    expect(() => setSessionActive(false)).not.toThrow();
    const unsubscribe = notificationService.addResponseListener(() => {});
    expect(() => unsubscribe()).not.toThrow();
  });
});
