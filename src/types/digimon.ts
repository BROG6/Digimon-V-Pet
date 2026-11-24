export type CrestType =
  | 'courage'
  | 'friendship'
  | 'love'
  | 'knowledge'
  | 'sincerity'
  | 'reliability'
  | 'hope'
  | 'light'
  | 'miracles'
  | 'shadow'
  | 'wind'
  | 'earth'
  | 'hazard'
  | 'mech'
  | 'mystic';

export type DigimonStage =
  | 'egg'
  | 'fresh'
  | 'in-training'
  | 'rookie'
  | 'champion'
  | 'ultimate'
  | 'mega';

export type EvolutionArchetype = 'vaccine' | 'data' | 'virus' | 'corrupted' | 'armor';

export type WeightClass = 'Light' | 'Normal' | 'Heavy';

export type SpecialItemId =
  | 'courage_crest'
  | 'love_crest'
  | 'knowledge_crest'
  | 'hope_crest'
  | 'light_crest'
  | 'destiny_egg';

export interface SpecialItemInfo {
  id: SpecialItemId;
  name: string;
  shortName: string;
  icon: string;
  price: number;
  eggId: string;
  armorSpeciesId: string;
  description: string;
}

export interface DigiEggInfo {
  id: string;
  eggNumber: number;
  crest: CrestType;
  crestName: string;
  archetypeTitle: string;
  crestColor: string;
  tamerName: string;
  partnerRookie: string;
  baby1Id: string;
  baby2Id: string;
  rookiePreviewIds: {
    vaccine: string;
    data: string;
    virus: string;
    corrupted: string;
  };
  armorOption?: {
    speciesId: string;
    itemId: SpecialItemId;
    itemLabel: string;
  };
  description: string;
  eggPrimaryColor: string;
  eggPatternColor: string;
  eggPattern:
    | 'stripes'
    | 'spots'
    | 'flames'
    | 'circuit'
    | 'flower'
    | 'cross'
    | 'star'
    | 'sacred'
    | 'dragon'
    | 'ninja'
    | 'wind'
    | 'earth'
    | 'hazard'
    | 'mech'
    | 'moon';
}

export type AttackElement =
  | 'fire'
  | 'nature'
  | 'air'
  | 'ice'
  | 'holy'
  | 'dark'
  | 'hand'
  | 'weapon'
  | 'filth'
  | 'neutral';

export type TrainingStatKey = 'hp' | 'mp' | 'offense' | 'defense' | 'speed' | 'brains';

export interface BattleStats {
  maxHp: number;
  maxMp: number;
  offense: number;
  defense: number;
  speed: number;
  brains: number;
}

export interface BattleMove {
  id: string;
  name: string;
  element: AttackElement;
  power: number;
  mpCost: number;
  description: string;
  soundType: 'blast' | 'punch' | 'laser' | 'howl';
  minStage?: DigimonStage;
  learnHint?: string;
}

export interface AttackMove {
  name: string;
  type: 'physical' | 'fire' | 'ice' | 'nature' | 'holy' | 'electric' | 'water' | 'dark';
  element?: AttackElement;
  mpCost?: number;
  power: number;
  description: string;
  soundType: 'blast' | 'punch' | 'laser' | 'howl';
}

export interface EvolutionTarget {
  speciesId: string;
  requiredStage: DigimonStage;
  archetype?: EvolutionArchetype;
  requiredSpecialItem?: SpecialItemId;
  minBattles?: number;
  minTraining?: number;
  maxMistakes?: number;
  minEffort?: number;
  minWinRate?: number;
  weightClass?: WeightClass;
}

export interface DigimonSpecies {
  id: string;
  name: string;
  japaneseName: string;
  stage: DigimonStage;
  crest: CrestType;
  eggIds?: string[];
  archetype?: EvolutionArchetype;
  spriteId?: string;
  spriteFilter?: string;
  attribute: 'Vaccine' | 'Data' | 'Virus' | 'Free' | 'Unknown';
  type: string;
  colorTheme: string;
  description: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  signatureMove: AttackMove;
  nextEvolutions?: EvolutionTarget[];
}

export interface PlacedFurniture {
  instanceId: string;
  furnitureId: string;
  x: number; // percentage in room
  y: number; // percentage in room
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'floor' | 'toy' | 'decoration' | 'bed';
  price: number;
  icon: string;
  description: string;
  interactEffect?: string;
  minTamerRank?: number;
}

export interface RoomTheme {
  id: string;
  name: string;
  skyColor: string;
  floorColor: string;
  description: string;
  minTamerRank?: number;
  accentTag?: string;
}

