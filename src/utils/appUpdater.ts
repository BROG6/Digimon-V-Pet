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
export const GITHUB_REPO_KEY = 'digipet_github_repo_v3';
export const USE_GITHUB_RELEASES_KEY = 'digipet_use_github_releases_v2';

// Official Cloud Run deployment URL for DigiPet
export const DEFAULT_PRODUCTION_URL = 'https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app';
export const DEFAULT_GITHUB_REPO = 'BROG6/Digimon-V-Pet';

// Base fallback version when running in browser or preview
export const DEFAULT_APP_INFO: AppInfo = {
  versionName: '1.2.2',
  versionCode: 122,
  packageName: 'com.digipet.companion',
  isNative: false,
};

// Verified latest build release manifest
export const DEFAULT_BUNDLED_MANIFEST: UpdateManifest = {
  versionName: '1.2.2',
  versionCode: 122,
  releaseDate: '2026-11-17',
  releaseName: 'Proportional Digivice, Gemini 4 AI Chat & Mini-Game Upgrades',
  changelog: [
    'Proportional Digivice scaling preserving brick aspect ratio with wider LCD roaming',
    'Upgraded Talk to Digimon AI dialogue powered by Gemini 4 with full species lore & chat history',
    'Meat Catch mini-game: walking/idle animations, collected vitamins added to stock, apples removed',
    'Increased floating sprite sizes by 10% across overlays and Picture-in-Picture',
    'Suppressed update banner on Web builds and automated every-2nd-change GitHub releases'
  ],
  apkDownloadUrl: `${DEFAULT_PRODUCTION_URL}/api/download-apk`,
  apkFileName: 'digipet-v1.2.2.apk',
  apkFileSize: '19.2 MB',
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

// Parse semantic version string to numerical array (e.g. "1.2.0" -> [1, 2, 0])
export function parseSemver(verStr: string): number[] {
  if (!verStr) return [0, 0, 0];
  const clean = verStr.trim().replace(/^[vV]/, '').replace(/[^0-9.]/g, '');
  const parts = clean.split('.').map((n) => {
    const val = parseInt(n || '0', 10);
    return isNaN(val) ? 0 : val;
  });
  while (parts.length < 3) {
    parts.push(0);
  }
  return parts;
}

// Compare semantic version strings (e.g. "1.2.0" > "1.1.0")
export function isVersionNewer(remoteVer: string, localVer: string): boolean {
  try {
    const rParts = parseSemver(remoteVer);
    const lParts = parseSemver(localVer);
    for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
      const r = rParts[i] ?? 0;
      const l = lParts[i] ?? 0;
      if (r > l) return true;
      if (r < l) return false;
    }
  } catch {}
  return false;
}

export function getGitHubRepo(): string {
  try {
    const saved = localStorage.getItem(GITHUB_REPO_KEY);
    if (!saved || saved.toLowerCase().startsWith('brodson/')) {
      return DEFAULT_GITHUB_REPO;
    }
    return saved;
  } catch {
    return DEFAULT_GITHUB_REPO;
  }
}

export function setGitHubRepo(repo: string): void {
  try {
    const clean = repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/^\/+|\/+$/g, '');
    localStorage.setItem(GITHUB_REPO_KEY, clean || DEFAULT_GITHUB_REPO);
  } catch {}
}

