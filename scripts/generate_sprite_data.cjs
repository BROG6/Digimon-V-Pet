const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Map canonical species ID to sprite filename
const SPECIES_FILE_MAP = {
  // Baby I / Fresh
  'botamon': 'Copy_of_Botamon_fb04c770.png',
  'punimon': 'Copy_of_Punimon_68b4fcb1.png',
  'pabumon': 'Copy_of_Pabumon_8b4cbbd7.png',
  'poyomon': 'Copy_of_Poyomon_d1a420e7.png',
  'pichimon': 'Copy_of_Pichimon_eca26270.png',
  'yuramon': 'Copy_of_Yuramon_3ad2937a.png',
  'nyokimon': 'Copy_of_Nyokimon_e5b120c1.png',

  // Baby II / In-Training
  'koromon': 'Copy_of_Koromon_7d75f13c.png',
  'tsunomon': 'Copy_of_Tsunomon_d59ed36b.png',
  'tokomon': 'Copy_of_Tokomon_c5323292.png',
  'tanemon': 'Copy_of_Tanemon_17517f84.png',
  'bukamon': 'Copy_of_Bukamon_b180f25e.png',
  'nyaromon': 'Copy_of_Nyaromon_923766aa.png',
  'yokomon': 'Copy_of_Yokomon_dd201051.png',

  // Rookie
  'agumon': 'Copy_of_Agumon_Adventure_04d0832a.png',
  'gabumon': 'Copy_of_Gabumon_1beb725f.png',
  'biyomon': 'Copy_of_Biyomon_ad3c3232.png',
  'patamon': 'Copy_of_Patamon_6c39d52c.png',
  'palmon': 'Copy_of_Palmon_2070e7b5.png',
  'gomamon': 'Copy_of_Gomamon_45ce5d57.png',
  'salamon': 'Copy_of_Salamon_adc16886.png',

  // Champion
  'greymon': 'Copy_of_Greymon_dcbe93f9.png',
  'garurumon': 'Copy_of_Garurumon_2a0bd546.png',
  'birdramon': 'Copy_of_Birdramon_6ba0b315.png',
  'angemon': 'Copy_of_Angemon_e4fecf69.png',
  'togemon': 'Copy_of_Togemon_11c9cc70.png',
  'ikkakumon': 'Copy_of_Ikkakumon_d7c47668.png',
  'gatomon': 'Copy_of_Gatomon_68f5ce70.png',

  // Ultimate
  'metalgreymon': 'Copy_of_MetalGreymon_2_7f134d73.png',
  'weregarurumon': 'Copy_of_WereGarurumon_497c1afb.png',
  'garudamon': 'Copy_of_Garudamon_efb5b727.png',
  'magnaangemon': 'Copy_of_MagnaAngemon_2_d229b13a.png',
  'lillymon': 'Copy_of_Lillymon_aba09616.png',
  'zudomon': 'Copy_of_Zudomon_72c1c161.png',
  'angewomon': 'Copy_of_Angewomon_2_2dca13a6.png',

  // Mega
  'wargreymon': 'Copy_of_WarGreymon_9adf0908.png',
  'metalgarurumon': 'Copy_of_MetalGarurumon_4_3c810c39.png',
  'phoenixmon': 'Copy_of_Phoenixmon_5_f4ad8760.png',
  'seraphimon': 'Copy_of_Seraphimon_7d6ba82a.png',
  'rosemon': 'Copy_of_Rosemon_6267595c.png',
  'vikemon': 'Copy_of_Vikemon_4cb881d2.png',
  'magnadramon': 'Copy_of_Magnadramon_d8456cbf.png',
};

function extractSprites(filePath) {
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  const visited = new Uint8Array(width * height);
  const rawComponents = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && px[idx * 4 + 3] > 25) {
        const q = [idx];
        visited[idx] = 1;
        let minX = x, maxX = x, minY = y, maxY = y;
        let count = 0, head = 0;

        while (head < q.length) {
          const curr = q[head++];
          const cx = curr % width;
          const cy = Math.floor(curr / width);
          count++;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // 4-way BFS prevents jumping across separate animation rows
          const deltas = [[-1,0],[1,0],[0,-1],[0,1]];
          for (let d = 0; d < 4; d++) {
            const nx = cx + deltas[d][0];
            const ny = cy + deltas[d][1];
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (!visited[nidx] && px[nidx * 4 + 3] > 25) {
                visited[nidx] = 1;
                q.push(nidx);
              }
            }
          }
        }

        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        // Ignore tiny specks (under 40 pixels) or wide banner text (credit watermark)
        if (count >= 50 && !(w > 50 && h < 14) && !(w > 120 && h < 25)) {
          rawComponents.push({ x: minX, y: minY, w, h, count });
        }
      }
    }
  }

  // Merge detached pieces that belong to the SAME character frame
  // (e.g. a horn, floating wing tip, or paw that is within 2px vertically and aligned horizontally)
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < rawComponents.length; i++) {
      for (let j = i + 1; j < rawComponents.length; j++) {
        const a = rawComponents[i];
        const b = rawComponents[j];
        if (!a || !b) continue;

        const xOverlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
        const minW = Math.min(a.w, b.w);
        const yDist = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h));

        // Only merge if significant horizontal alignment (overlap >= 50%) and very close vertically (<= 3px)
        if (xOverlap / minW >= 0.5 && yDist <= 3) {
          const nx = Math.min(a.x, b.x);
          const ny = Math.min(a.y, b.y);
          const nw = Math.max(a.x + a.w, b.x + b.w) - nx;
          const nh = Math.max(a.y + a.h, b.y + b.h) - ny;
          if (nw < width * 0.4 && nh < height * 0.4) {
            a.x = nx; a.y = ny; a.w = nw; a.h = nh; a.count += b.count;
            rawComponents.splice(j, 1);
            merged = true;
            break;
          }
        }
      }
      if (merged) break;
    }
  }

  // Sort frames by Row (Y band) then X
  const typicalH = rawComponents.reduce((acc, c) => acc + c.h, 0) / (rawComponents.length || 1);
  const rowH = Math.max(20, typicalH * 0.7);

  rawComponents.sort((a, b) => {
    const bandA = Math.floor(a.y / rowH);
    const bandB = Math.floor(b.y / rowH);
    if (bandA !== bandB) return bandA - bandB;
    return a.x - b.x;
  });

  return { width, height, sprites: rawComponents };
}

