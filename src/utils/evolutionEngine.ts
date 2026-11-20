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

export interface ArchetypeEvalResult {
  archetype: EvolutionArchetype;
  reason: string;
  exactMatch: boolean;
}

/**
 * Strictly evaluates the 15-Egg 4-Way Matrix & Raise Archetype System:
 * - Egg -> Baby I: Automatic after 1m
 * - Baby I -> Baby II: Automatic after 10m
 * - Baby II -> Rookie (12h):
 *   - Corrupted: CM >= 3 OR (CM >= 2 && TB > 0 && WR < 40%)
 *   - Virus: CM <= 2 && TB >= 8
 *   - Data: CM <= 1 && EF >= 7
 *   - Vaccine: CM <= 1
 * - Rookie -> Champion (24h), Champion -> Ultimate (40h), Ultimate -> Mega (48h):
 *   - Armor (Rookie only): Matching SP Relic equipped
 *   - Corrupted: CM >= 3 OR (CM >= 2 && TB > 0 && WR < 40%)
 *   - Vaccine: CM <= 1 && EF >= 6 && TB >= 1 && WR >= 60%
 *   - Data: CM <= 1 && EF >= 8 && WT === 'Normal'
 *   - Virus: CM >= 1 && CM <= 2 && TB >= 12 && WT === 'Heavy'
 */
export function evaluateRaiseArchetype(
  pet: PetState,
  _species?: DigimonSpecies
): ArchetypeEvalResult {
  const cm = pet.careMistakes || 0;
  const ef = getStageEffort(pet);
  const { total: tb, winRate: wr } = getStageBattleStats(pet);
  const wt = getWeightClass(pet.weight || 15, pet.stage);
  const matrix = EGG_LINE_MATRIX[pet.eggId];

  // Egg -> Baby I
  if (pet.stage === 'egg') {
    return {
      archetype: 'data',
      reason: 'Digitama incubates for 1 minute before hatching into Baby I.',
      exactMatch: true,
    };
  }

  // Fresh -> In-Training is fixed Baby I -> Baby II
  if (pet.stage === 'fresh') {
    return {
      archetype: 'data',
      reason: 'Baby I grows into Baby II after 10 minutes.',
      exactMatch: true,
    };
  }

  // Armor Check (Rookie -> Armor Champion)
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

  // In-Training -> Rookie Matrix Logic (Strict tree requirements)
  if (pet.stage === 'in-training') {
    if (cm >= 3 || (cm >= 2 && tb > 0 && wr < 40)) {
      return {
        archetype: 'corrupted',
        reason:
          cm >= 3
            ? `Corrupted Mutant met (CM ${cm} >= 3)`
            : `Corrupted Mutant met (CM ${cm} >= 2 & WR ${wr}% < 40%)`,
        exactMatch: true,
      };
    }
    if (cm <= 2 && tb >= 8 && !(cm <= 1 && ef >= 7 && wt !== 'Heavy')) {
      return {
        archetype: 'virus',
        reason: `Virus Brawler met (TB ${tb} >= 8)`,
        exactMatch: true,
      };
    }
    if (cm <= 1 && ef >= 7) {
      return {
        archetype: 'data',
        reason: `Data / Tech met (CM ${cm} <= 1 & Effort ${ef} >= 7)`,
        exactMatch: true,
      };
    }
    if (cm <= 1) {
      return {
        archetype: 'vaccine',
        reason: `Vaccine High Care met (CM ${cm} <= 1)`,
        exactMatch: true,
      };
    }
    // CM === 2 and TB < 8 and (TB === 0 || WR >= 40%) -> no tree rule satisfied!
    return {
      archetype: 'virus',
      reason: `Needs Virus (TB ${tb}/8) or Corrupted (CM ${cm}/3 or WR < 40% with battles)`,
      exactMatch: false,
    };
  }

  // Rookie -> Champion -> Ultimate -> Mega Strict Archetype Matrix
  // 1. Vaccine / Holy (High Care)
  if (cm <= 1 && ef >= 6 && tb >= 1 && wr >= 60) {
    return {
      archetype: 'vaccine',
      reason: `Vaccine / Holy met (CM ${cm} <= 1, EF ${ef} >= 6, WR ${wr}% >= 60%)`,
      exactMatch: true,
    };
  }

  // 2. Data / Tech / Dragon (High Effort + Normal Weight)
  if (cm <= 1 && ef >= 8 && wt === 'Normal') {
    return {
      archetype: 'data',
      reason: `Data / Tech met (CM ${cm} <= 1, EF ${ef} >= 8, Weight Normal)`,
      exactMatch: true,
    };
  }

  // 3. Virus / Brawler (Combat Heavy)
  if (cm >= 1 && cm <= 2 && tb >= 12 && wt === 'Heavy') {
    return {
      archetype: 'virus',
      reason: `Virus / Brawler met (CM ${cm}, TB ${tb} >= 12, Weight Heavy)`,
      exactMatch: true,
    };
  }

  // 4. Corrupted / Mutant (Neglect / Dark)
  if (cm >= 3 || (cm >= 2 && tb > 0 && wr < 40)) {
    return {
      archetype: 'corrupted',
      reason:
        cm >= 3
          ? `Corrupted Mutant met (CM ${cm} >= 3)`
          : `Corrupted Mutant met (CM ${cm} >= 2 & WR ${wr}% < 40%)`,
      exactMatch: true,
    };
  }

  // No exact archetype requirement met yet! Determine closest hint for UI without marking exactMatch.
  if (cm >= 2) {
    return {
      archetype: 'corrupted',
      reason: `Requirements not met: Hit TB ${tb}/12 + Heavy WT (Virus) or CM 3 / WR < 40% (Corrupted)`,
      exactMatch: false,
    };
  }
  if (wt === 'Heavy' && cm === 1) {
    return {
      archetype: 'virus',
      reason: `Requirements not met: Virus needs TB ${tb}/12 (Heavy WT) — or reach EF ${ef}/6 & WR ${wr}%/60%`,
      exactMatch: false,
    };
  }
  if (ef >= 6 && wt === 'Normal' && (tb === 0 || wr < 60)) {
    return {
      archetype: 'data',
      reason: `Requirements not met: Data needs EF ${ef}/8 (WT Normal) or Vaccine needs 1+ battle with WR >= 60%`,
      exactMatch: false,
    };
  }
  return {
    archetype: 'vaccine',
    reason: `Requirements not met: Vaccine needs EF ${ef}/6 & WR >= 60% (${tb} battles), or Data needs EF ${ef}/8 & Normal WT`,
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
  const minEffort =
    archetypeEval.archetype === 'data'
      ? pet.stage === 'in-training'
        ? 7
        : 8
      : archetypeEval.archetype === 'vaccine' && pet.stage !== 'in-training'
      ? 6
      : 0;
  const minBattles =
    archetypeEval.archetype === 'virus'
      ? pet.stage === 'in-training'
        ? 8
        : 12
      : archetypeEval.archetype === 'vaccine' && pet.stage !== 'in-training'
      ? 1
      : 0;

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
    minBattles,
    minEffort,
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

  const anchorMs = pet.stageEnteredAt ?? pet.birthTimestamp ?? nowMs;
  const evolveAtMs = anchorMs + delayMs;
  const remainingMs = Math.max(0, evolveAtMs - nowMs);
  const windowExpired = nowMs >= evolveAtMs;
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
      evolvedMessage: `Digivolved into ${nextSpecies.name}!`,
    });
  }

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
    evolvedMessage: evolvedMessage || '',
    nextEvoTriggerMsStr,
    nextEvoPayloadJson,
  };
}
