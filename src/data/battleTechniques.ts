import {
  AttackElement,
  AttackMove,
  BattleMove,
  BattleStats,
  DigimonSpecies,
  DigimonStage,
  PetState,
  TrainingStatKey,
} from '../types/digimon';

export const MAX_EQUIPPED_ATTACKS = 4;

export interface AttackElementMeta {
  id: AttackElement;
  label: string;
  shortLabel: string;
  badgeClass: string;
  beatsLabel: string;
  weaknessLabel: string;
}

export const ATTACK_ELEMENT_META: Record<AttackElement, AttackElementMeta> = {
  fire: {
    id: 'fire',
    label: 'Fire',
    shortLabel: 'FIRE',
    badgeClass: 'text-orange-300 border-orange-500/50 bg-orange-950/60',
    beatsLabel: 'Nature, Filth',
    weaknessLabel: 'Ice',
  },
  nature: {
    id: 'nature',
    label: 'Nature',
    shortLabel: 'NATR',
    badgeClass: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/60',
    beatsLabel: 'Air, Filth',
    weaknessLabel: 'Fire',
  },
  air: {
    id: 'air',
    label: 'Air / Thunder',
    shortLabel: 'AIR',
    badgeClass: 'text-yellow-300 border-yellow-500/50 bg-yellow-950/60',
    beatsLabel: 'Ice, Filth',
    weaknessLabel: 'Nature',
  },
  ice: {
    id: 'ice',
    label: 'Ice / Water',
    shortLabel: 'ICE',
    badgeClass: 'text-cyan-300 border-cyan-500/50 bg-cyan-950/60',
    beatsLabel: 'Fire, Filth',
    weaknessLabel: 'Air',
  },
  holy: {
    id: 'holy',
    label: 'Holy',
    shortLabel: 'HOLY',
    badgeClass: 'text-amber-200 border-amber-400/50 bg-amber-950/60',
    beatsLabel: 'Dark',
    weaknessLabel: 'Dark, Filth',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    shortLabel: 'DARK',
    badgeClass: 'text-purple-300 border-purple-500/50 bg-purple-950/60',
    beatsLabel: 'Holy',
    weaknessLabel: 'Holy, Filth',
  },
  hand: {
    id: 'hand',
    label: 'Hand-to-Hand',
    shortLabel: 'HAND',
    badgeClass: 'text-rose-300 border-rose-500/50 bg-rose-950/60',
    beatsLabel: 'Weapon, Filth',
    weaknessLabel: 'Weapon',
  },
  weapon: {
    id: 'weapon',
    label: 'Weapon / Mech',
    shortLabel: 'MECH',
    badgeClass: 'text-sky-300 border-sky-500/50 bg-sky-950/60',
    beatsLabel: 'Hand-to-Hand',
    weaknessLabel: 'Hand-to-Hand, Filth',
  },
  filth: {
    id: 'filth',
    label: 'Filth',
    shortLabel: 'FILTH',
    badgeClass: 'text-lime-300 border-lime-500/50 bg-lime-950/60',
    beatsLabel: 'Holy, Dark, Weapon',
    weaknessLabel: 'Fire, Nature, Air, Ice, Hand',
  },
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    shortLabel: 'NEUT',
    badgeClass: 'text-slate-300 border-slate-500/50 bg-slate-800/80',
    beatsLabel: 'None (Balanced)',
    weaknessLabel: 'None',
  },
};

export interface GymStationInfo {
  id: TrainingStatKey;
  stationName: string;
  statLabel: string;
  primaryStat: TrainingStatKey;
  secondaryStat: TrainingStatKey;
  primaryLabel: string;
  secondaryLabel: string;
  basePrimaryGain: number;
  baseSecondaryGain: number;
  accentColor: string;
  description: string;
}

