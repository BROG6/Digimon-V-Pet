const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PNG } = require('pngjs');

const SRC_ROOT = '/tmp/orig_digidestined';
const OUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'digidestined');
const MASTER_TS = path.join(__dirname, '..', 'src', 'utils', 'newDigimonSprites.ts');
const OVERRIDES_JSON = path.join(__dirname, '..', 'src', 'utils', 'savedSpriteOverrides.json');

fs.mkdirSync(OUT_DIR, { recursive: true });

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function getBboxAndCount(png, clampMaxX = png.width - 1) {
  let minX = png.width, minY = png.height, maxX = -1, maxY = -1, count = 0, maxA = 0;
  const limitX = Math.min(png.width - 1, clampMaxX);
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x <= limitX; x++) {
      const a = png.data[(y * png.width + x) * 4 + 3];
      if (a > 8) {
        count++;
        if (a > maxA) maxA = a;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || count < 10 || (maxY - minY + 1) < 3) return null;
  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    maxX,
    maxY,
    count,
    maxA,
  };
}

function cropAndHash(png, bbox) {
  const buf = Buffer.alloc(bbox.w * bbox.h * 4);
  for (let row = 0; row < bbox.h; row++) {
    const srcStart = ((bbox.y + row) * png.width + bbox.x) * 4;
    const dstStart = row * bbox.w * 4;
    png.data.copy(buf, dstStart, srcStart, srcStart + bbox.w * 4);
  }
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  return {
    x: bbox.x,
    y: bbox.y,
    w: bbox.w,
    h: bbox.h,
    maxX: bbox.maxX,
    maxY: bbox.maxY,
    maxA: bbox.maxA,
    buf,
    hash,
  };
}

// Pack unique tiles onto a compact PNG atlas using shelf packing
function packAtlas(tiles) {
  const pad = 2;
  const totalArea = tiles.reduce((s, t) => s + (t.w + pad) * (t.h + pad), 0);
  const maxTileW = Math.max(...tiles.map((t) => t.w + pad));
  const targetWidth = Math.max(maxTileW + pad, Math.min(1024, Math.ceil(Math.sqrt(totalArea * 1.25))));

  // Sort tallest first for tight shelf packing
  const indexed = tiles.map((t, idx) => ({ t, idx })).sort((a, b) => b.t.h - a.t.h || b.t.w - a.t.w);

  const placements = new Array(tiles.length);
  let curX = pad;
  let curY = pad;
  let rowH = 0;
  let actualW = 0;

  for (const item of indexed) {
    const { t, idx } = item;
    if (curX + t.w + pad > targetWidth) {
      curX = pad;
      curY += rowH + pad;
      rowH = 0;
    }
    placements[idx] = { x: curX, y: curY, w: t.w, h: t.h };
    actualW = Math.max(actualW, curX + t.w + pad);
    rowH = Math.max(rowH, t.h);
    curX += t.w + pad;
  }

  const sheetW = actualW;
  const sheetH = curY + rowH + pad;
  const atlas = new PNG({ width: sheetW, height: sheetH, fill: true });
  atlas.data.fill(0);

  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    const p = placements[i];
    for (let row = 0; row < t.h; row++) {
      const srcStart = row * t.w * 4;
      const dstStart = ((p.y + row) * sheetW + p.x) * 4;
      t.buf.copy(atlas.data, dstStart, srcStart, srcStart + t.w * 4);
    }
  }

  return {
    pngBuffer: PNG.sync.write(atlas, { colorType: 6 }),
    sheetW,
    sheetH,
    placements,
  };
}

function numericFrameSort(a, b) {
  const na = parseInt((a.match(/\d+/) || ['0'])[0], 10);
  const nb = parseInt((b.match(/\d+/) || ['0'])[0], 10);
  return na !== nb ? na - nb : a.localeCompare(b);
}

function loadAnimFrames(dirPath, options = {}) {
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.png')).sort(numericFrameSort);
  const frames = [];
  for (const f of files) {
    const png = readPng(path.join(dirPath, f));
    let bbox = getBboxAndCount(png);
    if (!bbox) continue;

    // Clamp extreme beam projectiles so atlas & UI stay compact while preserving body + close burst
    if (options.maxAttackRightX && bbox.maxX > options.maxAttackRightX) {
      const trimmed = getBboxAndCount(png, options.maxAttackRightX);
      if (trimmed) bbox = trimmed;
    }

    const cropped = cropAndHash(png, bbox);
    frames.push({ ...cropped, file: f });
  }
  return frames;
}

const masterSprites = {};
let totalOutBytes = 0;
const processedMons = [];

