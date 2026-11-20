import { DigimonSpecies, FurnitureItem } from '../types/digimon';
import {
  DIGI_EGGS,
  SPECIAL_ITEMS,
  EGG_LINE_MATRIX,
  MATRIX_SPECIES,
} from './eggsAndMatrix';
import { EXTRA_ROSTER_SPECIES } from './extraRoster';

export { DIGI_EGGS, SPECIAL_ITEMS, EGG_LINE_MATRIX };

export const DIGIMON_DATABASE: Record<string, DigimonSpecies> = {
  ...EXTRA_ROSTER_SPECIES,
  ...MATRIX_SPECIES,
};

export const FURNITURE_SHOP: FurnitureItem[] = [
  {
    id: 'meat-grill',
    name: 'Big Meat Rotisserie',
    category: 'decoration',
    price: 60,
    icon: '🍖',
    description: 'A smoking grill always sizzling with savory prime Big Meat. Boosts Digimon appetite!',
    interactEffect: 'Yum! Big Meat smell fills the room!',
  },
  {
    id: 'punching-bag',
    name: 'Digital Punching Bag',
    category: 'toy',
    price: 80,
    icon: '🥊',
    description: 'A heavy leather punching dummy. Perfect for high-intensity power workouts!',
    interactEffect: 'Wham! Digimon throws a powerful right hook!',
  },
  {
    id: 'digivice-pedestal',
    name: '1999 Digivice Shrine',
    category: 'decoration',
    price: 120,
    icon: '📟',
    description: 'A glowing pedestal displaying the sacred Holy Digivice from the anime.',
    interactEffect: 'The Digivice emits a familiar 8-bit chime!',
  },
  {
    id: 'cozy-cushion',
    name: 'File Island Beanbag',
    category: 'bed',
    price: 50,
    icon: '🛋️',
    description: 'Super plush oversized cushion. Heals tiredness and provides sweet dreams.',
    interactEffect: 'Zzz... Digimon curls up and purrs peacefully.',
  },
  {
    id: 'colosseum-trophy',
    name: 'Tamer Gold Cup',
    category: 'decoration',
    price: 200,
    icon: '🏆',
    description: 'Gleaming gold trophy awarded to championship Tamers of the Digital Colosseum.',
    interactEffect: 'Victory fanfare echoes across the room!',
  },
  {
    id: 'egg-incubator',
    name: 'Data Egg Incubator',
    category: 'decoration',
    price: 150,
    icon: '🥚',
    description: 'Gentle temperature incubator that keeps future Digi-Eggs warm and happy.',
    interactEffect: 'Soft pulsing hum warms the room.',
  },
];

export const ROOM_THEMES = [
  {
    id: 'file-island',
    name: 'File Island Beach',
    skyColor: 'from-amber-200 via-sky-300 to-sky-500',
    floorColor: 'from-amber-300 to-amber-600',
    description: 'Sunny beach with tropical palm trees and waves from the Digital Ocean.',
  },
  {
    id: 'starlit-island',
    name: 'Moonlit File Island',
    skyColor: 'from-slate-950 via-indigo-950 to-blue-950',
    floorColor: 'from-slate-900 to-indigo-950',
    description: 'Calm nocturnal island shore bathed in soft moonlight and evening stars.',
  },
  {
    id: 'cyber-matrix',
    name: 'Digital Cyber Space',
    skyColor: 'from-slate-950 via-emerald-950 to-slate-900',
    floorColor: 'from-emerald-900 to-emerald-950',
    description: 'Futuristic matrix grid with streaming neon green hexadecimal code.',
  },
  {
    id: 'primary-village',
    name: 'Primary Village',
    skyColor: 'from-pink-200 via-purple-200 to-indigo-300',
    floorColor: 'from-emerald-300 to-teal-600',
    description: 'The peaceful nursery of all Digi-Eggs with soft pastel cradle blocks.',
  },
  {
    id: 'colosseum-arena',
    name: 'Colosseum Stadium',
    skyColor: 'from-indigo-950 via-purple-900 to-slate-900',
    floorColor: 'from-slate-800 to-slate-950',
    description: 'Grand illuminated stadium where legendary Tamers clash under stadium lights.',
  },
];

export const HELLOPET_QUOTES: string[] = [
  "Tamer! I'm starving, got any Big Meat? 🍖",
  "Let's go train at the punching bag! I wanna digivolve!",
  "Check out my stats in the Digivice! I'm getting stronger!",
  "Did you know I can walk on top of your screen?",
  "Keep your battery charged so we can battle online!",
  "File Island is nice today. No wild Kuwagamon in sight!",
  "Give me vitamins if I look under the weather! 💊",
  "Don't forget to flush when I make a mess! 💩",
  "We're going to reach Ultimate stage together, partner!",
  "Breathe in... focus energy... signature blast!",
  "I'm keeping watch over your device today!",
];
