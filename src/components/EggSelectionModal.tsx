import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DIGI_EGGS } from '../data/digidex';
import { DigiEggInfo } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Shield, ChevronRight, Check } from 'lucide-react';

interface EggSelectionModalProps {
  isOpen: boolean;
  onSelectEgg: (egg: DigiEggInfo, nickname: string) => void;
}

export const EggSelectionModal: React.FC<EggSelectionModalProps> = ({
  isOpen,
  onSelectEgg,
}) => {
  const [selectedEgg, setSelectedEgg] = useState<DigiEggInfo>(DIGI_EGGS[0]);
  const [nickname, setNickname] = useState<string>(DIGI_EGGS[0].partnerRookie);
  const [isHatching, setIsHatching] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEggClick = (egg: DigiEggInfo) => {
    sound.playButton();
    setSelectedEgg(egg);
    setNickname(egg.partnerRookie);
  };

  const handleConfirmHatch = () => {
    sound.playDigivolve();
    setIsHatching(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [selectedEgg.crestColor, '#ffffff', '#fbbf24'],
      });
    } catch (e) {
      // safe fallback
    }

    setTimeout(() => {
      onSelectEgg(selectedEgg, nickname.trim() || selectedEgg.partnerRookie);
      setIsHatching(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl shadow-cyan-950/80 flex flex-col max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-cyan-300 text-xs font-pixel mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ORIGINAL DIGIDESTINED NURSERY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-chakra text-white tracking-wide">
            CHOOSE YOUR DESTINED DIGI-EGG
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
            Select one of the eight sacred Crest eggs from the 1999 DigiDestined. Your bond will guide its evolution to Mega!
          </p>
        </div>

        {/* 8 Digi-Eggs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {DIGI_EGGS.map((egg) => {
            const isSelected = selectedEgg.id === egg.id;
            return (
              <motion.div
                key={egg.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEggClick(egg)}
                className={`cursor-pointer rounded-2xl p-3 border-2 transition-all flex flex-col items-center justify-between text-center ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Crest Tag */}
                <div
                  className="w-full text-[10px] font-pixel py-0.5 rounded-full mb-1 font-bold truncate px-1 text-slate-950"
                  style={{ backgroundColor: egg.crestColor }}
                >
                  {egg.crest.toUpperCase()}
                </div>

                {/* Animated Egg Sprite */}
                <div className="my-2 h-24 flex items-center justify-center">
                  <DigimonSprite egg={egg} scale={0.7} />
                </div>

                {/* Rookie & Tamer info */}
                <div className="mt-1">
                  <div className="font-chakra font-bold text-sm text-white">
                    {egg.partnerRookie}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {egg.tamerName}
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 text-amber-400 flex items-center gap-1 text-[10px] font-pixel">
                    <Check className="w-3 h-3" />
                    <span>SELECTED</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Selected Egg Detail Showcase */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 flex items-center justify-center">
              <DigimonSprite egg={selectedEgg} scale={0.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-chakra text-lg font-bold text-white">
                  {selectedEgg.crestName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-pixel">
                  {selectedEgg.tamerName}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-md">
                {selectedEgg.description}
              </p>
            </div>
          </div>

          {/* Nickname input & Hatch Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-48">
              <label className="block text-[10px] font-pixel text-slate-400 mb-1">
                DIGIMON NICKNAME:
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-chakra focus:outline-none focus:border-amber-400"
                placeholder="Name..."
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isHatching}
              onClick={handleConfirmHatch}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-pixel text-xs px-6 py-3.5 rounded-xl font-bold tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isHatching ? 'HATCHING...' : 'HATCH DIGI-EGG!'}</span>
            </motion.button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
