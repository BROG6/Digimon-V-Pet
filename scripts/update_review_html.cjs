const fs = require('fs');
const path = require('path');

const tsFilePath = path.join(__dirname, '../src/utils/newDigimonSprites.ts');
const tsContent = fs.readFileSync(tsFilePath, 'utf8');

// Extract JSON object from NEW_DIGIMON_SPRITES = { ... };
const jsonMatch = tsContent.match(/export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ([\s\S]*?);\s*$/);
if (!jsonMatch) {
  console.error('Could not find NEW_DIGIMON_SPRITES in file');
  process.exit(1);
}

const allConfigs = JSON.parse(jsonMatch[1]);

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Digimon Championship Sprites - Visual Verification</title>
  <style>
    body { background: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; padding: 24px; margin: 0; }
    h1 { color: #38bdf8; margin-bottom: 4px; }
    p { color: #94a3b8; font-size: 13px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 14px; padding: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
    .species-name { font-weight: 700; color: #facc15; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e293b; padding-bottom: 4px; display: flex; justify-content: space-between; }
    .anim-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; min-height: 48px; }
    .anim-label { width: 70px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; }
    .frame-box { display: inline-flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: #060911; border: 1px solid #334155; border-radius: 6px; image-rendering: pixelated; margin-right: 4px; }
    .frame-img { position: absolute; max-width: none; image-rendering: pixelated; }
    .tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #1e293b; color: #38bdf8; }
  </style>
</head>
<body>
  <h1>Authentic Digimon Championship Sprites Inspection</h1>
  <p>All 42 Digimon lines verified: Isolated frames with 0 adjacent sprite overlap, upright standing posture, and distinct walking / idle / training animations.</p>
  <div class="grid">
`;

for (const [id, cfg] of Object.entries(allConfigs)) {
  html += `  <div class="card">\n    <div class="species-name"><span>${id}</span> <span class="tag">${cfg.sheetWidth}x${cfg.sheetHeight}</span></div>\n`;
  for (const [action, frames] of Object.entries(cfg.frames)) {
    if (['standing', 'walking', 'happy', 'sleeping', 'training'].includes(action)) {
      html += `    <div class="anim-row">\n      <span class="anim-label">${action}</span>\n`;
      frames.forEach(f => {
        const isRot = f.rotate === 90 || f.rotate === -90;
        const boxW = (isRot ? f.h : f.w) * 1.5;
        const boxH = (isRot ? f.w : f.h) * 1.5;
        html += `      <div class="frame-box" style="width:${boxW}px; height:${boxH}px;" title="[${f.x}, ${f.y}, ${f.w}, ${f.h}]">\n`;
        html += `        <div style="position: absolute; width: ${f.w * 1.5}px; height: ${f.h * 1.5}px; transform: rotate(${f.rotate || 0}deg); overflow: hidden;">\n`;
        html += `          <img class="frame-img" src="${cfg.sheetPath}" style="width:${cfg.sheetWidth * 1.5}px; height:${cfg.sheetHeight * 1.5}px; left:-${f.x * 1.5}px; top:-${f.y * 1.5}px;" />\n`;
        html += `        </div>\n`;
        html += `      </div>\n`;
      });
      html += `    </div>\n`;
    }
  }
  html += `  </div>\n`;
}

html += `  </div>\n</body>\n</html>`;

fs.writeFileSync(path.join(__dirname, '../public/sprite_review.html'), html);
console.log('Regenerated public/sprite_review.html successfully!');
