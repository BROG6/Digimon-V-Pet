import React from 'react';
import { motion } from 'motion/react';
import { DigimonSpecies, TrainingStatKey } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';

interface GymStationSceneProps {
  statKey: TrainingStatKey;
  species?: DigimonSpecies;
  isExecuting: boolean;
  hitState: 'idle' | 'critical' | 'weak';
  hitNonce: number;
  round: number;
  actionSprite: 'idle' | 'attack' | 'happy';
  roundResult: { text: string; isCrit: boolean } | null;
}

const ImpactSparks: React.FC<{ isCrit: boolean; hitNonce: number; className?: string }> = ({
  isCrit,
  hitNonce,
  className = '',
}) => (
  <motion.div
    key={`sparks-${hitNonce}`}
    initial={{ scale: 0.4, opacity: 0.95 }}
    animate={{ scale: isCrit ? [0.5, 1.35, 1.1] : [0.4, 1.0, 0.85], opacity: [1, 1, 0] }}
    transition={{ duration: 0.45, ease: 'easeOut' }}
    className={`pointer-events-none ${className}`}
  >
    <svg viewBox="0 0 48 48" className="w-12 h-12" shapeRendering="crispEdges">
      <polygon
        points="24,2 28,16 42,10 32,22 46,28 31,31 38,44 25,34 18,46 18,32 4,34 15,24 6,12 20,17"
        fill={isCrit ? '#f97316' : '#fbbf24'}
      />
      <polygon
        points="24,10 26,19 35,16 28,23 36,27 27,28 31,36 24,30 19,37 20,28 11,29 18,23 13,16 21,19"
        fill="#fef08a"
      />
      <rect x="21" y="21" width="6" height="6" fill="#ffffff" />
    </svg>
  </motion.div>
);

const DustPuffs: React.FC<{ activeKey: string; side?: 'left' | 'right' }> = ({
  activeKey,
  side = 'left',
}) => (
  <motion.div
    key={`dust-${activeKey}`}
    initial={{ scale: 0.4, opacity: 0.9, x: 0 }}
    animate={{
      scale: [0.5, 1.15, 1.35],
      opacity: [0.9, 0.7, 0],
      x: side === 'left' ? [-2, -16, -24] : [2, 16, 24],
    }}
    transition={{ duration: 0.55, ease: 'easeOut' }}
    className="pointer-events-none"
  >
    <svg viewBox="0 0 32 20" className="w-8 h-5" shapeRendering="crispEdges">
      <rect x="4" y="8" width="10" height="8" rx="3" fill="#e7e5e4" />
      <rect x="12" y="4" width="12" height="10" rx="4" fill="#d6d3d1" />
      <rect x="18" y="10" width="10" height="7" rx="3" fill="#a8a29e" />
    </svg>
  </motion.div>
);

