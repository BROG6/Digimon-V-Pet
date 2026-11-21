import { registerPlugin, Capacitor } from '@capacitor/core';

export interface UpdateManifest {
  versionName: string;
  version?: string;
  versionCode: number;
  releaseDate: string;
  releaseName?: string;
  changelog: string[];
  apkDownloadUrl: string;
  apkFileName?: string;
  apkFileSize?: string;
  isMandatory?: boolean;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  shouldNotify: boolean;
  shouldShowBanner: boolean;
  manifest: UpdateManifest | null;
  currentInfo: AppInfo;
  source: 'server' | 'github' | 'bundled';
  error?: string;
  isFallback?: boolean;
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
  httpPost(options: { url: string; body: string }): Promise<{ ok: boolean; status: number; data: string }>;
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
const NOTIFIED_VERSION_KEY = 'digipet_last_notified_version_v1';
const DISMISSED_VERSION_KEY = 'digipet_dismissed_update_version_v1';
export const GITHUB_REPO_KEY = 'digipet_github_repo_v3';
export const USE_GITHUB_RELEASES_KEY = 'digipet_use_github_releases_v2';

// Official Cloud Run deployment URLs for DigiPet
export const DEFAULT_PRODUCTION_URL =
  typeof __APP_DEFAULT_URL__ !== 'undefined' && __APP_DEFAULT_URL__
    ? __APP_DEFAULT_URL__
    : 'https://ais-dev-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app';
export const DEFAULT_SHARED_URL =
  'https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app';
export const DEFAULT_GITHUB_REPO = 'BROG6/Digimon-V-Pet';

// Authoritative version read from android/app/build.gradle at Vite build/dev time
export const GRADLE_VERSION_NAME: string =
  typeof __GRADLE_VERSION_NAME__ !== 'undefined' && __GRADLE_VERSION_NAME__
    ? __GRADLE_VERSION_NAME__
    : '1.2.2';
export const GRADLE_VERSION_CODE: number =
  typeof __GRADLE_VERSION_CODE__ !== 'undefined' && __GRADLE_VERSION_CODE__
    ? Number(__GRADLE_VERSION_CODE__)
    : 122;

// Base fallback version sourced from android/app/build.gradle
export const DEFAULT_APP_INFO: AppInfo = {
  versionName: GRADLE_VERSION_NAME,
  versionCode: GRADLE_VERSION_CODE,
  packageName: 'com.digipet.companion',
  isNative: false,
};

// Verified latest build release manifest
export const DEFAULT_BUNDLED_MANIFEST: UpdateManifest = {
  versionName: GRADLE_VERSION_NAME,
  versionCode: GRADLE_VERSION_CODE,
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
  apkFileName: `digipet-v${GRADLE_VERSION_NAME}.apk`,
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

/**
 * Returns ordered candidate URLs for the `/api/digimon/talk` endpoint.
 * Web builds use the current origin first; native APKs try custom server URL,
 * public shared URL, and production Cloud Run host.
 */
export function resolveTalkEndpointCandidates(): string[] {
  const candidates: string[] = [];
  const pushUnique = (u: string) => {
    if (u && !candidates.includes(u)) {
      candidates.push(u);
    }
  };

  const custom = getCustomUpdateUrl();
  if (custom && (custom.startsWith('http://') || custom.startsWith('https://'))) {
    try {
      const parsed = new URL(custom);
      if (!parsed.hostname.includes('localhost') && !parsed.hostname.includes('127.0.0.1')) {
        pushUnique(`${parsed.origin}/api/digimon/talk`);
      }
    } catch {}
  }

  if (!Capacitor.isNativePlatform()) {
    pushUnique('/api/digimon/talk');
    pushUnique(resolveFullUrl('/api/digimon/talk'));
  } else {
    pushUnique(`${DEFAULT_SHARED_URL}/api/digimon/talk`);
    pushUnique(resolveFullUrl('/api/digimon/talk'));
    pushUnique(`${DEFAULT_PRODUCTION_URL}/api/digimon/talk`);
  }

  return candidates;
}

export async function getLocalAppInfo(): Promise<AppInfo> {
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await AppUpdatePlugin.getAppInfo();
      if (info && info.versionName) {
        return {
          ...info,
          versionName: String(info.versionName).trim().replace(/^[vV]/, ''),
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

// Parse semantic version core string to numerical array (e.g. "v1.2.3-beta.1+45" -> [1, 2, 3])
export function parseSemver(verStr: string): number[] {
  if (!verStr) return [0, 0, 0];
  const noBuild = String(verStr).trim().replace(/^[vV]/, '').split('+')[0];
  const core = noBuild.split('-')[0].replace(/[^0-9.]/g, '');
  if (!core) return [0, 0, 0];
  const parts = core.split('.').map((n) => {
    const val = parseInt(n || '0', 10);
    return isNaN(val) ? 0 : val;
  });
  while (parts.length < 3) {
    parts.push(0);
  }
  return parts;
}

function parsePreRelease(verStr: string): string[] {
  if (!verStr) return [];
  const noBuild = String(verStr).trim().replace(/^[vV]/, '').split('+')[0];
  const dashIdx = noBuild.indexOf('-');
  if (dashIdx === -1) return [];
  const raw = noBuild.slice(dashIdx + 1).trim();
  return raw ? raw.split('.').filter(Boolean) : [];
}

/**
 * Compares two SemVer 2.0.0 strings:
 * Returns 1 if a > b, -1 if a < b, 0 if equal.
 */
export function compareSemver(a: string, b: string): number {
  const aParts = parseSemver(a);
  const bParts = parseSemver(b);
  const maxLen = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < maxLen; i++) {
    const av = aParts[i] ?? 0;
    const bv = bParts[i] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }

  const aPre = parsePreRelease(a);
  const bPre = parsePreRelease(b);
  if (aPre.length === 0 && bPre.length === 0) return 0;
  if (aPre.length === 0) return 1;  // Final release > pre-release
  if (bPre.length === 0) return -1; // Pre-release < final release

  const preLen = Math.max(aPre.length, bPre.length);
  for (let i = 0; i < preLen; i++) {
    const ai = aPre[i];
    const bi = bPre[i];
    if (ai === undefined) return -1;
    if (bi === undefined) return 1;
    const aNum = /^\d+$/.test(ai);
    const bNum = /^\d+$/.test(bi);
    if (aNum && bNum) {
      const an = parseInt(ai, 10);
      const bn = parseInt(bi, 10);
      if (an > bn) return 1;
      if (an < bn) return -1;
    } else if (aNum !== bNum) {
      return aNum ? -1 : 1; // Numeric identifiers have lower precedence than non-numeric
    } else if (ai !== bi) {
      return ai > bi ? 1 : -1;
    }
  }

  return 0;
}

// Compare semantic version strings (e.g. "1.2.3" > "1.2.2")
export function isVersionNewer(remoteVer: string, localVer: string): boolean {
  try {
    if (!remoteVer || !localVer) return false;
    return compareSemver(remoteVer, localVer) > 0;
  } catch {}
  return false;
}

/**
 * Extracts normalized versionName string from any server or GitHub manifest object.
 */
export function extractManifestVersion(manifest: any): string {
  if (!manifest || typeof manifest !== 'object') return '';
  const raw = manifest.versionName || manifest.version || manifest.tag_name || '';
  return String(raw).trim().replace(/^[vV]/, '');
}

function normalizeManifest(raw: any): UpdateManifest | null {
  if (!raw || typeof raw !== 'object') return null;
  const versionName = extractManifestVersion(raw);
  if (!versionName) return null;
  const parts = parseSemver(versionName);
  const fallbackCode = parts[0] * 100 + parts[1] * 10 + parts[2];
  return {
    versionName,
    version: versionName,
    versionCode: Number(raw.versionCode) || fallbackCode || GRADLE_VERSION_CODE,
    releaseDate: String(raw.releaseDate || new Date().toISOString().slice(0, 10)),
    releaseName: raw.releaseName ? String(raw.releaseName) : undefined,
    changelog: Array.isArray(raw.changelog) ? raw.changelog.map(String) : [],
    apkDownloadUrl: String(raw.apkDownloadUrl || `${DEFAULT_PRODUCTION_URL}/api/download-apk`),
    apkFileName: raw.apkFileName ? String(raw.apkFileName) : `digipet-v${versionName}.apk`,
    apkFileSize: raw.apkFileSize ? String(raw.apkFileSize) : undefined,
    isMandatory: Boolean(raw.isMandatory),
  };
}

/**
 * Notification & dismissal deduplication helpers to prevent redundant update alerts.
 */
export function syncUpdateNotificationMarkers(currentVer: string): void {
  try {
    const notified = localStorage.getItem(NOTIFIED_VERSION_KEY);
    if (notified && !isVersionNewer(notified, currentVer)) {
      localStorage.removeItem(NOTIFIED_VERSION_KEY);
    }
    const dismissed = localStorage.getItem(DISMISSED_VERSION_KEY);
    if (dismissed && !isVersionNewer(dismissed, currentVer)) {
      localStorage.removeItem(DISMISSED_VERSION_KEY);
    }
  } catch {}
}

export function shouldNotifyUpdate(
  remoteVer: string,
  currentVer: string,
  isMandatory: boolean = false
): boolean {
  if (!isVersionNewer(remoteVer, currentVer)) return false;
  try {
    if (!isMandatory) {
      const dismissed = localStorage.getItem(DISMISSED_VERSION_KEY);
      if (dismissed && !isVersionNewer(remoteVer, dismissed)) {
        return false;
      }
    }
    const notified = localStorage.getItem(NOTIFIED_VERSION_KEY);
    if (notified && !isVersionNewer(remoteVer, notified)) {
      return false;
    }
  } catch {}
  return true;
}

export function shouldShowUpdateBanner(
  remoteVer: string,
  currentVer: string,
  isMandatory: boolean = false
): boolean {
  if (!isVersionNewer(remoteVer, currentVer)) return false;
  if (isMandatory) return true;
  try {
    const dismissed = localStorage.getItem(DISMISSED_VERSION_KEY);
    if (dismissed && !isVersionNewer(remoteVer, dismissed)) {
      return false;
    }
  } catch {}
  return true;
}

export function markUpdateNotified(version: string): void {
  try {
    const clean = String(version || '').trim().replace(/^[vV]/, '');
    if (clean) localStorage.setItem(NOTIFIED_VERSION_KEY, clean);
  } catch {}
}

export function dismissUpdateVersion(version: string): void {
  try {
    const clean = String(version || '').trim().replace(/^[vV]/, '');
    if (clean) {
      localStorage.setItem(DISMISSED_VERSION_KEY, clean);
      localStorage.setItem(NOTIFIED_VERSION_KEY, clean);
    }
  } catch {}
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

      const manifest = normalizeManifest({
        versionName: cleanVer,
        versionCode: computedCode || GRADLE_VERSION_CODE,
        releaseDate: (apiData.published_at || '').substring(0, 10) || new Date().toISOString().substring(0, 10),
        releaseName: apiData.name || `GitHub Release ${tag}`,
        changelog: changelogLines,
        apkDownloadUrl: downloadUrl,
        apkFileName: fileName,
        apkFileSize: fileSize,
      });

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

    if (rawData) {
      const normalized = normalizeManifest({
        ...rawData,
        apkDownloadUrl: rawData.apkDownloadUrl || `https://github.com/${cleanRepo}/releases/latest/download/app-debug.apk`,
      });
      if (normalized) {
        return { manifest: normalized };
      }
    }
  } catch (rawErr: any) {
    console.warn('GitHub raw version.json error:', rawErr);
  }

  return { manifest: null, error: `No releases found on GitHub repo "${cleanRepo}".` };
}

async function fetchServerManifest(customUrl?: string): Promise<{ manifest: UpdateManifest | null; error?: string }> {
  const customManifest = customUrl || getCustomUpdateUrl();
  const targetUrl = customManifest
    ? resolveFullUrl(customManifest)
    : resolveFullUrl('/api/app-version');

  let fetchError: string | undefined;

  if (Capacitor.isNativePlatform()) {
    try {
      const nativeRes = await AppUpdatePlugin.fetchManifest({ url: targetUrl });
      if (nativeRes && nativeRes.data) {
        const parsed = normalizeManifest(JSON.parse(nativeRes.data));
        if (parsed) return { manifest: parsed };
      }
    } catch (nativeErr: any) {
      console.warn('Native fetchManifest error:', nativeErr);
      fetchError = nativeErr.message || 'Native fetch failed';
    }
  }

  try {
    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const text = await res.text();
      try {
        const parsed = normalizeManifest(JSON.parse(text));
        if (parsed) return { manifest: parsed };
        fetchError = 'Server manifest missing version string';
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

  return { manifest: null, error: fetchError };
}

let inFlightUpdateCheck: Promise<UpdateCheckResult> | null = null;

export async function checkForUpdate(optionsOrCustomUrl?: string | {
  customUrl?: string;
  preferGitHub?: boolean;
  githubRepo?: string;
  forceRefresh?: boolean;
}): Promise<UpdateCheckResult> {
  const customUrl = typeof optionsOrCustomUrl === 'string' ? optionsOrCustomUrl : optionsOrCustomUrl?.customUrl;
  const preferGitHub = typeof optionsOrCustomUrl === 'object' ? Boolean(optionsOrCustomUrl.preferGitHub) : false;
  const githubRepo = typeof optionsOrCustomUrl === 'object' ? optionsOrCustomUrl.githubRepo : undefined;
  const forceRefresh = typeof optionsOrCustomUrl === 'object' ? Boolean(optionsOrCustomUrl.forceRefresh) : false;

  if (!forceRefresh && !preferGitHub && !customUrl && inFlightUpdateCheck) {
    return inFlightUpdateCheck;
  }

  const runCheck = async (): Promise<UpdateCheckResult> => {
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

    if (preferGitHub) {
      // Explicit GitHub check requested (e.g. "CHECK GITHUB")
      const gh = await fetchGitHubRelease(githubRepo);
      if (gh.manifest) {
        manifest = gh.manifest;
        source = 'github';
      } else {
        fetchError = gh.error || 'GitHub release lookup failed';
        const srv = await fetchServerManifest(customUrl);
        if (srv.manifest) {
          manifest = srv.manifest;
          source = 'server';
          fetchError = null;
        }
      }
    } else {
      // Primary: Query server manifest (/api/app-version or custom manifest URL)
      const srv = await fetchServerManifest(customUrl);
      if (srv.manifest) {
        manifest = srv.manifest;
        source = 'server';
      } else {
        fetchError = srv.error || 'Server manifest unavailable';
        // Backup: If GitHub backup mirror is enabled, rescue from GitHub Releases
        if (getUseGitHubReleases()) {
          const gh = await fetchGitHubRelease(githubRepo);
          if (gh.manifest) {
            manifest = gh.manifest;
            source = 'github';
            fetchError = null;
          }
        }
      }
    }

    // Local bundled version.json fallback if remote sources were unreachable
    if (!manifest) {
      try {
        const localRes = await fetch('/version.json', { cache: 'no-store' });
        if (localRes.ok) {
          manifest = normalizeManifest(await localRes.json());
          if (manifest) source = 'bundled';
        }
      } catch {}
    }

    let isFallback = false;
    // Embedded manifest fallback if network was completely unreachable
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

    try {
      localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    } catch {}

    // Authoritative comparison: compare android/app/build.gradle versionName (or installed native versionName)
    // strictly against the version string returned by the server manifest.
    const currentVer = currentInfo.versionName || GRADLE_VERSION_NAME;
    const manifestVer = extractManifestVersion(manifest);

    // Offline bundled fallbacks must never trigger an update alert
    const updateAvailable = !isFallback && Boolean(manifestVer) && isVersionNewer(manifestVer, currentVer);

    if (!updateAvailable) {
      syncUpdateNotificationMarkers(currentVer);
    }

    const shouldNotify = updateAvailable && shouldNotifyUpdate(manifestVer, currentVer, Boolean(manifest.isMandatory));
    const shouldShowBanner = updateAvailable && shouldShowUpdateBanner(manifestVer, currentVer, Boolean(manifest.isMandatory));

    return {
      updateAvailable,
      shouldNotify,
      shouldShowBanner,
      manifest,
      currentInfo,
      source,
      isFallback,
      error: fetchError ? `Notice: Remote server check (${fetchError}). Showing release v${manifest.versionName}.` : undefined,
    };
  };

  const promise = runCheck().finally(() => {
    if (inFlightUpdateCheck === promise) {
      inFlightUpdateCheck = null;
    }
  });

  if (!forceRefresh && !preferGitHub && !customUrl) {
    inFlightUpdateCheck = promise;
  }

  return promise;
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
