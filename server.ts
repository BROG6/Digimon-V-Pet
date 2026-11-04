import express from 'express';
import http from 'http';
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
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '50mb' }));

  // API: Get current app version manifest for auto-updater
  app.get('/api/app-version', (_req, res) => {
    try {
      const versionFile = path.join(__dirname, 'public', 'version.json');
      if (fs.existsSync(versionFile)) {
        const content = fs.readFileSync(versionFile, 'utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.json(JSON.parse(content));
      }
      return res.json({
        versionName: '1.1.0',
        versionCode: 2,
        releaseDate: '2026-11-04',
        changelog: ['Companion Roaming and Auto-Updater update']
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

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

      // 2. Update NEW_DIGIMON_SPRITES in newDigimonSprites.ts so git commits and exports contain the fixed states
      let codeUpdated = false;
      if (mergeIntoCodebase !== false && fs.existsSync(SPRITES_TS_FILE)) {
        try {
          const tsCode = fs.readFileSync(SPRITES_TS_FILE, 'utf-8');
          const prefix = 'export const NEW_DIGIMON_SPRITES: Record<string, DigimonSpriteConfig> = ';
          const startIndex = tsCode.indexOf(prefix);
          if (startIndex !== -1) {
            const jsonStart = startIndex + prefix.length;
            const lastBraceIndex = tsCode.lastIndexOf('}');
            if (lastBraceIndex > jsonStart) {
              const jsonStr = tsCode.substring(jsonStart, lastBraceIndex + 1);
              const existingSprites = JSON.parse(jsonStr);
              for (const [speciesId, customConfig] of Object.entries(mergedOverrides)) {
                existingSprites[speciesId] = customConfig;
              }
              const updatedSection = `${prefix}${JSON.stringify(existingSprites, null, 2)};\n`;
              const newTsCode = tsCode.substring(0, startIndex) + updatedSection;
              fs.writeFileSync(SPRITES_TS_FILE, newTsCode, 'utf-8');
              codeUpdated = true;
              console.log(`[Sync] Successfully updated ${Object.keys(mergedOverrides).length} species directly inside newDigimonSprites.ts master record.`);
            }
          }
        } catch (e) {
          console.error('[Sync] Error updating newDigimonSprites.ts:', e);
        }
      }

      console.log(`[Sync] Successfully saved ${Object.keys(mergedOverrides).length} sprite definitions to disk (codeUpdated: ${codeUpdated}).`);
      return res.json({
        success: true,
        count: Object.keys(mergedOverrides).length,
        savedToFile: true,
        codeUpdated,
      });
    } catch (err: any) {
      console.error('[Sync] Failed to save sprite definitions:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Setup Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Explicitly transform index.html per @vitejs/plugin-react SSR/custom server instructions
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.includes('.')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
