import { DigimonSpriteConfig, NEW_DIGIMON_SPRITES, SpriteFrame } from './newDigimonSprites';

const STORAGE_KEY = 'digipet_custom_sprites_v1';
const HIDE_GALLERY_KEY = 'digipet_hide_gallery_button_v1';

// Available uploaded spritesheets in /public/assets/aistudio/
export interface AvailableSpritesheet {
  filename: string;
  path: string;
  speciesKeywords: string[];
  displayName: string;
}

export const ALL_AVAILABLE_SPRITESHEETS: AvailableSpritesheet[] = [
  // Multi-sheet species
  { filename: 'Copy_of_WarGreymon_9adf0908.png', path: '/assets/aistudio/Copy_of_WarGreymon_9adf0908.png', speciesKeywords: ['wargreymon'], displayName: 'WarGreymon (Sheet 1)' },
  { filename: 'Copy_of_WarGreymon_2_721b4ff0.png', path: '/assets/aistudio/Copy_of_WarGreymon_2_721b4ff0.png', speciesKeywords: ['wargreymon'], displayName: 'WarGreymon (Sheet 2 - Alt)' },
  
  { filename: 'Copy_of_Garudamon_efb5b727.png', path: '/assets/aistudio/Copy_of_Garudamon_efb5b727.png', speciesKeywords: ['garudamon'], displayName: 'Garudamon (Sheet 1)' },
  { filename: 'Copy_of_Garudamon_2_0f2faae0.png', path: '/assets/aistudio/Copy_of_Garudamon_2_0f2faae0.png', speciesKeywords: ['garudamon'], displayName: 'Garudamon (Sheet 2)' },
  { filename: 'Copy_of_Garudamon_3_4b148cfb.png', path: '/assets/aistudio/Copy_of_Garudamon_3_4b148cfb.png', speciesKeywords: ['garudamon'], displayName: 'Garudamon (Sheet 3)' },

  { filename: 'Copy_of_Phoenixmon_3_3516c5a0.png', path: '/assets/aistudio/Copy_of_Phoenixmon_3_3516c5a0.png', speciesKeywords: ['phoenixmon'], displayName: 'Phoenixmon (Sheet 3)' },
  { filename: 'Copy_of_Phoenixmon_4_5b0ea9a1.png', path: '/assets/aistudio/Copy_of_Phoenixmon_4_5b0ea9a1.png', speciesKeywords: ['phoenixmon'], displayName: 'Phoenixmon (Sheet 4)' },
  { filename: 'Copy_of_Phoenixmon_5_f4ad8760.png', path: '/assets/aistudio/Copy_of_Phoenixmon_5_f4ad8760.png', speciesKeywords: ['phoenixmon'], displayName: 'Phoenixmon (Sheet 5)' },

  { filename: 'Copy_of_MagnaAngemon_4_fba74029.png', path: '/assets/aistudio/Copy_of_MagnaAngemon_4_fba74029.png', speciesKeywords: ['magnaangemon'], displayName: 'MagnaAngemon (Sheet 4)' },
  { filename: 'Copy_of_MagnaAngemon_2_d229b13a.png', path: '/assets/aistudio/Copy_of_MagnaAngemon_2_d229b13a.png', speciesKeywords: ['magnaangemon'], displayName: 'MagnaAngemon (Sheet 2)' },
  { filename: 'Copy_of_MagnaAngemon_3_8e12f61e.png', path: '/assets/aistudio/Copy_of_MagnaAngemon_3_8e12f61e.png', speciesKeywords: ['magnaangemon'], displayName: 'MagnaAngemon (Sheet 3)' },

  { filename: 'Copy_of_Magnadramon_d8456cbf.png', path: '/assets/aistudio/Copy_of_Magnadramon_d8456cbf.png', speciesKeywords: ['magnadramon'], displayName: 'Magnadramon (Sheet 1)' },
  { filename: 'Copy_of_Magnadramon_2_28f0f324.png', path: '/assets/aistudio/Copy_of_Magnadramon_2_28f0f324.png', speciesKeywords: ['magnadramon'], displayName: 'Magnadramon (Sheet 2)' },

  { filename: 'Copy_of_Rosemon_6267595c.png', path: '/assets/aistudio/Copy_of_Rosemon_6267595c.png', speciesKeywords: ['rosemon'], displayName: 'Rosemon (Sheet 1)' },
  { filename: 'Copy_of_Rosemon_2_95d18dbb.png', path: '/assets/aistudio/Copy_of_Rosemon_2_95d18dbb.png', speciesKeywords: ['rosemon'], displayName: 'Rosemon (Sheet 2)' },

  { filename: 'Copy_of_Seraphimon_7d6ba82a.png', path: '/assets/aistudio/Copy_of_Seraphimon_7d6ba82a.png', speciesKeywords: ['seraphimon'], displayName: 'Seraphimon (Sheet 1)' },
  { filename: 'Copy_of_Seraphimon_2_bda6d70c.png', path: '/assets/aistudio/Copy_of_Seraphimon_2_bda6d70c.png', speciesKeywords: ['seraphimon'], displayName: 'Seraphimon (Sheet 2)' },

  { filename: 'Copy_of_Vikemon_4cb881d2.png', path: '/assets/aistudio/Copy_of_Vikemon_4cb881d2.png', speciesKeywords: ['vikemon'], displayName: 'Vikemon (Sheet 1)' },
  { filename: 'Copy_of_Vikemon_2_c83bcb9e.png', path: '/assets/aistudio/Copy_of_Vikemon_2_c83bcb9e.png', speciesKeywords: ['vikemon'], displayName: 'Vikemon (Sheet 2)' },

  { filename: 'Copy_of_WereGarurumon_497c1afb.png', path: '/assets/aistudio/Copy_of_WereGarurumon_497c1afb.png', speciesKeywords: ['weregarurumon'], displayName: 'WereGarurumon (Sheet 1)' },
  { filename: 'Copy_of_WereGarurumon_2_7676d06c.png', path: '/assets/aistudio/Copy_of_WereGarurumon_2_7676d06c.png', speciesKeywords: ['weregarurumon'], displayName: 'WereGarurumon (Sheet 2)' },

  { filename: 'Copy_of_Zudomon_72c1c161.png', path: '/assets/aistudio/Copy_of_Zudomon_72c1c161.png', speciesKeywords: ['zudomon'], displayName: 'Zudomon (Sheet 1)' },
  { filename: 'Copy_of_Zudomon_2_44e2c173.png', path: '/assets/aistudio/Copy_of_Zudomon_2_44e2c173.png', speciesKeywords: ['zudomon'], displayName: 'Zudomon (Sheet 2)' },
  { filename: 'Copy_of_Zudomon_3_e91247b4.png', path: '/assets/aistudio/Copy_of_Zudomon_3_e91247b4.png', speciesKeywords: ['zudomon'], displayName: 'Zudomon (Sheet 3)' },

  { filename: 'Kabuterimon_07cf7d29.png', path: '/assets/aistudio/Kabuterimon_07cf7d29.png', speciesKeywords: ['kabuterimon'], displayName: 'Kabuterimon' },
  { filename: 'Copy_of_MegaKabuterimon_42236ae2.png', path: '/assets/aistudio/Copy_of_MegaKabuterimon_42236ae2.png', speciesKeywords: ['megakabuterimon'], displayName: 'MegaKabuterimon' },
  { filename: 'HerculesKabuterimon_2_89341216.png', path: '/assets/aistudio/HerculesKabuterimon_2_89341216.png', speciesKeywords: ['herculeskabuterimon'], displayName: 'HerculesKabuterimon' },
  { filename: 'Motimon_5cc21ee4.png', path: '/assets/aistudio/Motimon_5cc21ee4.png', speciesKeywords: ['motimon'], displayName: 'Motimon' },

  // Single sheets
  { filename: 'Copy_of_Agumon_Adventure_04d0832a.png', path: '/assets/aistudio/Copy_of_Agumon_Adventure_04d0832a.png', speciesKeywords: ['agumon'], displayName: 'Agumon' },
  { filename: 'Copy_of_Angemon_e4fecf69.png', path: '/assets/aistudio/Copy_of_Angemon_e4fecf69.png', speciesKeywords: ['angemon'], displayName: 'Angemon' },
  { filename: 'Copy_of_Angewomon_2_2dca13a6.png', path: '/assets/aistudio/Copy_of_Angewomon_2_2dca13a6.png', speciesKeywords: ['angewomon'], displayName: 'Angewomon' },
  { filename: 'Copy_of_Birdramon_6ba0b315.png', path: '/assets/aistudio/Copy_of_Birdramon_6ba0b315.png', speciesKeywords: ['birdramon'], displayName: 'Birdramon' },
  { filename: 'Copy_of_Biyomon_ad3c3232.png', path: '/assets/aistudio/Copy_of_Biyomon_ad3c3232.png', speciesKeywords: ['biyomon'], displayName: 'Biyomon' },
  { filename: 'Copy_of_Botamon_fb04c770.png', path: '/assets/aistudio/Copy_of_Botamon_fb04c770.png', speciesKeywords: ['botamon'], displayName: 'Botamon' },
  { filename: 'Copy_of_Bukamon_b180f25e.png', path: '/assets/aistudio/Copy_of_Bukamon_b180f25e.png', speciesKeywords: ['bukamon'], displayName: 'Bukamon' },
  { filename: 'Copy_of_Gabumon_1beb725f.png', path: '/assets/aistudio/Copy_of_Gabumon_1beb725f.png', speciesKeywords: ['gabumon'], displayName: 'Gabumon' },
  { filename: 'Copy_of_Garurumon_2a0bd546.png', path: '/assets/aistudio/Copy_of_Garurumon_2a0bd546.png', speciesKeywords: ['garurumon'], displayName: 'Garurumon' },
  { filename: 'Copy_of_Gatomon_68f5ce70.png', path: '/assets/aistudio/Copy_of_Gatomon_68f5ce70.png', speciesKeywords: ['gatomon'], displayName: 'Gatomon' },
  { filename: 'Copy_of_Gomamon_45ce5d57.png', path: '/assets/aistudio/Copy_of_Gomamon_45ce5d57.png', speciesKeywords: ['gomamon'], displayName: 'Gomamon' },
  { filename: 'Copy_of_Greymon_dcbe93f9.png', path: '/assets/aistudio/Copy_of_Greymon_dcbe93f9.png', speciesKeywords: ['greymon'], displayName: 'Greymon' },
  { filename: 'Copy_of_Ikkakumon_d7c47668.png', path: '/assets/aistudio/Copy_of_Ikkakumon_d7c47668.png', speciesKeywords: ['ikkakumon'], displayName: 'Ikkakumon' },
  { filename: 'Copy_of_Koromon_7d75f13c.png', path: '/assets/aistudio/Copy_of_Koromon_7d75f13c.png', speciesKeywords: ['koromon'], displayName: 'Koromon' },
  { filename: 'Copy_of_Lillymon_aba09616.png', path: '/assets/aistudio/Copy_of_Lillymon_aba09616.png', speciesKeywords: ['lillymon'], displayName: 'Lillymon' },
  { filename: 'Copy_of_MetalGarurumon_4_3c810c39.png', path: '/assets/aistudio/Copy_of_MetalGarurumon_4_3c810c39.png', speciesKeywords: ['metalgarurumon'], displayName: 'MetalGarurumon' },
  { filename: 'Copy_of_MetalGreymon_2_7f134d73.png', path: '/assets/aistudio/Copy_of_MetalGreymon_2_7f134d73.png', speciesKeywords: ['metalgreymon'], displayName: 'MetalGreymon' },
  { filename: 'Copy_of_Nyaromon_923766aa.png', path: '/assets/aistudio/Copy_of_Nyaromon_923766aa.png', speciesKeywords: ['nyaromon'], displayName: 'Nyaromon' },
  { filename: 'Copy_of_Nyokimon_e5b120c1.png', path: '/assets/aistudio/Copy_of_Nyokimon_e5b120c1.png', speciesKeywords: ['nyokimon'], displayName: 'Nyokimon' },
  { filename: 'Copy_of_Pabumon_8b4cbbd7.png', path: '/assets/aistudio/Copy_of_Pabumon_8b4cbbd7.png', speciesKeywords: ['pabumon'], displayName: 'Pabumon' },
  { filename: 'Copy_of_Palmon_2070e7b5.png', path: '/assets/aistudio/Copy_of_Palmon_2070e7b5.png', speciesKeywords: ['palmon'], displayName: 'Palmon' },
  { filename: 'Copy_of_Patamon_6c39d52c.png', path: '/assets/aistudio/Copy_of_Patamon_6c39d52c.png', speciesKeywords: ['patamon'], displayName: 'Patamon' },
  { filename: 'Copy_of_Pichimon_eca26270.png', path: '/assets/aistudio/Copy_of_Pichimon_eca26270.png', speciesKeywords: ['pichimon'], displayName: 'Pichimon' },
  { filename: 'Copy_of_Poyomon_d1a420e7.png', path: '/assets/aistudio/Copy_of_Poyomon_d1a420e7.png', speciesKeywords: ['poyomon'], displayName: 'Poyomon' },
  { filename: 'Copy_of_Punimon_68b4fcb1.png', path: '/assets/aistudio/Copy_of_Punimon_68b4fcb1.png', speciesKeywords: ['punimon'], displayName: 'Punimon' },
  { filename: 'Copy_of_Salamon_adc16886.png', path: '/assets/aistudio/Copy_of_Salamon_adc16886.png', speciesKeywords: ['salamon'], displayName: 'Salamon' },
  { filename: 'Copy_of_Tanemon_17517f84.png', path: '/assets/aistudio/Copy_of_Tanemon_17517f84.png', speciesKeywords: ['tanemon'], displayName: 'Tanemon' },
  { filename: 'Copy_of_Tentomon_326c02c3.png', path: '/assets/aistudio/Copy_of_Tentomon_326c02c3.png', speciesKeywords: ['tentomon'], displayName: 'Tentomon' },
  { filename: 'Copy_of_Togemon_11c9cc70.png', path: '/assets/aistudio/Copy_of_Togemon_11c9cc70.png', speciesKeywords: ['togemon'], displayName: 'Togemon' },
  { filename: 'Copy_of_Tokomon_c5323292.png', path: '/assets/aistudio/Copy_of_Tokomon_c5323292.png', speciesKeywords: ['tokomon'], displayName: 'Tokomon' },
  { filename: 'Copy_of_Tsunomon_d59ed36b.png', path: '/assets/aistudio/Copy_of_Tsunomon_d59ed36b.png', speciesKeywords: ['tsunomon'], displayName: 'Tsunomon' },
  { filename: 'Copy_of_Yokomon_dd201051.png', path: '/assets/aistudio/Copy_of_Yokomon_dd201051.png', speciesKeywords: ['yokomon'], displayName: 'Yokomon' },
  { filename: 'Copy_of_Yukimibotamon_425de778.png', path: '/assets/aistudio/Copy_of_Yukimibotamon_425de778.png', speciesKeywords: ['yukimibotamon'], displayName: 'Yukimibotamon' },
  { filename: 'Copy_of_Yuramon_3ad2937a.png', path: '/assets/aistudio/Copy_of_Yuramon_3ad2937a.png', speciesKeywords: ['yuramon'], displayName: 'Yuramon' },
];

