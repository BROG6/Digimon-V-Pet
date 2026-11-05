import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetState, DigimonSpecies, DigiEggInfo } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { sound } from '../utils/audio';
import { getBatteryStatus, DeviceBatteryInfo } from '../utils/battery';
import { HELLOPET_QUOTES } from '../data/digidex';
import { 
  Battery, 
  BatteryCharging, 
  Clock, 
  Sparkles, 
  Heart, 
  Zap, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  ShieldAlert,
  Gamepad2,
  Home,
  Menu,
  Activity,
  Smartphone
} from 'lucide-react';

interface FloatingOverlayProps {
  pet: PetState;
  species?: DigimonSpecies;
  egg?: DigiEggInfo;
  onFeedMeat: () => void;
  onGiveVitamin: () => void;
  onCleanPoop: () => void;
  onPet: () => void;
  onOpenRoom: () => void;
  onOpenColosseum: () => void;
  onOpenDigivice: () => void;
  onOpenTraining: () => void;
  onOpenStats?: () => void;
  onOpenNativePip?: () => void;
  isOverlayActive: boolean;
  onToggleOverlay: () => void;
}

export const FloatingOverlay: React.FC<FloatingOverlayProps> = ({
  pet,
  species,
  egg,
  onFeedMeat,
  onGiveVitamin,
  onCleanPoop,
  onPet,
  onOpenRoom,
  onOpenColosseum,
  onOpenDigivice,
  onOpenTraining,
  onOpenStats,
  onOpenNativePip,
  isOverlayActive,
  onToggleOverlay,
}) => {

  // Coordinates for the roaming Digimon
  const [posX, setPosX] = useState<number>(window.innerWidth / 2 - 60);
  const [posY, setPosY] = useState<number>(window.innerHeight - 200);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [currentAction, setCurrentAction] = useState<'idle' | 'walk' | 'sleep' | 'sick' | 'eat' | 'happy' | 'sit' | 'poop'>('idle');
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [battery, setBattery] = useState<DeviceBatteryInfo>({ level: 85, charging: false, supported: false });
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const isDraggingRef = useRef<boolean>(false);

  // Initialize battery and clock
  useEffect(() => {
    getBatteryStatus().then((b) => setBattery(b));

    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Autonomous wandering behavior (Hellopet mechanic)
  useEffect(() => {
    if (!isOverlayActive || pet.isSleeping) {
      if (pet.isSleeping) setCurrentAction('sleep');
      return;
    }

    const wanderInterval = setInterval(() => {
      if (isDraggingRef.current) return;

      // Random chance to wander, say something, sit, or stay idle
      const roll = Math.random();
      if (roll < 0.75) {
        // Walk somewhere along the bottom screen boundary
        const maxX = window.innerWidth - 100;
        const targetX = Math.max(15, Math.min(maxX, posX + (Math.random() * 240 - 120)));
        setFacing(targetX > posX ? 'right' : 'left');
        setCurrentAction('walk');
        setPosX(targetX);

        setTimeout(() => {
          if (!isDraggingRef.current) {
            setCurrentAction(pet.isSick ? 'sick' : Math.random() < 0.35 ? 'sit' : 'idle');
          }
        }, 1100);
      } else if (roll < 0.88) {
        // Hellopet dialogue bubble
        triggerSpeech();
      } else {
        // Sit down relaxed
        setCurrentAction(pet.isSick ? 'sick' : 'sit');
      }
    }, 2200);

    return () => clearInterval(wanderInterval);
  }, [isOverlayActive, posX, pet.isSleeping, pet.isSick]);

  // Generate context-aware speech bubble
  const triggerSpeech = () => {
    let msg = '';
    if (pet.isSick) {
      msg = "Achoo... I don't feel well! Need vitamins! 💊";
    } else if (pet.hunger < 30) {
      msg = "My tummy is rumbling! Big Meat please! 🍖";
    } else if (pet.poopCount > 0) {
      msg = "Uh oh... Tamer, can you clean up my poop? 💩";
    } else if (battery.level <= 20 && !battery.charging) {
      msg = `Battery is at ${battery.level}%! Please plug in our device! ⚡`;
    } else if (Math.random() < 0.3) {
      msg = `Current Time is ${currentTimeStr}! Ready for adventure! ⏰`;
    } else {
      const randomQuote = HELLOPET_QUOTES[Math.floor(Math.random() * HELLOPET_QUOTES.length)];
      msg = randomQuote;
    }

    setSpeechBubble(msg);
    sound.playAlert();

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setSpeechBubble(null);
    }, 5000);
  };

  const handleSpriteClick = () => {
    sound.playButton();
    setIsMenuOpen((prev) => !prev);
    if (!speechBubble) {
      triggerSpeech();
    }
  };

  const handlePetDigimon = () => {
    sound.playButton();
    setCurrentAction('happy');
    onPet();
    setTimeout(() => {
      setCurrentAction(pet.isSick ? 'sick' : 'idle');
    }, 1500);
  };

  const handleFeedMeat = () => {
    sound.playEat();
    setCurrentAction('eat');
    onFeedMeat();
    setTimeout(() => {
      setCurrentAction(pet.isSick ? 'sick' : 'idle');
    }, 1200);
  };

  const handleGiveVitamin = () => {
    sound.playMedicine();
    setCurrentAction('happy');
    onGiveVitamin();
    setTimeout(() => {
      setCurrentAction(pet.isSick ? 'sick' : 'idle');
    }, 1200);
  };

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  if (!isOverlayActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden font-display">
      {/* Floating System HUD (Hellopet device status bar) */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-[max(calc(env(safe-area-inset-top,0px)+0.75rem),3rem)] sm:top-4 left-1/2 -translate-x-1/2 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 rounded-full px-4 py-1.5 flex items-center gap-4 text-xs text-slate-200"
      >
        <div className="flex items-center gap-1.5 text-cyan-400 font-pixel text-[10px]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>HELLOPET OVERLAY</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-700" />

        {/* Battery Monitor */}
        <div className="flex items-center gap-1 text-slate-300">
          {battery.charging ? (
            <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : (
            <Battery className="w-4 h-4 text-amber-400" />
          )}
          <span>{battery.level}%</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-700" />

        {/* Clock */}
        <div className="flex items-center gap-1 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{currentTimeStr}</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-700" />

        {/* Mute button */}
        <button
          onClick={toggleSound}
          className="p-1 hover:text-cyan-400 transition-colors"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Pop out to Native Android PiP (Float over other apps) */}
        {onOpenNativePip && (
          <>
            <div className="h-3 w-[1px] bg-slate-700" />
            <button
              onClick={onOpenNativePip}
              className="bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-medium transition-all cursor-pointer shadow-sm shadow-purple-500/20 active:scale-95"
              title="Pop out to Native Android Floating Window (over all apps)"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Float Over Apps</span>
            </button>
          </>
        )}

        <div className="h-3 w-[1px] bg-slate-700" />

        {/* Switch back to Main Studio */}
        <button
          onClick={onToggleOverlay}
          className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-medium transition-all cursor-pointer"
        >
          <Minimize2 className="w-3 h-3" />
          <span>Dock Digivice</span>
        </button>

      </motion.div>

      {/* Floating Digimon Companion */}
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => {
          isDraggingRef.current = true;
          setCurrentAction('walk');
        }}
        onDragEnd={(_, info) => {
          isDraggingRef.current = false;
          const offsetX = info?.offset?.x || 0;
          const offsetY = info?.offset?.y || 0;
          const winW = typeof window !== 'undefined' ? window.innerWidth : 360;
          const winH = typeof window !== 'undefined' ? window.innerHeight : 640;
          setPosX((prev) => Math.max(10, Math.min(winW - 100, (Number.isFinite(prev) ? prev : 100) + offsetX)));
          setPosY((prev) => Math.max(70, Math.min(winH - 120, (Number.isFinite(prev) ? prev : 300) + offsetY)));
          setCurrentAction(pet.isSick ? 'sick' : 'idle');
        }}
        animate={{ x: Number.isFinite(posX) ? posX : 100, y: Number.isFinite(posY) ? posY : 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col items-center select-none"
      >
        {/* Hellopet Speech Dialogue Bubble */}
        <AnimatePresence>
          {speechBubble && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 10 }}
              className="relative mb-2 max-w-[220px] bg-white text-slate-900 border-2 border-slate-900 rounded-2xl px-3 py-2 shadow-2xl text-xs font-medium text-center z-50 filter drop-shadow-lg"
            >
              <span>{speechBubble}</span>
              {/* Bubble tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[9px] border-x-transparent border-t-[9px] border-t-slate-900 -z-10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Poop next to Digimon if present */}
        {pet.poopCount > 0 && (
          <motion.div
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onCleanPoop();
            }}
            className="absolute -right-6 bottom-2 cursor-pointer text-2xl filter drop-shadow-md z-30"
            title="Clean Poop!"
          >
            💩
          </motion.div>
        )}

        {/* Digimon Sprite (20% bigger than previous compact size) */}
        <DigimonSprite
          species={species}
          egg={pet.stage === 'egg' ? egg : undefined}
          action={currentAction}
          facing={facing}
          scale={0.72}
          onClick={handleSpriteClick}
        />

        {/* Quick Interaction Radial / Drawer Menu on Tap */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute -bottom-16 bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-2 shadow-2xl flex items-center gap-2 z-50 text-slate-100"
            >
              <button
                onClick={handleFeedMeat}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-transform active:scale-90"
                title="Feed Big Meat"
              >
                <span className="text-base">🍖</span>
                <span className="text-[9px] font-pixel mt-1">MEAT</span>
              </button>

              <button
                onClick={handleGiveVitamin}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-transform active:scale-90"
                title="Give Vitamin"
              >
                <span className="text-base">💊</span>
                <span className="text-[9px] font-pixel mt-1">VIT</span>
              </button>

              <button
                onClick={handlePetDigimon}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-transform active:scale-90"
                title="Pet & Praise"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span className="text-[9px] font-pixel mt-1">PET</span>
              </button>

              {pet.poopCount > 0 && (
                <button
                  onClick={onCleanPoop}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-transform active:scale-90"
                  title="Flush Poop"
                >
                  <span className="text-base">🧹</span>
                  <span className="text-[9px] font-pixel mt-1">FLUSH</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenRoom();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-transform active:scale-90"
                title="My Room"
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] font-pixel mt-1">ROOM</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenColosseum();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-transform active:scale-90"
                title="Colosseum Battle"
              >
                <Gamepad2 className="w-4 h-4 text-blue-400" />
                <span className="text-[9px] font-pixel mt-1">ARENA</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