export function getUseGitHubReleases(): boolean {
  try {
    const val = localStorage.getItem(USE_GITHUB_RELEASES_KEY);
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
}

export function setUseGitHubReleases(enabled: boolean): void {
  try {
    localStorage.setItem(USE_GITHUB_RELEASES_KEY, enabled ? 'true' : 'false');
  } catch {}
}

/**
 * Fetches release information directly from GitHub Releases API or GitHub raw version.json.
 */
export async function fetchGitHubRelease(customRepo?: string): Promise<{ manifest: UpdateManifest | null; error?: string }> {
  const rawRepo = customRepo || getGitHubRepo();
  const cleanRepo = rawRepo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/^\/+|\/+$/g, '');
  if (!cleanRepo || !cleanRepo.includes('/')) {
    return { manifest: null, error: 'Invalid GitHub repository format (use owner/repo).' };
  }

  const apiUrl = `https://api.github.com/repos/${cleanRepo}/releases/latest`;
  const rawJsonUrl = `https://raw.githubusercontent.com/${cleanRepo}/main/public/version.json`;

  // 1. Try GitHub Releases API
  try {
    let apiData: any = null;
    if (Capacitor.isNativePlatform()) {
      try {
        const nativeRes = await AppUpdatePlugin.fetchManifest({ url: apiUrl });
        if (nativeRes && nativeRes.data) {
          apiData = JSON.parse(nativeRes.data);
        }
      } catch {}
    }

    if (!apiData) {
      const res = await fetch(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      });
      if (res.ok) {
        apiData = await res.json();
      }
    }

    if (apiData && apiData.tag_name) {
      const tag = String(apiData.tag_name);
      const cleanVer = tag.replace(/^[vV]/, '');
      const rawAssets = Array.isArray(apiData.assets) ? apiData.assets : [];
      const apkAsset = rawAssets.find((a: any) => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.apk'));

      const downloadUrl = apkAsset?.browser_download_url || `https://github.com/${cleanRepo}/releases/latest/download/app-debug.apk`;
      const fileName = apkAsset?.name || `digipet-${tag}.apk`;
      const fileSize = apkAsset?.size ? `${(apkAsset.size / (1024 * 1024)).toFixed(1)} MB` : '19.2 MB';

      const changelogLines: string[] = [];
      if (typeof apiData.body === 'string' && apiData.body.trim()) {
        const lines = apiData.body.split('\n')
          .map((l: string) => l.trim().replace(/^[-*•]\s*/, ''))
          .filter((l: string) => l.length > 0 && !l.startsWith('#'));
        if (lines.length > 0) {
          changelogLines.push(...lines.slice(0, 6));
        }
      }
      if (changelogLines.length === 0) {
        changelogLines.push(`Release ${tag} from GitHub (${cleanRepo})`);
      }

      const semParts = parseSemver(cleanVer);
      const computedCode = semParts[0] * 100 + semParts[1] * 10 + semParts[2];

      const manifest: UpdateManifest = {
        versionName: cleanVer,
        versionCode: computedCode || 4,
        releaseDate: (apiData.published_at || '').substring(0, 10) || new Date().toISOString().substring(0, 10),
        releaseName: apiData.name || `GitHub Release ${tag}`,
        changelog: changelogLines,
        apkDownloadUrl: downloadUrl,
        apkFileName: fileName,
        apkFileSize: fileSize,
      };

      return { manifest };
    }
  } catch (apiErr: any) {
    console.warn('GitHub Releases API error:', apiErr);
  }

  // 2. Try raw version.json from GitHub repo main branch
  try {
    let rawData: any = null;
    if (Capacitor.isNativePlatform()) {
      try {
        const nativeRes = await AppUpdatePlugin.fetchManifest({ url: rawJsonUrl });
        if (nativeRes && nativeRes.data) {
          rawData = JSON.parse(nativeRes.data);
        }
      } catch {}
    }

    if (!rawData) {
      const res = await fetch(rawJsonUrl);
      if (res.ok) {
        rawData = await res.json();
      }
    }

    if (rawData && rawData.versionName) {
      return {
        manifest: {
          ...rawData,
          apkDownloadUrl: rawData.apkDownloadUrl || `https://github.com/${cleanRepo}/releases/latest/download/app-debug.apk`,
        },
      };
    }
  } catch (rawErr: any) {
    console.warn('GitHub raw version.json error:', rawErr);
  }

  return { manifest: null, error: `No releases found on GitHub repo "${cleanRepo}".` };
}

