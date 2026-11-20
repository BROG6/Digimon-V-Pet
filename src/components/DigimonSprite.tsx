import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DigimonSpecies, DigiEggInfo } from '../types/digimon';
import { 
  YUKIMIBOTAMON_SPRITESHEET_PATH,
  BOTAMON_FRAMES 
} from '../utils/battleSpiritSprites';
import { NEW_DIGIMON_SPRITES, SpriteFrame } from '../utils/newDigimonSprites';
import { getEffectiveSpriteConfig } from '../utils/customSpriteManager';
import { PixelMeatIcon, PixelVitaminIcon } from './PixelItemIcons';

export type DigimonPose = 
  | 'standing' 
  | 'walking' 
  | 'sitting' 
  | 'training' 
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
  action?: 'idle' | 'walk' | 'eat' | 'sleep' | 'sick' | 'attack' | 'happy' | 'cheer' | 'sit' | 'poop' | 'train' | 'hatch' | 'dead';
  pose?: DigimonPose;
  eatItem?: 'meat' | 'vitamin';
  isCracking?: boolean;
  scale?: number;
  facing?: 'left' | 'right';
  lcdMode?: boolean;
  onClick?: () => void;
  className?: string;
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
  onClick,
  className = '',
}) => {
  // Determine active pose
  const activePose: DigimonPose = pose || (
    action === 'walk' ? 'walking' :
    action === 'eat' ? 'eating' :
    action === 'sleep' ? 'sleeping' :
    action === 'sick' ? 'sick' :
    action === 'attack' || action === 'train' ? 'training' :
    action === 'happy' || action === 'cheer' ? 'happy' :
    action === 'sit' ? 'sitting' :
    action === 'poop' ? 'pooping' :
    action === 'hatch' ? 'hatching' :
    action === 'dead' ? 'dead' :
    'standing'
  );

  // Frame animation counter & custom sprite revision
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [eatBeat, setEatBeat] = useState<number>(0);
  const [spriteRevision, setSpriteRevision] = useState<number>(0);

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
    setFrameIndex(0);

    let count = 4;
    let hasSharedStage = false;
    const spriteLookupId = species?.spriteId || species?.id;
    const config = spriteLookupId ? getEffectiveSpriteConfig(spriteLookupId) : undefined;
    if (config) {
      const poseKey =
        activePose === 'pooping'
          ? 'sitting'
          : activePose === 'hatching' || activePose === 'dead'
          ? 'standing'
          : activePose;
      const frames = config.frames[poseKey] || config.frames.standing || [];
      count = Math.max(1, frames.length);
      hasSharedStage = Boolean(config.stageWidth && config.stageHeight);
    }

    if (count <= 1) return;

    // Per digimon-up-sprites writeup: faint (used for sleeping & sick) plays once and stays on its last frame.
    // idle, walking, and attack loop continuously.
    const isPlayOncePose = activePose === 'sleeping' || activePose === 'sick';

    // Curated eating animation uses 210 ms per sub-beat (syncs cleanly with 420 ms chomp beats);
    // Baked digimon-up-sprites animations (idle, walking, attack, faint) run at exact 62.5 ms (16 fps).
    const intervalTime = activePose === 'eating'
      ? 210
      : (hasSharedStage || count >= 8)
      ? 62.5
      : (activePose === 'walking' ? 140 : activePose === 'training' ? 150 : 320);

    const timer = setInterval(() => {
      setFrameIndex((prev) => {
        if (isPlayOncePose) {
          return prev < count - 1 ? prev + 1 : prev;
        }
        return (prev + 1) % count;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activePose, species?.id, facing, spriteRevision]);

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
            animate={{ opacity: [0.4, 1, 0.2], scale: [0.9, 1.55, 1.85] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            className="absolute inset-0 -m-4 rounded-full bg-amber-300/45 blur-md pointer-events-none"
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
          className="relative w-20 h-28 flex items-center justify-center filter drop-shadow-xl"
        >
          <div className="absolute -bottom-2 w-20 h-5 bg-black/30 rounded-full blur-[2px]" />
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
    const poseKey =
      activePose === 'pooping'
        ? 'sitting'
        : activePose === 'hatching'
        ? 'standing'
        : activePose;
    const poseFrames = newConfig.frames[poseKey] || newConfig.frames.standing || [];
    const currentFrame: SpriteFrame = poseFrames[frameIndex % poseFrames.length] || poseFrames[0] || { x: 0, y: 0, w: 32, h: 32 };

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
        className={`relative inline-block cursor-pointer select-none filter drop-shadow-md ${className}`}
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
                <PixelVitaminIcon className="w-6 h-6 drop-shadow-[0_2px_3px_rgba(0,0,0,0.75)]" />
              ) : (
                <PixelMeatIcon
                  biteStage={eatBeat === 0 ? 0 : eatBeat === 1 ? 1 : eatBeat === 2 ? 2 : 3}
                  className="w-7 h-7 drop-shadow-[0_2px_3px_rgba(0,0,0,0.75)]"
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
                className="absolute -top-4 -left-4 font-pixel text-[8px] font-bold text-amber-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] whitespace-nowrap"
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

            const rawOffsetX = currentFrame.offsetX || 0;
            const rawOffsetY = (currentFrame.offsetY || 0) + (newConfig.groundOffset || 0);

            // Faint/sleeping animations in digimon-up slide backward horizontally (-50..-123px);
            // center them cleanly inside the stage box so they never clip out of the viewport.
            const effectiveOffsetX =
              activePose === 'sleeping'
                ? (boxStageW - unscaledFrameW) * 0.5
                : rawOffsetX;
            const effectiveOffsetY =
              activePose === 'sleeping'
                ? Math.max(0, Math.min(rawOffsetY, Math.max(0, boxStageH - unscaledFrameH)))
                : rawOffsetY;

            const stageW = boxStageW * pixelScale;
            const stageH = boxStageH * pixelScale;
            const frameX = effectiveOffsetX * pixelScale;
            const frameY = effectiveOffsetY * pixelScale;
            const frameW = unscaledFrameW * pixelScale;
            const frameH = unscaledFrameH * pixelScale;

            const chompAnim = activePose === 'eating'
              ? (eatBeat === 1 || eatBeat === 2
                  ? { x: 6, y: 0, scaleX: 1, scaleY: 1, rotate: 0 }
                  : eatBeat === 3
                  ? { x: 0, y: -4, scaleX: 1, scaleY: 1, rotate: 0 }
                  : { x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0 })
              : { x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0 };

            return (
              <motion.div
                animate={chompAnim}
                transition={{ duration: activePose === 'eating' ? 0.14 : 0.08, ease: 'easeOut' }}
                className="relative overflow-visible pixel-art"
                style={{
                  width: `${stageW}px`,
                  height: `${stageH}px`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${frameX}px`,
                    top: `${frameY}px`,
                    width: `${frameW}px`,
                    height: `${frameH}px`,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${currentFrame.w * pixelScale}px`,
                      height: `${currentFrame.h * pixelScale}px`,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) ${currentFrame.rotate ? `rotate(${currentFrame.rotate}deg)` : ''}`,
                      transformOrigin: 'center center',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={currentFrame.sheetPath || newConfig.sheetPath}
                      alt={species.name}
                      className="pixel-art absolute max-w-none pointer-events-none select-none"
                      style={{
                        width: `${(currentFrame.sheetWidth || newConfig.sheetWidth) * pixelScale}px`,
                        height: `${(currentFrame.sheetHeight || newConfig.sheetHeight) * pixelScale}px`,
                        left: `-${currentFrame.x * pixelScale}px`,
                        top: `-${currentFrame.y * pixelScale}px`,
                        imageRendering: 'pixelated',
                        filter: lcdMode
                          ? 'grayscale(100%) contrast(150%) brightness(0.65)'
                          : species.spriteFilter || undefined,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          }

          const displayW = (isRotated ? currentFrame.h : currentFrame.w) * pixelScale;
          const displayH = (isRotated ? currentFrame.w : currentFrame.h) * pixelScale;
          const effectiveGroundOffsetY = activePose === 'sleeping'
            ? 0
            : ((currentFrame.offsetY || 0) + (newConfig.groundOffset || 0)) * pixelScale;

          return (
            <motion.div
              animate={
                activePose === 'walking'
                  ? { y: [0, -2.5, 0, -1] }
                  : activePose === 'training'
                  ? { x: [0, -2, 4, 0] }
                  : undefined
              }
              transition={
                activePose === 'walking'
                  ? { repeat: Infinity, duration: 0.56, ease: 'easeInOut' }
                  : activePose === 'training'
                  ? { repeat: Infinity, duration: 0.6 }
                  : undefined
              }
              className="relative overflow-hidden pixel-art"
              style={{
                width: `${displayW}px`,
                height: `${displayH}px`,
                transform: `translateY(${effectiveGroundOffsetY}px)`,
              }}
            >
              <div
                style={{
                  width: `${currentFrame.w * pixelScale}px`,
                  height: `${currentFrame.h * pixelScale}px`,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) ${currentFrame.rotate ? `rotate(${currentFrame.rotate}deg)` : ''}`,
                  transformOrigin: 'center center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={currentFrame.sheetPath || newConfig.sheetPath}
                  alt={species.name}
                  className="pixel-art absolute max-w-none pointer-events-none select-none"
                  style={{
                    width: `${(currentFrame.sheetWidth || newConfig.sheetWidth) * pixelScale}px`,
                    height: `${(currentFrame.sheetHeight || newConfig.sheetHeight) * pixelScale}px`,
                    left: `-${currentFrame.x * pixelScale}px`,
                    top: `-${currentFrame.y * pixelScale}px`,
                    imageRendering: 'pixelated',
                    filter: lcdMode
                      ? 'grayscale(100%) contrast(150%) brightness(0.65)'
                      : species.spriteFilter || undefined,
                  }}
                />
              </div>
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
      className={`relative inline-block cursor-pointer select-none filter drop-shadow-md ${className}`}
      style={{
        transform: `scale(${scale * 0.656}) scaleX(${facing === 'left' ? -1 : 1})`,
      }}
    >
      <motion.div
        animate={
          activePose === 'walking'
            ? { y: [0, -3, 0] }
            : activePose === 'training'
            ? { x: [0, -3, 6, 0] }
            : { y: [0, -2, 0] }
        }
        transition={{ duration: 0.3 }}
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
