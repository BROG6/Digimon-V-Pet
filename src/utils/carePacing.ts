import { DigimonStage, PetState } from '../types/digimon';

export const CARE_MISTAKE_GRACE_MS = 10 * 60_000; // 10 minutes grace window once call activates

/**
 * Stage-calibrated Hunger Drain Interval (time to lose 1 heart = 25% hunger).
 * Based on Digital Monster / Pendulum Ver. 20th pacing:
 * - Baby I (fresh): ~4m per heart (~16m full drain)
 * - Baby II (in-training): ~30m per heart (~2h full drain)
 * - Rookie: ~60m per heart (~4h full drain)
 * - Champion: ~75m per heart (~5h full drain)
 * - Ultimate: ~90m per heart (~6h full drain)
 * - Mega: ~105m per heart (~7h full drain)
 */
export const STAGE_HUNGER_HEART_MS: Record<DigimonStage, number> = {
  egg: 0,
  fresh: 4 * 60_000,
  'in-training': 30 * 60_000,
  rookie: 60 * 60_000,
  champion: 75 * 60_000,
  ultimate: 90 * 60_000,
  mega: 105 * 60_000,
};

/**
 * Stage-calibrated Toilet (Poop) Interval (1 pile per interval, max 4 piles).
 * - Baby I (fresh): every 5m
 * - Baby II (in-training): every 30m
 * - Rookie: every 60m (1h)
 * - Champion: every 90m (1.5h)
 * - Ultimate: every 120m (2h)
 * - Mega: every 150m (2.5h)
 */
export const STAGE_POOP_INTERVAL_MS: Record<DigimonStage, number> = {
  egg: 0,
  fresh: 5 * 60_000,
  'in-training': 30 * 60_000,
  rookie: 60 * 60_000,
  champion: 90 * 60_000,
  ultimate: 120 * 60_000,
  mega: 150 * 60_000,
};

export const STAGE_ENERGY_HEART_MS: Record<DigimonStage, number> = {
  egg: 0,
  fresh: 8 * 60_000,
  'in-training': 40 * 60_000,
  rookie: 75 * 60_000,
  champion: 90 * 60_000,
  ultimate: 105 * 60_000,
  mega: 120 * 60_000,
};

export interface CareStepEvents {
  hungerBecameLow: boolean;
  hungerBecameEmpty: boolean;
  poopAdded: boolean;
  poopHitFour: boolean;
  careMistakeAdded: boolean;
  sickTriggered: boolean;
  criticalWarning: string | null;
  deathNotice: string | null;
}

export interface CareStepResult {
  nextPet: PetState;
  events: CareStepEvents;
}

export interface CareNeedStatus {
  isHungry: boolean;
  isStarving: boolean;
  needsToilet: boolean;
  toiletUrgent: boolean;
  toiletFull: boolean;
  hasAnyNeed: boolean;
  graceRemainingMs: number;
}

export function getStageHungerHeartMs(stage: DigimonStage): number {
  return STAGE_HUNGER_HEART_MS[stage] ?? 60 * 60_000;
}

export function getStagePoopIntervalMs(stage: DigimonStage): number {
  return STAGE_POOP_INTERVAL_MS[stage] ?? 60 * 60_000;
}

export function evaluateCareNeeds(pet: PetState, nowMs: number = Date.now()): CareNeedStatus {
  if (pet.stage === 'egg' || pet.isDead) {
    return {
      isHungry: false,
      isStarving: false,
      needsToilet: false,
      toiletUrgent: false,
      toiletFull: false,
      hasAnyNeed: false,
      graceRemainingMs: 0,
    };
  }

  const isStarving = pet.hunger <= 0;
  const isHungry = pet.hunger <= 25;
  const needsToilet = pet.poopCount > 0;
  const toiletUrgent = pet.poopCount >= 3;
  const toiletFull = pet.poopCount >= 4;
  const graceRemainingMs =
    pet.careCallStartedAt && (isStarving || toiletFull || pet.energy <= 0)
      ? Math.max(0, pet.careCallStartedAt + CARE_MISTAKE_GRACE_MS - nowMs)
      : 0;

  return {
    isHungry,
    isStarving,
    needsToilet,
    toiletUrgent,
    toiletFull,
    hasAnyNeed: isHungry || needsToilet || pet.isSick,
    graceRemainingMs,
  };
}

