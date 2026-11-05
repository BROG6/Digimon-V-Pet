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
  fetchManifest(options: { url?: string }): Promise<{ data: string }>;
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
const CUSTOM_APK_URL_KEY = 'digipet_custom_apk_download_url_v1';
const LAST_CHECK_KEY = 'digipet_last_update_check_v1';

// Official Cloud Run deployment URL for DigiPet
export const DEFAULT_PRODUCTION_URL = 'https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app';

// Base fallback version when running in browser or preview
export const DEFAULT_APP_INFO: AppInfo = {
  versionName: '1.0.0',
  versionCode: 1,
  packageName: 'com.digipet.companion',
  isNative: false,
};

// Verified latest build release manifest
export const DEFAULT_BUNDLED_MANIFEST: UpdateManifest = {
  versionName: '1.1.0',
  versionCode: 2,
  releaseDate: '2026-11-04',
  releaseName: 'Companion Roaming & Auto-Updater Update',
  changelog: [
    'Fixed Botamon and rotated Digimon sideways orientation to upright alignment',
    'Animated autonomous walking, step cycling, and roaming across the screen',
    'Floating speech bubbles with authentic Digimon dialogue lines',
    'Movable floating overlay: touch and drag anywhere over other apps',
    'Native in-app auto-updater: background APK download & seamless installer',
    'Over-The-Air (OTA) live web asset reload & cache refresh'
  ],
  apkDownloadUrl: `${DEFAULT_PRODUCTION_URL}/api/download-apk`,
  apkFileName: 'digipet-v1.1.0.apk',
  apkFileSize: '18.5 MB',
  isMandatory: false,
};

/**
 * Resolves the server origin base URL.
 * NEVER returns localhost on native mobile devices where localhost refers to the phone itself.
 */
export function resolveServerBaseUrl(): string {
  const custom = getCustomUpdateUrl();
  if (custom && (custom.startsWith('http://') || custom.startsWith('https://'))) {
    try {
      const u = new URL(custom);
      if (!u.hostname.includes('localhost') && !u.hostname.includes('127.0.0.1')) {
        return u.origin;
      }
    } catch {}
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    // In Capacitor on Android, origin is "https://localhost". NEVER use localhost for mobile APK downloads!
    if (
      !origin.includes('localhost') && 
      !origin.includes('127.0.0.1') && 
      !origin.startsWith('capacitor:') &&
      !origin.startsWith('ionic:') &&
      !origin.startsWith('file:')
    ) {
      return origin;
    }
  }

  return DEFAULT_PRODUCTION_URL;
}

/**
 * Converts any relative endpoint (/api/...) into an absolute remote URL.
 * Also rewrites any accidental localhost URLs to the production host when on mobile.
 */
