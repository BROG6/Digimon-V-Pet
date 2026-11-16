import { SpriteFrame } from './newDigimonSprites';

export interface DissectedSprite {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dataUrl: string;
  pixelCount: number;
  aspectRatio: number;
  sheetPath: string;
  sheetWidth: number;
  sheetHeight: number;
  source: 'parsed_json' | 'island_detection' | 'config_frame';
}

// In-memory cache so images are only dissected once per session
const dissectionCache = new Map<string, DissectedSprite[]>();

// Cached parsed_sprites.json data
let parsedSpritesCache: Record<string, { width: number; height: number; sprites: Array<{ x: number; y: number; w: number; h: number; count?: number }> }> | null = null;

async function loadParsedSpritesJson(): Promise<Record<string, any>> {
  if (parsedSpritesCache) return parsedSpritesCache;
  try {
    const res = await fetch('/assets/aistudio/parsed_sprites.json');
    if (res.ok) {
      parsedSpritesCache = await res.json();
      return parsedSpritesCache || {};
    }
  } catch (err) {
    console.warn('Could not fetch parsed_sprites.json, relying on canvas auto-dissection:', err);
  }
  parsedSpritesCache = {};
  return parsedSpritesCache;
}

/**
 * Checks if two bounding boxes significantly overlap (Intersection over Union)
 */
function computeIoU(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);

  if (x2 <= x1 || y2 <= y1) return 0;

  const intersection = (x2 - x1) * (y2 - y1);
  const areaA = a.w * a.h;
  const areaB = b.w * b.h;
  const union = areaA + areaB - intersection;

  return union > 0 ? intersection / union : 0;
}

/**
 * Dissects a spritesheet into individual isolated sprite images and bounding boxes
 */
