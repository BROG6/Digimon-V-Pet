import {
  DigimonSpecies,
  DigimonStage,
  EvolutionArchetype,
  PetState,
  SpecialItemId,
  WeightClass,
} from '../types/digimon';
import { DIGIMON_DATABASE, EGG_LINE_MATRIX, HELLOPET_QUOTES, SPECIAL_ITEMS } from '../data/digidex';
import { getEffectiveSpriteConfig } from './customSpriteManager';
import { NEW_DIGIMON_SPRITES } from './newDigimonSprites';
import { getPersonalityProfile, personalizeQuoteForPlayer } from './digimonPersonality';
import { getGridRowRatios, GridLayoutPresetId, isFlyingSpecies } from './petOverlayEngine';
import { OverlayLaunchParams } from './nativeOverlay';
import { getStageHungerHeartMs } from './carePacing';
import {
  getBaseBattleStatsForSpecies,
  getEffectiveBattleStats,
  getLearnedTechniqueIds,
  MAX_EQUIPPED_ATTACKS,
} from '../data/battleTechniques';
import type { EggStageBranches } from '../data/eggsAndMatrix';

export interface EvolutionEligibility {
  goalsMet: boolean;
  nextId?: string;
  forecastId?: string;
  archetype: EvolutionArchetype;
  reason: string;
  weightClass: WeightClass;
  winRate: number;
  effort: number;
  stageBattles: number;
  stageWins: number;
  minTraining: number;
  minBattles: number;
  minEffort: number;
}

export interface NaturalEvoTiming {
  goalsMet: boolean;
  nextId?: string;
  archetype: EvolutionArchetype;
  delayMs: number;
  evolveAtMs: number;
  remainingMs: number;
  windowExpired: boolean;
  readyToEvolve: boolean;
  missedDeadline: boolean;
}

export const PENDULUM_V20_EVO_MS: Record<DigimonStage, number> = {
  egg: 60_000, // Digitama -> Baby I: 1 minute
  fresh: 10 * 60_000, // Baby I -> Baby II: 10 minutes
  'in-training': 12 * 3_600_000, // Baby II -> Child (Rookie): 12 hours
  rookie: 24 * 3_600_000, // Child -> Adult (Champion): 24 hours
  champion: 40 * 3_600_000, // Adult -> Perfect (Ultimate): 40 hours
  ultimate: 48 * 3_600_000, // Perfect -> Ultimate (Mega): 48 hours
  mega: 0,
};

export const UNLOCKED_SPECIES_STORAGE_KEY = 'digipet_unlocked_species_v1';

export function loadUnlockedSpeciesIds(seedIds: string[] = []): string[] {
  const merged = new Set<string>();
  try {
    const raw = localStorage.getItem(UNLOCKED_SPECIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const id of parsed) {
          if (typeof id === 'string' && id.trim()) {
            merged.add(id.trim());
          }
        }
      }
    }
  } catch {}
  for (const id of seedIds) {
    if (typeof id === 'string' && id.trim()) {
      merged.add(id.trim());
    }
  }
  return Array.from(merged);
}

export function saveUnlockedSpeciesIds(ids: string[]): string[] {
  const unique = Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.trim())));
  try {
    localStorage.setItem(UNLOCKED_SPECIES_STORAGE_KEY, JSON.stringify(unique));
  } catch {}
  return unique;
}

export function recordUnlockedSpeciesId(speciesId: string, existing: string[] = []): string[] {
  const current = loadUnlockedSpeciesIds(existing);
  if (speciesId && !current.includes(speciesId)) {
    current.push(speciesId);
  }
  return saveUnlockedSpeciesIds(current);
}

/**
 * Digimon Pendulum Ver. 20th exact stage transition durations.
 * Timers stay anchored to stageEnteredAt and continue ticking while sleeping.
 */
export function getNaturalEvolutionDelayMs(stage: DigimonStage): number {
  return PENDULUM_V20_EVO_MS[stage] ?? 0;
}

export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0s';
  const totalSec = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hours > 0) {
    return `${hours}h ${String(mins).padStart(2, '0')}m`;
  }
  if (mins > 0) {
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }
  return `${secs}s`;
}

/**
 * Stage-calibrated weight classification: Light (Agile), Normal (Balanced), Heavy (Power)
 */
export function getWeightClass(weight: number, stage: DigimonStage): WeightClass {
  const ranges: Record<DigimonStage, [number, number]> = {
    egg: [8, 18],
    fresh: [10, 20],
    'in-training': [16, 28],
    rookie: [22, 36],
    champion: [28, 46],
    ultimate: [34, 56],
    mega: [40, 66],
  };
  const [low, high] = ranges[stage] || [22, 36];
  if (weight < low) return 'Light';
  if (weight > high) return 'Heavy';
  return 'Normal';
}

export function getStageEffort(pet: PetState): number {
  if (typeof pet.effort === 'number') {
    return Math.max(0, Math.min(10, pet.effort));
  }
  const trainCount = pet.stageTrainingCount ?? pet.trainingCount ?? 0;
  return Math.max(0, Math.min(10, trainCount * 2));
}

export function getStageBattleStats(pet: PetState): { won: number; total: number; winRate: number } {
  const total =
    typeof pet.stageBattlesTotal === 'number' ? pet.stageBattlesTotal : pet.battlesTotal || 0;
  const won =
    typeof pet.stageBattlesWon === 'number' ? pet.stageBattlesWon : pet.battlesWon || 0;
  const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
  return { won, total, winRate };
}

export type StageEvoSourceKey = 'in-training' | 'rookie' | 'champion' | 'ultimate';
export type CoreBranchArchetype = 'vaccine' | 'data' | 'virus' | 'corrupted';

