import { PetState, RoomWeatherTheme, TrainingStatKey } from '../types/digimon';

export interface RoomWeatherEffectSpec {
  id: RoomWeatherTheme;
  label: string;
  shortLabel: string;
  icon: string;
  tagline: string;
  happinessEffectLabel: string;
  trainingEffectLabel: string;
  /** Ambient happiness delta applied every WEATHER_HAPPINESS_TICK_MS while awake */
  ambientHappinessDelta: number;
  /** Extra happiness delta applied on completing a Gym or Pendulum training session */
  trainingHappinessBonus: number;
  /** Per-stat training multipliers */
  statMultipliers: Record<TrainingStatKey, number>;
  badgeClasses: string;
  activeButtonClasses: string;
}

export const WEATHER_HAPPINESS_TICK_MS = 2 * 60_000; // Every 2 minutes while awake

export const ROOM_WEATHER_ORDER: RoomWeatherTheme[] = ['sunny', 'rainy', 'snowy'];

export const ROOM_WEATHER_SPECS: Record<RoomWeatherTheme, RoomWeatherEffectSpec> = {
  sunny: {
    id: 'sunny',
    label: 'Sunny',
    shortLabel: 'SUNNY',
    icon: '☀️',
    tagline: 'Bright sunbeams keep spirits high and power up physical drills.',
    happinessEffectLabel: '+2 Mood / 2m · +4 Mood per Training',
    trainingEffectLabel: '+20% HP & OFF · +15% SPD',
    ambientHappinessDelta: 2,
    trainingHappinessBonus: 4,
    statMultipliers: {
      hp: 1.2,
      mp: 1.0,
      offense: 1.2,
      defense: 1.0,
      speed: 1.15,
      brains: 1.0,
    },
    badgeClasses: 'bg-amber-500/20 border-amber-400/50 text-amber-200',
    activeButtonClasses: 'bg-amber-400 text-slate-950 border-amber-200 shadow-md shadow-amber-500/30',
  },
  rainy: {
    id: 'rainy',
    label: 'Rainy',
    shortLabel: 'RAINY',
    icon: '🌧️',
    tagline: 'Steady rainfall sharpens MP & Brains focus, though wet weather slightly dampens mood.',
    happinessEffectLabel: '-1 Mood / 2m · -3 Mood per Training',
    trainingEffectLabel: '+25% MP & BRN · +15% DEF (-5% OFF/SPD)',
    ambientHappinessDelta: -1,
    trainingHappinessBonus: -3,
    statMultipliers: {
      hp: 1.0,
      mp: 1.25,
      offense: 0.95,
      defense: 1.15,
      speed: 0.95,
      brains: 1.25,
    },
    badgeClasses: 'bg-sky-500/20 border-sky-400/50 text-sky-200',
    activeButtonClasses: 'bg-sky-400 text-slate-950 border-sky-200 shadow-md shadow-sky-500/30',
  },
  snowy: {
    id: 'snowy',
    label: 'Snowy',
    shortLabel: 'SNOWY',
    icon: '❄️',
    tagline: 'Crisp winter snowfall lifts cheer and builds tough Defense & agility.',
    happinessEffectLabel: '+1 Mood / 2m · +2 Mood per Training',
    trainingEffectLabel: '+25% DEF · +20% SPD · +15% HP',
    ambientHappinessDelta: 1,
    trainingHappinessBonus: 2,
    statMultipliers: {
      hp: 1.15,
      mp: 1.0,
      offense: 1.0,
      defense: 1.25,
      speed: 1.2,
      brains: 1.05,
    },
    badgeClasses: 'bg-cyan-500/20 border-cyan-300/50 text-cyan-100',
    activeButtonClasses: 'bg-cyan-300 text-slate-950 border-white/80 shadow-md shadow-cyan-400/30',
  },
};

export function normalizeRoomWeather(weather?: string | null): RoomWeatherTheme {
  if (weather === 'rainy' || weather === 'snowy' || weather === 'sunny') {
    return weather;
  }
  return 'sunny';
}

export function getRoomWeatherSpec(weather?: RoomWeatherTheme | string | null): RoomWeatherEffectSpec {
  return ROOM_WEATHER_SPECS[normalizeRoomWeather(weather)];
}

export function getWeatherTrainingMultiplier(
  weather: RoomWeatherTheme | string | undefined | null,
  statKey: TrainingStatKey
): number {
  const spec = getRoomWeatherSpec(weather);
  return spec.statMultipliers[statKey] ?? 1.0;
}

export function formatWeatherBonusTag(
  weather: RoomWeatherTheme | string | undefined | null,
  statKey: TrainingStatKey
): string | null {
  const spec = getRoomWeatherSpec(weather);
  const mult = spec.statMultipliers[statKey] ?? 1.0;
  if (Math.abs(mult - 1) < 0.001) return null;
  const pct = Math.round((mult - 1) * 100);
  return `${spec.icon} ${pct > 0 ? `+${pct}%` : `${pct}%`}`;
}

export function advanceWeatherHappiness(prev: PetState, nowMs: number = Date.now()): PetState {
  if (prev.stage === 'egg' || prev.isDead || prev.isFrozen || prev.lightsOff) {
    if (prev.lastWeatherHappinessAt !== nowMs) {
      return { ...prev, lastWeatherHappinessAt: nowMs };
    }
    return prev;
  }

  const anchor = prev.lastWeatherHappinessAt ?? prev.lastCareCheck ?? nowMs;
  const elapsed = Math.max(0, Math.min(nowMs - anchor, 2 * 3_600_000));
  const ticks = Math.floor(elapsed / WEATHER_HAPPINESS_TICK_MS);
  if (ticks <= 0) {
    return prev.lastWeatherHappinessAt ? prev : { ...prev, lastWeatherHappinessAt: anchor };
  }

  const spec = getRoomWeatherSpec(prev.roomWeather);
  const delta = ticks * spec.ambientHappinessDelta;
  const nextHappiness = Math.max(0, Math.min(100, prev.happiness + delta));
  const nextAnchor =
    elapsed >= 2 * 3_600_000 ? nowMs : anchor + ticks * WEATHER_HAPPINESS_TICK_MS;

  if (nextHappiness === prev.happiness && nextAnchor === prev.lastWeatherHappinessAt) {
    return prev;
  }

  return {
    ...prev,
    happiness: nextHappiness,
    lastWeatherHappinessAt: nextAnchor,
  };
}
