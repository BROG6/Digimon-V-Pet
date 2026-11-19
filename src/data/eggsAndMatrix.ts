import {
  DigiEggInfo,
  DigimonSpecies,
  SpecialItemId,
  SpecialItemInfo,
  EvolutionArchetype,
  DigimonStage,
} from '../types/digimon';

export interface SpecialItemCatalogEntry extends SpecialItemInfo {}

export const SPECIAL_ITEMS: Record<SpecialItemId, SpecialItemInfo> = {
  courage_crest: {
    id: 'courage_crest',
    name: 'Crest of Courage (Digi-Egg)',
    shortName: 'Courage Crest',
    icon: '🔥',
    price: 75,
    eggId: 'egg-courage',
    armorSpeciesId: 'flamedramon',
    description: 'Equippable Relic for Egg 01 (Dragon / Fire). Triggers Armor Digivolution into Fladramon at Rookie stage!',
  },
  love_crest: {
    id: 'love_crest',
    name: 'Crest of Love (Digi-Egg)',
    shortName: 'Love Crest',
    icon: '💖',
    price: 75,
    eggId: 'egg-love',
    armorSpeciesId: 'halsemon',
    description: 'Equippable Relic for Egg 03 (Avian / Wind). Triggers Armor Digivolution into Holsmon at Rookie stage!',
  },
  knowledge_crest: {
    id: 'knowledge_crest',
    name: 'Crest of Knowledge (Digi-Egg)',
    shortName: 'Knowledge Crest',
    icon: '🔮',
    price: 75,
    eggId: 'egg-knowledge',
    armorSpeciesId: 'digmon',
    description: 'Equippable Relic for Egg 04 (Insect / Cyborg). Triggers Armor Digivolution into Digmon at Rookie stage!',
  },
  hope_crest: {
    id: 'hope_crest',
    name: 'Crest of Hope (Digi-Egg)',
    shortName: 'Hope Crest',
    icon: '⭐',
    price: 75,
    eggId: 'egg-hope',
    armorSpeciesId: 'pegasusmon',
    description: 'Equippable Relic for Egg 07 (Holy / Angel). Triggers Armor Digivolution into Pegasmon at Rookie stage!',
  },
  light_crest: {
    id: 'light_crest',
    name: 'Crest of Light (Digi-Egg)',
    shortName: 'Light Crest',
    icon: '✨',
    price: 75,
    eggId: 'egg-light',
    armorSpeciesId: 'nefertimon',
    description: 'Equippable Relic for Egg 08 (Mystic Feline). Triggers Armor Digivolution into Nefertimon at Rookie stage!',
  },
  destiny_egg: {
    id: 'destiny_egg',
    name: 'Digi-Egg of Destiny / Miracles',
    shortName: 'Destiny Egg',
    icon: '🌟',
    price: 110,
    eggId: 'egg-miracles',
    armorSpeciesId: 'magnamon',
    description: 'Equippable Golden Relic for Egg 09 (Ancient Dragon). Triggers Golden Armor Digivolution into Magnamon!',
  },
};

export interface EggStageBranches {
  vaccine: string;
  data: string;
  virus: string;
  corrupted: string;
  corruptedAlt?: string;
  armor?: { speciesId: string; itemId: SpecialItemId };
}

export interface EggMatrixDefinition {
  eggId: string;
  baby1: string;
  baby2: string;
  rookie: EggStageBranches;
  champion: EggStageBranches;
  ultimate: EggStageBranches;
  mega: EggStageBranches;
}

export const EGG_LINE_MATRIX: Record<string, EggMatrixDefinition> = {
  'egg-courage': {
    eggId: 'egg-courage',
    baby1: 'botamon',
    baby2: 'koromon',
    rookie: { vaccine: 'agumon', data: 'veemon', virus: 'guilmon', corrupted: 'blackagumon' },
    champion: {
      vaccine: 'greymon',
      data: 'exveemon',
      virus: 'growlmon',
      corrupted: 'darktyrannomon',
      armor: { speciesId: 'flamedramon', itemId: 'courage_crest' },
    },
    ultimate: {
      vaccine: 'metalgreymon',
      data: 'wingdramon',
      virus: 'wargrowlmon',
      corrupted: 'bluemeramon',
      corruptedAlt: 'skullgreymon',
    },
    mega: {
      vaccine: 'wargreymon',
      data: 'durandamon',
      virus: 'gallantmon',
      corrupted: 'hiandromon',
      corruptedAlt: 'heavyleomon',
    },
  },
  'egg-friendship': {
    eggId: 'egg-friendship',
    baby1: 'punimon',
    baby2: 'tsunomon',
    rookie: { vaccine: 'gabumon', data: 'terriermon', virus: 'gazimon', corrupted: 'psychemon' },
    champion: { vaccine: 'garurumon', data: 'gargomon', virus: 'fangmon', corrupted: 'dobermon' },
    ultimate: { vaccine: 'weregarurumon', data: 'rapidmon', virus: 'kyukimon', corrupted: 'polarbearmon' },
    mega: { vaccine: 'metalgarurumon', data: 'megagargomon', virus: 'heavyleomon', corrupted: 'skadimon' },
  },
  'egg-love': {
    eggId: 'egg-love',
    baby1: 'nyokimon',
    baby2: 'yokomon',
    rookie: { vaccine: 'biyomon', data: 'hawkmon', virus: 'falcomon', corrupted: 'muchomon' },
    champion: {
      vaccine: 'birdramon',
      data: 'aquilamon',
      virus: 'saberdramon',
      corrupted: 'kokatorimon',
      armor: { speciesId: 'halsemon', itemId: 'love_crest' },
    },
    ultimate: { vaccine: 'garudamon', data: 'silphymon', virus: 'karatenmon', corrupted: 'hippogryphonmon' },
    mega: { vaccine: 'phoenixmon', data: 'valkyrimon', virus: 'ravmon', corrupted: 'crossmon' },
  },
  'egg-knowledge': {
    eggId: 'egg-knowledge',
    baby1: 'pabumon',
    baby2: 'motimon',
    rookie: { vaccine: 'tentomon', data: 'wormmon', virus: 'kunemon', corrupted: 'kokuwamon' },
    champion: {
      vaccine: 'kabuterimon',
      data: 'stingmon',
      virus: 'kuwagamon',
      corrupted: 'flymon',
      corruptedAlt: 'mekanorimon',
      armor: { speciesId: 'digmon', itemId: 'knowledge_crest' },
    },
    ultimate: { vaccine: 'megakabuterimon', data: 'dinobeemon', virus: 'okuwamon', corrupted: 'tankdramon' },
    mega: {
      vaccine: 'herculeskabuterimon',
      data: 'imperialdramonfightermode',
      virus: 'hydramon',
      corrupted: 'hiandromon',
    },
  },
  'egg-sincerity': {
    eggId: 'egg-sincerity',
    baby1: 'yuramon',
    baby2: 'tanemon',
    rookie: { vaccine: 'palmon', data: 'renamon', virus: 'floramon', corrupted: 'mushroomon' },
    champion: { vaccine: 'togemon', data: 'kyubimon', virus: 'woodmon', corrupted: 'vegiemon' },
    ultimate: { vaccine: 'lillymon', data: 'taomon', virus: 'lilamon', corrupted: 'cherrymon' },
    mega: { vaccine: 'rosemon', data: 'sakuyamon', virus: 'hydramon', corrupted: 'puppetmon' },
  },
  'egg-reliability': {
    eggId: 'egg-reliability',
    baby1: 'pichimon',
    baby2: 'bukamon',
    rookie: { vaccine: 'gomamon', data: 'armadillomon', virus: 'otamamon', corrupted: 'syakomon' },
    champion: {
      vaccine: 'ikkakumon',
      data: 'ankiromon',
      virus: 'seadramon',
      corrupted: 'shellmon',
      corruptedAlt: 'octmon',
    },
    ultimate: {
      vaccine: 'zudomon',
      data: 'shakkoumon',
      virus: 'megaseadramon',
      corrupted: 'dagomon',
      corruptedAlt: 'whamon',
    },
    mega: { vaccine: 'vikemon', data: 'slashangemon', virus: 'metalseadramon', corrupted: 'leviamon' },
  },
  'egg-hope': {
    eggId: 'egg-hope',
    baby1: 'poyomon',
    baby2: 'tokomon',
    rookie: { vaccine: 'patamon', data: 'kudamon', virus: 'tsukaimon', corrupted: 'demidevilmon' },
    champion: {
      vaccine: 'angemon',
      data: 'reppamon',
      virus: 'devimon',
      corrupted: 'bakemon',
      armor: { speciesId: 'pegasusmon', itemId: 'hope_crest' },
    },
    ultimate: {
      vaccine: 'magnaangemon',
      data: 'tyilinmon',
      virus: 'neondevimon',
      corrupted: 'phantomon',
      corruptedAlt: 'knightmon',
    },
    mega: {
      vaccine: 'seraphimon',
      data: 'sleipmon',
      virus: 'beelzebumon',
      corrupted: 'durandamon',
      corruptedAlt: 'piedmon',
    },
  },
  'egg-light': {
    eggId: 'egg-light',
    baby1: 'yukimibotamon',
    baby2: 'nyaromon',
    rookie: { vaccine: 'salamon', data: 'gatomon', virus: 'blacktailmon', corrupted: 'gazimon' },
    champion: {
      vaccine: 'darcmon',
      data: 'gatomon',
      virus: 'mikemon',
      corrupted: 'witchmon',
      armor: { speciesId: 'nefertimon', itemId: 'light_crest' },
    },
    ultimate: { vaccine: 'angewomon', data: 'bastemon', virus: 'ladydevimon', corrupted: 'gladimon' },
    mega: { vaccine: 'magnadramon', data: 'ophanimon', virus: 'lilithmon', corrupted: 'bryweludramon' },
  },
  'egg-miracles': {
    eggId: 'egg-miracles',
    baby1: 'chibomon',
    baby2: 'demiveemon',
    rookie: { vaccine: 'veemon', data: 'monodramon', virus: 'ryudamon', corrupted: 'blackguilmon' },
    champion: {
      vaccine: 'veedramon',
      data: 'strikedramon',
      virus: 'ginryumon',
      corrupted: 'growlmonorange',
      armor: { speciesId: 'magnamon', itemId: 'destiny_egg' },
    },
    ultimate: {
      vaccine: 'aeroveedramon',
      data: 'cyberdramon',
      virus: 'hisyaryumon',
      corrupted: 'blackmegalogrowmon',
    },
    mega: { vaccine: 'ulforceveedramon', data: 'justimon', virus: 'owryumon', corrupted: 'chaosdukemon' },
  },
  'egg-shadow': {
    eggId: 'egg-shadow',
    baby1: 'leafmon',
    baby2: 'minomon',
    rookie: { vaccine: 'wormmon', data: 'igamon', virus: 'hagurumon', corrupted: 'dokunemon' },
    champion: { vaccine: 'stingmon', data: 'ninjamon', virus: 'guardromon', corrupted: 'musyamon' },
    ultimate: { vaccine: 'jewelbeemon', data: 'fumamon', virus: 'andromon', corrupted: 'oboromon' },
    mega: { vaccine: 'banchostingmon', data: 'gaioumon', virus: 'hiandromon', corrupted: 'heavyleomon' },
  },
  'egg-wind': {
    eggId: 'egg-wind',
    baby1: 'pururumon',
    baby2: 'poromon',
    rookie: { vaccine: 'hawkmon', data: 'penmon', virus: 'soundbirdmon', corrupted: 'goblimon' },
    champion: { vaccine: 'aquilamon', data: 'dobermon', virus: 'birdramon', corrupted: 'ogremon' },
    ultimate: { vaccine: 'silphymon', data: 'parrotmon', virus: 'garudamon', corrupted: 'digitamamon' },
    mega: { vaccine: 'valkyrimon', data: 'crossmon', virus: 'phoenixmon', corrupted: 'titamon' },
  },
  'egg-earth': {
    eggId: 'egg-earth',
    baby1: 'tsubumon',
    baby2: 'upamon',
    rookie: { vaccine: 'armadillomon', data: 'gotsumon', virus: 'drimogemon', corrupted: 'gizamon' },
    champion: { vaccine: 'ankiromon', data: 'golemon', virus: 'nanimon', corrupted: 'cyclonemon' },
    ultimate: { vaccine: 'shakkoumon', data: 'jagamon', virus: 'triceramon', corrupted: 'vermillimon' },
    mega: { vaccine: 'slashangemon', data: 'spinomon', virus: 'cannondramon', corrupted: 'ultimatebrachiomon' },
  },
  'egg-hazard': {
    eggId: 'egg-hazard',
    baby1: 'jyarimon',
    baby2: 'gigimon',
    rookie: { vaccine: 'guilmon', data: 'dorumon', virus: 'blackguilmon', corrupted: 'shamamon' },
    champion: { vaccine: 'growlmon', data: 'dorugamon', virus: 'meramon', corrupted: 'fugamon' },
    ultimate: { vaccine: 'wargrowlmon', data: 'dorugoramon', virus: 'bluemeramon', corrupted: 'skullmeramon' },
    mega: { vaccine: 'gallantmon', data: 'alphamon', virus: 'gankoomon', corrupted: 'deathmeramon' },
  },
  'egg-mech': {
    eggId: 'egg-mech',
    baby1: 'zerimon',
    baby2: 'gummymon',
    rookie: { vaccine: 'terriermon', data: 'toyagumon', virus: 'solarmon', corrupted: 'chikurimon' },
    champion: { vaccine: 'gargomon', data: 'clockmon', virus: 'tankmon', corrupted: 'raremon' },
    ultimate: { vaccine: 'rapidmon', data: 'datamon', virus: 'tankdramon', corrupted: 'extyranomon' },
    mega: { vaccine: 'megagargomon', data: 'machinedramon', virus: 'hiandromon', corrupted: 'ebemon' },
  },
  'egg-mystic': {
    eggId: 'egg-mystic',
    baby1: 'relemon',
    baby2: 'viximon',
    rookie: { vaccine: 'renamon', data: 'lopmon', virus: 'youkomonrookie', corrupted: 'gazimon' },
    champion: { vaccine: 'kyubimon', data: 'turuiemon', virus: 'youkomon', corrupted: 'wendigomon' },
    ultimate: { vaccine: 'taomon', data: 'antylamon', virus: 'doumon', corrupted: 'cherubimonvice' },
    mega: { vaccine: 'sakuyamon', data: 'cherubimonvirtue', virus: 'kuzuhamon', corrupted: 'belphemon' },
  },
};

