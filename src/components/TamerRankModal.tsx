import React from 'react';
import { motion } from 'motion/react';
import { Award, Check, Compass, Home, Lock, ShoppingBag, Swords, X } from 'lucide-react';
import { PetState } from '../types/digimon';
import {
  POINTS_PER_BATTLE_WIN,
  POINTS_PER_ZONE_CLEAR,
  TAMER_RANK_TIERS,
  computeTamerRankProgress,
} from '../utils/tamerRank';
import { sound } from '../utils/audio';

interface TamerRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetState;
  onOpenShop?: () => void;
  onOpenRoom?: () => void;
  onOpenAdventure?: () => void;
}

export const TamerRankModal: React.FC<TamerRankModalProps> = ({
  isOpen,
  onClose,
  pet,
  onOpenShop,
  onOpenRoom,
  onOpenAdventure,
}) => {
  if (!isOpen) return null;

  const progress = computeTamerRankProgress(pet);
  const { currentTier, nextTier } = progress;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/45 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl ${currentTier.bgClass} border ${currentTier.borderClass} flex items-center justify-center text-xl shrink-0`}
            >
              {currentTier.badge}
            </div>
            <div className="min-w-0">
              <h3 className="font-chakra font-bold text-white text-lg truncate">
                TAMER RANK PROGRESSION
              </h3>
              <p className="text-slate-400 text-xs truncate">
                Win battles (+{POINTS_PER_BATTLE_WIN} pts) &amp; clear Adventure zones (+{POINTS_PER_ZONE_CLEAR} pts) to unlock Bazaar &amp; Room rewards
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close Tamer Rank"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-0.5">
          {/* Active Rank Summary Card */}
          <div
            className={`p-4 rounded-2xl border ${currentTier.borderClass} ${currentTier.bgClass} space-y-3`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentTier.badge}</span>
                <div>
                  <div className="font-pixel text-[10px] text-slate-300">
                    CURRENT RANK · {progress.rank} / {TAMER_RANK_TIERS.length}
                  </div>
                  <div className={`font-chakra font-bold text-xl ${currentTier.accentClass}`}>
                    {currentTier.title}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-pixel text-[10px] text-slate-400">TAMER SCORE</div>
                <div className="font-chakra font-bold text-2xl text-white tabular-nums">
                  {progress.score} <span className="text-xs text-amber-300">PTS</span>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950/75 border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-chakra text-slate-300">
                  <Swords className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Total Battles Won</span>
                </div>
                <span className="font-pixel text-xs text-cyan-300 tabular-nums font-bold">
                  {progress.battlesWon}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/75 border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-chakra text-slate-300">
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zones Cleared</span>
                </div>
                <span className="font-pixel text-xs text-emerald-300 tabular-nums font-bold">
                  {progress.zonesCleared}/{progress.totalZones}
                </span>
              </div>
            </div>

            {/* Progress Bar to Next Rank */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-chakra text-slate-200 tabular-nums">
                <span>
                  {nextTier
                    ? `Next: Rank ${nextTier.rank} · ${nextTier.title}`
                    : 'Maximum Sovereign Tamer Rank Reached'}
                </span>
                <span className="font-pixel text-[10px] text-amber-300">
                  {nextTier ? `${progress.pointsToNext} PTS NEEDED` : 'MAX RANK'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950/90 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${currentTier.barClass}`}
                  style={{ width: `${progress.progressPct}%` }}
                />
              </div>
            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {onOpenShop && (
                <button
                  onClick={() => {
                    sound.playButton();
                    onClose();
                    onOpenShop();
                  }}
                  className="min-h-[44px] px-2.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/45 text-amber-200 font-pixel text-[9px] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span>SHOP</span>
                </button>
              )}
              {onOpenRoom && (
                <button
                  onClick={() => {
                    sound.playButton();
                    onClose();
                    onOpenRoom();
                  }}
                  className="min-h-[44px] px-2.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/45 text-emerald-200 font-pixel text-[9px] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  <span>MY ROOM</span>
                </button>
              )}
              {onOpenAdventure && (
                <button
                  onClick={() => {
                    sound.playButton();
                    onClose();
                    onOpenAdventure();
                  }}
                  className="min-h-[44px] px-2.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/45 text-cyan-200 font-pixel text-[9px] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>ADVENTURE</span>
                </button>
              )}
            </div>
          </div>

          {/* Rank Ladder */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="font-pixel text-[10px] text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>TAMER RANK LADDER &amp; UNLOCKS</span>
              </h4>
              <span className="font-chakra text-[11px] text-slate-400">
                Colosseum &amp; Adventure wins count
              </span>
            </div>

            {TAMER_RANK_TIERS.map((tier) => {
              const isUnlocked = progress.rank >= tier.rank;
              const isCurrent = progress.rank === tier.rank;
              return (
                <div
                  key={tier.rank}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? `${tier.bgClass} ${tier.borderClass} shadow-lg`
                      : isUnlocked
                      ? 'bg-slate-950/85 border-emerald-500/35'
                      : 'bg-slate-950/60 border-slate-800/90 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                        {tier.badge}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-chakra font-bold text-sm sm:text-base ${tier.accentClass}`}>
                            Rank {tier.rank} · {tier.title}
                          </span>
                          {isCurrent && (
                            <span className="font-pixel text-[8px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="font-pixel text-[9px] text-slate-400 tabular-nums">
                          {tier.minScore === 0 ? 'Starter Rank' : `Requires ${tier.minScore} Tamer Score`}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-pixel text-[9px]">
                          <Check className="w-3 h-3" />
                          <span>UNLOCKED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 font-pixel text-[9px] tabular-nums">
                          <Lock className="w-3 h-3" />
                          <span>{tier.minScore - progress.score} PTS LEFT</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-1 pl-11 text-xs font-chakra text-slate-300">
                    {tier.unlockSummary.map((line, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className={isUnlocked ? 'text-emerald-400' : 'text-slate-500'}>•</span>
                        <span className={isUnlocked ? 'text-slate-200' : 'text-slate-400'}>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
