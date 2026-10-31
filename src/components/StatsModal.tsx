import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetState, DigimonSpecies, DigiEggInfo } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { 
  X, 
  Activity, 
  Shield, 
  Zap, 
  Flame, 
  Trophy, 
  Heart, 
  Sparkles, 
  Dumbbell, 
  Award, 
  Scale, 
  Clock, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { sound } from '../utils/audio';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetState;
  species?: DigimonSpecies;
  egg?: DigiEggInfo;
  onOpenTraining?: () => void;
  onOpenColosseum?: () => void;
  onOpenDigidex?: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  pet,
  species,
  egg,
  onOpenTraining,
  onOpenColosseum,
  onOpenDigidex,
}) => {
  const [activeTab, setActiveTab] = useState<'combat' | 'care' | 'evolution'>('combat');

  if (!isOpen) return null;

  // Calculate age in days / hours
  const ageMs = Date.now() - (pet.birthTimestamp || Date.now());
  const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
  const ageDays = Math.floor(ageHours / 24);
  const ageString = ageDays > 0 ? `${ageDays}d ${ageHours % 24}h` : `${Math.max(1, ageHours)}h`;

  // Win rate
  const winRate = pet.battlesTotal > 0 
    ? Math.round((pet.battlesWon / pet.battlesTotal) * 100) 
    : 0;

  // Next evolution info
  const nextEvo = species?.nextEvolutions && species.nextEvolutions.length > 0 
    ? species.nextEvolutions[0] 
    : null;

  // Attack boost from training
  const trainingAtkBonus = Math.floor(pet.trainingCount * 2);
  const totalAtk = (species?.baseAtk || 20) + trainingAtkBonus;
  const totalHp = species?.baseHp || 100;
  const totalDef = species?.baseDef || 15;
  const totalSpd = species?.baseSpd || 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md font-display">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-chakra font-bold text-white text-lg tracking-wide">
                  DIGIMON STATUS & STATS
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-pixel text-[9px] border border-amber-500/40 uppercase">
                  {pet.stage}
                </span>
              </div>
              <p className="text-slate-400 text-xs">Full Diagnostic & Battle Performance Profile</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Card: Animated Sprite & Key Identity */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-radial from-slate-800/80 to-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden shadow-inner shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />
            <DigimonSprite
              species={species}
              egg={pet.stage === 'egg' ? egg : undefined}
              action="idle"
              scale={0.9}
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-chakra font-bold text-white text-xl">
                {pet.nickname}
              </h2>
              {species && (
                <span className="text-xs text-slate-400 font-chakra">
                  ({species.name} / {species.japaneseName})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] font-pixel">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
                CREST: {egg?.crestName || 'Courage'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300">
                ATTR: {species?.attribute || 'Data'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300">
                TYPE: {species?.type || 'Monster'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {species?.description || 'A mysterious Digi-Egg waiting to hatch and begin its journey.'}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('combat');
            }}
            className={`px-3 py-1.5 rounded-xl font-pixel text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'combat'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>COMBAT STATS</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('care');
            }}
            className={`px-3 py-1.5 rounded-xl font-pixel text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'care'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>V-PET CARE METRICS</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('evolution');
            }}
            className={`px-3 py-1.5 rounded-xl font-pixel text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'evolution'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>EVO & RECORDS</span>
          </button>
        </div>

        {/* TAB 1: COMBAT STATS */}
        {activeTab === 'combat' && (
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* HP Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> MAX HEALTH (HP)
                  </span>
                  <span className="text-white font-bold">{totalHp} HP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${Math.min(100, (totalHp / 700) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">Total stamina in digital colosseum clashes</div>
              </div>

              {/* Attack Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className="text-rose-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> ATTACK POWER (ATK)
                  </span>
                  <span className="text-white font-bold">
                    {totalAtk}
                    {trainingAtkBonus > 0 && (
                      <span className="text-amber-400 text-[10px] ml-1">(+{trainingAtkBonus})</span>
                    )}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full"
                    style={{ width: `${Math.min(100, (totalAtk / 260) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">Physical & elemental offensive strike output</div>
              </div>

              {/* Defense Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className="text-blue-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> DEFENSE ARMOR (DEF)
                  </span>
                  <span className="text-white font-bold">{totalDef}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, (totalDef / 220) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">Damage reduction and armor hardness</div>
              </div>

              {/* Speed Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> AGILITY & SPEED (SPD)
                  </span>
                  <span className="text-white font-bold">{totalSpd}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                    style={{ width: `${Math.min(100, (totalSpd / 200) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">Turn order priority and evasion capability</div>
              </div>
            </div>

            {/* Signature Move Showcase */}
            {species?.signatureMove && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-950/80 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="font-chakra font-bold text-white text-sm">
                      SIGNATURE MOVE: {species.signatureMove.name}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-pixel text-[9px] border border-orange-500/40 uppercase">
                    POWER {species.signatureMove.power}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-chakra">
                  {species.signatureMove.description}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-pixel text-slate-400 pt-1">
                  <span>ELEMENT: {species.signatureMove.type.toUpperCase()}</span>
                  <span>•</span>
                  <span>SFX: {species.signatureMove.soundType.toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: V-PET CARE METRICS */}
        {activeTab === 'care' && (
          <div className="py-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Hunger */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-pixel">
                  <span className="text-amber-400">HUNGER SATIATION</span>
                  <span>{pet.hunger}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${pet.hunger}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-400">Feed Big Meat to maintain vitality</div>
              </div>

              {/* Energy */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-pixel">
                  <span className="text-cyan-400">STAMINA & ENERGY</span>
                  <span>{pet.energy}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${pet.energy}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-400">Turn lights off to rest and recharge</div>
              </div>

              {/* Happiness */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-pixel">
                  <span className="text-rose-400">HAPPINESS LEVEL</span>
                  <span>{pet.happiness}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-rose-400 rounded-full"
                    style={{ width: `${pet.happiness}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-400">Praise, pet, and play mini-games to raise</div>
              </div>

              {/* Discipline */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-pixel">
                  <span className="text-purple-400">DISCIPLINE QUOTIENT</span>
                  <span>{pet.discipline}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${pet.discipline}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-400">Trained reflexes and obedience</div>
              </div>
            </div>

            {/* Vitality Summary Stats */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-[10px] font-pixel text-slate-400">WEIGHT</div>
                <div className="font-chakra font-bold text-white text-base mt-0.5">{pet.weight}g</div>
              </div>
              <div>
                <div className="text-[10px] font-pixel text-slate-400">AGE (DAYS)</div>
                <div className="font-chakra font-bold text-cyan-400 text-base mt-0.5">{ageString}</div>
              </div>
              <div>
                <div className="text-[10px] font-pixel text-slate-400">CARE MISTAKES</div>
                <div className="font-chakra font-bold text-rose-400 text-base mt-0.5">{pet.careMistakes}</div>
              </div>
              <div>
                <div className="text-[10px] font-pixel text-slate-400">HEALTH STATUS</div>
                <div className="font-chakra font-bold text-emerald-400 text-base mt-0.5">
                  {pet.isSick ? '☠️ SICK' : pet.isSleeping ? '💤 SLEEP' : '✓ HEALTHY'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EVOLUTION & BATTLE RECORDS */}
        {activeTab === 'evolution' && (
          <div className="py-4 space-y-4">
            {/* Battle Records Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-pixel text-slate-400">BATTLES WON</div>
                <div className="font-chakra font-bold text-emerald-400 text-lg mt-0.5">{pet.battlesWon}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-pixel text-slate-400">TOTAL MATCHES</div>
                <div className="font-chakra font-bold text-white text-lg mt-0.5">{pet.battlesTotal}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-pixel text-slate-400">WIN RATE</div>
                <div className="font-chakra font-bold text-amber-400 text-lg mt-0.5">{winRate}%</div>
              </div>
            </div>

            {/* Next Evolution Targets */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-pixel">
                <span className="text-cyan-400">DIGIVOLUTION PATHWAY</span>
                <span className="text-slate-400 uppercase">CURRENT: {pet.stage}</span>
              </div>

              {nextEvo ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-300 font-chakra">
                    Next Target: <span className="font-bold text-white capitalize">{nextEvo.speciesId}</span> ({nextEvo.requiredStage.toUpperCase()})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-pixel text-slate-400">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span>🥊 Training Target:</span>
                      <span className={pet.trainingCount >= (nextEvo.minTraining || 0) ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {pet.trainingCount} / {nextEvo.minTraining || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span>⚔️ Battle Target:</span>
                      <span className={pet.battlesWon >= (nextEvo.minBattles || 0) ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {pet.battlesWon} / {nextEvo.minBattles || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-amber-300 font-chakra">
                  👑 Maximum Mega Stage Reached! Your Digimon stands as the supreme Dragon Warrior!
                </div>
              )}
            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-2 pt-1">
              {onOpenTraining && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenTraining();
                  }}
                  className="flex-1 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-pixel flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>GO TO DOJO</span>
                </button>
              )}

              {onOpenColosseum && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenColosseum();
                  }}
                  className="flex-1 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-pixel flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>COLOSSEUM</span>
                </button>
              )}

              {onOpenDigidex && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDigidex();
                  }}
                  className="flex-1 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-xs font-pixel flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>DIGIDEX</span>
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