export const DIGI_EGGS: DigiEggInfo[] = [
  {
    id: 'egg-courage',
    eggNumber: 1,
    crest: 'courage',
    crestName: 'Dragon / Fire',
    archetypeTitle: 'DRAGON / FIRE',
    crestColor: '#f97316',
    tamerName: 'Botamon → Koromon',
    partnerRookie: 'Agumon',
    baby1Id: 'botamon',
    baby2Id: 'koromon',
    rookiePreviewIds: { vaccine: 'agumon', data: 'veemon', virus: 'guilmon', corrupted: 'blackagumon' },
    armorOption: { speciesId: 'flamedramon', itemId: 'courage_crest', itemLabel: 'Courage Crest' },
    description: 'Burning with draconic fire. Branches into Agumon, V-Mon, Guilmon, or BlackAgumon.',
    eggPrimaryColor: '#fb923c',
    eggPatternColor: '#b45309',
    eggPattern: 'flames',
  },
  {
    id: 'egg-friendship',
    eggNumber: 2,
    crest: 'friendship',
    crestName: 'Canine / Frost Beast',
    archetypeTitle: 'CANINE / FROST',
    crestColor: '#38bdf8',
    tamerName: 'Punimon → Tsunomon',
    partnerRookie: 'Gabumon',
    baby1Id: 'punimon',
    baby2Id: 'tsunomon',
    rookiePreviewIds: { vaccine: 'gabumon', data: 'terriermon', virus: 'gazimon', corrupted: 'psychemon' },
    description: 'Frost-pelted beast egg. Branches into Gabumon, Terriermon, Gazimon, or Psychemon.',
    eggPrimaryColor: '#7dd3fc',
    eggPatternColor: '#0369a1',
    eggPattern: 'stripes',
  },
  {
    id: 'egg-love',
    eggNumber: 3,
    crest: 'love',
    crestName: 'Avian / Wind',
    archetypeTitle: 'AVIAN / WIND',
    crestColor: '#ec4899',
    tamerName: 'Nyokimon → Yokomon',
    partnerRookie: 'Piyomon',
    baby1Id: 'nyokimon',
    baby2Id: 'yokomon',
    rookiePreviewIds: { vaccine: 'biyomon', data: 'hawkmon', virus: 'falcomon', corrupted: 'muchomon' },
    armorOption: { speciesId: 'halsemon', itemId: 'love_crest', itemLabel: 'Love Crest' },
    description: 'Feathered sky-guardian egg. Branches into Piyomon, Hawkmon, Falcomon, or Muchomon.',
    eggPrimaryColor: '#f472b6',
    eggPatternColor: '#9d174d',
    eggPattern: 'spots',
  },
  {
    id: 'egg-knowledge',
    eggNumber: 4,
    crest: 'knowledge',
    crestName: 'Insect / Cyborg',
    archetypeTitle: 'INSECT / CYBORG',
    crestColor: '#a855f7',
    tamerName: 'Pabumon → Motimon',
    partnerRookie: 'Tentomon',
    baby1Id: 'pabumon',
    baby2Id: 'motimon',
    rookiePreviewIds: { vaccine: 'tentomon', data: 'wormmon', virus: 'kunemon', corrupted: 'kokuwamon' },
    armorOption: { speciesId: 'digmon', itemId: 'knowledge_crest', itemLabel: 'Knowledge Crest' },
    description: 'Carapace & circuit egg. Branches into Tentomon, Wormmon, Kunemon, or Kokuwamon.',
    eggPrimaryColor: '#c084fc',
    eggPatternColor: '#6b21a8',
    eggPattern: 'circuit',
  },
  {
    id: 'egg-sincerity',
    eggNumber: 5,
    crest: 'sincerity',
    crestName: 'Plant / Nature',
    archetypeTitle: 'PLANT / NATURE',
    crestColor: '#10b981',
    tamerName: 'Yuramon → Tanemon',
    partnerRookie: 'Palmon',
    baby1Id: 'yuramon',
    baby2Id: 'tanemon',
    rookiePreviewIds: { vaccine: 'palmon', data: 'renamon', virus: 'floramon', corrupted: 'mushroomon' },
    description: 'Verdant botanical egg. Branches into Palmon, Renamon, Floramon, or Mushroomon.',
    eggPrimaryColor: '#34d399',
    eggPatternColor: '#047857',
    eggPattern: 'flower',
  },
  {
    id: 'egg-reliability',
    eggNumber: 6,
    crest: 'reliability',
    crestName: 'Aquatic / Deep Sea',
    archetypeTitle: 'AQUATIC / SEA',
    crestColor: '#0ea5e9',
    tamerName: 'Pitchmon → Pukamon',
    partnerRookie: 'Gomamon',
    baby1Id: 'pichimon',
    baby2Id: 'bukamon',
    rookiePreviewIds: { vaccine: 'gomamon', data: 'armadillomon', virus: 'otamamon', corrupted: 'syakomon' },
    description: 'Deep ocean tide egg. Branches into Gomamon, Armadimon, Otamamon, or Syakomon.',
    eggPrimaryColor: '#94a3b8',
    eggPatternColor: '#0c4a6e',
    eggPattern: 'cross',
  },
  {
    id: 'egg-hope',
    eggNumber: 7,
    crest: 'hope',
    crestName: 'Holy / Angel',
    archetypeTitle: 'HOLY / ANGEL',
    crestColor: '#eab308',
    tamerName: 'Poyomon → Tokomon',
    partnerRookie: 'Patamon',
    baby1Id: 'poyomon',
    baby2Id: 'tokomon',
    rookiePreviewIds: { vaccine: 'patamon', data: 'kudamon', virus: 'tsukaimon', corrupted: 'demidevilmon' },
    armorOption: { speciesId: 'pegasusmon', itemId: 'hope_crest', itemLabel: 'Hope Crest' },
    description: 'Radiant celestial egg. Branches into Patamon, Kudamon, Tsukaimon, or PicoDevimon.',
    eggPrimaryColor: '#fde047',
    eggPatternColor: '#a16207',
    eggPattern: 'star',
  },
  {
    id: 'egg-light',
    eggNumber: 8,
    crest: 'light',
    crestName: 'Mystic Feline',
    archetypeTitle: 'MYSTIC FELINE',
    crestColor: '#f43f5e',
    tamerName: 'YukimiBotamon → Nyaromon',
    partnerRookie: 'Plotmon',
    baby1Id: 'yukimibotamon',
    baby2Id: 'nyaromon',
    rookiePreviewIds: { vaccine: 'salamon', data: 'gatomon', virus: 'blacktailmon', corrupted: 'gazimon' },
    armorOption: { speciesId: 'nefertimon', itemId: 'light_crest', itemLabel: 'Light Crest' },
    description: 'Sacred feline egg. Branches into Plotmon, Tailmon, BlackTailmon, or Gazimon.',
    eggPrimaryColor: '#fda4af',
    eggPatternColor: '#be123c',
    eggPattern: 'sacred',
  },
  {
    id: 'egg-miracles',
    eggNumber: 9,
    crest: 'miracles',
    crestName: 'Ancient Dragon',
    archetypeTitle: 'ANCIENT DRAGON',
    crestColor: '#2563eb',
    tamerName: 'Chibomon → Demiveemon',
    partnerRookie: 'Veemon',
    baby1Id: 'chibomon',
    baby2Id: 'demiveemon',
    rookiePreviewIds: { vaccine: 'veemon', data: 'monodramon', virus: 'ryudamon', corrupted: 'blackguilmon' },
    armorOption: { speciesId: 'magnamon', itemId: 'destiny_egg', itemLabel: 'Destiny Egg' },
    description: 'Royal ancient dragon egg. Branches into Veemon, Monodramon, Ryudamon, or BlackGuilmon.',
    eggPrimaryColor: '#60a5fa',
    eggPatternColor: '#1e3a8a',
    eggPattern: 'dragon',
  },
  {
    id: 'egg-shadow',
    eggNumber: 10,
    crest: 'shadow',
    crestName: 'Shadow Shinobi',
    archetypeTitle: 'SHADOW SHINOBI',
    crestColor: '#6366f1',
    tamerName: 'Leafmon → Minomon',
    partnerRookie: 'Wormmon',
    baby1Id: 'leafmon',
    baby2Id: 'minomon',
    rookiePreviewIds: { vaccine: 'wormmon', data: 'igamon', virus: 'hagurumon', corrupted: 'dokunemon' },
    description: 'Stealthy shinobi & gear egg. Branches into Wormmon, Igamon, Hagurumon, or Dokunemon.',
    eggPrimaryColor: '#4ade80',
    eggPatternColor: '#312e81',
    eggPattern: 'ninja',
  },
  {
    id: 'egg-wind',
    eggNumber: 11,
    crest: 'wind',
    crestName: 'Ancient Bird',
    archetypeTitle: 'ANCIENT BIRD',
    crestColor: '#f43f5e',
    tamerName: 'Pururumon → Poromon',
    partnerRookie: 'Hawkmon',
    baby1Id: 'pururumon',
    baby2Id: 'poromon',
    rookiePreviewIds: { vaccine: 'hawkmon', data: 'penmon', virus: 'soundbirdmon', corrupted: 'goblimon' },
    description: 'Gale-winged raptor egg. Branches into Hawkmon, Penmon, Soundbirdmon, or Goblimon.',
    eggPrimaryColor: '#fb7185',
    eggPatternColor: '#881337',
    eggPattern: 'wind',
  },
  {
    id: 'egg-earth',
    eggNumber: 12,
    crest: 'earth',
    crestName: 'Armored Earth',
    archetypeTitle: 'ARMORED EARTH',
    crestColor: '#d97706',
    tamerName: 'Tsubumon → Upamon',
    partnerRookie: 'Armadimon',
    baby1Id: 'tsubumon',
    baby2Id: 'upamon',
    rookiePreviewIds: { vaccine: 'armadillomon', data: 'gotsumon', virus: 'drimogemon', corrupted: 'gizamon' },
    description: 'Tectonic armor egg. Branches into Armadimon, Gottsumon, Drimogemon, or Gizamon.',
    eggPrimaryColor: '#fcd34d',
    eggPatternColor: '#78350f',
    eggPattern: 'earth',
  },
  {
    id: 'egg-hazard',
    eggNumber: 13,
    crest: 'hazard',
    crestName: 'Hazard Dragon',
    archetypeTitle: 'HAZARD DRAGON',
    crestColor: '#dc2626',
    tamerName: 'Jyarimon → Gigimon',
    partnerRookie: 'Guilmon',
    baby1Id: 'jyarimon',
    baby2Id: 'gigimon',
    rookiePreviewIds: { vaccine: 'guilmon', data: 'dorumon', virus: 'blackguilmon', corrupted: 'shamamon' },
    description: 'Digital Hazard crimson egg. Branches into Guilmon, Dorumon, BlackGuilmon, or Shamamon.',
    eggPrimaryColor: '#f87171',
    eggPatternColor: '#7f1d1d',
    eggPattern: 'hazard',
  },
  {
    id: 'egg-mech',
    eggNumber: 14,
    crest: 'mech',
    crestName: 'Heavy Mechanized',
    archetypeTitle: 'HEAVY MECH',
    crestColor: '#14b8a6',
    tamerName: 'Zerimon → Gummymon',
    partnerRookie: 'Terriermon',
    baby1Id: 'zerimon',
    baby2Id: 'gummymon',
    rookiePreviewIds: { vaccine: 'terriermon', data: 'toyagumon', virus: 'solarmon', corrupted: 'chikurimon' },
    description: 'Heavy artillery & clockwork egg. Branches into Terriermon, ToyAgumon, Solarmon, or Chikurimon.',
    eggPrimaryColor: '#5eead4',
    eggPatternColor: '#134e4a',
    eggPattern: 'mech',
  },
  {
    id: 'egg-mystic',
    eggNumber: 15,
    crest: 'mystic',
    crestName: 'Mystic Fox',
    archetypeTitle: 'MYSTIC FOX',
    crestColor: '#f59e0b',
    tamerName: 'Relemon → Pokomon',
    partnerRookie: 'Renamon',
    baby1Id: 'relemon',
    baby2Id: 'viximon',
    rookiePreviewIds: { vaccine: 'renamon', data: 'lopmon', virus: 'youkomonrookie', corrupted: 'gazimon' },
    description: 'Moonlit Kitsune spirit egg. Branches into Renamon, Lopmon, Youkomon (Rookie), or Gazimon.',
    eggPrimaryColor: '#fde68a',
    eggPatternColor: '#92400e',
    eggPattern: 'moon',
  },
];

