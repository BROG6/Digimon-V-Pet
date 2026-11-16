const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const tsFilePath = path.join(__dirname, '../src/utils/newDigimonSprites.ts');
const tsContent = fs.readFileSync(tsFilePath, 'utf8');
const jsonMatch = tsContent.match(/export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ([\s\S]*?);\s*$/);
const allConfigs = JSON.parse(jsonMatch[1]);

console.log('Checking all 42 species for suspicious standing frames...');
for (const [id, cfg] of Object.entries(allConfigs)) {
  const f0 = cfg.frames.standing[0];
  if (!f0) continue;
  // If w < 30 and h > 50 or aspect ratio > 1.8 for non-tall digimon
  const ar = f0.h / f0.w;
  console.log(`${id.padEnd(16)}: standing[0] = [x=${f0.x}, y=${f0.y}, w=${f0.w}, h=${f0.h}] AR=${ar.toFixed(2)}`);
}
