export type DayNightPreference = 'auto' | 'day' | 'night';

const DAY_NIGHT_PREF_KEY = 'digipet_day_night_pref_v1';
const SAVED_DAYTIME_THEME_KEY = 'digipet_daytime_room_theme_v1';

export const EVENING_START_HOUR = 19; // 7:00 PM
export const MORNING_START_HOUR = 7; // 7:00 AM (night runs 7:00 PM - 6:59 AM)
export const NIGHT_ROOM_THEME_ID = 'starlit-island';

export const DARK_ROOM_THEME_IDS = new Set([
  'starlit-island',
  'cyber-matrix',
  'colosseum-arena',
  'neon-arcade',
  'sovereign-throne',
  'infinity-nexus',
]);

export function isEveningHours(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= EVENING_START_HOUR || hour < MORNING_START_HOUR;
}

export function resolveNightMode(
  pref: DayNightPreference,
  date: Date = new Date()
): boolean {
  if (pref === 'night') return true;
  if (pref === 'day') return false;
  return isEveningHours(date);
}

export function loadDayNightPref(): DayNightPreference {
  try {
    const raw = localStorage.getItem(DAY_NIGHT_PREF_KEY);
    if (raw === 'auto' || raw === 'day' || raw === 'night') return raw;
  } catch {
    // ignore storage errors
  }
  return 'auto';
}

export function saveDayNightPref(pref: DayNightPreference): void {
  try {
    localStorage.setItem(DAY_NIGHT_PREF_KEY, pref);
  } catch {
    // ignore storage errors
  }
}

export function loadSavedDaytimeTheme(): string {
  try {
    const raw = localStorage.getItem(SAVED_DAYTIME_THEME_KEY);
    if (raw && !DARK_ROOM_THEME_IDS.has(raw)) {
      return raw;
    }
  } catch {
    // ignore storage errors
  }
  return 'file-island';
}

export function saveDaytimeTheme(themeId: string): void {
  if (!themeId || DARK_ROOM_THEME_IDS.has(themeId)) return;
  try {
    localStorage.setItem(SAVED_DAYTIME_THEME_KEY, themeId);
  } catch {
    // ignore storage errors
  }
}

export function syncRoomThemeForLightCycle(
  currentThemeId: string,
  isNight: boolean
): string {
  if (isNight) {
    if (!DARK_ROOM_THEME_IDS.has(currentThemeId)) {
      saveDaytimeTheme(currentThemeId);
      return NIGHT_ROOM_THEME_ID;
    }
    return currentThemeId;
  }

  if (currentThemeId === NIGHT_ROOM_THEME_ID) {
    return loadSavedDaytimeTheme();
  }
  return currentThemeId;
}
