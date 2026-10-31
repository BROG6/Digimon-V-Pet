import fs from "fs";
import { NEW_DIGIMON_SPRITES } from "../src/utils/newDigimonSprites";

const updates: Record<string, any> = {
  // === PALMON LINEAGE ===
  yuramon: {
    standing: [
      { x: 77, y: 33, w: 36, h: 35, rotate: 0 },
      { x: 115, y: 33, w: 36, h: 35, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 33, w: 35, h: 38, rotate: 0 },
      { x: 39, y: 33, w: 36, h: 36, rotate: 0 },
      { x: 77, y: 33, w: 36, h: 35, rotate: 0 },
      { x: 115, y: 33, w: 36, h: 35, rotate: 0 }
    ],
    sitting: [{ x: 77, y: 33, w: 36, h: 35, rotate: 0 }],
    sleeping: [{ x: 153, y: 67, w: 32, h: 33, rotate: 0 }],
    sick: [{ x: 153, y: 67, w: 32, h: 33, rotate: 0 }]
  },
  tanemon: {
    standing: [
      { x: 124, y: 194, w: 39, h: 39, rotate: 0 },
      { x: 205, y: 194, w: 38, h: 38, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 194, w: 43, h: 39, rotate: 0 },
      { x: 84, y: 194, w: 38, h: 40, rotate: 0 },
      { x: 124, y: 194, w: 39, h: 39, rotate: 0 },
      { x: 165, y: 194, w: 38, h: 39, rotate: 0 }
    ],
    sitting: [{ x: 124, y: 194, w: 39, h: 39, rotate: 0 }],
    sleeping: [{ x: 41, y: 56, w: 46, h: 22, rotate: 0 }],
    sick: [{ x: 41, y: 56, w: 46, h: 22, rotate: 0 }]
  },
  palmon: {
    standing: [
      { x: 54, y: 5, w: 42, h: 46, rotate: 0 },
      { x: 98, y: 5, w: 43, h: 46, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 51, w: 48, h: 48, rotate: 0 },
      { x: 52, y: 51, w: 36, h: 48, rotate: 0 },
      { x: 90, y: 51, w: 36, h: 48, rotate: 0 },
      { x: 161, y: 51, w: 41, h: 50, rotate: 0 }
    ],
    sitting: [{ x: 54, y: 5, w: 42, h: 46, rotate: 0 }],
    sleeping: [{ x: 218, y: 278, w: 32, h: 20, rotate: 0 }],
    sick: [{ x: 218, y: 278, w: 32, h: 20, rotate: 0 }]
  },
  togemon: {
    standing: [
      { x: 2, y: 2, w: 55, h: 51, rotate: 0 },
      { x: 59, y: 2, w: 55, h: 51, rotate: 0 }
    ],
    walking: [
      { x: 150, y: 302, w: 59, h: 55, rotate: 0 },
      { x: 211, y: 302, w: 57, h: 55, rotate: 0 },
      { x: 270, y: 302, w: 55, h: 55, rotate: 0 },
      { x: 211, y: 302, w: 57, h: 55, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 2, w: 55, h: 51, rotate: 0 }],
    sleeping: [{ x: 207, y: 113, w: 40, h: 48, rotate: 0 }],
    sick: [{ x: 207, y: 113, w: 40, h: 48, rotate: 0 }]
  },
  lillymon: {
    standing: [
      { x: 45, y: 16, w: 35, h: 54, rotate: 0 },
      { x: 82, y: 15, w: 38, h: 54, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 17, w: 41, h: 53, rotate: 0 },
      { x: 2, y: 72, w: 46, h: 54, rotate: 0 },
      { x: 92, y: 71, w: 37, h: 56, rotate: 0 },
      { x: 131, y: 71, w: 36, h: 56, rotate: 0 }
    ],
    sitting: [{ x: 45, y: 16, w: 35, h: 54, rotate: 0 }],
    sleeping: [{ x: 185, y: 45, w: 37, h: 33, rotate: 0 }],
    sick: [{ x: 185, y: 45, w: 37, h: 33, rotate: 0 }]
  },
  rosemon: {
    standing: [
      { x: 2, y: 2, w: 73, h: 75, rotate: 0 },
      { x: 77, y: 2, w: 73, h: 75, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 2, w: 73, h: 75, rotate: 0 },
      { x: 15, y: 110, w: 69, h: 72, rotate: 0 },
      { x: 77, y: 2, w: 73, h: 75, rotate: 0 },
      { x: 134, y: 109, w: 77, h: 71, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 2, w: 73, h: 75, rotate: 0 }],
    sleeping: [{ x: 225, y: 125, w: 80, h: 52, rotate: 0 }],
    sick: [{ x: 225, y: 125, w: 80, h: 52, rotate: 0 }]
  },

  // === GOMAMON LINEAGE ===
  pichimon: {
    standing: [
      { x: 36, y: 75, w: 35, h: 34, rotate: 0 },
      { x: 73, y: 76, w: 26, h: 33, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 202, w: 39, h: 39, rotate: 0 },
      { x: 43, y: 203, w: 36, h: 38, rotate: 0 },
      { x: 81, y: 217, w: 36, h: 37, rotate: 0 },
      { x: 119, y: 219, w: 38, h: 35, rotate: 0 }
    ],
    sitting: [{ x: 36, y: 75, w: 35, h: 34, rotate: 0 }],
    sleeping: [{ x: 101, y: 77, w: 33, h: 26, rotate: 0 }],
    sick: [{ x: 101, y: 77, w: 33, h: 26, rotate: 0 }]
  },
  bukamon: {
    standing: [
      { x: 128, y: 3, w: 60, h: 48, rotate: 0 },
      { x: 190, y: 7, w: 49, h: 49, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 232, w: 52, h: 69, rotate: 0 },
      { x: 56, y: 240, w: 55, h: 61, rotate: 0 },
      { x: 113, y: 243, w: 56, h: 58, rotate: 0 },
      { x: 171, y: 243, w: 55, h: 58, rotate: 0 }
    ],
    sitting: [{ x: 128, y: 3, w: 60, h: 48, rotate: 0 }],
    sleeping: [{ x: 2, y: 3, w: 59, h: 28, rotate: 0 }],
    sick: [{ x: 2, y: 3, w: 59, h: 28, rotate: 0 }]
  },
  gomamon: {
    standing: [
      { x: 2, y: 2, w: 57, h: 38, rotate: 0 },
      { x: 61, y: 2, w: 57, h: 38, rotate: 0 }
    ],
    walking: [
      { x: 70, y: 157, w: 65, h: 47, rotate: 0 },
      { x: 137, y: 150, w: 60, h: 44, rotate: 0 },
      { x: 203, y: 158, w: 57, h: 40, rotate: 0 },
      { x: 262, y: 157, w: 57, h: 39, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 2, w: 57, h: 38, rotate: 0 }],
    sleeping: [{ x: 71, y: 206, w: 70, h: 32, rotate: 0 }],
    sick: [{ x: 71, y: 206, w: 70, h: 32, rotate: 0 }]
  },
  ikkakumon: {
    standing: [
      { x: 2, y: 3, w: 58, h: 62, rotate: 0 },
      { x: 62, y: 2, w: 57, h: 60, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 67, w: 60, h: 65, rotate: 0 },
      { x: 64, y: 64, w: 48, h: 65, rotate: 0 },
      { x: 114, y: 87, w: 57, h: 62, rotate: 0 },
      { x: 173, y: 95, w: 56, h: 62, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 3, w: 58, h: 62, rotate: 0 }],
    sleeping: [{ x: 163, y: 324, w: 42, h: 25, rotate: 0 }],
    sick: [{ x: 163, y: 324, w: 42, h: 25, rotate: 0 }]
  },
  zudomon: {
    standing: [
      { x: 2, y: 31, w: 126, h: 153, rotate: 0 },
      { x: 130, y: 31, w: 125, h: 153, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 31, w: 126, h: 153, rotate: 0 },
      { x: 9, y: 356, w: 123, h: 147, rotate: 0 },
      { x: 130, y: 31, w: 125, h: 153, rotate: 0 },
      { x: 154, y: 362, w: 116, h: 142, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 31, w: 126, h: 153, rotate: 0 }],
    sleeping: [{ x: 268, y: 33, w: 100, h: 102, rotate: 0 }],
    sick: [{ x: 268, y: 33, w: 100, h: 102, rotate: 0 }]
  },
  vikemon: {
    standing: [
      { x: 2, y: 2, w: 109, h: 129, rotate: 0 },
      { x: 113, y: 2, w: 109, h: 129, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 133, w: 112, h: 129, rotate: 0 },
      { x: 116, y: 133, w: 107, h: 129, rotate: 0 },
      { x: 225, y: 133, w: 111, h: 128, rotate: 0 },
      { x: 118, y: 264, w: 109, h: 128, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 2, w: 109, h: 129, rotate: 0 }],
    sleeping: [{ x: 2, y: 394, w: 134, h: 116, rotate: 0 }],
    sick: [{ x: 2, y: 394, w: 134, h: 116, rotate: 0 }]
  },

  // === PATAMON LINEAGE ===
  poyomon: {
    standing: [
      { x: 2, y: 31, w: 38, h: 40, rotate: 0 },
      { x: 42, y: 31, w: 38, h: 39, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 31, w: 38, h: 40, rotate: 0 },
      { x: 42, y: 31, w: 38, h: 39, rotate: 0 },
      { x: 82, y: 28, w: 29, h: 42, rotate: 0 },
      { x: 42, y: 31, w: 38, h: 39, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 31, w: 38, h: 40, rotate: 0 }],
    sleeping: [{ x: 151, y: 90, w: 40, h: 35, rotate: 0 }],
    sick: [{ x: 151, y: 90, w: 40, h: 35, rotate: 0 }]
  },
  tokomon: {
    standing: [
      { x: 177, y: 17, w: 38, h: 39, rotate: 0 },
      { x: 217, y: 19, w: 39, h: 39, rotate: 0 }
    ],
    walking: [
      { x: 75, y: 135, w: 40, h: 36, rotate: 0 },
      { x: 135, y: 129, w: 41, h: 39, rotate: 0 },
      { x: 178, y: 141, w: 44, h: 39, rotate: 0 },
      { x: 224, y: 145, w: 41, h: 40, rotate: 0 }
    ],
    sitting: [{ x: 177, y: 17, w: 38, h: 39, rotate: 0 }],
    sleeping: [{ x: 111, y: 229, w: 62, h: 23, rotate: 0 }],
    sick: [{ x: 111, y: 229, w: 62, h: 23, rotate: 0 }]
  },
  patamon: {
    standing: [
      { x: 46, y: 2, w: 46, h: 46, rotate: 0 },
      { x: 94, y: 4, w: 47, h: 44, rotate: 0 }
    ],
    walking: [
      { x: 46, y: 2, w: 46, h: 46, rotate: 0 },
      { x: 46, y: 50, w: 48, h: 45, rotate: 0 },
      { x: 94, y: 4, w: 47, h: 44, rotate: 0 },
      { x: 96, y: 50, w: 48, h: 44, rotate: 0 }
    ],
    sitting: [{ x: 46, y: 2, w: 46, h: 46, rotate: 0 }],
    sleeping: [{ x: 280, y: 239, w: 24, h: 15, rotate: 0 }],
    sick: [{ x: 280, y: 239, w: 24, h: 15, rotate: 0 }]
  },
  angemon: {
    standing: [
      { x: 2, y: 40, w: 71, h: 74, rotate: 0 },
      { x: 75, y: 44, w: 76, h: 69, rotate: 0 }
    ],
    walking: [
      { x: 83, y: 295, w: 74, h: 73, rotate: 0 },
      { x: 174, y: 295, w: 69, h: 75, rotate: 0 },
      { x: 245, y: 295, w: 68, h: 74, rotate: 0 },
      { x: 315, y: 295, w: 68, h: 74, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 40, w: 71, h: 74, rotate: 0 }],
    sleeping: [{ x: 266, y: 445, w: 112, h: 18, rotate: 0 }],
    sick: [{ x: 266, y: 445, w: 112, h: 18, rotate: 0 }]
  },
  magnaangemon: {
    standing: [
      { x: 323, y: 2, w: 86, h: 102, rotate: 0 },
      { x: 411, y: 2, w: 86, h: 102, rotate: 0 }
    ],
    walking: [
      { x: 323, y: 2, w: 86, h: 102, rotate: 0 },
      { x: 308, y: 110, w: 87, h: 111, rotate: 0 },
      { x: 411, y: 2, w: 86, h: 102, rotate: 0 },
      { x: 397, y: 106, w: 87, h: 110, rotate: 0 }
    ],
    sitting: [{ x: 323, y: 2, w: 86, h: 102, rotate: 0 }],
    sleeping: [{ x: 78, y: 7, w: 98, h: 24, rotate: 0 }],
    sick: [{ x: 78, y: 7, w: 98, h: 24, rotate: 0 }]
  },
  seraphimon: {
    standing: [
      { x: 2, y: 18, w: 82, h: 114, rotate: 0 },
      { x: 86, y: 23, w: 79, h: 109, rotate: 0 }
    ],
    walking: [
      { x: 167, y: 36, w: 80, h: 108, rotate: 0 },
      { x: 2, y: 18, w: 82, h: 114, rotate: 0 },
      { x: 249, y: 31, w: 76, h: 111, rotate: 0 },
      { x: 86, y: 23, w: 79, h: 109, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 18, w: 82, h: 114, rotate: 0 }],
    sleeping: [{ x: 169, y: 18, w: 44, h: 25, rotate: 0 }],
    sick: [{ x: 169, y: 18, w: 44, h: 25, rotate: 0 }]
  },

  // === GATOMON LINEAGE ===
  nyaromon: {
    standing: [
      { x: 110, y: 4, w: 40, h: 35, rotate: 0 },
      { x: 193, y: 4, w: 38, h: 39, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 87, w: 47, h: 35, rotate: 0 },
      { x: 53, y: 87, w: 48, h: 34, rotate: 0 },
      { x: 103, y: 87, w: 44, h: 40, rotate: 0 },
      { x: 149, y: 87, w: 42, h: 39, rotate: 0 }
    ],
    sitting: [{ x: 110, y: 4, w: 40, h: 35, rotate: 0 }],
    sleeping: [{ x: 87, y: 217, w: 66, h: 33, rotate: 0 }],
    sick: [{ x: 87, y: 217, w: 66, h: 33, rotate: 0 }]
  },
  salamon: {
    standing: [
      { x: 85, y: 21, w: 54, h: 47, rotate: 0 },
      { x: 141, y: 21, w: 51, h: 47, rotate: 0 }
    ],
    walking: [
      { x: 85, y: 21, w: 54, h: 47, rotate: 0 },
      { x: 85, y: 70, w: 50, h: 54, rotate: 0 },
      { x: 141, y: 21, w: 51, h: 47, rotate: 0 },
      { x: 137, y: 70, w: 47, h: 53, rotate: 0 }
    ],
    sitting: [{ x: 85, y: 21, w: 54, h: 47, rotate: 0 }],
    sleeping: [{ x: 131, y: 235, w: 77, h: 11, rotate: 0 }],
    sick: [{ x: 131, y: 235, w: 77, h: 11, rotate: 0 }]
  },
  gatomon: {
    standing: [
      { x: 238, y: 11, w: 46, h: 50, rotate: 0 },
      { x: 286, y: 12, w: 47, h: 49, rotate: 0 }
    ],
    walking: [
      { x: 42, y: 273, w: 54, h: 60, rotate: 0 },
      { x: 146, y: 275, w: 52, h: 58, rotate: 0 },
      { x: 200, y: 276, w: 56, h: 57, rotate: 0 },
      { x: 258, y: 277, w: 55, h: 56, rotate: 0 }
    ],
    sitting: [{ x: 238, y: 11, w: 46, h: 50, rotate: 0 }],
    sleeping: [{ x: 121, y: 10, w: 63, h: 19, rotate: 0 }],
    sick: [{ x: 121, y: 10, w: 63, h: 19, rotate: 0 }]
  },
  angewomon: {
    standing: [
      { x: 2, y: 27, w: 74, h: 93, rotate: 0 },
      { x: 144, y: 23, w: 73, h: 92, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 122, w: 75, h: 94, rotate: 0 },
      { x: 79, y: 117, w: 59, h: 99, rotate: 0 },
      { x: 140, y: 117, w: 74, h: 93, rotate: 0 },
      { x: 79, y: 117, w: 59, h: 99, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 27, w: 74, h: 93, rotate: 0 }],
    sleeping: [{ x: 429, y: 300, w: 65, h: 25, rotate: 0 }],
    sick: [{ x: 429, y: 300, w: 65, h: 25, rotate: 0 }]
  },
  magnadramon: {
    standing: [
      { x: 370, y: 2, w: 103, h: 97, rotate: 0 },
      { x: 2, y: 403, w: 100, h: 107, rotate: 0 }
    ],
    walking: [
      { x: 2, y: 403, w: 100, h: 107, rotate: 0 },
      { x: 104, y: 407, w: 102, h: 103, rotate: 0 },
      { x: 208, y: 415, w: 106, h: 95, rotate: 0 },
      { x: 316, y: 416, w: 107, h: 94, rotate: 0 }
    ],
    happy: [
      { x: 370, y: 2, w: 103, h: 97, rotate: 0 },
      { x: 280, y: 6, w: 78, h: 63, rotate: 0 }
    ],
    eating: [
      { x: 370, y: 2, w: 103, h: 97, rotate: 0 },
      { x: 280, y: 6, w: 78, h: 63, rotate: 0 }
    ],
    training: [
      { x: 2, y: 403, w: 100, h: 107, rotate: 0 },
      { x: 337, y: 307, w: 88, h: 107, rotate: 0 },
      { x: 427, y: 345, w: 80, h: 106, rotate: 0 },
      { x: 426, y: 454, w: 47, h: 55, rotate: 0 }
    ],
    sitting: [{ x: 2, y: 11, w: 107, h: 56, rotate: 0 }],
    sleeping: [{ x: 2, y: 11, w: 107, h: 56, rotate: 0 }],
    sick: [{ x: 2, y: 11, w: 107, h: 56, rotate: 0 }]
  }
};

