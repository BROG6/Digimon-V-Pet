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
  quotesJson?: string;
  isFlying?: boolean;
  gridRowRatiosJson?: string;
  previewRowIndex?: number;
  hunger?: number;
  happiness?: number;
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
  enterPip(): Promise<{ success: boolean }>;
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
