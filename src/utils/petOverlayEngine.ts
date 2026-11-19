import { DigimonSpecies } from '../types/digimon';

export type OverlayPetState =
  | 'WALKING_GRID'
  | 'JUMPING'
  | 'FLYING'
  | 'IDLE'
  | 'OFF_SCREEN';

export type GridLayoutPresetId = 'asus-4row' | 'compact-5row' | 'dock-only';

export interface GridLayoutPreset {
  id: GridLayoutPresetId;
  label: string;
  description: string;
  /** Surface Y percentages from top of screen (last entry is the launcher dock) */
  rowRatios: number[];
}

export const GRID_LAYOUT_PRESETS: Record<GridLayoutPresetId, GridLayoutPreset> = {
  'asus-4row': {
    id: 'asus-4row',
    label: '4-Row + Dock (ASUS / Android)',
    description: 'Snaps to 4 home-screen icon rows plus the bottom dock shelf',
    rowRatios: [0.365, 0.497, 0.629, 0.76, 0.92],
  },
  'compact-5row': {
    id: 'compact-5row',
    label: '5-Row + Dock (Dense Grid)',
    description: 'Snaps across 5 compact icon rows plus the bottom dock shelf',
    rowRatios: [0.24, 0.37, 0.50, 0.63, 0.77, 0.92],
  },
  'dock-only': {
    id: 'dock-only',
    label: 'Bottom Dock Only',
    description: 'Roams strictly along the bottom dock bar',
    rowRatios: [0.92],
  },
};

const GRID_PRESET_STORAGE_KEY = 'digipet_overlay_grid_preset_v1';
const CUSTOM_GRID_RATIOS_STORAGE_KEY = 'digipet_overlay_custom_grid_ratios_v1';
export const GRID_RATIOS_CHANGED_EVENT = 'digipet-grid-ratios-changed';

function dispatchGridRatiosChanged(): void {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(GRID_RATIOS_CHANGED_EVENT));
    } catch {}
  }
}

function clampGridRatio(value: number): number {
  const safe = Number.isFinite(value) ? value : 0.5;
  const clamped = Math.max(0.12, Math.min(0.96, safe));
  return Math.round(clamped * 1000) / 1000;
}

