const fs = require('fs');
const { PNG } = require('pngjs');

function getTightBox(png, x, y, w, h) {
  let minX = w, maxX = 0, minY = h, maxY = 0;
  let count = 0;
  for (let cy = y; cy < y + h; cy++) {
    for (let cx = x; cx < x + w; cx++) {
      if (cx >= 0 && cx < png.width && cy >= 0 && cy < png.height) {
        const a = png.data[(cy * png.width + cx) * 4 + 3];
        if (a > 30) {
          count++;
          const rx = cx - x;
          const ry = cy - y;
          if (rx < minX) minX = rx;
          if (rx > maxX) maxX = rx;
          if (ry < minY) minY = ry;
          if (ry > maxY) maxY = ry;
        }
      }
    }
  }
  if (count === 0) return { x, y, w, h };
  // Add 1px padding
  const pad = 1;
  const fx = Math.max(0, x + minX - pad);
  const fy = Math.max(0, y + minY - pad);
  const fw = Math.min(png.width - fx, maxX - minX + 1 + pad * 2);
  const fh = Math.min(png.height - fy, maxY - minY + 1 + pad * 2);
  return { x: fx, y: fy, w: fw, h: fh };
}

function analyzeAll() {
  const configs = {};

  // 1. GABUMON (467x467)
  const gabPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Gabumon_1beb725f.png'));
  configs.gabumon = {
    sheetPath: '/assets/aistudio/Copy_of_Gabumon_1beb725f.png',
    sheetWidth: 467,
    sheetHeight: 467,
    standing: [
      getTightBox(gabPng, 260, 220, 65, 55),
      getTightBox(gabPng, 325, 215, 65, 55),
    ],
    walking: [
      getTightBox(gabPng, 260, 220, 65, 55),
      getTightBox(gabPng, 260, 270, 65, 55),
      getTightBox(gabPng, 325, 265, 65, 55),
      getTightBox(gabPng, 385, 260, 65, 55),
    ],
    happy: [
      getTightBox(gabPng, 270, 375, 65, 60),
      getTightBox(gabPng, 395, 370, 65, 60),
    ],
    sleeping: [
      getTightBox(gabPng, 104, 2, 70, 30),
    ],
    training: [
      getTightBox(gabPng, 270, 320, 65, 55),
      getTightBox(gabPng, 335, 318, 65, 55),
      getTightBox(gabPng, 395, 312, 65, 60),
    ],
  };

  // 2. NYAROMON (265x265)
  const nyaPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Nyaromon_923766aa.png'));
  configs.nyaromon = {
    sheetPath: '/assets/aistudio/Copy_of_Nyaromon_923766aa.png',
    sheetWidth: 265,
    sheetHeight: 265,
    standing: [
      getTightBox(nyaPng, 6, 52, 45, 40),
      getTightBox(nyaPng, 52, 58, 45, 40),
    ],
    walking: [
      getTightBox(nyaPng, 6, 52, 45, 40),
      getTightBox(nyaPng, 52, 58, 45, 40),
      getTightBox(nyaPng, 190, 52, 45, 40),
      getTightBox(nyaPng, 52, 108, 45, 40),
    ],
    happy: [
      getTightBox(nyaPng, 150, 116, 45, 40),
      getTightBox(nyaPng, 205, 122, 45, 40),
    ],
    sleeping: [
      getTightBox(nyaPng, 142, 44, 45, 30),
    ],
    training: [
      getTightBox(nyaPng, 8, 128, 45, 40),
      getTightBox(nyaPng, 6, 154, 45, 42),
    ],
  };

  // 3. GATOMON (335x335)
  const gatPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Gatomon_68f5ce70.png'));
  configs.gatomon = {
    sheetPath: '/assets/aistudio/Copy_of_Gatomon_68f5ce70.png',
    sheetWidth: 335,
    sheetHeight: 335,
    standing: [
      getTightBox(gatPng, 44, 161, 58, 65),
      getTightBox(gatPng, 251, 161, 70, 52),
    ],
    walking: [
      getTightBox(gatPng, 44, 161, 58, 65),
      getTightBox(gatPng, 180, 161, 65, 52),
      getTightBox(gatPng, 251, 161, 70, 52),
      getTightBox(gatPng, 104, 162, 70, 52),
    ],
    happy: [
      getTightBox(gatPng, 6, 6, 58, 70),
      getTightBox(gatPng, 6, 75, 58, 70),
    ],
    sleeping: [
      getTightBox(gatPng, 120, 8, 65, 25),
    ],
    training: [
      getTightBox(gatPng, 64, 18, 55, 60),
      getTightBox(gatPng, 64, 88, 55, 60),
    ],
  };

  // 4. MAGNADRAMON (512x512)
  const magPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Magnadramon_d8456cbf.png'));
  configs.magnadramon = {
    sheetPath: '/assets/aistudio/Copy_of_Magnadramon_d8456cbf.png',
    sheetWidth: 512,
    sheetHeight: 512,
    standing: [
      getTightBox(magPng, 2, 395, 100, 90),
      getTightBox(magPng, 102, 398, 102, 88),
    ],
    walking: [
      getTightBox(magPng, 2, 395, 100, 90),
      getTightBox(magPng, 102, 398, 102, 88),
      getTightBox(magPng, 92, 68, 102, 97),
      getTightBox(magPng, 360, 2, 102, 100),
    ],
    happy: [
      getTightBox(magPng, 2, 395, 100, 90),
      getTightBox(magPng, 360, 2, 102, 100),
    ],
    sleeping: [
      getTightBox(magPng, 2, 8, 110, 45),
    ],
    training: [
      getTightBox(magPng, 92, 68, 102, 97),
      getTightBox(magPng, 268, 80, 95, 105),
    ],
  };

  // 5. METALGARURUMON (426x426)
  const metPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_MetalGarurumon_4_3c810c39.png'));
  configs.metalgarurumon = {
    sheetPath: '/assets/aistudio/Copy_of_MetalGarurumon_4_3c810c39.png',
    sheetWidth: 426,
    sheetHeight: 426,
    standing: [
      getTightBox(metPng, 172, 54, 80, 52),
      getTightBox(metPng, 326, 110, 80, 52),
    ],
    walking: [
      getTightBox(metPng, 172, 54, 80, 52),
      getTightBox(metPng, 168, 128, 82, 54),
      getTightBox(metPng, 326, 110, 80, 52),
      getTightBox(metPng, 324, 188, 82, 54),
    ],
    happy: [
      getTightBox(metPng, 172, 54, 80, 52),
      getTightBox(metPng, 179, 261, 80, 54),
    ],
    sleeping: [
      getTightBox(metPng, 62, 75, 78, 54),
    ],
    training: [
      getTightBox(metPng, 17, 185, 84, 55),
      getTightBox(metPng, 280, 250, 75, 80),
    ],
  };

  // 6. WEREGARURUMON (512x512)
  const werePng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_WereGarurumon_497c1afb.png'));
  configs.weregarurumon = {
    sheetPath: '/assets/aistudio/Copy_of_WereGarurumon_497c1afb.png',
    sheetWidth: 512,
    sheetHeight: 512,
    standing: [
      getTightBox(werePng, 438, 70, 62, 82),
      getTightBox(werePng, 442, 150, 60, 82),
    ],
    walking: [
      getTightBox(werePng, 438, 70, 62, 82),
      getTightBox(werePng, 444, 348, 60, 82),
      getTightBox(werePng, 442, 150, 60, 82),
      getTightBox(werePng, 444, 428, 60, 82),
    ],
    happy: [
      getTightBox(werePng, 438, 70, 62, 82),
      getTightBox(werePng, 442, 150, 60, 82),
    ],
    sleeping: [
      getTightBox(werePng, 320, 10, 60, 65),
    ],
    training: [
      getTightBox(werePng, 191, 247, 60, 80),
      getTightBox(werePng, 256, 243, 85, 80),
    ],
  };

  // 7. BIYOMON (269x269)
  const biyPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Biyomon_ad3c3232.png'));
  configs.biyomon = {
    sheetPath: '/assets/aistudio/Copy_of_Biyomon_ad3c3232.png',
    sheetWidth: 269,
    sheetHeight: 269,
    standing: [
      getTightBox(biyPng, 2, 160, 45, 52),
      getTightBox(biyPng, 46, 160, 45, 52),
    ],
    walking: [
      // NO head tilt sprite! Only clean upright walking frames
      getTightBox(biyPng, 2, 106, 44, 52),
      getTightBox(biyPng, 90, 111, 44, 52),
      getTightBox(biyPng, 133, 120, 44, 52),
      getTightBox(biyPng, 177, 125, 44, 50),
    ],
    happy: [
      getTightBox(biyPng, 2, 215, 45, 52),
      getTightBox(biyPng, 46, 215, 45, 52),
    ],
    sleeping: [
      getTightBox(biyPng, 220, 45, 45, 25),
    ],
    training: [
      getTightBox(biyPng, 215, 120, 45, 52),
      getTightBox(biyPng, 2, 106, 44, 52),
    ],
  };

  // 8. BIRDRAPMON (440x440)
  const birdPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Birdramon_6ba0b315.png'));
  configs.birdramon = {
    sheetPath: '/assets/aistudio/Copy_of_Birdramon_6ba0b315.png',
    sheetWidth: 440,
    sheetHeight: 440,
    standing: [
      getTightBox(birdPng, 50, 150, 68, 66),
      getTightBox(birdPng, 170, 150, 68, 66),
    ],
    walking: [
      getTightBox(birdPng, 70, 375, 70, 65),
      getTightBox(birdPng, 138, 375, 70, 65),
      getTightBox(birdPng, 206, 375, 70, 65),
      getTightBox(birdPng, 138, 375, 70, 65),
    ],
    happy: [
      getTightBox(birdPng, 2, 2, 70, 65),
      getTightBox(birdPng, 70, 2, 70, 65),
    ],
    sleeping: [
      getTightBox(birdPng, 350, 20, 75, 30),
    ],
    training: [
      getTightBox(birdPng, 56, 305, 70, 65),
      getTightBox(birdPng, 126, 305, 70, 65),
    ],
  };

  // 9. GARUDAMON (442x442)
  const garPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Garudamon_3_4b148cfb.png'));
  configs.garudamon = {
    sheetPath: '/assets/aistudio/Copy_of_Garudamon_3_4b148cfb.png',
    sheetWidth: 442,
    sheetHeight: 442,
    standing: [
      getTightBox(garPng, 154, 8, 65, 80),
      getTightBox(garPng, 218, 8, 65, 80),
    ],
    walking: [
      getTightBox(garPng, 154, 8, 65, 80),
      getTightBox(garPng, 2, 85, 65, 80),
      getTightBox(garPng, 218, 8, 65, 80),
      getTightBox(garPng, 140, 95, 65, 80),
    ],
    happy: [
      getTightBox(garPng, 2, 160, 65, 80),
      getTightBox(garPng, 75, 160, 65, 80),
    ],
    sleeping: [
      getTightBox(garPng, 74, 8, 70, 50),
    ],
    training: [
      getTightBox(garPng, 2, 235, 80, 65),
      getTightBox(garPng, 92, 290, 80, 65),
    ],
  };

  // 10. MOTIMON (192x192)
  const motPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Motimon_5cc21ee4.png'));
  configs.motimon = {
    sheetPath: '/assets/aistudio/Motimon_5cc21ee4.png',
    sheetWidth: 192,
    sheetHeight: 192,
    standing: [
      getTightBox(motPng, 4, 4, 40, 42),
      getTightBox(motPng, 160, 26, 34, 42),
    ],
    walking: [
      getTightBox(motPng, 4, 4, 40, 42),
      getTightBox(motPng, 86, 70, 42, 44),
      getTightBox(motPng, 44, 150, 40, 42),
      getTightBox(motPng, 160, 26, 34, 42),
    ],
    happy: [
      getTightBox(motPng, 86, 70, 42, 44),
      getTightBox(motPng, 44, 150, 40, 42),
    ],
    sleeping: [
      getTightBox(motPng, 160, 72, 34, 42),
    ],
    training: [
      getTightBox(motPng, 4, 4, 40, 42),
      getTightBox(motPng, 44, 150, 40, 42),
    ],
  };

  // 11. MEGAKABUTERIMON (481x481)
  const megPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_MegaKabuterimon_42236ae2.png'));
  configs.megakabuterimon = {
    sheetPath: '/assets/aistudio/Copy_of_MegaKabuterimon_42236ae2.png',
    sheetWidth: 481,
    sheetHeight: 481,
    standing: [
      getTightBox(megPng, 372, 10, 80, 80),
      getTightBox(megPng, 372, 92, 80, 80),
    ],
    walking: [
      getTightBox(megPng, 372, 10, 80, 80),
      getTightBox(megPng, 372, 92, 80, 80),
      getTightBox(megPng, 372, 175, 80, 80),
      getTightBox(megPng, 290, 240, 82, 82),
    ],
    happy: [
      getTightBox(megPng, 372, 10, 80, 80),
      getTightBox(megPng, 372, 92, 80, 80),
    ],
    sleeping: [
      getTightBox(megPng, 214, 233, 77, 80),
    ],
    training: [
      getTightBox(megPng, 133, 233, 79, 80),
      getTightBox(megPng, 290, 240, 82, 82),
    ],
  };

  // 12. HERCULESKABUTERIMON (499x499)
  const hercPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/HerculesKabuterimon_2_89341216.png'));
  configs.herculeskabuterimon = {
    sheetPath: '/assets/aistudio/HerculesKabuterimon_2_89341216.png',
    sheetWidth: 499,
    sheetHeight: 499,
    standing: [
      getTightBox(hercPng, 4, 4, 95, 95),
      getTightBox(hercPng, 4, 98, 95, 95),
    ],
    walking: [
      getTightBox(hercPng, 4, 4, 95, 95),
      getTightBox(hercPng, 4, 98, 95, 95),
      getTightBox(hercPng, 4, 196, 95, 95),
      getTightBox(hercPng, 4, 294, 95, 95),
    ],
    happy: [
      getTightBox(hercPng, 4, 4, 95, 95),
      getTightBox(hercPng, 4, 396, 95, 95),
    ],
    sleeping: [
      getTightBox(hercPng, 370, 100, 110, 45),
    ],
    training: [
      getTightBox(hercPng, 4, 196, 95, 95),
      getTightBox(hercPng, 4, 396, 95, 95),
    ],
  };

  // 13. YURAMON (212x212)
  const yurPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Yuramon_3ad2937a.png'));
  configs.yuramon = {
    sheetPath: '/assets/aistudio/Copy_of_Yuramon_3ad2937a.png',
    sheetWidth: 212,
    sheetHeight: 212,
    standing: [
      getTightBox(yurPng, 2, 154, 40, 42),
      getTightBox(yurPng, 42, 156, 40, 40),
    ],
    walking: [
      getTightBox(yurPng, 2, 154, 40, 42),
      getTightBox(yurPng, 42, 156, 40, 40),
      getTightBox(yurPng, 80, 172, 40, 38),
      getTightBox(yurPng, 42, 156, 40, 40),
    ],
    happy: [
      getTightBox(yurPng, 78, 106, 40, 36),
      getTightBox(yurPng, 42, 156, 40, 40),
    ],
    sleeping: [
      getTightBox(yurPng, 2, 6, 38, 25),
    ],
    training: [
      getTightBox(yurPng, 2, 154, 40, 42),
      getTightBox(yurPng, 78, 106, 40, 36),
    ],
  };

  // 14. PALMON (301x301)
  const palPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Palmon_2070e7b5.png'));
  configs.palmon = {
    sheetPath: '/assets/aistudio/Copy_of_Palmon_2070e7b5.png',
    sheetWidth: 301,
    sheetHeight: 301,
    standing: [
      getTightBox(palPng, 52, 52, 38, 48),
      getTightBox(palPng, 90, 52, 38, 48),
    ],
    walking: [
      getTightBox(palPng, 52, 52, 38, 48),
      getTightBox(palPng, 90, 52, 38, 48),
      getTightBox(palPng, 161, 52, 42, 50),
      getTightBox(palPng, 256, 58, 36, 52),
    ],
    happy: [
      getTightBox(palPng, 217, 112, 40, 51),
      getTightBox(palPng, 259, 111, 38, 51),
    ],
    sleeping: [
      getTightBox(palPng, 185, 8, 40, 45),
    ],
    training: [
      getTightBox(palPng, 66, 104, 42, 50),
      getTightBox(palPng, 2, 51, 48, 48),
    ],
  };

  // 15. BUKAMON (303x303)
  const bukPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Bukamon_b180f25e.png'));
  configs.bukamon = {
    sheetPath: '/assets/aistudio/Copy_of_Bukamon_b180f25e.png',
    sheetWidth: 303,
    sheetHeight: 303,
    standing: [
      getTightBox(bukPng, 2, 94, 56, 64),
      getTightBox(bukPng, 58, 104, 56, 58),
    ],
    walking: [
      getTightBox(bukPng, 2, 32, 58, 60),
      getTightBox(bukPng, 60, 46, 56, 58),
      getTightBox(bukPng, 2, 94, 56, 64),
      getTightBox(bukPng, 58, 104, 56, 58),
    ],
    happy: [
      getTightBox(bukPng, 168, 124, 48, 60),
      getTightBox(bukPng, 216, 130, 44, 62),
    ],
    sleeping: [
      getTightBox(bukPng, 2, 3, 60, 30),
    ],
    training: [
      getTightBox(bukPng, 2, 160, 56, 68),
      getTightBox(bukPng, 56, 174, 56, 64),
    ],
  };

  // 16. IKKAKUMON (354x354)
  const ikkPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Ikkakumon_d7c47668.png'));
  configs.ikkakumon = {
    sheetPath: '/assets/aistudio/Copy_of_Ikkakumon_d7c47668.png',
    sheetWidth: 354,
    sheetHeight: 354,
    standing: [
      getTightBox(ikkPng, 216, 228, 62, 56),
      getTightBox(ikkPng, 290, 232, 60, 54),
    ],
    walking: [
      getTightBox(ikkPng, 218, 164, 60, 60),
      getTightBox(ikkPng, 278, 172, 58, 56),
      getTightBox(ikkPng, 216, 228, 62, 56),
      getTightBox(ikkPng, 290, 232, 60, 54),
    ],
    happy: [
      getTightBox(ikkPng, 282, 286, 68, 62),
      getTightBox(ikkPng, 214, 284, 66, 64),
    ],
    sleeping: [
      getTightBox(ikkPng, 290, 55, 60, 54),
    ],
    training: [
      getTightBox(ikkPng, 214, 284, 66, 64),
      getTightBox(ikkPng, 282, 286, 68, 62),
    ],
  };

  // 17. ZUDOMON (500x500 - using Copy_of_Zudomon_2_44e2c173.png)
  const zudPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Zudomon_2_44e2c173.png'));
  configs.zudomon = {
    sheetPath: '/assets/aistudio/Copy_of_Zudomon_2_44e2c173.png',
    sheetWidth: 500,
    sheetHeight: 500,
    standing: [
      getTightBox(zudPng, 4, 135, 120, 108),
      getTightBox(zudPng, 250, 135, 120, 108),
    ],
    walking: [
      getTightBox(zudPng, 4, 135, 120, 108),
      getTightBox(zudPng, 126, 135, 120, 108),
      getTightBox(zudPng, 250, 135, 120, 108),
      getTightBox(zudPng, 374, 135, 120, 108),
    ],
    happy: [
      getTightBox(zudPng, 126, 135, 120, 108),
      getTightBox(zudPng, 374, 135, 120, 108),
    ],
    sleeping: [
      getTightBox(zudPng, 48, 8, 170, 60),
    ],
    training: [
      getTightBox(zudPng, 4, 135, 120, 108),
      getTightBox(zudPng, 126, 135, 120, 108),
    ],
  };

  // 18. POYOMON (248x248)
  const poyPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Poyomon_d1a420e7.png'));
  configs.poyomon = {
    sheetPath: '/assets/aistudio/Copy_of_Poyomon_d1a420e7.png',
    sheetWidth: 248,
    sheetHeight: 248,
    standing: [
      getTightBox(poyPng, 16, 114, 40, 42),
      getTightBox(poyPng, 56, 114, 40, 42),
    ],
    walking: [
      getTightBox(poyPng, 16, 114, 40, 42),
      getTightBox(poyPng, 56, 114, 40, 42),
      getTightBox(poyPng, 96, 164, 40, 42),
      getTightBox(poyPng, 140, 164, 40, 42),
    ],
    happy: [
      getTightBox(poyPng, 96, 164, 40, 42),
      getTightBox(poyPng, 180, 164, 40, 42),
    ],
    sleeping: [
      getTightBox(poyPng, 16, 156, 38, 44),
    ],
    training: [
      getTightBox(poyPng, 140, 164, 40, 42),
      getTightBox(poyPng, 180, 164, 40, 42),
    ],
  };

  // 19. TOKOMON (274x274)
  const tokPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Tokomon_c5323292.png'));
  configs.tokomon = {
    sheetPath: '/assets/aistudio/Copy_of_Tokomon_c5323292.png',
    sheetWidth: 274,
    sheetHeight: 274,
    standing: [
      getTightBox(tokPng, 218, 18, 40, 44),
      getTightBox(tokPng, 92, 38, 40, 46),
    ],
    walking: [
      getTightBox(tokPng, 218, 18, 40, 44),
      getTightBox(tokPng, 92, 38, 40, 46),
      getTightBox(tokPng, 86, 84, 40, 46),
      getTightBox(tokPng, 74, 132, 42, 42),
    ],
    happy: [
      getTightBox(tokPng, 218, 18, 40, 44),
      getTightBox(tokPng, 86, 84, 40, 46),
    ],
    sleeping: [
      getTightBox(tokPng, 52, 84, 30, 45),
    ],
    training: [
      getTightBox(tokPng, 8, 134, 45, 45),
      getTightBox(tokPng, 8, 38, 45, 45),
    ],
  };

  // 20. ANGEMON (512x512)
  const angPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_Angemon_e4fecf69.png'));
  configs.angemon = {
    sheetPath: '/assets/aistudio/Copy_of_Angemon_e4fecf69.png',
    sheetWidth: 512,
    sheetHeight: 512,
    standing: [
      getTightBox(angPng, 4, 76, 72, 74),
      getTightBox(angPng, 80, 310, 72, 74),
    ],
    walking: [
      getTightBox(angPng, 80, 310, 72, 74),
      getTightBox(angPng, 172, 308, 68, 74),
      getTightBox(angPng, 242, 310, 68, 74),
      getTightBox(angPng, 312, 310, 68, 74),
    ],
    happy: [
      getTightBox(angPng, 312, 310, 68, 74),
      getTightBox(angPng, 444, 288, 64, 76),
    ],
    sleeping: [
      getTightBox(angPng, 4, 18, 72, 22),
    ],
    training: [
      getTightBox(angPng, 4, 76, 72, 74),
      getTightBox(angPng, 80, 310, 72, 74),
      getTightBox(angPng, 382, 312, 66, 72),
    ],
  };

  // 21. MAGNAANGEMON (512x512)
  const magAngPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_MagnaAngemon_2_d229b13a.png'));
  configs.magnaangemon = {
    sheetPath: '/assets/aistudio/Copy_of_MagnaAngemon_2_d229b13a.png',
    sheetWidth: 512,
    sheetHeight: 512,
    standing: [
      getTightBox(magAngPng, 86, 396, 92, 112),
      getTightBox(magAngPng, 4, 396, 82, 112),
    ],
    walking: [
      getTightBox(magAngPng, 86, 396, 92, 112),
      getTightBox(magAngPng, 182, 396, 92, 112),
      getTightBox(magAngPng, 284, 396, 94, 112),
      getTightBox(magAngPng, 388, 396, 104, 112),
    ],
    happy: [
      getTightBox(magAngPng, 86, 396, 92, 112),
      getTightBox(magAngPng, 4, 396, 82, 112),
    ],
    sleeping: [
      getTightBox(magAngPng, 78, 2, 98, 25),
    ],
    training: [
      getTightBox(magAngPng, 4, 396, 82, 112),
      getTightBox(magAngPng, 298, 218, 94, 102),
    ],
  };

  fs.writeFileSync('public/clean_frames_output.json', JSON.stringify(configs, null, 2));
  console.log('Successfully calculated clean boxes for all 21 Digimon');
}

analyzeAll();