export async function checkForUpdate(optionsOrCustomUrl?: string | {
  customUrl?: string;
  preferGitHub?: boolean;
  githubRepo?: string;
}): Promise<{
  updateAvailable: boolean;
  manifest: UpdateManifest | null;
  currentInfo: AppInfo;
  source: 'server' | 'github' | 'bundled';
  error?: string;
  isFallback?: boolean;
}> {
  const customUrl = typeof optionsOrCustomUrl === 'string' ? optionsOrCustomUrl : optionsOrCustomUrl?.customUrl;
  const preferGitHub = typeof optionsOrCustomUrl === 'object' ? optionsOrCustomUrl.preferGitHub : false;
  const githubRepo = typeof optionsOrCustomUrl === 'object' ? optionsOrCustomUrl.githubRepo : undefined;

  const currentInfo = await getLocalAppInfo();

  // Smart check: If user accidentally pasted an APK URL in the manifest field, fix it!
  const rawCustom = customUrl || getCustomUpdateUrl();
  if (rawCustom && (rawCustom.endsWith('.apk') || rawCustom.includes('/download-apk'))) {
    setCustomApkUrl(rawCustom);
    setCustomUpdateUrl('');
  }

  let manifest: UpdateManifest | null = null;
  let fetchError: string | null = null;
  let source: 'server' | 'github' | 'bundled' = 'server';

  // Strategy A: If preferGitHub or getUseGitHubReleases() is enabled, check GitHub Releases first!
  if (preferGitHub || getUseGitHubReleases()) {
    const gh = await fetchGitHubRelease(githubRepo);
    if (gh.manifest) {
      manifest = gh.manifest;
      source = 'github';
    }
  }

  // Strategy B: If no GitHub manifest yet, query primary server endpoint (/api/app-version)
  if (!manifest) {
    const customManifest = getCustomUpdateUrl();
    const targetUrl = customManifest
      ? resolveFullUrl(customManifest)
      : resolveFullUrl('/api/app-version');

    // In native Android, try native HTTP connection first
    if (Capacitor.isNativePlatform()) {
      try {
        const nativeRes = await AppUpdatePlugin.fetchManifest({ url: targetUrl });
        if (nativeRes && nativeRes.data) {
          manifest = JSON.parse(nativeRes.data);
          source = 'server';
        }
      } catch (nativeErr: any) {
        console.warn('Native fetchManifest error:', nativeErr);
        fetchError = nativeErr.message || 'Native fetch failed';
      }
    }

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
            source = 'server';
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
  }

  // Strategy C: If server failed (e.g. 404 or offline) and we haven't tried GitHub yet, try GitHub now as backup!
  if (!manifest && !preferGitHub && !getUseGitHubReleases()) {
    const gh = await fetchGitHubRelease(githubRepo);
    if (gh.manifest) {
      manifest = gh.manifest;
      source = 'github';
      fetchError = null; // Successfully rescued by GitHub backup!
    }
  }

  // Strategy D: If remote failed, try local bundled version.json
  if (!manifest) {
    try {
      const localRes = await fetch('/version.json', { cache: 'no-store' });
      if (localRes.ok) {
        manifest = await localRes.json();
        source = 'bundled';
      }
    } catch {}
  }

  let isFallback = false;
  // Strategy E: Fallback to embedded release manifest if network was unreachable
  if (!manifest) {
    manifest = DEFAULT_BUNDLED_MANIFEST;
    isFallback = true;
    source = 'bundled';
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
  const manifestCode = Number(manifest.versionCode) || 0;
  const currentVer = currentInfo.versionName || '1.0.0';
  const manifestVer = manifest.versionName || '1.2.1';

  const hasNewerCode = manifestCode > currentCode;
  const hasNewerVer = isVersionNewer(manifestVer, currentVer);
  const updateAvailable = hasNewerCode || hasNewerVer;

  return {
    updateAvailable,
    manifest,
    currentInfo,
    source,
    isFallback,
    error: fetchError ? `Notice: Remote server check (${fetchError}). Showing release v${manifest.versionName}.` : undefined,
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