const GreenGymTurfBackdrop: React.FC<{ withTrack?: boolean; children?: React.ReactNode }> = ({
  withTrack = false,
  children,
}) => (
  <svg
    viewBox="0 0 240 120"
    preserveAspectRatio="none"
    shapeRendering="crispEdges"
    className="absolute inset-0 w-full h-full pointer-events-none"
    aria-hidden="true"
  >
    {/* Lush Green Gym grass texture */}
    <rect x="0" y="0" width="240" height="120" fill="#2d4c2b" />
    <rect x="0" y="0" width="240" height="24" fill="#223b21" />
    {/* Subtle grass speckles */}
    <rect x="14" y="12" width="12" height="4" fill="#3a6137" />
    <rect x="78" y="18" width="16" height="4" fill="#3a6137" />
    <rect x="164" y="10" width="18" height="4" fill="#3a6137" />
    <rect x="28" y="42" width="14" height="4" fill="#3a6137" />
    <rect x="196" y="48" width="18" height="4" fill="#3a6137" />
    <rect x="18" y="102" width="16" height="4" fill="#223b21" />
    <rect x="186" y="104" width="20" height="4" fill="#223b21" />

    {withTrack ? (
      <>
        {/* Dirt lap path cutting horizontally across screen */}
        <rect x="0" y="66" width="240" height="36" fill="#9c8a6c" />
        <rect x="0" y="66" width="240" height="4" fill="#7c6b50" />
        <rect x="0" y="98" width="240" height="4" fill="#7c6b50" />
        <rect x="20" y="76" width="24" height="4" fill="#b4a282" />
        <rect x="92" y="84" width="32" height="4" fill="#b4a282" />
        <rect x="178" y="74" width="28" height="4" fill="#b4a282" />
      </>
    ) : (
      <>
        {/* Central sandy dirt training patch */}
        <ellipse cx="122" cy="86" rx="92" ry="26" fill="#8b7a5e" />
        <ellipse cx="122" cy="86" rx="76" ry="18" fill="#a29072" />
      </>
    )}

    {/* Blue wooden fence posts at top edge like Digimon World Green Gym */}
    <rect x="0" y="20" width="240" height="5" fill="#1e40af" />
    <rect x="12" y="10" width="6" height="18" fill="#1d4ed8" />
    <rect x="58" y="10" width="6" height="18" fill="#1d4ed8" />
    <rect x="116" y="10" width="6" height="18" fill="#1d4ed8" />
    <rect x="174" y="10" width="6" height="18" fill="#1d4ed8" />
    <rect x="222" y="10" width="6" height="18" fill="#1d4ed8" />
    {children}
  </svg>
);

