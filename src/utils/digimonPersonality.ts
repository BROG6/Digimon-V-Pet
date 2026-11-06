/**
 * DigiPet AI & Personality Engine
 * Provides authentic, species-specific personalities and dialogues.
 * Integrates with server-side Gemini 3.8 Flash with rich offline fallbacks.
 */

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
 * Gets the profile for a species with safe fallback
 */
export function getPersonalityProfile(speciesId?: string): DigimonPersonalityProfile {
  if (!speciesId) return DEFAULT_PERSONALITY;
  const key = speciesId.toLowerCase().replace(/[^a-z0-9]/g, '');
  return SPECIES_PERSONALITIES[key] || DEFAULT_PERSONALITY;
}

/**
 * Smart contextual dialogue generator (Instant offline fallback)
 */
export function getContextualQuote(
  speciesId?: string,
  state?: {
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

  if (state?.isSleeping) {
    return "Zzz... counting sheep-mon in the Digital Dream... 💤";
  }
  if (state?.isSick) {
    const list = profile.sickQuotes.length ? profile.sickQuotes : DEFAULT_PERSONALITY.sickQuotes;
    return list[Math.floor(Math.random() * list.length)];
  }
  if ((state?.hunger ?? 100) < 30) {
    const list = profile.hungryQuotes.length ? profile.hungryQuotes : DEFAULT_PERSONALITY.hungryQuotes;
    return list[Math.floor(Math.random() * list.length)];
  }
  if ((state?.poopCount ?? 0) > 0) {
    const list = profile.poopQuotes.length ? profile.poopQuotes : DEFAULT_PERSONALITY.poopQuotes;
    return list[Math.floor(Math.random() * list.length)];
  }
  if (state?.batteryLevel && state.batteryLevel <= 20) {
    return `Battery at ${state.batteryLevel}%! Tamer, please plug in our device! ⚡`;
  }
  if (Math.random() < 0.25 && state?.happiness && state.happiness > 75) {
    const list = profile.happyQuotes.length ? profile.happyQuotes : DEFAULT_PERSONALITY.happyQuotes;
    return list[Math.floor(Math.random() * list.length)];
  }

  const idleList = profile.idleQuotes.length ? profile.idleQuotes : DEFAULT_PERSONALITY.idleQuotes;
  return idleList[Math.floor(Math.random() * idleList.length)];
}

/**
 * Requests an AI-powered conversational line from the server's Gemini 3.8 Flash model.
 * Falls back gracefully to contextual quotes if network or API key is absent.
 */
export async function fetchDigimonAiDialogue(params: {
  speciesName: string;
  speciesId?: string;
  stage?: string;
  hunger?: number;
  happiness?: number;
  energy?: number;
  isSick?: boolean;
  poopCount?: number;
  userMessage?: string;
  actionContext?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/digimon/talk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.text === 'string' && data.text.trim()) {
        return data.text.trim();
      }
    }
  } catch (err) {
    console.warn('Gemini AI talk request failed, using local personality:', err);
  }

  // Graceful in-character fallback
  return getContextualQuote(params.speciesId, {
    isSick: params.isSick,
    hunger: params.hunger,
    poopCount: params.poopCount,
    happiness: params.happiness,
  });
}
