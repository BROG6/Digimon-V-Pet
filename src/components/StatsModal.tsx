import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PetState, DigimonSpecies, DigiEggInfo, SpecialItemId } from '../types/digimon';
import { DIGIMON_DATABASE, SPECIAL_ITEMS } from '../data/digidex';
import {
  checkEvolutionEligibility,
  computeNaturalEvoTiming,
  CoreBranchArchetype,
  evaluateBranchReadiness,
  formatDurationMs,
  getStageBranchRequirements,
} from '../utils/evolutionEngine';
import {
  formatBedtimeLabel,
  getEffectivePetCurrentHp,
  getStageHungerHeartMs,
  getStagePoopIntervalMs,
} from '../utils/carePacing';
import {
  ATTACK_ELEMENT_META,
  BATTLE_TECHNIQUE_CATALOG,
  MAX_EQUIPPED_ATTACKS,
  getEffectiveBattleStats,
  getEquippedBattleMoves,
  getLearnedTechniqueIds,
  getSpeciesElementType,
} from '../data/battleTechniques';
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
  Brain,
  Droplets,
  Check,
  Swords,
  History,
} from 'lucide-react';
import { computeTamerRankProgress } from '../utils/tamerRank';
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
  onOpenTamerRank?: () => void;
  onEquipSpecialItem?: (itemId: SpecialItemId | null) => void;
  onToggleEquipAttack?: (moveId: string) => void;
  onUpdatePlayerName?: (name: string) => void;
  onUpdateNickname?: (nickname: string) => void;
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
  onOpenTamerRank,
  onEquipSpecialItem,
  onToggleEquipAttack,
  onUpdatePlayerName,
  onUpdateNickname,
}) => {
  const [activeTab, setActiveTab] = useState<'combat' | 'care' | 'evolution'>('combat');
  const [isEditingTamer, setIsEditingTamer] = useState<boolean>(false);
  const [draftTamer, setDraftTamer] = useState<string>(pet.playerName || '');
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [draftNickname, setDraftNickname] = useState<string>(pet.nickname || '');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!isOpen) return;
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate age in days / hours
  const ageMs = (pet.isDead && pet.diedAt ? pet.diedAt : nowMs) - (pet.birthTimestamp || nowMs);
  const ageHours = Math.floor(Math.max(0, ageMs) / (1000 * 60 * 60));
  const ageDays = Math.floor(ageHours / 24);
  const ageString = ageDays > 0 ? `${ageDays}d ${ageHours % 24}h` : `${Math.max(0, ageHours)}h`;

  // Win rate (overall)
  const winRate = pet.battlesTotal > 0 
    ? Math.round((pet.battlesWon / pet.battlesTotal) * 100) 
    : 0;

  // V-Pet Raise Archetype Engine (Pendulum Ver. 20th)
  const evoElig = checkEvolutionEligibility(pet, species);
  const evoTiming = computeNaturalEvoTiming(pet, species, nowMs);
  const ownedItems = pet.ownedSpecialItems || [];
  const equippedItem = pet.equippedSpecialItem ? SPECIAL_ITEMS[pet.equippedSpecialItem] : null;
  const tamerRank = computeTamerRankProgress(pet);

  // Attack & 6-Stat RPG Profile (Digimon World: Next Order)
  const rpgStats = getEffectiveBattleStats(pet, species);
  const speciesElement = getSpeciesElementType(species);
  const elementMeta = ATTACK_ELEMENT_META[speciesElement];
  const learnedIds = getLearnedTechniqueIds(pet, species);
  const equippedMoves = getEquippedBattleMoves(pet, species);
  const equippedIdSet = new Set(equippedMoves.map((m) => m.id));
  const totalHp = rpgStats.maxHp;
  const currentHp = getEffectivePetCurrentHp(pet, totalHp);
  const hpPct = totalHp > 0 ? Math.min(100, Math.round((currentHp / totalHp) * 100)) : 100;
  const totalMp = rpgStats.maxMp;
  const totalAtk = rpgStats.offense;
  const totalDef = rpgStats.defense;
  const totalSpd = rpgStats.speed;
  const totalBrains = rpgStats.brains;

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
              species={pet.isDead || pet.stage === 'egg' ? undefined : species}
              egg={pet.stage === 'egg' ? egg : undefined}
              pose={pet.isDead ? 'dead' : undefined}
              action="idle"
              scale={0.9}
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-chakra font-bold text-white text-xl">
                {pet.stage === 'egg'
                  ? pet.nickname?.trim() || 'Digitama'
                  : pet.nickname?.trim() || species?.name || 'Digimon'}
              </h2>
              {species && pet.stage !== 'egg' && (
                <span className="text-xs text-slate-400 font-chakra">
                  ({species.name} / {species.japaneseName})
                </span>
              )}
              {onUpdateNickname && !isEditingNickname && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playButton();
                    setDraftNickname(pet.nickname || '');
                    setIsEditingNickname(true);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-[10px] font-pixel cursor-pointer"
                >
                  {pet.nickname?.trim() ? 'RENAME ✎' : 'NICKNAME ✎'}
                </button>
              )}
            </div>

            {isEditingNickname && onUpdateNickname && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sound.playButton();
                  onUpdateNickname(draftNickname.trim());
                  setIsEditingNickname(false);
                }}
                className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5"
              >
                <input
                  type="text"
                  value={draftNickname}
                  onChange={(e) => setDraftNickname(e.target.value)}
                  maxLength={14}
                  placeholder={`Default (${species?.name || 'Digimon'})`}
                  className="bg-slate-900 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-pixel text-[9px] font-bold cursor-pointer"
                >
                  SAVE
                </button>
                {draftNickname && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playButton();
                      onUpdateNickname('');
                      setDraftNickname('');
                      setIsEditingNickname(false);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-pixel text-[9px] cursor-pointer"
                  >
                    USE DEFAULT
                  </button>
                )}
              </form>
            )}

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
              {pet.isDead
                ? `Memorial Record: ${pet.deathReason || 'Passed away due to severe neglect.'}`
                : pet.stage === 'egg'
                ? 'A mysterious Digitama warming up on your Digivice! It will hatch in 1 minute.'
                : species?.description || 'A mysterious Digi-Egg waiting to hatch and begin its journey.'}
            </p>

            {/* Tamer Rank Progression Strip */}
            <div
              className={`p-2.5 rounded-xl border ${tamerRank.currentTier.borderClass} ${tamerRank.currentTier.bgClass} flex flex-wrap items-center justify-between gap-2 text-left`}
            >
              <div className="min-w-0">
                <div className={`font-chakra font-bold text-sm flex items-center gap-1.5 ${tamerRank.currentTier.accentClass}`}>
                  <span>{tamerRank.badge}</span>
                  <span>
                    Rank {tamerRank.rank} · {tamerRank.title}
                  </span>
                </div>
                <div className="font-chakra text-[11px] text-slate-300 tabular-nums">
                  {tamerRank.battlesWon} Battles Won · {tamerRank.zonesCleared}/{tamerRank.totalZones} Zones Cleared ·{' '}
                  {tamerRank.nextTier
                    ? `${tamerRank.pointsToNext} pts to Rank ${tamerRank.nextTier.rank}`
                    : 'Max Rank'}
                </div>
              </div>
              {onOpenTamerRank && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playButton();
                    onClose();
                    onOpenTamerRank();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-amber-400/40 text-amber-300 font-pixel text-[9px] cursor-pointer shrink-0"
                >
                  VIEW RANKS »
                </button>
              )}
            </div>
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
            {/* Elemental Affinity Summary */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-chakra">
              <div>
                <span className="text-slate-400">Elemental Type: </span>
                <span className="font-bold text-white">{elementMeta.label}</span>
              </div>
              <div className="text-slate-300">
                <span>1.5x Strong vs: <strong className="text-emerald-300">{elementMeta.beatsLabel}</strong></span>
                {elementMeta.weaknessLabel !== 'None' && (
                  <span> · Weak vs: <strong className="text-rose-300">{elementMeta.weaknessLabel}</strong></span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 tabular-nums">
              {/* HP Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className={`flex items-center gap-1 ${hpPct <= 25 ? 'text-rose-400' : hpPct <= 55 ? 'text-amber-300' : 'text-emerald-400'}`}>
                    <Heart className="w-3.5 h-3.5" /> HP (BOULDER)
                  </span>
                  <span className="text-white font-bold">
                    <span className={hpPct <= 25 ? 'text-rose-300' : hpPct <= 55 ? 'text-amber-200' : 'text-emerald-300'}>
                      {currentHp}
                    </span>
                    <span className="text-slate-400"> / {totalHp}</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      hpPct <= 25
                        ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                        : hpPct <= 55
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
                {currentHp < totalHp && (
                  <p className="text-[10px] font-chakra text-slate-400">
                    {currentHp === 0
                      ? 'Knocked out — use a Recovery Disk or rest outside battle to recover HP.'
                      : 'Regenerates slowly outside battle (2x faster while sleeping).'}
                  </p>
                )}
              </div>

              {/* MP Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className="text-cyan-300 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" /> MAX MP (WATERFALL)
                  </span>
                  <span className="text-white font-bold">{totalMp}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
                    style={{ width: `${Math.min(100, (totalMp / 300) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Offense Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className="text-rose-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> OFFENSE (TREE)
                  </span>
                  <span className="text-white font-bold">{totalAtk}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full"
                    style={{ width: `${Math.min(100, (totalAtk / 260) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Defense Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className="text-blue-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> DEFENSE (GLOVE)
                  </span>
                  <span className="text-white font-bold">{totalDef}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, (totalDef / 220) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Speed Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> SPEED (TRACK)
                  </span>
                  <span className="text-white font-bold">{totalSpd}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                    style={{ width: `${Math.min(100, (totalSpd / 200) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Brains Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-pixel">
                  <span className="text-violet-400 flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" /> BRAINS (BLACKBOARD)
                  </span>
                  <span className="text-white font-bold">{totalBrains}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full"
                    style={{ width: `${Math.min(100, (totalBrains / 160) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Signature Move Showcase */}
            {species?.signatureMove && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-950/80 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="font-chakra font-bold text-white text-sm truncate">
                      Signature Move: {species.signatureMove.name}
                    </span>
                  </div>
                  <span className="text-orange-300 font-chakra font-bold text-xs shrink-0 tabular-nums">
                    Power {species.signatureMove.power} · {elementMeta.shortLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-chakra">
                  {species.signatureMove.description}
                </p>
              </div>
            )}

            {/* Learned & Equipped Extra Techniques (Max 4) */}
            <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-chakra font-bold text-cyan-300">
                  Evolution-Line Techniques ({learnedIds.length} Learned · {equippedMoves.length}/{MAX_EQUIPPED_ATTACKS} Equipped)
                </span>
                {onOpenTraining && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTraining();
                    }}
                    className="text-xs font-chakra font-semibold text-amber-300 hover:underline cursor-pointer"
                  >
                    Train Brains in Dojo »
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {learnedIds.map((id) => {
                  const tech = BATTLE_TECHNIQUE_CATALOG.find((m) => m.id === id);
                  if (!tech) return null;
                  const isEq = equippedIdSet.has(tech.id);
                  const canEquipMore = equippedMoves.length < MAX_EQUIPPED_ATTACKS;
                  const techMeta = ATTACK_ELEMENT_META[tech.element];
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      disabled={!onToggleEquipAttack || (!isEq && !canEquipMore)}
                      onClick={() => {
                        sound.playButton();
                        onToggleEquipAttack?.(tech.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer disabled:opacity-55 ${
                        isEq
                          ? 'bg-amber-950/40 border-amber-400/60 text-white'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-chakra font-bold text-xs truncate">{tech.name}</div>
                        <div className="text-[10px] font-chakra text-slate-400">
                          {techMeta.shortLabel} · {tech.power}P · {tech.mpCost} MP
                        </div>
                      </div>
                      {isEq ? (
                        <Check className="w-4 h-4 text-amber-300 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-chakra text-slate-400 shrink-0">
                          {canEquipMore ? 'Equip' : 'Full'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 font-chakra">
                Digimon start with 1 attack and learn more from their evolution line by training Brains at the Blackboard.
              </p>
            </div>

            {/* Battle Log (Last 10 Results) */}
            <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-pixel text-amber-300">
                    BATTLE LOG
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-lg border font-pixel text-[9px] tabular-nums flex items-center gap-1 ${
                      (pet.currentWinStreak ?? 0) > 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Flame className="w-3 h-3 shrink-0" />
                    <span>WIN STREAK: {pet.currentWinStreak ?? 0}</span>
                  </span>
                  <span className="text-[10px] font-chakra font-semibold text-slate-400 tabular-nums">
                    Last {(pet.battleHistory || []).slice(0, 10).length}/10 Matches
                  </span>
                </div>
              </div>

              {(!pet.battleHistory || pet.battleHistory.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 border-dashed text-center text-xs font-chakra text-slate-400">
                  No battle results recorded yet. Challenge rivals in the Colosseum or Adventure Zones to populate your Battle Log!
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
                  {pet.battleHistory.slice(0, 10).map((entry) => {
                    const oppSpecies = entry.opponentSpeciesId
                      ? DIGIMON_DATABASE[entry.opponentSpeciesId]
                      : undefined;
                    const isWin = entry.outcome === 'win';
                    const formattedDate = new Intl.DateTimeFormat(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(entry.timestamp));

                    return (
                      <div
                        key={entry.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                          isWin
                            ? 'bg-emerald-950/20 border-emerald-500/25'
                            : 'bg-rose-950/20 border-rose-500/25'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                            {oppSpecies ? (
                              <DigimonSprite species={oppSpecies} action="idle" scale={0.34} />
                            ) : (
                              <Swords className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-chakra font-bold text-white text-xs sm:text-sm truncate">
                                vs {entry.opponentName}
                              </span>
                              {entry.mode && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 font-pixel text-[8px] uppercase shrink-0">
                                  {entry.mode === 'adventure' ? 'ADV' : 'COL'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-chakra text-slate-400 tabular-nums truncate">
                              {formattedDate}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg font-pixel text-[9px] font-bold uppercase shrink-0 border ${
                            isWin
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {isWin ? 'VICTORY' : 'DEFEAT'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                <div className="text-[9px] text-slate-400">Regenerates slowly over time · Sleep recharges faster</div>
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
                <div className="text-[9px] text-slate-400">
                  Trained obedience (+Gym / +Petting / -Overfeeding · Used by higher evolutions)
                </div>
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
                <div className={`font-chakra font-bold text-base mt-0.5 ${pet.careMistakes >= 6 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
                  {pet.careMistakes} / 8
                </div>
              </div>
              <div>
                <div className="text-[10px] font-pixel text-slate-400">HEALTH STATUS</div>
                <div className={`font-chakra font-bold text-base mt-0.5 ${pet.isDead ? 'text-rose-400' : pet.isSick ? 'text-purple-400' : 'text-emerald-400'}`}>
                  {pet.isDead ? '🪦 R.I.P.' : pet.isSick ? '☠️ SICK' : pet.isSleeping ? '💤 SLEEP' : '✓ HEALTHY'}
                </div>
              </div>
            </div>

            {pet.stage !== 'egg' && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs font-chakra text-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <strong className="text-amber-300">Hunger:</strong> -1 heart /{' '}
                    {Math.round(getStageHungerHeartMs(pet.stage) / 60_000)}m
                  </span>
                  <span>
                    <strong className="text-cyan-300">Toilet:</strong> every{' '}
                    {Math.round(getStagePoopIntervalMs(pet.stage) / 60_000)}m (pauses overnight · 4 piles = Sickness + 1 CM)
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300">
                  <span>
                    <strong className="text-indigo-300">Bedtime Schedule:</strong>{' '}
                    {formatBedtimeLabel(pet.stage)}
                  </span>
                  <span className="text-slate-400">10m Call Light grace on Empty Hunger / Bedtime</span>
                </div>
              </div>
            )}
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
                  RAISE TELEMETRY
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-pixel border bg-slate-800/80 text-slate-300 border-slate-700">
                  EVOLUTION: ???
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
                <span className="text-[9px] font-pixel text-cyan-300/80">
                  ADVENTURE BOSS REWARDS
                </span>
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

            {/* Pendulum Ver. 20th Evolution Timer & Forecast */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-pixel">
                <span className="text-cyan-400">PENDULUM VER. 20TH EVOLUTION</span>
                <span className="text-slate-400 uppercase">CURRENT: {pet.stage}</span>
              </div>

              {pet.isDead ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-center text-xs text-rose-200 font-chakra">
                  🪦 {pet.deathReason || 'Digimon passed away from excessive neglect.'} Hatch a new Digi-Egg to start over.
                </div>
              ) : pet.evolutionLocked ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-center text-xs text-rose-200 font-chakra space-y-1">
                  <div className="font-pixel text-[10px] text-rose-300">🔒 EVOLUTION LOCKED</div>
                  <p>
                    The Pendulum Ver. 20th timer expired before evolution tree requirements were met. This Digimon can no longer evolve in this lifetime.
                  </p>
                </div>
              ) : pet.stage === 'mega' ? (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-amber-300 font-chakra">
                  👑 Maximum Ultimate (Mega) Stage Reached! Your Digimon stands at the pinnacle of its Matrix!
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Timer Window Status Banner (Unknown Outcome) */}
                  <div className="p-3 rounded-xl border border-cyan-500/35 bg-slate-900/90 text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs font-chakra">
                      <div className="font-pixel text-[10px] text-cyan-300">
                        PENDULUM VER. 20TH WINDOW
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {pet.stage === 'egg' || pet.stage === 'fresh'
                          ? 'Advances automatically when timer reaches 0 (keeps ticking during sleep).'
                          : 'Keeps ticking during sleep. Your resulting evolution remains a mystery until Digivolution!'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[9px] font-pixel text-slate-400">WINDOW REMAINING</div>
                      <div className="font-pixel text-sm text-white tabular-nums">
                        {pet.isFrozen ? '❄️ PAUSED' : formatDurationMs(evoTiming.remainingMs)}
                      </div>
                    </div>
                  </div>

                  {/* Mystery Evolution Slot */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 border-dashed flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 border-dashed flex items-center justify-center shrink-0">
                      <span className="font-pixel text-xl text-slate-600 select-none">?</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-chakra font-bold text-slate-200 text-base">
                          NEXT EVOLUTION: ??? (UNKNOWN)
                        </span>
                      </div>
                      <p className="text-[11px] font-chakra text-slate-400 mt-0.5">
                        {pet.stage === 'egg'
                          ? 'Wait for the Digitama incubation timer to hatch into Baby I.'
                          : pet.stage === 'fresh'
                          ? 'Wait 10 minutes for Baby I to grow into Baby II.'
                          : 'Care mistakes, effort, weight, battles, and equipped relics decide the outcome at 0.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Digivice Battles + Digimon World Stat Requirements for Current Stage */}
              {(() => {
                const stageReqs = getStageBranchRequirements(pet.stage);
                if (!stageReqs) return null;
                const branches: Array<{
                  key: CoreBranchArchetype;
                  title: string;
                  titleCls: string;
                  borderCls: string;
                }> = [
                  {
                    key: 'vaccine',
                    title: 'Vaccine Pathway',
                    titleCls: 'text-sky-300',
                    borderCls: 'border-sky-500/30 bg-sky-950/20',
                  },
                  {
                    key: 'data',
                    title: 'Data Pathway',
                    titleCls: 'text-emerald-300',
                    borderCls: 'border-emerald-500/30 bg-emerald-950/20',
                  },
                  {
                    key: 'virus',
                    title: 'Virus Pathway',
                    titleCls: 'text-rose-300',
                    borderCls: 'border-rose-500/30 bg-rose-950/20',
                  },
                  {
                    key: 'corrupted',
                    title: 'Corrupted Pathway',
                    titleCls: 'text-purple-300',
                    borderCls: 'border-purple-500/30 bg-purple-950/20',
                  },
                ];
                return (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="text-[10px] font-pixel text-slate-300">
                      CURRENT STAGE EVOLUTION TARGETS ({stageReqs.vaccine.timerLabel.toUpperCase()})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {branches.map((b) => {
                        const readiness = evaluateBranchReadiness(pet, species, stageReqs[b.key]);
                        return (
                          <div
                            key={b.key}
                            className={`p-2.5 rounded-xl border space-y-1.5 ${
                              readiness.met
                                ? 'border-emerald-400/60 bg-emerald-950/25'
                                : b.borderCls
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-[10px] font-pixel">
                              <span className={b.titleCls}>{b.title}</span>
                              <span
                                className={
                                  readiness.met ? 'text-emerald-300 font-bold' : 'text-slate-400'
                                }
                              >
                                {readiness.met
                                  ? '✓ READY'
                                  : `${readiness.metCount}/${readiness.totalCount}`}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {readiness.metrics.map((m) => (
                                <span
                                  key={`${b.key}-${m.label}`}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-chakra border tabular-nums ${
                                    m.met
                                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                                      : 'bg-slate-900/90 border-slate-700/80 text-slate-300'
                                  }`}
                                >
                                  {m.label}: {m.current}/{m.target.replace('≥ ', '')}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              <div className="text-[10px] font-pixel text-slate-500 pt-1">
                PENDULUM V20 TIMERS: Egg 1m · Baby I 10m · Baby II 12h · Rookie 24h · Champion 40h · Ultimate 48h
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

