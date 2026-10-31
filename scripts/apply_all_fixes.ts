import fs from 'fs';

// 1. UPDATE newDigimonSprites.ts
const spriteFilePath = 'src/utils/newDigimonSprites.ts';
let spriteFile = fs.readFileSync(spriteFilePath, 'utf8');

const spriteUpdates: Record<string, any> = {
  // Wargreymon: fix explosion frame
  "wargreymon": {
    "sheetPath": "/assets/aistudio/Copy_of_WarGreymon_9adf0908.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        { "x": 257, "y": 2, "w": 78, "h": 81, "rotate": 0 },
        { "x": 337, "y": 2, "w": 76, "h": 81, "rotate": 0 }
      ],
      "walking": [
        { "x": 257, "y": 2, "w": 78, "h": 81, "rotate": 0 },
        { "x": 337, "y": 2, "w": 76, "h": 81, "rotate": 0 },
        { "x": 415, "y": 3, "w": 78, "h": 80, "rotate": 0 },
        { "x": 337, "y": 2, "w": 76, "h": 81, "rotate": 0 }
      ],
      "happy": [
        { "x": 406, "y": 85, "w": 80, "h": 77, "rotate": 0 },
        { "x": 257, "y": 2, "w": 78, "h": 81, "rotate": 0 }
      ],
      "eating": [
        { "x": 406, "y": 164, "w": 76, "h": 82, "rotate": 0 },
        { "x": 257, "y": 2, "w": 78, "h": 81, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 358, "y": 416, "w": 92, "h": 28, "rotate": 0 }
      ],
      "training": [
        { "x": 62, "y": 121, "w": 96, "h": 97, "rotate": 0 },
        { "x": 258, "y": 126, "w": 73, "h": 92, "rotate": 0 }
      ],
      "sick": [
        { "x": 358, "y": 416, "w": 92, "h": 28, "rotate": 0 }
      ],
      "sitting": [
        { "x": 257, "y": 2, "w": 78, "h": 81, "rotate": 0 }
      ]
    }
  },

  // Punimon: fix sitting sideways, make flat
  "punimon": {
    "sheetPath": "/assets/aistudio/Copy_of_Punimon_68b4fcb1.png",
    "sheetWidth": 214,
    "sheetHeight": 214,
    "frames": {
      "standing": [
        { "x": 2, "y": 133, "w": 40, "h": 33, "rotate": 0 },
        { "x": 44, "y": 135, "w": 41, "h": 31, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 133, "w": 40, "h": 33, "rotate": 0 },
        { "x": 44, "y": 135, "w": 41, "h": 31, "rotate": 0 },
        { "x": 2, "y": 168, "w": 43, "h": 31, "rotate": 0 },
        { "x": 47, "y": 168, "w": 40, "h": 31, "rotate": 0 }
      ],
      "happy": [
        { "x": 89, "y": 113, "w": 38, "h": 31, "rotate": 0 },
        { "x": 129, "y": 113, "w": 38, "h": 29, "rotate": 0 }
      ],
      "eating": [
        { "x": 2, "y": 133, "w": 40, "h": 33, "rotate": 0 },
        { "x": 169, "y": 112, "w": 39, "h": 29, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 131, "y": 48, "w": 39, "h": 29, "rotate": 0 }
      ],
      "training": [
        { "x": 93, "y": 77, "w": 36, "h": 34, "rotate": 0 },
        { "x": 131, "y": 79, "w": 36, "h": 32, "rotate": 0 }
      ],
      "sick": [
        { "x": 131, "y": 48, "w": 39, "h": 29, "rotate": 0 }
      ],
      "sitting": [
        { "x": 2, "y": 133, "w": 40, "h": 33, "rotate": 0 }
      ]
    }
  },

  // Gabumon: clean bounding boxes, no clipping
  "gabumon": {
    "sheetPath": "/assets/aistudio/Copy_of_Gabumon_1beb725f.png",
    "sheetWidth": 467,
    "sheetHeight": 467,
    "frames": {
      "standing": [
        { "x": 264, "y": 117, "w": 51, "h": 52, "rotate": 0 },
        { "x": 317, "y": 117, "w": 51, "h": 49, "rotate": 0 }
      ],
      "walking": [
        { "x": 264, "y": 117, "w": 51, "h": 52, "rotate": 0 },
        { "x": 317, "y": 117, "w": 51, "h": 49, "rotate": 0 },
        { "x": 264, "y": 171, "w": 54, "h": 50, "rotate": 0 },
        { "x": 320, "y": 168, "w": 53, "h": 47, "rotate": 0 }
      ],
      "happy": [
        { "x": 370, "y": 114, "w": 52, "h": 47, "rotate": 0 },
        { "x": 264, "y": 117, "w": 51, "h": 52, "rotate": 0 }
      ],
      "eating": [
        { "x": 197, "y": 176, "w": 55, "h": 51, "rotate": 0 },
        { "x": 264, "y": 117, "w": 51, "h": 52, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 139, "y": 231, "w": 71, "h": 31, "rotate": 0 }
      ],
      "training": [
        { "x": 264, "y": 223, "w": 59, "h": 49, "rotate": 0 },
        { "x": 325, "y": 217, "w": 59, "h": 49, "rotate": 0 }
      ],
      "sick": [
        { "x": 139, "y": 231, "w": 71, "h": 31, "rotate": 0 }
      ],
      "sitting": [
        { "x": 264, "y": 117, "w": 51, "h": 52, "rotate": 0 }
      ]
    }
  },

  // Weregarurumon: upright standing wolf poses, not falling
  "weregarurumon": {
    "sheetPath": "/assets/aistudio/Copy_of_WereGarurumon_497c1afb.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        { "x": 380, "y": 86, "w": 55, "h": 79, "rotate": 0 },
        { "x": 367, "y": 167, "w": 68, "h": 81, "rotate": 0 }
      ],
      "walking": [
        { "x": 380, "y": 86, "w": 55, "h": 79, "rotate": 0 },
        { "x": 454, "y": 350, "w": 56, "h": 79, "rotate": 0 },
        { "x": 367, "y": 167, "w": 68, "h": 81, "rotate": 0 },
        { "x": 454, "y": 431, "w": 56, "h": 79, "rotate": 0 }
      ],
      "happy": [
        { "x": 189, "y": 246, "w": 65, "h": 80, "rotate": 0 },
        { "x": 380, "y": 86, "w": 55, "h": 79, "rotate": 0 }
      ],
      "eating": [
        { "x": 380, "y": 86, "w": 55, "h": 79, "rotate": 0 },
        { "x": 367, "y": 167, "w": 68, "h": 81, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 2, "y": 2, "w": 80, "h": 64, "rotate": 0 }
      ],
      "training": [
        { "x": 108, "y": 68, "w": 85, "h": 85, "rotate": 0 },
        { "x": 195, "y": 68, "w": 84, "h": 85, "rotate": 0 }
      ],
      "sick": [
        { "x": 2, "y": 2, "w": 80, "h": 64, "rotate": 0 }
      ],
      "sitting": [
        { "x": 380, "y": 86, "w": 55, "h": 79, "rotate": 0 }
      ]
    }
  },

  // Metalgarurumon: fix leaning back frame
  "metalgarurumon": {
    "sheetPath": "/assets/aistudio/Copy_of_MetalGarurumon_4_3c810c39.png",
    "sheetWidth": 442,
    "sheetHeight": 442,
    "frames": {
      "standing": [
        { "x": 178, "y": 261, "w": 87, "h": 81, "rotate": 0 },
        { "x": 267, "y": 260, "w": 85, "h": 81, "rotate": 0 }
      ],
      "walking": [
        { "x": 178, "y": 261, "w": 87, "h": 81, "rotate": 0 },
        { "x": 267, "y": 260, "w": 85, "h": 81, "rotate": 0 },
        { "x": 178, "y": 344, "w": 95, "h": 80, "rotate": 0 },
        { "x": 275, "y": 343, "w": 90, "h": 81, "rotate": 0 }
      ],
      "happy": [
        { "x": 323, "y": 95, "w": 88, "h": 67, "rotate": 0 },
        { "x": 178, "y": 261, "w": 87, "h": 81, "rotate": 0 }
      ],
      "eating": [
        { "x": 178, "y": 261, "w": 87, "h": 81, "rotate": 0 },
        { "x": 267, "y": 260, "w": 85, "h": 81, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 144, "y": 48, "w": 89, "h": 60, "rotate": 0 }
      ],
      "training": [
        { "x": 91, "y": 224, "w": 83, "h": 79, "rotate": 0 },
        { "x": 2, "y": 224, "w": 87, "h": 79, "rotate": 0 }
      ],
      "sick": [
        { "x": 144, "y": 48, "w": 89, "h": 60, "rotate": 0 }
      ],
      "sitting": [
        { "x": 178, "y": 261, "w": 87, "h": 81, "rotate": 0 }
      ]
    }
  },

  // Yokomon: upright bulb flower stalk
  "yokomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Yokomon_dd201051.png",
    "sheetWidth": 269,
    "sheetHeight": 269,
    "frames": {
      "standing": [
        { "x": 39, "y": 88, "w": 36, "h": 52, "rotate": 0 },
        { "x": 77, "y": 88, "w": 35, "h": 52, "rotate": 0 }
      ],
      "walking": [
        { "x": 39, "y": 88, "w": 36, "h": 52, "rotate": 0 },
        { "x": 77, "y": 88, "w": 35, "h": 52, "rotate": 0 },
        { "x": 147, "y": 91, "w": 35, "h": 53, "rotate": 0 },
        { "x": 184, "y": 91, "w": 34, "h": 53, "rotate": 0 }
      ],
      "happy": [
        { "x": 39, "y": 46, "w": 41, "h": 40, "rotate": 0 },
        { "x": 82, "y": 46, "w": 46, "h": 40, "rotate": 0 }
      ],
      "eating": [
        { "x": 39, "y": 88, "w": 36, "h": 52, "rotate": 0 },
        { "x": 77, "y": 88, "w": 35, "h": 52, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 4, "y": 19, "w": 41, "h": 21, "rotate": 0 }
      ],
      "training": [
        { "x": 130, "y": 47, "w": 47, "h": 39, "rotate": 0 },
        { "x": 39, "y": 46, "w": 41, "h": 40, "rotate": 0 }
      ],
      "sick": [
        { "x": 4, "y": 19, "w": 41, "h": 21, "rotate": 0 }
      ],
      "sitting": [
        { "x": 39, "y": 88, "w": 36, "h": 52, "rotate": 0 }
      ]
    }
  },

  // Biyomon: upright 2-legged bird, no upside-down flipping
  "biyomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Biyomon_ad3c3232.png",
    "sheetWidth": 269,
    "sheetHeight": 269,
    "frames": {
      "standing": [
        { "x": 2, "y": 106, "w": 43, "h": 51, "rotate": 0 },
        { "x": 47, "y": 111, "w": 41, "h": 51, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 106, "w": 43, "h": 51, "rotate": 0 },
        { "x": 47, "y": 111, "w": 41, "h": 51, "rotate": 0 },
        { "x": 90, "y": 111, "w": 41, "h": 51, "rotate": 0 },
        { "x": 47, "y": 164, "w": 42, "h": 50, "rotate": 0 }
      ],
      "happy": [
        { "x": 2, "y": 159, "w": 43, "h": 52, "rotate": 0 },
        { "x": 47, "y": 164, "w": 42, "h": 50, "rotate": 0 }
      ],
      "eating": [
        { "x": 2, "y": 106, "w": 43, "h": 51, "rotate": 0 },
        { "x": 47, "y": 111, "w": 41, "h": 51, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 174, "y": 4, "w": 44, "h": 21, "rotate": 0 }
      ],
      "training": [
        { "x": 133, "y": 124, "w": 42, "h": 46, "rotate": 0 },
        { "x": 2, "y": 159, "w": 43, "h": 52, "rotate": 0 }
      ],
      "sick": [
        { "x": 174, "y": 4, "w": 44, "h": 21, "rotate": 0 }
      ],
      "sitting": [
        { "x": 2, "y": 106, "w": 43, "h": 51, "rotate": 0 }
      ]
    }
  },

  // Birdramon: horizontal flying bird
  "birdramon": {
    "sheetPath": "/assets/aistudio/Copy_of_Birdramon_6ba0b315.png",
    "sheetWidth": 440,
    "sheetHeight": 440,
    "frames": {
      "standing": [
        { "x": 57, "y": 151, "w": 60, "h": 63, "rotate": 0 },
        { "x": 174, "y": 152, "w": 57, "h": 64, "rotate": 0 }
      ],
      "walking": [
        { "x": 72, "y": 375, "w": 65, "h": 63, "rotate": 0 },
        { "x": 139, "y": 375, "w": 65, "h": 63, "rotate": 0 },
        { "x": 206, "y": 376, "w": 65, "h": 62, "rotate": 0 },
        { "x": 273, "y": 378, "w": 67, "h": 60, "rotate": 0 }
      ],
      "happy": [
        { "x": 57, "y": 151, "w": 60, "h": 63, "rotate": 0 },
        { "x": 72, "y": 375, "w": 65, "h": 63, "rotate": 0 }
      ],
      "eating": [
        { "x": 57, "y": 151, "w": 60, "h": 63, "rotate": 0 },
        { "x": 174, "y": 152, "w": 57, "h": 64, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 242, "y": 22, "w": 49, "h": 29, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 370, "w": 68, "h": 68, "rotate": 0 },
        { "x": 72, "y": 375, "w": 65, "h": 63, "rotate": 0 }
      ],
      "sick": [
        { "x": 242, "y": 22, "w": 49, "h": 29, "rotate": 0 }
      ],
      "sitting": [
        { "x": 57, "y": 151, "w": 60, "h": 63, "rotate": 0 }
      ]
    }
  },

  // Garudamon: clean walking, no damage recoil
  "garudamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Garudamon_3_4b148cfb.png",
    "sheetWidth": 442,
    "sheetHeight": 442,
    "frames": {
      "standing": [
        { "x": 281, "y": 22, "w": 63, "h": 76, "rotate": 0 },
        { "x": 346, "y": 22, "w": 60, "h": 76, "rotate": 0 }
      ],
      "walking": [
        { "x": 281, "y": 22, "w": 63, "h": 76, "rotate": 0 },
        { "x": 288, "y": 165, "w": 57, "h": 74, "rotate": 0 },
        { "x": 346, "y": 22, "w": 60, "h": 76, "rotate": 0 },
        { "x": 288, "y": 165, "w": 57, "h": 74, "rotate": 0 }
      ],
      "happy": [
        { "x": 288, "y": 165, "w": 57, "h": 74, "rotate": 0 },
        { "x": 347, "y": 170, "w": 79, "h": 63, "rotate": 0 }
      ],
      "eating": [
        { "x": 281, "y": 22, "w": 63, "h": 76, "rotate": 0 },
        { "x": 288, "y": 165, "w": 57, "h": 74, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 2, "y": 304, "w": 88, "h": 67, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 156, "w": 72, "h": 78, "rotate": 0 },
        { "x": 76, "y": 152, "w": 59, "h": 82, "rotate": 0 }
      ],
      "sick": [
        { "x": 2, "y": 304, "w": 88, "h": 67, "rotate": 0 }
      ],
      "sitting": [
        { "x": 281, "y": 22, "w": 63, "h": 76, "rotate": 0 }
      ]
    }
  },

  // Phoenixmon: horizontal flying golden bird, not vertical
  "phoenixmon": {
    "sheetPath": "/assets/aistudio/Copy_of_Phoenixmon_5_f4ad8760.png",
    "sheetWidth": 498,
    "sheetHeight": 498,
    "frames": {
      "standing": [
        { "x": 266, "y": 404, "w": 96, "h": 92, "rotate": 0 },
        { "x": 364, "y": 406, "w": 89, "h": 90, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 135, "w": 96, "h": 92, "rotate": 0 },
        { "x": 100, "y": 142, "w": 95, "h": 85, "rotate": 0 },
        { "x": 266, "y": 404, "w": 96, "h": 92, "rotate": 0 },
        { "x": 364, "y": 406, "w": 89, "h": 90, "rotate": 0 }
      ],
      "happy": [
        { "x": 266, "y": 404, "w": 96, "h": 92, "rotate": 0 },
        { "x": 100, "y": 142, "w": 95, "h": 85, "rotate": 0 }
      ],
      "eating": [
        { "x": 266, "y": 404, "w": 96, "h": 92, "rotate": 0 },
        { "x": 364, "y": 406, "w": 89, "h": 90, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 97, "y": 10, "w": 98, "h": 57, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 135, "w": 96, "h": 92, "rotate": 0 },
        { "x": 266, "y": 307, "w": 85, "h": 95, "rotate": 0 }
      ],
      "sick": [
        { "x": 97, "y": 10, "w": 98, "h": 57, "rotate": 0 }
      ],
      "sitting": [
        { "x": 266, "y": 404, "w": 96, "h": 92, "rotate": 0 }
      ]
    }
  },

  // Yuramon: exact non-clipping bounds
  "yuramon": {
    "sheetPath": "/assets/aistudio/Copy_of_Yuramon_3ad2937a.png",
    "sheetWidth": 194,
    "sheetHeight": 194,
    "frames": {
      "standing": [
        { "x": 77, "y": 26, "w": 36, "h": 35, "rotate": 0 },
        { "x": 115, "y": 26, "w": 36, "h": 35, "rotate": 0 }
      ],
      "walking": [
        { "x": 77, "y": 26, "w": 36, "h": 35, "rotate": 0 },
        { "x": 39, "y": 41, "w": 36, "h": 36, "rotate": 0 },
        { "x": 115, "y": 26, "w": 36, "h": 35, "rotate": 0 },
        { "x": 78, "y": 63, "w": 36, "h": 35, "rotate": 0 }
      ],
      "happy": [
        { "x": 77, "y": 26, "w": 36, "h": 35, "rotate": 0 },
        { "x": 39, "y": 41, "w": 36, "h": 36, "rotate": 0 }
      ],
      "eating": [
        { "x": 77, "y": 26, "w": 36, "h": 35, "rotate": 0 },
        { "x": 115, "y": 26, "w": 36, "h": 35, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 77, "y": 2, "w": 34, "h": 22, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 33, "w": 35, "h": 38, "rotate": 0 },
        { "x": 2, "y": 73, "w": 35, "h": 40, "rotate": 0 }
      ],
      "sick": [
        { "x": 77, "y": 2, "w": 34, "h": 22, "rotate": 0 }
      ],
      "sitting": [
        { "x": 77, "y": 26, "w": 36, "h": 35, "rotate": 0 }
      ]
    }
  },

  // Tanemon: exact non-clipping bounds
  "tanemon": {
    "sheetPath": "/assets/aistudio/Copy_of_Tanemon_17517f84.png",
    "sheetWidth": 249,
    "sheetHeight": 249,
    "frames": {
      "standing": [
        { "x": 124, "y": 207, "w": 39, "h": 39, "rotate": 0 },
        { "x": 205, "y": 208, "w": 38, "h": 38, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 194, "w": 43, "h": 39, "rotate": 0 },
        { "x": 84, "y": 206, "w": 38, "h": 40, "rotate": 0 },
        { "x": 124, "y": 207, "w": 39, "h": 39, "rotate": 0 },
        { "x": 165, "y": 207, "w": 38, "h": 39, "rotate": 0 }
      ],
      "happy": [
        { "x": 124, "y": 207, "w": 39, "h": 39, "rotate": 0 },
        { "x": 205, "y": 208, "w": 38, "h": 38, "rotate": 0 }
      ],
      "eating": [
        { "x": 124, "y": 207, "w": 39, "h": 39, "rotate": 0 },
        { "x": 205, "y": 208, "w": 38, "h": 38, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 41, "y": 48, "w": 46, "h": 22, "rotate": 0 }
      ],
      "training": [
        { "x": 42, "y": 109, "w": 39, "h": 41, "rotate": 0 },
        { "x": 2, "y": 101, "w": 38, "h": 44, "rotate": 0 }
      ],
      "sick": [
        { "x": 41, "y": 48, "w": 46, "h": 22, "rotate": 0 }
      ],
      "sitting": [
        { "x": 124, "y": 207, "w": 39, "h": 39, "rotate": 0 }
      ]
    }
  },

  // Palmon: peaceful standing pose
  "palmon": {
    "sheetPath": "/assets/aistudio/Copy_of_Palmon_2070e7b5.png",
    "sheetWidth": 269,
    "sheetHeight": 269,
    "frames": {
      "standing": [
        { "x": 52, "y": 51, "w": 36, "h": 48, "rotate": 0 },
        { "x": 90, "y": 51, "w": 36, "h": 48, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 51, "w": 48, "h": 48, "rotate": 0 },
        { "x": 52, "y": 51, "w": 36, "h": 48, "rotate": 0 },
        { "x": 90, "y": 51, "w": 36, "h": 48, "rotate": 0 },
        { "x": 161, "y": 51, "w": 41, "h": 50, "rotate": 0 }
      ],
      "happy": [
        { "x": 52, "y": 51, "w": 36, "h": 48, "rotate": 0 },
        { "x": 90, "y": 51, "w": 36, "h": 48, "rotate": 0 }
      ],
      "eating": [
        { "x": 52, "y": 51, "w": 36, "h": 48, "rotate": 0 },
        { "x": 90, "y": 51, "w": 36, "h": 48, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 139, "y": 2, "w": 43, "h": 24, "rotate": 0 }
      ],
      "training": [
        { "x": 54, "y": 5, "w": 42, "h": 46, "rotate": 0 },
        { "x": 98, "y": 5, "w": 43, "h": 46, "rotate": 0 }
      ],
      "sick": [
        { "x": 139, "y": 2, "w": 43, "h": 24, "rotate": 0 }
      ],
      "sitting": [
        { "x": 52, "y": 51, "w": 36, "h": 48, "rotate": 0 }
      ]
    }
  },

  // Togemon: upright green cactus
  "togemon": {
    "sheetPath": "/assets/aistudio/Copy_of_Togemon_11c9cc70.png",
    "sheetWidth": 364,
    "sheetHeight": 364,
    "frames": {
      "standing": [
        { "x": 121, "y": 75, "w": 43, "h": 55, "rotate": 0 },
        { "x": 166, "y": 75, "w": 39, "h": 55, "rotate": 0 }
      ],
      "walking": [
        { "x": 121, "y": 75, "w": 43, "h": 55, "rotate": 0 },
        { "x": 121, "y": 132, "w": 47, "h": 55, "rotate": 0 },
        { "x": 166, "y": 75, "w": 39, "h": 55, "rotate": 0 },
        { "x": 121, "y": 132, "w": 47, "h": 55, "rotate": 0 }
      ],
      "happy": [
        { "x": 121, "y": 75, "w": 43, "h": 55, "rotate": 0 },
        { "x": 166, "y": 75, "w": 39, "h": 55, "rotate": 0 }
      ],
      "eating": [
        { "x": 121, "y": 75, "w": 43, "h": 55, "rotate": 0 },
        { "x": 166, "y": 75, "w": 39, "h": 55, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 249, "y": 96, "w": 49, "h": 39, "rotate": 0 }
      ],
      "training": [
        { "x": 2, y: 55, "w": 56, "h": 56, "rotate": 0 },
        { "x": 2, y: 113, "w": 56, "h": 57, "rotate": 0 }
      ],
      "sick": [
        { "x": 249, "y": 96, "w": 49, "h": 39, "rotate": 0 }
      ],
      "sitting": [
        { "x": 121, "y": 75, "w": 43, "h": 55, "rotate": 0 }
      ]
    }
  },

  // Rosemon: tall upright rose humanoid
  "rosemon": {
    "sheetPath": "/assets/aistudio/Copy_of_Rosemon_6267595c.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        { "x": 221, "y": 2, "w": 63, "h": 76, "rotate": 0 },
        { "x": 451, "y": 51, "w": 59, "h": 80, "rotate": 0 }
      ],
      "walking": [
        { "x": 221, "y": 2, "w": 63, "h": 76, "rotate": 0 },
        { "x": 14, "y": 110, "w": 71, "h": 72, "rotate": 0 },
        { "x": 451, "y": 51, "w": 59, "h": 80, "rotate": 0 },
        { "x": 134, "y": 109, "w": 77, "h": 71, "rotate": 0 }
      ],
      "happy": [
        { "x": 221, "y": 2, "w": 63, "h": 76, "rotate": 0 },
        { "x": 451, "y": 51, "w": 59, "h": 80, "rotate": 0 }
      ],
      "eating": [
        { "x": 221, "y": 2, "w": 63, "h": 76, "rotate": 0 },
        { "x": 451, "y": 51, "w": 59, "h": 80, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 372, "y": 93, "w": 77, "h": 38, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 2, "w": 73, "h": 75, "rotate": 0 },
        { "x": 77, "y": 2, "w": 73, "h": 75, "rotate": 0 }
      ],
      "sick": [
        { "x": 372, "y": 93, "w": 77, "h": 38, "rotate": 0 }
      ],
      "sitting": [
        { "x": 221, "y": 2, "w": 63, "h": 76, "rotate": 0 }
      ]
    }
  },

  // Pichimon: horizontal swimming tadpole bubble
  "pichimon": {
    "sheetPath": "/assets/aistudio/Copy_of_Pichimon_eca26270.png",
    "sheetWidth": 256,
    "sheetHeight": 256,
    "frames": {
      "standing": [
        { "x": 101, "y": 77, "w": 33, "h": 26, "rotate": 0 },
        { "x": 113, "y": 105, "w": 37, "h": 21, "rotate": 0 }
      ],
      "walking": [
        { "x": 39, "y": 111, "w": 42, "h": 27, "rotate": 0 },
        { "x": 101, "y": 77, "w": 33, "h": 26, "rotate": 0 },
        { "x": 113, "y": 128, "w": 38, "h": 25, "rotate": 0 },
        { "x": 153, "y": 132, "w": 39, "h": 20, "rotate": 0 }
      ],
      "happy": [
        { "x": 101, "y": 77, "w": 33, "h": 26, "rotate": 0 },
        { "x": 113, "y": 105, "w": 37, "h": 21, "rotate": 0 }
      ],
      "eating": [
        { "x": 101, "y": 77, "w": 33, "h": 26, "rotate": 0 },
        { "x": 113, "y": 128, "w": 38, "h": 25, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 153, "y": 132, "w": 39, "h": 20, "rotate": 0 }
      ],
      "training": [
        { "x": 39, "y": 111, "w": 42, "h": 27, "rotate": 0 },
        { "x": 113, "y": 105, "w": 37, "h": 21, "rotate": 0 }
      ],
      "sick": [
        { "x": 153, "y": 132, "w": 39, "h": 20, "rotate": 0 }
      ],
      "sitting": [
        { "x": 101, "y": 77, "w": 33, "h": 26, "rotate": 0 }
      ]
    }
  },

  // Bukamon: horizontal swimming
  "bukamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Bukamon_b180f25e.png",
    "sheetWidth": 303,
    "sheetHeight": 303,
    "frames": {
      "standing": [
        { "x": 63, "y": 2, "w": 63, "h": 42, "rotate": 0 },
        { "x": 2, "y": 3, "w": 59, "h": 28, "rotate": 0 }
      ],
      "walking": [
        { "x": 63, "y": 2, "w": 63, "h": 42, "rotate": 0 },
        { "x": 2, "y": 3, "w": 59, "h": 28, "rotate": 0 },
        { "x": 241, "y": 6, "w": 57, "h": 26, "rotate": 0 },
        { "x": 2, "y": 3, "w": 59, "h": 28, "rotate": 0 }
      ],
      "happy": [
        { "x": 63, "y": 2, "w": 63, "h": 42, "rotate": 0 },
        { "x": 241, "y": 6, "w": 57, "h": 26, "rotate": 0 }
      ],
      "eating": [
        { "x": 63, "y": 2, "w": 63, "h": 42, "rotate": 0 },
        { "x": 2, "y": 3, "w": 59, "h": 28, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 241, "y": 6, "w": 57, "h": 26, "rotate": 0 }
      ],
      "training": [
        { "x": 128, "y": 3, "w": 60, "h": 48, "rotate": 0 },
        { "x": 190, "y": 7, "w": 49, "h": 49, "rotate": 0 }
      ],
      "sick": [
        { "x": 241, "y": 6, "w": 57, "h": 26, "rotate": 0 }
      ],
      "sitting": [
        { "x": 63, "y": 2, "w": 63, "h": 42, "rotate": 0 }
      ]
    }
  },

  // Ikkakumon: upright walrus on all four flippers
  "ikkakumon": {
    "sheetPath": "/assets/aistudio/Copy_of_Ikkakumon_d7c47668.png",
    "sheetWidth": 354,
    "sheetHeight": 354,
    "frames": {
      "standing": [
        { "x": 62, "y": 2, "w": 57, "h": 60, "rotate": 0 },
        { "x": 2, "y": 3, "w": 58, "h": 62, "rotate": 0 }
      ],
      "walking": [
        { "x": 176, "y": 32, "w": 58, "h": 61, "rotate": 0 },
        { "x": 236, "y": 42, "w": 56, "h": 60, "rotate": 0 },
        { "x": 173, "y": 95, "w": 56, "h": 62, "rotate": 0 },
        { "x": 231, "y": 104, "w": 57, "h": 62, "rotate": 0 }
      ],
      "happy": [
        { "x": 62, "y": 2, "w": 57, "h": 60, "rotate": 0 },
        { "x": 2, "y": 3, "w": 58, "h": 62, "rotate": 0 }
      ],
      "eating": [
        { "x": 62, "y": 2, "w": 57, "h": 60, "rotate": 0 },
        { "x": 2, "y": 3, "w": 58, "h": 62, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 294, "y": 22, "w": 42, "h": 35, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 67, "w": 60, "h": 65, "rotate": 0 },
        { "x": 64, "y": 64, "w": 48, "h": 65, "rotate": 0 }
      ],
      "sick": [
        { "x": 294, "y": 22, "w": 42, "h": 35, "rotate": 0 }
      ],
      "sitting": [
        { "x": 62, "y": 2, "w": 57, "h": 60, "rotate": 0 }
      ]
    }
  },

  // Zudomon: natural standing/walking, not swinging hammer
  "zudomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Zudomon_72c1c161.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        { "x": 8, "y": 195, "w": 124, "h": 146, "rotate": 0 },
        { "x": 142, "y": 221, "w": 104, "h": 126, "rotate": 0 }
      ],
      "walking": [
        { "x": 8, "y": 195, "w": 124, "h": 146, "rotate": 0 },
        { "x": 8, "y": 355, "w": 125, "h": 150, "rotate": 0 },
        { "x": 151, "y": 361, "w": 122, "h": 145, "rotate": 0 },
        { "x": 287, "y": 377, "w": 133, "h": 124, "rotate": 0 }
      ],
      "happy": [
        { "x": 8, "y": 195, "w": 124, "h": 146, "rotate": 0 },
        { "x": 142, "y": 221, "w": 104, "h": 126, "rotate": 0 }
      ],
      "eating": [
        { "x": 8, "y": 195, "w": 124, "h": 146, "rotate": 0 },
        { "x": 142, "y": 221, "w": 104, "h": 126, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 420, "y": 273, "w": 56, "h": 67, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 31, "w": 126, "h": 153, "rotate": 0 },
        { "x": 130, "y": 31, "w": 125, "h": 153, "rotate": 0 }
      ],
      "sick": [
        { "x": 420, "y": 273, "w": 56, "h": 67, "rotate": 0 }
      ],
      "sitting": [
        { "x": 8, "y": 195, "w": 124, "h": 146, "rotate": 0 }
      ]
    }
  },

  // Tokomon: upright bouncing
  "tokomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Tokomon_c5323292.png",
    "sheetWidth": 269,
    "sheetHeight": 269,
    "frames": {
      "standing": [
        { "x": 135, "y": 2, "w": 40, "h": 39, "rotate": 0 },
        { "x": 177, "y": 17, "w": 38, "h": 39, "rotate": 0 }
      ],
      "walking": [
        { "x": 135, "y": 2, "w": 40, "h": 39, "rotate": 0 },
        { "x": 177, "y": 17, "w": 38, "h": 39, "rotate": 0 },
        { "x": 217, "y": 19, "w": 39, "h": 39, "rotate": 0 },
        { "x": 135, "y": 43, "w": 39, "h": 42, "rotate": 0 }
      ],
      "happy": [
        { "x": 135, "y": 2, "w": 40, "h": 39, "rotate": 0 },
        { "x": 135, "y": 43, "w": 39, "h": 42, "rotate": 0 }
      ],
      "eating": [
        { "x": 135, "y": 2, "w": 40, "h": 39, "rotate": 0 },
        { "x": 177, "y": 17, "w": 38, "h": 39, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 215, "y": 60, "w": 38, "h": 39, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 37, "w": 46, "h": 46, "rotate": 0 },
        { "x": 50, "y": 38, "w": 40, "h": 46, "rotate": 0 }
      ],
      "sick": [
        { "x": 215, "y": 60, "w": 38, "h": 39, "rotate": 0 }
      ],
      "sitting": [
        { "x": 135, "y": 2, "w": 40, "h": 39, "rotate": 0 }
      ]
    }
  },

  // Angemon: upright holy warrior
  "angemon": {
    "sheetPath": "/assets/aistudio/Copy_of_Angemon_e4fecf69.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        { "x": 2, "y": 40, "w": 71, "h": 74, "rotate": 0 },
        { "x": 75, "y": 44, "w": 76, "h": 68, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 40, "w": 71, "h": 74, "rotate": 0 },
        { "x": 306, "y": 91, "w": 73, "h": 65, "rotate": 0 },
        { "x": 75, "y": 44, "w": 76, "h": 68, "rotate": 0 },
        { "x": 231, "y": 99, "w": 73, "h": 59, "rotate": 0 }
      ],
      "happy": [
        { "x": 2, "y": 40, "w": 71, "h": 74, "rotate": 0 },
        { "x": 75, "y": 44, "w": 76, "h": 68, "rotate": 0 }
      ],
      "eating": [
        { "x": 2, "y": 40, "w": 71, "h": 74, "rotate": 0 },
        { "x": 75, "y": 44, "w": 76, "h": 68, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 2, "y": 18, "w": 73, "h": 20, "rotate": 0 }
      ],
      "training": [
        { "x": 378, "y": 19, "w": 72, "h": 56, "rotate": 0 },
        { "x": 303, "y": 30, "w": 73, "h": 58, "rotate": 0 }
      ],
      "sick": [
        { "x": 2, "y": 18, "w": 73, "h": 20, "rotate": 0 }
      ],
      "sitting": [
        { "x": 2, "y": 40, "w": 71, "h": 74, "rotate": 0 }
      ]
    }
  },

  // Magnaangemon: upright archangel with wings spread
  "magnaangemon": {
    "sheetPath": "/assets/aistudio/Copy_of_MagnaAngemon_2_d229b13a.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        { "x": 323, "y": 2, "w": 86, "h": 102, "rotate": 0 },
        { "x": 411, "y": 2, "w": 86, "h": 102, "rotate": 0 }
      ],
      "walking": [
        { "x": 323, "y": 2, "w": 86, "h": 102, "rotate": 0 },
        { "x": 397, "y": 106, "w": 87, "h": 110, "rotate": 0 },
        { "x": 411, "y": 2, "w": 86, "h": 102, "rotate": 0 },
        { "x": 308, "y": 110, "w": 87, "h": 111, "rotate": 0 }
      ],
      "happy": [
        { "x": 323, "y": 2, "w": 86, "h": 102, "rotate": 0 },
        { "x": 411, "y": 2, "w": 86, "h": 102, "rotate": 0 }
      ],
      "eating": [
        { "x": 323, "y": 2, "w": 86, "h": 102, "rotate": 0 },
        { "x": 411, "y": 2, "w": 86, "h": 102, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 78, "y": 2, "w": 97, "h": 24, "rotate": 0 }
      ],
      "training": [
        { "x": 78, "y": 28, "w": 101, "h": 98, "rotate": 0 },
        { "x": 74, "y": 199, "w": 101, "h": 98, "rotate": 0 }
      ],
      "sick": [
        { "x": 78, "y": 2, "w": 97, "h": 24, "rotate": 0 }
      ],
      "sitting": [
        { "x": 323, "y": 2, "w": 86, "h": 102, "rotate": 0 }
      ]
    }
  },

  // Nyaromon: upright cat-blob
  "nyaromon": {
    "sheetPath": "/assets/aistudio/Copy_of_Nyaromon_923766aa.png",
    "sheetWidth": 240,
    "sheetHeight": 240,
    "frames": {
      "standing": [
        { "x": 110, "y": 4, "w": 40, "h": 35, "rotate": 0 },
        { "x": 193, "y": 4, "w": 38, "h": 39, "rotate": 0 }
      ],
      "walking": [
        { "x": 110, "y": 4, "w": 40, "h": 35, "rotate": 0 },
        { "x": 110, "y": 41, "w": 37, "h": 38, "rotate": 0 },
        { "x": 193, "y": 4, "w": 38, "h": 39, "rotate": 0 },
        { "x": 193, "y": 45, "w": 40, "h": 40, "rotate": 0 }
      ],
      "happy": [
        { "x": 110, "y": 4, "w": 40, "h": 35, "rotate": 0 },
        { "x": 193, "y": 4, "w": 38, "h": 39, "rotate": 0 }
      ],
      "eating": [
        { "x": 110, "y": 4, "w": 40, "h": 35, "rotate": 0 },
        { "x": 193, "y": 4, "w": 38, "h": 39, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 149, "y": 47, "w": 39, "h": 31, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 53, "w": 46, "h": 32, "rotate": 0 },
        { "x": 51, "y": 61, "w": 46, "h": 33, "rotate": 0 }
      ],
      "sick": [
        { "x": 149, "y": 47, "w": 39, "h": 31, "rotate": 0 }
      ],
      "sitting": [
        { "x": 110, "y": 4, "w": 40, "h": 35, "rotate": 0 }
      ]
    }
  },

  // Gatomon: upright bipedal holy cat
  "gatomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Gatomon_68f5ce70.png",
    "sheetWidth": 336,
    "sheetHeight": 336,
    "frames": {
      "standing": [
        { "x": 238, "y": 12, "w": 46, "h": 49, "rotate": 0 },
        { "x": 286, "y": 12, "w": 47, "h": 49, "rotate": 0 }
      ],
      "walking": [
        { "x": 238, "y": 12, "w": 46, "h": 49, "rotate": 0 },
        { "x": 182, "y": 43, "w": 54, "h": 57, "rotate": 0 },
        { "x": 286, "y": 12, "w": 47, "h": 49, "rotate": 0 },
        { "x": 242, "y": 63, "w": 51, "h": 47, "rotate": 0 }
      ],
      "happy": [
        { "x": 238, "y": 12, "w": 46, "h": 49, "rotate": 0 },
        { "x": 182, "y": 43, "w": 54, "h": 57, "rotate": 0 }
      ],
      "eating": [
        { "x": 238, "y": 12, "w": 46, "h": 49, "rotate": 0 },
        { "x": 286, "y": 12, "w": 47, "h": 49, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 121, "y": 10, "w": 63, "h": 19, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 6, "w": 56, "h": 69, "rotate": 0 },
        { "x": 60, "y": 9, "w": 59, "h": 66, "rotate": 0 }
      ],
      "sick": [
        { "x": 121, "y": 10, "w": 63, "h": 19, "rotate": 0 }
      ],
      "sitting": [
        { "x": 238, "y": 12, "w": 46, "h": 49, "rotate": 0 }
      ]
    }
  },

  // Magnadramon: horizontal soaring dragon
  "magnadramon": {
    "sheetPath": "/assets/aistudio/Copy_of_Magnadramon_d8456cbf.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        { "x": 2, "y": 69, "w": 91, "h": 109, "rotate": 0 },
        { "x": 2, "y": 180, "w": 91, "h": 109, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 69, "w": 91, "h": 109, "rotate": 0 },
        { "x": 95, "y": 69, "w": 102, "h": 98, "rotate": 0 },
        { "x": 199, "y": 73, "w": 76, "h": 105, "rotate": 0 },
        { "x": 277, "y": 82, "w": 91, "h": 104, "rotate": 0 }
      ],
      "happy": [
        { "x": 2, "y": 69, "w": 91, "h": 109, "rotate": 0 },
        { "x": 95, "y": 69, "w": 102, "h": 98, "rotate": 0 }
      ],
      "eating": [
        { "x": 2, "y": 69, "w": 91, "h": 109, "rotate": 0 },
        { "x": 2, "y": 180, "w": 91, "h": 109, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 2, "y": 11, "w": 107, "h": 56, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 403, "w": 100, "h": 107, "rotate": 0 },
        { "x": 104, "y": 407, "w": 102, "h": 103, "rotate": 0 }
      ],
      "sick": [
        { "x": 2, "y": 11, "w": 107, "h": 56, "rotate": 0 }
      ],
      "sitting": [
        { "x": 2, "y": 69, "w": 91, "h": 109, "rotate": 0 }
      ]
    }
  },

  // Yukimibotamon: new sheet Copy_of_Yukimibotamon_425de778.png
  "yukimibotamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Yukimibotamon_425de778.png",
    "sheetWidth": 180,
    "sheetHeight": 180,
    "frames": {
      "standing": [
        { "x": 30, "y": 5, "w": 35, "h": 27, "rotate": 0 },
        { "x": 31, "y": 34, "w": 35, "h": 29, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 82, "w": 36, "h": 30, "rotate": 0 },
        { "x": 70, "y": 85, "w": 34, "h": 31, "rotate": 0 },
        { "x": 106, "y": 84, "w": 35, "h": 29, "rotate": 0 },
        { "x": 143, "y": 70, "w": 35, "h": 29, "rotate": 0 }
      ],
      "happy": [
        { "x": 101, "y": 24, "w": 35, "h": 28, "rotate": 0 },
        { "x": 139, "y": 40, "w": 35, "h": 28, "rotate": 0 }
      ],
      "eating": [
        { "x": 80, "y": 148, "w": 38, "h": 30, "rotate": 0 },
        { "x": 120, "y": 148, "w": 37, "h": 30, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 80, "y": 118, "w": 39, "h": 28, "rotate": 0 }
      ],
      "training": [
        { "x": 101, "y": 54, "w": 36, "h": 28, "rotate": 0 },
        { "x": 2, "y": 114, "w": 37, "h": 31, "rotate": 0 }
      ],
      "sick": [
        { "x": 42, "y": 146, "w": 36, "h": 32, "rotate": 0 }
      ],
      "sitting": [
        { "x": 30, "y": 5, "w": 35, "h": 27, "rotate": 0 }
      ]
    }
  },

  // Tentomon Lineage
  "motimon": {
    "sheetPath": "/assets/aistudio/Motimon_5cc21ee4.png",
    "sheetWidth": 192,
    "sheetHeight": 192,
    "frames": {
      "standing": [
        { "x": 44, "y": 152, "w": 39, "h": 38, "rotate": 0 },
        { "x": 85, "y": 152, "w": 39, "h": 38, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 114, "w": 40, "h": 36, "rotate": 0 },
        { "x": 44, "y": 114, "w": 40, "h": 36, "rotate": 0 },
        { "x": 126, "y": 115, "w": 40, "h": 36, "rotate": 0 },
        { "x": 44, "y": 114, "w": 40, "h": 36, "rotate": 0 }
      ],
      "happy": [
        { "x": 44, "y": 152, "w": 39, "h": 38, "rotate": 0 },
        { "x": 126, "y": 153, "w": 40, "h": 37, "rotate": 0 }
      ],
      "eating": [
        { "x": 2, "y": 152, "w": 40, "h": 38, "rotate": 0 },
        { "x": 44, "y": 152, "w": 39, "h": 38, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 36, "y": 6, "w": 39, "h": 28, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 79, "w": 41, "h": 33, "rotate": 0 },
        { "x": 122, "y": 80, "w": 41, "h": 33, "rotate": 0 }
      ],
      "sick": [
        { "x": 77, "y": 7, "w": 40, "h": 27, "rotate": 0 }
      ],
      "sitting": [
        { "x": 44, "y": 152, "w": 39, "h": 38, "rotate": 0 }
      ]
    }
  },
  "tentomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Tentomon_326c02c3.png",
    "sheetWidth": 435,
    "sheetHeight": 435,
    "frames": {
      "standing": [
        { "x": 55, "y": 15, "w": 55, "h": 53, "rotate": 0 },
        { "x": 112, "y": 15, "w": 54, "h": 53, "rotate": 0 }
      ],
      "walking": [
        { "x": 2, "y": 70, "w": 57, "h": 54, "rotate": 0 },
        { "x": 61, "y": 70, "w": 51, "h": 50, "rotate": 0 },
        { "x": 114, "y": 71, "w": 51, "h": 52, "rotate": 0 },
        { "x": 167, "y": 71, "w": 49, "h": 54, "rotate": 0 }
      ],
      "happy": [
        { "x": 168, "y": 15, "w": 52, "h": 54, "rotate": 0 },
        { "x": 222, "y": 15, "w": 49, "h": 56, "rotate": 0 }
      ],
      "eating": [
        { "x": 2, "y": 126, "w": 57, "h": 55, "rotate": 0 },
        { "x": 61, "y": 122, "w": 49, "h": 60, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 347, "y": 281, "w": 53, "h": 54, "rotate": 0 }
      ],
      "training": [
        { "x": 160, "y": 127, "w": 52, "h": 55, "rotate": 0 },
        { "x": 2, "y": 183, "w": 57, "h": 56, "rotate": 0 }
      ],
      "sick": [
        { "x": 220, "y": 298, "w": 61, "h": 35, "rotate": 0 }
      ],
      "sitting": [
        { "x": 55, "y": 15, "w": 55, "h": 53, "rotate": 0 }
      ]
    }
  },
  "kabuterimon": {
    "sheetPath": "/assets/aistudio/Kabuterimon_07cf7d29.png",
    "sheetWidth": 366,
    "sheetHeight": 366,
    "frames": {
      "standing": [
        { "x": 160, "y": 116, "w": 65, "h": 58, "rotate": 0 },
        { "x": 227, "y": 116, "w": 61, "h": 58, "rotate": 0 }
      ],
      "walking": [
        { "x": 93, "y": 117, "w": 65, "h": 62, "rotate": 0 },
        { "x": 160, "y": 116, "w": 65, "h": 58, "rotate": 0 },
        { "x": 227, "y": 116, "w": 61, "h": 58, "rotate": 0 },
        { "x": 308, "y": 120, "w": 56, "h": 59, "rotate": 0 }
      ],
      "happy": [
        { "x": 175, "y": 176, "w": 65, "h": 62, "rotate": 0 },
        { "x": 242, "y": 176, "w": 64, "h": 64, "rotate": 0 }
      ],
      "eating": [
        { "x": 105, "y": 181, "w": 68, "h": 57, "rotate": 0 },
        { "x": 160, "y": 116, "w": 65, "h": 58, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 2, "y": 310, "w": 100, "h": 53, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 239, "w": 99, "h": 59, "rotate": 0 },
        { "x": 239, "y": 242, "w": 66, "h": 58, "rotate": 0 }
      ],
      "sick": [
        { "x": 105, "y": 310, "w": 99, "h": 53, "rotate": 0 }
      ],
      "sitting": [
        { "x": 160, "y": 116, "w": 65, "h": 58, "rotate": 0 }
      ]
    }
  },
  "megakabuterimon": {
    "sheetPath": "/assets/aistudio/Copy_of_MegaKabuterimon_42236ae2.png",
    "sheetWidth": 481,
    "sheetHeight": 481,
    "frames": {
      "standing": [
        { "x": 133, "y": 233, "w": 79, "h": 80, "rotate": 0 },
        { "x": 214, "y": 233, "w": 77, "h": 80, "rotate": 0 }
      ],
      "walking": [
        { "x": 133, "y": 233, "w": 79, "h": 80, "rotate": 0 },
        { "x": 214, "y": 233, "w": 77, "h": 80, "rotate": 0 },
        { "x": 293, "y": 242, "w": 79, "h": 78, "rotate": 0 },
        { "x": 374, "y": 242, "w": 78, "h": 78, "rotate": 0 }
      ],
      "happy": [
        { "x": 140, "y": 315, "w": 77, "h": 80, "rotate": 0 },
        { "x": 357, "y": 322, "w": 80, "h": 77, "rotate": 0 }
      ],
      "eating": [
        { "x": 133, "y": 233, "w": 79, "h": 80, "rotate": 0 },
        { "x": 214, "y": 233, "w": 77, "h": 80, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 4, "y": 399, "w": 140, "h": 78, "rotate": 0 }
      ],
      "training": [
        { "x": 279, "y": 401, "w": 82, "h": 78, "rotate": 0 },
        { "x": 363, "y": 401, "w": 80, "h": 78, "rotate": 0 }
      ],
      "sick": [
        { "x": 4, "y": 399, "w": 140, "h": 78, "rotate": 0 }
      ],
      "sitting": [
        { "x": 133, "y": 233, "w": 79, "h": 80, "rotate": 0 }
      ]
    }
  },
  "herculeskabuterimon": {
    "sheetPath": "/assets/aistudio/HerculesKabuterimon_2_89341216.png",
    "sheetWidth": 499,
    "sheetHeight": 499,
    "frames": {
      "standing": [
        { "x": 104, "y": 3, "w": 92, "h": 93, "rotate": 0 },
        { "x": 95, "y": 98, "w": 92, "h": 93, "rotate": 0 }
      ],
      "walking": [
        { "x": 104, "y": 3, "w": 92, "h": 93, "rotate": 0 },
        { "x": 95, "y": 98, "w": 92, "h": 93, "rotate": 0 },
        { "x": 189, "y": 104, "w": 98, "h": 86, "rotate": 0 },
        { "x": 95, "y": 98, "w": 92, "h": 93, "rotate": 0 }
      ],
      "happy": [
        { "x": 2, "y": 94, "w": 91, "h": 95, "rotate": 0 },
        { "x": 189, "y": 192, "w": 86, "h": 98, "rotate": 0 }
      ],
      "eating": [
        { "x": 104, "y": 3, "w": 92, "h": 93, "rotate": 0 },
        { "x": 95, "y": 98, "w": 92, "h": 93, "rotate": 0 }
      ],
      "sleeping": [
        { "x": 197, "y": 411, "w": 97, "h": 86, "rotate": 0 }
      ],
      "training": [
        { "x": 2, "y": 394, "w": 101, "h": 103, "rotate": 0 },
        { "x": 105, "y": 403, "w": 90, "h": 94, "rotate": 0 }
      ],
      "sick": [
        { "x": 197, "y": 411, "w": 97, "h": 86, "rotate": 0 }
      ],
      "sitting": [
        { "x": 104, "y": 3, "w": 92, "h": 93, "rotate": 0 }
      ]
    }
  }
};

