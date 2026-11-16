const fs = require('fs');
const path = require('path');

const tsFilePath = path.join(__dirname, '../src/utils/newDigimonSprites.ts');
const tsContent = fs.readFileSync(tsFilePath, 'utf8');
const jsonMatch = tsContent.match(/export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ([\s\S]*?);\s*$/);
const allConfigs = JSON.parse(jsonMatch[1]);

// 1. Botamon
allConfigs['botamon'].frames = {
  standing: [
    { x: 132, y: 48, w: 32, h: 30, rotate: 0 },
    { x: 166, y: 48, w: 33, h: 28, rotate: 0 },
  ],
  walking: [
    { x: 97, y: 85, w: 34, h: 29, rotate: 0 },
    { x: 133, y: 80, w: 33, h: 29, rotate: 0 },
    { x: 168, y: 78, w: 31, h: 31, rotate: 0 },
  ],
  happy: [
    { x: 120, y: 171, w: 36, h: 28, rotate: 0 },
    { x: 158, y: 171, w: 36, h: 28, rotate: 0 },
  ],
  eating: [
    { x: 132, y: 48, w: 32, h: 30, rotate: 0 },
    { x: 120, y: 171, w: 36, h: 28, rotate: 0 },
  ],
  sleeping: [
    { x: 80, y: 126, w: 35, h: 21, rotate: 0 },
  ],
  training: [
    { x: 37, y: 5, w: 30, h: 35, rotate: 0 },
    { x: 2, y: 75, w: 28, h: 37, rotate: 0 },
  ],
  sick: [
    { x: 80, y: 126, w: 35, h: 21, rotate: 0 },
  ],
  sitting: [
    { x: 132, y: 48, w: 32, h: 30, rotate: 0 },
  ],
};

// 2. Koromon
allConfigs['koromon'].frames = {
  standing: [
    { x: 131, y: 87, w: 41, h: 32, rotate: 0 },
    { x: 174, y: 82, w: 41, h: 33, rotate: 0 },
  ],
  walking: [
    { x: 141, y: 121, w: 42, h: 31, rotate: 0 },
    { x: 193, y: 148, w: 40, h: 36, rotate: 0 },
    { x: 145, y: 154, w: 46, h: 38, rotate: 0 },
  ],
  happy: [
    { x: 185, y: 117, w: 41, h: 29, rotate: 0 },
    { x: 174, y: 82, w: 41, h: 33, rotate: 0 },
  ],
  eating: [
    { x: 141, y: 121, w: 42, h: 31, rotate: 0 },
    { x: 185, y: 117, w: 41, h: 29, rotate: 0 },
  ],
  sleeping: [
    { x: 185, y: 117, w: 41, h: 29, rotate: 0 },
  ],
  training: [
    { x: 44, y: 162, w: 49, h: 38, rotate: 0 },
    { x: 95, y: 163, w: 48, h: 36, rotate: 0 },
  ],
  sick: [
    { x: 185, y: 117, w: 41, h: 29, rotate: 0 },
  ],
  sitting: [
    { x: 131, y: 87, w: 41, h: 32, rotate: 0 },
  ],
};

// 3. Tsunomon
allConfigs['tsunomon'].frames = {
  standing: [
    { x: 4, y: 202, w: 42, h: 48, rotate: 0 },
    { x: 50, y: 206, w: 44, h: 44, rotate: 0 },
  ],
  walking: [
    { x: 135, y: 116, w: 44, h: 44, rotate: 0 },
    { x: 141, y: 165, w: 45, h: 42, rotate: 0 },
  ],
  happy: [
    { x: 50, y: 206, w: 44, h: 44, rotate: 0 },
    { x: 4, y: 202, w: 42, h: 48, rotate: 0 },
  ],
  eating: [
    { x: 141, y: 165, w: 45, h: 42, rotate: 0 },
    { x: 50, y: 206, w: 44, h: 44, rotate: 0 },
  ],
  sleeping: [
    { x: 138, y: 2, w: 44, h: 28, rotate: 0 },
  ],
  training: [
    { x: 2, y: 7, w: 42, h: 47, rotate: 0 },
    { x: 46, y: 10, w: 44, h: 44, rotate: 0 },
  ],
  sick: [
    { x: 138, y: 2, w: 44, h: 28, rotate: 0 },
  ],
  sitting: [
    { x: 4, y: 202, w: 42, h: 48, rotate: 0 },
  ],
};