export const GYM_STATIONS: GymStationInfo[] = [
  {
    id: 'hp',
    stationName: 'Boulder / Rock',
    statLabel: 'HP',
    primaryStat: 'hp',
    secondaryStat: 'offense',
    primaryLabel: 'Max HP',
    secondaryLabel: 'Offense',
    basePrimaryGain: 32,
    baseSecondaryGain: 3,
    accentColor: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/50',
    description: 'Shatter heavy boulders to boost Max HP and add a small Offense gain.',
  },
  {
    id: 'mp',
    stationName: 'Waterfall',
    statLabel: 'MP',
    primaryStat: 'mp',
    secondaryStat: 'defense',
    primaryLabel: 'Max MP',
    secondaryLabel: 'Defense',
    basePrimaryGain: 18,
    baseSecondaryGain: 3,
    accentColor: 'text-cyan-300 border-cyan-500/50 bg-cyan-950/50',
    description: 'Meditate beneath rushing falls to raise Max MP and add a small Defense gain.',
  },
  {
    id: 'offense',
    stationName: 'Tree',
    statLabel: 'Offense',
    primaryStat: 'offense',
    secondaryStat: 'speed',
    primaryLabel: 'Offense',
    secondaryLabel: 'Speed',
    basePrimaryGain: 7,
    baseSecondaryGain: 3,
    accentColor: 'text-rose-300 border-rose-500/50 bg-rose-950/50',
    description: 'Strike ancient timber trunks to boost Offense and add a small Speed gain.',
  },
  {
    id: 'defense',
    stationName: 'Punching Glove',
    statLabel: 'Defense',
    primaryStat: 'defense',
    secondaryStat: 'brains',
    primaryLabel: 'Defense',
    secondaryLabel: 'Brains',
    basePrimaryGain: 7,
    baseSecondaryGain: 3,
    accentColor: 'text-sky-300 border-sky-500/50 bg-sky-950/50',
    description: 'Withstand heavy spring-loaded gloves to build Defense and Brains.',
  },
  {
    id: 'speed',
    stationName: 'Track',
    statLabel: 'Speed',
    primaryStat: 'speed',
    secondaryStat: 'hp',
    primaryLabel: 'Speed',
    secondaryLabel: 'Max HP',
    basePrimaryGain: 7,
    baseSecondaryGain: 14,
    accentColor: 'text-amber-300 border-amber-500/50 bg-amber-950/50',
    description: 'Sprint the Digital Track to sharpen Speed and add a small Max HP gain.',
  },
  {
    id: 'brains',
    stationName: 'Blackboard',
    statLabel: 'Brains',
    primaryStat: 'brains',
    secondaryStat: 'mp',
    primaryLabel: 'Brains',
    secondaryLabel: 'Max MP',
    basePrimaryGain: 8,
    baseSecondaryGain: 8,
    accentColor: 'text-violet-300 border-violet-500/50 bg-violet-950/50',
    description: 'Study tactical combat formulas to raise Brains, MP, and learn new techniques.',
  },
];

export interface LearnableBattleMove extends BattleMove {
  brainsThreshold: number;
}

