import React from 'react';
import { motion } from 'motion/react';
import { PixelGridIcon } from './PixelItemIcons';

// ============================================================================
// 1. DIGIMON WORLD 1 GREEN GYM SIGNPOST (Wooden Gym Plaque)
// ============================================================================
const SIGNPOST_PALETTE: Record<string, string> = {
  K: '#1c1208',
  W: '#b4783e',
  M: '#8a5527',
  D: '#5d3616',
  P: '#e2d9c2',
  S: '#c4b89c',
};

const SIGNPOST_GRID = [
  'KKKKKKKKKKKKKKKKKKKK',
  'KWWWWWWWWWWWWWWWWWWK',
  'KWPPPPPPPPPPPPPPPPDK',
  'KWPPPPPPPPPPPPPPPPSK',
  'KWPPPPPPPPPPPPPPPPSK',
  'KWPPPPPPPPPPPPPPPPSK',
  'KWSSSSSSSSSSSSSSSSDK',
  'KDDDDDDDDDDDDDDDDDDK',
  'KKKKKKKKKKKKKKKKKKKK',
  '........KMMK........',
  '........KMDK........',
  '........KMDK........',
  '........KMDK........',
  '........KDDK........',
  '.......KKKKKK.......',
];

export const PixelGymSignpost: React.FC<{ label: string; className?: string }> = ({
  label,
  className = '',
}) => (
  <div className={`relative inline-flex flex-col items-center select-none pointer-events-none ${className}`}>
    <div className="relative">
      <PixelGridIcon grid={SIGNPOST_GRID} palette={SIGNPOST_PALETTE} className="w-16 h-12" />
      <span className="absolute inset-x-0 top-[5px] text-center font-pixel text-[8px] font-bold text-[#2b1a0a] tracking-tight">
        {label}
      </span>
    </div>
  </div>
);

// ============================================================================
// 2. HP STATION: HEAVY MOSSY BOULDER (26x20 Crisp Pixel Art)
// ============================================================================
const BOULDER_PALETTE: Record<string, string> = {
  K: '#18181b', // Dark rock outline
  G: '#4ade80', // Bright moss highlight
  g: '#15803d', // Deep moss shadow
  H: '#a8a29e', // Top stone highlight
  L: '#78716c', // Light granite
  M: '#57534e', // Mid rock body
  D: '#44403c', // Shaded granite
  S: '#292524', // Deep rock crease & base
};

const BOULDER_GRID = [
  '........KKKKKKKKKK........',
  '......KKGGggggHHHHKK......',
  '....KKGGGGggggHHHHLLKK....',
  '...KGGGgggHHHHLLLLMMMMK...',
  '..KGGggHHHHLLLLMMMMSMMMK..',
  '.KHHHLLLLMMMMMMMSMMDDDDDK.',
  '.KHLLLMMMMMSMMMMDDDDDDDDK.',
  'KHLMMMMMSSMMDDDDDDDDDDDDDK',
  'KLMMMMSDDDDDDDDSSSDDDDDDDK',
  'KMMMSDDDDDDDDSSDDDDDDDDDDK',
  'KMMDDSSSDDDDDDDDDDDDDDDDSK',
  'KMDDDDSSSDDDDDDDDDDDDDSSSK',
  'KDDDDDDDDDDDDDDDDDDSSSSSSK',
  'KDDDDDDDDDDDDDSSSSSSSSSSSK',
  '.KDDDDDDSSSSSSSSSSSSSSSSK.',
  '.KSSSSSSSSSSSSSSSSSSSSSSK.',
  '..KKKKKKKKKKKKKKKKKKKKKK..',
];

export const PixelBoulderProp: React.FC<{
  cracked?: boolean;
  className?: string;
}> = ({ cracked = false, className = 'w-24 h-auto' }) => (
  <div className="relative inline-flex items-center justify-center select-none pointer-events-none">
    <PixelGridIcon grid={BOULDER_GRID} palette={BOULDER_PALETTE} className={className} label="Heavy Boulder" />
    {cracked && (
      <svg
        viewBox="0 0 26 17"
        shapeRendering="crispEdges"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
      >
        <rect x="7" y="6" width="2" height="1" fill="#fef08a" />
        <rect x="9" y="7" width="2" height="1" fill="#fde047" />
        <rect x="11" y="8" width="2" height="2" fill="#f59e0b" />
        <rect x="9" y="10" width="2" height="1" fill="#fef08a" />
      </svg>
    )}
  </div>
);

