import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PetState, DigimonSpecies, BattleFighter, BattleLogEntry, BattleMove } from '../types/digimon';
import { DIGIMON_DATABASE } from '../data/digidex';
import {
  ATTACK_ELEMENT_META,
  AttackVisualSpec,
  classifyAttackVisual,
  getBasicAttackVisual,
  getEffectiveBattleStats,
  getElementDamageMultiplier,
  getEquippedBattleMoves,
  getRangedVolleyVisual,
  getSpeciesElementType,
  mapMoveTypeToElement,
  rollCriticalHit,
} from '../data/battleTechniques';
import { DigimonSprite } from './DigimonSprite';
import { BattleAttackVfx, ActiveBattleVfx } from './BattleAttackVfx';
import { sound, triggerHaptic } from '../utils/audio';
import { battleSoundLibrary } from '../utils/battleSoundLibrary';
import confetti from 'canvas-confetti';
import {
  Swords,
  Shield,
  Zap,
  Flame,
  X,
  Trophy,
  Globe,
  Compass,
} from 'lucide-react';

interface ColosseumBattleProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onBattleEnd: (
    won: boolean,
    coinsReward: number,
    dpReward: number,
    opponentInfo?: { name: string; speciesId?: string }
  ) => void;
  onOpenAdventure?: () => void;
}

type ColosseumArenaId =
  | 'cyber-dome'
  | 'volcanic-ring'
  | 'celestial-spire'
  | 'dark-network'
  | 'glacier-vault';

interface ColosseumArenaTheme {
  id: ColosseumArenaId;
  name: string;
  skyGradient: string;
  borderClass: string;
  floorGradient: string;
  floorEdgeClass: string;
  accentLineColor: string;
}

const COLOSSEUM_ARENAS: ColosseumArenaTheme[] = [
  {
    id: 'cyber-dome',
    name: 'Cyber Dome',
    skyGradient: 'from-indigo-950 via-slate-900 to-slate-950',
    borderClass: 'border-indigo-500/45',
    floorGradient: 'bg-gradient-to-b from-cyan-950/65 via-indigo-950/90 to-slate-950',
    floorEdgeClass: 'border-t-2 border-cyan-400/50',
    accentLineColor: 'rgba(34, 211, 238, 0.25)',
  },
  {
    id: 'volcanic-ring',
    name: 'Magma Core',
    skyGradient: 'from-stone-950 via-red-950/85 to-orange-950/75',
    borderClass: 'border-orange-500/45',
    floorGradient: 'bg-gradient-to-b from-stone-900/90 via-red-950/90 to-stone-950',
    floorEdgeClass: 'border-t-2 border-orange-500/60',
    accentLineColor: 'rgba(249, 115, 22, 0.3)',
  },
  {
    id: 'celestial-spire',
    name: 'Sky Sanctum',
    skyGradient: 'from-sky-950 via-indigo-900/80 to-amber-950/45',
    borderClass: 'border-amber-400/45',
    floorGradient: 'bg-gradient-to-b from-slate-700/60 via-indigo-950/85 to-slate-950',
    floorEdgeClass: 'border-t-2 border-amber-300/55',
    accentLineColor: 'rgba(252, 211, 77, 0.25)',
  },
  {
    id: 'dark-network',
    name: 'Dark Mainframe',
    skyGradient: 'from-purple-950 via-fuchsia-950/70 to-slate-950',
    borderClass: 'border-fuchsia-500/45',
    floorGradient: 'bg-gradient-to-b from-purple-950/80 via-slate-950/95 to-black',
    floorEdgeClass: 'border-t-2 border-fuchsia-400/55',
    accentLineColor: 'rgba(232, 121, 249, 0.25)',
  },
  {
    id: 'glacier-vault',
    name: 'Glacier Vault',
    skyGradient: 'from-slate-950 via-cyan-950/85 to-blue-950',
    borderClass: 'border-sky-400/45',
    floorGradient: 'bg-gradient-to-b from-sky-900/55 via-slate-900/90 to-slate-950',
    floorEdgeClass: 'border-t-2 border-sky-300/60',
    accentLineColor: 'rgba(125, 211, 252, 0.28)',
  },
];

