import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttackVisualSpec, SignatureVfxStyle } from '../data/battleTechniques';

export interface ActiveBattleVfx {
  id: number;
  attacker: 'player' | 'opponent';
  spec: AttackVisualSpec;
  isCrit?: boolean;
  isSuperEffective?: boolean;
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
}> = ({ defenderX, colorHex, glowHex, isCrit, delay = 0.24, sizeClass = 'w-20 h-20 sm:w-24 sm:h-24' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.3 }}
    animate={{ opacity: [0, 1, 0.9, 0], scale: [0.35, 1.25, 1.55, 1.85] }}
    transition={{ duration: 0.42, delay, ease: 'easeOut' }}
    style={{ left: defenderX, top: '63%' }}
    className="absolute -translate-x-1/2 -translate-y-1/2"
  >
    <div
      className={`${sizeClass} rounded-full border-4`}
      style={{
        borderColor: isCrit ? '#fde047' : colorHex,
        background: `radial-gradient(circle, #ffffff 0%, ${colorHex}aa 45%, ${glowHex}44 75%, transparent 100%)`,
        boxShadow: `0 0 24px ${isCrit ? '#facc15' : glowHex}`,
      }}
    />
  </motion.div>
);

const CasterHalo: React.FC<{
  attackerX: string;
  colorHex: string;
  glowHex: string;
}> = ({ attackerX, colorHex, glowHex }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
    animate={{ opacity: [0, 1, 0.85, 0], scale: [0.4, 1.15, 1.35, 1.5], rotate: 90 }}
    transition={{ duration: 0.36, delay: 0, ease: 'easeOut' }}
    style={{
      left: attackerX,
      top: '63%',
      borderColor: colorHex,
      boxShadow: `0 0 18px ${glowHex}`,
    }}
    className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed bg-white/10"
  />
);

