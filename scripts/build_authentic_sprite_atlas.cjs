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

function processSpecies(speciesId, fileName) {
  const filePath = path.join(dir, fileName);
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  // 1. Strict 4-way BFS: NO touching diagonally, NO artificial merging
  const visited = new Uint8Array(width * height);
  const components = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && px[idx * 4 + 3] > 35) {
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
        // Filter out shadow ovals (flat gray ellipse with low height)
        const isShadow = (w > 45 && h <= 15) || (w > 70 && h <= 20);
        // Filter out tiny particles / bubbles / sweat drops
        const isTiny = count < 100 && (w < 18 || h < 18);
        // Filter out extreme aspect ratio projectiles (laser beams)
        const isLaser = (w > 90 && h < 22) || (h > 90 && w < 22);

        if (!isShadow && !isTiny && !isLaser && count > 120) {
          components.push({
            x: minX,
            y: minY,
            w,
            h,
            count,
            baselineY: maxY,
            centerX: Math.round(minX + w / 2),
            centerY: Math.round(minY + h / 2)
          });
        }
      }
    }
  }

  // 2. Identify rotated sprites:
  // In DS Championship sheets, sprites turned sideways on edge columns have:
  // - very narrow width (w < 32) and h/w > 2.3
  // - or touch the edge with straight cuts
  const uprightComponents = components.filter(c => {
    if (c.h / c.w > 2.3 && c.w < 32) return false;
    if (c.x === 0 && c.w < 20) return false;
    return true;
  });

  // Calculate typical character dimensions
  const heights = uprightComponents.map(c => c.h).sort((a, b) => a - b);
  const medianH = heights[Math.floor(heights.length * 0.6)] || 32;

  // 3. Cluster components into animation rows by baselineY (feet line on the ground)
  const rows = [];
  const sortedByBaseline = [...uprightComponents].sort((a, b) => a.baselineY - b.baselineY);

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

  // Sort frames in each row from left to right
  rows.forEach(r => r.frames.sort((a, b) => a.x - b.x));
  // Sort rows from top to bottom
  rows.sort((a, b) => a.baselineY - b.baselineY);

  // 4. Identify animation sets based on canonical Championship structure:
  // Candidate rows with normal upright height (h >= 0.7 * medianH and h <= 1.35 * medianH)
  const candidateRows = rows.filter(r => r.avgH >= medianH * 0.65 && r.avgH <= medianH * 1.35);

  // Standing/Idle frames:
  // In DS sheets, idle is either:
  // - A row with 2-3 frames near the top/upper half of the sheet, OR
  // - The row with smallest horizontal movement / calm upright posture
  let standingFrames = [];
  let walkingFrames = [];
  let happyFrames = [];
  let eatingFrames = [];
  let sleepingFrames = [];
  let trainingFrames = [];
  let sickFrames = [];
  let sittingFrames = [];

  // Find sleeping frame: lowest height or widest ratio on ground
  const sleepCandidates = uprightComponents.filter(c => c.h < medianH * 0.65 && c.w >= medianH * 0.7);
  if (sleepCandidates.length > 0) {
    sleepingFrames = [sleepCandidates[0]];
  } else {
    // Or row with smallest height
    const shortRows = [...rows].sort((a, b) => a.avgH - b.avgH);
    sleepingFrames = [shortRows[0].frames[0]];
  }

  // Find Standing (Idle) Row:
  // Filter out any row containing attack effects / giant projectiles
  const uprightRows = candidateRows.filter(r => {
    // Avoid rows where frames are at extreme left with jumping/falling
    return r.frames.length >= 1;
  });

  if (uprightRows.length >= 2) {
    // Row with 2-3 frames that are standard upright
    // Usually Row 0 or Row 1 of upright rows is standing, next is walking
    const idleRow = uprightRows.find(r => r.frames.length >= 2 && r.frames.length <= 4) || uprightRows[0];
    standingFrames = idleRow.frames.slice(0, Math.min(3, idleRow.frames.length));

    // Walk row: another candidate row with 2-4 frames
    const otherRows = uprightRows.filter(r => r !== idleRow);
    const walkRow = otherRows.find(r => r.frames.length >= 2) || otherRows[0] || idleRow;
    walkingFrames = walkRow.frames.slice(0, Math.min(4, walkRow.frames.length));
  } else if (uprightRows.length === 1) {
    const f = uprightRows[0].frames;
    if (f.length >= 4) {
      standingFrames = f.slice(0, 2);
      walkingFrames = f.slice(2, 4);
    } else {
      standingFrames = f.slice(0, 2);
      walkingFrames = f;
    }
  } else {
    // Fallback from all upright components
    standingFrames = uprightComponents.slice(0, 2);
    walkingFrames = uprightComponents.slice(0, 3);
  }

  // Happy frames:
  // Smiling / mouth open / hopping frame
  const happyCandidates = uprightComponents.filter(c => {
    return !standingFrames.includes(c) && !walkingFrames.includes(c) && !sleepingFrames.includes(c);
  });
  happyFrames = happyCandidates.length > 0 ? [happyCandidates[0], standingFrames[0]] : standingFrames;
  eatingFrames = happyCandidates.length > 1 ? [happyCandidates[1], standingFrames[0]] : standingFrames;

  // Training / Attack frames:
  // Look for frames with extended limbs, fists, breathing fire/beam, action poses
  const actionCandidates = uprightComponents.filter(c => {
    return !standingFrames.includes(c) && !walkingFrames.includes(c) && !sleepingFrames.includes(c);
  });
  if (actionCandidates.length >= 2) {
    trainingFrames = actionCandidates.slice(0, 3);
  } else if (actionCandidates.length === 1) {
    trainingFrames = [actionCandidates[0], standingFrames[0]];
  } else {
    trainingFrames = standingFrames;
  }

  sickFrames = sleepingFrames;
  sittingFrames = [standingFrames[0]];

  // Sanitize frames: strictly exact bounding box with NO padding bleed
  const sanitize = (f) => ({
    x: Math.round(f.x),
    y: Math.round(f.y),
    w: Math.round(f.w),
    h: Math.round(f.h),
    rotate: 0
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
      sleeping: sleepingFrames.map(sanitize),
      training: trainingFrames.map(sanitize),
      sick: sickFrames.map(sanitize),
      sitting: sittingFrames.map(sanitize),
    }
  };
}