const tamers = fs.readdirSync(SRC_ROOT).sort();
for (const tamer of tamers) {
  const tamerDir = path.join(SRC_ROOT, tamer);
  if (!fs.statSync(tamerDir).isDirectory()) continue;
  const mons = fs.readdirSync(tamerDir).sort();

  for (const mon of mons) {
    const monDir = path.join(tamerDir, mon);
    if (!fs.statSync(monDir).isDirectory()) continue;
    const speciesId = mon.toLowerCase().replace(/[^a-z0-9]/g, '');

    const idleRaw = loadAnimFrames(path.join(monDir, 'idle'));
    if (!idleRaw.length) {
      console.warn(`Skipping ${speciesId}: no idle frames`);
      continue;
    }

    // Shared origin & reference stage box based on idle union bounds:
    // "All frames of one Digimon are the same size and share one origin, so stack them without moving them."
    const anchorX0 = Math.min(...idleRaw.map((f) => f.x));
    const anchorY0 = Math.min(...idleRaw.map((f) => f.y));
    const anchorX1 = Math.max(...idleRaw.map((f) => f.maxX));
    const anchorY1 = Math.max(...idleRaw.map((f) => f.maxY));
    const stageWidth = anchorX1 - anchorX0 + 1;
    const stageHeight = anchorY1 - anchorY0 + 1;
    const maxAttackRightX = anchorX1 + Math.max(140, Math.round(stageWidth * 1.4));

    const walkRaw = loadAnimFrames(path.join(monDir, 'walking'));
    const attackRaw = loadAnimFrames(path.join(monDir, 'attack'), { maxAttackRightX });
    const faintRawAll = loadAnimFrames(path.join(monDir, 'faint'));

    // Keep all fall-down frames up to the last full-opacity collapsed frame
    // (dropping only trailing KO alpha fade-out frames so sleeping/sick never fade invisible on last frame)
    let lastOpaqueIdx = -1;
    for (let i = 0; i < faintRawAll.length; i++) {
      if (faintRawAll[i].maxA >= 235) lastOpaqueIdx = i;
    }
    const faintFrames = lastOpaqueIdx >= 0 ? faintRawAll.slice(0, lastOpaqueIdx + 1) : faintRawAll;

    // Deduplicate identical cropped pixel tiles across all poses into atlas
    const uniqueTiles = [];
    const hashToTileIdx = new Map();

    function registerFrame(rawFrame) {
      let tileIdx = hashToTileIdx.get(rawFrame.hash);
      if (tileIdx === undefined) {
        tileIdx = uniqueTiles.length;
        hashToTileIdx.set(rawFrame.hash, tileIdx);
        uniqueTiles.push(rawFrame);
      }
      // Exact displacement relative to the Digimon's shared (anchorX0, anchorY0) origin
      const offsetX = rawFrame.x - anchorX0;
      const offsetY = rawFrame.y - anchorY0;
      return { tileIdx, offsetX, offsetY };
    }

    const mapped = {
      standing: idleRaw.map(registerFrame),
      walking: (walkRaw.length ? walkRaw : idleRaw).map(registerFrame),
      happy: idleRaw.map(registerFrame),
      eating: idleRaw.map(registerFrame),
      // Per instructions: sleeping and sick both use the faint animation (plays once & stays on last frame)
      sleeping: (faintFrames.length ? faintFrames : idleRaw).map(registerFrame),
      training: (attackRaw.length ? attackRaw : idleRaw).map(registerFrame),
      sick: (faintFrames.length ? faintFrames : idleRaw).map(registerFrame),
      sitting: idleRaw.map(registerFrame),
    };

    const { pngBuffer, sheetW, sheetH, placements } = packAtlas(uniqueTiles);
    const outFile = path.join(OUT_DIR, `${speciesId}.png`);
    fs.writeFileSync(outFile, pngBuffer);
    totalOutBytes += pngBuffer.length;

    function resolvePoseFrames(list) {
      return list.map(({ tileIdx, offsetX, offsetY }) => {
        const p = placements[tileIdx];
        return {
          x: p.x,
          y: p.y,
          w: p.w,
          h: p.h,
          offsetX,
          offsetY,
          rotate: 0,
        };
      });
    }

    masterSprites[speciesId] = {
      sheetPath: `/assets/digidestined/${speciesId}.png`,
      sheetWidth: sheetW,
      sheetHeight: sheetH,
      stageWidth,
      stageHeight,
      frames: {
        standing: resolvePoseFrames(mapped.standing),
        walking: resolvePoseFrames(mapped.walking),
        happy: resolvePoseFrames(mapped.happy),
        eating: resolvePoseFrames(mapped.eating),
        sleeping: resolvePoseFrames(mapped.sleeping),
        training: resolvePoseFrames(mapped.training),
        sick: resolvePoseFrames(mapped.sick),
        sitting: resolvePoseFrames(mapped.sitting),
      },
    };

    processedMons.push({
      speciesId,
      sheetW,
      sheetH,
      stageWidth,
      stageHeight,
      kb: (pngBuffer.length / 1024).toFixed(1),
      uniqueCount: uniqueTiles.length,
    });
  }
}

// Write src/utils/newDigimonSprites.ts
const tsHeader = `// Auto-generated Clean & Authentic Original Digidestined Sprite Configurations (Shared-Origin 16fps)
export interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  offsetX?: number;
  offsetY?: number;
  sheetPath?: string;
  sheetWidth?: number;
  sheetHeight?: number;
}

export interface DigimonSpriteConfig {
  sheetPath: string;
  sheetWidth: number;
  sheetHeight: number;
  stageWidth?: number;
  stageHeight?: number;
  groundOffset?: number;
  frames: {
    standing: SpriteFrame[];
    walking: SpriteFrame[];
    happy: SpriteFrame[];
    eating: SpriteFrame[];
    sleeping: SpriteFrame[];
    training: SpriteFrame[];
    sick: SpriteFrame[];
    sitting: SpriteFrame[];
  };
}

export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ${JSON.stringify(masterSprites, null, 2)};
`;

fs.writeFileSync(MASTER_TS, tsHeader, 'utf8');
fs.writeFileSync(OVERRIDES_JSON, JSON.stringify(masterSprites, null, 2), 'utf8');

console.log(`Packed ${processedMons.length} Digimon sprite sheets!`);
console.log(`Total size in public/assets/digidestined/: ${(totalOutBytes / 1024 / 1024).toFixed(2)} MB`);
for (const m of processedMons.slice(0, 12)) {
  console.log(`  ${m.speciesId.padEnd(20)} stage:${m.stageWidth}x${m.stageHeight} atlas:${m.sheetW}x${m.sheetH} (${m.kb} KB, ${m.uniqueCount} unique)`);
}