const ColosseumBackdropArt: React.FC<{ arena: ColosseumArenaTheme }> = ({ arena }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Stadium / Biome Midground Architecture */}
    {arena.id === 'cyber-dome' && (
      <>
        <div className="absolute -top-10 left-[14%] w-24 h-44 bg-cyan-400/10 rotate-12" />
        <div className="absolute -top-10 right-[14%] w-24 h-44 bg-indigo-400/10 -rotate-12" />
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-56 h-24 rounded-full border border-cyan-400/20" />
        <div className="absolute bottom-14 inset-x-0 h-20 flex items-end justify-around opacity-40 px-4">
          <div className="w-10 h-16 bg-indigo-900/70 border-t border-cyan-400/35 rounded-t-sm" />
          <div className="w-16 h-12 bg-slate-800/70 border-t border-indigo-400/30 rounded-t-sm" />
          <div className="w-20 h-14 bg-indigo-950/80 border-t border-cyan-400/35 rounded-t-sm" />
          <div className="w-16 h-12 bg-slate-800/70 border-t border-indigo-400/30 rounded-t-sm" />
          <div className="w-10 h-16 bg-indigo-900/70 border-t border-cyan-400/35 rounded-t-sm" />
        </div>
      </>
    )}

    {arena.id === 'volcanic-ring' && (
      <>
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-72 h-24 rounded-full bg-gradient-to-b from-orange-500/20 to-transparent" />
        <div className="absolute bottom-14 inset-x-0 h-24 flex items-end justify-around opacity-70 px-2">
          <div className="w-0 h-0 border-l-[34px] border-r-[34px] border-b-[76px] border-l-transparent border-r-transparent border-b-stone-900/90" />
          <div className="w-0 h-0 border-l-[46px] border-r-[46px] border-b-[96px] border-l-transparent border-r-transparent border-b-red-950/90" />
          <div className="w-0 h-0 border-l-[38px] border-r-[38px] border-b-[82px] border-l-transparent border-r-transparent border-b-stone-900/90" />
        </div>
        <span className="absolute top-12 left-[20%] w-1.5 h-1.5 rounded-full bg-orange-400/80 animate-ping" />
        <span className="absolute top-16 left-[72%] w-1.5 h-1.5 rounded-full bg-amber-300/80 animate-pulse" />
        <span className="absolute top-9 left-[45%] w-1 h-1 rounded-full bg-rose-400/80 animate-pulse" />
      </>
    )}

    {arena.id === 'celestial-spire' && (
      <>
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-28 rounded-full bg-gradient-to-b from-amber-300/20 to-transparent" />
        <div className="absolute top-10 left-[14%] w-24 h-7 rounded-full bg-white/10" />
        <div className="absolute top-14 right-[14%] w-28 h-8 rounded-full bg-amber-100/10" />
        <div className="absolute bottom-14 inset-x-0 h-24 flex items-end justify-around opacity-55 px-6">
          <div className="w-7 h-24 bg-slate-300/20 border-x border-t border-amber-200/35 rounded-t-sm" />
          <div className="w-7 h-18 bg-slate-300/15 border-x border-t border-amber-200/30 rounded-t-sm" />
          <div className="w-7 h-18 bg-slate-300/15 border-x border-t border-amber-200/30 rounded-t-sm" />
          <div className="w-7 h-24 bg-slate-300/20 border-x border-t border-amber-200/35 rounded-t-sm" />
        </div>
      </>
    )}

    {arena.id === 'dark-network' && (
      <>
        <div className="absolute top-8 left-[22%] w-16 h-16 rotate-45 border border-fuchsia-400/25" />
        <div className="absolute top-10 right-[22%] w-14 h-14 rotate-12 border border-purple-400/25" />
        <div className="absolute bottom-14 inset-x-0 h-24 flex items-end justify-around opacity-55 px-4">
          <div className="w-10 h-22 bg-purple-950/85 border border-fuchsia-500/35 flex flex-col justify-evenly p-1">
            <span className="h-1 bg-fuchsia-400/45 rounded" />
            <span className="h-1 bg-purple-400/40 rounded" />
            <span className="h-1 bg-fuchsia-400/45 rounded" />
          </div>
          <div className="w-12 h-16 bg-slate-950/90 border border-purple-400/30" />
          <div className="w-10 h-22 bg-purple-950/85 border border-fuchsia-500/35 flex flex-col justify-evenly p-1">
            <span className="h-1 bg-fuchsia-400/45 rounded" />
            <span className="h-1 bg-purple-400/40 rounded" />
            <span className="h-1 bg-fuchsia-400/45 rounded" />
          </div>
        </div>
        <span className="absolute top-12 left-[35%] w-1.5 h-1.5 rounded-full bg-fuchsia-400/75 animate-pulse" />
        <span className="absolute top-16 left-[64%] w-1.5 h-1.5 rounded-full bg-violet-300/75 animate-ping" />
      </>
    )}

    {arena.id === 'glacier-vault' && (
      <>
        <div className="absolute -top-6 inset-x-10 h-16 bg-gradient-to-b from-cyan-400/15 via-emerald-300/10 to-transparent" />
        <div className="absolute bottom-14 inset-x-0 h-24 flex items-end justify-around opacity-65 px-3">
          <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[72px] border-l-transparent border-r-transparent border-b-sky-800/70" />
          <div className="w-0 h-0 border-l-[34px] border-r-[34px] border-b-[92px] border-l-transparent border-r-transparent border-b-cyan-800/65" />
          <div className="w-0 h-0 border-l-[22px] border-r-[22px] border-b-[64px] border-l-transparent border-r-transparent border-b-sky-700/65" />
          <div className="w-0 h-0 border-l-[32px] border-r-[32px] border-b-[86px] border-l-transparent border-r-transparent border-b-cyan-900/70" />
        </div>
        <span className="absolute top-10 left-[22%] w-1.5 h-1.5 rounded-full bg-white/75 animate-pulse" />
        <span className="absolute top-16 left-[52%] w-1.5 h-1.5 rounded-full bg-sky-200/75 animate-bounce" />
        <span className="absolute top-9 left-[78%] w-1.5 h-1.5 rounded-full bg-cyan-200/75 animate-pulse" />
      </>
    )}

    {/* Arena Floor Ring & Perspective Grid */}
    <div className={`absolute inset-x-0 bottom-0 h-16 ${arena.floorGradient} ${arena.floorEdgeClass} overflow-hidden`}>
      <div
        className="absolute inset-0 opacity-65"
        style={{
          backgroundImage: `linear-gradient(to right, ${arena.accentLineColor} 1px, transparent 1px), linear-gradient(to bottom, ${arena.accentLineColor} 1px, transparent 1px)`,
          backgroundSize: '32px 16px',
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] h-9 rounded-full border opacity-45"
        style={{ borderColor: arena.accentLineColor }}
      />
    </div>
  </div>
);

