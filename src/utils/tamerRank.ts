import { ADVENTURE_ZONES } from '../data/adventureZones';
import { PetState } from '../types/digimon';

export interface TamerRankTier {
  rank: number;
  title: string;
  minScore: number;
  badge: string;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  barClass: string;
  unlockSummary: string[];
}

export interface TamerRankProgress {
  rank: number;
  title: string;
  badge: string;
  currentTier: TamerRankTier;
  nextTier: TamerRankTier | null;
  battlesWon: number;
  zonesCleared: number;
  totalZones: number;
  score: number;
  pointsIntoTier: number;
  pointsForNextTier: number;
  pointsToNext: number;
  progressPct: number;
  isMaxRank: boolean;
}

export const POINTS_PER_BATTLE_WIN = 10;
export const POINTS_PER_ZONE_CLEAR = 50;

export const TAMER_RANK_TIERS: TamerRankTier[] = [
  {
    rank: 1,
    title: 'Novice Tamer',
    minScore: 0,
    badge: '🥉',
    accentClass: 'text-slate-200',
    borderClass: 'border-slate-500/45',
    bgClass: 'bg-slate-800/80',
    barClass: 'bg-slate-400',
    unlockSummary: [
      'Bazaar: Big Meat, Vitamins & Antivirus',
      'Room: 5 Starter Island & Cyber Themes',
      'Decor: Core Digi-Room Furniture',
    ],
  },
  {
    rank: 2,
    title: 'Bronze Tamer',
    minScore: 50,
    badge: '🛡️',
    accentClass: 'text-amber-300',
    borderClass: 'border-amber-500/50',
    bgClass: 'bg-amber-950/60',
    barClass: 'bg-amber-400',
    unlockSummary: [
      'Shop: Prime Sirloin (2x Meat) & Trail Ration Crate',
      'Room Theme: Ancient Digi-Ruins',
      'Furniture: Sacred Crest Banner',
    ],
  },
  {
    rank: 3,
    title: 'Silver Tamer',
    minScore: 150,
    badge: '⚔️',
    accentClass: 'text-cyan-300',
    borderClass: 'border-cyan-500/50',
    bgClass: 'bg-cyan-950/60',
    barClass: 'bg-cyan-400',
    unlockSummary: [
      'Shop: Gym Mastery Chip (+RPG Stats & EXP)',
      'Room Theme: Cyber Neon Dojo',
      'Furniture: Holo-Arcade Cabinet',
    ],
  },
  {
    rank: 4,
    title: 'Gold Tamer',
    minScore: 320,
    badge: '👑',
    accentClass: 'text-yellow-300',
    borderClass: 'border-yellow-400/55',
    bgClass: 'bg-yellow-950/55',
    barClass: 'bg-yellow-400',
    unlockSummary: [
      'Shop: Royal Miracle Elixir (Full Recovery + DP)',
      'Room Theme: Celestial Cloud Sanctuary',
      'Furniture: Royal Knight Statue',
    ],
  },
  {
    rank: 5,
    title: 'Master Tamer',
    minScore: 550,
    badge: '🌟',
    accentClass: 'text-purple-300',
    borderClass: 'border-purple-400/55',
    bgClass: 'bg-purple-950/60',
    barClass: 'bg-purple-400',
    unlockSummary: [
      'Shop: Sovereign Data Core (+12 All Stats & +100 EXP)',
      'Room Theme: Sovereign Gold Citadel',
      'Furniture: Sovereign Data Throne',
    ],
  },
  {
    rank: 6,
    title: 'Sovereign Tamer',
    minScore: 850,
    badge: '💠',
    accentClass: 'text-fuchsia-300',
    borderClass: 'border-fuchsia-400/60',
    bgClass: 'bg-fuchsia-950/65',
    barClass: 'bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300',
    unlockSummary: [
      'Room Theme: Infinity Astral Vault',
      'Apex Digital World Sovereign Distinction',
    ],
  },
];

export function getLifetimeBattlesWon(pet: Pick<PetState, 'battlesWon' | 'lifetimeBattlesWon'>): number {
  return Math.max(0, pet.lifetimeBattlesWon ?? 0, pet.battlesWon ?? 0);
}

export function getClearedAdventureZoneCount(
  pet: Pick<PetState, 'adventureClearedWave'>
): number {
  const clearedMap = pet.adventureClearedWave || {};
  let count = 0;
  for (const zone of ADVENTURE_ZONES) {
    if ((clearedMap[zone.id] ?? 0) >= zone.waves.length) {
      count += 1;
    }
  }
  return count;
}

export function computeTamerScore(battlesWon: number, zonesCleared: number): number {
  return (
    Math.max(0, battlesWon) * POINTS_PER_BATTLE_WIN +
    Math.max(0, zonesCleared) * POINTS_PER_ZONE_CLEAR
  );
}

export function getTamerRankTier(rank: number): TamerRankTier {
  return (
    TAMER_RANK_TIERS.find((t) => t.rank === rank) ||
    TAMER_RANK_TIERS[0]
  );
}

export function getTamerRankForScore(score: number): TamerRankTier {
  let matched = TAMER_RANK_TIERS[0];
  for (const tier of TAMER_RANK_TIERS) {
    if (score >= tier.minScore) {
      matched = tier;
    }
  }
  return matched;
}

export function computeTamerRankProgress(
  pet: Pick<PetState, 'battlesWon' | 'lifetimeBattlesWon' | 'adventureClearedWave'>
): TamerRankProgress {
  const battlesWon = getLifetimeBattlesWon(pet);
  const zonesCleared = getClearedAdventureZoneCount(pet);
  const totalZones = ADVENTURE_ZONES.length;
  const score = computeTamerScore(battlesWon, zonesCleared);
  const currentTier = getTamerRankForScore(score);
  const nextTier =
    TAMER_RANK_TIERS.find((t) => t.rank === currentTier.rank + 1) || null;

  if (!nextTier) {
    return {
      rank: currentTier.rank,
      title: currentTier.title,
      badge: currentTier.badge,
      currentTier,
      nextTier: null,
      battlesWon,
      zonesCleared,
      totalZones,
      score,
      pointsIntoTier: score - currentTier.minScore,
      pointsForNextTier: 0,
      pointsToNext: 0,
      progressPct: 100,
      isMaxRank: true,
    };
  }

  const span = Math.max(1, nextTier.minScore - currentTier.minScore);
  const pointsIntoTier = Math.max(0, score - currentTier.minScore);
  const pointsToNext = Math.max(0, nextTier.minScore - score);
  const progressPct = Math.min(100, Math.max(0, Math.round((pointsIntoTier / span) * 100)));

  return {
    rank: currentTier.rank,
    title: currentTier.title,
    badge: currentTier.badge,
    currentTier,
    nextTier,
    battlesWon,
    zonesCleared,
    totalZones,
    score,
    pointsIntoTier,
    pointsForNextTier: span,
    pointsToNext,
    progressPct,
    isMaxRank: false,
  };
}

export function isRankRequirementMet(
  pet: Pick<PetState, 'battlesWon' | 'lifetimeBattlesWon' | 'adventureClearedWave'>,
  requiredRank?: number
): boolean {
  if (!requiredRank || requiredRank <= 1) return true;
  return computeTamerRankProgress(pet).rank >= requiredRank;
}