// 4. Agumon
allConfigs['agumon'].frames = {
  standing: [
    { x: 172, y: 76, w: 43, h: 47, rotate: 0 },
    { x: 217, y: 85, w: 42, h: 47, rotate: 0 },
  ],
  walking: [
    { x: 172, y: 125, w: 42, h: 48, rotate: 0 },
    { x: 216, y: 134, w: 46, h: 47, rotate: 0 },
    { x: 264, y: 135, w: 45, h: 46, rotate: 0 },
  ],
  happy: [
    { x: 281, y: 273, w: 41, h: 49, rotate: 0 },
    { x: 172, y: 76, w: 43, h: 47, rotate: 0 },
  ],
  eating: [
    { x: 264, y: 135, w: 45, h: 46, rotate: 0 },
    { x: 281, y: 273, w: 41, h: 49, rotate: 0 },
  ],
  sleeping: [
    { x: 113, y: 284, w: 33, h: 25, rotate: 0 },
  ],
  training: [
    { x: 150, y: 277, w: 66, h: 45, rotate: 0 },
    { x: 218, y: 275, w: 61, h: 47, rotate: 0 },
  ],
  sick: [
    { x: 113, y: 284, w: 33, h: 25, rotate: 0 },
  ],
  sitting: [
    { x: 172, y: 76, w: 43, h: 47, rotate: 0 },
  ],
};

// 5. Greymon
allConfigs['greymon'].frames = {
  standing: [
    { x: 278, y: 32, w: 54, h: 56, rotate: 0 },
    { x: 334, y: 31, w: 52, h: 57, rotate: 0 },
  ],
  walking: [
    { x: 254, y: 209, w: 54, h: 56, rotate: 0 },
    { x: 310, y: 209, w: 52, h: 56, rotate: 0 },
    { x: 233, y: 268, w: 55, h: 56, rotate: 0 },
  ],
  happy: [
    { x: 285, y: 90, w: 52, h: 57, rotate: 0 },
    { x: 278, y: 32, w: 54, h: 56, rotate: 0 },
  ],
  eating: [
    { x: 285, y: 90, w: 52, h: 57, rotate: 0 },
    { x: 334, y: 31, w: 52, h: 57, rotate: 0 },
  ],
  sleeping: [
    { x: 2, y: 10, w: 62, h: 22, rotate: 0 },
  ],
  training: [
    { x: 154, y: 333, w: 62, h: 54, rotate: 0 },
    { x: 218, y: 333, w: 62, h: 54, rotate: 0 },
  ],
  sick: [
    { x: 2, y: 10, w: 62, h: 22, rotate: 0 },
  ],
  sitting: [
    { x: 278, y: 32, w: 54, h: 56, rotate: 0 },
  ],
};

// 6. MetalGreymon
allConfigs['metalgreymon'].frames = {
  standing: [
    { x: 2, y: 317, w: 113, h: 86, rotate: 0 },
    { x: 119, y: 319, w: 97, h: 86, rotate: 0 },
  ],
  walking: [
    { x: 233, y: 327, w: 103, h: 82, rotate: 0 },
    { x: 345, y: 333, w: 102, h: 78, rotate: 0 },
    { x: 233, y: 411, w: 110, h: 81, rotate: 0 },
  ],
  happy: [
    { x: 350, y: 81, w: 90, h: 79, rotate: 0 },
    { x: 2, y: 317, w: 113, h: 86, rotate: 0 },
  ],
  eating: [
    { x: 350, y: 81, w: 90, h: 79, rotate: 0 },
    { x: 119, y: 319, w: 97, h: 86, rotate: 0 },
  ],
  sleeping: [
    { x: 350, y: 2, w: 90, h: 77, rotate: 0 },
  ],
  training: [
    { x: 2, y: 58, w: 99, h: 87, rotate: 0 },
    { x: 2, y: 147, w: 109, h: 81, rotate: 0 },
  ],
  sick: [
    { x: 350, y: 2, w: 90, h: 77, rotate: 0 },
  ],
  sitting: [
    { x: 2, y: 317, w: 113, h: 86, rotate: 0 },
  ],
};

