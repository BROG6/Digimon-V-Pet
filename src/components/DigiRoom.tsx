import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetState, DigimonSpecies, FurnitureItem, RoomWeatherTheme } from '../types/digimon';
import { FURNITURE_SHOP, ROOM_THEMES } from '../data/digidex';
import { DigimonSprite } from './DigimonSprite';
import { PixelMeatIcon } from './PixelItemIcons';
import { sound } from '../utils/audio';
import { computeTamerRankProgress, getTamerRankTier } from '../utils/tamerRank';
import {
  ROOM_WEATHER_ORDER,
  ROOM_WEATHER_SPECS,
  getRoomWeatherSpec,
  normalizeRoomWeather,
} from '../utils/roomWeather';
import {
  Home,
  X,
  Trash2,
  Check,
  Moon,
  Sun,
  CloudRain,
  Snowflake,
  Lock,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { DayNightPreference } from '../utils/dayNightCycle';

const WEATHER_PARTICLES = Array.from({ length: 28 }, (_, idx) => ({
  id: idx,
  left: ((idx * 17 + 7) % 94) + 3,
  delay: ((idx * 0.31) % 2.8).toFixed(2),
  duration: (2.0 + ((idx * 0.39) % 2.2)).toFixed(2),
  drift: idx % 2 === 0 ? 16 : -16,
  size: idx % 3 === 0 ? 'lg' : idx % 3 === 1 ? 'md' : 'sm',
}));

const RAIN_SPLASHES = [
  { id: 0, left: '16%', bottom: '12%', delay: '0.1s' },
  { id: 1, left: '37%', bottom: '20%', delay: '0.7s' },
  { id: 2, left: '58%', bottom: '10%', delay: '1.2s' },
  { id: 3, left: '78%', bottom: '24%', delay: '0.45s' },
  { id: 4, left: '88%', bottom: '14%', delay: '1.55s' },
];

interface RoomFurnitureDisplaySpec {
  emojiClass: string;
  meatClass?: string;
  shadowClass: string;
  isWallDecor?: boolean;
}

const ROOM_FURNITURE_DISPLAY: Record<string, RoomFurnitureDisplaySpec> = {
  'meat-grill': {
    emojiClass: 'text-2xl sm:text-3xl leading-none',
    meatClass: 'w-7 h-7 sm:w-8 sm:h-8',
    shadowClass: 'w-7 sm:w-8 h-1.5 -mt-0.5 bg-black/35',
  },
  'digivice-pedestal': {
    emojiClass: 'text-[2.125rem] sm:text-[2.5rem] leading-none',
    shadowClass: 'w-8 sm:w-9 h-1.5 -mt-0.5 bg-black/30',
  },
  'colosseum-trophy': {
    emojiClass: 'text-[2.375rem] sm:text-[2.875rem] leading-none',
    shadowClass: 'w-9 sm:w-11 h-1.5 -mt-0.5 bg-black/30',
  },
  'egg-incubator': {
    emojiClass: 'text-[2.75rem] sm:text-[3.25rem] leading-none',
    shadowClass: 'w-10 sm:w-12 h-2 -mt-1 bg-black/30',
  },
  'punching-bag': {
    emojiClass: 'text-[3.5rem] sm:text-[4.25rem] leading-none',
    shadowClass: 'w-12 sm:w-14 h-2 -mt-1 bg-black/30',
  },
  'crest-banner': {
    emojiClass: 'text-[3.75rem] sm:text-[4.5rem] leading-none',
    shadowClass: 'w-10 sm:w-12 h-1.5 mt-0.5 bg-black/20',
    isWallDecor: true,
  },
  'knight-statue': {
    emojiClass: 'text-[4.25rem] sm:text-[4.875rem] leading-none',
    shadowClass: 'w-14 sm:w-16 h-2 -mt-1 bg-black/35',
  },
  'neon-arcade-cab': {
    emojiClass: 'text-[4.375rem] sm:text-[5.125rem] leading-none',
    shadowClass: 'w-16 sm:w-18 h-2.5 -mt-1.5 bg-black/35',
  },
  'sovereign-throne': {
    emojiClass: 'text-[4.5rem] sm:text-[5.25rem] leading-none',
    shadowClass: 'w-16 sm:w-20 h-2.5 -mt-1.5 bg-black/35',
  },
  'cozy-cushion': {
    emojiClass: 'text-[5.25rem] sm:text-[6.25rem] leading-none',
    shadowClass: 'w-20 sm:w-24 h-2.5 -mt-2 bg-black/35',
  },
};

function getRoomFurnitureDisplay(item: FurnitureItem): RoomFurnitureDisplaySpec {
  if (ROOM_FURNITURE_DISPLAY[item.id]) {
    return ROOM_FURNITURE_DISPLAY[item.id];
  }
  if (item.category === 'bed') {
    return ROOM_FURNITURE_DISPLAY['cozy-cushion'];
  }
  if (item.category === 'toy') {
    return ROOM_FURNITURE_DISPLAY['punching-bag'];
  }
  return ROOM_FURNITURE_DISPLAY['colosseum-trophy'];
}

interface DigiRoomProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onBuyFurniture: (item: FurnitureItem) => void;
  onPlaceFurniture: (furnitureId: string, x: number, y: number) => void;
  onRemoveFurniture: (instanceId: string) => void;
  onUpdateFurniturePosition?: (instanceId: string, x: number, y: number) => void;
  onChangeTheme: (themeId: string) => void;
  weather?: RoomWeatherTheme;
  onChangeWeather?: (weather: RoomWeatherTheme) => void;
  isNightTime?: boolean;
  dayNightPref?: DayNightPreference;
  onCycleDayNight?: () => void;
  onOpenTamerRank?: () => void;
}

