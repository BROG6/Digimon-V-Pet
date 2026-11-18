import { DigimonSpecies, DigimonStage, PetState } from '../types/digimon';
import { DIGIMON_DATABASE, HELLOPET_QUOTES } from '../data/digidex';
import { getEffectiveSpriteConfig } from './customSpriteManager';
import { NEW_DIGIMON_SPRITES } from './newDigimonSprites';
import { getPersonalityProfile } from './digimonPersonality';
import { getGridRowRatios, GridLayoutPresetId, isFlyingSpecies } from './petOverlayEngine';
import { OverlayLaunchParams } from './nativeOverlay';

export interface EvolutionEligibility {
  goalsMet: boolean;
  nextId?: string;
  minTraining: number;
  minBattles: number;
}

export interface NaturalEvoTiming {
  goalsMet: boolean;
  nextId?: string;
  delayMs: number;
  evolveAtMs: number;
  remainingMs: number;
  readyToEvolve: boolean;
}

/**
 * Duration after meeting evolution goals before natural digivolution triggers automatically.
 */
export function getNaturalEvolutionDelayMs(stage: DigimonStage): number {
  switch (stage) {
    case 'fresh':
      return 30_000;
    case 'in-training':
      return 20_000;
    case 'rookie':
      return 25_000;
    case 'champion':
      return 30_000;
    case 'ultimate':
      return 35_000;
    default:
      return 30_000;
  }
}

export function checkEvolutionEligibility(
  pet: PetState,
  species?: DigimonSpecies
): EvolutionEligibility {
  if (!species || !species.nextEvolutions || species.nextEvolutions.length === 0) {
    return { goalsMet: false, minTraining: 0, minBattles: 0 };
  }

  const nextOption = species.nextEvolutions[0];
  const targetSpecies = DIGIMON_DATABASE[nextOption.speciesId];
  if (!targetSpecies) {
    return { goalsMet: false, minTraining: 0, minBattles: 0 };
  }

  if (pet.stage === 'fresh') {
    return {
      goalsMet: true,
      nextId: nextOption.speciesId,
      minTraining: 0,
      minBattles: 0,
    };
  }

  if (pet.stage === 'in-training') {
    const minTraining = nextOption.minTraining ?? 1;
    return {
      goalsMet: pet.trainingCount >= minTraining,
      nextId: nextOption.speciesId,
      minTraining,
      minBattles: 0,
    };
  }

  if (pet.stage === 'rookie') {
    const minBattles = nextOption.minBattles ?? 2;
    const minTraining = nextOption.minTraining ?? 4;
    return {
      goalsMet: pet.battlesWon >= minBattles && pet.trainingCount >= minTraining,
      nextId: nextOption.speciesId,
      minTraining,
      minBattles,
    };
  }

  if (pet.stage === 'champion') {
    const minBattles = nextOption.minBattles ?? 5;
    const minTraining = nextOption.minTraining ?? 8;
    return {
      goalsMet: pet.battlesWon >= minBattles && pet.trainingCount >= minTraining,
      nextId: nextOption.speciesId,
      minTraining,
      minBattles,
    };
  }

  if (pet.stage === 'ultimate') {
    const minBattles = nextOption.minBattles ?? 10;
    const minTraining = nextOption.minTraining ?? 15;
    return {
      goalsMet: pet.battlesWon >= minBattles && pet.trainingCount >= minTraining,
      nextId: nextOption.speciesId,
      minTraining,
      minBattles,
    };
  }

  return {
    goalsMet: false,
    nextId: nextOption.speciesId,
    minTraining: 0,
    minBattles: 0,
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
      delayMs,
      evolveAtMs: 0,
      remainingMs: Number.POSITIVE_INFINITY,
      readyToEvolve: false,
    };
  }

  const anchorMs =
    pet.stage === 'fresh'
      ? pet.stageEnteredAt ?? pet.evoGoalMetAt ?? pet.birthTimestamp ?? nowMs
      : pet.evoGoalMetAt ?? pet.stageEnteredAt ?? pet.birthTimestamp ?? nowMs;

  const evolveAtMs = anchorMs + delayMs;
  const remainingMs = Math.max(0, evolveAtMs - nowMs);

  return {
    goalsMet: true,
    nextId: elig.nextId,
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
  return {
    ...prev,
    currentSpeciesId: target.id,
    stage: target.stage,
    weight: prev.weight + 8,
    strength: prev.strength + 30,
    dpPoints: prev.dpPoints + 40,
    happiness: 100,
    stageEnteredAt: nowMs,
    evoGoalMetAt: undefined,
  };
}

function buildSpeciesOverlayVisualFields(species: DigimonSpecies | undefined) {
  const speciesId = species?.id || 'agumon';
  const conf =
    getEffectiveSpriteConfig(speciesId) ||
    NEW_DIGIMON_SPRITES[speciesId] ||
    NEW_DIGIMON_SPRITES['agumon'];
  const standingFrames = conf?.frames?.standing || [];
  const walkingFrames = conf?.frames?.walking || standingFrames;
  const activeFrame = walkingFrames[0] || standingFrames[0] || { x: 2, y: 2, w: 48, h: 48 };
  const profile = getPersonalityProfile(speciesId);
  const speciesQuotes = [
    ...profile.catchphrases,
    ...profile.idleQuotes,
    ...profile.happyQuotes,
    ...profile.hungryQuotes,
    ...profile.battleQuotes,
    ...HELLOPET_QUOTES,
  ];

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
  const base = buildSpeciesOverlayVisualFields(species);
  const timing = computeNaturalEvoTiming(pet, species, nowMs);

  let nextEvoTriggerMsStr = '0';
  let nextEvoPayloadJson = '';

  if (timing.goalsMet && timing.nextId && DIGIMON_DATABASE[timing.nextId]) {
    const nextSpecies = DIGIMON_DATABASE[timing.nextId];
    const nextVisuals = buildSpeciesOverlayVisualFields(nextSpecies);
    // Keep trigger at least 1.5s ahead so native service settles cleanly before switching if overdue
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
    quotesJson: base.quotesJson,
    isFlying: base.isFlying,
    gridRowRatiosJson: JSON.stringify(getGridRowRatios(presetId)),
    previewRowIndex: typeof previewRowIndex === 'number' ? previewRowIndex : -1,
    hunger: pet.hunger,
    happiness: pet.happiness,
    evolvedMessage: evolvedMessage || '',
    nextEvoTriggerMsStr,
    nextEvoPayloadJson,
  };
}
