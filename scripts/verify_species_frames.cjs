const { NEW_DIGIMON_SPRITES } = require('../src/utils/newDigimonSprites.ts');

const toCheck = ['agumon', 'greymon', 'wargreymon', 'gabumon', 'garurumon', 'biyomon', 'patamon', 'botamon', 'koromon', 'tsunomon'];

for (const k of toCheck) {
  const sp = NEW_DIGIMON_SPRITES[k];
  console.log(`\n=== ${k.toUpperCase()} ===`);
  console.log(' Standing:', sp.frames.standing);
  console.log(' Walking:', sp.frames.walking);
  console.log(' Happy:', sp.frames.happy);
  console.log(' Sleeping:', sp.frames.sleeping);
}
