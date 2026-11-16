export interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const AGUMON_SPRITESHEET_PATH = '/assets/agumon_battle_spirit.png';
export const BOTAMON_SPRITESHEET_PATH = '/assets/botamon_transparent.png';
export const YUKIMIBOTAMON_SPRITESHEET_PATH = '/assets/yukimibotamon_transparent.png';
export const KOROMON_SPRITESHEET_PATH = '/assets/koromon_transparent.png';
export const GREYMON_SPRITESHEET_PATH = '/assets/greymon_transparent.png';
export const METALGREYMON_SPRITESHEET_PATH = '/assets/metalgreymon_transparent.png';
export const WARGREYMON_SPRITESHEET_PATH = '/assets/wargreymon_transparent.png';

export const KOROMON_FRAMES: Record<string, SpriteFrame[]> = {
  standing: [
    { x: 0, y: 0, w: 32, h: 48 },
    { x: 32, y: 0, w: 32, h: 48 },
    { x: 64, y: 0, w: 32, h: 48 },
    { x: 96, y: 0, w: 32, h: 48 },
  ],
  walking_left: [
    { x: 0, y: 48, w: 32, h: 48 },
    { x: 32, y: 48, w: 32, h: 48 },
    { x: 64, y: 48, w: 32, h: 48 },
    { x: 96, y: 48, w: 32, h: 48 },
  ],
  walking_right: [
    { x: 0, y: 96, w: 32, h: 48 },
    { x: 32, y: 96, w: 32, h: 48 },
    { x: 64, y: 96, w: 32, h: 48 },
    { x: 96, y: 96, w: 32, h: 48 },
  ],
  sitting: [
    { x: 0, y: 0, w: 32, h: 48 },
  ],
  training: [
    { x: 32, y: 48, w: 32, h: 48 },
    { x: 64, y: 48, w: 32, h: 48 },
    { x: 96, y: 0, w: 32, h: 48 },
  ],
  eating: [
    { x: 32, y: 0, w: 32, h: 48 },
    { x: 64, y: 0, w: 32, h: 48 },
    { x: 96, y: 0, w: 32, h: 48 },
  ],
  pooping: [
    { x: 0, y: 0, w: 32, h: 48 },
  ],
  sleeping: [
    { x: 0, y: 144, w: 32, h: 48 },
    { x: 32, y: 144, w: 32, h: 48 },
  ],
  sick: [
    { x: 0, y: 144, w: 32, h: 48 },
  ],
  happy: [
    { x: 64, y: 0, w: 32, h: 48 },
    { x: 96, y: 0, w: 32, h: 48 },
  ],
};

export const BOTAMON_FRAMES: Record<string, SpriteFrame[]> = {
  standing: [
    { x: 0, y: 0, w: 48, h: 48 },
    { x: 48, y: 0, w: 48, h: 48 },
    { x: 96, y: 0, w: 48, h: 48 },
  ],
  walking_left: [
    { x: 0, y: 48, w: 48, h: 48 },
    { x: 48, y: 48, w: 48, h: 48 },
    { x: 96, y: 48, w: 48, h: 48 },
    { x: 48, y: 48, w: 48, h: 48 },
  ],
  walking_right: [
    { x: 0, y: 96, w: 48, h: 48 },
    { x: 48, y: 96, w: 48, h: 48 },
    { x: 96, y: 96, w: 48, h: 48 },
    { x: 48, y: 96, w: 48, h: 48 },
  ],
  sitting: [
    { x: 48, y: 0, w: 48, h: 48 },
    { x: 0, y: 0, w: 48, h: 48 },
  ],
  training: [
    { x: 48, y: 48, w: 48, h: 48 },
    { x: 48, y: 96, w: 48, h: 48 },
    { x: 96, y: 0, w: 48, h: 48 },
  ],
  eating: [
    { x: 48, y: 0, w: 48, h: 48 },
    { x: 96, y: 0, w: 48, h: 48 },
  ],
  pooping: [
    { x: 48, y: 144, w: 48, h: 48 },
  ],
  sleeping: [
    { x: 48, y: 144, w: 48, h: 48 },
    { x: 96, y: 144, w: 48, h: 48 },
  ],
  sick: [
    { x: 0, y: 144, w: 48, h: 48 },
    { x: 48, y: 144, w: 48, h: 48 },
  ],
  happy: [
    { x: 0, y: 0, w: 48, h: 48 },
    { x: 96, y: 0, w: 48, h: 48 },
  ],
};

