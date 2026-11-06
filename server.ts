import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const OVERRIDES_FILE = path.join(__dirname, 'src', 'utils', 'savedSpriteOverrides.json');
const SPRITES_TS_FILE = path.join(__dirname, 'src', 'utils', 'newDigimonSprites.ts');

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '50mb' }));

  // Enable full CORS for Capacitor mobile apps and external web clients
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

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
        versionName: '1.2.0',
        versionCode: 3,
        releaseDate: '2026-11-06',
        changelog: [
          'Colosseum battle attack animations: dynamic lunges, critical hit flashes, screen shakes & floating damage numbers',
          'Floating companion overlay upgraded: 20% larger sprites, autonomous roaming & silent notification close button',
          'In-app Digi-Auto Updater engine: smart semantic version sync & one-tap direct APK installer',
        ]
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API: Download latest APK binary
  app.get('/api/download-apk', (_req, res) => {
    try {
      const candidates = [
        path.join(__dirname, 'public', 'assets', 'apk', 'digipet-latest.apk'),
        path.join(__dirname, 'public', 'digipet-latest.apk'),
        path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
        path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
      ];

      for (const apkPath of candidates) {
        if (fs.existsSync(apkPath) && fs.statSync(apkPath).size > 1000) {
          res.setHeader('Content-Type', 'application/vnd.android.package-archive');
          res.setHeader('Content-Disposition', 'attachment; filename="digipet-v1.2.0.apk"');
          return res.sendFile(apkPath);
        }
      }

      // Check if version.json defines a direct external URL
      const versionFile = path.join(__dirname, 'public', 'version.json');
      if (fs.existsSync(versionFile)) {
        try {
          const v = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
          if (v.directDownloadUrl && v.directDownloadUrl.startsWith('http')) {
            return res.redirect(v.directDownloadUrl);
          }
        } catch {}
      }

      return res.status(404).json({
        success: false,
        error: 'APK binary is not yet uploaded to the server. You can provide a direct download link in Updater settings.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
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

  // Helper for server-side Digimon dialogue fallback
  function getFallbackDialogue(speciesName: string = 'Digimon', hunger: number = 50, isSick: boolean = false, poopCount: number = 0, userMessage?: string): string {
    if (isSick) return `Achoo... I don't feel so well, Tamer! Need vitamins! 💊`;
    if (hunger < 30) return `My stomach is roaring loudly! Big Meat please! 🍖`;
    if (poopCount > 0) return `Uh oh... I made a mess on the screen! Flush please! 💩`;
    if (userMessage) return `I hear you, Tamer! Together we can achieve anything! ✨`;
    const quotes = [
      `Keeping watch over your screen! No wild Digimon getting past me! 🛡️`,
      `File Island breeze feels great today! Ready to train! 🥊`,
      `Tamer, let's explore and reach Mega digivolution! 🔥`,
      `Your screen is so bright and fun to roam around on! 🐾`,
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // API: AI-Powered Digimon Personality & Dialogue
  app.post('/api/digimon/talk', async (req, res) => {
    try {
      const {
        speciesName = 'Agumon',
        stage = 'Rookie',
        hunger = 50,
        happiness = 80,
        energy = 80,
        isSick = false,
        poopCount = 0,
        userMessage,
        actionContext,
      } = req.body || {};

      if (!ai) {
        return res.json({
          success: true,
          text: getFallbackDialogue(speciesName, hunger, isSick, poopCount, userMessage),
          source: 'local_personality',
        });
      }

      const systemInstruction = `You are ${speciesName}, an authentic Digimon virtual pet living with your human Tamer on their device screen.
Your stage is ${stage}.
Current status:
- Hunger: ${hunger}/100 (lower means starving)
- Happiness: ${happiness}/100
- Energy: ${energy}/100
- Sick: ${isSick ? 'YES (feeling weak)' : 'No'}
- Poop around: ${poopCount > 0 ? 'YES' : 'No'}
${actionContext ? `Current context: ${actionContext}` : ''}

PERSONALITY GUIDELINES:
- Stay 100% in character as ${speciesName} from Digimon lore.
- For Agumon: energetic, brave, loves meat, loyal, says "Taichi!" or calls the human "Tamer".
- For Gabumon: slightly shy, sweet, caring, warm fur pelt, deeply devoted.
- For Patamon: cute, fluffy, hopeful, flaps ears, Boom Bubble, sweet baby hero.
- For Palmon: spunky, loves plants/flowers, chic, Poison Ivy.
- For Tentomon: polite Kansai intellect, analyzes stats, tech-savvy, Super Shocker.
- For Gomamon: playful prankster, water-loving, reliable buddy, Marching Fishes.
- For Veemon: bold, energetic brawler, "Digi-Armor Energize!", loves fighting.
- For Guilmon: child-like dino, curious, loves bread/meat, "Takato-mon!", cute growls.
- For Renamon: stoic ninja, disciplined, sharp instincts, Diamond Storm.

RULES:
- KEEP IT SHORT: Exactly 1 to 2 short sentences (MAXIMUM 18 words). It must fit inside a floating comic speech bubble over the Digimon's head!
- Use 1-2 expressive emojis (🍖, 🔥, ⚡, 🐾, 💖, 🛡️, etc.).
- Never say you are an AI, a language model, or break character. You ARE ${speciesName}.`;

      const userPrompt = userMessage
        ? `The Tamer says to you: "${userMessage}". Respond directly to them in character!`
        : `Give a brief, spontaneous remark to your Tamer as you roam on their screen.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
        },
      });

      const generatedText = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : '';
      if (generatedText) {
        return res.json({
          success: true,
          text: generatedText,
          source: 'gemini_3.8_flash',
        });
      }

      return res.json({
        success: true,
        text: getFallbackDialogue(speciesName, hunger, isSick, poopCount, userMessage),
        source: 'local_personality_fallback',
      });
    } catch (err: any) {
      console.warn('Gemini dialogue generation error:', err);
      return res.json({
        success: true,
        text: getFallbackDialogue(req.body?.speciesName, req.body?.hunger, req.body?.isSick, req.body?.poopCount, req.body?.userMessage),
        source: 'local_personality_error_fallback',
      });
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
