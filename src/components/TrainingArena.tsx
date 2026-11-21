import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { DigimonSpecies, PetState, TrainingStatKey } from '../types/digimon';
import {
  ATTACK_ELEMENT_META,
  BATTLE_TECHNIQUE_CATALOG,
  GYM_STATIONS,
  MAX_EQUIPPED_ATTACKS,
  getEffectiveBattleStats,
  getEquippedBattleMoves,
  getLearnedTechniqueIds,
  getStationPreferenceMultiplier,
} from '../data/battleTechniques';
import { DigimonSprite } from './DigimonSprite';
import { PixelMeatIcon } from './PixelItemIcons';
import { sound } from '../utils/audio';
import { Dumbbell, X, Flame, Check, Lock, Swords } from 'lucide-react';

interface GymStationVisualProps {
  statKey: TrainingStatKey;
  species?: DigimonSpecies;
  isExecuting: boolean;
  hitState: 'idle' | 'critical' | 'weak';
  hitNonce: number;
  round: number;
  actionSprite: 'idle' | 'attack' | 'happy';
  roundResult: { text: string; isCrit: boolean } | null;
}

const GymStationVisual: React.FC<GymStationVisualProps> = ({
  statKey,
  species,
  isExecuting,
  hitState,
  hitNonce,
  round,
  actionSprite,
  roundResult,
}) => {
  const bgMap: Record<TrainingStatKey, string> = {
    hp: 'from-emerald-950/90 via-stone-900 to-slate-950 border-emerald-500/40',
    mp: 'from-cyan-950/90 via-sky-950 to-slate-950 border-cyan-500/40',
    offense: 'from-amber-950/80 via-stone-900 to-slate-950 border-rose-500/40',
    defense: 'from-slate-900 via-sky-950/70 to-slate-950 border-sky-500/40',
    speed: 'from-amber-950/70 via-slate-900 to-slate-950 border-amber-500/40',
    brains: 'from-violet-950/80 via-slate-900 to-slate-950 border-violet-500/40',
  };

  return (
    <div
      className={`relative w-full h-56 bg-gradient-to-b ${bgMap[statKey]} border-2 rounded-2xl overflow-hidden flex items-end justify-center pb-5 px-4 select-none`}
    >
      {/* Top Left HUD Pill */}
      <div className="absolute top-2.5 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700/80 font-pixel text-[9px] text-slate-200 z-20">
        ROUND {round}/3
      </div>

      {/* Round Result Popup */}
      {roundResult && (
        <motion.div
          key={`res-${hitNonce}-${round}`}
          initial={{ y: 8, opacity: 0, scale: 0.85 }}
          animate={{ y: -8, opacity: 1, scale: 1 }}
          className={`absolute top-2.5 right-3 z-30 font-pixel text-[10px] px-2.5 py-1 rounded-lg border shadow-md ${
            roundResult.isCrit
              ? 'bg-amber-400 text-slate-950 border-amber-200 font-bold'
              : 'bg-slate-800 text-slate-200 border-slate-600'
          }`}
        >
          {roundResult.text}
        </motion.div>
      )}

      {/* Ground Plane */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-black/35 border-t border-white/10 pointer-events-none" />

      {/* 1. HP: BOULDER PUSH */}
      {statKey === 'hp' && (
        <div className="relative w-full h-full flex items-end justify-center gap-2">
          <motion.div
            key={`boulder-mon-${hitNonce}`}
            animate={
              isExecuting
                ? { x: [0, 26, 20, 0], rotate: [0, 5, 3, 0] }
                : { x: 0, rotate: 0 }
            }
            transition={{ duration: 0.72, ease: 'easeInOut' }}
            className="z-10"
          >
            <DigimonSprite
              species={species}
              action={isExecuting ? 'attack' : actionSprite}
              facing="right"
              scale={1.08}
            />
          </motion.div>

          <motion.div
            key={`boulder-${hitNonce}`}
            animate={
              isExecuting
                ? {
                    x: hitState === 'critical' ? [0, 32, 22, 0] : [0, 10, 4, 0],
                    rotate: hitState === 'critical' ? [0, 14, 8, 0] : [0, 4, 0],
                  }
                : { x: 0, rotate: 0 }
            }
            transition={{ duration: 0.72, ease: 'easeOut' }}
            className="relative z-10 mb-1"
          >
            <svg viewBox="0 0 64 56" className="w-20 h-16 drop-shadow-[0_6px_10px_rgba(0,0,0,0.65)]">
              <polygon
                points="10,50 4,34 14,14 34,6 54,16 60,36 52,50"
                fill="#57534e"
                stroke="#1c1917"
                strokeWidth="3"
              />
              <polygon points="14,14 34,6 42,22 24,26" fill="#78716c" />
              <polygon points="42,22 54,16 60,36 46,44" fill="#44403c" />
              <path d="M24,28 L34,34 L28,44" stroke="#292524" strokeWidth="2.5" fill="none" />
            </svg>
            {isExecuting && hitState === 'critical' && (
              <motion.div
                initial={{ opacity: 1, scale: 0.6 }}
                animate={{ opacity: 0, scale: 1.45 }}
                transition={{ duration: 0.45 }}
                className="absolute -left-3 bottom-1 text-emerald-300 font-pixel text-[10px]"
              >
                CRACK!
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* 2. MP: WATERFALL MEDITATION */}
      {statKey === 'mp' && (
        <div className="relative w-full h-full flex items-end justify-center">
          {/* Cascading Waterfall Columns */}
          <div className="absolute inset-y-0 w-36 bg-gradient-to-b from-cyan-400/20 via-sky-500/25 to-cyan-300/35 border-x border-cyan-300/25 overflow-hidden flex justify-around pointer-events-none">
            {[0, 1, 2, 3, 4].map((col) => (
              <motion.div
                key={col}
                animate={{ y: ['-25%', '100%'] }}
                transition={{ repeat: Infinity, duration: 0.75 + col * 0.12, ease: 'linear', delay: col * 0.14 }}
                className="w-2.5 h-14 rounded-full bg-gradient-to-b from-white/60 via-cyan-200/70 to-transparent"
              />
            ))}
          </div>
          {/* Splash Foam Base */}
          <motion.div
            animate={{ scaleX: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
            className="absolute bottom-4 w-40 h-5 rounded-full bg-cyan-200/30 blur-[2px] pointer-events-none"
          />
          {/* Meditating Digimon + Mana Aura */}
          <motion.div
            animate={
              isExecuting
                ? { y: [0, -6, 0], scale: [1, 1.06, 1] }
                : { y: [0, -2, 0] }
            }
            transition={{ repeat: Infinity, duration: isExecuting ? 0.55 : 2.1, ease: 'easeInOut' }}
            className="relative z-10"
          >
            {isExecuting && (
              <motion.div
                initial={{ opacity: 0.3, scale: 0.8 }}
                animate={{ opacity: [0.8, 0.2, 0.8], scale: [0.95, 1.35, 1.05] }}
                transition={{ repeat: Infinity, duration: 0.7 }}
                className="absolute -inset-4 rounded-full border-2 border-cyan-300/80 shadow-[0_0_16px_rgba(34,211,238,0.6)] pointer-events-none"
              />
            )}
            <DigimonSprite
              species={species}
              action={isExecuting ? 'happy' : 'sit'}
              facing="right"
              scale={1.08}
            />
          </motion.div>
        </div>
      )}

      {/* 3. OFFENSE: ANCIENT TREE TRUNK */}
      {statKey === 'offense' && (
        <div className="relative w-full h-full flex items-end justify-center gap-4">
          <motion.div
            key={`tree-mon-${hitNonce}`}
            animate={
              isExecuting
                ? { x: [0, 30, -4, 0], scale: [1, 1.06, 1] }
                : { x: 0 }
            }
            transition={{ duration: 0.52, ease: 'easeOut' }}
            className="z-10"
          >
            <DigimonSprite
              species={species}
              action={isExecuting ? 'attack' : actionSprite}
              facing="right"
              scale={1.08}
            />
          </motion.div>

          {/* Ancient Tree Trunk */}
          <motion.div
            key={`tree-${hitNonce}`}
            animate={
              isExecuting
                ? hitState === 'critical'
                  ? { rotate: [0, 8, -5, 3, 0], x: [0, 7, -3, 0] }
                  : { rotate: [0, 3, -2, 0], x: [0, 3, 0] }
                : { rotate: 0, x: 0 }
            }
            transition={{ duration: 0.45 }}
            style={{ transformOrigin: 'bottom center' }}
            className="relative z-10"
          >
            <svg viewBox="0 0 64 110" className="w-20 h-32 drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)]">
              {/* Trunk */}
              <path d="M20,106 L24,38 L40,38 L46,106 Z" fill="#78350f" stroke="#291203" strokeWidth="3" />
              <path d="M27,44 L26,96 M35,50 L37,98" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
              {/* Canopy */}
              <circle cx="32" cy="24" r="22" fill="#15803d" stroke="#052e16" strokeWidth="3" />
              <circle cx="18" cy="30" r="14" fill="#16a34a" stroke="#052e16" strokeWidth="2.5" />
              <circle cx="46" cy="30" r="14" fill="#166534" stroke="#052e16" strokeWidth="2.5" />
            </svg>
            {isExecuting && (
              <>
                <motion.span
                  initial={{ x: 0, y: -40, opacity: 1 }}
                  animate={{ x: -24, y: 8, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.65 }}
                  className="absolute left-2 top-8 w-2.5 h-1.5 bg-emerald-400 rounded-full"
                />
                <motion.span
                  initial={{ x: 10, y: -32, opacity: 1 }}
                  animate={{ x: 26, y: 12, opacity: 0, rotate: -110 }}
                  transition={{ duration: 0.65 }}
                  className="absolute right-1 top-8 w-2.5 h-1.5 bg-lime-400 rounded-full"
                />
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* 4. DEFENSE: GIANT PUNCHING GLOVE */}
      {statKey === 'defense' && (
        <div className="relative w-full h-full flex items-end justify-center gap-6">
          <motion.div
            key={`def-mon-${hitNonce}`}
            animate={
              isExecuting
                ? hitState === 'critical'
                  ? { x: [0, -8, 2, 0], scaleX: [1, 0.92, 1.03, 1] }
                  : { x: [0, -14, 0], rotate: [0, -6, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.45, delay: 0.16 }}
            className="z-10"
          >
            <DigimonSprite
              species={species}
              action={actionSprite}
              facing="right"
              scale={1.08}
            />
          </motion.div>

          {/* Spring-loaded Giant Red Punching Glove from the Right */}
          <motion.div
            key={`glove-${hitNonce}`}
            animate={
              isExecuting
                ? { x: [42, -32, 6, 0], scale: [1, 1.15, 0.96, 1] }
                : { x: 32 }
            }
            transition={{ duration: 0.56, ease: 'easeOut' }}
            className="relative z-20 mb-5 flex items-center"
          >
            <svg viewBox="0 0 88 48" className="w-28 h-16 drop-shadow-[0_6px_10px_rgba(0,0,0,0.75)]">
              {/* Steel Coil Spring */}
              <path
                d="M52,24 L58,14 L64,34 L70,14 L76,34 L84,24"
                stroke="#94a3b8"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Giant Red Boxing Glove */}
              <rect x="38" y="13" width="14" height="22" rx="3" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2.5" />
              <path
                d="M38,10 C22,6 6,12 6,24 C6,36 20,42 38,38 Z"
                fill="#dc2626"
                stroke="#450a0a"
                strokeWidth="3"
              />
              <ellipse cx="18" cy="18" rx="6" ry="3.5" fill="#f87171" opacity="0.7" />
            </svg>
            {isExecuting && (
              <motion.div
                initial={{ opacity: 1, scale: 0.6 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.38, delay: 0.14 }}
                className="absolute -left-4 top-2 text-amber-300 font-pixel text-xs font-bold"
              >
                BAM!
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* 5. SPEED: RUNNING LAPS RIGHT-TO-LEFT WRAP */}
      {statKey === 'speed' && (
        <div className="relative w-full h-full flex items-end overflow-hidden">
          {/* Speed Track Lane Lines */}
          <div className="absolute inset-x-0 bottom-2 flex justify-around pointer-events-none opacity-60">
            {[0, 1, 2, 3, 4, 5].map((stripe) => (
              <div key={stripe} className="w-8 h-1.5 bg-amber-300/60 rounded-full" />
            ))}
          </div>

          <motion.div
            key={`speed-lap-${hitNonce}-${isExecuting ? 'run' : 'idle'}`}
            initial={{ x: '35%' }}
            animate={
              isExecuting
                ? {
                    x: ['35%', '125%', '-35%', '125%', '-35%', '35%'],
                  }
                : { x: '35%' }
            }
            transition={
              isExecuting
                ? {
                    duration: 1.32,
                    times: [0, 0.24, 0.245, 0.64, 0.645, 1],
                    ease: 'linear',
                  }
                : { duration: 0.2 }
            }
            className="w-full flex items-end z-10"
          >
            <div className="relative">
              <DigimonSprite
                species={species}
                action={isExecuting ? 'walk' : actionSprite}
                facing="right"
                scale={1.05}
              />
              {isExecuting && (
                <div className="absolute top-1/2 -left-8 -translate-y-1/2 flex flex-col gap-1 pointer-events-none">
                  <div className="w-6 h-1 bg-amber-300/80 rounded-full" />
                  <div className="w-4 h-1 bg-cyan-300/70 rounded-full ml-1" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. BRAINS: BLACKBOARD + FLOATING BOOK & WRITING PENCIL */}
      {statKey === 'brains' && (
        <div className="relative w-full h-full flex items-end justify-center gap-4">
          {/* Classroom Slate Blackboard */}
          <div className="relative mb-3 w-36 h-24 rounded-xl bg-[#14532d] border-4 border-[#92400e] shadow-xl p-2 flex flex-col justify-between z-0">
            <div className="text-[9px] font-mono text-emerald-100/90 leading-tight">
              <div>ATK × 1.5 ⚡</div>
              <div>MP → TECH</div>
            </div>
            <svg viewBox="0 0 80 28" className="w-full h-7 opacity-85">
              <path d="M4,22 Q24,4 44,18 T76,6" stroke="#fde047" strokeWidth="2" fill="none" strokeDasharray="3 2" />
              <circle cx="76" cy="6" r="2.5" fill="#fb7185" />
            </svg>
          </div>

          {/* Studying Digimon with Floating Book + Moving Pencil Overhead */}
          <div className="relative flex flex-col items-center z-10">
            <motion.div
              animate={
                isExecuting
                  ? { y: [-2, -7, -2], rotate: [-4, 4, -4] }
                  : { y: [0, -3, 0] }
              }
              transition={{ repeat: Infinity, duration: isExecuting ? 0.5 : 1.8 }}
              className="mb-1 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/80 border border-violet-400/50 shadow-md"
            >
              {/* Tiny Open Book */}
              <svg viewBox="0 0 20 14" className="w-5 h-3.5">
                <path d="M2,2 L10,4 L18,2 L18,12 L10,13 L2,12 Z" fill="#fef3c7" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="10" y1="4" x2="10" y2="13" stroke="#94a3b8" strokeWidth="1" />
              </svg>
              {/* Animated Writing Pencil */}
              <motion.svg
                viewBox="0 0 16 16"
                className="w-4 h-4"
                animate={
                  isExecuting
                    ? { x: [-2, 3, -1, 3, -2], rotate: [-12, 8, -12] }
                    : { x: [0, 2, 0], rotate: [-6, 4, -6] }
                }
                transition={{ repeat: Infinity, duration: isExecuting ? 0.32 : 1.2 }}
              >
                <polygon points="3,13 5,9 12,2 14,4 7,11" fill="#facc15" stroke="#1e293b" strokeWidth="1.2" />
                <polygon points="2,14 3,13 5,11 4,14" fill="#334155" />
              </motion.svg>
            </motion.div>

            <motion.div
              animate={
                isExecuting
                  ? { rotate: [-4, 4, -4], y: [0, -3, 0] }
                  : { rotate: [-1.5, 1.5, -1.5] }
              }
              transition={{ repeat: Infinity, duration: isExecuting ? 0.45 : 2.2 }}
            >
              <DigimonSprite
                species={species}
                action={isExecuting ? 'happy' : 'idle'}
                facing="left"
                scale={1.04}
              />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TrainingArenaProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onTrainingComplete: (success: boolean, statKey: TrainingStatKey, hits: number) => void;
  onToggleEquipAttack?: (moveId: string) => void;
  onOpenFoodGame: () => void;
}

export const TrainingArena: React.FC<TrainingArenaProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onTrainingComplete,
  onToggleEquipAttack,
  onOpenFoodGame,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'punch' | 'moves'>('menu');
  const [selectedStat, setSelectedStat] = useState<TrainingStatKey>('offense');
  const [meterVal, setMeterVal] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [hits, setHits] = useState<number>(0);
  const [isPunching, setIsPunching] = useState<boolean>(false);
  const [actionSprite, setActionSprite] = useState<'idle' | 'attack' | 'happy'>('idle');
  const [roundResult, setRoundResult] = useState<{ text: string; isCrit: boolean } | null>(null);
  const [bagHitState, setBagHitState] = useState<'idle' | 'critical' | 'weak'>('idle');
  const [bagHitNonce, setBagHitNonce] = useState<number>(0);
  const meterDirectionRef = useRef<number>(1);
  const meterLoopRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTrainingTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTrainingTimers();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('menu');
    }
  }, [isOpen]);

  // Meter oscillation with delta-time normalization
  useEffect(() => {
    if (activeTab !== 'punch' || isPunching || round > 3) return;

    let lastTime = performance.now();

    const animateMeter = (timestamp: number) => {
      const deltaMs = Math.min(50, Math.max(8, timestamp - lastTime));
      lastTime = timestamp;
      const step = (deltaMs / 16.667) * 3.1;

      setMeterVal((prev) => {
        let next = prev + meterDirectionRef.current * step;
        if (next >= 100) {
          next = 100;
          meterDirectionRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          meterDirectionRef.current = 1;
        }
        return next;
      });
      meterLoopRef.current = requestAnimationFrame(animateMeter);
    };

    meterLoopRef.current = requestAnimationFrame(animateMeter);
    return () => {
      if (meterLoopRef.current) cancelAnimationFrame(meterLoopRef.current);
    };
  }, [activeTab, isPunching, round]);

  const handleStartStationTraining = (statKey: TrainingStatKey) => {
    clearTrainingTimers();
    sound.playButton();
    setSelectedStat(statKey);
    setRound(1);
    setHits(0);
    setMeterVal(0);
    setRoundResult(null);
    setIsPunching(false);
    setActionSprite('idle');
    setBagHitState('idle');
    setActiveTab('punch');
  };

  const handleExecutePunch = () => {
    if (isPunching) return;
    clearTrainingTimers();
    setIsPunching(true);
    if (selectedStat === 'mp' || selectedStat === 'brains') {
      sound.playButton();
    } else {
      sound.playPunch();
    }
    setActionSprite('attack');

    const isSuccess = meterVal >= 75;
    const nextHits = hits + (isSuccess ? 1 : 0);
    if (isSuccess) {
      sound.playBlast();
      setHits(nextHits);
      setRoundResult({ text: 'GREAT TIMING! +1', isCrit: true });
      setBagHitState('critical');
    } else {
      setRoundResult({ text: 'GLANCING HIT', isCrit: false });
      setBagHitState('weak');
    }
    setBagHitNonce((n) => n + 1);

    const animDurationMs = selectedStat === 'speed' ? 1380 : 950;
    const tRound = window.setTimeout(() => {
      setActionSprite('idle');
      setBagHitState('idle');
      if (round < 3) {
        setRound((r) => r + 1);
        setIsPunching(false);
        setRoundResult(null);
      } else {
        const totalSuccess = nextHits >= 2;
        if (totalSuccess) {
          sound.playVictory();
          setActionSprite('happy');
        }
        const tDone = window.setTimeout(() => {
          onTrainingComplete(totalSuccess, selectedStat, nextHits);
          setActiveTab('menu');
        }, 650);
        timersRef.current.push(tDone);
      }
    }, animDurationMs);
    timersRef.current.push(tRound);
  };

  if (!isOpen) return null;

  const stats = getEffectiveBattleStats(pet, species);
  const learnedIds = getLearnedTechniqueIds(pet, species);
  const equippedMoves = getEquippedBattleMoves(pet, species);
  const equippedIds = new Set(equippedMoves.map((m) => m.id));
  const activeStation = GYM_STATIONS.find((s) => s.id === selectedStat) || GYM_STATIONS[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/88 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/45 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-chakra font-bold text-white text-lg truncate">
                Digi-Training Gym
              </h3>
              <p className="text-slate-400 text-xs truncate">
                6 Core Stats · Brains Unlocks Techniques (Max {MAX_EQUIPPED_ATTACKS} Equipped)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              clearTrainingTimers();
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close Training Gym"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Core Stat Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 my-3 p-2.5 bg-slate-950/85 rounded-2xl border border-slate-800 text-center tabular-nums">
          <div>
            <div className="text-[10px] text-slate-400 font-chakra">HP</div>
            <div className="text-emerald-300 font-chakra font-bold text-sm">{stats.maxHp}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-chakra">MP</div>
            <div className="text-cyan-300 font-chakra font-bold text-sm">{stats.maxMp}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-chakra">Offense</div>
            <div className="text-rose-300 font-chakra font-bold text-sm">{stats.offense}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-chakra">Defense</div>
            <div className="text-sky-300 font-chakra font-bold text-sm">{stats.defense}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-chakra">Speed</div>
            <div className="text-amber-300 font-chakra font-bold text-sm">{stats.speed}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-chakra">Brains</div>
            <div className="text-violet-300 font-chakra font-bold text-sm">{stats.brains}</div>
          </div>
        </div>

        {/* Sub-navigation Tabs (Stations vs Technique Loadout) */}
        {activeTab !== 'punch' && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 border border-slate-800 rounded-xl mb-3">
            <button
              onClick={() => {
                sound.playButton();
                setActiveTab('menu');
              }}
              className={`flex-1 min-h-[40px] rounded-lg font-chakra text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              6 Gym Stations
            </button>
            <button
              onClick={() => {
                sound.playButton();
                setActiveTab('moves');
              }}
              className={`flex-1 min-h-[40px] rounded-lg font-chakra text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'moves'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Attack Loadout ({equippedMoves.length}/{MAX_EQUIPPED_ATTACKS})</span>
            </button>
          </div>
        )}

        {/* VIEW 1: 6 GYM STATIONS + MEAT CATCH */}
        {activeTab === 'menu' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GYM_STATIONS.map((station) => {
                const pref = getStationPreferenceMultiplier(station.id, species);
                return (
                  <button
                    key={station.id}
                    onClick={() => handleStartStationTraining(station.id)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer hover:brightness-110 active:scale-[0.98] flex flex-col justify-between min-h-[106px] ${station.accentColor}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-chakra font-bold text-white text-sm">
                          {station.statLabel} · {station.stationName}
                        </span>
                        {pref.multiplier !== 1.0 && (
                          <span className="text-[11px] font-chakra font-semibold opacity-90 whitespace-nowrap">
                            {pref.label}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300/90 mt-1 leading-snug">
                        {station.description}
                      </p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] font-chakra text-slate-200">
                      <span>+{station.primaryLabel} / +{station.secondaryLabel}</span>
                      <span className="font-bold text-white whitespace-nowrap">Train »</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Meat Catch Shortcut */}
            <button
              onClick={() => {
                sound.playButton();
                onClose();
                onOpenFoodGame();
              }}
              className="w-full p-3.5 bg-slate-800/80 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/60 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0">
                  <PixelMeatIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-chakra font-bold text-white text-sm truncate">
                    "I'm Hungry!" Meat Catch
                  </h4>
                  <p className="text-slate-400 text-xs truncate">
                    Catch Big Meat & Vitamins while boosting Effort (+2 EF)
                  </p>
                </div>
              </div>
              <span className="bg-amber-400 text-slate-950 font-chakra text-xs px-3 py-1.5 rounded-xl font-bold shrink-0 whitespace-nowrap">
                Play
              </span>
            </button>
          </div>
        )}

        {/* VIEW 2: LEARNABLE ATTACK LOADOUT (MAX 4) */}
        {activeTab === 'moves' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-chakra text-slate-300 px-1">
              <span>
                Train <strong className="text-violet-300">Blackboard (Brains)</strong> to unlock new attacks.
              </span>
              <span className="font-bold text-amber-300 tabular-nums">
                Equipped {equippedMoves.length}/{MAX_EQUIPPED_ATTACKS}
              </span>
            </div>

            <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
              {BATTLE_TECHNIQUE_CATALOG.map((tech) => {
                const isLearned = learnedIds.includes(tech.id);
                const isEquipped = equippedIds.has(tech.id);
                const elMeta = ATTACK_ELEMENT_META[tech.element];
                const canEquipMore = equippedMoves.length < MAX_EQUIPPED_ATTACKS;

                return (
                  <div
                    key={tech.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      isEquipped
                        ? 'bg-amber-950/35 border-amber-400/60'
                        : isLearned
                        ? 'bg-slate-950/80 border-slate-700/80'
                        : 'bg-slate-950/45 border-slate-800/70 opacity-65'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-chakra font-bold text-white text-sm">
                          {tech.name}
                        </span>
                        <span className="text-[11px] font-chakra font-semibold text-slate-300">
                          {elMeta.label} · PWR {tech.power} · {tech.mpCost} MP
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                        {tech.description}
                        {elMeta.beatsLabel !== 'None (Balanced)' && (
                          <span className="text-emerald-300/90"> (1.5x vs {elMeta.beatsLabel})</span>
                        )}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {!isLearned ? (
                        <div className="inline-flex items-center gap-1 text-xs font-chakra text-slate-400 whitespace-nowrap">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Brains {tech.brainsThreshold}</span>
                        </div>
                      ) : onToggleEquipAttack ? (
                        <button
                          disabled={!isEquipped && !canEquipMore}
                          onClick={() => {
                            sound.playButton();
                            onToggleEquipAttack(tech.id);
                          }}
                          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-chakra font-bold text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                            isEquipped
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                              : canEquipMore
                              ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                              : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          {isEquipped && <Check className="w-3.5 h-3.5" />}
                          <span>{isEquipped ? 'Equipped' : canEquipMore ? 'Equip' : 'Slots Full'}</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: PUNCH TIMING DRILL FOR SELECTED STATION */}
        {activeTab === 'punch' && (
          <div className="flex flex-col items-center py-1">
            <div className="flex items-center justify-between w-full px-1 mb-2 text-xs font-chakra text-slate-300">
              <span className="font-bold text-cyan-300">
                {activeStation.stationName} ({activeStation.primaryLabel} / +{activeStation.secondaryLabel})
              </span>
              <span className="tabular-nums">
                Round {round}/3 · Hits {hits}
              </span>
            </div>

            <GymStationVisual
              statKey={selectedStat}
              species={species}
              isExecuting={isPunching}
              hitState={bagHitState}
              hitNonce={bagHitNonce}
              round={round}
              actionSprite={actionSprite}
              roundResult={roundResult}
            />

            <div className="w-full mt-3.5">
              <div className="flex justify-between text-xs font-chakra text-slate-400 mb-1">
                <span>Timing Gauge</span>
                <span className="text-amber-300 font-semibold">Sweet Spot: 75% – 100%</span>
              </div>
              <div className="relative w-full h-7 bg-slate-800 border-2 border-slate-600 rounded-full overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-[25%] bg-amber-400/40 border-l-2 border-amber-300 flex items-center justify-center font-chakra text-[10px] font-bold text-amber-200">
                  TARGET
                </div>
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 transition-none"
                  style={{ width: `${meterVal}%` }}
                />
              </div>
            </div>

            <div className="w-full flex gap-2 mt-4">
              <button
                type="button"
                disabled={isPunching}
                onClick={() => {
                  clearTrainingTimers();
                  setActiveTab('menu');
                }}
                className="min-h-[48px] px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-chakra text-sm font-semibold cursor-pointer disabled:opacity-40"
              >
                Back
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={isPunching}
                onClick={handleExecutePunch}
                className="flex-1 min-h-[48px] bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-chakra text-base py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Flame className="w-5 h-5 fill-slate-950" />
                <span>
                  {selectedStat === 'hp'
                    ? 'Push Boulder'
                    : selectedStat === 'mp'
                    ? 'Meditate'
                    : selectedStat === 'offense'
                    ? 'Strike Trunk'
                    : selectedStat === 'defense'
                    ? 'Brace Impact'
                    : selectedStat === 'speed'
                    ? 'Sprint Laps'
                    : 'Study Tactics'}
                </span>
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
