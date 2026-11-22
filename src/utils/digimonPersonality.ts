/**
 * DigiPet AI & Personality Engine
 * Provides authentic, species-specific personalities and dialogues.
 * Integrates with server-side Gemini AI with species-aware offline quotes.
 */

import { Capacitor } from '@capacitor/core';
import { AppUpdatePlugin, resolveTalkEndpointCandidates } from './appUpdater';
import { DIGIMON_DATABASE } from '../data/digidex';

export interface DigimonPersonalityProfile {
  name: string;
  speciesId: string;
  stage: string;
  vibe: string;
  catchphrases: string[];
  hungryQuotes: string[];
  sickQuotes: string[];
  poopQuotes: string[];
  happyQuotes: string[];
  idleQuotes: string[];
  battleQuotes: string[];
}

export const SPECIES_PERSONALITIES: Record<string, DigimonPersonalityProfile> = {
  agumon: {
    name: 'Agumon',
    speciesId: 'agumon',
    stage: 'Rookie',
    vibe: 'Energetic, brave, always ravenous for meat, fiercely loyal to their Tamer!',
    catchphrases: ['Pepper Breath!', 'Taichi!', 'Ready for an adventure!'],
    hungryQuotes: [
      "My stomach is roaring louder than Pepper Breath! Big Meat please! 🍖",
      "Is that sirloin I smell?! Tamer, I'm starving! 🥩",
      "Feed me meat and I'll fight any Kuwagamon for you! 🍖🔥",
    ],
    sickQuotes: [
      "Oof... my flame feels cold. Need medicine or vitamins, Tamer... 💊",
      "Achoo! Even fire lizards catch digital bugs... help me out? 🤒",
    ],
    poopQuotes: [
      "Whoops! Made a little mess... can you flush that for me? 💩",
      "Tamer! It's not polite to stare at my poop! Please clean it! 🧹",
    ],
    happyQuotes: [
      "Hehe! That tickles! You're the best Tamer in File Island! ✨",
      "I feel invincible! Let's conquer the Colosseum together! 🦖",
      "Roar! My Digi-Core is burning with friendship! 🔥",
    ],
    idleQuotes: [
      "Keeping watch over your screen! No wild Digimon are getting past me! 🛡️",
      "I wonder what Greymon feels like... gotta train hard! 🥊",
      "Your device screen is so shiny! Can I eat it? Just kidding! 😋",
      "Standing by, partner! Give me the command! 🦖",
      "Did you know dinosaurs like me love afternoon strolls? 🐾",
    ],
    battleQuotes: [
      "Pepper Breath, full power! Let's show them what we've got! 🔥",
      "No backing down! Tamers and Digimon stand as one! ⚔️",
    ],
  },

  gabumon: {
    name: 'Gabumon',
    speciesId: 'gabumon',
    stage: 'Rookie',
    vibe: 'Thoughtful, slightly shy, gentle soul who fiercely protects their friends in warm fur.',
    catchphrases: ['Blue Blaster!', 'Stay close to me.', 'I will protect you.'],
    hungryQuotes: [
      "Umm... my tummy is grumbling under my fur pelt... Got food? 🍖",
      "A small piece of meat would be really comforting right now... 🥩",
    ],
    sickQuotes: [
      "Brrr... even inside my pelt I'm shivering. Need vitamins... 💊",
      "My digital temperature is high... please take care of me, Tamer. 🩹",
    ],
    poopQuotes: [
      "Eep! How embarrassing... please don't look and flush it! 🙈💩",
    ],
    happyQuotes: [
      "Warm cuddles... thanks for being such a kind Tamer. 💙",
      "When we're together, I feel so much braver. ✨",
      "You can pet my fur anytime you want! 🐾",
    ],
    idleQuotes: [
      "I'm keeping watch quietly from the shadows. You're safe with me. 🌙",
      "My fur pelt keeps me warm during long screen journeys. 🧥",
      "Take your time, Tamer. I'm right here whenever you need me. 💙",
      "Blue Blaster is ready if any trouble shows up! ❄️",
    ],
    battleQuotes: [
      "I won't let anything hurt my partner! Blue Blaster! ❄️",
    ],
  },

  patamon: {
    name: 'Patamon',
    speciesId: 'patamon',
    stage: 'Rookie',
    vibe: 'Innocent, cheerful, fluffy, flaps big ears to fly, pure hope incarnate!',
    catchphrases: ['Boom Bubble!', 'T.K.!', 'I can fly!'],
    hungryQuotes: [
      "Flapping these ears makes me so hungry! Meat or berries please! 🍖",
      "Tummy is empty... Boom Bubble might pop from hunger! 🫧",
    ],
    sickQuotes: [
      "My ears are heavy and I can't flutter... vitamins please? 💊🥺",
    ],
    poopQuotes: [
      "Oopsie daisy! Made a tiny poop! Sweep it away, Tamer! 💩✨",
    ],
    happyQuotes: [
      "Yay yay yay! Love you Tamer! *happy ear flutter* 💖",
      "Boom Bubble of pure happiness! Wheeee! 🫧✨",
      "You give the warmest pats in the whole Digital World! 🥰",
    ],
    idleQuotes: [
      "Flap flap flap! The view from your screen is wonderful! 🕊️",
      "Even if things get tough, Hope will always shine through! 🌟",
      "Are we going to play soon? I'm bouncing with joy! 🎈",
      "Look at my cute ears! They work as wings AND pillows! 🐾",
    ],
    battleQuotes: [
      "I'm small, but my courage is huge! Boom Bubble! 🫧⚡",
    ],
  },

  palmon: {
    name: 'Palmon',
    speciesId: 'palmon',
    stage: 'Rookie',
    vibe: 'Spunky, fashion-forward, loves blooming flowers, sassy yet warm-hearted.',
    catchphrases: ['Poison Ivy!', 'Fabulous!', 'Time to bloom!'],
    hungryQuotes: [
      "Photosynthesis isn't enough today! Bring on the Big Meat! 🍖🌸",
      "A growing flower needs nutrients! Feed me, darling! 🥩",
    ],
    sickQuotes: [
      "My petals are wilting! Quick, give me vitamins and care! 🥀💊",
    ],
    poopQuotes: [
      "Gross! A stylish Digimon can't be seen near THAT! Flush it! 💩💅",
    ],
    happyQuotes: [
      "Aww, look at you treating me like Digi-Royalty! 🌺✨",
      "My tropical flower is blooming brighter thanks to you! 🌸",
    ],
    idleQuotes: [
      "File Island fashion is great, but your screen aesthetic is chic! 💅",
      "Sunlight, fresh bits, and a loyal Tamer. What else do I need? 🌻",
      "Poison Ivy is primed if any malware tries to invade! 🌿",
    ],
    battleQuotes: [
      "Beauty and thorn power! Poison Ivy! 🌿⚡",
    ],
  },

  tentomon: {
    name: 'Tentomon',
    speciesId: 'tentomon',
    stage: 'Rookie',
    vibe: 'Inquisitive intellectual, polite Kansai-style charm, fascinated by tech and data.',
    catchphrases: ['Super Shocker!', 'Fascinating data!', 'Allow me to calculate.'],
    hungryQuotes: [
      "According to my calculations, energy reserves are down to 5%! Meat time! 🍖📊",
      "Caloric intake required immediately for optimal computing! 🥩",
    ],
    sickQuotes: [
      "System malfunction detected! Malicious bug in the logic board... 💊💻",
    ],
    poopQuotes: [
      "Data sanitation required! Please execute the flush protocol! 💩🧹",
    ],
    happyQuotes: [
      "Ah, sublime tactile interaction! My carapace is tingling with delight! ⚡",
      "A 99.8% compatibility rating between you and me, Tamer! 💖",
    ],
    idleQuotes: [
      "Did you know the Digital World has over 1,000 recorded species? 📖",
      "Analyzing this device's specs... impressive processing speed! ⚡",
      "Super Shocker is ready to zap away any unwanted data packets! ⚡🐞",
    ],
    battleQuotes: [
      "Analyzing opponent weakness... Super Shocker! ⚡🎯",
    ],
  },

  gomamon: {
    name: 'Gomamon',
    speciesId: 'gomamon',
    stage: 'Rookie',
    vibe: 'Carefree prankster, loyal swimmer, loves making jokes and keeping spirits high.',
    catchphrases: ['Marching Fishes!', 'Chill out!', 'Let\'s make a splash!'],
    hungryQuotes: [
      "Hey Tamer! Even seals can't swim on an empty stomach! 🐟🍖",
    ],
    sickQuotes: [
      "Ugh... feels like I drank salty swamp water. Medicine please! 💊🌊",
    ],
    poopQuotes: [
      "Hey, nature calls even out here! Flush the tide, buddy! 💩🌊",
    ],
    happyQuotes: [
      "Haha! You're tickling my whiskers! You're awesome! 🦭💙",
    ],
    idleQuotes: [
      "If you ever need a bridge, my Marching Fishes have got you covered! 🐟",
      "No stress, no worries. File Island ocean breeze all day long! 🌊",
    ],
    battleQuotes: [
      "Swim into action! Marching Fishes, charge! 🐟🌊",
    ],
  },

  biyomon: {
    name: 'Biyomon',
    speciesId: 'biyomon',
    stage: 'Rookie',
    vibe: 'Sweet, loving, eager to fly higher, loves hugging their partner Tamer.',
    catchphrases: ['Spiral Twister!', 'I love you!', 'Flying high!'],
    hungryQuotes: ["Chirp! Baby bird needs fuel! Got any tasty meat? 🍖🐣"],
    sickQuotes: ["My wings are shivering... please warm me up with vitamins... 💊"],
    poopQuotes: ["Eek! Tamer please tidy my nest! 💩🌸"],
    happyQuotes: ["Snuggle time! You make my wings feel lighter than air! 🕊️💖"],
    idleQuotes: [
      "I love perching right here on your screen! 🐣",
      "One day I'll soar across the digital stratosphere with Birdramon! 🔥",
    ],
    battleQuotes: ["Spiral Twister, ignite the sky! 🔥🌪️"],
  },

  veemon: {
    name: 'Veemon',
    speciesId: 'veemon',
    stage: 'Rookie',
    vibe: 'High-octane hero, bold, always ready to brawl, loves courage and adventure!',
    catchphrases: ['Vee-Headbutt!', 'Digi-Armor Energize!', 'Let\'s punch through!'],
    hungryQuotes: ["Out of fuel! Put some meat in my tank, Tamer! 🍖⚡"],
    sickQuotes: ["A hero can't be benched by a digital cold! Give me vitamins! 💊🥊"],
    poopQuotes: ["Ack! Clear the arena! Flush that right away! 💩💨"],
    happyQuotes: ["YEAH! We are the ultimate dynamic duo! High five! ✋⚡"],
    idleQuotes: [
      "Shadow boxing on your screen... gotta keep my reflexes sharp! 🥊",
      "Give me a challenge! The Colosseum won't conquer itself! 🏆",
    ],
    battleQuotes: ["Full throttle! Vee-Headbutt smash! 💥🥊"],
  },

  guilmon: {
    name: 'Guilmon',
    speciesId: 'guilmon',
    stage: 'Rookie',
    vibe: 'Playful child dinosaur, curious about everything, loves bread and big meat!',
    catchphrases: ['Pyro Sphere!', 'Takato-mon!', 'Play with Guilmon!'],
    hungryQuotes: ["Guilmon wants meat! Or crispy bread! Yummy yummy! 🍖🥖"],
    sickQuotes: ["Guilmon feels dizzy... tummy hurts... need red medicine? 💊🥺"],
    poopQuotes: ["Big dinosaur makes big poop! Guilmon is sorry! Flush please! 💩🦕"],
    happyQuotes: ["*happy purring growl* Guilmon loves Tamer so much! 🦖💖"],
    idleQuotes: [
      "Guilmon is sniffing your screen... smells like digital adventure! 🐾",
      "Let's play dig and run! Guilmon is ready! 🦖",
    ],
    battleQuotes: ["Pyro Sphere! Hot hot fire blast! 🔥☄️"],
  },

  renamon: {
    name: 'Renamon',
    speciesId: 'renamon',
    stage: 'Rookie',
    vibe: 'Stoic ninja guardian, disciplined, sharp senses, silent devotion.',
    catchphrases: ['Diamond Storm!', 'Focus your mind.', 'We strike with precision.'],
    hungryQuotes: ["Nutritional replenishment is required to sustain battle readiness. 🍖"],
    sickQuotes: ["Sensory degradation... digital virus detected. Administer remedy. 💊"],
    poopQuotes: ["Discard this biological waste immediately. 💩"],
    happyQuotes: ["Your touch strengthens the resonance of our Digi-Soul. 🌙✨"],
    idleQuotes: [
      "Perimeter scan complete. No hostile signatures on this terminal. 🦊",
      "True strength comes from harmony between Tamer and Digimon. ☯️",
    ],
    battleQuotes: ["Crystalline blades, scatter! Diamond Storm! 💎❄️"],
  },
};

