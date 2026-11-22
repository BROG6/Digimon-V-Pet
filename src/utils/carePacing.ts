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

export const STAGE_BEDTIME_HOUR: Record<DigimonStage, number | null> = {
  egg: null,
  fresh: null,
  'in-training': 21, // 9:00 PM - 7:00 AM
  rookie: 21, // 9:00 PM - 7:00 AM
  champion: 22, // 10:00 PM - 7:00 AM
  ultimate: 23, // 11:00 PM - 7:00 AM
  mega: 0, // 12:00 AM - 7:00 AM
};

export const WAKE_UP_HOUR = 7; // 7:00 AM
export const EARLY_SLEEP_WINDOW_HOURS = 3; // Allow lights off within 3 hours before bedtime
export const TRAINING_ENERGY_COST = 12;
export const ENERGY_AWAKE_REGEN_MS = 120_000; // +1 Energy every 2 minutes awake (+30/hr)

export function getStageBedtimeHour(stage: DigimonStage): number | null {
  return STAGE_BEDTIME_HOUR[stage] ?? null;
}

export function getEarlySleepStartHour(stage: DigimonStage): number | null {
  const bedtime = getStageBedtimeHour(stage);
  if (bedtime === null) return null;
  return (bedtime - EARLY_SLEEP_WINDOW_HOURS + 24) % 24;
}

export function formatBedtimeLabel(stage: DigimonStage): string {
  const hr = getStageBedtimeHour(stage);
  if (hr === null) return 'N/A (No Fixed Bedtime)';
  if (hr === 0) return '12:00 AM – 7:00 AM';
  const h12 = hr > 12 ? hr - 12 : hr;
  return `${h12}:00 PM – 7:00 AM`;
}

export function formatEarlyBedtimeLabel(stage: DigimonStage): string {
  const start = getEarlySleepStartHour(stage);
  if (start === null) return 'Anytime';
  const formatHr = (h: number) => {
    if (h === 0) return '12:00 AM';
    if (h === 12) return '12:00 PM';
    return h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
  };
  return `${formatHr(start)} – 7:00 AM`;
}

export function isWithinSleepWindow(stage: DigimonStage, date: Date = new Date()): boolean {
  const bedtime = getStageBedtimeHour(stage);
  if (bedtime === null) return false;
  const hour = date.getHours();
  if (bedtime === 0) {
    return hour >= 0 && hour < WAKE_UP_HOUR;
  }
  return hour >= bedtime || hour < WAKE_UP_HOUR;
}

/**
 * Allows putting the Digimon to sleep up to 3 hours prior to its scheduled bedtime
 * and staying asleep all night until 7:00 AM.
 */
export function isWithinEarlyOrSleepWindow(stage: DigimonStage, date: Date = new Date()): boolean {
  const earlyStart = getEarlySleepStartHour(stage);
  if (earlyStart === null) return false;
  const hour = date.getHours();
  return hour >= earlyStart || hour < WAKE_UP_HOUR;
}

