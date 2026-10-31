// Auto-generated Clean & Authentic Digimon Championship Sprite Configurations
export interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  offsetY?: number; // Vertical ground offset (+/- px) to align feet naturally on ground level
  sheetPath?: string;
  sheetWidth?: number;
  sheetHeight?: number;
}

export interface DigimonSpriteConfig {
  sheetPath: string;
  sheetWidth: number;
  sheetHeight: number;
  groundOffset?: number; // Global ground level adjustment (+/- px) for this species
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


export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = {
  "botamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Botamon_fb04c770.png",
    "sheetWidth": 201,
    "sheetHeight": 201,
    "frames": {
      "standing": [
        {
          "x": 69,
          "y": 21,
          "w": 29,
          "h": 34,
          "rotate": 0
        },
        {
          "x": 100,
          "y": 24,
          "w": 30,
          "h": 34,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 33,
          "y": 42,
          "w": 27,
          "h": 35,
          "rotate": 0
        },
        {
          "x": 132,
          "y": 48,
          "w": 32,
          "h": 30,
          "rotate": 0
        },
        {
          "x": 166,
          "y": 48,
          "w": 33,
          "h": 28,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 2,
          "y": 2,
          "w": 33,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 69,
          "y": 21,
          "w": 29,
          "h": 34,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 37,
          "y": 5,
          "w": 30,
          "h": 35,
          "rotate": 0
        },
        {
          "x": 69,
          "y": 21,
          "w": 29,
          "h": 34,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 80,
          "y": 126,
          "w": 35,
          "h": 21,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 2,
          "y": 2,
          "w": 33,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 37,
          "y": 5,
          "w": 30,
          "h": 35,
          "rotate": 0
        },
        {
          "x": 62,
          "y": 57,
          "w": 32,
          "h": 33,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 80,
          "y": 126,
          "w": 35,
          "h": 21,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 69,
          "y": 21,
          "w": 29,
          "h": 34,
          "rotate": 0
        }
      ]
    }
  },
  "punimon": {
    "sheetPath": "/assets/aistudio/Copy_of_Punimon_68b4fcb1.png",
    "sheetWidth": 214,
    "sheetHeight": 214,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 133,
          "w": 40,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 44,
          "y": 133,
          "w": 40,
          "h": 32,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 133,
          "w": 40,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 167,
          "w": 42,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 44,
          "y": 133,
          "w": 40,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 45,
          "y": 167,
          "w": 40,
          "h": 32,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 2,
          "y": 167,
          "w": 42,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 44,
          "y": 133,
          "w": 40,
          "h": 32,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 2,
          "y": 133,
          "w": 40,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 44,
          "y": 133,
          "w": 40,
          "h": 32,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 130,
          "y": 78,
          "w": 36,
          "h": 30,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 2,
          "y": 167,
          "w": 42,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 45,
          "y": 167,
          "w": 40,
          "h": 32,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 130,
          "y": 78,
          "w": 36,
          "h": 30,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 133,
          "w": 40,
          "h": 32,
          "rotate": 0
        }
      ]
    }
  },
  "pabumon": {
    "sheetPath": "/assets/aistudio/Copy_of_Pabumon_8b4cbbd7.png",
    "sheetWidth": 220,
    "sheetHeight": 220,
    "frames": {
      "standing": [
        {
          "x": 5,
          "y": 10,
          "w": 36,
          "h": 31,
          "rotate": 0
        },
        {
          "x": 121,
          "y": 9,
          "w": 38,
          "h": 34,
          "rotate": 0
        },
        {
          "x": 161,
          "y": 8,
          "w": 35,
          "h": 35,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 43,
          "y": 22,
          "w": 37,
          "h": 31,
          "rotate": 0
        },
        {
          "x": 82,
          "y": 17,
          "w": 37,
          "h": 36,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 126,
          "y": 45,
          "w": 40,
          "h": 29,
          "rotate": 0
        },
        {
          "x": 5,
          "y": 10,
          "w": 36,
          "h": 31,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 6,
          "y": 52,
          "w": 35,
          "h": 31,
          "rotate": 0
        },
        {
          "x": 5,
          "y": 10,
          "w": 36,
          "h": 31,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 126,
          "y": 76,
          "w": 41,
          "h": 25,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 126,
          "y": 45,
          "w": 40,
          "h": 29,
          "rotate": 0
        },
        {
          "x": 6,
          "y": 52,
          "w": 35,
          "h": 31,
          "rotate": 0
        },
        {
          "x": 87,
          "y": 55,
          "w": 37,
          "h": 34,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 126,
          "y": 76,
          "w": 41,
          "h": 25,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 5,
          "y": 10,
          "w": 36,
          "h": 31,
          "rotate": 0
        }
      ]
    }
  },
  "poyomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Poyomon_d1a420e7.png",
    "sheetWidth": 248,
    "sheetHeight": 248,
    "frames": {
      "standing": [
        {
          "x": 15,
          "y": 114,
          "w": 42,
          "h": 41
        },
        {
          "x": 55,
          "y": 115,
          "w": 42,
          "h": 42
        }
      ],
      "walking": [
        {
          "x": 15,
          "y": 114,
          "w": 42,
          "h": 41
        },
        {
          "x": 55,
          "y": 115,
          "w": 42,
          "h": 42
        },
        {
          "x": 95,
          "y": 165,
          "w": 42,
          "h": 42
        },
        {
          "x": 139,
          "y": 164,
          "w": 42,
          "h": 43
        }
      ],
      "happy": [
        {
          "x": 95,
          "y": 165,
          "w": 42,
          "h": 42
        },
        {
          "x": 179,
          "y": 165,
          "w": 35,
          "h": 42
        }
      ],
      "eating": [
        {
          "x": 95,
          "y": 165,
          "w": 42,
          "h": 42
        },
        {
          "x": 179,
          "y": 165,
          "w": 35,
          "h": 42
        }
      ],
      "sleeping": [
        {
          "x": 15,
          "y": 155,
          "w": 40,
          "h": 44
        }
      ],
      "training": [
        {
          "x": 139,
          "y": 164,
          "w": 42,
          "h": 43
        },
        {
          "x": 179,
          "y": 165,
          "w": 35,
          "h": 42
        }
      ],
      "sick": [
        {
          "x": 15,
          "y": 155,
          "w": 40,
          "h": 44
        }
      ],
      "sitting": [
        {
          "x": 15,
          "y": 114,
          "w": 42,
          "h": 41
        },
        {
          "x": 55,
          "y": 115,
          "w": 42,
          "h": 42
        }
      ]
    }
  },
  "pichimon": {
    "sheetPath": "/assets/aistudio/Copy_of_Pichimon_eca26270.png",
    "sheetWidth": 256,
    "sheetHeight": 256,
    "frames": {
      "standing": [
        {
          "x": 36,
          "y": 75,
          "w": 35,
          "h": 34,
          "rotate": 0
        },
        {
          "x": 73,
          "y": 76,
          "w": 26,
          "h": 33,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 117,
          "w": 35,
          "h": 41,
          "rotate": 0
        },
        {
          "x": 83,
          "y": 116,
          "w": 28,
          "h": 39,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 2,
          "y": 27,
          "w": 30,
          "h": 43,
          "rotate": 0
        },
        {
          "x": 36,
          "y": 75,
          "w": 35,
          "h": 34,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 2,
          "y": 72,
          "w": 32,
          "h": 43,
          "rotate": 0
        },
        {
          "x": 36,
          "y": 75,
          "w": 35,
          "h": 34,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 113,
          "y": 105,
          "w": 37,
          "h": 21,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 2,
          "y": 27,
          "w": 30,
          "h": 43,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 72,
          "w": 32,
          "h": 43,
          "rotate": 0
        },
        {
          "x": 101,
          "y": 77,
          "w": 33,
          "h": 26,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 113,
          "y": 105,
          "w": 37,
          "h": 21,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 36,
          "y": 75,
          "w": 35,
          "h": 34,
          "rotate": 0
        }
      ]
    }
  },
  "yuramon": {
    "sheetPath": "/assets/aistudio/Copy_of_Yuramon_3ad2937a.png",
    "sheetWidth": 212,
    "sheetHeight": 212,
    "frames": {
      "standing": [
        {
          "x": 1,
          "y": 155,
          "w": 40,
          "h": 42
        },
        {
          "x": 41,
          "y": 157,
          "w": 42,
          "h": 40
        }
      ],
      "walking": [
        {
          "x": 1,
          "y": 155,
          "w": 40,
          "h": 42
        },
        {
          "x": 41,
          "y": 157,
          "w": 42,
          "h": 40
        },
        {
          "x": 80,
          "y": 173,
          "w": 41,
          "h": 38
        },
        {
          "x": 41,
          "y": 157,
          "w": 42,
          "h": 40
        }
      ],
      "happy": [
        {
          "x": 77,
          "y": 105,
          "w": 42,
          "h": 38
        },
        {
          "x": 41,
          "y": 157,
          "w": 42,
          "h": 40
        }
      ],
      "eating": [
        {
          "x": 77,
          "y": 105,
          "w": 42,
          "h": 38
        },
        {
          "x": 41,
          "y": 157,
          "w": 42,
          "h": 40
        }
      ],
      "sleeping": [
        {
          "x": 1,
          "y": 7,
          "w": 40,
          "h": 25
        }
      ],
      "training": [
        {
          "x": 1,
          "y": 155,
          "w": 40,
          "h": 42
        },
        {
          "x": 77,
          "y": 105,
          "w": 42,
          "h": 38
        }
      ],
      "sick": [
        {
          "x": 1,
          "y": 7,
          "w": 40,
          "h": 25
        }
      ],
      "sitting": [
        {
          "x": 1,
          "y": 155,
          "w": 40,
          "h": 42
        },
        {
          "x": 41,
          "y": 157,
          "w": 42,
          "h": 40
        }
      ]
    }
  },
  "nyokimon": {
    "sheetPath": "/assets/aistudio/Copy_of_Nyokimon_e5b120c1.png",
    "sheetWidth": 256,
    "sheetHeight": 256,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 12,
          "w": 35,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 74,
          "y": 111,
          "w": 35,
          "h": 44,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 12,
          "w": 35,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 37,
          "y": 105,
          "w": 35,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 150,
          "w": 35,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 74,
          "y": 111,
          "w": 35,
          "h": 44,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 37,
          "y": 105,
          "w": 35,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 12,
          "w": 35,
          "h": 44,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 2,
          "y": 12,
          "w": 35,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 74,
          "y": 111,
          "w": 35,
          "h": 44,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 81,
          "y": 231,
          "w": 44,
          "h": 23,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 37,
          "y": 105,
          "w": 35,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 150,
          "w": 35,
          "h": 44,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 81,
          "y": 231,
          "w": 44,
          "h": 23,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 12,
          "w": 35,
          "h": 44,
          "rotate": 0
        }
      ]
    }
  },
  "koromon": {
    "sheetPath": "/assets/aistudio/Copy_of_Koromon_7d75f13c.png",
    "sheetWidth": 245,
    "sheetHeight": 245,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 2,
          "w": 45,
          "h": 37,
          "rotate": 0
        },
        {
          "x": 49,
          "y": 2,
          "w": 40,
          "h": 41,
          "rotate": 0
        },
        {
          "x": 91,
          "y": 6,
          "w": 35,
          "h": 40,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 41,
          "w": 40,
          "h": 46,
          "rotate": 0
        },
        {
          "x": 44,
          "y": 45,
          "w": 40,
          "h": 43,
          "rotate": 0
        },
        {
          "x": 86,
          "y": 48,
          "w": 41,
          "h": 39,
          "rotate": 0
        },
        {
          "x": 129,
          "y": 51,
          "w": 40,
          "h": 34,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 174,
          "y": 82,
          "w": 41,
          "h": 33,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 45,
          "h": 37,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 131,
          "y": 87,
          "w": 41,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 45,
          "h": 37,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 185,
          "y": 117,
          "w": 41,
          "h": 29,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 174,
          "y": 82,
          "w": 41,
          "h": 33,
          "rotate": 0
        },
        {
          "x": 131,
          "y": 87,
          "w": 41,
          "h": 32,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 89,
          "w": 38,
          "h": 49,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 185,
          "y": 117,
          "w": 41,
          "h": 29,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 2,
          "w": 45,
          "h": 37,
          "rotate": 0
        }
      ]
    }
  },
  "tsunomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Tsunomon_d59ed36b.png",
    "sheetWidth": 252,
    "sheetHeight": 252,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 7,
          "w": 42,
          "h": 47,
          "rotate": 0
        },
        {
          "x": 46,
          "y": 10,
          "w": 44,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 92,
          "y": 9,
          "w": 44,
          "h": 44,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 56,
          "w": 43,
          "h": 47,
          "rotate": 0
        },
        {
          "x": 47,
          "y": 56,
          "w": 45,
          "h": 43,
          "rotate": 0
        },
        {
          "x": 94,
          "y": 55,
          "w": 43,
          "h": 42,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 184,
          "y": 3,
          "w": 44,
          "h": 29,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 7,
          "w": 42,
          "h": 47,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 139,
          "y": 32,
          "w": 42,
          "h": 38,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 7,
          "w": 42,
          "h": 47,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 138,
          "y": 2,
          "w": 44,
          "h": 28,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 184,
          "y": 3,
          "w": 44,
          "h": 29,
          "rotate": 0
        },
        {
          "x": 139,
          "y": 32,
          "w": 42,
          "h": 38,
          "rotate": 0
        },
        {
          "x": 183,
          "y": 34,
          "w": 36,
          "h": 43,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 138,
          "y": 2,
          "w": 44,
          "h": 28,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 7,
          "w": 42,
          "h": 47,
          "rotate": 0
        }
      ]
    }
  },
  "tokomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Tokomon_c5323292.png",
    "sheetWidth": 274,
    "sheetHeight": 274,
    "frames": {
      "standing": [
        {
          "x": 217,
          "y": 18,
          "w": 40,
          "h": 45
        },
        {
          "x": 91,
          "y": 39,
          "w": 42,
          "h": 46
        }
      ],
      "walking": [
        {
          "x": 217,
          "y": 18,
          "w": 40,
          "h": 45
        },
        {
          "x": 91,
          "y": 39,
          "w": 42,
          "h": 46
        },
        {
          "x": 85,
          "y": 83,
          "w": 40,
          "h": 48
        },
        {
          "x": 74,
          "y": 131,
          "w": 42,
          "h": 41
        }
      ],
      "happy": [
        {
          "x": 217,
          "y": 18,
          "w": 40,
          "h": 45
        },
        {
          "x": 85,
          "y": 83,
          "w": 40,
          "h": 48
        }
      ],
      "eating": [
        {
          "x": 217,
          "y": 18,
          "w": 40,
          "h": 45
        },
        {
          "x": 85,
          "y": 83,
          "w": 40,
          "h": 48
        }
      ],
      "sleeping": [
        {
          "x": 51,
          "y": 85,
          "w": 32,
          "h": 45
        }
      ],
      "training": [
        {
          "x": 7,
          "y": 135,
          "w": 47,
          "h": 37
        },
        {
          "x": 7,
          "y": 37,
          "w": 47,
          "h": 47
        }
      ],
      "sick": [
        {
          "x": 51,
          "y": 85,
          "w": 32,
          "h": 45
        }
      ],
      "sitting": [
        {
          "x": 217,
          "y": 18,
          "w": 40,
          "h": 45
        },
        {
          "x": 91,
          "y": 39,
          "w": 42,
          "h": 46
        }
      ]
    }
  },
  "tanemon": {
    "sheetPath": "/assets/aistudio/Copy_of_Tanemon_17517f84.png",
    "sheetWidth": 248,
    "sheetHeight": 248,
    "frames": {
      "standing": [
        {
          "x": 120,
          "y": 84,
          "w": 40,
          "h": 36,
          "rotate": 0
        },
        {
          "x": 162,
          "y": 80,
          "w": 40,
          "h": 36,
          "rotate": 0
        },
        {
          "x": 204,
          "y": 77,
          "w": 40,
          "h": 36,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 101,
          "w": 38,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 42,
          "y": 109,
          "w": 39,
          "h": 41,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 40,
          "y": 10,
          "w": 38,
          "h": 36,
          "rotate": 0
        },
        {
          "x": 120,
          "y": 84,
          "w": 40,
          "h": 36,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 2,
          "y": 12,
          "w": 36,
          "h": 42,
          "rotate": 0
        },
        {
          "x": 120,
          "y": 84,
          "w": 40,
          "h": 36,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 41,
          "y": 48,
          "w": 46,
          "h": 22,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 40,
          "y": 10,
          "w": 38,
          "h": 36,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 12,
          "w": 36,
          "h": 42,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 56,
          "w": 37,
          "h": 43,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 41,
          "y": 48,
          "w": 46,
          "h": 22,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 120,
          "y": 84,
          "w": 40,
          "h": 36,
          "rotate": 0
        }
      ]
    }
  },
  "bukamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Bukamon_b180f25e.png",
    "sheetWidth": 303,
    "sheetHeight": 303,
    "frames": {
      "standing": [
        {
          "x": 1,
          "y": 94,
          "w": 56,
          "h": 65
        },
        {
          "x": 57,
          "y": 103,
          "w": 56,
          "h": 58
        }
      ],
      "walking": [
        {
          "x": 1,
          "y": 32,
          "w": 58,
          "h": 61
        },
        {
          "x": 59,
          "y": 45,
          "w": 56,
          "h": 58
        },
        {
          "x": 1,
          "y": 94,
          "w": 56,
          "h": 65
        },
        {
          "x": 57,
          "y": 103,
          "w": 56,
          "h": 58
        }
      ],
      "happy": [
        {
          "x": 168,
          "y": 123,
          "w": 48,
          "h": 62
        },
        {
          "x": 216,
          "y": 129,
          "w": 43,
          "h": 64
        }
      ],
      "eating": [
        {
          "x": 168,
          "y": 123,
          "w": 48,
          "h": 62
        },
        {
          "x": 216,
          "y": 129,
          "w": 43,
          "h": 64
        }
      ],
      "sleeping": [
        {
          "x": 1,
          "y": 2,
          "w": 61,
          "h": 30
        }
      ],
      "training": [
        {
          "x": 1,
          "y": 160,
          "w": 58,
          "h": 69
        },
        {
          "x": 55,
          "y": 174,
          "w": 58,
          "h": 65
        }
      ],
      "sick": [
        {
          "x": 1,
          "y": 2,
          "w": 61,
          "h": 30
        }
      ],
      "sitting": [
        {
          "x": 1,
          "y": 94,
          "w": 56,
          "h": 65
        },
        {
          "x": 57,
          "y": 103,
          "w": 56,
          "h": 58
        }
      ]
    }
  },
  "nyaromon": {
    "sheetPath": "/assets/aistudio/Copy_of_Nyaromon_923766aa.png",
    "sheetWidth": 265,
    "sheetHeight": 265,
    "frames": {
      "standing": [
        {
          "x": 5,
          "y": 52,
          "w": 44,
          "h": 41
        },
        {
          "x": 51,
          "y": 57,
          "w": 47,
          "h": 42
        }
      ],
      "walking": [
        {
          "x": 5,
          "y": 52,
          "w": 44,
          "h": 41
        },
        {
          "x": 51,
          "y": 57,
          "w": 47,
          "h": 42
        },
        {
          "x": 192,
          "y": 51,
          "w": 42,
          "h": 42
        },
        {
          "x": 52,
          "y": 107,
          "w": 46,
          "h": 42
        }
      ],
      "happy": [
        {
          "x": 149,
          "y": 115,
          "w": 47,
          "h": 42
        },
        {
          "x": 204,
          "y": 121,
          "w": 47,
          "h": 42
        }
      ],
      "eating": [
        {
          "x": 149,
          "y": 115,
          "w": 47,
          "h": 42
        },
        {
          "x": 204,
          "y": 121,
          "w": 47,
          "h": 42
        }
      ],
      "sleeping": [
        {
          "x": 141,
          "y": 43,
          "w": 47,
          "h": 32
        }
      ],
      "training": [
        {
          "x": 7,
          "y": 127,
          "w": 45,
          "h": 42
        },
        {
          "x": 5,
          "y": 153,
          "w": 47,
          "h": 44
        }
      ],
      "sick": [
        {
          "x": 141,
          "y": 43,
          "w": 47,
          "h": 32
        }
      ],
      "sitting": [
        {
          "x": 5,
          "y": 52,
          "w": 44,
          "h": 41
        },
        {
          "x": 51,
          "y": 57,
          "w": 47,
          "h": 42
        }
      ]
    }
  },
  "yokomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Yokomon_dd201051.png",
    "sheetWidth": 269,
    "sheetHeight": 269,
    "frames": {
      "standing": [
        {
          "x": 39,
          "y": 88,
          "w": 36,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 77,
          "y": 88,
          "w": 36,
          "h": 53,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 39,
          "y": 88,
          "w": 36,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 147,
          "y": 91,
          "w": 36,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 184,
          "y": 91,
          "w": 36,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 220,
          "y": 91,
          "w": 36,
          "h": 53,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 184,
          "y": 91,
          "w": 36,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 39,
          "y": 88,
          "w": 36,
          "h": 53,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 77,
          "y": 88,
          "w": 36,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 39,
          "y": 88,
          "w": 36,
          "h": 53,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 146,
          "y": 146,
          "w": 44,
          "h": 23,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 147,
          "y": 91,
          "w": 36,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 184,
          "y": 91,
          "w": 36,
          "h": 53,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 146,
          "y": 146,
          "w": 44,
          "h": 23,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 39,
          "y": 88,
          "w": 36,
          "h": 53,
          "rotate": 0
        }
      ]
    }
  },
  "agumon": {
    "sheetPath": "/assets/aistudio/Copy_of_Agumon_Adventure_04d0832a.png",
    "sheetWidth": 324,
    "sheetHeight": 324,
    "frames": {
      "standing": [
        {
          "x": 167,
          "y": 30,
          "w": 47,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 222,
          "y": 41,
          "w": 37,
          "h": 38,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 21,
          "w": 40,
          "h": 62,
          "rotate": 0
        },
        {
          "x": 44,
          "y": 21,
          "w": 47,
          "h": 59,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 119,
          "y": 29,
          "w": 46,
          "h": 60,
          "rotate": 0
        },
        {
          "x": 167,
          "y": 30,
          "w": 47,
          "h": 44,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 172,
          "y": 76,
          "w": 43,
          "h": 47,
          "rotate": 0
        },
        {
          "x": 167,
          "y": 30,
          "w": 47,
          "h": 44,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 113,
          "y": 284,
          "w": 33,
          "h": 25,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 119,
          "y": 29,
          "w": 46,
          "h": 60,
          "rotate": 0
        },
        {
          "x": 172,
          "y": 76,
          "w": 43,
          "h": 47,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 85,
          "w": 41,
          "h": 67,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 113,
          "y": 284,
          "w": 33,
          "h": 25,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 167,
          "y": 30,
          "w": 47,
          "h": 44,
          "rotate": 0
        }
      ]
    }
  },
  "gabumon": {
    "sheetPath": "/assets/aistudio/Copy_of_Gabumon_1beb725f.png",
    "sheetWidth": 467,
    "sheetHeight": 467,
    "frames": {
      "standing": [
        {
          "x": 264,
          "y": 221,
          "w": 59,
          "h": 46
        },
        {
          "x": 325,
          "y": 217,
          "w": 59,
          "h": 46
        }
      ],
      "walking": [
        {
          "x": 264,
          "y": 221,
          "w": 59,
          "h": 46
        },
        {
          "x": 264,
          "y": 274,
          "w": 58,
          "h": 46
        },
        {
          "x": 326,
          "y": 269,
          "w": 58,
          "h": 46
        },
        {
          "x": 388,
          "y": 265,
          "w": 58,
          "h": 46
        }
      ],
      "happy": [
        {
          "x": 271,
          "y": 375,
          "w": 64,
          "h": 57
        },
        {
          "x": 394,
          "y": 370,
          "w": 64,
          "h": 61
        }
      ],
      "eating": [
        {
          "x": 271,
          "y": 375,
          "w": 64,
          "h": 57
        },
        {
          "x": 394,
          "y": 370,
          "w": 64,
          "h": 61
        }
      ],
      "sleeping": [
        {
          "x": 105,
          "y": 1,
          "w": 67,
          "h": 28
        }
      ],
      "training": [
        {
          "x": 271,
          "y": 319,
          "w": 63,
          "h": 56
        },
        {
          "x": 334,
          "y": 317,
          "w": 67,
          "h": 57
        },
        {
          "x": 394,
          "y": 311,
          "w": 65,
          "h": 62
        }
      ],
      "sick": [
        {
          "x": 105,
          "y": 1,
          "w": 67,
          "h": 28
        }
      ],
      "sitting": [
        {
          "x": 264,
          "y": 221,
          "w": 59,
          "h": 46
        },
        {
          "x": 325,
          "y": 217,
          "w": 59,
          "h": 46
        }
      ]
    }
  },
  "biyomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Biyomon_ad3c3232.png",
    "sheetWidth": 269,
    "sheetHeight": 269,
    "frames": {
      "standing": [
        {
          "x": 1,
          "y": 159,
          "w": 45,
          "h": 53
        },
        {
          "x": 46,
          "y": 159,
          "w": 44,
          "h": 54
        }
      ],
      "walking": [
        {
          "x": 1,
          "y": 105,
          "w": 45,
          "h": 53
        },
        {
          "x": 89,
          "y": 110,
          "w": 46,
          "h": 53
        },
        {
          "x": 132,
          "y": 119,
          "w": 44,
          "h": 52
        },
        {
          "x": 176,
          "y": 124,
          "w": 46,
          "h": 52
        }
      ],
      "happy": [
        {
          "x": 1,
          "y": 214,
          "w": 47,
          "h": 54
        },
        {
          "x": 45,
          "y": 215,
          "w": 45,
          "h": 53
        }
      ],
      "eating": [
        {
          "x": 1,
          "y": 214,
          "w": 47,
          "h": 54
        },
        {
          "x": 45,
          "y": 215,
          "w": 45,
          "h": 53
        }
      ],
      "sleeping": [
        {
          "x": 219,
          "y": 44,
          "w": 47,
          "h": 27
        }
      ],
      "training": [
        {
          "x": 214,
          "y": 119,
          "w": 47,
          "h": 54
        },
        {
          "x": 1,
          "y": 105,
          "w": 45,
          "h": 53
        }
      ],
      "sick": [
        {
          "x": 219,
          "y": 44,
          "w": 47,
          "h": 27
        }
      ],
      "sitting": [
        {
          "x": 1,
          "y": 159,
          "w": 45,
          "h": 53
        },
        {
          "x": 46,
          "y": 159,
          "w": 44,
          "h": 54
        }
      ]
    }
  },
  "patamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Patamon_6c39d52c.png",
    "sheetWidth": 312,
    "sheetHeight": 312,
    "frames": {
      "standing": [
        {
          "x": 46,
          "y": 2,
          "w": 46,
          "h": 46,
          "rotate": 0
        },
        {
          "x": 94,
          "y": 4,
          "w": 47,
          "h": 44,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 46,
          "y": 50,
          "w": 48,
          "h": 45,
          "rotate": 0
        },
        {
          "x": 96,
          "y": 50,
          "w": 48,
          "h": 44,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 2,
          "y": 19,
          "w": 42,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 46,
          "y": 2,
          "w": 46,
          "h": 46,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 163,
          "y": 68,
          "w": 45,
          "h": 43,
          "rotate": 0
        },
        {
          "x": 46,
          "y": 2,
          "w": 46,
          "h": 46,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 281,
          "y": 239,
          "w": 22,
          "h": 15,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 2,
          "y": 19,
          "w": 42,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 163,
          "y": 68,
          "w": 45,
          "h": 43,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 74,
          "w": 42,
          "h": 56,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 281,
          "y": 239,
          "w": 22,
          "h": 15,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 46,
          "y": 2,
          "w": 46,
          "h": 46,
          "rotate": 0
        }
      ]
    }
  },
  "palmon": {
    "sheetPath": "/assets/aistudio/Copy_of_Palmon_2070e7b5.png",
    "sheetWidth": 301,
    "sheetHeight": 301,
    "frames": {
      "standing": [
        {
          "x": 51,
          "y": 51,
          "w": 38,
          "h": 49
        },
        {
          "x": 89,
          "y": 51,
          "w": 38,
          "h": 49
        }
      ],
      "walking": [
        {
          "x": 51,
          "y": 51,
          "w": 38,
          "h": 49
        },
        {
          "x": 89,
          "y": 51,
          "w": 38,
          "h": 49
        },
        {
          "x": 162,
          "y": 51,
          "w": 39,
          "h": 52
        },
        {
          "x": 255,
          "y": 58,
          "w": 34,
          "h": 52
        }
      ],
      "happy": [
        {
          "x": 216,
          "y": 111,
          "w": 42,
          "h": 52
        },
        {
          "x": 258,
          "y": 110,
          "w": 37,
          "h": 51
        }
      ],
      "eating": [
        {
          "x": 216,
          "y": 111,
          "w": 42,
          "h": 52
        },
        {
          "x": 258,
          "y": 110,
          "w": 37,
          "h": 51
        }
      ],
      "sleeping": [
        {
          "x": 185,
          "y": 7,
          "w": 41,
          "h": 47
        }
      ],
      "training": [
        {
          "x": 65,
          "y": 103,
          "w": 43,
          "h": 52
        },
        {
          "x": 1,
          "y": 50,
          "w": 50,
          "h": 50
        }
      ],
      "sick": [
        {
          "x": 185,
          "y": 7,
          "w": 41,
          "h": 47
        }
      ],
      "sitting": [
        {
          "x": 51,
          "y": 51,
          "w": 38,
          "h": 49
        },
        {
          "x": 89,
          "y": 51,
          "w": 38,
          "h": 49
        }
      ]
    }
  },
  "gomamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Gomamon_45ce5d57.png",
    "sheetWidth": 334,
    "sheetHeight": 334,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 2,
          "w": 57,
          "h": 38,
          "rotate": 0
        },
        {
          "x": 61,
          "y": 2,
          "w": 57,
          "h": 38,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 120,
          "y": 13,
          "w": 57,
          "h": 40,
          "rotate": 0
        },
        {
          "x": 179,
          "y": 2,
          "w": 37,
          "h": 48,
          "rotate": 0
        },
        {
          "x": 218,
          "y": 11,
          "w": 50,
          "h": 39,
          "rotate": 0
        },
        {
          "x": 273,
          "y": 23,
          "w": 24,
          "h": 31,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 15,
          "y": 50,
          "w": 37,
          "h": 49,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 57,
          "h": 38,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 215,
          "y": 52,
          "w": 42,
          "h": 45,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 57,
          "h": 38,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 200,
          "y": 254,
          "w": 68,
          "h": 27,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 15,
          "y": 50,
          "w": 37,
          "h": 49,
          "rotate": 0
        },
        {
          "x": 215,
          "y": 52,
          "w": 42,
          "h": 45,
          "rotate": 0
        },
        {
          "x": 77,
          "y": 55,
          "w": 52,
          "h": 46,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 200,
          "y": 254,
          "w": 68,
          "h": 27,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 2,
          "w": 57,
          "h": 38,
          "rotate": 0
        }
      ]
    }
  },
  "salamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Salamon_adc16886.png",
    "sheetWidth": 306,
    "sheetHeight": 306,
    "frames": {
      "standing": [
        {
          "x": 85,
          "y": 21,
          "w": 54,
          "h": 47,
          "rotate": 0
        },
        {
          "x": 141,
          "y": 21,
          "w": 51,
          "h": 47,
          "rotate": 0
        },
        {
          "x": 194,
          "y": 20,
          "w": 43,
          "h": 48,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 45,
          "w": 47,
          "h": 59,
          "rotate": 0
        },
        {
          "x": 51,
          "y": 36,
          "w": 32,
          "h": 69,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 239,
          "y": 47,
          "w": 44,
          "h": 49,
          "rotate": 0
        },
        {
          "x": 85,
          "y": 21,
          "w": 54,
          "h": 47,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 85,
          "y": 70,
          "w": 50,
          "h": 54,
          "rotate": 0
        },
        {
          "x": 85,
          "y": 21,
          "w": 54,
          "h": 47,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 239,
          "y": 3,
          "w": 48,
          "h": 42,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 239,
          "y": 47,
          "w": 44,
          "h": 49,
          "rotate": 0
        },
        {
          "x": 85,
          "y": 70,
          "w": 50,
          "h": 54,
          "rotate": 0
        },
        {
          "x": 137,
          "y": 70,
          "w": 47,
          "h": 53,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 239,
          "y": 3,
          "w": 48,
          "h": 42,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 85,
          "y": 21,
          "w": 54,
          "h": 47,
          "rotate": 0
        }
      ]
    }
  },
  "greymon": {
    "sheetPath": "/assets/aistudio/Copy_of_Greymon_dcbe93f9.png",
    "sheetWidth": 389,
    "sheetHeight": 389,
    "frames": {
      "standing": [
        {
          "x": 162,
          "y": 26,
          "w": 56,
          "h": 52,
          "rotate": 0
        },
        {
          "x": 220,
          "y": 26,
          "w": 56,
          "h": 54,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 278,
          "y": 32,
          "w": 54,
          "h": 56,
          "rotate": 0
        },
        {
          "x": 334,
          "y": 31,
          "w": 52,
          "h": 57,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 2,
          "y": 34,
          "w": 52,
          "h": 63,
          "rotate": 0
        },
        {
          "x": 162,
          "y": 26,
          "w": 56,
          "h": 52,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 56,
          "y": 36,
          "w": 50,
          "h": 61,
          "rotate": 0
        },
        {
          "x": 162,
          "y": 26,
          "w": 56,
          "h": 52,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 2,
          "y": 10,
          "w": 62,
          "h": 22,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 2,
          "y": 34,
          "w": 52,
          "h": 63,
          "rotate": 0
        },
        {
          "x": 56,
          "y": 36,
          "w": 50,
          "h": 61,
          "rotate": 0
        },
        {
          "x": 108,
          "y": 41,
          "w": 52,
          "h": 60,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 2,
          "y": 10,
          "w": 62,
          "h": 22,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 162,
          "y": 26,
          "w": 56,
          "h": 52,
          "rotate": 0
        }
      ]
    }
  },
  "garurumon": {
    "sheetPath": "/assets/aistudio/Copy_of_Garurumon_2a0bd546.png",
    "sheetWidth": 452,
    "sheetHeight": 452,
    "frames": {
      "standing": [
        {
          "x": 80,
          "y": 38,
          "w": 71,
          "h": 45,
          "rotate": 0
        },
        {
          "x": 153,
          "y": 38,
          "w": 71,
          "h": 45,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 80,
          "y": 38,
          "w": 71,
          "h": 45,
          "rotate": 0
        },
        {
          "x": 153,
          "y": 38,
          "w": 71,
          "h": 45,
          "rotate": 0
        },
        {
          "x": 277,
          "y": 406,
          "w": 79,
          "h": 44,
          "rotate": 0
        },
        {
          "x": 358,
          "y": 407,
          "w": 79,
          "h": 44,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 80,
          "y": 38,
          "w": 71,
          "h": 45,
          "rotate": 0
        },
        {
          "x": 280,
          "y": 29,
          "w": 54,
          "h": 56,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 80,
          "y": 38,
          "w": 71,
          "h": 45,
          "rotate": 0
        },
        {
          "x": 280,
          "y": 29,
          "w": 54,
          "h": 56,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 277,
          "y": 382,
          "w": 72,
          "h": 22,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 75,
          "y": 147,
          "w": 83,
          "h": 49,
          "rotate": 0
        },
        {
          "x": 160,
          "y": 148,
          "w": 74,
          "h": 48,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 277,
          "y": 382,
          "w": 72,
          "h": 22,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 80,
          "y": 38,
          "w": 71,
          "h": 45,
          "rotate": 0
        },
        {
          "x": 153,
          "y": 38,
          "w": 71,
          "h": 45,
          "rotate": 0
        }
      ]
    }
  },
  "birdramon": {
    "sheetPath": "/assets/aistudio/Copy_of_Birdramon_6ba0b315.png",
    "sheetWidth": 440,
    "sheetHeight": 440,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 370,
          "w": 68,
          "h": 68
        },
        {
          "x": 82,
          "y": 314,
          "w": 67,
          "h": 59
        }
      ],
      "walking": [
        {
          "x": 72,
          "y": 375,
          "w": 65,
          "h": 63
        },
        {
          "x": 139,
          "y": 375,
          "w": 65,
          "h": 63
        },
        {
          "x": 206,
          "y": 375,
          "w": 65,
          "h": 63
        },
        {
          "x": 139,
          "y": 375,
          "w": 65,
          "h": 63
        }
      ],
      "happy": [
        {
          "x": 57,
          "y": 151,
          "w": 62,
          "h": 63
        },
        {
          "x": 72,
          "y": 375,
          "w": 65,
          "h": 63
        }
      ],
      "eating": [
        {
          "x": 57,
          "y": 151,
          "w": 62,
          "h": 63
        },
        {
          "x": 69,
          "y": 15,
          "w": 62,
          "h": 63
        }
      ],
      "sleeping": [
        {
          "x": 354,
          "y": 56,
          "w": 69,
          "h": 40
        }
      ],
      "training": [
        {
          "x": 72,
          "y": 375,
          "w": 65,
          "h": 63
        },
        {
          "x": 206,
          "y": 375,
          "w": 65,
          "h": 63
        }
      ],
      "sick": [
        {
          "x": 354,
          "y": 56,
          "w": 69,
          "h": 40
        }
      ],
      "sitting": [
        {
          "x": 82,
          "y": 314,
          "w": 67,
          "h": 59
        }
      ]
    }
  },
  "angemon": {
    "sheetPath": "/assets/aistudio/Copy_of_Angemon_e4fecf69.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        {
          "x": 3,
          "y": 75,
          "w": 74,
          "h": 76
        },
        {
          "x": 82,
          "y": 309,
          "w": 71,
          "h": 76
        }
      ],
      "walking": [
        {
          "x": 82,
          "y": 309,
          "w": 71,
          "h": 76
        },
        {
          "x": 173,
          "y": 307,
          "w": 66,
          "h": 76
        },
        {
          "x": 241,
          "y": 309,
          "w": 70,
          "h": 76
        },
        {
          "x": 311,
          "y": 309,
          "w": 70,
          "h": 76
        }
      ],
      "happy": [
        {
          "x": 311,
          "y": 309,
          "w": 70,
          "h": 76
        },
        {
          "x": 446,
          "y": 287,
          "w": 63,
          "h": 78
        }
      ],
      "eating": [
        {
          "x": 311,
          "y": 309,
          "w": 70,
          "h": 76
        },
        {
          "x": 446,
          "y": 287,
          "w": 63,
          "h": 78
        }
      ],
      "sleeping": [
        {
          "x": 3,
          "y": 17,
          "w": 73,
          "h": 22
        }
      ],
      "training": [
        {
          "x": 3,
          "y": 75,
          "w": 74,
          "h": 76
        },
        {
          "x": 82,
          "y": 309,
          "w": 71,
          "h": 76
        },
        {
          "x": 381,
          "y": 311,
          "w": 68,
          "h": 74
        }
      ],
      "sick": [
        {
          "x": 3,
          "y": 17,
          "w": 73,
          "h": 22
        }
      ],
      "sitting": [
        {
          "x": 3,
          "y": 75,
          "w": 74,
          "h": 76
        },
        {
          "x": 82,
          "y": 309,
          "w": 71,
          "h": 76
        }
      ]
    }
  },
  "togemon": {
    "sheetPath": "/assets/aistudio/Copy_of_Togemon_11c9cc70.png",
    "sheetWidth": 364,
    "sheetHeight": 364,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 2,
          "w": 55,
          "h": 51,
          "rotate": 0
        },
        {
          "x": 59,
          "y": 2,
          "w": 55,
          "h": 51,
          "rotate": 0
        },
        {
          "x": 116,
          "y": 2,
          "w": 41,
          "h": 51,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 55,
          "w": 56,
          "h": 56,
          "rotate": 0
        },
        {
          "x": 73,
          "y": 55,
          "w": 46,
          "h": 53,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 159,
          "y": 18,
          "w": 43,
          "h": 55,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 55,
          "h": 51,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 121,
          "y": 75,
          "w": 43,
          "h": 55,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 55,
          "h": 51,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 43,
          "y": 248,
          "w": 20,
          "h": 11,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 159,
          "y": 18,
          "w": 43,
          "h": 55,
          "rotate": 0
        },
        {
          "x": 121,
          "y": 75,
          "w": 43,
          "h": 55,
          "rotate": 0
        },
        {
          "x": 166,
          "y": 75,
          "w": 39,
          "h": 55,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 43,
          "y": 248,
          "w": 20,
          "h": 11,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 2,
          "w": 55,
          "h": 51,
          "rotate": 0
        }
      ]
    }
  },
  "ikkakumon": {
    "sheetPath": "/assets/aistudio/Copy_of_Ikkakumon_d7c47668.png",
    "sheetWidth": 354,
    "sheetHeight": 354,
    "frames": {
      "standing": [
        {
          "x": 218,
          "y": 228,
          "w": 61,
          "h": 57
        },
        {
          "x": 289,
          "y": 231,
          "w": 60,
          "h": 56
        }
      ],
      "walking": [
        {
          "x": 218,
          "y": 167,
          "w": 60,
          "h": 58
        },
        {
          "x": 277,
          "y": 171,
          "w": 60,
          "h": 58
        },
        {
          "x": 218,
          "y": 228,
          "w": 61,
          "h": 57
        },
        {
          "x": 289,
          "y": 231,
          "w": 60,
          "h": 56
        }
      ],
      "happy": [
        {
          "x": 281,
          "y": 285,
          "w": 70,
          "h": 64
        },
        {
          "x": 215,
          "y": 283,
          "w": 66,
          "h": 66
        }
      ],
      "eating": [
        {
          "x": 281,
          "y": 285,
          "w": 70,
          "h": 64
        },
        {
          "x": 215,
          "y": 283,
          "w": 66,
          "h": 66
        }
      ],
      "sleeping": [
        {
          "x": 289,
          "y": 54,
          "w": 58,
          "h": 56
        }
      ],
      "training": [
        {
          "x": 215,
          "y": 283,
          "w": 66,
          "h": 66
        },
        {
          "x": 281,
          "y": 285,
          "w": 70,
          "h": 64
        }
      ],
      "sick": [
        {
          "x": 289,
          "y": 54,
          "w": 58,
          "h": 56
        }
      ],
      "sitting": [
        {
          "x": 218,
          "y": 228,
          "w": 61,
          "h": 57
        },
        {
          "x": 289,
          "y": 231,
          "w": 60,
          "h": 56
        }
      ]
    }
  },
  "gatomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Gatomon_68f5ce70.png",
    "sheetWidth": 335,
    "sheetHeight": 335,
    "frames": {
      "standing": [
        {
          "x": 43,
          "y": 160,
          "w": 60,
          "h": 67
        },
        {
          "x": 250,
          "y": 160,
          "w": 53,
          "h": 54
        }
      ],
      "walking": [
        {
          "x": 43,
          "y": 160,
          "w": 60,
          "h": 67
        },
        {
          "x": 179,
          "y": 160,
          "w": 66,
          "h": 54
        },
        {
          "x": 250,
          "y": 160,
          "w": 53,
          "h": 54
        },
        {
          "x": 103,
          "y": 161,
          "w": 72,
          "h": 54
        }
      ],
      "happy": [
        {
          "x": 5,
          "y": 5,
          "w": 60,
          "h": 71
        },
        {
          "x": 5,
          "y": 76,
          "w": 60,
          "h": 70
        }
      ],
      "eating": [
        {
          "x": 5,
          "y": 5,
          "w": 60,
          "h": 71
        },
        {
          "x": 5,
          "y": 76,
          "w": 60,
          "h": 70
        }
      ],
      "sleeping": [
        {
          "x": 120,
          "y": 9,
          "w": 65,
          "h": 25
        }
      ],
      "training": [
        {
          "x": 63,
          "y": 17,
          "w": 57,
          "h": 59
        },
        {
          "x": 63,
          "y": 95,
          "w": 57,
          "h": 54
        }
      ],
      "sick": [
        {
          "x": 120,
          "y": 9,
          "w": 65,
          "h": 25
        }
      ],
      "sitting": [
        {
          "x": 43,
          "y": 160,
          "w": 60,
          "h": 67
        },
        {
          "x": 250,
          "y": 160,
          "w": 53,
          "h": 54
        }
      ]
    }
  },
  "metalgreymon": {
    "sheetPath": "/assets/aistudio/Copy_of_MetalGreymon_2_7f134d73.png",
    "sheetWidth": 474,
    "sheetHeight": 494,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 58,
          "w": 99,
          "h": 87,
          "rotate": 0
        },
        {
          "x": 103,
          "y": 49,
          "w": 85,
          "h": 96,
          "rotate": 0
        },
        {
          "x": 190,
          "y": 49,
          "w": 78,
          "h": 96,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 147,
          "w": 109,
          "h": 81,
          "rotate": 0
        },
        {
          "x": 113,
          "y": 147,
          "w": 92,
          "h": 81,
          "rotate": 0
        },
        {
          "x": 207,
          "y": 147,
          "w": 93,
          "h": 81,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 270,
          "y": 53,
          "w": 78,
          "h": 92,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 58,
          "w": 99,
          "h": 87,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 350,
          "y": 81,
          "w": 90,
          "h": 79,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 58,
          "w": 99,
          "h": 87,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 350,
          "y": 2,
          "w": 90,
          "h": 77,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 270,
          "y": 53,
          "w": 78,
          "h": 92,
          "rotate": 0
        },
        {
          "x": 350,
          "y": 81,
          "w": 90,
          "h": 79,
          "rotate": 0
        },
        {
          "x": 395,
          "y": 162,
          "w": 77,
          "h": 90,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 350,
          "y": 2,
          "w": 90,
          "h": 77,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 58,
          "w": 99,
          "h": 87,
          "rotate": 0
        }
      ]
    }
  },
  "weregarurumon": {
    "sheetPath": "/assets/aistudio/Copy_of_WereGarurumon_497c1afb.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        {
          "x": 438,
          "y": 72,
          "w": 60,
          "h": 76
        },
        {
          "x": 440,
          "y": 153,
          "w": 60,
          "h": 76
        }
      ],
      "walking": [
        {
          "x": 438,
          "y": 72,
          "w": 60,
          "h": 76
        },
        {
          "x": 453,
          "y": 350,
          "w": 58,
          "h": 76
        },
        {
          "x": 440,
          "y": 153,
          "w": 60,
          "h": 76
        },
        {
          "x": 453,
          "y": 431,
          "w": 58,
          "h": 76
        }
      ],
      "happy": [
        {
          "x": 438,
          "y": 72,
          "w": 60,
          "h": 76
        },
        {
          "x": 440,
          "y": 153,
          "w": 60,
          "h": 76
        }
      ],
      "eating": [
        {
          "x": 438,
          "y": 72,
          "w": 60,
          "h": 76
        },
        {
          "x": 440,
          "y": 153,
          "w": 60,
          "h": 76
        }
      ],
      "sleeping": [
        {
          "x": 319,
          "y": 9,
          "w": 62,
          "h": 67
        }
      ],
      "training": [
        {
          "x": 190,
          "y": 246,
          "w": 62,
          "h": 81
        },
        {
          "x": 255,
          "y": 242,
          "w": 87,
          "h": 82
        }
      ],
      "sick": [
        {
          "x": 319,
          "y": 9,
          "w": 62,
          "h": 67
        }
      ],
      "sitting": [
        {
          "x": 438,
          "y": 72,
          "w": 60,
          "h": 76
        },
        {
          "x": 440,
          "y": 153,
          "w": 60,
          "h": 76
        }
      ]
    }
  },
  "garudamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Garudamon_3_4b148cfb.png",
    "sheetWidth": 442,
    "sheetHeight": 442,
    "frames": {
      "standing": [
        {
          "x": 154,
          "y": 7,
          "w": 65,
          "h": 80
        },
        {
          "x": 219,
          "y": 7,
          "w": 65,
          "h": 81
        }
      ],
      "walking": [
        {
          "x": 154,
          "y": 7,
          "w": 65,
          "h": 80
        },
        {
          "x": 1,
          "y": 84,
          "w": 67,
          "h": 82
        },
        {
          "x": 219,
          "y": 7,
          "w": 65,
          "h": 81
        },
        {
          "x": 140,
          "y": 94,
          "w": 66,
          "h": 82
        }
      ],
      "happy": [
        {
          "x": 1,
          "y": 159,
          "w": 67,
          "h": 76
        },
        {
          "x": 74,
          "y": 159,
          "w": 67,
          "h": 82
        }
      ],
      "eating": [
        {
          "x": 1,
          "y": 159,
          "w": 67,
          "h": 76
        },
        {
          "x": 74,
          "y": 159,
          "w": 67,
          "h": 82
        }
      ],
      "sleeping": [
        {
          "x": 74,
          "y": 7,
          "w": 71,
          "h": 52
        }
      ],
      "training": [
        {
          "x": 1,
          "y": 235,
          "w": 82,
          "h": 66
        },
        {
          "x": 91,
          "y": 305,
          "w": 82,
          "h": 51
        }
      ],
      "sick": [
        {
          "x": 74,
          "y": 7,
          "w": 71,
          "h": 52
        }
      ],
      "sitting": [
        {
          "x": 154,
          "y": 7,
          "w": 65,
          "h": 80
        },
        {
          "x": 219,
          "y": 7,
          "w": 65,
          "h": 81
        }
      ]
    }
  },
  "magnaangemon": {
    "sheetPath": "/assets/aistudio/Copy_of_MagnaAngemon_2_d229b13a.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        {
          "x": 85,
          "y": 395,
          "w": 94,
          "h": 114
        },
        {
          "x": 3,
          "y": 395,
          "w": 82,
          "h": 114
        }
      ],
      "walking": [
        {
          "x": 85,
          "y": 395,
          "w": 94,
          "h": 114
        },
        {
          "x": 182,
          "y": 395,
          "w": 93,
          "h": 114
        },
        {
          "x": 283,
          "y": 395,
          "w": 96,
          "h": 114
        },
        {
          "x": 387,
          "y": 395,
          "w": 106,
          "h": 114
        }
      ],
      "happy": [
        {
          "x": 85,
          "y": 395,
          "w": 94,
          "h": 114
        },
        {
          "x": 3,
          "y": 395,
          "w": 82,
          "h": 114
        }
      ],
      "eating": [
        {
          "x": 85,
          "y": 395,
          "w": 94,
          "h": 114
        },
        {
          "x": 3,
          "y": 395,
          "w": 82,
          "h": 114
        }
      ],
      "sleeping": [
        {
          "x": 77,
          "y": 1,
          "w": 100,
          "h": 26
        }
      ],
      "training": [
        {
          "x": 3,
          "y": 395,
          "w": 82,
          "h": 114
        },
        {
          "x": 297,
          "y": 217,
          "w": 96,
          "h": 102
        }
      ],
      "sick": [
        {
          "x": 77,
          "y": 1,
          "w": 100,
          "h": 26
        }
      ],
      "sitting": [
        {
          "x": 85,
          "y": 395,
          "w": 94,
          "h": 114
        },
        {
          "x": 3,
          "y": 395,
          "w": 82,
          "h": 114
        }
      ]
    }
  },
  "lillymon": {
    "sheetPath": "/assets/aistudio/Copy_of_Lillymon_aba09616.png",
    "sheetWidth": 297,
    "sheetHeight": 297,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 17,
          "w": 41,
          "h": 53,
          "rotate": 0
        },
        {
          "x": 45,
          "y": 16,
          "w": 35,
          "h": 54,
          "rotate": 0
        },
        {
          "x": 82,
          "y": 15,
          "w": 38,
          "h": 54,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 72,
          "w": 46,
          "h": 54,
          "rotate": 0
        },
        {
          "x": 92,
          "y": 71,
          "w": 37,
          "h": 56,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 122,
          "y": 14,
          "w": 25,
          "h": 55,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 17,
          "w": 41,
          "h": 53,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 149,
          "y": 24,
          "w": 33,
          "h": 56,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 17,
          "w": 41,
          "h": 53,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 186,
          "y": 13,
          "w": 37,
          "h": 27,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 122,
          "y": 14,
          "w": 25,
          "h": 55,
          "rotate": 0
        },
        {
          "x": 149,
          "y": 24,
          "w": 33,
          "h": 56,
          "rotate": 0
        },
        {
          "x": 186,
          "y": 45,
          "w": 36,
          "h": 32,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 186,
          "y": 13,
          "w": 37,
          "h": 27,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 17,
          "w": 41,
          "h": 53,
          "rotate": 0
        }
      ]
    }
  },
  "zudomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Zudomon_2_44e2c173.png",
    "sheetWidth": 500,
    "sheetHeight": 500,
    "frames": {
      "standing": [
        {
          "x": 3,
          "y": 134,
          "w": 122,
          "h": 110
        },
        {
          "x": 249,
          "y": 134,
          "w": 122,
          "h": 110
        }
      ],
      "walking": [
        {
          "x": 3,
          "y": 134,
          "w": 122,
          "h": 110
        },
        {
          "x": 125,
          "y": 134,
          "w": 112,
          "h": 110
        },
        {
          "x": 249,
          "y": 134,
          "w": 122,
          "h": 110
        },
        {
          "x": 373,
          "y": 134,
          "w": 106,
          "h": 110
        }
      ],
      "happy": [
        {
          "x": 125,
          "y": 134,
          "w": 112,
          "h": 110
        },
        {
          "x": 373,
          "y": 134,
          "w": 106,
          "h": 110
        }
      ],
      "eating": [
        {
          "x": 125,
          "y": 134,
          "w": 112,
          "h": 110
        },
        {
          "x": 373,
          "y": 134,
          "w": 106,
          "h": 110
        }
      ],
      "sleeping": [
        {
          "x": 48,
          "y": 10,
          "w": 166,
          "h": 59
        }
      ],
      "training": [
        {
          "x": 3,
          "y": 134,
          "w": 122,
          "h": 110
        },
        {
          "x": 125,
          "y": 134,
          "w": 112,
          "h": 110
        }
      ],
      "sick": [
        {
          "x": 48,
          "y": 10,
          "w": 166,
          "h": 59
        }
      ],
      "sitting": [
        {
          "x": 3,
          "y": 134,
          "w": 122,
          "h": 110
        },
        {
          "x": 249,
          "y": 134,
          "w": 122,
          "h": 110
        }
      ]
    }
  },
  "angewomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Angewomon_2_2dca13a6.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 27,
          "w": 74,
          "h": 93,
          "rotate": 0
        },
        {
          "x": 78,
          "y": 16,
          "w": 64,
          "h": 99,
          "rotate": 0
        },
        {
          "x": 144,
          "y": 23,
          "w": 73,
          "h": 92,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 122,
          "w": 75,
          "h": 94,
          "rotate": 0
        },
        {
          "x": 79,
          "y": 117,
          "w": 59,
          "h": 99,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 219,
          "y": 45,
          "w": 75,
          "h": 91,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 27,
          "w": 74,
          "h": 93,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 140,
          "y": 117,
          "w": 74,
          "h": 93,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 27,
          "w": 74,
          "h": 93,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 296,
          "y": 33,
          "w": 103,
          "h": 40,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 219,
          "y": 45,
          "w": 75,
          "h": 91,
          "rotate": 0
        },
        {
          "x": 140,
          "y": 117,
          "w": 74,
          "h": 93,
          "rotate": 0
        },
        {
          "x": 335,
          "y": 135,
          "w": 91,
          "h": 73,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 296,
          "y": 33,
          "w": 103,
          "h": 40,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 27,
          "w": 74,
          "h": 93,
          "rotate": 0
        }
      ]
    }
  },
  "wargreymon": {
    "sheetPath": "/assets/aistudio/Copy_of_WarGreymon_9adf0908.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        {
          "x": 257,
          "y": 2,
          "w": 78,
          "h": 81,
          "rotate": 0
        },
        {
          "x": 337,
          "y": 2,
          "w": 76,
          "h": 81,
          "rotate": 0
        },
        {
          "x": 415,
          "y": 3,
          "w": 78,
          "h": 80,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 62,
          "y": 121,
          "w": 96,
          "h": 97,
          "rotate": 0
        },
        {
          "x": 258,
          "y": 126,
          "w": 73,
          "h": 92,
          "rotate": 0
        },
        {
          "x": 333,
          "y": 131,
          "w": 71,
          "h": 88,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 406,
          "y": 85,
          "w": 80,
          "h": 77,
          "rotate": 0
        },
        {
          "x": 257,
          "y": 2,
          "w": 78,
          "h": 81,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 406,
          "y": 164,
          "w": 76,
          "h": 82,
          "rotate": 0
        },
        {
          "x": 257,
          "y": 2,
          "w": 78,
          "h": 81,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 358,
          "y": 416,
          "w": 92,
          "h": 28,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 406,
          "y": 85,
          "w": 80,
          "h": 77,
          "rotate": 0
        },
        {
          "x": 406,
          "y": 164,
          "w": 76,
          "h": 82,
          "rotate": 0
        },
        {
          "x": 52,
          "y": 220,
          "w": 76,
          "h": 57,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 358,
          "y": 416,
          "w": 92,
          "h": 28,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 257,
          "y": 2,
          "w": 78,
          "h": 81,
          "rotate": 0
        }
      ]
    }
  },
  "metalgarurumon": {
    "sheetPath": "/assets/aistudio/Copy_of_MetalGarurumon_4_3c810c39.png",
    "sheetWidth": 426,
    "sheetHeight": 426,
    "frames": {
      "standing": [
        {
          "x": 326,
          "y": 94,
          "w": 82,
          "h": 68
        },
        {
          "x": 163,
          "y": 110,
          "w": 82,
          "h": 68
        }
      ],
      "walking": [
        {
          "x": 323,
          "y": 164,
          "w": 82,
          "h": 76
        },
        {
          "x": 175,
          "y": 181,
          "w": 82,
          "h": 76
        }
      ],
      "happy": [
        {
          "x": 326,
          "y": 94,
          "w": 82,
          "h": 68
        },
        {
          "x": 323,
          "y": 164,
          "w": 82,
          "h": 76
        }
      ],
      "eating": [
        {
          "x": 326,
          "y": 94,
          "w": 82,
          "h": 68
        },
        {
          "x": 163,
          "y": 110,
          "w": 82,
          "h": 68
        }
      ],
      "sleeping": [
        {
          "x": 63,
          "y": 66,
          "w": 79,
          "h": 68
        }
      ],
      "training": [
        {
          "x": 178,
          "y": 261,
          "w": 87,
          "h": 81
        },
        {
          "x": 2,
          "y": 224,
          "w": 87,
          "h": 79
        }
      ],
      "sick": [
        {
          "x": 63,
          "y": 66,
          "w": 79,
          "h": 68
        }
      ],
      "sitting": [
        {
          "x": 326,
          "y": 94,
          "w": 82,
          "h": 68
        },
        {
          "x": 163,
          "y": 110,
          "w": 82,
          "h": 68
        }
      ]
    }
  },
  "phoenixmon": {
    "sheetPath": "/assets/aistudio/Copy_of_Phoenixmon_5_f4ad8760.png",
    "sheetWidth": 498,
    "sheetHeight": 498,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 136,
          "w": 96,
          "h": 91,
          "rotate": 0
        },
        {
          "x": 266,
          "y": 405,
          "w": 96,
          "h": 91,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 100,
          "y": 142,
          "w": 95,
          "h": 85,
          "rotate": 0
        },
        {
          "x": 256,
          "y": 145,
          "w": 95,
          "h": 80,
          "rotate": 0
        },
        {
          "x": 266,
          "y": 225,
          "w": 97,
          "h": 80,
          "rotate": 0
        },
        {
          "x": 266,
          "y": 307,
          "w": 85,
          "h": 95,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 2,
          "y": 136,
          "w": 96,
          "h": 91,
          "rotate": 0
        },
        {
          "x": 266,
          "y": 405,
          "w": 96,
          "h": 91,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 2,
          "y": 136,
          "w": 96,
          "h": 91,
          "rotate": 0
        },
        {
          "x": 266,
          "y": 405,
          "w": 96,
          "h": 91,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 97,
          "y": 10,
          "w": 98,
          "h": 57,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 256,
          "y": 145,
          "w": 95,
          "h": 80,
          "rotate": 0
        },
        {
          "x": 266,
          "y": 225,
          "w": 97,
          "h": 80,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 97,
          "y": 10,
          "w": 98,
          "h": 57,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 266,
          "y": 405,
          "w": 96,
          "h": 91,
          "rotate": 0
        }
      ]
    }
  },
  "seraphimon": {
    "sheetPath": "/assets/aistudio/Copy_of_Seraphimon_7d6ba82a.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 18,
          "w": 82,
          "h": 114,
          "rotate": 0
        },
        {
          "x": 86,
          "y": 23,
          "w": 78,
          "h": 109,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 167,
          "y": 36,
          "w": 80,
          "h": 108,
          "rotate": 0
        },
        {
          "x": 249,
          "y": 31,
          "w": 76,
          "h": 111,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 327,
          "y": 23,
          "w": 114,
          "h": 69,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 18,
          "w": 82,
          "h": 114,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 448,
          "y": 23,
          "w": 53,
          "h": 81,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 18,
          "w": 82,
          "h": 114,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 453,
          "y": 121,
          "w": 47,
          "h": 41,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 327,
          "y": 23,
          "w": 114,
          "h": 69,
          "rotate": 0
        },
        {
          "x": 448,
          "y": 23,
          "w": 53,
          "h": 81,
          "rotate": 0
        },
        {
          "x": 330,
          "y": 95,
          "w": 113,
          "h": 68,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 453,
          "y": 121,
          "w": 47,
          "h": 41,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 18,
          "w": 82,
          "h": 114,
          "rotate": 0
        }
      ]
    }
  },
  "rosemon": {
    "sheetPath": "/assets/aistudio/Copy_of_Rosemon_6267595c.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 2,
          "w": 73,
          "h": 75,
          "rotate": 0
        },
        {
          "x": 77,
          "y": 2,
          "w": 73,
          "h": 75,
          "rotate": 0
        },
        {
          "x": 221,
          "y": 2,
          "w": 63,
          "h": 76,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 223,
          "y": 250,
          "w": 63,
          "h": 78,
          "rotate": 0
        },
        {
          "x": 290,
          "y": 242,
          "w": 93,
          "h": 82,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 376,
          "y": 3,
          "w": 44,
          "h": 36,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 73,
          "h": 75,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 295,
          "y": 5,
          "w": 70,
          "h": 63,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 73,
          "h": 75,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 463,
          "y": 352,
          "w": 47,
          "h": 33,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 376,
          "y": 3,
          "w": 44,
          "h": 36,
          "rotate": 0
        },
        {
          "x": 295,
          "y": 5,
          "w": 70,
          "h": 63,
          "rotate": 0
        },
        {
          "x": 451,
          "y": 51,
          "w": 59,
          "h": 80,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 463,
          "y": 352,
          "w": 47,
          "h": 33,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 2,
          "w": 73,
          "h": 75,
          "rotate": 0
        }
      ]
    }
  },
  "vikemon": {
    "sheetPath": "/assets/aistudio/Copy_of_Vikemon_4cb881d2.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 2,
          "w": 109,
          "h": 129,
          "rotate": 0
        },
        {
          "x": 113,
          "y": 2,
          "w": 109,
          "h": 129,
          "rotate": 0
        },
        {
          "x": 224,
          "y": 2,
          "w": 105,
          "h": 129,
          "rotate": 0
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 133,
          "w": 112,
          "h": 129,
          "rotate": 0
        },
        {
          "x": 116,
          "y": 133,
          "w": 107,
          "h": 129,
          "rotate": 0
        },
        {
          "x": 225,
          "y": 133,
          "w": 111,
          "h": 128,
          "rotate": 0
        }
      ],
      "happy": [
        {
          "x": 331,
          "y": 3,
          "w": 108,
          "h": 128,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 109,
          "h": 129,
          "rotate": 0
        }
      ],
      "eating": [
        {
          "x": 338,
          "y": 135,
          "w": 123,
          "h": 118,
          "rotate": 0
        },
        {
          "x": 2,
          "y": 2,
          "w": 109,
          "h": 129,
          "rotate": 0
        }
      ],
      "sleeping": [
        {
          "x": 278,
          "y": 362,
          "w": 16,
          "h": 16,
          "rotate": 0
        }
      ],
      "training": [
        {
          "x": 331,
          "y": 3,
          "w": 108,
          "h": 128,
          "rotate": 0
        },
        {
          "x": 338,
          "y": 135,
          "w": 123,
          "h": 118,
          "rotate": 0
        },
        {
          "x": 396,
          "y": 255,
          "w": 111,
          "h": 123,
          "rotate": 0
        }
      ],
      "sick": [
        {
          "x": 278,
          "y": 362,
          "w": 16,
          "h": 16,
          "rotate": 0
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 2,
          "w": 109,
          "h": 129,
          "rotate": 0
        }
      ]
    }
  },
  "magnadramon": {
    "sheetPath": "/assets/aistudio/Copy_of_Magnadramon_d8456cbf.png",
    "sheetWidth": 512,
    "sheetHeight": 512,
    "frames": {
      "standing": [
        {
          "x": 1,
          "y": 394,
          "w": 102,
          "h": 92
        },
        {
          "x": 103,
          "y": 397,
          "w": 102,
          "h": 90
        }
      ],
      "walking": [
        {
          "x": 1,
          "y": 394,
          "w": 102,
          "h": 92
        },
        {
          "x": 103,
          "y": 397,
          "w": 102,
          "h": 90
        },
        {
          "x": 91,
          "y": 68,
          "w": 104,
          "h": 98
        },
        {
          "x": 362,
          "y": 1,
          "w": 101,
          "h": 102
        }
      ],
      "happy": [
        {
          "x": 1,
          "y": 394,
          "w": 102,
          "h": 92
        },
        {
          "x": 362,
          "y": 1,
          "w": 101,
          "h": 102
        }
      ],
      "eating": [
        {
          "x": 1,
          "y": 394,
          "w": 102,
          "h": 92
        },
        {
          "x": 362,
          "y": 1,
          "w": 101,
          "h": 102
        }
      ],
      "sleeping": [
        {
          "x": 1,
          "y": 10,
          "w": 104,
          "h": 44
        }
      ],
      "training": [
        {
          "x": 91,
          "y": 68,
          "w": 104,
          "h": 98
        },
        {
          "x": 267,
          "y": 81,
          "w": 97,
          "h": 105
        }
      ],
      "sick": [
        {
          "x": 1,
          "y": 10,
          "w": 104,
          "h": 44
        }
      ],
      "sitting": [
        {
          "x": 1,
          "y": 394,
          "w": 102,
          "h": 92
        },
        {
          "x": 103,
          "y": 397,
          "w": 102,
          "h": 90
        }
      ]
    }
  },
  "yukimibotamon": {
    "sheetPath": "/assets/aistudio/Copy_of_Yukimibotamon_425de778.png",
    "sheetWidth": 180,
    "sheetHeight": 180,
    "frames": {
      "standing": [
        {
          "x": 30,
          "y": 5,
          "w": 35,
          "h": 27
        },
        {
          "x": 31,
          "y": 34,
          "w": 35,
          "h": 29
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 82,
          "w": 36,
          "h": 30
        },
        {
          "x": 70,
          "y": 85,
          "w": 34,
          "h": 31
        },
        {
          "x": 106,
          "y": 84,
          "w": 35,
          "h": 29
        },
        {
          "x": 143,
          "y": 70,
          "w": 35,
          "h": 29
        }
      ],
      "happy": [
        {
          "x": 101,
          "y": 24,
          "w": 35,
          "h": 28
        },
        {
          "x": 139,
          "y": 40,
          "w": 35,
          "h": 28
        }
      ],
      "eating": [
        {
          "x": 80,
          "y": 148,
          "w": 38,
          "h": 30
        },
        {
          "x": 120,
          "y": 148,
          "w": 37,
          "h": 30
        }
      ],
      "sleeping": [
        {
          "x": 80,
          "y": 118,
          "w": 39,
          "h": 28
        }
      ],
      "training": [
        {
          "x": 101,
          "y": 54,
          "w": 36,
          "h": 28
        },
        {
          "x": 2,
          "y": 114,
          "w": 37,
          "h": 31
        }
      ],
      "sick": [
        {
          "x": 42,
          "y": 146,
          "w": 36,
          "h": 32
        }
      ],
      "sitting": [
        {
          "x": 30,
          "y": 5,
          "w": 35,
          "h": 27
        }
      ]
    }
  },
  "tentomon": {
    "sheetPath": "/assets/aistudio/Copy_of_Tentomon_326c02c3.png",
    "sheetWidth": 435,
    "sheetHeight": 435,
    "frames": {
      "standing": [
        {
          "x": 55,
          "y": 15,
          "w": 55,
          "h": 53
        },
        {
          "x": 112,
          "y": 15,
          "w": 54,
          "h": 53
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 70,
          "w": 57,
          "h": 54
        },
        {
          "x": 61,
          "y": 70,
          "w": 51,
          "h": 50
        },
        {
          "x": 114,
          "y": 71,
          "w": 51,
          "h": 52
        },
        {
          "x": 167,
          "y": 71,
          "w": 49,
          "h": 54
        }
      ],
      "happy": [
        {
          "x": 168,
          "y": 15,
          "w": 52,
          "h": 54
        },
        {
          "x": 222,
          "y": 15,
          "w": 49,
          "h": 56
        }
      ],
      "eating": [
        {
          "x": 2,
          "y": 126,
          "w": 57,
          "h": 55
        },
        {
          "x": 61,
          "y": 122,
          "w": 49,
          "h": 60
        }
      ],
      "sleeping": [
        {
          "x": 347,
          "y": 281,
          "w": 53,
          "h": 54
        }
      ],
      "training": [
        {
          "x": 160,
          "y": 127,
          "w": 52,
          "h": 55
        },
        {
          "x": 2,
          "y": 183,
          "w": 57,
          "h": 56
        }
      ],
      "sick": [
        {
          "x": 220,
          "y": 298,
          "w": 61,
          "h": 35
        }
      ],
      "sitting": [
        {
          "x": 55,
          "y": 15,
          "w": 55,
          "h": 53
        }
      ]
    }
  },
  "kabuterimon": {
    "sheetPath": "/assets/aistudio/Kabuterimon_07cf7d29.png",
    "sheetWidth": 366,
    "sheetHeight": 366,
    "frames": {
      "standing": [
        {
          "x": 160,
          "y": 116,
          "w": 65,
          "h": 58
        },
        {
          "x": 227,
          "y": 116,
          "w": 61,
          "h": 58
        }
      ],
      "walking": [
        {
          "x": 93,
          "y": 117,
          "w": 65,
          "h": 62
        },
        {
          "x": 160,
          "y": 116,
          "w": 65,
          "h": 58
        },
        {
          "x": 227,
          "y": 116,
          "w": 61,
          "h": 58
        },
        {
          "x": 308,
          "y": 120,
          "w": 56,
          "h": 59
        }
      ],
      "happy": [
        {
          "x": 175,
          "y": 176,
          "w": 65,
          "h": 62
        },
        {
          "x": 242,
          "y": 176,
          "w": 64,
          "h": 64
        }
      ],
      "eating": [
        {
          "x": 105,
          "y": 181,
          "w": 68,
          "h": 57
        },
        {
          "x": 160,
          "y": 116,
          "w": 65,
          "h": 58
        }
      ],
      "sleeping": [
        {
          "x": 2,
          "y": 310,
          "w": 100,
          "h": 53
        }
      ],
      "training": [
        {
          "x": 2,
          "y": 239,
          "w": 99,
          "h": 59
        },
        {
          "x": 239,
          "y": 242,
          "w": 66,
          "h": 58
        }
      ],
      "sick": [
        {
          "x": 105,
          "y": 310,
          "w": 99,
          "h": 53
        }
      ],
      "sitting": [
        {
          "x": 160,
          "y": 116,
          "w": 65,
          "h": 58
        }
      ]
    }
  },
  "motimon": {
    "sheetPath": "/assets/aistudio/Motimon_5cc21ee4.png",
    "sheetWidth": 192,
    "sheetHeight": 192,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 5,
          "w": 32,
          "h": 38
        },
        {
          "x": 85,
          "y": 69,
          "w": 33,
          "h": 38
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 5,
          "w": 32,
          "h": 38
        },
        {
          "x": 85,
          "y": 69,
          "w": 33,
          "h": 38
        },
        {
          "x": 86,
          "y": 109,
          "w": 34,
          "h": 41
        },
        {
          "x": 44,
          "y": 152,
          "w": 39,
          "h": 38
        }
      ],
      "happy": [
        {
          "x": 44,
          "y": 152,
          "w": 39,
          "h": 38
        },
        {
          "x": 86,
          "y": 109,
          "w": 34,
          "h": 41
        }
      ],
      "eating": [
        {
          "x": 44,
          "y": 152,
          "w": 39,
          "h": 38
        },
        {
          "x": 2,
          "y": 5,
          "w": 32,
          "h": 38
        }
      ],
      "sleeping": [
        {
          "x": 165,
          "y": 68,
          "w": 24,
          "h": 43,
          "rotate": 90
        }
      ],
      "training": [
        {
          "x": 86,
          "y": 109,
          "w": 34,
          "h": 41
        },
        {
          "x": 44,
          "y": 152,
          "w": 39,
          "h": 38
        }
      ],
      "sick": [
        {
          "x": 165,
          "y": 68,
          "w": 24,
          "h": 43,
          "rotate": 90
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 5,
          "w": 32,
          "h": 38
        }
      ]
    }
  },
  "megakabuterimon": {
    "sheetPath": "/assets/aistudio/Copy_of_MegaKabuterimon_42236ae2.png",
    "sheetWidth": 481,
    "sheetHeight": 481,
    "frames": {
      "standing": [
        {
          "x": 373,
          "y": 11,
          "w": 74,
          "h": 74
        },
        {
          "x": 373,
          "y": 87,
          "w": 74,
          "h": 75
        }
      ],
      "walking": [
        {
          "x": 373,
          "y": 11,
          "w": 74,
          "h": 74
        },
        {
          "x": 373,
          "y": 87,
          "w": 74,
          "h": 75
        },
        {
          "x": 373,
          "y": 164,
          "w": 80,
          "h": 76
        },
        {
          "x": 293,
          "y": 242,
          "w": 79,
          "h": 78
        }
      ],
      "happy": [
        {
          "x": 373,
          "y": 11,
          "w": 74,
          "h": 74
        },
        {
          "x": 293,
          "y": 242,
          "w": 79,
          "h": 78
        }
      ],
      "eating": [
        {
          "x": 373,
          "y": 11,
          "w": 74,
          "h": 74
        },
        {
          "x": 373,
          "y": 87,
          "w": 74,
          "h": 75
        }
      ],
      "sleeping": [
        {
          "x": 213,
          "y": 232,
          "w": 79,
          "h": 82
        }
      ],
      "training": [
        {
          "x": 373,
          "y": 164,
          "w": 80,
          "h": 76
        },
        {
          "x": 293,
          "y": 242,
          "w": 79,
          "h": 78
        }
      ],
      "sick": [
        {
          "x": 213,
          "y": 232,
          "w": 79,
          "h": 82
        }
      ],
      "sitting": [
        {
          "x": 373,
          "y": 11,
          "w": 74,
          "h": 74
        }
      ]
    }
  },
  "herculeskabuterimon": {
    "sheetPath": "/assets/aistudio/HerculesKabuterimon_2_89341216.png",
    "sheetWidth": 499,
    "sheetHeight": 499,
    "frames": {
      "standing": [
        {
          "x": 2,
          "y": 6,
          "w": 100,
          "h": 86
        },
        {
          "x": 2,
          "y": 288,
          "w": 99,
          "h": 104
        }
      ],
      "walking": [
        {
          "x": 2,
          "y": 6,
          "w": 100,
          "h": 86
        },
        {
          "x": 197,
          "y": 411,
          "w": 97,
          "h": 86
        },
        {
          "x": 2,
          "y": 394,
          "w": 101,
          "h": 103
        },
        {
          "x": 296,
          "y": 413,
          "w": 95,
          "h": 84
        }
      ],
      "happy": [
        {
          "x": 2,
          "y": 288,
          "w": 99,
          "h": 104
        },
        {
          "x": 393,
          "y": 413,
          "w": 90,
          "h": 84
        }
      ],
      "eating": [
        {
          "x": 2,
          "y": 6,
          "w": 100,
          "h": 86
        },
        {
          "x": 2,
          "y": 288,
          "w": 99,
          "h": 104
        }
      ],
      "sleeping": [
        {
          "x": 369,
          "y": 99,
          "w": 112,
          "h": 47
        }
      ],
      "training": [
        {
          "x": 2,
          "y": 394,
          "w": 101,
          "h": 103
        },
        {
          "x": 393,
          "y": 413,
          "w": 90,
          "h": 84
        }
      ],
      "sick": [
        {
          "x": 369,
          "y": 99,
          "w": 112,
          "h": 47
        }
      ],
      "sitting": [
        {
          "x": 2,
          "y": 6,
          "w": 100,
          "h": 86
        }
      ]
    }
  }
};