export function resolveFullUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return `${DEFAULT_PRODUCTION_URL}/api/download-apk`;

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    // If a URL points to localhost while inside a native APK on mobile, rewrite host to production server
    if (Capacitor.isNativePlatform() && (pathOrUrl.includes('localhost') || pathOrUrl.includes('127.0.0.1'))) {
      try {
        const u = new URL(pathOrUrl);
        return `${DEFAULT_PRODUCTION_URL}${u.pathname}${u.search}`;
      } catch {
        return `${DEFAULT_PRODUCTION_URL}/api/download-apk`;
      }
    }
    return pathOrUrl;
  }

  const base = resolveServerBaseUrl();
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${cleanPath}`;
}

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
    const rParts = (remoteVer || '1.1.0').replace(/[^0-9.]/g, '').split('.').map((n) => parseInt(n || '0', 10));
    const lParts = (localVer || '1.0.0').replace(/[^0-9.]/g, '').split('.').map((n) => parseInt(n || '0', 10));
    for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
      const r = rParts[i] ?? 0;
      const l = lParts[i] ?? 0;
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
  isFallback?: boolean;
}> {
  const currentInfo = await getLocalAppInfo();

  // Smart check: If user accidentally pasted an APK URL in the manifest field, fix it!
  const rawCustom = customUrl || getCustomUpdateUrl();
  if (rawCustom && (rawCustom.endsWith('.apk') || rawCustom.includes('/download-apk'))) {
    setCustomApkUrl(rawCustom);
    setCustomUpdateUrl('');
  }

  const customManifest = getCustomUpdateUrl();
  const targetUrl = customManifest
    ? resolveFullUrl(customManifest)
    : resolveFullUrl('/api/app-version');

  let manifest: UpdateManifest | null = null;
  let fetchError: string | null = null;

  // Step 1: In native Android, try native HTTP connection first (bypasses browser CORS & origin restrictions)
  if (Capacitor.isNativePlatform()) {
    try {
      const nativeRes = await AppUpdatePlugin.fetchManifest({ url: targetUrl });
      if (nativeRes && nativeRes.data) {
        manifest = JSON.parse(nativeRes.data);
      }
    } catch (nativeErr: any) {
      console.warn('Native fetchManifest error:', nativeErr);
      fetchError = nativeErr.message || 'Native fetch failed';
    }
  }

  // Step 2: If native fetch didn't return manifest, try standard fetch
  if (!manifest) {
    try {
      const res = await fetch(targetUrl, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const text = await res.text();
        try {
          manifest = JSON.parse(text);
        } catch {
          fetchError = 'Server returned non-JSON response';
        }
      } else {
        fetchError = `Server returned status ${res.status}`;
      }
    } catch (webErr: any) {
      console.warn('Web fetch error:', webErr);
      if (!fetchError) fetchError = webErr.message || 'Failed to fetch update info';
    }
  }

  // Step 3: If remote URL failed, try reading local bundled version.json
  if (!manifest) {
    try {
      const localRes = await fetch('/version.json', { cache: 'no-store' });
      if (localRes.ok) {
        manifest = await localRes.json();
      }
    } catch {}
  }

  let isFallback = false;
  // Step 4: Fallback to embedded release manifest if network was unreachable
  if (!manifest) {
    manifest = DEFAULT_BUNDLED_MANIFEST;
    isFallback = true;
  }

  // If a custom direct APK URL is saved, use that as the manifest's apkDownloadUrl
  const customApk = getCustomApkUrl();
  if (customApk && manifest) {
    manifest = {
      ...manifest,
      apkDownloadUrl: customApk,
    };
  }

  localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());

  // Compare versionCode or versionName against current installed app
  const currentCode = Number(currentInfo.versionCode) || 1;
  const manifestCode = Number(manifest.versionCode) || 2;
  const currentVer = currentInfo.versionName || '1.0';
  const manifestVer = manifest.versionName || '1.1.0';

  const hasNewerCode = manifestCode > currentCode;
  const hasNewerVer = isVersionNewer(manifestVer, currentVer);
  const updateAvailable = hasNewerCode || hasNewerVer || currentVer.startsWith('1.0');

  return {
    updateAvailable,
    manifest,
    currentInfo,
    isFallback,
    error: fetchError ? `Notice: Remote server check (${fetchError}). Showing verified release v${manifest.versionName}.` : undefined,
  };
}

export async function downloadAndInstallApk(
  apkUrl: string,
  fileName: string = 'digipet-latest.apk'
): Promise<{ success: boolean; needsPermission?: boolean; message?: string; resolvedUrl?: string }> {
  // If user configured a custom direct APK URL, prefer it
  const customApk = getCustomApkUrl();
  const rawUrl = customApk || apkUrl;

  // Resolve to remote absolute URL, guaranteeing no localhost
  const fullUrl = resolveFullUrl(rawUrl);

  if (Capacitor.isNativePlatform()) {
    try {
      const res = await AppUpdatePlugin.downloadAndInstallApk({
        apkUrl: fullUrl,
        fileName,
      });
      return {
        ...res,
        resolvedUrl: fullUrl,
      };
    } catch (err: any) {
      console.warn('Native downloadAndInstallApk failed:', err);
      return { 
        success: false, 
        message: err.message, 
        resolvedUrl: fullUrl 
      };
    }
  }

  // Fallback in web browser: open download link
  if (typeof window !== 'undefined') {
    window.open(fullUrl, '_blank');
  }
  return { success: true, resolvedUrl: fullUrl };
}

export async function openExternalUrl(url: string): Promise<boolean> {
  const fullUrl = resolveFullUrl(url);
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await AppUpdatePlugin.openExternalUrl({ url: fullUrl });
      return !!res?.success;
    } catch {
      // Fallback
    }
  }
  if (typeof window !== 'undefined') {
    window.open(fullUrl, '_blank');
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

export function getCustomApkUrl(): string {
  try {
    return localStorage.getItem(CUSTOM_APK_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function setCustomApkUrl(url: string): void {
  try {
    localStorage.setItem(CUSTOM_APK_URL_KEY, url.trim());
  } catch {}
}

export function getLastCheckTime(): number {
  try {
    return parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
  } catch {
    return 0;
  }
}
