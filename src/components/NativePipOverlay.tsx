import React, { useState, useEffect, useRef } from 'react';
import { PetState, DigimonSpecies } from '../types/digimon';
import { sound } from '../utils/audio';
import { ExternalLink, Sparkles, AlertCircle, Smartphone, Zap, X, ShieldCheck, CheckCircle2, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { 
  checkOverlayPermission, 
  requestOverlayPermission, 
  startNativeFloatingOverlay, 
  stopNativeFloatingOverlay, 
  isNativeOverlayActive 
} from '../utils/nativeOverlay';
import { getEffectiveSpriteConfig } from '../utils/customSpriteManager';
import { DigimonSpriteConfig, SpriteFrame } from '../utils/newDigimonSprites';
import {
  GridLayoutPresetId,
  GRID_LAYOUT_PRESETS,
  GRID_RATIOS_CHANGED_EVENT,
  getSavedGridPreset,
  setSavedGridPreset,
  getGridRowRatios,
  isFlyingSpecies,
  computeParabolicJumpPoint,
  stepWaypointFlight,
} from '../utils/petOverlayEngine';
import { buildNativeOverlayPayload } from '../utils/evolutionEngine';

interface NativePipOverlayProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onOpenGridAlignment?: () => void;
}

export const NativePipOverlay: React.FC<NativePipOverlayProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onOpenGridAlignment,
}) => {
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isImgLoaded, setIsImgLoaded] = useState<boolean>(false);
  const [hasAndroidPermission, setHasAndroidPermission] = useState<boolean | null>(null);
  const [isCheckingPerm, setIsCheckingPerm] = useState<boolean>(false);
  const [gridPreset, setGridPreset] = useState<GridLayoutPresetId>(() => getSavedGridPreset());
  const [gridRevision, setGridRevision] = useState<number>(0);

  const isFlying = isFlyingSpecies(species);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number>(0);
  const pipWindowRef = useRef<Window | null>(null);
  const wakeLockRef = useRef<any>(null);
  const spriteImageRef = useRef<HTMLImageElement | null>(null);
  const configRef = useRef<DigimonSpriteConfig | undefined>(undefined);

  // Load effective sprite config & image for the active species
  useEffect(() => {
    const speciesId = species?.spriteId || pet?.currentSpeciesId;
    if (!speciesId) return;
    try {
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
    } catch (e) {
      console.warn('Error loading sprite config for PiP:', e);
    }
  }, [pet?.currentSpeciesId, species?.spriteId]);

  // Screen Wake Lock API management
  const toggleWakeLock = async () => {
    sound.playButton();
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
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

  // Check Android overlay permission and status
  const checkPermStatus = async () => {
    setIsCheckingPerm(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const granted = await checkOverlayPermission();
        setHasAndroidPermission(granted);
        const isAct = await isNativeOverlayActive();
        setIsPipActive(isAct);
        return granted;
      } else {
        // In web preview / browser
        setHasAndroidPermission(false);
        return false;
      }
    } catch (err) {
      console.warn('checkPerm error:', err);
      return false;
    } finally {
      setIsCheckingPerm(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (isOpen) {
      checkPermStatus().then((granted) => {
        if (!active) return;
        // If on native platform and permission is not granted, trigger permission prompt immediately
        if (Capacitor.isNativePlatform() && !granted) {
          requestOverlayPermission().catch(() => {});
        }
      });
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  // Re-check permission and sync grid preset/ratios when window regains focus or grid changes
  useEffect(() => {
    if (!isOpen) return;
    setGridPreset(getSavedGridPreset());
    const handleFocus = () => {
      checkPermStatus();
    };
    const handleGridChange = () => {
      setGridPreset(getSavedGridPreset());
      setGridRevision((v) => v + 1);
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener(GRID_RATIOS_CHANGED_EVENT, handleGridChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener(GRID_RATIOS_CHANGED_EVENT, handleGridChange);
    };
  }, [isOpen]);

  // Canvas drawing loop for Video PiP fallback
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch (e) {
      console.warn('Could not get 2d context for PiP canvas:', e);
      return;
    }
    if (!ctx) return;

    let isCancelled = false;
    let frame = 0;
    const rowRatios = getGridRowRatios(gridPreset);
    // Map launcher row ratios directly into the 240x180 preview viewport without the 320px real-screen floor
    const previewRowYs = rowRatios.map((r) =>
      Math.round(48 + Math.max(0.12, Math.min(0.96, r)) * Math.max(60, canvas.height - 70))
    );
    let currentRow = Math.max(0, previewRowYs.length - 1);
    let xPos = 60;
    let yPos = isFlying ? canvas.height * 0.55 : (previewRowYs[currentRow] || canvas.height - 28);
    let targetX = canvas.width - 60;
    let targetY = yPos;
    let dir = 1;
    let mode: 'walk' | 'jump' | 'fly' = isFlying ? 'fly' : 'walk';
    let jumpStartX = xPos;
    let jumpStartY = yPos;
    let jumpEndX = xPos;
    let jumpEndY = yPos;
    let jumpTargetRow = currentRow;
    let jumpProgress = 0;

    const renderLoop = () => {
      if (isCancelled) return;

      try {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

        // Draw surface row shelves for grounded platforming
        if (!isFlying) {
          previewRowYs.forEach((ry, idx) => {
            const isDock = idx === previewRowYs.length - 1;
            ctx.strokeStyle = isDock ? '#22c55e' : 'rgba(56, 189, 248, 0.28)';
            ctx.lineWidth = isDock ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(12, ry);
            ctx.lineTo(canvas.width - 12, ry);
            ctx.stroke();
          });
        }

        // Title header
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(species?.name ? species.name.toUpperCase() : 'DIGIMON COMPANION', canvas.width / 2, 16);

        // Update preview physics state
        if (isFlying) {
          const step = stepWaypointFlight(xPos, yPos, targetX, targetY, 1.35);
          xPos = step.x;
          yPos = step.y;
          dir = step.dx >= 0 ? 1 : -1;
          if (step.arrived) {
            targetX = 36 + Math.random() * (canvas.width - 72);
            targetY = 54 + Math.random() * (canvas.height - 84);
          }
        } else if (mode === 'jump') {
          jumpProgress += 0.045;
          if (jumpProgress >= 1) {
            xPos = jumpEndX;
            yPos = jumpEndY;
            currentRow = jumpTargetRow;
            mode = 'walk';
            targetX = xPos < canvas.width / 2 ? canvas.width - 44 : 44;
          } else {
            const pt = computeParabolicJumpPoint(jumpStartX, jumpStartY, jumpEndX, jumpEndY, jumpProgress, 26);
            xPos = pt.x;
            yPos = pt.y;
          }
        } else {
          const walkSpeed = 1.05;
          const dx = targetX - xPos;
          dir = dx >= 0 ? 1 : -1;
          if (Math.abs(dx) <= walkSpeed) {
            xPos = targetX;
            if (previewRowYs.length > 1 && Math.random() < 0.65) {
              jumpTargetRow = currentRow === 0 ? 1 : currentRow === previewRowYs.length - 1 ? currentRow - 1 : (Math.random() < 0.5 ? currentRow - 1 : currentRow + 1);
              jumpStartX = xPos;
              jumpStartY = previewRowYs[currentRow];
              jumpEndX = 44 + Math.random() * (canvas.width - 88);
              jumpEndY = previewRowYs[jumpTargetRow];
              jumpProgress = 0;
              dir = jumpEndX >= jumpStartX ? 1 : -1;
              mode = 'jump';
            } else {
              targetX = xPos < canvas.width / 2 ? canvas.width - 44 : 44;
            }
          } else {
            xPos += dir * walkSpeed;
          }
          yPos = previewRowYs[currentRow] || canvas.height - 24;
        }

        const floorY = yPos;
        const config = configRef.current;
        const spriteImg = spriteImageRef.current;

        const walkFrames: SpriteFrame[] = (config?.frames?.walking && config.frames.walking.length > 0)
          ? config.frames.walking
          : (config?.frames?.standing && config.frames.standing.length > 0)
          ? config.frames.standing
          : [{ x: 0, y: 0, w: 32, h: 32 }];

        const usesSharedStage = Boolean(config?.stageWidth && config?.stageHeight);
        const frameIndex = usesSharedStage
          ? Math.floor(performance.now() / 62.5) % Math.max(1, walkFrames.length)
          : Math.floor(frame / 12) % Math.max(1, walkFrames.length);
        const currentFrame = walkFrames[frameIndex] || walkFrames[0] || { x: 0, y: 0, w: 32, h: 32 };

        const srcX = currentFrame.x || 0;
        const srcY = currentFrame.y || 0;
        const srcW = Math.max(1, currentFrame.w || 32);
        const srcH = Math.max(1, currentFrame.h || 32);
        const rot = currentFrame.rotate || 0;
        const isRot = rot === 90 || rot === -90 || rot === 270;
        const unitW = isRot ? srcH : srcW;
        const unitH = isRot ? srcW : srcH;

        const maxDim = Math.max(config?.stageWidth || unitW, config?.stageHeight || unitH, unitW, unitH, 32);
        const renderScale = Math.min(1.35, 70 / maxDim);

        const destW = unitW * renderScale;
        const destH = unitH * renderScale;

        let destX: number;
        let destY: number;
        if (usesSharedStage) {
          const stageW = (config!.stageWidth || unitW) * renderScale;
          const stageH = (config!.stageHeight || unitH) * renderScale;
          const stageLeft = xPos - stageW / 2;
          const stageTop = floorY - stageH;
          destX = stageLeft + (currentFrame.offsetX || 0) * renderScale;
          destY = stageTop + ((currentFrame.offsetY || 0) + (config?.groundOffset || 0)) * renderScale;
        } else {
          const totalGroundOffset = (((currentFrame.offsetY || 0) + (config?.groundOffset || 0)) * renderScale) || 0;
          destY = floorY - destH - totalGroundOffset;
          destX = xPos - destW / 2;
        }

        // Ground shadow beneath feet (safe ellipse / arc fallback)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        if (typeof ctx.ellipse === 'function') {
          ctx.ellipse(xPos, floorY - 1, Math.max(12, destW * 0.35), 4, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(xPos, floorY - 1, Math.max(8, destW * 0.25), 0, Math.PI * 2);
        }
        ctx.fill();

        if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
          ctx.save();
          const cx = destX + destW / 2;
          const cy = destY + destH / 2;
          ctx.translate(cx, cy);
          if (dir < 0) {
            ctx.scale(-1, 1);
          }
          if (rot) {
            ctx.rotate((rot * Math.PI) / 180);
          }
          const drawW = srcW * renderScale;
          const drawH = srcH * renderScale;
          ctx.drawImage(spriteImg, srcX, srcY, srcW, srcH, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        } else {
          // Fallback animated avatar if sprite is loading
          const bounce = Math.sin(frame * 0.15) * 3;
          const cy = floorY - 22 + bounce;

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(xPos, cy, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.stroke();

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
      } catch (loopErr) {
        console.warn('Canvas renderLoop non-fatal warning:', loopErr);
      }

      if (!isCancelled) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
      }
    };

    renderLoop();

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, pet, species, isImgLoaded, gridPreset, gridRevision, isFlying]);

  if (!isOpen) return null;

  // Trigger Native Picture-in-Picture window or Android Native System Overlay
  const handleLaunchPip = async () => {
    sound.playButton();
    setErrorMsg(null);

    // Path 0: Native Android APK System Overlay (Floats over all apps)
    if (Capacitor.isNativePlatform()) {
      try {
        const granted = await checkOverlayPermission();
        if (!granted) {
          setErrorMsg('Please switch ON "Allow display over other apps" in Android Settings.');
          await requestOverlayPermission();
          return;
        }

        const active = await isNativeOverlayActive();
        if (active) {
          await stopNativeFloatingOverlay();
          setIsPipActive(false);
          return;
        }

        const ok = await startNativeFloatingOverlay(
          buildNativeOverlayPayload({
            pet,
            species,
            presetId: gridPreset,
          })
        );

        if (ok) {
          setIsPipActive(true);
          onClose();
        } else {
          setErrorMsg('Please grant "Allow display over other apps" permission in Settings.');
        }
      } catch (err: any) {
        console.warn('Native overlay invocation error:', err);
        setErrorMsg('Native overlay error: ' + (err.message || 'Permission denied'));
      }
      return;
    }

    // Path 1: Document Picture-in-Picture API (Chrome 116+ on desktop/tablets)
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      try {
        const pipWin = await (window as any).documentPictureInPicture.requestWindow({
          width: 240,
          height: 240,
        });
        pipWindowRef.current = pipWin;
        setIsPipActive(true);

        try {
          document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
            pipWin.document.head.appendChild(node.cloneNode(true));
          });
        } catch (_) {}

        const container = pipWin.document.createElement('div');
        container.style.cssText =
          'width: 100%; height: 100%; background: #070b14; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; color: white; padding: 12px; box-sizing: border-box; overflow: hidden;';

        const config = configRef.current;
        const spriteSrc = config?.sheetPath || '';
        const walkFrame0 = config?.frames?.walking?.[0] || config?.frames?.standing?.[0];

        container.innerHTML = `
          <div style="font-size: 11px; font-weight: bold; color: #38bdf8; margin-bottom: 6px; letter-spacing: 1px;">
            ${species?.name ? species.name.toUpperCase() : 'DIGIMON'}
          </div>
          <div style="font-size: 9px; color: #34d399; margin-bottom: 8px;">
            ♥ Hunger: ${pet?.hunger ?? 80}% • Energy: ${pet?.energy ?? 80}%
          </div>
          <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; position: relative; margin: 4px 0;">
            ${
              spriteSrc && walkFrame0
                ? `<div style="width: ${walkFrame0.w}px; height: ${walkFrame0.h}px; background-image: url('${spriteSrc}'); background-position: -${walkFrame0.x}px -${walkFrame0.y}px; background-repeat: no-repeat; image-rendering: pixelated; transform: scale(1.54); transform-origin: center;"></div>`
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
        console.warn('Document PiP request returned or unsupported, trying video PiP fallback:', err);
      }
    }

    // Path 2: Video + Canvas Picture-in-Picture (Universal Android Chrome & Chromium)
    if (canvasRef.current && videoRef.current) {
      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        const stream = canvas.captureStream ? canvas.captureStream(30) : (canvas as any).mozCaptureStream?.(30);
        if (!stream) {
          setErrorMsg('Canvas video stream is not supported on this device/browser.');
          return;
        }

        video.srcObject = stream;
        await video.play().catch(() => {});

        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPipActive(false);
        } else if ((video as any).requestPictureInPicture) {
          await video.requestPictureInPicture();
          setIsPipActive(true);

          video.addEventListener('leavepictureinpicture', () => {
            setIsPipActive(false);
          });
        } else {
          setErrorMsg('Picture-in-Picture is blocked in iframe preview or not supported.');
        }
      } catch (err: any) {
        console.warn('Video PiP non-fatal error:', err);
        setErrorMsg(err.message || 'Picture-in-Picture was blocked or is not supported by your browser.');
      }
    }
  };

  const handleOpenAndroidSettings = async () => {
    sound.playButton();
    setErrorMsg(null);
    try {
      if (Capacitor.isNativePlatform()) {
        await requestOverlayPermission();
        setTimeout(async () => {
          try {
            const granted = await checkOverlayPermission();
            setHasAndroidPermission(granted);
          } catch (_) {}
        }, 1500);
        return;
      }
    } catch (e) {
      console.warn('Overlay request failed:', e);
    }

    setErrorMsg(
      'In Android Chrome / Web App, Picture-in-Picture is built-in! Tap "POP OUT FLOATING OVERLAY (PIP)" below, then swipe to Home or switch to any app to see your Digimon float over your screen.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl text-purple-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-chakra font-bold text-white text-base sm:text-lg">
                DISPLAY OVER OTHER APPS
              </h3>
              <p className="text-slate-400 text-xs">Float pet over WhatsApp, YouTube & Home Screen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-4 space-y-4">

          {/* Android Overlay Permission Action Box */}
          <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border-2 border-amber-500/60 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold font-chakra text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>OVERLAY PERMISSION STATUS</span>
              </div>
              <span className={`text-[10px] font-pixel px-2 py-0.5 rounded-full font-bold ${
                hasAndroidPermission ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              }`}>
                {hasAndroidPermission ? '✓ GRANTED' : '⚠️ PERMISSION REQUIRED'}
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Android requires <strong className="text-amber-300">"Allow display over other apps"</strong> permission so your Digimon can float freely on top of WhatsApp, YouTube, TikTok, Discord, and your phone launcher.
            </p>

            {/* Direct Permission Action Button */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleOpenAndroidSettings}
                className="w-full py-3 px-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-pixel text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98"
              >
                <Smartphone className="w-4 h-4 text-slate-950" />
                <span>ALLOW DISPLAY OVER OTHER APPS (OPEN SETTINGS)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={checkPermStatus}
                  disabled={isCheckingPerm}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-pixel text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isCheckingPerm ? 'CHECKING...' : 'RE-CHECK PERMISSION'}</span>
                </button>

                <button
                  onClick={toggleWakeLock}
                  className={`py-2 px-3 font-pixel text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
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
          </div>

          {/* Primary Action 1: Launch Floating Window over all apps */}
          <button
            onClick={handleLaunchPip}
            className={`w-full py-3.5 px-4 rounded-2xl font-pixel text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98 cursor-pointer ${
              isPipActive
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>
              {isPipActive
                ? '✓ FLOATING OVERLAY RUNNING! (TAP TO CLOSE)'
                : '🚀 POP OUT FLOATING COMPANION (OVER ALL APPS)'}
            </span>
          </button>

          {/* Launcher Surface Grid & Navigation Mode Selector */}
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-cyan-300 font-chakra font-bold text-xs">
                <LayoutGrid className="w-4 h-4 text-cyan-400" />
                <span>LAUNCHER GRID NAVIGATION</span>
              </div>
              <div className="flex items-center gap-1.5">
                {onOpenGridAlignment && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playButton();
                      onOpenGridAlignment();
                    }}
                    className="text-[9px] font-pixel px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-400/40 flex items-center gap-1 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-2.5 h-2.5" />
                    <span>ADJUST</span>
                  </button>
                )}
                <span className="text-[9px] font-pixel px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {isFlying ? '360° FLIGHT' : 'GRID'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(GRID_LAYOUT_PRESETS) as GridLayoutPresetId[]).map((presetId) => {
                const preset = GRID_LAYOUT_PRESETS[presetId];
                const selected = gridPreset === presetId;
                const shortTitle =
                  presetId === 'asus-4row'
                    ? '4-Row + Dock'
                    : presetId === 'compact-5row'
                    ? '5-Row + Dock'
                    : 'Dock Only';
                return (
                  <button
                    key={presetId}
                    onClick={() => {
                      sound.playButton();
                      setSavedGridPreset(presetId);
                      setGridPreset(presetId);
                    }}
                    className={`py-2 px-2 rounded-xl font-pixel text-[9px] border transition-all cursor-pointer ${
                      selected
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                    }`}
                    title={preset.description}
                  >
                    {shortTitle}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {isFlying
                ? `${species?.name || 'Your partner'} flies freely across the full display and periodically ventures off-screen to forage.`
                : `${GRID_LAYOUT_PRESETS[gridPreset].description}. Grounded pets jump between icon rows and wander off-screen to forage.`}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Preview Window */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-chakra text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Live Companion Stream Preview</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-pixel bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                ● 30 FPS STREAM
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center pt-2">
              <canvas
                ref={canvasRef}
                width={240}
                height={180}
                className="rounded-2xl border-2 border-slate-700 shadow-2xl bg-black"
              />
              <video
                ref={videoRef}
                muted
                playsInline
                autoPlay
                className="fixed -top-[9999px] left-0 w-1 h-1 opacity-0 pointer-events-none"
              />
            </div>
          </div>

          {/* Android How-to Instructions */}
          <div className="text-[11px] text-slate-400 bg-black/40 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <span>💡</span>
              <span>How Display Over Other Apps Works:</span>
            </div>
            <div>
              1. Tap <strong className="text-amber-300">"ALLOW DISPLAY OVER OTHER APPS"</strong> to toggle permission in Android Settings.
            </div>
            <div>
              2. Tap <strong className="text-cyan-300">"POP OUT FLOATING COMPANION"</strong> to launch the floating window.
            </div>
            <div>
              3. Swipe to Home or switch to any app (WhatsApp, YouTube, etc.) — your Digimon stays floating on top of your screen!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
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