/**
 * Universal fallback personality for any Digimon without a custom profile
 */
export const DEFAULT_PERSONALITY: DigimonPersonalityProfile = {
  name: 'Digimon',
  speciesId: 'unknown',
  stage: 'Digimon',
  vibe: 'Loyal digital companion, excited to explore and protect their human Tamer.',
  catchphrases: ['Let\'s explore!', 'Digi-Power!', 'Together forever!'],
  hungryQuotes: [
    "Tamer! I'm starving, got any Big Meat? 🍖",
    "Energy core dropping! Feed me delicious meat! 🥩",
  ],
  sickQuotes: [
    "Achoo... I don't feel well! Need vitamins! 💊",
    "Digital glitch detected... please give me medicine! 🩹",
  ],
  poopQuotes: [
    "Uh oh... Tamer, can you clean up my poop? 💩",
    "Oops! Made a little mess on the screen! Flush please! 🧹",
  ],
  happyQuotes: [
    "Hehe! You're the best Tamer ever! ✨",
    "I'm feeling super energized and happy with you! 💖",
  ],
  idleQuotes: [
    "Keeping watch over your screen while you work! 🛡️",
    "Let's go train at the punching bag! I wanna digivolve! 🥊",
    "Check out my stats in the Digivice! I'm getting stronger! 📈",
    "Did you know I can walk all over your screen? 🐾",
    "File Island is peaceful today. Ready for whatever comes! 🌴",
  ],
  battleQuotes: [
    "Ready for battle! Let's win in the Colosseum! ⚔️",
  ],
};

