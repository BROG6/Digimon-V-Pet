import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DigimonSpecies, DigiEggInfo } from '../types/digimon';
import { 
  YUKIMIBOTAMON_SPRITESHEET_PATH,
  BOTAMON_FRAMES 
} from '../utils/battleSpiritSprites';
import { NEW_DIGIMON_SPRITES, SpriteFrame } from '../utils/newDigimonSprites';
import { getEffectiveSpriteConfig } from '../utils/customSpriteManager';
import { PixelBerryIcon, PixelMeatIcon, PixelMushroomIcon, PixelSirloinIcon, PixelVitaminIcon } from './PixelItemIcons';

// Cached HTMLImageElement loader so spritesheet frames blit onto native-pixel canvases
// without reallocating oversized DOM/GPU textures mid-attack.
const spriteImageCache = new Map<string, HTMLImageElement>();
const spriteImageListeners = new Map<string, Set<() => void>>();

function acquireSpriteImage(src: string, onLoad: () => void): HTMLImageElement | null {
  if (typeof window === 'undefined' || !src) return null;
  const cached = spriteImageCache.get(src);
  if (cached) {
    if (cached.complete && cached.naturalWidth > 0) {
      return cached;
    }
    let listeners = spriteImageListeners.get(src);
    if (!listeners) {
      listeners = new Set();
      spriteImageListeners.set(src, listeners);
    }
    listeners.add(onLoad);
    return null;
  }

  const img = new Image();
  spriteImageCache.set(src, img);
  const listeners = new Set<() => void>([onLoad]);
  spriteImageListeners.set(src, listeners);

  const flush = () => {
    const activeListeners = spriteImageListeners.get(src);
    if (!activeListeners) return;
    spriteImageListeners.delete(src);
    activeListeners.forEach((cb) => cb());
  };

  img.onload = flush;
  img.onerror = () => {
    spriteImageListeners.delete(src);
  };
  img.src = src;

  if (img.complete && img.naturalWidth > 0) {
    spriteImageListeners.delete(src);
    return img;
  }
  return null;
}

function unsubscribeSpriteImage(src: string, onLoad: () => void) {
  const listeners = spriteImageListeners.get(src);
  if (listeners) {
    listeners.delete(onLoad);
  }
}

interface PixelSpriteCanvasProps {
  sheetSrc: string;
  frame: SpriteFrame;
  canvasW: number;
  canvasH: number;
  drawX: number;
  drawY: number;
  displayW: number;
  displayH: number;
  style?: React.CSSProperties;
  filter?: string;
}

const PixelSpriteCanvas: React.FC<PixelSpriteCanvasProps> = ({
  sheetSrc,
  frame,
  canvasW,
  canvasH,
  drawX,
  drawY,
  displayW,
  displayH,
  style,
  filter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageReadyTick, setImageReadyTick] = useState(0);

  useEffect(() => {
    if (!sheetSrc) return;
    let cancelled = false;
    const notify = () => {
      if (!cancelled) setImageReadyTick((t) => t + 1);
    };
    const ready = acquireSpriteImage(sheetSrc, notify);
    if (ready) {
      setImageReadyTick((t) => t + 1);
    }
    return () => {
      cancelled = true;
      unsubscribeSpriteImage(sheetSrc, notify);
    };
  }, [sheetSrc]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasW, canvasH);
    const img = spriteImageCache.get(sheetSrc);
    if (!img || !img.complete || img.naturalWidth === 0 || frame.w <= 0 || frame.h <= 0) {
      return;
    }

    ctx.imageSmoothingEnabled = false;
    if (frame.rotate) {
      const isRot90 = frame.rotate === 90 || frame.rotate === -90 || frame.rotate === 270;
      const destW = isRot90 ? frame.h : frame.w;
      const destH = isRot90 ? frame.w : frame.h;
      const cx = drawX + destW * 0.5;
      const cy = drawY + destH * 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((frame.rotate * Math.PI) / 180);
      ctx.drawImage(
        img,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        -frame.w * 0.5,
        -frame.h * 0.5,
        frame.w,
        frame.h
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        img,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        drawX,
        drawY,
        frame.w,
        frame.h
      );
    }
  }, [sheetSrc, frame, canvasW, canvasH, drawX, drawY, imageReadyTick]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      className="pixel-art pointer-events-none select-none"
      style={{
        width: `${displayW}px`,
        height: `${displayH}px`,
        imageRendering: 'pixelated',
        filter,
        ...style,
      }}
    />
  );
};

export type DigimonPose = 
  | 'standing' 
  | 'walking' 
  | 'sitting' 
  | 'training' 
  | 'attack_melee'
  | 'attack_ranged'
  | 'pooping' 
  | 'eating' 
  | 'sleeping' 
  | 'sick' 
  | 'happy'
  | 'hatching'
  | 'dead';

interface DigimonSpriteProps {
  species?: DigimonSpecies;
  egg?: DigiEggInfo;
  action?:
    | 'idle'
    | 'walk'
    | 'eat'
    | 'sleep'
    | 'sick'
    | 'attack'
    | 'attack_melee'
    | 'attack_ranged'
    | 'happy'
    | 'cheer'
    | 'sit'
    | 'poop'
    | 'train'
    | 'hatch'
    | 'dead';
  pose?: DigimonPose;
  eatItem?: 'meat' | 'vitamin' | 'sirloin' | 'mushroom' | 'berry';
  isCracking?: boolean;
  scale?: number;
  facing?: 'left' | 'right';
  lcdMode?: boolean;
  hunger?: number;
  happiness?: number;
  showMoodIndicator?: boolean;
  onClick?: () => void;
  className?: string;
}

type MoodKind = 'heart' | 'question' | 'sweat' | 'angry';

function getMoodKind(hunger?: number, happiness?: number): MoodKind | null {
  if (typeof hunger !== 'number' && typeof happiness !== 'number') return null;
  const h = typeof hunger === 'number' ? hunger : 80;
  const hap = typeof happiness === 'number' ? happiness : 80;

  if (hap <= 30 || (h <= 25 && hap <= 60)) return 'angry';
  if (h <= 40 || hap <= 45) return 'sweat';
  if (h < 70 || hap < 70) return 'question';
  return 'heart';
}

