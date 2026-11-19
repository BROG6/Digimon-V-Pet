import React, { useMemo, useState, useEffect } from 'react';
import { CrestType, DigimonSpecies, DigimonStage, PetState } from '../types/digimon';
import { DIGI_EGGS, DIGIMON_DATABASE, EGG_LINE_MATRIX } from '../data/digidex';
import { checkEvolutionEligibility } from '../utils/evolutionEngine';
import { DigimonSprite } from './DigimonSprite';
import { BookOpen, X, Search, Sparkles, Shield, ChevronRight } from 'lucide-react';

interface DigidexModalProps {
  currentCrest: CrestType;
  currentEggId?: string;
  currentSpeciesId?: string;
  pet?: PetState;
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecies?: (speciesId: string) => void;
}

const ARCHETYPE_BADGES = [
  { key: 'vaccine' as const, label: 'VACCINE / HOLY', short: 'VAC', color: 'text-sky-300 border-sky-500/40 bg-sky-950/50' },
  { key: 'data' as const, label: 'DATA / TECH', short: 'DATA', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/50' },
  { key: 'virus' as const, label: 'VIRUS / BRAWLER', short: 'VIR', color: 'text-rose-300 border-rose-500/40 bg-rose-950/50' },
  { key: 'corrupted' as const, label: 'CORRUPTED / MUTANT', short: 'CORR', color: 'text-purple-300 border-purple-500/40 bg-purple-950/50' },
];

const STAGE_ORDER: Record<DigimonStage, number> = {
  egg: 0,
  fresh: 1,
  'in-training': 2,
  rookie: 3,
  champion: 4,
  ultimate: 5,
  mega: 6,
};

export const DigidexModal: React.FC<DigidexModalProps> = ({
  currentCrest,
  currentEggId,
  currentSpeciesId,
  pet,
  isOpen,
  onClose,
  onSelectSpecies,
}) => {
  const defaultEgg = useMemo(() => {
    return (
      DIGI_EGGS.find((e) => e.id === currentEggId) ||
      DIGI_EGGS.find((e) => e.crest === currentCrest) ||
      DIGI_EGGS[0]
    );
  }, [currentEggId, currentCrest]);

  const [selectedEggId, setSelectedEggId] = useState<string>(defaultEgg.id);
  const [activeTab, setActiveTab] = useState<'matrix' | 'roster'>('matrix');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<'all' | DigimonStage>('all');

  useEffect(() => {
    if (isOpen) {
      setSelectedEggId(defaultEgg.id);
    }
  }, [isOpen, defaultEgg.id]);

  const allSpecies = useMemo(() => {
    return Object.values(DIGIMON_DATABASE).sort((a, b) => {
      const stageDiff = (STAGE_ORDER[a.stage] || 0) - (STAGE_ORDER[b.stage] || 0);
      if (stageDiff !== 0) return stageDiff;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const filteredRoster = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allSpecies.filter((sp) => {
      if (stageFilter !== 'all' && sp.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        sp.name.toLowerCase().includes(q) ||
        sp.id.toLowerCase().includes(q) ||
        sp.type.toLowerCase().includes(q) ||
        sp.attribute.toLowerCase().includes(q)
      );
    });
  }, [allSpecies, searchQuery, stageFilter]);

  if (!isOpen) return null;

  const selectedEgg = DIGI_EGGS.find((e) => e.id === selectedEggId) || DIGI_EGGS[0];
  const matrix = EGG_LINE_MATRIX[selectedEgg.id];
  const activeSpeciesObj = currentSpeciesId ? DIGIMON_DATABASE[currentSpeciesId] : undefined;
  const evoElig = pet ? checkEvolutionEligibility(pet, activeSpeciesObj) : null;

  const renderMatrixNode = (speciesId: string, tag?: string, badgeClass?: string) => {
    const sp = DIGIMON_DATABASE[speciesId];
    if (!sp) return null;
    const isCurrent = currentSpeciesId === sp.id;
    const isPredictedNext = selectedEgg.id === pet?.eggId && evoElig?.nextId === sp.id;

    return (
      <div
        key={`${tag || 'node'}-${sp.id}`}
        onClick={() => {
          if (onSelectSpecies) {
            onSelectSpecies(sp.id);
            onClose();
          }
        }}
        className={`relative p-2 rounded-xl border transition-all flex flex-col items-center text-center cursor-pointer hover:scale-[1.03] ${
          isCurrent
            ? 'bg-emerald-950/70 border-emerald-400 ring-1 ring-emerald-400/50'
            : isPredictedNext
            ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400/40'
            : 'bg-slate-950/85 border-slate-800 hover:border-cyan-500/60'
        }`}
        title={onSelectSpecies ? `Click to switch to ${sp.name}` : sp.name}
      >
        {tag && (
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-pixel border mb-1 ${badgeClass || 'text-slate-300 border-slate-700 bg-slate-900'}`}>
            {tag}
          </span>
        )}
        {isCurrent && (
          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-pixel text-[7px] font-bold">
            YOU
          </span>
        )}
        {!isCurrent && isPredictedNext && (
          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-pixel text-[7px] font-bold">
            NEXT
          </span>
        )}
        <div className="h-14 flex items-center justify-center">
          <DigimonSprite species={sp} scale={0.55} />
        </div>
        <div className="font-chakra font-bold text-xs text-white truncate max-w-full mt-1">
          {sp.name}
        </div>
        <div className="font-pixel text-[8px] text-slate-400">
          {sp.attribute} • {sp.signatureMove.power}P
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <h3 className="font-chakra font-bold text-white text-base sm:text-lg">
                DIGIDEX 251+ MATRIX ENCYCLOPEDIA
              </h3>
              <p className="text-slate-400 text-xs">
                15 Starting Eggs • 4-Way Archetype Web • {allSpecies.length} Playable Digimon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] cursor-pointer transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              15-EGG MATRIX
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] cursor-pointer transition-colors ${
                activeTab === 'roster'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ALL {allSpecies.length} DIGIMON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: 15-EGG 4-WAY EVOLUTION MATRIX */}
        {activeTab === 'matrix' && matrix && (
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            {/* 15 Egg Pill Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {DIGI_EGGS.map((egg) => {
                const isSel = egg.id === selectedEgg.id;
                const isMine = egg.id === pet?.eggId;
                return (
                  <button
                    key={egg.id}
                    onClick={() => setSelectedEggId(egg.id)}
                    className={`shrink-0 px-2.5 py-1.5 rounded-xl font-pixel text-[9px] border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSel
                        ? 'bg-slate-800 text-white border-amber-400 ring-1 ring-amber-400/40'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: egg.crestColor }}
                    />
                    <span>
                      #{String(egg.eggNumber).padStart(2, '0')} {egg.crestName}
                    </span>
                    {isMine && <span className="text-emerald-400">★</span>}
                  </button>
                );
              })}
            </div>

            {/* Selected Egg Banner + Baby I -> Baby II */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-pixel text-slate-950 font-bold"
                    style={{ backgroundColor: selectedEgg.crestColor }}
                  >
                    EGG {String(selectedEgg.eggNumber).padStart(2, '0')}
                  </span>
                  <h4 className="font-chakra font-bold text-white text-base">
                    {selectedEgg.crestName}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedEgg.description}</p>
                {matrix.champion.armor && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-pixel text-amber-300">
                    <Shield className="w-3.5 h-3.5" />
                    <span>
                      Armor Relic: {selectedEgg.armorOption?.itemLabel} → {DIGIMON_DATABASE[matrix.champion.armor.speciesId]?.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-28">{renderMatrixNode(matrix.baby1, 'BABY I')}</div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                <div className="w-28">{renderMatrixNode(matrix.baby2, 'BABY II')}</div>
              </div>
            </div>

            {/* Predicted Archetype Status */}
            {evoElig && selectedEgg.id === pet?.eggId && (
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-pixel text-[10px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CURRENT FORECAST: {evoElig.archetype.toUpperCase()} → {evoElig.nextId ? DIGIMON_DATABASE[evoElig.nextId]?.name : 'MAX'}</span>
                </div>
                <span className="text-slate-300 text-xs font-chakra">{evoElig.reason}</span>
              </div>
            )}

            {/* 4-Way Branching Matrix Grid */}
            <div className="space-y-3">
              {(
                [
                  { label: 'CHILD (ROOKIE)', stageData: matrix.rookie },
                  { label: 'ADULT (CHAMPION)', stageData: matrix.champion },
                  { label: 'PERFECT (ULTIMATE)', stageData: matrix.ultimate },
                  { label: 'ULTIMATE (MEGA)', stageData: matrix.mega },
                ] as const
              ).map((row) => (
                <div key={row.label} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[10px] text-cyan-300">{row.label}</span>
                    <span className="text-[10px] text-slate-500 font-chakra">Tap any Digimon to switch directly</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ARCHETYPE_BADGES.map((arch) => {
                      const primaryId = row.stageData[arch.key];
                      const altId = arch.key === 'corrupted' ? row.stageData.corruptedAlt : undefined;
                      return (
                        <div key={arch.key} className="space-y-1.5">
                          {renderMatrixNode(primaryId, arch.short, arch.color)}
                          {altId && renderMatrixNode(altId, `${arch.short} ALT`, arch.color)}
                        </div>
                      );
                    })}
                  </div>
                  {row.stageData.armor && (
                    <div className="pt-2 border-t border-slate-800/70">
                      <div className="max-w-xs">
                        {renderMatrixNode(
                          row.stageData.armor.speciesId,
                          `ARMOR (${selectedEgg.armorOption?.itemLabel || 'RELIC'})`,
                          'text-amber-300 border-amber-500/50 bg-amber-950/60'
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FULL 251+ DIGIMON ROSTER */}
        {activeTab === 'roster' && (
          <div className="flex-1 flex flex-col overflow-hidden py-3 space-y-3">
            {/* Search & Stage Filter */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all 263 Digimon by name, type, attribute..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-chakra focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'fresh', 'in-training', 'rookie', 'champion', 'ultimate', 'mega'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStageFilter(st)}
                    className={`px-2.5 py-1.5 rounded-lg font-pixel text-[9px] uppercase shrink-0 cursor-pointer ${
                      stageFilter === st
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Species Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pr-1">
              {filteredRoster.map((mon: DigimonSpecies) => {
                const isActive = currentSpeciesId === mon.id;
                return (
                  <div
                    key={mon.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-emerald-950/30 border-emerald-500/60'
                        : 'bg-slate-950/85 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 shrink-0 overflow-hidden">
                        <DigimonSprite species={mon} scale={0.65} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-chakra font-bold text-white text-sm truncate">
                          {mon.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-pixel text-[8px] uppercase">
                            {mon.stage}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-pixel text-[8px]">
                            {mon.attribute}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-1">
                          {mon.signatureMove.name} ({mon.signatureMove.power})
                        </div>
                      </div>
                    </div>

                    {onSelectSpecies && (
                      <button
                        onClick={() => {
                          onSelectSpecies(mon.id);
                          onClose();
                        }}
                        className={`px-2.5 py-1.5 rounded-lg font-pixel text-[9px] shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : 'SELECT'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
