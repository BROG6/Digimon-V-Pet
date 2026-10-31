const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function analyzeSheet(filePath) {
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const { width, height, data: px } = png;

  const visited = new Uint8Array(width * height);
  const boxes = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && px[idx * 4 + 3] > 20) {
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

          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = ny * width + nx;
                if (!visited[nidx] && px[nidx * 4 + 3] > 20) {
                  visited[nidx] = 1;
                  q.push(nidx);
                }
              }
            }
          }
        }
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        if (count > 40 && w >= 16 && h >= 16) {
          boxes.push({ x: minX, y: minY, w, h, pixels: count, aspect: (w / h).toFixed(2) });
        }
      }
    }
  }

  boxes.sort((a, b) => (Math.abs(a.y - b.y) > 12 ? a.y - b.y : a.x - b.x));
  return { width, height, boxes };
}

const targets = [
  { id: 'nyaromon', file: 'Copy_of_Nyaromon_923766aa.png' },
  { id: 'gatomon', file: 'Copy_of_Gatomon_68f5ce70.png' },
  { id: 'magnadramon', file: 'Copy_of_Magnadramon_d8456cbf.png' },
  { id: 'gabumon', file: 'Copy_of_Gabumon_1beb725f.png' },
  { id: 'metalgarurumon', file: 'Copy_of_MetalGarurumon_4_3c810c39.png' },
  { id: 'weregarurumon', file: 'Copy_of_WereGarurumon_497c1afb.png' },
  { id: 'biyomon', file: 'Copy_of_Biyomon_ad3c3232.png' },
  { id: 'birdramon', file: 'Copy_of_Birdramon_6ba0b315.png' },
  { id: 'garudamon', file: 'Copy_of_Garudamon_3_4b148cfb.png' },
  { id: 'motimon', file: 'Motimon_5cc21ee4.png' },
  { id: 'megakabuterimon', file: 'Copy_of_MegaKabuterimon_42236ae2.png' },
  { id: 'herculeskabuterimon', file: 'HerculesKabuterimon_2_89341216.png' },
  { id: 'yuramon', file: 'Copy_of_Yuramon_3ad2937a.png' },
  { id: 'palmon', file: 'Copy_of_Palmon_2070e7b5.png' },
  { id: 'bukamon', file: 'Copy_of_Bukamon_b180f25e.png' },
  { id: 'ikkakumon', file: 'Copy_of_Ikkakumon_d7c47668.png' },
  { id: 'zudomon', file: 'Copy_of_Zudomon_72c1c161.png' },
  { id: 'poyomon', file: 'Copy_of_Poyomon_d1a420e7.png' },
  { id: 'tokomon', file: 'Copy_of_Tokomon_c5323292.png' },
  { id: 'angemon', file: 'Copy_of_Angemon_e4fecf69.png' },
  { id: 'magnaangemon', file: 'Copy_of_MagnaAngemon_2_d229b13a.png' },
];

let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { background: #111; color: #fff; font-family: sans-serif; padding: 20px; }
  .species { margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
  .boxes { display: flex; flex-wrap: wrap; gap: 10px; }
  .box-card { background: #222; border: 1px solid #444; padding: 6px; border-radius: 6px; text-align: center; }
  .box-card span { display: block; font-size: 11px; color: #aaa; margin-top: 4px; }
  .crop { overflow: hidden; position: relative; background: #000; border: 1px solid #555; display: inline-block; }
  .crop img { position: absolute; image-rendering: pixelated; }
</style>
</head><body>
<h1>Sprite Component Inspection</h1>`;

for (const t of targets) {
  const p = path.join('public/assets/aistudio', t.file);
  if (!fs.existsSync(p)) continue;
  const res = analyzeSheet(p);
  html += `<div class="species"><h2>${t.id} (${t.file} - ${res.width}x${res.height})</h2><div class="boxes">`;
  res.boxes.forEach((b, idx) => {
    html += `<div class="box-card">
      <div class="crop" style="width:${b.w}px; height:${b.h}px;">
        <img src="/assets/aistudio/${t.file}" style="left:-${b.x}px; top:-${b.y}px;" />
      </div>
      <span>#${idx} [${b.x},${b.y},${b.w},${b.h}]<br/>asp:${b.aspect}</span>
    </div>`;
  });
  html += `</div></div>`;
}

html += `</body></html>`;
fs.writeFileSync('public/inspect_debug.html', html);
console.log('Generated public/inspect_debug.html with all target components');
