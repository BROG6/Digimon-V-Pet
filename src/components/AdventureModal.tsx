import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdventureBattleResult,
  AdventureWave,
  AdventureZone,
  BattleFighter,
  BattleLogEntry,
  BattleMove,
  DigimonSpecies,
  PetState,
} from '../types/digimon';
import {
  ADVENTURE_ZONES,
  generateAllRandomizedZoneWaves,
  generateRandomizedZoneWaves,
  getStageTierCombatModifiers,
  rollBattleFoodDrops,
  rollWalkFoodDiscoveries,
} from '../data/adventureZones';
import { DIGIMON_DATABASE, SPECIAL_ITEMS } from '../data/digidex';
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
import {
  PixelBerryIcon,
  PixelMeatIcon,
  PixelMushroomIcon,
  PixelRelicIcon,
  PixelSirloinIcon,
  PixelSupplyCacheIcon,
  PixelVitaminIcon,
} from './PixelItemIcons';
import { sound, triggerHaptic } from '../utils/audio';
import { battleSoundLibrary } from '../utils/battleSoundLibrary';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Compass,
  FastForward,
  Flame,
  Footprints,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

interface AdventureModalProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onAdventureComplete: (result: AdventureBattleResult) => void;
}

type ScreenView = 'zones' | 'walking' | 'battling' | 'victory' | 'defeat';

interface BiomeStyleConfig {
  skyGradient: string;
  trailColor: string;
  trailEdge: string;
  silhouetteFill: string;
  ambientLabel: string;
  props: 'jungle' | 'ocean' | 'tundra' | 'spire' | 'caldera' | 'factory' | 'citadel';
}

const BIOME_SCENES: Record<string, BiomeStyleConfig> = {
  'emerald-jungle': {
    skyGradient: 'from-emerald-950 via-teal-900/90 to-emerald-950',
    trailColor: 'bg-gradient-to-b from-amber-900/75 via-emerald-950/90 to-slate-950',
    trailEdge: 'border-t-2 border-emerald-500/50',
    silhouetteFill: 'bg-emerald-900/55',
    ambientLabel: 'Sunlit Canopy Trail',
    props: 'jungle',
  },
  'net-ocean': {
    skyGradient: 'from-sky-950 via-blue-900/85 to-cyan-950',
    trailColor: 'bg-gradient-to-b from-cyan-900/70 via-blue-950/90 to-slate-950',
    trailEdge: 'border-t-2 border-cyan-400/50',
    silhouetteFill: 'bg-cyan-900/45',
    ambientLabel: 'Abyssal Reef Current',
    props: 'ocean',
  },
  'frost-tundra': {
    skyGradient: 'from-cyan-950 via-indigo-900/80 to-slate-950',
    trailColor: 'bg-gradient-to-b from-sky-200/20 via-slate-900/90 to-slate-950',
    trailEdge: 'border-t-2 border-sky-300/60',
    silhouetteFill: 'bg-sky-800/45',
    ambientLabel: 'Glacier Ridge Path',
    props: 'tundra',
  },
  'tempest-spire': {
    skyGradient: 'from-violet-950 via-indigo-900/80 to-slate-950',
    trailColor: 'bg-gradient-to-b from-violet-900/55 via-slate-900/90 to-slate-950',
    trailEdge: 'border-t-2 border-violet-400/50',
    silhouetteFill: 'bg-violet-800/45',
    ambientLabel: 'Cloud Citadel Walkway',
    props: 'spire',
  },
  'pyro-caldera': {
    skyGradient: 'from-rose-950 via-orange-950/90 to-stone-950',
    trailColor: 'bg-gradient-to-b from-stone-800/85 via-red-950/90 to-slate-950',
    trailEdge: 'border-t-2 border-orange-500/60',
    silhouetteFill: 'bg-red-900/50',
    ambientLabel: 'Volcanic Basalt Ridge',
    props: 'caldera',
  },
  'cyber-factory': {
    skyGradient: 'from-slate-950 via-cyan-950/85 to-slate-900',
    trailColor: 'bg-gradient-to-b from-slate-700/80 via-slate-900/95 to-slate-950',
    trailEdge: 'border-t-2 border-cyan-400/60',
    silhouetteFill: 'bg-cyan-900/40',
    ambientLabel: 'Automated Sector Catwalk',
    props: 'factory',
  },
  'dark-citadel': {
    skyGradient: 'from-purple-950 via-fuchsia-950/80 to-slate-950',
    trailColor: 'bg-gradient-to-b from-purple-950/85 via-slate-950/95 to-black',
    trailEdge: 'border-t-2 border-fuchsia-500/50',
    silhouetteFill: 'bg-purple-900/50',
    ambientLabel: 'Obsidian Fortress Causeway',
    props: 'citadel',
  },
};

