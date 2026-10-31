const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function analyzeBlobs(filePath) {
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  const visited = new Uint8Array(width * height);
  const boxes = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && px[idx * 4 + 3] > 30) {
        let minX = x, maxX = x, minY = y, maxY = y;
        let count = 0;
        const q = [idx];
        visited[idx] = 1;
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

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = ny * width + nx;
                if (!visited[nidx] && px[nidx * 4 + 3] > 30) {
                  visited[nidx] = 1;
                  q.push(nidx);
                }
              }
            }
          }
        }
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        if (count > 50 && w >= 16 && h >= 16) {
          boxes.push({ x: minX, y: minY, w, h, pixels: count });
        }
      }
    }
  }

  // Merge boxes that heavily overlap or are parts of the same character (e.g. gap <= 4)
  const merged = [];
  boxes.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

  for (const b of boxes) {
    let combined = false;
    for (const m of merged) {
      // Check if b is very close to m (gap <= 4 in x and y)
      const xOverlap = Math.max(0, Math.min(m.x + m.w, b.x + b.w) - Math.max(m.x, b.x));
      const yOverlap = Math.max(0, Math.min(m.y + m.h, b.y + b.h) - Math.max(m.y, b.y));
      const dist = Math.max(0, Math.max(m.x - (b.x + b.w), b.x - (m.x + m.w)), Math.max(m.y - (b.y + b.h), b.y - (m.y + m.h)));
      if (dist <= 3 && (xOverlap > 0 || yOverlap > 0 || dist === 0)) {
        const nx = Math.min(m.x, b.x);
        const ny = Math.min(m.y, b.y);
        m.w = Math.max(m.x + m.w, b.x + b.w) - nx;
        m.h = Math.max(m.y + m.h, b.y + b.h) - ny;
        m.x = nx;
        m.y = ny;
        m.pixels += b.pixels;
        combined = true;
        break;
      }
    }
    if (!combined) {
      merged.push({ ...b });
    }
  }

  return { width, height, boxes: merged };
}

const targets = [
  'nyaromon', 'gatomon', 'magnadramon', 'gabumon', 'metalgarurumon',
  'weregarurumon', 'biyomon', 'birdramon', 'garudamon', 'motimon',
  'megakabuterimon', 'herculeskabuterimon', 'yuramon', 'palmon',
  'bukamon', 'ikkakumon', 'zudomon', 'poyomon', 'tokomon', 'angemon', 'magnaangemon'
];

const results = {};
for (const id of targets) {
  // Read current sheet path from newDigimonSprites
  const tsContent = fs.readFileSync('src/utils/newDigimonSprites.ts', 'utf8');
  const match = tsContent.match(new RegExp('\"' + id + '\":\\s*\\{[\\s\\S]*?\"sheetPath\":\\s*\"(.*?)\"'));
  if (!match) continue;
  const relPath = match[1].replace(/^\//, '');
  const absPath = path.join('public', relPath.replace(/^assets\//, 'assets/'));
  if (!fs.existsSync(absPath)) continue;
  results[id] = { relPath: '/' + relPath, ...analyzeBlobs(absPath) };
}

fs.writeFileSync('public/blob_analysis.json', JSON.stringify(results, null, 2));
console.log('Blob analysis complete for all targets. Saved to public/blob_analysis.json');