export const ColosseumBattle: React.FC<ColosseumBattleProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onBattleEnd,
  onOpenAdventure,
}) => {
  const [matchState, setMatchState] = useState<'lobby' | 'matching' | 'battling' | 'victory' | 'defeat'>('lobby');
  const [roomCode, setRoomCode] = useState<string>('');
  const [arenaTheme, setArenaTheme] = useState<ColosseumArenaTheme>(COLOSSEUM_ARENAS[0]);
  const [playerFighter, setPlayerFighter] = useState<BattleFighter | null>(null);
  const [opponentFighter, setOpponentFighter] = useState<BattleFighter | null>(null);
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [playerActionAnim, setPlayerActionAnim] = useState<'idle' | 'attack' | 'attack_melee' | 'attack_ranged' | 'happy' | 'sick'>('idle');
  const [opponentActionAnim, setOpponentActionAnim] = useState<'idle' | 'attack' | 'attack_melee' | 'attack_ranged' | 'happy' | 'sick'>('idle');
  const [isDefending, setIsDefending] = useState<boolean>(false);
  const [isCharged, setIsCharged] = useState<boolean>(false);

  const [playerEffect, setPlayerEffect] = useState<'none' | 'lunge' | 'melee_rush' | 'ranged_cast' | 'hit' | 'shield' | 'charge'>('none');
  const [opponentEffect, setOpponentEffect] = useState<'none' | 'lunge' | 'melee_rush' | 'ranged_cast' | 'hit'>('none');
  const [activeVfx, setActiveVfx] = useState<ActiveBattleVfx | null>(null);
  const [arenaShake, setArenaShake] = useState<boolean>(false);
  const [damagePopups, setDamagePopups] = useState<{ id: number; target: 'player' | 'opponent'; text: string; color: string }[]>([]);

  const triggerAttackVfx = (
    attacker: 'player' | 'opponent',
    spec: AttackVisualSpec,
    opts?: { isCrit?: boolean; isSuperEffective?: boolean; isSignature?: boolean; moveName?: string }
  ) => {
    setActiveVfx({
      id: Date.now() + Math.random(),
      attacker,
      spec,
      isCrit: opts?.isCrit,
      isSuperEffective: opts?.isSuperEffective,
      isSignature: opts?.isSignature,
      moveName: opts?.moveName,
    });
  };

  const showDamagePopup = (target: 'player' | 'opponent', text: string, color: string) => {
    const id = Date.now() + Math.random();
    setDamagePopups((prev) => [...prev, { id, target, text, color }]);
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== id));
    }, 1050);
  };

  const triggerArenaShake = () => {
    setArenaShake(true);
    setTimeout(() => setArenaShake(false), 450);
  };

  useEffect(() => {
    if (isOpen) {
      setMatchState('lobby');
      setPlayerFighter(null);
      setOpponentFighter(null);
      setBattleLogs([]);
      setIsPlayerTurn(true);
      setIsDefending(false);
      setIsCharged(false);
      setPlayerActionAnim('idle');
      setOpponentActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
      setActiveVfx(null);
      setArenaShake(false);
      setDamagePopups([]);
    }
  }, [isOpen]);

  const setupFighters = (oppSpeciesId?: string) => {
    if (!species) return;

    const stats = getEffectiveBattleStats(pet, species);
    const equippedMoves = getEquippedBattleMoves(pet, species);
    const playerEl = getSpeciesElementType(species);

    const player: BattleFighter = {
      id: 'player-fighter',
      name: pet.nickname || species.name,
      speciesId: species.id,
      stage: pet.stage,
      crest: species.crest || 'courage',
      element: playerEl,
      currentHp: stats.maxHp,
      maxHp: stats.maxHp,
      mp: stats.maxMp,
      maxMp: stats.maxMp,
      sp: 0,
      atk: stats.offense,
      def: stats.defense,
      spd: stats.speed,
      brains: stats.brains,
      signatureMove: species.signatureMove,
      equippedMoves,
      isPlayer: true,
    };

    // Match evenly against same-stage rival with approachable difficulty scaling
    const opponentKeys = Object.keys(DIGIMON_DATABASE).filter(
      (k) => DIGIMON_DATABASE[k].stage === pet.stage && k !== species.id
    );
    const oppId =
      oppSpeciesId ||
      (opponentKeys.length > 0 ? opponentKeys[Math.floor(Math.random() * opponentKeys.length)] : 'agumon');
    const oppSpecies = DIGIMON_DATABASE[oppId] || DIGIMON_DATABASE['agumon'];
    const oppEl = getSpeciesElementType(oppSpecies);

    const stageFactor = pet.stage === 'fresh' || pet.stage === 'in-training' ? 0.84 : 0.94;
    const hpVariance = stageFactor + Math.random() * 0.1;
    const oppHp = Math.max(Math.round(oppSpecies.baseHp * 0.85), Math.round(stats.maxHp * hpVariance));
    const oppAtk = Math.round(Math.max(oppSpecies.baseAtk * 0.85, stats.offense * 0.78));
    const oppDef = Math.round(Math.max(oppSpecies.baseDef * 0.72, stats.defense * 0.66));
    const scaledSigPower = Math.round(
      Math.max(oppSpecies.signatureMove.power * 0.82, species.signatureMove.power * 0.76)
    );

    const opponent: BattleFighter = {
      id: 'opponent-fighter',
      name: oppSpecies.name,
      speciesId: oppSpecies.id,
      stage: oppSpecies.stage,
      crest: oppSpecies.crest,
      element: oppEl,
      currentHp: oppHp,
      maxHp: oppHp,
      mp: 60,
      maxMp: 60,
      sp: 15,
      atk: oppAtk,
      def: oppDef,
      spd: Math.max(oppSpecies.baseSpd, Math.round(stats.speed * 0.9)),
      signatureMove: {
        ...oppSpecies.signatureMove,
        power: scaledSigPower,
      },
      isPlayer: false,
    };

    const otherArenas = COLOSSEUM_ARENAS.filter((a) => a.id !== arenaTheme.id);
    const chosenArena =
      otherArenas[Math.floor(Math.random() * otherArenas.length)] ||
      COLOSSEUM_ARENAS[Math.floor(Math.random() * COLOSSEUM_ARENAS.length)];
    setArenaTheme(chosenArena);

    setPlayerFighter(player);
    setOpponentFighter(opponent);
    setBattleLogs([
      {
        id: 'start-1',
        text: `Colosseum Match [${chosenArena.name}]: ${player.name} (${ATTACK_ELEMENT_META[playerEl].label}) vs ${opponent.name} (${ATTACK_ELEMENT_META[oppEl].label})`,
        type: 'action',
      },
    ]);
  };

  const handleStartQuickMatch = () => {
    sound.playButton();
    setMatchState('matching');
    setTimeout(() => {
      setupFighters();
      setMatchState('battling');
      setIsPlayerTurn(true);
    }, 1200);
  };

  const handleHostRoom = () => {
    sound.playButton();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setMatchState('matching');
    setTimeout(() => {
      setupFighters();
      setMatchState('battling');
      setIsPlayerTurn(true);
    }, 1600);
  };

  // Opponent AI Turn
  useEffect(() => {
    if (matchState !== 'battling' || isPlayerTurn || !opponentFighter || !playerFighter) return;

    const timer = setTimeout(() => {
      const canUseSpecial = opponentFighter.sp >= 50;
      const shouldUseSpecial = canUseSpecial && Math.random() < 0.42;
      const oppSpecies = DIGIMON_DATABASE[opponentFighter.speciesId];
      const defFactor = isDefending ? playerFighter.def * 0.68 : playerFighter.def * 0.3;

      if (shouldUseSpecial) {
        const moveEl = mapMoveTypeToElement(opponentFighter.signatureMove, oppSpecies);
        const typeMult = getElementDamageMultiplier(moveEl, playerFighter.element || 'neutral');
        const crit = rollCriticalHit({
          attackerSpd: opponentFighter.spd,
          defenderSpd: playerFighter.spd,
          isSpecial: true,
        });
        const oppSpec = classifyAttackVisual(opponentFighter.signatureMove, oppSpecies);
        battleSoundLibrary.playAttackSound({
          spec: oppSpec,
          isCrit: crit.isCrit,
          isSuperEffective: typeMult > 1,
        });
        triggerHaptic('heavy');
        setOpponentActionAnim(oppSpec.motion === 'melee' ? 'attack_melee' : 'attack_ranged');
        setOpponentEffect(oppSpec.motion === 'melee' ? 'melee_rush' : 'ranged_cast');
        triggerAttackVfx('opponent', oppSpec, {
          isCrit: crit.isCrit,
          isSuperEffective: typeMult > 1,
          isSignature: true,
          moveName: opponentFighter.signatureMove.name,
        });

        const rawDamage = Math.max(
          9,
          Math.floor(
            (opponentFighter.signatureMove.power * 0.72 + opponentFighter.atk * 0.16 - defFactor) *
              typeMult *
              crit.multiplier
          )
        );
        const finalDamage = isDefending ? Math.max(4, Math.floor(rawDamage * 0.4)) : rawDamage;

        setOpponentFighter((prev) => (prev ? { ...prev, sp: prev.sp - 50 } : null));

        setTimeout(() => {
          setPlayerEffect('hit');
          triggerArenaShake();
          showDamagePopup(
            'player',
            `${crit.isCrit ? 'CRIT! ' : ''}${typeMult > 1 ? '1.5x ' : ''}-${finalDamage}!`,
            crit.isCrit
              ? 'text-yellow-300 font-black text-sm'
              : isDefending
              ? 'text-cyan-300'
              : 'text-rose-400 font-extrabold'
          );

          setPlayerFighter((prev) =>
            prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - finalDamage) } : null
          );
        }, 460);

        setBattleLogs((logs) => [
          {
            id: `opp-${Date.now()}`,
            text: `${opponentFighter.name} unleashed ${opponentFighter.signatureMove.name} (${ATTACK_ELEMENT_META[moveEl].label}) for ${finalDamage} damage${crit.isCrit ? ' [CRITICAL HIT! 1.75x]' : ''}${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
            type: 'special',
          },
          ...logs,
        ]);
      } else {
        const oppEl = opponentFighter.element || 'neutral';
        const typeMult = getElementDamageMultiplier(oppEl, playerFighter.element || 'neutral');
        const crit = rollCriticalHit({
          attackerSpd: opponentFighter.spd,
          defenderSpd: playerFighter.spd,
        });
        const sigSpec = classifyAttackVisual(opponentFighter.signatureMove, oppSpecies);
        const useRangedBasic = sigSpec.motion === 'melee' && Math.random() < 0.42;
        const atkSpec = useRangedBasic
          ? getRangedVolleyVisual(oppEl, `${opponentFighter.name} Bolt`)
          : getBasicAttackVisual(oppEl, oppSpecies);

        battleSoundLibrary.playAttackSound({
          spec: atkSpec,
          isCrit: crit.isCrit,
          isSuperEffective: typeMult > 1,
        });
        triggerHaptic(crit.isCrit ? 'heavy' : 'medium');
        setOpponentActionAnim(atkSpec.motion === 'melee' ? 'attack_melee' : 'attack_ranged');
        setOpponentEffect(atkSpec.motion === 'melee' ? 'melee_rush' : 'ranged_cast');
        triggerAttackVfx('opponent', atkSpec, {
          isCrit: crit.isCrit,
          isSuperEffective: typeMult > 1,
        });

        const rawDamage = Math.max(
          7,
          Math.floor((opponentFighter.atk * 0.72 - defFactor) * typeMult * crit.multiplier)
        );
        const finalDamage = isDefending ? Math.max(3, Math.floor(rawDamage * 0.4)) : rawDamage;

        setOpponentFighter((prev) => (prev ? { ...prev, sp: Math.min(100, prev.sp + 20) } : null));

        setTimeout(() => {
          setPlayerEffect('hit');
          triggerArenaShake();
          showDamagePopup(
            'player',
            `${crit.isCrit ? 'CRIT! ' : ''}${typeMult > 1 ? '1.5x ' : ''}-${finalDamage}${crit.isCrit ? '!' : ''}`,
            crit.isCrit
              ? 'text-yellow-300 font-black'
              : isDefending
              ? 'text-cyan-300'
              : 'text-rose-400 font-bold'
          );

          setPlayerFighter((prev) =>
            prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - finalDamage) } : null
          );
        }, 240);

        setBattleLogs((logs) => [
          {
            id: `opp-${Date.now()}`,
            text: `${opponentFighter.name} ${useRangedBasic ? 'fired an energy shot' : 'attacked'} for ${finalDamage} damage${crit.isCrit ? ' [CRITICAL HIT! 1.75x]' : ''}${typeMult > 1 ? ' [1.5x ADV]' : ''}.`,
            type: crit.isCrit ? 'special' : 'damage',
          },
          ...logs,
        ]);
      }

      setIsDefending(false);
      setTimeout(() => {
        setOpponentActionAnim('idle');
        setOpponentEffect('none');
        setPlayerEffect('none');
        setActiveVfx(null);
        setIsPlayerTurn(true);
      }, shouldUseSpecial ? 1020 : 760);
    }, 1050);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, matchState, opponentFighter, playerFighter, isDefending]);

  useEffect(() => {
    if (matchState !== 'battling' || !playerFighter || !opponentFighter) return;

    if (opponentFighter.currentHp <= 0) {
      sound.playVictory();
      setMatchState('victory');
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } else if (playerFighter.currentHp <= 0) {
      setMatchState('defeat');
    }
  }, [playerFighter?.currentHp, opponentFighter?.currentHp, matchState]);

  const handlePlayerAttack = () => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter) return;
    setIsPlayerTurn(false);

    const chargeMult = isCharged ? 1.6 : 1.0;
    const typeMult = getElementDamageMultiplier(
      playerFighter.element || 'neutral',
      opponentFighter.element || 'neutral'
    );
    const crit = rollCriticalHit({
      attackerSpd: playerFighter.spd,
      defenderSpd: opponentFighter.spd,
      isCharged,
    });
    const atkSpec = getBasicAttackVisual(playerFighter.element || 'neutral', species);
    battleSoundLibrary.playAttackSound({
      spec: atkSpec,
      isCrit: crit.isCrit,
      isSuperEffective: typeMult > 1,
    });
    triggerHaptic(crit.isCrit ? 'heavy' : 'medium');
    setPlayerActionAnim('attack_melee');
    setPlayerEffect('melee_rush');
    triggerAttackVfx('player', atkSpec, {
      isCrit: crit.isCrit,
      isSuperEffective: typeMult > 1,
    });

    const damage = Math.max(
      12,
      Math.floor((playerFighter.atk * 0.92 * chargeMult - opponentFighter.def * 0.24) * typeMult * crit.multiplier)
    );

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            sp: Math.min(100, prev.sp + 20),
            mp: Math.min(prev.maxMp || 100, (prev.mp || 0) + 8),
          }
        : null
    );
    setIsCharged(false);

    setTimeout(() => {
      setOpponentEffect('hit');
      triggerArenaShake();
      showDamagePopup(
        'opponent',
        `${crit.isCrit ? 'CRIT! ' : ''}${typeMult > 1 ? '1.5x ADV! ' : ''}-${damage}${crit.isCrit ? '!' : ''}`,
        crit.isCrit
          ? 'text-yellow-300 font-black text-sm'
          : typeMult > 1
          ? 'text-emerald-300 font-extrabold'
          : 'text-amber-300 font-bold'
      );

      setOpponentFighter((prev) =>
        prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - damage) } : null
      );
    }, 240);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `${playerFighter.name} struck for ${damage} damage (+8 MP)${crit.isCrit ? ' [CRITICAL HIT! 1.75x]' : ''}${typeMult > 1 ? ' [1.5x Type Advantage!]' : ''}!`,
        type: crit.isCrit ? 'special' : 'damage',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
      setActiveVfx(null);
    }, 740);
  };

  const handlePlayerSpecial = () => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter || playerFighter.sp < 50) return;
    setIsPlayerTurn(false);

    const moveEl = mapMoveTypeToElement(playerFighter.signatureMove, species);
    const typeMult = getElementDamageMultiplier(moveEl, opponentFighter.element || 'neutral');
    const chargeMult = isCharged ? 1.75 : 1.3;
    const brainsBonus = Math.floor((playerFighter.brains || 20) * 0.12);
    const crit = rollCriticalHit({
      attackerSpd: playerFighter.spd,
      defenderSpd: opponentFighter.spd,
      isCharged,
      isSpecial: true,
    });
    const moveSpec = classifyAttackVisual(playerFighter.signatureMove, species);
    battleSoundLibrary.playAttackSound({
      spec: moveSpec,
      isCrit: crit.isCrit,
      isSuperEffective: typeMult > 1,
    });
    triggerHaptic('heavy');
    setPlayerActionAnim(moveSpec.motion === 'melee' ? 'attack_melee' : 'attack_ranged');
    setPlayerEffect(moveSpec.motion === 'melee' ? 'melee_rush' : 'ranged_cast');
    triggerAttackVfx('player', moveSpec, {
      isCrit: crit.isCrit,
      isSuperEffective: typeMult > 1,
      isSignature: true,
      moveName: playerFighter.signatureMove.name,
    });

    const damage = Math.max(
      26,
      Math.floor(
        (playerFighter.signatureMove.power * chargeMult + playerFighter.atk * 0.3 + brainsBonus - opponentFighter.def * 0.24) *
          typeMult *
          crit.multiplier
      )
    );

    setPlayerFighter((prev) => (prev ? { ...prev, sp: prev.sp - 50 } : null));
    setIsCharged(false);

    setTimeout(() => {
      setOpponentEffect('hit');
      triggerArenaShake();
      showDamagePopup(
        'opponent',
        `${crit.isCrit ? 'CRIT! ' : ''}${typeMult > 1 ? '1.5x ADV! ' : ''}-${damage}!`,
        crit.isCrit
          ? 'text-yellow-300 font-black text-base'
          : typeMult > 1
          ? 'text-emerald-300 font-extrabold text-sm'
          : 'text-orange-400 font-extrabold text-sm'
      );

      setOpponentFighter((prev) =>
        prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - damage) } : null
      );
    }, 460);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `SIGNATURE: ${playerFighter.name} ${moveSpec.motion === 'melee' ? 'unleashed' : 'fired'} ${playerFighter.signatureMove.name} (${ATTACK_ELEMENT_META[moveEl].label}) for ${damage} damage${crit.isCrit ? ' [CRITICAL HIT! 1.75x]' : ''}${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
        type: 'special',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
      setActiveVfx(null);
    }, 1020);
  };

  const handleUseLearnedTechnique = (move: BattleMove) => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter) return;
    const currentMp = playerFighter.mp ?? 0;
    if (currentMp < move.mpCost) return;

    setIsPlayerTurn(false);
    const typeMult = getElementDamageMultiplier(move.element, opponentFighter.element || 'neutral');
    const chargeMult = isCharged ? 1.55 : 1.0;
    const brainsBonus = Math.floor((playerFighter.brains || 20) * 0.16);
    const crit = rollCriticalHit({
      attackerSpd: playerFighter.spd,
      defenderSpd: opponentFighter.spd,
      isCharged,
      isSpecial: true,
    });
    const moveSpec = classifyAttackVisual(move, species);
    battleSoundLibrary.playAttackSound({
      spec: moveSpec,
      isCrit: crit.isCrit,
      isSuperEffective: typeMult > 1,
    });
    triggerHaptic('heavy');
    setPlayerActionAnim(moveSpec.motion === 'melee' ? 'attack_melee' : 'attack_ranged');
    setPlayerEffect(moveSpec.motion === 'melee' ? 'melee_rush' : 'ranged_cast');
    triggerAttackVfx('player', moveSpec, {
      isCrit: crit.isCrit,
      isSuperEffective: typeMult > 1,
      moveName: move.name,
    });

    const damage = Math.max(
      18,
      Math.floor(
        (move.power * 1.15 * chargeMult + playerFighter.atk * 0.4 + brainsBonus - opponentFighter.def * 0.22) *
          typeMult *
          crit.multiplier
      )
    );

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            mp: Math.max(0, (prev.mp ?? 0) - move.mpCost),
            sp: Math.min(100, prev.sp + 15),
          }
        : null
    );
    setIsCharged(false);

    setTimeout(() => {
      setOpponentEffect('hit');
      triggerArenaShake();
      showDamagePopup(
        'opponent',
        `${crit.isCrit ? 'CRIT! ' : ''}${typeMult > 1 ? '1.5x ADV! ' : ''}-${damage}!`,
        crit.isCrit
          ? 'text-yellow-300 font-black text-sm'
          : typeMult > 1
          ? 'text-emerald-300 font-extrabold text-sm'
          : 'text-cyan-300 font-bold'
      );

      setOpponentFighter((prev) =>
        prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - damage) } : null
      );
    }, 250);

    setBattleLogs((logs) => [
      {
        id: `pl-tech-${Date.now()}`,
        text: `${playerFighter.name} ${moveSpec.motion === 'melee' ? 'executed' : 'cast'} ${move.name} (${ATTACK_ELEMENT_META[move.element].label}, -${move.mpCost} MP) for ${damage} damage${crit.isCrit ? ' [CRITICAL HIT! 1.75x]' : ''}${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
        type: crit.isCrit || typeMult > 1 ? 'special' : 'damage',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
      setActiveVfx(null);
    }, 760);
  };

  const handlePlayerDefend = () => {
    if (!isPlayerTurn || !playerFighter) return;
    setIsPlayerTurn(false);
    sound.playButton();
    triggerHaptic('light');
    setIsDefending(true);
    setPlayerEffect('shield');
    showDamagePopup('player', 'SHIELD UP', 'text-cyan-300 font-bold');

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            sp: Math.min(100, prev.sp + 10),
            mp: Math.min(prev.maxMp || 100, (prev.mp || 0) + 12),
          }
        : null
    );

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `${playerFighter.name} raised Digi-Shield (-60% incoming DMG, +12 MP).`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => setPlayerEffect('none'), 900);
  };

  const handlePlayerCharge = () => {
    if (!isPlayerTurn || !playerFighter) return;
    setIsPlayerTurn(false);
    sound.playMedicine();
    triggerHaptic('medium');
    setIsCharged(true);
    setPlayerEffect('charge');
    showDamagePopup('player', 'CHARGED!', 'text-amber-300 font-bold');

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            sp: Math.min(100, prev.sp + 35),
            mp: Math.min(prev.maxMp || 100, (prev.mp || 0) + 18),
          }
        : null
    );

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `${playerFighter.name} gathered Digital Soul (+35 SP, +18 MP & amplified next strike).`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => setPlayerEffect('none'), 900);
  };

  const handleClaimVictory = () => {
    sound.playEvolution();
    onBattleEnd(true, 100, 30, {
      name: opponentFighter?.name || 'Colosseum Rival',
      speciesId: opponentFighter?.speciesId,
    });
    setMatchState('lobby');
    setPlayerFighter(null);
    setOpponentFighter(null);
    onClose();
  };

  const handleClaimDefeat = () => {
    sound.playButton();
    onBattleEnd(false, 25, 8, {
      name: opponentFighter?.name || 'Colosseum Rival',
      speciesId: opponentFighter?.speciesId,
    });
    setMatchState('lobby');
    setPlayerFighter(null);
    setOpponentFighter(null);
    onClose();
  };

  const handleRematch = () => {
    sound.playButton();
    onBattleEnd(
      matchState === 'victory',
      matchState === 'victory' ? 100 : 25,
      matchState === 'victory' ? 30 : 8,
      {
        name: opponentFighter?.name || 'Colosseum Rival',
        speciesId: opponentFighter?.speciesId,
      }
    );
    setMatchState('lobby');
    setPlayerFighter(null);
    setOpponentFighter(null);
    setBattleLogs([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/95 android-safe-modal">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/45 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <Swords className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-chakra font-bold text-white text-lg truncate">
                Digital Colosseum
              </h3>
              <p className="text-slate-400 text-xs truncate">
                Elemental Matchups (1.5x) & Equipped Technique Combat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close Colosseum"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOBBY STATE */}
        {matchState === 'lobby' && (
          <div className="py-5 space-y-4">
            <div className="text-center">
              <div className="text-xs text-emerald-300 font-chakra font-semibold mb-1">
                Arena Online · Elemental Cycle: Fire &gt; Nature &gt; Air &gt; Ice &gt; Fire · Holy ↔ Dark · Hand ↔ Weapon
              </div>
              <h4 className="font-chakra font-bold text-white text-xl">Choose Your Battle Format</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div
                onClick={handleStartQuickMatch}
                className="p-4 sm:p-5 bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 rounded-2xl cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <h5 className="font-chakra font-bold text-white text-lg">Quick Match</h5>
                  <p className="text-slate-400 text-xs mt-1">
                    Pair against a stage-matched rival Digimon. Exploit elemental advantages for 1.5x damage!
                  </p>
                </div>
                <button className="mt-4 w-full min-h-[44px] bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-chakra text-sm py-2.5 rounded-xl font-bold cursor-pointer">
                  Find Opponent
                </button>
              </div>

              <div
                onClick={handleHostRoom}
                className="p-4 sm:p-5 bg-gradient-to-br from-cyan-950/80 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 rounded-2xl cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <h5 className="font-chakra font-bold text-white text-lg">Create Battle Room</h5>
                  <p className="text-slate-400 text-xs mt-1">
                    Generate a 4-digit Digivice room code to challenge a rival challenger directly.
                  </p>
                </div>
                <button className="mt-4 w-full min-h-[44px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-chakra text-sm py-2.5 rounded-xl font-bold cursor-pointer">
                  Host 4-Digit Room
                </button>
              </div>
            </div>

            {onOpenAdventure && (
              <div
                onClick={() => {
                  sound.playButton();
                  onOpenAdventure();
                }}
                className="p-4 bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Compass className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-chakra font-bold text-white text-base">
                      World Adventure Mode
                    </h5>
                    <p className="text-slate-300 text-xs truncate">
                      7 Biomes · Boss Crest Relics · Farm Stats, Meat & Vitamins
                    </p>
                  </div>
                </div>
                <button className="min-h-[44px] px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-chakra text-xs font-bold rounded-xl shrink-0 cursor-pointer whitespace-nowrap">
                  Enter Adventure
                </button>
              </div>
            )}
          </div>
        )}

        {/* MATCHING STATE */}
        {matchState === 'matching' && (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="w-14 h-14 rounded-full border-4 border-indigo-500 border-t-transparent mb-4"
            />
            <h4 className="font-chakra font-bold text-white text-xl">
              Connecting to Colosseum...
            </h4>
            <p className="text-slate-400 text-xs mt-1">
              {roomCode ? `Room #${roomCode} · Pairing rival challenger...` : 'Searching for stage-matched rival...'}
            </p>
          </div>
        )}

        {/* BATTLING STATE */}
        {matchState === 'battling' && playerFighter && opponentFighter && (
          <div className="flex flex-col space-y-3 py-2">
            {/* Arena Battle Stage */}
            <div
              className={`relative w-full h-56 sm:h-64 bg-gradient-to-b ${arenaTheme.skyGradient} rounded-2xl border ${arenaTheme.borderClass} p-3.5 sm:p-4 flex justify-between items-center overflow-hidden transition-transform [--battle-dash:125px] sm:[--battle-dash:260px] ${
                arenaShake ? 'battle-arena-shake' : ''
              }`}
            >
              <ColosseumBackdropArt arena={arenaTheme} />

              <BattleAttackVfx activeVfx={activeVfx} />

              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950/90 border border-slate-700 rounded-lg font-chakra text-xs font-semibold text-amber-300 z-20 whitespace-nowrap">
                {isPlayerTurn ? 'Your Turn — Select Command' : `${opponentFighter.name} Acting...`}
              </div>

              {/* Player Fighter Side */}
              <div className={`flex flex-col items-center relative ${playerEffect === 'melee_rush' ? 'z-20' : 'z-10'}`}>
                <div className="w-32 sm:w-40 bg-slate-950/90 border border-cyan-500/40 rounded-xl p-2 mb-2 text-xs font-chakra tabular-nums">
                  <div className="flex justify-between items-center text-cyan-200 font-bold gap-1">
                    <span className="truncate">{playerFighter.name}</span>
                    <span className="text-[10px] text-slate-300 shrink-0">
                      {ATTACK_ELEMENT_META[playerFighter.element || 'neutral'].shortLabel}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-300 mt-0.5 mb-0.5">
                    <span>HP {playerFighter.currentHp}/{playerFighter.maxHp}</span>
                    <span className="text-cyan-300">MP {playerFighter.mp ?? 0}/{playerFighter.maxMp ?? 60}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${(playerFighter.currentHp / playerFighter.maxHp) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${((playerFighter.mp ?? 0) / (playerFighter.maxMp || 1)) * 100}%` }}
                      />
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${playerFighter.sp}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={`relative flex items-center justify-center ${
                    playerEffect === 'melee_rush'
                      ? 'battle-melee-right'
                      : playerEffect === 'ranged_cast'
                      ? 'battle-cast-right'
                      : playerEffect === 'lunge'
                      ? 'battle-lunge-right'
                      : playerEffect === 'hit'
                      ? 'battle-shake-hit'
                      : ''
                  }`}
                >
                  <DigimonSprite
                    species={DIGIMON_DATABASE[playerFighter.speciesId]}
                    action={playerActionAnim}
                    facing="right"
                    scale={1.0}
                  />

                  {activeVfx?.isSignature && activeVfx.attacker === 'player' && (
                    <div
                      className="absolute inset-0 -m-3 rounded-full border-2 animate-ping pointer-events-none z-20 opacity-75"
                      style={{ borderColor: activeVfx.spec.colorHex }}
                    />
                  )}

                  {(isDefending || playerEffect === 'shield') && (
                    <div className="absolute inset-0 -m-3 rounded-full border-2 border-cyan-400 bg-cyan-400/20 battle-shield-aura pointer-events-none z-20 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-cyan-300" />
                    </div>
                  )}

                  {(isCharged || playerEffect === 'charge') && (
                    <div className="absolute inset-0 -m-3 rounded-full border-2 border-amber-400 bg-amber-400/20 battle-charge-aura pointer-events-none z-20 flex items-center justify-center">
                      <Zap className="w-7 h-7 text-amber-300" />
                    </div>
                  )}

                  {damagePopups
                    .filter((p) => p.target === 'player')
                    .map((p) => (
                      <div
                        key={p.id}
                        className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-xs [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] pointer-events-none z-40 battle-damage-float ${p.color}`}
                      >
                        {p.text}
                      </div>
                    ))}
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-center opacity-55 z-10">
                <span className="font-chakra font-bold text-xl text-slate-300">VS</span>
                <span className="text-[10px] font-chakra uppercase tracking-wider text-slate-300/80">
                  {arenaTheme.name}
                </span>
              </div>

              {/* Opponent Fighter Side */}
              <div className={`flex flex-col items-center relative ${opponentEffect === 'melee_rush' ? 'z-20' : 'z-10'}`}>
                <div className="w-32 sm:w-40 bg-slate-950/90 border border-rose-500/40 rounded-xl p-2 mb-2 text-xs font-chakra tabular-nums">
                  <div className="flex justify-between items-center text-rose-200 font-bold gap-1">
                    <span className="truncate">{opponentFighter.name}</span>
                    <span className="text-[10px] text-slate-300 shrink-0">
                      {ATTACK_ELEMENT_META[opponentFighter.element || 'neutral'].shortLabel}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-300 mt-0.5 mb-0.5">
                    <span>HP {opponentFighter.currentHp}/{opponentFighter.maxHp}</span>
                    <span className="text-amber-300">SP {opponentFighter.sp}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 transition-all duration-300"
                      style={{ width: `${(opponentFighter.currentHp / opponentFighter.maxHp) * 100}%` }}
                    />
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${opponentFighter.sp}%` }}
                    />
                  </div>
                </div>

                <div
                  className={`relative flex items-center justify-center ${
                    opponentEffect === 'melee_rush'
                      ? 'battle-melee-left'
                      : opponentEffect === 'ranged_cast'
                      ? 'battle-cast-left'
                      : opponentEffect === 'lunge'
                      ? 'battle-lunge-left'
                      : opponentEffect === 'hit'
                      ? 'battle-shake-hit'
                      : ''
                  }`}
                >
                  <DigimonSprite
                    species={DIGIMON_DATABASE[opponentFighter.speciesId]}
                    action={opponentActionAnim}
                    facing="left"
                    scale={1.0}
                  />

                  {activeVfx?.isSignature && activeVfx.attacker === 'opponent' && (
                    <div
                      className="absolute inset-0 -m-3 rounded-full border-2 animate-ping pointer-events-none z-20 opacity-75"
                      style={{ borderColor: activeVfx.spec.colorHex }}
                    />
                  )}

                  {damagePopups
                    .filter((p) => p.target === 'opponent')
                    .map((p) => (
                      <div
                        key={p.id}
                        className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-xs [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] pointer-events-none z-40 battle-damage-float ${p.color}`}
                      >
                        {p.text}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Equipped Techniques Row (Up to 4 Learned Attacks using MP) */}
            {playerFighter.equippedMoves && playerFighter.equippedMoves.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-chakra text-slate-400 px-0.5">
                  <span>Equipped Techniques (MP Cost · Exploits 1.5x Elemental Weakness)</span>
                  <span className="text-cyan-300 font-semibold tabular-nums">
                    MP {playerFighter.mp ?? 0}/{playerFighter.maxMp ?? 60}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {playerFighter.equippedMoves.map((move) => {
                    const hasMp = (playerFighter.mp ?? 0) >= move.mpCost;
                    const mult = getElementDamageMultiplier(
                      move.element,
                      opponentFighter.element || 'neutral'
                    );
                    const elMeta = ATTACK_ELEMENT_META[move.element];
                    return (
                      <button
                        key={move.id}
                        disabled={!isPlayerTurn || !hasMp}
                        onClick={() => handleUseLearnedTechnique(move)}
                        className={`min-h-[52px] px-2.5 py-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer active:scale-95 disabled:opacity-40 ${
                          mult > 1
                            ? 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-400/70'
                            : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-chakra font-bold text-xs text-white truncate">
                            {move.name}
                          </span>
                          {mult > 1 && (
                            <span className="text-[10px] font-chakra font-bold text-emerald-300 shrink-0">
                              1.5x
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-chakra text-slate-300 w-full mt-0.5">
                          <span>{elMeta.shortLabel} · {move.power}P</span>
                          <span className="text-cyan-300 font-semibold">{move.mpCost} MP</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Core Combat Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                disabled={!isPlayerTurn}
                onClick={handlePlayerAttack}
                className="min-h-[50px] px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold text-white cursor-pointer active:scale-95 transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-slate-200" /> Strike
                </span>
                <span className="text-[10px] font-normal text-slate-400">+20 SP · +8 MP</span>
              </button>

              <button
                disabled={!isPlayerTurn || playerFighter.sp < 50}
                onClick={handlePlayerSpecial}
                className="min-h-[50px] px-3 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-45 text-slate-950 border border-amber-300 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold cursor-pointer active:scale-95 transition-all"
              >
                <span className="flex items-center gap-1.5 max-w-full truncate">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span className="truncate">{playerFighter.signatureMove.name}</span>
                </span>
                <span className="text-[10px] font-semibold opacity-80">50 SP Signature</span>
              </button>

              <button
                disabled={!isPlayerTurn}
                onClick={handlePlayerDefend}
                className="min-h-[50px] px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold text-white cursor-pointer active:scale-95 transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" /> Shield
                </span>
                <span className="text-[10px] font-normal text-slate-400">-60% DMG · +12 MP</span>
              </button>

              <button
                disabled={!isPlayerTurn}
                onClick={handlePlayerCharge}
                className="min-h-[50px] px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold text-white cursor-pointer active:scale-95 transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Charge
                </span>
                <span className="text-[10px] font-normal text-slate-400">+35 SP · +18 MP</span>
              </button>
            </div>

            {/* Combat Log */}
            <div className="h-24 bg-slate-950 border border-slate-800 rounded-xl p-2.5 overflow-y-auto font-chakra text-xs space-y-1">
              {battleLogs.map((log) => (
                <div
                  key={log.id}
                  className={
                    log.type === 'special'
                      ? 'text-amber-300 font-semibold'
                      : log.type === 'damage'
                      ? 'text-rose-300'
                      : 'text-slate-300'
                  }
                >
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VICTORY STATE */}
        {matchState === 'victory' && (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <Trophy className="w-16 h-16 text-amber-400 mb-2 animate-bounce" />
            <h4 className="font-chakra font-bold text-white text-3xl">Victory Achieved!</h4>
            <p className="text-slate-300 text-sm mt-1 max-w-sm">
              Your Digimon fought strategically and earned triumphant glory in the Digital Colosseum.
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 my-5 flex items-center justify-center gap-6 font-chakra font-bold text-sm tabular-nums">
              <span className="text-amber-400">+100 Bits</span>
              <span className="text-cyan-400">+30 DP</span>
              <span className="text-emerald-400">+1 Battle Win</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRematch}
                className="min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-chakra text-sm px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 cursor-pointer"
              >
                Battle Another Rival
              </button>
              <button
                onClick={handleClaimVictory}
                className="min-h-[44px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-chakra text-sm px-6 py-3 rounded-xl font-bold cursor-pointer"
              >
                Claim Spoils & Return
              </button>
            </div>
          </div>
        )}

        {/* DEFEAT STATE */}
        {matchState === 'defeat' && (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <h4 className="font-chakra font-bold text-white text-3xl">Defeated in Combat</h4>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              Train at the 6-Station Gym or equip counter-element techniques for 1.5x advantage next time!
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 my-5 font-chakra text-sm text-slate-300 tabular-nums">
              +25 Consolation Bits · +8 DP
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRematch}
                className="min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-chakra text-sm px-6 py-3 rounded-xl font-bold cursor-pointer"
              >
                Try Another Battle
              </button>
              <button
                onClick={handleClaimDefeat}
                className="min-h-[44px] bg-slate-700 hover:bg-slate-600 text-white font-chakra text-sm px-6 py-3 rounded-xl font-bold cursor-pointer"
              >
                Return & Recover
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
