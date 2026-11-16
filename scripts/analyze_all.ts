import fs from "fs";
import { PNG } from "pngjs";
import { NEW_DIGIMON_SPRITES } from "../src/utils/newDigimonSprites";

function getBoxes(sheetPath: string) {
  const fullPath = "public" + sheetPath;
  if (!fs.existsSync(fullPath)) return [];
  const data = fs.readFileSync(fullPath);
  const png = PNG.sync.read(data);
  const visited = new Uint8Array(png.width * png.height);
  const boxes: Array<{ x: number; y: number; w: number; h: number; count: number; meanY: number }> = [];

  const isOpaque = (x: number, y: number) => {
    if (x < 0 || x >= png.width || y < 0 || y >= png.height) return false;
    return png.data[((png.width * y + x) << 2) + 3] > 25;
  };

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = png.width * y + x;
      if (visited[idx] || !isOpaque(x, y)) continue;

      let minX = x, maxX = x, minY = y, maxY = y;
      const q = [x, y];
      visited[idx] = 1;
      let head = 0, count = 0;

      while (head < q.length) {
        const cx = q[head++];
        const cy = q[head++];
        count++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          [cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1],
          [cx+1, cy+1], [cx-1, cy-1], [cx+1, cy-1], [cx-1, cy+1],
          [cx+2, cy], [cx-2, cy], [cx, cy+2], [cx, cy-2]
        ];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < png.width && ny >= 0 && ny < png.height) {
            const nidx = png.width * ny + nx;
            if (!visited[nidx] && isOpaque(nx, ny)) {
              visited[nidx] = 1;
              q.push(nx, ny);
            }
          }
        }
      }

      if (count > 80 && (maxX - minX > 15) && (maxY - minY > 15)) {
        boxes.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, count, meanY: minY });
      }
    }
  }
  return boxes.sort((a,b) => a.y - b.y || a.x - b.x);
}

const targets = [
  // Palmon
  "yuramon", "tanemon", "palmon", "togemon", "lillymon", "rosemon",
  // Gomamon
  "pichimon", "bukamon", "gomamon", "ikkakumon", "zudomon", "vikemon",
  // Patamon
  "poyomon", "tokomon", "patamon", "angemon", "magnaangemon", "seraphimon",
  // Gatomon
  "nyaromon", "salamon", "gatomon", "angewomon", "magnadramon"
];

for (const id of targets) {
  const conf = NEW_DIGIMON_SPRITES[id];
  if (!conf) continue;
  const boxes = getBoxes(conf.sheetPath);
  console.log(`\n=== ${id} (${conf.sheetPath}, total ${boxes.length} sprites) ===`);
  // Group by rows roughly (within 15px of y)
  const rows: Array<typeof boxes> = [];
  boxes.forEach(b => {
    let r = rows.find(row => Math.abs(row[0].y - b.y) <= 18);
    if (!r) {
      r = [];
      rows.push(r);
    }
    r.push(b);
  });
  rows.forEach((r, rIdx) => {
    r.sort((a,b) => a.x - b.x);
    console.log(`Row ${rIdx} (y~${r[0].y}): ${r.length} sprites -> ` + r.map(s => `[x:${s.x},w:${s.w},h:${s.h}]`).join(", "));
  });
}