const RushSpeedLines: React.FC<{
  fromLeft: boolean;
  colorHex: string;
  glowHex: string;
}> = ({ fromLeft, colorHex, glowHex }) => (
  <motion.div
    initial={{ opacity: 0, scaleX: 0.2 }}
    animate={{ opacity: [0, 0.92, 0], scaleX: [0.3, 1.1, 0.4] }}
    transition={{ duration: 0.34, delay: 0.04, ease: 'easeOut' }}
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
        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${colorHex}, #ffffff)`,
      }}
    />
    <div
      className="h-1 rounded-full mx-4"
      style={{
        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${glowHex}, #ffffff)`,
      }}
    />
    <div
      className="h-0.5 rounded-full mx-2"
      style={{
        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${colorHex}, #ffffff)`,
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
  moveName?: string;
}> = ({ styleKey, spec, fromLeft, attackerX, defenderX, isCrit, moveName }) => {
  const { colorHex, glowHex, accentHex = '#ffffff' } = spec;
  const facingLeft = !fromLeft;
  const flipTransform = facingLeft ? 'scaleX(-1)' : undefined;

  switch (styleKey) {
    // 1. NOVA SPHERE (Terra Force, Terra Destroyer, Darkness Zone, Mega Death, Catastrophe Cannon)
    case 'nova_sphere': {
      return (
        <>
          {/* Gathering energy halo overhead */}
          <motion.div
            initial={{ left: attackerX, top: '26%', opacity: 0, scale: 0.2 }}
            animate={{
              left: [attackerX, attackerX, defenderX],
              top: ['28%', '22%', '63%'],
              opacity: [0, 1, 1, 0],
              scale: [0.25, 1.35, 1.45, 0.8],
            }}
            transition={{ duration: 0.34, times: [0, 0.42, 0.88, 1], ease: 'easeInOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible"
              style={{ filter: `drop-shadow(0 0 18px ${glowHex})` }}
            >
              <circle cx="50" cy="50" r="38" fill={glowHex} opacity="0.4" />
              <circle cx="50" cy="50" r="28" fill={colorHex} />
              <circle cx="50" cy="50" r="16" fill={accentHex} opacity="0.9" />
              <ellipse cx="50" cy="50" rx="44" ry="14" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.7" transform="rotate(-25 50 50)" />
              <ellipse cx="50" cy="50" rx="44" ry="14" fill="none" stroke={colorHex} strokeWidth="2" opacity="0.75" transform="rotate(35 50 50)" />
            </svg>
          </motion.div>
          {/* Massive Ground Shockwave Pillar */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0.1, scaleX: 0.4 }}
            animate={{ opacity: [0, 0.95, 0], scaleY: [0.2, 1.25, 1.4], scaleX: [0.5, 1.2, 1.45] }}
            transition={{ duration: 0.44, delay: 0.25, ease: 'easeOut' }}
            style={{
              left: defenderX,
              top: '52%',
              background: `linear-gradient(180deg, transparent, ${colorHex}cc, ${glowHex})`,
              boxShadow: `0 0 28px ${glowHex}`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-20 sm:w-24 h-36 rounded-full"
          />
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.25} sizeClass="w-28 h-28 sm:w-32 sm:h-32" />
        </>
      );
    }

    // 2. TWIN MISSILES (MetalGreymon Giga Blaster, Megadramon, SkullGreymon, Guardromon)
    case 'twin_missiles': {
      const lanes = [
        { startTop: '54%', midTop: '42%', endTop: '58%', delay: 0.03 },
        { startTop: '68%', midTop: '72%', endTop: '66%', delay: 0.09 },
      ];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          {lanes.map((lane, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: lane.startTop, opacity: 0, scale: 0.6 }}
              animate={{
                left: [attackerX, '50%', defenderX],
                top: [lane.startTop, lane.midTop, lane.endTop],
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.1, 1.05],
              }}
              transition={{ duration: 0.26, delay: lane.delay, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg
                viewBox="0 0 88 38"
                className="w-16 h-8 sm:w-20 sm:h-9 overflow-visible"
                style={{ transform: flipTransform, filter: `drop-shadow(0 0 8px ${glowHex})` }}
              >
                <path d="M 0,19 L 18,11 L 14,19 L 18,27 Z" fill="#fb923c" />
                <circle cx="10" cy="19" r="6" fill="#fef08a" opacity="0.85" />
                <rect x="18" y="12" width="42" height="14" rx="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
                <path d="M 22,12 L 16,5 L 30,12 Z M 22,26 L 16,33 L 30,26 Z" fill={glowHex} />
                <polygon points="60,11 82,19 60,27" fill={colorHex} stroke="#0f172a" strokeWidth="2" />
                <rect x="28" y="16" width="22" height="5" fill={accentHex} opacity="0.8" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.23} />
          <ImpactBurstRing defenderX={defenderX} colorHex="#fef08a" glowHex={glowHex} isCrit={isCrit} delay={0.31} sizeClass="w-16 h-16" />
        </>
      );
    }

    // 3. RAPID VOLLEY (Paildramon Desperado Blaster, Beelzebumon Double Impact, Gargomon, Rapidmon)
    case 'rapid_volley': {
      const shots = [0, 1, 2, 3, 4];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          {shots.map((i) => {
            const yPct = `${57 + (i % 3) * 5}%`;
            return (
              <motion.div
                key={i}
                initial={{ left: attackerX, top: yPct, opacity: 0, scaleX: 0.6 }}
                animate={{
                  left: [attackerX, defenderX],
                  opacity: [0, 1, 1, 0],
                  scaleX: [0.8, 1.4, 1],
                }}
                transition={{ duration: 0.16, delay: 0.03 + i * 0.045, ease: 'linear' }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className="w-10 h-2.5 sm:w-12 sm:h-3 rounded-full"
                  style={{
                    background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${colorHex}, #ffffff)`,
                    boxShadow: `0 0 10px ${glowHex}`,
                  }}
                />
              </motion.div>
            );
          })}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.22} />
        </>
      );
    }

    // 4. V/X CREST WAVE (ExVeemon X-Laser, AeroVeedramon V-Wing Blade, UlforceVeedramon Shining V-Force)
    case 'v_x_wave': {
      const isX = (moveName || '').toLowerCase().includes('x-');
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.5 }}
            animate={{
              left: [attackerX, defenderX],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.3, 1.45],
            }}
            transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 90 90"
              className="w-20 h-20 sm:w-24 sm:h-24 overflow-visible"
              style={{ transform: flipTransform, filter: `drop-shadow(0 0 12px ${glowHex})` }}
            >
              {isX ? (
                <>
                  <path d="M 18,14 L 74,76 M 74,14 L 18,76" stroke={glowHex} strokeWidth="11" strokeLinecap="round" />
                  <path d="M 18,14 L 74,76 M 74,14 L 18,76" stroke={colorHex} strokeWidth="6" strokeLinecap="round" />
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
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 5 & 6. FLAME BREATH & FROST BREATH (Greymon Mega Flame, Garurumon Howling Blaster, MetalGarurumon Cocytus Breath)
    case 'flame_breath':
    case 'frost_breath': {
      const isFrost = styleKey === 'frost_breath';
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          <motion.div
            initial={{ scaleX: 0.08, opacity: 0.3 }}
            animate={{ scaleX: [0.1, 1, 1.05, 0.2], opacity: [0.4, 1, 0.95, 0] }}
            transition={{ duration: 0.44, delay: 0.06, times: [0, 0.32, 0.74, 1], ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '62%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-20 sm:h-24"
          >
            <svg
              viewBox="0 0 240 90"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
              style={{ transform: flipTransform, filter: `drop-shadow(0 0 14px ${glowHex})` }}
            >
              <polygon points="0,45 235,6 235,84" fill={glowHex} opacity="0.65" />
              <polygon points="8,45 235,16 235,74" fill={colorHex} opacity="0.88" />
              <polygon points="16,45 228,30 228,60" fill={isFrost ? '#ecfeff' : '#fef08a'} opacity="0.92" />
              {/* Jagged inner breath spikes */}
              <polygon points="40,45 95,28 85,45 145,22 135,48 210,18 228,45 210,72 135,44 145,68 85,45 95,62" fill="#ffffff" opacity="0.55" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.23} />
        </>
      );
    }

    // 7. COMET RUSH (Flamedramon Fire Rocket, Veemon Vee-Headbutt, Armadimon Diamond Shell, Triceramon)
    case 'comet_rush': {
      return (
        <>
          <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.6 }}
            animate={{
              left: [attackerX, defenderX],
              opacity: [0, 1, 1, 0],
              scale: [0.7, 1.25, 1.35],
            }}
            transition={{ duration: 0.28, delay: 0.04, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 100 80"
              className="w-24 h-20 sm:w-28 sm:h-24 overflow-visible"
              style={{ transform: flipTransform, filter: `drop-shadow(0 0 14px ${glowHex})` }}
            >
              <path d="M 6,40 Q 45,6 92,40 Q 45,74 6,40 Z" fill={glowHex} opacity="0.82" />
              <path d="M 24,40 Q 56,16 90,40 Q 56,64 24,40 Z" fill={colorHex} />
              <path d="M 46,40 Q 68,26 88,40 Q 68,54 46,40 Z" fill={accentHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.22} sizeClass="w-24 h-24 sm:w-28 sm:h-28" />
        </>
      );
    }

    // 8. WING STORM (Birdramon Meteor Wing, Garudamon Shadow Wing, Phoenixmon Starlight Explosion)
    case 'wing_storm': {
      const feathers = [-16, 0, 16];
      return (
        <>
          {/* Fiery spread wings at attacker */}
          <motion.div
            initial={{ left: attackerX, top: '58%', opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 1.5] }}
            transition={{ duration: 0.36, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 120 80"
              className="w-28 h-20 overflow-visible"
              style={{ transform: flipTransform, filter: `drop-shadow(0 0 12px ${glowHex})` }}
            >
              <path d="M 55,48 Q 20,10 6,18 Q 24,34 12,46 Q 30,50 24,62 Q 48,58 55,48 Z" fill={glowHex} opacity="0.88" />
              <path d="M 55,48 Q 92,10 114,18 Q 94,34 108,46 Q 88,50 96,62 Q 70,58 55,48 Z" fill={colorHex} opacity="0.92" />
            </svg>
          </motion.div>
          {feathers.map((offset, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: `${56 + offset * 0.4}%`, opacity: 0 }}
              animate={{
                left: [attackerX, defenderX],
                top: [`${56 + offset * 0.4}%`, `${63 + offset * 0.45}%`],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 0.24, delay: 0.05 + idx * 0.04, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg
                viewBox="0 0 56 22"
                className="w-12 h-5 sm:w-14 sm:h-6 overflow-visible"
                style={{ transform: flipTransform, filter: `drop-shadow(0 0 8px ${glowHex})` }}
              >
                <path d="M 4,11 Q 28,2 54,11 Q 28,20 4,11 Z" fill={colorHex} stroke={accentHex} strokeWidth="1.5" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 9. TORNADO (Biyomon Spiral Twister, Magnadramon Fire Tornado, Fugamon Evil Hurricane)
    case 'tornado': {
      return (
        <>
          <motion.div
            initial={{ left: attackerX, top: '60%', opacity: 0, scale: 0.5 }}
            animate={{
              left: [attackerX, defenderX],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.2, 1.35],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 0.34, delay: 0.04, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 80 96"
              className="w-20 h-24 sm:w-24 sm:h-28 overflow-visible"
              style={{ filter: `drop-shadow(0 0 12px ${glowHex})` }}
            >
              <ellipse cx="40" cy="18" rx="34" ry="9" fill="none" stroke={colorHex} strokeWidth="5" />
              <ellipse cx="40" cy="36" rx="26" ry="8" fill="none" stroke={glowHex} strokeWidth="5" />
              <ellipse cx="40" cy="54" rx="19" ry="7" fill="none" stroke={colorHex} strokeWidth="4.5" />
              <ellipse cx="40" cy="70" rx="12" ry="5" fill="none" stroke="#ffffff" strokeWidth="3.5" />
              <polygon points="40,88 32,74 48,74" fill={colorHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 10. THUNDER STRIKE (Tentomon, Kabuterimon, MegaKabuterimon, Parrotmon Mjolnir Thunder)
    case 'thunder_strike': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          {/* Horizontal crackling plasma bolt */}
          <motion.div
            initial={{ scaleX: 0.1, opacity: 0.3 }}
            animate={{ scaleX: [0.1, 1, 1, 0.2], opacity: [0.5, 1, 0.9, 0] }}
            transition={{ duration: 0.36, delay: 0.04, ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '62%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-14"
          >
            <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="w-full h-full overflow-visible" style={{ transform: flipTransform, filter: `drop-shadow(0 0 10px ${glowHex})` }}>
              <polyline points="0,25 36,10 60,36 102,8 134,38 172,14 200,25" fill="none" stroke={glowHex} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="0,25 36,10 60,36 102,8 134,38 172,14 200,25" fill="none" stroke={colorHex} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="0,25 36,10 60,36 102,8 134,38 172,14 200,25" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          {/* Sky-to-defender thunderbolt */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0.2 }}
            animate={{ opacity: [0, 1, 1, 0], scaleY: [0.3, 1, 1, 0.8] }}
            transition={{ duration: 0.32, delay: 0.16, ease: 'easeOut' }}
            style={{ left: defenderX, top: '38%', transformOrigin: 'top center' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 60 120" className="w-16 h-28 overflow-visible" style={{ filter: `drop-shadow(0 0 12px ${colorHex})` }}>
              <polyline points="34,0 18,44 38,52 16,112" fill="none" stroke={glowHex} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="34,0 18,44 38,52 16,112" fill="none" stroke={colorHex} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="34,0 18,44 38,52 16,112" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.23} />
        </>
      );
    }

    // 11. DIAMOND STORM (Renamon Diamond Storm, Vikemon Arctic Blizzard, Dianamon Crescent Haken, Sleipmon)
    case 'diamond_storm': {
      const shards = [
        { yOff: -14, delay: 0.02, rot: -12 },
        { yOff: -5, delay: 0.06, rot: 4 },
        { yOff: 5, delay: 0.04, rot: 14 },
        { yOff: 14, delay: 0.09, rot: -6 },
      ];
      const isCrescent = (moveName || '').toLowerCase().includes('crescent');
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          {shards.map((sh, i) => (
            <motion.div
              key={i}
              initial={{ left: attackerX, top: `${60 + sh.yOff}%`, opacity: 0, scale: 0.6 }}
              animate={{
                left: [attackerX, defenderX],
                top: [`${60 + sh.yOff}%`, `${63 + sh.yOff * 0.45}%`],
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.15, 0.9],
                rotate: isCrescent ? [0, 360] : sh.rot,
              }}
              transition={{ duration: 0.25, delay: sh.delay, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg
                viewBox="0 0 48 32"
                className="w-11 h-7 sm:w-14 sm:h-8 overflow-visible"
                style={{ transform: flipTransform, filter: `drop-shadow(0 0 8px ${glowHex})` }}
              >
                {isCrescent ? (
                  <path d="M 16,2 C 36,6 42,26 16,30 C 28,22 28,10 16,2 Z" fill={colorHex} stroke="#ffffff" strokeWidth="1.5" />
                ) : (
                  <>
                    <polygon points="4,16 24,4 44,16 24,28" fill={glowHex} opacity="0.85" />
                    <polygon points="8,16 24,7 40,16 24,25" fill={colorHex} />
                    <polygon points="15,16 24,11 33,16 24,21" fill="#ffffff" opacity="0.85" />
                  </>
                )}
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 12. VINE WHIP (Palmon Poison Ivy, Wormmon Sticky Net)
    case 'vine_whip': {
      return (
        <>
          <motion.div
            initial={{ scaleX: 0.05, opacity: 0.3 }}
            animate={{ scaleX: [0.1, 1, 1, 0.15], opacity: [0.5, 1, 1, 0] }}
            transition={{ duration: 0.42, delay: 0.04, ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '63%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-14"
          >
            <svg viewBox="0 0 220 50" preserveAspectRatio="none" className="w-full h-full overflow-visible" style={{ transform: flipTransform, filter: `drop-shadow(0 0 8px ${glowHex})` }}>
              <path d="M 0,28 Q 45,6 90,26 T 180,22 L 220,25" fill="none" stroke={colorHex} strokeWidth="6" strokeLinecap="round" />
              <path d="M 0,20 Q 55,44 105,20 T 195,28 L 220,23" fill="none" stroke={glowHex} strokeWidth="4" strokeLinecap="round" />
              <polygon points="60,12 66,4 70,15" fill="#bef264" />
              <polygon points="128,34 134,44 138,31" fill="#bef264" />
              <polygon points="182,16 188,6 192,18" fill="#bef264" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.23} />
        </>
      );
    }

    // 13. NEEDLE RAIN (Togemon Needle Spray, Stingmon, Jewelbeemon, DemiDevimon Pico Darts, Lalamon)
    case 'needle_rain': {
      const needles = [-14, -7, 0, 7, 14];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          {needles.map((deg, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: '62%', opacity: 0 }}
              animate={{
                left: [attackerX, defenderX],
                top: ['62%', `${63 + deg * 0.8}%`],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 0.22, delay: 0.03 + idx * 0.025, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg
                viewBox="0 0 54 14"
                className="w-12 h-3.5 overflow-visible"
                style={{
                  transform: `${flipTransform || ''} rotate(${deg * 0.5}deg)`,
                  filter: `drop-shadow(0 0 6px ${glowHex})`,
                }}
              >
                <polygon points="2,7 36,3 52,7 36,11" fill={colorHex} stroke="#ffffff" strokeWidth="1" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.23} />
        </>
      );
    }

    // 14. FLOWER BURST (Lillymon Flower Cannon, Rosemon Forbidden Temptation, Sunflowmon, Hudiemon)
    case 'flower_burst': {
      const petals = [0, 60, 120, 180, 240, 300];
      return (
        <>
          {/* Blooming flower sigil at attacker */}
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.4, rotate: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1.4], rotate: 90 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 80 80" className="w-20 h-20 overflow-visible" style={{ filter: `drop-shadow(0 0 10px ${colorHex})` }}>
              {petals.map((deg) => (
                <ellipse key={deg} cx="40" cy="18" rx="9" ry="16" fill={colorHex} opacity="0.88" transform={`rotate(${deg} 40 40)`} />
              ))}
              <circle cx="40" cy="40" r="10" fill="#fef08a" />
            </svg>
          </motion.div>
          {/* Radiant floral beam */}
          <motion.div
            initial={{ scaleX: 0.08, opacity: 0.3 }}
            animate={{ scaleX: [0.1, 1, 1, 0.2], opacity: [0.5, 1, 1, 0] }}
            transition={{ duration: 0.42, delay: 0.06, ease: 'easeOut' }}
            style={{
              left: '18%',
              width: '64%',
              top: '63%',
              transformOrigin: fromLeft ? 'left center' : 'right center',
            }}
            className="absolute -translate-y-1/2 h-7 flex items-center"
          >
            <div
              className="w-full h-5 rounded-full"
              style={{
                background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, ${glowHex}, ${colorHex}, #ffffff)`,
                boxShadow: `0 0 18px ${colorHex}`,
              }}
            />
            <div className="absolute inset-x-1 h-2 rounded-full bg-white" />
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 15. FISH MARCH (Gomamon Marching Fishes, Divermon Striking Fish)
    case 'fish_march': {
      const fishColors = ['#38bdf8', '#fb923c', '#facc15', '#4ade80', '#f472b6'];
      return (
        <>
          {fishColors.map((fColor, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: `${56 + (idx % 3) * 6}%`, opacity: 0, scale: 0.6 }}
              animate={{
                left: [attackerX, defenderX],
                top: [`${56 + (idx % 3) * 6}%`, `${52 + (idx % 3) * 6}%`, `${62 + (idx % 3) * 4}%`],
                opacity: [0, 1, 1, 0],
                scale: [0.75, 1.05, 0.95],
              }}
              transition={{ duration: 0.27, delay: 0.02 + idx * 0.045, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg
                viewBox="0 0 46 28"
                className="w-10 h-6 sm:w-12 sm:h-7 overflow-visible"
                style={{ transform: flipTransform, filter: 'drop-shadow(0 0 6px #38bdf8)' }}
              >
                <polygon points="2,14 14,5 14,23" fill={fColor} />
                <ellipse cx="26" cy="14" rx="14" ry="9" fill={fColor} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="33" cy="11" r="2" fill="#0f172a" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex="#38bdf8" glowHex="#0284c7" isCrit={isCrit} delay={0.25} />
        </>
      );
    }

    // 16. TIDAL WAVE (Whamon Tidal Wave, Shellmon Hydro Pressure, Tobiumon, Sangomon)
    case 'tidal_wave': {
      return (
        <>
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.6 }}
            animate={{
              left: [attackerX, defenderX],
              opacity: [0, 1, 1, 0],
              scale: [0.7, 1.3, 1.45],
            }}
            transition={{ duration: 0.3, delay: 0.04, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 96 72"
              className="w-24 h-18 sm:w-28 sm:h-20 overflow-visible"
              style={{ transform: flipTransform, filter: `drop-shadow(0 0 12px ${glowHex})` }}
            >
              <path d="M 6,66 Q 38,8 88,20 Q 64,26 70,40 Q 80,46 92,66 Z" fill={glowHex} opacity="0.88" />
              <path d="M 16,66 Q 44,18 82,24 Q 60,32 68,48 L 84,66 Z" fill={colorHex} />
              <path d="M 62,18 Q 78,12 90,22 Q 78,28 66,24 Z" fill="#ffffff" opacity="0.9" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 17. HARPOON / TRIDENT (Ikkakumon Harpoon Torpedo, Dagomon Forbidden Trident)
    case 'harpoon_trident': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.7 }}
            animate={{ left: [attackerX, defenderX], opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.1] }}
            transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 96 42"
              className="w-20 h-9 sm:w-24 sm:h-11 overflow-visible"
              style={{ transform: flipTransform, filter: `drop-shadow(0 0 10px ${glowHex})` }}
            >
              <rect x="6" y="18" width="58" height="6" rx="2" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
              <polygon points="62,9 92,21 62,33 70,21" fill={colorHex} stroke="#ffffff" strokeWidth="1.5" />
              <polygon points="6,21 20,12 20,30" fill="#fb923c" opacity="0.9" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 18. BUBBLES (Patamon Boom Bubble, Otamamon Lullaby Bubble, Syakomon Black Pearl, Fresh/In-Training Bubble Blow)
    case 'bubbles': {
      const bubbles = [
        { size: 'w-9 h-9', delay: 0.02, arc: '56%' },
        { size: 'w-12 h-12', delay: 0.07, arc: '66%' },
        { size: 'w-8 h-8', delay: 0.12, arc: '59%' },
      ];
      return (
        <>
          {bubbles.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.5 }}
              animate={{
                left: [attackerX, defenderX],
                top: ['63%', b.arc, '63%'],
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.15, 1.35],
              }}
              transition={{ duration: 0.27, delay: b.delay, ease: 'easeOut' }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${b.size} rounded-full border-2`}
              style={{
                borderColor: '#ffffff',
                background: `radial-gradient(circle at 32% 30%, #ffffffcc, ${colorHex}88 55%, ${glowHex}cc 100%)`,
                boxShadow: `0 0 12px ${glowHex}`,
              }}
            />
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 19. CELESTIAL ARROW (Angewomon Celestial Arrow, Ophanimon Eden Javelin, Angemon Hand of Fate, Pegasusmon)
    case 'celestial_arrow': {
      return (
        <>
          {/* Radiant golden bow / halo crest at attacker */}
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.15, 1.35] }}
            transition={{ duration: 0.34, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 60 90" className="w-14 h-20 overflow-visible" style={{ transform: flipTransform, filter: `drop-shadow(0 0 12px ${colorHex})` }}>
              <path d="M 22,8 Q 54,45 22,82" fill="none" stroke={colorHex} strokeWidth="5" strokeLinecap="round" />
              <line x1="22" y1="8" x2="22" y2="82" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
            </svg>
          </motion.div>
          {/* Streaking golden arrow/javelin */}
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scaleX: 0.6 }}
            animate={{ left: [attackerX, defenderX], opacity: [0, 1, 1, 0], scaleX: [0.8, 1.3, 1.1] }}
            transition={{ duration: 0.24, delay: 0.05, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 104 36" className="w-24 h-8 sm:w-28 sm:h-9 overflow-visible" style={{ transform: flipTransform, filter: `drop-shadow(0 0 12px ${glowHex})` }}>
              <line x1="6" y1="18" x2="78" y2="18" stroke={colorHex} strokeWidth="6" strokeLinecap="round" />
              <line x1="12" y1="18" x2="80" y2="18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="72,6 100,18 72,30 80,18" fill="#ffffff" stroke={glowHex} strokeWidth="2" />
              <polygon points="4,10 18,18 4,26 10,18" fill={glowHex} />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 20. HOLY ORBS (Seraphimon Seven Heavens, Starmon Meteor Squall, Monzaemon Hearts Attack)
    case 'holy_orbs': {
      const isHearts = (moveName || '').toLowerCase().includes('heart');
      const orbs = [0, 1, 2, 3, 4, 5, 6];
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          {orbs.map((i) => {
            const yStart = `${42 + (i % 4) * 9}%`;
            const yEnd = `${55 + (i % 3) * 6}%`;
            return (
              <motion.div
                key={i}
                initial={{ left: attackerX, top: yStart, opacity: 0, scale: 0.5 }}
                animate={{ left: [attackerX, defenderX], top: [yStart, yEnd], opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 0.9] }}
                transition={{ duration: 0.24, delay: 0.02 + i * 0.032, ease: 'easeOut' }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                {isHearts ? (
                  <svg viewBox="0 0 32 32" className="w-7 h-7 overflow-visible" style={{ filter: `drop-shadow(0 0 8px ${glowHex})` }}>
                    <path d="M16 28 C16 28 3 19 3 10.5 C3 6.5 6.2 3.5 10 3.5 C12.6 3.5 14.9 5 16 7 C17.1 5 19.4 3.5 22 3.5 C25.8 3.5 29 6.5 29 10.5 C29 19 16 28 16 28 Z" fill={colorHex} stroke="#ffffff" strokeWidth="1.5" />
                  </svg>
                ) : (
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white"
                    style={{
                      background: `radial-gradient(circle, #ffffff 10%, ${colorHex} 60%, ${glowHex} 100%)`,
                      boxShadow: `0 0 14px ${glowHex}`,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.25} />
        </>
      );
    }

    // 21. SACRED SEAL (MagnaAngemon Gate of Destiny, Sakuyamon Amethyst Mandala, Taomon Bonhitsusen, Alphamon Digitalize of Soul)
    case 'sacred_seal': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.35, 1.15, 1.3, 1.4], rotate: 120 }}
            transition={{ duration: 0.48, delay: 0.14, ease: 'easeOut' }}
            style={{ left: defenderX, top: '61%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 120 120" className="w-28 h-28 sm:w-32 sm:h-32 overflow-visible" style={{ filter: `drop-shadow(0 0 14px ${glowHex})` }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke={colorHex} strokeWidth="4" />
              <circle cx="60" cy="60" r="38" fill="none" stroke={glowHex} strokeWidth="2.5" strokeDasharray="8 5" />
              <polygon points="60,12 102,84 18,84" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />
              <polygon points="60,108 18,36 102,36" fill="none" stroke={colorHex} strokeWidth="2.5" opacity="0.9" />
              <circle cx="60" cy="60" r="16" fill={glowHex} opacity="0.5" />
              <circle cx="60" cy="60" r="8" fill="#ffffff" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.25} />
        </>
      );
    }

    // 22. BEAST FIST / HAMMER (Leomon Fist of the Beast King, Zudomon Vulcan Hammer, Gankoomon, Justimon, Frigimon)
    case 'beast_fist': {
      const isRanged = spec.motion === 'ranged';
      return (
        <>
          {!isRanged && <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} />}
          <motion.div
            initial={{ left: isRanged ? attackerX : defenderX, top: '63%', opacity: 0, scale: isRanged ? 0.55 : 0.4 }}
            animate={
              isRanged
                ? { left: [attackerX, defenderX], opacity: [0, 1, 1, 0], scale: [0.65, 1.3, 1.4] }
                : { opacity: [0, 1, 1, 0], scale: [0.45, 1.25, 1.4] }
            }
            transition={{ duration: isRanged ? 0.27 : 0.4, delay: isRanged ? 0.04 : 0.2, ease: 'easeOut' }}
            style={isRanged ? undefined : { left: defenderX, top: '63%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible"
              style={{ transform: flipTransform, filter: `drop-shadow(0 0 14px ${glowHex})` }}
            >
              <polygon
                points="50,6 59,34 88,20 68,45 96,54 68,62 84,88 56,70 48,96 42,68 14,82 32,56 4,48 34,40 16,14 44,32"
                fill={glowHex}
                stroke={colorHex}
                strokeWidth="2.5"
              />
              {/* Stylized Lion / Fist Aura Crest */}
              <path d="M 28,36 L 62,32 L 78,48 L 62,68 L 28,64 Z" fill={colorHex} stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="54" cy="50" r="10" fill="#ffffff" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.23} />
        </>
      );
    }

    // 23. BAT SWARM (Myotismon Grisly Wing, MaloMyotismon, LadyDevimon Darkness Wave, Pumpkinmon)
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
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          {bats.map((b, i) => (
            <motion.div
              key={i}
              initial={{ left: attackerX, top: b.yA, opacity: 0, scale: 0.6 }}
              animate={{
                left: [attackerX, defenderX],
                top: [b.yA, b.yB, '63%'],
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.15, 0.95],
              }}
              transition={{ duration: 0.28, delay: b.delay, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              {isPumpkin ? (
                <svg viewBox="0 0 40 40" className="w-10 h-10 overflow-visible" style={{ filter: `drop-shadow(0 0 8px ${colorHex})` }}>
                  <circle cx="20" cy="22" r="14" fill="#ea580c" stroke="#fde047" strokeWidth="1.5" />
                  <polygon points="12,18 16,15 17,20" fill="#fef08a" />
                  <polygon points="28,18 24,15 23,20" fill="#fef08a" />
                  <path d="M 12,26 Q 20,31 28,26" fill="none" stroke="#fef08a" strokeWidth="2.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 56 32" className="w-12 h-7 overflow-visible" style={{ transform: flipTransform, filter: `drop-shadow(0 0 8px ${glowHex})` }}>
                  <path d="M 28,18 Q 16,4 2,12 Q 12,22 20,22 Q 25,24 28,26 Q 31,24 36,22 Q 44,22 54,12 Q 40,4 28,18 Z" fill={glowHex} stroke={colorHex} strokeWidth="1.5" />
                  <circle cx="25" cy="17" r="1.5" fill="#fef08a" />
                  <circle cx="31" cy="17" r="1.5" fill="#fef08a" />
                </svg>
              )}
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.25} />
        </>
      );
    }

    // 24. SHADOW HAND (Devimon Touch of Evil, Bakemon Hell Hand, Belphemon, Lilithmon, Leviamon)
    case 'shadow_hand': {
      return (
        <>
          {spec.motion === 'melee' && <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} />}
          <motion.div
            initial={{ opacity: 0, scale: 0.45 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.25, 1.05, 1.35] }}
            transition={{ duration: 0.44, delay: 0.16, ease: 'easeOut' }}
            style={{ left: defenderX, top: '61%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible" style={{ filter: `drop-shadow(0 0 14px ${glowHex})` }}>
              <circle cx="50" cy="50" r="34" fill="#1e1b4b" opacity="0.7" />
              <path d="M 24,78 L 28,36 L 34,20 L 40,40 L 48,14 L 54,38 L 64,16 L 68,42 L 78,28 L 72,74 Z" fill={glowHex} stroke={colorHex} strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 25. REAPER SCYTHE & BLADE WAVES (Gallantmon Royal Saber, Piedmon Trump Sword, Phantomon Soul Chopper, Knightmon, Duramon)
    case 'reaper_scythe': {
      const isThrowing = spec.motion === 'ranged' && (moveName || '').toLowerCase().includes('trump');
      if (isThrowing) {
        const swords = [-14, -4, 6, 16];
        return (
          <>
            <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
            {swords.map((yOff, i) => (
              <motion.div
                key={i}
                initial={{ left: attackerX, top: `${60 + yOff}%`, opacity: 0, rotate: 0 }}
                animate={{ left: [attackerX, defenderX], opacity: [0, 1, 1, 0], rotate: [0, 360] }}
                transition={{ duration: 0.25, delay: 0.03 + i * 0.035, ease: 'easeOut' }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <svg viewBox="0 0 64 24" className="w-14 h-6 overflow-visible" style={{ transform: flipTransform, filter: `drop-shadow(0 0 8px ${glowHex})` }}>
                  <rect x="4" y="10" width="12" height="4" fill={accentHex} />
                  <rect x="14" y="4" width="4" height="16" fill={glowHex} />
                  <polygon points="18,7 58,12 18,17" fill="#e2e8f0" stroke={colorHex} strokeWidth="1.5" />
                </svg>
              </motion.div>
            ))}
            <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
          </>
        );
      }

      const isRangedWave = spec.motion === 'ranged';
      return (
        <>
          {!isRangedWave && <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} />}
          <motion.div
            initial={{ left: isRangedWave ? attackerX : defenderX, top: '62%', opacity: 0, scale: 0.5 }}
            animate={
              isRangedWave
                ? { left: [attackerX, defenderX], opacity: [0, 1, 1, 0], scale: [0.65, 1.3, 1.4] }
                : { opacity: [0, 1, 1, 0], scale: [0.55, 1.25, 1.4] }
            }
            transition={{ duration: isRangedWave ? 0.26 : 0.42, delay: isRangedWave ? 0.04 : 0.19, ease: 'easeOut' }}
            style={isRangedWave ? undefined : { left: defenderX, top: '62%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible" style={{ transform: flipTransform, filter: `drop-shadow(0 0 12px ${glowHex})` }}>
              <path d="M 20,12 Q 92,45 28,90 Q 60,48 20,12 Z" fill={glowHex} opacity="0.88" />
              <path d="M 28,16 Q 86,46 34,86 Q 58,48 28,16 Z" fill={colorHex} />
              <path d="M 38,24 Q 78,48 42,78" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 26. SONIC WAVE (Shoutmon Rock Soul, Etemon Dark Spirits, Gekomon Symphony Crusher, Salamon Puppy Howl)
    case 'sonic_wave': {
      const rings = [0, 1, 2];
      return (
        <>
          {rings.map((i) => (
            <motion.div
              key={i}
              initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.45 }}
              animate={{ left: [attackerX, defenderX], opacity: [0, 1, 0.9, 0], scale: [0.5, 1.25, 1.65] }}
              transition={{ duration: 0.27, delay: 0.03 + i * 0.06, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg viewBox="0 0 56 80" className="w-12 h-20 overflow-visible" style={{ transform: flipTransform, filter: `drop-shadow(0 0 10px ${glowHex})` }}>
                <path d="M 14,10 Q 48,40 14,70" fill="none" stroke={colorHex} strokeWidth="6" strokeLinecap="round" />
                <path d="M 14,10 Q 48,40 14,70" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.div>
          ))}
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 27. DRILL / BOULDER / GEAR (Drimogemon Drill Spin, Gottsumon Angry Rock, Hagurumon Darkness Gear)
    case 'drill_boulder': {
      return (
        <>
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, rotate: 0 }}
            animate={{
              left: [attackerX, defenderX],
              top: ['63%', '54%', '63%'],
              opacity: [0, 1, 1, 0],
              rotate: [0, 360],
              scale: [0.75, 1.15, 1.1],
            }}
            transition={{ duration: 0.28, delay: 0.04, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16 overflow-visible" style={{ filter: `drop-shadow(0 0 8px ${glowHex})` }}>
              <polygon points="18,8 46,10 58,32 48,54 20,56 8,34" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
              <polygon points="22,16 40,18 46,32 36,46 20,44" fill={colorHex} opacity="0.6" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 28. POOP / TOXIC SPLAT (Numemon Poop Toss, Raremon Sludge Breath, Dokunemon Worm Venom)
    case 'poop_splat': {
      return (
        <>
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, rotate: 0 }}
            animate={{
              left: [attackerX, '50%', defenderX],
              top: ['63%', '32%', '63%'],
              opacity: [0, 1, 1, 0],
              rotate: [0, 360],
            }}
            transition={{ duration: 0.28, delay: 0.04, ease: 'easeInOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 56 56" className="w-12 h-12 sm:w-14 sm:h-14 overflow-visible" style={{ filter: 'drop-shadow(0 0 8px #65a30d)' }}>
              <path d="M 10,42 Q 10,32 20,32 Q 16,22 26,22 Q 24,12 30,10 Q 34,18 38,22 Q 44,24 42,32 Q 48,34 46,42 Z" fill="#92400e" stroke="#451a03" strokeWidth="2" />
              <circle cx="24" cy="36" r="2.5" fill="#bef264" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex="#bef264" glowHex="#65a30d" isCrit={isCrit} delay={0.25} />
        </>
      );
    }

    // 29. CLAW SLASH (WereGarurumon Wolf Claw, Devidramon Crimson Nail, Cyberdramon Erase Claw, Gatomon Lightning Paw)
    case 'claw_slash': {
      return (
        <>
          <RushSpeedLines fromLeft={fromLeft} colorHex={colorHex} glowHex={glowHex} />
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.45, 1.15, 1.25, 1.35] }}
            transition={{ duration: 0.42, delay: 0.2, ease: 'easeOut' }}
            style={{ left: defenderX, top: '63%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible" style={{ transform: flipTransform, filter: `drop-shadow(0 0 10px ${glowHex})` }}>
              <path d="M 14,20 Q 54,42 88,78" stroke={glowHex} strokeWidth="9" strokeLinecap="round" fill="none" />
              <path d="M 24,10 Q 60,36 92,66" stroke={colorHex} strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 8,38 Q 48,60 80,90" stroke={colorHex} strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 14,20 Q 54,42 88,78" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 24,10 Q 60,36 92,66" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
        </>
      );
    }

    // 30. BEAM (Machinedramon Giga Cannon, WarGrowlmon Atomic Blaster, Imperialdramon FM Positron Laser)
    case 'beam': {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          <motion.div
            initial={{ scaleX: 0.05, opacity: 0.2 }}
            animate={{ scaleX: [0.08, 1, 1, 0.15], opacity: [0.5, 1, 1, 0] }}
            transition={{ duration: 0.46, delay: 0.08, times: [0, 0.35, 0.72, 1], ease: 'easeOut' }}
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
                background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, ${glowHex}, ${colorHex}, #ffffff)`,
                boxShadow: `0 0 20px ${glowHex}, 0 0 36px ${colorHex}`,
              }}
            />
            <div className="absolute inset-x-1 h-2.5 sm:h-3 rounded-full bg-white shadow-[0_0_12px_#ffffff]" />
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
        </>
      );
    }

    // 31. DRAGON FIREBALL & DEFAULT (Agumon Pepper Breath, Guilmon Pyro Sphere, Kyubimon Fox Tail Inferno)
    case 'dragon_fireball':
    default: {
      return (
        <>
          <CasterHalo attackerX={attackerX} colorHex={colorHex} glowHex={glowHex} />
          <motion.div
            initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.65 }}
            animate={{
              left: [attackerX, defenderX],
              top: ['63%', '60%', '63%'],
              opacity: [0, 1, 1, 0],
              scale: [0.75, 1.25, 1.15],
            }}
            transition={{ duration: 0.26, delay: 0.05, ease: [0.22, 0.85, 0.36, 1] }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 88 52"
              className="w-18 h-11 sm:w-22 sm:h-13 overflow-visible"
              style={{ transform: flipTransform, filter: `drop-shadow(0 0 12px ${glowHex})` }}
            >
              <path d="M 4,26 Q 26,6 52,12 Q 74,14 80,26 Q 74,38 52,40 Q 26,46 4,26 Z" fill={glowHex} opacity="0.92" />
              <path d="M 20,26 Q 38,14 58,16 Q 74,18 78,26 Q 74,34 58,36 Q 38,38 20,26 Z" fill={colorHex} />
              <ellipse cx="62" cy="26" rx="12" ry="9" fill={accentHex === '#ffffff' ? '#fef08a' : accentHex} />
              <circle cx="65" cy="26" r="5" fill="#ffffff" />
            </svg>
          </motion.div>
          <ImpactBurstRing defenderX={defenderX} colorHex={colorHex} glowHex={glowHex} isCrit={isCrit} delay={0.24} />
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
          className="absolute inset-0 pointer-events-none z-[25] overflow-hidden"
        >
          {(() => {
            const { attacker, spec, isCrit, isSuperEffective, moveName } = activeVfx;
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

            return (
              <>
                <SignatureChoreography
                  styleKey={styleKey}
                  spec={spec}
                  fromLeft={fromLeft}
                  attackerX={attackerX}
                  defenderX={defenderX}
                  isCrit={isCrit}
                  moveName={moveName}
                />

                {/* Signature / Technique Move Callout Banner */}
                {moveName && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -4], scale: [0.92, 1.04, 1] }}
                    transition={{ duration: 0.68, times: [0, 0.14, 0.78, 1], ease: 'easeOut' }}
                    style={{
                      borderColor: spec.colorHex,
                      boxShadow: `0 0 14px ${spec.glowHex}88`,
                    }}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-slate-950/90 border text-white font-pixel text-[10px] tracking-wide whitespace-nowrap z-30"
                  >
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
                    const dist = isCrit ? 52 : 38;
                    const tx = Math.round(Math.cos(rad) * dist);
                    const ty = Math.round(Math.sin(rad) * dist);
                    const sparkColor = isCrit
                      ? '#fde047'
                      : isSuperEffective
                      ? '#34d399'
                      : spec.colorHex;
                    const sparkDelay = spec.motion === 'melee' ? 0.22 : 0.25;
                    return (
                      <motion.span
                        key={deg}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                        animate={{ x: tx, y: ty, opacity: [0, 1, 0], scale: [0.6, 1.2, 0.3] }}
                        transition={{ duration: 0.36, delay: sparkDelay, ease: 'easeOut' }}
                        style={{
                          backgroundColor: sparkColor,
                          boxShadow: `0 0 8px ${spec.glowHex}`,
                        }}
                        className="absolute w-2.5 h-2.5 -ml-1 -mt-1 rounded-xs border border-white/80"
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
