const fs = require('fs');
const path = require('path');

// Run generate_all_curated_sprites to get base clean configs
require('./generate_all_curated_sprites.cjs');

// Read the generated file
const tsFilePath = path.join(process.cwd(), 'src/utils/newDigimonSprites.ts');
const tsContent = fs.readFileSync(tsFilePath, 'utf8');
const jsonMatch = tsContent.match(/export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ([\s\S]*?);\s*$/);
if (!jsonMatch) {
  console.error('Failed to match json in newDigimonSprites.ts');
  process.exit(1);
}
const allConfigs = JSON.parse(jsonMatch[1]);

// 1. Add Yukimibotamon
allConfigs['yukimibotamon'] = {
  sheetPath: '/assets/aistudio/Copy_of_Yukimibotamon_425de778.png',
  sheetWidth: 180,
  sheetHeight: 180,
  frames: {
    standing: [
      { x: 30, y: 5, w: 35, h: 27 },
      { x: 31, y: 34, w: 35, h: 29 },
    ],
    walking: [
      { x: 2, y: 82, w: 36, h: 30 },
      { x: 70, y: 85, w: 34, h: 31 },
      { x: 106, y: 84, w: 35, h: 29 },
      { x: 143, y: 70, w: 35, h: 29 },
    ],
    happy: [
      { x: 101, y: 24, w: 35, h: 28 },
      { x: 139, y: 40, w: 35, h: 28 },
    ],
    eating: [
      { x: 80, y: 148, w: 38, h: 30 },
      { x: 120, y: 148, w: 37, h: 30 },
    ],
    sleeping: [
      { x: 80, y: 118, w: 39, h: 28 },
    ],
    training: [
      { x: 101, y: 54, w: 36, h: 28 },
      { x: 2, y: 114, w: 37, h: 31 },
    ],
    sick: [
      { x: 42, y: 146, w: 36, h: 32 },
    ],
    sitting: [
      { x: 30, y: 5, w: 35, h: 27 },
    ],
  }
};

// 2. Add Tentomon
allConfigs['tentomon'] = {
  sheetPath: '/assets/aistudio/Copy_of_Tentomon_326c02c3.png',
  sheetWidth: 435,
  sheetHeight: 435,
  frames: {
    standing: [
      { x: 55, y: 15, w: 55, h: 53 },
      { x: 112, y: 15, w: 54, h: 53 },
    ],
    walking: [
      { x: 2, y: 70, w: 57, h: 54 },
      { x: 61, y: 70, w: 51, h: 50 },
      { x: 114, y: 71, w: 51, h: 52 },
      { x: 167, y: 71, w: 49, h: 54 },
    ],
    happy: [
      { x: 168, y: 15, w: 52, h: 54 },
      { x: 222, y: 15, w: 49, h: 56 },
    ],
    eating: [
      { x: 2, y: 126, w: 57, h: 55 },
      { x: 61, y: 122, w: 49, h: 60 },
    ],
    sleeping: [
      { x: 347, y: 281, w: 53, h: 54 },
    ],
    training: [
      { x: 160, y: 127, w: 52, h: 55 },
      { x: 2, y: 183, w: 57, h: 56 },
    ],
    sick: [
      { x: 220, y: 298, w: 61, h: 35 },
    ],
    sitting: [
      { x: 55, y: 15, w: 55, h: 53 },
    ],
  }
};

// 3. Add Kabuterimon
allConfigs['kabuterimon'] = {
  sheetPath: '/assets/aistudio/Kabuterimon_07cf7d29.png',
  sheetWidth: 366,
  sheetHeight: 366,
  frames: {
    standing: [
      { x: 160, y: 116, w: 65, h: 58 },
      { x: 227, y: 116, w: 61, h: 58 },
    ],
    walking: [
      { x: 93, y: 117, w: 65, h: 62 },
      { x: 160, y: 116, w: 65, h: 58 },
      { x: 227, y: 116, w: 61, h: 58 },
      { x: 308, y: 120, w: 56, h: 59 },
    ],
    happy: [
      { x: 175, y: 176, w: 65, h: 62 },
      { x: 242, y: 176, w: 64, h: 64 },
    ],
    eating: [
      { x: 105, y: 181, w: 68, h: 57 },
      { x: 160, y: 116, w: 65, h: 58 },
    ],
    sleeping: [
      { x: 2, y: 310, w: 100, h: 53 },
    ],
    training: [
      { x: 2, y: 239, w: 99, h: 59 },
      { x: 239, y: 242, w: 66, h: 58 },
    ],
    sick: [
      { x: 105, y: 310, w: 99, h: 53 },
    ],
    sitting: [
      { x: 160, y: 116, w: 65, h: 58 },
    ],
  }
};

// 4. Overwrite all 21 clean fixes
const cleanData = JSON.parse(fs.readFileSync('public/clean_frames_output.json', 'utf8'));
for (const [id, cfg] of Object.entries(cleanData)) {
  allConfigs[id] = {
    sheetPath: cfg.sheetPath,
    sheetWidth: cfg.sheetWidth,
    sheetHeight: cfg.sheetHeight,
    frames: {
      standing: cfg.standing,
      walking: cfg.walking,
      happy: cfg.happy,
      eating: cfg.happy || cfg.standing,
      sleeping: cfg.sleeping,
      training: cfg.training,
      sick: cfg.sleeping,
      sitting: cfg.standing,
    }
  };
  console.log(`Applied clean config for ${id}`);
}

// 5. Write out pristine newDigimonSprites.ts
const outputTs = `// Auto-generated Clean & Authentic Digimon Championship Sprite Configurations
export interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  sheetPath?: string;
  sheetWidth?: number;
  sheetHeight?: number;
}

export interface DigimonSpriteConfig {
  sheetPath: string;
  sheetWidth: number;
  sheetHeight: number;
  frames: {
    standing: SpriteFrame[];
    walking: SpriteFrame[];
    happy: SpriteFrame[];
    eating: SpriteFrame[];
    sleeping: SpriteFrame[];
    training: SpriteFrame[];
    sick: SpriteFrame[];
    sitting: SpriteFrame[];
  };
}

export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ${JSON.stringify(allConfigs, null, 2)};
`;

fs.writeFileSync(tsFilePath, outputTs, 'utf8');
console.log('Saved pristine newDigimonSprites.ts successfully!');