const dir = path.join(process.cwd(), 'public/assets/aistudio');
const outputSpeciesData = {};

for (const [speciesId, fileName] of Object.entries(SPECIES_FILE_MAP)) {
  const filePath = path.join(dir, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${fileName} for ${speciesId}`);
    continue;
  }

  const { width, height, sprites } = extractSprites(filePath);
  if (sprites.length === 0) {
    console.warn(`No sprites detected in ${fileName}`);
    continue;
  }

  // Build clean animation sets from the ordered sprites
  // In Championship sheets:
  // Row 1 (first 2-4 sprites): Standing / Idle
  // Row 2 (next 2-4 sprites): Walking
  // Remaining sprites: Attack / Special / Happy / Sleep / Sick
  const total = sprites.length;
  
  // Clean frame mapping
  let standing = [];
  let walking = [];
  let happy = [];
  let eating = [];
  let sleeping = [];
  let training = [];
  let sick = [];
  let sitting = [];

  if (total <= 3) {
    standing = sprites.slice(0, Math.min(2, total));
    walking = sprites.slice(0, total);
    happy = [sprites[0]];
    eating = [sprites[0]];
    sleeping = [sprites[total - 1]];
    training = [sprites[0]];
    sick = [sprites[total - 1]];
    sitting = [sprites[0]];
  } else if (total <= 6) {
    standing = [sprites[0], sprites[1]];
    walking = sprites.slice(1, 4);
    happy = [sprites[2] || sprites[0]];
    eating = [sprites[1] || sprites[0]];
    sleeping = [sprites[total - 1]];
    training = [sprites[total - 2] || sprites[0]];
    sick = [sprites[total - 1]];
    sitting = [sprites[0]];
  } else if (total <= 9) {
    standing = [sprites[0], sprites[1], sprites[2] || sprites[0]];
    walking = [sprites[3], sprites[4], sprites[5] || sprites[3]];
    happy = [sprites[2], sprites[0]];
    eating = [sprites[1], sprites[4]];
    training = sprites.slice(6, 8);
    sleeping = [sprites[total - 1]];
    sick = [sprites[total - 1]];
    sitting = [sprites[0]];
  } else {
    // 10+ frames (full sheet)
    standing = sprites.slice(0, 3);
    walking = sprites.slice(3, 6);
    training = sprites.slice(6, 9);
    happy = [sprites[2], sprites[9] || sprites[1]];
    eating = [sprites[1], sprites[4]];
    sleeping = [sprites[total - 1], sprites[total - 2] || sprites[total - 1]];
    sick = [sprites[total - 1]];
    sitting = [sprites[0]];
  }

  // Pad frames slightly (1px) if safe so sprites aren't clipped
  const padFrame = (f) => ({
    x: Math.max(0, f.x - 1),
    y: Math.max(0, f.y - 1),
    w: Math.min(width - Math.max(0, f.x - 1), f.w + 2),
    h: Math.min(height - Math.max(0, f.y - 1), f.h + 2)
  });

  outputSpeciesData[speciesId] = {
    sheetPath: `/assets/aistudio/${fileName}`,
    sheetWidth: width,
    sheetHeight: height,
    frames: {
      standing: standing.map(padFrame),
      walking: walking.map(padFrame),
      happy: happy.map(padFrame),
      eating: eating.map(padFrame),
      sleeping: sleeping.map(padFrame),
      training: training.map(padFrame),
      sick: sick.map(padFrame),
      sitting: sitting.map(padFrame),
    }
  };

  console.log(`Mapped ${speciesId} (${fileName}) -> ${sprites.length} sprites total`);
}

// Generate src/utils/newDigimonSprites.ts
const tsContent = `// Auto-generated Authentic Digimon Championship Sprite Configurations
export interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
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

export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ${JSON.stringify(outputSpeciesData, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src/utils/newDigimonSprites.ts'), tsContent);
console.log('Successfully written src/utils/newDigimonSprites.ts!');
