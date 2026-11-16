import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DigimonSpecies } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Zap, Award, Flame } from 'lucide-react';

interface EvolutionModalProps {
  prevSpecies?: DigimonSpecies;
  newSpecies: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  prevSpecies,
  newSpecies,
  isOpen,
  onClose,
}) => {
  const [phase, setPhase] = useState<'charging' | 'wireframe' | 'reveal'>('charging');

  useEffect(() => {
    if (!isOpen) {
      setPhase('charging');
      return;
    }

    sound.playDigivolve();

    // Sequence timing
    const t1 = setTimeout(() => {
      setPhase('wireframe');
    }, 1800);

    const t2 = setTimeout(() => {
      setPhase('reveal');
      sound.playVictory();
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: [newSpecies.colorTheme || '#38bdf8', '#fbbf24', '#ffffff'],
        });
      } catch (e) {}
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, newSpecies]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      {/* Background Matrix & Digital Streams */}
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      {/* Rotating Digital Circle Aura */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        className="absolute w-[460px] h-[460px] rounded-full border-2 border-dashed border-cyan-400/30 pointer-events-none"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
        className="absolute w-[560px] h-[560px] rounded-full border border-dashed border-amber-400/20 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Phase 1: Charging Digisoul */}
        {phase === 'charging' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="text-amber-400 font-pixel text-xs tracking-widest mb-2 animate-pulse">
              [DIGIVICE SYNCHRONIZING]
            </div>
            <h2 className="text-3xl font-bold font-chakra text-white mb-6">
              DIGITAL DNA SURGING!
            </h2>

            {/* Glowing Crest / Digivice */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], filter: ['drop-shadow(0 0 15px #f59e0b)', 'drop-shadow(0 0 35px #38bdf8)', 'drop-shadow(0 0 15px #f59e0b)'] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-32 h-32 rounded-full bg-slate-900 border-4 border-amber-400 flex items-center justify-center text-5xl mb-4"
            >
              📟
            </motion.div>

            <p className="text-slate-300 font-pixel text-[11px] animate-pulse">
              {prevSpecies?.name || 'Digimon'} is Digivolving...!
            </p>
          </motion.div>
        )}

        {/* Phase 2: Wireframe Transformation */}
        {phase === 'wireframe' && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="text-cyan-400 font-pixel text-xs tracking-widest mb-2 animate-bounce">
              ⚡ DIGIVOLUTION IN PROGRESS ⚡
            </div>
            <h2 className="text-4xl font-bold font-chakra text-white mb-4 uppercase">
              {prevSpecies?.name} DIGIVOLVE TO...
            </h2>

            {/* Pulsing Energy Sphere */}
            <div className="relative w-44 h-44 rounded-full bg-gradient-to-tr from-cyan-500 via-white to-amber-300 animate-spin flex items-center justify-center shadow-[0_0_80px_rgba(56,189,248,0.8)]">
              <Sparkles className="w-16 h-16 text-slate-950 animate-ping" />
            </div>
          </motion.div>
        )}

        {/* Phase 3: The Big Reveal */}
        {phase === 'reveal' && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 font-pixel text-[11px] mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>EVOLUTION SUCCESSFUL!</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold font-chakra text-white tracking-wider mb-1">
              {newSpecies.name}!
            </h1>
            <div className="text-sm font-pixel text-amber-400 mb-4">
              STAGE: {newSpecies.stage.toUpperCase()} ({newSpecies.type})
            </div>

            {/* New Digimon Sprite Display */}
            <div className="h-44 flex items-center justify-center my-2">
              <DigimonSprite species={newSpecies} action="cheer" scale={1.4} />
            </div>

            {/* Signature Move Box */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 my-4 w-full text-left">
              <div className="flex items-center gap-2 text-rose-400 font-pixel text-xs mb-1">
                <Flame className="w-4 h-4" />
                <span>SIGNATURE ATTACK: {newSpecies.signatureMove.name}</span>
              </div>
              <p className="text-slate-300 text-xs font-chakra">
                {newSpecies.signatureMove.description} (Power: {newSpecies.signatureMove.power})
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-pixel text-xs px-8 py-3.5 rounded-xl font-bold tracking-wider shadow-lg shadow-orange-500/40 active:scale-95 transition-transform"
            >
              COMMENCE NEW STAGE!
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
