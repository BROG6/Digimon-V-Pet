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
import { GymStationScene } from './GymStationScene';
import { sound } from '../utils/audio';
import { Dumbbell, X, Flame, Check, Lock, Swords } from 'lucide-react';

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

            <GymStationScene
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