export interface StageBranchRequirement {
  stage: StageEvoSourceKey;
  targetStage: 'rookie' | 'champion' | 'ultimate' | 'mega';
  archetype: CoreBranchArchetype;
  timerLabel: string;
  weightRangeLabel: { normal: string; heavy: string };
  maxMistakes?: number;
  minMistakes?: number;
  minEffort?: number;
  minBattles?: number;
  minWinRate?: number;
  weightClass?: WeightClass;
  minHp?: number;
  minMp?: number;
  minOffense?: number;
  minDefense?: number;
  minSpeed?: number;
  minBrains?: number;
  minDiscipline?: number;
  minHappiness?: number;
  corruptedFallbackWinRate?: number;
}

export interface BranchReadinessMetric {
  label: string;
  current: string;
  target: string;
  met: boolean;
}

export interface BranchReadinessResult {
  archetype: CoreBranchArchetype;
  requirement: StageBranchRequirement;
  met: boolean;
  metrics: BranchReadinessMetric[];
  missing: string[];
  metCount: number;
  totalCount: number;
}

const STAGE_WEIGHT_RANGES: Record<StageEvoSourceKey, { normal: string; heavy: string }> = {
  'in-training': { normal: '16–28g', heavy: '>28g' },
  rookie: { normal: '22–36g', heavy: '>36g' },
  champion: { normal: '28–46g', heavy: '>46g' },
  ultimate: { normal: '34–56g', heavy: '>56g' },
};

/**
 * Shared Evolution Matrix combining:
 * - Authentic Bandai Digivice (Pendulum / DMX / DM20th) escalating Battle Counts & Win Rates
 * - Digimon World 1 / Next Order RPG Stat Pillars (HP, MP, OFF, DEF, SPD, BRN, Weight, Discipline, Happiness, CM, Effort)
 */
export const STAGE_BRANCH_REQUIREMENTS: Record<
  StageEvoSourceKey,
  Record<CoreBranchArchetype, StageBranchRequirement>
> = {
  'in-training': {
    vaccine: {
      stage: 'in-training',
      targetStage: 'rookie',
      archetype: 'vaccine',
      timerLabel: '12h',
      weightRangeLabel: STAGE_WEIGHT_RANGES['in-training'],
      maxMistakes: 1,
    },
    data: {
      stage: 'in-training',
      targetStage: 'rookie',
      archetype: 'data',
      timerLabel: '12h',
      weightRangeLabel: STAGE_WEIGHT_RANGES['in-training'],
      maxMistakes: 1,
      minEffort: 7,
      minBrains: 24,
    },
    virus: {
      stage: 'in-training',
      targetStage: 'rookie',
      archetype: 'virus',
      timerLabel: '12h',
      weightRangeLabel: STAGE_WEIGHT_RANGES['in-training'],
      maxMistakes: 2,
      minBattles: 8,
      minOffense: 32,
    },
    corrupted: {
      stage: 'in-training',
      targetStage: 'rookie',
      archetype: 'corrupted',
      timerLabel: '12h',
      weightRangeLabel: STAGE_WEIGHT_RANGES['in-training'],
      minMistakes: 3,
      corruptedFallbackWinRate: 40,
    },
  },
  rookie: {
    vaccine: {
      stage: 'rookie',
      targetStage: 'champion',
      archetype: 'vaccine',
      timerLabel: '24h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.rookie,
      maxMistakes: 1,
      minEffort: 6,
      minBattles: 8,
      minWinRate: 60,
      minHp: 200,
      minOffense: 66,
      minDefense: 52,
      minDiscipline: 55,
    },
    data: {
      stage: 'rookie',
      targetStage: 'champion',
      archetype: 'data',
      timerLabel: '24h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.rookie,
      maxMistakes: 1,
      minEffort: 8,
      weightClass: 'Normal',
      minBattles: 5,
      minMp: 105,
      minSpeed: 64,
      minBrains: 42,
    },
    virus: {
      stage: 'rookie',
      targetStage: 'champion',
      archetype: 'virus',
      timerLabel: '24h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.rookie,
      minMistakes: 1,
      maxMistakes: 2,
      weightClass: 'Heavy',
      minBattles: 12,
      minHp: 215,
      minOffense: 74,
    },
    corrupted: {
      stage: 'rookie',
      targetStage: 'champion',
      archetype: 'corrupted',
      timerLabel: '24h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.rookie,
      minMistakes: 3,
      corruptedFallbackWinRate: 40,
    },
  },
  champion: {
    vaccine: {
      stage: 'champion',
      targetStage: 'ultimate',
      archetype: 'vaccine',
      timerLabel: '40h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.champion,
      maxMistakes: 1,
      minEffort: 8,
      minBattles: 15,
      minWinRate: 65,
      minHp: 365,
      minOffense: 124,
      minDefense: 100,
      minBrains: 58,
      minDiscipline: 65,
    },
    data: {
      stage: 'champion',
      targetStage: 'ultimate',
      archetype: 'data',
      timerLabel: '40h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.champion,
      maxMistakes: 1,
      minEffort: 9,
      weightClass: 'Normal',
      minBattles: 10,
      minWinRate: 50,
      minMp: 160,
      minDefense: 98,
      minSpeed: 104,
      minBrains: 72,
    },
    virus: {
      stage: 'champion',
      targetStage: 'ultimate',
      archetype: 'virus',
      timerLabel: '40h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.champion,
      minMistakes: 1,
      maxMistakes: 2,
      weightClass: 'Heavy',
      minBattles: 18,
      minWinRate: 50,
      minHp: 380,
      minOffense: 134,
      minDefense: 98,
    },
    corrupted: {
      stage: 'champion',
      targetStage: 'ultimate',
      archetype: 'corrupted',
      timerLabel: '40h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.champion,
      minMistakes: 3,
      corruptedFallbackWinRate: 40,
    },
  },
  ultimate: {
    vaccine: {
      stage: 'ultimate',
      targetStage: 'mega',
      archetype: 'vaccine',
      timerLabel: '48h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.ultimate,
      maxMistakes: 1,
      minEffort: 9,
      minBattles: 22,
      minWinRate: 75,
      minHp: 560,
      minMp: 180,
      minOffense: 205,
      minDefense: 165,
      minSpeed: 145,
      minBrains: 88,
      minDiscipline: 75,
      minHappiness: 75,
    },
    data: {
      stage: 'ultimate',
      targetStage: 'mega',
      archetype: 'data',
      timerLabel: '48h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.ultimate,
      maxMistakes: 1,
      minEffort: 10,
      weightClass: 'Normal',
      minBattles: 15,
      minWinRate: 60,
      minHp: 520,
      minMp: 225,
      minOffense: 190,
      minDefense: 158,
      minSpeed: 156,
      minBrains: 110,
      minDiscipline: 65,
    },
    virus: {
      stage: 'ultimate',
      targetStage: 'mega',
      archetype: 'virus',
      timerLabel: '48h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.ultimate,
      minMistakes: 1,
      maxMistakes: 2,
      weightClass: 'Heavy',
      minEffort: 7,
      minBattles: 25,
      minWinRate: 60,
      minHp: 580,
      minOffense: 215,
      minDefense: 165,
      minSpeed: 142,
    },
    corrupted: {
      stage: 'ultimate',
      targetStage: 'mega',
      archetype: 'corrupted',
      timerLabel: '48h',
      weightRangeLabel: STAGE_WEIGHT_RANGES.ultimate,
      minMistakes: 3,
      corruptedFallbackWinRate: 40,
    },
  },
};