const ThemeBackdropDecor: React.FC<{ themeId: string }> = ({ themeId }) => {
  if (themeId === 'file-island') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Warm Tropical Sun & Drifting Clouds */}
        <div className="absolute top-5 left-8 w-14 h-14 rounded-full bg-amber-200/80 shadow-[0_0_32px_rgba(253,224,71,0.75)]" />
        <div className="room-slow-drift absolute top-6 left-28 flex items-end opacity-80">
          <div className="w-10 h-4 rounded-full bg-white/75" />
          <div className="w-12 h-6 -ml-5 rounded-full bg-white/85" />
          <div className="w-8 h-4 -ml-4 rounded-full bg-white/75" />
        </div>
        <div className="room-slow-drift absolute top-11 right-16 flex items-end opacity-70" style={{ animationDelay: '-3.5s' }}>
          <div className="w-12 h-4 rounded-full bg-white/70" />
          <div className="w-14 h-6 -ml-6 rounded-full bg-white/80" />
          <div className="w-8 h-4 -ml-4 rounded-full bg-white/70" />
        </div>

        {/* Distant File Island Peaks (Mt. Infinity) */}
        <svg viewBox="0 0 400 70" preserveAspectRatio="none" className="absolute bottom-[45%] inset-x-0 w-full h-14 opacity-70">
          <polygon points="10,70 65,24 120,70" fill="#0f766e" opacity="0.55" />
          <polygon points="85,70 155,14 230,70" fill="#15803d" opacity="0.65" />
          <polygon points="245,70 305,28 365,70" fill="#0d9488" opacity="0.5" />
        </svg>

        {/* Digital Ocean Band & Rolling Surf */}
        <div className="absolute bottom-[44%] inset-x-0 h-11 bg-gradient-to-b from-cyan-500/80 via-sky-500/75 to-teal-400/75 border-t border-sky-200/45 overflow-hidden">
          <div className="room-wave-slide absolute top-2 left-4 right-4 flex justify-between opacity-75">
            <span className="w-14 h-1 rounded-full bg-white/65" />
            <span className="w-20 h-1 rounded-full bg-cyan-100/70" />
            <span className="w-12 h-1 rounded-full bg-white/65" />
            <span className="w-16 h-1 rounded-full bg-cyan-100/70" />
          </div>
          <div className="room-wave-slide absolute bottom-1.5 left-0 right-0 flex justify-around opacity-85" style={{ animationDelay: '-2s' }}>
            <span className="w-20 h-1.5 rounded-full bg-white/80" />
            <span className="w-24 h-1.5 rounded-full bg-white/75" />
            <span className="w-16 h-1.5 rounded-full bg-white/80" />
          </div>
        </div>

        {/* Left & Right Swaying Palm Trees */}
        <svg viewBox="0 0 80 120" className="room-gentle-sway absolute bottom-[43%] left-2 w-16 sm:w-20 h-28 sm:h-32 drop-shadow-md">
          <path d="M22,120 Q28,75 40,36" stroke="#78350f" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M22,120 Q28,75 40,36" stroke="#92400e" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M40,36 Q18,22 6,34 Q22,34 40,36 Z" fill="#16a34a" />
          <path d="M40,36 Q24,10 14,14 Q28,22 40,36 Z" fill="#22c55e" />
          <path d="M40,36 Q56,12 68,20 Q54,26 40,36 Z" fill="#22c55e" />
          <path d="M40,36 Q64,28 74,44 Q56,38 40,36 Z" fill="#15803d" />
          <circle cx="37" cy="40" r="3" fill="#451a03" />
          <circle cx="43" cy="40" r="3" fill="#451a03" />
        </svg>

        <svg viewBox="0 0 80 120" className="room-gentle-sway absolute bottom-[43%] right-2 w-16 sm:w-20 h-28 sm:h-32 drop-shadow-md" style={{ animationDelay: '-2.2s', transform: 'scaleX(-1)' }}>
          <path d="M22,120 Q28,75 40,36" stroke="#78350f" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M22,120 Q28,75 40,36" stroke="#92400e" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M40,36 Q18,22 6,34 Q22,34 40,36 Z" fill="#16a34a" />
          <path d="M40,36 Q24,10 14,14 Q28,22 40,36 Z" fill="#22c55e" />
          <path d="M40,36 Q56,12 68,20 Q54,26 40,36 Z" fill="#22c55e" />
          <path d="M40,36 Q64,28 74,44 Q56,38 40,36 Z" fill="#15803d" />
        </svg>

        {/* Beach Starfish & Seashell Details on Shore */}
        <div className="absolute bottom-[18%] left-[15%] text-sm opacity-75">🐚</div>
        <div className="absolute bottom-[12%] right-[18%] text-sm opacity-70">⭐</div>
      </div>
    );
  }

  if (themeId === 'starlit-island') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Moonlit Halo & Distant Island Ridge */}
        <div className="absolute top-6 right-10 w-24 h-24 rounded-full bg-indigo-400/15 blur-xl" />
        <svg viewBox="0 0 400 70" preserveAspectRatio="none" className="absolute bottom-[45%] inset-x-0 w-full h-14 opacity-75">
          <polygon points="0,70 70,22 145,70" fill="#0f172a" />
          <polygon points="105,70 185,18 270,70" fill="#1e1b4b" />
          <polygon points="240,70 315,28 395,70" fill="#0f172a" />
        </svg>

        {/* Nocturnal Digital Ocean with Moonlight Reflection */}
        <div className="absolute bottom-[44%] inset-x-0 h-11 bg-gradient-to-b from-blue-950/90 via-indigo-950/90 to-slate-900/90 border-t border-indigo-400/25 overflow-hidden">
          <div className="absolute right-12 top-1 w-14 h-9 bg-gradient-to-b from-amber-100/35 to-transparent blur-[2px]" />
          <div className="room-wave-slide absolute top-3 right-10 flex flex-col gap-1.5 items-center opacity-70">
            <span className="w-12 h-0.5 rounded-full bg-amber-100/70" />
            <span className="w-8 h-0.5 rounded-full bg-sky-200/60" />
            <span className="w-16 h-0.5 rounded-full bg-cyan-300/45" />
          </div>
          <div className="room-wave-slide absolute bottom-1 inset-x-4 flex justify-between opacity-65">
            <span className="w-20 h-1 rounded-full bg-cyan-400/40" />
            <span className="w-24 h-1 rounded-full bg-sky-300/35" />
            <span className="w-18 h-1 rounded-full bg-cyan-400/40" />
          </div>
        </div>

        {/* Silhouette Night Palm Trees */}
        <svg viewBox="0 0 80 120" className="room-gentle-sway absolute bottom-[43%] left-2 w-16 sm:w-20 h-28 sm:h-32 opacity-85">
          <path d="M22,120 Q28,75 40,36" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M40,36 Q18,22 6,34 Q22,34 40,36 Z" fill="#0f172a" />
          <path d="M40,36 Q24,10 14,14 Q28,22 40,36 Z" fill="#1e293b" />
          <path d="M40,36 Q56,12 68,20 Q54,26 40,36 Z" fill="#1e293b" />
          <path d="M40,36 Q64,28 74,44 Q56,38 40,36 Z" fill="#0f172a" />
        </svg>
        <div className="absolute bottom-[16%] right-[22%] w-2 h-2 rounded-full bg-cyan-300/50 blur-[1px]" />
        <div className="absolute bottom-[24%] left-[24%] w-1.5 h-1.5 rounded-full bg-indigo-300/50" />
      </div>
    );
  }

  if (themeId === 'cyber-matrix') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Cyber Grid Wall & Perspective Matrix Floor */}
        <div className="absolute inset-x-0 top-0 h-[55%] bg-[linear-gradient(to_right,rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.1)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(to_right,rgba(52,211,153,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(52,211,153,0.18)_1px,transparent_1px)] [background-size:28px_18px]" />

        {/* Server Monolith Skyline at Horizon */}
        <div className="absolute bottom-[45%] inset-x-0 flex items-end justify-between px-4 opacity-75">
          {[16, 26, 12, 22, 14, 28, 18, 24].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h * 3}px` }}
              className="w-7 sm:w-9 bg-slate-950/90 border-x border-t border-emerald-500/40 rounded-t-sm flex flex-col justify-evenly px-1.5"
            >
              <span className="h-0.5 bg-emerald-400/70 rounded" />
              <span className="h-0.5 bg-cyan-400/55 rounded" />
              <span className="h-0.5 bg-emerald-400/45 rounded" />
            </div>
          ))}
        </div>

        {/* Central Holo-Core Ring */}
        <div className="room-float-bob absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border border-emerald-400/40 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.22)]">
          <div className="w-14 h-14 rotate-45 border border-cyan-400/45" />
        </div>

        {/* Hex Nodes */}
        <span className="absolute top-6 left-8 font-mono text-[9px] text-emerald-300/45">0x4F 0xA2</span>
        <span className="absolute top-8 right-10 font-mono text-[9px] text-cyan-300/45">SYS://DIGI</span>
      </div>
    );
  }

  if (themeId === 'primary-village') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Cheerful Sunbeams & Rolling Hills */}
        <div className="absolute -top-6 left-1/3 w-36 h-44 bg-gradient-to-b from-amber-100/35 to-transparent rotate-12" />
        <svg viewBox="0 0 400 75" preserveAspectRatio="none" className="absolute bottom-[45%] inset-x-0 w-full h-16">
          <path d="M0,75 Q90,18 200,55 T400,45 L400,75 Z" fill="#86efac" opacity="0.55" />
          <path d="M0,75 Q140,32 270,58 T400,52 L400,75 Z" fill="#4ade80" opacity="0.45" />
        </svg>

        {/* Nursery White Picket Fence */}
        <div className="absolute bottom-[45%] inset-x-0 h-6 flex items-end justify-around px-2 opacity-80">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-2.5 h-6 bg-white/85 rounded-t-full border border-emerald-200/70 shadow-xs" />
          ))}
        </div>

        {/* Incubating Digi-Egg Cradles */}
        <div className="room-float-bob absolute bottom-[47%] left-8 sm:left-14 flex items-end gap-3">
          <div className="relative flex flex-col items-center">
            <div className="w-7 h-9 rounded-full bg-gradient-to-b from-white to-sky-100 border-2 border-sky-300 flex items-center justify-center shadow-sm">
              <span className="w-2 h-2 rounded-full bg-pink-400/80" />
            </div>
            <div className="w-9 h-3 -mt-1.5 rounded-b-lg bg-amber-200 border border-amber-400/70" />
          </div>
          <div className="relative flex flex-col items-center">
            <div className="w-6 h-8 rounded-full bg-gradient-to-b from-amber-50 to-pink-100 border-2 border-pink-300 flex items-center justify-center shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
            </div>
            <div className="w-8 h-2.5 -mt-1.5 rounded-b-lg bg-purple-200 border border-purple-400/70" />
          </div>
        </div>

        {/* Pastel Toy Blocks on Right */}
        <div className="absolute bottom-[46%] right-8 sm:right-14 flex items-end gap-1 opacity-90">
          <div className="w-7 h-7 rounded bg-pink-300 border-2 border-pink-400 flex items-center justify-center font-pixel text-[8px] text-white shadow-sm">
            D
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded bg-amber-300 border-2 border-amber-400 flex items-center justify-center font-pixel text-[8px] text-amber-900 shadow-sm">
              ★
            </div>
            <div className="w-7 h-7 rounded bg-sky-300 border-2 border-sky-400 flex items-center justify-center font-pixel text-[8px] text-white shadow-sm">
              1
            </div>
          </div>
        </div>

        {/* Scattered Nursery Flowers */}
        <div className="absolute bottom-[16%] left-[12%] text-xs opacity-80">🌼</div>
        <div className="absolute bottom-[26%] right-[14%] text-xs opacity-80">🌷</div>
      </div>
    );
  }

  if (themeId === 'colosseum-arena') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Sweeping Stadium Floodlight Cones */}
        <div className="absolute -top-8 left-[10%] w-28 h-52 bg-gradient-to-b from-cyan-300/20 via-sky-200/8 to-transparent rotate-[18deg] blur-sm" />
        <div className="absolute -top-8 right-[10%] w-28 h-52 bg-gradient-to-b from-amber-300/20 via-amber-200/8 to-transparent -rotate-[18deg] blur-sm" />

        {/* Central Colosseum Crest & Scoreboard */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-slate-950/80 border border-indigo-400/45 flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="font-pixel text-[8px] tracking-widest text-amber-300">DIGI-COLOSSEUM</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
        </div>

        {/* Championship Banners */}
        <div className="absolute top-0 left-5 w-8 h-24 bg-gradient-to-b from-indigo-600/65 to-indigo-900/20 border-x border-amber-300/35 [clip-path:polygon(0_0,100%_0,100%_82%,50%_100%,0_82%)]" />
        <div className="absolute top-0 right-5 w-8 h-24 bg-gradient-to-b from-rose-600/65 to-rose-900/20 border-x border-amber-300/35 [clip-path:polygon(0_0,100%_0,100%_82%,50%_100%,0_82%)]" />

        {/* Tiered Stadium Bleachers */}
        <div className="absolute bottom-[45%] inset-x-0 h-16 flex flex-col justify-end opacity-65">
          <div className="h-4 mx-6 bg-slate-900/80 border-t border-indigo-400/25 rounded-t-lg" />
          <div className="h-5 mx-2 bg-slate-900/90 border-t border-indigo-400/35" />
          <div className="h-5 bg-slate-950/90 border-t border-cyan-400/35" />
        </div>

        {/* Illuminated Arena Battle Ring on Floor */}
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[78%] h-20 rounded-full border-2 border-indigo-400/40 bg-indigo-500/5 shadow-[inset_0_0_24px_rgba(99,102,241,0.18)]" />
        <div className="absolute bottom-[17%] left-1/2 -translate-x-1/2 w-[48%] h-12 rounded-full border border-amber-300/30" />
      </div>
    );
  }

  if (themeId === 'ancient-temple') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Diagonal Jungle Sunbeams */}
        <div className="absolute -top-6 left-1/4 w-28 h-full bg-gradient-to-b from-amber-200/25 via-amber-100/8 to-transparent -skew-x-12" />
        <div className="absolute -top-6 right-1/3 w-20 h-full bg-gradient-to-b from-emerald-200/15 via-amber-100/5 to-transparent -skew-x-12" />

        {/* Central Ancient Digi-Arch & Pedestal */}
        <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 w-40 h-28 border-t-8 border-x-8 border-stone-700/65 rounded-t-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-300/40 bg-cyan-400/10 flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.25)]">
            <span className="font-pixel text-[10px] text-cyan-200/65">◈</span>
          </div>
        </div>

        {/* Carved Stone Pillars with Glowing Digi-Code Runes */}
        <div className="absolute top-0 left-5 w-9 h-[56%] bg-stone-700/65 border-x border-emerald-400/30 flex flex-col items-center justify-center gap-3">
          <span className="w-3 h-3 rotate-45 border border-cyan-300/65 bg-cyan-400/20" />
          <span className="w-3 h-3 rounded-full border border-emerald-300/65 bg-emerald-400/20" />
          <span className="w-3 h-3 rotate-45 border border-cyan-300/65 bg-cyan-400/20" />
        </div>
        <div className="absolute top-0 right-5 w-9 h-[56%] bg-stone-700/65 border-x border-emerald-400/30 flex flex-col items-center justify-center gap-3">
          <span className="w-3 h-3 rotate-45 border border-cyan-300/65 bg-cyan-400/20" />
          <span className="w-3 h-3 rounded-full border border-emerald-300/65 bg-emerald-400/20" />
          <span className="w-3 h-3 rotate-45 border border-cyan-300/65 bg-cyan-400/20" />
        </div>

        {/* Hanging Jungle Vines */}
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute top-0 inset-x-0 w-full h-14 opacity-75">
          <path d="M0,0 Q35,38 75,18 Q115,44 165,12" stroke="#15803d" strokeWidth="4" fill="none" />
          <path d="M235,8 Q285,42 325,18 Q365,36 400,10" stroke="#166534" strokeWidth="4" fill="none" />
          <circle cx="52" cy="26" r="5" fill="#22c55e" />
          <circle cx="122" cy="30" r="5" fill="#16a34a" />
          <circle cx="290" cy="28" r="5" fill="#22c55e" />
          <circle cx="355" cy="22" r="5" fill="#16a34a" />
        </svg>

        {/* Mossy Flagstone Floor Seams */}
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(to_right,rgba(16,185,129,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.22)_1px,transparent_1px)] [background-size:48px_24px]" />
      </div>
    );
  }

  if (themeId === 'neon-arcade') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Synth-Wave Horizon Grid & Retro Sunset */}
        <div className="absolute inset-x-0 top-0 h-[55%] bg-[linear-gradient(to_right,rgba(34,211,238,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(232,121,249,0.09)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 w-32 h-16 rounded-t-full bg-gradient-to-b from-amber-400/65 via-fuchsia-500/55 to-purple-700/45 overflow-hidden shadow-[0_0_24px_rgba(232,121,249,0.45)]">
          <div className="mt-4 h-1 bg-slate-950/70" />
          <div className="mt-2 h-1.5 bg-slate-950/70" />
          <div className="mt-2 h-2 bg-slate-950/70" />
        </div>

        {/* Neon Dojo Header Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-56 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 opacity-85 shadow-[0_0_16px_rgba(232,121,249,0.85)]" />

        {/* Arcade Cabinet & Dojo Holo-Screen Silhouettes */}
        <div className="absolute bottom-[45%] left-5 w-11 h-24 bg-slate-950/85 border border-cyan-400/50 rounded-t-md p-1 flex flex-col gap-1">
          <div className="h-8 bg-cyan-500/25 border border-cyan-300/60 rounded-xs" />
          <div className="h-1 bg-fuchsia-400/70 rounded" />
        </div>
        <div className="absolute bottom-[45%] right-5 w-11 h-24 bg-slate-950/85 border border-fuchsia-400/50 rounded-t-md p-1 flex flex-col gap-1">
          <div className="h-8 bg-fuchsia-500/25 border border-fuchsia-300/60 rounded-xs" />
          <div className="h-1 bg-cyan-400/70 rounded" />
        </div>

        {/* Neon Synth Floor Grid */}
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(to_right,rgba(232,121,249,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.16)_1px,transparent_1px)] [background-size:30px_16px]" />
      </div>
    );
  }

  if (themeId === 'celestial-sky') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Sacred Sun Ring & Prismatic Sky Beams */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-2 border-amber-200/60 shadow-[0_0_32px_rgba(253,224,71,0.4)] flex items-center justify-center">
          <div className="w-22 h-22 rounded-full border border-white/50" />
        </div>
        <div className="absolute top-0 left-1/3 w-24 h-full bg-gradient-to-b from-white/25 via-amber-100/10 to-transparent rotate-12" />

        {/* Marble Sky-Citadel Pillars */}
        <div className="absolute bottom-[45%] left-6 w-7 h-28 bg-gradient-to-b from-white/65 to-amber-100/45 border-x border-amber-200/70 rounded-t-sm" />
        <div className="absolute bottom-[45%] right-6 w-7 h-28 bg-gradient-to-b from-white/65 to-amber-100/45 border-x border-amber-200/70 rounded-t-sm" />

        {/* Billowing Horizon Clouds */}
        <div className="room-slow-drift absolute bottom-[42%] left-0 right-0 flex justify-around items-end opacity-85">
          <div className="w-28 h-9 rounded-full bg-white/75 blur-[1px]" />
          <div className="w-36 h-11 rounded-full bg-amber-50/80 blur-[1px]" />
          <div className="w-28 h-9 rounded-full bg-white/75 blur-[1px]" />
        </div>
        <div className="room-slow-drift absolute top-7 left-10 w-24 h-8 rounded-full bg-white/60 blur-[1px]" />
        <div className="room-slow-drift absolute top-11 right-12 w-28 h-9 rounded-full bg-amber-50/55 blur-[1px]" style={{ animationDelay: '-4s' }} />
      </div>
    );
  }

  if (themeId === 'sovereign-throne') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Molten Gold Gothic Arch & Sovereign Crest */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 h-[56%] border-x-2 border-amber-400/45 bg-gradient-to-b from-amber-500/15 to-transparent rounded-t-full" />
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-3xl opacity-55 drop-shadow-[0_0_12px_rgba(251,191,36,0.65)]">👑</span>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400/75 to-transparent mt-1" />
        </div>

        {/* Crimson Royal Banners & Golden Wall Sconces */}
        <div className="absolute top-0 left-6 w-9 h-28 bg-gradient-to-b from-rose-700/80 to-rose-950/60 border-x border-amber-400/55 [clip-path:polygon(0_0,100%_0,100%_85%,50%_100%,0_85%)] flex justify-center pt-4">
          <span className="text-amber-300/75 text-xs">✦</span>
        </div>
        <div className="absolute top-0 right-6 w-9 h-28 bg-gradient-to-b from-rose-700/80 to-rose-950/60 border-x border-amber-400/55 [clip-path:polygon(0_0,100%_0,100%_85%,50%_100%,0_85%)] flex justify-center pt-4">
          <span className="text-amber-300/75 text-xs">✦</span>
        </div>
        <div className="absolute bottom-[49%] left-20 w-3 h-5 rounded-t-full bg-amber-300/85 shadow-[0_0_14px_rgba(251,191,36,0.9)] animate-pulse" />
        <div className="absolute bottom-[49%] right-20 w-3 h-5 rounded-t-full bg-amber-300/85 shadow-[0_0_14px_rgba(251,191,36,0.9)] animate-pulse" />

        {/* Imperial Red & Gold Throne Carpet */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-[45%] bg-gradient-to-b from-rose-800/70 to-rose-950/85 border-x-2 border-amber-400/55" />
      </div>
    );
  }

  if (themeId === 'infinity-nexus') {
    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Cosmic Nebula & Rotating Astral Digi-Code Rings */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(192,132,252,0.3),transparent_62%)]" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border border-fuchsia-400/40 animate-pulse flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border border-cyan-400/45 rotate-45" />
        </div>

        {/* Floating Crystal Data Monoliths */}
        <div className="room-float-bob absolute bottom-[48%] left-10 w-6 h-14 bg-gradient-to-b from-cyan-300/55 to-fuchsia-500/40 border border-cyan-200/60 [clip-path:polygon(50%_0,100%_25%,85%_100%,15%_100%,0_25%)]" />
        <div className="room-float-bob absolute bottom-[50%] right-10 w-7 h-16 bg-gradient-to-b from-fuchsia-300/55 to-indigo-500/40 border border-fuchsia-200/60 [clip-path:polygon(50%_0,100%_25%,85%_100%,15%_100%,0_25%)]" style={{ animationDelay: '-1.8s' }} />

        {/* Astral Horizon Starlight Grid */}
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(to_right,rgba(192,132,252,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.14)_1px,transparent_1px)] [background-size:32px_18px]" />
      </div>
    );
  }

  return null;
};

const RoomThemeStageLayer: React.FC<{
  theme: (typeof ROOM_THEMES)[number];
  className?: string;
}> = ({ theme, className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    {/* Room Sky / Wall Background */}
    <div className={`absolute inset-0 bg-gradient-to-b ${theme.skyColor} opacity-90`} />
    {/* Room Floor */}
    <div
      className={`absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t ${theme.floorColor} border-t-2 border-black/20 shadow-inner`}
    />
    {/* Detailed Theme-Accurate Scenery */}
    <ThemeBackdropDecor themeId={theme.id} />
  </div>
);

export const DigiRoom: React.FC<DigiRoomProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onBuyFurniture,
  onPlaceFurniture,
  onRemoveFurniture,
  onUpdateFurniturePosition,
  onChangeTheme,
  weather,
  onChangeWeather,
  isNightTime = false,
  dayNightPref = 'auto',
  onCycleDayNight,
  onOpenTamerRank,
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'shop' | 'themes'>('room');
  const [interactMsg, setInteractMsg] = useState<string | null>(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [outgoingThemeId, setOutgoingThemeId] = useState<string | null>(null);
  const [themeTransitionEpoch, setThemeTransitionEpoch] = useState<number>(0);
  const prevThemeIdRef = useRef<string>(pet.activeRoomTheme);
  const lastViewedThemeRef = useRef<string>(pet.activeRoomTheme);

  const [digimonPos, setDigimonPos] = useState<number>(45);
  const [digimonFacing, setDigimonFacing] = useState<'left' | 'right'>('right');
  const [digimonAction, setDigimonAction] = useState<'walk' | 'idle' | 'happy' | 'sit' | 'sleep'>('idle');
  const roomContainerRef = useRef<HTMLDivElement>(null);

  // Trigger smooth cross-fade + digital wipe when theme changes (or upon returning to VIEW ROOM after picking a theme)
  useEffect(() => {
    if (!isOpen) {
      prevThemeIdRef.current = pet.activeRoomTheme;
      lastViewedThemeRef.current = pet.activeRoomTheme;
      setOutgoingThemeId(null);
      return;
    }

    if (activeTab === 'room') {
      const fromTheme =
        prevThemeIdRef.current !== pet.activeRoomTheme
          ? prevThemeIdRef.current
          : lastViewedThemeRef.current !== pet.activeRoomTheme
          ? lastViewedThemeRef.current
          : null;

      prevThemeIdRef.current = pet.activeRoomTheme;
      lastViewedThemeRef.current = pet.activeRoomTheme;

      if (fromTheme) {
        setOutgoingThemeId(fromTheme);
        setThemeTransitionEpoch((e) => e + 1);
        const timer = window.setTimeout(() => {
          setOutgoingThemeId(null);
        }, 600);
        return () => window.clearTimeout(timer);
      }
    } else {
      prevThemeIdRef.current = pet.activeRoomTheme;
    }
  }, [isOpen, activeTab, pet.activeRoomTheme]);

  useEffect(() => {
    if (!isOpen) return;

    if (pet.isSleeping) {
      setDigimonAction('sleep');
      return;
    }

    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.55) {
        const target = Math.floor(Math.random() * 65 + 18);
        setDigimonFacing(target > digimonPos ? 'right' : 'left');
        setDigimonAction('walk');
        setDigimonPos(target);

        setTimeout(() => {
          setDigimonAction(Math.random() > 0.4 ? 'idle' : 'sit');
        }, 2200);
      } else if (rand < 0.85) {
        setDigimonAction(Math.random() > 0.5 ? 'idle' : 'sit');
        setDigimonFacing(Math.random() > 0.5 ? 'left' : 'right');
      } else {
        setDigimonAction('happy');
        setTimeout(() => setDigimonAction('idle'), 1600);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, pet.isSleeping, digimonPos]);

  if (!isOpen) return null;

  const rankProgress = computeTamerRankProgress(pet);
  const currentTheme = ROOM_THEMES.find((t) => t.id === pet.activeRoomTheme) || ROOM_THEMES[0];
  const outgoingTheme = outgoingThemeId
    ? ROOM_THEMES.find((t) => t.id === outgoingThemeId) || null
    : null;
  const unlockedThemes = ROOM_THEMES.filter((t) => rankProgress.rank >= (t.minTamerRank ?? 1));
  const stepTheme = (delta: -1 | 1) => {
    if (unlockedThemes.length <= 1) return;
    sound.playButton();
    const curIdx = Math.max(
      0,
      unlockedThemes.findIndex((t) => t.id === currentTheme.id)
    );
    const nextIdx = (curIdx + delta + unlockedThemes.length) % unlockedThemes.length;
    onChangeTheme(unlockedThemes[nextIdx].id);
  };
  const activeWeather: RoomWeatherTheme = normalizeRoomWeather(weather ?? pet.roomWeather);
  const activeWeatherSpec = getRoomWeatherSpec(activeWeather);
  const handleSelectWeather = (nextWeather: RoomWeatherTheme) => {
    sound.playButton();
    onChangeWeather?.(nextWeather);
    const nextSpec = getRoomWeatherSpec(nextWeather);
    setInteractMsg(`${nextSpec.icon} ${nextSpec.label} Weather: ${nextSpec.trainingEffectLabel}`);
    setTimeout(() => setInteractMsg(null), 2800);
  };
  const cycleWeather = () => {
    const idx = ROOM_WEATHER_ORDER.indexOf(activeWeather);
    const nextWeather = ROOM_WEATHER_ORDER[(idx + 1) % ROOM_WEATHER_ORDER.length];
    handleSelectWeather(nextWeather);
  };

  const handleFurnitureClick = (item: FurnitureItem, instanceId: string) => {
    sound.playButton();
    setSelectedFurnitureId((prev) => (prev === instanceId ? null : instanceId));
    const effect = item.interactEffect || `Your Digimon interacts with the ${item.name}!`;
    setInteractMsg(effect);
    setTimeout(() => setInteractMsg(null), 3000);
  };

  const handleBuy = (item: FurnitureItem) => {
    const reqRank = item.minTamerRank ?? 1;
    if (rankProgress.rank < reqRank) {
      sound.playAlert();
      return;
    }
    if (pet.digiBits < item.price) {
      sound.playAlert();
      return;
    }
    sound.playMedicine();
    onBuyFurniture(item);

    const defaultSlots = [
      { x: 20, y: 72 },
      { x: 38, y: 76 },
      { x: 58, y: 70 },
      { x: 78, y: 76 },
      { x: 28, y: 56 },
      { x: 70, y: 56 },
      { x: 48, y: 80 },
    ];
    const slot = defaultSlots[pet.placedFurniture.length % defaultSlots.length];
    onPlaceFurniture(item.id, slot.x, slot.y);
  };

  const handleDigimonPet = () => {
    sound.playHappy();
    setDigimonAction('happy');
    setInteractMsg(`❤ ${pet.nickname || species?.name} feels loved and happy!`);
    setTimeout(() => {
      setInteractMsg(null);
      setDigimonAction('idle');
    }, 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/95 android-safe-modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Home className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-chakra font-bold text-white text-lg truncate">
                "MY ROOM" HABITAT &amp; DECOR
              </h3>
              <p className="text-slate-400 text-xs truncate">
                Interactive sanctuary · Unlock themes &amp; decor by raising Tamer Rank
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={cycleWeather}
              className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-full font-pixel text-[9px] border cursor-pointer transition-colors whitespace-nowrap shrink-0 ${activeWeatherSpec.badgeClasses}`}
              title="Toggle Room Weather (Sunny / Rainy / Snowy)"
            >
              {activeWeather === 'sunny' ? (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              ) : activeWeather === 'rainy' ? (
                <CloudRain className="w-3.5 h-3.5 text-sky-300" />
              ) : (
                <Snowflake className="w-3.5 h-3.5 text-cyan-200" />
              )}
              <span>
                {activeWeatherSpec.icon} {activeWeatherSpec.shortLabel}
              </span>
            </button>
            {onCycleDayNight && (
              <button
                onClick={() => {
                  sound.playButton();
                  onCycleDayNight();
                }}
                className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-full font-pixel text-[9px] border cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  isNightTime
                    ? 'bg-indigo-950/90 border-indigo-400/60 text-indigo-200 hover:bg-indigo-900'
                    : 'bg-amber-950/60 border-amber-400/50 text-amber-200 hover:bg-amber-900/60'
                }`}
                title="Cycle Day/Night Lighting (Auto / Night / Day)"
              >
                {isNightTime ? <Moon className="w-3.5 h-3.5 text-indigo-300" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
                <span>
                  {dayNightPref === 'auto'
                    ? isNightTime
                      ? 'AUTO: NIGHT'
                      : 'AUTO: DAY'
                    : dayNightPref === 'night'
                    ? 'NIGHT'
                    : 'DAY'}
                </span>
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-full font-pixel text-xs text-amber-300 border border-slate-700 whitespace-nowrap shrink-0 tabular-nums">
              <span>🪙</span>
              <span>{pet.digiBits}</span>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close Room"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation + Tamer Rank Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 mb-2">
          <div className="flex items-center gap-2 font-pixel text-xs">
            <button
              onClick={() => setActiveTab('room')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'room'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              VIEW ROOM
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              FURNITURE SHOP
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'themes'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ROOM THEMES
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!onOpenTamerRank) return;
              sound.playButton();
              onClose();
              onOpenTamerRank();
            }}
            className={`px-2.5 py-1.5 rounded-xl border ${rankProgress.currentTier.borderClass} ${rankProgress.currentTier.bgClass} font-pixel text-[9px] flex items-center gap-1.5 whitespace-nowrap ${
              onOpenTamerRank ? 'cursor-pointer hover:brightness-110' : 'cursor-default'
            }`}
          >
            <span>{rankProgress.badge}</span>
            <span className={rankProgress.currentTier.accentClass}>
              RANK {rankProgress.rank} · {rankProgress.title.toUpperCase()}
            </span>
            {onOpenTamerRank && <Award className="w-3 h-3 text-amber-300" />}
          </button>
        </div>

        {/* TAB 1: THE VIRTUAL ROOM */}
        {activeTab === 'room' && (
          <div
            ref={roomContainerRef}
            className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border-2 border-slate-700 select-none flex flex-col justify-between bg-slate-950"
          >
            {/* Outgoing Theme Layer (cross-fades out underneath incoming wipe) */}
            {outgoingTheme && outgoingTheme.id !== currentTheme.id && (
              <RoomThemeStageLayer
                key={`outgoing-${outgoingTheme.id}-${themeTransitionEpoch}`}
                theme={outgoingTheme}
                className="room-theme-fade-exit z-0"
              />
            )}

            {/* Incoming / Active Theme Layer (digital wipe reveal on theme change) */}
            <RoomThemeStageLayer
              key={`active-${currentTheme.id}-${themeTransitionEpoch}`}
              theme={currentTheme}
              className={themeTransitionEpoch > 0 ? 'room-theme-wipe-enter z-[1]' : 'z-[1]'}
            />

            {/* Digital Wipe Scanline Beam */}
            {outgoingTheme && themeTransitionEpoch > 0 && (
              <div
                key={`scan-${themeTransitionEpoch}`}
                aria-hidden="true"
                className="room-scan-sweep-bar absolute inset-y-0 left-0 w-10 pointer-events-none z-[12] bg-gradient-to-r from-transparent via-cyan-300/65 to-transparent shadow-[0_0_24px_rgba(34,211,238,0.85)]"
              />
            )}

            {/* Evening Starlight & Ambient Dimmer Overlay */}
            {(isNightTime || currentTheme.id === 'starlit-island' || currentTheme.id === 'infinity-nexus') && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute inset-0 bg-slate-950/30" />
                <div className="absolute top-6 right-10 w-8 h-8 rounded-full bg-amber-100/90 shadow-[0_0_24px_rgba(253,230,138,0.65)]">
                  <div className="w-6 h-6 rounded-full bg-indigo-950/95 translate-x-2 -translate-y-0.5" />
                </div>
                <div className="absolute top-8 left-12 w-1.5 h-1.5 rounded-full bg-amber-100/80 animate-pulse" />
                <div className="absolute top-14 left-36 w-1 h-1 rounded-full bg-sky-100/75" />
                <div className="absolute top-10 left-1/2 w-1.5 h-1.5 rounded-full bg-indigo-100/80 animate-pulse" />
                <div className="absolute top-16 right-28 w-1 h-1 rounded-full bg-amber-100/70" />
              </div>
            )}

            {/* Weather System Atmospheric Overlay (Sunny / Rainy / Snowy) */}
            <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
              {activeWeather === 'sunny' && (
                <>
                  {/* Warm Sunlit Ambience + Sunbeam Shafts */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300/18 via-transparent to-amber-500/10" />
                  <div className="absolute -top-8 -left-6 w-36 h-36 rounded-full bg-amber-200/35 blur-2xl animate-pulse" />
                  <div className="absolute -top-6 left-[18%] w-24 h-[120%] bg-gradient-to-b from-amber-200/24 via-amber-100/8 to-transparent -skew-x-12" />
                  <div className="absolute -top-6 left-[46%] w-16 h-[120%] bg-gradient-to-b from-yellow-100/18 via-amber-100/5 to-transparent -skew-x-12" />
                  <div className="absolute -top-6 right-[16%] w-20 h-[120%] bg-gradient-to-b from-amber-200/16 via-transparent to-transparent -skew-x-12" />
                  {WEATHER_PARTICLES.slice(0, 14).map((p) => (
                    <motion.div
                      key={`sun-mote-${p.id}`}
                      initial={{ y: 240 + (p.id % 5) * 28, x: 0, opacity: 0.1 }}
                      animate={{
                        y: [220 + (p.id % 5) * 25, 110 + (p.id % 4) * 30, 60 + (p.id % 3) * 30],
                        x: [0, p.drift * 0.7, p.drift * 0.2],
                        opacity: [0.15, 0.85, 0.15],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: Number(p.duration) * 1.9,
                        delay: Number(p.delay),
                        ease: 'easeInOut',
                      }}
                      style={{ left: `${p.left}%` }}
                      className="absolute top-0 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(253,224,71,0.9)]"
                    />
                  ))}
                </>
              )}

              {activeWeather === 'rainy' && (
                <>
                  {/* Overcast Storm Tint & Mist */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/38 via-sky-950/28 to-slate-950/32" />
                  <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-slate-900/45 to-transparent" />
                  {WEATHER_PARTICLES.map((p) => (
                    <motion.div
                      key={`rain-${p.id}`}
                      initial={{ y: -28, x: 0, opacity: 0.75 }}
                      animate={{ y: 455, x: -32, opacity: [0.3, 0.85, 0.25] }}
                      transition={{
                        repeat: Infinity,
                        duration: Number(p.duration) * 0.4,
                        delay: Number(p.delay) * 0.32,
                        ease: 'linear',
                      }}
                      style={{ left: `${p.left}%` }}
                      className={`absolute top-0 w-[1.5px] rounded-full bg-gradient-to-b from-sky-200/15 via-sky-300/85 to-cyan-100 ${
                        p.size === 'lg' ? 'h-5' : p.size === 'md' ? 'h-4' : 'h-3'
                      }`}
                    />
                  ))}
                  {RAIN_SPLASHES.map((splash) => (
                    <motion.div
                      key={`splash-${splash.id}`}
                      initial={{ scale: 0.2, opacity: 0.8 }}
                      animate={{ scale: [0.2, 1.4], opacity: [0.8, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.15,
                        delay: parseFloat(splash.delay),
                        ease: 'easeOut',
                      }}
                      style={{ left: splash.left, bottom: splash.bottom }}
                      className="absolute w-5 h-2 rounded-full border border-sky-200/70"
                    />
                  ))}
                </>
              )}

              {activeWeather === 'snowy' && (
                <>
                  {/* Frost Vignette & Winter Chill */}
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-100/14 via-cyan-100/8 to-white/15 shadow-[inset_0_0_28px_rgba(186,230,253,0.32)]" />
                  {WEATHER_PARTICLES.map((p) => (
                    <motion.div
                      key={`snow-${p.id}`}
                      initial={{ y: -20, x: 0, opacity: 0.85 }}
                      animate={{
                        y: 440,
                        x: [0, p.drift, -p.drift * 0.6, p.drift * 0.4],
                        opacity: [0.35, 0.95, 0.85, 0.2],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: Number(p.duration) * 1.45,
                        delay: Number(p.delay),
                        ease: 'linear',
                      }}
                      style={{ left: `${p.left}%` }}
                      className={`absolute top-0 rounded-full bg-white/95 shadow-[0_0_6px_rgba(224,242,254,0.9)] ${
                        p.size === 'lg'
                          ? 'w-2.5 h-2.5'
                          : p.size === 'md'
                          ? 'w-2 h-2'
                          : 'w-1.5 h-1.5 opacity-80'
                      }`}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Hint Overlay */}
            <div className="hidden sm:flex absolute top-2.5 left-2.5 z-30 bg-slate-950/75 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-pixel text-slate-300 border border-slate-700 items-center gap-1.5 pointer-events-none">
              <span>💡</span>
              <span>Drag furniture • Tap Digimon to cheer</span>
            </div>

            {/* Interactive Weather System Overlay Segmented Toggle */}
            <div
              className="absolute top-2.5 right-2.5 z-30 bg-slate-950/80 backdrop-blur-sm p-1 rounded-xl border border-slate-700/90 flex items-center gap-1 shadow-lg"
              role="group"
              aria-label="Room Weather Theme"
            >
              {ROOM_WEATHER_ORDER.map((wId) => {
                const spec = ROOM_WEATHER_SPECS[wId];
                const isActive = activeWeather === wId;
                return (
                  <button
                    key={wId}
                    type="button"
                    onClick={() => handleSelectWeather(wId)}
                    title={`${spec.label}: ${spec.happinessEffectLabel} | ${spec.trainingEffectLabel}`}
                    className={`px-2 py-1 rounded-lg font-chakra text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? spec.activeButtonClasses
                        : 'bg-slate-900/85 border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{spec.icon}</span>
                    <span>{spec.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Message Banner */}
            <AnimatePresence>
              {interactMsg && (
                <motion.div
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  className="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-emerald-400 text-emerald-300 font-pixel text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full shadow-lg whitespace-nowrap max-w-[92%] truncate"
                >
                  {interactMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Placed Furniture Items */}
            {pet.placedFurniture.map((placed) => {
              const item = FURNITURE_SHOP.find((f) => f.id === placed.furnitureId);
              if (!item) return null;
              const isSelected = selectedFurnitureId === placed.instanceId;
              const displaySpec = getRoomFurnitureDisplay(item);
              const depthZIndex = displaySpec.isWallDecor ? 16 : placed.y >= 78 ? 22 : 18;

              return (
                <div
                  key={`${placed.instanceId}-${placed.x}-${placed.y}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${placed.x}%`,
                    top: `${placed.y}%`,
                    zIndex: isSelected ? 25 : depthZIndex,
                  }}
                >
                  <motion.div
                    drag
                    dragMomentum={false}
                    dragConstraints={roomContainerRef}
                    onDragEnd={(_e, info) => {
                      if (roomContainerRef.current && onUpdateFurniturePosition) {
                        const rect = roomContainerRef.current.getBoundingClientRect();
                        const xPercent = Math.min(88, Math.max(12, placed.x + (info.offset.x / rect.width) * 100));
                        const yPercent = Math.min(86, Math.max(28, placed.y + (info.offset.y / rect.height) * 100));
                        onUpdateFurniturePosition(placed.instanceId, Math.round(xPercent), Math.round(yPercent));
                      }
                    }}
                    whileHover={{ scale: 1.06 }}
                    onClick={() => handleFurnitureClick(item, placed.instanceId)}
                    className={`cursor-grab active:cursor-grabbing flex flex-col items-center group touch-none ${
                      isSelected ? 'ring-2 ring-amber-400 rounded-2xl p-1.5 bg-black/25' : ''
                    }`}
                  >
                    <div className="relative flex flex-col items-center pointer-events-none select-none">
                      <div className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] flex items-center justify-center">
                        {item.id === 'meat-grill' ? (
                          <PixelMeatIcon className={displaySpec.meatClass || 'w-7 h-7 sm:w-8 sm:h-8'} />
                        ) : (
                          <span className={displaySpec.emojiClass}>{item.icon}</span>
                        )}
                      </div>
                      <div
                        aria-hidden="true"
                        className={`rounded-full blur-[2px] ${displaySpec.shadowClass}`}
                      />
                    </div>

                    <div
                      className={`flex items-center gap-1 transition-opacity bg-slate-900/95 text-white text-[9px] font-pixel px-2 py-0.5 rounded-full mt-1 border border-slate-700 shadow-lg whitespace-nowrap ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <span>{item.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playAlert();
                          onRemoveFurniture(placed.instanceId);
                        }}
                        title="Remove furniture"
                        className="text-rose-400 hover:text-rose-300 ml-1 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              );
            })}

            {/* Roaming Digimon inside the room */}
            <motion.div
              animate={{ left: `${digimonPos}%` }}
              transition={{ duration: digimonAction === 'walk' ? 2.2 : 0.4, ease: 'easeInOut' }}
              onClick={handleDigimonPet}
              className="absolute bottom-8 -translate-x-1/2 z-20 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <DigimonSprite
                species={species}
                action={pet.isSleeping ? 'sleep' : digimonAction}
                facing={digimonFacing}
                scale={1.1}
                hunger={pet.hunger}
                happiness={pet.happiness}
                showMoodIndicator={!pet.isDead && !pet.isFrozen && pet.stage !== 'egg' && !pet.isSleeping && !pet.isSick}
              />
            </motion.div>

            {/* Bottom Overlay Row: Room Theme Switcher + Active Weather Effects */}
            <div className="absolute bottom-2 inset-x-2 z-30 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
              <div className="pointer-events-auto bg-slate-900/88 backdrop-blur-sm px-2.5 py-1 rounded-xl text-slate-200 font-pixel text-[9px] sm:text-[10px] border border-slate-700 flex items-center gap-1.5">
                {unlockedThemes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => stepTheme(-1)}
                    className="p-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    aria-label="Previous room theme"
                    title="Previous room theme"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                <span>{currentTheme.name}</span>
                {unlockedThemes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => stepTheme(1)}
                    className="p-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    aria-label="Next room theme"
                    title="Next room theme"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div
                className={`pointer-events-auto backdrop-blur-sm px-2.5 py-1 rounded-xl border font-chakra text-[11px] font-semibold flex items-center gap-1.5 bg-slate-950/82 ${activeWeatherSpec.badgeClasses}`}
              >
                <span>{activeWeatherSpec.icon}</span>
                <span className="font-bold">{activeWeatherSpec.label}:</span>
                <span className="truncate max-w-[230px] sm:max-w-none">
                  {activeWeatherSpec.happinessEffectLabel.split('·')[0].trim()} · {activeWeatherSpec.trainingEffectLabel}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FURNITURE SHOP */}
        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 max-h-[380px] overflow-y-auto pr-1">
            {FURNITURE_SHOP.map((item) => {
              const reqRank = item.minTamerRank ?? 1;
              const isUnlocked = rankProgress.rank >= reqRank;
              const reqTier = getTamerRankTier(reqRank);
              const isAffordable = pet.digiBits >= item.price;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isUnlocked
                      ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40'
                      : 'bg-slate-950/55 border-slate-800/80 opacity-85'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-3xl p-2 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-center shrink-0 ${
                        !isUnlocked ? 'grayscale opacity-70' : ''
                      }`}
                    >
                      {item.id === 'meat-grill' ? (
                        <PixelMeatIcon className="w-8 h-8" />
                      ) : (
                        item.icon
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-chakra font-bold text-white text-sm">
                          {item.name}
                        </h4>
                        {reqRank > 1 && (
                          <span
                            className={`font-pixel text-[8px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                              isUnlocked
                                ? `${reqTier.bgClass} ${reqTier.borderClass} ${reqTier.accentClass}`
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            {!isUnlocked && <Lock className="w-2.5 h-2.5" />}
                            <span>RANK {reqRank}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">{item.description}</p>
                      <div className="text-amber-400 font-pixel text-[10px] mt-1 tabular-nums">
                        🪙 {item.price} BITS
                        {!isUnlocked && (
                          <span className="text-slate-400 ml-2">
                            · Requires {reqTier.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <button
                      disabled={!isAffordable}
                      onClick={() => handleBuy(item)}
                      className="min-h-[38px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-pixel text-[10px] px-3 py-2 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-transform cursor-pointer shrink-0"
                    >
                      BUY &amp; PLACE
                    </button>
                  ) : (
                    <div className="min-h-[38px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-pixel text-[9px] flex items-center gap-1 whitespace-nowrap shrink-0">
                      <Lock className="w-3 h-3" />
                      <span>RANK {reqRank}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: THEMES */}
        {activeTab === 'themes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 max-h-[380px] overflow-y-auto pr-1">
            {ROOM_THEMES.map((theme) => {
              const reqRank = theme.minTamerRank ?? 1;
              const isUnlocked = rankProgress.rank >= reqRank;
              const reqTier = getTamerRankTier(reqRank);
              const isSelected = theme.id === pet.activeRoomTheme;

              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => {
                    if (!isUnlocked) {
                      sound.playAlert();
                      setInteractMsg(`🔒 Requires Rank ${reqRank} (${reqTier.title}) to unlock ${theme.name}!`);
                      setTimeout(() => setInteractMsg(null), 2800);
                      return;
                    }
                    sound.playButton();
                    onChangeTheme(theme.id);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer'
                      : isUnlocked
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700 cursor-pointer'
                      : 'bg-slate-950/55 border-slate-800/80 opacity-85 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-chakra font-bold text-white text-base truncate">
                        {theme.name}
                      </h4>
                      {isSelected ? (
                        <div className="text-emerald-400 flex items-center gap-1 font-pixel text-[9px] shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>ACTIVE</span>
                        </div>
                      ) : !isUnlocked ? (
                        <div className="text-amber-300 flex items-center gap-1 font-pixel text-[9px] shrink-0 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          <Lock className="w-3 h-3" />
                          <span>RANK {reqRank}</span>
                        </div>
                      ) : reqRank > 1 ? (
                        <span
                          className={`font-pixel text-[8px] px-1.5 py-0.5 rounded border shrink-0 ${reqTier.bgClass} ${reqTier.borderClass} ${reqTier.accentClass}`}
                        >
                          RANK {reqRank} UNLOCKED
                        </span>
                      ) : null}
                    </div>
                    <p className="text-slate-400 text-xs">{theme.description}</p>
                    {!isUnlocked && (
                      <p className="text-[11px] font-chakra font-semibold text-amber-300 mt-1">
                        Unlocks at Rank {reqRank} · {reqTier.title} ({reqTier.minScore} Tamer Score)
                      </p>
                    )}
                  </div>
                  <div
                    className={`h-8 w-full rounded-xl bg-gradient-to-r ${theme.skyColor} mt-3 border border-black/30 relative overflow-hidden ${
                      !isUnlocked ? 'opacity-55 grayscale-[40%]' : ''
                    }`}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45">
                        <Lock className="w-4 h-4 text-slate-200" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
