import React, { useState } from 'react';
import { X, Sparkles, Check, Shield } from 'lucide-react';
import { PetState, SpecialItemId } from '../types/digimon';
import { DIGI_EGGS, DIGIMON_DATABASE, SPECIAL_ITEMS } from '../data/digidex';
import { DigimonSprite } from './DigimonSprite';
import { PixelMeatIcon, PixelVitaminIcon } from './PixelItemIcons';
import { sound } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetState;
  onBuyItem: (itemId: 'meat' | 'meat_bundle' | 'sirloin' | 'vitamin' | 'vitamin_bundle' | 'energy_drink' | 'medicine', cost: number) => void;
  onBuySpecialItem?: (itemId: SpecialItemId, cost: number) => void;
  onEquipSpecialItem?: (itemId: SpecialItemId | null) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  pet,
  onBuyItem,
  onBuySpecialItem,
  onEquipSpecialItem,
}) => {
  const [activeTab, setActiveTab] = useState<'supplies' | 'relics'>('supplies');

  if (!isOpen) return null;

  const ownedSpecialItems = pet.ownedSpecialItems || [];
  const relics = Object.values(SPECIAL_ITEMS);

  const items = [
    {
      id: 'meat' as const,
      name: 'Big Meat',
      category: 'Food',
      description: 'Classic Digital Monster meat. Satisfies +25 hunger and adds +2g healthy weight.',
      price: 10,
      rewardText: '+1 Big Meat',
      icon: <PixelMeatIcon className="w-8 h-8" />,
      currentStock: pet.bigMeatStock,
    },
    {
      id: 'meat_bundle' as const,
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
      currentStock: pet.bigMeatStock,
      discountBadge: 'POPULAR SAVE 10%',
    },
    {
      id: 'sirloin' as const,
      name: 'Prime Sirloin 🥩',
      category: 'Food',
      description: 'Juicy deluxe steak. Completely tops off +50 hunger and boosts +20 happiness!',
      price: 25,
      rewardText: '+2 Big Meats & +35 Hunger',
      icon: '🥩',
      currentStock: pet.bigMeatStock,
    },
    {
      id: 'vitamin' as const,
      name: 'Digi-Vitamin',
      category: 'Medicine & Stats',
      description: 'Potent protein supplement. Builds Strength, Effort, and charges DP power.',
      price: 15,
      rewardText: '+1 Vitamin',
      icon: <PixelVitaminIcon className="w-7 h-7" />,
      currentStock: pet.vitaminStock,
    },
    {
      id: 'vitamin_bundle' as const,
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
      currentStock: pet.vitaminStock,
      discountBadge: 'VALUE PACK',
    },
    {
      id: 'energy_drink' as const,
      name: 'Digital Surge Drink ⚡',
      category: 'Energy',
      description: 'Sparkling high-voltage elixir. Restores +50 Energy and clears sleepiness.',
      price: 30,
      rewardText: '+50 Energy directly',
      icon: '⚡',
      currentStock: null,
    },
    {
      id: 'medicine' as const,
      name: 'Digital Antivirus 🩹',
      category: 'Care',
      description: 'Emergency antidote formula to cure virus infections and sickness instantly.',
      price: 20,
      rewardText: 'Cures sickness + cleans viruses',
      icon: '🩹',
      currentStock: null,
    },
  ];

  const handlePurchase = (item: typeof items[0]) => {
    if (pet.digiBits < item.price) {
      sound.playAlert();
      return;
    }
    sound.playEat();
    onBuyItem(item.id, item.price);
  };

  const handleBuyRelic = (itemId: SpecialItemId, price: number) => {
    if (pet.digiBits < price) {
      sound.playAlert();
      return;
    }
    sound.playDigivolve();
    onBuySpecialItem?.(itemId, price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              🏪
            </div>
            <div>
              <h3 className="font-chakra font-bold text-white text-lg flex items-center gap-2">
                FILE CITY ITEM BAZAAR
                <span className="text-[10px] font-pixel text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  OPEN 24/7
                </span>
              </h3>
              <p className="text-slate-400 text-xs">Supplies, Vitamins &amp; Armor Evolution Crests</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 rounded-full font-pixel text-xs text-amber-300 border border-amber-500/40 shadow-inner">
              <span className="text-sm">🪙</span>
              <span className="font-bold">{pet.digiBits} BITS</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Supplies Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 border-b border-slate-800/60 font-pixel text-[10px]">
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 inline-flex items-center gap-1.5">
              <PixelMeatIcon className="w-4 h-4" /> Big Meat:
            </span>
            <span className="text-amber-300 font-bold text-xs">{pet.bigMeatStock} in bag</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 inline-flex items-center gap-1.5">
              <PixelVitaminIcon className="w-4 h-4" /> Vitamins:
            </span>
            <span className="text-cyan-300 font-bold text-xs">{pet.vitaminStock} in bag</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 col-span-2 sm:col-span-1 flex items-center justify-between">
            <span className="text-slate-400">🛡️ Relics Owned:</span>
            <span className="text-emerald-300 font-bold text-xs">{ownedSpecialItems.length} / {relics.length}</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 pt-3 pb-1">
          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('supplies');
            }}
            className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] transition-all cursor-pointer ${
              activeTab === 'supplies'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🍖 FOOD &amp; VITAMINS
          </button>
          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('relics');
            }}
            className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'relics'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>CRESTS &amp; DIGI-EGGS (ARMOR)</span>
          </button>
        </div>

        {/* Catalog Items */}
        {activeTab === 'supplies' ? (
          <div className="overflow-y-auto space-y-2.5 py-3 pr-1 flex-1">
            {items.map((item) => {
              const canAfford = pet.digiBits >= item.price;
              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-chakra font-bold text-white text-sm sm:text-base">
                          {item.name}
                        </h4>
                        {item.discountBadge && (
                          <span className="font-pixel text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                            {item.discountBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5 max-w-sm line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 font-pixel text-[10px]">
                        <span className="text-emerald-400">⚡ {item.rewardText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="font-pixel text-xs text-amber-300 font-bold whitespace-nowrap">
                      🪙 {item.price} BITS
                    </span>
                    <button
                      disabled={!canAfford}
                      onClick={() => handlePurchase(item)}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-pixel text-[10px] px-3.5 py-2 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <span>BUY</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-y-auto space-y-2.5 py-3 pr-1 flex-1">
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] font-chakra text-cyan-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Equip a Crest or Digi-Egg matching your active Egg line during Rookie stage to trigger its Special Armor Evolution!
              </span>
            </div>

            {relics.map((relic) => {
              const isOwned = ownedSpecialItems.includes(relic.id);
              const isEquipped = pet.equippedSpecialItem === relic.id;
              const matchesEgg = pet.eggId === relic.eggId;
              const canAfford = pet.digiBits >= relic.price;
              const compatEgg = DIGI_EGGS.find((e) => e.id === relic.eggId);
              const armorSpecies = DIGIMON_DATABASE[relic.armorSpeciesId];

              return (
                <div
                  key={relic.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isEquipped
                      ? 'bg-amber-950/30 border-amber-400/60'
                      : matchesEgg
                      ? 'bg-slate-950/90 border-emerald-500/40'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {armorSpecies ? (
                        <DigimonSprite species={armorSpecies} action="idle" scale={0.45} />
                      ) : (
                        <span className="text-2xl">{relic.icon}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-base">{relic.icon}</span>
                        <h4 className="font-chakra font-bold text-white text-sm sm:text-base">
                          {relic.name}
                        </h4>
                        {matchesEgg && (
                          <span className="font-pixel text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                            YOUR EGG
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
                        {relic.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 font-pixel text-[9px]">
                        {compatEgg && (
                          <span className="text-cyan-300">
                            EGG #{String(compatEgg.eggNumber).padStart(2, '0')} ({compatEgg.crestName})
                          </span>
                        )}
                        {armorSpecies && (
                          <span className="text-amber-300">→ {armorSpecies.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {!isOwned ? (
                      <>
                        <span className="font-pixel text-xs text-amber-300 font-bold whitespace-nowrap">
                          🪙 {relic.price} BITS
                        </span>
                        <button
                          disabled={!canAfford || !onBuySpecialItem}
                          onClick={() => handleBuyRelic(relic.id, relic.price)}
                          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-pixel text-[10px] px-3.5 py-2 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-transform cursor-pointer"
                        >
                          BUY RELIC
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          sound.playButton();
                          onEquipSpecialItem?.(isEquipped ? null : relic.id);
                        }}
                        className={`font-pixel text-[10px] px-3.5 py-2 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1 cursor-pointer ${
                          isEquipped
                            ? 'bg-amber-500 text-slate-950 border border-amber-300'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                      >
                        {isEquipped && <Check className="w-3 h-3" />}
                        <span>{isEquipped ? 'EQUIPPED' : 'EQUIP'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400 font-pixel text-[9px]">
          <span>💡 Earn more Bits by winning Colosseum battles or playing Mini-Games!</span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white underline cursor-pointer"
          >
            Close Shop
          </button>
        </div>
      </div>
    </div>
  );
};

