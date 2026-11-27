import {
  AttackElement,
  AttackMove,
  BattleMove,
  BattleStats,
  CrestType,
  DigimonSpecies,
  DigimonStage,
  PetState,
  TrainingStatKey,
} from '../types/digimon';
import {
  formatWeatherBonusTag,
  getRoomWeatherSpec,
  getWeatherTrainingMultiplier,
} from '../utils/roomWeather';

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
    beatsLabel: 'Nature, Filth (1.5x)',
    weaknessLabel: 'Ice, Fire (0.75x)',
  },
  nature: {
    id: 'nature',
    label: 'Nature',
    shortLabel: 'NATR',
    badgeClass: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/60',
    beatsLabel: 'Air, Filth (1.5x)',
    weaknessLabel: 'Fire, Nature (0.75x)',
  },
  air: {
    id: 'air',
    label: 'Air / Thunder',
    shortLabel: 'AIR',
    badgeClass: 'text-yellow-300 border-yellow-500/50 bg-yellow-950/60',
    beatsLabel: 'Ice, Filth (1.5x)',
    weaknessLabel: 'Nature, Air (0.75x)',
  },
  ice: {
    id: 'ice',
    label: 'Ice / Water',
    shortLabel: 'ICE',
    badgeClass: 'text-cyan-300 border-cyan-500/50 bg-cyan-950/60',
    beatsLabel: 'Fire, Filth (1.5x)',
    weaknessLabel: 'Air, Ice (0.75x)',
  },
  holy: {
    id: 'holy',
    label: 'Holy',
    shortLabel: 'HOLY',
    badgeClass: 'text-amber-200 border-amber-400/50 bg-amber-950/60',
    beatsLabel: 'Dark (1.5x)',
    weaknessLabel: 'Dark (1.5x both), Filth, Holy (0.75x)',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    shortLabel: 'DARK',
    badgeClass: 'text-purple-300 border-purple-500/50 bg-purple-950/60',
    beatsLabel: 'Holy (1.5x)',
    weaknessLabel: 'Holy (1.5x both), Filth, Dark (0.75x)',
  },
  hand: {
    id: 'hand',
    label: 'Hand-to-Hand',
    shortLabel: 'HAND',
    badgeClass: 'text-rose-300 border-rose-500/50 bg-rose-950/60',
    beatsLabel: 'Weapon, Filth (1.5x)',
    weaknessLabel: 'Weapon (1.5x both), Hand (0.75x)',
  },
  weapon: {
    id: 'weapon',
    label: 'Weapon / Mech',
    shortLabel: 'MECH',
    badgeClass: 'text-sky-300 border-sky-500/50 bg-sky-950/60',
    beatsLabel: 'Hand-to-Hand (1.5x)',
    weaknessLabel: 'Hand (1.5x both), Filth, Mech (0.75x)',
  },
  filth: {
    id: 'filth',
    label: 'Filth',
    shortLabel: 'FILTH',
    badgeClass: 'text-lime-300 border-lime-500/50 bg-lime-950/60',
    beatsLabel: 'Holy, Dark, Weapon (1.5x)',
    weaknessLabel: 'Fire, Nature, Air, Ice, Hand (0.75x)',
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
    description: 'Push heavy boulders to boost Max HP and add a small Offense gain.',
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
    description: 'Study tactical combat formulas to raise Brains, MP, and learn evolution-line techniques.',
  },
];

export interface LearnableBattleMove extends BattleMove {
  brainsThreshold: number;
}

