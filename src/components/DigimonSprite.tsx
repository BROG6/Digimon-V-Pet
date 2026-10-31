import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DigimonSpecies, DigiEggInfo } from '../types/digimon';
import { 
  YUKIMIBOTAMON_SPRITESHEET_PATH,
  BOTAMON_FRAMES 
} from '../utils/battleSpiritSprites';
import { NEW_DIGIMON_SPRITES, SpriteFrame } from '../utils/newDigimonSprites';
import { getEffectiveSpriteConfig } from '../utils/customSpriteManager';
import { BattleSpiritOtherSprite } from './BattleSpiritOtherSprites';

export type DigimonPose = 
  | 'standing' 
  | 'walking' 
  | 'sitting' 
  | 'training' 
  | 'pooping' 
  | 'eating' 
  | 'sleeping' 
  | 'sick' 
  | 'happy';

interface DigimonSpriteProps {
  species?: DigimonSpecies;
  egg?: DigiEggInfo;
  action?: 'idle' | 'walk' | 'eat' | 'sleep' | 'sick' | 'attack' | 'happy' | 'cheer' | 'sit' | 'poop' | 'train';
  pose?: DigimonPose;
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
    'standing'
  );

  // Frame animation counter & custom sprite revision
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [spriteRevision, setSpriteRevision] = useState<number>(0);

  // Listen for custom sprite edits from Sprite Studio
  useEffect(() => {
    const handleUpdate = () => {
      setSpriteRevision((r) => r + 1);
    };
    window.addEventListener('digipet-sprites-updated', handleUpdate);
    return () => window.removeEventListener('digipet-sprites-updated', handleUpdate);
  }, []);

  useEffect(() => {
    let count = 4;
    const config = species?.id ? getEffectiveSpriteConfig(species.id) : undefined;
    if (config) {
      const poseKey = activePose === 'pooping' ? 'sitting' : activePose;
      const frames = config.frames[poseKey] || config.frames.standing || [];
      count = Math.max(1, frames.length);
    }

    const intervalTime = activePose === 'walking' ? 140 : activePose === 'eating' ? 200 : activePose === 'training' ? 150 : 320;

    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % count);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activePose, species?.id, facing, spriteRevision]);

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

    return (
      <div 
        onClick={onClick}
        className={`relative inline-block cursor-pointer select-none ${className}`}
        style={{ transform: `scale(${scale * 0.656})` }}
      >

        <motion.div
          animate={
            activePose === 'happy'
              ? { rotate: [-10, 10, -10], y: [-6, 0, -6] }
              : { rotate: [-3, 3, -3], y: [-2, 2, -2] }
          }
          transition={{ repeat: Infinity, duration: activePose === 'happy' ? 0.6 : 1.8, ease: 'easeInOut' as const }}
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
            <ellipse cx="36" cy="38" rx="8" ry="16" transform="rotate(-25, 36, 38)" fill="#ffffff" opacity={lcdMode ? '0' : '0.6'} />
          </svg>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTIC NEW SPRITE SHEET RENDERER (ALL DIGIMON SPECIES)
  // =========================================================================
  const newConfig = getEffectiveSpriteConfig(species.id);
  if (newConfig) {
    const poseKey = activePose === 'pooping' ? 'sitting' : activePose;
    const poseFrames = newConfig.frames[poseKey] || newConfig.frames.standing || [];
    const currentFrame: SpriteFrame = poseFrames[frameIndex % poseFrames.length] || poseFrames[0] || { x: 0, y: 0, w: 32, h: 32 };

    // Stage-based authentic pixel scale (tuned to be slightly smaller and crisper)
    let stageMultiplier = 1.35;
    if (species.stage === 'fresh') stageMultiplier = 1.25;
    else if (species.stage === 'in-training') stageMultiplier = 1.3;
    else if (species.stage === 'rookie') stageMultiplier = 1.35;
    else if (species.stage === 'champion') stageMultiplier = 1.45;
    else if (species.stage === 'ultimate') stageMultiplier = 1.55;
    else if (species.stage === 'mega') stageMultiplier = 1.65;

    // Special tuning if frame is already large (e.g. 80-100px)
    if (currentFrame.h > 85) {
      stageMultiplier = Math.min(stageMultiplier, 1.15);
    } else if (currentFrame.h > 65) {
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
            animate={{ y: [-4, -20], x: [0, 8], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' as const }}
            className="absolute -top-6 right-0 font-pixel text-cyan-300 text-xs font-bold pointer-events-none z-20"
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
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 0.4 }}
            className="absolute -top-7 right-0 text-xl pointer-events-none z-20"
          >
            🍖
          </motion.div>
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

        {/* Pixel Sprite Window with Clean Padding, Rotation, & Rhythmic Step Bobbing */}
        {(() => {
          const isRotated = currentFrame.rotate === 90 || currentFrame.rotate === -90 || currentFrame.rotate === 270;
          const displayW = (isRotated ? currentFrame.h : currentFrame.w) * pixelScale;
          const displayH = (isRotated ? currentFrame.w : currentFrame.h) * pixelScale;

          // Ground alignment offset: allows manual feet positioning in relation to ground level
          const effectiveGroundOffsetY = ((currentFrame.offsetY || 0) + (newConfig.groundOffset || 0)) * pixelScale;

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
                    filter: lcdMode ? 'grayscale(100%) contrast(150%) brightness(0.65)' : undefined,
                  }}
                />
              </div>
            </motion.div>
          );
        })()}
      </div>
    );
  }


  // =========================================================================
  // MATCHING BATTLE SPIRIT 16-BIT RETRO PIXEL ART FOR ANY REMAINING DIGIMON
  // =========================================================================
  const isAltFrame = frameIndex % 2 === 1;

  const renderOtherBattleSpiritSprite = () => {
    return (
      <BattleSpiritOtherSprite
        id={species.id}
        pose={activePose}
        isAltFrame={isAltFrame}
        colorTheme={species.colorTheme}
        lcdMode={lcdMode}
      />
    );
  };

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
        {renderOtherBattleSpiritSprite()}
      </motion.div>
    </div>
  );
};