// ============================================================================
// 3. MP STATION: WATERFALL CLIFF & SPLASH POOL (Pixel Art)
// ============================================================================
const CLIFF_PALETTE: Record<string, string> = {
  K: '#141824',
  G: '#22c55e',
  g: '#166534',
  R: '#64748b',
  M: '#475569',
  D: '#334155',
  W: '#e0f2fe',
  C: '#7dd3fc',
  B: '#0284c7',
  b: '#0369a1',
};

const CLIFF_TOP_GRID = [
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'KGGGGggGGGGggGGGGGGGGggGGGGggGGK',
  'KRRRRMMWWWWCCCCBBBBWWWWCCCCMMRRK',
  'KMMMMDDWWWWCCCCBBBBWWWWCCCCDDMMK',
  'KDDDDDDWWWWCCCCBBBBWWWWCCCCDDDDK',
];

const WATER_STREAM_GRID = [
  '..KWWCCBBWWCCBBCCWWBBCCWWCCBBK..',
  '..KCCWWBBCCWWBBWWCCBBWWCCWWBBK..',
  '..KWWBBCCWWCCBBCCWWBBCCWWCCBBK..',
  '..KBBWWCCBBWWCCWWCCBBWWCCWWBBK..',
  '..KWWCCBBWWCCBBCCWWBBCCWWCCBBK..',
  '..KCCWWBBCCWWBBWWCCBBWWCCWWBBK..',
];

const SPLASH_POOL_GRID = [
  '..KWWWWCCCCBBBBBBBBCCCCWWWWWWK..',
  '.KWCCBBBBWWCCCCCCCCWWBBBBBBCCWK.',
  'KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK',
  '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
];

export const PixelWaterfallBackdrop: React.FC<{ isExecuting: boolean }> = ({ isExecuting }) => (
  <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col items-center pointer-events-none select-none overflow-hidden">
    {/* Mossy Rocky Cliff Top */}
    <PixelGridIcon grid={CLIFF_TOP_GRID} palette={CLIFF_PALETTE} className="w-44 h-7 z-10" />

    {/* Scrolling Pixel Waterfall Columns */}
    <div className="relative w-44 flex-1 overflow-hidden flex flex-col">
      <motion.div
        animate={{ y: ['-50%', '0%'] }}
        transition={{ repeat: Infinity, duration: isExecuting ? 0.34 : 0.72, ease: 'linear' }}
        className="flex flex-col w-full"
      >
        <PixelGridIcon grid={WATER_STREAM_GRID} palette={CLIFF_PALETTE} className="w-44 h-16" />
        <PixelGridIcon grid={WATER_STREAM_GRID} palette={CLIFF_PALETTE} className="w-44 h-16" />
        <PixelGridIcon grid={WATER_STREAM_GRID} palette={CLIFF_PALETTE} className="w-44 h-16" />
        <PixelGridIcon grid={WATER_STREAM_GRID} palette={CLIFF_PALETTE} className="w-44 h-16" />
      </motion.div>
    </div>

    {/* Foaming Splash Pool */}
    <motion.div
      animate={{ scaleX: isExecuting ? [1, 1.07, 1] : [1, 1.02, 1] }}
      transition={{ repeat: Infinity, duration: isExecuting ? 0.45 : 1.1 }}
      className="-mt-2 z-10"
    >
      <PixelGridIcon grid={SPLASH_POOL_GRID} palette={CLIFF_PALETTE} className="w-48 h-6" />
    </motion.div>
  </div>
);

