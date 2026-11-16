const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

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

const dir = path.join(__dirname, '../public/assets/aistudio');

function curateSpecies(speciesId, fileName) {
  const filePath = path.join(dir, fileName);
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  // Strict 4-way BFS extraction
  const visited = new Uint8Array(width * height);
  const candidates = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && px[idx * 4 + 3] > 35) {
        const q = [idx];
        visited[idx] = 1;
        let minX = x, maxX = x, minY = y, maxY = y;
        let count = 0, head = 0;
        let darkOutlines = 0;

        while (head < q.length) {
          const curr = q[head++];
          const cx = curr % width;
          const cy = Math.floor(curr / width);
          count++;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          const pIdx = curr * 4;
          if (px[pIdx] < 60 && px[pIdx + 1] < 60 && px[pIdx + 2] < 60) {
            darkOutlines++;
          }

          const deltas = [[-1,0],[1,0],[0,-1],[0,1]];
          for (let d = 0; d < 4; d++) {
            const nx = cx + deltas[d][0];
            const ny = cy + deltas[d][1];
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (!visited[nidx] && px[nidx * 4 + 3] > 35) {
                visited[nidx] = 1;
                q.push(nidx);
              }
            }
          }
        }

        const w = maxX - minX + 1;
        const h = maxY - minY + 1;

        // Discard shadow ovals, laser beams, tiny sparks
        const isShadow = (w > 40 && h <= 15) || (w > 70 && h <= 20);
        const isTiny = count < 100 && (w < 18 || h < 18);
        const isLaser = (w > 80 && h < 24) || (h > 80 && w < 24);
        const isPureEffect = darkOutlines < count * 0.04 && count > 500 && (w > 65 && h > 65);

        if (!isShadow && !isTiny && !isLaser && !isPureEffect && count > 120) {
          candidates.push({
            x: minX,
            y: minY,
            w,
            h,
            count,
            darkOutlines,
            baselineY: maxY,
            centerX: Math.round(minX + w / 2),
            centerY: Math.round(minY + h / 2),
          });
        }
      }
    }
  }

  // Filter out rotated border slices (narrow vertical strips where h/w > 2.2 and w < 32)
  const upright = candidates.filter(c => {
    if (c.h / c.w > 2.2 && c.w < 32) return false;
    if (c.x === 0 && c.w < 20) return false;
    return true;
  });

  // Calculate median height of upright character sprites
  const heights = upright.map(c => c.h).sort((a, b) => a - b);
  const medianH = heights[Math.floor(heights.length * 0.5)] || 32;

  // Find sleeping frame: lowest height or widest ratio on ground (e.g. h < 0.65 * medianH)
  const sleepCandidates = upright.filter(c => c.h < medianH * 0.65 && c.w >= medianH * 0.6);
  let sleepFrame = sleepCandidates.length > 0 ? sleepCandidates[0] : null;
  if (!sleepFrame) {
    const sortedByH = [...upright].sort((a, b) => a.h - b.h);
    sleepFrame = sortedByH[0];
  }

  // Non-sleeping upright character frames
  const characterFrames = upright.filter(c => c !== sleepFrame && c.h >= medianH * 0.65);

  // Cluster character frames into animation rows by baselineY (ground level)
  const rows = [];
  const sortedByBaseline = [...characterFrames].sort((a, b) => a.baselineY - b.baselineY);

  for (const c of sortedByBaseline) {
    let matchedRow = null;
    for (const r of rows) {
      if (Math.abs(r.baselineY - c.baselineY) <= 5 && Math.abs(r.avgH - c.h) <= 12) {
        matchedRow = r;
        break;
      }
    }
    if (matchedRow) {
      matchedRow.frames.push(c);
      matchedRow.baselineY = Math.round(matchedRow.frames.reduce((s, f) => s + f.baselineY, 0) / matchedRow.frames.length);
      matchedRow.avgH = Math.round(matchedRow.frames.reduce((s, f) => s + f.h, 0) / matchedRow.frames.length);
    } else {
      rows.push({
        baselineY: c.baselineY,
        avgH: c.h,
        frames: [c]
      });
    }
  }

  // Sort frames in each row horizontally left to right
  rows.forEach(r => r.frames.sort((a, b) => a.x - b.x));
  // Sort rows from top to bottom
  rows.sort((a, b) => a.baselineY - b.baselineY);

  // In Championship sheets:
  // - Rows with 2-4 frames in the upper-mid section of the sheet contain IDLE and WALK
  // - Filter out any row whose frames are at the far left edge if an inner row exists
  const candidateRows = rows.filter(r => r.frames.length >= 2);

  let standingRow = candidateRows.length > 0 ? candidateRows[0] : rows[0];
  let walkingRow = candidateRows.length > 1 ? candidateRows[1] : (candidateRows.length > 0 ? candidateRows[0] : rows[0]);

  // If first row has only 1 frame or is special, look for row with best idle frames
  // (In sheets like WarGreymon, Agumon, Greymon: row with 2-3 frames on the right)
  const multiFrameRows = rows.filter(r => r.frames.length >= 2 && r.frames.length <= 4);
  if (multiFrameRows.length >= 2) {
    standingRow = multiFrameRows[0];
    walkingRow = multiFrameRows[1];
  } else if (multiFrameRows.length === 1) {
    standingRow = multiFrameRows[0];
    const otherRows = rows.filter(r => r !== standingRow && r.frames.length >= 2);
    walkingRow = otherRows.length > 0 ? otherRows[0] : standingRow;
  }

  let standingFrames = standingRow.frames.slice(0, Math.min(3, standingRow.frames.length));
  let walkingFrames = walkingRow.frames.slice(0, Math.min(4, walkingRow.frames.length));

  if (walkingFrames.length < 2 && standingFrames.length >= 3) {
    walkingFrames = standingFrames.slice(1);
    standingFrames = standingFrames.slice(0, 2);
  }

  // Happy & Eating frames:
  // Look for cheerful / smiling frames in other rows or candidates
  const otherCandidates = characterFrames.filter(c => !standingFrames.includes(c) && !walkingFrames.includes(c));
  let happyFrames = otherCandidates.length > 0 ? [otherCandidates[0], standingFrames[0]] : standingFrames;
  let eatingFrames = otherCandidates.length > 1 ? [otherCandidates[1], standingFrames[0]] : standingFrames;

  // Training / Combat frames:
  // Attack animation (action poses, powers)
  let trainingFrames = [];
  if (otherCandidates.length >= 2) {
    trainingFrames = otherCandidates.slice(0, Math.min(3, otherCandidates.length));
  } else if (otherCandidates.length === 1) {
    trainingFrames = [otherCandidates[0], standingFrames[0]];
  } else {
    trainingFrames = walkingFrames.length > 1 ? walkingFrames : standingFrames;
  }

  // Sanitize with EXACT bounding boxes (zero padding bleed)
  const sanitize = (f) => ({
    x: Math.round(f.x),
    y: Math.round(f.y),
    w: Math.round(f.w),
    h: Math.round(f.h),
    rotate: 0,
  });

  return {
    sheetPath: `/assets/aistudio/${fileName}`,
    sheetWidth: width,
    sheetHeight: height,
    frames: {
      standing: standingFrames.map(sanitize),
      walking: walkingFrames.map(sanitize),
      happy: happyFrames.map(sanitize),
      eating: eatingFrames.map(sanitize),
      sleeping: [sanitize(sleepFrame || standingFrames[0])],
      training: trainingFrames.map(sanitize),
      sick: [sanitize(sleepFrame || standingFrames[0])],
      sitting: [sanitize(standingFrames[0])],
    }
  };
}

const finalConfigs = {};
for (const [id, file] of Object.entries(SPECIES_FILE_MAP)) {
  console.log(`Curating ${id}...`);
  finalConfigs[id] = curateSpecies(id, file);
}

// Generate src/utils/newDigimonSprites.ts
const tsContent = `// Auto-generated Clean & Authentic Digimon Championship Sprite Configurations
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

export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ${JSON.stringify(finalConfigs, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src/utils/newDigimonSprites.ts'), tsContent);
console.log('Saved src/utils/newDigimonSprites.ts successfully!');