export const BATTLE_TECHNIQUE_CATALOG: LearnableBattleMove[] = [
  // Starter (Slot 1 — 0 Brains required)
  {
    id: 'spit-fire',
    name: 'Spit Fire',
    element: 'fire',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'blast',
    description: 'Basic ember volley strong against Nature and Filth.',
  },
  {
    id: 'petit-frost',
    name: 'Blue Ember',
    element: 'fire',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'blast',
    description: 'Starter chill-flame breath favored by arctic hound Digimon.',
  },
  {
    id: 'spiral-twister',
    name: 'Gale Peck',
    element: 'air',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'laser',
    description: 'Swift wind-charged strike effective against Ice-type rivals.',
  },
  {
    id: 'bug-zapper',
    name: 'Electro Spark',
    element: 'air',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'laser',
    description: 'Crackling carapace discharge that disrupts Ice armor.',
  },
  {
    id: 'poison-ivy',
    name: 'Seed Shot',
    element: 'nature',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'blast',
    description: 'Rapid botanical pellet volley strong against Air foes.',
  },
  {
    id: 'bubble-stream',
    name: 'Bubble Stream',
    element: 'ice',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'blast',
    description: 'Pressurized water bubbles that quench Fire attackers.',
  },
  {
    id: 'air-shot',
    name: 'Air Shot',
    element: 'air',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'blast',
    description: 'Compressed wind burst fired from celestial wings.',
  },
  {
    id: 'kitty-slash',
    name: 'Cat Paw Rush',
    element: 'hand',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'punch',
    description: 'Lightning-quick claw flurry strong against Weapon armor.',
  },
  {
    id: 'sonic-jab',
    name: 'V-Knuckle',
    element: 'hand',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'punch',
    description: 'Close-range dragon punch that counters mechanical fighters.',
  },
  {
    id: 'silk-thread',
    name: 'Shadow Kunai',
    element: 'dark',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'laser',
    description: 'Stealthy shadow dart striking Holy foes at range.',
  },
  {
    id: 'stone-jab',
    name: 'Rock Knuckle',
    element: 'hand',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'punch',
    description: 'Heavy granite fist built for smashing cybernetic hulls.',
  },
  {
    id: 'blazing-fire',
    name: 'Rapid Shot',
    element: 'weapon',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'laser',
    description: 'Precision twin-blaster fire countering Hand-to-Hand brawlers.',
  },
  {
    id: 'diamond-storm',
    name: 'Fox Leaf',
    element: 'nature',
    power: 30,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'laser',
    description: 'Mystic sharpened leaves swirling toward Air opponents.',
  },
  {
    id: 'poop-toss',
    name: 'Poop Toss',
    element: 'filth',
    power: 32,
    mpCost: 8,
    brainsThreshold: 0,
    soundType: 'blast',
    description: 'Unpredictable filth volley dealing 1.5x damage to Holy, Dark & Weapon.',
  },

  // Tier 2 (24 Brains via Blackboard)
  {
    id: 'claw-combo',
    name: 'Dragon Claw',
    element: 'hand',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'punch',
    description: 'Fierce slashing combo taught through combat tactics.',
  },
  {
    id: 'ice-fang',
    name: 'Frost Fang',
    element: 'ice',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'punch',
    description: 'Subzero biting tackle that freezes Fire-element rivals.',
  },
  {
    id: 'static-shock',
    name: 'Feather Spark',
    element: 'air',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'laser',
    description: 'High-speed wind-lightning discharge strong against Ice.',
  },
  {
    id: 'gear-cutter',
    name: 'Mantis Claw',
    element: 'weapon',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'punch',
    description: 'Alloy blade strike countering Hand-to-Hand brawlers.',
  },
  {
    id: 'razor-leaf',
    name: 'Thorn Volley',
    element: 'nature',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'laser',
    description: 'Razor-sharp botanical darts piercing Air defenders.',
  },
  {
    id: 'hail-spear',
    name: 'Hail Spear',
    element: 'ice',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'blast',
    description: 'Crystalline ice lances quenching Fire-element foes.',
  },
  {
    id: 'saint-ray',
    name: 'Saint Ray',
    element: 'holy',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'laser',
    description: 'Purifying beam of light effective against Dark opponents.',
  },
  {
    id: 'vee-headbutt',
    name: 'Dragon Fang',
    element: 'hand',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'punch',
    description: 'Armored headlong charge smashing mechanical targets.',
  },
  {
    id: 'blackout-pulse',
    name: 'Shadow Mist',
    element: 'dark',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'howl',
    description: 'Creeping darkness surge hitting Holy foes hard.',
  },
  {
    id: 'angry-rock',
    name: 'Crag Volley',
    element: 'weapon',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'blast',
    description: 'Hardened mineral shells shattering Hand-to-Hand defenses.',
  },
  {
    id: 'fox-flame',
    name: 'Kitsune Fire',
    element: 'fire',
    power: 38,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'blast',
    description: 'Conjured spirit embers burning Nature opponents.',
  },
  {
    id: 'sludge-splash',
    name: 'Sludge Splash',
    element: 'filth',
    power: 40,
    mpCost: 12,
    brainsThreshold: 24,
    soundType: 'blast',
    description: 'Sticky sludge wave overwhelming Holy, Dark, and Weapon.',
  },

  // Tier 3 (40 Brains via Blackboard)
  {
    id: 'flame-inferno',
    name: 'Flame Storm',
    element: 'fire',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'blast',
    description: 'Roaring vortex of crimson fire sweeping Nature defenders.',
  },
  {
    id: 'winter-blast',
    name: 'Winter Blast',
    element: 'ice',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'blast',
    description: 'Freezing blizzard wave extinguishing Fire-type attackers.',
  },
  {
    id: 'crimson-wing',
    name: 'Crimson Flare',
    element: 'fire',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'blast',
    description: 'Blazing updraft dive scorching forest enemies.',
  },
  {
    id: 'horn-impulse',
    name: 'Horn Impulse',
    element: 'air',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'laser',
    description: 'Charged beetle-horn shockwave piercing Ice armor.',
  },
  {
    id: 'emerald-pulse',
    name: 'Root Bind',
    element: 'nature',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'blast',
    description: 'Coiling forest surge grounding agile Air fighters.',
  },
  {
    id: 'tidal-wave',
    name: 'Ocean Surge',
    element: 'ice',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'blast',
    description: 'Crushing abyssal torrent overwhelming Fire rivals.',
  },
  {
    id: 'heaven-knuckle',
    name: 'Hand of Fate',
    element: 'holy',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'punch',
    description: 'Golden angelic strike punishing Dark Digimon.',
  },
  {
    id: 'holy-ring',
    name: 'Sacred Ring',
    element: 'holy',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'laser',
    description: 'Radiant halo pulse cutting through shadow barriers.',
  },
  {
    id: 'plasma-shoot',
    name: 'Shining V-Force',
    element: 'holy',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'laser',
    description: 'Sacred V-crest energy burst banishing Dark foes.',
  },
  {
    id: 'ninja-slash',
    name: 'Crimson Shuriken',
    element: 'weapon',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'laser',
    description: 'High-speed alloy blades counterswiping Hand fighters.',
  },
  {
    id: 'feather-slash',
    name: 'Sonic Wing',
    element: 'air',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'laser',
    description: 'Razor wind blades slicing straight through Ice armor.',
  },
  {
    id: 'quake-stomp',
    name: 'Tectonic Crash',
    element: 'hand',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'punch',
    description: 'Ground-splitting impact wrecking steel armor.',
  },
  {
    id: 'chrono-breaker',
    name: 'Chrono Gear',
    element: 'weapon',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'laser',
    description: 'Synchronized cybernetic salvo built for heavy combat.',
  },
  {
    id: 'talisman-star',
    name: 'Talisman Star',
    element: 'holy',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'laser',
    description: 'Sacred ofuda barrage purifying Dark threats.',
  },
  {
    id: 'stink-cloud',
    name: 'Noxious Haze',
    element: 'filth',
    power: 48,
    mpCost: 16,
    brainsThreshold: 40,
    soundType: 'howl',
    description: 'Toxic cloud catching Holy, Dark, and Weapon off-guard.',
  },

  // Tier 4 (58 Brains via Blackboard)
  {
    id: 'flare-rush',
    name: 'Mega Burst',
    element: 'fire',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'blast',
    description: 'Condensed plasma fireball scorching Nature defenses.',
  },
  {
    id: 'howling-blaster',
    name: 'Garuru Blaster',
    element: 'ice',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'blast',
    description: 'Cryo cannon volley shutting down Fire opponents.',
  },
  {
    id: 'megalo-spark',
    name: 'Tempest Bolt',
    element: 'air',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'laser',
    description: 'High-voltage thunderbolt shattering Ice armor.',
  },
  {
    id: 'buster-laser',
    name: 'Giga Cannon',
    element: 'weapon',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'laser',
    description: 'Heavy cybernetic artillery barrage countering Hand-to-Hand.',
  },
  {
    id: 'petal-vortex',
    name: 'Flower Tempest',
    element: 'nature',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'blast',
    description: 'Cyclone of razor petals sweeping Air contenders.',
  },
  {
    id: 'vulcan-hammer',
    name: 'Thor Hammer',
    element: 'weapon',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'punch',
    description: 'Thunder-forged alloy hammer breaking Hand-to-Hand guards.',
  },
  {
    id: 'shining-nova',
    name: 'Shining Nova',
    element: 'holy',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'blast',
    description: 'Radiant celestial detonation dealing 1.5x to Dark threats.',
  },
  {
    id: 'tremar-punch',
    name: 'Tremar Smash',
    element: 'hand',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'punch',
    description: 'Seismic knuckle shockwave built for breaking Weapon armor.',
  },
  {
    id: 'evil-squall',
    name: 'Chaos Cloud',
    element: 'dark',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'howl',
    description: 'Abyssal energy storm piercing Holy wards.',
  },
  {
    id: 'atomic-blaster',
    name: 'Atomic Blaster',
    element: 'fire',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'blast',
    description: 'crimson Digital Hazard beam vaporizing Nature rivals.',
  },
  {
    id: 'amethyst-wind',
    name: 'Amethyst Mandala',
    element: 'holy',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'laser',
    description: 'Spiritual barrier burst shattering Dark illusions.',
  },
  {
    id: 'love-serenade',
    name: 'Dark Serenade',
    element: 'dark',
    power: 58,
    mpCost: 22,
    brainsThreshold: 58,
    soundType: 'howl',
    description: 'Chaotic sonic blast rattling Holy opponents.',
  },

  // Tier 5 (80 Brains via Blackboard)
  {
    id: 'prominence-beam',
    name: 'Prominence Beam',
    element: 'fire',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'laser',
    description: 'Master-tier solar lance incinerating Nature opponents.',
  },
  {
    id: 'aurora-freeze',
    name: 'Aurora Freeze',
    element: 'ice',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'laser',
    description: 'Crystalline zero-point ray crushing Fire opponents.',
  },
  {
    id: 'solar-wing',
    name: 'Starlight Wing',
    element: 'holy',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'blast',
    description: 'Blinding feather supernova purging Dark foes.',
  },
  {
    id: 'megalo-horn',
    name: 'Super Shocker',
    element: 'air',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'laser',
    description: 'Ultimate gigawatt horn surge obliterating Ice defenses.',
  },
  {
    id: 'gaia-thorn',
    name: 'Forbidden Thorn',
    element: 'nature',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'blast',
    description: 'Ancient jungle tempest tearing through Air guardians.',
  },
  {
    id: 'testament-light',
    name: 'Seven Heavens',
    element: 'holy',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'blast',
    description: 'Seven radiant orbs annihilating Dark lords.',
  },
  {
    id: 'celestial-flame',
    name: 'Eden Javelin',
    element: 'holy',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'laser',
    description: 'Judgment lance of pure light piercing Dark forces.',
  },
  {
    id: 'miracle-nova',
    name: 'Extreme Jihad',
    element: 'holy',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'blast',
    description: 'Golden Miracle energy detonation reshaping the battlefield.',
  },
  {
    id: 'oblivion-blade',
    name: 'Phantom Blade',
    element: 'dark',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'laser',
    description: 'Moonlit shinobi crescent slicing through Holy light.',
  },
  {
    id: 'valkyrie-gale',
    name: 'Fenrir Sword',
    element: 'air',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'laser',
    description: 'Freezing gale slash cutting down Ice champions.',
  },
  {
    id: 'dino-cannon',
    name: 'Terra Cannon',
    element: 'weapon',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'blast',
    description: 'Heavy armored artillery battery shattering Hand-to-Hand.',
  },
  {
    id: 'hazard-lance',
    name: 'Royal Lance',
    element: 'holy',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'laser',
    description: 'Final lance discharge unleashing overwhelming Knight force.',
  },
  {
    id: 'infinity-cannon',
    name: 'Infinity Cannon',
    element: 'weapon',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'blast',
    description: 'Twin Dreadnought railguns firing maximum machine power.',
  },
  {
    id: 'moonlight-rite',
    name: 'Spirit Dance',
    element: 'dark',
    power: 70,
    mpCost: 28,
    brainsThreshold: 80,
    soundType: 'howl',
    description: 'Forbidden spirit rite striking Holy rivals.',
  },
  {
    id: 'mega-poop-drop',
    name: 'Golden Flush',
    element: 'filth',
    power: 68,
    mpCost: 26,
    brainsThreshold: 80,
    soundType: 'blast',
    description: 'Supreme filth storm overwhelming Holy, Dark, and Weapon.',
  },
];

export const EVOLUTION_LINE_MOVE_IDS: Record<CrestType | 'filth', [string, string, string, string, string]> = {
  courage: ['spit-fire', 'claw-combo', 'flame-inferno', 'flare-rush', 'prominence-beam'],
  friendship: ['petit-frost', 'ice-fang', 'winter-blast', 'howling-blaster', 'aurora-freeze'],
  love: ['spiral-twister', 'static-shock', 'crimson-wing', 'megalo-spark', 'solar-wing'],
  knowledge: ['bug-zapper', 'gear-cutter', 'horn-impulse', 'buster-laser', 'megalo-horn'],
  sincerity: ['poison-ivy', 'razor-leaf', 'emerald-pulse', 'petal-vortex', 'gaia-thorn'],
  reliability: ['bubble-stream', 'hail-spear', 'tidal-wave', 'vulcan-hammer', 'aurora-freeze'],
  hope: ['air-shot', 'saint-ray', 'heaven-knuckle', 'shining-nova', 'testament-light'],
  light: ['kitty-slash', 'saint-ray', 'holy-ring', 'shining-nova', 'celestial-flame'],
  miracles: ['sonic-jab', 'vee-headbutt', 'plasma-shoot', 'tremar-punch', 'miracle-nova'],
  shadow: ['silk-thread', 'blackout-pulse', 'ninja-slash', 'evil-squall', 'oblivion-blade'],
  wind: ['spiral-twister', 'static-shock', 'feather-slash', 'megalo-spark', 'valkyrie-gale'],
  earth: ['stone-jab', 'angry-rock', 'quake-stomp', 'tremar-punch', 'dino-cannon'],
  hazard: ['spit-fire', 'blackout-pulse', 'flame-inferno', 'atomic-blaster', 'hazard-lance'],
  mech: ['blazing-fire', 'gear-cutter', 'chrono-breaker', 'buster-laser', 'infinity-cannon'],
  mystic: ['diamond-storm', 'fox-flame', 'talisman-star', 'amethyst-wind', 'moonlight-rite'],
  filth: ['poop-toss', 'sludge-splash', 'stink-cloud', 'love-serenade', 'mega-poop-drop'],
};

const MOVE_BY_ID: Record<string, LearnableBattleMove> = Object.fromEntries(
  BATTLE_TECHNIQUE_CATALOG.map((m) => [m.id, m])
);

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

export function resolveEvolutionLineKey(
  pet?: Pick<PetState, 'eggId' | 'currentSpeciesId'>,
  species?: DigimonSpecies
): CrestType | 'filth' {
  if (isFilthSpecies(species)) return 'filth';
  if (pet?.eggId && pet.eggId.startsWith('egg-')) {
    const rawCrest = pet.eggId.slice(4) as CrestType;
    if (rawCrest in EVOLUTION_LINE_MOVE_IDS) {
      return rawCrest;
    }
  }
  if (species?.crest && species.crest in EVOLUTION_LINE_MOVE_IDS) {
    return species.crest;
  }
  return 'courage';
}