export const AGUMON_BATTLE_SPIRIT_FRAMES: Record<string, SpriteFrame[]> = {
  standing: [
    { x: 23, y: 46, w: 21, h: 27 },
    { x: 51, y: 47, w: 21, h: 26 },
    { x: 81, y: 46, w: 21, h: 27 },
    { x: 109, y: 45, w: 22, h: 28 },
    { x: 136, y: 45, w: 26, h: 27 },
    { x: 167, y: 47, w: 27, h: 26 },
    { x: 200, y: 46, w: 24, h: 27 },
    { x: 254, y: 47, w: 21, h: 26 },
  ],
  walking: [
    // Clean 6-frame walking cycle (Row 9, no smoke puffs, no clipping)
    { x: 16, y: 381, w: 25, h: 29 },
    { x: 48, y: 381, w: 31, h: 29 },
    { x: 88, y: 380, w: 25, h: 30 },
    { x: 121, y: 381, w: 28, h: 29 },
    { x: 155, y: 380, w: 25, h: 30 },
    { x: 185, y: 381, w: 31, h: 29 },
  ],
  sitting: [
    { x: 18, y: 168, w: 23, h: 26 },
    { x: 49, y: 169, w: 25, h: 25 },
    { x: 84, y: 167, w: 28, h: 27 },
  ],
  training: [
    { x: 20, y: 89, w: 22, h: 27 },
    { x: 51, y: 90, w: 27, h: 26 },
    { x: 85, y: 88, w: 28, h: 28 },
    { x: 120, y: 86, w: 37, h: 29 },
    { x: 170, y: 85, w: 36, h: 30 },
    { x: 220, y: 87, w: 35, h: 28 },
    { x: 12, y: 426, w: 29, h: 29 },
    { x: 83, y: 422, w: 33, h: 33 },
    { x: 121, y: 423, w: 36, h: 32 },
  ],
  eating: [
    { x: 17, y: 240, w: 26, h: 22 },
    { x: 49, y: 240, w: 29, h: 22 },
    { x: 83, y: 241, w: 27, h: 21 },
    { x: 120, y: 243, w: 28, h: 20 },
    { x: 161, y: 237, w: 24, h: 25 },
    { x: 191, y: 235, w: 23, h: 27 },
  ],
  pooping: [
    { x: 84, y: 167, w: 28, h: 27 },
    { x: 154, y: 169, w: 28, h: 25 },
  ],
  sleeping: [
    { x: 17, y: 204, w: 25, h: 22 },
    { x: 47, y: 204, w: 26, h: 22 },
    { x: 78, y: 204, w: 25, h: 22 },
  ],
  sick: [
    { x: 186, y: 172, w: 25, h: 22 },
    { x: 218, y: 172, w: 26, h: 22 },
  ],
  happy: [
    // Cheering victory frames (clean, no dust, head fully intact)
    { x: 44, y: 507, w: 31, h: 30 },
    { x: 79, y: 507, w: 37, h: 32 },
    { x: 121, y: 508, w: 37, h: 33 },
    { x: 162, y: 510, w: 35, h: 34 },
    { x: 202, y: 511, w: 34, h: 34 },
  ],
  illustration: [
    { x: 164, y: 573, w: 114, h: 99 },
  ],
};

