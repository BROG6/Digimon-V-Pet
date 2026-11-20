import React, { useMemo, useState, useEffect } from 'react';
import { CrestType, DigimonSpecies, DigimonStage, PetState } from '../types/digimon';
import { DIGI_EGGS, DIGIMON_DATABASE, EGG_LINE_MATRIX } from '../data/digidex';
import { loadUnlockedSpeciesIds } from '../utils/evolutionEngine';
import { DigimonSprite } from './DigimonSprite';
import { BookOpen, X, Search, Shield, Lock } from 'lucide-react';

interface DigidexModalProps {
  currentCrest: CrestType;
  currentEggId?: string;
  currentSpeciesId?: string;
  pet?: PetState;
  isOpen: boolean;
  onClose: () => void;
}

const ARCHETYPE_COLUMNS = [
  {
    key: 'vaccine' as const,
    label: 'VACCINE / HOLY',
    short: 'VAC',
    headerCls: 'text-sky-300 border-sky-500/40 bg-sky-950/50',
    lineCls: 'bg-sky-500/45',
  },
  {
    key: 'data' as const,
    label: 'DATA / TECH',
    short: 'DATA',
    headerCls: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/50',
    lineCls: 'bg-emerald-500/45',
  },
  {
    key: 'virus' as const,
    label: 'VIRUS / BRAWLER',
    short: 'VIR',
    headerCls: 'text-rose-300 border-rose-500/40 bg-rose-950/50',
    lineCls: 'bg-rose-500/45',
  },
  {
    key: 'corrupted' as const,
    label: 'CORRUPTED / MUTANT',
    short: 'CORR',
    headerCls: 'text-purple-300 border-purple-500/40 bg-purple-950/50',
    lineCls: 'bg-purple-500/45',
  },
];

