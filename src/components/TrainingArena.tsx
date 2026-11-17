import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { DigimonSpecies, PetState } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { PixelMeatIcon, PixelPunchingBag } from './PixelItemIcons';
import { sound } from '../utils/audio';
import { Dumbbell, X, Zap, Trophy, Flame, Utensils } from 'lucide-react';

interface TrainingArenaProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onTrainingComplete: (success: boolean) => void;
  onOpenFoodGame: () => void;
}

export const TrainingArena: React.FC<TrainingArenaProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onTrainingComplete,
  onOpenFoodGame,
}) => {
  // Target Punch Game State
  const [activeTab, setActiveTab] = useState<'punch' | 'menu'>('menu');
  const [meterVal, setMeterVal] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [hits, setHits] = useState<number>(0);
  const [isPunching, setIsPunching] = useState<boolean>(false);
  const [actionSprite, setActionSprite] = useState<'idle' | 'attack' | 'happy'>('idle');
  const [roundResult, setRoundResult] = useState<{ text: string; isCrit: boolean } | null>(null);
  const [bagDented, setBagDented] = useState<boolean>(false);
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

  // Meter oscillation with delta-time normalization (brisk timing across 60Hz/90Hz/120Hz displays)
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

  const handleStartPunchTraining = () => {
    clearTrainingTimers();
    sound.playButton();
    setRound(1);
    setHits(0);
    setMeterVal(0);
    setRoundResult(null);
    setIsPunching(false);
    setActionSprite('idle');
    setBagDented(false);
    setBagHitState('idle');
    setActiveTab('punch');
  };

  const handleExecutePunch = () => {
    if (isPunching) return;
    clearTrainingTimers();
    setIsPunching(true);
    sound.playPunch();
    setActionSprite('attack');

    // Sweet spot is between 75 and 100
    const isSuccess = meterVal >= 75;
    if (isSuccess) {
      sound.playBlast();
      setHits((h) => h + 1);
      setRoundResult({ text: 'CRITICAL HIT! +1', isCrit: true });
      setBagDented(true);
      setBagHitState('critical');
    } else {
      setRoundResult({ text: 'MISS! Too weak!', isCrit: false });
      setBagDented(false);
      setBagHitState('weak');
    }
    setBagHitNonce((n) => n + 1);

    // Un-dent the bag after peak strike compression while pendulum keeps swinging
    const tDent = window.setTimeout(() => {
      setBagDented(false);
    }, 180);
    timersRef.current.push(tDent);

    const tRound = window.setTimeout(() => {
      setActionSprite('idle');
      setBagHitState('idle');
      if (round < 3) {
        setRound((r) => r + 1);
        setIsPunching(false);
        setRoundResult(null);
      } else {
        // Complete training
        const totalSuccess = hits + (isSuccess ? 1 : 0) >= 2;
        if (totalSuccess) {
          sound.playVictory();
          setActionSprite('happy');
        }
        const tDone = window.setTimeout(() => {
          onTrainingComplete(totalSuccess);
          setActiveTab('menu');
        }, 700);
        timersRef.current.push(tDone);
      }
    }, 650);
    timersRef.current.push(tRound);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-chakra font-bold text-white text-lg">
                DIGI-TRAINING DOJO
              </h3>
              <p className="text-slate-400 text-xs">Build Power, Burn Weight & Prepare for Evolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stats Mini Summary */}
        <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center font-pixel text-[10px]">
          <div>
            <div className="text-slate-400">DP POWER</div>
            <div className="text-cyan-400 font-bold text-xs mt-0.5">{pet.dpPoints} DP</div>
          </div>
          <div>
            <div className="text-slate-400">WEIGHT</div>
            <div className="text-amber-400 font-bold text-xs mt-0.5">{pet.weight}g</div>
          </div>
          <div>
            <div className="text-slate-400">TRAINED</div>
            <div className="text-emerald-400 font-bold text-xs mt-0.5">{pet.trainingCount}x</div>
          </div>
        </div>

        {/* Dojo Content */}
        {activeTab === 'menu' && (
          <div className="space-y-3 my-2">
            {/* Option 1: Classic V-Pet Punch Timing */}
            <div
              onClick={handleStartPunchTraining}
              className="p-4 bg-gradient-to-r from-slate-800/90 to-slate-800/50 hover:from-cyan-950/60 hover:to-slate-800 border border-slate-700 hover:border-cyan-500 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🥊
                </div>
                <div>
                  <h4 className="font-chakra font-bold text-white text-base">
                    TARGET PUNCH WORKOUT
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Classic Digivice timing game. Hit the sweet spot for 3 rounds!
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-pixel text-cyan-300">
                    <span>+15 DP</span>
                    <span>•</span>
                    <span>-2g WEIGHT</span>
                    <span>•</span>
                    <span>+25 BITS</span>
                  </div>
                </div>
              </div>
              <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-pixel text-[10px] px-3 py-2 rounded-xl font-bold">
                TRAIN
              </button>
            </div>

            {/* Option 2: Hellopet "I'm Hungry!" Mini-Game */}
            <div
              onClick={() => {
                onClose();
                onOpenFoodGame();
              }}
              className="p-4 bg-gradient-to-r from-slate-800/90 to-slate-800/50 hover:from-amber-950/60 hover:to-slate-800 border border-slate-700 hover:border-amber-500 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PixelMeatIcon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-chakra font-bold text-white text-base">
                    "I'M HUNGRY!" MEAT CATCH
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Catch falling Meat and Pills to build stock while dodging Bad Meat!
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-pixel text-amber-300">
                    <span>+MEAT</span>
                    <span>•</span>
                    <span>+VITAMINS</span>
                    <span>•</span>
                    <span>+COINS</span>
                  </div>
                </div>
              </div>
              <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-[10px] px-3 py-2 rounded-xl font-bold">
                PLAY
              </button>
            </div>
          </div>
        )}

        {/* Punch Timing Game View */}
        {activeTab === 'punch' && (
          <div className="flex flex-col items-center py-2">
            <div className="flex items-center justify-between w-full px-2 mb-2 font-pixel text-xs text-slate-300">
              <span>ROUND {round} / 3</span>
              <span>HITS: {hits}</span>
            </div>

            {/* Pixel Dojo Arena: Digimon vs Hanging Punching Bag */}
            <div className="relative w-full h-48 bg-[#2d3640] border-2 border-slate-700 rounded-2xl overflow-hidden shadow-inner">
              {/* Staggered Pixel Dojo Wall Blocks (matching classic Digimon gym stage) */}
              <svg
                viewBox="0 0 160 80"
                preserveAspectRatio="none"
                shapeRendering="crispEdges"
                className="absolute inset-0 w-full h-full opacity-55 pointer-events-none"
                aria-hidden="true"
              >
                <rect x="0" y="0" width="160" height="80" fill="#2d3640" />
                <rect x="0" y="10" width="38" height="8" fill="#1e252c" />
                <rect x="52" y="6" width="44" height="8" fill="#3c4754" />
                <rect x="112" y="14" width="48" height="8" fill="#1e252c" />
                <rect x="16" y="28" width="46" height="8" fill="#3c4754" />
                <rect x="82" y="34" width="52" height="8" fill="#1e252c" />
                <rect x="0" y="48" width="34" height="8" fill="#1e252c" />
                <rect x="56" y="52" width="42" height="8" fill="#3c4754" />
                <rect x="118" y="46" width="42" height="8" fill="#3c4754" />
                <rect x="0" y="66" width="160" height="14" fill="#1b2229" />
              </svg>

              {/* Compact Non-Blocking Critical Hit / Miss Badge (Top-Left, never hides Digimon or Bag) */}
              {roundResult && (
                <motion.div
                  key={`res-${round}-${bagHitNonce}`}
                  initial={{ y: 6, opacity: 0, scale: 0.85 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  className={`absolute top-2.5 left-3 z-30 pointer-events-none font-pixel text-[10px] px-2.5 py-1 rounded-lg font-bold shadow-lg border ${
                    roundResult.isCrit
                      ? 'bg-amber-400 text-slate-950 border-amber-200'
                      : 'bg-slate-800/95 text-rose-300 border-rose-500/60'
                  }`}
                >
                  {roundResult.text}
                </motion.div>
              )}

              {/* Fighting Stage Content */}
              <div className="relative z-10 w-full h-full flex items-end justify-center gap-4 pb-3 px-6">
                {/* Attacking Digimon on Left facing Bag */}
                <motion.div
                  animate={
                    isPunching
                      ? { x: bagHitState === 'critical' ? [0, 26, 20, 0] : [0, 12, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="mb-1"
                >
                  <DigimonSprite species={species} action={actionSprite} facing="right" scale={0.95} />
                </motion.div>

                {/* Hanging Leather Punching Bag from Ceiling Pulley */}
                <div className="self-start">
                  <PixelPunchingBag
                    dented={bagDented}
                    hitState={bagHitState}
                    hitNonce={bagHitNonce}
                    className="w-16"
                  />
                </div>
              </div>
            </div>

            {/* Power Meter Gauge */}
            <div className="w-full mt-4">
              <div className="flex justify-between text-[10px] font-pixel text-slate-400 mb-1">
                <span>POWER GAUGE</span>
                <span className="text-amber-400">TARGET: 75% - 100%</span>
              </div>
              <div className="relative w-full h-7 bg-slate-800 border-2 border-slate-600 rounded-full overflow-hidden">
                {/* Target Zone Highlight */}
                <div className="absolute right-0 top-0 bottom-0 w-[25%] bg-amber-400/40 border-l-2 border-amber-300 flex items-center justify-center font-pixel text-[8px] text-amber-200">
                  SWEET SPOT
                </div>
                {/* Active Moving Meter */}
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 transition-none"
                  style={{ width: `${meterVal}%` }}
                />
              </div>
            </div>

            {/* Tap Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isPunching}
              onClick={handleExecutePunch}
              className="mt-5 w-full bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-pixel text-sm py-4 rounded-2xl font-bold tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Flame className="w-5 h-5 fill-slate-950" />
              <span>STRIKE PUNCH!</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};