// 7. WarGreymon
allConfigs['wargreymon'].frames = {
  standing: [
    { x: 257, y: 2, w: 78, h: 81, rotate: 0 },
    { x: 337, y: 2, w: 76, h: 81, rotate: 0 },
    { x: 415, y: 3, w: 78, h: 80, rotate: 0 },
  ],
  walking: [
    { x: 406, y: 164, w: 76, h: 82, rotate: 0 },
    { x: 240, y: 220, w: 76, h: 82, rotate: 0 },
  ],
  happy: [
    { x: 406, y: 85, w: 80, h: 77, rotate: 0 },
    { x: 257, y: 2, w: 78, h: 81, rotate: 0 },
  ],
  eating: [
    { x: 406, y: 164, w: 76, h: 82, rotate: 0 },
    { x: 257, y: 2, w: 78, h: 81, rotate: 0 },
  ],
  sleeping: [
    { x: 358, y: 416, w: 92, h: 28, rotate: 0 },
  ],
  training: [
    { x: 62, y: 121, w: 96, h: 97, rotate: 0 },
    { x: 258, y: 126, w: 73, h: 92, rotate: 0 },
    { x: 333, y: 131, w: 71, h: 88, rotate: 0 },
  ],
  sick: [
    { x: 358, y: 416, w: 92, h: 28, rotate: 0 },
  ],
  sitting: [
    { x: 257, y: 2, w: 78, h: 81, rotate: 0 },
  ],
};

// 8. Garurumon
allConfigs['garurumon'].frames = {
  standing: [
    { x: 225, y: 25, w: 53, h: 58, rotate: 0 },
    { x: 280, y: 29, w: 54, h: 56, rotate: 0 },
  ],
  walking: [
    { x: 312, y: 104, w: 56, h: 54, rotate: 0 },
    { x: 370, y: 104, w: 54, h: 54, rotate: 0 },
    { x: 256, y: 114, w: 54, h: 56, rotate: 0 },
  ],
  happy: [
    { x: 280, y: 29, w: 54, h: 56, rotate: 0 },
    { x: 225, y: 25, w: 53, h: 58, rotate: 0 },
  ],
  eating: [
    { x: 312, y: 104, w: 56, h: 54, rotate: 0 },
    { x: 225, y: 25, w: 53, h: 58, rotate: 0 },
  ],
  sleeping: [
    { x: 277, y: 382, w: 72, h: 22, rotate: 0 },
  ],
  training: [
    { x: 4, y: 131, w: 67, h: 63, rotate: 0 },
    { x: 75, y: 147, w: 83, h: 49, rotate: 0 },
  ],
  sick: [
    { x: 277, y: 382, w: 72, h: 22, rotate: 0 },
  ],
  sitting: [
    { x: 225, y: 25, w: 53, h: 58, rotate: 0 },
  ],
};

// 9. Gabumon
allConfigs['gabumon'].frames = {
  standing: [
    { x: 260, y: 172, w: 54, h: 50, rotate: 0 },
    { x: 280, y: 60, w: 60, h: 55, rotate: 0 },
  ],
  walking: [
    { x: 260, y: 220, w: 65, h: 50, rotate: 0 },
    { x: 325, y: 220, w: 65, h: 50, rotate: 0 },
    { x: 390, y: 220, w: 60, h: 50, rotate: 0 },
  ],
  happy: [
    { x: 280, y: 60, w: 60, h: 55, rotate: 0 },
    { x: 260, y: 172, w: 54, h: 50, rotate: 0 },
  ],
  eating: [
    { x: 260, y: 220, w: 65, h: 50, rotate: 0 },
    { x: 260, y: 172, w: 54, h: 50, rotate: 0 },
  ],
  sleeping: [
    { x: 106, y: 2, w: 65, h: 26, rotate: 0 },
  ],
  training: [
    { x: 181, y: 112, w: 52, h: 62, rotate: 0 },
    { x: 21, y: 118, w: 65, h: 55, rotate: 0 },
  ],
  sick: [
    { x: 106, y: 2, w: 65, h: 26, rotate: 0 },
  ],
  sitting: [
    { x: 260, y: 172, w: 54, h: 50, rotate: 0 },
  ],
};

// Save updated src/utils/newDigimonSprites.ts
const newTsContent = `// Auto-generated Clean & Authentic Digimon Championship Sprite Configurations
export interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
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

fs.writeFileSync(tsFilePath, newTsContent);
console.log('Successfully updated newDigimonSprites.ts with verified upright frames!');
