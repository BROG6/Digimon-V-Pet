const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const testSpecies = [
  { id: 'botamon', file: 'Copy_of_Botamon_fb04c770.png' },
  { id: 'koromon', file: 'Copy_of_Koromon_7d75f13c.png' },
  { id: 'tsunomon', file: 'Copy_of_Tsunomon_d59ed36b.png' },
  { id: 'agumon', file: 'Copy_of_Agumon_Adventure_04d0832a.png' },
  { id: 'gabumon', file: 'Copy_of_Gabumon_1beb725f.png' },
  { id: 'biyomon', file: 'Copy_of_Biyomon_ad3c3232.png' },
  { id: 'patamon', file: 'Copy_of_Patamon_6c39d52c.png' },
  { id: 'greymon', file: 'Copy_of_Greymon_dcbe93f9.png' },
  { id: 'garurumon', file: 'Copy_of_Garurumon_2a0bd546.png' },
  { id: 'wargreymon', file: 'Copy_of_WarGreymon_9adf0908.png' },
];

const dir = path.join(__dirname, '../public/assets/aistudio');

for (const sp of testSpecies) {
  const filePath = path.join(dir, sp.file);
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  // Strict 4-way BFS with no diagonal bridging
  const visited = new Uint8Array(width * height);
  const raw = [];

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
        // Filter out shadow ovals (e.g. w > 50, h <= 14) and tiny specks (count < 80)
        const isShadow = (w > 50 && h <= 14) || (w > 80 && h <= 20);
        const isSpeck = count < 100 && (w < 18 || h < 18);
        const isLongBeam = (w > 80 && h < 25) || (h > 80 && w < 20);

        if (!isShadow && !isSpeck && !isLongBeam && count > 120) {
          raw.push({ minX, maxX, minY, maxY, w, h, count });
        }
      }
    }
  }

  console.log(`[${sp.id}] Raw candidates: ${raw.length}`);
  // Log candidates
  raw.forEach((c, idx) => {
    // Check if touching red or black boundary line
    console.log(`  ${sp.id} #${idx}: x=${c.minX}..${c.maxX} (w=${c.w}), y=${c.minY}..${c.maxY} (h=${c.h}), count=${c.count}`);
  });
}