export const BATTLE_TECHNIQUE_CATALOG: LearnableBattleMove[] = [
  // Neutral / Starter
  {
    id: 'sonic-jab',
    name: 'Sonic Jab',
    element: 'hand',
    power: 28,
    mpCost: 8,
    brainsThreshold: 8,
    soundType: 'punch',
    description: 'Fast close-range barrage that counters mechanical fighters.',
  },
  {
    id: 'spit-fire',
    name: 'Spit Fire',
    element: 'fire',
    power: 32,
    mpCost: 10,
    brainsThreshold: 12,
    soundType: 'blast',
    description: 'Launch an ember volley strong against Nature and Filth.',
  },
  {
    id: 'razor-leaf',
    name: 'Thorn Volley',
    element: 'nature',
    power: 32,
    mpCost: 10,
    brainsThreshold: 14,
    soundType: 'laser',
    description: 'Razor-sharp botanical darts that pierce Air-element foes.',
  },
  {
    id: 'static-shock',
    name: 'Static Elect',
    element: 'air',
    power: 33,
    mpCost: 10,
    brainsThreshold: 16,
    soundType: 'laser',
    description: 'Crackling wind-lightning discharge strong against Ice.',
  },
  {
    id: 'hail-spear',
    name: 'Hail Spear',
    element: 'ice',
    power: 33,
    mpCost: 10,
    brainsThreshold: 18,
    soundType: 'blast',
    description: 'Sub-zero ice shards that quench Fire-element rivals.',
  },
  {
    id: 'gear-cutter',
    name: 'Mechanical Claw',
    element: 'weapon',
    power: 36,
    mpCost: 12,
    brainsThreshold: 22,
    soundType: 'punch',
    description: 'Precision alloy slash that counters Hand-to-Hand brawlers.',
  },
  {
    id: 'saint-ray',
    name: 'Saint Ray',
    element: 'holy',
    power: 38,
    mpCost: 14,
    brainsThreshold: 26,
    soundType: 'laser',
    description: 'Purifying beam of light effective against Dark opponents.',
  },
  {
    id: 'blackout-pulse',
    name: 'Shadow Mist',
    element: 'dark',
    power: 38,
    mpCost: 14,
    brainsThreshold: 28,
    soundType: 'howl',
    description: 'Creeping darkness surge that hits Holy foes hard.',
  },
  {
    id: 'poop-toss',
    name: 'Poop Toss',
    element: 'filth',
    power: 34,
    mpCost: 9,
    brainsThreshold: 24,
    soundType: 'blast',
    description: 'Unpredictable filth volley dealing bonus damage to Holy, Dark, and Weapon.',
  },
  {
    id: 'flame-inferno',
    name: 'Flame Storm',
    element: 'fire',
    power: 46,
    mpCost: 18,
    brainsThreshold: 34,
    soundType: 'blast',
    description: 'Roaring vortex of crimson fire sweeping Nature defenders.',
  },
  {
    id: 'emerald-pulse',
    name: 'Root Bind',
    element: 'nature',
    power: 46,
    mpCost: 18,
    brainsThreshold: 38,
    soundType: 'blast',
    description: 'Coiling forest surge that grounds agile Air fighters.',
  },
  {
    id: 'megalo-spark',
    name: 'Megalo Spark',
    element: 'air',
    power: 48,
    mpCost: 18,
    brainsThreshold: 42,
    soundType: 'laser',
    description: 'High-voltage thunderbolt shattering Ice armor.',
  },
  {
    id: 'winter-blast',
    name: 'Winter Blast',
    element: 'ice',
    power: 48,
    mpCost: 18,
    brainsThreshold: 46,
    soundType: 'blast',
    description: 'Freezing blizzard wave extinguishing Fire-type attackers.',
  },
  {
    id: 'tremar-punch',
    name: 'Tremar Smash',
    element: 'hand',
    power: 52,
    mpCost: 20,
    brainsThreshold: 52,
    soundType: 'punch',
    description: 'Seismic knuckle shockwave built for breaking Weapon armor.',
  },
  {
    id: 'buster-laser',
    name: 'Full Metal Laser',
    element: 'weapon',
    power: 54,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'laser',
    description: 'Heavy cybernetic artillery barrage countering Hand-to-Hand.',
  },
  {
    id: 'shining-nova',
    name: 'Shining Nova',
    element: 'holy',
    power: 58,
    mpCost: 24,
    brainsThreshold: 64,
    soundType: 'blast',
    description: 'Radiant celestial detonation dealing 1.5x to Dark threats.',
  },
  {
    id: 'evil-squall',
    name: 'Chaos Cloud',
    element: 'dark',
    power: 58,
    mpCost: 24,
    brainsThreshold: 70,
    soundType: 'howl',
    description: 'Abyssal energy storm piercing Holy wards.',
  },
  {
    id: 'buster-dive',
    name: 'Buster Tackle',
    element: 'neutral',
    power: 55,
    mpCost: 20,
    brainsThreshold: 76,
    soundType: 'punch',
    description: 'Full-body momentum charge with reliable neutral impact.',
  },
  {
    id: 'prominence-beam',
    name: 'Prominence Beam',
    element: 'fire',
    power: 68,
    mpCost: 28,
    brainsThreshold: 86,
    soundType: 'laser',
    description: 'Master-tier solar lance incinerating Nature opponents.',
  },
  {
    id: 'aurora-freeze',
    name: 'Aurora Freeze',
    element: 'ice',
    power: 68,
    mpCost: 28,
    brainsThreshold: 96,
    soundType: 'laser',
    description: 'Crystalline zero-point ray crushing Fire opponents.',
  },
];

const FILTH_SPECIES_KEYWORDS = [
  'numemon',
  'sukamon',
  'scumon',
  'nanimon',
  'geremon',
  'platinumsukamon',
  'goldnumemon',
  'karatsukinumemon',
  'blackkingnumemon',
  'roachmon',
  'vademon',
  'garbamon',
  'etemon',
  'raremon',
];