/**
 * Advances V-Pet hunger, energy, toilet (poop), sickness, and care mistake timers
 * using stage-calibrated timestamps so pacing matches Digital Monster Ver. 20th.
 */
export function advanceCareState(prev: PetState, now: number = Date.now()): CareStepResult {
  const emptyEvents: CareStepEvents = {
    hungerBecameLow: false,
    hungerBecameEmpty: false,
    poopAdded: false,
    poopHitFour: false,
    careMistakeAdded: false,
    sickTriggered: false,
    criticalWarning: null,
    deathNotice: null,
  };

  if (prev.stage === 'egg' || prev.isDead) {
    return { nextPet: prev, events: emptyEvents };
  }

  // While sleeping, hunger & poop timers pause and energy recovers gradually
  if (prev.lightsOff) {
    const sleepAnchor = prev.lastCareCheck || now;
    const sleepElapsed = Math.max(0, Math.min(now - sleepAnchor, 4 * 3_600_000));
    const energyGain = Math.floor((sleepElapsed / 60_000) * 4);
    const nextEnergy = Math.min(100, prev.energy + Math.max(1, energyGain));
    return {
      nextPet: {
        ...prev,
        energy: nextEnergy,
        lastHungerDropAt: now,
        lastPoopAt: now,
        lastCareCheck: now,
      },
      events: emptyEvents,
    };
  }

  const events: CareStepEvents = { ...emptyEvents };

  // 1. Hunger Drain (Stage-based 1 heart = 25 points)
  const heartMs = getStageHungerHeartMs(prev.stage);
  const msPerHungerPoint = Math.max(1000, heartMs / 25);
  const hungerAnchor = prev.lastHungerDropAt ?? prev.lastCareCheck ?? now;
  const hungerElapsed = Math.max(0, Math.min(now - hungerAnchor, 4 * 3_600_000));
  const hungerPointsToDrop = Math.floor(hungerElapsed / msPerHungerPoint);

  let hunger = prev.hunger;
  let lastHungerDropAt = hungerAnchor;
  if (hungerPointsToDrop > 0) {
    hunger = Math.max(0, prev.hunger - hungerPointsToDrop);
    lastHungerDropAt =
      hungerElapsed >= 4 * 3_600_000 ? now : hungerAnchor + hungerPointsToDrop * msPerHungerPoint;
  }

  if (prev.hunger > 25 && hunger <= 25 && hunger > 0) {
    events.hungerBecameLow = true;
  }
  if (prev.hunger > 0 && hunger === 0) {
    events.hungerBecameEmpty = true;
  }

  // 2. Energy Drain
  const energyHeartMs = STAGE_ENERGY_HEART_MS[prev.stage] ?? 75 * 60_000;
  const msPerEnergyPoint = Math.max(1000, energyHeartMs / 25);
  const careAnchor = prev.lastCareCheck ?? now;
  const energyElapsed = Math.max(0, Math.min(now - careAnchor, 4 * 3_600_000));
  const energyDrop = Math.floor(energyElapsed / msPerEnergyPoint);
  const energy = energyDrop > 0 ? Math.max(0, prev.energy - energyDrop) : prev.energy;

  // 3. Toilet / Poop Pacing (stops at 4 piles; 4 piles triggers sickness/injury)
  const poopIntervalMs = getStagePoopIntervalMs(prev.stage);
  let poopCount = prev.poopCount;
  let lastPoopAt = prev.lastPoopAt ?? prev.lastCareCheck ?? now;
  let isSick = prev.isSick;
  let sickSince = prev.sickSince;

  if (poopCount >= 4) {
    // Once 4 piles are on screen, stops pooping until cleared
    lastPoopAt = now;
  } else if (poopIntervalMs > 0) {
    const poopElapsed = Math.max(0, Math.min(now - lastPoopAt, 4 * 3_600_000));
    const newPiles = Math.floor(poopElapsed / poopIntervalMs);
    if (newPiles > 0) {
      const nextPoop = Math.min(4, poopCount + newPiles);
      if (nextPoop > poopCount) {
        events.poopAdded = true;
      }
      if (poopCount < 4 && nextPoop >= 4) {
        events.poopHitFour = true;
      }
      poopCount = nextPoop;
      lastPoopAt = poopCount >= 4 ? now : lastPoopAt + newPiles * poopIntervalMs;
    }
  }

  // Digital Monster Ver. 20th rule: accumulating 4 poop piles causes injury/sickness
  if (poopCount >= 4 && !isSick) {
    isSick = true;
    sickSince = sickSince ?? now;
    events.sickTriggered = true;
  }

  if (isSick && !sickSince) {
    sickSince = now;
  }

  // 4. 10-Minute Grace Window before recording Care Mistake when empty/full-poop
  let careMistakes = prev.careMistakes;
  let careCallStartedAt = prev.careCallStartedAt;
  const inCareCall = hunger === 0 || poopCount >= 4 || energy === 0;

  if (inCareCall) {
    if (!careCallStartedAt) {
      careCallStartedAt = now;
    } else if (now - careCallStartedAt >= CARE_MISTAKE_GRACE_MS) {
      const intervalsPassed = Math.max(1, Math.floor((now - careCallStartedAt) / CARE_MISTAKE_GRACE_MS));
      careMistakes += Math.min(3, intervalsPassed);
      careCallStartedAt = now;
      events.careMistakeAdded = true;
    }
  } else {
    careCallStartedAt = undefined;
  }

  const sickElapsedMs = isSick && sickSince ? now - sickSince : 0;

  // 5. Death checks from severe / prolonged neglect
  if (careMistakes >= 8) {
    events.deathNotice = 'Your Digimon passed away from severe neglect (8+ Care Mistakes).';
    return {
      nextPet: {
        ...prev,
        hunger,
        energy,
        poopCount,
        isSick,
        sickSince,
        careMistakes,
        careCallStartedAt,
        lastHungerDropAt,
        lastPoopAt,
        isDead: true,
        diedAt: now,
        deathReason: 'Severe neglect (8+ Care Mistakes).',
        isSleeping: false,
        lightsOff: false,
        lastCareCheck: now,
      },
      events,
    };
  }

  if (isSick && sickElapsedMs >= 20 * 60_000 && (hunger === 0 || poopCount >= 4)) {
    events.deathNotice = 'Your Digimon passed away from untreated sickness and neglect.';
    return {
      nextPet: {
        ...prev,
        hunger,
        energy,
        poopCount,
        isSick,
        sickSince,
        careMistakes,
        careCallStartedAt,
        lastHungerDropAt,
        lastPoopAt,
        isDead: true,
        diedAt: now,
        deathReason: 'Untreated sickness persisted too long.',
        isSleeping: false,
        lightsOff: false,
        lastCareCheck: now,
      },
      events,
    };
  }

  if (careMistakes >= 6 || (isSick && sickElapsedMs >= 10 * 60_000)) {
    events.criticalWarning = '🚨 CRITICAL NEGLECT! Feed, flush & cure sickness right away!';
  }

  return {
    nextPet: {
      ...prev,
      hunger,
      energy,
      poopCount,
      isSick,
      sickSince,
      careMistakes,
      careCallStartedAt,
      lastHungerDropAt,
      lastPoopAt,
      lastCareCheck: now,
    },
    events,
  };
}