export const GymStationScene: React.FC<GymStationSceneProps> = ({
  statKey,
  species,
  isExecuting,
  hitState,
  hitNonce,
  round,
  actionSprite,
  roundResult,
}) => {
  const isCrit = hitState === 'critical';

  return (
    <div className="relative w-full h-48 bg-[#223b21] border-2 border-slate-700 rounded-2xl overflow-hidden shadow-inner">
      {/* Result Toast */}
      {roundResult && (
        <motion.div
          key={`res-${round}-${hitNonce}`}
          initial={{ y: 6, opacity: 0, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          className={`absolute top-2.5 left-3 z-40 pointer-events-none font-chakra text-xs px-2.5 py-1 rounded-lg font-bold shadow-lg border ${
            roundResult.isCrit
              ? 'bg-amber-400 text-slate-950 border-amber-200'
              : 'bg-slate-800/95 text-rose-300 border-rose-500/60'
          }`}
        >
          {roundResult.text}
        </motion.div>
      )}

      {/* =================================================================
          1. HP: PUSHING THE HEAVY BOULDER
         ================================================================= */}
      {statKey === 'hp' && (
        <>
          <GreenGymTurfBackdrop />
          <div className="relative z-10 w-full h-full flex items-end justify-center pb-3 px-4 gap-1">
            {/* Dust behind feet while straining */}
            {isExecuting && (
              <div className="mb-2 -mr-2 z-20">
                <DustPuffs activeKey={`hp-${hitNonce}`} side="left" />
              </div>
            )}

            {/* Digimon pushing right */}
            <motion.div
              animate={
                isExecuting
                  ? {
                      x: isCrit ? [0, 14, 18, 22, 0] : [0, 8, 10, 0],
                      rotate: [0, 5, 7, 4, 0],
                    }
                  : { x: [0, 2, 0], rotate: 0 }
              }
              transition={
                isExecuting
                  ? { duration: 0.9, ease: 'easeInOut' }
                  : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
              }
              className="mb-1 z-20"
            >
              <DigimonSprite
                species={species}
                action={isExecuting ? 'walk' : actionSprite}
                facing="right"
                scale={0.95}
                showMoodIndicator={false}
              />
            </motion.div>

            {/* Giant Heavy Chained Boulder with Red Kanji */}
            <motion.div
              animate={
                isExecuting
                  ? {
                      x: isCrit ? [0, 4, 16, 14, 0] : [0, 3, 5, 0],
                      rotate: isCrit ? [0, 1.5, 3, 0] : [0, 1, 0],
                    }
                  : { x: 0, rotate: 0 }
              }
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative mb-1 z-10 shrink-0"
            >
              {isExecuting && isCrit && (
                <ImpactSparks
                  isCrit={true}
                  hitNonce={hitNonce}
                  className="absolute -left-5 top-1/2 -translate-y-1/2 z-30"
                />
              )}
              <svg viewBox="0 0 88 88" className="w-24 h-24 drop-shadow-[0_6px_8px_rgba(0,0,0,0.65)]" shapeRendering="crispEdges">
                <ellipse cx="46" cy="82" rx="34" ry="6" fill="rgba(0,0,0,0.4)" />
                {/* Massive craggy rock */}
                <polygon
                  points="18,76 8,56 12,30 28,12 54,8 74,20 82,46 76,72 52,80"
                  fill="#4b5563"
                />
                <polygon
                  points="20,68 14,48 20,26 42,14 62,18 70,38 66,64 46,72"
                  fill="#6b7280"
                />
                <polygon
                  points="26,34 40,18 58,22 50,36 32,40"
                  fill="#9ca3af"
                />
                {/* Blue iron straps like Green Gym */}
                <path d="M12,48 L76,30" stroke="#1d4ed8" strokeWidth="6" />
                <path d="M24,18 L64,72" stroke="#1e40af" strokeWidth="5" />
                <rect x="40" y="38" width="8" height="8" fill="#93c5fd" />
                {/* Red painted weight kanji (重) */}
                <rect x="34" y="18" width="22" height="4" fill="#dc2626" />
                <rect x="43" y="16" width="4" height="32" fill="#dc2626" />
                <rect x="32" y="26" width="26" height="4" fill="#ef4444" />
                <rect x="35" y="34" width="20" height="4" fill="#dc2626" />
                <rect x="30" y="46" width="30" height="4" fill="#ef4444" />
              </svg>
            </motion.div>
          </div>
        </>
      )}

      {/* =================================================================
          2. MP: MEDITATION UNDER A WATERFALL
         ================================================================= */}
      {statKey === 'mp' && (
        <>
          {/* Rocky Cliff & Waterfall Pool Scene */}
          <svg
            viewBox="0 0 240 120"
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <rect x="0" y="0" width="240" height="120" fill="#2d4c2b" />
            {/* Craggy cliff walls flanking the waterfall */}
            <rect x="0" y="0" width="76" height="72" fill="#57534e" />
            <rect x="164" y="0" width="76" height="72" fill="#57534e" />
            <rect x="8" y="6" width="34" height="22" fill="#78716c" />
            <rect x="38" y="34" width="32" height="26" fill="#44403c" />
            <rect x="172" y="10" width="38" height="26" fill="#78716c" />
            <rect x="184" y="42" width="44" height="24" fill="#44403c" />
            {/* Waterfall basin & pool */}
            <ellipse cx="120" cy="94" rx="84" ry="22" fill="#0369a1" />
            <ellipse cx="120" cy="92" rx="68" ry="15" fill="#0ea5e9" />
          </svg>

          {/* Animated Waterfall Stream */}
          <div className="absolute inset-x-0 top-0 h-[84%] flex justify-center pointer-events-none overflow-hidden z-10">
            <div className="relative w-28 h-full bg-gradient-to-b from-cyan-300/80 via-sky-400/75 to-cyan-200/85 border-x-4 border-sky-700/60 overflow-hidden">
              <div className="gym-waterfall-flow absolute inset-0 flex justify-around opacity-85">
                <div className="w-2.5 h-full bg-white/75 rounded-full" />
                <div className="w-3.5 h-full bg-cyan-100/80 rounded-full mt-3" />
                <div className="w-2 h-full bg-white/80 rounded-full -mt-2" />
                <div className="w-3 h-full bg-sky-100/75 rounded-full mt-4" />
              </div>
            </div>
          </div>

          {/* Foaming Spray Cloud & Meditating Digimon */}
          <div className="relative z-20 w-full h-full flex items-end justify-center pb-3">
            {/* Splash mist halo */}
            <motion.div
              animate={
                isExecuting
                  ? { scale: isCrit ? [1, 1.32, 1.15] : [1, 1.16, 1], opacity: [0.85, 1, 0.85] }
                  : { scale: [0.96, 1.04, 0.96], opacity: 0.78 }
              }
              transition={{ duration: isExecuting ? 0.8 : 1.8, repeat: isExecuting ? 0 : Infinity }}
              className="absolute bottom-2 flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 150 48" className="w-40 h-12" shapeRendering="crispEdges">
                <ellipse cx="75" cy="34" rx="62" ry="12" fill="#bae6fd" opacity="0.85" />
                <circle cx="32" cy="28" r="13" fill="#e0f2fe" opacity="0.9" />
                <circle cx="52" cy="24" r="15" fill="#ffffff" opacity="0.92" />
                <circle cx="98" cy="24" r="15" fill="#ffffff" opacity="0.92" />
                <circle cx="118" cy="28" r="13" fill="#e0f2fe" opacity="0.9" />
              </svg>
            </motion.div>

            {/* Meditating Digimon */}
            <motion.div
              animate={
                isExecuting
                  ? { y: isCrit ? [0, -8, -4, 0] : [0, -4, 0], scale: isCrit ? [1, 1.08, 1] : 1 }
                  : { y: [0, -2, 0] }
              }
              transition={
                isExecuting
                  ? { duration: 0.85, ease: 'easeInOut' }
                  : { duration: 2.0, repeat: Infinity, ease: 'easeInOut' }
              }
              className="relative z-30 mb-1"
            >
              {/* Spirit MP Orbs rising */}
              {isExecuting && (
                <motion.div
                  key={`mp-orbs-${hitNonce}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 1, 0], y: [-4, -34, -48] }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="absolute -top-3 inset-x-0 flex justify-center gap-4 pointer-events-none"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
                  <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#38bdf8]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-300 shadow-[0_0_8px_#7dd3fc]" />
                </motion.div>
              )}
              <DigimonSprite
                species={species}
                pose={actionSprite === 'happy' ? 'happy' : 'sitting'}
                facing="right"
                scale={0.92}
                showMoodIndicator={false}
              />
            </motion.div>
          </div>
        </>
      )}

      {/* =================================================================
          3. OFFENSE: STRIKING AN ANCIENT TREE TRUNK
         ================================================================= */}
      {statKey === 'offense' && (
        <>
          <GreenGymTurfBackdrop />
          <div className="relative z-10 w-full h-full flex items-end justify-center pb-3 px-4 gap-3">
            {/* Digimon winding up & lunging to strike the trunk */}
            <motion.div
              animate={
                isExecuting
                  ? { x: isCrit ? [0, -6, 30, 22, 0] : [0, 16, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mb-1 z-20"
            >
              <DigimonSprite
                species={species}
                action={isExecuting ? 'attack' : actionSprite}
                facing="right"
                scale={0.95}
                showMoodIndicator={false}
              />
            </motion.div>

            {/* Thick Chained Ancient Tree Trunk */}
            <motion.div
              animate={
                isExecuting
                  ? { x: isCrit ? [0, 6, -5, 4, -2, 0] : [0, 3, -2, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.45, delay: 0.12 }}
              className="relative mb-0.5 z-10 shrink-0"
            >
              {isExecuting && (
                <ImpactSparks
                  isCrit={isCrit}
                  hitNonce={hitNonce}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 z-30"
                />
              )}
              <svg viewBox="0 0 64 96" className="w-16 h-28 drop-shadow-[0_6px_8px_rgba(0,0,0,0.65)]" shapeRendering="crispEdges">
                <ellipse cx="32" cy="91" rx="24" ry="5" fill="rgba(0,0,0,0.4)" />
                {/* Tree trunk cylinder */}
                <rect x="14" y="10" width="36" height="80" fill="#5c4033" />
                <rect x="18" y="12" width="10" height="76" fill="#7c5846" />
                <rect x="38" y="12" width="8" height="76" fill="#432e24" />
                {/* Top stump wood rings */}
                <ellipse cx="32" cy="10" rx="18" ry="6" fill="#a88b68" />
                <ellipse cx="32" cy="10" rx="11" ry="3.5" fill="#7c5846" />
                {/* Bark vertical grooves */}
                <rect x="22" y="28" width="3" height="18" fill="#3a251c" />
                <rect x="34" y="42" width="3" height="22" fill="#3a251c" />
                <rect x="26" y="60" width="3" height="16" fill="#3a251c" />
                {/* Blue iron bands like Green Gym */}
                <rect x="12" y="20" width="40" height="5" fill="#1d4ed8" />
                <rect x="12" y="76" width="40" height="5" fill="#1e40af" />
                <rect x="29" y="19" width="6" height="7" fill="#60a5fa" />
              </svg>
            </motion.div>
          </div>
        </>
      )}

      {/* =================================================================
          4. DEFENSE: GETTING HIT BY A GIANT PUNCHING GLOVE
         ================================================================= */}
      {statKey === 'defense' && (
        <>
          <GreenGymTurfBackdrop />
          <div className="relative z-10 w-full h-full flex items-end justify-center pb-3 px-4 gap-5">
            {/* Giant Spring-Loaded Punching Glove on Left */}
            <motion.div
              animate={
                isExecuting
                  ? { x: isCrit ? [0, -8, 52, 42, 0] : [0, -6, 46, 0] }
                  : { x: [0, -4, 0] }
              }
              transition={
                isExecuting
                  ? { duration: 0.6, ease: 'easeOut' }
                  : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
              }
              className="relative mb-3 z-20 shrink-0"
            >
              <svg viewBox="0 0 92 56" className="w-24 h-16 drop-shadow-[0_6px_6px_rgba(0,0,0,0.6)]" shapeRendering="crispEdges">
                {/* Coiled Spring Mechanism */}
                <rect x="0" y="22" width="34" height="12" fill="#334155" />
                <rect x="4" y="18" width="4" height="20" fill="#94a3b8" />
                <rect x="12" y="18" width="4" height="20" fill="#cbd5e1" />
                <rect x="20" y="18" width="4" height="20" fill="#94a3b8" />
                <rect x="28" y="18" width="4" height="20" fill="#cbd5e1" />
                {/* Metal Cuff */}
                <rect x="34" y="14" width="12" height="28" fill="#64748b" />
                <rect x="36" y="16" width="8" height="24" fill="#94a3b8" />
                {/* Giant Brown/Crimson Leather Boxing Glove */}
                <rect x="46" y="8" width="36" height="40" rx="12" fill="#991b1b" />
                <rect x="52" y="10" width="32" height="32" rx="10" fill="#b91c1c" />
                <rect x="64" y="14" width="22" height="22" rx="8" fill="#dc2626" />
                {/* Thumb */}
                <rect x="50" y="34" width="20" height="14" rx="5" fill="#7f1d1d" />
                {/* Highlight shine */}
                <rect x="66" y="16" width="10" height="6" rx="2" fill="#fca5a5" opacity="0.6" />
              </svg>
            </motion.div>

            {/* Digimon bracing on Right */}
            <motion.div
              animate={
                isExecuting
                  ? {
                      x: isCrit ? [0, 10, 4, 0] : [0, 20, 12, 0],
                      rotate: isCrit ? [0, 4, 0] : [0, 10, -4, 0],
                    }
                  : { x: 0, rotate: 0 }
              }
              transition={{ duration: 0.55, delay: 0.14, ease: 'easeOut' }}
              className="relative mb-1 z-20"
            >
              {isExecuting && (
                <ImpactSparks
                  isCrit={isCrit}
                  hitNonce={hitNonce}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 z-30"
                />
              )}
              {isExecuting && isCrit && (
                <motion.div
                  key={`guard-${hitNonce}`}
                  initial={{ scale: 0.7, opacity: 0.9 }}
                  animate={{ scale: [0.8, 1.25], opacity: [0.95, 0] }}
                  transition={{ duration: 0.5 }}
                  className="absolute -inset-2 rounded-full border-2 border-sky-300 bg-sky-400/20 pointer-events-none"
                />
              )}
              <DigimonSprite
                species={species}
                action={isExecuting ? (isCrit ? 'idle' : 'sick') : actionSprite}
                facing="left"
                scale={0.95}
                showMoodIndicator={false}
              />
            </motion.div>
          </div>
        </>
      )}

      {/* =================================================================
          5. SPEED: RUNNING LAPS (OUT RIGHT -> IN LEFT REPEATEDLY)
         ================================================================= */}
      {statKey === 'speed' && (
        <>
          <GreenGymTurfBackdrop withTrack={true} />
          {/* Iconic Green Gym >>> Speed Arrow Sign */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <svg viewBox="0 0 64 44" className="w-16 h-11 drop-shadow-[0_3px_4px_rgba(0,0,0,0.5)]" shapeRendering="crispEdges">
              {/* Sign posts */}
              <rect x="8" y="30" width="5" height="14" fill="#1e40af" />
              <rect x="51" y="30" width="5" height="14" fill="#1e40af" />
              {/* Board */}
              <rect x="4" y="4" width="56" height="28" fill="#1d4ed8" />
              <rect x="7" y="7" width="50" height="22" fill="#0f172a" />
              {/* Chevron arrows >>> */}
              <polygon points="12,11 22,18 12,25 16,18" fill="#ec4899" />
              <polyline points="26,11 35,18 26,25" stroke="#fde047" strokeWidth="3" fill="none" />
              <polyline points="39,11 48,18 39,25" stroke="#e2e8f0" strokeWidth="3" fill="none" />
            </svg>
          </div>

          <div className="relative z-20 w-full h-full flex items-end justify-center pb-4 overflow-hidden">
            {/* Speed motion wind lines during sprint */}
            {isExecuting && (
              <div className="absolute inset-x-0 bottom-8 flex flex-col gap-2 opacity-65 pointer-events-none px-4">
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                <div className="h-0.5 w-3/4 mx-auto bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
              </div>
            )}

            <div
              key={isExecuting ? `run-${hitNonce}` : 'run-idle'}
              className={`relative mb-1 ${isExecuting ? 'gym-run-lap' : 'gym-run-idle-bounce'}`}
            >
              {isExecuting && (
                <div className="absolute -left-7 bottom-1 pointer-events-none">
                  <DustPuffs activeKey={`spd-${hitNonce}`} side="left" />
                </div>
              )}
              <DigimonSprite
                species={species}
                action="walk"
                facing="right"
                scale={0.95}
                showMoodIndicator={false}
              />
            </div>
          </div>
        </>
      )}

      {/* =================================================================
          6. BRAINS: BLACKBOARD STUDY + PENCIL WRITING IN BOOK ABOVE HEAD
         ================================================================= */}
      {statKey === 'brains' && (
        <>
          <GreenGymTurfBackdrop />
          <div className="relative z-10 w-full h-full flex items-end justify-center pb-3 px-4 gap-3">
            {/* Giant Green Gym Blackboard on Left */}
            <div className="relative mb-2 z-10 shrink-0">
              <svg viewBox="0 0 108 82" className="w-28 h-22 drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)]" shapeRendering="crispEdges">
                {/* Support legs */}
                <rect x="14" y="66" width="6" height="16" fill="#1e40af" />
                <rect x="88" y="66" width="6" height="16" fill="#1e40af" />
                {/* Steel Frame */}
                <rect x="4" y="4" width="100" height="64" fill="#1d4ed8" />
                <rect x="8" y="8" width="92" height="56" fill="#132a1c" />
                {/* Sun / Crest doodle */}
                <circle cx="28" cy="28" r="9" fill="#facc15" />
                <circle cx="28" cy="28" r="5" fill="#132a1c" />
                <rect x="26" y="13" width="4" height="4" fill="#facc15" />
                <rect x="26" y="39" width="4" height="4" fill="#facc15" />
                <rect x="13" y="26" width="4" height="4" fill="#facc15" />
                <rect x="39" y="26" width="4" height="4" fill="#facc15" />
                {/* Chalk battle tactics scribbles */}
                <rect x="52" y="14" width="38" height="4" fill="#38bdf8" />
                <rect x="56" y="24" width="30" height="4" fill="#f43f5e" />
                <rect x="50" y="34" width="36" height="4" fill="#a78bfa" />
                <rect x="58" y="44" width="26" height="4" fill="#fde047" />
                <rect x="16" y="50" width="26" height="3" fill="#94a3b8" />
              </svg>
            </div>

            {/* Studying Digimon looking left at blackboard + Animated Book & Pencil above head */}
            <div className="relative mb-1 z-20 flex flex-col items-center">
              {/* Thought bubble: Open Book + Animated Writing Pencil */}
              <motion.div
                animate={
                  isExecuting
                    ? { y: [0, -5, 0], scale: isCrit ? [1, 1.15, 1.05] : [1, 1.08, 1] }
                    : { y: [0, -2, 0] }
                }
                transition={{ duration: isExecuting ? 0.7 : 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative -mb-1 z-30 flex items-center gap-1"
              >
                <div className="relative px-2 py-1 rounded-xl bg-slate-950/90 border border-violet-400/70 shadow-lg flex items-center justify-center">
                  {/* Open Notebook */}
                  <svg viewBox="0 0 36 26" className="w-8 h-6" shapeRendering="crispEdges">
                    {/* Book cover */}
                    <rect x="2" y="5" width="32" height="19" rx="2" fill="#4f46e5" />
                    {/* Left & right white pages */}
                    <rect x="4" y="6" width="13" height="16" fill="#f8fafc" />
                    <rect x="19" y="6" width="13" height="16" fill="#f1f5f9" />
                    <rect x="17" y="6" width="2" height="16" fill="#94a3b8" />
                    {/* Written lines */}
                    <rect x="6" y="9" width="9" height="2" fill="#64748b" />
                    <rect x="6" y="13" width="8" height="2" fill="#64748b" />
                    <rect x="6" y="17" width="9" height="2" fill="#94a3b8" />
                    <rect x="21" y="9" width="8" height="2" fill="#6366f1" />
                    <rect x="21" y="13" width="9" height="2" fill="#6366f1" />
                    <rect x="21" y="17" width="6" height="2" fill="#a855f7" />
                  </svg>

                  {/* Animated Writing Pencil */}
                  <div
                    className={`absolute -top-1.5 right-0.5 pointer-events-none ${
                      isExecuting ? 'gym-pencil-write' : ''
                    }`}
                  >
                    <svg viewBox="0 0 18 18" className="w-4 h-4 drop-shadow" shapeRendering="crispEdges">
                      <rect x="11" y="1" width="5" height="4" fill="#fb7185" />
                      <rect x="9" y="3" width="5" height="4" fill="#e2e8f0" />
                      <polygon points="9,4 13,8 6,15 2,11" fill="#facc15" />
                      <polygon points="2,11 6,15 1,17" fill="#fde68a" />
                      <rect x="1" y="15" width="2" height="2" fill="#1e293b" />
                    </svg>
                  </div>
                </div>

                {/* Eureka Sparkle on Crit */}
                {isExecuting && isCrit && (
                  <motion.span
                    key={`eureka-${hitNonce}`}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [0.6, 1.3, 1], opacity: 1 }}
                    className="text-sm leading-none select-none"
                  >
                    💡
                  </motion.span>
                )}
              </motion.div>

              {/* Curious swaying Digimon */}
              <motion.div
                animate={
                  isExecuting
                    ? { rotate: [-3, 3, -3, 2, 0], y: [0, -3, 0, -2, 0] }
                    : { rotate: [-1.5, 1.5, -1.5] }
                }
                transition={{
                  duration: isExecuting ? 0.85 : 2.2,
                  repeat: isExecuting ? 0 : Infinity,
                  ease: 'easeInOut',
                }}
              >
                <DigimonSprite
                  species={species}
                  action={actionSprite === 'happy' ? 'happy' : 'idle'}
                  facing="left"
                  scale={0.92}
                  showMoodIndicator={false}
                />
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