export function getNextBedtimeTimestampMs(stage: DigimonStage, nowMs: number = Date.now()): number {
  const bedtime = getStageBedtimeHour(stage);
  if (bedtime === null) return 0;
  const d = new Date(nowMs);
  if (isWithinSleepWindow(stage, d)) {
    return nowMs + 5_000;
  }
  const target = new Date(d);
  target.setHours(bedtime, 0, 0, 0);
  if (target.getTime() <= nowMs) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

export interface CareStepEvents {
  hungerBecameLow: boolean;
  hungerBecameEmpty: boolean;
  poopAdded: boolean;
  poopHitFour: boolean;
  careMistakeAdded: boolean;
  sickTriggered: boolean;
  bedtimeCallStarted: boolean;
  wokeUpMorning: boolean;
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
  isSleepy: boolean;
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
  if (pet.stage === 'egg' || pet.isDead || pet.isFrozen) {
    return {
      isHungry: false,
      isStarving: false,
      needsToilet: false,
      toiletUrgent: false,
      toiletFull: false,
      isSleepy: false,
      hasAnyNeed: false,
      graceRemainingMs: 0,
    };
  }

  const isStarving = pet.hunger <= 0;
  const isHungry = pet.hunger <= 25;
  const needsToilet = pet.poopCount > 0;
  const toiletUrgent = pet.poopCount >= 3;
  const toiletFull = pet.poopCount >= 4;
  const isSleepy = !pet.lightsOff && isWithinSleepWindow(pet.stage, new Date(nowMs));

  const hungerGrace =
    pet.careCallStartedAt && isStarving
      ? Math.max(0, pet.careCallStartedAt + CARE_MISTAKE_GRACE_MS - nowMs)
      : 0;
  const sleepGrace =
    pet.sleepCallStartedAt && isSleepy
      ? Math.max(0, pet.sleepCallStartedAt + CARE_MISTAKE_GRACE_MS - nowMs)
      : 0;
  const graceRemainingMs =
    hungerGrace > 0 && sleepGrace > 0
      ? Math.min(hungerGrace, sleepGrace)
      : hungerGrace || sleepGrace;

  return {
    isHungry,
    isStarving,
    needsToilet,
    toiletUrgent,
    toiletFull,
    isSleepy,
    hasAnyNeed: isHungry || needsToilet || pet.isSick || isSleepy,
    graceRemainingMs,
  };
}

/**
 * Advances V-Pet hunger, energy, toilet (poop), sleep schedule, sickness, and care mistake timers
 * using stage-calibrated Pendulum Ver. 20th rules:
 * - Poop timer pauses while asleep; accumulating 4 poop piles triggers sickness and 1 Care Mistake.
 * - Care Mistakes trigger only from ignoring Call Light past 10m grace on Empty Hunger or Bedtime.
 * - Sleeping Digimon auto-wake cleanly at 7:00 AM.
 */
export function advanceCareState(prev: PetState, now: number = Date.now()): CareStepResult {
  const emptyEvents: CareStepEvents = {
    hungerBecameLow: false,
    hungerBecameEmpty: false,
    poopAdded: false,
    poopHitFour: false,
    careMistakeAdded: false,
    sickTriggered: false,
    bedtimeCallStarted: false,
    wokeUpMorning: false,
    criticalWarning: null,
    deathNotice: null,
  };

  if (prev.stage === 'egg' || prev.isDead) {
    return { nextPet: prev, events: emptyEvents };
  }

  // In Fridge / Cold Mode: completely pause hunger, energy, toilet, sleep calls, care mistakes, and sickness
  if (prev.isFrozen) {
    return {
      nextPet: {
        ...prev,
        lastHungerDropAt: now,
        lastPoopAt: now,
        lastEnergyRegenAt: now,
        lastCareCheck: now,
        sleepCallStartedAt: undefined,
      },
      events: emptyEvents,
    };
  }

  const nowDate = new Date(now);
  const inSleepWindow = isWithinSleepWindow(prev.stage, nowDate);
  const canStayAsleep = isWithinEarlyOrSleepWindow(prev.stage, nowDate);
  const hasFixedBedtime = getStageBedtimeHour(prev.stage) !== null;

  // Auto-wake at 7:00 AM when morning arrives (early sleepers up to 3h before bedtime stay asleep all night)
  if (prev.lightsOff && hasFixedBedtime && !canStayAsleep) {
    const sleepAnchor = prev.lastCareCheck || now;
    const sleepElapsed = Math.max(0, Math.min(now - sleepAnchor, 12 * 3_600_000));
    const energyGain = Math.floor((sleepElapsed / 60_000) * 4);
    const nextEnergy = Math.min(100, prev.energy + Math.max(10, energyGain));
    return {
      nextPet: {
        ...prev,
        lightsOff: false,
        isSleeping: false,
        energy: nextEnergy,
        sleepCallStartedAt: undefined,
        lastHungerDropAt: now,
        lastPoopAt: now,
        lastEnergyRegenAt: now,
        lastCareCheck: now,
      },
      events: {
        ...emptyEvents,
        wokeUpMorning: true,
      },
    };
  }

  // While sleeping (lightsOff), hunger & poop timers pause and energy recovers gradually
  if (prev.lightsOff) {
    const sleepAnchor = prev.lastEnergyRegenAt ?? prev.lastCareCheck ?? now;
    const sleepElapsed = Math.max(0, Math.min(now - sleepAnchor, 12 * 3_600_000));
    const pointsRecovered = Math.floor(sleepElapsed / 15_000); // +4 Energy/min while sleeping
    const nextEnergy = pointsRecovered > 0 ? Math.min(100, prev.energy + pointsRecovered) : prev.energy;
    const nextEnergyAnchor =
      nextEnergy >= 100
        ? now
        : pointsRecovered > 0
        ? sleepAnchor + pointsRecovered * 15_000
        : sleepAnchor;
    return {
      nextPet: {
        ...prev,
        energy: nextEnergy,
        sleepCallStartedAt: undefined,
        lastHungerDropAt: now,
        lastPoopAt: now,
        lastEnergyRegenAt: nextEnergyAnchor,
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

  // 2. Slow Passive Energy Regeneration while awake (+1 per 2 min, capped at 100)
  const energyAnchor = prev.lastEnergyRegenAt ?? prev.lastCareCheck ?? now;
  const energyElapsed = Math.max(0, Math.min(now - energyAnchor, 8 * 3_600_000));
  let energy = prev.energy;
  let lastEnergyRegenAt = energyAnchor;
  if (energy >= 100) {
    energy = 100;
    lastEnergyRegenAt = now;
  } else {
    const energyPointsToGain = Math.floor(energyElapsed / ENERGY_AWAKE_REGEN_MS);
    if (energyPointsToGain > 0) {
      energy = Math.min(100, prev.energy + energyPointsToGain);
      lastEnergyRegenAt =
        energy >= 100 || energyElapsed >= 8 * 3_600_000
          ? now
          : energyAnchor + energyPointsToGain * ENERGY_AWAKE_REGEN_MS;
    }
  }

  // 3. Toilet / Poop Pacing (stops at 4 piles; hitting 4 piles triggers sickness AND 1 Care Mistake)
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

  // Accumulating 4 poop piles causes sickness/injury AND adds a Care Mistake
  if (poopCount >= 4 && !isSick) {
    isSick = true;
    sickSince = sickSince ?? now;
    events.sickTriggered = true;
  }

  if (isSick && !sickSince) {
    sickSince = now;
  }

  // 4. Care Mistakes: 4-Poop overload + 10-Minute Grace Window for Empty Hunger Call Light
  let careMistakes = prev.careMistakes;
  let careCallStartedAt = prev.careCallStartedAt;
  if (events.poopHitFour) {
    careMistakes += 1;
    events.careMistakeAdded = true;
  }
  if (hunger === 0) {
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

  // 5. 10-Minute Grace Window for Bedtime Call Light when awake inside stage sleep window
  let sleepCallStartedAt = prev.sleepCallStartedAt;
  if (inSleepWindow) {
    if (!sleepCallStartedAt) {
      sleepCallStartedAt = now;
      events.bedtimeCallStarted = true;
    } else if (now - sleepCallStartedAt >= CARE_MISTAKE_GRACE_MS) {
      careMistakes += 1;
      sleepCallStartedAt = now;
      events.careMistakeAdded = true;
    }
  } else {
    sleepCallStartedAt = undefined;
  }

  const sickElapsedMs = isSick && sickSince ? now - sickSince : 0;

  // 6. Death checks from severe / prolonged neglect
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
        sleepCallStartedAt,
        lastHungerDropAt,
        lastPoopAt,
        lastEnergyRegenAt,
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

  if (isSick && sickElapsedMs >= 20 * 60_000 && hunger === 0) {
    events.deathNotice = 'Your Digimon passed away from untreated sickness and starvation.';
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
        sleepCallStartedAt,
        lastHungerDropAt,
        lastPoopAt,
        lastEnergyRegenAt,
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
    events.criticalWarning = '🚨 CRITICAL! Feed, cure sickness & check lights right away!';
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
      sleepCallStartedAt,
      lastHungerDropAt,
      lastPoopAt,
      lastEnergyRegenAt,
      lastCareCheck: now,
    },
    events,
  };
}

export interface FutureCareAlertSchedule {
  hungryAtMs: number;
  starvingAtMs: number;
  nextPoopAtMs: number;
  nextPoopCount: number;
  poop2AtMs: number;
  poop3AtMs: number;
  poopFullAtMs: number;
  bedtimeAtMs: number;
}

/**
 * Computes exact future wall-clock timestamps when Hunger <= 25%, Hunger == 0%,
 * each remaining Poop pile (1..4), 4/4 Poop Sickness, and stage Bedtime will occur.
 */
export function computeFutureCareAlertSchedule(
  pet: PetState,
  nowMs: number = Date.now()
): FutureCareAlertSchedule {
  if (pet.stage === 'egg' || pet.isDead || pet.lightsOff || pet.isFrozen) {
    return {
      hungryAtMs: 0,
      starvingAtMs: 0,
      nextPoopAtMs: 0,
      nextPoopCount: pet.poopCount,
      poop2AtMs: 0,
      poop3AtMs: 0,
      poopFullAtMs: 0,
      bedtimeAtMs: 0,
    };
  }

  const heartMs = getStageHungerHeartMs(pet.stage);
  const msPerPoint = Math.max(1000, heartMs / 25);
  const hungerAnchor = pet.lastHungerDropAt ?? pet.lastCareCheck ?? nowMs;

  const hungryAtMs =
    pet.hunger > 25
      ? Math.max(nowMs + 5_000, Math.round(hungerAnchor + (pet.hunger - 25) * msPerPoint))
      : 0;

  const starvingAtMs =
    pet.hunger > 0
      ? Math.max(nowMs + 5_000, Math.round(hungerAnchor + pet.hunger * msPerPoint))
      : 0;

  const poopIntervalMs = getStagePoopIntervalMs(pet.stage);
  const poopAnchor = pet.lastPoopAt ?? pet.lastCareCheck ?? nowMs;
  const nextPoopCount = Math.min(4, pet.poopCount + 1);

  const nextPoopAtMs =
    pet.poopCount < 4 && poopIntervalMs > 0
      ? Math.max(nowMs + 5_000, Math.round(poopAnchor + poopIntervalMs))
      : 0;

  const poop2AtMs =
    pet.poopCount < 2 && poopIntervalMs > 0
      ? Math.max(nowMs + 5_000, Math.round(poopAnchor + 2 * poopIntervalMs))
      : 0;

  const poop3AtMs =
    pet.poopCount < 3 && poopIntervalMs > 0
      ? Math.max(nowMs + 5_000, Math.round(poopAnchor + (3 - pet.poopCount) * poopIntervalMs))
      : 0;

  const poopFullAtMs =
    pet.poopCount < 4 && poopIntervalMs > 0
      ? Math.max(nowMs + 5_000, Math.round(poopAnchor + (4 - pet.poopCount) * poopIntervalMs))
      : 0;

  const bedtimeAtMs =
    !pet.sleepCallStartedAt ? getNextBedtimeTimestampMs(pet.stage, nowMs) : 0;

  return {
    hungryAtMs,
    starvingAtMs,
    nextPoopAtMs,
    nextPoopCount,
    poop2AtMs,
    poop3AtMs,
    poopFullAtMs,
    bedtimeAtMs,
  };
}

