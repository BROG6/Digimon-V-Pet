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
  readyToEvolve: boolean;
}

/**
 * Duration after meeting evolution goals before natural digivolution triggers automatically.
 */
export function getNaturalEvolutionDelayMs(_stage: DigimonStage): number {
  return 60_000;
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
 * Evaluates which of the 4-way (+ Armor) Raise Archetypes the Digimon currently aligns with:
 * 1. Armor: Matching Relic equipped at Rookie stage
 * 2. Corrupted / Mutant: CM >= 3 OR (CM >= 2 && WR < 40%)
 * 3. Vaccine / Holy: CM <= 1, EF >= 6, WR >= 60%
 * 4. Data / Tech / Dragon: CM <= 1, EF >= 8, WT == Normal (EF >= 7 at In-Training -> Rookie)
 * 5. Virus / Brawler: CM 1-2, TB >= 12 (TB >= 8 at In-Training -> Rookie), WT == Heavy
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

  // 1. Armor Check (Rookie -> Armor Champion)
  if (
    pet.stage === 'rookie' &&
    pet.equippedSpecialItem &&
    matrix?.champion.armor &&
    matrix.champion.armor.itemId === pet.equippedSpecialItem
  ) {
    const itemLabel = SPECIAL_ITEMS[pet.equippedSpecialItem]?.shortName || pet.equippedSpecialItem;
    return {
      archetype: 'armor',
      reason: `Armor Evolution active via ${itemLabel}!`,
      exactMatch: true,
    };
  }

  // Fresh -> In-Training is fixed Baby I -> Baby II
  if (pet.stage === 'fresh') {
    return {
      archetype: 'data',
      reason: 'Baby I hatches directly into Baby II form.',
      exactMatch: true,
    };
  }

  // In-Training -> Rookie Matrix Logic
  if (pet.stage === 'in-training') {
    if (cm >= 3 || (cm >= 2 && tb > 0 && wr < 40)) {
      return {
        archetype: 'corrupted',
        reason: `Corrupted Mutant (CM ${cm} >= 3 or low WR ${wr}% with neglect)`,
        exactMatch: true,
      };
    }
    if (tb >= 8 && cm <= 2) {
      return {
        archetype: 'virus',
        reason: `Virus Brawler (TB ${tb} >= 8)`,
        exactMatch: true,
      };
    }
    if (cm <= 1 && ef >= 7) {
      return {
        archetype: 'data',
        reason: `Data / Tech (CM ${cm} <= 1 & Effort ${ef} >= 7)`,
        exactMatch: true,
      };
    }
    if (cm <= 1) {
      return {
        archetype: 'vaccine',
        reason: `Vaccine High Care (CM ${cm} <= 1)`,
        exactMatch: true,
      };
    }
    return {
      archetype: 'corrupted',
      reason: `Corrupted trend (CM ${cm})`,
      exactMatch: false,
    };
  }

  // Champion / Ultimate / Mega Full Archetype Matrix
  // Corrupted / Mutant (Neglect / Dark)
  if (cm >= 3 || (cm >= 2 && wr < 40)) {
    return {
      archetype: 'corrupted',
      reason: cm >= 3 ? `Corrupted (CM ${cm} >= 3)` : `Corrupted (CM ${cm} >= 2 & WR ${wr}% < 40%)`,
      exactMatch: true,
    };
  }

  // Vaccine / Holy (High Care + High Win Rate)
  if (cm <= 1 && ef >= 6 && wr >= 60) {
    return {
      archetype: 'vaccine',
      reason: `Vaccine / Holy (CM <= 1, EF ${ef} >= 6, WR ${wr}% >= 60%)`,
      exactMatch: true,
    };
  }

  // Data / Tech / Dragon (High Effort + Normal Weight)
  if (cm <= 1 && ef >= 8 && wt === 'Normal') {
    return {
      archetype: 'data',
      reason: `Data / Tech (CM <= 1, EF ${ef} >= 8, Weight Normal)`,
      exactMatch: true,
    };
  }

  // Virus / Brawler (Combat Heavy)
  if (cm >= 1 && cm <= 2 && tb >= 12 && wt === 'Heavy') {
    return {
      archetype: 'virus',
      reason: `Virus / Brawler (CM ${cm}, TB ${tb} >= 12, Weight Heavy)`,
      exactMatch: true,
    };
  }

  // Deterministic closest-match tie-breaker when stage milestones are met
  if (cm >= 2) {
    return {
      archetype: 'corrupted',
      reason: `Closest: Corrupted (CM ${cm}, WR ${wr}%)`,
      exactMatch: false,
    };
  }
  if (wt === 'Heavy' || (tb >= 6 && wr < 55)) {
    return {
      archetype: 'virus',
      reason: `Closest: Virus / Brawler (${wt} weight, ${tb} battles)`,
      exactMatch: false,
    };
  }
  if (ef >= 5 && wt === 'Normal' && wr < 60) {
    return {
      archetype: 'data',
      reason: `Closest: Data / Tech (EF ${ef}/10, Normal weight)`,
      exactMatch: false,
    };
  }
  return {
    archetype: 'vaccine',
    reason: `Closest: Vaccine / Holy (CM ${cm}, EF ${ef}/10, WR ${wr}%)`,
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

  // Special handling for Egg 08 where Tailmon (gatomon) can be either Rookie Data or Champion Data
  if (pet.stage === 'in-training') return matrix.rookie;
  if (pet.stage === 'rookie') return matrix.champion;
  if (pet.stage === 'champion') return matrix.ultimate;
  if (pet.stage === 'ultimate') return matrix.mega;

  // Fallback by species stage if out of sync
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

  const matrix = EGG_LINE_MATRIX[pet.eggId];
  let nextId: string | undefined;

  if (pet.stage === 'fresh') {
    nextId = matrix?.baby2 || species.nextEvolutions?.[0]?.speciesId;
  } else {
    const branches = getNextStageBranches(pet, species);
    if (branches) {
      nextId = pickBranchSpeciesId(branches, archetypeEval.archetype, weightClass, effort);
      // Safety guard: never evolve into the exact same species (Egg 08 Gatomon -> Gatomon skip)
      if (nextId === species.id && pet.stage === 'rookie') {
        nextId = pickBranchSpeciesId(matrix.ultimate, archetypeEval.archetype, weightClass, effort);
      }
    } else if (species.nextEvolutions && species.nextEvolutions.length > 0) {
      const matched =
        species.nextEvolutions.find((e) => e.archetype === archetypeEval.archetype) ||
        species.nextEvolutions[0];
      nextId = matched.speciesId;
    }
  }

  const targetSpecies = nextId ? DIGIMON_DATABASE[nextId] : undefined;
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

  const trainCount = typeof pet.stageTrainingCount === 'number' ? pet.stageTrainingCount : pet.trainingCount;
  const winsCount = typeof pet.stageBattlesWon === 'number' ? pet.stageBattlesWon : pet.battlesWon;

  if (pet.stage === 'fresh') {
    return {
      goalsMet: true,
      nextId,
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

  if (pet.stage === 'in-training') {
    const minTraining = 1;
    const minEffort = 2;
    const goalsMet = trainCount >= minTraining || effort >= minEffort || stageBattles >= 4;
    return {
      goalsMet,
      nextId,
      archetype: archetypeEval.archetype,
      reason: archetypeEval.reason,
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining,
      minBattles: 0,
      minEffort,
    };
  }

  if (pet.stage === 'rookie') {
    // Armor item lets Rookie evolve faster into Armor Champion
    if (archetypeEval.archetype === 'armor') {
      const minTraining = 2;
      const minBattles = 1;
      const goalsMet = trainCount >= minTraining && stageBattles >= minBattles;
      return {
        goalsMet,
        nextId,
        archetype: 'armor',
        reason: archetypeEval.reason,
        weightClass,
        winRate,
        effort,
        stageBattles,
        stageWins,
        minTraining,
        minBattles,
        minEffort: 4,
      };
    }

    const minTraining = 2;
    const minBattles = 2;
    const minEffort = 4;
    const goalsMet = (trainCount >= minTraining || effort >= minEffort) && (winsCount >= minBattles || stageBattles >= 4);
    return {
      goalsMet,
      nextId,
      archetype: archetypeEval.archetype,
      reason: archetypeEval.reason,
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining,
      minBattles,
      minEffort,
    };
  }

  if (pet.stage === 'champion') {
    const minTraining = 3;
    const minBattles = 4;
    const minEffort = 6;
    const goalsMet = (trainCount >= minTraining || effort >= minEffort) && (winsCount >= minBattles || stageBattles >= 7);
    return {
      goalsMet,
      nextId,
      archetype: archetypeEval.archetype,
      reason: archetypeEval.reason,
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining,
      minBattles,
      minEffort,
    };
  }

  if (pet.stage === 'ultimate') {
    const minTraining = 4;
    const minBattles = 6;
    const minEffort = 6;
    const goalsMet = (trainCount >= minTraining || effort >= minEffort) && (winsCount >= minBattles || stageBattles >= 10);
    return {
      goalsMet,
      nextId,
      archetype: archetypeEval.archetype,
      reason: archetypeEval.reason,
      weightClass,
      winRate,
      effort,
      stageBattles,
      stageWins,
      minTraining,
      minBattles,
      minEffort,
    };
  }

  return {
    goalsMet: false,
    nextId,
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

export function computeNaturalEvoTiming(
  pet: PetState,
  species?: DigimonSpecies,
  nowMs: number = Date.now()
): NaturalEvoTiming {
  const elig = checkEvolutionEligibility(pet, species);
  const delayMs = getNaturalEvolutionDelayMs(pet.stage);

  if (!elig.goalsMet || !elig.nextId) {
    return {
      goalsMet: false,
      nextId: elig.nextId,
      archetype: elig.archetype,
      delayMs,
      evolveAtMs: 0,
      remainingMs: Number.POSITIVE_INFINITY,
      readyToEvolve: false,
    };
  }

  const anchorMs =
    pet.stage === 'fresh'
      ? pet.evoGoalMetAt ?? pet.stageEnteredAt
      : pet.evoGoalMetAt;

  if (!anchorMs) {
    return {
      goalsMet: true,
      nextId: elig.nextId,
      archetype: elig.archetype,
      delayMs,
      evolveAtMs: nowMs + delayMs,
      remainingMs: delayMs,
      readyToEvolve: false,
    };
  }

  const evolveAtMs = anchorMs + delayMs;
  const remainingMs = Math.max(0, evolveAtMs - nowMs);

  return {
    goalsMet: true,
    nextId: elig.nextId,
    archetype: elig.archetype,
    delayMs,
    evolveAtMs,
    remainingMs,
    readyToEvolve: remainingMs <= 0,
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

  if (timing.goalsMet && timing.nextId && DIGIMON_DATABASE[timing.nextId]) {
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
