import React from 'react';
import { DigimonPose } from './DigimonSprite';

interface BattleSpiritOtherSpriteProps {
  id: string;
  pose: DigimonPose;
  isAltFrame: boolean;
  colorTheme?: string;
  lcdMode?: boolean;
}

export const BattleSpiritOtherSprite: React.FC<BattleSpiritOtherSpriteProps> = ({
  id,
  pose,
  isAltFrame,
  colorTheme,
  lcdMode = false,
}) => {
  const bobY = isAltFrame ? (pose === 'walking' ? 2 : 1) : 0;

  // === FRESH / IN-TRAINING BABY DIGIMON ===
  if (id === 'punimon') {
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          <ellipse cx="50" cy="58" rx="24" ry="20" fill="#ef4444" stroke="#18181b" strokeWidth="3" />
          {/* Three red bumps */}
          <circle cx="38" cy="40" r="7" fill="#ef4444" stroke="#18181b" strokeWidth="2.5" />
          <circle cx="50" cy="36" r="8" fill="#ef4444" stroke="#18181b" strokeWidth="2.5" />
          <circle cx="62" cy="40" r="7" fill="#ef4444" stroke="#18181b" strokeWidth="2.5" />
          {/* Eyes */}
          <circle cx="43" cy="56" r="3.5" fill="#18181b" />
          <circle cx="57" cy="56" r="3.5" fill="#18181b" />
          <circle cx="42" cy="55" r="1.2" fill="#ffffff" />
          <circle cx="56" cy="55" r="1.2" fill="#ffffff" />
          {/* Mouth */}
          <path d="M 47,63 Q 50,66 53,63" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (id === 'tsunomon') {
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Big steel horn */}
          <polygon points="46,40 50,12 54,40" fill="#94a3b8" stroke="#0f172a" strokeWidth="3" />
          <line x1="50" y1="14" x2="50" y2="39" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Round fuzzy body */}
          <ellipse cx="50" cy="60" rx="26" ry="22" fill="#fed7aa" stroke="#1c1917" strokeWidth="3.5" />
          {/* Orange-brown ear tufts */}
          <ellipse cx="26" cy="52" rx="7" ry="12" fill="#ea580c" stroke="#1c1917" strokeWidth="2.5" transform="rotate(-25, 26, 52)" />
          <ellipse cx="74" cy="52" rx="7" ry="12" fill="#ea580c" stroke="#1c1917" strokeWidth="2.5" transform="rotate(25, 74, 52)" />
          {/* Belly patch */}
          <ellipse cx="50" cy="65" rx="14" ry="11" fill="#fff7ed" stroke="#1c1917" strokeWidth="2" />
          {/* Eyes */}
          <circle cx="41" cy="56" r="4" fill="#dc2626" stroke="#1c1917" strokeWidth="2" />
          <circle cx="59" cy="56" r="4" fill="#dc2626" stroke="#1c1917" strokeWidth="2" />
          <circle cx="40" cy="55" r="1.5" fill="#ffffff" />
          <circle cx="58" cy="55" r="1.5" fill="#ffffff" />
          {/* Mouth */}
          <path d="M 47,66 Q 50,69 53,66" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (id === 'poyomon' || id === 'tokomon') {
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Tokomon long ears */}
          <ellipse cx="32" cy="38" rx="8" ry="16" fill="#fde047" stroke="#1c1917" strokeWidth="2.5" transform="rotate(-30, 32, 38)" />
          <ellipse cx="68" cy="38" rx="8" ry="16" fill="#fde047" stroke="#1c1917" strokeWidth="2.5" transform="rotate(30, 68, 38)" />
          {/* Body */}
          <ellipse cx="50" cy="60" rx="24" ry="20" fill="#fef9c3" stroke="#1c1917" strokeWidth="3" />
          {/* Big eyes */}
          <circle cx="42" cy="56" r="4" fill="#16a34a" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="58" cy="56" r="4" fill="#16a34a" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="41" cy="55" r="1.5" fill="#ffffff" />
          <circle cx="57" cy="55" r="1.5" fill="#ffffff" />
          {/* Cute toothy grin */}
          <path d="M 46,65 Q 50,70 54,65 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // === GABUMON (AUTHENTIC 16-BIT BATTLE SPIRIT DESIGN) ===
  if (id === 'gabumon') {
    return (
      <svg viewBox="0 0 120 120" className="w-24 h-24 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Tail with stripes */}
          <path d="M 30,75 C 15,70 12,55 24,52 C 28,51 32,60 35,68" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
          <path d="M 18,65 L 26,60" stroke="#1e3a8a" strokeWidth="2.5" />
          
          {/* Legs */}
          <rect x="36" y="82" width="10" height="14" rx="3" fill="#fef08a" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="58" y="82" width="10" height="14" rx="3" fill="#fef08a" stroke="#0f172a" strokeWidth="2.5" />
          <polygon points="36,96 39,99 42,96" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
          <polygon points="43,96 46,99 49,96" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
          <polygon points="58,96 61,99 64,96" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
          <polygon points="65,96 68,99 71,96" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />

          {/* Yellow reptile underbody */}
          <ellipse cx="52" cy="68" rx="20" ry="22" fill="#fef08a" stroke="#0f172a" strokeWidth="3" />

          {/* Garurumon fur pelt cowl */}
          <path
            d="M 32,45 C 28,32 38,20 52,22 C 66,20 76,32 72,45 C 78,58 78,75 70,82 C 60,86 44,86 34,82 C 26,75 26,58 32,45 Z"
            fill="#38bdf8"
            stroke="#0f172a"
            strokeWidth="3.5"
          />
          {/* Blue pelt markings */}
          <path d="M 34,50 L 46,56" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
          <path d="M 70,50 L 58,56" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
          <path d="M 33,65 L 44,70" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
          <path d="M 71,65 L 60,70" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />

          {/* Golden head horn */}
          <polygon points="50,23 52,6 54,23" fill="#facc15" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="52" y1="8" x2="52" y2="22" stroke="#fef08a" strokeWidth="1" />

          {/* Magenta eyes */}
          <ellipse cx="44" cy="46" r="4.5" fill="#e11d48" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse cx="60" cy="46" r="4.5" fill="#e11d48" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="43" cy="44.5" r="1.5" fill="#ffffff" />
          <circle cx="59" cy="44.5" r="1.5" fill="#ffffff" />

          {/* Cute snout & yellow claws */}
          <ellipse cx="52" cy="54" rx="4" ry="3" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="50.5" cy="53.5" r="0.8" fill="#000000" />
          <circle cx="53.5" cy="53.5" r="0.8" fill="#000000" />
          
          {/* Little claw paws in front */}
          <circle cx="43" cy="68" r="4" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="61" cy="68" r="4" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // === GARURUMON ===
  if (id === 'garurumon') {
    return (
      <svg viewBox="0 0 130 110" className="w-26 h-22 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Bushy tail */}
          <path d="M 20,60 C 5,45 8,30 22,25 C 28,38 30,52 35,62" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
          {/* Four legs */}
          <rect x="35" y="65" width="10" height="25" rx="3" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="50" y="65" width="10" height="25" rx="3" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="75" y="65" width="10" height="25" rx="3" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="90" y="65" width="10" height="25" rx="3" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          {/* Wolf Body */}
          <ellipse cx="65" cy="58" rx="35" ry="18" fill="#f8fafc" stroke="#0f172a" strokeWidth="3" />
          {/* Blue Stripes */}
          <path d="M 45,45 L 55,60" stroke="#1e3a8a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 60,42 L 70,58" stroke="#1e3a8a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 75,45 L 85,60" stroke="#1e3a8a" strokeWidth="3.5" strokeLinecap="round" />
          {/* Wolf Head */}
          <path d="M 85,45 C 95,30 115,35 120,48 C 122,58 108,65 92,62 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
          {/* Ear */}
          <polygon points="90,35 98,18 104,35" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
          {/* Red eye */}
          <circle cx="102" cy="45" r="3" fill="#dc2626" />
        </g>
      </svg>
    );
  }

  // === WEREGARURUMON ===
  if (id === 'weregarurumon') {
    return (
      <svg viewBox="0 0 120 120" className="w-24 h-24 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Denim Jeans legs */}
          <rect x="42" y="72" width="14" height="26" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="62" y="72" width="14" height="26" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2.5" />
          <polygon points="38,98 46,102 54,98" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          <polygon points="58,98 66,102 74,98" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          {/* Muscular bipedal wolf body */}
          <ellipse cx="58" cy="52" rx="22" ry="24" fill="#f8fafc" stroke="#0f172a" strokeWidth="3" />
          {/* Shoulder belt / strap */}
          <line x1="42" y1="36" x2="72" y2="68" stroke="#78350f" strokeWidth="3" />
          {/* Claws & knuckle guards */}
          <rect x="28" y="52" width="12" height="12" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
          <rect x="78" y="52" width="12" height="12" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
          {/* WereGarurumon Head */}
          <ellipse cx="58" cy="30" rx="16" ry="14" fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" />
          <polygon points="52,18 56,6 64,18" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
          <circle cx="53" cy="28" r="3" fill="#dc2626" />
          <circle cx="63" cy="28" r="3" fill="#dc2626" />
        </g>
      </svg>
    );
  }

  // === METALGARURUMON ===
  if (id === 'metalgarurumon') {
    return (
      <svg viewBox="0 0 130 110" className="w-26 h-22 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Laser Wings */}
          <polygon points="40,30 20,8 60,25" fill="#facc15" stroke="#a16207" strokeWidth="2" />
          <polygon points="70,25 95,8 85,30" fill="#facc15" stroke="#a16207" strokeWidth="2" />
          {/* Chrome legs */}
          <rect x="36" y="65" width="12" height="26" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="52" y="65" width="12" height="26" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="76" y="65" width="12" height="26" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="92" y="65" width="12" height="26" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
          {/* Armored Cyborg Body */}
          <ellipse cx="66" cy="58" rx="36" ry="18" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
          {/* Chest missile hatch */}
          <rect x="60" y="52" width="14" height="12" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
          {/* Metallic Head & Snout */}
          <path d="M 86,45 C 98,32 118,36 122,48 C 122,58 108,65 92,62 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
          {/* Laser eye visor */}
          <line x1="98" y1="44" x2="108" y2="44" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // === PATAMON (HOLY MAMMAL) ===
  if (id === 'patamon') {
    return (
      <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Big Bat-like wing ears */}
          <path
            d="M 32,45 C 10,25 6,55 24,62 C 30,55 32,50 34,45 Z"
            fill="#f97316"
            stroke="#1c1917"
            strokeWidth="2.5"
          />
          <path
            d="M 78,45 C 100,25 104,55 86,62 C 80,55 78,50 76,45 Z"
            fill="#f97316"
            stroke="#1c1917"
            strokeWidth="2.5"
          />
          {/* Round chubby orange body */}
          <ellipse cx="55" cy="58" rx="25" ry="21" fill="#fb923c" stroke="#1c1917" strokeWidth="3" />
          {/* Cream tummy */}
          <ellipse cx="55" cy="65" rx="14" ry="12" fill="#ffedd5" stroke="#1c1917" strokeWidth="2" />
          {/* Green eyes */}
          <ellipse cx="46" cy="52" rx="4" ry="5" fill="#22c55e" stroke="#1c1917" strokeWidth="1.5" />
          <ellipse cx="64" cy="52" rx="4" ry="5" fill="#22c55e" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="45" cy="50.5" r="1.5" fill="#ffffff" />
          <circle cx="63" cy="50.5" r="1.5" fill="#ffffff" />
          {/* Tiny paws */}
          <circle cx="44" cy="76" r="4" fill="#ffedd5" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="66" cy="76" r="4" fill="#ffedd5" stroke="#1c1917" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // === ANGEMON ===
  if (id === 'angemon') {
    return (
      <svg viewBox="0 0 120 120" className="w-24 h-24 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* 6 Angel Wings */}
          <path d="M 38,30 C 15,10 8,45 35,52" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          <path d="M 32,50 C 10,40 12,70 34,72" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          <path d="M 82,30 C 105,10 112,45 85,52" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          <path d="M 88,50 C 110,40 108,70 86,72" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          {/* White Robe body */}
          <polygon points="50,42 70,42 76,96 44,96" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          {/* Holy Staff in hand */}
          <line x1="82" y1="20" x2="82" y2="105" stroke="#3b82f6" strokeWidth="3" />
          <polygon points="80,18 82,12 84,18" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
          {/* Golden Helm & hair */}
          <ellipse cx="60" cy="30" rx="12" ry="10" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          <rect x="52" y="28" width="16" height="4" fill="#0f172a" />
        </g>
      </svg>
    );
  }

  // === BIYOMON ===
  if (id === 'biyomon') {
    return (
      <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Striped head feather crest */}
          <path d="M 52,28 C 45,10 60,6 64,26" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          <line x1="53" y1="18" x2="59" y2="18" stroke="#1e3a8a" strokeWidth="2" />
          {/* Pink bird body */}
          <ellipse cx="54" cy="56" rx="22" ry="20" fill="#f472b6" stroke="#0f172a" strokeWidth="3" />
          {/* Wings with blue stripe tips */}
          <path d="M 34,54 C 18,48 16,68 32,70 Z" fill="#f472b6" stroke="#0f172a" strokeWidth="2" />
          <path d="M 18,52 L 26,62" stroke="#38bdf8" strokeWidth="3" />
          <path d="M 74,54 C 90,48 92,68 76,70 Z" fill="#f472b6" stroke="#0f172a" strokeWidth="2" />
          <path d="M 90,52 L 82,62" stroke="#38bdf8" strokeWidth="3" />
          {/* Yellow beak */}
          <polygon points="50,56 58,56 54,64" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          {/* Blue eyes */}
          <circle cx="45" cy="48" r="3" fill="#0284c7" />
          <circle cx="63" cy="48" r="3" fill="#0284c7" />
          {/* Tail ring */}
          <ellipse cx="54" cy="74" rx="8" ry="4" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // === TENTOMON ===
  if (id === 'tentomon') {
    return (
      <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Antennae */}
          <line x1="45" y1="35" x2="35" y2="18" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="65" y1="35" x2="75" y2="18" stroke="#0f172a" strokeWidth="2.5" />
          {/* Red beetle shell with dots */}
          <path d="M 32,46 C 32,32 78,32 78,46 C 84,65 82,80 55,82 C 28,80 26,65 32,46 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="3" />
          <line x1="55" y1="36" x2="55" y2="81" stroke="#0f172a" strokeWidth="2" />
          <circle cx="42" cy="55" r="4" fill="#0f172a" />
          <circle cx="68" cy="55" r="4" fill="#0f172a" />
          {/* Big blue compound eyes */}
          <ellipse cx="44" cy="40" rx="5" ry="6" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse cx="66" cy="40" rx="5" ry="6" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
          {/* Claws */}
          <polygon points="30,75 22,86 34,82" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
          <polygon points="80,75 88,86 76,82" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // === PALMON ===
  if (id === 'palmon') {
    return (
      <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Big Pink Flower on head */}
          <ellipse cx="55" cy="24" rx="18" ry="10" fill="#f43f5e" stroke="#0f172a" strokeWidth="2.5" />
          <circle cx="55" cy="24" r="5" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
          {/* Green plant body */}
          <ellipse cx="55" cy="56" rx="20" ry="24" fill="#22c55e" stroke="#0f172a" strokeWidth="3" />
          {/* Leaf hands */}
          <path d="M 36,54 C 18,52 20,68 34,66 Z" fill="#15803d" stroke="#0f172a" strokeWidth="2" />
          <path d="M 74,54 C 92,52 90,68 76,66 Z" fill="#15803d" stroke="#0f172a" strokeWidth="2" />
          {/* Eyes & smile */}
          <circle cx="47" cy="48" r="3" fill="#0f172a" />
          <circle cx="63" cy="48" r="3" fill="#0f172a" />
          <path d="M 51,58 Q 55,62 59,58" stroke="#0f172a" strokeWidth="2" fill="none" />
        </g>
      </svg>
    );
  }

  // === GOMAMON ===
  if (id === 'gomamon') {
    return (
      <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Orange/Red mohawk crest hair */}
          <path d="M 50,32 C 45,15 65,12 62,32 Z" fill="#ea580c" stroke="#0f172a" strokeWidth="2" />
          {/* White seal body */}
          <ellipse cx="55" cy="58" rx="25" ry="20" fill="#f8fafc" stroke="#0f172a" strokeWidth="3" />
          {/* Purple claw stripes */}
          <path d="M 38,55 L 42,66" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" />
          <path d="M 68,55 L 72,66" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" />
          {/* Big blue seal eyes */}
          <ellipse cx="46" cy="50" rx="4" ry="5" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse cx="64" cy="50" rx="4" ry="5" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="45" cy="48.5" r="1.5" fill="#ffffff" />
          <circle cx="63" cy="48.5" r="1.5" fill="#ffffff" />
          {/* Whiskers */}
          <line x1="38" y1="58" x2="30" y2="58" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="72" y1="58" x2="80" y2="58" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // === GATOMON ===
  if (id === 'gatomon') {
    return (
      <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Cat Ears */}
          <polygon points="38,36 32,18 48,28" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          <polygon points="72,36 78,18 62,28" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          {/* Cat Body */}
          <ellipse cx="55" cy="56" rx="20" ry="18" fill="#f8fafc" stroke="#0f172a" strokeWidth="3" />
          {/* Tail with holy ring */}
          <path d="M 72,60 C 88,58 92,38 82,35" stroke="#f8fafc" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="85" cy="46" rx="6" ry="3" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
          {/* Oversized Green Tiger Gloves with sharp claws */}
          <rect x="28" y="58" width="14" height="18" rx="4" fill="#22c55e" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="30" y1="64" x2="38" y2="64" stroke="#0f172a" strokeWidth="2" />
          <polygon points="28,76 30,82 33,76" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
          <polygon points="34,76 36,82 39,76" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
          <rect x="68" y="58" width="14" height="18" rx="4" fill="#22c55e" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="72" y1="64" x2="80" y2="64" stroke="#0f172a" strokeWidth="2" />
          {/* Big blue eyes */}
          <ellipse cx="48" cy="46" rx="3.5" ry="5" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse cx="62" cy="46" rx="3.5" ry="5" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // === VEEMON ===
  if (id === 'veemon') {
    return (
      <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Head Horn */}
          <polygon points="53,24 55,10 57,24" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          {/* Blue dragon body */}
          <ellipse cx="55" cy="56" rx="22" ry="22" fill="#3b82f6" stroke="#0f172a" strokeWidth="3" />
          {/* White belly mark */}
          <ellipse cx="55" cy="62" rx="13" ry="12" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          {/* Big red dragon eyes */}
          <ellipse cx="46" cy="46" rx="4" ry="5" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse cx="64" cy="46" rx="4" ry="5" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
          {/* Claws */}
          <circle cx="40" cy="74" r="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="70" cy="74" r="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // === GUILMON ===
  if (id === 'guilmon') {
    return (
      <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Black ear fins */}
          <polygon points="40,35 28,20 44,28" fill="#18181b" stroke="#0f172a" strokeWidth="2" />
          <polygon points="70,35 82,20 66,28" fill="#18181b" stroke="#0f172a" strokeWidth="2" />
          {/* Crimson reptile body */}
          <ellipse cx="55" cy="56" rx="23" ry="22" fill="#dc2626" stroke="#0f172a" strokeWidth="3" />
          {/* White Snout */}
          <ellipse cx="55" cy="58" rx="12" ry="8" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          {/* Digital Hazard triangle tattoo on chest */}
          <polygon points="52,70 58,70 55,75" fill="#18181b" />
          {/* Golden yellow eyes */}
          <ellipse cx="46" cy="44" rx="4" ry="5" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse cx="64" cy="44" rx="4" ry="5" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // === RENAMON ===
  if (id === 'renamon') {
    return (
      <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
        <g transform={`translate(0, ${bobY})`}>
          {/* Large fox ears */}
          <polygon points="42,34 30,12 50,24" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          <polygon points="68,34 80,12 60,24" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          {/* Golden fox body */}
          <ellipse cx="55" cy="56" rx="18" ry="22" fill="#facc15" stroke="#0f172a" strokeWidth="3" />
          {/* White chest fluff */}
          <path d="M 44,46 Q 55,60 66,46 Q 55,70 44,46 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          {/* Purple arm yin-yang bands */}
          <rect x="32" y="52" width="8" height="14" rx="2" fill="#9333ea" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="70" y="52" width="8" height="14" rx="2" fill="#9333ea" stroke="#0f172a" strokeWidth="1.5" />
          {/* Sleek blue eyes */}
          <line x1="44" y1="40" x2="50" y2="42" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="66" y1="40" x2="60" y2="42" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // Default rich pixel monster fallback
  const fallbackColor = colorTheme || '#f59e0b';
  return (
    <svg viewBox="0 0 110 100" className="w-22 h-20 overflow-visible pixel-art">
      <g transform={`translate(0, ${bobY})`}>
        <ellipse cx="55" cy="56" rx="24" ry="22" fill={fallbackColor} stroke="#0f172a" strokeWidth="3.5" />
        <ellipse cx="55" cy="62" rx="14" ry="12" fill="#fef08a" stroke="#0f172a" strokeWidth="2" />
        <circle cx="45" cy="48" r="4.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="65" cy="48" r="4.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="46" cy="48" r="2.5" fill="#0f172a" />
        <circle cx="64" cy="48" r="2.5" fill="#0f172a" />
      </g>
    </svg>
  );
};
