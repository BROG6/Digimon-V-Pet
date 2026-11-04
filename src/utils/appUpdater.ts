import { registerPlugin, Capacitor } from '@capacitor/core';

export interface UpdateManifest {
  versionName: string;
  versionCode: number;
  releaseDate: string;
  releaseName?: string;
  changelog: string[];
  apkDownloadUrl: string;
  apkFileName?: string;
  apkFileSize?: string;
  isMandatory?: boolean;
}

export interface AppInfo {
  versionName: string;
  versionCode: number;
  packageName: string;
  isNative: boolean;
}

export interface AppUpdatePluginInterface {
  getAppInfo(): Promise<AppInfo>;
  checkInstallPermission(): Promise<{ granted: boolean }>;
  requestInstallPermission(): Promise<{ success: boolean; prompted?: boolean }>;
  downloadAndInstallApk(options: { apkUrl: string; fileName?: string }): Promise<{
    success: boolean;
    installed?: boolean;
    needsPermission?: boolean;
    message?: string;
  }>;
  openExternalUrl(options: { url: string }): Promise<{ success: boolean }>;
  reloadWebAssets(): Promise<{ success: boolean }>;
}

export const AppUpdatePlugin = registerPlugin<AppUpdatePluginInterface>('AppUpdatePlugin');

const AUTO_CHECK_KEY = 'digipet_auto_check_updates_v1';
const CUSTOM_URL_KEY = 'digipet_custom_update_url_v1';
const LAST_CHECK_KEY = 'digipet_last_update_check_v1';

// Base fallback version when running in browser or preview
export const DEFAULT_APP_INFO: AppInfo = {
  versionName: '1.0.0',
  versionCode: 1,
  packageName: 'com.digipet.companion',
  isNative: false,
};

export async function getLocalAppInfo(): Promise<AppInfo> {
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await AppUpdatePlugin.getAppInfo();
      if (info && info.versionName) {
        return {
          ...info,
          isNative: true,
        };
      }
    } catch (err) {
      console.warn('Could not query native AppUpdatePlugin info:', err);
    }
  }
  return {
    ...DEFAULT_APP_INFO,
    isNative: Capacitor.isNativePlatform(),
  };
}

export async function checkInstallPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  try {
    const res = await AppUpdatePlugin.checkInstallPermission();
    return !!res?.granted;
  } catch (e) {
    console.warn('checkInstallPermission error:', e);
    return true;
  }
}

export async function requestInstallPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  try {
    const res = await AppUpdatePlugin.requestInstallPermission();
    return !!res?.success;
  } catch (e) {
    console.warn('requestInstallPermission error:', e);
    return false;
  }
}

// Compare semantic version strings (e.g. "1.1.0" > "1.0.0")
export function isVersionNewer(remoteVer: string, localVer: string): boolean {
  try {
    const rParts = remoteVer.replace(/[^0-9.]/g, '').split('.').map((n) => parseInt(n || '0', 10));
    const lParts = localVer.replace(/[^0-9.]/g, '').split('.').map((n) => parseInt(n || '0', 10));
    for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
      const r = rParts[i] || 0;
      const l = lParts[i] || 0;
      if (r > l) return true;
      if (r < l) return false;
    }
  } catch {}
  return remoteVer !== localVer;
}

export async function checkForUpdate(customUrl?: string): Promise<{
  updateAvailable: boolean;
  manifest: UpdateManifest | null;
  currentInfo: AppInfo;
  error?: string;
}> {
  const currentInfo = await getLocalAppInfo();
  const urlToFetch = customUrl || getCustomUpdateUrl() || '/version.json';

  try {
    const res = await fetch(urlToFetch, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const manifest: UpdateManifest = await res.json();
    localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());

    // Compare versionCode or versionName
    const hasNewerCode = (manifest.versionCode || 0) > (currentInfo.versionCode || 0);
    const hasNewerVer = isVersionNewer(manifest.versionName || '1.0.0', currentInfo.versionName || '1.0.0');
    const updateAvailable = hasNewerCode || hasNewerVer;

    return {
      updateAvailable,
      manifest,
      currentInfo,
    };
  } catch (err: any) {
    console.warn('Failed to check for updates:', err);
    return {
      updateAvailable: false,
      manifest: null,
      currentInfo,
      error: err.message || 'Could not connect to update server',
    };
  }
}

export async function downloadAndInstallApk(
  apkUrl: string,
  fileName: string = 'digipet-latest.apk'
): Promise<{ success: boolean; needsPermission?: boolean; message?: string }> {
  // Resolve relative URLs to absolute if needed
  let fullUrl = apkUrl;
  if (fullUrl.startsWith('/')) {
    if (typeof window !== 'undefined') {
      fullUrl = window.location.origin + fullUrl;
    }
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const res = await AppUpdatePlugin.downloadAndInstallApk({
        apkUrl: fullUrl,
        fileName,
      });
      return res;
    } catch (err: any) {
      console.warn('Native downloadAndInstallApk failed:', err);
      // Fallback: attempt to open in browser
      await openExternalUrl(fullUrl);
      return { success: false, message: err.message };
    }
  }

  // Fallback in web browser: open download link
  if (typeof window !== 'undefined') {
    window.open(fullUrl, '_blank');
  }
  return { success: true };
}

export async function openExternalUrl(url: string): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await AppUpdatePlugin.openExternalUrl({ url });
      return !!res?.success;
    } catch {
      // Fallback
    }
  }
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
  return true;
}

export async function reloadLiveAssets(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      await AppUpdatePlugin.reloadWebAssets();
      return true;
    } catch {
      // fallback
    }
  }
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
  return true;
}

// User Preferences in localStorage
export function getAutoCheckEnabled(): boolean {
  try {
    const val = localStorage.getItem(AUTO_CHECK_KEY);
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
}

export function setAutoCheckEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_CHECK_KEY, enabled ? 'true' : 'false');
  } catch {}
}

export function getCustomUpdateUrl(): string {
  try {
    return localStorage.getItem(CUSTOM_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function setCustomUpdateUrl(url: string): void {
  try {
    localStorage.setItem(CUSTOM_URL_KEY, url.trim());
  } catch {}
}

export function getLastCheckTime(): number {
  try {
    return parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
  } catch {
    return 0;
  }
}