const TREE_STAGE_ROWS = [
  { key: 'rookie' as const, label: 'ROOKIE · 12H' },
  { key: 'champion' as const, label: 'CHAMPION · 24H' },
  { key: 'ultimate' as const, label: 'ULTIMATE · 40H' },
  { key: 'mega' as const, label: 'MEGA · 48H' },
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
  const [unlockFilter, setUnlockFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    if (isOpen) {
      setSelectedEggId(defaultEgg.id);
    }
  }, [isOpen, defaultEgg.id]);

  const unlockedSet = useMemo(() => {
    const seed = [
      ...(pet?.unlockedSpeciesIds || []),
      ...(pet?.stage && pet.stage !== 'egg' && currentSpeciesId ? [currentSpeciesId] : []),
    ];
    return new Set(loadUnlockedSpeciesIds(seed));
  }, [pet?.unlockedSpeciesIds, pet?.stage, currentSpeciesId, isOpen]);

  const allSpecies = useMemo(() => {
    return Object.values(DIGIMON_DATABASE).sort((a, b) => {
      const stageDiff = (STAGE_ORDER[a.stage] || 0) - (STAGE_ORDER[b.stage] || 0);
      if (stageDiff !== 0) return stageDiff;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const totalUnlockedCount = useMemo(() => {
    return allSpecies.filter((sp) => unlockedSet.has(sp.id)).length;
  }, [allSpecies, unlockedSet]);

  const filteredRoster = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allSpecies.filter((sp) => {
      const isUnlocked = unlockedSet.has(sp.id);
      if (unlockFilter === 'unlocked' && !isUnlocked) return false;
      if (unlockFilter === 'locked' && isUnlocked) return false;
      if (stageFilter !== 'all' && sp.stage !== stageFilter) return false;
      if (!q) return true;
      // Never leak locked Digimon names via search
      if (!isUnlocked) {
        return q === '?' || q === '???' || q === 'locked' || sp.stage.toLowerCase().includes(q);
      }
      return (
        sp.name.toLowerCase().includes(q) ||
        sp.id.toLowerCase().includes(q) ||
        sp.type.toLowerCase().includes(q) ||
        sp.attribute.toLowerCase().includes(q)
      );
    });
  }, [allSpecies, searchQuery, stageFilter, unlockFilter, unlockedSet]);

  if (!isOpen) return null;

  const selectedEgg = DIGI_EGGS.find((e) => e.id === selectedEggId) || DIGI_EGGS[0];
  const matrix = EGG_LINE_MATRIX[selectedEgg.id];

  const eggUniqueIds = (() => {
    if (!matrix) return [] as string[];
    const ids = new Set<string>([
      matrix.baby1,
      matrix.baby2,
      matrix.rookie.vaccine,
      matrix.rookie.data,
      matrix.rookie.virus,
      matrix.rookie.corrupted,
      matrix.champion.vaccine,
      matrix.champion.data,
      matrix.champion.virus,
      matrix.champion.corrupted,
      matrix.ultimate.vaccine,
      matrix.ultimate.data,
      matrix.ultimate.virus,
      matrix.ultimate.corrupted,
      matrix.mega.vaccine,
      matrix.mega.data,
      matrix.mega.virus,
      matrix.mega.corrupted,
    ]);
    if (matrix.champion.corruptedAlt) ids.add(matrix.champion.corruptedAlt);
    if (matrix.ultimate.corruptedAlt) ids.add(matrix.ultimate.corruptedAlt);
    if (matrix.mega.corruptedAlt) ids.add(matrix.mega.corruptedAlt);
    if (matrix.champion.armor?.speciesId) ids.add(matrix.champion.armor.speciesId);
    return Array.from(ids).filter((id) => Boolean(DIGIMON_DATABASE[id]));
  })();

  const eggUnlockedCount = eggUniqueIds.filter((id) => unlockedSet.has(id)).length;

  const renderTreeNode = (speciesId: string, tag?: string, badgeClass?: string) => {
    const sp = DIGIMON_DATABASE[speciesId];
    if (!sp) return null;

    const isUnlocked = unlockedSet.has(sp.id);
    const isCurrent = !pet?.isDead && pet?.stage !== 'egg' && currentSpeciesId === sp.id;

    if (!isUnlocked) {
      return (
        <div
          key={`${tag || 'node'}-${sp.id}`}
          className="relative p-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/95 flex flex-col items-center text-center select-none"
        >
          {tag && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-pixel border border-slate-800 bg-slate-900/90 text-slate-500 mb-1">
              {tag}
            </span>
          )}
          <div className="h-14 w-14 rounded-lg bg-slate-900/70 border border-slate-800/80 border-dashed flex flex-col items-center justify-center gap-0.5">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-pixel text-[10px] text-slate-600">???</span>
          </div>
          <div className="font-chakra font-bold text-xs text-slate-600 mt-1">
            ???
          </div>
          <div className="font-pixel text-[8px] text-slate-600 uppercase">
            BLANK • LOCKED
          </div>
        </div>
      );
    }

    return (
      <div
        key={`${tag || 'node'}-${sp.id}`}
        className={`relative p-2 rounded-xl border transition-all flex flex-col items-center text-center ${
          isCurrent
            ? 'bg-emerald-950/70 border-emerald-400 ring-1 ring-emerald-400/50'
            : 'bg-slate-950/85 border-slate-700/80'
        }`}
        title={`${sp.name} (${sp.stage}) — ${sp.signatureMove.name}`}
      >
        {tag && (
          <span
            className={`px-1.5 py-0.5 rounded text-[8px] font-pixel border mb-1 ${
              badgeClass || 'text-slate-300 border-slate-700 bg-slate-900'
            }`}
          >
            {tag}
          </span>
        )}
        {isCurrent && (
          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-pixel text-[7px] font-bold">
            YOU
          </span>
        )}
        <div className="h-14 flex items-center justify-center">
          <DigimonSprite species={sp} scale={0.52} />
        </div>
        <div className="font-chakra font-bold text-xs text-white truncate max-w-full mt-1">
          {sp.name}
        </div>
        <div className="font-pixel text-[8px] text-slate-400 tabular-nums">
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
                DIGIDEX EVOLUTION TREE
              </h3>
              <p className="text-slate-400 text-xs tabular-nums">
                15-Egg Matrix · {totalUnlockedCount} / {allSpecies.length} Digimon Unlocked by Evolution
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
              EVO TREE
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] cursor-pointer transition-colors tabular-nums ${
                activeTab === 'roster'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ALL {allSpecies.length} ({totalUnlockedCount})
            </button>
            <button
              onClick={onClose}
              aria-label="Close Digidex"
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: 15-EGG EVOLUTION TREE */}
        {activeTab === 'matrix' && matrix && (
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            {/* 15 Egg Switcher */}
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

            {/* Selected Egg Header Summary */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-pixel text-slate-950 font-bold"
                    style={{ backgroundColor: selectedEgg.crestColor }}
                  >
                    EGG {String(selectedEgg.eggNumber).padStart(2, '0')}
                  </span>
                  <h4 className="font-chakra font-bold text-white text-base">
                    {selectedEgg.crestName} Tree
                  </h4>
                  <span className="text-xs font-pixel text-cyan-300 tabular-nums">
                    {eggUnlockedCount} / {eggUniqueIds.length} UNLOCKED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedEgg.description} — Evolve into forms during raising to reveal blanked-out entries.
                </p>
              </div>
              {matrix.champion.armor && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/35 text-[10px] font-pixel text-amber-300 shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Armor Relic: {selectedEgg.armorOption?.itemLabel}</span>
                </div>
              )}
            </div>

            {/* Visual Evolution Tree Canvas */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[560px] p-4 rounded-2xl bg-slate-950/75 border border-slate-800 flex flex-col items-center">
                {/* Trunk: Digitama -> Baby I -> Baby II */}
                <div className="flex flex-col items-center">
                  <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-2.5">
                    <div className="w-9 h-9 flex items-center justify-center shrink-0">
                      <DigimonSprite egg={selectedEgg} scale={0.4} />
                    </div>
                    <div className="text-left">
                      <div className="font-pixel text-[8px] text-cyan-300">DIGITAMA · 1M</div>
                      <div className="font-chakra font-bold text-xs text-white">
                        {selectedEgg.crestName}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  <div className="w-0.5 h-4 bg-slate-600" />

                  {/* Baby I */}
                  <div className="w-36">{renderTreeNode(matrix.baby1, 'BABY I · 10M')}</div>

                  {/* Connector Line */}
                  <div className="w-0.5 h-4 bg-slate-600" />

                  {/* Baby II */}
                  <div className="w-36">{renderTreeNode(matrix.baby2, 'BABY II · 12H')}</div>

                  {/* Trunk Split down to 4 Archetype Branches */}
                  <div className="w-0.5 h-5 bg-slate-600" />
                </div>

                {/* 4-Way Horizontal Branch Rail */}
                <div className="w-full px-[12.5%]">
                  <div className="h-0.5 w-full bg-slate-600" />
                </div>

                {/* 4 Parallel Evolution Columns */}
                <div className="w-full grid grid-cols-4 gap-3">
                  {ARCHETYPE_COLUMNS.map((col) => (
                    <div key={col.key} className="flex flex-col items-center">
                      {/* Vertical stem from horizontal rail */}
                      <div className={`w-0.5 h-4 ${col.lineCls}`} />

                      {/* Branch Header */}
                      <div
                        className={`w-full py-1 px-2 rounded-lg border text-center font-pixel text-[8px] truncate ${col.headerCls}`}
                      >
                        {col.label}
                      </div>

                      {/* Stage Nodes descending down this branch */}
                      {TREE_STAGE_ROWS.map((stageRow) => {
                        const stageData = matrix[stageRow.key];
                        const primaryId = stageData[col.key];
                        const altId = col.key === 'corrupted' ? stageData.corruptedAlt : undefined;

                        return (
                          <div key={`${col.key}-${stageRow.key}`} className="w-full flex flex-col items-center">
                            <div className={`w-0.5 h-4 ${col.lineCls}`} />
                            <div className="w-full space-y-1.5">
                              {renderTreeNode(primaryId, `${col.short} · ${stageRow.label}`, col.headerCls)}
                              {altId &&
                                renderTreeNode(
                                  altId,
                                  `${col.short} ALT · ${stageRow.label}`,
                                  col.headerCls
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Optional Armor Evolution Side Branch */}
                {matrix.champion.armor && (
                  <div className="w-full mt-5 pt-4 border-t border-slate-800/80 flex flex-col items-center">
                    <div className="text-[10px] font-pixel text-amber-300 mb-2 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>ARMOR EVOLUTION BRANCH ({selectedEgg.armorOption?.itemLabel || 'RELIC'})</span>
                    </div>
                    <div className="w-44">
                      {renderTreeNode(
                        matrix.champion.armor.speciesId,
                        `ARMOR (${selectedEgg.armorOption?.itemLabel || 'RELIC'})`,
                        'text-amber-300 border-amber-500/50 bg-amber-950/60'
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL DIGIMON ROSTER */}
        {activeTab === 'roster' && (
          <div className="flex-1 flex flex-col overflow-hidden py-3 space-y-3">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search unlocked Digimon by name, type, attribute..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-chakra focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {(['all', 'unlocked', 'locked'] as const).map((uf) => (
                  <button
                    key={uf}
                    onClick={() => setUnlockFilter(uf)}
                    className={`px-2.5 py-1.5 rounded-lg font-pixel text-[9px] uppercase cursor-pointer ${
                      unlockFilter === uf
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {uf}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 shrink-0">
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

            {/* Species Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pr-1">
              {filteredRoster.map((mon: DigimonSpecies) => {
                const isUnlocked = unlockedSet.has(mon.id);
                const isActive = !pet?.isDead && pet?.stage !== 'egg' && currentSpeciesId === mon.id;

                if (!isUnlocked) {
                  return (
                    <div
                      key={mon.id}
                      className="p-3 rounded-2xl border border-dashed border-slate-800 bg-slate-950/95 flex items-center justify-between gap-3 select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-16 h-16 flex flex-col items-center justify-center bg-slate-900/70 rounded-xl border border-dashed border-slate-800 shrink-0">
                          <Lock className="w-4 h-4 text-slate-600 mb-0.5" />
                          <span className="font-pixel text-[10px] text-slate-600">???</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-chakra font-bold text-slate-500 text-sm">
                            ???
                          </div>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 font-pixel text-[8px] uppercase">
                              {mon.stage}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-600 font-pixel text-[8px]">
                              LOCKED
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 truncate mt-1">
                            Evolve into this Digimon to unlock
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

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

                    {isActive && (
                      <span className="px-2.5 py-1.5 rounded-lg font-pixel text-[9px] shrink-0 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                        ACTIVE
                      </span>
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