export const GREYMON_FRAMES: Record<string, SpriteFrame[]> = {
  standing: [
    { x: 0 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 4 * 64, y: 0 * 64, w: 64, h: 64 },
  ],
  walking_left: [
    { x: 6 * 64, y: 3 * 64, w: 64, h: 64 }, // right leg forward stride
    { x: 2 * 64, y: 4 * 64, w: 64, h: 64 }, // passing stance
    { x: 3 * 64, y: 4 * 64, w: 64, h: 64 }, // left leg forward stride
    { x: 2 * 64, y: 4 * 64, w: 64, h: 64 }, // passing stance
  ],
  walking_right: [
    { x: 6 * 64, y: 3 * 64, w: 64, h: 64 }, // right leg forward stride
    { x: 2 * 64, y: 4 * 64, w: 64, h: 64 }, // passing stance
    { x: 3 * 64, y: 4 * 64, w: 64, h: 64 }, // left leg forward stride
    { x: 2 * 64, y: 4 * 64, w: 64, h: 64 }, // passing stance
  ],
  walking: [
    { x: 6 * 64, y: 3 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 4 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 4 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 4 * 64, w: 64, h: 64 },
  ],
  sitting: [
    { x: 0 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 1 * 64, w: 64, h: 64 },
  ],
  training: [
    // Mega Flame & Claw swipe animation combo
    { x: 0 * 64, y: 2 * 64, w: 64, h: 64 }, // head back
    { x: 1 * 64, y: 2 * 64, w: 64, h: 64 }, // roar
    { x: 2 * 64, y: 2 * 64, w: 64, h: 64 }, // blast fire
    { x: 3 * 64, y: 2 * 64, w: 64, h: 64 }, // flame burst
    { x: 1 * 64, y: 3 * 64, w: 64, h: 64 }, // claw swipe
    { x: 2 * 64, y: 3 * 64, w: 64, h: 64 }, // claw slash
  ],
  eating: [
    // Bite prep, bite lunge, and bite chomp
    { x: 3 * 64, y: 3 * 64, w: 64, h: 64 },
    { x: 4 * 64, y: 3 * 64, w: 64, h: 64 },
    { x: 5 * 64, y: 3 * 64, w: 64, h: 64 },
  ],
  pooping: [
    { x: 2 * 64, y: 1 * 64, w: 64, h: 64 },
  ],
  sleeping: [
    // Low curl resting/sleeping
    { x: 2 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 1 * 64, w: 64, h: 64 },
  ],
  sick: [
    // Hurt reeling in pain
    { x: 0 * 64, y: 4 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 4 * 64, w: 64, h: 64 },
  ],
  happy: [
    // Triumphant roar
    { x: 0 * 64, y: 2 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 2 * 64, w: 64, h: 64 },
    { x: 0 * 64, y: 3 * 64, w: 64, h: 64 },
  ],
};

export const METALGREYMON_FRAMES: Record<string, SpriteFrame[]> = {
  standing: [
    { x: 0 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 4 * 64, y: 0 * 64, w: 64, h: 64 },
  ],
  walking_left: [
    { x: 0 * 64, y: 2 * 64, w: 64, h: 64 }, // wing up glide
    { x: 1 * 64, y: 2 * 64, w: 64, h: 64 }, // wing flap down
    { x: 2 * 64, y: 2 * 64, w: 64, h: 64 }, // forward stride
    { x: 3 * 64, y: 2 * 64, w: 64, h: 64 }, // wing thrust glide
  ],
  walking_right: [
    { x: 0 * 64, y: 2 * 64, w: 64, h: 64 }, // wing up glide
    { x: 1 * 64, y: 2 * 64, w: 64, h: 64 }, // wing flap down
    { x: 2 * 64, y: 2 * 64, w: 64, h: 64 }, // forward stride
    { x: 3 * 64, y: 2 * 64, w: 64, h: 64 }, // wing thrust glide
  ],
  walking: [
    { x: 0 * 64, y: 2 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 2 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 2 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 2 * 64, w: 64, h: 64 },
  ],
  sitting: [
    { x: 0 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 4 * 64, y: 1 * 64, w: 64, h: 64 },
  ],
  training: [
    // Trident Arm strike & Giga Destroyer bio-missile blast combo!
    { x: 0 * 64, y: 3 * 64, w: 64, h: 64 }, // Trident Arm pull back
    { x: 1 * 64, y: 3 * 64, w: 64, h: 64 }, // Trident Arm claw thrust strike!
    { x: 2 * 64, y: 3 * 64, w: 64, h: 64 }, // chest hatch opens / stance
    { x: 0 * 64, y: 4 * 64, w: 64, h: 64 }, // Giga Destroyer missile explosion blast!
    { x: 1 * 64, y: 4 * 64, w: 64, h: 64 }, // smoke trail firing
    { x: 2 * 64, y: 4 * 64, w: 64, h: 64 }, // bio-missiles rocketing forward
    { x: 3 * 64, y: 4 * 64, w: 64, h: 64 }, // missile projectile strike
    { x: 4 * 64, y: 4 * 64, w: 64, h: 64 }, // smoke recovery
  ],
  eating: [
    { x: 0 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 0 * 64, w: 64, h: 64 }, // head open
    { x: 3 * 64, y: 0 * 64, w: 64, h: 64 }, // mouth chomp
    { x: 1 * 64, y: 3 * 64, w: 64, h: 64 }, // claw reach
  ],
  pooping: [
    { x: 2 * 64, y: 3 * 64, w: 64, h: 64 },
  ],
  sleeping: [
    { x: 4 * 64, y: 4 * 64, w: 64, h: 64 }, // low resting crouch
    { x: 4 * 64, y: 1 * 64, w: 64, h: 64 },
  ],
  sick: [
    { x: 4 * 64, y: 1 * 64, w: 64, h: 64 }, // hurt expression
    { x: 2 * 64, y: 3 * 64, w: 64, h: 64 },
  ],
  happy: [
    { x: 0 * 64, y: 1 * 64, w: 64, h: 64 }, // victory gesture
    { x: 1 * 64, y: 1 * 64, w: 64, h: 64 }, // claw cheer
    { x: 2 * 64, y: 1 * 64, w: 64, h: 64 }, // cheer
    { x: 3 * 64, y: 1 * 64, w: 64, h: 64 }, // triumphant roar
  ],
};

