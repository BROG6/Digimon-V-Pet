export type CrestType = 
  | 'courage' 
  | 'friendship' 
  | 'love' 
  | 'knowledge' 
  | 'sincerity' 
  | 'reliability' 
  | 'hope' 
  | 'light';

export type DigimonStage = 
  | 'egg' 
  | 'fresh' 
  | 'in-training' 
  | 'rookie' 
  | 'champion' 
  | 'ultimate' 
  | 'mega';

export interface DigiEggInfo {
  id: string;
  crest: CrestType;
  crestName: string;
  crestColor: string;
  tamerName: string;
  partnerRookie: string;
  description: string;
  eggPrimaryColor: string;
  eggPatternColor: string;
  eggPattern: 'stripes' | 'spots' | 'flames' | 'circuit' | 'flower' | 'cross' | 'star' | 'sacred';
}

export interface AttackMove {
  name: string;
  type: 'physical' | 'fire' | 'ice' | 'nature' | 'holy' | 'electric' | 'water' | 'dark';
  power: number;
  description: string;
  soundType: 'blast' | 'punch' | 'laser' | 'howl';
}

export interface DigimonSpecies {
  id: string;
  name: string;
  japaneseName: string;
  stage: DigimonStage;
  crest: CrestType;
  attribute: 'Vaccine' | 'Data' | 'Virus' | 'Free';
  type: string;
  colorTheme: string;
  description: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  signatureMove: AttackMove;
  nextEvolutions?: {
    speciesId: string;
    requiredStage: DigimonStage;
    minBattles?: number;
    minTraining?: number;
    maxMistakes?: number;
  }[];
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
}

export interface PetState {
  eggId: string;
  currentSpeciesId: string;
  stage: DigimonStage;
  nickname: string;
  birthTimestamp: number;
  hunger: number; // 0 (starving) to 100 (full)
  energy: number; // 0 (exhausted) to 100 (ready)
  happiness: number; // 0 to 100
  discipline: number; // 0 to 100
  weight: number; // grams
  strength: number; // training stat
  dpPoints: number; // digimon power points
  isSick: boolean;
  isSleeping: boolean;
  lightsOff: boolean;
  poopCount: number;
  careMistakes: number;
  battlesWon: number;
  battlesTotal: number;
  trainingCount: number;
  digiBits: number; // currency
  bigMeatStock: number;
  vitaminStock: number;
  activeRoomTheme: string;
  placedFurniture: PlacedFurniture[];
  lastCareCheck: number;
  stageEnteredAt?: number;
  evoGoalMetAt?: number;
}

export interface BattleFighter {
  id: string;
  name: string;
  speciesId: string;
  stage: DigimonStage;
  crest: CrestType;
  currentHp: number;
  maxHp: number;
  sp: number; // 0 to 100 for signature move
  atk: number;
  def: number;
  spd: number;
  signatureMove: AttackMove;
  isPlayer: boolean;
}

export interface BattleLogEntry {
  id: string;
  text: string;
  type: 'action' | 'damage' | 'special' | 'win' | 'flee';
}
