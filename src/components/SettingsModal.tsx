import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  Download,
  Moon,
  Settings,
  Smartphone,
  Sparkles,
  Sun,
  Swords,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { ATTACK_ELEMENT_META } from '../data/battleTechniques';
import { AttackElement } from '../types/digimon';
import { sound } from '../utils/audio';
import { battleSoundLibrary } from '../utils/battleSoundLibrary';
import { DayNightPreference } from '../utils/dayNightCycle';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMasterSound: () => void;
  battleSfxEnabled: boolean;
  onToggleBattleSfx: () => void;
  alertsEnabled: boolean;
  onToggleCareAlerts: () => void;
  dayNightPref: DayNightPreference;
  isNightMode: boolean;
  onCycleDayNight: () => void;
  extraTopPad: number;
  onToggleExtraTopPad: () => void;
  onOpenUpdates: () => void;
  hasUpdateAvailable?: boolean;
}

const PREVIEW_ELEMENTS: AttackElement[] = [
  'fire',
  'ice',
  'air',
  'nature',
  'holy',
  'dark',
  'hand',
  'weapon',
  'filth',
  'neutral',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMasterSound,
  battleSfxEnabled,
  onToggleBattleSfx,
  alertsEnabled,
  onToggleCareAlerts,
  dayNightPref,
  isNightMode,
  onCycleDayNight,
  extraTopPad,
  onToggleExtraTopPad,
  onOpenUpdates,
  hasUpdateAvailable = false,
}) => {
  const [previewElement, setPreviewElement] = useState<AttackElement>('fire');

  if (!isOpen) return null;

  const canPreviewBattleSfx = !isMuted && battleSfxEnabled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-800/95 px-5 py-3.5 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-pixel text-xs text-cyan-300 tracking-wide">DIGIVICE SETTINGS</h2>
              <p className="text-[11px] font-chakra text-slate-400">
                Audio library, battle SFX &amp; device preferences
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-700/70 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Audio & Battle Sound Library Section */}
          <section className="rounded-2xl bg-slate-950/75 border border-slate-800 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px] text-cyan-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                AUDIO &amp; BATTLE SOUND LIBRARY
              </span>
              {isMuted && (
                <span className="text-[10px] font-chakra font-bold px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/40 text-rose-300">
                  MASTER MUTED
                </span>
              )}
            </div>

            {/* Master Sound Switch */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-chakra font-bold text-sm text-slate-100">Master Sound</div>
                  <div className="text-[11px] font-chakra text-slate-400">
                    Controls all Digivice chimes, UI buttons &amp; game audio
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!isMuted}
                onClick={onToggleMasterSound}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer ${
                  !isMuted
                    ? 'bg-cyan-500 border-cyan-300'
                    : 'bg-slate-700 border-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    !isMuted ? 'translate-x-5.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Separate Battle Attack SFX Switch */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/90 border border-amber-500/30 px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <Swords
                  className={`w-4 h-4 shrink-0 ${
                    battleSfxEnabled ? 'text-amber-400' : 'text-slate-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="font-chakra font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <span>Battle Attack SFX</span>
                    <span className="text-[9px] font-pixel px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300">
                      {battleSfxEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="text-[11px] font-chakra text-slate-400">
                    Elemental physical &amp; ranged attack sounds in Colosseum &amp; Adventure
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={battleSfxEnabled}
                onClick={onToggleBattleSfx}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer ${
                  battleSfxEnabled
                    ? 'bg-amber-500 border-amber-300'
                    : 'bg-slate-700 border-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    battleSfxEnabled ? 'translate-x-5.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sound Library Preview Tester */}
            <div className="rounded-xl bg-slate-900/70 border border-slate-800/90 p-3 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-chakra">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Elemental SFX Sound Check
                </span>
                <span className="text-slate-400">
                  {ATTACK_ELEMENT_META[previewElement].label}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PREVIEW_ELEMENTS.map((el) => {
                  const meta = ATTACK_ELEMENT_META[el];
                  const selected = previewElement === el;
                  return (
                    <button
                      key={el}
                      type="button"
                      onClick={() => {
                        sound.playButton();
                        setPreviewElement(el);
                      }}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-pixel transition-all cursor-pointer ${
                        selected
                          ? `${meta.badgeClass} ring-1 ring-white/50 scale-[1.03]`
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      {meta.shortLabel}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  disabled={!canPreviewBattleSfx}
                  onClick={() => battleSoundLibrary.playPreview('melee', previewElement)}
                  className={`py-2 px-2.5 rounded-xl border font-chakra font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    canPreviewBattleSfx
                      ? 'bg-orange-950/60 hover:bg-orange-900/70 border-orange-500/50 text-orange-200 cursor-pointer active:scale-95'
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Test Physical</span>
                </button>
                <button
                  type="button"
                  disabled={!canPreviewBattleSfx}
                  onClick={() => battleSoundLibrary.playPreview('ranged', previewElement)}
                  className={`py-2 px-2.5 rounded-xl border font-chakra font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    canPreviewBattleSfx
                      ? 'bg-cyan-950/60 hover:bg-cyan-900/70 border-cyan-500/50 text-cyan-200 cursor-pointer active:scale-95'
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Test Ranged</span>
                </button>
              </div>
              {!canPreviewBattleSfx && (
                <p className="text-[10px] font-chakra text-slate-500 text-center">
                  {isMuted
                    ? 'Enable Master Sound above to preview attack SFX.'
                    : 'Enable Battle Attack SFX above to preview elemental sounds.'}
                </p>
              )}
            </div>
          </section>

          {/* Care & Display Preferences */}
          <section className="rounded-2xl bg-slate-950/75 border border-slate-800 p-3.5 space-y-2.5">
            <span className="font-pixel text-[10px] text-slate-400 block">
              CARE &amp; DISPLAY
            </span>

            {/* Care Alerts */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {alertsEnabled ? (
                  <Bell className="w-4 h-4 text-amber-300 shrink-0" />
                ) : (
                  <BellOff className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-chakra font-bold text-sm text-slate-100">Care Alerts</div>
                  <div className="text-[11px] font-chakra text-slate-400">
                    Hunger, toilet &amp; sleep call notifications
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={alertsEnabled}
                onClick={onToggleCareAlerts}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer ${
                  alertsEnabled
                    ? 'bg-emerald-500 border-emerald-300'
                    : 'bg-slate-700 border-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    alertsEnabled ? 'translate-x-5.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Day / Night Cycle */}
            <button
              type="button"
              onClick={() => {
                sound.playButton();
                onCycleDayNight();
              }}
              className="w-full flex items-center justify-between gap-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 px-3 py-2.5 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {isNightMode ? (
                  <Moon className="w-4 h-4 text-indigo-300 shrink-0" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-300 shrink-0" />
                )}
                <div>
                  <div className="font-chakra font-bold text-sm text-slate-100">Day / Night Cycle</div>
                  <div className="text-[11px] font-chakra text-slate-400">
                    Tap to switch theme schedule
                  </div>
                </div>
              </div>
              <span className="font-pixel text-[9px] px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300">
                {dayNightPref === 'auto'
                  ? `AUTO (${isNightMode ? 'NIGHT' : 'DAY'})`
                  : dayNightPref.toUpperCase()}
              </span>
            </button>

            {/* Android Status Bar Clearance */}
            <button
              type="button"
              onClick={onToggleExtraTopPad}
              className="w-full flex items-center justify-between gap-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 px-3 py-2.5 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="font-chakra font-bold text-sm text-slate-100">Top Safe Padding</div>
                  <div className="text-[11px] font-chakra text-slate-400">
                    Adjust notch / status bar clearance
                  </div>
                </div>
              </div>
              <span className="font-pixel text-[9px] px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sky-300">
                {extraTopPad === 0 ? 'STD' : `+${extraTopPad}PX`}
              </span>
            </button>

            {/* App Updates */}
            <button
              type="button"
              onClick={() => {
                sound.playButton();
                onClose();
                onOpenUpdates();
              }}
              className="w-full flex items-center justify-between gap-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 px-3 py-2.5 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-chakra font-bold text-sm text-slate-100">App Updates</div>
                  <div className="text-[11px] font-chakra text-slate-400">
                    Check version &amp; download APK updates
                  </div>
                </div>
              </div>
              <span
                className={`font-pixel text-[9px] px-2 py-1 rounded-lg border ${
                  hasUpdateAvailable
                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {hasUpdateAvailable ? 'NEW' : 'OPEN'}
              </span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