const PixelMoodIcon: React.FC<{ mood: MoodKind }> = ({ mood }) => {
  if (mood === 'heart') {
    return (
      <svg viewBox="0 0 16 16" className="w-4 h-4" shapeRendering="crispEdges">
        <rect x="2" y="2" width="4" height="2" fill="#9f1239" />
        <rect x="10" y="2" width="4" height="2" fill="#9f1239" />
        <rect x="1" y="4" width="14" height="4" fill="#f43f5e" />
        <rect x="3" y="3" width="3" height="2" fill="#fb7185" />
        <rect x="10" y="3" width="3" height="2" fill="#fb7185" />
        <rect x="3" y="4" width="2" height="2" fill="#ffe4e6" />
        <rect x="2" y="8" width="12" height="2" fill="#e11d48" />
        <rect x="4" y="10" width="8" height="2" fill="#e11d48" />
        <rect x="6" y="12" width="4" height="2" fill="#be123c" />
        <rect x="7" y="14" width="2" height="1" fill="#9f1239" />
      </svg>
    );
  }
  if (mood === 'angry') {
    return (
      <svg viewBox="0 0 16 16" className="w-4 h-4" shapeRendering="crispEdges">
        <rect x="1" y="1" width="14" height="14" rx="2" fill="#7f1d1d" opacity="0.85" />
        {/* Classic 4-corner comic/V-pet anger vein */}
        <path d="M3,6 L6,6 L6,3 M10,3 L10,6 L13,6 M3,10 L6,10 L6,13 M10,13 L10,10 L13,10" stroke="#fca5a5" strokeWidth="2" fill="none" />
        <path d="M3,6 L6,6 L6,3 M10,3 L10,6 L13,6 M3,10 L6,10 L6,13 M10,13 L10,10 L13,10" stroke="#ef4444" strokeWidth="1" fill="none" />
      </svg>
    );
  }
  if (mood === 'sweat') {
    return (
      <svg viewBox="0 0 16 16" className="w-4 h-4" shapeRendering="crispEdges">
        <rect x="7" y="1" width="2" height="2" fill="#0369a1" />
        <rect x="6" y="3" width="4" height="2" fill="#38bdf8" />
        <rect x="5" y="5" width="6" height="3" fill="#38bdf8" />
        <rect x="4" y="8" width="8" height="4" fill="#0ea5e9" />
        <rect x="5" y="12" width="6" height="2" fill="#0284c7" />
        <rect x="6" y="14" width="4" height="1" fill="#0369a1" />
        <rect x="6" y="6" width="2" height="3" fill="#e0f2fe" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" shapeRendering="crispEdges">
      <rect x="2" y="1" width="12" height="14" rx="3" fill="#0f172a" opacity="0.88" />
      <rect x="5" y="3" width="6" height="2" fill="#fbbf24" />
      <rect x="9" y="5" width="2" height="2" fill="#fbbf24" />
      <rect x="7" y="7" width="2" height="3" fill="#fde047" />
      <rect x="7" y="11" width="2" height="2" fill="#fde047" />
    </svg>
  );
};

function sampleEvenly<T>(items: T[], maxCount: number): T[] {
  if (items.length <= maxCount) return items;
  if (maxCount <= 1) return items.slice(0, 1);
  const picked: T[] = [];
  for (let i = 0; i < maxCount; i++) {
    const idx = Math.min(items.length - 1, Math.round((i / (maxCount - 1)) * (items.length - 1)));
    picked.push(items[idx]);
  }
  return picked;
}

function resolvePoseFrames(
  config: NonNullable<ReturnType<typeof getEffectiveSpriteConfig>>,
  activePose: DigimonPose
): SpriteFrame[] {
  const standing = config.frames.standing || [];
  const walking = config.frames.walking || standing;
  const training = config.frames.training || standing;

  if (activePose === 'attack_melee') {
    const baseW = config.stageWidth || standing[0]?.w || training[0]?.w || 48;
    const baseH = config.stageHeight || standing[0]?.h || training[0]?.h || 48;
    const compactTrain = training.filter((f) => {
      const rot = f.rotate === 90 || f.rotate === -90 || f.rotate === 270;
      const fw = rot ? f.h : f.w;
      const fh = rot ? f.w : f.h;
      return fw <= baseW * 1.48 && fh <= baseH * 1.75;
    });
    const meleeSource =
      compactTrain.length >= 3
        ? compactTrain
        : training.slice(0, Math.max(3, Math.ceil(training.length * 0.45)));

    const dashFrames =
      walking.length >= 3
        ? [
            walking[0],
            walking[Math.floor(walking.length * 0.45)],
            walking[walking.length - 1],
          ]
        : walking.slice(0, 2);

    const strikeSample = sampleEvenly(meleeSource, 5);
    const peakIdx = Math.max(0, strikeSample.length - 2);
    const peakStrike = strikeSample[peakIdx] || strikeSample[0];
    const settleFrame = standing[0] || meleeSource[0];
    const sequence = [
      ...dashFrames,
      ...strikeSample,
      ...(peakStrike ? [peakStrike] : []),
      ...(settleFrame ? [settleFrame] : []),
    ].filter(Boolean);
    return sequence.length > 0 ? sequence : standing;
  }

  if (activePose === 'attack_ranged') {
    if (training.length <= 1) return training.length > 0 ? training : standing;
    const splitIdx = Math.max(2, Math.floor(training.length * 0.35));
    const windupPart = sampleEvenly(training.slice(0, splitIdx), 3);
    const castPart = sampleEvenly(training.slice(splitIdx), 6);
    // Find widest/most-extended emission frame to emphasize ranged release
    let widestFrame = castPart[0] || training[training.length - 1];
    let widestW = 0;
    for (const f of castPart) {
      const rot = f.rotate === 90 || f.rotate === -90 || f.rotate === 270;
      const fw = rot ? f.h : f.w;
      if (fw >= widestW) {
        widestW = fw;
        widestFrame = f;
      }
    }
    const sequence = [
      ...windupPart,
      ...castPart.slice(0, Math.max(1, castPart.length - 1)),
      widestFrame,
      castPart[castPart.length - 1] || standing[0],
    ].filter(Boolean);
    return sequence.length > 0 ? sequence : standing;
  }

  const poseKey =
    activePose === 'pooping'
      ? 'sitting'
      : activePose === 'hatching' || activePose === 'dead'
      ? 'standing'
      : activePose;
  return config.frames[poseKey] || standing;
}

export const DigimonSprite: React.FC<DigimonSpriteProps> = ({
  species,
  egg,
  action = 'idle',
  pose,
  eatItem = 'meat',
  isCracking = false,
  scale = 1,
  facing = 'right',
  lcdMode = false,
  hunger,
  happiness,
  showMoodIndicator = true,
  onClick,
  className = '',
}) => {
  // Determine active pose
  const activePose: DigimonPose = pose || (
    action === 'walk' ? 'walking' :
    action === 'eat' ? 'eating' :
    action === 'sleep' ? 'sleeping' :
    action === 'sick' ? 'sick' :
    action === 'attack_melee' ? 'attack_melee' :
    action === 'attack_ranged' || action === 'attack' ? 'attack_ranged' :
    action === 'train' ? 'training' :
    action === 'happy' || action === 'cheer' ? 'happy' :
    action === 'sit' ? 'sitting' :
    action === 'poop' ? 'pooping' :
    action === 'hatch' ? 'hatching' :
    action === 'dead' ? 'dead' :
    'standing'
  );

  // Frame animation counter keyed by pose+species so pose transitions never paint a 1-frame stale index
  const spriteLookupKey = `${activePose}-${species?.spriteId || species?.id || 'none'}-${facing}`;
  const [frameState, setFrameState] = useState<{ key: string; idx: number }>({
    key: spriteLookupKey,
    idx: 0,
  });
  const frameIndex = frameState.key === spriteLookupKey ? frameState.idx : 0;
  const [eatBeat, setEatBeat] = useState<number>(0);
  const [spriteRevision, setSpriteRevision] = useState<number>(0);
  const [moodPulseKey, setMoodPulseKey] = useState<number>(0);
  const [isMoodVisible, setIsMoodVisible] = useState<boolean>(false);

  const canShowMood =
    showMoodIndicator &&
    !egg &&
    Boolean(species) &&
    (activePose === 'standing' || activePose === 'walking' || activePose === 'sitting');
  const currentMood = canShowMood ? getMoodKind(hunger, happiness) : null;

  // Periodic floating mood pulse above the Digimon's head
  useEffect(() => {
    if (!canShowMood || !currentMood) {
      setIsMoodVisible(false);
      return;
    }

    let hideTimeout: number | undefined;
    let intervalId: number | undefined;

    const triggerPulse = () => {
      setMoodPulseKey((k) => k + 1);
      setIsMoodVisible(true);
      if (hideTimeout) window.clearTimeout(hideTimeout);
      hideTimeout = window.setTimeout(() => {
        setIsMoodVisible(false);
      }, 2200);
    };

    const initialTimer = window.setTimeout(() => {
      triggerPulse();
      const repeatMs = currentMood === 'angry' || currentMood === 'sweat' ? 16000 : 22000;
      intervalId = window.setInterval(triggerPulse, repeatMs);
    }, 3500);

    return () => {
      window.clearTimeout(initialTimer);
      if (hideTimeout) window.clearTimeout(hideTimeout);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [canShowMood, currentMood]);

  // Listen for custom sprite edits from Sprite Studio
  useEffect(() => {
    const handleUpdate = () => {
      setSpriteRevision((r) => r + 1);
    };
    window.addEventListener('digipet-sprites-updated', handleUpdate);
    return () => window.removeEventListener('digipet-sprites-updated', handleUpdate);
  }, []);

  // Eating chomp cycle: 4 distinct beats (0: ready, 1: bite 1, 2: bite 2, 3: yum/swallow)
  useEffect(() => {
    if (activePose !== 'eating') {
      setEatBeat(0);
      return;
    }
    setEatBeat(0);
    const beatTimer = setInterval(() => {
      setEatBeat((prev) => (prev + 1) % 4);
    }, 420);
    return () => clearInterval(beatTimer);
  }, [activePose, species?.id]);

  useEffect(() => {
    setFrameState({ key: spriteLookupKey, idx: 0 });

    let count = 4;
    let hasSharedStage = false;
    const spriteLookupId = species?.spriteId || species?.id;
    const config = spriteLookupId ? getEffectiveSpriteConfig(spriteLookupId) : undefined;
    if (config) {
      const frames = resolvePoseFrames(config, activePose);
      count = Math.max(1, frames.length);
      hasSharedStage = Boolean(config.stageWidth && config.stageHeight);
    }

    if (count <= 1) return;

    // Faint (sleeping/sick) and battle attacks play through cleanly once per trigger and settle on last frame.
    const isPlayOncePose =
      activePose === 'sleeping' ||
      activePose === 'sick' ||
      activePose === 'attack_melee' ||
      activePose === 'attack_ranged';

    const intervalTime =
      activePose === 'eating'
        ? 210
        : activePose === 'attack_melee'
        ? 52
        : activePose === 'attack_ranged'
        ? 58
        : hasSharedStage || count >= 8
        ? 62.5
        : activePose === 'walking'
        ? 140
        : activePose === 'training'
        ? 150
        : 320;

    const timer = setInterval(() => {
      setFrameState((prev) => {
        const cur = prev.key === spriteLookupKey ? prev.idx : 0;
        const nextIdx = isPlayOncePose
          ? (cur < count - 1 ? cur + 1 : cur)
          : (cur + 1) % count;
        return { key: spriteLookupKey, idx: nextIdx };
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activePose, species?.id, species?.spriteId, facing, spriteRevision, spriteLookupKey]);

  // Preload all sprite sheets for this species so combat pose transitions never flash blank
  useEffect(() => {
    const spriteLookupId = species?.spriteId || species?.id;
    const config = spriteLookupId ? getEffectiveSpriteConfig(spriteLookupId) : undefined;
    if (!config) return;
    const sheets = new Set<string>();
    if (config.sheetPath) sheets.add(config.sheetPath);
    Object.values(config.frames).forEach((list) => {
      list?.forEach((f) => {
        if (f.sheetPath) sheets.add(f.sheetPath);
      });
    });
    const noop = () => {};
    sheets.forEach((src) => {
      acquireSpriteImage(src, noop);
    });
    return () => {
      sheets.forEach((src) => unsubscribeSpriteImage(src, noop));
    };
  }, [species?.id, species?.spriteId, spriteRevision]);

  // MEMORIAL / GRAVE RENDERER (When neglected to death)
  if (activePose === 'dead') {
    return (
      <div
        onClick={onClick}
        className={`relative inline-block cursor-pointer select-none ${className}`}
        style={{ transform: `scale(${scale * 0.72})` }}
      >
        <div className="relative w-24 h-28 flex flex-col items-center justify-end">
          {/* Floating Winged Spirit & Halo */}
          <motion.div
            animate={{ y: [-2, -9, -2], opacity: [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="mb-1 flex flex-col items-center"
          >
            <div className="w-7 h-2 rounded-full border-2 border-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.7)]" />
            <span className="font-pixel text-[8px] text-slate-900 bg-white/85 px-1.5 py-0.5 rounded mt-0.5 border border-slate-700">
              R.I.P.
            </span>
          </motion.div>

          {/* Classic V-Pet Pixel Gravestone */}
          <svg viewBox="0 0 80 80" className="w-20 h-20 overflow-visible pixel-art">
            <ellipse cx="40" cy="74" rx="26" ry="5" fill="rgba(0,0,0,0.35)" />
            <path
              d="M 20,72 L 20,30 Q 20,12 40,12 Q 60,12 60,30 L 60,72 Z"
              fill={lcdMode ? '#1e2b20' : '#94a3b8'}
              stroke={lcdMode ? '#152017' : '#1e293b'}
              strokeWidth="4"
            />
            <rect
              x="14"
              y="66"
              width="52"
              height="9"
              rx="2"
              fill={lcdMode ? '#152017' : '#64748b'}
              stroke="#0f172a"
              strokeWidth="3"
            />
            {/* Engraved Cross / Computer Skull Emblem */}
            <rect x="37" y="25" width="6" height="24" fill={lcdMode ? '#dcefd7' : '#334155'} />
            <rect x="30" y="32" width="20" height="6" fill={lcdMode ? '#dcefd7' : '#334155'} />
          </svg>
        </div>
      </div>
    );
  }

  // EGG RENDERER
  if (egg || !species) {
    const eggInfo = egg || {
      id: 'egg-default',
      crest: 'courage' as const,
      crestName: 'Crest of Courage',
      crestColor: '#f97316',
      tamerName: 'Tai',
      partnerRookie: 'Agumon',
      description: '',
      eggPrimaryColor: '#fb923c',
      eggPatternColor: '#9a3412',
      eggPattern: 'flames' as const,
    };

    const isHatchAnim = activePose === 'hatching';
    const showCracks = isHatchAnim || isCracking;

    return (
      <div 
        onClick={onClick}
        className={`relative inline-block cursor-pointer select-none ${className}`}
        style={{ transform: `scale(${scale * 0.656})` }}
      >
        {isHatchAnim && (
          <motion.div
            initial={{ opacity: 0.3, scale: 0.7 }}
            animate={{ opacity: [0.35, 0.75, 0.25], scale: [0.9, 1.45, 1.75] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.5) 0%, transparent 70%)' }}
            className="absolute inset-0 -m-4 rounded-full pointer-events-none"
          />
        )}

        <motion.div
          animate={
            isHatchAnim
              ? {
                  rotate: [-16, 16, -18, 18, -12, 12, 0],
                  y: [0, -10, 0, -14, -4, 0],
                  scale: [1, 1.08, 0.96, 1.12, 1],
                }
              : isCracking
              ? { rotate: [-7, 7, -6, 6, 0], y: [-3, 1, -3] }
              : activePose === 'happy'
              ? { rotate: [-10, 10, -10], y: [-6, 0, -6] }
              : { rotate: [-3, 3, -3], y: [-2, 2, -2] }
          }
          transition={{
            repeat: Infinity,
            duration: isHatchAnim ? 0.36 : isCracking ? 0.55 : activePose === 'happy' ? 0.6 : 1.8,
            ease: 'easeInOut' as const,
          }}
          className="relative w-20 h-28 flex items-center justify-center"
        >
          <div className="absolute -bottom-2 w-20 h-5 bg-black/25 rounded-full" />
          <svg viewBox="0 0 100 130" className="w-full h-full overflow-visible">
            <defs>
              <radialGradient id={`eggGrad-${eggInfo.id}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="40%" stopColor={eggInfo.eggPrimaryColor} />
                <stop offset="100%" stopColor={eggInfo.eggPatternColor} />
              </radialGradient>
            </defs>
            <path
              d="M 50,8 C 25,8 10,45 10,80 C 10,110 26,126 50,126 C 74,126 90,110 90,80 C 90,45 75,8 50,8 Z"
              fill={lcdMode ? '#1e2b20' : `url(#eggGrad-${eggInfo.id})`}
              stroke={lcdMode ? '#152017' : '#1e293b'}
              strokeWidth="4"
            />
            {!lcdMode && eggInfo.eggPattern === 'flames' && (
              <g fill={eggInfo.eggPatternColor} opacity="0.85">
                <path d="M 50,115 Q 40,85 32,95 Q 40,65 50,45 Q 60,65 68,95 Q 60,85 50,115 Z" />
                <path d="M 24,105 Q 22,80 18,90 Q 25,75 30,65 Q 28,85 24,105 Z" />
                <path d="M 76,105 Q 78,80 82,90 Q 75,75 70,65 Q 72,85 76,105 Z" />
              </g>
            )}
            {!lcdMode && eggInfo.eggPattern === 'stripes' && (
              <g stroke={eggInfo.eggPatternColor} strokeWidth="8" strokeLinecap="round" opacity="0.85">
                <path d="M 20,55 Q 50,65 80,55" fill="none" />
                <path d="M 14,80 Q 50,92 86,80" fill="none" />
                <path d="M 22,105 Q 50,115 78,105" fill="none" />
              </g>
            )}
            {!lcdMode && (eggInfo.eggPattern === 'spots' || eggInfo.eggPattern === 'wind') && (
              <g fill={eggInfo.eggPatternColor} opacity="0.8">
                <circle cx="34" cy="60" r="8" />
                <circle cx="66" cy="54" r="7" />
                <circle cx="52" cy="84" r="10" />
                <circle cx="30" cy="96" r="6" />
                <circle cx="70" cy="98" r="7" />
              </g>
            )}
            {!lcdMode && (eggInfo.eggPattern === 'circuit' || eggInfo.eggPattern === 'mech') && (
              <g stroke={eggInfo.eggPatternColor} strokeWidth="3.5" fill="none" opacity="0.85">
                <path d="M 22,58 H 42 V 76 H 68" />
                <path d="M 78,94 H 54 V 110 H 32" />
                <circle cx="42" cy="58" r="4" fill={eggInfo.eggPatternColor} />
                <circle cx="68" cy="76" r="4" fill={eggInfo.eggPatternColor} />
                <circle cx="54" cy="94" r="4" fill={eggInfo.eggPatternColor} />
              </g>
            )}
            {!lcdMode && eggInfo.eggPattern === 'flower' && (
              <g fill={eggInfo.eggPatternColor} opacity="0.82">
                <circle cx="50" cy="68" r="6" />
                <circle cx="50" cy="54" r="6" />
                <circle cx="50" cy="82" r="6" />
                <circle cx="36" cy="68" r="6" />
                <circle cx="64" cy="68" r="6" />
                <circle cx="50" cy="68" r="5" fill="#fef08a" />
              </g>
            )}
            {!lcdMode && (eggInfo.eggPattern === 'cross' || eggInfo.eggPattern === 'earth') && (
              <g fill={eggInfo.eggPatternColor} opacity="0.82">
                <rect x="44" y="46" width="12" height="52" rx="3" />
                <rect x="26" y="66" width="48" height="12" rx="3" />
              </g>
            )}
            {!lcdMode && (eggInfo.eggPattern === 'star' || eggInfo.eggPattern === 'sacred' || eggInfo.eggPattern === 'moon') && (
              <g fill={eggInfo.eggPatternColor} opacity="0.85">
                <polygon points="50,42 56,60 75,60 60,71 66,89 50,78 34,89 40,71 25,60 44,60" />
                <circle cx="50" cy="103" r="6" />
              </g>
            )}
            {!lcdMode && (eggInfo.eggPattern === 'dragon' || eggInfo.eggPattern === 'ninja' || eggInfo.eggPattern === 'hazard') && (
              <g stroke={eggInfo.eggPatternColor} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.88">
                <path d="M 30,52 L 50,78 L 70,52" />
                <path d="M 26,84 L 50,108 L 74,84" />
              </g>
            )}
            <ellipse cx="36" cy="38" rx="8" ry="16" transform="rotate(-25, 36, 38)" fill="#ffffff" opacity={lcdMode ? '0' : '0.6'} />

            {/* Hatching Cracks & Radiant Light */}
            {showCracks && (
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path
                  d="M 22,64 L 38,54 L 48,68 L 62,50 L 78,66"
                  stroke={isHatchAnim ? '#fef08a' : '#0f172a'}
                  strokeWidth={isHatchAnim ? '6' : '3.5'}
                />
                {isHatchAnim && (
                  <>
                    <path d="M 22,64 L 38,54 L 48,68 L 62,50 L 78,66" stroke="#ffffff" strokeWidth="2.5" />
                    <path d="M 48,68 L 42,88 L 55,102" stroke="#fef08a" strokeWidth="4" />
                  </>
                )}
              </g>
            )}
          </svg>

          {/* Flying Shell Sparks during Hatching */}
          {isHatchAnim && (
            <>
              <motion.div
                animate={{ x: [-4, -28], y: [-8, -30], opacity: [1, 0], rotate: [-20, -90] }}
                transition={{ repeat: Infinity, duration: 0.55 }}
                className="absolute top-3 left-2 w-2.5 h-2.5 bg-amber-200 border border-slate-900 rounded-xs"
              />
              <motion.div
                animate={{ x: [4, 28], y: [-10, -28], opacity: [1, 0], rotate: [20, 110] }}
                transition={{ repeat: Infinity, duration: 0.55, delay: 0.15 }}
                className="absolute top-4 right-2 w-2.5 h-2.5 bg-cyan-200 border border-slate-900 rounded-xs"
              />
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTIC NEW SPRITE SHEET RENDERER (ALL DIGIMON SPECIES)
  // =========================================================================
  const spriteLookupId = species.spriteId || species.id;
  const newConfig = getEffectiveSpriteConfig(spriteLookupId);
  if (newConfig) {
    const poseFrames = resolvePoseFrames(newConfig, activePose);
    const currentFrame: SpriteFrame =
      poseFrames[Math.min(frameIndex, poseFrames.length - 1)] ||
      poseFrames[0] ||
      { x: 0, y: 0, w: 32, h: 32 };

    // Stage-based authentic pixel scale (tuned for crisp sizing across all stages)
    let stageMultiplier = 1.35;
    if (species.stage === 'fresh') stageMultiplier = 1.25;
    else if (species.stage === 'in-training') stageMultiplier = 1.3;
    else if (species.stage === 'rookie') stageMultiplier = 1.35;
    else if (species.stage === 'champion') stageMultiplier = 1.45;
    else if (species.stage === 'ultimate') stageMultiplier = 1.55;
    else if (species.stage === 'mega') stageMultiplier = 1.65;

    // Special tuning using constant stage dimensions (and oversized frame spans) so extra-large Digimon fit cleanly
    const isCurrentRotated = currentFrame.rotate === 90 || currentFrame.rotate === -90 || currentFrame.rotate === 270;
    const curUnscaledW = isCurrentRotated ? currentFrame.h : currentFrame.w;
    const curUnscaledH = isCurrentRotated ? currentFrame.w : currentFrame.h;
    const refH = Math.max(
      newConfig.stageHeight || curUnscaledH,
      (newConfig.stageWidth || curUnscaledW) * 0.78,
      activePose === 'sleeping' ? Math.max(curUnscaledH, curUnscaledW * 0.78) : 0
    );
    if (refH > 155) {
      stageMultiplier = Math.min(stageMultiplier, 0.72);
    } else if (refH > 130) {
      stageMultiplier = Math.min(stageMultiplier, 0.84);
    } else if (refH > 115) {
      stageMultiplier = Math.min(stageMultiplier, 0.95);
    } else if (refH > 95) {
      stageMultiplier = Math.min(stageMultiplier, 1.05);
    } else if (refH > 80) {
      stageMultiplier = Math.min(stageMultiplier, 1.15);
    } else if (refH > 65) {
      stageMultiplier = Math.min(stageMultiplier, 1.3);
    }

    // 20% smaller overall scale
    const pixelScale = (scale || 1) * stageMultiplier * 0.8;


    return (
      <div
        onClick={onClick}
        className={`relative inline-block cursor-pointer select-none ${className}`}
        style={{
          transform: `scaleX(${facing === 'left' ? -1 : 1})`,
        }}
      >
        {/* Status Emoticons */}
        {activePose === 'sleeping' && (
          <motion.div
            animate={{ y: [-4, -18], x: [0, 6], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' as const }}
            className="absolute -top-5 right-0 font-pixel text-cyan-300 text-xs font-bold pointer-events-none z-20"
          >
            Zzz...
          </motion.div>
        )}

        {activePose === 'sick' && (
          <motion.div
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-pixel text-purple-400 bg-purple-950/90 border border-purple-500 rounded-full px-2 py-0.5 z-20 whitespace-nowrap"
          >
            ☠️ SICK!
          </motion.div>
        )}

        {activePose === 'eating' && (
          <div className="absolute -right-5 top-[52%] -translate-y-1/2 pointer-events-none z-30 flex items-center">
            {/* Progressive Pixel Meat / Vitamin Prop in front of mouth (4-beat chomp cycle) */}
            <motion.div
              key={`food-beat-${eatItem}-${eatBeat}`}
              initial={eatBeat === 0 ? { y: -14, opacity: 0, scale: 0.7 } : { scale: 1.18 }}
              animate={
                eatBeat === 3
                  ? { y: 2, opacity: eatItem === 'vitamin' ? 0 : 0.85, scale: 0.9, rotate: -14 }
                  : { y: 0, opacity: 1, scale: 1, rotate: eatBeat % 2 === 1 ? -14 : 0 }
              }
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="relative"
            >
              {eatItem === 'vitamin' ? (
                <PixelVitaminIcon className="w-6 h-6" />
              ) : eatItem === 'sirloin' ? (
                <PixelSirloinIcon className="w-7 h-7" />
              ) : eatItem === 'mushroom' ? (
                <PixelMushroomIcon className="w-6 h-6" />
              ) : eatItem === 'berry' ? (
                <PixelBerryIcon className="w-6 h-6" />
              ) : (
                <PixelMeatIcon
                  biteStage={eatBeat === 0 ? 0 : eatBeat === 1 ? 1 : eatBeat === 2 ? 2 : 3}
                  className="w-7 h-7"
                />
              )}

              {/* Flying pixel crumbs on bite beats */}
              {(eatBeat === 1 || eatBeat === 2) && (
                <>
                  <motion.span
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: -10, y: -12, opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.35 }}
                    className="absolute top-0 left-1 w-1.5 h-1.5 bg-amber-300 rounded-xs border border-slate-900"
                  />
                  <motion.span
                    initial={{ x: 2, y: 2, opacity: 1, scale: 1 }}
                    animate={{ x: -6, y: 10, opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.38 }}
                    className="absolute bottom-1 left-2 w-1.5 h-1.5 bg-rose-400 rounded-xs border border-slate-900"
                  />
                </>
              )}
            </motion.div>

            {/* Counter-flipped NOM! popup on swallow beat */}
            {eatBeat === 3 && (
              <motion.span
                initial={{ y: 2, opacity: 0, scale: 0.6 }}
                animate={{ y: -16, opacity: [0, 1, 0], scale: 1.05 }}
                transition={{ duration: 0.4 }}
                style={{ transform: facing === 'left' ? 'scaleX(-1)' : undefined }}
                className="absolute -top-4 -left-4 font-pixel text-[8px] font-bold text-amber-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.95)] whitespace-nowrap"
              >
                NOM!
              </motion.span>
            )}
          </div>
        )}

        {activePose === 'happy' && (
          <motion.div
            animate={{ y: [0, -20], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 text-rose-500 text-lg pointer-events-none z-20"
          >
            ❤️
          </motion.div>
        )}

        {/* Periodic Mood Indicator Badge (Heart / Angry / Sweat / Question) */}
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-20"
        >
          <div style={{ transform: facing === 'left' ? 'scaleX(-1)' : undefined }}>
            <AnimatePresence>
              {isMoodVisible && currentMood && (
                <motion.div
                  key={`mood-${currentMood}-${moodPulseKey}`}
                  initial={{ opacity: 0, y: 4, scale: 0.65 }}
                  animate={
                    currentMood === 'angry'
                      ? { opacity: [0, 1, 1, 0], x: [-2, 2, -2, 2, 0], y: [2, -6, -8, -10], scale: [0.7, 1.15, 1.05, 0.9] }
                      : currentMood === 'sweat'
                      ? { opacity: [0, 1, 1, 0], y: [-5, 0, 2, 4], scale: [0.75, 1.08, 1, 0.85] }
                      : currentMood === 'question'
                      ? { opacity: [0, 1, 1, 0], y: [2, -6, -8, -10], rotate: [-6, 6, -3, 0], scale: [0.7, 1.1, 1, 0.9] }
                      : { opacity: [0, 1, 1, 0], y: [3, -7, -11, -15], scale: [0.7, 1.15, 1.05, 0.9] }
                  }
                  exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.18 } }}
                  transition={{ duration: 2.1, ease: 'easeOut' }}
                  title={
                    currentMood === 'heart'
                      ? 'Happy & Well-Fed'
                      : currentMood === 'angry'
                      ? 'Hungry or Upset!'
                      : currentMood === 'sweat'
                      ? 'Needs Food or Attention'
                      : 'Curious / Peckish'
                  }
                >
                  <PixelMoodIcon mood={currentMood} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Shared-origin frame stacking (no artificial bobbing/shifting for baked 16fps frames) */}
        {(() => {
          const isRotated = currentFrame.rotate === 90 || currentFrame.rotate === -90 || currentFrame.rotate === 270;
          const usesSharedOrigin = Boolean(newConfig.stageWidth && newConfig.stageHeight);

          if (usesSharedOrigin) {
            const unscaledFrameW = isRotated ? currentFrame.h : currentFrame.w;
            const unscaledFrameH = isRotated ? currentFrame.w : currentFrame.h;
            const baseStageW = newConfig.stageWidth || unscaledFrameW;
            const baseStageH = newConfig.stageHeight || unscaledFrameH;
            const boxStageW = activePose === 'sleeping' ? Math.max(baseStageW, unscaledFrameW) : baseStageW;
            const boxStageH = activePose === 'sleeping' ? Math.max(baseStageH, unscaledFrameH) : baseStageH;

            const getFramePlacement = (f: SpriteFrame) => {
              const rot = f.rotate === 90 || f.rotate === -90 || f.rotate === 270;
              const fw = rot ? f.h : f.w;
              const fh = rot ? f.w : f.h;
              const rawX = f.offsetX || 0;
              const rawY = (f.offsetY || 0) + (newConfig.groundOffset || 0);
              const fx = activePose === 'sleeping' ? (boxStageW - fw) * 0.5 : rawX;
              const fy =
                activePose === 'sleeping'
                  ? Math.max(0, Math.min(rawY, Math.max(0, boxStageH - fh)))
                  : rawY;
              return { fx, fy, fw, fh };
            };

            let minX = Number.POSITIVE_INFINITY;
            let minY = Number.POSITIVE_INFINITY;
            let maxX = Number.NEGATIVE_INFINITY;
            let maxY = Number.NEGATIVE_INFINITY;
            for (const f of poseFrames) {
              const { fx, fy, fw, fh } = getFramePlacement(f);
              minX = Math.min(minX, fx);
              minY = Math.min(minY, fy);
              maxX = Math.max(maxX, fx + fw);
              maxY = Math.max(maxY, fy + fh);
            }
            if (!Number.isFinite(minX)) {
              minX = 0;
              minY = 0;
              maxX = unscaledFrameW;
              maxY = unscaledFrameH;
            }
            const curPlacement = getFramePlacement(currentFrame);
            const canvasW = Math.max(1, Math.ceil(maxX - minX));
            const canvasH = Math.max(1, Math.ceil(maxY - minY));
            const drawX = Math.round(curPlacement.fx - minX);
            const drawY = Math.round(curPlacement.fy - minY);

            const stageW = boxStageW * pixelScale;
            const stageH = boxStageH * pixelScale;

            const chompAnim = activePose === 'eating'
              ? (eatBeat === 1 || eatBeat === 2
                  ? { x: 6, y: 0, scaleX: 1, scaleY: 1, rotate: 0 }
                  : eatBeat === 3
                  ? { x: 0, y: -4, scaleX: 1, scaleY: 1, rotate: 0 }
                  : { x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0 })
              : activePose === 'attack_melee'
              ? {
                  x: [0, 5, 10, 4, 0],
                  y: [0, -3, -2, 0, 0],
                  scaleX: [1, 1.07, 1.12, 0.96, 1],
                  scaleY: [1, 0.95, 0.93, 1.04, 1],
                  rotate: [0, 7, 10, -2, 0],
                }
              : activePose === 'attack_ranged'
              ? {
                  x: [0, -6, 4, -2, 0],
                  y: [0, -2, -1, 0, 0],
                  scaleX: [1, 0.93, 1.08, 1, 1],
                  scaleY: [1, 1.06, 0.95, 1, 1],
                  rotate: [0, -6, 3, 0, 0],
                }
              : activePose === 'sleeping'
              ? { x: 0, y: 0, scaleX: [1, 1.035, 1], scaleY: [1, 1.045, 1], rotate: 0 }
              : { x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0 };

            const spriteFilter = lcdMode
              ? 'grayscale(100%) contrast(150%) brightness(0.65)'
              : species.spriteFilter || undefined;

            return (
              <motion.div
                animate={chompAnim}
                transition={
                  activePose === 'sleeping'
                    ? { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }
                    : activePose === 'attack_melee'
                    ? { duration: 0.56, ease: 'easeOut' }
                    : activePose === 'attack_ranged'
                    ? { duration: 0.62, ease: 'easeOut' }
                    : { duration: activePose === 'eating' ? 0.14 : 0.08, ease: 'easeOut' }
                }
                className="relative overflow-visible pixel-art"
                style={{
                  width: `${stageW}px`,
                  height: `${stageH}px`,
                  transformOrigin: 'bottom center',
                }}
              >
                <PixelSpriteCanvas
                  sheetSrc={currentFrame.sheetPath || newConfig.sheetPath}
                  frame={currentFrame}
                  canvasW={canvasW}
                  canvasH={canvasH}
                  drawX={drawX}
                  drawY={drawY}
                  displayW={canvasW * pixelScale}
                  displayH={canvasH * pixelScale}
                  filter={spriteFilter}
                  style={{
                    position: 'absolute',
                    left: `${minX * pixelScale}px`,
                    top: `${minY * pixelScale}px`,
                  }}
                />
              </motion.div>
            );
          }

          let maxFrameW = 1;
          let maxFrameH = 1;
          for (const f of poseFrames) {
            const rot = f.rotate === 90 || f.rotate === -90 || f.rotate === 270;
            maxFrameW = Math.max(maxFrameW, rot ? f.h : f.w);
            maxFrameH = Math.max(maxFrameH, rot ? f.w : f.h);
          }
          const curFrameW = isRotated ? currentFrame.h : currentFrame.w;
          const curFrameH = isRotated ? currentFrame.w : currentFrame.h;
          const drawX = Math.round((maxFrameW - curFrameW) * 0.5);
          const drawY = Math.round(maxFrameH - curFrameH);

          const displayW = maxFrameW * pixelScale;
          const displayH = maxFrameH * pixelScale;
          const effectiveGroundOffsetY = activePose === 'sleeping'
            ? 0
            : ((currentFrame.offsetY || 0) + (newConfig.groundOffset || 0)) * pixelScale;
          const spriteFilter = lcdMode
            ? 'grayscale(100%) contrast(150%) brightness(0.65)'
            : species.spriteFilter || undefined;

          return (
            <motion.div
              animate={
                activePose === 'walking'
                  ? {
                      y: [
                        effectiveGroundOffsetY,
                        effectiveGroundOffsetY - 2.5,
                        effectiveGroundOffsetY,
                        effectiveGroundOffsetY - 1,
                      ],
                      x: 0,
                      scaleX: 1,
                      scaleY: 1,
                    }
                  : activePose === 'attack_melee'
                  ? {
                      x: [0, 5, 10, 4, 0],
                      y: [effectiveGroundOffsetY, effectiveGroundOffsetY - 3, effectiveGroundOffsetY, effectiveGroundOffsetY],
                      scaleX: [1, 1.07, 1.12, 1],
                      scaleY: [1, 0.95, 0.94, 1],
                      rotate: [0, 7, 10, 0],
                    }
                  : activePose === 'attack_ranged'
                  ? {
                      x: [0, -6, 4, -2, 0],
                      y: [effectiveGroundOffsetY, effectiveGroundOffsetY - 2, effectiveGroundOffsetY, effectiveGroundOffsetY],
                      scaleX: [1, 0.93, 1.08, 1],
                      scaleY: [1, 1.06, 0.95, 1],
                      rotate: [0, -6, 3, 0],
                    }
                  : activePose === 'training'
                  ? { x: [0, -2, 4, 0], y: effectiveGroundOffsetY, scaleX: 1, scaleY: 1, rotate: 0 }
                  : activePose === 'sleeping'
                  ? { x: 0, y: 0, scaleX: [1, 1.035, 1], scaleY: [1, 1.045, 1], rotate: 0 }
                  : { x: 0, y: effectiveGroundOffsetY, scaleX: 1, scaleY: 1, rotate: 0 }
              }
              transition={
                activePose === 'walking'
                  ? { repeat: Infinity, duration: 0.56, ease: 'easeInOut' }
                  : activePose === 'attack_melee'
                  ? { duration: 0.56, ease: 'easeOut' }
                  : activePose === 'attack_ranged'
                  ? { duration: 0.62, ease: 'easeOut' }
                  : activePose === 'training'
                  ? { repeat: Infinity, duration: 0.6 }
                  : activePose === 'sleeping'
                  ? { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }
                  : { duration: 0.12 }
              }
              className="relative overflow-visible pixel-art"
              style={{
                width: `${displayW}px`,
                height: `${displayH}px`,
                transformOrigin: 'bottom center',
              }}
            >
              <PixelSpriteCanvas
                sheetSrc={currentFrame.sheetPath || newConfig.sheetPath}
                frame={currentFrame}
                canvasW={maxFrameW}
                canvasH={maxFrameH}
                drawX={drawX}
                drawY={drawY}
                displayW={displayW}
                displayH={displayH}
                filter={spriteFilter}
              />
            </motion.div>
          );
        })()}
      </div>
    );
  }


  // Fallback if sprite sheet is loading or missing
  const fallbackColor = species.colorTheme || '#f59e0b';

  return (
    <div
      onClick={onClick}
      className={`relative inline-block cursor-pointer select-none ${className}`}
      style={{
        transform: `scale(${scale * 0.656}) scaleX(${facing === 'left' ? -1 : 1})`,
      }}
    >
      <motion.div
        animate={
          activePose === 'walking'
            ? { y: [0, -3, 0], x: 0, scaleX: 1, scaleY: 1, rotate: 0 }
            : activePose === 'attack_melee'
            ? { x: [0, 6, 10, 0], y: [0, -4, 0, 0], rotate: [0, 8, 10, 0], scaleX: [1, 1.1, 1], scaleY: [1, 0.94, 1] }
            : activePose === 'attack_ranged'
            ? { x: [0, -6, 3, 0], y: 0, rotate: [0, -6, 3, 0], scaleX: [1, 0.92, 1.08, 1], scaleY: [1, 1.06, 0.95, 1] }
            : activePose === 'training'
            ? { x: [0, -3, 6, 0], y: 0, scaleX: 1, scaleY: 1, rotate: 0 }
            : activePose === 'sleeping'
            ? { x: 0, y: 0, scaleX: [1, 1.035, 1], scaleY: [1, 1.045, 1], rotate: 0 }
            : { y: [0, -2, 0], x: 0, scaleX: 1, scaleY: 1, rotate: 0 }
        }
        transition={
          activePose === 'sleeping'
            ? { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }
            : activePose === 'attack_melee' || activePose === 'attack_ranged'
            ? { duration: 0.56, ease: 'easeOut' }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: 'bottom center' }}
        className="relative flex items-center justify-center"
      >
        <svg viewBox="0 0 110 100" className="w-20 h-20 overflow-visible pixel-art">
          <ellipse cx="55" cy="56" rx="24" ry="22" fill={fallbackColor} stroke="#0f172a" strokeWidth="3.5" />
          <ellipse cx="55" cy="62" rx="14" ry="12" fill="#fef08a" stroke="#0f172a" strokeWidth="2" />
          <circle cx="45" cy="48" r="4.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="65" cy="48" r="4.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="46" cy="48" r="2.5" fill="#0f172a" />
          <circle cx="64" cy="48" r="2.5" fill="#0f172a" />
        </svg>
      </motion.div>
    </div>
  );
};
