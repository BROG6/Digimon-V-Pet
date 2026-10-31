import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const OVERRIDES_FILE = path.join(__dirname, 'src', 'utils', 'savedSpriteOverrides.json');
const SPRITES_TS_FILE = path.join(__dirname, 'src', 'utils', 'newDigimonSprites.ts');

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // API: Get current saved sprite overrides from disk
  app.get('/api/sprite-overrides', (_req, res) => {
    try {
      if (fs.existsSync(OVERRIDES_FILE)) {
        const content = fs.readFileSync(OVERRIDES_FILE, 'utf-8');
        return res.json({ success: true, overrides: JSON.parse(content || '{}') });
      }
      return res.json({ success: true, overrides: {} });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: Save sprite overrides directly to disk in src/utils/savedSpriteOverrides.json
  // AND optionally merge them into newDigimonSprites.ts so that git commits and exports contain the fixed states
  app.post('/api/sync-sprite-overrides', (req, res) => {
    try {
      const { overrides, mergeIntoCodebase } = req.body;
      if (!overrides || typeof overrides !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid overrides payload' });
      }

      // 1. Read existing saved overrides, merge with new overrides
      let currentOverrides: Record<string, any> = {};
      if (fs.existsSync(OVERRIDES_FILE)) {
        try {
          const raw = fs.readFileSync(OVERRIDES_FILE, 'utf-8');
          currentOverrides = JSON.parse(raw || '{}');
        } catch {
          currentOverrides = {};
        }
      }

      const mergedOverrides = { ...currentOverrides, ...overrides };
      fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(mergedOverrides, null, 2), 'utf-8');

      // 2. If mergeIntoCodebase is requested, also update NEW_DIGIMON_SPRITES in newDigimonSprites.ts!
      let codeUpdated = false;
      if (mergeIntoCodebase && fs.existsSync(SPRITES_TS_FILE)) {
        try {
          let tsCode = fs.readFileSync(SPRITES_TS_FILE, 'utf-8');
          const regex = /export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = (\{[\s\S]*?\});?\s*$/;
          const match = tsCode.match(regex);
          if (match) {
            const existingSprites = JSON.parse(match[1]);
            for (const [speciesId, customConfig] of Object.entries(mergedOverrides)) {
              existingSprites[speciesId] = customConfig;
            }
            const updatedSection = `export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ${JSON.stringify(existingSprites, null, 2)};\n`;
            tsCode = tsCode.replace(regex, updatedSection);
            fs.writeFileSync(SPRITES_TS_FILE, tsCode, 'utf-8');
            codeUpdated = true;
          }
        } catch (e) {
          console.error('[Sync] Error updating newDigimonSprites.ts:', e);
        }
      }

      console.log(`[Sync] Successfully saved ${Object.keys(mergedOverrides).length} sprite overrides to disk.`);
      return res.json({
        success: true,
        count: Object.keys(mergedOverrides).length,
        savedToFile: true,
        codeUpdated,
      });
    } catch (err: any) {
      console.error('[Sync] Failed to save sprite overrides:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Setup Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