export function getStageBranchRequirements(
  stage: DigimonStage
): Record<CoreBranchArchetype, StageBranchRequirement> | null {
  if (
    stage === 'in-training' ||
    stage === 'rookie' ||
    stage === 'champion' ||
    stage === 'ultimate'
  ) {
    return STAGE_BRANCH_REQUIREMENTS[stage];
  }
  return null;
}

export function getRequirementForTargetStage(
  targetStage: 'rookie' | 'champion' | 'ultimate' | 'mega',
  archetype: CoreBranchArchetype
): StageBranchRequirement {
  const sourceMap: Record<'rookie' | 'champion' | 'ultimate' | 'mega', StageEvoSourceKey> = {
    rookie: 'in-training',
    champion: 'rookie',
    ultimate: 'champion',
    mega: 'ultimate',
  };
  return STAGE_BRANCH_REQUIREMENTS[sourceMap[targetStage]][archetype];
}

export function formatBranchShortRule(
  req: StageBranchRequirement,
  opts?: { isCorruptedAlt?: boolean }
): string {
  if (req.archetype === 'corrupted') {
    if (opts?.isCorruptedAlt) {
      return `CM ≥ 3 · ${req.weightRangeLabel.heavy} or EF ≥ 5`;
    }
    return 'CM ≥ 3 (or CM 2 + WR < 40%)';
  }
  const parts: string[] = [];
  if (typeof req.minMistakes === 'number' && typeof req.maxMistakes === 'number') {
    parts.push(`CM ${req.minMistakes}–${req.maxMistakes}`);
  } else if (typeof req.maxMistakes === 'number') {
    parts.push(`CM ≤ ${req.maxMistakes}`);
  }
  if (typeof req.minEffort === 'number') {
    parts.push(`EF ≥ ${req.minEffort}`);
  }
  if (req.weightClass) {
    parts.push(`WT ${req.weightClass}`);
  }
  if (typeof req.minBattles === 'number') {
    parts.push(
      typeof req.minWinRate === 'number'
        ? `${req.minBattles}+ Bat (${req.minWinRate}%+)`
        : `${req.minBattles}+ Bat`
    );
  }
  if (req.stage !== 'in-training') {
    parts.push('Stats');
  }
  return parts.join(' · ');
}

