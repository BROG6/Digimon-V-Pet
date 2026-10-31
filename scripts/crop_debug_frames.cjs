const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const tsFilePath = path.join(__dirname, '../src/utils/newDigimonSprites.ts');
const tsContent = fs.readFileSync(tsFilePath, 'utf8');
const jsonMatch = tsContent.match(/export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ([\s\S]*?);\s*$/);
const allConfigs = JSON.parse(jsonMatch[1]);

const outDir = path.join(__dirname, '../public/debug_agumon_line');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const line = ['botamon', 'koromon', 'agumon', 'greymon', 'metalgreymon', 'wargreymon'];

for (const id of line) {
  const cfg = allConfigs[id];
  const sheetData = fs.readFileSync(path.join(__dirname, '../public', cfg.sheetPath));
  const sheetPng = PNG.sync.read(sheetData);

  for (const [action, frames] of Object.entries(cfg.frames)) {
    frames.forEach((f, idx) => {
      const cropped = new PNG({ width: f.w, height: f.h });
      for (let y = 0; y < f.h; y++) {
        for (let x = 0; x < f.w; x++) {
          const srcIdx = ((f.y + y) * sheetPng.width + (f.x + x)) * 4;
          const dstIdx = (y * f.w + x) * 4;
          cropped.data[dstIdx] = sheetPng.data[srcIdx];
          cropped.data[dstIdx + 1] = sheetPng.data[srcIdx + 1];
          cropped.data[dstIdx + 2] = sheetPng.data[srcIdx + 2];
          cropped.data[dstIdx + 3] = sheetPng.data[srcIdx + 3];
        }
      }
      const fname = `${id}_${action}_${idx}.png`;
      fs.writeFileSync(path.join(outDir, fname), PNG.sync.write(cropped));
      console.log(`Saved ${fname}: ${f.w}x${f.h} at [${f.x}, ${f.y}]`);
    });
  }
}
