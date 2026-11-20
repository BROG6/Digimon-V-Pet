import { registerPlugin, Capacitor } from '@capacitor/core';

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
  evolvedMessage?: string;
  nextEvoTriggerMsStr?: string;
  nextEvoPayloadJson?: string;
}

export interface OverlayPluginInterface {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ success: boolean; prompted?: boolean }>;
  startOverlay(options: OverlayLaunchParams): Promise<{ success: boolean }>;
  stopOverlay(): Promise<{ success: boolean }>;
  isOverlayActive(): Promise<{ active: boolean }>;
  consumePendingEvolution(): Promise<{ speciesId: string | null; evolvedAt: number }>;
  consumePendingCareActions(): Promise<{ meatUsed: number; vitUsed: number; praiseCount: number }>;
  enterPip(): Promise<{ success: boolean }>;
  requestNotificationPermission(): Promise<{ granted: boolean }>;
  showCareNotification(options: { id: number; title: string; body: string; tag?: string }): Promise<{ success: boolean }>;
  scheduleCareNotifications(options: {
    petName: string;
    hungryAtMs: string;
    starvingAtMs: string;
    nextPoopAtMs: string;
    nextPoopCount: number;
    poopFullAtMs: string;
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

export async function isNativeOverlayActive(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const res = await OverlayPlugin.isOverlayActive();
    return !!res?.active;
  } catch {
    return false;
  }
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
}> {
  if (!Capacitor.isNativePlatform()) return { meatUsed: 0, vitUsed: 0, praiseCount: 0 };
  try {
    const res = await OverlayPlugin.consumePendingCareActions();
    return {
      meatUsed: typeof res?.meatUsed === 'number' ? res.meatUsed : 0,
      vitUsed: typeof res?.vitUsed === 'number' ? res.vitUsed : 0,
      praiseCount: typeof res?.praiseCount === 'number' ? res.praiseCount : 0,
    };
  } catch {
    return { meatUsed: 0, vitUsed: 0, praiseCount: 0 };
  }
}
