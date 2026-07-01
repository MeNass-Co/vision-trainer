/**
 * Notification service contract. The device build resolves `notifications.native.ts`
 * (real native notifications); this base impl is a no-op used on web and in tests so
 * the native dependency never enters the web bundle — mirroring the persistence split.
 */
export type ReminderPermissionResult = {
  granted: boolean;
  /** False when the OS will no longer show the permission prompt (user must use Settings). */
  canAskAgain: boolean;
};

export type NotificationService = {
  /** Resolves the permission state after the request. Never granted on web/tests. */
  requestRemindersPermission(): Promise<ReminderPermissionResult>;
  /** Schedule (or reschedule) the single daily reminder at the given local time. */
  scheduleDailyReminder(hour: number, minute: number): Promise<void>;
  /** Cancel the daily reminder. */
  cancelDailyReminder(): Promise<void>;
  /** Subscribe to notification taps; returns an unsubscribe. No-op on web/tests. */
  addResponseListener(onResponse: () => void): () => void;
};

/**
 * Marks a training session as active so foreground banners stay out of the
 * measurement field. No-op on web/tests.
 */
export function setSessionActive(_active: boolean): void {
  // No foreground banner surface on web/tests.
}

const noopNotificationService: NotificationService = {
  async requestRemindersPermission() {
    return { granted: false, canAskAgain: true };
  },
  async scheduleDailyReminder() {
    // No scheduling surface on web/tests.
  },
  async cancelDailyReminder() {
    // Nothing scheduled.
  },
  addResponseListener() {
    return () => {
      // Nothing subscribed.
    };
  },
};

export const notificationService: NotificationService = noopNotificationService;