/**
 * Gets the profile for a species with dynamic synthesis from DIGIMON_DATABASE
 */
export function getPersonalityProfile(speciesId?: string): DigimonPersonalityProfile {
  if (!speciesId) return DEFAULT_PERSONALITY;
  const key = speciesId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (SPECIES_PERSONALITIES[key]) {
    return SPECIES_PERSONALITIES[key];
  }

  const dbMon = DIGIMON_DATABASE[speciesId] || DIGIMON_DATABASE[key];
  if (!dbMon) return DEFAULT_PERSONALITY;

  const moveName = dbMon.signatureMove?.name || 'Digi-Strike';
  const stageLabel = dbMon.stage.toUpperCase();

  return {
    name: dbMon.name,
    speciesId: dbMon.id,
    stage: dbMon.stage,
    vibe: dbMon.description,
    catchphrases: [`${moveName}!`, `I'm ${dbMon.name}!`, `For the Crest of ${dbMon.crest}!`],
    hungryQuotes: [
      `${dbMon.name}'s energy core is running low! Got any Big Meat, Tamer? 🍖`,
      `Even a ${dbMon.stage} ${dbMon.type} Digimon gets super hungry! Feed me! 🥩`,
    ],
    sickQuotes: [
      `Ugh... ${dbMon.name} caught a digital bug. Need vitamins fast! 💊`,
      `My ${dbMon.attribute} data feels scrambled... help me recover, Tamer! 🩹`,
    ],
    poopQuotes: [
      `Uh oh... Tamer, can you flush that mess for ${dbMon.name}? 💩`,
      `Oops! Better tidy up the screen before we train! 🧹`,
    ],
    happyQuotes: [
      `Hehe! Hanging out with you makes ${dbMon.name} unstoppable! ✨`,
      `Our bond shines with the Crest of ${dbMon.crest}! 💖`,
    ],
    idleQuotes: [
      `${dbMon.name} (${stageLabel}) standing by! Ready to guard your screen! 🛡️`,
      `Practicing ${moveName} so we're ready for the Colosseum! ⚡`,
      `Hey Tamer! Check my stats or let's train at the Dojo! 🥊`,
      `Feeling proud to be your ${dbMon.type} Digimon partner! 🐾`,
    ],
    battleQuotes: [
      `${moveName}, full power! Let's win this, Tamer! ⚔️🔥`,
    ],
  };
}