const BiomeBackdropArt: React.FC<{ biome: BiomeStyleConfig; animatedWalk?: boolean }> = ({
  biome,
  animatedWalk = false,
}) => {
  const renderHorizonSlice = (keyPrefix: string) => (
    <div key={keyPrefix} className="w-1/2 h-full flex items-end justify-around px-2">
      {biome.props === 'jungle' && (
        <>
          <div className="w-16 h-24 rounded-t-full bg-emerald-900/60 border-t border-emerald-500/30" />
          <div className="w-24 h-28 rounded-t-full bg-teal-900/60 border-t border-emerald-400/30" />
          <div className="w-20 h-20 rounded-t-full bg-emerald-950/80 border-t border-emerald-500/20" />
          <div className="w-28 h-26 rounded-t-full bg-emerald-900/55 border-t border-emerald-400/25" />
        </>
      )}
      {biome.props === 'ocean' && (
        <>
          <div className="w-8 h-20 rounded-t-full bg-cyan-800/45 border border-cyan-400/25" />
          <div className="w-12 h-24 rounded-t-2xl bg-teal-800/45 border border-cyan-300/20" />
          <div className="w-10 h-16 rounded-t-full bg-blue-800/50 border border-sky-400/25" />
          <div className="w-14 h-22 rounded-t-xl bg-cyan-900/55 border border-cyan-400/25" />
        </>
      )}
      {biome.props === 'tundra' && (
        <>
          <div className="w-0 h-0 border-l-[38px] border-r-[38px] border-b-[92px] border-l-transparent border-r-transparent border-b-sky-900/60" />
          <div className="w-0 h-0 border-l-[48px] border-r-[48px] border-b-[112px] border-l-transparent border-r-transparent border-b-cyan-800/55" />
          <div className="w-0 h-0 border-l-[34px] border-r-[34px] border-b-[80px] border-l-transparent border-r-transparent border-b-indigo-900/60" />
        </>
      )}
      {biome.props === 'spire' && (
        <>
          <div className="w-24 h-10 rounded-full bg-violet-400/20 mb-12" />
          <div className="w-14 h-28 rounded-t-lg bg-indigo-900/55 border-t border-violet-300/30" />
          <div className="w-28 h-12 rounded-full bg-slate-200/15 mb-14" />
          <div className="w-12 h-24 rounded-t-lg bg-violet-900/55 border-t border-violet-300/30" />
        </>
      )}
      {biome.props === 'caldera' && (
        <>
          <div className="w-0 h-0 border-l-[42px] border-r-[42px] border-b-[88px] border-l-transparent border-r-transparent border-b-stone-900/90" />
          <div className="w-0 h-0 border-l-[54px] border-r-[54px] border-b-[108px] border-l-transparent border-r-transparent border-b-red-950/85" />
          <div className="w-0 h-0 border-l-[36px] border-r-[36px] border-b-[78px] border-l-transparent border-r-transparent border-b-stone-900/85" />
        </>
      )}
      {biome.props === 'factory' && (
        <>
          <div className="w-12 h-28 bg-slate-800/80 border border-cyan-400/30 flex flex-col justify-evenly p-1.5">
            <span className="h-1 bg-cyan-400/50 rounded" />
            <span className="h-1 bg-emerald-400/40 rounded" />
            <span className="h-1 bg-cyan-400/50 rounded" />
          </div>
          <div className="w-16 h-24 bg-slate-900/80 border border-cyan-500/25 flex flex-col justify-evenly p-1.5">
            <span className="h-1 bg-amber-400/50 rounded" />
            <span className="h-1 bg-cyan-400/50 rounded" />
          </div>
          <div className="w-14 h-28 bg-slate-800/80 border border-cyan-400/30 flex flex-col justify-evenly p-1.5">
            <span className="h-1 bg-cyan-400/50 rounded" />
            <span className="h-1 bg-cyan-400/50 rounded" />
          </div>
        </>
      )}
      {biome.props === 'citadel' && (
        <>
          <div className="w-10 h-28 bg-purple-950/80 border-x border-t border-fuchsia-500/30 rounded-t-sm" />
          <div className="w-16 h-24 bg-slate-950/85 border-x border-t border-purple-500/30 rounded-t-full" />
          <div className="w-10 h-28 bg-purple-950/80 border-x border-t border-fuchsia-500/30 rounded-t-sm" />
        </>
      )}
    </div>
  );

  const renderMidPropsSlice = (keyPrefix: string) => (
    <div key={keyPrefix} className="w-1/2 h-full flex items-end justify-around px-4">
      {biome.props === 'jungle' && (
        <>
          <div className="w-6 h-12 rounded-t-full bg-emerald-700/45" />
          <div className="w-9 h-9 rounded-t-full bg-lime-700/35" />
          <div className="w-7 h-14 rounded-t-full bg-emerald-800/45" />
        </>
      )}
      {biome.props === 'ocean' && (
        <>
          <div className="w-5 h-10 rounded-t-full bg-cyan-500/30" />
          <div className="w-7 h-12 rounded-t-lg bg-teal-400/25" />
          <div className="w-4 h-9 rounded-t-full bg-sky-400/30" />
        </>
      )}
      {biome.props === 'tundra' && (
        <>
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[32px] border-l-transparent border-r-transparent border-b-sky-300/30" />
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-b-[40px] border-l-transparent border-r-transparent border-b-cyan-200/25" />
        </>
      )}
      {biome.props === 'spire' && (
        <>
          <div className="w-8 h-11 bg-violet-400/25 rounded-t-md" />
          <div className="w-16 h-5 bg-white/15 rounded-full mb-4" />
        </>
      )}
      {biome.props === 'caldera' && (
        <>
          <div className="w-7 h-8 bg-stone-800/80 rounded-t-lg border-t border-orange-500/35" />
          <div className="w-9 h-10 bg-stone-900/85 rounded-t-md border-t border-amber-500/30" />
        </>
      )}
      {biome.props === 'factory' && (
        <>
          <div className="w-6 h-12 bg-slate-700/60 border-t-2 border-cyan-400/45" />
          <div className="w-8 h-9 bg-slate-700/55 border-t-2 border-amber-400/40" />
        </>
      )}
      {biome.props === 'citadel' && (
        <>
          <div className="w-5 h-12 bg-fuchsia-900/45 rounded-t-full border-t border-fuchsia-400/35" />
          <div className="w-7 h-10 bg-purple-900/50 rounded-t-sm" />
        </>
      )}
    </div>
  );

  const renderGroundSlice = (keyPrefix: string) => (
    <div key={keyPrefix} className="w-1/2 flex justify-around items-center opacity-55 px-2">
      <span className="w-8 h-1.5 rounded-full bg-white/35" />
      <span className="w-11 h-1.5 rounded-full bg-white/25" />
      <span className="w-7 h-1.5 rounded-full bg-white/35" />
      <span className="w-10 h-1.5 rounded-full bg-white/25" />
      <span className="w-8 h-1.5 rounded-full bg-white/35" />
    </div>
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Far layer: Distant horizon silhouettes (parallax scroll when walking) */}
      <div
        className={`absolute bottom-16 left-0 h-28 flex opacity-65 ${
          animatedWalk ? 'w-[200%] adv-scroll-far' : 'w-[200%]'
        }`}
      >
        {renderHorizonSlice('far-1')}
        {renderHorizonSlice('far-2')}
      </div>

      {/* Midground parallax props */}
      <div
        className={`absolute bottom-16 left-0 h-16 flex opacity-80 ${
          animatedWalk ? 'w-[200%] adv-scroll-mid' : 'w-[200%]'
        }`}
      >
        {renderMidPropsSlice('mid-1')}
        {renderMidPropsSlice('mid-2')}
      </div>

      {/* Ambient particles */}
      <div className="absolute inset-0">
        {biome.props === 'jungle' && (
          <>
            <span className="absolute top-10 left-[18%] w-1.5 h-1.5 rounded-full bg-lime-300/70 animate-pulse" />
            <span className="absolute top-16 left-[58%] w-1.5 h-1.5 rounded-full bg-emerald-300/70 animate-ping" />
            <span className="absolute top-8 left-[80%] w-1 h-1 rounded-full bg-amber-300/70 animate-pulse" />
          </>
        )}
        {biome.props === 'ocean' && (
          <>
            <span className="absolute top-14 left-[24%] w-2.5 h-2.5 rounded-full border border-cyan-300/60 animate-bounce" />
            <span className="absolute top-10 left-[62%] w-2 h-2 rounded-full border border-sky-200/60 animate-pulse" />
            <span className="absolute top-20 left-[82%] w-3 h-3 rounded-full border border-cyan-300/40 animate-bounce" />
          </>
        )}
        {biome.props === 'tundra' && (
          <>
            <span className="absolute top-8 left-[20%] w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce" />
            <span className="absolute top-14 left-[50%] w-1.5 h-1.5 rounded-full bg-sky-100/80 animate-pulse" />
            <span className="absolute top-6 left-[75%] w-2 h-2 rounded-full bg-white/70 animate-bounce" />
          </>
        )}
        {biome.props === 'caldera' && (
          <>
            <span className="absolute top-16 left-[28%] w-1.5 h-1.5 rounded-full bg-orange-400/90 animate-ping" />
            <span className="absolute top-10 left-[65%] w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
          </>
        )}
        {(biome.props === 'spire' || biome.props === 'factory' || biome.props === 'citadel') && (
          <>
            <span className="absolute top-12 left-[22%] w-6 h-[1px] bg-white/30 animate-pulse" />
            <span className="absolute top-16 left-[64%] w-8 h-[1px] bg-cyan-300/35 animate-pulse" />
          </>
        )}
      </div>

      {/* Near ground walking path + fast scrolling stepping stones */}
      <div className={`absolute inset-x-0 bottom-0 h-16 ${biome.trailColor} ${biome.trailEdge} overflow-hidden`}>
        <div
          className={`absolute left-0 top-3.5 flex ${
            animatedWalk ? 'w-[200%] adv-scroll-near' : 'w-[200%]'
          }`}
        >
          {renderGroundSlice('ground-1')}
          {renderGroundSlice('ground-2')}
        </div>
      </div>
    </div>
  );
};

