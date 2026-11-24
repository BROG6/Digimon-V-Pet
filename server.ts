import 'dotenv/config';
import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

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

function readGradleVersion(): { versionName: string; versionCode: number } {
  try {
    const gradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');
    if (fs.existsSync(gradlePath)) {
      const content = fs.readFileSync(gradlePath, 'utf-8');
      const nameMatch = content.match(/versionName\s+["']([^"']+)["']/);
      const codeMatch = content.match(/versionCode\s+(\d+)/);
      return {
        versionName: nameMatch?.[1]?.trim() || '1.2.2',
        versionCode: codeMatch?.[1] ? parseInt(codeMatch[1], 10) : 122,
      };
    }
  } catch {}
  return { versionName: '1.2.2', versionCode: 122 };
}

  // API: Get current app version manifest for auto-updater
  app.get('/api/app-version', (_req, res) => {
    try {
      const gradleVer = readGradleVersion();
      const versionFile = path.join(__dirname, 'public', 'version.json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      if (fs.existsSync(versionFile)) {
        const content = fs.readFileSync(versionFile, 'utf-8');
        const parsed = JSON.parse(content);
        const resolvedVersionName = String(parsed.versionName || parsed.version || gradleVer.versionName).trim();
        const activeOrigin = process.env.APP_URL || 'https://ais-dev-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app';
        const resolvedApkUrl =
          typeof parsed.apkDownloadUrl === 'string' && parsed.apkDownloadUrl.includes('ais-pre-')
            ? `${activeOrigin.replace(/\/+$/, '')}/api/download-apk`
            : parsed.apkDownloadUrl;
        return res.json({
          ...parsed,
          apkDownloadUrl: resolvedApkUrl,
          versionName: resolvedVersionName,
          version: resolvedVersionName,
          versionCode: Number(parsed.versionCode) || gradleVer.versionCode,
        });
      }
      return res.json({
        versionName: gradleVer.versionName,
        version: gradleVer.versionName,
        versionCode: gradleVer.versionCode,
        releaseDate: new Date().toISOString().slice(0, 10),
        changelog: [
          'Proportional Digivice scaling preserving brick aspect ratio with wider LCD roaming',
          'Upgraded Talk to Digimon AI dialogue powered by Gemini 4 with full species lore & chat history',
          'Meat Catch mini-game: walking/idle animations, collected vitamins added to stock, apples removed',
          'Increased floating sprite sizes by 10% across overlays and Picture-in-Picture',
          'Suppressed update banner on Web builds and automated every-2nd-change GitHub releases',
        ]
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API: Download latest APK binary
  app.get('/api/download-apk', (_req, res) => {
    try {
      const gradleVer = readGradleVersion();
      const candidates = [
        path.join(__dirname, 'public', 'assets', 'apk', 'digipet-latest.apk'),
        path.join(__dirname, 'public', 'digipet-latest.apk'),
        path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
        path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
      ];

      for (const apkPath of candidates) {
        if (fs.existsSync(apkPath) && fs.statSync(apkPath).size > 1000) {
          res.setHeader('Content-Type', 'application/vnd.android.package-archive');
          res.setHeader('Content-Disposition', `attachment; filename="digipet-v${gradleVer.versionName}.apk"`);
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
              const compactEntries = Object.entries(existingSprites)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
                .join(',\n');
              const updatedSection = `${prefix}{\n${compactEntries}\n};\n`;
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

  // API: AI-Powered Digimon Personality & Dialogue
  app.post('/api/digimon/talk', async (req, res) => {
    try {
      const {
        speciesName = 'Agumon',
        stage = 'Rookie',
        attribute = 'Vaccine',
        type = 'Reptile',
        description = '',
        signatureMove = '',
        crestName = '',
        tamerName = '',
        playerName = '',
        hunger = 50,
        happiness = 80,
        energy = 80,
        strength = 50,
        weight = 20,
        isSick = false,
        poopCount = 0,
        battlesWon = 0,
        battlesTotal = 0,
        careMistakes = 0,
        userMessage,
        actionContext,
        history = [],
      } = req.body || {};

      if (!ai) {
        return res.status(503).json({
          success: false,
          error: 'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.',
        });
      }

      const cleanPlayerName = String(playerName || '').trim();

      const systemInstruction = `You are ${speciesName}, a living Digimon virtual pet companion bonded with your human partner${cleanPlayerName ? `, ${cleanPlayerName},` : ' (Tamer)'} on their device.

IDENTITY & LORE:
- Species: ${speciesName} (Stage: ${stage}, Attribute: ${attribute}, Type: ${type})
${crestName ? `- Egg / Crest Lineage: ${crestName}` : ''}
${signatureMove ? `- Signature Attack: ${signatureMove}` : ''}
${description ? `- Lore: ${description}` : ''}
${cleanPlayerName ? `- Your Human Partner's Name: ${cleanPlayerName} — IMPORTANT: Address them directly by their name "${cleanPlayerName}" warmly and naturally when talking to them!` : '- Human Partner Name: Not set yet (call them warmly "Tamer" or "partner").'}
${tamerName ? `- Egg Baby Lineage / Lore Note: ${tamerName}` : ''}

CURRENT LIVE VITALS & RECORD:
- Hunger: ${hunger}/100 (${hunger < 30 ? 'STARVING — craving Big Meat!' : hunger > 80 ? 'Full & satisfied' : 'Normal'})
- Happiness: ${happiness}/100 (${happiness > 80 ? 'Overjoyed' : happiness < 35 ? 'Lonely/grumpy' : 'Content'})
- Energy: ${energy}/100 (${energy < 25 ? 'Exhausted/sleepy' : 'Alert & active'})
- Strength: ${strength}/100 • Weight: ${weight}g
- Health: ${isSick ? 'SICK (needs Vitamins/Medicine!)' : 'Healthy'}
- Mess on screen: ${poopCount > 0 ? `${poopCount} poop(s) need flushing!` : 'Clean'}
- Colosseum Record: ${battlesWon} wins out of ${battlesTotal} battles • Care mistakes: ${careMistakes}
${actionContext ? `- Recent Event: ${actionContext}` : ''}

VOICE & ROLEPLAY GUIDELINES:
- Stay 100% in character as ${speciesName} — match your stage's maturity (Fresh/In-Training are cute, bubbly, and curious; Rookies are spunky and loyal; Champions/Ultimates/Megas sound heroic, fierce, noble, or wise depending on species).
- Specifically honor iconic Digimon personalities:
  * Botamon/Koromon/Punimon/Tsunomon/baby forms: adorable, playful, curious, bubbly noises, loves snacks and naps.
  * Agumon/Greymon/MetalGreymon/WarGreymon: brave, loyal, enthusiastic, loves Big Meat and heroic battles.
  * Gabumon/Garurumon lineage: thoughtful, protective, gentle warmth beneath a cool exterior.
  * Patamon/Angemon lineage: hopeful, earnest, cheerful, fiercely protective of peace.
  * Tentomon/Kabuterimon lineage: clever, analytical, curious about technology and battle stats.
  * Palmon/Biyomon/Gatomon/Gomamon/Veemon/Guilmon/Renamon: match their signature anime personality!
- ACTUALLY ANSWER ${cleanPlayerName || 'the Tamer'}'s question or comment directly! Don't give generic non-sequiturs. If they ask a question (e.g., about food, battles, your feelings, your attacks, advice, jokes, or real-world topics), respond thoughtfully and creatively from ${speciesName}'s perspective.
- Length: 1 to 3 concise, natural sentences (roughly 15–45 words). Punchy, expressive, and fun to read in a chat bubble.
- Use 1–2 fitting emojis.
- Never say you are an AI, chatbot, or language model.`;

      const cleanHistory = Array.isArray(history)
        ? history
            .filter(
              (m: any) =>
                m &&
                (m.role === 'user' || m.role === 'model') &&
                typeof m.text === 'string' &&
                m.text.trim().length > 0
            )
            .slice(-8)
        : [];

      const userPrompt = userMessage && String(userMessage).trim()
        ? String(userMessage).trim()
        : `Say a spontaneous, personality-filled remark to ${cleanPlayerName || 'your Tamer'} reacting to your current mood, vitals, or surroundings.`;

      const playerContextPrefix = cleanPlayerName
        ? `[Partner Name Context: The user's name is ${cleanPlayerName}. Consistently refer to and address the user by their name "${cleanPlayerName}".]\n`
        : '';

      const firstUserIndex = cleanHistory.findIndex((m) => m.role === 'user');
      const alreadyHasNameContext =
        Boolean(cleanPlayerName) &&
        ((firstUserIndex >= 0 && cleanHistory[firstUserIndex].text.includes(cleanPlayerName)) ||
          userPrompt.includes(`[From ${cleanPlayerName}]`));

      const contents = cleanHistory.length > 0
        ? [
            ...cleanHistory.map((m: { role: 'user' | 'model'; text: string }, idx: number) => ({
              role: m.role,
              parts: [
                {
                  text:
                    playerContextPrefix && !alreadyHasNameContext && idx === firstUserIndex
                      ? `${playerContextPrefix}${m.text.trim()}`
                      : m.text.trim(),
                },
              ],
            })),
            {
              role: 'user' as const,
              parts: [
                {
                  text:
                    playerContextPrefix && !alreadyHasNameContext && firstUserIndex === -1
                      ? `${playerContextPrefix}${userPrompt}`
                      : userPrompt,
                },
              ],
            },
          ]
        : `${playerContextPrefix}${userPrompt}`;

      let lastErr: any = null;
      const modelsToTry: Array<{ model: string; thinkingLevel: ThinkingLevel }> = [
        { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
        { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
      ];
      for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
        const { model: modelName, thinkingLevel } = modelsToTry[attempt];
        try {
          const response = await Promise.race([
            ai.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction,
                thinkingConfig: {
                  thinkingLevel,
                },
              },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Gemini API request timed out after 15s (${modelName})`)), 15000)
            ),
          ]);

          const generatedText = response.text
            ? response.text.trim().replace(/^["']|["']$/g, '')
            : '';

          if (generatedText) {
            return res.json({
              success: true,
              text: generatedText,
              source: modelName,
            });
          }
          break;
        } catch (err: any) {
          lastErr = err;
          const status = err?.status || err?.code;
          const msg = String(err?.message || '');
          const isTransient =
            status === 400 ||
            status === 404 ||
            status === 429 ||
            status === 503 ||
            status === 500 ||
            msg.includes('400') ||
            msg.includes('404') ||
            msg.includes('NOT_FOUND') ||
            msg.includes('not found') ||
            msg.includes('no longer available') ||
            msg.includes('503') ||
            msg.includes('UNAVAILABLE') ||
            msg.includes('429') ||
            msg.includes('timed out');
          if (attempt < modelsToTry.length - 1 && isTransient) {
            await new Promise((r) => setTimeout(r, 250));
            continue;
          }
          break;
        }
      }

      console.warn('Gemini dialogue generation error:', lastErr);
      let cleanMsg = lastErr?.message || 'Unable to generate Digimon response right now.';
      try {
        const parsed = JSON.parse(cleanMsg);
        if (parsed?.error?.message) cleanMsg = parsed.error.message;
      } catch {}
      const errStatus = typeof lastErr?.status === 'number' ? lastErr.status : 502;
      return res.status(errStatus).json({
        success: false,
        error: cleanMsg,
      });
    } catch (err: any) {
      console.warn('Gemini dialogue endpoint error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error while talking to Digimon.',
      });
    }
  });

  // Setup Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    app.get('/@vite-plugin-pwa/pwa-entry-point-loaded', (_req, res) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-store');
      res.end('export default function registerDevSW() {}\n');
    });

    const hmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: hmrDisabled
          ? false
          : {
              server: httpServer,
            },
        ...(hmrDisabled ? { watch: null } : {}),
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
