import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Smartphone, 
  X, 
  ExternalLink, 
  Settings, 
  Layers,
  FileCode,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { sound } from '../utils/audio';
import { 
  UpdateManifest, 
  AppInfo, 
  getLocalAppInfo, 
  checkForUpdate, 
  downloadAndInstallApk, 
  checkInstallPermission, 
  requestInstallPermission, 
  reloadLiveAssets, 
  getAutoCheckEnabled, 
  setAutoCheckEnabled, 
  getCustomUpdateUrl, 
  setCustomUpdateUrl 
} from '../utils/appUpdater';
import { Capacitor } from '@capacitor/core';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialManifest?: UpdateManifest | null;
  onUpdateDownloaded?: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isOpen,
  onClose,
  initialManifest,
  onUpdateDownloaded,
}) => {
  const [appInfo, setAppInfo] = useState<AppInfo>({
    versionName: '1.0.0',
    versionCode: 1,
    packageName: 'com.digipet.companion',
    isNative: false,
  });
  const [manifest, setManifest] = useState<UpdateManifest | null>(initialManifest || null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadStep, setDownloadStep] = useState<string>('');
  const [hasInstallPerm, setHasInstallPerm] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [autoCheck, setAutoCheck] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');

  // Load app info and check install permission on mount / open
  useEffect(() => {
    if (!isOpen) return;

    getLocalAppInfo().then((info) => setAppInfo(info));
    checkInstallPermission().then((perm) => setHasInstallPerm(perm));
    setAutoCheck(getAutoCheckEnabled());
    setCustomUrl(getCustomUpdateUrl());

    // If no manifest passed, perform check
    if (!manifest) {
      handleCheckUpdates(false);
    }
  }, [isOpen]);

  // When window gains focus (e.g. user returned from Android Settings)
  useEffect(() => {
    if (!isOpen) return;
    const handleFocus = () => {
      checkInstallPermission().then((perm) => setHasInstallPerm(perm));
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isOpen]);

  const handleCheckUpdates = async (playSfx: boolean = true) => {
    if (playSfx) sound.playButton();
    setIsChecking(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await checkForUpdate(customUrl || undefined);
      setManifest(res.manifest);
      setAppInfo(res.currentInfo);

      if (res.error) {
        setErrorMsg(`Check failed: ${res.error}`);
      } else if (res.updateAvailable) {
        setSuccessMsg(`New version ${res.manifest?.versionName} is ready to install!`);
        if (playSfx) sound.playVictory();
      } else {
        setSuccessMsg('You already have the newest version installed! 🛡️');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error checking for updates');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestPermission = async () => {
    sound.playButton();
    setErrorMsg(null);
    try {
      await requestInstallPermission();
      setTimeout(async () => {
        const granted = await checkInstallPermission();
        setHasInstallPerm(granted);
      }, 1500);
    } catch (e: any) {
      setErrorMsg('Permission error: ' + e.message);
    }
  };

  const handleStartDownload = async () => {
    if (!manifest) return;
    sound.playButton();
    setErrorMsg(null);
    setSuccessMsg(null);

    // If native Android, check if permission is granted first
    if (Capacitor.isNativePlatform()) {
      const perm = await checkInstallPermission();
      if (!perm) {
        setErrorMsg('Please toggle ON "Allow from this source" in Android Settings first.');
        await requestInstallPermission();
        return;
      }
    }

    setIsDownloading(true);
    setDownloadStep('Connecting to Digi-Server...');

    try {
      setTimeout(() => {
        setDownloadStep('Downloading APK package (18.5 MB)...');
      }, 700);

      const downloadUrl = manifest.apkDownloadUrl || '/assets/apk/digipet-latest.apk';
      const fileName = manifest.apkFileName || `digipet-v${manifest.versionName}.apk`;

      const res = await downloadAndInstallApk(downloadUrl, fileName);

      if (res.needsPermission) {
        setIsDownloading(false);
        setErrorMsg('Android requires permission to install APK updates from this app.');
        await requestInstallPermission();
        return;
      }

      if (res.success) {
        setDownloadStep('Package downloaded! Opening Android Package Installer...');
        setSuccessMsg('Opening Android Installer... Tap "Install" or "Update" on your phone!');
        onUpdateDownloaded?.();
      } else {
        setErrorMsg(res.message || 'Could not complete APK download');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReloadLiveCode = async () => {
    sound.playButton();
    setErrorMsg(null);
    try {
      await reloadLiveAssets();
    } catch (e: any) {
      setErrorMsg('Reload failed: ' + e.message);
    }
  };

  const handleToggleAutoCheck = () => {
    sound.playButton();
    const next = !autoCheck;
    setAutoCheck(next);
    setAutoCheckEnabled(next);
  };

  const handleSaveCustomUrl = () => {
    sound.playButton();
    setCustomUpdateUrl(customUrl);
    setSuccessMsg('Saved custom update endpoint URL.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  if (!isOpen) return null;

  const isUpdateAvailable = manifest && (
    manifest.versionCode > appInfo.versionCode || 
    manifest.versionName !== appInfo.versionName
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl text-cyan-400">
              <Download className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-chakra font-bold text-white text-base sm:text-lg">
                  DIGI-AUTO UPDATER
                </h3>
                <span className="text-[9px] font-pixel px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  {Capacitor.isNativePlatform() ? 'NATIVE APK' : 'WEB CLIENT'}
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Installed: <strong className="text-cyan-300 font-pixel">v{appInfo.versionName}</strong> (Build {appInfo.versionCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          
          {/* Main Status Callout Card */}
          <div className={`p-4 rounded-2xl border-2 space-y-2.5 ${
            isUpdateAvailable
              ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 border-amber-500/70 shadow-lg shadow-amber-500/10'
              : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/20 border-emerald-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isUpdateAvailable ? (
                  <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
                <span className="font-chakra font-bold text-sm text-white">
                  {isUpdateAvailable ? 'NEW UPDATE DETECTED!' : 'SYSTEM UP TO DATE'}
                </span>
              </div>

              <span className={`text-[10px] font-pixel px-2.5 py-0.5 rounded-full font-bold ${
                isUpdateAvailable
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {isUpdateAvailable ? `v${manifest?.versionName} AVAILABLE` : `v${appInfo.versionName} LATEST`}
              </span>
            </div>

            {isUpdateAvailable && manifest ? (
              <div className="text-xs text-slate-300 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Release: <strong className="text-white">{manifest.releaseDate}</strong></span>
                  <span>Size: <strong className="text-cyan-300">{manifest.apkFileSize || '18.5 MB'}</strong></span>
                </div>
                {manifest.releaseName && (
                  <div className="font-bold text-amber-300 pt-0.5">
                    "{manifest.releaseName}"
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-300 text-xs">
                Your DigiPet app is synchronized with the latest release, sprite overrides, and screen companion engine.
              </p>
            )}
          </div>

          {/* Android Unknown Sources Permission Warning (Android 8+) */}
          {Capacitor.isNativePlatform() && !hasInstallPerm && isUpdateAvailable && (
            <div className="p-3.5 bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-chakra font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>INSTALL PERMISSION REQUIRED</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Android requires permission to install APK updates directly from this app. Tap the button below to turn on <strong className="text-amber-300">"Allow from this source"</strong> in Settings.
              </p>
              <button
                onClick={handleRequestPermission}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-950" />
                <span>ALLOW INSTALLING UPDATES (OPEN SETTINGS)</span>
              </button>
            </div>
          )}

          {/* Changelog / What's New Box */}
          {manifest?.changelog && manifest.changelog.length > 0 && (
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-chakra text-xs">
                <Layers className="w-4 h-4" />
                <span>WHAT'S NEW IN THIS VERSION:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {manifest.changelog.map((log, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold text-xs mt-0.5">▸</span>
                    <span className="leading-tight">{log}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Download Progress State */}
          {isDownloading && (
            <div className="p-4 bg-slate-950 border-2 border-cyan-500/60 rounded-2xl space-y-2 text-center animate-pulse">
              <div className="flex items-center justify-center gap-2 text-cyan-300 font-pixel text-xs font-bold">
                <Download className="w-4 h-4 animate-bounce" />
                <span>{downloadStep || 'DOWNLOADING UPDATE...'}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full rounded-full animate-pulse w-3/4" />
              </div>
              <p className="text-[10px] text-slate-400">
                Android Package Installer will launch automatically once download finishes!
              </p>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && !errorMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* PRIMARY ACTIONS */}
          <div className="space-y-2 pt-1">
            {isUpdateAvailable ? (
              <button
                onClick={handleStartDownload}
                disabled={isDownloading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-pixel text-xs font-bold rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>
                  {isDownloading
                    ? 'DOWNLOADING IN PROGRESS...'
                    : `⬇️ DOWNLOAD & INSTALL v${manifest?.versionName} (ONE-TAP)`}
                </span>
              </button>
            ) : null}

            {/* Check Now & Live Reload Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCheckUpdates(true)}
                disabled={isChecking}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-pixel text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'CHECKING...' : 'CHECK FOR UPDATES'}</span>
              </button>

              <button
                onClick={handleReloadLiveCode}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-pixel text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                title="Reload live code and cache"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>RELOAD LIVE ASSETS</span>
              </button>
            </div>
          </div>

          {/* ADVANCED SETTINGS ACCORDION */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                sound.playButton();
                setShowSettings(!showSettings);
              }}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 cursor-pointer font-medium"
            >
              <div className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Auto-Updater Preferences & Custom Endpoint</span>
              </div>
              <span className="text-[10px] font-pixel text-slate-500">
                {showSettings ? '▲ HIDE' : '▼ CONFIGURE'}
              </span>
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-3 space-y-3 overflow-hidden text-xs"
                >
                  {/* Auto-check switch */}
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-bold text-white text-xs">Auto-Check on Startup</div>
                      <div className="text-[10px] text-slate-400">Silently check for new versions when app opens</div>
                    </div>
                    <button
                      onClick={handleToggleAutoCheck}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        autoCheck ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                          autoCheck ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Custom URL Input */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Custom Version Manifest URL (Optional):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://your-domain.com/version.json"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                      <button
                        onClick={handleSaveCustomUrl}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-[10px] rounded-lg cursor-pointer"
                      >
                        SAVE
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Default is local server manifest (<code className="text-cyan-400">/version.json</code>).
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] font-mono text-slate-500">
            {appInfo.packageName}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-pixel text-[10px] rounded-xl font-bold cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