/**
 * Replaces direct-address "Tamer" / "partner" vocatives with the user's chosen name when set
 */
export function personalizeQuoteForPlayer(quote: string, playerName?: string): string {
  const name = playerName?.trim();
  if (!name) return quote;
  return quote
    .replace(/\b(Hey|Hi|Thanks|Love you|miss you)\s+Tamer\b/gi, `$1 ${name}`)
    .replace(/\bTamer(?=[!,?])/g, name)
    .replace(/,\s*Tamer\b/g, `, ${name}`)
    .replace(/\bloves Tamer\b/gi, `loves ${name}`)
    .replace(/\bpartner(?=[!,?])/g, name);
}

/**
 * Smart contextual dialogue generator (Instant offline fallback)
 */
export function getContextualQuote(
  speciesId?: string,
  state?: {
    playerName?: string;
    isSick?: boolean;
    hunger?: number;
    poopCount?: number;
    happiness?: number;
    isSleeping?: boolean;
    batteryLevel?: number;
    currentTimeStr?: string;
  }
): string {
  const profile = getPersonalityProfile(speciesId);
  const finalize = (q: string) => personalizeQuoteForPlayer(q, state?.playerName);

  if (state?.isSleeping) {
    return finalize("Zzz... counting sheep-mon in the Digital Dream... 💤");
  }
  if (state?.isSick) {
    const list = profile.sickQuotes.length ? profile.sickQuotes : DEFAULT_PERSONALITY.sickQuotes;
    return finalize(list[Math.floor(Math.random() * list.length)]);
  }
  if ((state?.hunger ?? 100) < 30) {
    const list = profile.hungryQuotes.length ? profile.hungryQuotes : DEFAULT_PERSONALITY.hungryQuotes;
    return finalize(list[Math.floor(Math.random() * list.length)]);
  }
  if ((state?.poopCount ?? 0) > 0) {
    const list = profile.poopQuotes.length ? profile.poopQuotes : DEFAULT_PERSONALITY.poopQuotes;
    return finalize(list[Math.floor(Math.random() * list.length)]);
  }
  if (state?.batteryLevel && state.batteryLevel <= 20) {
    return finalize(`Battery at ${state.batteryLevel}%! Tamer, please plug in our device! ⚡`);
  }
  if (Math.random() < 0.25 && state?.happiness && state.happiness > 75) {
    const list = profile.happyQuotes.length ? profile.happyQuotes : DEFAULT_PERSONALITY.happyQuotes;
    return finalize(list[Math.floor(Math.random() * list.length)]);
  }

  const idleList = profile.idleQuotes.length ? profile.idleQuotes : DEFAULT_PERSONALITY.idleQuotes;
  return finalize(idleList[Math.floor(Math.random() * idleList.length)]);
}