export function getMatchingSpritesheets(speciesId: string): AvailableSpritesheet[] {
  const cleanId = speciesId.toLowerCase().replace(/[^a-z0-9]/g, '');
  return ALL_AVAILABLE_SPRITESHEETS.filter((sheet) => 
    sheet.speciesKeywords.some((kw) => cleanId.includes(kw) || kw.includes(cleanId))
  );
}

// In-memory cache of saved overrides
let cachedOverrides: Record<string, DigimonSpriteConfig> | null = null;

function loadStoredOverrides(): Record<string, DigimonSpriteConfig> {
  if (typeof window === 'undefined') return {};
  if (cachedOverrides !== null) return cachedOverrides;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cachedOverrides = JSON.parse(raw);
      return cachedOverrides || {};
    }
  } catch (err) {
    console.error('Failed to load custom sprite overrides from storage:', err);
  }
  cachedOverrides = {};
  return cachedOverrides;
}

export function getEffectiveSpriteConfig(speciesId: string): DigimonSpriteConfig | undefined {
  const overrides = loadStoredOverrides();
  if (overrides[speciesId]) {
    return overrides[speciesId];
  }
  return NEW_DIGIMON_SPRITES[speciesId];
}

export function saveCustomSpriteConfig(speciesId: string, config: DigimonSpriteConfig): void {
  if (typeof window === 'undefined') return;
  const current = loadStoredOverrides();
  current[speciesId] = config;
  cachedOverrides = { ...current };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedOverrides));
    window.dispatchEvent(new CustomEvent('digipet-sprites-updated', { detail: { speciesId, config } }));
  } catch (err) {
    console.error('Failed to save custom sprite override to storage:', err);
  }
}

