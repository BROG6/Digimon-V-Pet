import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetState, DigimonSpecies, DigiEggInfo } from '../types/digimon';
import { DigimonSprite, DigimonPose } from './DigimonSprite';
import { PixelMeatIcon, PixelVitaminIcon, PixelPoopIcon } from './PixelItemIcons';
import { sound } from '../utils/audio';
import { 
  Heart, 
  Scale, 
  Utensils, 
  Dumbbell, 
  Swords, 
  Sparkles, 
  Moon, 
  Sun, 
  Activity, 
  Palette,
  Home,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

interface DigiviceHUDProps {
  pet: PetState;
  species?: DigimonSpecies;
  egg?: DigiEggInfo;
  onFeedMeat: () => void;
  onGiveVitamin: () => void;
  onCleanPoop: () => void;
  onToggleLights: () => void;
  onCureSick: () => void;
  onOpenTraining: () => void;
  onOpenColosseum: () => void;
  onOpenRoom: () => void;
  onOpenDigidex: () => void;
  onOpenStatsModal?: () => void;
  onOpenShop?: () => void;
  onEvolveTrigger?: () => void;
  onResetEgg?: () => void;
  canEvolve: boolean;
  externalAction?: { pose: DigimonPose | 'flushing'; nonce: number; eatItem?: 'meat' | 'vitamin' } | null;
}

// Authentic Bandai 1997 / Digimon Color Toy Shell Colorways (Original Photo & Releases)
export const SHELL_STYLES = [
  { 
    id: 'brick-red', 
    name: 'Red Brick (Original 1997 / 25th Photo)', 
    bg: 'bg-gradient-to-br from-[#9e2a2b] via-[#852322] to-[#6d1b1a]', 
    border: 'border-[#4e1313]', 
    mortar: '#4a1111', 
    cageColor: '#64748b', 
    btnBg: 'bg-gradient-to-b from-[#facc15] via-[#eab308] to-[#ca8a04]', 
    btnBorder: 'border-[#854d0e]', 
    btnShadow: '#713f12', 
    colorHex: '#9e2a2b',
    isPhotoMatch: true 
  },
  { 
    id: 'brick-brown', 
    name: 'Brown Brick (1997 Ver.1)', 
    bg: 'bg-gradient-to-br from-[#78350f] via-[#5c2708] to-[#451a03]', 
    border: 'border-[#331302]', 
    mortar: '#331302', 
    cageColor: '#64748b', 
    btnBg: 'bg-gradient-to-b from-[#4b5563] via-[#374151] to-[#1f2937]', 
    btnBorder: 'border-[#111827]', 
    btnShadow: '#0f172a', 
    colorHex: '#78350f' 
  },
  { 
    id: 'smoke-grey', 
    name: 'Smoke Grey (Ver.2)', 
    bg: 'bg-gradient-to-br from-[#475569] via-[#334155] to-[#1e293b]', 
    border: 'border-[#0f172a]', 
    mortar: '#0f172a', 
    cageColor: '#94a3b8', 
    btnBg: 'bg-gradient-to-b from-[#334155] to-[#0f172a]', 
    btnBorder: 'border-[#020617]', 
    btnShadow: '#020617', 
    colorHex: '#475569' 
  },
  { 
    id: 'cyber-yellow', 
    name: 'Cyber Yellow (Ver.3)', 
    bg: 'bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#92400e]', 
    border: 'border-[#713f12]', 
    mortar: '#713f12', 
    cageColor: '#64748b', 
    btnBg: 'bg-gradient-to-b from-[#374151] to-[#18181b]', 
    btnBorder: 'border-[#09090b]', 
    btnShadow: '#09090b', 
    colorHex: '#d97706' 
  },
  { 
    id: 'bone-white', 
    name: 'D-1 Arctic White (Ver.4)', 
    bg: 'bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1]', 
    border: 'border-[#64748b]', 
    mortar: '#94a3b8', 
    cageColor: '#334155', 
    btnBg: 'bg-gradient-to-b from-[#475569] to-[#1e293b]', 
    btnBorder: 'border-[#0f172a]', 
    btnShadow: '#0f172a', 
    colorHex: '#f1f5f9' 
  },
  { 
    id: 'forest-green', 
    name: 'Clear Forest Green (Ver.5)', 
    bg: 'bg-gradient-to-br from-[#065f46] via-[#047857] to-[#064e3b]', 
    border: 'border-[#022c22]', 
    mortar: '#022c22', 
    cageColor: '#64748b', 
    btnBg: 'bg-gradient-to-b from-[#374151] to-[#1f2937]', 
    btnBorder: 'border-[#111827]', 
    btnShadow: '#0f172a', 
    colorHex: '#059669' 
  },
  { 
    id: 'cobalt-blue', 
    name: 'Cobalt Blue (25th Special)', 
    bg: 'bg-gradient-to-br from-[#1d4ed8] via-[#1e40af] to-[#1e3a8a]', 
    border: 'border-[#172554]', 
    mortar: '#172554', 
    cageColor: '#94a3b8', 
    btnBg: 'bg-gradient-to-b from-[#374151] to-[#1f2937]', 
    btnBorder: 'border-[#111827]', 
    btnShadow: '#0f172a', 
    colorHex: '#1d4ed8' 
  },
  { 
    id: 'royal-gold', 
    name: 'Royal Gold (Anniversary)', 
    bg: 'bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f]', 
    border: 'border-[#451a03]', 
    mortar: '#451a03', 
    cageColor: '#334155', 
    btnBg: 'bg-gradient-to-b from-[#27272a] to-[#09090b]', 
    btnBorder: 'border-[#09090b]', 
    btnShadow: '#000000', 
    colorHex: '#b45309' 
  },
];

export const DigiviceHUD: React.FC<DigiviceHUDProps> = ({
  pet,
  species,
  egg,
  onFeedMeat,
  onGiveVitamin,
  onCleanPoop,
  onToggleLights,
  onCureSick,
  onOpenTraining,
  onOpenColosseum,
  onOpenRoom,
  onOpenDigidex,
  onOpenStatsModal,
  onOpenShop,
  onEvolveTrigger,
  onResetEgg,
  canEvolve,
  externalAction,
}) => {
  const [shellIndex, setShellIndex] = useState<number>(0);
  const [selectedMenuIdx, setSelectedMenuIdx] = useState<number>(0);
  const [activeSubMenu, setActiveSubMenu] = useState<'screen' | 'stats' | 'food'>('screen');
  const [statsPage, setStatsPage] = useState<number>(0);

  // Stats Calculations
  const ageMs = Date.now() - (pet.birthTimestamp || Date.now());
  const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
  const ageDays = Math.floor(ageHours / 24);
  const winRate = pet.battlesTotal > 0 ? Math.round((pet.battlesWon / pet.battlesTotal) * 100) : 0;
  const trainingAtkBonus = Math.floor(pet.trainingCount * 2);
  const totalAtk = (species?.baseAtk || 20) + trainingAtkBonus;
  const nextEvo = species?.nextEvolutions && species.nextEvolutions.length > 0 ? species.nextEvolutions[0] : null;

  // AUTONOMOUS MOVEMENT ENGINE INSIDE LCD SCREEN
  const [monX, setMonX] = useState<number>(50); // percentage 15% to 85%
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [internalPose, setInternalPose] = useState<DigimonPose>('standing');
  const [activeEatItem, setActiveEatItem] = useState<'meat' | 'vitamin'>('meat');
  const [isFlushing, setIsFlushing] = useState<boolean>(false);
  const [flushKey, setFlushKey] = useState<number>(0);
  const [flushedPoopCount, setFlushedPoopCount] = useState<number>(0);
  const prevPoopCountRef = useRef<number>(pet.poopCount);
  const isMovingRef = useRef<boolean>(false);
  const isActionLockedRef = useRef<boolean>(false);
  const actionTimersRef = useRef<number[]>([]);

  useEffect(() => {
    if (pet.poopCount > 0) {
      prevPoopCountRef.current = pet.poopCount;
    }
  }, [pet.poopCount]);

  // PROPORTIONAL UNIFORM SCALING (Preserves authentic 1997 brick aspect ratio until hitting edges)
  const BASE_WIDTH = 400;
  const BASE_HEIGHT = 256;
  const containerRef = useRef<HTMLDivElement>(null);
  const [hudScale, setHudScale] = useState<number>(1);

  useEffect(() => {
    const updateScale = () => {
      const containerW = containerRef.current?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : BASE_WIDTH);
      const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const availH = Math.max(210, winH - 375);
      const scaleByW = containerW / BASE_WIDTH;
      const scaleByH = availH / BASE_HEIGHT;
      const nextScale = Math.max(0.75, Math.min(scaleByW, scaleByH));
      setHudScale(Number(nextScale.toFixed(4)));
    };

    updateScale();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(updateScale);
      ro.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      ro?.disconnect();
    };
  }, []);

  // Active shell theme
  const currentShell = SHELL_STYLES[shellIndex];

  // 1997 Top & Bottom LCD Icon Matrix (4 Top, 4 Bottom)
  const menuItems = [
    { id: 'stats', label: 'STATS', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'food', label: 'FEED', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'train', label: 'TRAIN', icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { id: 'battle', label: 'VS', icon: <Swords className="w-3.5 h-3.5" /> },
    { id: 'clean', label: 'FLUSH', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'lights', label: 'LIGHT', icon: pet.lightsOff ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" /> },
    { id: 'heal', label: 'HEAL', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'room', label: 'ROOM', icon: <Home className="w-3.5 h-3.5" /> },
  ];

  // Handle direct icon click (works for mouse, touch, and hardware buttons)
  const handleIconClick = (idx: number, id: string) => {
    sound.playButton();
    setSelectedMenuIdx(idx);
    if (id === 'stats') {
      if (activeSubMenu === 'stats') {
        setStatsPage((prev) => (prev + 1) % 3);
      } else {
        setActiveSubMenu('stats');
      }
    } else if (id === 'food') {
      setActiveSubMenu(activeSubMenu === 'food' ? 'screen' : 'food');
    } else if (id === 'train') {
      onOpenTraining();
    } else if (id === 'battle') {
      onOpenColosseum();
    } else if (id === 'clean') {
      triggerPoopClean();
    } else if (id === 'lights') {
      onToggleLights();
    } else if (id === 'heal') {
      onCureSick();
    } else if (id === 'room') {
      onOpenRoom();
    }
  };

  // Autonomous Digimon movement loop inside LCD
  useEffect(() => {
    if (pet.isSleeping || pet.lightsOff) {
      setInternalPose('sleeping');
      return;
    }
    if (pet.isSick && !isActionLockedRef.current) {
      setInternalPose('sick');
      return;
    }
    if (activeSubMenu !== 'screen') return;

    const moveInterval = setInterval(() => {
      if (isMovingRef.current || isActionLockedRef.current) return;

      const roll = Math.random();
      if (roll < 0.45) {
        // Walk widely across the expanded LCD screen (15% to 85%)
        const goLeft = monX > 72 ? true : monX < 28 ? false : Math.random() < 0.5;
        const step = 22 + Math.random() * 26;
        const targetX = goLeft
          ? Math.max(15, Math.round(monX - step))
          : Math.min(85, Math.round(monX + step));
        const newFacing = targetX > monX ? 'right' : 'left';
        setFacing(newFacing);
        setInternalPose('walking');
        isMovingRef.current = true;

        setTimeout(() => {
          if (!isActionLockedRef.current) setMonX(targetX);
        }, 100);

        setTimeout(() => {
          if (!isActionLockedRef.current) {
            setInternalPose(Math.random() < 0.3 ? 'sitting' : 'standing');
          }
          isMovingRef.current = false;
        }, 1800);
      } else if (roll < 0.75) {
        // Look around or sit
        setInternalPose(Math.random() < 0.5 ? 'sitting' : 'standing');
        setFacing((prev) => (prev === 'left' ? 'right' : 'left'));
      } else if (roll < 0.90) {
        // Cute happy jump
        setInternalPose('happy');
        setTimeout(() => {
          if (!isActionLockedRef.current) setInternalPose('standing');
        }, 1400);
      }
    }, 4200);

    return () => clearInterval(moveInterval);
  }, [pet.isSleeping, pet.lightsOff, pet.isSick, activeSubMenu, monX]);

  // Button A: Cycle selection forward
  const handleNextMenu = () => {
    sound.playButton();
    if (activeSubMenu === 'stats') {
      setStatsPage((prev) => (prev + 1) % 3);
      return;
    }
    const nextIdx = (selectedMenuIdx + 1) % menuItems.length;
    setSelectedMenuIdx(nextIdx);
  };

  // Button B: Confirm selection
  const handleSelectMenu = () => {
    const item = menuItems[selectedMenuIdx];
    handleIconClick(selectedMenuIdx, item.id);
  };

  // Button C: Cancel / Back to main LCD screen
  const handleCancel = () => {
    sound.playButton();
    if (activeSubMenu !== 'screen') {
      setActiveSubMenu('screen');
    } else {
      setSelectedMenuIdx(0);
    }
  };

  const playPoseSequence = (pose: DigimonPose | 'flushing', eatItem: 'meat' | 'vitamin' = 'meat') => {
    actionTimersRef.current.forEach((t) => clearTimeout(t));
    actionTimersRef.current = [];
    isActionLockedRef.current = true;
    isMovingRef.current = true;
    setActiveSubMenu('screen');

    if (pose === 'flushing') {
      const poopBeforeFlush = Math.max(pet.poopCount, prevPoopCountRef.current);
      setFlushedPoopCount(poopBeforeFlush);
      setIsFlushing(true);
      setFlushKey((k) => k + 1);
      setInternalPose('standing');

      const t1 = window.setTimeout(() => {
        setIsFlushing(false);
        setFlushedPoopCount(0);
        prevPoopCountRef.current = 0;
        setInternalPose('happy');
        const t2 = window.setTimeout(() => {
          isActionLockedRef.current = false;
          isMovingRef.current = false;
          setInternalPose(pet.isSleeping || pet.lightsOff ? 'sleeping' : pet.isSick ? 'sick' : 'standing');
        }, 900);
        actionTimersRef.current.push(t2);
      }, 880);
      actionTimersRef.current.push(t1);
    } else if (pose === 'eating') {
      // Center Digimon inside LCD facing right so the meat prop is never clipped at screen edge
      setMonX(46);
      setFacing('right');
      setActiveEatItem(eatItem);
      setInternalPose('eating');

      const t1 = window.setTimeout(() => {
        setInternalPose('happy');
        const t2 = window.setTimeout(() => {
          isActionLockedRef.current = false;
          isMovingRef.current = false;
          setInternalPose(pet.isSleeping || pet.lightsOff ? 'sleeping' : pet.isSick ? 'sick' : 'standing');
        }, 1150);
        actionTimersRef.current.push(t2);
      }, 1750);
      actionTimersRef.current.push(t1);
    } else {
      setInternalPose(pose);
      const t1 = window.setTimeout(() => {
        isActionLockedRef.current = false;
        isMovingRef.current = false;
        setInternalPose(pet.isSleeping || pet.lightsOff ? 'sleeping' : pet.isSick ? 'sick' : 'standing');
      }, 1400);
      actionTimersRef.current.push(t1);
    }
  };

  useEffect(() => {
    if (externalAction?.nonce) {
      playPoseSequence(externalAction.pose, externalAction.eatItem || 'meat');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalAction?.nonce]);

  useEffect(() => {
    return () => {
      actionTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Trigger animations
  const triggerFeedMeatAnimation = () => {
    onFeedMeat();
  };

  const triggerFeedVitaminAnimation = () => {
    onGiveVitamin();
  };

  const triggerPoopClean = () => {
    sound.playClean();
    onCleanPoop();
  };

  const handleKeychainJingle = () => {
    sound.playButton();
  };

  // High contrast screen colors based on lighting
  const isLightsOff = pet.lightsOff;
  const screenBg = isLightsOff ? 'bg-[#081813]' : 'bg-[#dcefd7]';
  const screenTextColor = isLightsOff ? 'text-[#4ade80]' : 'text-[#0a120c]';
  const screenBorderColor = isLightsOff ? 'border-[#22c55e]/50' : 'border-[#0a120c]/40';

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center justify-center py-1 sm:py-2 px-0 select-none">
      
      {/* AUTHENTIC DIGIVICE TOY COLORWAYS SELECTOR */}
      <div className="flex flex-col items-center mb-3 px-2">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 rounded-full border border-slate-700/80 shadow-md">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-pixel text-[9px] text-slate-300">
            SHELL: <span className="text-white font-bold">{currentShell.name}</span>
          </span>
        </div>
        
        {/* Color Swatch Dots */}
        <div className="flex items-center gap-2 mt-2">
          {SHELL_STYLES.map((shell, idx) => (
            <button
              key={shell.id}
              onClick={() => {
                sound.playButton();
                setShellIndex(idx);
              }}
              title={shell.name}
              style={{ backgroundColor: shell.colorHex }}
              className={`w-4 h-4 rounded-full border-2 transition-transform cursor-pointer shadow-sm ${
                shellIndex === idx ? 'scale-125 border-white ring-2 ring-amber-400' : 'border-black/50 opacity-75 hover:opacity-100 hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>

      {/* QUICK STATUS BAR: DIGIBITS & EVOLUTION BADGE (OUTSIDE THE TOY CASING) */}
      <div
        className="flex items-center justify-between mb-2 px-2 z-10"
        style={{ width: `${Math.round(BASE_WIDTH * hudScale)}px`, maxWidth: '100%' }}
      >
        <div className="flex items-center gap-2">
          {canEvolve && (
            <motion.button
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              onClick={onEvolveTrigger}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-pixel text-[9px] px-3 py-1 rounded-full font-bold shadow-md border border-amber-300 active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
              title="Evolution criteria met! Click to Digivolve!"
            >
              <span>⚡</span>
              <span>DIGIVOLVE READY!</span>
            </motion.button>
          )}
        </div>

        {/* Clickable DigiBits & Shop Shortcut */}
        <div 
          onClick={onOpenShop}
          className="flex items-center gap-1.5 font-pixel text-[9px] text-amber-300 bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 px-3 py-1 rounded-full cursor-pointer transition-all shadow-md active:scale-95 ml-auto"
          title="Click to open File City Item Shop!"
        >
          <span>🪙 {pet.digiBits} BITS</span>
          <span className="text-[7px] text-slate-950 bg-amber-400 font-bold px-1.5 py-0.2 rounded-full ml-1">SHOP 🛒</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1997 BANDAI BRICK DIGIVICE HARDWARE CHASSIS (PROPORTIONAL SCALING)   */}
      {/* ==================================================================== */}
      <div
        className="relative flex justify-center shrink-0"
        style={{
          width: `${Math.round(BASE_WIDTH * hudScale)}px`,
          height: `${Math.round(BASE_HEIGHT * hudScale)}px`,
          marginTop: `${Math.round(10 * hudScale)}px`,
          marginBottom: `${Math.round(46 * hudScale)}px`,
        }}
      >
      <div
        className="relative flex items-center shrink-0"
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
          transform: `scale(${hudScale})`,
          transformOrigin: 'top center',
        }}
      >
        
        {/* Top authentic molded connectors & pins on top edge */}
        <div className="absolute -top-3 left-1/3 -translate-x-1/2 flex items-end gap-3 pointer-events-none z-20">
          {/* Rectangular plastic peg */}
          <div className="w-5 h-3 bg-[#6b1b1b] rounded-t-sm border border-[#3b0f0f] shadow-inner" />
          {/* Metal electrical pins */}
          <div className="w-2.5 h-2 bg-[#94a3b8] rounded-t-sm border border-[#475569] shadow-sm" />
          <div className="w-2.5 h-2 bg-[#94a3b8] rounded-t-sm border border-[#475569] shadow-sm" />
        </div>

        {/* Master Brick Casing with Chamfered Corners (Authentic Aspect Ratio) */}
        <div 
          className={`relative w-[400px] h-[256px] ${currentShell.bg} border-4 ${currentShell.border} p-3.5 shadow-[0_25px_50px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-3px_6px_rgba(0,0,0,0.6)] flex items-center justify-between`}
          style={{
            // Authentic 45-degree chamfered beveled corners
            clipPath: 'polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)',
          }}
        >
          {/* EMBOSSED BRICK WALL GROOVE PATTERN (MATCHING REFERENCE PHOTO) */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Horizontal stone mortar grooves */}
            <div className="absolute top-[22%] left-0 right-0 h-[2.5px] bg-black/55 shadow-[0_1px_1px_rgba(255,255,255,0.15)]" />
            <div className="absolute top-[48%] left-0 right-0 h-[2.5px] bg-black/55 shadow-[0_1px_1px_rgba(255,255,255,0.15)]" />
            <div className="absolute top-[75%] left-0 right-0 h-[2.5px] bg-black/55 shadow-[0_1px_1px_rgba(255,255,255,0.15)]" />
            
            {/* Vertical brick seams */}
            <div className="absolute top-0 bottom-[78%] left-[24%] w-[2.5px] bg-black/55" />
            <div className="absolute top-0 bottom-[78%] left-[68%] w-[2.5px] bg-black/55" />
            
            <div className="absolute top-[22%] bottom-[52%] left-[10%] w-[2.5px] bg-black/55" />
            <div className="absolute top-[22%] bottom-[52%] left-[44%] w-[2.5px] bg-black/55" />
            <div className="absolute top-[22%] bottom-[52%] left-[82%] w-[2.5px] bg-black/55" />
            
            <div className="absolute top-[48%] bottom-[25%] left-[28%] w-[2.5px] bg-black/55" />
            <div className="absolute top-[48%] bottom-[25%] left-[72%] w-[2.5px] bg-black/55" />

            <div className="absolute top-[75%] bottom-0 left-[16%] w-[2.5px] bg-black/55" />
            <div className="absolute top-[75%] bottom-0 left-[54%] w-[2.5px] bg-black/55" />
            <div className="absolute top-[75%] bottom-0 left-[86%] w-[2.5px] bg-black/55" />
          </div>

          {/* LEFT CHASSIS: BRUSHED METAL SCREEN CAGE & EXPANDED LCD SCREEN */}
          <div className="relative z-10 w-[266px] h-[220px] flex items-center justify-center shrink-0">
            
            {/* THE BRUSHED METAL CAGE (FRAMING THE LCD SCREEN) */}
            {/* Top Rail with Claws */}
            <div className="absolute top-0 left-0 right-4 h-3.5 bg-gradient-to-b from-[#94a3b8] via-[#64748b] to-[#475569] border border-[#334155] shadow-md z-30 flex justify-around">
              {/* Top Clamp 1 */}
              <div className="w-3 h-5 bg-gradient-to-b from-[#64748b] to-[#334155] border border-[#1e293b] shadow-sm -mt-0.5" />
              {/* Top Clamp 2 */}
              <div className="w-3 h-5 bg-gradient-to-b from-[#64748b] to-[#334155] border border-[#1e293b] shadow-sm -mt-0.5" />
            </div>

            {/* Bottom Rail with Claws */}
            <div className="absolute bottom-0 left-0 right-4 h-3.5 bg-gradient-to-b from-[#64748b] via-[#475569] to-[#334155] border border-[#1e293b] shadow-md z-30 flex justify-around">
              {/* Bottom Clamp 1 */}
              <div className="w-3 h-5 bg-gradient-to-t from-[#64748b] to-[#334155] border border-[#1e293b] shadow-sm -mb-0.5 self-end" />
              {/* Bottom Clamp 2 */}
              <div className="w-3 h-5 bg-gradient-to-t from-[#64748b] to-[#334155] border border-[#1e293b] shadow-sm -mb-0.5 self-end" />
            </div>

            {/* Left Vertical Bar */}
            <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-gradient-to-r from-[#64748b] via-[#475569] to-[#334155] border-t border-b border-l border-[#1e293b] z-30" />

            {/* Right Vertical Bar & Iconic Keyhole Latch Plate */}
            <div className="absolute top-0 bottom-0 right-4 w-3.5 bg-gradient-to-r from-[#475569] via-[#64748b] to-[#334155] z-30 flex items-center">
              {/* Keyhole Latch Plate extending to the right over the brick plastic */}
              <div 
                className="absolute left-2 w-8 h-12 bg-gradient-to-r from-[#64748b] via-[#94a3b8] to-[#475569] rounded-r-md border border-[#1e293b] shadow-lg flex items-center justify-center pointer-events-none"
                title="Bandai Digital Monster Keyhole Latch"
              >
                {/* The Keyhole shape */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#0f172a] shadow-inner" />
                  <div className="w-1.5 h-3 bg-[#0f172a] -mt-0.5 rounded-b-xs shadow-inner" />
                </div>
              </div>
            </div>

            {/* THE LCD SCREEN WINDOW (FULL-COLOR DIGITAL WORLD LANDSCAPE) */}
            <div 
              className={`absolute top-3 bottom-3 left-3 right-7 rounded-lg border-2 border-[#090d16] p-1.5 sm:p-2 overflow-hidden flex flex-col justify-between shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] z-20 ${
                isLightsOff ? 'bg-[#081813]' : 'bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] 55% to-[#16a34a]'
              }`}
            >
              {/* Landscape Pixel Art Elements (Digital World Hills & Grass) */}
              {!isLightsOff && (
                <div className="absolute inset-0 pointer-events-none z-0">
                  {/* Pixel Clouds */}
                  <div className="absolute top-2 left-3 w-8 h-2 bg-white/70 rounded-full blur-[0.5px]" />
                  <div className="absolute top-4 right-6 w-12 h-2.5 bg-white/60 rounded-full blur-[0.5px]" />
                  
                  {/* Distant Teal Mountain Ridges */}
                  <svg viewBox="0 0 200 60" className="absolute bottom-[28px] left-0 right-0 w-full h-12 opacity-80" preserveAspectRatio="none">
                    <polygon points="0,60 30,25 70,60" fill="#0284c7" />
                    <polygon points="50,60 95,15 140,60" fill="#0369a1" />
                    <polygon points="120,60 160,28 200,60" fill="#0284c7" />
                  </svg>

                  {/* Green Grassy Ground */}
                  <div className="absolute bottom-0 left-0 right-0 h-[32px] bg-gradient-to-b from-[#22c55e] to-[#15803d] border-t border-[#16a34a] shadow-inner" />
                </div>
              )}

              {/* Night Mode Landscape (Lights off) */}
              {isLightsOff && (
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="absolute bottom-0 left-0 right-0 h-[32px] bg-[#0f291e] border-t border-[#22c55e]/40" />
                </div>
              )}

              {/* TOP 4 LCD STATUS ICONS */}
              <div className="relative z-20 flex justify-between items-center px-1 pt-0.5">
                {menuItems.slice(0, 4).map((item, idx) => {
                  const isSelected = selectedMenuIdx === idx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleIconClick(idx, item.id)}
                      className={`w-7 h-7 rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0f172a] text-amber-300 font-bold scale-110 border border-amber-300 shadow-md ring-1 ring-amber-400'
                          : 'text-[#0f172a] hover:bg-black/10'
                      }`}
                      title={item.label}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>

              {/* LCD VIEW: MAIN SPRITE MOVING FREELY ACROSS DIGITAL WORLD */}
              {activeSubMenu === 'screen' && (
                <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between py-0.5 z-10">
                  
                  {/* Top LCD Telemetry Row (matching Bandai 25th photo) */}
                  <div className="relative z-20 flex justify-between items-center px-1 text-[8px] font-pixel text-[#0f172a] font-bold select-none drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    <span className="uppercase tracking-tight">{species?.name || pet.nickname || 'DIGIMON'}</span>
                    <span className="tracking-tight">
                      H: {'♥'.repeat(Math.min(4, Math.max(1, Math.ceil((pet.hunger / 100) * 4))))} S: {'★'.repeat(Math.min(4, Math.max(1, Math.ceil((pet.strength / 100) * 4))))}
                    </span>
                  </div>

                  {/* Attention / Sickness alert blinking icon */}
                  {(pet.isSick || pet.hunger < 25) && (
                    <div className="absolute top-4 right-1 text-[8px] font-pixel px-1.5 py-0.5 rounded animate-pulse font-bold bg-[#dc2626] text-white border border-rose-300 shadow z-30">
                      [CALL!]
                    </div>
                  )}

                  {/* Poop on LCD screen if present */}
                  {!isFlushing && pet.poopCount > 0 && (
                    <motion.div
                      animate={{ y: [-1, 1, -1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      onClick={triggerPoopClean}
                      className="absolute bottom-4 right-2 cursor-pointer z-20 filter drop-shadow flex items-end gap-0.5"
                      title="Click to Flush!"
                    >
                      {Array.from({ length: Math.min(3, pet.poopCount) }).map((_, i) => (
                        <PixelPoopIcon key={i} className="w-6 h-6" />
                      ))}
                    </motion.div>
                  )}

                  {/* Classic 1997 Digivice Screen Flush Wave sweeping right-to-left */}
                  <AnimatePresence>
                    {isFlushing && (
                      <motion.div
                        key={`flush-sweep-${flushKey}`}
                        initial={{ x: '115%' }}
                        animate={{ x: '-135%' }}
                        transition={{ duration: 0.85, ease: 'linear' }}
                        className="absolute inset-y-0 left-0 w-full z-40 pointer-events-none flex items-stretch"
                      >
                        {/* Swept poops pushed right off the left edge ahead of the water wall */}
                        {flushedPoopCount > 0 && (
                          <div className="self-end mb-4 -ml-7 mr-1 flex items-end gap-0.5">
                            {Array.from({ length: Math.min(3, flushedPoopCount) }).map((_, i) => (
                              <PixelPoopIcon key={i} className="w-6 h-6" />
                            ))}
                          </div>
                        )}

                        {/* Pixelated wavy water leading edge */}
                        <svg
                          viewBox="0 0 12 40"
                          preserveAspectRatio="none"
                          shapeRendering="crispEdges"
                          className="h-full w-6 shrink-0 pixel-art"
                          style={{ imageRendering: 'pixelated' }}
                          aria-hidden="true"
                        >
                          <rect x="4" y="0" width="8" height="4" fill="#38bdf8" />
                          <rect x="1" y="4" width="11" height="4" fill="#e0f2fe" />
                          <rect x="3" y="8" width="9" height="4" fill="#0284c7" />
                          <rect x="0" y="12" width="12" height="4" fill="#38bdf8" />
                          <rect x="2" y="16" width="10" height="4" fill="#ffffff" />
                          <rect x="4" y="20" width="8" height="4" fill="#0284c7" />
                          <rect x="1" y="24" width="11" height="4" fill="#38bdf8" />
                          <rect x="3" y="28" width="9" height="4" fill="#e0f2fe" />
                          <rect x="0" y="32" width="12" height="4" fill="#38bdf8" />
                          <rect x="2" y="36" width="10" height="4" fill="#0284c7" />
                        </svg>

                        {/* Trailing translucent LCD water sheet with bubbles */}
                        <div className="flex-1 h-full bg-gradient-to-r from-sky-400/75 via-cyan-300/45 to-transparent relative overflow-hidden">
                          <div className="absolute top-[18%] left-3 w-2 h-2 bg-white/90" />
                          <div className="absolute top-[44%] left-8 w-2.5 h-2.5 bg-sky-100/85" />
                          <div className="absolute top-[70%] left-4 w-2 h-2 bg-white/90" />
                          <div className="absolute top-[30%] left-16 w-1.5 h-1.5 bg-cyan-100/80" />
                          <div className="absolute top-[60%] left-20 w-2 h-2 bg-white/80" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Center stage: Digimon Sprite walking and moving across full LCD width */}
                  <div className="relative flex-1 w-full pb-0.5">
                    <div
                      className="absolute bottom-0.5 transition-[left] duration-[1600ms] ease-linear flex flex-col items-center z-10"
                      style={{
                        left: `${monX}%`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <DigimonSprite
                        species={species}
                        egg={pet.stage === 'egg' ? egg : undefined}
                        pose={internalPose}
                        eatItem={activeEatItem}
                        facing={facing}
                        lcdMode={false}
                        scale={0.92}
                      />
                    </div>
                  </div>

                  {/* Bottom LCD Telemetry Row (matching Bandai 25th photo) */}
                  <div className="relative z-20 flex justify-between items-center px-1 text-[7px] font-pixel text-[#0f172a] font-bold select-none drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    <span>MISTAKES: {pet.careMistakes || 0}</span>
                    <span className="uppercase">STATUS: {pet.isSick ? 'SICK' : pet.energy < 20 ? 'TIRED' : 'OK'}</span>
                  </div>
                </div>
              )}

              {/* LCD VIEW: STATS SCREEN */}
              {activeSubMenu === 'stats' && (
                <div className={`relative z-20 flex-1 flex flex-col justify-between text-[9px] font-pixel px-1.5 py-1 bg-slate-950/90 rounded border border-slate-700 text-cyan-300`}>
                  <div className="flex justify-between items-center border-b border-slate-700 pb-0.5 mb-1 font-bold">
                    <span>STATS [{statsPage + 1}/3]</span>
                    <div className="flex gap-1 text-[7px]">
                      <button onClick={() => setStatsPage(0)} className={`px-1 rounded ${statsPage === 0 ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'}`}>CARE</button>
                      <button onClick={() => setStatsPage(1)} className={`px-1 rounded ${statsPage === 1 ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'}`}>RPG</button>
                      <button onClick={() => setStatsPage(2)} className={`px-1 rounded ${statsPage === 2 ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'}`}>EVO</button>
                    </div>
                  </div>

                  {statsPage === 0 && (
                    <div className="space-y-0.5 text-[8px]">
                      <div className="flex justify-between text-white font-bold">
                        <span className="uppercase">{pet.nickname}</span>
                        <span className="text-[7px] text-amber-300 uppercase">{pet.stage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>WEIGHT / AGE:</span>
                        <span className="font-bold text-white">{pet.weight}g / {ageDays}d</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HUNGER / STR:</span>
                        <span className="font-bold text-amber-300">♥{pet.hunger}% ★{pet.strength}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ENERGY / DP:</span>
                        <span className="font-bold text-white">{pet.energy}% / {pet.dpPoints}DP</span>
                      </div>
                    </div>
                  )}

                  {statsPage === 1 && (
                    <div className="space-y-0.5 text-[8px]">
                      <div className="flex justify-between">
                        <span>HP:</span>
                        <span className="font-bold text-emerald-400">{species?.baseHp || 100} HP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ATK:</span>
                        <span className="font-bold text-amber-300">{totalAtk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DEF / SPD:</span>
                        <span className="font-bold text-white">{species?.baseDef || 15} / {species?.baseSpd || 15}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SIGNATURE:</span>
                        <span className="font-bold text-cyan-200 truncate max-w-[80px]">{species?.signatureMove.name || 'Punch'}</span>
                      </div>
                    </div>
                  )}

                  {statsPage === 2 && (
                    <div className="space-y-0.5 text-[8px]">
                      <div className="flex justify-between">
                        <span>COLOSSEUM:</span>
                        <span className="font-bold text-white">{pet.battlesWon}W / {pet.battlesTotal}T ({winRate}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TRAINING:</span>
                        <span className="font-bold text-amber-300">{pet.trainingCount}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NEXT EVO:</span>
                        <span className="font-bold text-amber-400 uppercase">{nextEvo ? nextEvo.speciesId : 'MAX'}</span>
                      </div>
                    </div>
                  )}

                  {onOpenStatsModal && (
                    <button
                      onClick={onOpenStatsModal}
                      className="mt-0.5 py-0.5 px-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-[7px] text-center"
                    >
                      OPEN FULL RADAR MODAL »
                    </button>
                  )}
                </div>
              )}

              {/* LCD VIEW: FOOD MENU */}
              {activeSubMenu === 'food' && (
                <div className="relative z-20 flex-1 flex flex-col items-center justify-center gap-1.5 bg-slate-950/90 rounded border border-slate-700 p-2">
                  <span className="text-[8px] font-pixel text-amber-300 font-bold">SELECT NOURISHMENT</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        triggerFeedMeatAnimation();
                        setActiveSubMenu('screen');
                      }}
                      className="flex flex-col items-center p-1 bg-slate-900 border border-amber-500/50 hover:bg-slate-800 rounded cursor-pointer"
                    >
                      <PixelMeatIcon className="w-5 h-5" />
                      <span className="text-[7px] font-pixel text-white mt-0.5">MEAT ({pet.bigMeatStock})</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerFeedVitaminAnimation();
                        setActiveSubMenu('screen');
                      }}
                      className="flex flex-col items-center p-1 bg-slate-900 border border-purple-500/50 hover:bg-slate-800 rounded cursor-pointer"
                    >
                      <PixelVitaminIcon className="w-5 h-5" />
                      <span className="text-[7px] font-pixel text-white mt-0.5">VIT ({pet.vitaminStock})</span>
                    </button>
                  </div>
                  {onOpenShop && (
                    <button
                      onClick={onOpenShop}
                      className="text-[7px] font-pixel text-amber-400 hover:underline cursor-pointer"
                    >
                      Need food? Buy at Shop »
                    </button>
                  )}
                </div>
              )}

              {/* BOTTOM 4 LCD STATUS ICONS */}
              <div className="relative z-20 flex justify-between items-center px-1 pb-0.5">
                {menuItems.slice(4).map((item, idx) => {
                  const actualIdx = idx + 4;
                  const isSelected = selectedMenuIdx === actualIdx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleIconClick(actualIdx, item.id)}
                      className={`w-7 h-7 rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0f172a] text-amber-300 font-bold scale-110 border border-amber-300 shadow-md ring-1 ring-amber-400'
                          : 'text-[#0f172a] hover:bg-black/10'
                      }`}
                      title={item.label}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>

            </div>

          </div>

          {/* RIGHT CHASSIS: MOLDED CIRCULAR WELLS & 3 DARK CHARCOAL BUTTONS (A, B, C) */}
          <div className="relative z-10 shrink-0 flex flex-col items-center justify-between h-[220px] pl-1 pr-1">
            
            {/* BUTTON A: Select (with molded UP arrow above it) */}
            <div className="flex flex-col items-center">
              {/* Molded Up Arrow in brick plastic */}
              <div className="text-[10px] font-bold text-black/60 mb-0.5 tracking-tighter drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]">
                ▲
              </div>
              {/* Circular Recessed Bezel Well */}
              <div className="w-11 h-11 rounded-full border-2 border-black/40 bg-black/25 flex items-center justify-center shadow-inner">
                <button
                  onClick={handleNextMenu}
                  className={`w-8.5 h-8.5 rounded-full ${currentShell.btnBg} border-2 ${currentShell.btnBorder} shadow-[0_3px_0_${currentShell.btnShadow},0_4px_6px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-none flex items-center justify-center cursor-pointer transition-transform`}
                  title="Button A: Select Icon"
                >
                  <span className="font-pixel font-bold text-[11px] text-amber-950 select-none drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    A
                  </span>
                </button>
              </div>
            </div>

            {/* RESET PINHOLE: Between Button B and C, slightly to the left */}
            <div className="relative w-full flex items-center justify-start pl-0.5 -my-1">
              <div 
                onClick={() => {
                  sound.playButton();
                  if (onResetEgg) {
                    onResetEgg();
                  } else {
                    handleCancel();
                  }
                }}
                className="w-3.5 h-3.5 rounded-full bg-black/90 border border-slate-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.95)] cursor-pointer hover:bg-slate-900 flex items-center justify-center group"
                title="Reset Digimon / Hatch New Egg (1997 Pinhole)"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80 group-hover:bg-amber-400 group-hover:scale-125 transition-all" />
              </div>
            </div>

            {/* BUTTON B: Confirm */}
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full border-2 border-black/40 bg-black/25 flex items-center justify-center shadow-inner">
                <button
                  onClick={handleSelectMenu}
                  className={`w-8.5 h-8.5 rounded-full ${currentShell.btnBg} border-2 ${currentShell.btnBorder} shadow-[0_3px_0_${currentShell.btnShadow},0_4px_6px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-none flex items-center justify-center cursor-pointer transition-transform`}
                  title="Button B: Confirm"
                >
                  <span className="font-pixel font-bold text-[11px] text-amber-950 select-none drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    B
                  </span>
                </button>
              </div>
            </div>

            {/* BUTTON C: Cancel (with molded DOWN arrow below it) */}
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full border-2 border-black/40 bg-black/25 flex items-center justify-center shadow-inner">
                <button
                  onClick={handleCancel}
                  className={`w-8.5 h-8.5 rounded-full ${currentShell.btnBg} border-2 ${currentShell.btnBorder} shadow-[0_3px_0_${currentShell.btnShadow},0_4px_6px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-none flex items-center justify-center cursor-pointer transition-transform`}
                  title="Button C: Cancel"
                >
                  <span className="font-pixel font-bold text-[11px] text-amber-950 select-none drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    C
                  </span>
                </button>
              </div>
              {/* Molded Down Arrow in brick plastic */}
              <div className="text-[10px] font-bold text-black/60 mt-0.5 tracking-tighter drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]">
                ▼
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM-RIGHT MOLDED CORNER EYELET LUG & AUTHENTIC CHROME KEYCHAIN (MATCHING PHOTO) */}
        <div 
          onClick={handleKeychainJingle}
          className="absolute -bottom-14 right-2 z-30 cursor-pointer flex flex-col items-center group pointer-events-auto"
          title="Click to jingle Digivice Keychain!"
        >
          {/* Triangular molded plastic lug on corner */}
          <div className="w-4 h-4 bg-[#781f1f] rounded-xs rotate-45 border border-[#3b0f0f] -mb-1 shadow" />
          
          {/* Silver Split Ring */}
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-transparent shadow -mb-1" />
          
          {/* Metal Chain Links */}
          <div className="flex flex-col items-center -space-y-1">
            <div className="w-2.5 h-3.5 rounded-full border-2 border-slate-300 bg-slate-400/40 shadow-sm" />
            <div className="w-2.5 h-3.5 rounded-full border-2 border-slate-300 bg-slate-400/40 shadow-sm" />
            <div className="w-2.5 h-3.5 rounded-full border-2 border-slate-300 bg-slate-400/40 shadow-sm" />
          </div>

          {/* Chrome Swivel Snap Hook Clasp */}
          <div className="w-4 h-7 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 rounded-b-md rounded-t-sm border border-slate-500 shadow-md flex items-center justify-center -mt-0.5">
            <div className="w-1.5 h-3 border-r-2 border-slate-600 rounded-r-xs" />
          </div>
        </div>

      </div>
      </div>

    </div>
  );
};