export function formatBranchFullRule(
  req: StageBranchRequirement,
  opts?: { isCorruptedAlt?: boolean; hasCorruptedAlt?: boolean }
): string {
  const fromLabelMap: Record<StageEvoSourceKey, string> = {
    'in-training': 'Baby II',
    rookie: 'Rookie',
    champion: 'Champion',
    ultimate: 'Ultimate',
  };
  const fromLabel = fromLabelMap[req.stage];

  if (req.archetype === 'corrupted') {
    if (opts?.isCorruptedAlt) {
      return `From ${fromLabel} (${req.timerLabel}): Care Mistakes ≥ 3 (or CM 2 with Battles & WR < 40%), plus Heavy Weight (${req.weightRangeLabel.heavy}) or Effort ≥ 5.`;
    }
    if (opts?.hasCorruptedAlt && req.stage !== 'in-training') {
      return `From ${fromLabel} (${req.timerLabel}): 3+ Care Mistakes, or 2 Care Mistakes with ≥1 Battle & Win Rate < 40% (with Light/Normal Weight and Effort < 5).`;
    }
    return `From ${fromLabel} (${req.timerLabel}): 3+ Care Mistakes, or 2 Care Mistakes with ≥1 Battle & Win Rate < 40%.`;
  }

  const reqs: string[] = [];
  if (typeof req.minMistakes === 'number' && typeof req.maxMistakes === 'number') {
    reqs.push(`${req.minMistakes}–${req.maxMistakes} Care Mistakes`);
  } else if (typeof req.maxMistakes === 'number') {
    reqs.push(`Care Mistakes ≤ ${req.maxMistakes}`);
  }
  if (typeof req.minEffort === 'number') {
    reqs.push(req.minEffort >= 10 ? 'Effort = 10' : `Effort ≥ ${req.minEffort}`);
  }
  if (req.weightClass === 'Normal') {
    reqs.push(`Normal Weight (${req.weightRangeLabel.normal})`);
  } else if (req.weightClass === 'Heavy') {
    reqs.push(`Heavy Weight (${req.weightRangeLabel.heavy})`);
  }
  if (typeof req.minBattles === 'number') {
    reqs.push(
      typeof req.minWinRate === 'number'
        ? `${req.minBattles}+ Battles (Win Rate ≥ ${req.minWinRate}%)`
        : `${req.minBattles}+ Battles`
    );
  }
  if (typeof req.minHp === 'number') reqs.push(`HP ≥ ${req.minHp}`);
  if (typeof req.minMp === 'number') reqs.push(`MP ≥ ${req.minMp}`);
  if (typeof req.minOffense === 'number') reqs.push(`OFF ≥ ${req.minOffense}`);
  if (typeof req.minDefense === 'number') reqs.push(`DEF ≥ ${req.minDefense}`);
  if (typeof req.minSpeed === 'number') reqs.push(`SPD ≥ ${req.minSpeed}`);
  if (typeof req.minBrains === 'number') reqs.push(`BRN ≥ ${req.minBrains}`);
  if (typeof req.minDiscipline === 'number') reqs.push(`Discipline ≥ ${req.minDiscipline}%`);
  if (typeof req.minHappiness === 'number') reqs.push(`Happiness ≥ ${req.minHappiness}%`);

  return `From ${fromLabel} (${req.timerLabel}): ${reqs.join(', ')}.`;
}

export function evaluateBranchReadiness(
  pet: PetState,
  species: DigimonSpecies | undefined,
  req: StageBranchRequirement
): BranchReadinessResult {
  const resolvedSpecies = species || DIGIMON_DATABASE[pet.currentSpeciesId];
  const stats = getEffectiveBattleStats(pet, resolvedSpecies);
  const cm = pet.careMistakes || 0;
  const ef = getStageEffort(pet);
  const { total: tb, winRate: wr } = getStageBattleStats(pet);
  const wt = getWeightClass(pet.weight || 15, pet.stage);
  const discipline = Math.round(pet.discipline ?? 50);
  const happiness = Math.round(pet.happiness ?? 50);

  const metrics: BranchReadinessMetric[] = [];

  if (req.archetype === 'corrupted') {
    const cmOnly = cm >= (req.minMistakes ?? 3);
    const cmBattle = cm >= 2 && tb > 0 && wr < (req.corruptedFallbackWinRate ?? 40);
    const met = cmOnly || cmBattle;
    metrics.push({
      label: 'CM / Neglect',
      current: `${cm} CM${tb > 0 ? ` (${wr}% WR)` : ''}`,
      target: '3+ CM or 2 CM + WR < 40%',
      met,
    });
    return {
      archetype: 'corrupted',
      requirement: req,
      met,
      metrics,
      missing: met ? [] : ['CM 3+ (or CM 2 + <40% WR)'],
      metCount: met ? 1 : 0,
      totalCount: 1,
    };
  }

  if (typeof req.minMistakes === 'number' && typeof req.maxMistakes === 'number') {
    metrics.push({
      label: 'CM',
      current: `${cm}`,
      target: `${req.minMistakes}–${req.maxMistakes}`,
      met: cm >= req.minMistakes && cm <= req.maxMistakes,
    });
  } else if (typeof req.maxMistakes === 'number') {
    metrics.push({
      label: 'CM',
      current: `${cm}`,
      target: `≤ ${req.maxMistakes}`,
      met: cm <= req.maxMistakes,
    });
  }

  if (typeof req.minEffort === 'number') {
    metrics.push({
      label: 'Effort',
      current: `${ef}`,
      target: `≥ ${req.minEffort}`,
      met: ef >= req.minEffort,
    });
  }

  if (req.weightClass) {
    metrics.push({
      label: 'Weight',
      current: `${wt}`,
      target: req.weightClass,
      met: wt === req.weightClass,
    });
  }

  if (typeof req.minBattles === 'number') {
    metrics.push({
      label: 'Battles',
      current: `${tb}`,
      target: `≥ ${req.minBattles}`,
      met: tb >= req.minBattles,
    });
  }

  if (typeof req.minWinRate === 'number') {
    metrics.push({
      label: 'Win Rate',
      current: `${wr}%`,
      target: `≥ ${req.minWinRate}%`,
      met: tb > 0 && wr >= req.minWinRate,
    });
  }

  if (typeof req.minHp === 'number') {
    metrics.push({ label: 'HP', current: `${stats.maxHp}`, target: `≥ ${req.minHp}`, met: stats.maxHp >= req.minHp });
  }
  if (typeof req.minMp === 'number') {
    metrics.push({ label: 'MP', current: `${stats.maxMp}`, target: `≥ ${req.minMp}`, met: stats.maxMp >= req.minMp });
  }
  if (typeof req.minOffense === 'number') {
    metrics.push({ label: 'OFF', current: `${stats.offense}`, target: `≥ ${req.minOffense}`, met: stats.offense >= req.minOffense });
  }
  if (typeof req.minDefense === 'number') {
    metrics.push({ label: 'DEF', current: `${stats.defense}`, target: `≥ ${req.minDefense}`, met: stats.defense >= req.minDefense });
  }
  if (typeof req.minSpeed === 'number') {
    metrics.push({ label: 'SPD', current: `${stats.speed}`, target: `≥ ${req.minSpeed}`, met: stats.speed >= req.minSpeed });
  }
  if (typeof req.minBrains === 'number') {
    metrics.push({ label: 'BRN', current: `${stats.brains}`, target: `≥ ${req.minBrains}`, met: stats.brains >= req.minBrains });
  }
  if (typeof req.minDiscipline === 'number') {
    metrics.push({ label: 'Disc', current: `${discipline}%`, target: `≥ ${req.minDiscipline}%`, met: discipline >= req.minDiscipline });
  }
  if (typeof req.minHappiness === 'number') {
    metrics.push({ label: 'Happy', current: `${happiness}%`, target: `≥ ${req.minHappiness}%`, met: happiness >= req.minHappiness });
  }

  const metCount = metrics.filter((m) => m.met).length;
  const totalCount = metrics.length;
  const missing = metrics.filter((m) => !m.met).map((m) => `${m.label} ${m.current}/${m.target}`);

  return {
    archetype: req.archetype,
    requirement: req,
    met: metCount === totalCount,
    metrics,
    missing,
    metCount,
    totalCount,
  };
}