export function isFilthSpecies(species?: DigimonSpecies): boolean {
  if (!species) return false;
  const idLower = species.id.toLowerCase();
  const typeLower = species.type.toLowerCase();
  if (typeLower.includes('filth') || typeLower.includes('mollusk') || typeLower.includes('mutant')) {
    if (FILTH_SPECIES_KEYWORDS.some((kw) => idLower.includes(kw))) return true;
  }
  return FILTH_SPECIES_KEYWORDS.some((kw) => idLower.includes(kw));
}

export function mapMoveTypeToElement(
  move: Pick<AttackMove, 'type' | 'element'>,
  species?: DigimonSpecies
): AttackElement {
  if (move.element) return move.element;
  if (isFilthSpecies(species)) return 'filth';

  switch (move.type) {
    case 'fire':
      return 'fire';
    case 'nature':
      return 'nature';
    case 'electric':
      return 'air';
    case 'water':
    case 'ice':
      return 'ice';
    case 'holy':
      return 'holy';
    case 'dark':
      return 'dark';
    case 'physical': {
      const hint = `${species?.type || ''} ${species?.name || ''}`.toLowerCase();
      if (
        hint.includes('cyborg') ||
        hint.includes('machine') ||
        hint.includes('android') ||
        hint.includes('weapon') ||
        hint.includes('knight') ||
        hint.includes('metal') ||
        hint.includes('armor') ||
        hint.includes('mineral')
      ) {
        return 'weapon';
      }
      if (hint.includes('bird') || hint.includes('wind') || hint.includes('sky')) {
        return 'air';
      }
      return 'hand';
    }
    default:
      return 'neutral';
  }
}

export function getSpeciesElementType(species?: DigimonSpecies): AttackElement {
  if (!species) return 'neutral';
  if (isFilthSpecies(species)) return 'filth';
  return mapMoveTypeToElement(species.signatureMove, species);
}

/**
 * Digimon World: Next Order Elemental Matchups (1.5x damage):
 * - Fire > Nature > Air > Ice > Fire
 * - Holy <-> Dark (mutual 1.5x)
 * - Hand-to-Hand <-> Weapon (mutual 1.5x)
 * - Filth takes 1.5x from Fire, Nature, Air, Ice, Hand; deals 1.5x to Holy, Dark, Weapon
 * - Neutral has no strengths or weaknesses (1.0x)
 */
export function getElementDamageMultiplier(
  attackElement: AttackElement,
  defenderElement: AttackElement
): number {
  if (attackElement === 'neutral' || defenderElement === 'neutral') {
    return 1.0;
  }
  if (attackElement === 'fire' && defenderElement === 'nature') return 1.5;
  if (attackElement === 'nature' && defenderElement === 'air') return 1.5;
  if (attackElement === 'air' && defenderElement === 'ice') return 1.5;
  if (attackElement === 'ice' && defenderElement === 'fire') return 1.5;

  if (
    (attackElement === 'holy' && defenderElement === 'dark') ||
    (attackElement === 'dark' && defenderElement === 'holy')
  ) {
    return 1.5;
  }

  if (
    (attackElement === 'hand' && defenderElement === 'weapon') ||
    (attackElement === 'weapon' && defenderElement === 'hand')
  ) {
    return 1.5;
  }

  if (
    defenderElement === 'filth' &&
    (attackElement === 'fire' ||
      attackElement === 'nature' ||
      attackElement === 'air' ||
      attackElement === 'ice' ||
      attackElement === 'hand')
  ) {
    return 1.5;
  }

  if (
    attackElement === 'filth' &&
    (defenderElement === 'holy' ||
      defenderElement === 'dark' ||
      defenderElement === 'weapon')
  ) {
    return 1.5;
  }

  return 1.0;
}

export type TrainingPreferenceGroup = 'hp-def' | 'mp-brains' | 'off-spd' | 'filth';

export function getTrainingPreference(species?: DigimonSpecies): TrainingPreferenceGroup {
  if (!species) return 'off-spd';
  if (isFilthSpecies(species)) return 'filth';

  const el = getSpeciesElementType(species);
  if (el === 'holy' || el === 'dark' || el === 'air') {
    return 'mp-brains';
  }
  if (el === 'weapon' || el === 'ice' || species.baseDef >= species.baseAtk) {
    return 'hp-def';
  }
  return 'off-spd';
}