export function resetCustomSpriteConfig(speciesId: string): void {
  if (typeof window === 'undefined') return;
  const current = loadStoredOverrides();
  delete current[speciesId];
  cachedOverrides = { ...current };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedOverrides));
    window.dispatchEvent(new CustomEvent('digipet-sprites-updated', { detail: { speciesId } }));
  } catch (err) {
    console.error('Failed to reset custom sprite config:', err);
  }
}

export function isSpeciesCustomized(speciesId: string): boolean {
  const overrides = loadStoredOverrides();
  return Boolean(overrides[speciesId]);
}

export function exportAllCustomSpritesJSON(): string {
  const current = loadStoredOverrides();
  return JSON.stringify(current, null, 2);
}

export function importCustomSpritesJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed === 'object' && parsed !== null) {
      cachedOverrides = parsed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.dispatchEvent(new CustomEvent('digipet-sprites-updated', { detail: { bulk: true } }));
      return true;
    }
  } catch (err) {
    console.error('Failed to import custom sprites:', err);
  }
  return false;
}

// Gallery button visibility preference
export function getHideGalleryButtonPref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(HIDE_GALLERY_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setHideGalleryButtonPref(hide: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HIDE_GALLERY_KEY, hide ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('digipet-gallery-visibility-changed', { detail: { hide } }));
  } catch (err) {
    console.error('Failed to save hide gallery preference:', err);
  }
}