export interface ArchetypeEvalResult {
  archetype: EvolutionArchetype;
  reason: string;
  exactMatch: boolean;
}

/**
 * Evaluates the 15-Egg 4-Way Matrix & Raise Archetype System using:
 * - Digivice escalating stage battle counts & win rates
 * - Digimon World RPG stats (HP, MP, OFF, DEF, SPD, BRN, Weight, Discipline, Happiness)
 */
export function evaluateRaiseArchetype(
  pet: PetState,
  species?: DigimonSpecies
): ArchetypeEvalResult {
  const resolvedSpecies = species || DIGIMON_DATABASE[pet.currentSpeciesId];
  const cm = pet.careMistakes || 0;
  const ef = getStageEffort(pet);
  const { total: tb, winRate: wr } = getStageBattleStats(pet);
  const wt = getWeightClass(pet.weight || 15, pet.stage);
  const matrix = EGG_LINE_MATRIX[pet.eggId];

  if (pet.stage === 'egg') {
    return {
      archetype: 'data',
      reason: 'Digitama incubates for 1 minute before hatching into Baby I.',
      exactMatch: true,
    };
  }

  if (pet.stage === 'fresh') {
    return {
      archetype: 'data',
      reason: 'Baby I grows into Baby II after 10 minutes.',
      exactMatch: true,
    };
  }

  if (
    pet.stage === 'rookie' &&
    pet.equippedSpecialItem &&
    matrix?.champion.armor &&
    matrix.champion.armor.itemId === pet.equippedSpecialItem
  ) {
    const itemLabel = SPECIAL_ITEMS[pet.equippedSpecialItem]?.shortName || pet.equippedSpecialItem;
    return {
      archetype: 'armor',
      reason: `Armor Evolution qualified via ${itemLabel}!`,
      exactMatch: true,
    };
  }

  const stageReqs = getStageBranchRequirements(pet.stage);
  if (!stageReqs) {
    return {
      archetype: 'vaccine',
      reason: 'Maximum stage reached.',
      exactMatch: false,
    };
  }

  const stats = getEffectiveBattleStats(pet, resolvedSpecies);
  const vacEval = evaluateBranchReadiness(pet, resolvedSpecies, stageReqs.vaccine);
  const dataEval = evaluateBranchReadiness(pet, resolvedSpecies, stageReqs.data);
  const virusEval = evaluateBranchReadiness(pet, resolvedSpecies, stageReqs.virus);
  const corrEval = evaluateBranchReadiness(pet, resolvedSpecies, stageReqs.corrupted);

  // 1. Corrupted (Neglect)
  if (corrEval.met) {
    return {
      archetype: 'corrupted',
      reason:
        cm >= 3
          ? `Corrupted Mutant met (CM ${cm} >= 3)`
          : `Corrupted Mutant met (CM ${cm} >= 2 & WR ${wr}% < 40%)`,
      exactMatch: true,
    };
  }

  // 2. Virus / Brawler (Checked before Vaccine when intentionally Heavy + 1-2 CM + Battle Brawler)
  if (virusEval.met) {
    return {
      archetype: 'virus',
      reason: `Virus / Brawler met (CM ${cm}, TB ${tb}, Weight Heavy, Combat stats ready)`,
      exactMatch: true,
    };
  }

  // 3. Vaccine vs Data specialization check when both qualify
  if (vacEval.met && dataEval.met) {
    const dataMargin =
      (stats.brains - (stageReqs.data.minBrains || 0)) +
      (stats.speed - (stageReqs.data.minSpeed || 0)) +
      (stats.maxMp - (stageReqs.data.minMp || 0)) * 0.5;
    const vacMargin =
      (stats.offense - (stageReqs.vaccine.minOffense || 0)) +
      (stats.defense - (stageReqs.vaccine.minDefense || 0)) +
      (stats.maxHp - (stageReqs.vaccine.minHp || 0)) * 0.35 +
      ((pet.discipline ?? 50) - (stageReqs.vaccine.minDiscipline || 0)) * 0.5;

    if (wt === 'Normal' && dataMargin > vacMargin) {
      return {
        archetype: 'data',
        reason: `Data / Tech met (CM ${cm}, EF ${ef}, Normal WT, Tech stats specialized)`,
        exactMatch: true,
      };
    }
    return {
      archetype: 'vaccine',
      reason: `Vaccine / Holy met (CM ${cm}, EF ${ef}, TB ${tb}, WR ${wr}%, Heroic stats ready)`,
      exactMatch: true,
    };
  }

  if (dataEval.met && pet.stage === 'in-training') {
    return {
      archetype: 'data',
      reason: `Data / Tech met (CM ${cm} <= 1, Effort ${ef} >= 7, Brains ${stats.brains} >= 24)`,
      exactMatch: true,
    };
  }

  if (vacEval.met) {
    return {
      archetype: 'vaccine',
      reason:
        pet.stage === 'in-training'
          ? `Vaccine High Care met (CM ${cm} <= 1)`
          : `Vaccine / Holy met (CM ${cm}, EF ${ef}, ${tb} Battles, WR ${wr}%, Stats ready)`,
      exactMatch: true,
    };
  }

  if (dataEval.met) {
    return {
      archetype: 'data',
      reason: `Data / Tech met (CM ${cm}, EF ${ef}, Normal WT, Tech stats ready)`,
      exactMatch: true,
    };
  }

  // Not yet met — identify closest target branch cleanly
  const candidates = [vacEval, dataEval, virusEval].sort(
    (a, b) => b.metCount / Math.max(1, b.totalCount) - a.metCount / Math.max(1, a.totalCount)
  );
  const closest = candidates[0];
  const labelMap: Record<CoreBranchArchetype, string> = {
    vaccine: 'Vaccine',
    data: 'Data',
    virus: 'Virus',
    corrupted: 'Corrupted',
  };
  return {
    archetype: closest.archetype,
    reason: `Closest (${labelMap[closest.archetype]}): needs ${closest.missing.slice(0, 4).join(', ')}`,
    exactMatch: false,
  };
}