// Compact helper to generate clean species entries with stage-balanced stats
const STAGE_STATS: Record<DigimonStage, { hp: number; atk: number; def: number; spd: number; pwr: number }> = {
  egg: { hp: 40, atk: 8, def: 8, spd: 8, pwr: 15 },
  fresh: { hp: 50, atk: 12, def: 9, spd: 11, pwr: 20 },
  'in-training': { hp: 92, atk: 25, def: 19, spd: 23, pwr: 36 },
  rookie: { hp: 162, atk: 54, def: 42, spd: 52, pwr: 72 },
  champion: { hp: 285, atk: 98, def: 80, spd: 78, pwr: 128 },
  ultimate: { hp: 440, atk: 162, def: 128, spd: 118, pwr: 198 },
  mega: { hp: 650, atk: 235, def: 192, spd: 165, pwr: 285 },
};

type SpecTuple = [
  id: string,
  name: string,
  jp: string,
  stage: DigimonStage,
  crest: DigimonSpecies['crest'],
  attr: DigimonSpecies['attribute'],
  type: string,
  color: string,
  moveName: string,
  moveType: DigimonSpecies['signatureMove']['type'],
  soundType: DigimonSpecies['signatureMove']['soundType'],
  desc: string,
  spriteId?: string,
  spriteFilter?: string
];

