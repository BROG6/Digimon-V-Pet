const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function cropAll(sheetName, prefix) {
  const filePath = path.join(__dirname, '../public/assets/aistudio', sheetName);
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  const outDir = path.join(__dirname, '../public/debug_candidates', prefix);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

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
        if (count > 120 && !(w > 40 && h <= 15) && !(w > 70 && h <= 20)) {
          comps.push({ x: minX, y: minY, w, h, count });
        }
      }
    }
  }

  comps.forEach((c, idx) => {
    const cropped = new PNG({ width: c.w, height: c.h });
    for (let y = 0; y < c.h; y++) {
      for (let x = 0; x < c.w; x++) {
        const srcIdx = ((c.y + y) * width + (c.x + x)) * 4;
        const dstIdx = (y * c.w + x) * 4;
        cropped.data[dstIdx] = px[srcIdx];
        cropped.data[dstIdx + 1] = px[srcIdx + 1];
        cropped.data[dstIdx + 2] = px[srcIdx + 2];
        cropped.data[dstIdx + 3] = px[srcIdx + 3];
      }
    }
    const fname = `${prefix}_#${idx}_x${c.x}_y${c.y}_w${c.w}_h${c.h}.png`;
    fs.writeFileSync(path.join(outDir, fname), PNG.sync.write(cropped));
    console.log(`${prefix} #${idx}: [${c.x}, ${c.y}, ${c.w}, ${c.h}]`);
  });
}

cropAll('Copy_of_Botamon_fb04c770.png', 'botamon');
cropAll('Copy_of_Koromon_7d75f13c.png', 'koromon');
cropAll('Copy_of_Agumon_Adventure_04d0832a.png', 'agumon');
cropAll('Copy_of_Greymon_dcbe93f9.png', 'greymon');
cropAll('Copy_of_MetalGreymon_2_7f134d73.png', 'metalgreymon');
cropAll('Copy_of_WarGreymon_9adf0908.png', 'wargreymon');