export function getStationPreferenceMultiplier(
  stationId: TrainingStatKey,
  species?: DigimonSpecies
): { multiplier: number; label: string } {
  const pref = getTrainingPreference(species);
  if (pref === 'filth') {
    return { multiplier: 0.8, label: '-20% Filth' };
  }
  if (pref === 'hp-def' && (stationId === 'hp' || stationId === 'defense')) {
    return { multiplier: 1.1, label: '+10% Favored' };
  }
  if (pref === 'mp-brains' && (stationId === 'mp' || stationId === 'brains')) {
    return { multiplier: 1.1, label: '+10% Favored' };
  }
  if (pref === 'off-spd' && (stationId === 'offense' || stationId === 'speed')) {
    return { multiplier: 1.1, label: '+10% Favored' };
  }
  return { multiplier: 1.0, label: 'Standard' };
}

const STAGE_TRAINING_MULT: Record<DigimonStage, number> = {
  egg: 0.6,
  fresh: 0.7,
  'in-training': 0.9,
  rookie: 1.0,
  champion: 1.25,
  ultimate: 1.5,
  mega: 1.8,
};

const STAGE_BASE_MP: Record<DigimonStage, number> = {
  egg: 30,
  fresh: 40,
  'in-training': 55,
  rookie: 75,
  champion: 105,
  ultimate: 140,
  mega: 180,
};

const STAGE_BASE_BRAINS: Record<DigimonStage, number> = {
  egg: 8,
  fresh: 10,
  'in-training': 16,
  rookie: 26,
  champion: 42,
  ultimate: 64,
  mega: 88,
};

export function getBaseBattleStatsForSpecies(species?: DigimonSpecies): BattleStats {
  const stage: DigimonStage = species?.stage || 'fresh';
  return {
    maxHp: species?.baseHp || 90,
    maxMp: STAGE_BASE_MP[stage] ?? 70,
    offense: species?.baseAtk || 22,
    defense: species?.baseDef || 18,
    speed: species?.baseSpd || 20,
    brains: STAGE_BASE_BRAINS[stage] ?? 20,
  };
}

export function getEffectiveBattleStats(pet: PetState, species?: DigimonSpecies): BattleStats {
  const base = getBaseBattleStatsForSpecies(species);
  if (!pet.battleStats) {
    // Hydrate gracefully from legacy save strength/training
    const legacyAtk = Math.floor(pet.strength * 0.5) + pet.trainingCount * 2;
    const legacyHp = Math.floor(pet.strength * 1.4) + pet.dpPoints * 2;
    const legacyMp = Math.floor(pet.trainingCount * 2);
    const legacyBrains = Math.min(120, base.brains + Math.floor(pet.trainingCount * 2));
    return {
      maxHp: base.maxHp + legacyHp,
      maxMp: base.maxMp + legacyMp,
      offense: base.offense + legacyAtk,
      defense: base.defense + Math.floor(pet.weight * 0.25) + pet.trainingCount,
      speed: base.speed + pet.trainingCount,
      brains: legacyBrains,
    };
  }
  return {
    maxHp: Math.max(base.maxHp, pet.battleStats.maxHp),
    maxMp: Math.max(base.maxMp, pet.battleStats.maxMp),
    offense: Math.max(base.offense, pet.battleStats.offense),
    defense: Math.max(base.defense, pet.battleStats.defense),
    speed: Math.max(base.speed, pet.battleStats.speed),
    brains: Math.max(base.brains, pet.battleStats.brains),
  };
}

export function getStarterTechniqueIdsForSpecies(
  species?: DigimonSpecies,
  brainsVal: number = 20
): string[] {
  const el = getSpeciesElementType(species);
  const matching = BATTLE_TECHNIQUE_CATALOG.filter(
    (m) => m.element === el && m.brainsThreshold <= brainsVal + 14
  ).map((m) => m.id);
  const thresholdMatches = BATTLE_TECHNIQUE_CATALOG.filter(
    (m) => m.brainsThreshold <= brainsVal
  ).map((m) => m.id);
  return Array.from(new Set(['sonic-jab', ...matching, ...thresholdMatches]));
}

export function getLearnedTechniqueIds(pet: PetState, species?: DigimonSpecies): string[] {
  const stats = getEffectiveBattleStats(pet, species);
  const baseStarter = getStarterTechniqueIdsForSpecies(species, stats.brains);
  const stored = Array.isArray(pet.learnedAttackIds) ? pet.learnedAttackIds : [];
  return Array.from(new Set([...baseStarter, ...stored])).filter((id) =>
    BATTLE_TECHNIQUE_CATALOG.some((m) => m.id === id)
  );
}