export const AdventureModal: React.FC<AdventureModalProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onAdventureComplete,
}) => {
  const [view, setView] = useState<ScreenView>('zones');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(ADVENTURE_ZONES[0].id);
  const [zoneWavesMap, setZoneWavesMap] = useState<Record<string, AdventureWave[]>>(() =>
    generateAllRandomizedZoneWaves()
  );
  const [activeWave, setActiveWave] = useState<AdventureWave | null>(null);

  // Walking expedition state
  const [walkProgress, setWalkProgress] = useState<number>(0);
  const [walkLoot, setWalkLoot] = useState<('mushroom' | 'berry')[]>([]);
  const [walkLootClaimedIndex, setWalkLootClaimedIndex] = useState<number>(0);
  const [walkDiscoveryBanner, setWalkDiscoveryBanner] = useState<string | null>(null);
  const walkLootRef = useRef<('mushroom' | 'berry')[]>([]);

  // Combat State
  const [playerFighter, setPlayerFighter] = useState<BattleFighter | null>(null);
  const [opponentFighter, setOpponentFighter] = useState<BattleFighter | null>(null);
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [playerActionAnim, setPlayerActionAnim] = useState<'idle' | 'attack' | 'attack_melee' | 'attack_ranged' | 'happy' | 'sick'>('idle');
  const [opponentActionAnim, setOpponentActionAnim] = useState<'idle' | 'attack' | 'attack_melee' | 'attack_ranged' | 'happy' | 'sick'>('idle');
  const [isDefending, setIsDefending] = useState<boolean>(false);
  const [isCharged, setIsCharged] = useState<boolean>(false);

  // Animations & Popups
  const [playerEffect, setPlayerEffect] = useState<'none' | 'lunge' | 'melee_rush' | 'ranged_cast' | 'hit' | 'shield' | 'charge'>('none');
  const [opponentEffect, setOpponentEffect] = useState<'none' | 'lunge' | 'melee_rush' | 'ranged_cast' | 'hit'>('none');
  const [activeVfx, setActiveVfx] = useState<ActiveBattleVfx | null>(null);
  const [arenaShake, setArenaShake] = useState<boolean>(false);
  const [damagePopups, setDamagePopups] = useState<{ id: number; target: 'player' | 'opponent'; text: string; color: string }[]>([]);

  // Field supplies used in the current encounter
  const [meatUsed, setMeatUsed] = useState<number>(0);
  const [vitaminsUsed, setVitaminsUsed] = useState<number>(0);
  const [lastResult, setLastResult] = useState<AdventureBattleResult | null>(null);
  const completionReportedRef = useRef<boolean>(false);

  const clearedMap = pet.adventureClearedWave || {};
  const selectedZone: AdventureZone = useMemo(
    () => ADVENTURE_ZONES.find((z) => z.id === selectedZoneId) || ADVENTURE_ZONES[0],
    [selectedZoneId]
  );

  const activeZoneWaves = useMemo(
    () => zoneWavesMap[selectedZone.id] || selectedZone.waves,
    [selectedZone, zoneWavesMap]
  );

  const rerollZoneWaves = (zoneId: string) => {
    const targetZone = ADVENTURE_ZONES.find((z) => z.id === zoneId);
    if (!targetZone) return;
    setZoneWavesMap((prev) => ({
      ...prev,
      [zoneId]: generateRandomizedZoneWaves(targetZone),
    }));
  };

  const activeBiome = BIOME_SCENES[selectedZone.id] || BIOME_SCENES['emerald-jungle'];

  const totalClearedWaves = useMemo(
    () => ADVENTURE_ZONES.reduce((acc, z) => acc + Math.min(z.waves.length, clearedMap[z.id] ?? 0), 0),
    [clearedMap]
  );
  const totalPossibleWaves = ADVENTURE_ZONES.reduce((acc, z) => acc + z.waves.length, 0);

  const remainingMeat = Math.max(0, pet.bigMeatStock - meatUsed);
  const remainingVitamins = Math.max(0, pet.vitaminStock - vitaminsUsed);

  // Reset modal view & roll fresh element-matched waves when opened
  useEffect(() => {
    if (isOpen) {
      setView('zones');
      setZoneWavesMap(generateAllRandomizedZoneWaves());
      setActiveWave(null);
      setPlayerFighter(null);
      setOpponentFighter(null);
      setBattleLogs([]);
      setIsPlayerTurn(true);
      setIsDefending(false);
      setIsCharged(false);
      setPlayerEffect('none');
      setOpponentEffect('none');
      setActiveVfx(null);
      setArenaShake(false);
      setDamagePopups([]);
      setMeatUsed(0);
      setVitaminsUsed(0);
      setLastResult(null);
      setWalkProgress(0);
      setWalkLoot([]);
      setWalkLootClaimedIndex(0);
      setWalkDiscoveryBanner(null);
      walkLootRef.current = [];
      completionReportedRef.current = false;
    }
  }, [isOpen]);

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
    }, 1000);
  };

  const triggerArenaShake = () => {
    setArenaShake(true);
    setTimeout(() => setArenaShake(false), 450);
  };

  const estimateOpponentStats = (wave: AdventureWave) => {
    const oppSpecies = DIGIMON_DATABASE[wave.speciesId] || DIGIMON_DATABASE['agumon'];
    const mult = wave.statMultiplier;
    return {
      oppSpecies,
      hp: Math.round(oppSpecies.baseHp * mult),
      atk: Math.round(oppSpecies.baseAtk * mult),
      def: Math.round(oppSpecies.baseDef * mult),
      spd: Math.round(oppSpecies.baseSpd * (0.95 + (mult - 0.8) * 0.4)),
    };
  };

  const beginBattleEncounter = (zone: AdventureZone, wave: AdventureWave) => {
    if (!species || pet.stage === 'egg') return;

    const stats = getEffectiveBattleStats(pet, species);
    const equippedMoves = getEquippedBattleMoves(pet, species);
    const playerEl = getSpeciesElementType(species);

    const player: BattleFighter = {
      id: 'adv-player',
      name: pet.nickname || species.name,
      speciesId: species.id,
      stage: pet.stage,
      crest: species.crest || 'courage',
      element: playerEl,
      currentHp: stats.maxHp,
      maxHp: stats.maxHp,
      mp: stats.maxMp,
      maxMp: stats.maxMp,
      sp: 50,
      atk: stats.offense,
      def: stats.defense,
      spd: stats.speed,
      brains: stats.brains,
      signatureMove: species.signatureMove,
      equippedMoves,
      isPlayer: true,
    };

    const { oppSpecies, hp, atk: oppAtk, def: oppDef, spd } = estimateOpponentStats(wave);
    const oppEl = getSpeciesElementType(oppSpecies);
    const opponent: BattleFighter = {
      id: `adv-opp-${wave.waveNumber}`,
      name: oppSpecies.name,
      speciesId: oppSpecies.id,
      stage: oppSpecies.stage,
      crest: oppSpecies.crest,
      element: oppEl,
      currentHp: hp,
      maxHp: hp,
      mp: 60,
      maxMp: 60,
      sp: wave.waveNumber >= 4 ? 35 : 15,
      atk: oppAtk,
      def: oppDef,
      spd,
      signatureMove: oppSpecies.signatureMove,
      isPlayer: false,
    };

    completionReportedRef.current = false;
    setSelectedZoneId(zone.id);
    setActiveWave(wave);
    setPlayerFighter(player);
    setOpponentFighter(opponent);
    setIsPlayerTurn(true);
    setIsDefending(false);
    setIsCharged(false);
    setPlayerActionAnim('idle');
    setOpponentActionAnim('idle');
    setPlayerEffect('none');
    setOpponentEffect('none');
    setActiveVfx(null);
    setDamagePopups([]);
    setMeatUsed(0);
    setVitaminsUsed(0);
    setLastResult(null);
    setBattleLogs([
      {
        id: 'adv-start',
        text: `${zone.name} · Wave ${wave.waveNumber}: ${wave.bossFlavor}`,
        type: 'action',
      },
    ]);
    setView('battling');
  };

  // Start Walking Expedition along the styled Biome Trail before Combat
  const startWaveBattle = (zone: AdventureZone, wave: AdventureWave) => {
    if (!species || pet.stage === 'egg') return;

    sound.playButton();
    triggerHaptic('medium');

    const rolledWalkLoot = rollWalkFoodDiscoveries();
    walkLootRef.current = rolledWalkLoot;
    setSelectedZoneId(zone.id);
    setActiveWave(wave);
    setWalkLoot(rolledWalkLoot);
    setWalkLootClaimedIndex(0);
    setWalkDiscoveryBanner(null);
    setWalkProgress(0);
    setView('walking');
  };

  // Walking Expedition Timer Loop
  useEffect(() => {
    if (view !== 'walking' || !activeWave) return;

    const startTime = Date.now();
    const walkDurationMs = 2800;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / walkDurationMs) * 100));
      setWalkProgress(pct);

      // Reveal first trail pickup at 32% and second at 56%
      if (pct >= 32 && walkLootRef.current.length >= 1) {
        setWalkLootClaimedIndex((prev) => {
          if (prev < 1) {
            sound.playEat();
            triggerHaptic('light');
            const item = walkLootRef.current[0];
            setWalkDiscoveryBanner(
              item === 'mushroom' ? 'Found +1 Digi-Mushroom on the trail!' : 'Found +1 Digi-Berry on the trail!'
            );
            return 1;
          }
          return prev;
        });
      }
      if (pct >= 56 && walkLootRef.current.length >= 2) {
        setWalkLootClaimedIndex((prev) => {
          if (prev < 2) {
            sound.playEat();
            triggerHaptic('light');
            const item = walkLootRef.current[1];
            setWalkDiscoveryBanner(
              item === 'mushroom' ? 'Found another +1 Digi-Mushroom!' : 'Found another +1 Digi-Berry!'
            );
            return 2;
          }
          return prev;
        });
      }

      if (pct >= 100) {
        window.clearInterval(interval);
        sound.playAlert();
        triggerHaptic('medium');
        beginBattleEncounter(selectedZone, activeWave);
      }
    }, 60);

    return () => window.clearInterval(interval);
  }, [view, activeWave, selectedZone]);

  // Enemy Turn Loop
  useEffect(() => {
    if (view !== 'battling' || isPlayerTurn || !opponentFighter || !playerFighter || !activeWave) return;

    const stageMods = getStageTierCombatModifiers(pet.stage, activeWave.stageLabel);

    const timer = setTimeout(() => {
      const canUseSpecial = opponentFighter.sp >= 50;
      const specialChance = activeWave.waveNumber >= 5 ? 0.72 : activeWave.waveNumber >= 4 ? 0.58 : 0.45;
      const shouldUseSpecial = canUseSpecial && Math.random() < specialChance;
      const oppSpecies = DIGIMON_DATABASE[opponentFighter.speciesId];

      const enemyBossCritBonus = activeWave.waveNumber >= 6 ? 0.06 : activeWave.waveNumber >= 4 ? 0.03 : 0;

      if (shouldUseSpecial) {
        const moveEl = mapMoveTypeToElement(opponentFighter.signatureMove, oppSpecies);
        const typeMult = getElementDamageMultiplier(moveEl, playerFighter.element || 'neutral');
        const crit = rollCriticalHit({
          attackerSpd: opponentFighter.spd,
          defenderSpd: playerFighter.spd,
          isSpecial: true,
          bonusChance: enemyBossCritBonus,
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

        const movePower = Math.round(
          opponentFighter.signatureMove.power * (0.72 + activeWave.statMultiplier * 0.22)
        );
        const baseDmg = Math.max(
          9,
          Math.floor((movePower - (isDefending ? playerFighter.def * 0.78 : playerFighter.def * 0.34)) * typeMult)
        );
        const tierScaled = Math.round(baseDmg * stageMods.enemyDamageMult * crit.multiplier);
        const finalDamage = isDefending ? Math.max(4, Math.floor(tierScaled * 0.4)) : tierScaled;

        setOpponentFighter((prev) => (prev ? { ...prev, sp: prev.sp - 50 } : null));

        setTimeout(() => {
          setPlayerEffect('hit');
          triggerArenaShake();
          showDamagePopup(
            'player',
            `${crit.isCrit ? 'CRIT! ' : ''}${typeMult > 1 ? '1.5x ' : ''}-${finalDamage}!`,
            crit.isCrit
              ? 'text-yellow-300 font-black'
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
            text: `${opponentFighter.name} ${oppSpec.motion === 'melee' ? 'unleashed' : 'fired'} ${opponentFighter.signatureMove.name} (${ATTACK_ELEMENT_META[moveEl].label}) for ${finalDamage} damage${crit.isCrit ? ' [CRITICAL HIT! 1.75x]' : ''}${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
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
          bonusChance: enemyBossCritBonus,
        });
        const sigSpec = classifyAttackVisual(opponentFighter.signatureMove, oppSpecies);
        const useRangedBasic = sigSpec.motion === 'melee' && Math.random() < 0.42;
        const atkSpec = useRangedBasic
          ? getRangedVolleyVisual(oppEl, `${opponentFighter.name} Shot`)
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

        const baseDmg = Math.max(
          7,
          Math.floor((opponentFighter.atk * 0.72 - (isDefending ? playerFighter.def * 0.68 : playerFighter.def * 0.3)) * typeMult)
        );
        const tierScaled = Math.round(baseDmg * stageMods.enemyDamageMult * crit.multiplier);
        const finalDamage = isDefending ? Math.max(3, Math.floor(tierScaled * 0.4)) : tierScaled;

        setOpponentFighter((prev) =>
          prev ? { ...prev, sp: Math.min(100, prev.sp + (activeWave.waveNumber >= 4 ? 22 : 18)) } : null
        );

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
  }, [isPlayerTurn, view, opponentFighter, playerFighter, isDefending, activeWave, pet.stage]);

  // Detect Battle Completion & Immediately Persist Rewards
  useEffect(() => {
    if (view !== 'battling' || !playerFighter || !opponentFighter || !activeWave) return;
    if (completionReportedRef.current) return;

    const walkMushrooms = walkLootRef.current.filter((f) => f === 'mushroom').length;
    const walkBerries = walkLootRef.current.filter((f) => f === 'berry').length;

    if (opponentFighter.currentHp <= 0) {
      completionReportedRef.current = true;
      sound.playVictory();
      try {
        confetti({ particleCount: 95, spread: 75, origin: { y: 0.6 } });
      } catch {}

      const prevCleared = clearedMap[selectedZone.id] ?? 0;
      const isFirstClearOfWave = activeWave.waveNumber > prevCleared;
      const isBossWave = activeWave.waveNumber === selectedZone.waves.length;
      const ownedRelics = pet.ownedSpecialItems || [];
      const unlockedRelicId =
        isBossWave &&
        selectedZone.firstClearRelicId &&
        !ownedRelics.includes(selectedZone.firstClearRelicId)
          ? selectedZone.firstClearRelicId
          : undefined;

      // Net Ocean Boss special supply bonus if no Crest relic attached
      const supplyCacheBonusBits = isBossWave && isFirstClearOfWave && !selectedZone.firstClearRelicId ? 200 : 0;
      const supplyCacheBonusMeat = isBossWave && isFirstClearOfWave && !selectedZone.firstClearRelicId ? 3 : 0;
      const supplyCacheBonusVit = isBossWave && isFirstClearOfWave && !selectedZone.firstClearRelicId ? 2 : 0;

      // Random food drops: Mushroom & Berry any tier; Prime Sirloin STRICTLY Ultimate/Mega only
      const battleFood = rollBattleFoodDrops(activeWave.stageLabel);

      const result: AdventureBattleResult = {
        zoneId: selectedZone.id,
        waveNumber: activeWave.waveNumber,
        won: true,
        strengthGained: activeWave.strengthReward + (isFirstClearOfWave ? 2 : 0),
        dpGained: activeWave.dpReward + (isFirstClearOfWave ? 5 : 0),
        effortGained: activeWave.effortReward,
        bitsGained: activeWave.bitsReward + supplyCacheBonusBits + (isFirstClearOfWave ? 20 : 0),
        meatGained: activeWave.meatDrop + supplyCacheBonusMeat,
        vitaminsGained: activeWave.vitaminDrop + supplyCacheBonusVit,
        mushroomGained: walkMushrooms + battleFood.mushroom,
        berryGained: walkBerries + battleFood.berry,
        sirloinGained: battleFood.sirloin,
        walkFoodFound: walkLootRef.current,
        unlockedRelicId,
        meatUsed,
        vitaminsUsed,
        isFirstClearOfWave,
        opponentName: opponentFighter.name,
        opponentSpeciesId: opponentFighter.speciesId,
      };

      setLastResult(result);
      onAdventureComplete(result);
      setView('victory');
    } else if (playerFighter.currentHp <= 0) {
      completionReportedRef.current = true;
      const result: AdventureBattleResult = {
        zoneId: selectedZone.id,
        waveNumber: activeWave.waveNumber,
        won: false,
        strengthGained: 2,
        dpGained: 5,
        effortGained: 1,
        bitsGained: 15,
        meatGained: 0,
        vitaminsGained: 0,
        mushroomGained: walkMushrooms,
        berryGained: walkBerries,
        sirloinGained: 0,
        walkFoodFound: walkLootRef.current,
        meatUsed,
        vitaminsUsed,
        isFirstClearOfWave: false,
        opponentName: opponentFighter.name,
        opponentSpeciesId: opponentFighter.speciesId,
      };

      rerollZoneWaves(selectedZone.id);
      setLastResult(result);
      onAdventureComplete(result);
      setView('defeat');
    }
  }, [
    playerFighter?.currentHp,
    opponentFighter?.currentHp,
    view,
    activeWave,
    selectedZone,
    clearedMap,
    pet.ownedSpecialItems,
    meatUsed,
    vitaminsUsed,
    onAdventureComplete,
  ]);

  // Player Combat Actions
  const handlePlayerAttack = () => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter || !activeWave) return;
    setIsPlayerTurn(false);

    const stageMods = getStageTierCombatModifiers(pet.stage, activeWave.stageLabel);
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

    const rawDamage = Math.max(
      12,
      Math.floor((playerFighter.atk * 0.96 * chargeMult - opponentFighter.def * 0.28) * typeMult * crit.multiplier)
    );
    const damage = Math.max(3, Math.floor(rawDamage * stageMods.playerDamageMult));

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
          ? 'text-yellow-300 font-black'
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
        text: `${playerFighter.name} struck ${opponentFighter.name} for ${damage} damage (+8 MP)${crit.isCrit ? ' [CRITICAL HIT! 1.75x]' : ''}${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
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
    if (!isPlayerTurn || !playerFighter || !opponentFighter || !activeWave || playerFighter.sp < 50) return;
    setIsPlayerTurn(false);

    const stageMods = getStageTierCombatModifiers(pet.stage, activeWave.stageLabel);
    const moveEl = mapMoveTypeToElement(playerFighter.signatureMove, species);
    const typeMult = getElementDamageMultiplier(moveEl, opponentFighter.element || 'neutral');
    const mult = isCharged ? 1.65 : 1.25;
    const brainsBonus = Math.floor((playerFighter.brains || 20) * 0.14);
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

    const rawDamage = Math.max(
      24,
      Math.floor(
        (playerFighter.signatureMove.power * mult + playerFighter.atk * 0.35 + brainsBonus - opponentFighter.def * 0.35) *
          typeMult *
          crit.multiplier
      )
    );
    const damage = Math.max(6, Math.floor(rawDamage * stageMods.playerDamageMult));

    setPlayerFighter((prev) => (prev ? { ...prev, sp: prev.sp - 50 } : null));
    setIsCharged(false);

    setTimeout(() => {
      setOpponentEffect('hit');
      triggerArenaShake();
      showDamagePopup(
        'opponent',
        `${crit.isCrit ? 'CRIT! ' : ''}${typeMult > 1 ? '1.5x ADV! ' : ''}-${damage}!`,
        crit.isCrit
          ? 'text-yellow-300 font-black'
          : typeMult > 1
          ? 'text-emerald-300 font-extrabold'
          : 'text-orange-400 font-extrabold'
      );
      setOpponentFighter((prev) =>
        prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - damage) } : null
      );
    }, 460);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `${playerFighter.name} unleashed ${playerFighter.signatureMove.name} (${ATTACK_ELEMENT_META[moveEl].label}) for ${damage} damage${crit.isCrit ? ' [CRITICAL HIT! 1.75x]' : ''}${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
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
    if (!isPlayerTurn || !playerFighter || !opponentFighter || !activeWave) return;
    const currentMp = playerFighter.mp ?? 0;
    if (currentMp < move.mpCost) return;

    setIsPlayerTurn(false);
    const stageMods = getStageTierCombatModifiers(pet.stage, activeWave.stageLabel);
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

    const rawDamage = Math.max(
      18,
      Math.floor(
        (move.power * 1.15 * chargeMult + playerFighter.atk * 0.42 + brainsBonus - opponentFighter.def * 0.25) *
          typeMult *
          crit.multiplier
      )
    );
    const damage = Math.max(5, Math.floor(rawDamage * stageMods.playerDamageMult));

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
          ? 'text-yellow-300 font-black'
          : typeMult > 1
          ? 'text-emerald-300 font-extrabold'
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
    showDamagePopup('player', 'SHIELD', 'text-cyan-300 font-bold');

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            sp: Math.min(100, prev.sp + 15),
            mp: Math.min(prev.maxMp || 100, (prev.mp || 0) + 12),
          }
        : null
    );

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `${playerFighter.name} braced with Digi-Shield (-60% incoming damage, +12 MP).`,
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
    showDamagePopup('player', 'CHARGED', 'text-amber-300 font-bold');

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
        text: `${playerFighter.name} focused battle energy (+35 SP, +18 MP & boosted next strike).`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => setPlayerEffect('none'), 900);
  };

  const handleUseMeatInBattle = () => {
    if (!isPlayerTurn || !playerFighter || remainingMeat <= 0) return;
    if (playerFighter.currentHp >= playerFighter.maxHp) return;

    setIsPlayerTurn(false);
    sound.playEat();
    triggerHaptic('medium');
    setMeatUsed((m) => m + 1);
    const healAmount = Math.max(25, Math.round(playerFighter.maxHp * 0.45));
    setPlayerActionAnim('happy');
    showDamagePopup('player', `+${healAmount} HP`, 'text-emerald-300 font-extrabold');

    setPlayerFighter((prev) =>
      prev ? { ...prev, currentHp: Math.min(prev.maxHp, prev.currentHp + healAmount) } : null
    );

    setBattleLogs((logs) => [
      {
        id: `pl-heal-${Date.now()}`,
        text: `${playerFighter.name} ate Big Meat and restored ${healAmount} HP!`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => setPlayerActionAnim('idle'), 700);
  };

  const handleUseVitaminInBattle = () => {
    if (!isPlayerTurn || !playerFighter || remainingVitamins <= 0) return;

    setIsPlayerTurn(false);
    sound.playMedicine();
    triggerHaptic('medium');
    setVitaminsUsed((v) => v + 1);
    const healAmount = Math.max(18, Math.round(playerFighter.maxHp * 0.3));
    const mpRecover = Math.max(15, Math.round((playerFighter.maxMp || 60) * 0.35));
    setPlayerActionAnim('happy');
    showDamagePopup('player', `+${healAmount} HP · +${mpRecover} MP`, 'text-purple-300 font-extrabold');

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            currentHp: Math.min(prev.maxHp, prev.currentHp + healAmount),
            mp: Math.min(prev.maxMp || 100, (prev.mp || 0) + mpRecover),
            sp: Math.min(100, prev.sp + 30),
          }
        : null
    );

    setBattleLogs((logs) => [
      {
        id: `pl-vit-${Date.now()}`,
        text: `${playerFighter.name} took a Vitamin (+${healAmount} HP, +${mpRecover} MP & +30 SP)!`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => setPlayerActionAnim('idle'), 700);
  };

  if (!isOpen) return null;

  const handleEnterAdventureZone = (zone: AdventureZone) => {
    if (!species || pet.stage === 'egg') return;
    const zoneCleared = Math.min(zone.waves.length, clearedMap[zone.id] ?? 0);
    let zoneWaves = zoneWavesMap[zone.id] || zone.waves;
    let startIdx = zoneCleared;
    if (zoneCleared >= zone.waves.length) {
      zoneWaves = generateRandomizedZoneWaves(zone);
      setZoneWavesMap((prev) => ({
        ...prev,
        [zone.id]: zoneWaves,
      }));
      startIdx = 0;
    }
    const targetWave = zoneWaves[startIdx] || zoneWaves[0];
    if (targetWave) {
      startWaveBattle(zone, targetWave);
    }
  };

  const nextWaveAfterVictory =
    activeWave && activeWave.waveNumber < activeZoneWaves.length
      ? activeZoneWaves[activeWave.waveNumber]
      : null;
  const activeStageMods = activeWave
    ? getStageTierCombatModifiers(pet.stage, activeWave.stageLabel)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/95 android-safe-modal">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h2 className="font-chakra font-bold text-white text-lg sm:text-xl truncate">
                {view === 'zones'
                  ? 'Digital World Adventure'
                  : `${selectedZone.name} · Wave ${activeWave?.waveNumber || 1}`}
              </h2>
              <p className="text-xs text-slate-400 truncate tabular-nums">
                {pet.nickname || species?.name || 'Partner'} · STR {pet.strength} · DP {pet.dpPoints} · Cleared{' '}
                {totalClearedWaves}/{totalPossibleWaves} Waves
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close Adventure Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Egg Guard Warning */}
        {pet.stage === 'egg' && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs font-chakra">
            Your Digi-Egg needs to hatch before entering Adventure expeditions. Tap your Digivice egg or wait a few moments to hatch!
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pt-4 pr-0.5">
          {/* VIEW 1: ENVIRONMENT SELECTION */}
          {view === 'zones' && (
            <div className="space-y-4">
              {/* Partner Readiness Strip */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {species && (
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
                      <DigimonSprite species={species} action="idle" scale={0.62} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-chakra font-bold text-white text-sm truncate">
                      {pet.nickname || species?.name} ({species?.stage || pet.stage})
                    </div>
                    <div className="text-xs text-slate-400 tabular-nums">
                      Strength {pet.strength} · Effort {pet.effort ?? 0}/10 · Big Meat {pet.bigMeatStock} · Vitamins{' '}
                      {pet.vitaminStock}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-emerald-300 font-chakra">
                  Trail drops Mushrooms/Berries · Ultimates & Megas drop Prime Sirloin!
                </div>
              </div>

              {/* Environment Biome Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ADVENTURE_ZONES.map((zone) => {
                  const zoneCleared = Math.min(zone.waves.length, clearedMap[zone.id] ?? 0);
                  const isBossDefeated = zoneCleared >= zone.waves.length;
                  const relic = zone.firstClearRelicId ? SPECIAL_ITEMS[zone.firstClearRelicId] : undefined;
                  const hasRelic = zone.firstClearRelicId
                    ? (pet.ownedSpecialItems || []).includes(zone.firstClearRelicId)
                    : false;

                  return (
                    <div
                      key={zone.id}
                      className={`text-left rounded-2xl border p-4 transition-all bg-gradient-to-br ${zone.backdropClass} flex flex-col justify-between gap-3 ${
                        isBossDefeated
                          ? 'border-emerald-400/50'
                          : 'border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-chakra font-semibold text-slate-300/90">
                            Zone {String(zone.order).padStart(2, '0')} · {zone.environmentTag}
                          </div>
                          <h3 className="font-chakra font-bold text-white text-lg mt-0.5 truncate">
                            {zone.name}
                          </h3>
                          <p className="text-xs text-slate-300/80 mt-1 line-clamp-2">{zone.subtitle}</p>
                        </div>

                        {/* Digi Relic Thumbnail (blanked-out silhouette until unlocked; no boss sprite spoilers) */}
                        <div
                          className={`relative w-16 h-16 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden ${
                            (relic && hasRelic) || (!relic && isBossDefeated)
                              ? 'bg-slate-950/85 border-amber-400/50 shadow-inner'
                              : 'bg-slate-950/85 border-white/15'
                          }`}
                          title={
                            relic
                              ? hasRelic
                                ? `${relic.name} (Unlocked)`
                                : `${relic.shortName} (Locked)`
                              : isBossDefeated
                              ? 'Deep Sea Supply Cache (Unlocked)'
                              : 'Deep Sea Supply Cache (Locked)'
                          }
                        >
                          {relic ? (
                            <div className={hasRelic ? '' : 'brightness-0 contrast-200 opacity-45'}>
                              <PixelRelicIcon relicId={relic.id} className="w-10 h-10" />
                            </div>
                          ) : (
                            <div className={isBossDefeated ? '' : 'brightness-0 contrast-200 opacity-45'}>
                              <PixelSupplyCacheIcon className="w-10 h-10" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-white/10 space-y-2.5">
                        <div className="text-xs text-slate-200 font-chakra tabular-nums">
                          Cleared {zoneCleared}/{zone.waves.length} · Rec. STR {zone.recommendedStrength}+
                          {relic && (
                            <span className="text-amber-300">
                              {' '}
                              · {relic.shortName} {hasRelic ? '(Owned)' : '(Boss Drop)'}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={pet.stage === 'egg'}
                          onClick={() => handleEnterAdventureZone(zone)}
                          className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-white/20 hover:border-amber-300/70 text-white font-chakra font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          <Footprints className="w-4 h-4 text-emerald-300 shrink-0" />
                          <span className="truncate">Enter {zone.name}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2.5: BIOME WALKING PATH & FOOD DISCOVERY */}
          {view === 'walking' && activeWave && species && (
            <div className="space-y-4 py-1">
              <div
                className={`relative w-full h-64 sm:h-72 rounded-2xl border border-slate-700 bg-gradient-to-b ${activeBiome.skyGradient} overflow-hidden flex flex-col justify-between p-4`}
              >
                <BiomeBackdropArt biome={activeBiome} animatedWalk />

                {/* Top Path Banner */}
                <div className="relative z-20 flex items-center justify-between gap-2">
                  <div className="px-3 py-1 rounded-xl bg-slate-950/85 border border-white/15 font-chakra text-xs text-slate-200 flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                    <span>
                      {selectedZone.name} · {activeBiome.ambientLabel}
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-slate-950/85 border border-white/15 font-pixel text-[9px] text-amber-300 tabular-nums">
                    TRAIL {walkProgress}%
                  </div>
                </div>

                {/* Mid-Walk Discovery Toast */}
                {walkDiscoveryBanner && (
                  <div className="relative z-20 self-center px-3.5 py-1.5 rounded-full bg-amber-950/90 border border-amber-400/70 text-amber-200 font-chakra font-bold text-xs flex items-center gap-1.5 shadow-lg animate-bounce">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{walkDiscoveryBanner}</span>
                  </div>
                )}

                {/* Walking Actors along the ground trail */}
                <div className="relative z-10 h-32 w-full flex items-end justify-between px-4 sm:px-10 pb-3">
                  {/* Player walking smoothly in place over scrolling parallax terrain */}
                  <div className="flex flex-col items-center">
                    <DigimonSprite species={species} action="walk" facing="right" scale={0.95} />
                  </div>

                  {/* Trail food pickup on the path before reaching enemy */}
                  {walkLoot.length > 0 && walkProgress < 68 && (
                    <div
                      className={`mb-2 flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-950/80 border border-amber-400/50 transition-all duration-300 ${
                        walkLootClaimedIndex > 0 ? 'opacity-40 -translate-y-4 scale-90' : 'animate-bounce'
                      }`}
                    >
                      {walkLoot[0] === 'mushroom' ? (
                        <PixelMushroomIcon className="w-6 h-6" />
                      ) : (
                        <PixelBerryIcon className="w-6 h-6" />
                      )}
                    </div>
                  )}

                  {/* Incoming enemy appears on screen from ~55% onwards (unmasked once encountered!) */}
                  {(() => {
                    const oppSpecies = DIGIMON_DATABASE[activeWave.speciesId];
                    const showEnemy = walkProgress >= 55 && oppSpecies;
                    return (
                      <div
                        className={`transition-all duration-500 flex flex-col items-center ${
                          showEnemy ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                        }`}
                      >
                        {showEnemy && oppSpecies && (
                          <>
                            <span className="mb-1 px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500/50 font-pixel text-[8px] text-rose-200">
                              {oppSpecies.name} AHEAD!
                            </span>
                            <DigimonSprite species={oppSpecies} action="idle" facing="left" scale={0.95} />
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Progress Bar & Skip Button */}
              <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-chakra text-slate-300 mb-1.5">
                    <span>
                      {walkProgress < 55
                        ? `Scanning ${selectedZone.name} trail (${activeWave.stageLabel} Wave)...`
                        : `${DIGIMON_DATABASE[activeWave.speciesId]?.name || 'Wild Digimon'} appeared along the path!`}
                    </span>
                    {walkLootClaimedIndex > 0 && (
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        Picked up{' '}
                        {walkLoot.slice(0, walkLootClaimedIndex).map((item, idx) =>
                          item === 'mushroom' ? (
                            <PixelMushroomIcon key={idx} className="w-4 h-4 inline" />
                          ) : (
                            <PixelBerryIcon key={idx} className="w-4 h-4 inline" />
                          )
                        )}
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-100"
                      style={{ width: `${walkProgress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playButton();
                    beginBattleEncounter(selectedZone, activeWave);
                  }}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-chakra font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FastForward className="w-3.5 h-3.5" /> Skip Walk to Battle
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: ENVIRONMENT COMBAT STAGE */}
          {view === 'battling' && playerFighter && opponentFighter && activeWave && (
            <div className="space-y-3.5">
              {/* Stage Disadvantage Warning if fighting higher tier */}
              {activeStageMods?.label && (
                <div className="px-3 py-2 rounded-xl bg-rose-950/65 border border-rose-500/50 text-rose-200 text-xs font-chakra flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      Tier Disadvantage ({pet.stage.toUpperCase()} vs {activeWave.stageLabel.toUpperCase()}):{' '}
                      {activeStageMods.label} & Enemy hits {activeStageMods.enemyDamageMult}x harder!
                    </span>
                  </span>
                </div>
              )}

              {/* Arena Canvas */}
              <div
                className={`relative w-full h-56 sm:h-64 rounded-2xl border border-slate-700 bg-gradient-to-b ${activeBiome.skyGradient} p-3.5 sm:p-5 flex justify-between items-center overflow-hidden [--battle-dash:125px] sm:[--battle-dash:275px] md:[--battle-dash:360px] ${
                  arenaShake ? 'battle-arena-shake' : ''
                }`}
              >
                <BiomeBackdropArt biome={activeBiome} />

                <BattleAttackVfx activeVfx={activeVfx} />

                {/* Turn Status Banner */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950/90 border border-slate-700 rounded-lg font-chakra font-semibold text-xs text-amber-300 z-20 whitespace-nowrap">
                  {isPlayerTurn
                    ? 'Your Turn — Choose Command'
                    : `${opponentFighter.name} (${activeWave.stageLabel}) Acting...`}
                </div>

                {/* Player Fighter */}
                <div className={`flex flex-col items-center relative ${playerEffect === 'melee_rush' ? 'z-20' : 'z-10'}`}>
                  <div className="w-32 sm:w-40 bg-slate-950/90 border border-cyan-500/40 rounded-xl p-2 mb-2 text-xs font-chakra tabular-nums">
                    <div className="flex justify-between text-cyan-200 font-bold mb-0.5 gap-1">
                      <span className="truncate">{playerFighter.name}</span>
                      <span className="text-[10px] text-slate-300 shrink-0">
                        {ATTACK_ELEMENT_META[playerFighter.element || 'neutral'].shortLabel}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
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
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${((playerFighter.mp ?? 0) / (playerFighter.maxMp || 1)) * 100}%` }}
                        />
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
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

                {/* VS Indicator */}
                <div className="hidden sm:flex flex-col items-center opacity-50 z-10">
                  <span className="font-chakra font-bold text-xl text-slate-300">VS</span>
                  <span className="text-[11px] text-slate-400">{activeWave.stageLabel}</span>
                </div>

                {/* Opponent Fighter */}
                <div className={`flex flex-col items-center relative ${opponentEffect === 'melee_rush' ? 'z-20' : 'z-10'}`}>
                  <div className="w-32 sm:w-40 bg-slate-950/90 border border-rose-500/40 rounded-xl p-2 mb-2 text-xs font-chakra tabular-nums">
                    <div className="flex justify-between text-rose-200 font-bold mb-0.5 gap-1">
                      <span className="truncate">{opponentFighter.name}</span>
                      <span className="text-[10px] text-slate-300 shrink-0">
                        {ATTACK_ELEMENT_META[opponentFighter.element || 'neutral'].shortLabel}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                      <span>HP {opponentFighter.currentHp}/{opponentFighter.maxHp}</span>
                      <span className="text-amber-300">SP {opponentFighter.sp}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 transition-all duration-300"
                        style={{ width: `${(opponentFighter.currentHp / opponentFighter.maxHp) * 100}%` }}
                      />
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
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

              {/* Equipped Techniques (Max 4 MP Attacks) */}
              {playerFighter.equippedMoves && playerFighter.equippedMoves.length > 0 && (
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
                        className={`min-h-[50px] px-2.5 py-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer active:scale-95 disabled:opacity-40 ${
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
              )}

              {/* Combat Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  disabled={!isPlayerTurn}
                  onClick={handlePlayerAttack}
                  className="min-h-[54px] px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold text-white cursor-pointer active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-slate-200" /> Attack
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">+20 SP · +8 MP</span>
                </button>

                <button
                  disabled={!isPlayerTurn || playerFighter.sp < 50}
                  onClick={handlePlayerSpecial}
                  className="min-h-[54px] px-3 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-45 text-slate-950 border border-amber-300 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold cursor-pointer active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5 max-w-full truncate">
                    <Flame className="w-4 h-4 shrink-0" />
                    <span className="truncate">{playerFighter.signatureMove.name}</span>
                  </span>
                  <span className="text-[11px] font-semibold opacity-80">50 SP</span>
                </button>

                <button
                  disabled={!isPlayerTurn}
                  onClick={handlePlayerDefend}
                  className="min-h-[54px] px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold text-white cursor-pointer active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" /> Shield
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">-60% DMG · +12 MP</span>
                </button>

                <button
                  disabled={!isPlayerTurn}
                  onClick={handlePlayerCharge}
                  className="min-h-[54px] px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold text-white cursor-pointer active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Charge
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">+35 SP · +18 MP</span>
                </button>
              </div>

              {/* Field Supply Pouch + Retreat */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  disabled={!isPlayerTurn || remainingMeat <= 0 || playerFighter.currentHp >= playerFighter.maxHp}
                  onClick={handleUseMeatInBattle}
                  className="min-h-[44px] px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-45 border border-amber-500/35 rounded-xl flex items-center justify-center gap-2 font-chakra text-xs font-semibold text-amber-200 cursor-pointer tabular-nums"
                >
                  <PixelMeatIcon className="w-4 h-4" />
                  <span>Use Big Meat (+45% HP · {remainingMeat})</span>
                </button>

                <button
                  disabled={!isPlayerTurn || remainingVitamins <= 0}
                  onClick={handleUseVitaminInBattle}
                  className="min-h-[44px] px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-45 border border-purple-500/35 rounded-xl flex items-center justify-center gap-2 font-chakra text-xs font-semibold text-purple-200 cursor-pointer tabular-nums"
                >
                  <PixelVitaminIcon className="w-4 h-4" />
                  <span>Use Vitamin (+30% HP/+30 SP · {remainingVitamins})</span>
                </button>

                <button
                  onClick={() => {
                    sound.playButton();
                    setView('zones');
                  }}
                  className="min-h-[44px] px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl font-chakra text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Retreat
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

          {/* VIEW 4: VICTORY & SPOILS */}
          {view === 'victory' && lastResult && activeWave && (
            <div className="py-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mb-3">
                <Trophy className="w-9 h-9 text-amber-300" />
              </div>
              <h3 className="font-chakra font-bold text-white text-2xl sm:text-3xl">
                Wave {activeWave.waveNumber} Cleared!
              </h3>
              <p className="text-slate-300 text-sm mt-1 max-w-md">
                {pet.nickname || species?.name} defeated {DIGIMON_DATABASE[activeWave.speciesId]?.name} ({activeWave.stageLabel}) in{' '}
                {selectedZone.name}.
              </p>

              {/* Battle Experience & Item Drops */}
              <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-4 my-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left tabular-nums">
                <div>
                  <div className="text-xs text-slate-400">Strength Exp</div>
                  <div className="font-chakra font-bold text-lg text-emerald-300">+{lastResult.strengthGained} STR</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Battle Power</div>
                  <div className="font-chakra font-bold text-lg text-cyan-300">+{lastResult.dpGained} DP</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Effort</div>
                  <div className="font-chakra font-bold text-lg text-amber-300">+{lastResult.effortGained} EF</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">DigiBits</div>
                  <div className="font-chakra font-bold text-lg text-amber-200">+{lastResult.bitsGained} Bits</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Big Meat Drop</div>
                  <div className="font-chakra font-bold text-lg text-orange-300 flex items-center gap-1.5">
                    <PixelMeatIcon className="w-5 h-5" /> +{lastResult.meatGained}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Vitamin Drop</div>
                  <div className="font-chakra font-bold text-lg text-purple-300 flex items-center gap-1.5">
                    <PixelVitaminIcon className="w-5 h-5" /> +{lastResult.vitaminsGained}
                  </div>
                </div>

                {(lastResult.mushroomGained ?? 0) > 0 && (
                  <div>
                    <div className="text-xs text-slate-400">Digi-Mushroom</div>
                    <div className="font-chakra font-bold text-lg text-amber-300 flex items-center gap-1.5">
                      <PixelMushroomIcon className="w-5 h-5" /> +{lastResult.mushroomGained}
                    </div>
                  </div>
                )}

                {(lastResult.berryGained ?? 0) > 0 && (
                  <div>
                    <div className="text-xs text-slate-400">Digi-Berry</div>
                    <div className="font-chakra font-bold text-lg text-rose-300 flex items-center gap-1.5">
                      <PixelBerryIcon className="w-5 h-5" /> +{lastResult.berryGained}
                    </div>
                  </div>
                )}

                {(lastResult.sirloinGained ?? 0) > 0 && (
                  <div>
                    <div className="text-xs text-amber-300">Prime Sirloin (2x Meat!)</div>
                    <div className="font-chakra font-bold text-lg text-rose-200 flex items-center gap-1.5">
                      <PixelSirloinIcon className="w-5 h-5" /> +{lastResult.sirloinGained}
                    </div>
                  </div>
                )}
              </div>

              {lastResult.unlockedRelicId && SPECIAL_ITEMS[lastResult.unlockedRelicId] && (
                <div className="w-full max-w-lg mb-5 p-3.5 rounded-2xl bg-amber-950/50 border border-amber-400/50 text-amber-200 text-sm font-chakra">
                  Special Relic Unlocked: <strong className="text-white">{SPECIAL_ITEMS[lastResult.unlockedRelicId].name}</strong> added to your Relic Vault!
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                {nextWaveAfterVictory ? (
                  <button
                    onClick={() => startWaveBattle(selectedZone, nextWaveAfterVictory)}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                  >
                    Continue to Wave {nextWaveAfterVictory.waveNumber} ({nextWaveAfterVictory.stageLabel})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playButton();
                      setView('zones');
                    }}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                  >
                    Back to Adventures
                  </button>
                )}

                {nextWaveAfterVictory && (
                  <button
                    onClick={() => {
                      sound.playButton();
                      setView('zones');
                    }}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                  >
                    Return to Adventures
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW 5: DEFEAT & RESET AREA TO WAVE 1 */}
          {view === 'defeat' && lastResult && activeWave && (
            <div className="py-6 flex flex-col items-center text-center">
              <h3 className="font-chakra font-bold text-white text-2xl sm:text-3xl">
                Defeated by {opponentFighter?.name || DIGIMON_DATABASE[activeWave.speciesId]?.name || 'Wild Digimon'}
              </h3>
              <p className="text-rose-300 font-chakra font-semibold text-xs mt-1.5">
                Area progress reset to Wave 1 — enemies in {selectedZone.name} shuffled!
              </p>
              <p className="text-slate-300 text-sm mt-1 max-w-md">
                {activeStageMods?.label
                  ? `That ${activeWave.stageLabel} Digimon out-tiered your ${pet.stage}! Evolve higher or train your stats in the Dojo before challenging again.`
                  : 'Even a tough defeat built combat instinct. Train in the Dojo, evolve higher, or stock up on supplies before restarting!'}
              </p>

              <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-4 my-5 flex flex-wrap items-center justify-around gap-3 font-chakra tabular-nums">
                <div>
                  <div className="text-xs text-slate-400">Battle Exp</div>
                  <div className="font-bold text-emerald-300">+{lastResult.strengthGained} STR</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Power</div>
                  <div className="font-bold text-cyan-300">+{lastResult.dpGained} DP</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Bits</div>
                  <div className="font-bold text-amber-300">+{lastResult.bitsGained}</div>
                </div>
                {(lastResult.mushroomGained ?? 0) > 0 && (
                  <div>
                    <div className="text-xs text-slate-400">Trail Mushroom</div>
                    <div className="font-bold text-amber-300 flex items-center justify-center gap-1">
                      <PixelMushroomIcon className="w-4 h-4" /> +{lastResult.mushroomGained}
                    </div>
                  </div>
                )}
                {(lastResult.berryGained ?? 0) > 0 && (
                  <div>
                    <div className="text-xs text-slate-400">Trail Berry</div>
                    <div className="font-bold text-rose-300 flex items-center justify-center gap-1">
                      <PixelBerryIcon className="w-4 h-4" /> +{lastResult.berryGained}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => startWaveBattle(selectedZone, activeZoneWaves[0])}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                >
                  Enter {selectedZone.name} (Wave 1)
                </button>
                <button
                  onClick={() => {
                    sound.playButton();
                    setView('zones');
                  }}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                >
                  Return to Adventures
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
