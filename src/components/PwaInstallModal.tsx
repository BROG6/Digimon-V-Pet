import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Check, X, ShieldCheck, Zap, Globe, Sparkles, ExternalLink, Code2, Copy } from 'lucide-react';
import { sound } from '../utils/audio';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchPip?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ 
  isOpen, 
  onClose,
  onLaunchPip 
}) => {
  const [activeTab, setActiveTab] = useState<'install' | 'pip' | 'github_actions' | 'native_code'>('install');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installState, setInstallState] = useState<'ready' | 'installing' | 'installed'>('ready');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      setInstallState('installed');
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallState('installed');
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sound.playButton();
    if (deferredPrompt) {
      setInstallState('installing');
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallState('installed');
      } else {
        setInstallState('ready');
      }
      setDeferredPrompt(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const KOTLIN_SERVICE_CODE = `// FloatingDigimonService.kt
// Android Native Foreground Service using WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
package com.digipet.companion

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView

class FloatingDigimonService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var floatingView: View
    private lateinit var params: WindowManager.LayoutParams

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()

        // 1. Start foreground service notification
        startForeground(101, createNotification())

        // 2. Initialize WindowManager for floating overlay
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        floatingView = LayoutInflater.from(this).inflate(R.layout.layout_floating_pet, null)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 200
        }

        // 3. Touch listener for dragging across the Android home screen & other apps
        floatingView.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(floatingView, params)
                        return true
                    }
                }
                return false
            }
        })

        // 4. Add floating view on top of entire Android OS
        windowManager.addView(floatingView, params)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::floatingView.isInitialized) {
            windowManager.removeView(floatingView)
        }
    }

    private fun createNotification(): Notification {
        val channelId = "floating_digimon_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId, "DigiPet Floating Overlay",
                NotificationManager.IMPORTANCE_LOW
            )
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
        }
        return Notification.Builder(this, channelId)
            .setContentTitle("DigiPet Overlay Active")
            .setContentText("Your Digimon is roaming on your screen!")
            .setSmallIcon(R.mipmap.ic_launcher)
            .build()
    }
}`;

  const MANIFEST_CODE = `<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.digipet.companion">

    <!-- Essential Android permissions for drawing over other apps -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="DigiPet"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.DigiPet">

        <service
            android:name=".FloatingDigimonService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse" />

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-chakra font-bold text-white text-lg">
                NATIVE ANDROID APK & SCREEN OVERLAY
              </h3>
              <p className="text-slate-400 text-xs">Run natively on Android & float over other apps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 mb-2 font-pixel text-xs border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('install')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'install'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            1. WEBAPK
          </button>
          <button
            onClick={() => setActiveTab('pip')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'pip'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            2. NATIVE OVERLAY
          </button>
          <button
            onClick={() => setActiveTab('github_actions')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'github_actions'
                ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            3. GITHUB AUTOBUILD ⚡
          </button>
          <button
            onClick={() => setActiveTab('native_code')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'native_code'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            4. KOTLIN SOURCE
          </button>
        </div>

        {/* TAB 1: WEBAPK NATIVE INSTALL */}
        {activeTab === 'install' && (
          <div className="py-2 space-y-4 text-sm text-slate-300 overflow-y-auto">
            <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-chakra font-bold text-white text-base">
                  What is an Android WebAPK?
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  On Android, modern PWAs do not just open a bookmark. Instead, <strong className="text-emerald-300">Google Play Services automatically compiles and signs a real .APK file (WebAPK)</strong> on your phone. It installs directly into your Android OS app drawer, runs in a standalone window, and works 100% offline.
                </p>
              </div>
            </div>

            {/* Quick Install Action Button */}
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                disabled={installState === 'installing'}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-98 transition-all text-slate-950 font-pixel text-xs py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
              >
                <Download className="w-4 h-4" />
                <span>INSTALL NATIVE ANDROID APK (WEBAPK) NOW</span>
              </button>
            ) : isInstalled ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center text-emerald-300 font-pixel text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>APP IS CURRENTLY INSTALLED AS A NATIVE WEBAPK!</span>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
                <p className="font-chakra font-bold text-amber-300 flex items-center gap-1.5">
                  <span>📱</span>
                  <span>HOW TO INSTALL ON YOUR PHONE:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                  <li>
                    On Android Chrome: Tap the <strong className="text-white">Three Dots (⋮)</strong> menu in the top-right corner.
                  </li>
                  <li>
                    Select <strong className="text-emerald-300">"Install app"</strong> or <strong className="text-emerald-300">"Add to Home screen"</strong>.
                  </li>
                  <li>
                    Android Play Services will build and install the native WebAPK onto your phone.
                  </li>
                  <li>
                    On iOS Safari: Tap <strong className="text-white">Share (↑)</strong> → <strong className="text-cyan-300">"Add to Home Screen"</strong>.
                  </li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[10px] font-pixel text-slate-400">
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Runs Fullscreen (No browser URL bar)</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Offline Hardware Acceleration</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NATIVE PIP SCREEN OVERLAY */}
        {activeTab === 'pip' && (
          <div className="py-2 space-y-4 text-xs text-slate-300 overflow-y-auto">
            <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-chakra font-bold text-white text-base">
                <ExternalLink className="w-5 h-5 text-cyan-400" />
                <span>Native Android Picture-in-Picture (PiP) Screen Overlay</span>
              </div>
              <p className="leading-relaxed">
                Why can't web apps draw over other native apps by default? Because Android restricts web browsers from calling private system APIs.
              </p>
              <p className="leading-relaxed text-cyan-200">
                However, Android Chrome has built-in support for <strong className="text-white">Picture-in-Picture (PiP)</strong>! When activated, your Digimon pops out into an authentic floating window that <strong className="text-emerald-300">floats over YouTube, WhatsApp, Instagram, and your Android home screen</strong>!
              </p>
            </div>

            {onLaunchPip && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchPip();
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-pixel text-xs py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-98 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>LAUNCH FLOATING SCREEN OVERLAY NOW</span>
              </button>
            )}

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-[11px] space-y-1">
              <div className="font-bold text-white">How to use it on your phone:</div>
              <div>1. Tap the button above to pop out the overlay window.</div>
              <div>2. Swipe up to go to your Android home screen or open another app.</div>
            </div>
          </div>
        )}

        {/* TAB 3: GITHUB ACTIONS AUTOBUILD APK */}
        {activeTab === 'github_actions' && (
          <div className="py-2 space-y-4 text-xs text-slate-300 overflow-y-auto">
            <div className="p-4 bg-gradient-to-br from-indigo-950/50 to-slate-950 border border-indigo-500/40 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-chakra font-bold text-white text-base">
                <span className="text-xl">⚡</span>
                <span className="text-indigo-300">Automated GitHub Actions APK Builder Configured!</span>
              </div>
              <p className="leading-relaxed">
                We have added <code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded border border-indigo-500/30">.github/workflows/build-apk.yml</code> directly to your codebase.
              </p>
              <p className="leading-relaxed text-slate-300">
                Every time you make a change or push to GitHub, a virtual Ubuntu cloud runner equipped with <strong className="text-white">Android SDK & JDK 17</strong> automatically runs, builds the project with Capacitor, compiles the native <strong className="text-emerald-400">app-debug.apk</strong>, and attaches it for instant download!
              </p>
            </div>

            {/* How to download the APK */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="font-chakra font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                <span>📥</span>
                <span>HOW TO DOWNLOAD YOUR AUTO-BUILT APK FROM GITHUB:</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs">
                <li>
                  Open your repository on <strong className="text-white">GitHub.com</strong>.
                </li>
                <li>
                  Click the <strong className="text-indigo-300">"Actions"</strong> tab at the top of the repository.
                </li>
                <li>
                  Click on the latest run titled <strong className="text-white">"Auto-Build Native Android APK"</strong> (or click "Run workflow" to build right now).
                </li>
                <li>
                  Scroll down to the bottom under <strong className="text-emerald-400">Artifacts</strong>.
                </li>
                <li>
                  Click <strong className="text-emerald-300">"DigiPet-Native-Android-APK"</strong> to download the ready-to-install <strong className="text-white">app-debug.apk</strong> directly to your phone or computer!
                </li>
              </ol>
            </div>

            {/* Automated Features Card */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-pixel text-slate-400">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-emerald-400 font-bold">✓ AUTO-TRIGGERED</div>
                <div>Runs on every git push or pull request</div>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold">✓ OVERLAY READY</div>
                <div>Injects SYSTEM_ALERT_WINDOW into AndroidManifest</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NATIVE KOTLIN & CAPACITOR PROJECT CODE */}
        {activeTab === 'native_code' && (
          <div className="py-2 space-y-3 text-xs overflow-y-auto max-h-[500px] pr-1">
            <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-amber-200 leading-relaxed text-[11px]">
              <strong>Building a 100% Native Overlay in Android Studio:</strong> In pure native Android, Hellopet / Shimeji apps require a Kotlin <code className="bg-black/40 px-1 rounded">Service</code> with <code className="bg-black/40 px-1 rounded">SYSTEM_ALERT_WINDOW</code>. Because cloud web sandboxes lack the Android SDK compiler, here is the complete, production-ready code ready to drop into Android Studio or Capacitor:
            </div>

            {/* Kotlin Service Code */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-pixel">
                <span>FloatingDigimonService.kt (Native Kotlin Service)</span>
                <button
                  onClick={() => copyToClipboard(KOTLIN_SERVICE_CODE, 'kotlin')}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCode === 'kotlin' ? 'COPIED!' : 'COPY CODE'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-300 font-mono overflow-x-auto max-h-48">
                {KOTLIN_SERVICE_CODE}
              </pre>
            </div>

            {/* Android Manifest Code */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-pixel">
                <span>AndroidManifest.xml (Permissions & Service)</span>
                <button
                  onClick={() => copyToClipboard(MANIFEST_CODE, 'manifest')}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCode === 'manifest' ? 'COPIED!' : 'COPY CODE'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-300 font-mono overflow-x-auto max-h-36">
                {MANIFEST_CODE}
              </pre>
            </div>

            {/* Quick 3-Step Capacitor Instructions */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-white">How to build this project into an APK in 2 minutes:</div>
              <div>1. In terminal: <code className="text-cyan-300">npm i @capacitor/core @capacitor/cli @capacitor/android</code></div>
              <div>2. Run: <code className="text-cyan-300">npx cap init DigiPet com.digipet.companion && npx cap add android</code></div>
              <div>3. Open in Android Studio: <code className="text-cyan-300">npx cap open android</code> → Build APK!</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-pixel text-[10px] rounded-xl font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
