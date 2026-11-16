const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const SPECIES_FILE_MAP = {
  // Baby I
  'botamon': 'Copy_of_Botamon_fb04c770.png',
  'punimon': 'Copy_of_Punimon_68b4fcb1.png',
  'pabumon': 'Copy_of_Pabumon_8b4cbbd7.png',
  'poyomon': 'Copy_of_Poyomon_d1a420e7.png',
  'pichimon': 'Copy_of_Pichimon_eca26270.png',
  'yuramon': 'Copy_of_Yuramon_3ad2937a.png',
  'nyokimon': 'Copy_of_Nyokimon_e5b120c1.png',

  // Baby II
  'koromon': 'Copy_of_Koromon_7d75f13c.png',
  'tsunomon': 'Copy_of_Tsunomon_d59ed36b.png',
  'tokomon': 'Copy_of_Tokomon_c5323292.png',
  'tanemon': 'Copy_of_Tanemon_17517f84.png',
  'bukamon': 'Copy_of_Bukamon_b180f25e.png',
  'nyaromon': 'Copy_of_Nyaromon_923766aa.png',
  'yokomon': 'Copy_of_Yokomon_dd201051.png',

  // Rookie
  'agumon': 'Copy_of_Agumon_Adventure_04d0832a.png',
  'gabumon': 'Copy_of_Gabumon_1beb725f.png',
  'biyomon': 'Copy_of_Biyomon_ad3c3232.png',
  'patamon': 'Copy_of_Patamon_6c39d52c.png',
  'palmon': 'Copy_of_Palmon_2070e7b5.png',
  'gomamon': 'Copy_of_Gomamon_45ce5d57.png',
  'salamon': 'Copy_of_Salamon_adc16886.png',

  // Champion
  'greymon': 'Copy_of_Greymon_dcbe93f9.png',
  'garurumon': 'Copy_of_Garurumon_2a0bd546.png',
  'birdramon': 'Copy_of_Birdramon_6ba0b315.png',
  'angemon': 'Copy_of_Angemon_e4fecf69.png',
  'togemon': 'Copy_of_Togemon_11c9cc70.png',
  'ikkakumon': 'Copy_of_Ikkakumon_d7c47668.png',
  'gatomon': 'Copy_of_Gatomon_68f5ce70.png',

  // Ultimate
  'metalgreymon': 'Copy_of_MetalGreymon_2_7f134d73.png',
  'weregarurumon': 'Copy_of_WereGarurumon_497c1afb.png',
  'garudamon': 'Copy_of_Garudamon_efb5b727.png',
  'magnaangemon': 'Copy_of_MagnaAngemon_2_d229b13a.png',
  'lillymon': 'Copy_of_Lillymon_aba09616.png',
  'zudomon': 'Copy_of_Zudomon_72c1c161.png',
  'angewomon': 'Copy_of_Angewomon_2_2dca13a6.png',

  // Mega
  'wargreymon': 'Copy_of_WarGreymon_9adf0908.png',
  'metalgarurumon': 'Copy_of_MetalGarurumon_4_3c810c39.png',
  'phoenixmon': 'Copy_of_Phoenixmon_5_f4ad8760.png',
  'seraphimon': 'Copy_of_Seraphimon_7d6ba82a.png',
  'rosemon': 'Copy_of_Rosemon_6267595c.png',
  'vikemon': 'Copy_of_Vikemon_4cb881d2.png',
  'magnadramon': 'Copy_of_Magnadramon_d8456cbf.png',
};

const dir = path.join(__dirname, '../public/assets/aistudio');

for (const [speciesId, fileName] of Object.entries(SPECIES_FILE_MAP)) {
  const filePath = path.join(dir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`[MISSING] ${speciesId}: ${fileName}`);
    continue;
  }
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  console.log(`[EXISTS] ${speciesId}: ${fileName} (${png.width}x${png.height})`);
}