const yukimibotamonConfig = {
  sheetPath: "/assets/yukimibotamon_transparent.png",
  sheetWidth: 144,
  sheetHeight: 192,
  frames: {
    standing: [
      { x: 0, y: 0, w: 48, h: 48, rotate: 0 },
      { x: 48, y: 0, w: 48, h: 48, rotate: 0 },
      { x: 96, y: 0, w: 48, h: 48, rotate: 0 }
    ],
    walking: [
      { x: 0, y: 48, w: 48, h: 48, rotate: 0 },
      { x: 48, y: 48, w: 48, h: 48, rotate: 0 },
      { x: 96, y: 48, w: 48, h: 48, rotate: 0 },
      { x: 48, y: 48, w: 48, h: 48, rotate: 0 }
    ],
    happy: [
      { x: 48, y: 0, w: 48, h: 48, rotate: 0 },
      { x: 96, y: 0, w: 48, h: 48, rotate: 0 }
    ],
    eating: [
      { x: 0, y: 0, w: 48, h: 48, rotate: 0 },
      { x: 48, y: 48, w: 48, h: 48, rotate: 0 }
    ],
    sleeping: [
      { x: 0, y: 144, w: 48, h: 48, rotate: 0 }
    ],
    training: [
      { x: 0, y: 48, w: 48, h: 48, rotate: 0 },
      { x: 96, y: 48, w: 48, h: 48, rotate: 0 },
      { x: 96, y: 0, w: 48, h: 48, rotate: 0 }
    ],
    sick: [
      { x: 48, y: 144, w: 48, h: 48, rotate: 0 }
    ],
    sitting: [
      { x: 0, y: 0, w: 48, h: 48, rotate: 0 }
    ]
  }
};

// Apply updates into the master object
const cloned = { ...NEW_DIGIMON_SPRITES };
cloned.yukimibotamon = yukimibotamonConfig;

for (const [id, poses] of Object.entries(updates)) {
  if (cloned[id]) {
    cloned[id] = {
      ...cloned[id],
      frames: {
        ...cloned[id].frames,
        ...poses
      }
    };
  }
}

// Generate the updated typescript code
const header = `// Auto-generated Clean & Authentic Digimon Championship Sprite Configurations
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

export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = `;

const jsonContent = JSON.stringify(cloned, null, 2);
fs.writeFileSync("src/utils/newDigimonSprites.ts", header + jsonContent + ";\n", "utf8");
console.log("Successfully updated src/utils/newDigimonSprites.ts!");
