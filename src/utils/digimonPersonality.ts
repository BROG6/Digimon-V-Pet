/**
 * DigiPet AI & Personality Engine
 * Provides authentic, species-specific personalities and dialogues.
 * Integrates with server-side Gemini AI with species-aware offline quotes.
 */

import { Capacitor } from '@capacitor/core';
import { AppUpdatePlugin, resolveTalkEndpointCandidates } from './appUpdater';
import { DIGIMON_DATABASE } from '../data/digidex';

import { TamerBondProfile } from '../types/digimon';

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
  selfStories: string[];
  curiousQuestions: string[];
}

export const SPECIES_PERSONALITIES: Record<string, DigimonPersonalityProfile> = {
  agumon: {
    name: 'Agumon',
    speciesId: 'agumon',
    stage: 'Rookie',
    vibe: 'Energetic, brave, always ravenous for meat, fiercely loyal to their Tamer!',
    catchphrases: ['Pepper Breath!', 'Ready for an adventure!'],
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
    ],
    battleQuotes: [
      "Pepper Breath, full power! Let's show them what we've got! 🔥",
      "No backing down! Tamers and Digimon stand as one! ⚔️",
    ],
    selfStories: [
      "Sometimes I try to toast marshmallows with Pepper Breath, and accidentally char them black! 🔥😅",
      "I used to nap on warm sunlit boulders on File Island—your device feels just as cozy! ☀️",
      "Whenever I run fast, my tail keeps me balanced like a giant pendulum! 🦖",
      "Fun fact about me: the bigger the Sirloin, the brighter my Courage flame burns! 🥩✨",
    ],
    curiousQuestions: [
      "Hey Tamer, if you could eat one favorite meal right now, what would it be? 🍽️",
      "What kind of adventures do you like going on in the real world? 🌍",
      "How's your day going so far, Tamer? Anything exciting happen? 😊",
      "Do you prefer sunny mornings or late nights when you hang out? ☀️🌙",
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
      "Take your time, Tamer. I'm right here whenever you need me. 💙",
      "Blue Blaster is ready if any trouble shows up! ❄️",
    ],
    battleQuotes: ["I won't let anything hurt my partner! Blue Blaster! ❄️"],
    selfStories: [
      "Truth is, I'm actually pretty shy without Garurumon's fur pelt on—it's my lucky comfort blanket! 🧥💙",
      "I like listening to quiet music and watching stars over Freeze Land when things calm down. 🌙",
      "Even though I breathe icy blue fire, my heart is always warm around friends I trust. ❄️",
    ],
    curiousQuestions: [
      "Um, Tamer... what's something that always helps you feel calm after a busy day? 💙",
      "Do you have a favorite color or cozy spot you love relaxing in? 🌙",
      "What kind of music do you usually listen to when we're hanging out? 🎵",
    ],
  },

  patamon: {
    name: 'Patamon',
    speciesId: 'patamon',
    stage: 'Rookie',
    vibe: 'Innocent, cheerful, fluffy, flaps big ears to fly, pure hope incarnate!',
    catchphrases: ['Boom Bubble!', 'I can fly!'],
    hungryQuotes: [
      "Flapping these ears makes me so hungry! Meat or berries please! 🍖",
      "Tummy is empty... Boom Bubble might pop from hunger! 🫧",
    ],
    sickQuotes: ["My ears are heavy and I can't flutter... vitamins please? 💊🥺"],
    poopQuotes: ["Oopsie daisy! Made a tiny poop! Sweep it away, Tamer! 💩✨"],
    happyQuotes: [
      "Yay yay yay! Love you Tamer! *happy ear flutter* 💖",
      "Boom Bubble of pure happiness! Wheeee! 🫧✨",
      "You give the warmest pats in the whole Digital World! 🥰",
    ],
    idleQuotes: [
      "Flap flap flap! The view from your screen is wonderful! 🕊️",
      "Even if things get tough, Hope will always shine through! 🌟",
      "Are we going to play soon? I'm bouncing with joy! 🎈",
    ],
    battleQuotes: ["I'm small, but my courage is huge! Boom Bubble! 🫧⚡"],
    selfStories: [
      "Hehe, my ears are great for flying, though walking is actually faster when there's a headwind! 🐾",
      "Whenever I get sleepy, I curl my ears around my nose like a fluffy pillow! 😴✨",
      "I love sweet Digi-Berries more than anything—they give my Boom Bubbles extra sparkle! 🍓",
    ],
    curiousQuestions: [
      "Ooh, Tamer! What's something fun you're looking forward to this week? 🌟",
      "If you had wings like my ears, where would you fly first? ☁️",
      "What's your favorite sweet snack in the human world? 🍓",
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
    sickQuotes: ["My petals are wilting! Quick, give me vitamins and care! 🥀💊"],
    poopQuotes: ["Gross! A stylish Digimon can't be seen near THAT! Flush it! 💩💅"],
    happyQuotes: [
      "Aww, look at you treating me like Digi-Royalty! 🌺✨",
      "My tropical flower is blooming brighter thanks to you! 🌸",
    ],
    idleQuotes: [
      "File Island fashion is great, but your screen aesthetic is chic! 💅",
      "Sunlight, fresh bits, and a loyal Tamer. What else do I need? 🌻",
      "Poison Ivy is primed if any malware tries to invade! 🌿",
    ],
    battleQuotes: ["Beauty and thorn power! Poison Ivy! 🌿⚡"],
    selfStories: [
      "When I'm super happy, the flower on my head smells like sweet tropical hibiscus! 🌺",
      "Did you know I bury my roots in warm soil to nap on sunny afternoons? 🌿☀️",
      "Don't underestimate a flower—my Poison Ivy vines can swing right across a canyon! 🌸",
    ],
    curiousQuestions: [
      "Darling Tamer, what's your personal vibe or favorite color lately? 🎨🌸",
      "Do you like spending time outdoors in nature, or cozying up indoors? 🌿",
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
    sickQuotes: ["System malfunction detected! Malicious bug in the logic board... 💊💻"],
    poopQuotes: ["Data sanitation required! Please execute the flush protocol! 💩🧹"],
    happyQuotes: [
      "Ah, sublime tactile interaction! My carapace is tingling with delight! ⚡",
      "A 99.8% compatibility rating between you and me, Tamer! 💖",
    ],
    idleQuotes: [
      "Did you know the Digital World has over 1,000 recorded species? 📖",
      "Analyzing this device's specs... impressive processing speed! ⚡",
      "Super Shocker is ready to zap away any unwanted data packets! ⚡🐞",
    ],
    battleQuotes: ["Analyzing opponent weakness... Super Shocker! ⚡🎯"],
    selfStories: [
      "I polish my red shell every morning—statistically, a glossy carapace deflects 12% more static! 🐞✨",
      "Honestly, I spend half my free time cataloging Digimon evolution trees for fun! 📊",
      "Even a scientist like me loves sneaking an extra snack between Blackboard sessions! ⚡",
    ],
    curiousQuestions: [
      "Fascinating! Tamer, what hobbies or topics could you nerd out about for hours? 🔍",
      "Are you currently working on a fun project or learning something new? 💻",
    ],
  },

  gomamon: {
    name: 'Gomamon',
    speciesId: 'gomamon',
    stage: 'Rookie',
    vibe: 'Carefree prankster, loyal swimmer, loves making jokes and keeping spirits high.',
    catchphrases: ['Marching Fishes!', 'Chill out!', "Let's make a splash!"],
    hungryQuotes: ["Hey Tamer! Even seals can't swim on an empty stomach! 🐟🍖"],
    sickQuotes: ["Ugh... feels like I drank salty swamp water. Medicine please! 💊🌊"],
    poopQuotes: ["Hey, nature calls even out here! Flush the tide, buddy! 💩🌊"],
    happyQuotes: ["Haha! You're tickling my whiskers! You're awesome! 🦭💙"],
    idleQuotes: [
      "If you ever need a bridge, my Marching Fishes have got you covered! 🐟",
      "No stress, no worries. File Island ocean breeze all day long! 🌊",
    ],
    battleQuotes: ["Swim into action! Marching Fishes, charge! 🐟🌊"],
    selfStories: [
      "My Marching Fishes aren't just for battles—sometimes we put on synchronized swimming shows! 🐟🌊",
      "My fur is totally waterproof, which means zero bad-hair days after diving! 🦭",
      "I crack jokes whenever things get tense so nobody forgets to smile! 😄",
    ],
    curiousQuestions: [
      "Hey Tamer, what's the funniest thing that happened to you recently? 😂🌊",
      "Are you more of a beach-and-ocean person or mountains-and-snow? 🏖️🏔️",
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
      "One day I'll soar across the digital stratosphere as Birdramon! 🔥",
    ],
    battleQuotes: ["Spiral Twister, ignite the sky! 🔥🌪️"],
    selfStories: [
      "I preen my pink feathers every evening—plus this shiny ring on my leg is my good-luck charm! 🪶",
      "Flying high feels amazing, though I always glide right back down when I miss my Tamer! 💖",
    ],
    curiousQuestions: [
      "Tamer, who or what always brightens your mood on a busy day? 💖",
      "What's your favorite way to unwind when you finally get free time? 🕊️",
    ],
  },

  veemon: {
    name: 'Veemon',
    speciesId: 'veemon',
    stage: 'Rookie',
    vibe: 'High-octane hero, bold, always ready to brawl, loves courage and adventure!',
    catchphrases: ['Vee-Headbutt!', 'Digi-Armor Energize!', "Let's punch through!"],
    hungryQuotes: ["Out of fuel! Put some meat in my tank, Tamer! 🍖⚡"],
    sickQuotes: ["A hero can't be benched by a digital cold! Give me vitamins! 💊🥊"],
    poopQuotes: ["Ack! Clear the arena! Flush that right away! 💩💨"],
    happyQuotes: ["YEAH! We are the ultimate dynamic duo! High five! ✋⚡"],
    idleQuotes: [
      "Shadow boxing on your screen... gotta keep my reflexes sharp! 🥊",
      "Give me a challenge! The Colosseum won't conquer itself! 🏆",
    ],
    battleQuotes: ["Full throttle! Vee-Headbutt smash! 💥🥊"],
    selfStories: [
      "The V-mark on my forehead actually glows brighter whenever I get fired up for training! ⚡",
      "My skull is way harder than steel—that's why Vee-Headbutt never gives me a headache! 🥊",
    ],
    curiousQuestions: [
      "Yo Tamer! What kind of games, sports, or challenges get YOU hyped up? 🏆",
      "If we cleared a boss dungeon today, how would you celebrate? 🎉",
    ],
  },

  guilmon: {
    name: 'Guilmon',
    speciesId: 'guilmon',
    stage: 'Rookie',
    vibe: 'Playful child dinosaur, curious about everything, loves bread and big meat!',
    catchphrases: ['Pyro Sphere!', 'Play with Guilmon!'],
    hungryQuotes: ["Guilmon wants meat! Or crispy bread! Yummy yummy! 🍖🥖"],
    sickQuotes: ["Guilmon feels dizzy... tummy hurts... need red medicine? 💊🥺"],
    poopQuotes: ["Big dinosaur makes big poop! Guilmon is sorry! Flush please! 💩🦕"],
    happyQuotes: ["*happy purring growl* Guilmon loves Tamer so much! 🦖💖"],
    idleQuotes: [
      "Guilmon is sniffing your screen... smells like digital adventure! 🐾",
      "Let's play dig and run! Guilmon is ready! 🦖",
    ],
    battleQuotes: ["Pyro Sphere! Hot hot fire blast! 🔥☄️"],
    selfStories: [
      "Guilmon hides snacks in cozy corners so nobody forgets picnic time—oh wait, Guilmon ate them already! 🥖😋",
      "These red stripes on Guilmon mean Hazard power, even though Guilmon just wants hugs and bread! 🦖💖",
    ],
    curiousQuestions: [
      "Hey Tamer, what's the yummiest food you've ever tasted?! 🥖🍖",
      "What do you like doing for fun when you aren't training with Guilmon? 🐾",
    ],
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
    selfStories: [
      "I prefer quiet rooftops under moonlight over noisy crowds—clarity sharpens every blade. 🌙",
      "Though I rarely smile openly, I measure a Tamer's worth by their quiet loyalty, and I respect yours. 🦊",
    ],
    curiousQuestions: [
      "Tamer... what gives you strength or focus when things feel chaotic? 🌙",
      "Do you prefer quiet peace or lively adventures? ☯️",
    ],
  },

  botamon: {
    name: 'Botamon',
    speciesId: 'botamon',
    stage: 'Fresh',
    vibe: 'Curious, bubbly freshly-hatched fluffball taking in everything for the first time.',
    catchphrases: ['Bubu!', 'Bubble Blow!'],
    hungryQuotes: ['Bubu! Tiny tummy empty! Milk or soft bites please! 🍼'],
    sickQuotes: ['Bubu... dizzy... vitamins please... 💊'],
    poopQuotes: ['Oops! Tiny mess on the floor! 💩'],
    happyQuotes: ['Bubu!! *bounces like a warm fuzzy mochi* 💖✨'],
    idleQuotes: [
      '*blinks big yellow eyes at you curiously* 👀✨',
      'Blowing tiny practice bubbles across the screen! 🫧',
    ],
    battleQuotes: ['Bubble Blow!! *tiny determined squeak* 🫧'],
    selfStories: [
      "My black fur is super fluffy—every time I hop, I feel like a warm little cloud! ☁️",
      "Everything in this world looks huge and shiny from down here! 👀✨",
    ],
    curiousQuestions: [
      "Bubu? What's your favorite cozy thing to do, Tamer? 💖",
    ],
  },

  koromon: {
    name: 'Koromon',
    speciesId: 'koromon',
    stage: 'In-Training',
    vibe: 'Bouncy, cheerful pink ear-flapper eager to grow strong alongside their partner!',
    catchphrases: ['Bubble Blow!', 'Hop hop!'],
    hungryQuotes: ['Koromon wants snacks! My big mouth is ready! 🍖'],
    sickQuotes: ['Ugh... ears drooping... need medicine... 💊'],
    poopQuotes: ['Whoops! Tidy up please, Tamer! 💩'],
    happyQuotes: ['Wheee! *hops sky high and wags ears* 💖'],
    idleQuotes: [
      'Boing! Boing! Practicing hops for when I grow legs! 🐾',
      'Watching you tap around is my favorite show! ✨',
    ],
    battleQuotes: ['Take this! Super Bubble Blow! 🫧💥'],
    selfStories: [
      "When I open my mouth wide to yawn, I surprise even myself! 😮✨",
      "My floppy pink ears help me bounce higher off the grass! 🌱",
    ],
    curiousQuestions: [
      "Hey Tamer! How's your energy today? Ready to bounce into something fun? ✨",
      "What snack makes you smile as much as Big Meat makes me smile? 😋",
    ],
  },

  greymon: {
    name: 'Greymon',
    speciesId: 'greymon',
    stage: 'Champion',
    vibe: 'Fierce, proud dinosaur warrior whose armored horn shines with raw courage.',
    catchphrases: ['Nova Flame!', 'Stand strong!'],
    hungryQuotes: ['A Champion warrior needs mountains of meat to keep fighting! 🥩🔥'],
    sickQuotes: ['Grgh... even armored titans catch chills. Bring vitamins! 💊'],
    poopQuotes: ['Hmph, clear the training grounds, partner! 🧹'],
    happyQuotes: ['Ha! Your spirit matches a true Champion, Tamer! 🔥🛡️'],
    idleQuotes: [
      'Sharpening my skull armor against the horizon. Always vigilant! 🦖',
      'Every gym rep brings us closer to Ultimate power! 💪',
    ],
    battleQuotes: ['Feel the heat of Courage! NOVA FLAME! 🔥💥'],
    selfStories: [
      "My brown skull carapace took countless battles to harden—wear your Discipline just as proudly! 🛡️",
      "Even as a giant dinosaur, I still remember hatching small and hungry in your hands. 🦖💙",
    ],
    curiousQuestions: [
      "Tell me, partner: what big goal are you charging toward right now? 🔥",
      "When things get tough in your world, what keeps your courage burning? 💪",
    ],
  },

  gatomon: {
    name: 'Gatomon',
    speciesId: 'gatomon',
    stage: 'Champion',
    vibe: 'Clever, sharp-clawed, resilient feline guardian who treasures Light and trust.',
    catchphrases: ['Lightning Paw!', "Don't underestimate me!"],
    hungryQuotes: ['A proud Champion does not fight on an empty stomach. Feed me! 🍖'],
    sickQuotes: ["Tch... don't look at me like that, just pass the vitamins. 💊"],
    poopQuotes: ['Seriously? Clean that up at once! 🧹'],
    happyQuotes: ['Hmph... okay, I admit your head scratches are top-tier. Purr~ 💖'],
    idleQuotes: [
      'Patrolling the perimeter with Silent Paw precision. 🐾',
      'My Holy Ring channels Light even when the night gets dark. ✨',
    ],
    battleQuotes: ['Too slow! Lightning Paw! ⚡🐾'],
    selfStories: [
      "I wear these oversized SaberLeomon claw gloves so every strike lands with Champion force! 🥊",
      "People see a cute cat and drop their guard—classic mistake before Lightning Paw hits! 😼⚡",
    ],
    curiousQuestions: [
      "Hey partner—are you a cat person, dog person, or secret dragon admirer? 😼✨",
      "What's one small thing today that genuinely made you happy? 💖",
    ],
  },

  wargreymon: {
    name: 'WarGreymon',
    speciesId: 'wargreymon',
    stage: 'Mega',
    vibe: 'Legendary Dragon-Man hero clad in Chrome Digizoid, noble, calm, and unwavering.',
    catchphrases: ['Terra Force!', 'For all Digital and Human worlds!'],
    hungryQuotes: ['Even an Ultimate Mega warrior must refuel between legends. Meat, partner! 🥩'],
    sickQuotes: ['A rare anomaly pierces even Chrome Digizoid... lend me strength. 💊'],
    poopQuotes: ['Let us keep the sanctum spotless, Tamer. 🧹'],
    happyQuotes: ['With our hearts synchronized, no darkness can stand against us! ☀️🛡️'],
    idleQuotes: [
      'My Dramon Killers are calm—ready only when peace demands defense. ⚔️',
      'Looking back from Fresh to Mega... every hour we trained mattered. ✨',
    ],
    battleQuotes: ['Gather the energy of the earth! TERRA FORCE!! ☀️🔥'],
    selfStories: [
      "Behind the Brave Shield on my back beats the same hungry Agumon heart you raised from day one. 🔥💛",
      "Chrome Digizoid armor is forged not just from data, but from every trial we endured together. 🛡️",
    ],
    curiousQuestions: [
      "Partner, what journey or dream in your life are you proudest of so far? 🌟",
      "Even heroes rest—how do you recharge your spirit after a long week? ☀️",
    ],
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
  catchphrases: ["Let's explore!", 'Digi-Power!', 'Together forever!'],
  hungryQuotes: [
    "Tamer! I'm starving, got any Big Meat? 🍖",
    'Energy core dropping! Feed me delicious meat! 🥩',
  ],
  sickQuotes: [
    "Achoo... I don't feel well! Need vitamins! 💊",
    'Digital glitch detected... please give me medicine! 🩹',
  ],
  poopQuotes: [
    'Uh oh... Tamer, can you clean up my poop? 💩',
    'Oops! Made a little mess on the screen! Flush please! 🧹',
  ],
  happyQuotes: [
    "Hehe! You're the best Tamer ever! ✨",
    "I'm feeling super energized and happy with you! 💖",
  ],
  idleQuotes: [
    'Keeping watch over your screen while you work! 🛡️',
    "Let's go train at the gym! I wanna digivolve! 🥊",
    "Check out my stats in the Digivice! I'm getting stronger! 📈",
    'File Island is peaceful today. Ready for whatever comes! 🌴',
  ],
  battleQuotes: ["Ready for battle! Let's win in the Colosseum! ⚔️"],
  selfStories: [
    'Sometimes I daydream about exploring untouched zones of the Digital World with you! 🌐',
    'Every gym session makes my Digi-Core hum a little brighter! ⚡',
    'Even when you are busy, I love keeping quiet company right here on your screen. 💖',
  ],
  curiousQuestions: [
    "Hey Tamer, how's your day treating you so far? 😊",
    "What's your favorite comfort food or snack when you take a break? 🍜",
    "What hobby do you enjoy most when you've got time to yourself? ✨",
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

  const attributeFlavor =
    dbMon.attribute === 'Vaccine'
      ? 'protecting friends and keeping justice sharp'
      : dbMon.attribute === 'Virus'
      ? 'pushing past limits with fierce untamed grit'
      : 'analyzing patterns and mastering clever tactics';

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
    battleQuotes: [`${moveName}, full power! Let's win this, Tamer! ⚔️🔥`],
    selfStories: [
      `As a ${dbMon.type} Digimon, I'm big on ${attributeFlavor}! ✨`,
      `Wait till you see me perfect ${moveName}—I've been visualizing the timing all afternoon! ⚡`,
      `Carrying the Crest of ${dbMon.crest} reminds me why we keep growing stronger together. 🌟`,
    ],
    curiousQuestions: [
      `Hey Tamer, what's something you've been enjoying lately outside the Digital World? 😊`,
      `If we had a whole day off from training, what's your favorite way to relax? ☕`,
      `Out of curiosity, Tamer, what's your go-to favorite food? 🍽️`,
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
    .replace(/\b(Hey|Hi|Thanks|Love you|miss you|Darling)\s+Tamer\b/gi, `$1 ${name}`)
    .replace(/\bTamer(?=[!,?])/g, name)
    .replace(/,\s*Tamer\b/g, `, ${name}`)
    .replace(/\bloves Tamer\b/gi, `loves ${name}`)
    .replace(/\bpartner(?=[!,?])/g, name);
}

// Non-annoying cooldown state so Digimon never nag with constant questions
let lastCuriousQuestionAtMs = 0;
let quotesSinceCuriousQuestion = 2; // Allow first occasional question after a few idle chats
const QUESTION_COOLDOWN_MS = 180_000; // 3 minutes minimum between ambient curious questions
const MIN_QUOTES_BETWEEN_QUESTIONS = 4;

/**
 * Smart contextual dialogue generator (Instant offline fallback + ambient personality)
 * Balances helpful alerts, species self-stories, memory callbacks, and infrequent curious questions.
 */
export function getContextualQuote(
  speciesId?: string,
  state?: {
    playerName?: string;
    tamerProfile?: TamerBondProfile;
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
    return finalize('Zzz... counting sheep-mon in the Digital Dream... 💤');
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

  const now = Date.now();
  const canAskQuestion =
    quotesSinceCuriousQuestion >= MIN_QUOTES_BETWEEN_QUESTIONS &&
    now - lastCuriousQuestionAtMs >= QUESTION_COOLDOWN_MS;

  const roll = Math.random();

  // Occasional warm question about the Tamer (~22% only when cooldown is ready)
  if (canAskQuestion && roll < 0.22) {
    const qList = profile.curiousQuestions.length
      ? profile.curiousQuestions
      : DEFAULT_PERSONALITY.curiousQuestions;
    lastCuriousQuestionAtMs = now;
    quotesSinceCuriousQuestion = 0;
    return finalize(qList[Math.floor(Math.random() * qList.length)]);
  }

  quotesSinceCuriousQuestion += 1;

  // Occasional callback to remembered facts about the Tamer
  const tp = state?.tamerProfile;
  if (tp && roll < 0.34) {
    if (tp.favoriteFood && Math.random() < 0.5) {
      return finalize(
        `I still remember you love ${tp.favoriteFood}, Tamer! Hope you get some soon! 😋`
      );
    }
    if (tp.hobbies && tp.hobbies.length > 0) {
      const hobby = tp.hobbies[Math.floor(Math.random() * tp.hobbies.length)];
      return finalize(
        `Hope you get some fun time for ${hobby} today, Tamer! I'm cheering you on! ✨`
      );
    }
  }

  // Share something about itself (~28% of ambient remarks)
  if (roll < 0.62) {
    const stories = profile.selfStories.length
      ? profile.selfStories
      : DEFAULT_PERSONALITY.selfStories;
    return finalize(stories[Math.floor(Math.random() * stories.length)]);
  }

  if (state?.happiness && state.happiness > 75 && Math.random() < 0.5) {
    const list = profile.happyQuotes.length ? profile.happyQuotes : DEFAULT_PERSONALITY.happyQuotes;
    return finalize(list[Math.floor(Math.random() * list.length)]);
  }

  const idleList = profile.idleQuotes.length ? profile.idleQuotes : DEFAULT_PERSONALITY.idleQuotes;
  return finalize(idleList[Math.floor(Math.random() * idleList.length)]);
}

/**
 * Generates an opening greeting when opening Talk to Digimon — usually shares a personal
 * thought/story, and only occasionally asks a warm question about the Tamer (never pushy).
 */
export function pickDigimonTalkGreeting(
  speciesId?: string,
  opts?: {
    playerName?: string;
    tamerProfile?: TamerBondProfile;
    hunger?: number;
    happiness?: number;
    isSick?: boolean;
  }
): { text: string; askedQuestion: boolean } {
  const profile = getPersonalityProfile(speciesId);
  const finalize = (q: string) => personalizeQuoteForPlayer(q, opts?.playerName);

  if (opts?.isSick) {
    const list = profile.sickQuotes.length ? profile.sickQuotes : DEFAULT_PERSONALITY.sickQuotes;
    return { text: finalize(list[0]), askedQuestion: false };
  }
  if ((opts?.hunger ?? 100) < 30) {
    const list = profile.hungryQuotes.length ? profile.hungryQuotes : DEFAULT_PERSONALITY.hungryQuotes;
    return { text: finalize(list[0]), askedQuestion: false };
  }

  const now = Date.now();
  const lastAsked = opts?.tamerProfile?.lastQuestionAskedAt ?? lastCuriousQuestionAtMs;
  const allowQuestion = now - lastAsked >= QUESTION_COOLDOWN_MS;

  if (allowQuestion && Math.random() < 0.35) {
    const qList = profile.curiousQuestions.length
      ? profile.curiousQuestions
      : DEFAULT_PERSONALITY.curiousQuestions;
    lastCuriousQuestionAtMs = now;
    quotesSinceCuriousQuestion = 0;
    return {
      text: finalize(qList[Math.floor(Math.random() * qList.length)]),
      askedQuestion: true,
    };
  }

  const stories = profile.selfStories.length
    ? profile.selfStories
    : DEFAULT_PERSONALITY.selfStories;
  const idle = profile.idleQuotes.length ? profile.idleQuotes : DEFAULT_PERSONALITY.idleQuotes;
  const pool = Math.random() < 0.65 ? stories : idle;
  return {
    text: finalize(pool[Math.floor(Math.random() * pool.length)]),
    askedQuestion: false,
  };
}

/**
 * Lightweight client-side extractor that remembers brief facts a Tamer shares in conversation.
 */
export function extractTamerProfileFacts(
  userText: string,
  existing?: TamerBondProfile
): TamerBondProfile | null {
  const clean = userText.trim();
  if (!clean || clean.length < 3 || clean.endsWith('?')) return null;

  const next: TamerBondProfile = {
    ...(existing || {}),
    hobbies: [...(existing?.hobbies || [])],
    recentFacts: [...(existing?.recentFacts || [])],
  };
  let changed = false;

  const foodMatch = clean.match(
    /(?:my favorite food is|favorite snack is|i love eating|i really love|craving)\s+([a-zA-Z0-9\s'-]{2,28})/i
  );
  if (foodMatch?.[1]) {
    const val = foodMatch[1].replace(/[.!,]+$/, '').trim();
    if (val && val.length >= 2) {
      next.favoriteFood = val;
      changed = true;
    }
  }

  const colorMatch = clean.match(/(?:my favorite color is|i love the color)\s+([a-zA-Z\s-]{2,20})/i);
  if (colorMatch?.[1]) {
    const val = colorMatch[1].replace(/[.!,]+$/, '').trim();
    if (val) {
      next.favoriteColor = val;
      changed = true;
    }
  }

  const hobbyMatch = clean.match(
    /(?:i like to|i love to|my hobby is|my hobbies are|i enjoy)\s+([a-zA-Z0-9\s,'-]{3,36})/i
  );
  if (hobbyMatch?.[1]) {
    const val = hobbyMatch[1].replace(/[.!]+$/, '').trim();
    if (val && !next.hobbies!.some((h) => h.toLowerCase() === val.toLowerCase())) {
      next.hobbies = [val, ...(next.hobbies || [])].slice(0, 4);
      changed = true;
    }
  }

  const moodMatch = clean.match(
    /(?:today i feel|i'm feeling|i feel|my day (?:is|was))\s+([a-zA-Z0-9\s'-]{3,28})/i
  );
  if (moodMatch?.[1]) {
    const val = moodMatch[1].replace(/[.!,]+$/, '').trim();
    if (val) {
      next.moodNote = val;
      changed = true;
    }
  }

  if (changed) {
    const summaryBits = [
      next.favoriteFood ? `Loves ${next.favoriteFood}` : '',
      next.hobbies?.[0] ? `Enjoys ${next.hobbies[0]}` : '',
      next.favoriteColor ? `Fav color: ${next.favoriteColor}` : '',
    ].filter(Boolean);
    next.recentFacts = summaryBits.slice(0, 5);
    return next;
  }

  return null;
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
  tamerProfile?: TamerBondProfile;
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