const RAW_SPECIES: SpecTuple[] = [
  // === BABY I (FRESH) ===
  ['botamon', 'Botamon', 'ボタモン', 'fresh', 'courage', 'Data', 'Slime', '#222222', 'Bubble Blow', 'physical', 'punch', 'A newly born digital infant wrapped in soft black fuzz.'],
  ['punimon', 'Punimon', 'プニモン', 'fresh', 'friendship', 'Data', 'Slime', '#e11d48', 'Bubble Blow', 'physical', 'punch', 'A squishy red blob with three jelly horns.'],
  ['nyokimon', 'Nyokimon', 'ニョキモン', 'fresh', 'love', 'Data', 'Seed', '#22c55e', 'Seed Spit', 'nature', 'punch', 'A botanical seed with fresh green shoots sprouting.'],
  ['pabumon', 'Pabumon', 'バブモン', 'fresh', 'knowledge', 'Data', 'Slime', '#a855f7', 'Adhesive Bubbles', 'physical', 'punch', 'A green gelatinous bubble with big curious eyes.'],
  ['yuramon', 'Yuramon', 'ユラモン', 'fresh', 'sincerity', 'Data', 'Seed', '#86efac', 'Bubble Blow', 'nature', 'punch', 'Drifting seed surrounded by wispy fuzz.'],
  ['pichimon', 'Pitchmon', 'ピチモン', 'fresh', 'reliability', 'Data', 'Slime', '#38bdf8', 'Water Bubble', 'water', 'punch', 'Microscopic aquatic baby wriggling across water droplets.'],
  ['poyomon', 'Poyomon', 'ポヨモン', 'fresh', 'hope', 'Data', 'Slime', '#e0f2fe', 'Frothy Spit', 'physical', 'punch', 'Translucent baby floating gently like a happy jellyfish.'],
  ['yukimibotamon', 'YukimiBotamon', 'ユキミボタモン', 'fresh', 'light', 'Data', 'Slime', '#ffffff', 'Diamond Dust', 'ice', 'punch', 'Pure snow-white baby Digimon cooler than frost.'],
  ['chibomon', 'Chibomon', 'チボモン', 'fresh', 'miracles', 'Free', 'Slime', '#3b82f6', 'Bubble Blow', 'physical', 'punch', 'A lively blue slime carrying ancient dragon data.'],
  ['leafmon', 'Leafmon', 'リーフモン', 'fresh', 'shadow', 'Free', 'Slime', '#22c55e', 'Acid Bubbles', 'nature', 'punch', 'Tiny leaf-tailed baby with quiet shinobi agility.'],
  ['pururumon', 'Pururumon', 'プルルモン', 'fresh', 'wind', 'Free', 'Slime', '#fb7185', 'Bubble Blow', 'physical', 'punch', 'Plump pink cloud-like slime chirping softly.'],
  ['tsubumon', 'Tsubumon', 'ツブモン', 'fresh', 'earth', 'Free', 'Slime', '#eab308', 'Bubble Blow', 'physical', 'punch', 'Tiny horned seed-slime tough as polished amber.'],
  ['jyarimon', 'Jyarimon', 'ジャリモン', 'fresh', 'hazard', 'Free', 'Slime', '#ef4444', 'Hot Bubbles', 'fire', 'punch', 'Fierce scarlet hatchling brimming with fiery spirit.'],
  ['zerimon', 'Zerimon', 'ゼリモン', 'fresh', 'mech', 'Free', 'Slime', '#14b8a6', 'Bubble Blow', 'physical', 'punch', 'Mint-green jelly infant with a single tiny horn.'],
  ['relemon', 'Relemon', 'レレモン', 'fresh', 'mystic', 'Free', 'Slime', '#fbbf24', 'Moon Bubbles', 'holy', 'punch', 'Golden crescent-marked slime born under digital starlight.'],

  // === BABY II (IN-TRAINING) ===
  ['koromon', 'Koromon', 'コロモン', 'in-training', 'courage', 'Data', 'Lesser', '#f43f5e', 'Acid Bubbles', 'physical', 'punch', 'A pink spherical Digimon with bouncy ears who loves Big Meat!'],
  ['tsunomon', 'Tsunomon', 'ツノモン', 'in-training', 'friendship', 'Data', 'Lesser', '#fbbf24', 'Horn Attack', 'physical', 'punch', 'Furry round creature with a sturdy metallic horn.'],
  ['yokomon', 'Yokomon', 'ピョコモン', 'in-training', 'love', 'Data', 'Bulb', '#ec4899', 'Pollen Bubble', 'nature', 'punch', 'Pink bulb topped with a vibrant opening flower bloom.'],
  ['motimon', 'Motimon', 'モチモン', 'in-training', 'knowledge', 'Data', 'Lesser', '#ec4899', 'Elastic Bubbles', 'physical', 'punch', 'Soft like mochi rice cake with surprising intellect.'],
  ['tanemon', 'Tanemon', 'タネモン', 'in-training', 'sincerity', 'Data', 'Bulb', '#4ade80', 'Floral Bubbles', 'nature', 'punch', 'Burrows in flowerbeds with a four-leaf sprout atop its head.'],
  ['bukamon', 'Pukamon', 'プカモン', 'in-training', 'reliability', 'Data', 'Lesser', '#0284c7', 'Water Bubbles', 'water', 'punch', 'Playful aquatic tadpole with orange crest fins.'],
  ['tokomon', 'Tokomon', 'トコモン', 'in-training', 'hope', 'Data', 'Lesser', '#fef08a', 'Bite', 'physical', 'punch', 'Cute wing-eared fluffball hiding razor-sharp chompers!'],
  ['nyaromon', 'Nyaromon', 'ニャロモン', 'in-training', 'light', 'Data', 'Lesser', '#fed7aa', 'Fox Tail', 'physical', 'punch', 'Curious cat-like creature with striped tail and keen yellow eyes.'],
  ['demiveemon', 'Demiveemon', 'チビモン', 'in-training', 'miracles', 'Free', 'Lesser', '#2563eb', 'Hop Attack', 'physical', 'punch', 'Energetic blue dragon hatchling with a white V-crest.'],
  ['minomon', 'Minomon', 'ミノモン', 'in-training', 'shadow', 'Free', 'Larva', '#16a34a', 'Pinecone Tackle', 'nature', 'punch', 'Quiet bagworm larva tucked in a leafy cloak.'],
  ['poromon', 'Poromon', 'ポロモン', 'in-training', 'wind', 'Free', 'Lesser', '#f43f5e', 'Baby Breeze', 'physical', 'punch', 'Feathered red chick with tiny fluttering crest wings.'],
  ['upamon', 'Upamon', 'ウパモン', 'in-training', 'earth', 'Free', 'Amphibian', '#f59e0b', 'Shock Shout', 'electric', 'howl', 'Round yellow amphibian with armored ear fins.'],
  ['gigimon', 'Gigimon', 'ギギモン', 'in-training', 'hazard', 'Free', 'Lesser', '#dc2626', 'Hot Bite', 'fire', 'punch', 'Spunky crimson dragon baby eager for Big Meat and battles.'],
  ['gummymon', 'Gummymon', 'グミモン', 'in-training', 'mech', 'Free', 'Lesser', '#10b981', 'Double Bubble', 'physical', 'punch', 'Floppy-eared green sprite with twin horn crests.'],
  ['viximon', 'Pokomon', 'ポコモン', 'in-training', 'mystic', 'Data', 'Lesser', '#eab308', 'Killing Stone', 'holy', 'punch', 'Fluffy golden fox pup radiating ancient mystical energy.'],

  // === EGG 01: DRAGON / FIRE ===
  ['agumon', 'Agumon', 'アグモン', 'rookie', 'courage', 'Vaccine', 'Reptile', '#f59e0b', 'Pepper Breath', 'fire', 'blast', 'Spirited bipedal reptile with sharp claws and fiery breath.'],
  ['veemon', 'V-Mon', 'ブイモン', 'rookie', 'courage', 'Data', 'Dragon', '#2563eb', 'Vee-Headbutt', 'physical', 'punch', 'High-energy blue dragon warrior with boundless heroic potential.'],
  ['guilmon', 'Guilmon', 'ギルモン', 'rookie', 'courage', 'Virus', 'Reptile', '#dc2626', 'Pyro Sphere', 'fire', 'blast', 'Playful crimson dinosaur carrying the Digital Hazard mark.'],
  ['blackagumon', 'BlackAgumon', 'ブラックアグモン', 'rookie', 'courage', 'Virus', 'Reptile', '#334155', 'Black Flame', 'dark', 'blast', 'Wild dark-virus reptile born from neglected combat instincts.', 'agumon', 'brightness(0.45) contrast(1.45) saturate(0.45) hue-rotate(190deg)'],
  ['greymon', 'Greymon', 'グレイモン', 'champion', 'courage', 'Vaccine', 'Dinosaur', '#ea580c', 'Mega Flame', 'fire', 'blast', 'Gigantic armored dinosaur with an impenetrable skull helmet.'],
  ['exveemon', 'XV-mon', 'エクスブイモン', 'champion', 'courage', 'Data', 'Mythical Dragon', '#1d4ed8', 'X-Laser', 'electric', 'laser', 'Winged blue dragon knight firing scorching chest X-beams.'],
  ['growlmon', 'Growmon', 'グラウモン', 'champion', 'courage', 'Virus', 'Dark Dragon', '#b91c1c', 'Exhaust Flame', 'fire', 'blast', 'Towering crimson demon-dragon swinging plasma wrist blades.'],
  ['darktyrannomon', 'DarkTyrannomon', 'ダークティラノモン', 'champion', 'courage', 'Virus', 'Dinosaur', '#1e293b', 'Fire Blast', 'dark', 'blast', 'Corrupted ferocious dinosaur shrouded in obsidian armor.', 'tyrannomon', 'brightness(0.42) contrast(1.4) saturate(0.55) hue-rotate(240deg)'],
  ['flamedramon', 'Fladramon', 'フレイドラモン', 'champion', 'courage', 'Free', 'Dragon Man', '#ef4444', 'Fire Rocket', 'fire', 'blast', 'Armor-evolved Fire Dragon blazing with the Crest of Courage!'],
  ['metalgreymon', 'MetalGreymon', 'メタルグレイモン', 'ultimate', 'courage', 'Vaccine', 'Cyborg', '#dc2626', 'Giga Blaster', 'fire', 'blast', 'Mechanized dinosaur armed with a Chrome Digizoid Trident Arm.'],
  ['wingdramon', 'Wingdramon', 'ウイングドラモン', 'ultimate', 'courage', 'Data', 'Sky Dragon', '#0ea5e9', 'Blaze Sonic', 'fire', 'laser', 'Supersonic sky dragon slicing stratospheres with colossal wings.'],
  ['wargrowlmon', 'MegaloGrowmon', 'メガログラウモン', 'ultimate', 'courage', 'Virus', 'Cyborg', '#b91c1c', 'Atomic Blaster', 'fire', 'laser', 'Heavy Chrome-Digizoid dragon armed with twin chest cannons.'],
  ['bluemeramon', 'BlueMeramon', 'ブルーメラモン', 'ultimate', 'courage', 'Virus', 'Flame', '#38bdf8', 'Cold Flame', 'fire', 'blast', 'Blazing cerulean inferno whose cold blue fire melts chrome.'],
  ['skullgreymon', 'SkullGreymon', 'スカルグレイモン', 'ultimate', 'courage', 'Virus', 'Undead', '#94a3b8', 'Dark Shot', 'dark', 'blast', 'Skeletal dragon driven purely by berserk combat instinct.', 'blackwargreymon', 'grayscale(0.85) brightness(1.15) contrast(1.4)'],
  ['wargreymon', 'WarGreymon', 'ウォーグレイモン', 'mega', 'courage', 'Vaccine', 'Dragon Man', '#f97316', 'Terra Force', 'fire', 'laser', 'Ultimate Dragon Warrior clad in Gold Chrome Digizoid armor.'],
  ['durandamon', 'Durandamon', 'デュランダモン', 'mega', 'courage', 'Data', 'Weapon', '#eab308', 'Zweihander', 'holy', 'laser', 'Legendary golden Dragon-Blade sovereign forged of pure Chrome Digizoid.'],
  ['gallantmon', 'Dukemon', 'デュークモン', 'mega', 'courage', 'Virus', 'Holy Knight', '#dc2626', 'Royal Saber', 'holy', 'laser', 'Crimson Royal Knight balancing Virus hazard power with noble chivalry.'],
  ['hiandromon', 'HiAndromon', 'ハイアンドロモン', 'mega', 'courage', 'Vaccine', 'Cyborg', '#475569', 'Atomic Ray', 'electric', 'laser', 'Chrome Digizoid cybernetic colossus firing neutron beams.'],
  ['heavyleomon', 'HeavyLeomon', 'ヘヴィーレオモン', 'mega', 'courage', 'Data', 'Machine', '#ca8a04', 'Sonic Excavator', 'physical', 'blast', 'Heavy-armored lion mech packing titanic pile-bunker fists.'],

  // === EGG 02: CANINE / FROST BEAST ===
  ['gabumon', 'Gabumon', 'ガブモン', 'rookie', 'friendship', 'Data', 'Reptile', '#0284c7', 'Blue Blaster', 'ice', 'blast', 'Shy reptile wrapped in Garurumon pelt, fiercely loyal to friends.'],
  ['terriermon', 'Terriermon', 'テリアモン', 'rookie', 'friendship', 'Vaccine', 'Beast', '#10b981', 'Blazing Fire', 'fire', 'blast', 'Cheerful twin-eared terrier beast packing surprising wind-fire power.'],
  ['gazimon', 'Gazimon', 'ガジモン', 'rookie', 'friendship', 'Virus', 'Mammal', '#6366f1', 'Electric Stun', 'dark', 'punch', 'Scrappy clawed mammal known for relentless ambush tactics.'],
  ['psychemon', 'Psychemon', 'サイケモン', 'rookie', 'friendship', 'Data', 'Reptile', '#ec4899', 'Colored Sparkle', 'ice', 'blast', 'Wild neon-striped beast wearing a psychedelic Garurumon pelt.', 'gabumon', 'hue-rotate(115deg) saturate(1.45)'],
  ['garurumon', 'Garurumon', 'ガルルモン', 'champion', 'friendship', 'Vaccine', 'Beast', '#0ea5e9', 'Howling Blaster', 'ice', 'howl', 'Swift arctic wolf whose silver-blue pelt deflects blades.'],
  ['gargomon', 'Galgomon', 'ガルゴモン', 'champion', 'friendship', 'Vaccine', 'Beast Man', '#22c55e', 'Gargo Laser', 'physical', 'blast', 'Denim-clad beast gunner wielding dual rapid-fire gatling arms.'],
  ['fangmon', 'Fangmon', 'ファングモン', 'champion', 'friendship', 'Virus', 'Demon Beast', '#991b1b', 'Snipe Bite', 'dark', 'howl', 'Crimson-furred predator wolf stalking dark digital forests.', 'garurumon', 'hue-rotate(145deg) saturate(1.6) brightness(0.75)'],
  ['dobermon', 'Dobermon', 'ドーベルモン', 'champion', 'friendship', 'Virus', 'Demon Beast', '#1e293b', 'Grau Lärm', 'dark', 'howl', 'Jet-black hound tracker whose howl freezes prey.', 'garurumon', 'brightness(0.45) contrast(1.45) saturate(0.35)'],
  ['weregarurumon', 'WereGarurumon', 'ワーガルルモン', 'ultimate', 'friendship', 'Vaccine', 'Beast Man', '#3b82f6', 'Wolf Claw', 'physical', 'punch', 'Agile martial-artist werewolf striking with crescent talons.'],
  ['rapidmon', 'Rapidmon', 'ラピッドモン', 'ultimate', 'friendship', 'Vaccine', 'Cyborg', '#16a34a', 'Rapid Fire', 'electric', 'laser', 'Supersonic green cyborg hound locking onto foes with homing lasers.'],
  ['kyukimon', 'Kyukimon', 'キュウキモン', 'ultimate', 'friendship', 'Virus', 'Bewitching Beast', '#a855f7', 'Blade Twister', 'dark', 'howl', 'Razor-armed winged beast gliding silently across moonlit arenas.'],
  ['polarbearmon', 'PolarBearmon', 'ポーラーベアモン', 'ultimate', 'friendship', 'Vaccine', 'Beast Man', '#e2e8f0', 'Glacier Smash', 'ice', 'blast', 'Armored frost bear crushing enemies beneath glacial gauntlets.'],
  ['metalgarurumon', 'MetalGarurumon', 'メタルガルルモン', 'mega', 'friendship', 'Data', 'Cyborg', '#0284c7', 'Cocytus Breath', 'ice', 'laser', 'Fully mechanized supersonic wolf armed with absolute-zero artillery.'],
  ['megagargomon', 'SaintGalgomon', 'セントガルゴモン', 'mega', 'friendship', 'Vaccine', 'Machine', '#15803d', 'Burst Shot', 'electric', 'blast', 'Colossal tactical mech bristling with shoulder missile pods.'],
  ['skadimon', 'Skadimon', 'スカディモン', 'mega', 'friendship', 'Data', 'Fairy', '#7dd3fc', 'Fimbulvetr', 'ice', 'laser', 'Sovereign ice maiden commanding endless blizzards and crystalline spears.'],

  // === EGG 03: AVIAN / WIND ===
  ['biyomon', 'Piyomon', 'ピヨモン', 'rookie', 'love', 'Vaccine', 'Bird', '#f472b6', 'Spiral Twister', 'fire', 'blast', 'Affectionate pink chick Digimon with nimble winged claws.'],
  ['hawkmon', 'Hawkmon', 'ホークモン', 'rookie', 'love', 'Free', 'Bird', '#ef4444', 'Feather Slash', 'physical', 'punch', 'Polite crimson falcon wearing a noble feather crest.'],
  ['falcomon', 'Falcomon', 'ファルコモン', 'rookie', 'love', 'Vaccine', 'Bird', '#475569', 'Scratch Smash', 'physical', 'punch', 'Mountain ninja falcon striking from above with silent speed.', 'pinamon', 'hue-rotate(195deg) brightness(0.75) contrast(1.2)'],
  ['muchomon', 'Muchomon', 'ムーチョモン', 'rookie', 'love', 'Data', 'Bird', '#fb923c', 'Ardent Dance', 'fire', 'blast', 'Colorful tropical parrot Digimon who thrives in warm climates.', 'biyomon', 'hue-rotate(-45deg) saturate(1.4)'],
  ['birdramon', 'Birdramon', 'バードラモン', 'champion', 'love', 'Vaccine', 'Giant Bird', '#ef4444', 'Meteor Wing', 'fire', 'blast', 'Phoenix raptor enveloped in raging digital wildfire.'],
  ['aquilamon', 'Aquilamon', 'アクィラモン', 'champion', 'love', 'Free', 'Giant Bird', '#dc2626', 'Blast Laser', 'fire', 'laser', 'Mach-speed desert eagle with twin horned crests.'],
  ['saberdramon', 'Saberdramon', 'セイバードラモン', 'champion', 'love', 'Virus', 'Giant Bird', '#1e293b', 'Night Roar', 'dark', 'howl', 'Pitch-black shadow raptor streaking across dark skies.', 'birdramon', 'brightness(0.42) contrast(1.5) saturate(0.35)'],
  ['kokatorimon', 'Kokatorimon', 'コカトリモン', 'champion', 'love', 'Data', 'Giant Bird', '#fbbf24', 'Petra Fire', 'electric', 'laser', 'Flightless giant rooster turning reckless foes to stone.'],
  ['halsemon', 'Holsmon', 'ホルスモン', 'champion', 'love', 'Free', 'Beast', '#f97316', 'Tempest Wing', 'fire', 'blast', 'Wings of Love! Armor-evolved supersonic desert falcon.'],
  ['garudamon', 'Garudamon', 'ガルダモン', 'ultimate', 'love', 'Vaccine', 'Bird Man', '#b91c1c', 'Shadow Wing', 'fire', 'blast', 'Heroic avian guardian soaring across the upper stratosphere.'],
  ['silphymon', 'Silphymon', 'シルフィーモン', 'ultimate', 'love', 'Free', 'Bird Man', '#ec4899', 'Static Force', 'electric', 'blast', 'Swift valkyrie-bird warrior harnessing wind pressure shockwaves.'],
  ['karatenmon', 'Karatenmon', 'カラテンモン', 'ultimate', 'love', 'Virus', 'Bird Man', '#334155', 'Satori', 'dark', 'laser', 'Shadow tengu swordsman reading opponents’ next moves.', 'garudamon', 'brightness(0.5) contrast(1.4) hue-rotate(210deg)'],
  ['hippogryphonmon', 'Hippogriffomon', 'ヒポグリフォモン', 'ultimate', 'love', 'Data', 'Mythical Beast', '#eab308', 'Heat Breath', 'fire', 'blast', 'Winged half-griffin guardian defending ancient sky sanctuaries.'],
  ['phoenixmon', 'Hououmon', 'ホウオウモン', 'mega', 'love', 'Vaccine', 'Holy Bird', '#f59e0b', 'Starlight Explosion', 'holy', 'laser', 'Legendary four-winged golden phoenix at the summit of avian Digimon.'],
  ['valkyrimon', 'Valkyrimon', 'ヴァルキリモン', 'mega', 'love', 'Free', 'Warrior', '#38bdf8', 'Fenrir Sword', 'ice', 'laser', 'Golden-armored warrior maiden accompanied by the spirit bird Freyr.'],
  ['ravmon', 'Ravmon', 'レイヴモン', 'mega', 'love', 'Vaccine', 'Cyborg', '#1e293b', 'Blast Wing', 'dark', 'laser', 'White-winged stealth raven knight striking faster than sight.', 'valkyrimon', 'brightness(0.48) contrast(1.45) saturate(0.4)'],
  ['crossmon', 'Crossmon', 'クロスモン', 'mega', 'love', 'Vaccine', 'Cyborg', '#eab308', 'Kaiser Phoenix', 'holy', 'laser', 'Golden Chrome-Digizoid sky titan raining blazing sunbeams.', 'phoenixmon', 'sepia(0.5) saturate(1.6) brightness(1.08)'],

  // === EGG 04: INSECT / CYBORG ===
  ['tentomon', 'Tentomon', 'テントモン', 'rookie', 'knowledge', 'Vaccine', 'Insect', '#dc2626', 'Super Shocker', 'electric', 'laser', 'Polite analytical ladybug crackling with electric antennae.'],
  ['wormmon', 'Wormmon', 'ワームモン', 'rookie', 'knowledge', 'Free', 'Larva', '#16a34a', 'Sticky Net', 'nature', 'punch', 'Gentle emerald larva with hidden Crest of Kindness courage.'],
  ['kunemon', 'Kunemon', 'クネモン', 'rookie', 'knowledge', 'Virus', 'Larva', '#eab308', 'Electric Thread', 'electric', 'laser', 'Zigzag-patterned yellow caterpillar firing shocking silk threads.', 'wormmon', 'hue-rotate(-75deg) saturate(1.45) brightness(1.1)'],
  ['kokuwamon', 'Kokuwamon', 'コクワモン', 'rookie', 'knowledge', 'Data', 'Machine', '#3b82f6', 'Scissor Arms Mini', 'electric', 'punch', 'Stun-gun stag beetle powered by internal dynamo cells.'],
  ['kabuterimon', 'Kabuterimon', 'カブテリモン', 'champion', 'knowledge', 'Vaccine', 'Insect', '#2563eb', 'Electro Shocker', 'electric', 'blast', 'Armored blue rhinoceros beetle firing plasma lightning spheres.'],
  ['stingmon', 'Stingmon', 'スティングモン', 'champion', 'knowledge', 'Free', 'Insect', '#15803d', 'Spiking Finish', 'nature', 'laser', 'Precision insect assassin wielding wrist-mounted energy stingers.'],
  ['kuwagamon', 'Kuwagamon', 'クワガモン', 'champion', 'knowledge', 'Virus', 'Insect', '#dc2626', 'Scissor Arms', 'physical', 'punch', 'Ferocious crimson stag beetle crushing armor in giant mandibles.'],
  ['flymon', 'Flymon', 'フライモン', 'champion', 'knowledge', 'Virus', 'Insect', '#a855f7', 'Brown Stinger', 'dark', 'laser', 'High-speed giant wasp firing toxic stinger needles.'],
  ['mekanorimon', 'Mechanorimon', 'メカノリモン', 'champion', 'knowledge', 'Virus', 'Machine', '#64748b', 'Twinkle Beam', 'electric', 'laser', 'Autonomous walker tank piloted by cybernetic Digimon cores.'],
  ['digmon', 'Digmon', 'ディグモン', 'champion', 'knowledge', 'Free', 'Insect', '#eab308', 'Gold Rush', 'physical', 'blast', 'Knowledge Crest Armor! Heavy subterranean drill beetle.'],
  ['megakabuterimon', 'AtlurKabuterimon', 'アトラーカブテリモン', 'ultimate', 'knowledge', 'Vaccine', 'Insect', '#b91c1c', 'Horn Buster', 'electric', 'laser', 'Crimson armored colossus unleashing gigawatt horn cannons.'],
  ['dinobeemon', 'Dinobeemon', 'ディノビーモン', 'ultimate', 'knowledge', 'Free', 'Mutant', '#16a34a', 'Hell Masquerade', 'dark', 'laser', 'Fierce dragon-insect mutant balancing wild speed and savage claws.'],
  ['okuwamon', 'Okuwamon', 'オオクワモン', 'ultimate', 'knowledge', 'Virus', 'Insect', '#b91c1c', 'Scissor Claw', 'physical', 'punch', 'Upgraded crimson stag beetle tearing Chrome Digizoid apart.'],
  ['tankdramon', 'Tankdramon', 'タンクドラモン', 'ultimate', 'knowledge', 'Virus', 'Machine', '#475569', 'Striver Cannon', 'fire', 'blast', 'Heavy siege dragon tank rolling over entire battlefields.'],
  ['herculeskabuterimon', 'HerakleKabuterimon', 'ヘラクルカブテリモン', 'mega', 'knowledge', 'Vaccine', 'Insect', '#eab308', 'Giga Blaster', 'electric', 'laser', 'Supreme golden insect king wielding twin catastrophic lightning horns.'],
  ['imperialdramonfightermode', 'Imperialdramon FM', 'インペリアルドラモンFM', 'mega', 'knowledge', 'Free', 'Ancient Dragon Man', '#2563eb', 'Positron Laser', 'electric', 'laser', 'Ancient dragon warrior wielding the devastating Positron Laser cannon.'],
  ['hydramon', 'Hydramon', 'ヒュドラモン', 'mega', 'knowledge', 'Virus', 'Vegetation', '#15803d', 'Terrorize Cluster', 'nature', 'blast', 'Three-headed carnivorous botanical dragon blooming in toxic swamps.'],

  // === EGG 05: PLANT / NATURE ===
  ['palmon', 'Palmon', 'パルモン', 'rookie', 'sincerity', 'Data', 'Plant', '#22c55e', 'Poison Ivy', 'nature', 'punch', 'Tropical plant Digimon extending paralytic ivy vines.'],
  ['renamon', 'Renamon', 'レナモン', 'rookie', 'sincerity', 'Data', 'Beast Man', '#eab308', 'Diamond Storm', 'ice', 'laser', 'Stoic golden fox guardian throwing razor crystalline leaves.'],
  ['floramon', 'Floramon', 'フローラモン', 'rookie', 'sincerity', 'Data', 'Plant', '#ec4899', 'Allergy Shower', 'nature', 'blast', 'Sunny floral bud Digimon showering dizzying pollen.', 'lalamon'],
  ['mushroomon', 'Mushroomon', 'マッシュモン', 'rookie', 'sincerity', 'Virus', 'Plant', '#a855f7', 'Poison Smashing', 'nature', 'blast', 'Mischievous toadstool flinging status-inducing spore bombs.'],
  ['togemon', 'Togemon', 'トゲモン', 'champion', 'sincerity', 'Data', 'Plant', '#15803d', 'Needle Spray', 'nature', 'blast', 'Giant boxing cactus unleashing machine-gun spine volleys.'],
  ['kyubimon', 'Kyubimon', 'キュウビモン', 'champion', 'sincerity', 'Data', 'Mythical Beast', '#f97316', 'Fox Tail Inferno', 'fire', 'blast', 'Nine-tailed mystic demon fox cloaked in ethereal azure flames.'],
  ['woodmon', 'Woodmon', 'ウッドモン', 'champion', 'sincerity', 'Virus', 'Plant', '#78350f', 'Branch Drain', 'nature', 'punch', 'Camouflaged elder tree stalking forests with twisting roots.'],
  ['vegiemon', 'Vegiemon', 'ベジーモン', 'champion', 'sincerity', 'Virus', 'Plant', '#ef4444', 'Sweet Breath', 'nature', 'blast', 'Carnivorous vine-plant snapping with noxious pollen breath.', 'redvegiemon'],
  ['lillymon', 'Lilimon', 'リリモン', 'ultimate', 'sincerity', 'Data', 'Fairy', '#f472b6', 'Flower Cannon', 'nature', 'laser', 'Graceful petal fairy firing concentrated flower-cannon beams.'],
  ['taomon', 'Taomon', 'タオモン', 'ultimate', 'sincerity', 'Data', 'Wizard', '#eab308', 'Bonhitsusen', 'holy', 'laser', 'Master Onmyoji fox mystic inscribing sealing talismans in midair.'],
  ['lilamon', 'Lylamon', 'ライラモン', 'ultimate', 'sincerity', 'Data', 'Fairy', '#c084fc', 'Lilac Shower', 'nature', 'laser', 'Graceful lilac maiden firing dual petal beam cannons.'],
  ['cherrymon', 'Cherrymon', 'ジュレイモン', 'ultimate', 'sincerity', 'Virus', 'Plant', '#4d7c0f', 'Illusion Mist', 'nature', 'blast', 'Ancient forest lord weaving illusions and crushing vine traps.'],
  ['rosemon', 'Rosemon', 'ロゼモン', 'mega', 'sincerity', 'Data', 'Fairy', '#be123c', 'Forbidden Temptation', 'nature', 'laser', 'Queen of Flowers wearing Tifaret, wielding thorny rose whips.'],
  ['sakuyamon', 'Sakuyamon', 'サクヤモン', 'mega', 'sincerity', 'Data', 'God Man', '#eab308', 'Amethyst Mandala', 'holy', 'laser', 'Shrine maiden priestess commanding four sacred spirit fox pipes.'],
  ['puppetmon', 'Puppetmon', 'ピノッキモン', 'mega', 'sincerity', 'Virus', 'Puppet', '#b45309', 'Bullet Hammer', 'physical', 'blast', 'Dark Master wooden puppet wielding a gunpowder revolver hammer.'],

  // === EGG 06: AQUATIC / DEEP SEA ===
  ['gomamon', 'Gomamon', 'ゴマモン', 'rookie', 'reliability', 'Vaccine', 'Sea Animal', '#bae6fd', 'Marching Fishes', 'water', 'blast', 'Warm fur seal commanding loyal schools of flying fish.'],
  ['armadillomon', 'Armadimon', 'アルマジモン', 'rookie', 'reliability', 'Free', 'Mammal', '#eab308', 'Diamond Shell', 'physical', 'punch', 'Easygoing armored mammal rolling into impenetrable spheres.'],
  ['otamamon', 'Otamamon', 'オタマモン', 'rookie', 'reliability', 'Virus', 'Amphibian', '#38bdf8', 'Lullaby Bubble', 'water', 'blast', 'Musical blue tadpole singing foes into drowsy stupors.'],
  ['syakomon', 'Syakomon', 'シャコモン', 'rookie', 'reliability', 'Virus', 'Crustacean', '#a855f7', 'Black Pearl Shot', 'water', 'blast', 'Bivalve clam Digimon firing rock-hard pearls from its shell.'],
  ['ikkakumon', 'Ikkakumon', 'イッカクモン', 'champion', 'reliability', 'Vaccine', 'Sea Animal', '#f8fafc', 'Harpoon Torpedo', 'water', 'blast', 'Arctic walrus firing its explosive horn like a homing torpedo.'],
  ['ankiromon', 'Ankylomon', 'アンキロモン', 'champion', 'reliability', 'Free', 'Ankylosaur', '#f59e0b', 'Tail Hammer', 'physical', 'punch', 'Spiked armored dinosaur smashing foes with a heavy tail club.'],
  ['seadramon', 'Seadramon', 'シードラモン', 'champion', 'reliability', 'Data', 'Sea Animal', '#0284c7', 'Ice Arrow', 'ice', 'laser', 'Coiling sea serpent freezing oceans with sub-zero water blasts.'],
  ['shellmon', 'Shellmon', 'シェルモン', 'champion', 'reliability', 'Data', 'Mollusk', '#f472b6', 'Hydro Pressure', 'water', 'blast', 'Hermit-crab titan crushing ships inside its massive pink shell.'],
  ['octmon', 'Octomon', 'オクタモン', 'champion', 'reliability', 'Virus', 'Mollusk', '#ef4444', 'Spurting Ink', 'water', 'blast', 'Pot-helmeted octopus firing blinding ink blasts.', 'octmon'],
  ['zudomon', 'Zudomon', 'ズドモン', 'ultimate', 'reliability', 'Vaccine', 'Sea Animal', '#64748b', 'Vulcan Hammer', 'electric', 'blast', 'Arctic warrior swinging the Chrome-Digizoid Thor Hammer.'],
  ['shakkoumon', 'Shakkoumon', 'シャッコウモン', 'ultimate', 'reliability', 'Free', 'Mutant', '#cbd5e1', 'Aramitama', 'holy', 'laser', 'Sacred clay angel statue firing radiant crimson eye beams.'],
  ['megaseadramon', 'MegaSeadramon', 'メガシードラモン', 'ultimate', 'reliability', 'Data', 'Aquatic', '#dc2626', 'Lightning Javelin', 'electric', 'laser', 'Thunder-horned sea dragon firing crimson lightning spears.'],
  ['dagomon', 'Dagomon', 'ダゴモン', 'ultimate', 'reliability', 'Virus', 'Aquatic', '#0369a1', 'Forbidden Trident', 'water', 'blast', 'Deep-sea abyssal horror commanding dark oceanic whirlpools.', 'divermon'],
  ['whamon', 'Whamon', 'ホエーモン', 'ultimate', 'reliability', 'Vaccine', 'Sea Animal', '#38bdf8', 'Tidal Wave', 'water', 'blast', 'Colossal ocean whale unleashing tidal jets from its blowhole.', 'marinbullmon'],
  ['vikemon', 'Vikemon', 'ヴァイクモン', 'mega', 'reliability', 'Vaccine', 'Beast Man', '#475569', 'Arctic Blizzard', 'ice', 'blast', 'Supreme Viking ruler wielding twin morning stars Mjollnir.'],
  ['slashangemon', 'SlashAngemon', 'スラッシュエンジェモン', 'mega', 'reliability', 'Vaccine', 'Power', '#cbd5e1', 'Heaven Ripper', 'holy', 'laser', 'Six-winged armored blade angel slicing through any barrier.'],
  ['metalseadramon', 'MetalSeadramon', 'メタルシードラモン', 'mega', 'reliability', 'Data', 'Cyborg', '#eab308', 'River of Power', 'electric', 'laser', 'Dark Master armored in golden Chrome Digizoid firing energy beams.'],
  ['leviamon', 'Leviamon', 'リヴァイアモン', 'mega', 'reliability', 'Virus', 'Demon Lord', '#991b1b', 'Rostrum', 'dark', 'blast', 'Colossal Demon Lord of Envy devouring whole oceans in one bite.', 'metalseadramon', 'hue-rotate(155deg) saturate(1.6) brightness(0.65)'],

  // === EGG 07: HOLY / ANGEL ===
  ['patamon', 'Patamon', 'パタモン', 'rookie', 'hope', 'Data', 'Mammal', '#eab308', 'Boom Bubble', 'holy', 'blast', 'Flies on large floppy wing-ears and fires concussive air blasts.'],
  ['kudamon', 'Kudamon', 'クダモン', 'rookie', 'hope', 'Vaccine', 'Holy Beast', '#fef08a', 'Bullet Whirlwind', 'holy', 'laser', 'Sacred pipe-fox spirit coiled around a glowing Holy Cartridge.', 'aegiomon', 'hue-rotate(25deg) brightness(1.1)'],
  ['tsukaimon', 'Tsukaimon', 'ツカイモン', 'rookie', 'hope', 'Virus', 'Mammal', '#a855f7', 'Bad Message', 'dark', 'blast', 'Mischievous violet twin of Patamon firing curse shockwaves.', 'patamon', 'hue-rotate(225deg) brightness(0.8) saturate(1.3)'],
  ['demidevilmon', 'PicoDevimon', 'ピコデビモン', 'rookie', 'hope', 'Virus', 'Evil', '#4c1d95', 'Pico Darts', 'dark', 'laser', 'Cunning miniature bat devil firing venomous needle darts.'],
  ['angemon', 'Angemon', 'エンジェモン', 'champion', 'hope', 'Vaccine', 'Angel', '#fef08a', 'Hand of Fate', 'holy', 'laser', 'Six-winged messenger of justice wielding the sacred Holy Rod.'],
  ['reppamon', 'Reppamon', 'レッパモン', 'champion', 'hope', 'Vaccine', 'Holy Beast', '#f8fafc', 'Vacuum Razor', 'holy', 'laser', 'Swift sacred beast slicing darkness with a bladed tail.', 'unimon'],
  ['devimon', 'Devimon', 'デビモン', 'champion', 'hope', 'Virus', 'Fallen Angel', '#1e293b', 'Touch of Evil', 'dark', 'punch', 'Jet-black fallen angel stretching shadowy claws across arenas.'],
  ['bakemon', 'Bakemon', 'バケモン', 'champion', 'hope', 'Virus', 'Ghost', '#cbd5e1', 'Hell Hand', 'dark', 'blast', 'Floating spectral phantom haunting neglected digital zones.'],
  ['pegasusmon', 'Pegasmon', 'ペガスモン', 'champion', 'hope', 'Free', 'Holy Beast', '#eab308', 'Shooting Star', 'holy', 'laser', 'Wings of Hope! Golden armored winged steed of celestial light.'],
  ['magnaangemon', 'HolyAngemon', 'ホーリーエンジェモン', 'ultimate', 'hope', 'Vaccine', 'Archangel', '#fbbf24', 'Gate of Destiny', 'holy', 'laser', 'Eight-winged celestial priest opening sub-space banishment gates.'],
  ['tyilinmon', 'Tyilinmon', 'チィリンモン', 'ultimate', 'hope', 'Vaccine', 'Holy Beast', '#fef08a', 'Wind Swift', 'holy', 'laser', 'Mythic Qilin soaring across clouds with sacred flame.', 'aegiochusmon', 'brightness(1.15) saturate(1.2)'],
  ['neondevimon', 'NeonDevimon', 'ネオデビモン', 'ultimate', 'hope', 'Virus', 'Artificial', '#7c3aed', 'Guilty Claw', 'dark', 'laser', 'Artificially enhanced masked demon surging with dark plasma.', 'devimon', 'hue-rotate(245deg) saturate(1.7) contrast(1.25)'],
  ['phantomon', 'Phantomon', 'ファントモン', 'ultimate', 'hope', 'Virus', 'Ghost', '#dc2626', 'Soul Chopper', 'dark', 'laser', 'Crimson-cloaked reaper swinging a giant cursed scythe.'],
  ['knightmon', 'Knightmon', 'ナイトモン', 'ultimate', 'hope', 'Data', 'Warrior', '#94a3b8', 'Berserk Sword', 'physical', 'punch', 'Heavy Chrome-Digizoid paladin wielding a massive greatsword.'],
  ['seraphimon', 'Seraphimon', 'セラフィモン', 'mega', 'hope', 'Vaccine', 'Seraph', '#ca8a04', 'Seven Heavens', 'holy', 'laser', 'Highest order ten-winged Seraph clad in gleaming silver armor.'],
  ['sleipmon', 'Sleipmon', 'スレイプモン', 'mega', 'hope', 'Vaccine', 'Holy Knight', '#dc2626', 'Bifrost', 'ice', 'laser', 'Six-legged Royal Knight guardian wielding the ice crossbow Muspelheim.', 'apollomon', 'hue-rotate(190deg) saturate(1.15)'],
  ['beelzebumon', 'Beelzebumon', 'ベルゼブモン', 'mega', 'hope', 'Virus', 'Demon Lord', '#334155', 'Double Impact', 'dark', 'blast', 'Lone Demon Lord gunslinger riding heavy dark-energy firepower.', 'malomyotismon', 'brightness(0.85) contrast(1.25)'],
  ['piedmon', 'Piedmon', 'ピエモン', 'mega', 'hope', 'Virus', 'Wizard', '#7c3aed', 'Trump Sword', 'dark', 'laser', 'Enigmatic Dark Master jester teleporting four lethal blades.'],

  // === EGG 08: MYSTIC FELINE ===
  ['salamon', 'Plotmon', 'プロットモン', 'rookie', 'light', 'Vaccine', 'Mammal', '#fde68a', 'Puppy Howl', 'holy', 'howl', 'Holy puppy prototype wearing a sacred ring collar.'],
  ['gatomon', 'Tailmon', 'テイルモン', 'rookie', 'light', 'Vaccine', 'Holy Beast', '#f43f5e', 'Lightning Paw', 'holy', 'punch', 'Witty sacred cat bearing a Holy Ring and Saber Claws.'],
  ['blacktailmon', 'BlackTailmon', 'ブラックテイルモン', 'rookie', 'light', 'Virus', 'Demon Beast', '#4c1d95', 'Dark Paw', 'dark', 'punch', 'Mischievous black-furred alley cat with razor shadow claws.', 'gatomon', 'brightness(0.42) contrast(1.45) hue-rotate(220deg)'],
  ['darcmon', 'Darcmon', 'ダルクモン', 'champion', 'light', 'Vaccine', 'Angel', '#38bdf8', 'Baptisme d’Amour', 'holy', 'laser', 'Sword-maiden angel warrior fighting with radiant grace.', 'sistermonciel'],
  ['mikemon', 'Mikemon', 'ミケモン', 'champion', 'light', 'Data', 'Beast', '#fb923c', 'Cat Claw', 'physical', 'punch', 'Calico brawler cat unleashing swift martial claw combos.', 'gatomon', 'hue-rotate(-30deg) saturate(1.6) brightness(0.95)'],
  ['witchmon', 'Witchmon', 'ウィッチモン', 'champion', 'light', 'Data', 'Wizard', '#a855f7', 'Baluluna Gale', 'dark', 'laser', 'Broom-riding magical witch casting wind and water hexes.', 'sistermonnoir'],
  ['nefertimon', 'Nefertimon', 'ネフェルティモン', 'champion', 'light', 'Free', 'Holy Beast', '#fef08a', 'Rosetta Stone', 'holy', 'laser', 'Radiance of Light! Golden winged sphinx guardian.'],
  ['angewomon', 'Angewomon', 'エンジェウーモン', 'ultimate', 'light', 'Vaccine', 'Archangel', '#fb7185', 'Celestial Arrow', 'holy', 'laser', 'Eight-winged goddess of light firing sacred lightning arrows.'],
  ['bastemon', 'Bastemon', 'バステモン', 'ultimate', 'light', 'Virus', 'Bewitching Beast', '#c084fc', 'Helter Skelter', 'dark', 'punch', 'Moonlit feline dancer hypnotizing foes before slashing.', 'dianamon'],
  ['ladydevimon', 'LadyDevimon', 'レディーデビモン', 'ultimate', 'light', 'Virus', 'Fallen Angel', '#1e293b', 'Darkness Wave', 'dark', 'laser', 'Darkness arch-rival of Angewomon commanding shadow bats.'],
  ['gladimon', 'Gladimon', 'グラディモン', 'ultimate', 'light', 'Vaccine', 'Warrior', '#cbd5e1', 'Wheel Rush', 'physical', 'punch', 'Spinning armored gladiator knight armed with twin rapiers.'],
  ['magnadramon', 'Holydramon', 'ホーリードラモン', 'mega', 'light', 'Vaccine', 'Holy Dragon', '#fb7185', 'Fire Tornado', 'holy', 'blast', 'Divine pink celestial dragon of the Four Great Dragons.'],
  ['ophanimon', 'Ophanimon', 'オファニモン', 'mega', 'light', 'Vaccine', 'Ophanim', '#10b981', 'Eden Javelin', 'holy', 'laser', 'Emerald-armored Seraphic Queen radiating merciful sacred light.', 'minervamon'],
  ['lilithmon', 'Lilithmon', 'リリスモン', 'mega', 'light', 'Virus', 'Demon Lord', '#9d174d', 'Phantom Pain', 'dark', 'laser', 'Demon Lord of Lust dissolving data with her Nazar Nail.', 'ladydevimon', 'hue-rotate(285deg) saturate(1.5) brightness(0.85)'],
  ['bryweludramon', 'BryweLudramon', 'ブリウエルドラモン', 'mega', 'light', 'Data', 'Weapon', '#dc2626', 'Red Blaze', 'fire', 'blast', 'Unbreakable scarlet shield-dragon forging an impenetrable fortress.'],

  // === EGG 09: ANCIENT DRAGON ===
  ['chibomon', 'Chibomon', 'チボモン', 'fresh', 'miracles', 'Free', 'Slime', '#3b82f6', 'Bubble Blow', 'physical', 'punch', 'A lively blue slime carrying ancient dragon data.'],
  ['monodramon', 'Monodramon', 'モノドラモン', 'rookie', 'miracles', 'Vaccine', 'Mini Dragon', '#7c3aed', 'Beat Knuckle', 'physical', 'punch', 'Scrappy purple dragon eager to test its might in battle.', 'lavorvomon'],
  ['ryudamon', 'Ryudamon', 'リュウダモン', 'rookie', 'miracles', 'Vaccine', 'Beast', '#eab308', 'Iai Blade', 'physical', 'punch', 'Samurai-helmeted dragon carrying ancient blade data.', 'zubamon'],
  ['blackguilmon', 'BlackGuilmon', 'ブラックギルモン', 'rookie', 'miracles', 'Virus', 'Reptile', '#334155', 'Virus Sphere', 'dark', 'blast', 'Shadow-scaled Guilmon surging with chaotic crimson power.', 'guilmon', 'brightness(0.45) contrast(1.45) saturate(0.55)'],
  ['veedramon', 'Veedramon', 'ブイドラモン', 'champion', 'miracles', 'Vaccine', 'Mythical Dragon', '#0ea5e9', 'V-Breath Arrow', 'fire', 'blast', 'Legendary V-crested dragon spitting scorching arrow flames.', 'flamedramon', 'hue-rotate(190deg) saturate(1.35)'],
  ['strikedramon', 'Strikedramon', 'ストライクドラモン', 'champion', 'miracles', 'Vaccine', 'Dragon Man', '#dc2626', 'Strike Fang', 'fire', 'punch', 'Bipedal martial dragon cloaked in fiery gauntlets.', 'lavogaritamon'],
  ['ginryumon', 'Ginryumon', 'ギンリュウモン', 'champion', 'miracles', 'Vaccine', 'Beast Dragon', '#cbd5e1', 'Armor Piercer', 'physical', 'blast', 'Silver-armored samurai dragon charging through enemy lines.', 'zubaeagermon'],
  ['growlmonorange', 'Growmon (Orange)', 'グラウモン(橙)', 'champion', 'miracles', 'Data', 'Dragon', '#f97316', 'Plasma Blade', 'fire', 'blast', 'Amber-scaled mutant Growmon roaring with wild heat.', 'growlmon', 'hue-rotate(32deg) saturate(1.35) brightness(1.08)'],
  ['magnamon', 'Magnamon', 'マグナモン', 'champion', 'miracles', 'Free', 'Holy Knight', '#eab308', 'Extreme Jihad', 'holy', 'laser', 'Golden Miracle Armor Royal Knight unleashing plasma radiance!'],
  ['aeroveedramon', 'AeroVeedramon', 'エアロブイドラモン', 'ultimate', 'miracles', 'Vaccine', 'Holy Dragon', '#0284c7', 'V-Wing Blade', 'fire', 'laser', 'Winged azure dragon slicing skies with razor V-energy.', 'wingdramon', 'hue-rotate(15deg) saturate(1.2)'],
  ['cyberdramon', 'Cyberdramon', 'サイバードラモン', 'ultimate', 'miracles', 'Vaccine', 'Cyborg', '#1e293b', 'Erase Claw', 'dark', 'laser', 'Armored anti-virus dragon hunter erasing rogue data.', 'jazarichmon'],
  ['hisyaryumon', 'Hisyaryumon', 'ヒシャリュウモン', 'ultimate', 'miracles', 'Vaccine', 'Beast Dragon', '#eab308', 'Seiryu Jin', 'holy', 'laser', 'Flying oriental blade dragon soaring through lightning storms.', 'duramon'],
  ['blackmegalogrowmon', 'BlackMegaloGrowmon', 'ブラックメガログラウモン', 'ultimate', 'miracles', 'Virus', 'Cyborg', '#1e293b', 'Black Blaster', 'dark', 'laser', 'Shadow-armored cyborg dragon firing dark atomic blasts.', 'wargrowlmon', 'brightness(0.45) contrast(1.45) saturate(0.45)'],
  ['ulforceveedramon', 'UlforceVeedramon', 'アルフォースブイドラモン', 'mega', 'miracles', 'Vaccine', 'Holy Knight', '#2563eb', 'Shining V-Force', 'holy', 'laser', 'Fastest Royal Knight wielding regenerating Ulforce shields.', 'imperialdramondragonmode', 'hue-rotate(-15deg) saturate(1.2)'],
  ['justimon', 'Justimon', 'ジャスティモン', 'mega', 'miracles', 'Vaccine', 'Cyborg', '#ef4444', 'Justice Kick', 'electric', 'laser', 'Masked scarfed cyborg hero delivering righteous lightning kicks.', 'hiandromon', 'hue-rotate(-25deg) saturate(1.35)'],
  ['owryumon', 'Owryumon', 'オウリュウモン', 'mega', 'miracles', 'Vaccine', 'Beast Dragon', '#eab308', 'Eiseiryuoujin', 'holy', 'laser', 'Golden samurai dragon forged into an invincible twin-blade titan.', 'durandamon', 'hue-rotate(12deg) saturate(1.25)'],
  ['chaosdukemon', 'ChaosDukemon', 'カオスデュークモン', 'mega', 'miracles', 'Virus', 'Dark Knight', '#4c1d95', 'Demon Disaster', 'dark', 'laser', 'Fallen black-armored knight unleashing chaotic dark-lance fury.', 'gallantmon', 'hue-rotate(250deg) brightness(0.65) contrast(1.35)'],

  // === EGG 10: SHADOW SHINOBI ===
  ['igamon', 'Igamon (Ninja)', 'イガモン', 'rookie', 'shadow', 'Data', 'Mutant', '#16a34a', 'Shuriken Toss', 'physical', 'laser', 'Stealthy green shinobi trainee mastering shadow techniques.', 'espimon'],
  ['hagurumon', 'Hagurumon', 'ハグルモン', 'rookie', 'shadow', 'Virus', 'Machine', '#64748b', 'Darkness Gear', 'electric', 'blast', 'Spinning cogwheel machine infecting circuits with virus gears.'],
  ['dokunemon', 'Dokunemon', 'ドクネモン', 'rookie', 'shadow', 'Virus', 'Larva', '#7c3aed', 'Worm Venom', 'dark', 'blast', 'Venomous purple caterpillar lurking inside shadowy thickets.', 'wormmon', 'hue-rotate(175deg) saturate(1.3)'],
  ['ninjamon', 'Ninjamon', 'イガモン', 'champion', 'shadow', 'Data', 'Mutant', '#22c55e', 'Iga-Style Shuriken', 'physical', 'laser', 'Master ninja warrior darting across rooftops with wind blades.', 'hoverespimon'],
  ['guardromon', 'Guardromon', 'ガードロモン', 'champion', 'shadow', 'Virus', 'Machine', '#b45309', 'Guardian Barrage', 'fire', 'blast', 'Heavy bronze mech firing dual wrist-mounted heat missiles.'],
  ['musyamon', 'Musyamon', 'ムシャモン', 'champion', 'shadow', 'Virus', 'Wizard', '#991b1b', 'Shiratori-maru', 'dark', 'laser', 'Fallen samurai phantom swinging a cursed blade.', 'skullknightmon'],
  ['jewelbeemon', 'Jewelbeemon', 'ジュエルビーモン', 'ultimate', 'shadow', 'Vaccine', 'Insect', '#10b981', 'Spike Buster', 'nature', 'laser', 'Emerald-armored insect lancer piercing foes at blur speed.', 'hudiemon', 'hue-rotate(-40deg) saturate(1.3)'],
  ['fumamon', 'Fumamon', 'フウマモン', 'ultimate', 'shadow', 'Data', 'Cyborg', '#38bdf8', 'Thunder Slash', 'electric', 'laser', 'Cybernetic shinobi master wielding glowing twin wind-katanas.'],
  ['andromon', 'Andromon', 'アンドロモン', 'ultimate', 'shadow', 'Vaccine', 'Cyborg', '#64748b', 'Spiral Sword', 'electric', 'laser', 'Prototype cyborg soldier firing spinning energy blades.'],
  ['oboromon', 'Oboromon', 'オボロモン', 'ultimate', 'shadow', 'Virus', 'Ghost', '#6366f1', 'Ghost Slash', 'dark', 'laser', 'Spectral samurai spirit riding phantom flames across dark battlefields.'],
  ['banchostingmon', 'BanchoStingmon', 'バンチョースティングモン', 'mega', 'shadow', 'Free', 'Insect', '#15803d', 'Bloody Finish', 'nature', 'laser', 'Chivalrous rebel insect boss clad in a tattered heroic cloak.', 'stingmon', 'hue-rotate(-15deg) contrast(1.25) saturate(1.3)'],
  ['gaioumon', 'Gaioumon', 'ガイオウモン', 'mega', 'shadow', 'Virus', 'Dragon Man', '#1e293b', 'Gaia Reactor', 'fire', 'laser', 'Eastern samurai dragon warrior wielding twin Kikurin blades.', 'blackwargreymon'],

  // === EGG 11: ANCIENT BIRD ===
  ['penmon', 'Penmon', 'ペンモン', 'rookie', 'wind', 'Data', 'Bird', '#38bdf8', 'Sliding Attack', 'ice', 'punch', 'Playful arctic penguin dashing across icy fields.', 'pinamon'],
  ['soundbirdmon', 'Soundbirdmon', 'サウンドバードモン', 'rookie', 'wind', 'Virus', 'Bird', '#312e81', 'Gigabyte Wing', 'dark', 'howl', 'Bat-winged sound bird emitting disruptive sonic screeches.', 'chiropmon'],
  ['goblimon', 'Goblimon', 'ゴブリモン', 'rookie', 'wind', 'Virus', 'Demon', '#16a34a', 'Goblin Strike', 'fire', 'blast', 'Rowdy club-wielding goblin picking fights everywhere.', 'madleomon', 'hue-rotate(85deg)'],
  ['ogremon', 'Ogremon', 'オーガモン', 'champion', 'wind', 'Virus', 'Demon', '#15803d', 'Pummel Whack', 'dark', 'punch', 'Fierce bone-club ogre hunter always seeking strong rivals.', 'tuskmon', 'hue-rotate(95deg)'],
  ['parrotmon', 'Parrotmon', 'パロットモン', 'ultimate', 'wind', 'Vaccine', 'Giant Bird', '#10b981', 'Mjolnir Thunder', 'electric', 'laser', 'Giant emerald storm-bird summoning sky-splitting lightning.'],
  ['digitamamon', 'Digitamamon', 'デジタマモン', 'ultimate', 'wind', 'Data', 'Perfect', '#eab308', 'Nightmare Syndrome', 'dark', 'blast', 'Mysterious armored egg housing an enigmatic shadow entity.'],
  ['titamon', 'Titamon', 'タイタモン', 'mega', 'wind', 'Virus', 'God Man', '#15803d', 'Soul Core Break', 'dark', 'laser', 'Colossal vengeful titan wielding the bone sword Zanjintou.', 'apocalymon'],

  // === EGG 12: ARMORED EARTH ===
  ['gotsumon', 'Gottsumon', 'ゴツモン', 'rookie', 'earth', 'Data', 'Mineral', '#78716c', 'Angry Rock', 'physical', 'blast', 'Stubborn boulder Digimon chucking rocky punches with vigor.'],
  ['drimogemon', 'Drimogemon', 'ドリモゲモン', 'rookie', 'earth', 'Data', 'Beast', '#2563eb', 'Drill Spin', 'physical', 'punch', 'Nose-drill burrower tunneling straight through bedrock.', 'ludomon'],
  ['gizamon', 'Gizamon', 'ギザモン', 'rookie', 'earth', 'Virus', 'Amphibian', '#0d9488', 'Spiral Edge', 'water', 'punch', 'Spiny-backed amphibious crawler slicing with dorsal fins.'],
  ['golemon', 'Golemon', 'ゴーレモン', 'champion', 'earth', 'Virus', 'Mineral', '#57534e', 'Crimson Curse', 'fire', 'blast', 'Volcanic stone golem powered by an ancient sealed rune.'],
  ['nanimon', 'Nanimon', 'ナニモン', 'champion', 'earth', 'Virus', 'Invader', '#ca8a04', 'Oyaji Punch', 'physical', 'punch', 'Bizarre dimensional invader throwing chaotic knuckle barrages.', 'yakiimon'],
  ['cyclonemon', 'Cyclonemon', 'サイクロモン', 'champion', 'earth', 'Virus', 'Dragon Man', '#b45309', 'Hyper Heat', 'fire', 'blast', 'One-eyed muscular dragon swinging one colossal clawed arm.', 'monochromon'],
  ['jagamon', 'Jagamon', 'ジャガモン', 'ultimate', 'earth', 'Vaccine', 'Plant', '#d97706', 'Fried Potato', 'physical', 'blast', 'Armored giant potato titan launching explosive tuber missiles.'],
  ['triceramon', 'Triceramon', 'トリケラモン', 'ultimate', 'earth', 'Data', 'Ceratopsian', '#b45309', 'Tri-Horn Attack', 'physical', 'blast', 'Three-horned armored juggernaut unstoppable at full charge.'],
  ['vermillimon', 'Vermillimon', 'ヴァーミリモン', 'ultimate', 'earth', 'Data', 'Ankylosaur', '#dc2626', 'Volcano Strike', 'fire', 'blast', 'Molten-red horned dinosaur charging with volcanic force.', 'triceramon', 'hue-rotate(-25deg) saturate(1.5)'],
  ['spinomon', 'Spinomon', 'スピノモン', 'mega', 'earth', 'Virus', 'Dinosaur', '#0284c7', 'Blue Prominence', 'fire', 'laser', 'Blade-spined apex dinosaur slicing Chrome Digizoid cleanly.', 'tuskmon', 'hue-rotate(175deg) brightness(1.05)'],
  ['cannondramon', 'Cannondramon', 'キャノンドラモン', 'mega', 'earth', 'Data', 'Cyborg', '#64748b', 'Dynamo Cannon', 'fire', 'blast', 'Mobile fortress dinosaur equipped with twin siege cannons.', 'gigadramon'],
  ['ultimatebrachiomon', 'UltimateBrachiomon', 'アルティメットブラキモン', 'mega', 'earth', 'Data', 'Cyborg', '#94a3b8', 'Ultimate Blast', 'electric', 'laser', 'Heavily plated cybernetic sauropod shaking continents.', 'machinedramon', 'sepia(0.35) brightness(1.05)'],

  // === EGG 13: HAZARD DRAGON ===
  ['dorumon', 'Dorumon', 'ドルモン', 'rookie', 'hazard', 'Data', 'Beast', '#7c3aed', 'Metal Cannon', 'physical', 'blast', 'Fluffy winged purple dragon-beast with an interface forehead gem.', 'gekkomon', 'hue-rotate(220deg)'],
  ['shamamon', 'Shamamon', 'シャーマモン', 'rookie', 'hazard', 'Virus', 'Demon', '#059669', 'Mad Dance', 'dark', 'punch', 'Tribal mystic goblin swinging a ritual bone club.', 'mushroomon', 'hue-rotate(90deg)'],
  ['dorugamon', 'Dorugamon', 'ドルガモン', 'champion', 'hazard', 'Data', 'Beast Dragon', '#6d28d9', 'Power Metal', 'fire', 'blast', 'Fierce horned dragon-beast firing heavy iron spheres.', 'jazardmon'],
  ['meramon', 'Meramon', 'メラモン', 'champion', 'hazard', 'Data', 'Flame', '#f97316', 'Fireball', 'fire', 'blast', 'Living humanoid inferno incinerating everything it touches.'],
  ['fugamon', 'Fugamon', 'フーガモン', 'champion', 'hazard', 'Virus', 'Demon', '#b45309', 'Evil Hurricane', 'dark', 'blast', 'Storm-summoning crimson ogre swinging a spiked iron club.', 'madleomon', 'hue-rotate(-25deg)'],
  ['dorugoramon', 'Dorugoramon', 'ドルゴラモン', 'ultimate', 'hazard', 'Data', 'Dragon', '#cbd5e1', 'Brave Metal', 'fire', 'laser', 'Armored fantasy dragon unleashed by latent Digital Hazard energy.', 'jazarichmon'],
  ['skullmeramon', 'SkullMeramon', 'デスメラモン', 'ultimate', 'hazard', 'Virus', 'Flame', '#dc2626', 'Heavy Metal Fire', 'fire', 'blast', 'Chained skull-faced inferno raging with blue-hot chains.', 'bluemeramon', 'hue-rotate(150deg) contrast(1.3)'],
  ['alphamon', 'Alphamon', 'アルファモン', 'mega', 'hazard', 'Vaccine', 'Holy Knight', '#1e293b', 'Digitalize of Soul', 'holy', 'laser', 'Mythic Aloof Hermit Royal Knight wielding the Holy Sword Gradalpha.', 'gallantmon', 'brightness(0.45) sepia(0.4) saturate(1.4)'],
  ['gankoomon', 'Gankoomon', 'ガンクゥモン', 'mega', 'hazard', 'Data', 'Holy Knight', '#dc2626', 'Tekken Seisai', 'fire', 'punch', 'Hot-blooded Royal Knight mentor accompanied by Hinukamuy.', 'apollomon'],
  ['deathmeramon', 'DeathMeramon', 'デスメラモン(極)', 'mega', 'hazard', 'Virus', 'Flame', '#7f1d1d', 'Hellfire Burst', 'dark', 'blast', 'Apocalyptic flame colossus radiating scorching hellfire chains.', 'bluemeramon', 'hue-rotate(135deg) brightness(0.65) contrast(1.45)'],

  // === EGG 14: HEAVY MECHANIZED ===
  ['toyagumon', 'ToyAgumon', 'トイアグモン', 'rookie', 'mech', 'Vaccine', 'Puppet', '#ef4444', 'Toy Flame', 'fire', 'blast', 'Plastic-block dinosaur firing sparkling cube-shaped flames.', 'agumon', 'hue-rotate(-18deg) saturate(1.5) contrast(1.15)'],
  ['solarmon', 'Solarmon', 'ソーラーモン', 'rookie', 'mech', 'Vaccine', 'Machine', '#f59e0b', 'Shiny Ring', 'fire', 'blast', 'Solar-powered twin gear machine radiating blinding heat.'],
  ['chikurimon', 'Chikurimon', 'チクリモン', 'rookie', 'mech', 'Virus', 'Mine', '#475569', 'Final Strike', 'electric', 'blast', 'Spiked sea-mine drone floating quietly to ambush intruders.', 'choromon'],
  ['clockmon', 'Clockmon', 'クロックモン', 'champion', 'mech', 'Data', 'Machine', '#eab308', 'Chrono Breaker', 'electric', 'laser', 'Time-controlling clockwork sentinel wielding a giant brass mallet.'],
  ['tankmon', 'Tankmon', 'タンクモン', 'champion', 'mech', 'Data', 'Cyborg', '#64748b', 'Hyper Cannon', 'fire', 'blast', 'Armored battle tank Digimon firing high-caliber plasma shells.'],
  ['raremon', 'Raremon', 'レアモン', 'champion', 'mech', 'Virus', 'Undead', '#84cc16', 'Sludge Breath', 'dark', 'blast', 'Mutated cyborg-ooze held together by corroded scrap iron.'],
  ['datamon', 'Datamon', 'ナノモン', 'ultimate', 'mech', 'Virus', 'Machine', '#eab308', 'Plug Bomb', 'electric', 'blast', 'Microchip genius schemer dropping digital logic bombs.'],
  ['extyranomon', 'Ex-Tyranomon', 'エクスティラノモン', 'ultimate', 'mech', 'Vaccine', 'Puppet', '#f43f5e', 'Pretty Attack', 'dark', 'blast', 'Plush dinosaur costume concealing terrifying compressed dark energy.', 'warumonzaemon'],
  ['machinedramon', 'Machinedramon', 'ムゲンドラモン', 'mega', 'mech', 'Virus', 'Machine', '#94a3b8', 'Giga Cannon', 'electric', 'laser', '100% full-metal Dark Master built from strongest cyborg components.'],
  ['ebemon', 'Ebemon', 'イーバモン', 'mega', 'mech', 'Virus', 'Alien', '#22c55e', 'Brain Rupture', 'electric', 'laser', 'Extraterrestrial cyber-brain invader firing UFO ray guns.', 'datamon', 'hue-rotate(115deg) saturate(1.4) brightness(0.9)'],

  // === EGG 15: MYSTIC FOX ===
  ['lopmon', 'Lopmon', 'ロップモン', 'rookie', 'mystic', 'Data', 'Beast', '#a855f7', 'Blazing Ice', 'ice', 'blast', 'Three-horned floppy-eared twin beast blowing frost spheres.', 'terriermon', 'hue-rotate(195deg) brightness(0.82) saturate(1.2)'],
  ['youkomonrookie', 'Youkomon (Rookie)', 'ヨウコモン(成長期)', 'rookie', 'mystic', 'Virus', 'Bewitching Beast', '#a855f7', 'Wicked Ember', 'dark', 'blast', 'Agile shadow-fox apprentice enveloped in eerie violet flames.', 'youkomon', 'brightness(0.95) saturate(1.2)'],
  ['turuiemon', 'Turuiemon', 'トゥルイエモン', 'champion', 'mystic', 'Data', 'Beast Man', '#eab308', 'Gaken', 'physical', 'punch', 'Kung-fu rabbit martial artist wielding sharp wrist blades.', 'pristimon'],
  ['youkomon', 'Youkomon', 'ヨウコモン', 'champion', 'mystic', 'Virus', 'Bewitching Beast', '#9333ea', 'Evil Flame', 'dark', 'blast', 'Nine-tailed cursed demon fox cloaked in bewitching purple fire.'],
  ['wendigomon', 'Wendigomon', 'ウェンディモン', 'champion', 'mystic', 'Virus', 'Demon Beast', '#4c1d95', 'Koko Crusher', 'dark', 'blast', 'Corrupted giant beast unleashing devastating sonic roars.', 'porcupamon'],
  ['antylamon', 'Antylamon', 'アンティラモン', 'ultimate', 'mystic', 'Data', 'Holy Beast', '#f472b6', 'Bunny Blades', 'holy', 'laser', 'Deva guardian transforming long sleeves into razor wind axes.', 'kyukimon', 'hue-rotate(-40deg) brightness(1.1)'],
  ['doumon', 'Doumon', 'ドウモン', 'ultimate', 'mystic', 'Virus', 'Wizard', '#7c3aed', 'Dark Talisman', 'dark', 'laser', 'Shadow-art sorceress casting cursed Onmyoji seals.', 'taomon', 'hue-rotate(210deg) brightness(0.75) contrast(1.25)'],
  ['cherubimonvice', 'Cherubimon (Vice)', 'ケルビモン(悪)', 'mega', 'mystic', 'Virus', 'Cherub', '#6d28d9', 'Lightning Spear', 'dark', 'laser', 'Fallen celestial cherub commanding thunderous purple lightning.', 'monzaemon', 'hue-rotate(230deg) brightness(0.6) contrast(1.4)'],
  ['cherubimonvirtue', 'Cherubimon (Virtue)', 'ケルビモン(善)', 'mega', 'mystic', 'Vaccine', 'Cherub', '#f472b6', 'Heaven Judgment', 'holy', 'laser', 'Benevolent angelic cherub calling down purifying lightning.', 'monzaemon', 'hue-rotate(300deg) brightness(1.1)'],
  ['kuzuhamon', 'Kuzuhamon', 'クズハモン', 'mega', 'mystic', 'Data', 'God Man', '#7c3aed', 'Ura Izuna', 'dark', 'laser', 'Shadow shrine priestess commanding purple spirit foxes.', 'sakuyamon', 'hue-rotate(215deg) saturate(1.25) brightness(0.85)'],
  ['belphemon', 'Belphemon', 'ベルフェモン', 'mega', 'mystic', 'Virus', 'Demon Lord', '#991b1b', 'Gift of Darkness', 'dark', 'blast', 'Demon Lord of Sloth awakening with world-shattering dark claws.', 'malomyotismon', 'hue-rotate(-25deg) contrast(1.3)'],
];