export function getEquippedBattleMoves(pet: PetState, species?: DigimonSpecies): BattleMove[] {
  const learned = getLearnedTechniqueIds(pet, species);
  const storedEq = Array.isArray(pet.equippedAttackIds)
    ? pet.equippedAttackIds.filter((id) => learned.includes(id))
    : [];

  let finalIds = storedEq.slice(0, MAX_EQUIPPED_ATTACKS);
  if (pet.equippedAttackIds === undefined && learned.length > 0) {
    const el = getSpeciesElementType(species);
    const preferred = learned.filter((id) => {
      const m = BATTLE_TECHNIQUE_CATALOG.find((t) => t.id === id);
      return m?.element === el;
    });
    finalIds = Array.from(new Set([...preferred, ...learned])).slice(0, MAX_EQUIPPED_ATTACKS);
  }

  return finalIds
    .map((id) => BATTLE_TECHNIQUE_CATALOG.find((m) => m.id === id))
    .filter((m): m is LearnableBattleMove => Boolean(m));
}

export interface TrainingGainOutcome {
  nextStats: BattleStats;
  deltas: BattleStats;
  newlyLearnedMoves: LearnableBattleMove[];
  prefLabel: string;
}

export function calculateTrainingOutcome(
  statKey: TrainingStatKey,
  pet: PetState,
  species: DigimonSpecies | undefined,
  hits: number
): TrainingGainOutcome {
  const station = GYM_STATIONS.find((s) => s.id === statKey) || GYM_STATIONS[2];
  const current = getEffectiveBattleStats(pet, species);
  const stageMult = STAGE_TRAINING_MULT[pet.stage] ?? 1.0;
  const { multiplier: prefMult, label: prefLabel } = getStationPreferenceMultiplier(statKey, species);
  const hitMult = hits >= 3 ? 1.25 : hits === 2 ? 1.0 : hits === 1 ? 0.78 : 0.55;

  const primaryDelta = Math.max(1, Math.round(station.basePrimaryGain * stageMult * prefMult * hitMult));
  const secondaryDelta = Math.max(1, Math.round(station.baseSecondaryGain * stageMult * prefMult * hitMult));

  const deltas: BattleStats = {
    maxHp: 0,
    maxMp: 0,
    offense: 0,
    defense: 0,
    speed: 0,
    brains: 0,
  };

  const applyToKey = (key: TrainingStatKey, val: number) => {
    if (key === 'hp') deltas.maxHp += val;
    else if (key === 'mp') deltas.maxMp += val;
    else if (key === 'offense') deltas.offense += val;
    else if (key === 'defense') deltas.defense += val;
    else if (key === 'speed') deltas.speed += val;
    else if (key === 'brains') deltas.brains += val;
  };

  applyToKey(station.primaryStat, primaryDelta);
  applyToKey(station.secondaryStat, secondaryDelta);

  const nextStats: BattleStats = {
    maxHp: current.maxHp + deltas.maxHp,
    maxMp: current.maxMp + deltas.maxMp,
    offense: current.offense + deltas.offense,
    defense: current.defense + deltas.defense,
    speed: current.speed + deltas.speed,
    brains: current.brains + deltas.brains,
  };

  const alreadyLearned = new Set(getLearnedTechniqueIds(pet, species));
  const newlyLearnedMoves: LearnableBattleMove[] = [];

  if (statKey === 'brains' || deltas.brains > 0) {
    // Check threshold unlocks from Brains
    for (const tech of BATTLE_TECHNIQUE_CATALOG) {
      if (!alreadyLearned.has(tech.id) && nextStats.brains >= tech.brainsThreshold) {
        newlyLearnedMoves.push(tech);
        alreadyLearned.add(tech.id);
      }
    }
    // Bonus chance when training directly at Blackboard to discover next unlearned move if close
    if (statKey === 'brains' && newlyLearnedMoves.length === 0 && hits >= 2) {
      const nextCandidate = BATTLE_TECHNIQUE_CATALOG.find((t) => !alreadyLearned.has(t.id));
      if (nextCandidate && nextStats.brains + 6 >= nextCandidate.brainsThreshold) {
        newlyLearnedMoves.push(nextCandidate);
      }
    }
  }

  return {
    nextStats,
    deltas,
    newlyLearnedMoves,
    prefLabel,
  };
}
