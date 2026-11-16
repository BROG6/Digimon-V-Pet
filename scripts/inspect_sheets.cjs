const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const dir = path.join(__dirname, '../public/assets/aistudio');
const files = fs.readdirSync(dir).filter(f => f.startsWith('Copy_of_') && f.endsWith('.png'));

console.log(`Found ${files.length} sprite sheets`);

for (const file of files) {
  const p = path.join(dir, file);
  const data = fs.readFileSync(p);
  const png = PNG.sync.read(data);
  console.log(`${file}: ${png.width}x${png.height}`);
}
