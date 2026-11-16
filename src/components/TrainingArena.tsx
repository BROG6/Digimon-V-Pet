import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { DigimonSpecies, PetState } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
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
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const meterDirectionRef = useRef<number>(1);
  const meterLoopRef = useRef<number | null>(null);

  // Meter oscillation with delta-time normalization (consistent on 60Hz/90Hz/120Hz displays)
  useEffect(() => {
    if (activeTab !== 'punch' || isPunching || round > 3) return;

    let lastTime = performance.now();

    const animateMeter = (timestamp: number) => {
      const deltaMs = Math.min(50, Math.max(8, timestamp - lastTime));
      lastTime = timestamp;
      const step = (deltaMs / 16.667) * 1.5;

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
    sound.playButton();
    setRound(1);
    setHits(0);
    setMeterVal(0);
    setRoundResult(null);
    setIsPunching(false);
    setActiveTab('punch');
  };

  const handleExecutePunch = () => {
    if (isPunching) return;
    setIsPunching(true);
    sound.playPunch();
    setActionSprite('attack');

    // Sweet spot is between 75 and 100
    const isSuccess = meterVal >= 75;
    if (isSuccess) {
      sound.playBlast();
      setHits((h) => h + 1);
      setRoundResult('CRITICAL HIT! +1');
    } else {
      setRoundResult('MISS! Too weak!');
    }

    setTimeout(() => {
      setActionSprite('idle');
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
        setTimeout(() => {
          onTrainingComplete(totalSuccess);
          setActiveTab('menu');
        }, 1500);
      }
    }, 1200);
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
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🍖
                </div>
                <div>
                  <h4 className="font-chakra font-bold text-white text-base">
                    "I'M HUNGRY!" MEAT CATCH
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Hellopet puzzle challenge! Catch Big Meat and apples falling from above.
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-pixel text-amber-300">
                    <span>+MEAT STOCK</span>
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

            {/* Target Dummy & Digimon */}
            <div className="relative w-full h-44 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-around px-4 overflow-hidden">
              <DigimonSprite species={species} action={actionSprite} scale={0.9} />

              {/* Punch Bag / Dummy */}
              <div className="flex flex-col items-center">
                <div className="text-4xl filter drop-shadow-lg">🥊</div>
                <div className="w-12 h-2 bg-slate-800 rounded-full mt-2" />
              </div>

              {/* Impact Callout */}
              {roundResult && (
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    className="font-pixel text-xs px-4 py-2 bg-amber-400 text-slate-950 rounded-xl font-bold shadow-xl"
                  >
                    {roundResult}
                  </motion.div>
                </div>
              )}
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