// Update or append species in newDigimonSprites
for (const [id, config] of Object.entries(spriteUpdates)) {
  const marker = `"${id}": {`;
  const idx = spriteFile.indexOf(marker);
  if (idx !== -1) {
    // Find matching closing brace
    let depth = 0;
    let endIdx = idx;
    for (let i = idx; i < spriteFile.length; i++) {
      if (spriteFile[i] === '{') depth++;
      else if (spriteFile[i] === '}') {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          if (spriteFile[endIdx] === ',') endIdx++;
          break;
        }
      }
    }
    const replacement = `"${id}": ${JSON.stringify(config, null, 2)},\n`;
    spriteFile = spriteFile.slice(0, idx) + replacement + spriteFile.slice(endIdx);
    console.log(`Updated existing sprite config for ${id}`);
  } else {
    // Add before the closing brace of NEW_DIGIMON_SPRITES
    const lastBrace = spriteFile.lastIndexOf('};');
    const addition = `  "${id}": ${JSON.stringify(config, null, 2)},\n`;
    spriteFile = spriteFile.slice(0, lastBrace) + addition + spriteFile.slice(lastBrace);
    console.log(`Appended new sprite config for ${id}`);
  }
}

fs.writeFileSync(spriteFilePath, spriteFile, 'utf8');
console.log('Successfully updated newDigimonSprites.ts!');
