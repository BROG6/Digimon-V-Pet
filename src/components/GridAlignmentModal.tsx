import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, RotateCcw, Check, Minus, Plus, X, Smartphone, Crosshair } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { PetState, DigimonSpecies } from '../types/digimon';
import { sound } from '../utils/audio';
import {
  GridLayoutPresetId,
  GRID_LAYOUT_PRESETS,
  getSavedGridPreset,
  setSavedGridPreset,
  getDefaultGridRowRatios,
  getGridRowRatios,
  setSavedCustomRowRatios,
  resetCustomRowRatios,
  hasCustomRowRatios,
} from '../utils/petOverlayEngine';
import { isNativeOverlayActive, startNativeFloatingOverlay } from '../utils/nativeOverlay';
import { buildNativeOverlayPayload } from '../utils/evolutionEngine';

interface GridAlignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetState;
  species?: DigimonSpecies;
  onNotify?: (message: string) => void;
}

const PRESET_TABS: { id: GridLayoutPresetId; label: string }[] = [
  { id: 'asus-4row', label: '4-Row + Dock' },
  { id: 'compact-5row', label: '5-Row + Dock' },
  { id: 'dock-only', label: 'Dock Only' },
];

function getRowName(index: number, total: number): string {
  if (index === total - 1) return 'Dock';
  return `Row ${index + 1}`;
}

