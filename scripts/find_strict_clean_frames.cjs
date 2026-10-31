const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function hasTransparentBorder(png, box) {
  // Check top and bottom edges
  for (let x = box.x; x < box.x + box.w; x++) {
    if (png.data[(box.y * png.width + x) * 4 + 3] > 10) return false;
    if (png.data[((box.y + box.h - 1) * png.width + x) * 4 + 3] > 10) return false;
  }
  // Check left and right edges
  for (let y = box.y; y < box.y + box.h; y++) {
    if (png.data[(y * png.width + box.x) * 4 + 3] > 10) return false;
    if (png.data[(y * png.width + (box.x + box.w - 1)) * 4 + 3] > 10) return false;
  }
  return true;
}

function findStrictConnectedComponent(png, seedX, seedY) {
  const { width, height, data } = png;
  const startIdx = seedY * width + seedX;
  if (data[startIdx * 4 + 3] <= 20) return null;

  const visited = new Uint8Array(width * height);
  const q = [startIdx];
  visited[startIdx] = 1;
  let minX = seedX, maxX = seedX, minY = seedY, maxY = seedY;
  let head = 0;

  while (head < q.length) {
    const curr = q[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);
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
          if (!visited[nidx] && data[nidx * 4 + 3] > 20) {
            visited[nidx] = 1;
            q.push(nidx);
          }
        }
      }
    }
  }

  // Exact bounding box of THIS component only
  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    pixelCount: q.length,
  };
}

// 1. MOTIMON (192x192)
const motPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Motimon_5cc21ee4.png'));
console.log('=== MOTIMON STRICT COMPONENTS ===');
// Known upright seed points:
// Row 1, Col 1: (20, 20)
// Row 4, Col 3: (100, 130) -> let's check
// Row 5, Col 2: (60, 160)
const motSeeds = [
  { name: 'r1_c1_stand', x: 20, y: 20 },
  { name: 'r5_c2_happy', x: 60, y: 160 },
  { name: 'r3_c3_stand', x: 105, y: 95 },
  { name: 'r4_c3_stand', x: 105, y: 130 },
];
const motBoxes = {};
for (const s of motSeeds) {
  const b = findStrictConnectedComponent(motPng, s.x, s.y);
  motBoxes[s.name] = b;
  console.log(s.name, b);
}

// 2. MEGAKABUTERIMON (481x481)
const megPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/Copy_of_MegaKabuterimon_42236ae2.png'));
console.log('=== MEGAKABUTERIMON STRICT COMPONENTS ===');
// In the rightmost column:
// Row 1 top-right: seed (410, 50)
// Row 2 top-right: seed (410, 130)
// Row 3: seed (410, 210)
// Row 4: seed (330, 280)
const megSeeds = [
  { name: 'r1_c5_stand', x: 410, y: 50 },
  { name: 'r2_c5_walk', x: 410, y: 130 },
  { name: 'r3_c5_walk', x: 410, y: 210 },
  { name: 'r4_c4_walk', x: 330, y: 280 },
];
const megBoxes = {};
for (const s of megSeeds) {
  const b = findStrictConnectedComponent(megPng, s.x, s.y);
  megBoxes[s.name] = b;
  console.log(s.name, b);
}

// 3. HERCULESKABUTERIMON (499x499)
const hercPng = PNG.sync.read(fs.readFileSync('public/assets/aistudio/HerculesKabuterimon_2_89341216.png'));
console.log('=== HERCULESKABUTERIMON STRICT COMPONENTS ===');
// Genuine upright seeds:
// Row 1 Col 1: (50, 45)
// Row 4 Col 1: (50, 345)
// Row 5 Col 1: (50, 445)
// Row 5 Col 3: (240, 445)
// Row 5 Col 4: (340, 445)
// Row 5 Col 5: (440, 445)
const hercSeeds = [
  { name: 'r1_c1_stand', x: 50, y: 45 },
  { name: 'r4_c1_front', x: 50, y: 345 },
  { name: 'r5_c1_step', x: 50, y: 445 },
  { name: 'r5_c3_walk1', x: 240, y: 445 },
  { name: 'r5_c4_walk2', x: 340, y: 445 },
  { name: 'r5_c5_walk3', x: 440, y: 445 },
];
const hercBoxes = {};
for (const s of hercSeeds) {
  const b = findStrictConnectedComponent(hercPng, s.x, s.y);
  hercBoxes[s.name] = b;
  console.log(s.name, b);
}

fs.writeFileSync('public/strict_boxes.json', JSON.stringify({ motBoxes, megBoxes, hercBoxes }, null, 2));