export async function dissectSpritesheet(
  sheetPath: string,
  knownFrames?: SpriteFrame[]
): Promise<DissectedSprite[]> {
  const cacheKey = sheetPath;
  if (dissectionCache.has(cacheKey)) {
    return dissectionCache.get(cacheKey)!;
  }

  // 1. Load the spritesheet image onto an HTML5 canvas
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = (e) => reject(new Error(`Failed to load spritesheet at ${sheetPath}`));
    el.src = sheetPath;
  });

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, width, height);
  const { data } = imgData;

  // 2. Background color & alpha detection
  // Check 4 corners
  const samplePixel = (px: number, py: number) => {
    const idx = (py * width + px) * 4;
    return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
  };

  const corners = [
    samplePixel(0, 0),
    samplePixel(Math.max(0, width - 1), 0),
    samplePixel(0, Math.max(0, height - 1)),
    samplePixel(Math.max(0, width - 1), Math.max(0, height - 1)),
  ];

  const hasTransparentCorner = corners.some((c) => c.a < 30);
  const isTransparentBackground = hasTransparentCorner;

  // If solid background, determine dominant corner color
  const bgR = Math.round(corners.reduce((sum, c) => sum + c.r, 0) / corners.length);
  const bgG = Math.round(corners.reduce((sum, c) => sum + c.g, 0) / corners.length);
  const bgB = Math.round(corners.reduce((sum, c) => sum + c.b, 0) / corners.length);

  const isForeground = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * 4;
    const a = data[idx + 3];
    if (a < 30) return false;

    if (!isTransparentBackground) {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const colorDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      return colorDiff > 32;
    }
    return true;
  };

  // 3. Fast Binning & Island Detection using a 2x2 block grid
  const blockSize = 2;
  const gridW = Math.ceil(width / blockSize);
  const gridH = Math.ceil(height / blockSize);
  const grid = new Uint8Array(gridW * gridH);

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const startX = gx * blockSize;
      const startY = gy * blockSize;
      let hasFg = false;
      for (let dy = 0; dy < blockSize && !hasFg; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          if (isForeground(startX + dx, startY + dy)) {
            hasFg = true;
            break;
          }
        }
      }
      if (hasFg) {
        grid[gy * gridW + gx] = 1;
      }
    }
  }

  // Dilation (1 block = 2px neighborhood expansion to merge disjoint limbs/wings/tails)
  const dilatedGrid = new Uint8Array(gridW * gridH);
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      if (grid[gy * gridW + gx] === 1) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = gy + dy;
            const nx = gx + dx;
            if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) {
              dilatedGrid[ny * gridW + nx] = 1;
            }
          }
        }
      }
    }
  }

  // Connected Components Labeling (BFS)
  const visited = new Uint8Array(gridW * gridH);
  interface RawBox {
    x: number;
    y: number;
    w: number;
    h: number;
    pixelCount: number;
    source: 'parsed_json' | 'island_detection' | 'config_frame';
  }
  const detectedBoxes: RawBox[] = [];

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const idx = gy * gridW + gx;
      if (dilatedGrid[idx] === 1 && visited[idx] === 0) {
        // Run BFS
        let minGx = gx;
        let maxGx = gx;
        let minGy = gy;
        let maxGy = gy;
        const queue: number[] = [idx];
        visited[idx] = 1;

        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          const cy = Math.floor(curr / gridW);
          const cx = curr % gridW;

          if (cx < minGx) minGx = cx;
          if (cx > maxGx) maxGx = cx;
          if (cy < minGy) minGy = cy;
          if (cy > maxGy) maxGy = cy;

          // 4-way neighbors
          const neighbors = [
            cy > 0 ? (cy - 1) * gridW + cx : -1,
            cy < gridH - 1 ? (cy + 1) * gridW + cx : -1,
            cx > 0 ? cy * gridW + (cx - 1) : -1,
            cx < gridW - 1 ? cy * gridW + (cx + 1) : -1,
          ];

          for (const n of neighbors) {
            if (n >= 0 && dilatedGrid[n] === 1 && visited[n] === 0) {
              visited[n] = 1;
              queue.push(n);
            }
          }
        }

        // Convert grid bounds back to pixel coordinates and find exact tight pixel bounds
        const rawMinX = Math.max(0, minGx * blockSize);
        const rawMaxX = Math.min(width - 1, (maxGx + 1) * blockSize - 1);
        const rawMinY = Math.max(0, minGy * blockSize);
        const rawMaxY = Math.min(height - 1, (maxGy + 1) * blockSize - 1);

        let tightMinX = rawMaxX;
        let tightMaxX = rawMinX;
        let tightMinY = rawMaxY;
        let tightMaxY = rawMinY;
        let pixelCount = 0;

        for (let py = rawMinY; py <= rawMaxY; py++) {
          for (let px = rawMinX; px <= rawMaxX; px++) {
            if (isForeground(px, py)) {
              pixelCount++;
              if (px < tightMinX) tightMinX = px;
              if (px > tightMaxX) tightMaxX = px;
              if (py < tightMinY) tightMinY = py;
              if (py > tightMaxY) tightMaxY = py;
            }
          }
        }

        if (pixelCount >= 25) {
          const boxW = tightMaxX - tightMinX + 1;
          const boxH = tightMaxY - tightMinY + 1;

          // Ignore single stray line borders or outer boundary frames
          if (boxW >= 12 && boxH >= 12 && boxW < width * 0.95 && boxH < height * 0.95) {
            // Check if this box is very wide or very tall and can be split on zero-projection gaps
            // For example, if two separate sprites are standing side by side
            const subBoxes = splitCompositeBox(tightMinX, tightMinY, boxW, boxH, isForeground);
            for (const sb of subBoxes) {
              detectedBoxes.push({
                x: sb.x,
                y: sb.y,
                w: sb.w,
                h: sb.h,
                pixelCount: sb.pixelCount,
                source: 'island_detection',
              });
            }
          }
        }
      }
    }
  }

  // 4. Also incorporate parsed_sprites.json frames for this sheet
  const parsedMap = await loadParsedSpritesJson();
  const filename = sheetPath.split('/').pop() || '';
  if (parsedMap && parsedMap[filename]?.sprites) {
    for (const s of parsedMap[filename].sprites) {
      if (s.w >= 14 && s.h >= 14 && s.w < width * 0.95 && s.h < height * 0.95) {
        // Tighten bounding box
        const tightened = tightenBox(s.x, s.y, s.w, s.h, width, height, isForeground);
        if (tightened && tightened.pixelCount > 20) {
          detectedBoxes.push({
            x: tightened.x,
            y: tightened.y,
            w: tightened.w,
            h: tightened.h,
            pixelCount: tightened.pixelCount,
            source: 'parsed_json',
          });
        }
      }
    }
  }

  // 5. Also incorporate any known frames passed in
  if (knownFrames && knownFrames.length > 0) {
    for (const kf of knownFrames) {
      if (!kf.sheetPath || kf.sheetPath === sheetPath) {
        const tightened = tightenBox(kf.x, kf.y, kf.w, kf.h, width, height, isForeground);
        if (tightened && tightened.pixelCount > 15) {
          detectedBoxes.push({
            x: tightened.x,
            y: tightened.y,
            w: tightened.w,
            h: tightened.h,
            pixelCount: tightened.pixelCount,
            source: 'config_frame',
          });
        }
      }
    }
  }

  // 6. Deduplicate overlapping boxes
  const uniqueBoxes: RawBox[] = [];
  // Sort by pixel count descending so best/most comprehensive frames take precedence
  const sortedCandidates = [...detectedBoxes].sort((a, b) => b.pixelCount - a.pixelCount);

  for (const cand of sortedCandidates) {
    const isDuplicate = uniqueBoxes.some((existing) => computeIoU(cand, existing) > 0.55);
    if (!isDuplicate) {
      uniqueBoxes.push(cand);
    }
  }

  // 7. Sort in natural visual reading order: row by row, left to right
  uniqueBoxes.sort((a, b) => {
    // Group into vertical bands of ~35px
    const bandA = Math.floor((a.y + a.h / 2) / 35);
    const bandB = Math.floor((b.y + b.h / 2) / 35);
    if (bandA !== bandB) return bandA - bandB;
    return a.x - b.x;
  });

  // 8. Generate standalone isolated crop PNG dataURLs with 2px transparent padding
  const dissectedSprites: DissectedSprite[] = [];
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');

  for (let i = 0; i < uniqueBoxes.length; i++) {
    const box = uniqueBoxes[i];
    const pad = 2;
    const cropW = box.w + pad * 2;
    const cropH = box.h + pad * 2;

    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    let dataUrl = '';

    if (cropCtx) {
      cropCtx.clearRect(0, 0, cropW, cropH);
      cropCtx.imageSmoothingEnabled = false;
      cropCtx.drawImage(
        canvas,
        box.x,
        box.y,
        box.w,
        box.h,
        pad,
        pad,
        box.w,
        box.h
      );
      dataUrl = cropCanvas.toDataURL('image/png');
    }

    dissectedSprites.push({
      id: `slice-${i + 1}`,
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
      dataUrl,
      pixelCount: box.pixelCount,
      aspectRatio: box.w / Math.max(1, box.h),
      sheetPath,
      sheetWidth: width,
      sheetHeight: height,
      source: box.source,
    });
  }

  dissectionCache.set(cacheKey, dissectedSprites);
  return dissectedSprites;
}

