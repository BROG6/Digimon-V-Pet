import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DIGI_EGGS, DIGIMON_DATABASE } from '../data/digidex';
import { DigiEggInfo } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { sound } from '../utils/audio';
import { Sparkles, Check, Shield, X } from 'lucide-react';

interface EggSelectionModalProps {
  isOpen: boolean;
  currentPlayerName?: string;
  onClose?: () => void;
  onSelectEgg: (egg: DigiEggInfo, nickname: string, playerName: string) => void;
}

export const EggSelectionModal: React.FC<EggSelectionModalProps> = ({
  isOpen,
  currentPlayerName = '',
  onClose,
  onSelectEgg,
}) => {
  const [selectedEgg, setSelectedEgg] = useState<DigiEggInfo>(DIGI_EGGS[0]);
  const [nickname, setNickname] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>(currentPlayerName);

  useEffect(() => {
    if (isOpen) {
      setPlayerName(currentPlayerName);
      setNickname('');
    }
  }, [isOpen, currentPlayerName]);

  if (!isOpen) return null;

  const handleEggClick = (egg: DigiEggInfo) => {
    sound.playButton();
    setSelectedEgg(egg);
  };

  const handleConfirmHatch = () => {
    sound.playButton();
    onSelectEgg(selectedEgg, nickname.trim(), playerName.trim());
  };

  const previewBranches = [
    { label: 'VAC', id: selectedEgg.rookiePreviewIds.vaccine, badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
    { label: 'DATA', id: selectedEgg.rookiePreviewIds.data, badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { label: 'VIR', id: selectedEgg.rookiePreviewIds.virus, badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { label: 'CORR', id: selectedEgg.rookiePreviewIds.corrupted, badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  ];

  return (
    <div
      onClick={() => {
        if (onClose) {
          sound.playButton();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md android-safe-modal"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-cyan-950/80 flex flex-col max-h-[92vh] overflow-y-auto"
      >
        {onClose && (
          <button
            type="button"
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            aria-label="Close egg selection menu"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-4 px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-cyan-300 text-xs font-pixel mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>DIGIMON UP • 15-EGG MATRIX NURSERY</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold font-chakra text-white tracking-wide">
            CHOOSE ONE OF 15 DESTINED DIGI-EGGS
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl mx-auto">
            Your Digi-Egg incubates on the Digivice screen for 1 minute before hatching, then follows Pendulum Ver. 20th timings across 4 Raise Archetypes!
          </p>
        </div>

        {/* 15 Digi-Eggs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 mb-5">
          {DIGI_EGGS.map((egg) => {
            const isSelected = selectedEgg.id === egg.id;
            return (
              <motion.div
                key={egg.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEggClick(egg)}
                className={`cursor-pointer rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center justify-between text-center ${
                  isSelected
                    ? 'bg-slate-800/95 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Egg Number & Archetype Header */}
                <div
                  className="w-full text-[9px] font-pixel py-0.5 rounded-full mb-1 font-bold truncate px-1.5 text-slate-950"
                  style={{ backgroundColor: egg.crestColor }}
                >
                  #{String(egg.eggNumber).padStart(2, '0')} {egg.archetypeTitle}
                </div>

                {/* Animated Egg Sprite */}
                <div className="my-1 h-20 flex items-center justify-center">
                  <DigimonSprite egg={egg} scale={0.6} />
                </div>

                {/* Baby Line & Armor Tag */}
                <div className="w-full space-y-0.5">
                  <div className="font-chakra font-bold text-xs text-white truncate">
                    {egg.crestName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {egg.tamerName}
                  </div>
                  {egg.armorOption && (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[8px] font-pixel text-amber-300 mt-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      <span>ARMOR READY</span>
                    </div>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-1 text-amber-400 flex items-center gap-1 text-[9px] font-pixel">
                    <Check className="w-3 h-3" />
                    <span>SELECTED</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Selected Egg Detail & 4-Way Rookie Matrix Preview */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 flex items-center justify-center shrink-0">
                <DigimonSprite egg={selectedEgg} scale={0.78} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[10px] font-pixel px-2 py-0.5 rounded-full text-slate-950 font-bold"
                    style={{ backgroundColor: selectedEgg.crestColor }}
                  >
                    EGG {String(selectedEgg.eggNumber).padStart(2, '0')}
                  </span>
                  <span className="font-chakra text-lg font-bold text-white">
                    {selectedEgg.crestName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-pixel">
                    {selectedEgg.tamerName}
                  </span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                  {selectedEgg.description}
                </p>
                {selectedEgg.armorOption && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-pixel">
                    <Shield className="w-3 h-3" />
                    <span>
                      ARMOR OPTION: {DIGIMON_DATABASE[selectedEgg.armorOption.speciesId]?.name || selectedEgg.armorOption.speciesId} ({selectedEgg.armorOption.itemLabel})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Your Name, Nickname input & Hatch Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 w-full md:w-auto shrink-0">
              <div className="w-full sm:w-40">
                <label className="block text-[10px] font-pixel text-cyan-300 mb-1">
                  YOUR NAME:
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-2 text-sm text-white font-chakra focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                  placeholder="Your name..."
                />
              </div>

              <div className="w-full sm:w-44">
                <label className="block text-[10px] font-pixel text-slate-400 mb-1">
                  NICKNAME (OPTIONAL):
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={14}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-chakra focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                  placeholder={`Default (${DIGIMON_DATABASE[selectedEgg.baby1Id]?.name || selectedEgg.partnerRookie})`}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleConfirmHatch}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-pixel text-xs px-5 py-2.5 sm:py-3 rounded-xl font-bold tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>SELECT DIGI-EGG!</span>
              </motion.button>
            </div>
          </div>

          {/* 4-Way Child (Rookie) Branching Preview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80">
            {previewBranches.map((b) => {
              const sp = DIGIMON_DATABASE[b.id];
              return (
                <div
                  key={`${b.label}-${b.id}`}
                  className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5"
                >
                  <div className="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden">
                    {sp && <DigimonSprite species={sp} scale={0.5} />}
                  </div>
                  <div className="min-w-0">
                    <span className={`inline-block px-1.5 py-0.5 rounded border font-pixel text-[8px] ${b.badge}`}>
                      {b.label}
                    </span>
                    <div className="font-chakra font-bold text-xs text-white truncate mt-0.5">
                      {sp?.name || b.id}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
