import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PetState, DigimonSpecies, DigiEggInfo, SpecialItemId, EvolutionArchetype } from '../types/digimon';
import { DIGIMON_DATABASE, SPECIAL_ITEMS } from '../data/digidex';
import { checkEvolutionEligibility } from '../utils/evolutionEngine';
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
  ShoppingBag
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
  onOpenShop?: () => void;
  onEquipSpecialItem?: (itemId: SpecialItemId | null) => void;
  onUpdatePlayerName?: (name: string) => void;
}

const ARCHETYPE_BADGE_MAP: Record<EvolutionArchetype, { label: string; cls: string }> = {
  vaccine: { label: 'VACCINE / HOLY', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  data: { label: 'DATA / TECH', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  virus: { label: 'VIRUS / BRAWLER', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  corrupted: { label: 'CORRUPTED / MUTANT', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  armor: { label: 'ARMOR EVOLUTION', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
};

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  pet,
  species,
  egg,
  onOpenTraining,
  onOpenColosseum,
  onOpenDigidex,
  onOpenShop,
  onEquipSpecialItem,
  onUpdatePlayerName,
}) => {
  const [activeTab, setActiveTab] = useState<'combat' | 'care' | 'evolution'>('combat');
  const [isEditingTamer, setIsEditingTamer] = useState<boolean>(false);
  const [draftTamer, setDraftTamer] = useState<string>(pet.playerName || '');

  if (!isOpen) return null;

  // Calculate age in days / hours
  const ageMs = Date.now() - (pet.birthTimestamp || Date.now());
  const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
  const ageDays = Math.floor(ageHours / 24);
  const ageString = ageDays > 0 ? `${ageDays}d ${ageHours % 24}h` : `${Math.max(1, ageHours)}h`;

  // Win rate (overall)
  const winRate = pet.battlesTotal > 0 
    ? Math.round((pet.battlesWon / pet.battlesTotal) * 100) 
    : 0;

  // V-Pet Raise Archetype Engine
  const evoElig = checkEvolutionEligibility(pet, species);
  const predictedSpecies = evoElig.nextId ? DIGIMON_DATABASE[evoElig.nextId] : undefined;
  const archetypeBadge = ARCHETYPE_BADGE_MAP[evoElig.archetype];
  const ownedItems = pet.ownedSpecialItems || [];
  const equippedItem = pet.equippedSpecialItem ? SPECIAL_ITEMS[pet.equippedSpecialItem] : null;
  const stageTrainingCount = typeof pet.stageTrainingCount === 'number' ? pet.stageTrainingCount : pet.trainingCount;

  // Attack boost from training
  const trainingAtkBonus = Math.floor(pet.trainingCount * 2);
  const totalAtk = (species?.baseAtk || 20) + trainingAtkBonus;
  const totalHp = species?.baseHp || 100;
  const totalDef = species?.baseDef || 15;
  const totalSpd = species?.baseSpd || 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md font-display android-safe-modal">
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
              <p className="text-slate-400 text-xs">Full Diagnostic, Matrix Archetype & Battle Profile</p>
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
                EGG: {egg?.crestName || 'Dragon / Fire'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300">
                ATTR: {species?.attribute || 'Data'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300">
                TYPE: {species?.type || 'Monster'}
              </span>
              {onUpdatePlayerName && !isEditingTamer && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playButton();
                    setDraftTamer(pet.playerName || '');
                    setIsEditingTamer(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 cursor-pointer"
                >
                  TAMER: {pet.playerName?.trim() ? pet.playerName : 'SET YOUR NAME ✎'}
                </button>
              )}
            </div>

            {isEditingTamer && onUpdatePlayerName && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sound.playButton();
                  onUpdatePlayerName(draftTamer.trim());
                  setIsEditingTamer(false);
                }}
                className="flex items-center justify-center sm:justify-start gap-1.5"
              >
                <input
                  type="text"
                  value={draftTamer}
                  onChange={(e) => setDraftTamer(e.target.value)}
                  maxLength={20}
                  placeholder="Enter your name..."
                  className="bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-pixel text-[9px] font-bold cursor-pointer"
                >
                  SAVE
                </button>
              </form>
            )}

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {species?.description || 'A mysterious Digi-Egg waiting to hatch and begin its journey.'}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('combat');
            }}
            className={`px-3 py-1.5 rounded-xl font-pixel text-xs transition-all flex items-center gap-1.5 shrink-0 ${
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
            className={`px-3 py-1.5 rounded-xl font-pixel text-xs transition-all flex items-center gap-1.5 shrink-0 ${
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
            className={`px-3 py-1.5 rounded-xl font-pixel text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'evolution'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>EVO & ARCHETYPE</span>
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
                <div className="text-[9px] text-slate-400">Feed Big Meat (+2g) to raise Weight Class</div>
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
                <div className="text-[10px] font-pixel text-slate-400">WEIGHT / CLASS</div>
                <div className="font-chakra font-bold text-white text-base mt-0.5">
                  {pet.weight}g{' '}
                  <span className="text-[10px] font-pixel text-amber-300">({evoElig.weightClass})</span>
                </div>
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

        {/* TAB 3: EVOLUTION, RAISE ARCHETYPE & SPECIAL ITEMS */}
        {activeTab === 'evolution' && (
          <div className="py-4 space-y-4">
            {/* Raise Archetype Telemetry Grid */}
            <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-pixel text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  RAISE ARCHETYPE TELEMETRY
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-pixel border ${archetypeBadge.cls}`}>
                  {archetypeBadge.label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[9px] font-pixel text-slate-400">CARE MISTAKES (CM)</div>
                  <div className={`font-chakra font-bold text-base mt-0.5 ${pet.careMistakes <= 1 ? 'text-emerald-400' : pet.careMistakes >= 3 ? 'text-purple-400' : 'text-amber-400'}`}>
                    {pet.careMistakes}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[9px] font-pixel text-slate-400">EFFORT (EF)</div>
                  <div className="font-chakra font-bold text-cyan-300 text-base mt-0.5">
                    {evoElig.effort} / 10
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${evoElig.effort * 10}%` }} />
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[9px] font-pixel text-slate-400">STAGE BATTLES</div>
                  <div className="font-chakra font-bold text-amber-300 text-base mt-0.5">
                    {evoElig.stageWins}/{evoElig.stageBattles} ({evoElig.winRate}%)
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[9px] font-pixel text-slate-400">WEIGHT CLASS (WT)</div>
                  <div className="font-chakra font-bold text-white text-base mt-0.5">
                    {evoElig.weightClass} ({pet.weight}g)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800/80 text-[10px]">
                <div>
                  <span className="text-slate-500 font-pixel">LIFETIME WINS:</span>{' '}
                  <span className="text-emerald-400 font-bold">{pet.battlesWon}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-pixel">TOTAL MATCHES:</span>{' '}
                  <span className="text-white font-bold">{pet.battlesTotal}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-pixel">OVERALL WR:</span>{' '}
                  <span className="text-amber-400 font-bold">{winRate}%</span>
                </div>
              </div>
            </div>

            {/* Special Item (SP) Equipment Slot */}
            <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-pixel text-amber-300">
                  SPECIAL ITEM SLOT (SP — ARMOR EVOLUTION)
                </div>
                {onOpenShop && (
                  <button
                    onClick={() => {
                      sound.playButton();
                      onClose();
                      onOpenShop();
                    }}
                    className="text-[9px] font-pixel px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>RELIC SHOP</span>
                  </button>
                )}
              </div>

              {equippedItem ? (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{equippedItem.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-chakra font-bold text-amber-200 truncate">
                        Equipped: {equippedItem.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {equippedItem.eggId === pet.eggId
                          ? 'Matches current Egg! Triggers Armor Evolution at Rookie stage.'
                          : 'Note: Relic resonates with another Digi-Egg line.'}
                      </div>
                    </div>
                  </div>
                  {onEquipSpecialItem && (
                    <button
                      onClick={() => {
                        sound.playButton();
                        onEquipSpecialItem(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-pixel shrink-0 cursor-pointer"
                    >
                      UNEQUIP
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 font-chakra">
                  No Relic equipped — your Digimon evolves naturally using the 4-way Care/Battle/Effort matrix.
                </div>
              )}

              {ownedItems.length > 0 && onEquipSpecialItem && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ownedItems.map((itemId) => {
                    const info = SPECIAL_ITEMS[itemId];
                    if (!info) return null;
                    const isEq = pet.equippedSpecialItem === itemId;
                    const matchesEgg = info.eggId === pet.eggId;
                    return (
                      <button
                        key={itemId}
                        onClick={() => {
                          sound.playButton();
                          onEquipSpecialItem(isEq ? null : itemId);
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-pixel flex items-center gap-1 cursor-pointer transition-all ${
                          isEq
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                            : matchesEgg
                            ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <span>{info.icon}</span>
                        <span>{info.shortName}</span>
                        {isEq && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Next Evolution Pathway & Forecast */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-pixel">
                <span className="text-cyan-400">PREDICTED DIGIVOLUTION</span>
                <span className="text-slate-400 uppercase">CURRENT: {pet.stage}</span>
              </div>

              {predictedSpecies ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      <DigimonSprite species={predictedSpecies} action="idle" scale={0.55} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-chakra font-bold text-white text-base">
                          {predictedSpecies.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-pixel bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                          {predictedSpecies.stage}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-pixel border ${archetypeBadge.cls}`}>
                          {archetypeBadge.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-300 font-chakra mt-0.5">
                        {evoElig.reason}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-pixel text-slate-400">
                    <div className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span>🥊 Stage Dojo / Effort:</span>
                      <span className={stageTrainingCount >= evoElig.minTraining || evoElig.effort >= evoElig.minEffort ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {stageTrainingCount}/{evoElig.minTraining} (EF {evoElig.effort}/{evoElig.minEffort || 10})
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span>⚔️ Stage Wins Target:</span>
                      <span className={evoElig.stageWins >= evoElig.minBattles ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {evoElig.stageWins} / {evoElig.minBattles}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-amber-300 font-chakra">
                  👑 Maximum Ultimate (Mega) Stage Reached! Your Digimon stands at the pinnacle of its Matrix!
                </div>
              )}

              {/* Archetype Matrix Quick Rules Reference */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-chakra text-slate-400">
                <div><span className="text-sky-300 font-bold">Vaccine:</span> CM ≤ 1, EF ≥ 6, WR ≥ 60%</div>
                <div><span className="text-emerald-300 font-bold">Data:</span> CM ≤ 1, EF ≥ 8, WT = Normal</div>
                <div><span className="text-rose-300 font-bold">Virus:</span> CM 1–2, TB ≥ 12, WT = Heavy</div>
                <div><span className="text-purple-300 font-bold">Corrupted:</span> CM ≥ 3 (or CM ≥ 2 &amp; WR &lt; 40%)</div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-2 pt-1">
              {onOpenTraining && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenTraining();
                  }}
                  className="flex-1 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-pixel flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                  className="flex-1 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-pixel flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                  className="flex-1 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-xs font-pixel flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

