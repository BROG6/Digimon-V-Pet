import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttackVisualSpec } from '../data/battleTechniques';

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

const ProjectileGraphic: React.FC<{
  variant: AttackVisualSpec['variant'];
  colorHex: string;
  glowHex: string;
  facingLeft: boolean;
}> = ({ variant, colorHex, glowHex, facingLeft }) => {
  const flipTransform = facingLeft ? 'scale(-1, 1)' : undefined;

  if (variant === 'fireball') {
    return (
      <svg
        viewBox="0 0 80 48"
        className="w-16 h-10 sm:w-20 sm:h-12 overflow-visible"
        style={{ transform: flipTransform, filter: `drop-shadow(0 0 10px ${glowHex})` }}
      >
        <path
          d="M 4,24 Q 24,8 46,12 Q 66,14 72,24 Q 66,34 46,36 Q 24,40 4,24 Z"
          fill={glowHex}
          opacity="0.9"
        />
        <path
          d="M 18,24 Q 34,14 52,16 Q 66,18 70,24 Q 66,30 52,32 Q 34,34 18,24 Z"
          fill={colorHex}
        />
        <ellipse cx="56" cy="24" rx="11" ry="8" fill="#fef08a" />
        <circle cx="59" cy="24" r="4.5" fill="#ffffff" />
      </svg>
    );
  }

  if (variant === 'ice') {
    return (
      <svg
        viewBox="0 0 84 44"
        className="w-16 h-9 sm:w-20 sm:h-11 overflow-visible"
        style={{ transform: flipTransform, filter: `drop-shadow(0 0 9px ${glowHex})` }}
      >
        <polygon points="8,22 28,13 78,22 28,31" fill={glowHex} opacity="0.88" />
        <polygon points="18,22 34,15 76,22 34,29" fill={colorHex} />
        <polygon points="32,22 44,18 72,22 44,26" fill="#ecfeff" />
        <polygon points="16,10 24,14 14,17" fill="#a5f3fc" />
        <polygon points="16,34 24,30 14,27" fill="#a5f3fc" />
      </svg>
    );
  }

  if (variant === 'bolt') {
    return (
      <svg
        viewBox="0 0 84 48"
        className="w-16 h-10 sm:w-20 sm:h-12 overflow-visible"
        style={{ transform: flipTransform, filter: `drop-shadow(0 0 10px ${glowHex})` }}
      >
        <polyline
          points="6,24 24,14 32,28 52,12 60,26 78,20"
          fill="none"
          stroke={glowHex}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="6,24 24,14 32,28 52,12 60,26 78,20"
          fill="none"
          stroke={colorHex}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="10,24 24,14 32,28 52,12 60,26 78,20"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'leaf') {
    return (
      <svg
        viewBox="0 0 72 48"
        className="w-14 h-10 sm:w-20 sm:h-11 overflow-visible"
        style={{ transform: flipTransform, filter: `drop-shadow(0 0 8px ${glowHex})` }}
      >
        <path d="M 16,18 Q 38,4 58,14 Q 44,28 16,18 Z" fill={colorHex} stroke="#dcfce7" strokeWidth="1.5" />
        <path d="M 22,32 Q 46,20 68,28 Q 48,42 22,32 Z" fill={glowHex} stroke="#bbf7d0" strokeWidth="1.5" />
        <circle cx="56" cy="22" r="4" fill="#ecfdf5" opacity="0.9" />
      </svg>
    );
  }

  if (variant === 'holy') {
    return (
      <svg
        viewBox="0 0 64 64"
        className="w-14 h-14 sm:w-16 sm:h-16 overflow-visible"
        style={{ filter: `drop-shadow(0 0 12px ${glowHex})` }}
      >
        <circle cx="32" cy="32" r="19" fill="none" stroke={colorHex} strokeWidth="3" opacity="0.8" />
        <polygon
          points="32,4 38,24 58,32 38,40 32,60 26,40 6,32 26,24"
          fill={colorHex}
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <circle cx="32" cy="32" r="7" fill="#ffffff" />
      </svg>
    );
  }

  if (variant === 'dark') {
    return (
      <svg
        viewBox="0 0 64 64"
        className="w-14 h-14 sm:w-16 sm:h-16 overflow-visible"
        style={{ filter: `drop-shadow(0 0 12px ${glowHex})` }}
      >
        <circle cx="32" cy="32" r="17" fill="#1e1b4b" stroke={colorHex} strokeWidth="3" />
        <circle cx="32" cy="32" r="11" fill={glowHex} opacity="0.85" />
        <path d="M 10,20 L 22,26 M 54,18 L 42,26 M 12,46 L 23,38 M 52,44 L 41,38" stroke={colorHex} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="32" r="5" fill="#f5d0fe" />
      </svg>
    );
  }

  if (variant === 'missile') {
    return (
      <svg
        viewBox="0 0 80 40"
        className="w-16 h-9 sm:w-20 sm:h-10 overflow-visible"
        style={{ transform: flipTransform, filter: `drop-shadow(0 0 8px ${glowHex})` }}
      >
        <polygon points="4,20 18,12 18,28" fill="#fb923c" />
        <rect x="18" y="13" width="38" height="14" rx="3" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
        <polygon points="56,12 76,20 56,28" fill={colorHex} stroke="#0f172a" strokeWidth="2" />
        <rect x="26" y="17" width="22" height="4" fill="#38bdf8" />
      </svg>
    );
  }

  // filth or fallback orb
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-14 h-14 sm:w-16 sm:h-16 overflow-visible"
      style={{ filter: `drop-shadow(0 0 9px ${glowHex})` }}
    >
      <circle cx="32" cy="32" r="15" fill={glowHex} />
      <circle cx="29" cy="28" r="10" fill={colorHex} />
      <circle cx="16" cy="20" r="4" fill={colorHex} />
      <circle cx="48" cy="42" r="4.5" fill={glowHex} />
      <circle cx="26" cy="25" r="3" fill="#ffffff" opacity="0.7" />
    </svg>
  );
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
            const { attacker, spec, isCrit, isSuperEffective } = activeVfx;
            const fromLeft = attacker === 'player';
            const attackerX = fromLeft ? '18%' : '82%';
            const defenderX = fromLeft ? '82%' : '18%';
            const facingLeft = !fromLeft;

            if (spec.motion === 'melee') {
              return (
                <>
                  {/* Cross-arena speed lines behind rushing attacker */}
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0.2 }}
                    animate={{ opacity: [0, 0.9, 0], scaleX: [0.3, 1.1, 0.4] }}
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
                        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${spec.colorHex}, #ffffff)`,
                      }}
                    />
                    <div
                      className="h-1 rounded-full mx-4"
                      style={{
                        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${spec.glowHex}, #ffffff)`,
                      }}
                    />
                    <div
                      className="h-0.5 rounded-full mx-2"
                      style={{
                        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${spec.colorHex}, #ffffff)`,
                      }}
                    />
                  </motion.div>

                  {/* Physical Strike Graphic & Impact Explosion directly on Defender */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.45, 1.15, 1.25, 1.35] }}
                    transition={{ duration: 0.42, delay: 0.21, ease: 'easeOut' }}
                    style={{ left: defenderX, top: '63%' }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    {spec.variant === 'slash' ? (
                      <svg
                        viewBox="0 0 100 100"
                        className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible"
                        style={{
                          transform: facingLeft ? 'scaleX(-1)' : undefined,
                          filter: `drop-shadow(0 0 10px ${spec.glowHex})`,
                        }}
                      >
                        {/* Triple Claw / Blade Slash Arcs */}
                        <path
                          d="M 14,20 Q 54,42 88,78"
                          stroke={spec.glowHex}
                          strokeWidth="9"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M 24,10 Q 60,36 92,66"
                          stroke={spec.colorHex}
                          strokeWidth="6"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M 8,38 Q 48,60 80,90"
                          stroke={spec.colorHex}
                          strokeWidth="6"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M 14,20 Q 54,42 88,78"
                          stroke="#ffffff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M 24,10 Q 60,36 92,66"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 100 100"
                        className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible"
                        style={{ filter: `drop-shadow(0 0 12px ${spec.glowHex})` }}
                      >
                        {/* Heavy Kinetic Impact Star & Fist Shockwave */}
                        <circle
                          cx="50"
                          cy="50"
                          r="32"
                          fill="none"
                          stroke={spec.colorHex}
                          strokeWidth="4"
                          opacity="0.85"
                        />
                        <polygon
                          points="50,6 59,34 88,20 68,45 96,54 68,62 84,88 56,70 48,96 42,68 14,82 32,56 4,48 34,40 16,14 44,32"
                          fill={spec.glowHex}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <circle cx="50" cy="50" r="14" fill="#ffffff" />
                      </svg>
                    )}
                  </motion.div>
                </>
              );
            }

            // RANGED ATTACK VFX
            return (
              <>
                {/* 1. Caster Charge Halo at Attacker */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
                  animate={{ opacity: [0, 1, 0.85, 0], scale: [0.4, 1.15, 1.35, 1.5], rotate: 90 }}
                  transition={{ duration: 0.36, delay: 0, ease: 'easeOut' }}
                  style={{
                    left: attackerX,
                    top: '63%',
                    borderColor: spec.colorHex,
                    boxShadow: `0 0 18px ${spec.glowHex}`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed bg-white/10"
                />

                {/* 2. Beam OR Flying Projectile across Arena */}
                {spec.variant === 'beam' ? (
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
                    className="absolute -translate-y-1/2 h-8 sm:h-10 flex items-center"
                  >
                    {/* Outer elemental beam glow */}
                    <div
                      className="w-full h-5 sm:h-6 rounded-full"
                      style={{
                        background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, ${spec.glowHex}, ${spec.colorHex}, #ffffff)`,
                        boxShadow: `0 0 18px ${spec.glowHex}, 0 0 32px ${spec.colorHex}`,
                      }}
                    />
                    {/* White-hot laser core */}
                    <div className="absolute inset-x-1 h-2 sm:h-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ left: attackerX, top: '63%', opacity: 0, scale: 0.65 }}
                    animate={{
                      left: [attackerX, defenderX],
                      top: ['63%', '61%', '63%'],
                      opacity: [0, 1, 1, 0],
                      scale: [0.7, 1.15, 1.05],
                    }}
                    transition={{
                      duration: 0.26,
                      delay: 0.06,
                      ease: [0.22, 0.85, 0.36, 1],
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <ProjectileGraphic
                      variant={spec.variant}
                      colorHex={spec.colorHex}
                      glowHex={spec.glowHex}
                      facingLeft={facingLeft}
                    />
                  </motion.div>
                )}

                {/* 3. Target Impact Explosion directly on Defender */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: [0, 1, 0.95, 0], scale: [0.35, 1.25, 1.55, 1.85] }}
                  transition={{ duration: 0.42, delay: 0.24, ease: 'easeOut' }}
                  style={{ left: defenderX, top: '63%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4"
                    style={{
                      borderColor: isCrit ? '#fde047' : spec.colorHex,
                      background: `radial-gradient(circle, #ffffff 0%, ${spec.colorHex}aa 45%, ${spec.glowHex}44 75%, transparent 100%)`,
                      boxShadow: `0 0 24px ${isCrit ? '#facc15' : spec.glowHex}`,
                    }}
                  />
                </motion.div>
              </>
            );
          })()}

          {/* Radiating Hit Sparks & Crit Starburst at Defender for ALL attacks */}
          {(() => {
            const defenderX = activeVfx.attacker === 'player' ? '82%' : '18%';
            const sparkDelay = activeVfx.spec.motion === 'melee' ? 0.22 : 0.25;
            const sparkColor = activeVfx.isCrit
              ? '#fde047'
              : activeVfx.isSuperEffective
              ? '#34d399'
              : activeVfx.spec.colorHex;

            return (
              <div
                style={{ left: defenderX, top: '63%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                {SPARK_ANGLES.map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const dist = activeVfx.isCrit ? 52 : 38;
                  const tx = Math.round(Math.cos(rad) * dist);
                  const ty = Math.round(Math.sin(rad) * dist);
                  return (
                    <motion.span
                      key={deg}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                      animate={{ x: tx, y: ty, opacity: [0, 1, 0], scale: [0.6, 1.2, 0.3] }}
                      transition={{ duration: 0.36, delay: sparkDelay, ease: 'easeOut' }}
                      style={{
                        backgroundColor: sparkColor,
                        boxShadow: `0 0 8px ${activeVfx.spec.glowHex}`,
                      }}
                      className="absolute w-2.5 h-2.5 -ml-1 -mt-1 rounded-xs border border-white/80"
                    />
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </AnimatePresence>
  );
};
