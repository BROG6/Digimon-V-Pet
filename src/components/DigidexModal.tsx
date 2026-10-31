import React from 'react';
import { motion } from 'motion/react';
import { DigimonSpecies, CrestType } from '../types/digimon';
import { DIGIMON_DATABASE } from '../data/digidex';
import { DigimonSprite } from './DigimonSprite';
import { BookOpen, X, ChevronRight, Zap, Shield, Flame } from 'lucide-react';

interface DigidexModalProps {
  currentCrest: CrestType;
  currentSpeciesId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecies?: (speciesId: string) => void;
}

export const DigidexModal: React.FC<DigidexModalProps> = ({
  currentCrest,
  currentSpeciesId,
  isOpen,
  onClose,
  onSelectSpecies,
}) => {
  if (!isOpen) return null;

  // Filter digimon belonging to current crest lineage
  const lineage = Object.values(DIGIMON_DATABASE).filter(
    (d) => d.crest === currentCrest
  );

  // Sort by stage order
  const stageOrder: Record<string, number> = {
    'fresh': 1,
    'in-training': 2,
    'rookie': 3,
    'champion': 4,
    'ultimate': 5,
    'mega': 6,
  };

  const sortedLineage = [...lineage].sort(
    (a, b) => (stageOrder[a.stage] || 0) - (stageOrder[b.stage] || 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-chakra font-bold text-white text-lg">
                DIGIDEX ENCYCLOPEDIA & EVOLUTION TREE
              </h3>
              <p className="text-slate-400 text-xs">Lineage of {currentCrest.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evolution Pathway Line */}
        <div className="py-4 space-y-4">
          <div className="text-xs font-pixel text-slate-400">EVOLUTION LINEAGE OVERVIEW:</div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sortedLineage.map((mon, idx) => (
              <React.Fragment key={mon.id}>
                <div className="flex flex-col items-center p-2 rounded-xl bg-slate-950/80 border border-slate-800 min-w-[90px] text-center">
                  <div className="h-16 flex items-center justify-center">
                    <DigimonSprite species={mon} scale={0.65} />
                  </div>
                  <span className="font-chakra font-bold text-white text-xs mt-1 truncate max-w-[85px]">
                    {mon.name}
                  </span>
                  <span className="font-pixel text-[8px] text-cyan-400 uppercase">
                    {mon.stage}
                  </span>
                </div>
                {idx < sortedLineage.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Detailed Cards */}
          <div className="space-y-3 mt-4">
            {sortedLineage.map((mon) => (
              <div
                key={mon.id}
                className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800">
                    <DigimonSprite species={mon} scale={0.8} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-chakra font-bold text-white text-base">
                        {mon.name} ({mon.japaneseName})
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-pixel text-[9px]">
                        {mon.stage.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-pixel text-[9px]">
                        {mon.attribute}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 max-w-md">
                      {mon.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-pixel text-slate-400">
                      <span>HP: {mon.baseHp}</span>
                      <span>ATK: {mon.baseAtk}</span>
                      <span>DEF: {mon.baseDef}</span>
                      <span>SPD: {mon.baseSpd}</span>
                    </div>
                  </div>
                </div>

                {/* Signature Move Box */}
                <div className="sm:self-stretch bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-center min-w-[200px] text-right sm:text-left">
                  <div className="flex items-center gap-1.5 text-rose-400 font-pixel text-[10px] font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{mon.signatureMove.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-chakra mt-0.5">
                    {mon.signatureMove.description}
                  </div>
                  <div className="text-[9px] font-pixel text-amber-300 mt-1">
                    POWER: {mon.signatureMove.power}
                  </div>
                  {onSelectSpecies && (
                    <button
                      onClick={() => {
                        onSelectSpecies(mon.id);
                        onClose();
                      }}
                      className={`mt-2.5 px-3 py-1.5 rounded-lg font-pixel text-[10px] transition-all ${
                        currentSpeciesId === mon.id
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 cursor-default'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {currentSpeciesId === mon.id ? '✓ ACTIVE PARTNER' : 'SWITCH TO THIS DIGIMON'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
