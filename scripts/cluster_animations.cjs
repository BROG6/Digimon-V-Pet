const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const SPECIES_FILE_MAP = {
  // Baby I
  'botamon': 'Copy_of_Botamon_fb04c770.png',
  'punimon': 'Copy_of_Punimon_68b4fcb1.png',
  'pabumon': 'Copy_of_Pabumon_8b4cbbd7.png',
  'poyomon': 'Copy_of_Poyomon_d1a420e7.png',
  'pichimon': 'Copy_of_Pichimon_eca26270.png',
  'yuramon': 'Copy_of_Yuramon_3ad2937a.png',
  'nyokimon': 'Copy_of_Nyokimon_e5b120c1.png',

  // Baby II
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

function extractCleanComponents(filePath) {
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  const visited = new Uint8Array(width * height);
  const comps = [];

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
        // Filter out shadow ovals (flat gray ellipse)
        const isShadow = (w > 45 && h <= 15) || (w > 70 && h <= 20);
        // Filter out tiny particles / bubbles / sweat drops
        const isTiny = count < 100 && (w < 18 || h < 18);
        // Filter out extreme aspect ratio projectiles (laser beams)
        const isLaser = (w > 90 && h < 22) || (h > 90 && w < 22);

        if (!isShadow && !isTiny && !isLaser && count > 120) {
          comps.push({ x: minX, y: minY, w, h, count, baselineY: maxY, rightX: maxX });
        }
      }
    }
  }

  // Filter out rotated side strips:
  // In DS sheets, rotated sprites are placed on edges and have h/w > 2.3 while w < 30
  const upright = comps.filter(c => {
    if (c.h / c.w > 2.4 && c.w < 32) return false;
    // Also cut-off frames right at x=0 with tiny width
    if (c.x === 0 && c.w < 20) return false;
    return true;
  });

  // Group by baseline Y (within ~4px)
  upright.sort((a, b) => a.baselineY - b.baselineY);
  const rows = [];
  for (const c of upright) {
    let placed = false;
    for (const row of rows) {
      if (Math.abs(row.baselineY - c.baselineY) <= 4 && Math.abs(row.avgH - c.h) <= 12) {
        row.frames.push(c);
        row.baselineY = Math.round(row.frames.reduce((sum, f) => sum + f.baselineY, 0) / row.frames.length);
        row.avgH = Math.round(row.frames.reduce((sum, f) => sum + f.h, 0) / row.frames.length);
        placed = true;
        break;
      }
    }
    if (!placed) {
      rows.push({ baselineY: c.baselineY, avgH: c.h, frames: [c] });
    }
  }

  // Sort frames in each row left to right
  rows.forEach(r => r.frames.sort((a, b) => a.x - b.x));
  // Sort rows by baselineY
  rows.sort((a, b) => a.baselineY - b.baselineY);

  return { width, height, rows, allComps: upright };
}

// Test on sample species
const sample = ['botamon', 'koromon', 'agumon', 'greymon', 'wargreymon'];
for (const s of sample) {
  const res = extractCleanComponents(path.join(dir, SPECIES_FILE_MAP[s]));
  console.log(`\n=== ${s.toUpperCase()} Rows (${res.rows.length}) ===`);
  res.rows.forEach((r, idx) => {
    console.log(`  Row ${idx} (baselineY=${r.baselineY}, avgH=${r.avgH}, count=${r.frames.length}):`);
    r.frames.forEach(f => {
      console.log(`    [x=${f.x}, y=${f.y}, w=${f.w}, h=${f.h}]`);
    });
  });
}