export interface DigimonChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface DigimonTalkParams {
  speciesName: string;
  speciesId?: string;
  stage?: string;
  attribute?: string;
  type?: string;
  description?: string;
  signatureMove?: string;
  crestName?: string;
  tamerName?: string;
  playerName?: string;
  hunger?: number;
  happiness?: number;
  energy?: number;
  strength?: number;
  weight?: number;
  isSick?: boolean;
  poopCount?: number;
  battlesWon?: number;
  battlesTotal?: number;
  careMistakes?: number;
  userMessage?: string;
  actionContext?: string;
  history?: DigimonChatTurn[];
}

export interface DigimonTalkResult {
  text: string;
  source: 'ai' | 'offline';
  error?: string;
}

function parseTalkPayload(rawText: string): { data: any; parseError?: string } {
  const trimmed = String(rawText || '').trim();
  if (!trimmed) {
    return { data: null, parseError: 'Empty response from server.' };
  }
  if (trimmed.startsWith('<')) {
    return {
      data: null,
      parseError: 'Server returned HTML instead of JSON (auth gate or wrong host). Try setting the public Shared App URL in Updater Settings.',
    };
  }
  try {
    return { data: JSON.parse(trimmed) };
  } catch {
    return {
      data: null,
      parseError: 'Server returned non-JSON response.',
    };
  }
}

/**
 * Requests an AI-powered conversational reply from the server's Gemini endpoint.
 * Propagates server/API errors transparently and only uses local quotes for spontaneous idle remarks when offline.
 */