export type ShopItemId =
  | 'meat'
  | 'meat_bundle'
  | 'sirloin'
  | 'forage_basket'
  | 'vitamin'
  | 'vitamin_bundle'
  | 'medicine'
  | 'training_chip'
  | 'miracle_elixir'
  | 'sovereign_core';

export interface PetState {
  eggId: string;
  currentSpeciesId: string;
  stage: DigimonStage;
  nickname: string;
  playerName?: string;
  birthTimestamp: number;
  hunger: number; // 0 (starving) to 100 (full)
  energy: number; // 0 (exhausted) to 100 (ready)
  happiness: number; // 0 to 100
  discipline: number; // 0 to 100
  weight: number; // grams
  strength: number; // training stat
  dpPoints: number; // digimon power points
  effort?: number; // 0 to 10 Effort / Training score in current stage
  isSick: boolean;
  isSleeping: boolean;
  lightsOff: boolean;
  poopCount: number;
  careMistakes: number;
  battlesWon: number;
  battlesTotal: number;
  lifetimeBattlesWon?: number;
  trainingCount: number;
  stageBattlesWon?: number;
  stageBattlesTotal?: number;
  stageTrainingCount?: number;
  equippedSpecialItem?: SpecialItemId | null;
  ownedSpecialItems?: SpecialItemId[];
  digiBits: number; // currency
  bigMeatStock: number;
  sirloinStock?: number;
  mushroomStock?: number;
  berryStock?: number;
  vitaminStock: number;
  activeRoomTheme: string;
  placedFurniture: PlacedFurniture[];
  lastCareCheck: number;
  stageEnteredAt?: number;
  evoGoalMetAt?: number;
  evolutionLocked?: boolean;
  isDead?: boolean;
  diedAt?: number;
  deathReason?: string;
  sickSince?: number;
  neglectTicks?: number;
  lastHungerDropAt?: number;
  lastPoopAt?: number;
  lastEnergyRegenAt?: number;
  careCallStartedAt?: number;
  sleepCallStartedAt?: number;
  isFrozen?: boolean;
  frozenAt?: number;
  adventureClearedWave?: Record<string, number>;
  battleExp?: number;
  unlockedSpeciesIds?: string[];
  battleStats?: BattleStats;
  learnedAttackIds?: string[];
  equippedAttackIds?: string[];
  battleHistory?: BattleHistoryEntry[];
  currentWinStreak?: number;
}

export interface AdventureWave {
  waveNumber: number;
  title: string;
  speciesId: string;
  stageLabel: 'Rookie' | 'Champion' | 'Ultimate' | 'Mega';
  statMultiplier: number;
  strengthReward: number;
  dpReward: number;
  effortReward: number;
  bitsReward: number;
  meatDrop: number;
  vitaminDrop: number;
  bossFlavor: string;
}

export interface AdventureZone {
  id: string;
  order: number;
  name: string;
  subtitle: string;
  environmentTag: string;
  recommendedStrength: number;
  backdropClass: string;
  groundClass: string;
  accentHex: string;
  firstClearRelicId?: SpecialItemId;
  firstClearBonusText: string;
  waves: AdventureWave[];
}

export interface AdventureBattleResult {
  zoneId: string;
  waveNumber: number;
  won: boolean;
  strengthGained: number;
  dpGained: number;
  effortGained: number;
  bitsGained: number;
  meatGained: number;
  sirloinGained?: number;
  mushroomGained?: number;
  berryGained?: number;
  vitaminsGained: number;
  walkFoodFound?: ('mushroom' | 'berry')[];
  unlockedRelicId?: SpecialItemId;
  meatUsed: number;
  vitaminsUsed: number;
  isFirstClearOfWave: boolean;
  opponentName?: string;
  opponentSpeciesId?: string;
}

export interface BattleFighter {
  id: string;
  name: string;
  speciesId: string;
  stage: DigimonStage;
  crest: CrestType;
  element?: AttackElement;
  currentHp: number;
  maxHp: number;
  mp?: number;
  maxMp?: number;
  sp: number; // 0 to 100 for signature move
  atk: number;
  def: number;
  spd: number;
  brains?: number;
  signatureMove: AttackMove;
  equippedMoves?: BattleMove[];
  isPlayer: boolean;
}

export interface BattleLogEntry {
  id: string;
  text: string;
  type: 'action' | 'damage' | 'special' | 'win' | 'flee';
}

export interface BattleHistoryEntry {
  id: string;
  opponentName: string;
  opponentSpeciesId?: string;
  outcome: 'win' | 'loss';
  mode?: 'colosseum' | 'adventure';
  timestamp: number;
}
