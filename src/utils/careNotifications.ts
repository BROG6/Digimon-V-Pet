import { Capacitor } from '@capacitor/core';
import { OverlayPlugin } from './nativeOverlay';

const ALERTS_PREF_KEY = 'digipet_care_alerts_enabled_v1';

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