// ============================================================================
// 4. OFFENSE STATION: ANCIENT TREE TRUNK (Digimon World 1 Pixel Art)
// ============================================================================
const TREE_PALETTE: Record<string, string> = {
  K: '#1a1109',
  L: '#4ade80', // Leaf highlight
  G: '#22c55e', // Leaf green
  g: '#15803d', // Mid canopy
  d: '#14532d', // Deep canopy shadow
  H: '#b47440', // Bark highlight
  B: '#8a5228', // Bark midtone
  S: '#5c3314', // Bark shadow
  T: '#eab308', // Carved target ring
  R: '#dc2626', // Bullseye center
};

const TREE_GRID = [
  '......KKKKKKKKKKKKKK......',
  '....KKLLLLGGGGGGGGggKK....',
  '..KKLLLLGGGGGGGGggggddKK..',
  '.KLLGGGGGGggggggddddddggK.',
  '.KGGggggggddddddgggdddggK.',
  'KGGgggddddddddggggggggddgK',
  'KggdddddddddggggggddddddgK',
  '.KddddddddddddddddddddddK.',
  '..KKKKKKKKSSSSSSSSKKKKKK..',
  '........KHHBBBBSSK........',
  '........KHBSSSSBSK........',
  '.......KKHBTTTTBSKK.......',
  '.......KHBBTRRTBBSK.......',
  '.......KHBBTTTTBBSK.......',
  '.......KHHBSSSSBSKK.......',
  '.......KHHBBBBBSSK........',
  '.......KHBSSBBBBSSK.......',
  '.......KHHBSSSSBSSK.......',
  '......KKHHBBBBBBSSKK......',
  '.....KKHHBBSSSSBBSSKK.....',
  '....KHHBBBSSSSSSBBBSSK....',
  '...KKKKKKKKKKKKKKKKKKKK...',
];

export const PixelAncientTree: React.FC<{ className?: string }> = ({
  className = 'w-24 h-auto',
}) => <PixelGridIcon grid={TREE_GRID} palette={TREE_PALETTE} className={className} label="Ancient Tree" />;

// ============================================================================
// 5. DEFENSE STATION: GIANT SPRING PUNCHING GLOVE (Digimon World 1 Machine)
// ============================================================================
const GLOVE_PALETTE: Record<string, string> = {
  K: '#160909', // Crisp outline
  H: '#ef4444', // Glove bright red highlight
  R: '#b91c1c', // Glove crimson body
  D: '#7f1d1d', // Glove deep shadow
  W: '#e2e8f0', // Wrist cuff highlight
  C: '#94a3b8', // Steel cuff & spring
  S: '#475569', // Dark steel
  F: '#334155', // Launcher frame
  B: '#1e293b', // Heavy iron anchor
};

const GLOVE_HEAD_GRID = [
  '...KKKKKKKKK......',
  '.KKHHHHHHHHHKK....',
  'KHHHHHRRRRRRRRK...',
  'KHHHRRRRRRRRRRWKK.',
  'KHRRRRRRRRRRRRWCCK',
  'KRRRRDDDDDDDDDWCCK',
  'KRRDDDDDDDDDDDWSSK',
  '.KKDDDDDDDDDDDWSSK',
  '...KKKKKKKKKKKWKK.',
  '..............KK..',
];

const LAUNCHER_BASE_GRID = [
  'KBBBBK',
  'KFFFFK',
  'KFCCFK',
  'KFSSFK',
  'KFFFFK',
  'KBBBBK',
  'KBBBBK',
  'KKKKKK',
];