export const MATRIX_SPECIES: Record<string, DigimonSpecies> = {};

for (const [
  id,
  name,
  japaneseName,
  stage,
  crest,
  attribute,
  type,
  colorTheme,
  moveName,
  moveType,
  soundType,
  description,
  spriteId,
  spriteFilter,
] of RAW_SPECIES) {
  const s = STAGE_STATS[stage];
  MATRIX_SPECIES[id] = {
    id,
    name,
    japaneseName,
    stage,
    crest,
    attribute,
    type,
    colorTheme,
    description,
    baseHp: s.hp,
    baseAtk: s.atk,
    baseDef: s.def,
    baseSpd: s.spd,
    spriteId,
    spriteFilter,
    signatureMove: {
      name: moveName,
      type: moveType,
      power: s.pwr,
      description: `${name} unleashes ${moveName}!`,
      soundType,
    },
    nextEvolutions: [],
    eggIds: [],
  };
}

// Wire nextEvolutions and eggIds automatically from EGG_LINE_MATRIX!
function linkEvo(
  fromId: string,
  toId: string,
  requiredStage: DigimonStage,
  eggId: string,
  archetype?: EvolutionArchetype,
  requiredSpecialItem?: SpecialItemId
) {
  const from = MATRIX_SPECIES[fromId];
  const to = MATRIX_SPECIES[toId];
  if (!from || !to) return;

  if (!from.eggIds!.includes(eggId)) from.eggIds!.push(eggId);
  if (!to.eggIds!.includes(eggId)) to.eggIds!.push(eggId);
  if (archetype && !to.archetype) to.archetype = archetype;

  const exists = from.nextEvolutions!.some(
    (e) => e.speciesId === toId && e.archetype === archetype && e.requiredSpecialItem === requiredSpecialItem
  );
  if (exists) return;

  const minTraining =
    requiredStage === 'in-training' ? 0 :
    requiredStage === 'rookie' ? 2 :
    requiredStage === 'champion' ? 5 :
    requiredStage === 'ultimate' ? 8 : 12;

  const minBattles =
    requiredStage === 'in-training' ? 0 :
    requiredStage === 'rookie' ? 0 :
    requiredStage === 'champion' ? 2 :
    requiredStage === 'ultimate' ? 5 : 8;

  from.nextEvolutions!.push({
    speciesId: toId,
    requiredStage,
    archetype,
    requiredSpecialItem,
    minTraining,
    minBattles,
  });
}