function pickBranchSpeciesId(
  branches: EggStageBranches,
  archetype: EvolutionArchetype,
  weightClass: WeightClass,
  effort: number
): string {
  if (archetype === 'armor' && branches.armor) {
    return branches.armor.speciesId;
  }
  if (archetype === 'corrupted') {
    if (branches.corruptedAlt && (weightClass === 'Heavy' || effort >= 5)) {
      return branches.corruptedAlt;
    }
    return branches.corrupted;
  }
  if (archetype === 'data') return branches.data;
  if (archetype === 'virus') return branches.virus;
  return branches.vaccine;
}

export function getNextStageBranches(
  pet: PetState,
  species?: DigimonSpecies
): EggStageBranches | null {
  const matrix = EGG_LINE_MATRIX[pet.eggId];
  if (!matrix) return null;

  if (pet.stage === 'in-training') return matrix.rookie;
  if (pet.stage === 'rookie') return matrix.champion;
  if (pet.stage === 'champion') return matrix.ultimate;
  if (pet.stage === 'ultimate') return matrix.mega;

  if (species?.stage === 'rookie') return matrix.champion;
  if (species?.stage === 'champion') return matrix.ultimate;
  if (species?.stage === 'ultimate') return matrix.mega;
  return null;
}

export function checkEvolutionEligibility(
  pet: PetState,
  species?: DigimonSpecies
): EvolutionEligibility {
  const weightClass = getWeightClass(pet.weight || 15, pet.stage);
  const effort = getStageEffort(pet);
  const { won: stageWins, total: stageBattles, winRate } = getStageBattleStats(pet);
  const archetypeEval = evaluateRaiseArchetype(pet, species);

  if (pet.isDead) {
    return {
      goalsMet: false,
      archetype: archetypeEval.archetype,
      reason: 'Digimon has passed away. Hatch a new Digi-Egg to begin again.',
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining: 0,
      minBattles: 0,
      minEffort: 0,
    };
  }

  if (pet.evolutionLocked) {
    return {
      goalsMet: false,
      archetype: archetypeEval.archetype,
      reason: 'Evolution window expired without meeting requirements — can no longer evolve.',
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining: 0,
      minBattles: 0,
      minEffort: 0,
    };
  }

  const matrix = EGG_LINE_MATRIX[pet.eggId];

  if (pet.stage === 'egg') {
    const baby1Id = matrix?.baby1 || pet.currentSpeciesId;
    return {
      goalsMet: true,
      nextId: baby1Id,
      forecastId: baby1Id,
      archetype: 'data',
      reason: archetypeEval.reason,
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining: 0,
      minBattles: 0,
      minEffort: 0,
    };
  }

  if (!species || pet.stage === 'mega') {
    return {
      goalsMet: false,
      archetype: archetypeEval.archetype,
      reason: pet.stage === 'mega' ? 'Maximum Ultimate (Mega) Stage Reached!' : 'No evolution data.',
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining: 0,
      minBattles: 0,
      minEffort: 0,
    };
  }

  let forecastId: string | undefined;
  if (pet.stage === 'fresh') {
    forecastId = matrix?.baby2 || species.nextEvolutions?.[0]?.speciesId;
  } else {
    const branches = getNextStageBranches(pet, species);
    if (branches) {
      forecastId = pickBranchSpeciesId(branches, archetypeEval.archetype, weightClass, effort);
      if (forecastId === species.id && pet.stage === 'rookie') {
        forecastId = pickBranchSpeciesId(matrix.ultimate, archetypeEval.archetype, weightClass, effort);
      }
    } else if (species.nextEvolutions && species.nextEvolutions.length > 0) {
      const matched =
        species.nextEvolutions.find((e) => e.archetype === archetypeEval.archetype) ||
        species.nextEvolutions[0];
      forecastId = matched.speciesId;
    }
  }

  const targetSpecies = forecastId ? DIGIMON_DATABASE[forecastId] : undefined;
  if (!targetSpecies) {
    return {
      goalsMet: false,
      archetype: archetypeEval.archetype,
      reason: 'Max evolution reached.',
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining: 0,
      minBattles: 0,
      minEffort: 0,
    };
  }

  if (pet.stage === 'fresh') {
    return {
      goalsMet: true,
      nextId: forecastId,
      forecastId,
      archetype: archetypeEval.archetype,
      reason: archetypeEval.reason,
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining: 0,
      minBattles: 0,
      minEffort: 0,
    };
  }

  const goalsMet = archetypeEval.exactMatch;
  const stageReqs = getStageBranchRequirements(pet.stage);
  const reqObj =
    stageReqs && archetypeEval.archetype !== 'armor'
      ? stageReqs[archetypeEval.archetype as CoreBranchArchetype]
      : undefined;

  return {
    goalsMet,
    nextId: goalsMet ? forecastId : undefined,
    forecastId,
    archetype: archetypeEval.archetype,
    reason: archetypeEval.reason,
    weightClass,
    winRate,
    effort,
    stageBattles,
    stageWins,
    minTraining: 0,
    minBattles: reqObj?.minBattles ?? 0,
    minEffort: reqObj?.minEffort ?? 0,
  };
}

