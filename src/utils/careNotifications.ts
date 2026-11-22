import { Capacitor } from '@capacitor/core';
import { OverlayPlugin } from './nativeOverlay';
import { FutureCareAlertSchedule } from './carePacing';

const ALERTS_PREF_KEY = 'digipet_care_alerts_enabled_v1';

let webAlarmTimers: number[] = [];

export function getCareAlertsEnabled(): boolean {
  try {
    const val = localStorage.getItem(ALERTS_PREF_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setCareAlertsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ALERTS_PREF_KEY, enabled ? 'true' : 'false');
  } catch {}
}

export function isAppVisibleInForeground(): boolean {
  if (typeof document === 'undefined') return false;
  return document.visibilityState === 'visible';
}

export async function requestCareNotificationPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await OverlayPlugin.requestNotificationPermission();
      return res?.granted ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

export async function sendCareSystemNotification(params: {
  id: number;
  title: string;
  body: string;
  tag: string;
}): Promise<boolean> {
  if (!getCareAlertsEnabled()) return false;

  if (Capacitor.isNativePlatform()) {
    try {
      // Native Android checks isAppInForeground && !isScreenLockedOrOff(ctx) so locked-screen alerts still fire
      const res = await OverlayPlugin.showCareNotification({
        id: params.id,
        title: params.title,
        body: params.body,
        tag: params.tag,
      });
      return Boolean(res?.success);
    } catch {
      return false;
    }
  }

  // Web notifications must NOT fire while actively inside the game tab
  if (isAppVisibleInForeground()) {
    return false;
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(params.title, {
          body: params.body,
          tag: params.tag,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
        });
        return true;
      }
    }
    new Notification(params.title, {
      body: params.body,
      tag: params.tag,
      icon: '/pwa-192x192.png',
    });
    return true;
  } catch {
    return false;
  }
}

function clearWebAlarmTimers(): void {
  if (typeof window === 'undefined') return;
  for (const id of webAlarmTimers) {
    window.clearTimeout(id);
  }
  webAlarmTimers = [];
}

/**
 * Schedules background Hunger & Toilet notifications for exact future timestamps.
 * - On Native Android: sets AlarmManager alarms via OverlayPlugin so alerts fire
 *   even when the app is closed or backgrounded (and skips while in foreground).
 * - On Web/PWA: sets future timers that only notify if the tab is backgrounded.
 */
export async function syncBackgroundCareAlarms(params: {
  enabled: boolean;
  petName: string;
  schedule: FutureCareAlertSchedule;
}): Promise<void> {
  clearWebAlarmTimers();

  const { enabled, petName, schedule } = params;
  const hasAny =
    enabled &&
    (schedule.hungryAtMs > 0 ||
      schedule.starvingAtMs > 0 ||
      schedule.nextPoopAtMs > 0 ||
      schedule.poop2AtMs > 0 ||
      schedule.poop3AtMs > 0 ||
      schedule.poopFullAtMs > 0 ||
      schedule.bedtimeAtMs > 0);

  if (Capacitor.isNativePlatform()) {
    try {
      if (!hasAny) {
        await OverlayPlugin.cancelCareNotifications();
      } else {
        await OverlayPlugin.scheduleCareNotifications({
          petName,
          hungryAtMs: String(schedule.hungryAtMs || 0),
          starvingAtMs: String(schedule.starvingAtMs || 0),
          nextPoopAtMs: String(schedule.nextPoopAtMs || 0),
          nextPoopCount: schedule.nextPoopCount || 1,
          poop2AtMs: String(schedule.poop2AtMs || 0),
          poop3AtMs: String(schedule.poop3AtMs || 0),
          poopFullAtMs: String(schedule.poopFullAtMs || 0),
          bedtimeAtMs: String(schedule.bedtimeAtMs || 0),
        });
      }
    } catch {}
    return;
  }

  if (!hasAny || typeof window === 'undefined') return;

  const now = Date.now();
  const MAX_WEB_TIMEOUT_MS = 2_147_483_000;

  const queueWebAlarm = (
    triggerAtMs: number,
    payload: { id: number; title: string; body: string; tag: string }
  ) => {
    if (!triggerAtMs || triggerAtMs <= now) return;
    const delay = triggerAtMs - now;
    if (delay > MAX_WEB_TIMEOUT_MS) return;
    const tid = window.setTimeout(() => {
      if (!isAppVisibleInForeground()) {
        sendCareSystemNotification(payload);
      }
    }, delay);
    webAlarmTimers.push(tid);
  };

  queueWebAlarm(schedule.hungryAtMs, {
    id: 2001,
    title: `🍖 Hunger Alert: ${petName}`,
    body: `${petName} is getting hungry (1 heart left)! Time to feed Big Meat.`,
    tag: 'digipet-hunger',
  });

  queueWebAlarm(schedule.starvingAtMs, {
    id: 2001,
    title: `🚨 ${petName} is Starving!`,
    body: `${petName} hit 0% hunger! Feed within 10 minutes before a Care Mistake.`,
    tag: 'digipet-hunger',
  });

  queueWebAlarm(schedule.nextPoopAtMs, {
    id: 2002,
    title: `💩 Toilet Alert: ${petName}`,
    body:
      schedule.nextPoopCount >= 4
        ? `${petName} has 4 toilet piles — got sick & +1 Care Mistake! Flush & cure now.`
        : `${petName} needs the toilet! (${schedule.nextPoopCount}/4 piles)`,
    tag: 'digipet-toilet',
  });

  queueWebAlarm(schedule.poop2AtMs, {
    id: 2002,
    title: `💩 Toilet Alert: ${petName}`,
    body: `${petName} needs the toilet! (${Math.min(3, schedule.nextPoopCount + 1)}/4 piles)`,
    tag: 'digipet-toilet',
  });

  queueWebAlarm(schedule.poop3AtMs, {
    id: 2002,
    title: `💩 Toilet Alert: ${petName}`,
    body: `${petName} needs the toilet! (3/4 piles — flush soon!)`,
    tag: 'digipet-toilet',
  });

  queueWebAlarm(schedule.poopFullAtMs, {
    id: 2002,
    title: `🚨 Toilet Full Alert: ${petName}`,
    body: `${petName} hit 4 toilet piles — got sick & +1 Care Mistake! Flush & give medicine right away.`,
    tag: 'digipet-toilet',
  });

  queueWebAlarm(schedule.bedtimeAtMs, {
    id: 2005,
    title: `🌙 Bedtime Alert: ${petName}`,
    body: `${petName} is sleepy! Turn the lights off within 10 minutes to avoid a Care Mistake.`,
    tag: 'digipet-bedtime',
  });
}