export function getTechniquePoolForLine(
  pet?: Pick<PetState, 'eggId' | 'currentSpeciesId'>,
  species?: DigimonSpecies
): LearnableBattleMove[] {
  const lineKey = resolveEvolutionLineKey(pet, species);
  const ids = EVOLUTION_LINE_MOVE_IDS[lineKey] || EVOLUTION_LINE_MOVE_IDS.courage;
  return ids.map((id) => MOVE_BY_ID[id]).filter((m): m is LearnableBattleMove => Boolean(m));
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
 * Digimon World: Next Order Elemental Matchups:
 * Advantages (1.5x damage):
 * - Fire > Nature > Air > Ice > Fire
 * - Holy <-> Dark (mutual 1.5x)
 * - Hand-to-Hand <-> Weapon (mutual 1.5x)
 * - Filth takes 1.5x from Fire, Nature, Air, Ice, Hand; deals 1.5x to Holy, Dark, Weapon
 *
 * Disadvantages / Resisted (0.75x damage):
 * - Reverse 4-element cycle: Fire -> Ice, Ice -> Air, Air -> Nature, Nature -> Fire
 * - Reverse Filth asymmetries: Filth -> {Fire, Nature, Air, Ice, Hand}; {Holy, Dark, Weapon} -> Filth
 * - Same-element resistance (non-neutral): Fire -> Fire, Ice -> Ice, etc.
 * - Neutral has no strengths or weaknesses (1.0x)
 */
export function getElementDamageMultiplier(
  attackElement: AttackElement,
  defenderElement: AttackElement
): number {
  if (attackElement === 'neutral' || defenderElement === 'neutral') {
    return 1.0;
  }

  // 1.5x Advantages
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

  // 0.75x Disadvantages / Resistances
  if (attackElement === 'fire' && defenderElement === 'ice') return 0.75;
  if (attackElement === 'ice' && defenderElement === 'air') return 0.75;
  if (attackElement === 'air' && defenderElement === 'nature') return 0.75;
  if (attackElement === 'nature' && defenderElement === 'fire') return 0.75;

  if (
    attackElement === 'filth' &&
    (defenderElement === 'fire' ||
      defenderElement === 'nature' ||
      defenderElement === 'air' ||
      defenderElement === 'ice' ||
      defenderElement === 'hand')
  ) {
    return 0.75;
  }

  if (
    defenderElement === 'filth' &&
    (attackElement === 'holy' ||
      attackElement === 'dark' ||
      attackElement === 'weapon')
  ) {
    return 0.75;
  }

  if (attackElement === defenderElement) {
    return 0.75;
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

/**
 * Every Digimon starts strictly with ONLY 1 attack specific to its evolution line.
 * Additional attacks are learned exclusively by training Brains at the Blackboard.
 */
export function getStarterTechniqueIdsForSpecies(
  species?: DigimonSpecies,
  eggIdOrUnused?: string | number
): string[] {
  const petHint =
    typeof eggIdOrUnused === 'string' && eggIdOrUnused.startsWith('egg-')
      ? { eggId: eggIdOrUnused, currentSpeciesId: species?.id || '' }
      : undefined;
  const pool = getTechniquePoolForLine(petHint, species);
  return pool.length > 0 ? [pool[0].id] : ['spit-fire'];
}

export function getLearnedTechniqueIds(pet: PetState, species?: DigimonSpecies): string[] {
  const pool = getTechniquePoolForLine(pet, species);
  const poolIds = new Set(pool.map((m) => m.id));
  const starterId = pool[0]?.id || 'spit-fire';
  const stored = Array.isArray(pet.learnedAttackIds)
    ? pet.learnedAttackIds.filter((id) => poolIds.has(id))
    : [];
  return Array.from(new Set([starterId, ...stored]));
}

export function getEquippedBattleMoves(pet: PetState, species?: DigimonSpecies): BattleMove[] {
  const learned = getLearnedTechniqueIds(pet, species);
  const storedEq = Array.isArray(pet.equippedAttackIds)
    ? pet.equippedAttackIds.filter((id) => learned.includes(id))
    : [];

  let finalIds = storedEq.slice(0, MAX_EQUIPPED_ATTACKS);
  if (pet.equippedAttackIds === undefined && learned.length > 0) {
    finalIds = learned.slice(0, MAX_EQUIPPED_ATTACKS);
  }

  return finalIds
    .map((id) => MOVE_BY_ID[id])
    .filter((m): m is LearnableBattleMove => Boolean(m));
}

export interface TrainingGainOutcome {
  nextStats: BattleStats;
  deltas: BattleStats;
  newlyLearnedMoves: LearnableBattleMove[];
  prefLabel: string;
  weatherLabel: string | null;
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
  const weatherPrimaryMult = getWeatherTrainingMultiplier(pet.roomWeather, station.primaryStat);
  const weatherSecondaryMult = getWeatherTrainingMultiplier(pet.roomWeather, station.secondaryStat);
  const weatherLabel = formatWeatherBonusTag(pet.roomWeather, station.primaryStat);
  const hitMult = hits >= 3 ? 1.25 : hits === 2 ? 1.0 : hits === 1 ? 0.78 : 0.55;

  const primaryDelta = Math.max(
    1,
    Math.round(station.basePrimaryGain * stageMult * prefMult * hitMult * weatherPrimaryMult)
  );
  const secondaryDelta = Math.max(
    1,
    Math.round(station.baseSecondaryGain * stageMult * prefMult * hitMult * weatherSecondaryMult)
  );

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

  const linePool = getTechniquePoolForLine(pet, species);
  const alreadyLearned = new Set(getLearnedTechniqueIds(pet, species));
  const newlyLearnedMoves: LearnableBattleMove[] = [];

  // Learn attacks strictly from training Brains at the Blackboard (1 evolution-line attack unlocked at a time)
  if (statKey === 'brains') {
    const nextUnlearned = linePool.find((tech) => !alreadyLearned.has(tech.id));
    if (nextUnlearned) {
      const meetsThreshold = nextStats.brains >= nextUnlearned.brainsThreshold;
      const closeOnGoodHit = hits >= 2 && nextStats.brains + 6 >= nextUnlearned.brainsThreshold;
      if (meetsThreshold || closeOnGoodHit) {
        newlyLearnedMoves.push(nextUnlearned);
      }
    }
  }

  return {
    nextStats,
    deltas,
    newlyLearnedMoves,
    prefLabel,
    weatherLabel,
  };
}

export const MAX_PENDULUM_SHAKES = 25;
export const PENDULUM_DURATION_MS = 4000;

export interface PendulumTrainingOutcome {
  statKey: TrainingStatKey;
  statLabel: string;
  clampedShakes: number;
  maxShakes: number;
  nextStats: BattleStats;
  deltas: BattleStats;
  weatherIcon: string;
  weatherMultiplier: number;
}

const PENDULUM_STAT_LABELS: Record<TrainingStatKey, string> = {
  hp: 'HP',
  mp: 'MP',
  offense: 'Offense',
  defense: 'Defense',
  speed: 'Speed',
  brains: 'Brains',
};

const PENDULUM_STAT_KEYS: TrainingStatKey[] = [
  'hp',
  'mp',
  'offense',
  'defense',
  'speed',
  'brains',
];

export function calculatePendulumTrainingOutcome(
  pet: PetState,
  species: DigimonSpecies | undefined,
  shakeCount: number,
  forcedStatKey?: TrainingStatKey
): PendulumTrainingOutcome {
  const clampedShakes = Math.max(0, Math.min(MAX_PENDULUM_SHAKES, Math.floor(shakeCount)));
  const statKey =
    forcedStatKey ??
    PENDULUM_STAT_KEYS[Math.floor(Math.random() * PENDULUM_STAT_KEYS.length)];

  // Strictly modest, hard-capped gains per session (single random stat only, no stage inflation)
  let hpGain = 4;
  let mpGain = 2;
  let coreGain = 1;

  if (clampedShakes >= 22) {
    hpGain = 20;
    mpGain = 11;
    coreGain = 5;
  } else if (clampedShakes >= 16) {
    hpGain = 16;
    mpGain = 9;
    coreGain = 4;
  } else if (clampedShakes >= 10) {
    hpGain = 12;
    mpGain = 6;
    coreGain = 3;
  } else if (clampedShakes >= 4) {
    hpGain = 8;
    mpGain = 4;
    coreGain = 2;
  }

  const weatherSpec = getRoomWeatherSpec(pet.roomWeather);
  const weatherMult = getWeatherTrainingMultiplier(pet.roomWeather, statKey);
  hpGain = Math.max(1, Math.round(hpGain * weatherMult));
  mpGain = Math.max(1, Math.round(mpGain * weatherMult));
  coreGain = Math.max(1, Math.round(coreGain * weatherMult));

  const deltas: BattleStats = {
    maxHp: statKey === 'hp' ? hpGain : 0,
    maxMp: statKey === 'mp' ? mpGain : 0,
    offense: statKey === 'offense' ? coreGain : 0,
    defense: statKey === 'defense' ? coreGain : 0,
    speed: statKey === 'speed' ? coreGain : 0,
    brains: statKey === 'brains' ? coreGain : 0,
  };

  const current = getEffectiveBattleStats(pet, species);
  const nextStats: BattleStats = {
    maxHp: current.maxHp + deltas.maxHp,
    maxMp: current.maxMp + deltas.maxMp,
    offense: current.offense + deltas.offense,
    defense: current.defense + deltas.defense,
    speed: current.speed + deltas.speed,
    brains: current.brains + deltas.brains,
  };

  return {
    statKey,
    statLabel: PENDULUM_STAT_LABELS[statKey],
    clampedShakes,
    maxShakes: MAX_PENDULUM_SHAKES,
    nextStats,
    deltas,
    weatherIcon: weatherSpec.icon,
    weatherMultiplier: weatherMult,
  };
}

export const CRIT_DAMAGE_MULTIPLIER = 1.75;

export interface CriticalHitRoll {
  isCrit: boolean;
  multiplier: number;
  critChance: number;
}

export function rollCriticalHit(params: {
  attackerSpd?: number;
  defenderSpd?: number;
  isCharged?: boolean;
  isSpecial?: boolean;
  bonusChance?: number;
  rng?: () => number;
}): CriticalHitRoll {
  const atkSpd = params.attackerSpd ?? 20;
  const defSpd = params.defenderSpd ?? 20;
  const speedEdge = Math.max(-0.04, Math.min(0.08, (atkSpd - defSpd) * 0.0015));
  const chargeBonus = params.isCharged ? 0.08 : 0;
  const specialBonus = params.isSpecial ? 0.04 : 0;
  const extra = params.bonusChance ?? 0;
  const critChance = Math.max(0.09, Math.min(0.35, 0.13 + speedEdge + chargeBonus + specialBonus + extra));
  const roll = (params.rng ?? Math.random)();
  const isCrit = roll < critChance;
  return {
    isCrit,
    multiplier: isCrit ? CRIT_DAMAGE_MULTIPLIER : 1.0,
    critChance,
  };
}

export type AttackMotionKind = 'melee' | 'ranged';

export type AttackVfxVariant =
  | 'slash'
  | 'punch'
  | 'fireball'
  | 'beam'
  | 'bolt'
  | 'ice'
  | 'leaf'
  | 'holy'
  | 'dark'
  | 'missile'
  | 'filth';

export type SignatureVfxStyle =
  | 'nova_sphere'
  | 'twin_missiles'
  | 'rapid_volley'
  | 'v_x_wave'
  | 'flame_breath'
  | 'frost_breath'
  | 'comet_rush'
  | 'wing_storm'
  | 'dragon_fireball'
  | 'pyro_hazard'
  | 'fox_inferno'
  | 'toy_voxel'
  | 'thunder_strike'
  | 'diamond_storm'
  | 'crescent_moon'
  | 'vine_whip'
  | 'needle_rain'
  | 'flower_burst'
  | 'fish_march'
  | 'tidal_wave'
  | 'harpoon_trident'
  | 'bubbles'
  | 'celestial_arrow'
  | 'holy_orbs'
  | 'sacred_seal'
  | 'gate_portal'
  | 'mandala_seal'
  | 'beast_fist'
  | 'beast_king'
  | 'vulcan_hammer'
  | 'royal_saber'
  | 'positron_laser'
  | 'bat_swarm'
  | 'shadow_hand'
  | 'reaper_scythe'
  | 'sonic_wave'
  | 'drill_boulder'
  | 'poop_splat'
  | 'claw_slash'
  | 'tornado'
  | 'beam';

export interface AttackVisualSpec {
  motion: AttackMotionKind;
  element: AttackElement;
  variant: AttackVfxVariant;
  colorHex: string;
  glowHex: string;
  accentHex?: string;
  signatureStyle?: SignatureVfxStyle;
  speciesId?: string;
}

const ELEMENT_VISUAL_PALETTE: Record<AttackElement, { colorHex: string; glowHex: string }> = {
  fire: { colorHex: '#fb923c', glowHex: '#ef4444' },
  nature: { colorHex: '#4ade80', glowHex: '#16a34a' },
  air: { colorHex: '#fde047', glowHex: '#38bdf8' },
  ice: { colorHex: '#67e8f9', glowHex: '#0284c7' },
  holy: { colorHex: '#fef08a', glowHex: '#f59e0b' },
  dark: { colorHex: '#c084fc', glowHex: '#7e22ce' },
  hand: { colorHex: '#fca5a5', glowHex: '#f97316' },
  weapon: { colorHex: '#7dd3fc', glowHex: '#2563eb' },
  filth: { colorHex: '#bef264', glowHex: '#65a30d' },
  neutral: { colorHex: '#e2e8f0', glowHex: '#38bdf8' },
};

const RANGED_MOVE_REGEX =
  /blast|beam|ray|cannon|shot|fire|flame|inferno|ember|spit|bubble|wave|surge|torrent|ice|frost|freeze|blizzard|hail|spear|lance|javelin|bolt|thunder|lightning|spark|shock|storm|tempest|wind|twister|gale|leaf|thorn|seed|petal|vine|ivy|star|nova|ring|orb|missile|rocket|bullet|laser|gun|arrow|dart|kunai|shuriken|rock|boulder|toss|splash|cloud|haze|howl|roar|shout|sonic|ultrasonic|symphony|serenade|dance|rite|breath|meteor|ball|flare|corona|pulse|jihad|heavens|mandala|dust|powder|flash|saber|sword|slash|rain|gate|destiny|spiral|fish|pearl|torpedo|trident|anchor|ink|wing|tornado|heart|treat|soul|breaker|destroyer|death|blaze|ember|ash|bonfire|pocus|corona|solblaster/i;

const MELEE_MOVE_REGEX =
  /punch|fist|knuckle|claw|nail|scratch|fang|bite|kick|knee|elbow|tackle|headbutt|rush|smash|crash|slam|stomp|hammer|lariat|paw|rend|scissors|chopper|slash|blade|cutter|sting|horn|tail|whip|spin|drill|strike|pecker|crusher|rake|slide|sliding|stamp|snap|roll/i;

const PURE_PROJECTILE_REGEX =
  /bubble|dust|powder|ring|shot|spit|rock|pebble|stone|shuriken|kunai|dart|arrow|seed|thorn|toss|splash|cannon|missile|beam|ray|laser|wave|storm|orb|star|nova|blast|fish|pearl|heart|talisman|gear|potato|ash|ember/i;

const BEAM_MOVE_REGEX =
  /beam|ray|laser|cannon|lance|javelin|impulse|force|prominence|aurora|flash|buster|infinity|blaster|river of power|diverting|hyper heat/i;

const SLASH_MOVE_REGEX =
  /claw|nail|scratch|slash|sword|blade|cutter|scissors|rend|horn|fang|sting|wing|chopper|scythe|edge|trident|shuriken|haken|saber|ripper|iai|maru/i;

interface SignatureOverride {
  signatureStyle: SignatureVfxStyle;
  motion?: AttackMotionKind;
  variant?: AttackVfxVariant;
  colorHex?: string;
  glowHex?: string;
  accentHex?: string;
}

const SPECIES_SIGNATURE_OVERRIDES: Record<string, SignatureOverride> = {
  // Baby I / II highlights
  yukimibotamon: { signatureStyle: 'diamond_storm', motion: 'ranged', variant: 'ice', colorHex: '#e0f2fe', glowHex: '#38bdf8' },
  jyarimon: { signatureStyle: 'dragon_fireball', motion: 'ranged', variant: 'fireball', colorHex: '#fb923c', glowHex: '#ef4444' },
  demimeramon: { signatureStyle: 'dragon_fireball', motion: 'ranged', variant: 'fireball', colorHex: '#fb923c', glowHex: '#dc2626' },
  tsunomon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'punch', colorHex: '#fde047', glowHex: '#ea580c' },
  tokomon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#fef08a', glowHex: '#f59e0b' },
  nyaromon: { signatureStyle: 'vine_whip', motion: 'melee', variant: 'punch', colorHex: '#fed7aa', glowHex: '#f59e0b' },
  demiveemon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'punch', colorHex: '#60a5fa', glowHex: '#2563eb' },
  upamon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#38bdf8' },
  gigimon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'slash', colorHex: '#f87171', glowHex: '#dc2626' },
  viximon: { signatureStyle: 'fox_inferno', motion: 'ranged', variant: 'holy', colorHex: '#fde047', glowHex: '#ea580c' },
  tsumemon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#c084fc', glowHex: '#7e22ce' },
  missimon: { signatureStyle: 'twin_missiles', motion: 'ranged', variant: 'missile', colorHex: '#94a3b8', glowHex: '#ef4444' },
  pinamon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#38bdf8' },
  kuramon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'dark', colorHex: '#818cf8', glowHex: '#4c1d95' },

  // Egg 01: Dragon / Fire
  agumon: { signatureStyle: 'dragon_fireball', motion: 'ranged', variant: 'fireball', colorHex: '#fb923c', glowHex: '#ef4444', accentHex: '#fef08a' },
  blackagumon: { signatureStyle: 'dragon_fireball', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#581c87', accentHex: '#f43f5e' },
  greymon: { signatureStyle: 'flame_breath', motion: 'ranged', variant: 'fireball', colorHex: '#fb923c', glowHex: '#dc2626', accentHex: '#fef08a' },
  tyrannomon: { signatureStyle: 'flame_breath', motion: 'ranged', variant: 'fireball', colorHex: '#ef4444', glowHex: '#ea580c', accentHex: '#fde047' },
  darktyrannomon: { signatureStyle: 'flame_breath', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#581c87', accentHex: '#ef4444' },
  metalgreymon: { signatureStyle: 'twin_missiles', motion: 'ranged', variant: 'missile', colorHex: '#fb923c', glowHex: '#ef4444', accentHex: '#94a3b8' },
  skullgreymon: { signatureStyle: 'twin_missiles', motion: 'ranged', variant: 'missile', colorHex: '#e2e8f0', glowHex: '#7e22ce', accentHex: '#ef4444' },
  wargreymon: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'fireball', colorHex: '#fde047', glowHex: '#ea580c', accentHex: '#ffffff' },
  blackwargreymon: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'dark', colorHex: '#e879f9', glowHex: '#7e22ce', accentHex: '#0f172a' },
  guilmon: { signatureStyle: 'pyro_hazard', motion: 'ranged', variant: 'fireball', colorHex: '#f87171', glowHex: '#dc2626', accentHex: '#fde047' },
  blackguilmon: { signatureStyle: 'pyro_hazard', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#7e22ce', accentHex: '#ef4444' },
  growlmon: { signatureStyle: 'flame_breath', motion: 'ranged', variant: 'fireball', colorHex: '#f87171', glowHex: '#b91c1c', accentHex: '#fde047' },
  growlmonorange: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#fb923c', glowHex: '#ea580c', accentHex: '#fef08a' },
  wargrowlmon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'beam', colorHex: '#f87171', glowHex: '#dc2626', accentHex: '#fef08a' },
  blackmegalogrowmon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#581c87', accentHex: '#f43f5e' },
  gallantmon: { signatureStyle: 'royal_saber', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#dc2626', accentHex: '#ffffff' },
  chaosdukemon: { signatureStyle: 'royal_saber', motion: 'ranged', variant: 'dark', colorHex: '#e879f9', glowHex: '#991b1b', accentHex: '#0f172a' },
  duramon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#fde047', glowHex: '#eab308', accentHex: '#ffffff' },
  durandamon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#fde047', glowHex: '#ea580c', accentHex: '#ffffff' },
  wingdramon: { signatureStyle: 'wing_storm', motion: 'ranged', variant: 'fireball', colorHex: '#38bdf8', glowHex: '#0284c7', accentHex: '#fb923c' },
  bluemeramon: { signatureStyle: 'flame_breath', motion: 'ranged', variant: 'fireball', colorHex: '#38bdf8', glowHex: '#1d4ed8', accentHex: '#e0f2fe' },
  hiandromon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'beam', colorHex: '#38bdf8', glowHex: '#2563eb', accentHex: '#fef08a' },
  heavyleomon: { signatureStyle: 'vulcan_hammer', motion: 'melee', variant: 'punch', colorHex: '#fde047', glowHex: '#ca8a04', accentHex: '#94a3b8' },
  shoutmon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'fireball', colorHex: '#f87171', glowHex: '#ea580c', accentHex: '#fde047' },

  // Egg 02: Canine / Frost Beast
  gabumon: { signatureStyle: 'frost_breath', motion: 'ranged', variant: 'ice', colorHex: '#60a5fa', glowHex: '#2563eb', accentHex: '#e0f2fe' },
  psychemon: { signatureStyle: 'frost_breath', motion: 'ranged', variant: 'ice', colorHex: '#f472b6', glowHex: '#a855f7', accentHex: '#fde047' },
  garurumon: { signatureStyle: 'frost_breath', motion: 'ranged', variant: 'ice', colorHex: '#93c5fd', glowHex: '#1d4ed8', accentHex: '#ffffff' },
  fangmon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#f87171', glowHex: '#991b1b', accentHex: '#fef08a' },
  dobermon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#4c1d95', accentHex: '#e2e8f0' },
  weregarurumon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#93c5fd', glowHex: '#2563eb', accentHex: '#ffffff' },
  metalgarurumon: { signatureStyle: 'frost_breath', motion: 'ranged', variant: 'beam', colorHex: '#a5f3fc', glowHex: '#0284c7', accentHex: '#ffffff' },
  polarbearmon: { signatureStyle: 'vulcan_hammer', motion: 'melee', variant: 'ice', colorHex: '#e0f2fe', glowHex: '#0284c7', accentHex: '#ffffff' },
  skadimon: { signatureStyle: 'crescent_moon', motion: 'ranged', variant: 'ice', colorHex: '#bae6fd', glowHex: '#0369a1', accentHex: '#ffffff' },
  terriermon: { signatureStyle: 'dragon_fireball', motion: 'ranged', variant: 'fireball', colorHex: '#4ade80', glowHex: '#ea580c', accentHex: '#fef08a' },
  gargomon: { signatureStyle: 'rapid_volley', motion: 'ranged', variant: 'missile', colorHex: '#7dd3fc', glowHex: '#16a34a', accentHex: '#fde047' },
  rapidmon: { signatureStyle: 'rapid_volley', motion: 'ranged', variant: 'beam', colorHex: '#86efac', glowHex: '#0284c7', accentHex: '#fde047' },
  megagargomon: { signatureStyle: 'twin_missiles', motion: 'ranged', variant: 'missile', colorHex: '#fde047', glowHex: '#15803d', accentHex: '#ef4444' },
  kyukimon: { signatureStyle: 'tornado', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#6b21a8', accentHex: '#ffffff' },
  frigimon: { signatureStyle: 'beast_fist', motion: 'melee', variant: 'ice', colorHex: '#bae6fd', glowHex: '#0284c7', accentHex: '#ffffff' },

  // Egg 03: Avian / Wind
  biyomon: { signatureStyle: 'tornado', motion: 'ranged', variant: 'fireball', colorHex: '#f472b6', glowHex: '#ea580c', accentHex: '#fde047' },
  muchomon: { signatureStyle: 'tornado', motion: 'ranged', variant: 'fireball', colorHex: '#fb923c', glowHex: '#ec4899', accentHex: '#fde047' },
  hawkmon: { signatureStyle: 'wing_storm', motion: 'ranged', variant: 'slash', colorHex: '#f87171', glowHex: '#dc2626', accentHex: '#fef08a' },
  falcomon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#94a3b8', glowHex: '#334155', accentHex: '#38bdf8' },
  birdramon: { signatureStyle: 'wing_storm', motion: 'ranged', variant: 'fireball', colorHex: '#fb923c', glowHex: '#dc2626', accentHex: '#fef08a' },
  aquilamon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'beam', colorHex: '#fef08a', glowHex: '#ea580c', accentHex: '#ffffff' },
  saberdramon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#4c1d95', accentHex: '#94a3b8' },
  kokatorimon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#ca8a04', accentHex: '#ffffff' },
  akatorimon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'fireball', colorHex: '#f87171', glowHex: '#dc2626', accentHex: '#fef08a' },
  halsemon: { signatureStyle: 'wing_storm', motion: 'ranged', variant: 'fireball', colorHex: '#fb923c', glowHex: '#ea580c', accentHex: '#fde047' },
  garudamon: { signatureStyle: 'wing_storm', motion: 'ranged', variant: 'fireball', colorHex: '#f97316', glowHex: '#b91c1c', accentHex: '#fde047' },
  silphymon: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'fireball', colorHex: '#fb7185', glowHex: '#ea580c', accentHex: '#fef08a' },
  karatenmon: { signatureStyle: 'sacred_seal', motion: 'ranged', variant: 'dark', colorHex: '#818cf8', glowHex: '#312e81', accentHex: '#ffffff' },
  hippogryphonmon: { signatureStyle: 'flame_breath', motion: 'ranged', variant: 'fireball', colorHex: '#fde047', glowHex: '#ea580c' },
  phoenixmon: { signatureStyle: 'wing_storm', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#f59e0b', accentHex: '#ffffff' },
  valkyrimon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'ice', colorHex: '#7dd3fc', glowHex: '#0284c7', accentHex: '#fef08a' },
  ravmon: { signatureStyle: 'wing_storm', motion: 'ranged', variant: 'dark', colorHex: '#94a3b8', glowHex: '#312e81', accentHex: '#e2e8f0' },
  crossmon: { signatureStyle: 'wing_storm', motion: 'ranged', variant: 'holy', colorHex: '#fde047', glowHex: '#f59e0b', accentHex: '#ffffff' },

  // Egg 04: Insect / Cyborg
  tentomon: { signatureStyle: 'thunder_strike', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#38bdf8' },
  kunemon: { signatureStyle: 'thunder_strike', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#eab308' },
  kokuwamon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'bolt', colorHex: '#60a5fa', glowHex: '#2563eb' },
  kokabuterimon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'bolt', colorHex: '#60a5fa', glowHex: '#1e293b' },
  kabuterimon: { signatureStyle: 'thunder_strike', motion: 'ranged', variant: 'bolt', colorHex: '#60a5fa', glowHex: '#2563eb', accentHex: '#fef08a' },
  megakabuterimon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'beam', colorHex: '#fde047', glowHex: '#dc2626', accentHex: '#38bdf8' },
  herculeskabuterimon: { signatureStyle: 'thunder_strike', motion: 'ranged', variant: 'beam', colorHex: '#fde047', glowHex: '#eab308', accentHex: '#38bdf8' },
  wormmon: { signatureStyle: 'vine_whip', motion: 'ranged', variant: 'leaf', colorHex: '#e2e8f0', glowHex: '#4ade80' },
  stingmon: { signatureStyle: 'needle_rain', motion: 'melee', variant: 'slash', colorHex: '#86efac', glowHex: '#16a34a' },
  kuwagamon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#f87171', glowHex: '#dc2626' },
  okuwamon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#ef4444', glowHex: '#991b1b' },
  flymon: { signatureStyle: 'needle_rain', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#7e22ce' },
  mekanorimon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'beam', colorHex: '#fde047', glowHex: '#38bdf8' },
  digmon: { signatureStyle: 'drill_boulder', motion: 'melee', variant: 'punch', colorHex: '#fde047', glowHex: '#ca8a04' },
  dinobeemon: { signatureStyle: 'bat_swarm', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#16a34a' },
  tankdramon: { signatureStyle: 'twin_missiles', motion: 'ranged', variant: 'missile', colorHex: '#fb923c', glowHex: '#475569' },
  jewelbeemon: { signatureStyle: 'needle_rain', motion: 'melee', variant: 'slash', colorHex: '#34d399', glowHex: '#059669' },
  hydramon: { signatureStyle: 'vine_whip', motion: 'ranged', variant: 'leaf', colorHex: '#4ade80', glowHex: '#7e22ce' },

  // Egg 05: Plant / Mystic Fox
  palmon: { signatureStyle: 'vine_whip', motion: 'ranged', variant: 'leaf', colorHex: '#4ade80', glowHex: '#7e22ce' },
  floramon: { signatureStyle: 'flower_burst', motion: 'ranged', variant: 'leaf', colorHex: '#f9a8d4', glowHex: '#ec4899' },
  lalamon: { signatureStyle: 'needle_rain', motion: 'ranged', variant: 'leaf', colorHex: '#f472b6', glowHex: '#16a34a' },
  mushroomon: { signatureStyle: 'poop_splat', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#6b21a8' },
  togemon: { signatureStyle: 'needle_rain', motion: 'ranged', variant: 'leaf', colorHex: '#86efac', glowHex: '#16a34a' },
  woodmon: { signatureStyle: 'vine_whip', motion: 'melee', variant: 'leaf', colorHex: '#84cc16', glowHex: '#78350f' },
  vegiemon: { signatureStyle: 'vine_whip', motion: 'ranged', variant: 'leaf', colorHex: '#f87171', glowHex: '#16a34a' },
  redvegiemon: { signatureStyle: 'flame_breath', motion: 'ranged', variant: 'fireball', colorHex: '#f87171', glowHex: '#dc2626' },
  sunflowmon: { signatureStyle: 'flower_burst', motion: 'ranged', variant: 'beam', colorHex: '#fde047', glowHex: '#ea580c' },
  lillymon: { signatureStyle: 'flower_burst', motion: 'ranged', variant: 'beam', colorHex: '#f9a8d4', glowHex: '#22c55e', accentHex: '#fef08a' },
  lilamon: { signatureStyle: 'flower_burst', motion: 'ranged', variant: 'beam', colorHex: '#d8b4fe', glowHex: '#9333ea', accentHex: '#fef08a' },
  rosemon: { signatureStyle: 'flower_burst', motion: 'ranged', variant: 'leaf', colorHex: '#fb7185', glowHex: '#be123c', accentHex: '#f472b6' },
  hudiemon: { signatureStyle: 'flower_burst', motion: 'ranged', variant: 'leaf', colorHex: '#34d399', glowHex: '#059669', accentHex: '#fde047' },
  cherrymon: { signatureStyle: 'vine_whip', motion: 'ranged', variant: 'leaf', colorHex: '#84cc16', glowHex: '#15803d' },
  renamon: { signatureStyle: 'diamond_storm', motion: 'ranged', variant: 'ice', colorHex: '#a5f3fc', glowHex: '#0284c7', accentHex: '#fde047' },
  kyubimon: { signatureStyle: 'fox_inferno', motion: 'ranged', variant: 'fireball', colorHex: '#60a5fa', glowHex: '#2563eb', accentHex: '#e0f2fe' },
  youkomonrookie: { signatureStyle: 'fox_inferno', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#6b21a8', accentHex: '#fde047' },
  youkomon: { signatureStyle: 'fox_inferno', motion: 'ranged', variant: 'dark', colorHex: '#a855f7', glowHex: '#581c87', accentHex: '#f472b6' },
  taomon: { signatureStyle: 'sacred_seal', motion: 'ranged', variant: 'holy', colorHex: '#fde047', glowHex: '#9333ea', accentHex: '#ffffff' },
  doumon: { signatureStyle: 'sacred_seal', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#4c1d95', accentHex: '#f43f5e' },
  sakuyamon: { signatureStyle: 'mandala_seal', motion: 'ranged', variant: 'holy', colorHex: '#f0abfc', glowHex: '#eab308', accentHex: '#ffffff' },
  kuzuhamon: { signatureStyle: 'mandala_seal', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#4c1d95', accentHex: '#38bdf8' },
  puppetmon: { signatureStyle: 'vulcan_hammer', motion: 'melee', variant: 'punch', colorHex: '#fb923c', glowHex: '#a16207', accentHex: '#cbd5e1' },

  // Egg 06: Aquatic / Deep Sea
  gomamon: { signatureStyle: 'fish_march', motion: 'ranged', variant: 'ice', colorHex: '#38bdf8', glowHex: '#0284c7', accentHex: '#f97316' },
  armadillomon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'punch', colorHex: '#fde047', glowHex: '#ca8a04' },
  otamamon: { signatureStyle: 'bubbles', motion: 'ranged', variant: 'ice', colorHex: '#38bdf8', glowHex: '#0284c7' },
  syakomon: { signatureStyle: 'bubbles', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#7e22ce' },
  crabmon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#f87171', glowHex: '#dc2626' },
  sangomon: { signatureStyle: 'tidal_wave', motion: 'ranged', variant: 'ice', colorHex: '#f472b6', glowHex: '#0284c7' },
  ikkakumon: { signatureStyle: 'harpoon_trident', motion: 'ranged', variant: 'missile', colorHex: '#7dd3fc', glowHex: '#0284c7', accentHex: '#f97316' },
  ankiromon: { signatureStyle: 'vulcan_hammer', motion: 'melee', variant: 'punch', colorHex: '#fbbf24', glowHex: '#b45309' },
  seadramon: { signatureStyle: 'diamond_storm', motion: 'ranged', variant: 'ice', colorHex: '#7dd3fc', glowHex: '#0284c7' },
  shellmon: { signatureStyle: 'tidal_wave', motion: 'ranged', variant: 'ice', colorHex: '#f472b6', glowHex: '#0284c7' },
  octmon: { signatureStyle: 'poop_splat', motion: 'ranged', variant: 'dark', colorHex: '#94a3b8', glowHex: '#0f172a' },
  gesomon: { signatureStyle: 'tidal_wave', motion: 'ranged', variant: 'dark', colorHex: '#94a3b8', glowHex: '#1e293b' },
  zudomon: { signatureStyle: 'vulcan_hammer', motion: 'melee', variant: 'bolt', colorHex: '#fde047', glowHex: '#f97316', accentHex: '#38bdf8' },
  shakkoumon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#ef4444' },
  megaseadramon: { signatureStyle: 'harpoon_trident', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#dc2626', accentHex: '#ffffff' },
  dagomon: { signatureStyle: 'harpoon_trident', motion: 'ranged', variant: 'dark', colorHex: '#38bdf8', glowHex: '#1e3a8a', accentHex: '#c084fc' },
  divermon: { signatureStyle: 'fish_march', motion: 'ranged', variant: 'missile', colorHex: '#38bdf8', glowHex: '#0284c7' },
  whamon: { signatureStyle: 'tidal_wave', motion: 'ranged', variant: 'ice', colorHex: '#38bdf8', glowHex: '#0369a1', accentHex: '#e0f2fe' },
  marinbullmon: { signatureStyle: 'tidal_wave', motion: 'ranged', variant: 'ice', colorHex: '#60a5fa', glowHex: '#1d4ed8' },
  vikemon: { signatureStyle: 'diamond_storm', motion: 'ranged', variant: 'ice', colorHex: '#a5f3fc', glowHex: '#0369a1', accentHex: '#ffffff' },
  slashangemon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#e2e8f0', glowHex: '#38bdf8', accentHex: '#ffffff' },
  metalseadramon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'beam', colorHex: '#67e8f9', glowHex: '#eab308', accentHex: '#ffffff' },
  leviamon: { signatureStyle: 'shadow_hand', motion: 'melee', variant: 'dark', colorHex: '#f87171', glowHex: '#7f1d1d' },
  gekomon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'ice', colorHex: '#f87171', glowHex: '#0284c7' },
  shogungekomon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'ice', colorHex: '#38bdf8', glowHex: '#0284c7' },

  // Egg 07 & 08: Holy / Shadow / Feline
  patamon: { signatureStyle: 'bubbles', motion: 'ranged', variant: 'holy', colorHex: '#fde68a', glowHex: '#fb923c' },
  kudamon: { signatureStyle: 'tornado', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#f59e0b' },
  tsukaimon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#6b21a8' },
  demidevilmon: { signatureStyle: 'needle_rain', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#7e22ce' },
  angemon: { signatureStyle: 'celestial_arrow', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#f59e0b', accentHex: '#ffffff' },
  reppamon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#f8fafc', glowHex: '#f59e0b' },
  devimon: { signatureStyle: 'shadow_hand', motion: 'melee', variant: 'dark', colorHex: '#c084fc', glowHex: '#7e22ce' },
  neondevimon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#a855f7', glowHex: '#4c1d95' },
  bakemon: { signatureStyle: 'shadow_hand', motion: 'ranged', variant: 'dark', colorHex: '#cbd5e1', glowHex: '#4c1d95' },
  pegasusmon: { signatureStyle: 'celestial_arrow', motion: 'ranged', variant: 'holy', colorHex: '#fde047', glowHex: '#f59e0b' },
  magnaangemon: { signatureStyle: 'gate_portal', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#a855f7', accentHex: '#ffffff' },
  tyilinmon: { signatureStyle: 'tornado', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#f59e0b' },
  phantomon: { signatureStyle: 'reaper_scythe', motion: 'melee', variant: 'slash', colorHex: '#c084fc', glowHex: '#6d28d9', accentHex: '#ffffff' },
  knightmon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#cbd5e1', glowHex: '#38bdf8' },
  seraphimon: { signatureStyle: 'holy_orbs', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#f59e0b', accentHex: '#ffffff' },
  sleipmon: { signatureStyle: 'diamond_storm', motion: 'ranged', variant: 'ice', colorHex: '#bae6fd', glowHex: '#dc2626', accentHex: '#ffffff' },
  beelzebumon: { signatureStyle: 'rapid_volley', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#dc2626', accentHex: '#fef08a' },
  piedmon: { signatureStyle: 'reaper_scythe', motion: 'ranged', variant: 'dark', colorHex: '#f472b6', glowHex: '#7e22ce', accentHex: '#fde047' },
  salamon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'holy', colorHex: '#f9a8d4', glowHex: '#f59e0b' },
  gatomon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#fef08a', glowHex: '#f59e0b' },
  blacktailmon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#c084fc', glowHex: '#4c1d95' },
  darcmon: { signatureStyle: 'celestial_arrow', motion: 'ranged', variant: 'holy', colorHex: '#7dd3fc', glowHex: '#0284c7' },
  mikemon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#fb923c', glowHex: '#ea580c' },
  witchmon: { signatureStyle: 'tornado', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#7e22ce' },
  nefertimon: { signatureStyle: 'sacred_seal', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#eab308' },
  angewomon: { signatureStyle: 'celestial_arrow', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#f472b6', accentHex: '#ffffff' },
  bastemon: { signatureStyle: 'crescent_moon', motion: 'melee', variant: 'slash', colorHex: '#e879f9', glowHex: '#7e22ce' },
  ladydevimon: { signatureStyle: 'bat_swarm', motion: 'ranged', variant: 'dark', colorHex: '#e879f9', glowHex: '#6b21a8' },
  gladimon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'slash', colorHex: '#e2e8f0', glowHex: '#38bdf8' },
  magnadramon: { signatureStyle: 'tornado', motion: 'ranged', variant: 'holy', colorHex: '#f9a8d4', glowHex: '#f59e0b' },
  ophanimon: { signatureStyle: 'celestial_arrow', motion: 'ranged', variant: 'holy', colorHex: '#fde047', glowHex: '#10b981', accentHex: '#ffffff' },
  lilithmon: { signatureStyle: 'shadow_hand', motion: 'ranged', variant: 'dark', colorHex: '#f472b6', glowHex: '#9d174d' },
  minervamon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#fde047', glowHex: '#eab308' },

  // Egg 09: Ancient Dragon / Royal Knights
  veemon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'punch', colorHex: '#60a5fa', glowHex: '#2563eb' },
  exveemon: { signatureStyle: 'v_x_wave', motion: 'ranged', variant: 'beam', colorHex: '#38bdf8', glowHex: '#2563eb', accentHex: '#ffffff' },
  flamedramon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'punch', colorHex: '#fb923c', glowHex: '#ef4444', accentHex: '#fef08a' },
  magnamon: { signatureStyle: 'gate_portal', motion: 'ranged', variant: 'holy', colorHex: '#fde047', glowHex: '#f59e0b', accentHex: '#ffffff' },
  veedramon: { signatureStyle: 'v_x_wave', motion: 'ranged', variant: 'fireball', colorHex: '#60a5fa', glowHex: '#1d4ed8' },
  aeroveedramon: { signatureStyle: 'v_x_wave', motion: 'ranged', variant: 'beam', colorHex: '#38bdf8', glowHex: '#16a34a', accentHex: '#fef08a' },
  ulforceveedramon: { signatureStyle: 'v_x_wave', motion: 'ranged', variant: 'beam', colorHex: '#7dd3fc', glowHex: '#eab308', accentHex: '#ffffff' },
  paildramon: { signatureStyle: 'rapid_volley', motion: 'ranged', variant: 'missile', colorHex: '#60a5fa', glowHex: '#ef4444', accentHex: '#fde047' },
  imperialdramondragonmode: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'dark', colorHex: '#a855f7', glowHex: '#1d4ed8', accentHex: '#ffffff' },
  imperialdramonfightermode: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'beam', colorHex: '#38bdf8', glowHex: '#1d4ed8', accentHex: '#ffffff' },
  zubamon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#fde047', glowHex: '#ca8a04' },
  zubaeagermon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#fde047', glowHex: '#ea580c' },
  ryudamon: { signatureStyle: 'reaper_scythe', motion: 'melee', variant: 'slash', colorHex: '#fde047', glowHex: '#ca8a04' },
  hisyaryumon: { signatureStyle: 'royal_saber', motion: 'ranged', variant: 'holy', colorHex: '#fde047', glowHex: '#eab308' },
  owryumon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#fde047', glowHex: '#ca8a04', accentHex: '#ffffff' },
  justimon: { signatureStyle: 'beast_fist', motion: 'melee', variant: 'punch', colorHex: '#f87171', glowHex: '#dc2626', accentHex: '#fde047' },

  // Egg 10-14: Ninja / Earth / Hazard / Mech
  igamon: { signatureStyle: 'reaper_scythe', motion: 'ranged', variant: 'slash', colorHex: '#4ade80', glowHex: '#16a34a' },
  ninjamon: { signatureStyle: 'reaper_scythe', motion: 'ranged', variant: 'slash', colorHex: '#4ade80', glowHex: '#15803d' },
  fumamon: { signatureStyle: 'reaper_scythe', motion: 'melee', variant: 'bolt', colorHex: '#38bdf8', glowHex: '#0284c7' },
  oboromon: { signatureStyle: 'reaper_scythe', motion: 'melee', variant: 'slash', colorHex: '#818cf8', glowHex: '#4c1d95' },
  musyamon: { signatureStyle: 'reaper_scythe', motion: 'melee', variant: 'slash', colorHex: '#f87171', glowHex: '#7f1d1d' },
  murasamemon: { signatureStyle: 'reaper_scythe', motion: 'melee', variant: 'slash', colorHex: '#818cf8', glowHex: '#312e81' },
  andromon: { signatureStyle: 'reaper_scythe', motion: 'ranged', variant: 'bolt', colorHex: '#94a3b8', glowHex: '#38bdf8' },
  banchostingmon: { signatureStyle: 'royal_saber', motion: 'melee', variant: 'slash', colorHex: '#4ade80', glowHex: '#dc2626' },
  gaioumon: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'fireball', colorHex: '#fb923c', glowHex: '#dc2626', accentHex: '#fde047' },
  parrotmon: { signatureStyle: 'thunder_strike', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#10b981' },
  gotsumon: { signatureStyle: 'drill_boulder', motion: 'ranged', variant: 'punch', colorHex: '#a8a29e', glowHex: '#57534e' },
  drimogemon: { signatureStyle: 'drill_boulder', motion: 'melee', variant: 'punch', colorHex: '#60a5fa', glowHex: '#1d4ed8' },
  hagurumon: { signatureStyle: 'drill_boulder', motion: 'ranged', variant: 'bolt', colorHex: '#94a3b8', glowHex: '#7e22ce' },
  triceramon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'punch', colorHex: '#f59e0b', glowHex: '#b45309' },
  vermillimon: { signatureStyle: 'comet_rush', motion: 'melee', variant: 'fireball', colorHex: '#ef4444', glowHex: '#b91c1c' },
  spinomon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'beam', colorHex: '#38bdf8', glowHex: '#0284c7' },
  cannondramon: { signatureStyle: 'twin_missiles', motion: 'ranged', variant: 'missile', colorHex: '#94a3b8', glowHex: '#dc2626' },
  meramon: { signatureStyle: 'dragon_fireball', motion: 'ranged', variant: 'fireball', colorHex: '#fb923c', glowHex: '#ea580c' },
  fugamon: { signatureStyle: 'tornado', motion: 'ranged', variant: 'dark', colorHex: '#fb923c', glowHex: '#7c2d12' },
  alphamon: { signatureStyle: 'gate_portal', motion: 'ranged', variant: 'holy', colorHex: '#fef08a', glowHex: '#2563eb', accentHex: '#ffffff' },
  leomon: { signatureStyle: 'beast_king', motion: 'ranged', variant: 'fireball', colorHex: '#fbbf24', glowHex: '#ea580c', accentHex: '#ffffff' },
  madleomon: { signatureStyle: 'beast_king', motion: 'melee', variant: 'dark', colorHex: '#c084fc', glowHex: '#581c87', accentHex: '#ef4444' },
  gankoomon: { signatureStyle: 'vulcan_hammer', motion: 'melee', variant: 'punch', colorHex: '#fb923c', glowHex: '#dc2626', accentHex: '#fde047' },
  toyagumon: { signatureStyle: 'toy_voxel', motion: 'ranged', variant: 'fireball', colorHex: '#f87171', glowHex: '#ea580c', accentHex: '#fde047' },
  solarmon: { signatureStyle: 'toy_voxel', motion: 'ranged', variant: 'fireball', colorHex: '#fbbf24', glowHex: '#f59e0b', accentHex: '#ffffff' },
  clockmon: { signatureStyle: 'vulcan_hammer', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#ca8a04' },
  guardromon: { signatureStyle: 'twin_missiles', motion: 'ranged', variant: 'missile', colorHex: '#fb923c', glowHex: '#b45309' },
  guardromongold: { signatureStyle: 'toy_voxel', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#ca8a04' },
  datamon: { signatureStyle: 'toy_voxel', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#7e22ce' },
  raremon: { signatureStyle: 'poop_splat', motion: 'ranged', variant: 'filth', colorHex: '#a3e635', glowHex: '#4d7c0f' },
  numemon: { signatureStyle: 'poop_splat', motion: 'ranged', variant: 'filth', colorHex: '#a16207', glowHex: '#65a30d' },
  garbagemon: { signatureStyle: 'poop_splat', motion: 'ranged', variant: 'filth', colorHex: '#94a3b8', glowHex: '#65a30d' },
  machinedramon: { signatureStyle: 'positron_laser', motion: 'ranged', variant: 'beam', colorHex: '#38bdf8', glowHex: '#1d4ed8', accentHex: '#ffffff' },
  devidramon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#f87171', glowHex: '#7f1d1d' },
  cyberdramon: { signatureStyle: 'claw_slash', motion: 'melee', variant: 'slash', colorHex: '#c084fc', glowHex: '#4c1d95' },
  myotismon: { signatureStyle: 'bat_swarm', motion: 'ranged', variant: 'dark', colorHex: '#f87171', glowHex: '#7f1d1d', accentHex: '#c084fc' },
  malomyotismon: { signatureStyle: 'bat_swarm', motion: 'ranged', variant: 'dark', colorHex: '#ef4444', glowHex: '#581c87', accentHex: '#fde047' },
  pumpkinmon: { signatureStyle: 'bat_swarm', motion: 'ranged', variant: 'dark', colorHex: '#fb923c', glowHex: '#7c2d12', accentHex: '#fde047' },
  apocalymon: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'dark', colorHex: '#a855f7', glowHex: '#0f172a', accentHex: '#f43f5e' },
  diablomon: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'dark', colorHex: '#818cf8', glowHex: '#4c1d95', accentHex: '#f43f5e' },
  armageddemon: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#3b0764', accentHex: '#ffffff' },
  dianamon: { signatureStyle: 'crescent_moon', motion: 'ranged', variant: 'ice', colorHex: '#93c5fd', glowHex: '#3b82f6', accentHex: '#fef08a' },
  apollomon: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'fireball', colorHex: '#fde047', glowHex: '#ea580c', accentHex: '#ffffff' },
  monzaemon: { signatureStyle: 'holy_orbs', motion: 'ranged', variant: 'holy', colorHex: '#f9a8d4', glowHex: '#ec4899', accentHex: '#ffffff' },
  etemon: { signatureStyle: 'sonic_wave', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#6b21a8' },
  chikurimon: { signatureStyle: 'nova_sphere', motion: 'ranged', variant: 'bolt', colorHex: '#fde047', glowHex: '#38bdf8' },
  loaderliomon: { signatureStyle: 'vulcan_hammer', motion: 'melee', variant: 'punch', colorHex: '#fde047', glowHex: '#ca8a04' },
  megadramon: { signatureStyle: 'twin_missiles', motion: 'ranged', variant: 'missile', colorHex: '#f87171', glowHex: '#991b1b' },
  cherubimonvice: { signatureStyle: 'thunder_strike', motion: 'ranged', variant: 'dark', colorHex: '#c084fc', glowHex: '#581c87' },
  cherubimonvirtue: { signatureStyle: 'thunder_strike', motion: 'ranged', variant: 'holy', colorHex: '#f9a8d4', glowHex: '#f59e0b' },
};

function inferSignatureStyleFromMove(
  moveName: string,
  element: AttackElement,
  motion: AttackMotionKind,
  variant: AttackVfxVariant
): SignatureVfxStyle {
  const n = moveName.toLowerCase();

  if (/poop|sludge|dirty|venom|spurting ink/.test(n)) return 'poop_splat';
  if (/bubble|spit|pearl|dust|powder|jamming|ring/.test(n)) return 'bubbles';
  if (/pyro sphere|virus sphere/.test(n)) return 'pyro_hazard';
  if (/fox tail|evil flame|wicked ember|killing stone/.test(n)) return 'fox_inferno';
  if (/toy flame|shiny ring|grenade|plug bomb/.test(n)) return 'toy_voxel';
  if (/gate of destiny|digitalize of soul|extreme jihad/.test(n)) return 'gate_portal';
  if (/mandala|ura izuna/.test(n)) return 'mandala_seal';
  if (/vulcan hammer|tekken seisai|chrono breaker|tail hammer|bullet hammer|sonic excavator/.test(n)) return 'vulcan_hammer';
  if (/beast king/.test(n)) return 'beast_king';
  if (/royal saber|gram slash|zweihander|heaven ripper|berserk sword|twentieth|eiseiryu|seiryu|fenrir sword|strike roll|bloody finish/.test(n)) return 'royal_saber';
  if (/positron|giga cannon|atomic blaster|atomic ray|horn buster|twinkle beam|river of power|glare eye|scarlet eye/.test(n)) return 'positron_laser';
  if (/crescent|helter skelter|fimbulvetr/.test(n)) return 'crescent_moon';
  if (/terra force|terra destroyer|darkness zone|destiny destroyer|mega death|catastrophe|solblaster|gaia reactor|cosmo flash|nightmare syndrome|static force|soul core break/.test(n)) return 'nova_sphere';
  if (/missile|giga blaster|barrage|bazooka|dynamo cannon|hyper cannon|genocide attack|energy shot|striver cannon/.test(n)) return 'twin_missiles';
  if (/rapid fire|desperado|burst shot|gargo laser|double impact|carabine|bullet|shooter/.test(n)) return 'rapid_volley';
  if (/v-wing|v-force|x-laser|v-breath/.test(n)) return 'v_x_wave';
  if (/howling|cocytus|frost|ice breath|blue blaster/.test(n)) return 'frost_breath';
  if (/breath|mega flame|exhaust flame|red blaze|blue prominence|heavy metal fire|hellfire|black flame|cold flame/.test(n)) return 'flame_breath';
  if (/rocket|dash|headbutt|wheel rush|sliding|tri-horn|diamond shell|full throttle|volcanic/.test(n)) return 'comet_rush';
  if (/meteor wing|shadow wing|starlight explosion|kaiser phoenix|wing|feather/.test(n)) return 'wing_storm';
  if (/tornado|twister|hurricane|whirlwind|wind swift|gale/.test(n)) return 'tornado';
  if (/thunder|shocker|lightning|mjolnir|bolt|electro|final strike/.test(n)) return 'thunder_strike';
  if (/diamond|blizzard|bifrost|ice arrow|iceball|blazing ice|boomerang/.test(n)) return 'diamond_storm';
  if (/ivy|sticky net|vine|branch/.test(n)) return 'vine_whip';
  if (/needle|spike|stinger|thorn|nuts|seed|dart/.test(n)) return 'needle_rain';
  if (/flower|temptation|sunshine|dream|fantasia|bit bomb|lilac/.test(n)) return 'flower_burst';
  if (/marching fish|striking fish/.test(n)) return 'fish_march';
  if (/tidal|hydro|coral|anchor|shade/.test(n)) return 'tidal_wave';
  if (/harpoon|trident/.test(n)) return 'harpoon_trident';
  if (/arrow|javelin|judgment|shooting star|holy shot|baptisme|shirohane/.test(n)) return 'celestial_arrow';
  if (/seven heavens|meteor squall|hearts attack/.test(n)) return 'holy_orbs';
  if (/bonhitsusen|aramitama|rosetta|talisman|satori/.test(n)) return 'sacred_seal';
  if (/hand of fate|justice kick|ice punch|oyaji|pummel|boring storm|paw|punch|knuckle|fist|mad dance/.test(n)) return 'beast_fist';
  if (/grisly wing|pandemonium|darkness wave|nightmare shock|bad message|trick or treat|masquerade/.test(n)) return 'bat_swarm';
  if (/touch of evil|hell hand|gift of darkness|rostrum|phantom pain|decay|heartbreak/.test(n)) return 'shadow_hand';
  if (/chopper|trump sword|spectral rain|ghost slash|demon disaster|shuriken|sword|slash|maru|iai|bunny blades/.test(n)) return 'reaper_scythe';
  if (/howl|symphony|musical|rock soul|dark spirits|ultrasonic|giggle|chirp|roar|lärm|larm|shout/.test(n)) return 'sonic_wave';
  if (/drill|rock|stone|pebble|gear|potato|clack/.test(n)) return 'drill_boulder';
  if (/claw|nail|scratch|fang|rend|scissors|rake|lariat|pecker|gaken|tail blade|strike/.test(n) && motion === 'melee') {
    return variant === 'slash' ? 'claw_slash' : 'beast_fist';
  }
  if (/eye|beam|ray|laser|cannon|blaster|heat|divert/.test(n)) {
    return 'beam';
  }

  // Fallback by motion & element
  if (motion === 'melee') {
    if (element === 'filth') return 'beast_fist';
    return variant === 'slash' ? 'claw_slash' : 'beast_fist';
  }
  if (element === 'filth') return 'poop_splat';
  switch (variant) {
    case 'bolt':
      return 'thunder_strike';
    case 'ice':
      return 'diamond_storm';
    case 'leaf':
      return 'needle_rain';
    case 'holy':
      return 'sacred_seal';
    case 'dark':
      return 'dragon_fireball';
    case 'missile':
      return 'twin_missiles';
    case 'filth':
      return 'poop_splat';
    case 'beam':
      return 'beam';
    case 'fireball':
    default:
      return element === 'ice' ? 'diamond_storm' : 'dragon_fireball';
  }
}

function pickRangedVariant(element: AttackElement, moveName: string, soundType?: string): AttackVfxVariant {
  if (BEAM_MOVE_REGEX.test(moveName)) {
    return 'beam';
  }
  if (soundType === 'laser' && (element === 'holy' || element === 'weapon' || element === 'fire' || element === 'neutral')) {
    return 'beam';
  }
  switch (element) {
    case 'fire':
      return 'fireball';
    case 'ice':
      return 'ice';
    case 'air':
      return 'bolt';
    case 'nature':
      return 'leaf';
    case 'holy':
      return 'holy';
    case 'dark':
      return 'dark';
    case 'weapon':
      return 'missile';
    case 'filth':
      return 'filth';
    case 'hand':
    case 'neutral':
    default:
      return soundType === 'laser' ? 'beam' : 'fireball';
  }
}

export function getBasicAttackVisual(
  element: AttackElement = 'neutral',
  species?: DigimonSpecies
): AttackVisualSpec {
  const palette = ELEMENT_VISUAL_PALETTE[element] || ELEMENT_VISUAL_PALETTE.neutral;
  const sigName = species?.signatureMove?.name || '';
  const speciesHint = `${species?.type || ''} ${sigName}`.toLowerCase();
  const isSlash =
    element === 'weapon' ||
    element === 'dark' ||
    element === 'nature' ||
    SLASH_MOVE_REGEX.test(speciesHint) ||
    /dramon|greymon|garurumon|leomon|bird|eagle|hawk|insect|kabuterimon|kuwagamon|knight|ninja/i.test(
      species?.name || ''
    );

  return {
    motion: 'melee',
    element,
    variant: isSlash ? 'slash' : 'punch',
    colorHex: palette.colorHex,
    glowHex: palette.glowHex,
    signatureStyle: isSlash ? 'claw_slash' : 'beast_fist',
    speciesId: species?.id,
  };
}

export function getRangedVolleyVisual(
  element: AttackElement = 'neutral',
  moveName = 'Energy Shot'
): AttackVisualSpec {
  const palette = ELEMENT_VISUAL_PALETTE[element] || ELEMENT_VISUAL_PALETTE.neutral;
  const variant = pickRangedVariant(element, moveName, 'blast');
  return {
    motion: 'ranged',
    element,
    variant,
    colorHex: palette.colorHex,
    glowHex: palette.glowHex,
    signatureStyle: inferSignatureStyleFromMove(moveName, element, 'ranged', variant),
  };
}

export function classifyAttackVisual(
  move?: {
    name: string;
    type?: AttackMove['type'];
    element?: AttackElement;
    soundType?: AttackMove['soundType'];
  },
  species?: DigimonSpecies
): AttackVisualSpec {
  if (!move) {
    return getBasicAttackVisual(getSpeciesElementType(species), species);
  }

  const element = move.element || mapMoveTypeToElement({ type: move.type || 'physical', element: move.element }, species);
  const palette = ELEMENT_VISUAL_PALETTE[element] || ELEMENT_VISUAL_PALETTE.neutral;
  const name = move.name || '';
  const soundType = move.soundType || 'blast';

  // Check if this is the Digimon's canonical signature move override
  const isSignatureMove =
    species?.id &&
    species.signatureMove?.name &&
    species.signatureMove.name.toLowerCase() === name.toLowerCase();
  const speciesOverride = isSignatureMove && species?.id ? SPECIES_SIGNATURE_OVERRIDES[species.id] : undefined;

  let motion: AttackMotionKind;
  if (speciesOverride?.motion) {
    motion = speciesOverride.motion;
  } else if (soundType === 'punch') {
    motion = PURE_PROJECTILE_REGEX.test(name) ? 'ranged' : 'melee';
  } else {
    const looksMelee = MELEE_MOVE_REGEX.test(name) && !RANGED_MOVE_REGEX.test(name);
    motion = looksMelee ? 'melee' : 'ranged';
  }

  const variant: AttackVfxVariant =
    speciesOverride?.variant ||
    (motion === 'melee'
      ? SLASH_MOVE_REGEX.test(name) || element === 'weapon'
        ? 'slash'
        : 'punch'
      : pickRangedVariant(element, name, soundType));

  const colorHex = speciesOverride?.colorHex || palette.colorHex;
  const glowHex = speciesOverride?.glowHex || palette.glowHex;
  const signatureStyle =
    speciesOverride?.signatureStyle ||
    inferSignatureStyleFromMove(name, element, motion, variant);

  return {
    motion,
    element,
    variant,
    colorHex,
    glowHex,
    accentHex: speciesOverride?.accentHex,
    signatureStyle,
    speciesId: species?.id,
  };
}


