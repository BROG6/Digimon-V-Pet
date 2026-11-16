const fs = require('fs');
const path = require('path');

const tsFilePath = path.join(process.cwd(), 'src/utils/newDigimonSprites.ts');
const tsContent = fs.readFileSync(tsFilePath, 'utf8');
const jsonMatch = tsContent.match(/export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ([\s\S]*?);\s*$/);
if (!jsonMatch) {
  console.error('Failed to match json in newDigimonSprites.ts');
  process.exit(1);
}
const allConfigs = JSON.parse(jsonMatch[1]);

// Update Motimon
allConfigs['motimon'] = {
  sheetPath: '/assets/aistudio/Motimon_5cc21ee4.png',
  sheetWidth: 192,
  sheetHeight: 192,
  frames: {
    standing: [
      { x: 2, y: 5, w: 32, h: 38 },
      { x: 85, y: 69, w: 33, h: 38 },
    ],
    walking: [
      { x: 2, y: 5, w: 32, h: 38 },
      { x: 85, y: 69, w: 33, h: 38 },
      { x: 86, y: 109, w: 34, h: 41 },
      { x: 44, y: 152, w: 39, h: 38 },
    ],
    happy: [
      { x: 44, y: 152, w: 39, h: 38 },
      { x: 86, y: 109, w: 34, h: 41 },
    ],
    eating: [
      { x: 44, y: 152, w: 39, h: 38 },
      { x: 2, y: 5, w: 32, h: 38 },
    ],
    sleeping: [
      { x: 159, y: 71, w: 31, h: 44 },
    ],
    training: [
      { x: 86, y: 109, w: 34, h: 41 },
      { x: 44, y: 152, w: 39, h: 38 },
    ],
    sick: [
      { x: 159, y: 71, w: 31, h: 44 },
    ],
    sitting: [
      { x: 2, y: 5, w: 32, h: 38 },
    ],
  }
};

// Update MegaKabuterimon
allConfigs['megakabuterimon'] = {
  sheetPath: '/assets/aistudio/Copy_of_MegaKabuterimon_42236ae2.png',
  sheetWidth: 481,
  sheetHeight: 481,
  frames: {
    standing: [
      { x: 373, y: 11, w: 74, h: 74 },
      { x: 373, y: 87, w: 74, h: 75 },
    ],
    walking: [
      { x: 373, y: 11, w: 74, h: 74 },
      { x: 373, y: 87, w: 74, h: 75 },
      { x: 373, y: 164, w: 80, h: 76 },
      { x: 293, y: 242, w: 79, h: 78 },
    ],
    happy: [
      { x: 373, y: 11, w: 74, h: 74 },
      { x: 293, y: 242, w: 79, h: 78 },
    ],
    eating: [
      { x: 373, y: 11, w: 74, h: 74 },
      { x: 373, y: 87, w: 74, h: 75 },
    ],
    sleeping: [
      { x: 213, y: 232, w: 79, h: 82 },
    ],
    training: [
      { x: 373, y: 164, w: 80, h: 76 },
      { x: 293, y: 242, w: 79, h: 78 },
    ],
    sick: [
      { x: 213, y: 232, w: 79, h: 82 },
    ],
    sitting: [
      { x: 373, y: 11, w: 74, h: 74 },
    ],
  }
};

// Update HerculesKabuterimon
allConfigs['herculeskabuterimon'] = {
  sheetPath: '/assets/aistudio/HerculesKabuterimon_2_89341216.png',
  sheetWidth: 499,
  sheetHeight: 499,
  frames: {
    standing: [
      { x: 2, y: 6, w: 100, h: 86 },
      { x: 2, y: 288, w: 99, h: 104 },
    ],
    walking: [
      { x: 2, y: 6, w: 100, h: 86 },
      { x: 197, y: 411, w: 97, h: 86 },
      { x: 2, y: 394, w: 101, h: 103 },
      { x: 296, y: 413, w: 95, h: 84 },
    ],
    happy: [
      { x: 2, y: 288, w: 99, h: 104 },
      { x: 393, y: 413, w: 90, h: 84 },
    ],
    eating: [
      { x: 2, y: 6, w: 100, h: 86 },
      { x: 2, y: 288, w: 99, h: 104 },
    ],
    sleeping: [
      { x: 369, y: 99, w: 112, h: 47 },
    ],
    training: [
      { x: 2, y: 394, w: 101, h: 103 },
      { x: 393, y: 413, w: 90, h: 84 },
    ],
    sick: [
      { x: 369, y: 99, w: 112, h: 47 },
    ],
    sitting: [
      { x: 2, y: 6, w: 100, h: 86 },
    ],
  }
};

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
console.log('Successfully updated Motimon, MegaKabuterimon, and HerculesKabuterimon!');