const allConfigs = {};
for (const [speciesId, fileName] of Object.entries(SPECIES_FILE_MAP)) {
  console.log(`Processing ${speciesId}...`);
  allConfigs[speciesId] = processSpecies(speciesId, fileName);
}

// Generate newDigimonSprites.ts
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

export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ${JSON.stringify(allConfigs, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src/utils/newDigimonSprites.ts'), tsContent);
console.log('Successfully written src/utils/newDigimonSprites.ts!');

// Also generate public/sprite_review.html for visual inspection
let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Digimon Sprite Review & Verification</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: monospace; padding: 20px; }
    h1 { color: #38bdf8; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 12px; }
    .species-name { font-weight: bold; color: #facc15; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; }
    .anim-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .anim-label { width: 65px; font-size: 11px; color: #94a3b8; }
    .frame-box { display: inline-block; position: relative; overflow: hidden; background: #090d16; border: 1px solid #475569; border-radius: 4px; image-rendering: pixelated; margin-right: 4px; }
    .frame-img { position: absolute; max-width: none; image-rendering: pixelated; }
  </style>
</head>
<body>
  <h1>Digimon Championship Isolated Sprites Verification</h1>
  <p>Reviewing all 42 species for upright posture, isolated frames (0 overlaps), and correct standing/walking animation sets.</p>
  <div class="grid">
`;

for (const [id, cfg] of Object.entries(allConfigs)) {
  html += `  <div class="card">\n    <div class="species-name">${id}</div>\n`;
  for (const [action, frames] of Object.entries(cfg.frames)) {
    if (['standing', 'walking', 'happy', 'sleeping', 'training'].includes(action)) {
      html += `    <div class="anim-row">\n      <span class="anim-label">${action}:</span>\n`;
      frames.forEach(f => {
        html += `      <div class="frame-box" style="width:${f.w * 1.5}px; height:${f.h * 1.5}px;">\n`;
        html += `        <img class="frame-img" src="${cfg.sheetPath}" style="width:${cfg.sheetWidth * 1.5}px; height:${cfg.sheetHeight * 1.5}px; left:-${f.x * 1.5}px; top:-${f.y * 1.5}px;" />\n`;
        html += `      </div>\n`;
      });
      html += `    </div>\n`;
    }
  }
  html += `  </div>\n`;
}

html += `</div>\n</body>\n</html>`;
fs.writeFileSync(path.join(process.cwd(), 'public/sprite_review.html'), html);
console.log('Successfully written public/sprite_review.html!');