export function computeNaturalEvoTiming(
  pet: PetState,
  species?: DigimonSpecies,
  nowMs: number = Date.now()
): NaturalEvoTiming {
  const elig = checkEvolutionEligibility(pet, species);
  const delayMs = getNaturalEvolutionDelayMs(pet.stage);

  if (pet.isDead || pet.evolutionLocked || pet.stage === 'mega' || delayMs <= 0) {
    return {
      goalsMet: false,
      nextId: undefined,
      archetype: elig.archetype,
      delayMs,
      evolveAtMs: 0,
      remainingMs: Number.POSITIVE_INFINITY,
      windowExpired: false,
      readyToEvolve: false,
      missedDeadline: false,
    };
  }

  const effectiveNowMs = pet.isFrozen ? (pet.frozenAt ?? nowMs) : nowMs;
  const anchorMs = pet.stageEnteredAt ?? pet.birthTimestamp ?? effectiveNowMs;
  const evolveAtMs = anchorMs + delayMs;
  const remainingMs = Math.max(0, evolveAtMs - effectiveNowMs);
  const windowExpired = !pet.isFrozen && effectiveNowMs >= evolveAtMs;
  const readyToEvolve = windowExpired && elig.goalsMet && Boolean(elig.nextId);
  const missedDeadline =
    windowExpired &&
    (!elig.goalsMet || !elig.nextId) &&
    pet.stage !== 'egg' &&
    pet.stage !== 'fresh';

  return {
    goalsMet: elig.goalsMet,
    nextId: elig.nextId,
    archetype: elig.archetype,
    delayMs,
    evolveAtMs,
    remainingMs,
    windowExpired,
    readyToEvolve,
    missedDeadline,
  };
}

export function applyEvolutionToPetState(
  prev: PetState,
  target: DigimonSpecies,
  nowMs: number = Date.now()
): PetState {
  const wasArmor = prev.equippedSpecialItem &&
    Object.values(SPECIAL_ITEMS).some((item) => item.armorSpeciesId === target.id && item.id === prev.equippedSpecialItem);

  const prevSpecies = DIGIMON_DATABASE[prev.currentSpeciesId];
  const prevEffective = getEffectiveBattleStats(prev, prevSpecies);
  const prevBase = getBaseBattleStatsForSpecies(prevSpecies);
  const targetBase = getBaseBattleStatsForSpecies(target);

  const trainedBonus = {
    maxHp: Math.max(0, prevEffective.maxHp - prevBase.maxHp),
    maxMp: Math.max(0, prevEffective.maxMp - prevBase.maxMp),
    offense: Math.max(0, prevEffective.offense - prevBase.offense),
    defense: Math.max(0, prevEffective.defense - prevBase.defense),
    speed: Math.max(0, prevEffective.speed - prevBase.speed),
    brains: Math.max(0, prevEffective.brains - prevBase.brains),
  };

  const nextBattleStats = {
    maxHp: targetBase.maxHp + trainedBonus.maxHp,
    maxMp: targetBase.maxMp + trainedBonus.maxMp,
    offense: targetBase.offense + trainedBonus.offense,
    defense: targetBase.defense + trainedBonus.defense,
    speed: targetBase.speed + trainedBonus.speed,
    brains: targetBase.brains + trainedBonus.brains,
  };

  const draftPet: PetState = {
    ...prev,
    currentSpeciesId: target.id,
    stage: target.stage,
    battleStats: nextBattleStats,
  };
  const nextLearned = getLearnedTechniqueIds(draftPet, target);
  const existingEquipped = Array.isArray(prev.equippedAttackIds)
    ? prev.equippedAttackIds.filter((id) => nextLearned.includes(id))
    : [];
  const nextEquipped = Array.from(new Set([...existingEquipped, ...nextLearned])).slice(
    0,
    MAX_EQUIPPED_ATTACKS
  );

  return {
    ...prev,
    currentSpeciesId: target.id,
    stage: target.stage,
    weight: prev.weight + 8,
    strength: prev.strength + 30,
    dpPoints: prev.dpPoints + 40,
    happiness: 100,
    effort: 0,
    stageBattlesWon: 0,
    stageBattlesTotal: 0,
    stageTrainingCount: 0,
    equippedSpecialItem: wasArmor ? null : prev.equippedSpecialItem,
    stageEnteredAt: nowMs,
    evoGoalMetAt: undefined,
    evolutionLocked: false,
    lastHungerDropAt: nowMs,
    lastPoopAt: nowMs,
    lastCareCheck: nowMs,
    careCallStartedAt: undefined,
    sleepCallStartedAt: undefined,
    isFrozen: false,
    frozenAt: undefined,
    battleStats: nextBattleStats,
    learnedAttackIds: nextLearned,
    equippedAttackIds: nextEquipped,
    unlockedSpeciesIds: recordUnlockedSpeciesId(target.id, prev.unlockedSpeciesIds || []),
  };
}

