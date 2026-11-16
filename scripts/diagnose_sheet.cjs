const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function analyzeFile(filename) {
  const filePath = path.join(__dirname, '../public/assets/aistudio', filename);
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  console.log(`=== ${filename} (${width}x${height}) ===`);
  
  // Find connected components with strict separation:
  // Only connect if px > 30.
  // And let's see what components exist before any merging.
  const visited = new Uint8Array(width * height);
  const comps = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && px[idx * 4 + 3] > 30) {
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

          // 4-way BFS
          const deltas = [[-1,0],[1,0],[0,-1],[0,1]];
          for (let d = 0; d < 4; d++) {
            const nx = cx + deltas[d][0];
            const ny = cy + deltas[d][1];
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (!visited[nidx] && px[nidx * 4 + 3] > 30) {
                visited[nidx] = 1;
                q.push(nidx);
              }
            }
          }
        }

        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        if (count > 50) {
          comps.push({ minX, maxX, minY, maxY, w, h, count });
        }
      }
    }
  }

  comps.forEach((c, i) => {
    console.log(`  #${i}: [${c.minX}, ${c.minY}, ${c.w}, ${c.h}] count=${c.count}`);
  });
}

analyzeFile('Copy_of_Botamon_fb04c770.png');
analyzeFile('Copy_of_Koromon_7d75f13c.png');
