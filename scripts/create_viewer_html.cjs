const fs = require('fs');
const blobData = JSON.parse(fs.readFileSync('public/blob_analysis.json', 'utf8'));

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Digimon Sprite Box Viewer</title>
  <style>
    body { background: #0a0f1d; color: #fff; font-family: -apple-system, monospace; margin: 0; padding: 20px; }
    h1 { color: #38bdf8; }
    .species-block { margin-bottom: 50px; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; }
    .species-title { font-size: 20px; font-weight: bold; color: #facc15; margin-bottom: 12px; text-transform: uppercase; }
    .layout { display: flex; gap: 24px; flex-wrap: wrap; }
    .sheet-container { position: relative; display: inline-block; border: 2px solid #334155; background: #000; image-rendering: pixelated; }
    .sheet-img { display: block; image-rendering: pixelated; }
    .bbox { position: absolute; border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.15); font-size: 10px; color: #fff; pointer-events: none; }
    .bbox-num { position: absolute; top: -14px; left: 0; background: #ef4444; color: #000; font-weight: bold; font-size: 9px; padding: 1px 3px; border-radius: 2px; }
    .crops-container { flex: 1; min-width: 320px; display: flex; flex-wrap: wrap; gap: 12px; max-height: 600px; overflow-y: auto; padding: 10px; background: #0b0f19; border-radius: 8px; }
    .crop-card { background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px; text-align: center; }
    .crop-preview { position: relative; overflow: hidden; background: #000; display: inline-block; image-rendering: pixelated; }
    .crop-preview img { position: absolute; max-width: none; image-rendering: pixelated; }
    .crop-info { font-size: 10px; color: #94a3b8; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Digimon Sprite Inspector & Box Locator</h1>
`;

for (const [id, data] of Object.entries(blobData)) {
  html += `
  <div class="species-block" id="${id}">
    <div class="species-title">${id} (${data.width}x${data.height}) - ${data.boxes.length} boxes found</div>
    <div class="layout">
      <div class="sheet-container" style="width: ${data.width * 2}px; height: ${data.height * 2}px;">
        <img class="sheet-img" src="${data.relPath}" style="width: ${data.width * 2}px; height: ${data.height * 2}px;" />
        ${data.boxes.map((b, idx) => `
          <div class="bbox" style="left: ${b.x * 2}px; top: ${b.y * 2}px; width: ${b.w * 2}px; height: ${b.h * 2}px;">
            <div class="bbox-num">#${idx}</div>
          </div>
        `).join('')}
      </div>
      <div class="crops-container">
        ${data.boxes.map((b, idx) => `
          <div class="crop-card">
            <div class="crop-preview" style="width: ${b.w * 2}px; height: ${b.h * 2}px;">
              <img src="${data.relPath}" style="width: ${data.width * 2}px; height: ${data.height * 2}px; left: -${b.x * 2}px; top: -${b.y * 2}px;" />
            </div>
            <div class="crop-info">
              <b>#${idx}</b> [${b.x},${b.y},${b.w},${b.h}]
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

html += `</body></html>`;
fs.writeFileSync('public/sheet_viewer.html', html);
console.log('Created public/sheet_viewer.html');
