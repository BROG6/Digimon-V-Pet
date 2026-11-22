import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { SpecialItemId } from '../types/digimon';

interface PixelGridIconProps {
  grid: string[];
  palette: Record<string, string>;
  className?: string;
  size?: number;
  label?: string;
}

interface RunRect {
  x: number;
  y: number;
  w: number;
  fill: string;
}

export function compileGridRects(grid: string[], palette: Record<string, string>): RunRect[] {
  const rects: RunRect[] = [];
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const fill = palette[ch];
      if (!fill) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) {
        w++;
      }
      rects.push({ x, y, w, fill });
      x += w;
    }
  }
  return rects;
}

export const PixelGridIcon: React.FC<PixelGridIconProps> = ({
  grid,
  palette,
  className = 'w-5 h-5',
  size,
  label,
}) => {
  const rects = useMemo(() => compileGridRects(grid, palette), [grid, palette]);
  const h = grid.length;
  const w = grid[0]?.length || 16;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={`inline-block shrink-0 pixel-art select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rects.map((r, idx) => (
        <rect key={idx} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
};

// ============================================================================
// 1. MEAT (Bone-in roasted caramel pixel meat matching reference shop sprite)
// ============================================================================
const MEAT_PALETTE: Record<string, string> = {
  K: '#160d0a', // Crisp dark pixel outline
  W: '#fff4d8', // Bone cream highlight
  B: '#e6c798', // Bone midtone
  S: '#b99364', // Bone shadow
  H: '#e5a264', // Meat golden highlight
  L: '#cc7f48', // Meat caramel light
  M: '#af5f32', // Meat roast body
  D: '#863f20', // Meat deep shadow
  C: '#5f2812', // Meat grill crease
};

const MEAT_GRID_FULL = [
  '..........KK....',
  '.........KWWK...',
  '.........KWBWKK.',
  '.....KKKKKSBBWWK',
  '....KHHHLLKBBBSK',
  '...KHHLLCMMKSSK.',
  '..KHHLMMMMMDKK..',
  '..KHMMCMDDDDK...',
  '..KLMDDDDDDDK...',
  '..KMDDDDDDDK....',
  '.KKBMDDDDDK.....',
  'KWWWKDDDDK......',
  'KWBBKDDKK.......',
  'KKBSSKK.........',
  '..KWWK..........',
  '...KK...........',
];

const MEAT_GRID_BITE1 = [
  '..........KK....',
  '.........KWWK...',
  '.........KWBWKK.',
  '..........KBBWWK',
  '.......KKKKBBBSK',
  '......KHLLMKSSK.',
  '.......KMMMDKK..',
  '......KKDDDDK...',
  '.....KWWKDDDK...',
  '....KWWBKDDK....',
  '...KWWBKKKK.....',
  'KWWWKBBK........',
  'KWBBKSK.........',
  'KKBSSK..........',
  '..KWWK..........',
  '...KK...........',
];

const MEAT_GRID_BITE2 = [
  '..........KK....',
  '.........KWWK...',
  '.........KWBWKK.',
  '..........KBBWWK',
  '.........KKBBBSK',
  '........KWWKSSK.',
  '.......KWWBKMK..',
  '......KWWBKDK...',
  '.....KWWBKKK....',
  '....KWWBK.......',
  '...KWWBK........',
  'KWWWKBBK........',
  'KWBBKSK.........',
  'KKBSSK..........',
  '..KWWK..........',
  '...KK...........',
];

const MEAT_GRID_BONE = [
  '..........KK....',
  '.........KWWK...',
  '.........KWBWKK.',
  '..........KBBWWK',
  '.........KKBBBSK',
  '........KWWKSSK.',
  '.......KWWBKK...',
  '......KWWBK.....',
  '.....KWWBK......',
  '....KWWBK.......',
  '...KWWBK........',
  'KWWWKBBK........',
  'KWBBKSK.........',
  'KKBSSK..........',
  '..KWWK..........',
  '...KK...........',
];

export const PixelMeatIcon: React.FC<{
  className?: string;
  size?: number;
  biteStage?: 0 | 1 | 2 | 3;
}> = ({ className = 'w-5 h-5', size, biteStage = 0 }) => {
  const grid =
    biteStage === 1
      ? MEAT_GRID_BITE1
      : biteStage === 2
      ? MEAT_GRID_BITE2
      : biteStage === 3
      ? MEAT_GRID_BONE
      : MEAT_GRID_FULL;

  return <PixelGridIcon grid={grid} palette={MEAT_PALETTE} className={className} size={size} label="Meat" />;
};

// ============================================================================
// 2. PILL / VITAMIN (Diagonal red & white glossy capsule matching shop sprite)
// ============================================================================
const VITAMIN_PALETTE: Record<string, string> = {
  K: '#121212', // Crisp black capsule outline & center seam
  G: '#fff7ed', // Specular white-orange highlight
  O: '#fb923c', // Bright orange-red glow
  R: '#ef2d19', // Vibrant red cap
  r: '#b91c1c', // Deep red shading
  d: '#7f1d1d', // Dark crimson underside
  W: '#ffffff', // Pure white top half
  S: '#e2e8f0', // Cool white midtone
  A: '#94a3b8', // Silver-grey shade
  B: '#64748b', // Deep capsule shadow
};

const VITAMIN_GRID = [
  '................',
  '.........KKKK...',
  '.......KKOOGGKK.',
  '......KORRRGGrrK',
  '.....KORRRRRrrdK',
  '....KWKRRRRrrddK',
  '...KWWWKRRRrrddK',
  '..KWWWWWKRRrddK.',
  '.KWWWWWWWKrrddK.',
  '.KWWWWSSSSKrrK..',
  '.KWWWSSSSAAKK...',
  '.KWWSSSAAABK....',
  '..KSSAAAABK.....',
  '..KKAAABKK......',
  '....KKKK........',
  '................',
];

export const PixelVitaminIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = 'w-5 h-5', size }) => (
  <PixelGridIcon grid={VITAMIN_GRID} palette={VITAMIN_PALETTE} className={className} size={size} label="Vitamin Pill" />
);

// ============================================================================
// 3. BADFOOD / BAD MEAT (Diagonal purple rotten meat matching shop sprite)
// ============================================================================
const BAD_MEAT_PALETTE: Record<string, string> = {
  K: '#2b1328', // Deep plum pixel outline
  B: '#e2dea2', // Sickly pale cream-olive bone
  S: '#aba76f', // Bone shadow
  H: '#ad75a3', // Rotten purple highlight
  M: '#864e7c', // Rotten purple meat body
  D: '#613259', // Deep purple underside
};

const BAD_MEAT_GRID = [
  '................',
  '..KK............',
  '.KBBKK.KKKK.....',
  'KBBSSKKHHMMKK...',
  '.KKBSBHHMMMMMK..',
  '...KKHHMMMMMDK..',
  '...KHHMMMMMDDK..',
  '...KHMMMMMDDDK..',
  '....KMMMMDDDK...',
  '....KKDDDDDDK...',
  '.....KKKDDDDK...',
  '.......KKBSBKK..',
  '........KKSBBBK.',
  '..........KBBK..',
  '...........KK...',
  '................',
];

export const PixelBadMeatIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = 'w-5 h-5', size }) => (
  <PixelGridIcon grid={BAD_MEAT_GRID} palette={BAD_MEAT_PALETTE} className={className} size={size} label="Bad Meat" />
);

// ============================================================================
// 4. POOP (Compact golden-tan 2-coil pixel swirl matching reference left poop)
// ============================================================================
const POOP_PALETTE: Record<string, string> = {
  K: '#3b2109', // Crisp dark brown pixel outline
  H: '#f3c16e', // Warm golden highlight
  L: '#d99a44', // Golden-tan body
  M: '#b5752b', // Warm ochre shading
  D: '#865018', // Deep underside shadow
};

const POOP_GRID = [
  '................',
  '................',
  '........KK......',
  '.......KHHK.....',
  '......KHHLLK....',
  '......KHLLMK....',
  '....KKKKLMKKKK..',
  '...KHHHHLLLLMMK.',
  '..KHHLLLLLLMMMDK',
  '..KLLMMMMMMMDDDK',
  '.KKKMMMMMMMMDDKK',
  'KHHHLLLLLLLLMMDK',
  'KHLLLLLMMMMMMMDK',
  'KLLMMMMDDDDDDDDK',
  '.KKKKKKKKKKKKKK.',
  '................',
];

export const PixelPoopIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = 'w-5 h-5', size }) => (
  <PixelGridIcon grid={POOP_GRID} palette={POOP_PALETTE} className={className} size={size} label="Poop" />
);

// ============================================================================
// 5. PUNCHING BAG (Pixel dojo ceiling pulley, chain, and leather bag + dent)
// ============================================================================
const PULLEY_PALETTE: Record<string, string> = {
  K: '#0f172a',
  L: '#94a3b8',
  G: '#64748b',
  D: '#334155',
};

const CEILING_PULLEY_GRID = [
  'KKKKKKKKKKKKKKKKKKKK',
  'KDDDDDDDDDDDDDDDDDDK',
  'KDGGGGGGGGGGGGGGGGDK',
  'KDLKKLGGGGGGGGGLKKDK',
  'KDDDDGGKKKKKKGGDDDDK',
  '.KKKKGKLLLLLLKGKKKK.',
  '......KGGGGGGK......',
  '......KGGKKGGK......',
  '.......KKKKKK.......',
];

const CHAIN_GRID = [
  '........KKKK........',
  '........KLLK........',
  '........KGGK........',
  '........KLLK........',
  '........KGGK........',
  '........KLLK........',
  '........KGGK........',
  '........KLLK........',
  '........KGGK........',
  '........KLLK........',
  '........KGGK........',
  '........KLLK........',
  '........KGGK........',
  '........KLLK........',
  '........KGGK........',
  '........KLLK........',
];

const BAG_PALETTE: Record<string, string> = {
  K: '#1d0e07', // Crisp dark outline
  H: '#c97347', // Warm leather highlight
  M: '#9c4e2b', // Leather brown body
  S: '#753419', // Shaded leather side
  D: '#4e200d', // Underside shadow
  R: '#ea580c', // Top ring mount
  r: '#9a3412', // Ring dark shade
};

const BAG_NORMAL_GRID = [
  '........KRRK........',
  '.......KRrrRK.......',
  '....KKKKKKKKKKKK....',
  '...KHHHHHHHHMMMMK...',
  '..KHMMMMMHHHHMMMMK..',
  '..KMMSSSSSSSSSMMMK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KMMSSSSSSSSSSDDK..',
  '..KSSDDDDDDDDDDDDK..',
  '...KKKKKKKKKKKKKK...',
];

const BAG_DENTED_GRID = [
  '........KRRK........',
  '.......KRrrRK.......',
  '....KKKKKKKKKKKK....',
  '...KHHHHHHHHMMMMK...',
  '..KHMMMMMHHHHMMMMK..',
  '..KMMSSSSSSSSSMMMK..',
  '..KHHMMMMMMMMMMSSK..',
  '...KHHMMMMMMMMMMSK..',
  '....KHHMMMMMMMMMSSK.',
  '.....KHHMMMMMMMMSSK.',
  '......KHHMMMMMMMSSK.',
  '......KHHMMMMMMMSSK.',
  '......KHHMMMMMMMSSK.',
  '.....KHHMMMMMMMMSSK.',
  '....KHHMMMMMMMMMSSK.',
  '...KHHMMMMMMMMMSSK..',
  '...KHHMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KHHMMMMMMMMMMSSK..',
  '..KMMSSSSSSSSSSDDK..',
  '..KSSDDDDDDDDDDDDK..',
  '...KKKKKKKKKKKKKK...',
  '....................',
];

export const PixelPunchingBag: React.FC<{
  dented?: boolean;
  hitState?: 'idle' | 'critical' | 'weak';
  hitNonce?: number;
  className?: string;
}> = ({ dented = false, hitState = 'idle', hitNonce = 0, className = 'w-16' }) => {
  const pulleyRects = useMemo(() => compileGridRects(CEILING_PULLEY_GRID, PULLEY_PALETTE), []);
  const chainRects = useMemo(() => compileGridRects(CHAIN_GRID, PULLEY_PALETTE), []);
  const bagRects = useMemo(
    () => compileGridRects(dented ? BAG_DENTED_GRID : BAG_NORMAL_GRID, BAG_PALETTE),
    [dented]
  );

  const swingAnimate =
    hitState === 'critical'
      ? { rotate: [0, -28, 16, -9, 4, 0], x: [0, 8, -4, 2, 0] }
      : hitState === 'weak'
      ? { rotate: [0, -9, 5, -2, 0], x: [0, 2, -1, 0] }
      : { rotate: 0, x: 0 };

  return (
    <div className={`relative flex flex-col items-center select-none pointer-events-none ${className}`}>
      {/* Stationary Ceiling Pulley Mount */}
      <svg
        viewBox="0 0 20 9"
        shapeRendering="crispEdges"
        className="w-16 h-auto pixel-art relative z-20"
        style={{ imageRendering: 'pixelated' }}
        aria-hidden="true"
      >
        {pulleyRects.map((r, idx) => (
          <rect key={idx} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
        ))}
      </svg>

      {/* Hanging Chain + Leather Bag pivoting smoothly from the ceiling pulley pin */}
      <motion.div
        key={hitNonce}
        initial={hitState === 'idle' ? false : { rotate: 0, x: 0 }}
        animate={swingAnimate}
        transition={{
          duration: hitState === 'critical' ? 0.56 : 0.36,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: 'top center' }}
        className="relative -mt-0.5 flex flex-col items-center"
      >
        {/* Pixel Impact Slash Arc on Critical Hit */}
        {dented && hitState === 'critical' && (
          <motion.svg
            key={`slash-${hitNonce}`}
            initial={{ opacity: 1, scale: 0.7, x: -6 }}
            animate={{ opacity: [1, 1, 0], scale: [0.85, 1.15, 1.25], x: 0 }}
            transition={{ duration: 0.28 }}
            viewBox="0 0 18 18"
            shapeRendering="crispEdges"
            className="absolute -left-5 top-[58%] w-9 h-9 z-30 pointer-events-none pixel-art drop-shadow-[0_0_6px_rgba(125,211,252,0.9)]"
            style={{ imageRendering: 'pixelated' }}
            aria-hidden="true"
          >
            <rect x="2" y="2" width="3" height="2" fill="#e0f2fe" />
            <rect x="5" y="4" width="3" height="2" fill="#ffffff" />
            <rect x="8" y="6" width="3" height="3" fill="#7dd3fc" />
            <rect x="10" y="9" width="3" height="2" fill="#ffffff" />
            <rect x="7" y="11" width="3" height="2" fill="#e0f2fe" />
            <rect x="4" y="13" width="3" height="2" fill="#38bdf8" />
            <rect x="1" y="7" width="3" height="2" fill="#fef08a" />
          </motion.svg>
        )}

        <svg
          viewBox="0 0 20 40"
          shapeRendering="crispEdges"
          className="w-16 h-auto pixel-art"
          style={{ imageRendering: 'pixelated' }}
          aria-label="Punching Bag"
        >
          <g>
            {chainRects.map((r, idx) => (
              <rect key={`c-${idx}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
            ))}
          </g>
          <g transform="translate(0, 16)">
            {bagRects.map((r, idx) => (
              <rect key={`b-${idx}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
            ))}
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

// ============================================================================
// 6. DIGI-MUSHROOM (Dark charcoal speckled cap + cream stem matching reference)
// ============================================================================
const MUSHROOM_PALETTE: Record<string, string> = {
  K: '#16161a', // Crisp dark outline
  G: '#71717a', // Cap light speckle
  L: '#52525b', // Cap mid slate
  D: '#3f3f46', // Cap dark charcoal
  S: '#27272a', // Cap underside shadow
  W: '#fef3c7', // Stem cream highlight
  T: '#d6d3d1', // Stem warm tan
  B: '#a8a29e', // Stem shadow
};

const MUSHROOM_GRID = [
  '................',
  '.....KKKKKK.....',
  '...KKLLGGDLKK...',
  '..KLLGDDDDGDLK..',
  '.KLLDDDDGGDDDLK.',
  '.KDDDDDDDDGDDDK.',
  '.KSDDDDDDDDDSSK.',
  '..KKSSSSSSSSKK..',
  '....KKWWTBKK....',
  '.....KWWTTK.....',
  '.....KWWTBK.....',
  '....KWWWTTBK....',
  '....KWWTTBBK....',
  '.....KKTTKK.....',
  '.......KK.......',
  '................',
];

export const PixelMushroomIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = 'w-5 h-5', size }) => (
  <PixelGridIcon grid={MUSHROOM_GRID} palette={MUSHROOM_PALETTE} className={className} size={size} label="Digi-Mushroom" />
);

// ============================================================================
// 7. PRIME SIRLOIN (Marbled dark crimson-brown steak with bone at bottom-left)
// ============================================================================
const SIRLOIN_PALETTE: Record<string, string> = {
  K: '#1b0b09', // Crisp outline
  H: '#dc6b57', // Warm seared highlight
  L: '#b9382c', // Rich red meat
  M: '#8f241c', // Steak body
  D: '#661712', // Deep sear shadow
  F: '#fca5a5', // Marbling pink-white
  W: '#fff4d8', // Bone cream highlight
  B: '#d6b88d', // Bone tan shadow
};

const SIRLOIN_GRID = [
  '.......KKKK.....',
  '.....KKHHHHKK...',
  '....KHHLLLLHHK..',
  '...KHLLFFLLMLLK.',
  '..KHHLLMMLFFLLMK',
  '..KLLMMFFMMMMMDK',
  '..KMFFMMMMMMMDK.',
  '..KMMMMDDDDDDDK.',
  '.KKBMMDDDDDDDK..',
  'KWWWKDDDDDDKK...',
  'KWBBKDDDDKK.....',
  'KKBKKKKKK.......',
  '.KWWK...........',
  '..KK............',
  '................',
  '................',
];

export const PixelSirloinIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = 'w-5 h-5', size }) => (
  <PixelGridIcon grid={SIRLOIN_GRID} palette={SIRLOIN_PALETTE} className={className} size={size} label="Prime Sirloin" />
);

// ============================================================================
// 8. DIGI-BERRY / STRAWBERRY (Crimson pixel berry with seeds & green crown)
// ============================================================================
const BERRY_PALETTE: Record<string, string> = {
  K: '#23090a', // Crisp outline
  G: '#22c55e', // Leaf highlight
  g: '#15803d', // Leaf deep green
  H: '#f87171', // Berry specular highlight
  R: '#ef4444', // Bright strawberry red
  M: '#dc2626', // Mid red body
  D: '#991b1b', // Deep red underside
  S: '#450a0a', // Seed dot
};

const BERRY_GRID = [
  '......KKKK......',
  '....KKGgGGKK....',
  '...KgGGggGGgK...',
  '..KKRRRRRggRKK..',
  '.KHRRSRRRRSRRRK.',
  '.KRRHRRMRRRMRRK.',
  '.KRRMRSMRMRSMDK.',
  '.KRMRRRRRMMRDDK.',
  '..KMRSMRMRSMDK..',
  '..KMMRMMRDDMDK..',
  '...KMMSRMMDDK...',
  '...KMMDDDDDK....',
  '....KMDDDDK.....',
  '.....KDDDK......',
  '......KKK.......',
  '................',
];

export const PixelBerryIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = 'w-5 h-5', size }) => (
  <PixelGridIcon grid={BERRY_GRID} palette={BERRY_PALETTE} className={className} size={size} label="Digi-Berry" />
);

// ============================================================================
// 9. DIGI RELICS (Armor Digi-Egg / Crest Relics + Supply Cache for Zone Cards)
// ============================================================================
const RELIC_GRIDS: Record<SpecialItemId, { grid: string[]; palette: Record<string, string>; label: string }> = {
  knowledge_crest: {
    label: 'Crest of Knowledge Relic',
    palette: {
      K: '#0f172a',
      A: '#34d399', // Beetle crest emerald horn
      B: '#059669',
      C: '#a78bfa', // Mystic violet shell
      D: '#7c3aed',
      E: '#5b21b6',
      Y: '#fde047', // Gold trim / emblem
    },
    grid: [
      '......KKKK......',
      '....KKAAAAKK....',
      '...KAAABBBBKK...',
      '..KAAKYYYYKAAK..',
      '..KAKCCCCCCCKAK.',
      '..KKCCCCYCCCCKK.',
      '..KCCCCYYYCCCCK.',
      '.KCCCCYYKYYCCCCK',
      '.KDDDDDYYYDDDDDK',
      '.KDDDDDDDDDDDDDK',
      '.KDDDEEEEEEEEEDK',
      '..KKEEEEEEEEEKK.',
      '...KYYYYYYYYYYK.',
      '....KKEEEEEEKK..',
      '......KKKKKK....',
      '................',
    ],
  },
  hope_crest: {
    label: 'Crest of Hope Relic',
    palette: {
      K: '#1e1b4b',
      W: '#fef9c3', // Wing feather highlight
      Y: '#facc15', // Radiant gold body
      O: '#eab308',
      D: '#a16207', // Deep amber trim
      B: '#38bdf8', // Celestial sky accent
    },
    grid: [
      '......KKKK......',
      '....KKYYYYKK....',
      '..KKWWYYYYWWKK..',
      '.KWWYYYYYYYYWWK.',
      '.KWKKYYBBYYKKWK.',
      '..KKYYBBBBYYKK..',
      '..KYYBBWWBBYYK..',
      '.KYYYBBWWBBYYYK.',
      '.KYYYYBBBBYYYYK.',
      '.KOOOYYYYYYOOOK.',
      '..KOOOOYYOOOOK..',
      '..KDDDDDDDDDDK..',
      '...KDDDDDDDDK...',
      '....KKDDDDKK....',
      '......KKKK......',
      '................',
    ],
  },
  love_crest: {
    label: 'Crest of Love Relic',
    palette: {
      K: '#2e1026',
      P: '#f472b6', // Rose pink wing
      R: '#fb7185', // Crimson shell
      D: '#e11d48',
      W: '#fff1f2', // Heart sheen
      Y: '#fde047', // Gold crest trim
    },
    grid: [
      '......KKKK......',
      '....KKPPPPKK....',
      '..KKPPWWWWPPKK..',
      '.KPPKRRRRRRKPPK.',
      '.KPKRRRYYRRRKPK.',
      '..KKRRYYYYRRKK..',
      '..KRRYYWWYYRRK..',
      '.KRRRYYYYYYRRRK.',
      '.KDDDDYYYYDDDDK.',
      '.KDDDDDYYDDDDDK.',
      '..KDDDDDDDDDDK..',
      '..KYYDDDDDDYYK..',
      '...KKDDDDDDKK...',
      '....KKDDDDKK....',
      '......KKKK......',
      '................',
    ],
  },
  courage_crest: {
    label: 'Crest of Courage Relic',
    palette: {
      K: '#270909',
      F: '#fb923c', // Flame crest highlight
      R: '#ef4444', // Crimson body
      D: '#b91c1c', // Deep ruby shadow
      Y: '#fde047', // Sun crest core
      W: '#fff7ed',
    },
    grid: [
      '....KK....KK....',
      '...KFFK..KFFK...',
      '...KFFKKKKFFK...',
      '..KFFRRRRRRFFK..',
      '..KKRRRYYRRRKK..',
      '..KRRRYYYYRRRK..',
      '.KRRRYWWWWYRRRK.',
      '.KRRRYWWWWYRRRK.',
      '.KDDDDYYYYDDDDK.',
      '.KDDDDDYYDDDDDK.',
      '..KDDDDDDDDDDK..',
      '..KYYDDDDDDYYK..',
      '...KKDDDDDDKK...',
      '....KKDDDDKK....',
      '......KKKK......',
      '................',
    ],
  },
  destiny_egg: {
    label: 'Digi-Egg of Miracles Relic',
    palette: {
      K: '#1f1606',
      W: '#fef9c3', // Divine gold sheen
      Y: '#facc15', // Chrome gold body
      O: '#d97706', // Amber bevel
      B: '#38bdf8', // Azure miracle gem
      C: '#0284c7',
    },
    grid: [
      '......KKKK......',
      '....KKWWWWKK....',
      '...KWWYYYYWWK...',
      '..KWWYYBBYYWWK..',
      '..KWYYBBBBYYWK..',
      '..KYYBBCCBBYYK..',
      '.KYYYYBBBBYYYYK.',
      '.KYYYYYBBYYYYYK.',
      '.KOOOYYYYYYOOOK.',
      '.KOOOOYYYYOOOOK.',
      '..KOOOOOOOOOOK..',
      '..KYYOOOOOOYYK..',
      '...KKOOOOOOKK...',
      '....KKOOOOKK....',
      '......KKKK......',
      '................',
    ],
  },
  light_crest: {
    label: 'Crest of Light Relic',
    palette: {
      K: '#1e1b4b',
      W: '#ffffff', // Pure pearl light
      C: '#fef3c7', // Warm ivory
      Y: '#facc15', // Solar halo gold
      P: '#e879f9', // Prismatic aura
      D: '#c084fc',
    },
    grid: [
      '......KKKK......',
      '....KKYYYYKK....',
      '...KYYWWWWYYK...',
      '..KYWWCCCCWWYK..',
      '..KWCWWYYWWCWK..',
      '..KWCYYYYYYCWK..',
      '.KWCCYYPPYYCCWK.',
      '.KWCCYYYYYYCCWK.',
      '.KCCCWWYYWWCCCK.',
      '.KDDDDCCCCDDDDK.',
      '..KDDDDDDDDDDK..',
      '..KYYDDDDDDYYK..',
      '...KKDDDDDDKK...',
      '....KKDDDDKK....',
      '......KKKK......',
      '................',
    ],
  },
};

export const PixelRelicIcon: React.FC<{
  relicId: SpecialItemId;
  className?: string;
  size?: number;
}> = ({ relicId, className = 'w-9 h-9', size }) => {
  const entry = RELIC_GRIDS[relicId] || RELIC_GRIDS.courage_crest;
  return (
    <PixelGridIcon
      grid={entry.grid}
      palette={entry.palette}
      className={className}
      size={size}
      label={entry.label}
    />
  );
};

const SUPPLY_CACHE_PALETTE: Record<string, string> = {
  K: '#082f49',
  C: '#38bdf8', // Aqua steel top
  B: '#0284c7', // Ocean armor body
  D: '#0369a1', // Deep chest shade
  Y: '#facc15', // Gold clasp & trim
  W: '#e0f2fe',
};

const SUPPLY_CACHE_GRID = [
  '................',
  '................',
  '...KKKKKKKKKK...',
  '..KWWWWWWWWWWK..',
  '..KCCCCCCCCCCK..',
  '.KKYYYYYYYYYYKK.',
  '.KBBBBYYYYBBBBK.',
  '.KBBBBYKKYBBBBK.',
  '.KBBBBYYYYBBBBK.',
  '.KDDDDDDDDDDDDK.',
  '.KDDYYDDDDYYDDK.',
  '.KDDDDDDDDDDDDK.',
  '..KKKKKKKKKKKK..',
  '................',
  '................',
  '................',
];

export const PixelSupplyCacheIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = 'w-9 h-9', size }) => (
  <PixelGridIcon
    grid={SUPPLY_CACHE_GRID}
    palette={SUPPLY_CACHE_PALETTE}
    className={className}
    size={size}
    label="Deep Sea Supply Cache"
  />
);