for (const egg of Object.values(EGG_LINE_MATRIX)) {
  // Baby I -> Baby II
  linkEvo(egg.baby1, egg.baby2, 'in-training', egg.eggId, 'data');

  // Baby II -> 4 Rookies
  linkEvo(egg.baby2, egg.rookie.vaccine, 'rookie', egg.eggId, 'vaccine');
  linkEvo(egg.baby2, egg.rookie.data, 'rookie', egg.eggId, 'data');
  linkEvo(egg.baby2, egg.rookie.virus, 'rookie', egg.eggId, 'virus');
  linkEvo(egg.baby2, egg.rookie.corrupted, 'rookie', egg.eggId, 'corrupted');

  // 4 Rookies -> 4 Champions (+ Armor Option)
  const rookieList = [egg.rookie.vaccine, egg.rookie.data, egg.rookie.virus, egg.rookie.corrupted];
  for (const rId of rookieList) {
    linkEvo(rId, egg.champion.vaccine, 'champion', egg.eggId, 'vaccine');
    linkEvo(rId, egg.champion.data, 'champion', egg.eggId, 'data');
    linkEvo(rId, egg.champion.virus, 'champion', egg.eggId, 'virus');
    linkEvo(rId, egg.champion.corrupted, 'champion', egg.eggId, 'corrupted');
    if (egg.champion.corruptedAlt) {
      linkEvo(rId, egg.champion.corruptedAlt, 'champion', egg.eggId, 'corrupted');
    }
    if (egg.champion.armor) {
      linkEvo(rId, egg.champion.armor.speciesId, 'champion', egg.eggId, 'armor', egg.champion.armor.itemId);
    }
  }

  // Champions (including Armor) -> 4 Ultimates
  const champList = [
    egg.champion.vaccine,
    egg.champion.data,
    egg.champion.virus,
    egg.champion.corrupted,
    ...(egg.champion.corruptedAlt ? [egg.champion.corruptedAlt] : []),
    ...(egg.champion.armor ? [egg.champion.armor.speciesId] : []),
  ];
  for (const cId of champList) {
    // Special case: in Egg 08, 'gatomon' is both Rookie Data & Champion Data; avoid self-loop
    if (cId === egg.rookie.data && cId === egg.champion.data && egg.eggId === 'egg-light') {
      // Allow gatomon to reach Ultimates directly
    }
    linkEvo(cId, egg.ultimate.vaccine, 'ultimate', egg.eggId, 'vaccine');
    linkEvo(cId, egg.ultimate.data, 'ultimate', egg.eggId, 'data');
    linkEvo(cId, egg.ultimate.virus, 'ultimate', egg.eggId, 'virus');
    linkEvo(cId, egg.ultimate.corrupted, 'ultimate', egg.eggId, 'corrupted');
    if (egg.ultimate.corruptedAlt) {
      linkEvo(cId, egg.ultimate.corruptedAlt, 'ultimate', egg.eggId, 'corrupted');
    }
  }

  // Ultimates -> 4 Megas
  const ultList = [
    egg.ultimate.vaccine,
    egg.ultimate.data,
    egg.ultimate.virus,
    egg.ultimate.corrupted,
    ...(egg.ultimate.corruptedAlt ? [egg.ultimate.corruptedAlt] : []),
  ];
  for (const uId of ultList) {
    linkEvo(uId, egg.mega.vaccine, 'mega', egg.eggId, 'vaccine');
    linkEvo(uId, egg.mega.data, 'mega', egg.eggId, 'data');
    linkEvo(uId, egg.mega.virus, 'mega', egg.eggId, 'virus');
    linkEvo(uId, egg.mega.corrupted, 'mega', egg.eggId, 'corrupted');
    if (egg.mega.corruptedAlt) {
      linkEvo(uId, egg.mega.corruptedAlt, 'mega', egg.eggId, 'corrupted');
    }
  }
}
