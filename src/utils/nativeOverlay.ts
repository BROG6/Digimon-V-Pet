import { registerPlugin, Capacitor, PluginListenerHandle } from '@capacitor/core';

export interface OverlayLaunchParams {
  speciesName: string;
  spriteUrl: string;
  sheetWidth?: number;
  sheetHeight?: number;
  stageWidth?: number;
  stageHeight?: number;
  groundOffset?: number;
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  frameRotate?: number;
  standingFramesJson?: string;
  walkingFramesJson?: string;
  sleepingFramesJson?: string;
  quotesJson?: string;
  isFlying?: boolean;
  isSleeping?: boolean;
  gridRowRatiosJson?: string;
  previewRowIndex?: number;
  hunger?: number;
  happiness?: number;
  bigMeatStock?: number;
  vitaminStock?: number;
  stage?: string;
  isFrozen?: boolean;
  hungerHeartMsStr?: string;
  lastHungerDropAtMsStr?: string;
  evolvedMessage?: string;
  nextEvoTriggerMsStr?: string;
  nextEvoPayloadJson?: string;
}

export interface OverlayPluginInterface {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ success: boolean; prompted?: boolean }>;
  startOverlay(options: OverlayLaunchParams): Promise<{ success: boolean }>;
  stopOverlay(): Promise<{ success: boolean }>;
  departForBattle(options?: { reason?: 'battle' | 'adventure' }): Promise<{ started: boolean }>;
  isOverlayActive(): Promise<{ active: boolean }>;
  addListener(
    eventName: 'overlayStateChanged',
    listenerFunc: (event: { active: boolean }) => void
  ): Promise<PluginListenerHandle>;
  consumePendingEvolution(): Promise<{ speciesId: string | null; evolvedAt: number }>;
  consumePendingCareActions(): Promise<{
    meatUsed: number;
    vitUsed: number;
    praiseCount: number;
    lastMeatAtMs?: number;
  }>;
  enterPip(): Promise<{ success: boolean }>;
  requestNotificationPermission(): Promise<{ granted: boolean }>;
  showCareNotification(options: { id: number; title: string; body: string; tag?: string }): Promise<{ success: boolean }>;
  scheduleCareNotifications(options: {
    petName: string;
    hungryAtMs: string;
    starvingAtMs: string;
    nextPoopAtMs: string;
    nextPoopCount: number;
    poop2AtMs?: string;
    poop3AtMs?: string;
    poopFullAtMs: string;
    bedtimeAtMs?: string;
  }): Promise<{ success: boolean }>;
  cancelCareNotifications(): Promise<{ success: boolean }>;
}

export const OverlayPlugin = registerPlugin<OverlayPluginInterface>('OverlayPlugin');

export async function checkOverlayPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  try {
    const res = await OverlayPlugin.checkPermission();
    return !!res?.granted;
  } catch (err) {
    console.warn('checkOverlayPermission error:', err);
    return false;
  }
}

export async function requestOverlayPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  try {
    const res = await OverlayPlugin.requestPermission();
    return !!res?.success;
  } catch (err) {
    console.warn('requestOverlayPermission error:', err);
    return false;
  }
}

export async function startNativeFloatingOverlay(params: OverlayLaunchParams): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    // If permission is not granted, immediately ask for it
    const granted = await checkOverlayPermission();
    if (!granted) {
      await requestOverlayPermission();
      return false;
    }
    const res = await OverlayPlugin.startOverlay(params);
    return !!res?.success;
  } catch (err) {
    console.warn('startNativeFloatingOverlay error:', err);
    return false;
  }
}

export async function stopNativeFloatingOverlay(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const res = await OverlayPlugin.stopOverlay();
    return !!res?.success;
  } catch (err) {
    console.warn('stopNativeFloatingOverlay error:', err);
    return false;
  }
}

export async function departNativeOverlayForBattle(
  reason: 'battle' | 'adventure' = 'battle'
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const res = await OverlayPlugin.departForBattle({ reason });
    return !!res?.started;
  } catch (err) {
    console.warn('departNativeOverlayForBattle error:', err);
    return false;
  }
}

export async function isNativeOverlayActive(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const res = await OverlayPlugin.isOverlayActive();
    return !!res?.active;
  } catch {
    return false;
  }
}

export function onNativeOverlayStateChanged(listener: (active: boolean) => void): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};
  let disposed = false;
  let handle: PluginListenerHandle | null = null;

  OverlayPlugin.addListener('overlayStateChanged', (event) => {
    if (!disposed) {
      listener(Boolean(event?.active));
    }
  })
    .then((h) => {
      if (disposed) {
        h.remove().catch(() => {});
      } else {
        handle = h;
      }
    })
    .catch(() => {});

  return () => {
    disposed = true;
    if (handle) {
      handle.remove().catch(() => {});
      handle = null;
    }
  };
}

export async function consumeNativeOverlayEvolution(): Promise<{ speciesId: string | null; evolvedAt: number }> {
  if (!Capacitor.isNativePlatform()) return { speciesId: null, evolvedAt: 0 };
  try {
    const res = await OverlayPlugin.consumePendingEvolution();
    return {
      speciesId: res?.speciesId || null,
      evolvedAt: typeof res?.evolvedAt === 'number' ? res.evolvedAt : 0,
    };
  } catch {
    return { speciesId: null, evolvedAt: 0 };
  }
}

export async function consumeNativeOverlayCareActions(): Promise<{
  meatUsed: number;
  vitUsed: number;
  praiseCount: number;
  lastMeatAtMs: number;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { meatUsed: 0, vitUsed: 0, praiseCount: 0, lastMeatAtMs: 0 };
  }
  try {
    const res = await OverlayPlugin.consumePendingCareActions();
    return {
      meatUsed: typeof res?.meatUsed === 'number' ? res.meatUsed : 0,
      vitUsed: typeof res?.vitUsed === 'number' ? res.vitUsed : 0,
      praiseCount: typeof res?.praiseCount === 'number' ? res.praiseCount : 0,
      lastMeatAtMs: typeof res?.lastMeatAtMs === 'number' ? res.lastMeatAtMs : 0,
    };
  } catch {
    return { meatUsed: 0, vitUsed: 0, praiseCount: 0, lastMeatAtMs: 0 };
  }
}