export const PixelGloveMachine: React.FC<{
  isFiring: boolean;
  hitNonce: number;
}> = ({ isFiring, hitNonce }) => (
  <div className="relative flex items-center justify-end select-none pointer-events-none">
    {/* Animated Giant Glove + Extending Spring */}
    <motion.div
      key={`glove-arm-${hitNonce}`}
      animate={
        isFiring
          ? { x: [12, -52, -48, 8, 0] }
          : { x: 0 }
      }
      transition={{
        duration: 0.56,
        times: [0, 0.25, 0.45, 0.78, 1],
        ease: 'easeOut',
      }}
      className="relative flex items-center z-20 -mr-1"
    >
      <PixelGridIcon grid={GLOVE_HEAD_GRID} palette={GLOVE_PALETTE} className="w-16 h-auto" label="Giant Punching Glove" />
      {/* Accordion Coil Spring */}
      <svg
        viewBox="0 0 28 12"
        shapeRendering="crispEdges"
        className="w-10 h-5 -ml-1 pixel-art"
        style={{ imageRendering: 'pixelated' }}
      >
        <rect x="0" y="5" width="4" height="2" fill="#94a3b8" />
        <rect x="4" y="2" width="3" height="8" fill="#cbd5e1" />
        <rect x="7" y="4" width="3" height="4" fill="#475569" />
        <rect x="10" y="2" width="3" height="8" fill="#cbd5e1" />
        <rect x="13" y="4" width="3" height="4" fill="#475569" />
        <rect x="16" y="2" width="3" height="8" fill="#cbd5e1" />
        <rect x="19" y="4" width="3" height="4" fill="#475569" />
        <rect x="22" y="5" width="6" height="2" fill="#94a3b8" />
      </svg>
    </motion.div>

    {/* Anchored Heavy Iron Launcher Post */}
    <PixelGridIcon grid={LAUNCHER_BASE_GRID} palette={GLOVE_PALETTE} className="w-6 h-auto z-10" />
  </div>
);

// ============================================================================
// 6. BRAINS STATION: BLACKBOARD & PIXEL BOOK + PENCIL (Digimon World 1)
// ============================================================================
const BOARD_PALETTE: Record<string, string> = {
  K: '#140c05',
  W: '#b4783e', // Wood frame highlight
  M: '#7c4a21', // Wood midtone
  D: '#4a2b11', // Wood dark
  G: '#14532d', // Chalkboard slate
  g: '#166534', // Board inner sheen
  C: '#f8fafc', // White chalk
  Y: '#fde047', // Yellow chalk
  R: '#fb7185', // Red chalk mark
};

const BLACKBOARD_GRID = [
  'KKKKKKKKKKKKKKKKKKKKKKKKKK',
  'KWWWWWWWWWWWWWWWWWWWWWWWWK',
  'KWGGGGGGGGGGGGGGGGGGGGGGDK',
  'KWGGCCCGGGGYGGGGGGGGGGGGDK',
  'KWGCCCCGGGGGYYGCCCGGGGGGDK',
  'KWGGGGGGGGGGGYGGGGGGGGGGDK',
  'KWGGYYYYGGGGGGGGGRRRGGGGDK',
  'KWGGYGGGGCCCGGGGRGGGGGGGDK',
  'KWGGGGGGGGGGGGGGGGGGGGGGDK',
  'KWggggggggggggggggggggggDK',
  'KMMMMMMMMMMMMMMMMMMMMMMMMK',
  'KDDDDDDDDDDDDDDDDDDDDDDDDK',
  'KKKKKKKKKKKKKKKKKKKKKKKKKK',
  '...KMMK............KMMK...',
  '...KMDK............KMDK...',
  '...KDDK............KDDK...',
  '..KKKKKK..........KKKKKK..',
];

export const PixelBlackboardProp: React.FC<{ className?: string }> = ({
  className = 'w-28 h-auto',
}) => <PixelGridIcon grid={BLACKBOARD_GRID} palette={BOARD_PALETTE} className={className} label="Blackboard" />;

const BOOK_PALETTE: Record<string, string> = {
  K: '#0f172a',
  P: '#fef3c7',
  S: '#fde68a',
  B: '#94a3b8',
  Y: '#facc15',
  O: '#f97316',
  R: '#fb7185',
};

const NOTEBOOK_GRID = [
  '.KKKKKK.KKKKKK.',
  'KPPPPPPKPPPPPPK',
  'KPBBPPPKPBBPPPK',
  'KPPPPPPKPPBBPPK',
  'KPBBPPPKPPPPPPK',
  'KSSSSSSKSSSSSSK',
  '.KKKKKKKKKKKKK.',
];

