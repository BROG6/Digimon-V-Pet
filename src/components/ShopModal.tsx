import React from 'react';
import { Award, HeartPulse, Lock, Sparkles, X } from 'lucide-react';
import { PetState, ShopItemId } from '../types/digimon';
import { DIGIMON_DATABASE } from '../data/digidex';
import { getEffectiveBattleStats } from '../data/battleTechniques';
import {
  HEAL_ITEM_ORDER,
  HEAL_ITEM_SPECS,
  getEffectivePetCurrentHp,
  getHealAmountForTier,
  getRecoveryStockCount,
} from '../utils/carePacing';
import {
  PixelBerryIcon,
  PixelMeatIcon,
  PixelMushroomIcon,
  PixelRecoveryDiskIcon,
  PixelSirloinIcon,
  PixelVitaminIcon,
} from './PixelItemIcons';
import { computeTamerRankProgress, getTamerRankTier } from '../utils/tamerRank';
import { sound } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetState;
  onBuyItem: (itemId: ShopItemId, cost: number) => void;
  onOpenTamerRank?: () => void;
}

interface ShopCatalogItem {
  id: ShopItemId;
  name: string;
  category: string;
  description: string;
  price: number;
  rewardText: string;
  icon: React.ReactNode;
  minTamerRank: number;
  discountBadge?: string;
  requiresAlivePartner?: boolean;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  pet,
  onBuyItem,
  onOpenTamerRank,
}) => {
  if (!isOpen) return null;

  const rankProgress = computeTamerRankProgress(pet);
  const partnerUnavailable = Boolean(pet.isDead || pet.isFrozen || pet.stage === 'egg');
  const currentSpecies = DIGIMON_DATABASE[pet.currentSpeciesId];
  const maxHp = getEffectiveBattleStats(pet, currentSpecies).maxHp;
  const currentHp = getEffectivePetCurrentHp(pet, maxHp);
  const hpPct = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 100;

  const standardItems: ShopCatalogItem[] = [
    {
      id: 'meat',
      name: 'Big Meat',
      category: 'Food',
      description: 'Classic Digital Monster meat. Satisfies +25 hunger and adds +2g healthy weight.',
      price: 10,
      rewardText: '+1 Big Meat',
      icon: <PixelMeatIcon className="w-8 h-8" />,
      minTamerRank: 1,
    },
    {
      id: 'meat_bundle',
      name: 'Meat Pack (x5)',
      category: 'Food',
      description: 'Bulk butcher box of 5 Big Meats for growing Digimon! Saves 5 bits.',
      price: 45,
      rewardText: '+5 Big Meats',
      icon: (
        <div className="relative flex items-center justify-center">
          <PixelMeatIcon className="w-8 h-8" />
          <span className="absolute -bottom-1 -right-1.5 text-[8px] font-pixel bg-amber-500 text-slate-950 px-1 rounded font-bold">
            x5
          </span>
        </div>
      ),
      discountBadge: 'SAVE 10%',
      minTamerRank: 1,
    },
    {
      id: 'vitamin',
      name: 'Digi-Vitamin',
      category: 'Medicine & Stats',
      description: 'Potent protein supplement. Builds Strength, restores +20 Energy, and cures sickness.',
      price: 15,
      rewardText: '+1 Vitamin',
      icon: <PixelVitaminIcon className="w-7 h-7" />,
      minTamerRank: 1,
    },
    {
      id: 'vitamin_bundle',
      name: 'Vitamin Pack (x5)',
      category: 'Medicine & Stats',
      description: 'Heavy training box with 5 concentrated vitamin capsules for battle prep.',
      price: 65,
      rewardText: '+5 Vitamins',
      icon: (
        <div className="relative flex items-center justify-center">
          <PixelVitaminIcon className="w-7 h-7" />
          <span className="absolute -bottom-1 -right-1.5 text-[8px] font-pixel bg-purple-400 text-slate-950 px-1 rounded font-bold">
            x5
          </span>
        </div>
      ),
      discountBadge: 'VALUE PACK',
      minTamerRank: 1,
    },
    {
      id: 'medicine',
      name: 'Digital Antivirus',
      category: 'Care',
      description: 'Emergency antidote formula to cure virus infections and sickness instantly.',
      price: 20,
      rewardText: 'Cures sickness + cleans viruses',
      icon: '🩹',
      minTamerRank: 1,
    },
  ];

  const recoveryItems: (ShopCatalogItem & { ownedStock: number })[] = HEAL_ITEM_ORDER.map((tier) => {
    const spec = HEAL_ITEM_SPECS[tier];
    const healAmt = getHealAmountForTier(tier, maxHp);
    const mpNote = spec.mpPercent >= 1 ? ' + 100% MP' : spec.mpPercent > 0 ? ` + ${Math.round(spec.mpPercent * 100)}% MP` : '';
    const cureNote = spec.curesSickness ? ' + Cure' : '';
    return {
      id: spec.id,
      name: `${spec.name} (${spec.tierLabel})`,
      category: 'Battle Recovery',
      description: spec.description,
      price: spec.price,
      rewardText: `+1 ${spec.shortName} · Restores ${spec.hpPercent >= 1 ? '100%' : `${healAmt}`} HP${mpNote}${cureNote}`,
      icon: <PixelRecoveryDiskIcon tier={tier} className="w-8 h-8" />,
      minTamerRank: 1,
      ownedStock: getRecoveryStockCount(pet, tier),
    };
  });

  const rankExclusiveItems: ShopCatalogItem[] = [
    {
      id: 'sirloin',
      name: 'Prime Sirloin',
      category: 'Rank 2 Exclusive',
      description: 'Double Meat deluxe steak (+50 Hunger, +4g Weight, +20 Happiness). Also drops from Ultimates & Megas!',
      price: 90,
      rewardText: '+1 Prime Sirloin (2x Meat)',
      icon: <PixelSirloinIcon className="w-8 h-8" />,
      minTamerRank: 2,
    },
    {
      id: 'forage_basket',
      name: 'Trail Ration Crate',
      category: 'Rank 2 Exclusive',
      description: 'Explorer bundle containing 2 Digi-Mushrooms & 2 sweet Digi-Berries for quick Energy & Mood.',
      price: 180,
      rewardText: '+2 Mushrooms & +2 Berries',
      icon: (
        <div className="flex items-center -space-x-1">
          <PixelMushroomIcon className="w-6 h-6" />
          <PixelBerryIcon className="w-6 h-6" />
        </div>
      ),
      minTamerRank: 2,
    },
    {
      id: 'training_chip',
      name: 'Gym Mastery Chip',
      category: 'Rank 3 Exclusive',
      description: 'Instant combat data upload for your active partner. Permanently sharpens RPG battle stats.',
      price: 550,
      rewardText: 'Instant: +6 OFF/DEF, +4 SPD/BRN, +2 Effort, +25 EXP',
      icon: '💾',
      minTamerRank: 3,
      requiresAlivePartner: true,
    },
    {
      id: 'miracle_elixir',
      name: 'Royal Miracle Elixir',
      category: 'Rank 4 Exclusive',
      description: 'Golden recovery tonic that fully restores Battle HP, Hunger & Energy, cures sickness, and boosts DP.',
      price: 750,
      rewardText: 'Instant: 100% Battle HP, Hunger & Energy, Cure, +30 Happy, +15 DP',
      icon: '⚗️',
      minTamerRank: 4,
      requiresAlivePartner: true,
    },
    {
      id: 'sovereign_core',
      name: 'Sovereign Data Core',
      category: 'Rank 5 Exclusive',
      description: 'Mythic battle kernel crafted for Master Tamers. Dramatically empowers all RPG combat attributes.',
      price: 1450,
      rewardText: 'Instant: +12 All RPG Stats, +15 STR, +30 DP, +100 EXP',
      icon: '💠',
      minTamerRank: 5,
      requiresAlivePartner: true,
    },
  ];

  const handlePurchase = (item: ShopCatalogItem) => {
    const rankUnlocked = rankProgress.rank >= item.minTamerRank;
    if (!rankUnlocked) {
      sound.playAlert();
      return;
    }
    if (item.requiresAlivePartner && partnerUnavailable) {
      sound.playAlert();
      return;
    }
    if (pet.digiBits < item.price) {
      sound.playAlert();
      return;
    }
    sound.playEat();
    onBuyItem(item.id, item.price);
  };

  const renderCatalogCard = (item: ShopCatalogItem) => {
    const rankTier = getTamerRankTier(item.minTamerRank);
    const isRankUnlocked = rankProgress.rank >= item.minTamerRank;
    const blockedByPartnerState = Boolean(item.requiresAlivePartner && partnerUnavailable);
    const canAfford = pet.digiBits >= item.price;
    const canBuy = isRankUnlocked && canAfford && !blockedByPartnerState;

    return (
      <div
        key={item.id}
        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
          !isRankUnlocked
            ? 'bg-slate-950/55 border-slate-800/80 opacity-85'
            : 'bg-slate-950/85 border-slate-800 hover:border-amber-500/45'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 ${
              isRankUnlocked
                ? 'bg-slate-800/80 border-slate-700'
                : 'bg-slate-900 border-slate-800 grayscale opacity-70'
            }`}
          >
            {item.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-chakra font-bold text-white text-sm sm:text-base">
                {item.name}
              </h4>
              {item.discountBadge && (
                <span className="font-pixel text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                  {item.discountBadge}
                </span>
              )}
              {'ownedStock' in item && typeof (item as { ownedStock?: number }).ownedStock === 'number' && (
                <span className="font-pixel text-[8px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/35 tabular-nums">
                  OWNED: x{(item as { ownedStock: number }).ownedStock}
                </span>
              )}
              {item.minTamerRank > 1 && (
                <span
                  className={`font-pixel text-[8px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                    isRankUnlocked
                      ? `${rankTier.bgClass} ${rankTier.borderClass} ${rankTier.accentClass}`
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {!isRankUnlocked && <Lock className="w-2.5 h-2.5" />}
                  <span>RANK {item.minTamerRank}</span>
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5 max-w-md">{item.description}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 font-pixel text-[10px]">
              <span className={isRankUnlocked ? 'text-emerald-400' : 'text-slate-500'}>
                {item.rewardText}
              </span>
              {!isRankUnlocked && (
                <span className="text-amber-300/90">
                  Requires Rank {item.minTamerRank} ({rankTier.title})
                </span>
              )}
              {isRankUnlocked && blockedByPartnerState && (
                <span className="text-rose-300">
                  Requires hatched &amp; active Digimon
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="font-pixel text-xs text-amber-300 font-bold whitespace-nowrap tabular-nums">
            🪙 {item.price} BITS
          </span>
          {isRankUnlocked ? (
            <button
              disabled={!canBuy}
              onClick={() => handlePurchase(item)}
              className="min-h-[38px] bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-pixel text-[10px] px-3.5 py-2 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>{item.requiresAlivePartner ? 'APPLY' : 'BUY'}</span>
            </button>
          ) : (
            <div className="min-h-[38px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-pixel text-[9px] flex items-center gap-1 whitespace-nowrap">
              <Lock className="w-3 h-3" />
              <span>RANK {item.minTamerRank}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
              🏪
            </div>
            <div className="min-w-0">
              <h3 className="font-chakra font-bold text-white text-lg truncate">
                FILE CITY ITEM BAZAAR
              </h3>
              <p className="text-slate-400 text-xs truncate">
                Core supplies &amp; Tamer Rank exclusive gear
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 rounded-xl font-pixel text-xs text-amber-300 border border-amber-500/40 tabular-nums whitespace-nowrap">
              <span>🪙</span>
              <span className="font-bold">{pet.digiBits}</span>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close Shop"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tamer Rank Banner */}
        <button
          type="button"
          onClick={() => {
            if (!onOpenTamerRank) return;
            sound.playButton();
            onClose();
            onOpenTamerRank();
          }}
          className={`mt-3 p-2.5 rounded-2xl border ${rankProgress.currentTier.borderClass} ${rankProgress.currentTier.bgClass} flex items-center justify-between gap-2 text-left shrink-0 ${
            onOpenTamerRank ? 'cursor-pointer hover:brightness-110 transition-all' : 'cursor-default'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">{rankProgress.badge}</span>
            <div className="min-w-0">
              <div className={`font-chakra font-bold text-sm truncate ${rankProgress.currentTier.accentClass}`}>
                Rank {rankProgress.rank} · {rankProgress.title}
              </div>
              <div className="text-[11px] font-chakra text-slate-300 truncate tabular-nums">
                {rankProgress.nextTier
                  ? `${rankProgress.pointsToNext} pts to Rank ${rankProgress.nextTier.rank} (${rankProgress.nextTier.title})`
                  : 'All Tamer Rank exclusives unlocked!'}
              </div>
            </div>
          </div>
          {onOpenTamerRank && (
            <span className="font-pixel text-[9px] text-amber-300 shrink-0 whitespace-nowrap flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>RANKS »</span>
            </span>
          )}
        </button>

        {/* Current Supplies Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 border-b border-slate-800/60 font-pixel text-[9px] shrink-0">
          <div className="bg-slate-950/80 p-2 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-1">
            <span className="text-emerald-300 inline-flex items-center gap-1 truncate">
              <HeartPulse className="w-3.5 h-3.5 shrink-0" /> HP
            </span>
            <span className={`font-bold tabular-nums ${hpPct <= 30 ? 'text-rose-400' : 'text-emerald-300'}`}>
              {currentHp}/{maxHp}
            </span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-1">
            <span className="text-slate-400 inline-flex items-center gap-1 truncate">
              <PixelMeatIcon className="w-3.5 h-3.5 shrink-0" /> Meat
            </span>
            <span className="text-amber-300 font-bold tabular-nums">{pet.bigMeatStock}</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-1">
            <span className="text-slate-400 inline-flex items-center gap-1 truncate">
              <PixelSirloinIcon className="w-3.5 h-3.5 shrink-0" /> Sirloin
            </span>
            <span className="text-rose-300 font-bold tabular-nums">{pet.sirloinStock ?? 0}</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-1">
            <span className="text-slate-400 inline-flex items-center gap-1 truncate">
              <PixelVitaminIcon className="w-3.5 h-3.5 shrink-0" /> Vit
            </span>
            <span className="text-cyan-300 font-bold tabular-nums">{pet.vitaminStock}</span>
          </div>
        </div>

        {/* Catalog Items */}
        <div className="overflow-y-auto space-y-4 py-3 pr-1 flex-1">
          <div className="space-y-2.5">
            <div className="font-pixel text-[9px] text-emerald-300 px-1 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>BATTLE RECOVERY DISKS (HP PERSISTS AFTER BATTLES)</span>
              </span>
            </div>
            {recoveryItems.map(renderCatalogCard)}
          </div>

          <div className="space-y-2.5">
            <div className="font-pixel text-[9px] text-slate-400 px-1">
              STANDARD BAZAAR SUPPLIES
            </div>
            {standardItems.map(renderCatalogCard)}
          </div>

          <div className="space-y-2.5">
            <div className="font-pixel text-[9px] text-amber-300 px-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TAMER RANK EXCLUSIVE ITEMS</span>
            </div>
            {rankExclusiveItems.map(renderCatalogCard)}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400 font-pixel text-[9px] shrink-0 gap-2">
          <span className="truncate">Win battles &amp; clear Adventure zones to raise Tamer Rank</span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white underline cursor-pointer shrink-0"
          >
            Close Shop
          </button>
        </div>
      </div>
    </div>
  );
};
