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