export async function fetchDigimonAiDialogue(params: DigimonTalkParams): Promise<DigimonTalkResult> {
  const candidates = resolveTalkEndpointCandidates();
  const dbMon = params.speciesId ? DIGIMON_DATABASE[params.speciesId] : undefined;

  const payload: DigimonTalkParams = {
    ...params,
    attribute: params.attribute || dbMon?.attribute,
    type: params.type || dbMon?.type,
    description: params.description || dbMon?.description,
    signatureMove: params.signatureMove || dbMon?.signatureMove?.name,
    playerName: params.playerName?.trim() || undefined,
  };
  const bodyJson = JSON.stringify(payload);

  const handleParsedResponse = (
    ok: boolean,
    status: number,
    data: any,
    parseError?: string
  ): DigimonTalkResult => {
    if (ok && data && typeof data.text === 'string' && data.text.trim()) {
      return {
        text: data.text.trim(),
        source: 'ai',
      };
    }
    const errMsg = data?.error || parseError || `Server returned ${status}`;
    return {
      text: `(${params.speciesName} couldn't connect right now: ${errMsg})`,
      source: 'offline',
      error: errMsg,
    };
  };

  let lastErrorReason = 'Network unreachable right now.';
  let nativePluginHandled = false;

  // On Capacitor Native Android/iOS, call native AppUpdatePlugin.httpPost FIRST to bypass WebView CORS
  if (Capacitor.isNativePlatform()) {
    for (const url of candidates) {
      try {
        const nativeRes = await AppUpdatePlugin.httpPost({
          url,
          body: bodyJson,
        });
        nativePluginHandled = true;
        const status = Number(nativeRes?.status || 502);
        const { data, parseError } = parseTalkPayload(nativeRes?.data || '');
        if (nativeRes?.ok && data && typeof data.text === 'string' && data.text.trim()) {
          return {
            text: data.text.trim(),
            source: 'ai',
          };
        }
        const errMsg = data?.error || parseError || `Server returned ${status}`;
        lastErrorReason = errMsg;
        // If blocked by auth redirect or inactive host on this candidate, continue to next candidate
        if (status === 401 || status === 403 || status === 404 || parseError) {
          continue;
        }
        // Real backend/API error (e.g., 503 missing key or 429) — return immediately
        return handleParsedResponse(false, status, data, parseError);
      } catch (nativeErr: any) {
        const nativeMsg = String(nativeErr?.message || '');
        const isUnimplemented =
          nativeErr?.code === 'UNIMPLEMENTED' ||
          nativeMsg.toLowerCase().includes('not implemented');
        if (!isUnimplemented) {
          nativePluginHandled = true;
          lastErrorReason = nativeMsg || 'Native connection failed.';
        } else {
          lastErrorReason = 'Installed APK does not have the updated native chat plugin yet.';
        }
        console.warn(`Native httpPost error for ${url}:`, nativeErr);
      }
    }
  }

  // Web path (or fallback ONLY if native plugin wasn't available in older APKs)
  if (!Capacitor.isNativePlatform() || !nativePluginHandled) {
    for (const url of candidates) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        try {
          controller.abort();
        } catch {}
      }, 35000);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: bodyJson,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const rawText = await res.text();
        const { data, parseError } = parseTalkPayload(rawText);

        if (res.ok && data && typeof data.text === 'string' && data.text.trim()) {
          return {
            text: data.text.trim(),
            source: 'ai',
          };
        }

        const errMsg = data?.error || parseError || `Server returned ${res.status}`;
        lastErrorReason = errMsg;
        if (res.status === 401 || res.status === 403 || res.status === 404 || parseError) {
          continue;
        }
        return handleParsedResponse(false, res.status, data, parseError);
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn(`Gemini AI talk request failed (${url}):`, err);
        if (!Capacitor.isNativePlatform()) {
          lastErrorReason =
            err?.name === 'AbortError'
              ? 'Connection timed out. Please try again!'
              : err?.message || lastErrorReason;
        } else {
          lastErrorReason =
            'Cannot reach Digi-Network from standalone APK. Install the latest APK build and configure a public Server URL (e.g. Shared App URL).';
        }
      }
    }
  }

  if (!params.userMessage) {
    return {
      text: getContextualQuote(params.speciesId, {
        playerName: params.playerName,
        isSick: params.isSick,
        hunger: params.hunger,
        poopCount: params.poopCount,
        happiness: params.happiness,
      }),
      source: 'offline',
    };
  }

  return {
    text: `(${params.speciesName} couldn't reach the Digi-Network: ${lastErrorReason})`,
    source: 'offline',
    error: lastErrorReason,
  };
}
