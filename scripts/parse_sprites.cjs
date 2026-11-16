const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function analyzeSheet(filePath) {
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  // Find all pixels with alpha > 25
  const visited = new Uint8Array(width * height);
  const rawBoxes = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && px[idx * 4 + 3] > 25) {
        // BFS to find connected component
        const q = [idx];
        visited[idx] = 1;
        let minX = x, maxX = x, minY = y, maxY = y;
        let count = 0;
        let head = 0;

        while (head < q.length) {
          const curr = q[head++];
          const cx = curr % width;
          const cy = Math.floor(curr / width);
          count++;

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // 8 directions + 2px jump
          const deltas = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [1, -1], [-1, 1], [1, 1],
            [-2, 0], [2, 0], [0, -2], [0, 2],
            [-3, 0], [3, 0], [0, -3], [0, 3]
          ];
          for (let d = 0; d < deltas.length; d++) {
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

        // Filter out tiny dust / single pixels
        if (count >= 50 && (maxX - minX >= 10 || maxY - minY >= 10)) {
          rawBoxes.push({
            x: minX,
            y: minY,
            w: maxX - minX + 1,
            h: maxY - minY + 1,
            count
          });
        }
      }
    }
  }

  // Merge boxes that overlap or are intimately close vertically/horizontally (e.g. wings, horns, detached shadows)
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < rawBoxes.length; i++) {
      for (let j = i + 1; j < rawBoxes.length; j++) {
        const a = rawBoxes[i];
        const b = rawBoxes[j];
        if (!a || !b) continue;

        const pad = 4; // if within 4px of each other
        const xOverlap = Math.max(0, Math.min(a.x + a.w + pad, b.x + b.w + pad) - Math.max(a.x - pad, b.x - pad));
        const yOverlap = Math.max(0, Math.min(a.y + a.h + pad, b.y + b.h + pad) - Math.max(a.y - pad, b.y - pad));

        // If boxes overlap with small margin
        if (xOverlap > 0 && yOverlap > 0) {
          const nx = Math.min(a.x, b.x);
          const ny = Math.min(a.y, b.y);
          const nw = Math.max(a.x + a.w, b.x + b.w) - nx;
          const nh = Math.max(a.y + a.h, b.y + b.h) - ny;
          // check that merged box isn't unnaturally huge (spanning entire sheet)
          if (nw < width * 0.45 && nh < height * 0.45) {
            a.x = nx; a.y = ny; a.w = nw; a.h = nh; a.count += b.count;
            rawBoxes.splice(j, 1);
            merged = true;
            break;
          }
        }
      }
      if (merged) break;
    }
  }

  // Filter out the sheet watermark / bottom text or bars if any (e.g. ribbon bar)
  const filtered = rawBoxes.filter(b => {
    // text ribbon is usually wide and short (e.g. w > 70, h < 14)
    if (b.w > width * 0.35 && b.h < 15) return false;
    return true;
  });

  // Sort boxes primarily by row band (Y) and then X
  // To find row bands, cluster Y by approx average height
  const avgH = filtered.length > 0 ? filtered.reduce((acc, b) => acc + b.h, 0) / filtered.length : 32;
  const rowThreshold = avgH * 0.55;

  filtered.sort((a, b) => {
    const rowDiff = Math.floor(a.y / rowThreshold) - Math.floor(b.y / rowThreshold);
    if (rowDiff !== 0) return rowDiff;
    return a.x - b.x;
  });

  return {
    width,
    height,
    sprites: filtered
  };
}

const dir = path.join(process.cwd(), 'public/assets/aistudio');
const files = fs.readdirSync(dir).filter(f => f.startsWith('Copy_of_') && f.endsWith('.png'));

const allData = {};
for (const file of files) {
  const full = path.join(dir, file);
  try {
    const res = analyzeSheet(full);
    allData[file] = res;
    console.log(`${file}: ${res.sprites.length} sprites detected (${res.width}x${res.height})`);
  } catch (err) {
    console.error(`Error in ${file}:`, err);
  }
}

fs.writeFileSync(path.join(dir, 'parsed_sprites.json'), JSON.stringify(allData, null, 2));
console.log('Saved to parsed_sprites.json! Total processed:', Object.keys(allData).length);