export const WARGREYMON_FRAMES: Record<string, SpriteFrame[]> = {
  standing: [
    { x: 0 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 4 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 5 * 64, y: 0 * 64, w: 64, h: 64 },
    { x: 6 * 64, y: 0 * 64, w: 64, h: 64 },
  ],
  walking_left: [
    { x: 0 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 4 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 5 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 6 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 7 * 64, y: 1 * 64, w: 64, h: 64 },
  ],
  walking_right: [
    { x: 0 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 4 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 5 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 6 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 7 * 64, y: 1 * 64, w: 64, h: 64 },
  ],
  walking: [
    { x: 0 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 4 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 5 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 6 * 64, y: 1 * 64, w: 64, h: 64 },
    { x: 7 * 64, y: 1 * 64, w: 64, h: 64 },
  ],
  sitting: [
    { x: 0 * 64, y: 5 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 5 * 64, w: 64, h: 64 },
  ],
  training: [
    // Dramon Killer Claws + Terra Force Solar Blast combo!
    { x: 0 * 64, y: 2 * 64, w: 64, h: 64 }, // claw slash prep
    { x: 1 * 64, y: 2 * 64, w: 64, h: 64 }, // slash lunge
    { x: 2 * 64, y: 2 * 64, w: 64, h: 64 }, // Dramon Killer cross strike
    { x: 5 * 64, y: 2 * 64, w: 64, h: 64 }, // upward claw slash
    { x: 6 * 64, y: 2 * 64, w: 64, h: 64 }, // high slice
    { x: 0 * 64, y: 3 * 64, w: 64, h: 64 }, // Terra Force charge crouch
    { x: 1 * 64, y: 3 * 64, w: 64, h: 64 }, // gather solar energy
    { x: 2 * 64, y: 3 * 64, w: 64, h: 64 }, // solar aura
    { x: 3 * 64, y: 3 * 64, w: 64, h: 64 }, // Terra Force maximum flare
    { x: 4 * 64, y: 3 * 64, w: 64, h: 64 }, // giant fireball overhead
    { x: 5 * 64, y: 3 * 64, w: 64, h: 64 }, // hurl Terra Force!
    { x: 6 * 64, y: 3 * 64, w: 64, h: 64 }, // shockwave blast
  ],
  eating: [
    { x: 4 * 64, y: 4 * 64, w: 64, h: 64 },
    { x: 5 * 64, y: 4 * 64, w: 64, h: 64 },
    { x: 6 * 64, y: 4 * 64, w: 64, h: 64 },
  ],
  pooping: [
    { x: 0 * 64, y: 5 * 64, w: 64, h: 64 },
  ],
  sleeping: [
    { x: 2 * 64, y: 5 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 5 * 64, w: 64, h: 64 },
  ],
  sick: [
    { x: 0 * 64, y: 6 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 6 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 6 * 64, w: 64, h: 64 },
  ],
  happy: [
    { x: 0 * 64, y: 4 * 64, w: 64, h: 64 },
    { x: 1 * 64, y: 4 * 64, w: 64, h: 64 },
    { x: 2 * 64, y: 4 * 64, w: 64, h: 64 },
    { x: 3 * 64, y: 4 * 64, w: 64, h: 64 },
  ],
};
