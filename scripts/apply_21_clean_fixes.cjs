const fs = require('fs');
const path = require('path');

const cleanData = JSON.parse(fs.readFileSync('public/clean_frames_output.json', 'utf8'));
const filePath = 'src/utils/newDigimonSprites.ts';
let content = fs.readFileSync(filePath, 'utf8');

for (const [id, cfg] of Object.entries(cleanData)) {
  const fullConfig = {
    sheetPath: cfg.sheetPath,
    sheetWidth: cfg.sheetWidth,
    sheetHeight: cfg.sheetHeight,
    frames: {
      standing: cfg.standing,
      walking: cfg.walking,
      happy: cfg.happy,
      eating: cfg.happy || cfg.standing,
      sleeping: cfg.sleeping,
      training: cfg.training,
      sick: cfg.sleeping,
      sitting: cfg.standing,
    }
  };

  const formattedJson = JSON.stringify(fullConfig, null, 2)
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : '    ' + line))
    .join('\n');

  // Match the block for "id": { ... }
  const regex = new RegExp('\"' + id + '\":\\s*\\{[\\s\\S]*?\\n\\s*\\}(?=\\s*,|\\s*\\n\\};)', 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `"${id}": ${formattedJson}`);
    console.log(`Updated ${id}`);
  } else {
    console.warn(`Could not find regex for ${id}`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated all 21 species in src/utils/newDigimonSprites.ts');
