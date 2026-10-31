import React, { useState, useEffect, useRef } from 'react';
import { PetState, DigimonSpecies } from '../types/digimon';
import { sound } from '../utils/audio';
import { ExternalLink, Sparkles, AlertCircle, Smartphone, Zap } from 'lucide-react';
import { registerPlugin, Capacitor } from '@capacitor/core';
import { getEffectiveSpriteConfig } from '../utils/customSpriteManager';
import { DigimonSpriteConfig, SpriteFrame } from '../utils/newDigimonSprites';

interface OverlayPluginInterface {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ success: boolean }>;
}

const OverlayPlugin = registerPlugin<OverlayPluginInterface>('OverlayPlugin');

interface NativePipOverlayProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
}

export const NativePipOverlay: React.FC<NativePipOverlayProps> = ({
  pet,
  species,
  isOpen,
  onClose,
}) => {
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isImgLoaded, setIsImgLoaded] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number>(0);
  const pipWindowRef = useRef<Window | null>(null);
  const wakeLockRef = useRef<any>(null);
  const spriteImageRef = useRef<HTMLImageElement | null>(null);
  const configRef = useRef<DigimonSpriteConfig | undefined>(undefined);

  // Load effective sprite config & image for the active species
  useEffect(() => {
    const speciesId = pet.currentSpeciesId;
    if (!speciesId) return;
    const config = getEffectiveSpriteConfig(speciesId);
    configRef.current = config;

    if (config?.sheetPath) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = config.sheetPath;
      img.onload = () => {
        spriteImageRef.current = img;
        setIsImgLoaded(true);
      };
      img.onerror = () => {
        console.warn('Failed to load sprite sheet for PiP:', config.sheetPath);
        setIsImgLoaded(false);
      };
    } else {
      spriteImageRef.current = null;
      setIsImgLoaded(false);
    }
  }, [pet.currentSpeciesId]);

  // Screen Wake Lock API management
  const toggleWakeLock = async () => {
    sound.playButton();
    if (!('wakeLock' in navigator)) {
      setErrorMsg('Screen Wake Lock is not supported on this browser.');
      return;
    }

    try {
      if (wakeLockActive && wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
      } else {
        const lock = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = lock;
        setWakeLockActive(true);
        lock.addEventListener('release', () => {
          setWakeLockActive(false);
          wakeLockRef.current = null;
        });
      }
    } catch (err: any) {
      console.warn('Wake Lock error:', err);
      setErrorMsg(`Wake lock error: ${err.message || 'Permission denied'}`);
    }
  };

  // Clean up wake lock on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Canvas drawing loop for Video PiP fallback
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let xPos = 40;
    let dir = 1;

    const renderLoop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Disable smoothing for sharp retro pixel art
      ctx.imageSmoothingEnabled = false;

      // Dark sci-fi background
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle cyber grid
      ctx.strokeStyle = '#111e33';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 24) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Title header
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(species?.name.toUpperCase() || 'DIGIMON COMPANION', canvas.width / 2, 20);

      // Status HUD
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`♥ H:${pet.hunger}%  ⚡ E:${pet.energy}%  ★ STR:${pet.strength}`, canvas.width / 2, 36);

      // Ground baseline line
      const floorY = canvas.height - 32;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, floorY);
      ctx.lineTo(canvas.width - 8, floorY);
      ctx.stroke();

      // Walking motion
      const walkSpeed = 0.5;
      xPos += walkSpeed * dir;
      if (xPos > canvas.width - 50) dir = -1;
      if (xPos < 50) dir = 1;

      const config = configRef.current;
      const spriteImg = spriteImageRef.current;

      if (config && spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
        // Real Digimon Sprite animation
        const walkFrames: SpriteFrame[] = (config.frames.walking && config.frames.walking.length > 0)
          ? config.frames.walking
          : (config.frames.standing && config.frames.standing.length > 0)
          ? config.frames.standing
          : [{ x: 0, y: 0, w: 32, h: 32 }];

        const frameIndex = Math.floor(frame / 12) % walkFrames.length;
        const currentFrame = walkFrames[frameIndex] || walkFrames[0];

        const srcX = currentFrame.x;
        const srcY = currentFrame.y;
        const srcW = currentFrame.w;
        const srcH = currentFrame.h;

        // Render scale on PiP canvas (scaled to fit well)
        const renderScale = 1.3;
        const destW = srcW * renderScale;
        const destH = srcH * renderScale;

        // Ground baseline alignment:
        // Sprite feet naturally rest exactly on floorY!
        const totalGroundOffset = ((currentFrame.offsetY || 0) + (config.groundOffset || 0)) * renderScale;
        const destY = floorY - destH - totalGroundOffset;
        const destX = xPos - destW / 2;

        // Ground shadow beneath feet
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(xPos, floorY - 1, Math.max(12, destW * 0.35), 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        // Flip horizontally based on walking direction
        if (dir < 0) {
          ctx.translate(destX + destW, destY);
          ctx.scale(-1, 1);
          ctx.drawImage(spriteImg, srcX, srcY, srcW, srcH, 0, 0, destW, destH);
        } else {
          ctx.drawImage(spriteImg, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
        }
        ctx.restore();
      } else {
        // Fallback animated avatar if sprite is loading
        const bounce = Math.sin(frame * 0.15) * 3;
        const cy = floorY - 22 + bounce;

        // Glowing shadow
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.beginPath();
        ctx.arc(xPos, cy, 22, 0, Math.PI * 2);
        ctx.fill();

        // Avatar body
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(xPos, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#0f172a';
        const eyeOffset = dir > 0 ? 3 : -3;
        ctx.beginPath();
        ctx.arc(xPos + eyeOffset, cy - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Footer badge
      ctx.fillStyle = '#475569';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DIGIPET NATIVE OVERLAY • OVER ALL APPS', canvas.width / 2, canvas.height - 10);

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, pet, species, isImgLoaded]);

  if (!isOpen) return null;

  // Trigger Native Picture-in-Picture window
  const handleLaunchPip = async () => {
    sound.playButton();
    setErrorMsg(null);

    // Path 1: Document Picture-in-Picture API (Chrome 116+ on desktop/tablets)
    if ('documentPictureInPicture' in window) {
      try {
        const pipWin = await (window as any).documentPictureInPicture.requestWindow({
          width: 240,
          height: 240,
        });
        pipWindowRef.current = pipWin;
        setIsPipActive(true);

        // Copy styles into pip window
        document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
          pipWin.document.head.appendChild(node.cloneNode(true));
        });

        // Create container inside PiP window
        const container = pipWin.document.createElement('div');
        container.style.cssText =
          'width: 100%; height: 100%; background: #070b14; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; color: white; padding: 12px; box-sizing: border-box; overflow: hidden;';

        const config = configRef.current;
        const spriteSrc = config?.sheetPath || '';
        const walkFrame0 = config?.frames.walking?.[0] || config?.frames.standing?.[0];

        container.innerHTML = `
          <div style="font-size: 11px; font-weight: bold; color: #38bdf8; margin-bottom: 6px; letter-spacing: 1px;">
            ${species?.name.toUpperCase() || 'DIGIMON'}
          </div>
          <div style="font-size: 9px; color: #34d399; margin-bottom: 8px;">
            ♥ Hunger: ${pet.hunger}% • Energy: ${pet.energy}%
          </div>
          <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; position: relative; margin: 4px 0;">
            ${
              spriteSrc && walkFrame0
                ? `<div style="width: ${walkFrame0.w}px; height: ${walkFrame0.h}px; background-image: url('${spriteSrc}'); background-position: -${walkFrame0.x}px -${walkFrame0.y}px; background-repeat: no-repeat; image-rendering: pixelated; transform: scale(1.4); transform-origin: center;"></div>`
                : `<div style="font-size: 40px;">👾</div>`
            }
          </div>
          <div style="font-size: 8px; color: #64748b; margin-top: 6px; text-transform: uppercase;">
            FLOATING OVER ALL APPS
          </div>
        `;

        pipWin.document.body.appendChild(container);

        pipWin.addEventListener('pagehide', () => {
          setIsPipActive(false);
          pipWindowRef.current = null;
        });

        return;
      } catch (err: any) {
        console.warn('Document PiP request returned or unsupported, falling back to Video PiP:', err);
      }
    }

    // Path 2: Video + Canvas Picture-in-Picture (Universal Android Chrome & Chromium)
    if (canvasRef.current && videoRef.current) {
      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        // Capture continuous stream at 30 fps
        const stream = canvas.captureStream ? canvas.captureStream(30) : (canvas as any).mozCaptureStream(30);
        video.srcObject = stream;

        // Play the video stream
        await video.play();

        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPipActive(false);
        } else {
          await video.requestPictureInPicture();
          setIsPipActive(true);

          video.addEventListener('leavepictureinpicture', () => {
            setIsPipActive(false);
          });
        }
      } catch (err: any) {
        console.error('Video PiP error:', err);
        setErrorMsg(err.message || 'Picture-in-Picture was blocked or is not supported by your browser.');
      }
    }
  };

  // Native Android Overlay Permission check and trigger
  const [hasAndroidPermission, setHasAndroidPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPerm = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const res = await OverlayPlugin.checkPermission();
          setHasAndroidPermission(!!res?.granted);
          return;
        }
        // In mobile browser/PWA, PiP is natively allowed by Chrome
        setHasAndroidPermission(true);
      } catch (err) {
        console.warn('OverlayPlugin check error:', err);
      }
    };
    if (isOpen) {
      checkPerm();
    }
  }, [isOpen]);

  const handleOpenAndroidSettings = async () => {
    sound.playButton();
    try {
      if (Capacitor.isNativePlatform()) {
        await OverlayPlugin.requestPermission();
        setTimeout(async () => {
          try {
            const res = await OverlayPlugin.checkPermission();
            setHasAndroidPermission(!!res?.granted);
          } catch (_) {}
        }, 1200);
        return;
      }
    } catch (e) {
      console.warn('OverlayPlugin request failed:', e);
    }

    // In web browsers, advise user on how Chrome native PiP works
    setErrorMsg(
      'In Android Chrome, Picture-in-Picture is pre-enabled! Simply tap "POP OUT FLOATING OVERLAY" below, then tap Home or switch apps to see your Digimon float over your screen.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl text-cyan-400">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-chakra font-bold text-white text-lg">
                NATIVE SYSTEM SCREEN OVERLAY
              </h3>
              <p className="text-slate-400 text-xs">Float over other apps & home screen on Android & Desktop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="py-4 space-y-4">
          {/* Android Overlay Permission & Info Box */}
          <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border-2 border-amber-500/60 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold font-chakra text-sm">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>ANDROID: FLOAT OVER HOME & APPS</span>
              </div>
              {hasAndroidPermission !== null && (
                <span className={`text-[10px] font-pixel px-2 py-0.5 rounded-full font-bold ${
                  hasAndroidPermission ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {hasAndroidPermission ? '✓ PIP READY' : '⚠️ ACTION REQUIRED'}
                </span>
              )}
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Using Android Chrome's native <strong className="text-amber-300">Picture-in-Picture (PiP)</strong> engine, your real animated Digimon floats freely in a resizable, draggable window on top of WhatsApp, TikTok, Discord, YouTube, or your Android launcher!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleOpenAndroidSettings}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-pixel text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>CHECK ANDROID PERMISSION</span>
              </button>

              <button
                onClick={toggleWakeLock}
                className={`py-2 px-3 font-pixel text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 border ${
                  wakeLockActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${wakeLockActive ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
                <span>{wakeLockActive ? 'SCREEN AWAKE: ON' : 'KEEP SCREEN AWAKE'}</span>
              </button>
            </div>
          </div>

          {/* Picture-in-Picture Live Preview Window */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-chakra text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Live Companion Stream</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-pixel bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                ● 30 FPS STREAM
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              This preview window is streamed directly to Android's floating window manager with real animated sprites and feet grounded on the floor baseline.
            </p>
          </div>

          {/* Canvas Preview & Offscreen Video Stream Target */}
          <div className="flex flex-col items-center justify-center py-1">
            <canvas
              ref={canvasRef}
              width={240}
              height={180}
              className="rounded-2xl border-2 border-slate-700 shadow-2xl bg-black"
            />
            {/* Note: Video must be in DOM tree and not display:none for Chrome Android PiP stream playback */}
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className="fixed -top-[9999px] left-0 w-1 h-1 opacity-0 pointer-events-none"
            />
          </div>

          {/* Launch Button */}
          <button
            onClick={handleLaunchPip}
            className={`w-full py-3.5 px-4 rounded-2xl font-pixel text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98 ${
              isPipActive
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>
              {isPipActive
                ? '✓ FLOATING OVERLAY ACTIVE! (TAP TO CLOSE)'
                : 'POP OUT FLOATING OVERLAY (NATIVE PIP)'}
            </span>
          </button>

          {errorMsg && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Android How-to Instructions */}
          <div className="text-[11px] text-slate-400 bg-black/40 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <span>💡</span>
              <span>Pro-tip for Android users:</span>
            </div>
            <div>
              1. Tap <strong>"POP OUT FLOATING OVERLAY"</strong> above.
            </div>
            <div>
              2. When the mini player opens, <strong>swipe up to go Home or switch to any other app</strong>.
            </div>
            <div>
              3. The Digimon window will stay on your screen! You can drag it anywhere or pinch to resize.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-pixel text-[10px] rounded-xl font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
