import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttackVisualSpec, SignatureVfxStyle } from '../data/battleTechniques';

export interface ActiveBattleVfx {
  id: number;
  attacker: 'player' | 'opponent';
  spec: AttackVisualSpec;
  isCrit?: boolean;
  isSuperEffective?: boolean;
  isSignature?: boolean;
  moveName?: string;
}

interface BattleAttackVfxProps {
  activeVfx: ActiveBattleVfx | null;
}

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const ImpactBurstRing: React.FC<{
  defenderX: string;
  colorHex: string;
  glowHex: string;
  isCrit?: boolean;
  delay?: number;
  sizeClass?: string;
}> = ({
  defenderX,
  colorHex,
  glowHex,
  isCrit,
  delay = 0.24,
  sizeClass = 'w-20 h-20 sm:w-24 sm:h-24',
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.35 }}
    animate={{
      opacity: [0, 0.95, 0.8, 0],
      scale: [0.35, 1.15, 1.45, 1.7],
    }}
    transition={{ duration: 0.44, delay, times: [0, 0.25, 0.7, 1], ease: 'easeOut' }}
    style={{ left: defenderX, top: '63%' }}
    className="absolute -translate-x-1/2 -translate-y-1/2"
  >
    <div
      className={`${sizeClass} rounded-full border-4`}
      style={{
        borderColor: isCrit ? '#fde047' : colorHex,
        background: `radial-gradient(circle, ${colorHex}99 0%, ${glowHex}44 55%, transparent 100%)`,
      }}
    />
  </motion.div>
);

const CasterHalo: React.FC<{
  attackerX: string;
  colorHex: string;
  glowHex: string;
  isSignature?: boolean;
}> = ({ attackerX, colorHex, glowHex, isSignature }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
    animate={{
      opacity: [0, 1, 0.85, 0],
      scale: isSignature ? [0.45, 1.25, 1.5, 1.75] : [0.45, 1.1, 1.3, 1.45],
      rotate: [0, 45, 90, 140],
    }}
    transition={{
      duration: isSignature ? 0.48 : 0.34,
      times: [0, 0.28, 0.72, 1],
      ease: 'easeOut',
    }}
    style={{
      left: attackerX,
      top: '63%',
      borderColor: colorHex,
      background: `radial-gradient(circle, ${colorHex}44 0%, ${glowHex}22 60%, transparent 100%)`,
    }}
    className={`absolute -translate-x-1/2 -translate-y-1/2 ${
      isSignature ? 'w-24 h-24 sm:w-28 sm:h-28 border-[3px]' : 'w-16 h-16 sm:w-20 sm:h-20 border-2'
    } rounded-full border-dashed`}
  />
);