function readCustomGridRatiosMap(): Partial<Record<GridLayoutPresetId, number[]>> {
  try {
    const raw = localStorage.getItem(CUSTOM_GRID_RATIOS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getSavedGridPreset(): GridLayoutPresetId {
  try {
    const val = localStorage.getItem(GRID_PRESET_STORAGE_KEY) as GridLayoutPresetId | null;
    if (val && val in GRID_LAYOUT_PRESETS) return val;
  } catch {}
  return 'asus-4row';
}

export function setSavedGridPreset(id: GridLayoutPresetId): void {
  try {
    if (id in GRID_LAYOUT_PRESETS) {
      localStorage.setItem(GRID_PRESET_STORAGE_KEY, id);
      dispatchGridRatiosChanged();
    }
  } catch {}
}

export function getDefaultGridRowRatios(presetId?: GridLayoutPresetId): number[] {
  const id = presetId || getSavedGridPreset();
  return [...(GRID_LAYOUT_PRESETS[id] || GRID_LAYOUT_PRESETS['asus-4row']).rowRatios];
}

export function getSavedCustomRowRatios(presetId?: GridLayoutPresetId): number[] | null {
  const id = presetId || getSavedGridPreset();
  const preset = GRID_LAYOUT_PRESETS[id] || GRID_LAYOUT_PRESETS['asus-4row'];
  const map = readCustomGridRatiosMap();
  const saved = map[id];
  if (!Array.isArray(saved) || saved.length !== preset.rowRatios.length) {
    return null;
  }
  return saved.map((n) => clampGridRatio(Number(n)));
}

export function setSavedCustomRowRatios(presetId: GridLayoutPresetId, ratios: number[]): number[] {
  const preset = GRID_LAYOUT_PRESETS[presetId] || GRID_LAYOUT_PRESETS['asus-4row'];
  const normalized = preset.rowRatios.map((def, idx) =>
    clampGridRatio(typeof ratios[idx] === 'number' ? ratios[idx] : def)
  );
  try {
    const map = readCustomGridRatiosMap();
    map[presetId] = normalized;
    localStorage.setItem(CUSTOM_GRID_RATIOS_STORAGE_KEY, JSON.stringify(map));
    dispatchGridRatiosChanged();
  } catch {}
  return normalized;
}

export function resetCustomRowRatios(presetId: GridLayoutPresetId): void {
  try {
    const map = readCustomGridRatiosMap();
    if (presetId in map) {
      delete map[presetId];
      localStorage.setItem(CUSTOM_GRID_RATIOS_STORAGE_KEY, JSON.stringify(map));
    }
    dispatchGridRatiosChanged();
  } catch {}
}

export function hasCustomRowRatios(presetId?: GridLayoutPresetId): boolean {
  return getSavedCustomRowRatios(presetId) !== null;
}

export function getGridRowRatios(presetId?: GridLayoutPresetId): number[] {
  const id = presetId || getSavedGridPreset();
  const custom = getSavedCustomRowRatios(id);
  if (custom) return custom;
  return getDefaultGridRowRatios(id);
}

const AERIAL_SPECIES_IDS = new Set<string>([
  'poyomon',
  'patamon',
  'angemon',
  'magnaangemon',
  'seraphimon',
  'angewomon',
  'magnadramon',
  'biyomon',
  'birdramon',
  'garudamon',
  'phoenixmon',
  'tentomon',
  'kabuterimon',
  'megakabuterimon',
  'herculeskabuterimon',
  'lillymon',
  'rosemon',
  'metalgreymon',
  'wargreymon',
]);

/**
 * Flying / Floating Digimon (Patamon, winged lines, and Ultimate/Mega forms)
 * bypass surface gravity and navigate via 360-degree waypoint vector flight.
 */
export function isFlyingSpecies(species?: Pick<DigimonSpecies, 'id' | 'stage' | 'type'> | null): boolean {
  if (!species) return false;
  if (species.stage === 'ultimate' || species.stage === 'mega') return true;
  if (AERIAL_SPECIES_IDS.has(species.id)) return true;
  const t = (species.type || '').toLowerCase();
  return (
    t.includes('bird') ||
    t.includes('angel') ||
    t.includes('fairy') ||
    t.includes('insect')
  );
}

/**
 * Convert percentage ratios into clamped pixel Y coordinates for surface shelves.
 */
export function computeSurfaceRowYs(screenHeight: number, rowRatios: number[]): number[] {
  const safeH = Math.max(320, screenHeight || 640);
  return rowRatios.map((r) => Math.round(Math.max(0.12, Math.min(0.96, r)) * safeH));
}

export function snapToNearestSurfaceRow(
  footY: number,
  rowYs: number[]
): { rowIndex: number; y: number } {
  if (!rowYs || rowYs.length === 0) return { rowIndex: 0, y: footY };
  let bestIdx = 0;
  let bestDist = Math.abs(footY - rowYs[0]);
  for (let i = 1; i < rowYs.length; i++) {
    const d = Math.abs(footY - rowYs[i]);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return { rowIndex: bestIdx, y: rowYs[bestIdx] };
}

/**
 * Parabolic interpolation from (startX, startY) to (endX, endY) with upward apex.
 */
export function computeParabolicJumpPoint(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  t: number,
  arcHeight: number = 56
): { x: number; y: number } {
  const clampedT = Math.max(0, Math.min(1, t));
  const x = startX + (endX - startX) * clampedT;
  const linearY = startY + (endY - startY) * clampedT;
  const arcOffset = 4 * arcHeight * clampedT * (1 - clampedT);
  return { x, y: linearY - arcOffset };
}

/**
 * Linear velocity vector step toward waypoint (targetX, targetY).
 */
export function stepWaypointFlight(
  x: number,
  y: number,
  targetX: number,
  targetY: number,
  speedPx: number
): { x: number; y: number; arrived: boolean; dx: number; dy: number } {
  const dx = targetX - x;
  const dy = targetY - y;
  const dist = Math.hypot(dx, dy);
  if (dist <= speedPx || dist < 1) {
    return { x: targetX, y: targetY, arrived: true, dx, dy };
  }
  const nx = dx / dist;
  const ny = dy / dist;
  return {
    x: x + nx * speedPx,
    y: y + ny * speedPx,
    arrived: false,
    dx,
    dy,
  };
}

export const OFF_SCREEN_MIN_COOLDOWN_MS = 180_000;
export const OFF_SCREEN_NEEDY_COOLDOWN_MS = 120_000;

export function pickOffScreenTrigger(params: {
  hunger: number;
  happiness: number;
  cyclesSinceForage: number;
  lastOffScreenAtMs?: number;
  nowMs?: number;
}): { trigger: boolean; kind: 'forage_meat' | 'visit_friends' } {
  const {
    hunger,
    happiness,
    cyclesSinceForage,
    lastOffScreenAtMs = 0,
    nowMs = Date.now(),
  } = params;
  const elapsed = lastOffScreenAtMs > 0 ? nowMs - lastOffScreenAtMs : Number.POSITIVE_INFINITY;

  if (hunger < 40 && cyclesSinceForage >= 14 && elapsed >= OFF_SCREEN_NEEDY_COOLDOWN_MS && Math.random() < 0.18) {
    return { trigger: true, kind: 'forage_meat' };
  }
  if (happiness < 45 && cyclesSinceForage >= 14 && elapsed >= OFF_SCREEN_NEEDY_COOLDOWN_MS && Math.random() < 0.15) {
    return { trigger: true, kind: 'visit_friends' };
  }
  if (cyclesSinceForage >= 28 && elapsed >= OFF_SCREEN_MIN_COOLDOWN_MS && Math.random() < 0.10) {
    return {
      trigger: true,
      kind: Math.random() < 0.55 ? 'forage_meat' : 'visit_friends',
    };
  }
  return { trigger: false, kind: 'forage_meat' };
}