const PENCIL_GRID = [
  '.....KKK',
  '....KRRK',
  '...KYYYK',
  '..KYYYOK',
  '.KYYOK..',
  'KPPK....',
  'KKK.....',
];

export const PixelBookPencilOverhead: React.FC<{ isExecuting: boolean }> = ({ isExecuting }) => (
  <div className="relative flex items-center gap-1 bg-slate-950/80 border border-violet-400/50 rounded-lg px-1.5 py-1 shadow-md">
    <PixelGridIcon grid={NOTEBOOK_GRID} palette={BOOK_PALETTE} className="w-6 h-auto" />
    <motion.div
      animate={
        isExecuting
          ? { x: [-2, 3, -1, 3, -2], y: [0, -2, 1, -2, 0] }
          : { x: [0, 1.5, 0], y: [0, -1, 0] }
      }
      transition={{ repeat: Infinity, duration: isExecuting ? 0.28 : 1.1 }}
    >
      <PixelGridIcon grid={PENCIL_GRID} palette={BOOK_PALETTE} className="w-4 h-auto" />
    </motion.div>
  </div>
);

// ============================================================================
// 7. SHARED PIXEL FX: IMPACT SPARKS, SLASH ARC & DUST PUFFS
// ============================================================================
export const PixelImpactSparks: React.FC<{
  nonce: number;
  variant?: 'orange' | 'cyan' | 'emerald';
  className?: string;
}> = ({ nonce, variant = 'orange', className = '' }) => {
  const c1 = variant === 'cyan' ? '#7dd3fc' : variant === 'emerald' ? '#6ee7b7' : '#fed7aa';
  const c2 = variant === 'cyan' ? '#38bdf8' : variant === 'emerald' ? '#34d399' : '#fb923c';
  const c3 = variant === 'cyan' ? '#e0f2fe' : variant === 'emerald' ? '#fef08a' : '#fef08a';

  return (
    <motion.svg
      key={`sparks-${nonce}`}
      initial={{ opacity: 1, scale: 0.55 }}
      animate={{ opacity: [1, 1, 0], scale: [0.7, 1.25, 1.4] }}
      transition={{ duration: 0.38 }}
      viewBox="0 0 24 24"
      shapeRendering="crispEdges"
      className={`w-12 h-12 pointer-events-none pixel-art ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="11" y="2" width="2" height="4" fill={c3} />
      <rect x="11" y="18" width="2" height="4" fill={c2} />
      <rect x="2" y="11" width="4" height="2" fill={c2} />
      <rect x="18" y="11" width="4" height="2" fill={c3} />
      <rect x="5" y="5" width="3" height="3" fill={c1} />
      <rect x="16" y="5" width="3" height="3" fill={c2} />
      <rect x="5" y="16" width="3" height="3" fill={c2} />
      <rect x="16" y="16" width="3" height="3" fill={c1} />
      <rect x="9" y="9" width="6" height="6" fill={c3} />
    </motion.svg>
  );
};

export const PixelDustPuff: React.FC<{
  nonce: number;
  direction?: 'left' | 'right';
  className?: string;
}> = ({ nonce, direction = 'left', className = '' }) => (
  <motion.svg
    key={`dust-${nonce}`}
    initial={{ opacity: 0.9, x: 0, scale: 0.7 }}
    animate={{
      opacity: [0.9, 0.75, 0],
      x: direction === 'left' ? -18 : 18,
      y: -6,
      scale: [0.8, 1.2, 1.35],
    }}
    transition={{ duration: 0.45 }}
    viewBox="0 0 16 12"
    shapeRendering="crispEdges"
    className={`w-7 h-5 pointer-events-none pixel-art ${className}`}
    style={{ imageRendering: 'pixelated' }}
  >
    <rect x="3" y="4" width="6" height="4" fill="#d6d3d1" />
    <rect x="6" y="2" width="6" height="5" fill="#e7e5e4" />
    <rect x="9" y="5" width="5" height="4" fill="#a8a29e" />
    <rect x="2" y="6" width="3" height="3" fill="#a8a29e" />
  </motion.svg>
);