/**
 * Tightens a bounding box to its actual foreground pixels
 */
function tightenBox(
  bx: number,
  by: number,
  bw: number,
  bh: number,
  sheetW: number,
  sheetH: number,
  isFg: (x: number, y: number) => boolean
): { x: number; y: number; w: number; h: number; pixelCount: number } | null {
  const startX = Math.max(0, bx);
  const endX = Math.min(sheetW - 1, bx + bw - 1);
  const startY = Math.max(0, by);
  const endY = Math.min(sheetH - 1, by + bh - 1);

  let minX = endX;
  let maxX = startX;
  let minY = endY;
  let maxY = startY;
  let pixelCount = 0;

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      if (isFg(x, y)) {
        pixelCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (pixelCount < 10) return null;
  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    pixelCount,
  };
}

/**
 * Checks for zero-projection columns/rows to split compound multi-sprite boxes
 */
function splitCompositeBox(
  bx: number,
  by: number,
  bw: number,
  bh: number,
  isFg: (x: number, y: number) => boolean
): Array<{ x: number; y: number; w: number; h: number; pixelCount: number }> {
  // If box width is > 1.8x height and > 70px, test vertical projection profile
  if (bw > 70 && bw > bh * 1.5) {
    const colCounts = new Int32Array(bw);
    for (let x = 0; x < bw; x++) {
      for (let y = 0; y < bh; y++) {
        if (isFg(bx + x, by + y)) {
          colCounts[x]++;
        }
      }
    }

    // Find gaps of >= 2 consecutive columns with 0 foreground pixels
    const splits: number[] = [0];
    let inGap = false;
    for (let x = 0; x < bw; x++) {
      if (colCounts[x] === 0) {
        if (!inGap) {
          splits.push(x);
          inGap = true;
        }
      } else {
        if (inGap) {
          splits.push(x);
          inGap = false;
        }
      }
    }
    splits.push(bw);

    if (splits.length > 3) {
      const results: Array<{ x: number; y: number; w: number; h: number; pixelCount: number }> = [];
      for (let s = 0; s < splits.length - 1; s += 2) {
        const segStart = splits[s];
        const segEnd = splits[s + 1] || bw;
        const segW = segEnd - segStart;
        if (segW >= 14) {
          const sub = tightenBox(bx + segStart, by, segW, bh, 2048, 2048, isFg);
          if (sub && sub.pixelCount >= 25 && sub.w >= 12 && sub.h >= 12) {
            results.push(sub);
          }
        }
      }
      if (results.length > 1) {
        return results;
      }
    }
  }

  // Default: single box
  let count = 0;
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      if (isFg(bx + x, by + y)) count++;
    }
  }
  return [{ x: bx, y: by, w: bw, h: bh, pixelCount: count }];
}