const RushSpeedLines: React.FC<{
  fromLeft: boolean;
  colorHex: string;
  glowHex: string;
  delay?: number;
}> = ({ fromLeft, colorHex, glowHex, delay = 0.04 }) => (
  <motion.div
    initial={{ opacity: 0, scaleX: 0.25 }}
    animate={{
      opacity: [0, 0.92, 0.8, 0],
      scaleX: [0.3, 1.05, 1.12, 0.45],
    }}
    transition={{ duration: 0.38, delay, times: [0, 0.25, 0.72, 1], ease: 'easeOut' }}
    style={{
      left: '20%',
      width: '60%',
      top: '62%',
      transformOrigin: fromLeft ? 'left center' : 'right center',
    }}
    className="absolute -translate-y-1/2 flex flex-col gap-2"
  >
    <div
      className="h-0.5 rounded-full"
      style={{
        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${colorHex}, ${glowHex})`,
      }}
    />
    <div
      className="h-1.5 rounded-full mx-4"
      style={{
        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${glowHex}, ${colorHex})`,
      }}
    />
    <div
      className="h-0.5 rounded-full mx-2"
      style={{
        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${colorHex}, ${glowHex})`,
      }}
    />
  </motion.div>
);

const SignatureChoreography: React.FC<{
  styleKey: SignatureVfxStyle;
  spec: AttackVisualSpec;
  fromLeft: boolean;
  attackerX: string;
  defenderX: string;
  isCrit?: boolean;
  isSignature?: boolean;
  moveName?: string;
}> = ({ styleKey, spec, fromLeft, attackerX, defenderX, isCrit, isSignature, moveName }) => {
  const { colorHex, glowHex, accentHex = '#fef08a' } = spec;
  const facingLeft = !fromLeft;
  const flipTransform = facingLeft ? 'scaleX(-1)' : undefined;
  const dOffset = isSignature ? 0.14 : 0; // Signature moves start after caster crest charge-up
  const impactDelay = isSignature ? 0.46 : 0.24;

  switch (styleKey) {
    // 1. NOVA SPHERE / TERRA FORCE (WarGreymon, BlackWarGreymon, Apocalymon, Apollomon, Diablomon)
    case 'nova_sphere': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature />
          {/* Converging ground energy lines up into overhead sun sphere */}
          <motion.div
            initial={{ left: attackerX, top: '24%', opacity: 0, scale: 0.2 }}
            animate={{
              left: [attackerX, attackerX, defenderX, defenderX],
              top: ['28%', '19%', '58%', '63%'],
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.35, 1.5, 0.9],
            }}
            transition={{
              duration: 0.62,
              delay: dOffset * 0.5,
              times: [0, 0.36, 0.82, 1],
              ease: 'easeInOut',
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 110 110" className="w-28 h-28 sm:w-32 sm:h-32 overflow-visible">
              <circle cx="55" cy="55" r="46" fill={glowHex} opacity="0.32" />
              <circle cx="55" cy="55" r="36" fill={glowHex} opacity="0.65" />
              <circle cx="55" cy="55" r="26" fill={colorHex} />
              <circle cx="55" cy="55" r="14" fill={accentHex} opacity="0.92" />
              <ellipse cx="55" cy="55" rx="48" ry="15" fill="none" stroke={accentHex} strokeWidth="2.5" opacity="0.85" transform="rotate(-24 55 55)" />
              <ellipse cx="55" cy="55" rx="48" ry="15" fill="none" stroke={colorHex} strokeWidth="2.5" opacity="0.8" transform="rotate(34 55 55)" />
            </svg>
          </motion.div>
          {/* Massive Seismic Pillar at impact */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0.15, scaleX: 0.5 }}
            animate={{
              opacity: [0, 0.95, 0.85, 0],
              scaleY: [0.2, 1.15, 1.35, 1.45],
              scaleX: [0.5, 1.1, 1.35, 1.5],
            }}
            transition={{ duration: 0.48, delay: impactDelay, times: [0, 0.25, 0.65, 1], ease: 'easeOut' }}
            style={{
              left: defenderX,
              top: '50%',
              background: `linear-gradient(180deg, transparent, ${colorHex}cc, ${glowHex})`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-24 sm:w-28 h-40 rounded-full"
          />
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} sizeClass="w-32 h-32" />
        </>
      );
    }

    // 2. PYRO HAZARD (Guilmon Pyro Sphere, BlackGuilmon Virus Sphere)
    case 'pyro_hazard': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature />
          {/* Digital Hazard Crest spinning behind projectile */}
          <motion.div
            initial={{ left: attackerX, top: '62%', opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{
              left: [attackerX, '48%', defenderX, defenderX],
              top: ['62%', '56%', '62%', '62%'],
              opacity: [0, 1, 1, 0],
              scale: [0.65, 1.25, 1.35, 0.85],
              rotate: [0, 140, 280, 360],
            }}
            transition={{ duration: 0.5, delay: dOffset, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible">
              <circle cx="50" cy="50" r="42" fill={glowHex} opacity="0.28" />
              <polygon points="50,10 88,78 12,78" fill="none" stroke={accentHex} strokeWidth="4" strokeLinejoin="round" />
              <polygon points="50,24 76,70 24,70" fill="none" stroke={colorHex} strokeWidth="3" />
              <circle cx="50" cy="54" r="22" fill={glowHex} opacity="0.85" />
              <circle cx="50" cy="54" r="14" fill={colorHex} />
              <circle cx="50" cy="54" r="7" fill={accentHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} sizeClass="w-26 h-26" />
        </>
      );
    }

    // 3. FOX TAIL INFERNO (Kyubimon, Youkomon, Viximon)
    case 'fox_inferno': {
      const tails = [-24, -14, -6, 0, 6, 14, 24];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature />
          {tails.map((arcOffset, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: '62%', opacity: 0, scale: 0.45 }}
              animate={{
                left: [attackerX, '46%', defenderX, defenderX],
                top: ['62%', `${60 + arcOffset * 0.9}%`, `${63 + arcOffset * 0.25}%`, '63%'],
                opacity: [0, 1, 1, 0],
                scale: [0.55, 1.15, 1.1, 0.7],
              }}
              transition={{
                duration: 0.46,
                delay: dOffset + idx * 0.028,
                times: [0, 0.35, 0.82, 1],
                ease: 'easeOut',
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg viewBox="0 0 64 34" className="w-14 h-8 overflow-visible" style={{ transform: flipTransform }}>
                <path d="M 4,17 Q 24,2 56,17 Q 24,32 4,17 Z" fill={glowHex} opacity="0.85" />
                <path d="M 16,17 Q 32,7 54,17 Q 32,27 16,17 Z" fill={colorHex} />
                <circle cx="46" cy="17" r="5" fill={accentHex} />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} sizeClass="w-28 h-28" />
        </>
      );
    }

    // 4. TOY VOXEL BLOCKS (ToyAgumon Toy Flame, Solarmon Shiny Ring, Datamon Plug Bomb, Guardromon Gold)
    case 'toy_voxel': {
      const blocks = [
        { midY: '48%', delay: 0.02, rot: 180 },
        { midY: '62%', delay: 0.07, rot: -220 },
        { midY: '72%', delay: 0.12, rot: 260 },
      ];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature />
          {blocks.map((b, i) => (
            <motion.div
              key={i}
              initial={{ left: attackerX, top: '62%', opacity: 0, rotate: 0, scale: 0.6 }}
              animate={{
                left: [attackerX, '50%', defenderX, defenderX],
                top: ['62%', b.midY, '62%', '62%'],
                opacity: [0, 1, 1, 0],
                rotate: [0, b.rot * 0.5, b.rot, b.rot + 45],
                scale: [0.65, 1.2, 1.1, 0.7],
              }}
              transition={{ duration: 0.44, delay: dOffset + b.delay, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg viewBox="0 0 40 40" className="w-10 h-10 overflow-visible">
                <rect x="6" y="6" width="28" height="28" rx="4" fill={glowHex} stroke={accentHex} strokeWidth="3" />
                <rect x="12" y="12" width="16" height="16" fill={colorHex} />
                <rect x="15" y="15" width="6" height="6" fill={accentHex} />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 5. GATE OF DESTINY (MagnaAngemon Gate of Destiny, Alphamon Digitalize of Soul, Magnamon Extreme Jihad)
    case 'gate_portal': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature />
          {/* Grand Dimensional Archway opening behind Defender */}
          <motion.div
            initial={{ opacity: 0, scale: 0.25 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.15, 1.25, 0.85],
            }}
            transition={{ duration: 0.74, delay: dOffset + 0.04, times: [0, 0.28, 0.8, 1], ease: 'easeOut' }}
            style={{ left: defenderX, top: '57%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 130 140" className="w-32 h-36 sm:w-36 sm:h-40 overflow-visible">
              {/* Outer Celestial Arch */}
              <path d="M 18,128 L 18,52 Q 65,4 112,52 L 112,128 Z" fill={glowHex} opacity="0.35" stroke={colorHex} strokeWidth="5" />
              <path d="M 28,124 L 28,56 Q 65,16 102,56 L 102,124 Z" fill="#0f172a" opacity="0.82" stroke={accentHex} strokeWidth="3" />
              {/* Dimensional Vortex Rings */}
              <ellipse cx="65" cy="74" rx="28" ry="38" fill="none" stroke={colorHex} strokeWidth="3.5" strokeDasharray="8 5" />
              <ellipse cx="65" cy="74" rx="18" ry="26" fill={glowHex} opacity="0.6" stroke={accentHex} strokeWidth="2" />
              <circle cx="65" cy="74" r="10" fill={accentHex} opacity="0.95" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} sizeClass="w-28 h-28" />
        </>
      );
    }

    // 6. MANDALA SEAL (Sakuyamon Amethyst Mandala, Kuzuhamon Ura Izuna)
    case 'mandala_seal': {
      const foxOrbs = [0, 90, 180, 270];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature />
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.35, 1.15, 1.3, 1.4],
              rotate: [0, 60, 120, 180],
            }}
            transition={{ duration: 0.68, delay: dOffset + 0.06, times: [0, 0.28, 0.8, 1], ease: 'easeOut' }}
            style={{ left: defenderX, top: '61%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 130 130" className="w-32 h-32 sm:w-36 sm:h-36 overflow-visible">
              <circle cx="65" cy="65" r="56" fill={glowHex} opacity="0.2" stroke={colorHex} strokeWidth="3.5" />
              <circle cx="65" cy="65" r="44" fill="none" stroke={accentHex} strokeWidth="2.5" strokeDasharray="6 5" />
              <polygon points="65,14 110,92 20,92" fill="none" stroke={colorHex} strokeWidth="3" />
              <polygon points="65,116 20,38 110,38" fill="none" stroke={glowHex} strokeWidth="3" />
              {foxOrbs.map((deg) => (
                <g key={deg} transform={`rotate(${deg} 65 65)`}>
                  <circle cx="65" cy="14" r="7" fill={colorHex} stroke={accentHex} strokeWidth="2" />
                </g>
              ))}
              <circle cx="65" cy="65" r="14" fill={accentHex} opacity="0.9" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 7. VULCAN HAMMER (Zudomon Vulcan Hammer, Gankoomon, Clockmon, Puppetmon, Ankylomon)
    case 'vulcan_hammer': {
      return (
        <>
          <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} delay={dOffset} />
          <motion.div
            initial={{ left: defenderX, top: '24%', opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{
              left: [defenderX, defenderX, defenderX, defenderX],
              top: ['24%', '46%', '62%', '62%'],
              opacity: [0, 1, 1, 0],
              rotate: [-45, -15, 20, 28],
              scale: [0.75, 1.15, 1.3, 1.1],
            }}
            transition={{ duration: 0.5, delay: dOffset + 0.08, times: [0, 0.35, 0.76, 1], ease: 'easeIn' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 96 96" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible" style={{ transform: flipTransform }}>
              <rect x="44" y="42" width="10" height="44" rx="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2.5" />
              <rect x="18" y="12" width="60" height="34" rx="6" fill={glowHex} stroke={accentHex} strokeWidth="3" />
              <rect x="24" y="18" width="48" height="22" rx="3" fill={colorHex} />
              <polygon points="10,48 26,38 22,56" fill={accentHex} />
              <polygon points="86,48 70,38 74,56" fill={accentHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} sizeClass="w-28 h-28" />
        </>
      );
    }

    // 8. BEAST KING (Leomon Fist of the Beast King, MadLeomon Beast King Decay)
    case 'beast_king': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature />
          <motion.div
            initial={{ left: attackerX, top: '62%', opacity: 0, scale: 0.5 }}
            animate={{
              left: [attackerX, '52%', defenderX, defenderX],
              top: ['62%', '60%', '62%', '62%'],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.25, 1.45, 1.2],
            }}
            transition={{ duration: 0.48, delay: dOffset + 0.04, times: [0, 0.38, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 110 100" className="w-28 h-24 sm:w-32 sm:h-28 overflow-visible" style={{ transform: flipTransform }}>
              {/* Roaring Lion Mane Aura */}
              <polygon
                points="55,6 68,26 92,16 80,40 106,50 82,62 94,86 68,74 55,94 42,74 16,86 28,62 6,50 30,40 18,16 42,26"
                fill={glowHex}
                opacity="0.85"
                stroke={accentHex}
                strokeWidth="2.5"
              />
              {/* Lion Head Silhouette */}
              <polygon points="34,32 76,32 86,52 72,72 38,72 28,52" fill={colorHex} stroke="#0f172a" strokeWidth="2" />
              <polygon points="44,44 54,48 44,54" fill={accentHex} />
              <polygon points="70,44 60,48 70,54" fill={accentHex} />
              <path d="M 44,62 L 56,58 L 68,62 L 56,68 Z" fill={accentHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} sizeClass="w-28 h-28" />
        </>
      );
    }

    // 9. ROYAL SABER / HOLY LANCE (Gallantmon, ChaosDukemon, Durandamon, SlashAngemon, Knightmon, Valkyrimon)
    case 'royal_saber': {
      return (
        <>
          <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} delay={dOffset} />
          {/* Lance / Blade Streak across arena */}
          <motion.div
            initial={{ left: attackerX, top: '61%', opacity: 0, scaleX: 0.45 }}
            animate={{
              left: [attackerX, '52%', defenderX, defenderX],
              top: ['61%', '61%', '61%', '61%'],
              opacity: [0, 1, 1, 0],
              scaleX: [0.6, 1.35, 1.25, 0.85],
            }}
            transition={{ duration: 0.44, delay: dOffset + 0.04, times: [0, 0.38, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 130 48" className="w-28 h-12 sm:w-32 sm:h-14 overflow-visible" style={{ transform: flipTransform }}>
              <polygon points="6,24 92,10 126,24 92,38" fill={glowHex} opacity="0.7" />
              <polygon points="18,24 96,15 124,24 96,33" fill={colorHex} />
              <polygon points="32,24 98,20 122,24 98,28" fill={accentHex} />
            </svg>
          </motion.div>
          {/* Giant Crescent Slash Finale at target */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
            animate={{
              opacity: [0, 1, 0.9, 0],
              scale: [0.5, 1.25, 1.4, 1.5],
              rotate: [-20, 8, 20, 26],
            }}
            transition={{ duration: 0.42, delay: impactDelay - 0.04, times: [0, 0.25, 0.72, 1], ease: 'easeOut' }}
            style={{ left: defenderX, top: '61%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 110 110" className="w-28 h-28 overflow-visible" style={{ transform: flipTransform }}>
              <path d="M 18,12 Q 98,48 26,96 Q 62,50 18,12 Z" fill={glowHex} opacity="0.8" />
              <path d="M 28,18 Q 90,48 34,88 Q 58,50 28,18 Z" fill={colorHex} />
              <path d="M 38,24 Q 80,50 42,80" fill="none" stroke={accentHex} strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 10. POSITRON LASER / GIGA CANNON (Imperialdramon FM, Machinedramon, WarGrowlmon, MegaKabuterimon)
    case 'positron_laser': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature />
          {/* Cyber Targeting Reticle on defender */}
          <motion.div
            initial={{ opacity: 0, scale: 1.5, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0.9, 0],
              scale: [1.45, 0.95, 1.05, 0.8],
              rotate: [0, 60, 120, 160],
            }}
            transition={{ duration: 0.48, delay: dOffset, times: [0, 0.35, 0.78, 1], ease: 'easeOut' }}
            style={{ left: defenderX, top: '62%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 90 90" className="w-22 h-22 overflow-visible">
              <circle cx="45" cy="45" r="34" fill="none" stroke={colorHex} strokeWidth="2.5" strokeDasharray="10 6" />
              <line x1="45" y1="4" x2="45" y2="20" stroke={accentHex} strokeWidth="3" />
              <line x1="45" y1="70" x2="45" y2="86" stroke={accentHex} strokeWidth="3" />
              <line x1="4" y1="45" x2="20" y2="45" stroke={accentHex} strokeWidth="3" />
              <line x1="70" y1="45" x2="86" y2="45" stroke={accentHex} strokeWidth="3" />
            </svg>
          </motion.div>
          {/* Hyper Focused Dual-Core Cannon Beam */}
          <motion.div
            initial={{ scaleX: 0.08, opacity: 0.25 }}
            animate={{
              scaleX: [0.1, 1, 1, 0.15],
              opacity: [0.4, 1, 1, 0],
            }}
            transition={{ duration: 0.48, delay: dOffset + 0.12, times: [0, 0.3, 0.76, 1], ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '62%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-11 flex items-center"
          >
            <div
              className="w-full h-7 rounded-full"
              style={{
                background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, ${glowHex}, ${colorHex}, ${accentHex})`,
              }}
            />
            <div className="absolute inset-x-1 h-2.5 rounded-full" style={{ backgroundColor: accentHex }} />
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} sizeClass="w-28 h-28" />
        </>
      );
    }

    // 11. CRESCENT MOON (Dianamon Crescent Haken, Skadimon Fimbulvetr, Bastemon)
    case 'crescent_moon': {
      const moons = [-12, 12];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature />
          {moons.map((yOff, i) => (
            <motion.div
              key={i}
              initial={{ left: attackerX, top: `${60 + yOff * 0.5}%`, opacity: 0, rotate: 0, scale: 0.6 }}
              animate={{
                left: [attackerX, '52%', defenderX, defenderX],
                top: [`${60 + yOff * 0.5}%`, `${54 + yOff}%`, '62%', '62%'],
                opacity: [0, 1, 1, 0],
                rotate: [0, 180, 360, 420],
                scale: [0.65, 1.25, 1.2, 0.85],
              }}
              transition={{ duration: 0.46, delay: dOffset + i * 0.06, times: [0, 0.38, 0.82, 1], ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg viewBox="0 0 64 64" className="w-16 h-16 overflow-visible">
                <path d="M 22,6 C 52,14 58,50 22,58 C 38,44 38,20 22,6 Z" fill={glowHex} opacity="0.8" />
                <path d="M 25,10 C 48,18 52,46 25,54 C 37,42 37,22 25,10 Z" fill={colorHex} stroke={accentHex} strokeWidth="2" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 12. TWIN MISSILES (MetalGreymon Giga Blaster, Megadramon, SkullGreymon, Guardromon)
    case 'twin_missiles': {
      const lanes = [
        { startTop: '54%', midTop: '40%', endTop: '58%', delay: 0.02 },
        { startTop: '68%', midTop: '74%', endTop: '66%', delay: 0.09 },
      ];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          {lanes.map((lane, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: lane.startTop, opacity: 0, scale: 0.6 }}
              animate={{
                left: [attackerX, '48%', defenderX, defenderX],
                top: [lane.startTop, lane.midTop, lane.endTop, lane.endTop],
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.15, 1.05, 0.8],
              }}
              transition={{ duration: 0.42, delay: dOffset + lane.delay, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg viewBox="0 0 88 38" className="w-18 h-9 sm:w-22 sm:h-10 overflow-visible" style={{ transform: flipTransform }}>
                <path d="M 0,19 L 18,11 L 14,19 L 18,27 Z" fill="#fb923c" />
                <circle cx="10" cy="19" r="6" fill="#fef08a" opacity="0.9" />
                <rect x="18" y="12" width="42" height="14" rx="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
                <path d="M 22,12 L 16,5 L 30,12 Z M 22,26 L 16,33 L 30,26 Z" fill={glowHex} />
                <polygon points="60,11 82,19 60,27" fill={colorHex} stroke="#0f172a" strokeWidth="2" />
                <rect x="28" y="16" width="22" height="5" fill={accentHex} opacity="0.85" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
          <ImpactBurstRing defenderX={defenderX} colorHex="#fef08a" glowHex={glowHex} isCrit={isCrit} delay={impactDelay + 0.08} sizeClass="w-16 h-16" />
        </>
      );
    }

    // 13. RAPID VOLLEY (Paildramon Desperado Blaster, Beelzebumon Double Impact, Gargomon, Rapidmon)
    case 'rapid_volley': {
      const shots = [0, 1, 2, 3, 4, 5];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          {shots.map((i) => {
            const yPct = `${55 + (i % 3) * 6}%`;
            return (
              <motion.div
                key={i}
                initial={{ left: attackerX, top: yPct, opacity: 0, scaleX: 0.6 }}
                animate={{
                  left: [attackerX, '52%', defenderX, defenderX],
                  top: [yPct, yPct, yPct, yPct],
                  opacity: [0, 1, 1, 0],
                  scaleX: [0.8, 1.4, 1.1, 0.7],
                }}
                transition={{ duration: 0.28, delay: dOffset + i * 0.05, times: [0, 0.35, 0.82, 1], ease: 'linear' }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className="w-12 h-3 rounded-full border border-white/50"
                  style={{
                    background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${colorHex}, ${accentHex})`,
                  }}
                />
              </motion.div>
            );
          })}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 14. V/X CREST WAVE (ExVeemon X-Laser, AeroVeedramon V-Wing Blade, UlforceVeedramon Shining V-Force)
    case 'v_x_wave': {
      const isX = (moveName || '').toLowerCase().includes('x-');
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.5 }}
            animate={{
              left: [attackerX, '50%', defenderX, defenderX],
              top: ['63%', '61%', '63%', '63%'],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.25, 1.45, 1.1],
            }}
            transition={{ duration: 0.44, delay: dOffset + 0.04, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 90 90" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible" style={{ transform: flipTransform }}>
              {isX ? (
                <>
                  <path d="M 18,14 L 74,76 M 74,14 L 18,76" stroke={glowHex} strokeWidth="12" strokeLinecap="round" />
                  <path d="M 18,14 L 74,76 M 74,14 L 18,76" stroke={colorHex} strokeWidth="7" strokeLinecap="round" />
                  <path d="M 18,14 L 74,76 M 74,14 L 18,76" stroke={accentHex} strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d="M 18,12 L 76,45 L 18,78" fill="none" stroke={glowHex} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 18,12 L 76,45 L 18,78" fill="none" stroke={colorHex} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 22,18 L 70,45 L 22,72" fill="none" stroke={accentHex} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 15 & 16. FLAME BREATH & FROST BREATH (Greymon Mega Flame, Garurumon Howling Blaster, MetalGarurumon Cocytus Breath)
    case 'flame_breath':
    case 'frost_breath': {
      const isFrost = styleKey === 'frost_breath';
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ scaleX: 0.1, opacity: 0.3 }}
            animate={{ scaleX: [0.12, 1, 1.05, 0.25], opacity: [0.4, 1, 0.95, 0] }}
            transition={{ duration: 0.54, delay: dOffset + 0.04, times: [0, 0.32, 0.75, 1], ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '62%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-22 sm:h-26"
          >
            <svg viewBox="0 0 240 90" preserveAspectRatio="none" className="w-full h-full overflow-visible" style={{ transform: flipTransform }}>
              <polygon points="0,45 235,6 235,84" fill={glowHex} opacity="0.6" />
              <polygon points="8,45 235,16 235,74" fill={colorHex} opacity="0.88" />
              <polygon points="16,45 228,30 228,60" fill={isFrost ? '#ecfeff' : '#fef08a'} opacity="0.92" />
              <polygon points="40,45 95,28 85,45 145,22 135,48 210,18 228,45 210,72 135,44 145,68 85,45 95,62" fill={accentHex} opacity="0.65" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 17. COMET RUSH (Flamedramon Fire Rocket, Veemon Vee-Headbutt, Armadillomon Diamond Shell, Triceramon)
    case 'comet_rush': {
      return (
        <>
          <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} delay={dOffset} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.6 }}
            animate={{
              left: [attackerX, '50%', defenderX, defenderX],
              top: ['63%', '60%', '63%', '63%'],
              opacity: [0, 1, 1, 0],
              scale: [0.7, 1.25, 1.35, 1.05],
            }}
            transition={{ duration: 0.42, delay: dOffset + 0.03, times: [0, 0.36, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 100 80" className="w-24 h-20 sm:w-28 sm:h-24 overflow-visible" style={{ transform: flipTransform }}>
              <path d="M 6,40 Q 45,6 92,40 Q 45,74 6,40 Z" fill={glowHex} opacity="0.82" />
              <path d="M 24,40 Q 56,16 90,40 Q 56,64 24,40 Z" fill={colorHex} />
              <path d="M 46,40 Q 68,26 88,40 Q 68,54 46,40 Z" fill={accentHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} sizeClass="w-24 h-24 sm:w-28 sm:h-28" />
        </>
      );
    }

    // 18. WING STORM (Birdramon Meteor Wing, Garudamon Shadow Wing, Phoenixmon Starlight Explosion)
    case 'wing_storm': {
      const feathers = [-16, 0, 16];
      return (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.45 }}
            animate={{ opacity: [0, 1, 0.9, 0], scale: [0.5, 1.25, 1.4, 1.55] }}
            transition={{ duration: 0.48, delay: dOffset, times: [0, 0.3, 0.72, 1], ease: 'easeOut' }}
            style={{ left: attackerX, top: '58%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 120 80" className="w-28 h-20 overflow-visible" style={{ transform: flipTransform }}>
              <path d="M 55,48 Q 20,10 6,18 Q 24,34 12,46 Q 30,50 24,62 Q 48,58 55,48 Z" fill={glowHex} opacity="0.88" />
              <path d="M 55,48 Q 92,10 114,18 Q 94,34 108,46 Q 88,50 96,62 Q 70,58 55,48 Z" fill={colorHex} opacity="0.92" />
            </svg>
          </motion.div>
          {feathers.map((offset, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: `${56 + offset * 0.4}%`, opacity: 0 }}
              animate={{
                left: [attackerX, '50%', defenderX, defenderX],
                top: [`${56 + offset * 0.4}%`, `${60 + offset * 0.6}%`, `${63 + offset * 0.45}%`, '63%'],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 0.42, delay: dOffset + 0.05 + idx * 0.04, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg viewBox="0 0 56 22" className="w-12 h-5 sm:w-14 sm:h-6 overflow-visible" style={{ transform: flipTransform }}>
                <path d="M 4,11 Q 28,2 54,11 Q 28,20 4,11 Z" fill={colorHex} stroke={accentHex} strokeWidth="1.5" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 19. TORNADO (Biyomon Spiral Twister, Magnadramon Fire Tornado, Fugamon Evil Hurricane)
    case 'tornado': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ left: attackerX, top: '60%', opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{
              left: [attackerX, '50%', defenderX, defenderX],
              top: ['60%', '58%', '60%', '60%'],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.15, 1.3, 1.05],
              rotate: [0, 120, 240, 360],
            }}
            transition={{ duration: 0.48, delay: dOffset + 0.04, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 80 96" className="w-20 h-24 sm:w-24 sm:h-28 overflow-visible">
              <ellipse cx="40" cy="18" rx="34" ry="9" fill="none" stroke={colorHex} strokeWidth="5" />
              <ellipse cx="40" cy="36" rx="26" ry="8" fill="none" stroke={glowHex} strokeWidth="5" />
              <ellipse cx="40" cy="54" rx="19" ry="7" fill="none" stroke={colorHex} strokeWidth="4.5" />
              <ellipse cx="40" cy="70" rx="12" ry="5" fill="none" stroke={accentHex} strokeWidth="3.5" />
              <polygon points="40,88 32,74 48,74" fill={colorHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 20. THUNDER STRIKE (Tentomon, Kabuterimon, HerculesKabuterimon, Parrotmon Mjolnir Thunder)
    case 'thunder_strike': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ scaleX: 0.1, opacity: 0.3 }}
            animate={{ scaleX: [0.12, 1, 1, 0.25], opacity: [0.5, 1, 0.9, 0] }}
            transition={{ duration: 0.46, delay: dOffset + 0.04, times: [0, 0.35, 0.76, 1], ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '62%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-14"
          >
            <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="w-full h-full overflow-visible" style={{ transform: flipTransform }}>
              <polyline points="0,25 36,10 60,36 102,8 134,38 172,14 200,25" fill="none" stroke={glowHex} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="0,25 36,10 60,36 102,8 134,38 172,14 200,25" fill="none" stroke={colorHex} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="0,25 36,10 60,36 102,8 134,38 172,14 200,25" fill="none" stroke={accentHex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scaleY: 0.2 }}
            animate={{ opacity: [0, 1, 1, 0], scaleY: [0.3, 1, 1, 0.8] }}
            transition={{ duration: 0.42, delay: impactDelay - 0.08, times: [0, 0.3, 0.75, 1], ease: 'easeOut' }}
            style={{ left: defenderX, top: '38%', transformOrigin: 'top center' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 60 120" className="w-16 h-28 overflow-visible">
              <polyline points="34,0 18,44 38,52 16,112" fill="none" stroke={glowHex} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="34,0 18,44 38,52 16,112" fill="none" stroke={colorHex} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="34,0 18,44 38,52 16,112" fill="none" stroke={accentHex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 21. DIAMOND STORM (Renamon Diamond Storm, Vikemon Arctic Blizzard, Sleipmon Bifrost)
    case 'diamond_storm': {
      const shards = [
        { yOff: -14, delay: 0.02, rot: -12 },
        { yOff: -5, delay: 0.06, rot: 4 },
        { yOff: 5, delay: 0.04, rot: 14 },
        { yOff: 14, delay: 0.09, rot: -6 },
      ];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          {shards.map((sh, i) => (
            <motion.div
              key={i}
              initial={{ left: attackerX, top: `${60 + sh.yOff}%`, opacity: 0, scale: 0.6, rotate: sh.rot }}
              animate={{
                left: [attackerX, '50%', defenderX, defenderX],
                top: [`${60 + sh.yOff}%`, `${61 + sh.yOff * 0.7}%`, `${63 + sh.yOff * 0.4}%`, '63%'],
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.15, 1.05, 0.85],
                rotate: [sh.rot, sh.rot, sh.rot, sh.rot],
              }}
              transition={{ duration: 0.42, delay: dOffset + sh.delay, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg viewBox="0 0 48 32" className="w-12 h-8 sm:w-14 sm:h-9 overflow-visible" style={{ transform: flipTransform }}>
                <polygon points="4,16 24,4 44,16 24,28" fill={glowHex} opacity="0.85" />
                <polygon points="8,16 24,7 40,16 24,25" fill={colorHex} />
                <polygon points="15,16 24,11 33,16 24,21" fill={accentHex} opacity="0.9" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 22. VINE WHIP (Palmon Poison Ivy, Wormmon Sticky Net)
    case 'vine_whip': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ scaleX: 0.08, opacity: 0.3 }}
            animate={{ scaleX: [0.12, 1, 1, 0.2], opacity: [0.5, 1, 1, 0] }}
            transition={{ duration: 0.48, delay: dOffset + 0.04, times: [0, 0.35, 0.76, 1], ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '63%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-14"
          >
            <svg viewBox="0 0 220 50" preserveAspectRatio="none" className="w-full h-full overflow-visible" style={{ transform: flipTransform }}>
              <path d="M 0,28 Q 45,6 90,26 T 180,22 L 220,25" fill="none" stroke={colorHex} strokeWidth="6" strokeLinecap="round" />
              <path d="M 0,20 Q 55,44 105,20 T 195,28 L 220,23" fill="none" stroke={glowHex} strokeWidth="4" strokeLinecap="round" />
              <polygon points="60,12 66,4 70,15" fill="#bef264" />
              <polygon points="128,34 134,44 138,31" fill="#bef264" />
              <polygon points="182,16 188,6 192,18" fill="#bef264" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 23. NEEDLE RAIN (Togemon Needle Spray, Stingmon, Jewelbeemon, DemiDevimon Pico Darts, Lalamon)
    case 'needle_rain': {
      const needles = [-14, -7, 0, 7, 14];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          {needles.map((deg, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: '62%', opacity: 0 }}
              animate={{
                left: [attackerX, '50%', defenderX, defenderX],
                top: ['62%', `${62 + deg * 0.5}%`, `${63 + deg * 0.8}%`, '63%'],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 0.36, delay: dOffset + idx * 0.03, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg
                viewBox="0 0 54 14"
                className="w-12 h-3.5 overflow-visible"
                style={{ transform: `${flipTransform || ''} rotate(${deg * 0.5}deg)` }}
              >
                <polygon points="2,7 36,3 52,7 36,11" fill={colorHex} stroke={accentHex} strokeWidth="1" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 24. FLOWER BURST (Lillymon Flower Cannon, Rosemon Forbidden Temptation, Sunflowmon, Hudiemon)
    case 'flower_burst': {
      const petals = [0, 60, 120, 180, 240, 300];
      return (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0.9, 0],
              scale: [0.5, 1.15, 1.3, 1.4],
              rotate: [0, 40, 80, 120],
            }}
            transition={{ duration: 0.48, delay: dOffset, times: [0, 0.28, 0.72, 1], ease: 'easeOut' }}
            style={{ left: attackerX, top: '63%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 80 80" className="w-22 h-22 overflow-visible">
              {petals.map((deg) => (
                <ellipse key={deg} cx="40" cy="18" rx="9" ry="16" fill={colorHex} opacity="0.9" transform={`rotate(${deg} 40 40)`} />
              ))}
              <circle cx="40" cy="40" r="10" fill={accentHex} />
            </svg>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0.08, opacity: 0.3 }}
            animate={{ scaleX: [0.1, 1, 1, 0.2], opacity: [0.5, 1, 1, 0] }}
            transition={{ duration: 0.48, delay: dOffset + 0.08, times: [0, 0.35, 0.76, 1], ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '63%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-8 flex items-center"
          >
            <div
              className="w-full h-5 rounded-full"
              style={{
                background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, ${glowHex}, ${colorHex}, ${accentHex})`,
              }}
            />
            <div className="absolute inset-x-1 h-2 rounded-full" style={{ backgroundColor: accentHex }} />
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 25. FISH MARCH (Gomamon Marching Fishes, Divermon Striking Fish)
    case 'fish_march': {
      const fishColors = ['#38bdf8', '#fb923c', '#facc15', '#4ade80', '#f472b6'];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          {fishColors.map((fColor, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: `${56 + (idx % 3) * 6}%`, opacity: 0, scale: 0.6 }}
              animate={{
                left: [attackerX, '50%', defenderX, defenderX],
                top: [`${56 + (idx % 3) * 6}%`, `${50 + (idx % 3) * 6}%`, `${62 + (idx % 3) * 4}%`, '63%'],
                opacity: [0, 1, 1, 0],
                scale: [0.75, 1.1, 1.0, 0.8],
              }}
              transition={{ duration: 0.44, delay: dOffset + idx * 0.045, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg viewBox="0 0 46 28" className="w-11 h-7 sm:w-12 sm:h-7 overflow-visible" style={{ transform: flipTransform }}>
                <polygon points="2,14 14,5 14,23" fill={fColor} />
                <ellipse cx="26" cy="14" rx="14" ry="9" fill={fColor} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="33" cy="11" r="2" fill="#0f172a" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex="#38bdf8" glowHex="#0284c7" isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 26. TIDAL WAVE (Whamon Tidal Wave, Shellmon Hydro Pressure, Tobiumon, Sangomon)
    case 'tidal_wave': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.6 }}
            animate={{
              left: [attackerX, '50%', defenderX, defenderX],
              top: ['63%', '61%', '63%', '63%'],
              opacity: [0, 1, 1, 0],
              scale: [0.7, 1.25, 1.4, 1.1],
            }}
            transition={{ duration: 0.46, delay: dOffset + 0.04, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 96 72" className="w-24 h-18 sm:w-28 sm:h-20 overflow-visible" style={{ transform: flipTransform }}>
              <path d="M 6,66 Q 38,8 88,20 Q 64,26 70,40 Q 80,46 92,66 Z" fill={glowHex} opacity="0.88" />
              <path d="M 16,66 Q 44,18 82,24 Q 60,32 68,48 L 84,66 Z" fill={colorHex} />
              <path d="M 62,18 Q 78,12 90,22 Q 78,28 66,24 Z" fill="#e0f2fe" opacity="0.92" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 27. HARPOON / TRIDENT (Ikkakumon Harpoon Torpedo, Dagomon Forbidden Trident, MegaSeadramon Lightning Javelin)
    case 'harpoon_trident': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.7 }}
            animate={{
              left: [attackerX, '50%', defenderX, defenderX],
              top: ['63%', '61%', '63%', '63%'],
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1.25, 1.15, 0.9],
            }}
            transition={{ duration: 0.42, delay: dOffset + 0.05, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 96 42" className="w-22 h-10 sm:w-26 sm:h-11 overflow-visible" style={{ transform: flipTransform }}>
              <rect x="6" y="18" width="58" height="6" rx="2" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
              <polygon points="62,9 92,21 62,33 70,21" fill={colorHex} stroke={accentHex} strokeWidth="1.5" />
              <polygon points="6,21 20,12 20,30" fill="#fb923c" opacity="0.95" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 28. BUBBLES (Patamon Boom Bubble, Otamamon Lullaby Bubble, Syakomon Black Pearl, Fresh/In-Training)
    case 'bubbles': {
      const bubbles = [
        { size: 'w-9 h-9', delay: 0.02, arc: '54%' },
        { size: 'w-12 h-12', delay: 0.07, arc: '67%' },
        { size: 'w-8 h-8', delay: 0.12, arc: '58%' },
      ];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          {bubbles.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.5 }}
              animate={{
                left: [attackerX, '50%', defenderX, defenderX],
                top: ['63%', b.arc, '63%', '63%'],
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.15, 1.35, 0.9],
              }}
              transition={{ duration: 0.42, delay: dOffset + b.delay, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${b.size} rounded-full border-2`}
              style={{
                borderColor: accentHex,
                background: `radial-gradient(circle at 32% 30%, ${accentHex}aa, ${colorHex}88 55%, ${glowHex}cc 100%)`,
              }}
            />
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 29. CELESTIAL ARROW (Angewomon Celestial Arrow, Ophanimon Eden Javelin, Angemon Hand of Fate, Pegasusmon)
    case 'celestial_arrow': {
      return (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.9, 0], scale: [0.55, 1.15, 1.3, 1.4] }}
            transition={{ duration: 0.44, delay: dOffset, times: [0, 0.3, 0.72, 1], ease: 'easeOut' }}
            style={{ left: attackerX, top: '63%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 60 90" className="w-14 h-20 overflow-visible" style={{ transform: flipTransform }}>
              <path d="M 22,8 Q 54,45 22,82" fill="none" stroke={colorHex} strokeWidth="5" strokeLinecap="round" />
              <line x1="22" y1="8" x2="22" y2="82" stroke={accentHex} strokeWidth="2" opacity="0.85" />
            </svg>
          </motion.div>
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scaleX: 0.6 }}
            animate={{
              left: [attackerX, '50%', defenderX, defenderX],
              top: ['63%', '61%', '63%', '63%'],
              opacity: [0, 1, 1, 0],
              scaleX: [0.8, 1.3, 1.15, 0.8],
            }}
            transition={{ duration: 0.4, delay: dOffset + 0.06, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 104 36" className="w-24 h-8 sm:w-28 sm:h-9 overflow-visible" style={{ transform: flipTransform }}>
              <line x1="6" y1="18" x2="78" y2="18" stroke={colorHex} strokeWidth="6" strokeLinecap="round" />
              <line x1="12" y1="18" x2="80" y2="18" stroke={accentHex} strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="72,6 100,18 72,30 80,18" fill={accentHex} stroke={glowHex} strokeWidth="2" />
              <polygon points="4,10 18,18 4,26 10,18" fill={glowHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 30. HOLY ORBS (Seraphimon Seven Heavens, Starmon Meteor Squall, Monzaemon Hearts Attack)
    case 'holy_orbs': {
      const isHearts = (moveName || '').toLowerCase().includes('heart');
      const orbs = [0, 1, 2, 3, 4, 5, 6];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          {orbs.map((i) => {
            const yStart = `${42 + (i % 4) * 9}%`;
            const yMid = `${49 + (i % 3) * 6}%`;
            const yEnd = `${55 + (i % 3) * 6}%`;
            return (
              <motion.div
                key={i}
                initial={{ left: attackerX, top: yStart, opacity: 0, scale: 0.5 }}
                animate={{
                  left: [attackerX, '50%', defenderX, defenderX],
                  top: [yStart, yMid, yEnd, yEnd],
                  opacity: [0, 1, 1, 0],
                  scale: [0.6, 1.15, 1.05, 0.8],
                }}
                transition={{ duration: 0.4, delay: dOffset + i * 0.035, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                {isHearts ? (
                  <svg viewBox="0 0 32 32" className="w-7 h-7 overflow-visible">
                    <path d="M16 28 C16 28 3 19 3 10.5 C3 6.5 6.2 3.5 10 3.5 C12.6 3.5 14.9 5 16 7 C17.1 5 19.4 3.5 22 3.5 C25.8 3.5 29 6.5 29 10.5 C29 19 16 28 16 28 Z" fill={colorHex} stroke={accentHex} strokeWidth="1.5" />
                  </svg>
                ) : (
                  <div
                    className="w-7 h-7 rounded-full border-2"
                    style={{
                      borderColor: accentHex,
                      background: `radial-gradient(circle, ${accentHex} 15%, ${colorHex} 60%, ${glowHex} 100%)`,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 31. SACRED SEAL (Taomon Bonhitsusen, Nefertimon Rosetta Stone, Doumon Dark Talisman)
    case 'sacred_seal': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.35, 1.15, 1.3, 1.4],
              rotate: [0, 45, 90, 120],
            }}
            transition={{ duration: 0.56, delay: dOffset + 0.08, times: [0, 0.3, 0.78, 1], ease: 'easeOut' }}
            style={{ left: defenderX, top: '61%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 120 120" className="w-28 h-28 sm:w-32 sm:h-32 overflow-visible">
              <circle cx="60" cy="60" r="50" fill={glowHex} opacity="0.2" stroke={colorHex} strokeWidth="4" />
              <circle cx="60" cy="60" r="38" fill="none" stroke={glowHex} strokeWidth="2.5" strokeDasharray="8 5" />
              <polygon points="60,12 102,84 18,84" fill="none" stroke={accentHex} strokeWidth="2.5" opacity="0.9" />
              <polygon points="60,108 18,36 102,36" fill="none" stroke={colorHex} strokeWidth="2.5" opacity="0.9" />
              <circle cx="60" cy="60" r="16" fill={glowHex} opacity="0.6" />
              <circle cx="60" cy="60" r="8" fill={accentHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 32. BEAST FIST (Basic melee / Justimon Justice Kick / Frigimon Ice Punch)
    case 'beast_fist': {
      const isRanged = spec.motion === 'ranged';
      return (
        <>
          {!isRanged && <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} delay={dOffset} />}
          <motion.div
            initial={{ left: isRanged ? attackerX : defenderX, top: '63%', opacity: 0, scale: 0.5 }}
            animate={
              isRanged
                ? { left: [attackerX, '52%', defenderX, defenderX], opacity: [0, 1, 1, 0], scale: [0.65, 1.2, 1.3, 1.0] }
                : { left: [defenderX, defenderX, defenderX, defenderX], opacity: [0, 1, 1, 0], scale: [0.5, 1.15, 1.3, 1.0] }
            }
            transition={{ duration: 0.4, delay: isRanged ? dOffset + 0.04 : Math.max(0.12, impactDelay - 0.08), times: [0, 0.35, 0.78, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible" style={{ transform: flipTransform }}>
              <polygon
                points="50,6 59,34 88,20 68,45 96,54 68,62 84,88 56,70 48,96 42,68 14,82 32,56 4,48 34,40 16,14 44,32"
                fill={glowHex}
                stroke={colorHex}
                strokeWidth="2.5"
              />
              <path d="M 28,36 L 62,32 L 78,48 L 62,68 L 28,64 Z" fill={colorHex} stroke={accentHex} strokeWidth="2.5" />
              <circle cx="54" cy="50" r="10" fill={accentHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 33. BAT SWARM (Myotismon Grisly Wing, MaloMyotismon, LadyDevimon Darkness Wave, Pumpkinmon)
    case 'bat_swarm': {
      const isPumpkin = (moveName || '').toLowerCase().includes('treat');
      const bats = [
        { yA: '52%', yB: '60%', delay: 0.02 },
        { yA: '68%', yB: '57%', delay: 0.06 },
        { yA: '59%', yB: '67%', delay: 0.1 },
        { yA: '63%', yB: '63%', delay: 0.04 },
      ];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          {bats.map((b, i) => (
            <motion.div
              key={i}
              initial={{ left: attackerX, top: b.yA, opacity: 0, scale: 0.6 }}
              animate={{
                left: [attackerX, '50%', defenderX, defenderX],
                top: [b.yA, b.yB, '63%', '63%'],
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.15, 1.0, 0.8],
              }}
              transition={{ duration: 0.44, delay: dOffset + b.delay, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              {isPumpkin ? (
                <svg viewBox="0 0 40 40" className="w-10 h-10 overflow-visible">
                  <circle cx="20" cy="22" r="14" fill="#ea580c" stroke="#fde047" strokeWidth="1.5" />
                  <polygon points="12,18 16,15 17,20" fill="#fef08a" />
                  <polygon points="28,18 24,15 23,20" fill="#fef08a" />
                  <path d="M 12,26 Q 20,31 28,26" fill="none" stroke="#fef08a" strokeWidth="2.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 56 32" className="w-12 h-7 overflow-visible" style={{ transform: flipTransform }}>
                  <path d="M 28,18 Q 16,4 2,12 Q 12,22 20,22 Q 25,24 28,26 Q 31,24 36,22 Q 44,22 54,12 Q 40,4 28,18 Z" fill={glowHex} stroke={colorHex} strokeWidth="1.5" />
                  <circle cx="25" cy="17" r="1.5" fill="#fef08a" />
                  <circle cx="31" cy="17" r="1.5" fill="#fef08a" />
                </svg>
              )}
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 34. SHADOW HAND (Devimon Touch of Evil, Bakemon Hell Hand, Belphemon, Lilithmon, Leviamon)
    case 'shadow_hand': {
      return (
        <>
          {spec.motion === 'melee' && <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} delay={dOffset} />}
          <motion.div
            initial={{ opacity: 0, scale: 0.45 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.25, 1.08, 1.3] }}
            transition={{ duration: 0.52, delay: Math.max(0.14, impactDelay - 0.08), times: [0, 0.3, 0.78, 1], ease: 'easeOut' }}
            style={{ left: defenderX, top: '61%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 100 100" className="w-26 h-26 sm:w-28 sm:h-28 overflow-visible">
              <circle cx="50" cy="50" r="36" fill="#1e1b4b" opacity="0.72" />
              <path d="M 24,78 L 28,36 L 34,20 L 40,40 L 48,14 L 54,38 L 64,16 L 68,42 L 78,28 L 72,74 Z" fill={glowHex} stroke={colorHex} strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 35. REAPER SCYTHE / TRUMP SWORD / SHURIKEN (Piedmon, Phantomon, Ninjamon, Murasamemon)
    case 'reaper_scythe': {
      const isThrowing = spec.motion === 'ranged' && /trump|shuriken/i.test(moveName || '');
      const isShuriken = /shuriken/i.test(moveName || '');
      if (isThrowing) {
        const swords = [-14, -4, 6, 16];
        return (
          <>
            <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
            {swords.map((yOff, i) => (
              <motion.div
                key={i}
                initial={{ left: attackerX, top: `${60 + yOff}%`, opacity: 0, rotate: 0 }}
                animate={{
                  left: [attackerX, '50%', defenderX, defenderX],
                  top: [`${60 + yOff}%`, `${58 + yOff}%`, '62%', '62%'],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 180, 360, 450],
                }}
                transition={{ duration: 0.42, delay: dOffset + i * 0.04, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                {isShuriken ? (
                  <svg viewBox="0 0 40 40" className="w-10 h-10 overflow-visible">
                    <polygon points="20,2 25,15 38,20 25,25 20,38 15,25 2,20 15,15" fill={colorHex} stroke={accentHex} strokeWidth="1.5" />
                    <circle cx="20" cy="20" r="4" fill="#0f172a" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 64 24" className="w-14 h-6 overflow-visible" style={{ transform: flipTransform }}>
                    <rect x="4" y="10" width="12" height="4" fill={accentHex} />
                    <rect x="14" y="4" width="4" height="16" fill={glowHex} />
                    <polygon points="18,7 58,12 18,17" fill="#e2e8f0" stroke={colorHex} strokeWidth="1.5" />
                  </svg>
                )}
              </motion.div>
            ))}
            <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
          </>
        );
      }

      const isRangedWave = spec.motion === 'ranged';
      return (
        <>
          {!isRangedWave && <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} delay={dOffset} />}
          <motion.div
            initial={{ left: isRangedWave ? attackerX : defenderX, top: '62%', opacity: 0, scale: 0.5 }}
            animate={
              isRangedWave
                ? { left: [attackerX, '50%', defenderX, defenderX], opacity: [0, 1, 1, 0], scale: [0.65, 1.25, 1.35, 1.0] }
                : { left: [defenderX, defenderX, defenderX, defenderX], opacity: [0, 1, 1, 0], scale: [0.55, 1.25, 1.35, 1.1] }
            }
            transition={{ duration: 0.44, delay: isRangedWave ? dOffset + 0.04 : Math.max(0.16, impactDelay - 0.06), times: [0, 0.35, 0.8, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible" style={{ transform: flipTransform }}>
              <path d="M 20,12 Q 92,45 28,90 Q 60,48 20,12 Z" fill={glowHex} opacity="0.88" />
              <path d="M 28,16 Q 86,46 34,86 Q 58,48 28,16 Z" fill={colorHex} />
              <path d="M 38,24 Q 78,48 42,78" fill="none" stroke={accentHex} strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 36. SONIC WAVE (Shoutmon Rock Soul, Etemon Dark Spirits, Gekomon Symphony Crusher, Salamon Puppy Howl)
    case 'sonic_wave': {
      const rings = [0, 1, 2];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          {rings.map((i) => (
            <motion.div
              key={i}
              initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.45 }}
              animate={{
                left: [attackerX, '50%', defenderX, defenderX],
                top: ['63%', '62%', '63%', '63%'],
                opacity: [0, 1, 0.9, 0],
                scale: [0.5, 1.2, 1.55, 1.7],
              }}
              transition={{ duration: 0.42, delay: dOffset + i * 0.06, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg viewBox="0 0 56 80" className="w-12 h-20 overflow-visible" style={{ transform: flipTransform }}>
                <path d="M 14,10 Q 48,40 14,70" fill="none" stroke={glowHex} strokeWidth="9" strokeLinecap="round" opacity="0.55" />
                <path d="M 14,10 Q 48,40 14,70" fill="none" stroke={colorHex} strokeWidth="5" strokeLinecap="round" />
                <path d="M 14,10 Q 48,40 14,70" fill="none" stroke={accentHex} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 37. DRILL / BOULDER / GEAR (Drimogemon Drill Spin, Gotsumon Angry Rock, Hagurumon Darkness Gear)
    case 'drill_boulder': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, rotate: 0, scale: 0.7 }}
            animate={{
              left: [attackerX, '50%', defenderX, defenderX],
              top: ['63%', '52%', '63%', '63%'],
              opacity: [0, 1, 1, 0],
              rotate: [0, 180, 360, 440],
              scale: [0.75, 1.2, 1.15, 0.9],
            }}
            transition={{ duration: 0.44, delay: dOffset + 0.04, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16 overflow-visible">
              <polygon points="18,8 46,10 58,32 48,54 20,56 8,34" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
              <polygon points="22,16 40,18 46,32 36,46 20,44" fill={colorHex} opacity="0.7" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 38. POOP / TOXIC SPLAT (Numemon Poop Toss, Raremon Sludge Breath, Dokunemon Worm Venom, Octmon Ink)
    case 'poop_splat': {
      return (
        <>
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, rotate: 0 }}
            animate={{
              left: [attackerX, '50%', defenderX, defenderX],
              top: ['63%', '30%', '63%', '63%'],
              opacity: [0, 1, 1, 0],
              rotate: [0, 180, 360, 390],
            }}
            transition={{ duration: 0.44, delay: dOffset + 0.04, times: [0, 0.4, 0.82, 1], ease: 'easeInOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 56 56" className="w-12 h-12 sm:w-14 sm:h-14 overflow-visible">
              <path d="M 10,42 Q 10,32 20,32 Q 16,22 26,22 Q 24,12 30,10 Q 34,18 38,22 Q 44,24 42,32 Q 48,34 46,42 Z" fill={colorHex} stroke="#0f172a" strokeWidth="2" />
              <circle cx="24" cy="36" r="2.5" fill={glowHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={glowHex} glowHex={colorHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 39. CLAW SLASH (WereGarurumon Wolf Claw, Devidramon Crimson Nail, Cyberdramon Erase Claw, Gatomon Lightning Paw)
    case 'claw_slash': {
      return (
        <>
          <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} delay={dOffset} />
          <motion.div
            initial={{ opacity: 0, scale: 0.45 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.15, 1.28, 1.38] }}
            transition={{ duration: 0.44, delay: Math.max(0.14, impactDelay - 0.06), times: [0, 0.25, 0.72, 1], ease: 'easeOut' }}
            style={{ left: defenderX, top: '63%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible" style={{ transform: flipTransform }}>
              <path d="M 14,20 Q 54,42 88,78" stroke={glowHex} strokeWidth="9" strokeLinecap="round" fill="none" />
              <path d="M 24,10 Q 60,36 92,66" stroke={colorHex} strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 8,38 Q 48,60 80,90" stroke={colorHex} strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 14,20 Q 54,42 88,78" stroke={accentHex} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 24,10 Q 60,36 92,66" stroke={accentHex} strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
        </>
      );
    }

    // 40. BEAM (Energy Beams)
    case 'beam': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ scaleX: 0.08, opacity: 0.25 }}
            animate={{ scaleX: [0.1, 1, 1, 0.15], opacity: [0.5, 1, 1, 0] }}
            transition={{ duration: 0.48, delay: dOffset + 0.06, times: [0, 0.32, 0.74, 1], ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '63%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-9 sm:h-11 flex items-center"
          >
            <div
              className="w-full h-6 sm:h-7 rounded-full"
              style={{
                background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, ${glowHex}, ${colorHex}, ${accentHex})`,
              }}
            />
            <div className="absolute inset-x-1 h-2.5 sm:h-3 rounded-full" style={{ backgroundColor: accentHex }} />
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }

    // 41. DRAGON FIREBALL & PEPPER BREATH (Agumon Pepper Breath, BlackAgumon Black Flame, Meramon Fireball)
    case 'dragon_fireball':
    default: {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} isSignature={isSignature} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.65 }}
            animate={{
              left: [attackerX, '50%', defenderX, defenderX],
              top: ['63%', '58%', '63%', '63%'],
              opacity: [0, 1, 1, 0],
              scale: [0.75, 1.3, 1.25, 0.9],
            }}
            transition={{ duration: 0.44, delay: dOffset + 0.05, times: [0, 0.35, 0.82, 1], ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 88 52" className="w-20 h-12 sm:w-24 sm:h-14 overflow-visible" style={{ transform: flipTransform }}>
              <path d="M 4,26 Q 26,6 52,12 Q 74,14 80,26 Q 74,38 52,40 Q 26,46 4,26 Z" fill={glowHex} opacity="0.92" />
              <path d="M 20,26 Q 38,14 58,16 Q 74,18 78,26 Q 74,34 58,36 Q 38,38 20,26 Z" fill={colorHex} />
              <ellipse cx="62" cy="26" rx="12" ry="9" fill={accentHex} />
              <circle cx="66" cy="26" r="5" fill="#fffbeb" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={impactDelay} />
        </>
      );
    }
  }
};

export const BattleAttackVfx: React.FC<BattleAttackVfxProps> = ({ activeVfx }) => {
  return (
    <AnimatePresence>
      {activeVfx && (
        <div
          key={activeVfx.id}
          className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
        >
          {(() => {
            const { attacker, spec, isCrit, isSuperEffective, isSignature, moveName } = activeVfx;
            const fromLeft = attacker === 'player';
            const attackerX = fromLeft ? '18%' : '82%';
            const defenderX = fromLeft ? '82%' : '18%';
            const styleKey: SignatureVfxStyle =
              spec.signatureStyle ||
              (spec.motion === 'melee'
                ? spec.variant === 'slash'
                  ? 'claw_slash'
                  : 'beast_fist'
                : spec.variant === 'beam'
                ? 'beam'
                : 'dragon_fireball');
            const sparkDelay = isSignature ? 0.46 : spec.motion === 'melee' ? 0.22 : 0.25;

            return (
              <>
                <SignatureChoreography
                  styleKey={styleKey}
                  spec={spec}
                  fromLeft={fromLeft}
                  attackerX={attackerX}
                  defenderX={defenderX}
                  isCrit={isCrit}
                  isSignature={isSignature}
                  moveName={moveName}
                />

                {/* Signature / Technique Move Callout Banner */}
                {moveName && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [8, 0, 0, -4],
                      scale: [0.92, 1.06, 1.02, 0.96],
                    }}
                    transition={{
                      duration: isSignature ? 0.95 : 0.68,
                      times: [0, 0.15, 0.78, 1],
                      ease: 'easeOut',
                    }}
                    style={{
                      borderColor: spec.colorHex,
                    }}
                    className={`absolute ${
                      isSignature ? 'bottom-2.5 px-4 py-1.5 text-[11px]' : 'bottom-2 px-3 py-1 text-[10px]'
                    } left-1/2 -translate-x-1/2 rounded-lg bg-slate-950/95 border-2 text-white font-pixel tracking-wide whitespace-nowrap z-30`}
                  >
                    {isSignature && (
                      <span className="mr-1.5 text-amber-300">SIGNATURE:</span>
                    )}
                    <span style={{ color: spec.colorHex }}>{moveName.toUpperCase()}!</span>
                  </motion.div>
                )}

                {/* Radiating Hit Sparks & Crit Starburst at Defender */}
                <div
                  style={{ left: defenderX, top: '63%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  {SPARK_ANGLES.map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const dist = isCrit || isSignature ? 56 : 38;
                    const tx = Math.round(Math.cos(rad) * dist);
                    const ty = Math.round(Math.sin(rad) * dist);
                    const sparkColor = isCrit
                      ? '#fde047'
                      : isSuperEffective
                      ? '#34d399'
                      : spec.colorHex;
                    return (
                      <motion.span
                        key={deg}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                        animate={{
                          x: [0, tx * 0.6, tx],
                          y: [0, ty * 0.6, ty],
                          opacity: [0, 1, 0],
                          scale: [0.6, 1.25, 0.3],
                        }}
                        transition={{ duration: 0.38, delay: sparkDelay, times: [0, 0.35, 1], ease: 'easeOut' }}
                        style={{ backgroundColor: sparkColor }}
                        className="absolute w-2.5 h-2.5 -ml-1 -mt-1 rounded-xs border border-slate-900/80"
                      />
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </AnimatePresence>
  );
};