function buildSpeciesOverlayVisualFields(species: DigimonSpecies | undefined, playerName?: string) {
  const speciesId = species?.id || 'agumon';
  const spriteKey = species?.spriteId || speciesId;
  const conf =
    getEffectiveSpriteConfig(spriteKey) ||
    NEW_DIGIMON_SPRITES[spriteKey] ||
    NEW_DIGIMON_SPRITES['agumon'];
  const standingFrames = conf?.frames?.standing || [];
  const walkingFrames = conf?.frames?.walking || standingFrames;
  const sleepingFrames = conf?.frames?.sleeping || standingFrames;
  const activeFrame = walkingFrames[0] || standingFrames[0] || { x: 2, y: 2, w: 48, h: 48 };
  const profile = getPersonalityProfile(speciesId);
  const speciesQuotes = [
    ...profile.catchphrases,
    ...profile.idleQuotes,
    ...profile.selfStories,
    ...profile.curiousQuestions.slice(0, 2),
    ...profile.happyQuotes,
    ...profile.hungryQuotes,
    ...profile.battleQuotes,
    ...HELLOPET_QUOTES,
  ].map((q) => personalizeQuoteForPlayer(q, playerName));

  return {
    speciesId,
    speciesName: species?.name || 'Digimon',
    spriteUrl: conf?.sheetPath || '/assets/digidestined/agumon.png',
    sheetWidth: conf?.sheetWidth || 200,
    sheetHeight: conf?.sheetHeight || 200,
    stageWidth: conf?.stageWidth || 0,
    stageHeight: conf?.stageHeight || 0,
    groundOffset: conf?.groundOffset || 0,
    frameX: activeFrame.x || 0,
    frameY: activeFrame.y || 0,
    frameW: activeFrame.w || 48,
    frameH: activeFrame.h || 48,
    frameRotate: activeFrame.rotate || 0,
    standingFramesJson: JSON.stringify(standingFrames),
    walkingFramesJson: JSON.stringify(walkingFrames),
    sleepingFramesJson: JSON.stringify(sleepingFrames),
    quotesJson: JSON.stringify(speciesQuotes),
    isFlying: isFlyingSpecies(species),
  };
}

export function buildNativeOverlayPayload(params: {
  pet: PetState;
  species?: DigimonSpecies;
  presetId?: GridLayoutPresetId;
  previewRowIndex?: number;
  nowMs?: number;
  evolvedMessage?: string;
}): OverlayLaunchParams {
  const { pet, species, presetId, previewRowIndex, nowMs = Date.now(), evolvedMessage } = params;
  const base = buildSpeciesOverlayVisualFields(species, pet.playerName);
  const timing = computeNaturalEvoTiming(pet, species, nowMs);

  let nextEvoTriggerMsStr = '0';
  let nextEvoPayloadJson = '';

  if (
    !pet.isDead &&
    !pet.isFrozen &&
    !pet.evolutionLocked &&
    pet.stage !== 'egg' &&
    timing.goalsMet &&
    timing.nextId &&
    DIGIMON_DATABASE[timing.nextId]
  ) {
    const nextSpecies = DIGIMON_DATABASE[timing.nextId];
    const nextVisuals = buildSpeciesOverlayVisualFields(nextSpecies, pet.playerName);
    const safeTriggerAt = Math.max(nowMs + 1500, timing.evolveAtMs);
    nextEvoTriggerMsStr = String(safeTriggerAt);
    nextEvoPayloadJson = JSON.stringify({
      ...nextVisuals,
      stage: nextSpecies.stage,
      hungerHeartMs: getStageHungerHeartMs(nextSpecies.stage),
      evolvedMessage: `Digivolved into ${nextSpecies.name}!`,
    });
  }

  const stageHungerHeartMs = getStageHungerHeartMs(pet.stage);
  const lastHungerDropAtMs = Math.round(pet.lastHungerDropAt ?? pet.lastCareCheck ?? nowMs);

  return {
    speciesName: base.speciesName,
    spriteUrl: base.spriteUrl,
    sheetWidth: base.sheetWidth,
    sheetHeight: base.sheetHeight,
    stageWidth: base.stageWidth,
    stageHeight: base.stageHeight,
    groundOffset: base.groundOffset,
    frameX: base.frameX,
    frameY: base.frameY,
    frameW: base.frameW,
    frameH: base.frameH,
    frameRotate: base.frameRotate,
    standingFramesJson: base.standingFramesJson,
    walkingFramesJson: base.walkingFramesJson,
    sleepingFramesJson: base.sleepingFramesJson,
    quotesJson: base.quotesJson,
    isFlying: base.isFlying,
    isSleeping: Boolean(pet.isSleeping || pet.lightsOff),
    gridRowRatiosJson: JSON.stringify(getGridRowRatios(presetId)),
    previewRowIndex: typeof previewRowIndex === 'number' ? previewRowIndex : -1,
    hunger: Math.max(0, Math.min(100, Math.round(Number(pet.hunger) || 0))),
    happiness: Math.max(0, Math.min(100, Math.round(Number(pet.happiness) || 0))),
    bigMeatStock: Math.max(0, Math.round(Number(pet.bigMeatStock) || 0)),
    vitaminStock: Math.max(0, Math.round(Number(pet.vitaminStock) || 0)),
    stage: pet.stage,
    isFrozen: Boolean(pet.isFrozen),
    hungerHeartMsStr: String(stageHungerHeartMs),
    lastHungerDropAtMsStr: String(lastHungerDropAtMs),
    evolvedMessage: evolvedMessage || '',
    nextEvoTriggerMsStr,
    nextEvoPayloadJson,
  };
}