export const GridAlignmentModal: React.FC<GridAlignmentModalProps> = ({
  isOpen,
  onClose,
  pet,
  species,
  onNotify,
}) => {
  const [presetId, setPresetId] = useState<GridLayoutPresetId>(() => getSavedGridPreset());
  const [ratios, setRatios] = useState<number[]>(() => getGridRowRatios(getSavedGridPreset()));
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [overlayRunning, setOverlayRunning] = useState<boolean>(false);
  const [isCustom, setIsCustom] = useState<boolean>(() => hasCustomRowRatios(getSavedGridPreset()));

  useEffect(() => {
    if (!isOpen) return;
    const activePreset = getSavedGridPreset();
    setPresetId(activePreset);
    setRatios(getGridRowRatios(activePreset));
    setIsCustom(hasCustomRowRatios(activePreset));
    setSelectedRow(0);

    if (Capacitor.isNativePlatform()) {
      isNativeOverlayActive().then(setOverlayRunning).catch(() => setOverlayRunning(false));
    } else {
      setOverlayRunning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const defaults = getDefaultGridRowRatios(presetId);

  const handleSelectPreset = (nextId: GridLayoutPresetId) => {
    sound.playButton();
    setSavedGridPreset(nextId);
    setPresetId(nextId);
    setRatios(getGridRowRatios(nextId));
    setIsCustom(hasCustomRowRatios(nextId));
    setSelectedRow(0);
  };

  const updateRowRatio = (idx: number, nextRatio: number) => {
    const clamped = Math.round(Math.max(0.12, Math.min(0.96, nextRatio)) * 1000) / 1000;
    setRatios((prev) => {
      const next = [...prev];
      next[idx] = clamped;
      setSavedCustomRowRatios(presetId, next);
      setIsCustom(true);
      return next;
    });
    setSelectedRow(idx);
  };

  const pushToNativeOverlay = async (previewIdx?: number) => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const active = await isNativeOverlayActive();
      setOverlayRunning(active);
      if (!active) return false;
      return await startNativeFloatingOverlay(
        buildNativeOverlayPayload({
          pet,
          species,
          presetId,
          previewRowIndex: previewIdx,
        })
      );
    } catch {
      return false;
    }
  };

  const handleNudge = (idx: number, delta: number) => {
    sound.playButton();
    updateRowRatio(idx, (ratios[idx] ?? defaults[idx] ?? 0.5) + delta);
  };

  const handleJumpTest = async (idx: number) => {
    sound.playButton();
    setSelectedRow(idx);
    setSavedCustomRowRatios(presetId, ratios);
    const updated = await pushToNativeOverlay(idx);
    if (updated) {
      onNotify?.(`Snapped overlay pet to ${getRowName(idx, ratios.length)} (${(ratios[idx] * 100).toFixed(1)}%).`);
    }
  };

  const handleResetDefault = async () => {
    sound.playButton();
    resetCustomRowRatios(presetId);
    const freshDefaults = getDefaultGridRowRatios(presetId);
    setRatios(freshDefaults);
    setIsCustom(false);
    await pushToNativeOverlay();
    onNotify?.(`Reset ${GRID_LAYOUT_PRESETS[presetId].label} grid lines to default.`);
  };

  const handleSaveAndClose = async () => {
    sound.playButton();
    setSavedGridPreset(presetId);
    if (isCustom) {
      setSavedCustomRowRatios(presetId, ratios);
    }
    const synced = await pushToNativeOverlay();
    if (synced) {
      onNotify?.('Updated live floating overlay grid lines!');
    } else {
      onNotify?.('Saved custom launcher grid line positions.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-chakra font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <span>GRID LINE ADJUSTMENT</span>
                {isCustom && (
                  <span className="text-[9px] font-pixel px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    CUSTOM
                  </span>
                )}
              </h3>
              <p className="text-slate-400 text-[11px]">
                Fine-tune vertical pet shelf height (% from top of screen)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Tabs */}
        <div className="grid grid-cols-3 gap-1.5 pt-3">
          {PRESET_TABS.map((tab) => {
            const active = presetId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectPreset(tab.id)}
                className={`py-2 px-2 rounded-xl font-pixel text-[9px] border transition-all cursor-pointer ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-950/70 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Body: Visual Screen Guide + Row Sliders */}
        <div className="py-3.5 flex flex-col sm:flex-row gap-3.5 items-stretch">
          {/* Mini Screen Preview */}
          <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2.5 bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:w-36 shrink-0">
            <div className="flex items-center gap-1 text-[9px] font-pixel text-slate-400">
              <Smartphone className="w-3 h-3 text-cyan-400" />
              <span>PREVIEW</span>
            </div>

            <div className="relative w-28 h-52 sm:w-28 sm:h-60 rounded-2xl border-2 border-slate-700 bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden shrink-0">
              {/* Simulated launcher clock widget silhouette */}
              <div className="absolute top-[9%] left-3 right-3 h-2 rounded-full bg-slate-800/80" />
              <div className="absolute top-[16%] left-6 right-6 h-5 rounded-lg bg-slate-800/60" />

              {/* Horizontal Grid Lines */}
              {ratios.map((r, idx) => {
                const isDock = idx === ratios.length - 1;
                const isSelected = selectedRow === idx;
                const pct = (r * 100).toFixed(1);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sound.playButton();
                      setSelectedRow(idx);
                    }}
                    style={{ top: `${r * 100}%` }}
                    className="absolute left-0 right-0 -translate-y-1/2 flex items-center cursor-pointer group"
                    title={`${getRowName(idx, ratios.length)}: ${pct}%`}
                  >
                    <span
                      className={`w-full border-t-2 border-dashed transition-colors ${
                        isSelected
                          ? 'border-amber-400'
                          : isDock
                          ? 'border-emerald-400/75'
                          : 'border-cyan-400/70 group-hover:border-cyan-300'
                      }`}
                    />
                    <span
                      className={`absolute left-1 -top-3.5 px-1 rounded text-[7px] font-pixel leading-tight ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : isDock
                          ? 'bg-emerald-950/90 text-emerald-300'
                          : 'bg-slate-900/90 text-cyan-300'
                      }`}
                    >
                      {isDock ? 'DK' : `R${idx + 1}`}
                    </span>
                    {isSelected && (
                      <span className="absolute right-1.5 -top-2.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-300/40" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-400 text-left sm:text-center leading-snug">
              Higher % moves the pet <strong className="text-cyan-300">down</strong>; lower % moves it <strong className="text-amber-300">up</strong>.
            </div>
          </div>

          {/* Per-Row Controls */}
          <div className="flex-1 space-y-2">
            {ratios.map((ratio, idx) => {
              const def = defaults[idx] ?? ratio;
              const diffPct = Math.round((ratio - def) * 1000) / 10;
              const pctVal = Math.round(ratio * 1000) / 10;
              const isSelected = selectedRow === idx;
              const rowName = getRowName(idx, ratios.length);
              const isDock = idx === ratios.length - 1;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedRow(idx)}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-400/70 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-pixel text-[9px] px-1.5 py-0.5 rounded ${
                          isDock
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {rowName.toUpperCase()}
                      </span>
                      <span className="font-chakra font-bold text-xs text-white tabular-nums">
                        {pctVal.toFixed(1)}%
                      </span>
                      {Math.abs(diffPct) >= 0.1 && (
                        <span className="text-[10px] text-amber-300 font-mono tabular-nums">
                          ({diffPct > 0 ? `+${diffPct.toFixed(1)}` : diffPct.toFixed(1)}%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {overlayRunning && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJumpTest(idx);
                          }}
                          className="px-2 py-1 rounded-lg bg-purple-500/25 hover:bg-purple-500/40 border border-purple-400/40 text-purple-200 font-pixel text-[8px] flex items-center gap-1 cursor-pointer active:scale-95"
                          title={`Move active overlay pet to ${rowName}`}
                        >
                          <Crosshair className="w-2.5 h-2.5" />
                          <span>TEST</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNudge(idx, -0.005);
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer active:scale-90"
                        title="Move line UP 0.5%"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNudge(idx, 0.005);
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer active:scale-90"
                        title="Move line DOWN 0.5%"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={12}
                    max={96}
                    step={0.5}
                    value={pctVal}
                    onChange={(e) => updateRowRatio(idx, parseFloat(e.target.value) / 100)}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-pixel text-[9px] rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEFAULT</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-pixel text-[9px] font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{overlayRunning ? 'APPLY TO OVERLAY' : 'SAVE & DONE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
