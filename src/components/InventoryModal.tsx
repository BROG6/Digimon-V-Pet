import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Backpack, Check, HeartPulse, Lock, Shield, Sparkles, Utensils, X } from 'lucide-react';
import { PetState, SpecialItemId } from '../types/digimon';
import { DIGI_EGGS, DIGIMON_DATABASE, SPECIAL_ITEMS } from '../data/digidex';
import { ADVENTURE_ZONES } from '../data/adventureZones';
import { getEffectiveBattleStats } from '../data/battleTechniques';
import {
  HEAL_ITEM_ORDER,
  HEAL_ITEM_SPECS,
  HealItemTier,
  getEffectivePetCurrentHp,
  getHealAmountForTier,
  getRecoveryStockCount,
} from '../utils/carePacing';
import { DigimonSprite } from './DigimonSprite';
import {
  PixelBerryIcon,
  PixelMeatIcon,
  PixelMushroomIcon,
  PixelRecoveryDiskIcon,
  PixelSirloinIcon,
  PixelVitaminIcon,
} from './PixelItemIcons';
import { sound, triggerHaptic } from '../utils/audio';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetState;
  onFeedMeat: () => void;
  onFeedSirloin: () => void;
  onFeedMushroom: () => void;
  onFeedBerry: () => void;
  onGiveVitamin: () => void;
  onUseRecoveryItem: (tier: HealItemTier) => void;
  onEquipSpecialItem: (itemId: SpecialItemId | null) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  pet,
  onFeedMeat,
  onFeedSirloin,
  onFeedMushroom,
  onFeedBerry,
  onGiveVitamin,
  onUseRecoveryItem,
  onEquipSpecialItem,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'relics'>('items');

  if (!isOpen) return null;

  const sirloinStock = pet.sirloinStock ?? 0;
  const mushroomStock = pet.mushroomStock ?? 0;
  const berryStock = pet.berryStock ?? 0;

  const currentSpecies = DIGIMON_DATABASE[pet.currentSpeciesId];
  const maxHp = getEffectiveBattleStats(pet, currentSpecies).maxHp;
  const currentHp = getEffectivePetCurrentHp(pet, maxHp);

  const ownedRelics = pet.ownedSpecialItems || [];
  const allRelics = Object.values(SPECIAL_ITEMS);
  const equippedRelic = pet.equippedSpecialItem ? SPECIAL_ITEMS[pet.equippedSpecialItem] : undefined;

  const isDisabledForPet = Boolean(pet.isDead || pet.isFrozen || pet.stage === 'egg');

  const consumables = [
    {
      id: 'meat',
      name: 'Big Meat',
      tag: 'Standard Ration',
      effect: '+25 Hunger · +2g Weight · +10 Happiness',
      sourceHint: 'Digi-Shop, Meat Catch & Adventure Mode',
      stock: pet.bigMeatStock,
      icon: <PixelMeatIcon className="w-8 h-8" />,
      borderClass: 'border-amber-500/35',
      buttonClass: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
      actionLabel: 'FEED',
      onUse: onFeedMeat,
    },
    {
      id: 'sirloin',
      name: 'Prime Sirloin',
      tag: 'Double Meat (2x)',
      effect: '+50 Hunger · +4g Weight · +20 Happiness',
      sourceHint: 'Rare drop from Ultimate & Mega enemies in Adventure Mode or Bazaar',
      stock: sirloinStock,
      icon: <PixelSirloinIcon className="w-8 h-8" />,
      borderClass: 'border-rose-500/45',
      buttonClass: 'bg-rose-400 hover:bg-rose-300 text-slate-950',
      actionLabel: 'FEED 2X',
      onUse: onFeedSirloin,
    },
    {
      id: 'mushroom',
      name: 'Digi-Mushroom',
      tag: 'Foraged Snack',
      effect: '+18 Hunger · +15 Energy · +1g Weight',
      sourceHint: 'Found on Adventure trails & random battle drops',
      stock: mushroomStock,
      icon: <PixelMushroomIcon className="w-8 h-8" />,
      borderClass: 'border-emerald-500/35',
      buttonClass: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950',
      actionLabel: 'FEED',
      onUse: onFeedMushroom,
    },
    {
      id: 'berry',
      name: 'Digi-Berry',
      tag: 'Sweet Treat',
      effect: '+12 Hunger · +20 Happiness',
      sourceHint: 'Found on Adventure trails & random battle drops',
      stock: berryStock,
      icon: <PixelBerryIcon className="w-8 h-8" />,
      borderClass: 'border-pink-500/35',
      buttonClass: 'bg-pink-400 hover:bg-pink-300 text-slate-950',
      actionLabel: 'FEED',
      onUse: onFeedBerry,
    },
    {
      id: 'vitamin',
      name: 'Digi-Vitamin',
      tag: 'Tonic & Cure',
      effect: '+20 Energy · Cures Sickness · +2 STR · +5 DP',
      sourceHint: 'Digi-Shop, Meat Catch & Adventure Mode',
      stock: pet.vitaminStock,
      icon: <PixelVitaminIcon className="w-8 h-8" />,
      borderClass: 'border-purple-500/35',
      buttonClass: 'bg-purple-400 hover:bg-purple-300 text-slate-950',
      actionLabel: 'GIVE',
      onUse: onGiveVitamin,
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Backpack className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-chakra font-bold text-white text-lg truncate">
                TAMER INVENTORY &amp; ARMOR RELICS
              </h3>
              <p className="text-slate-400 text-xs truncate">
                Feed Meat, Sirloin, Mushrooms &amp; Berries, or equip Armor Crest Relics
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close Inventory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="grid grid-cols-2 gap-2 my-3 shrink-0">
          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('items');
            }}
            className={`min-h-[42px] rounded-xl font-chakra font-bold text-sm flex items-center justify-center gap-2 border cursor-pointer transition-all ${
              activeTab === 'items'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Food &amp; Supplies</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('relics');
            }}
            className={`min-h-[42px] rounded-xl font-chakra font-bold text-sm flex items-center justify-center gap-2 border cursor-pointer transition-all ${
              activeTab === 'relics'
                ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Armor Relics ({ownedRelics.length}/{allRelics.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5">
          {activeTab === 'items' && (
            <>
              {isDisabledForPet && (
                <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs font-chakra">
                  {pet.isDead
                    ? 'Your Digimon passed away. Use Reset / Hatch in the menu to raise a new partner!'
                    : pet.isFrozen
                    ? 'Cold Mode (Fridge) is active — unfreeze under Care before feeding.'
                    : 'Your Digitama is still incubating! Wait for it to hatch before feeding.'}
                </div>
              )}

              {/* Quick Vitals Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-pixel text-[9px] bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <div className={currentHp < maxHp ? 'text-emerald-300 font-bold' : 'text-emerald-400'}>
                  HP: {currentHp}/{maxHp}
                </div>
                <div className="text-amber-300">HUNGER: {pet.hunger}%</div>
                <div className="text-cyan-300">ENERGY: {pet.energy}%</div>
                <div className="text-rose-300">HAPPY: {pet.happiness}%</div>
              </div>

              {/* Battle Recovery Disks */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1 font-pixel text-[9px] text-emerald-300">
                  <span className="inline-flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>BATTLE RECOVERY DISKS</span>
                  </span>
                  {currentHp < maxHp && (
                    <span className="text-[8px] text-slate-400">
                      Also regenerates slowly outside battle
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HEAL_ITEM_ORDER.map((tier) => {
                    const spec = HEAL_ITEM_SPECS[tier];
                    const stock = getRecoveryStockCount(pet, tier);
                    const healAmt = getHealAmountForTier(tier, maxHp);
                    const needsHeal = currentHp < maxHp || Boolean(spec.curesSickness && pet.isSick);
                    const disabled = isDisabledForPet || stock <= 0 || !needsHeal;
                    return (
                      <div
                        key={tier}
                        className={`p-3 bg-slate-950/85 border rounded-2xl flex items-center justify-between gap-2.5 ${spec.accentClass}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
                            <PixelRecoveryDiskIcon tier={tier} className="w-7 h-7" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-chakra font-bold text-white text-xs sm:text-sm truncate">
                                {spec.name}
                              </span>
                              <span className="font-pixel text-[8px] px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                                {spec.tierLabel}
                              </span>
                            </div>
                            <p className="text-[11px] font-chakra text-emerald-300 font-semibold truncate">
                              +{spec.hpPercent >= 1 ? '100%' : healAmt} HP
                              {spec.mpPercent >= 1
                                ? ' · 100% MP'
                                : spec.mpPercent > 0
                                ? ` · +${Math.round(spec.mpPercent * 100)}% MP`
                                : ''}
                              {spec.curesSickness ? ' · Cure' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="font-pixel text-[9px] text-slate-300 tabular-nums">
                            x{stock}
                          </span>
                          <button
                            disabled={disabled}
                            onClick={() => {
                              triggerHaptic('medium');
                              onUseRecoveryItem(tier);
                            }}
                            className="min-h-[34px] px-3 py-1 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-pixel text-[9px] font-bold cursor-pointer active:scale-95 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                          >
                            {needsHeal ? 'HEAL' : 'FULL'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="font-pixel text-[9px] text-amber-300 px-1 pt-2">
                FOOD &amp; VITAMINS
              </div>

              {consumables.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 bg-slate-950/85 border ${item.borderClass} rounded-2xl flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-chakra font-bold text-white text-sm sm:text-base">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-chakra font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300 font-chakra font-semibold mt-0.5">
                        {item.effect}
                      </p>
                      <p className="text-[11px] text-slate-400 font-chakra mt-0.5 truncate">
                        {item.sourceHint}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-pixel text-[10px] text-slate-300 tabular-nums">
                      x{item.stock}
                    </span>
                    <button
                      disabled={isDisabledForPet || item.stock <= 0}
                      onClick={() => {
                        triggerHaptic('medium');
                        item.onUse();
                      }}
                      className={`min-h-[38px] px-4 py-1.5 rounded-xl font-pixel text-[10px] font-bold cursor-pointer active:scale-95 transition-all disabled:opacity-35 disabled:cursor-not-allowed ${item.buttonClass}`}
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'relics' && (
            <div className="space-y-3">
              {/* Active Equipped Relic Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/35 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-pixel text-[10px] text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    ACTIVE ARMOR CREST SLOT
                  </span>
                  <span className="text-[10px] font-chakra text-slate-400">
                    Stage: <strong className="text-white uppercase">{pet.stage}</strong>
                  </span>
                </div>

                {equippedRelic ? (
                  <div className="p-2.5 rounded-xl bg-amber-950/35 border border-amber-500/45 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{equippedRelic.icon}</span>
                      <div className="min-w-0">
                        <div className="font-chakra font-bold text-sm text-amber-200 truncate">
                          {equippedRelic.name}
                        </div>
                        <div className="text-[11px] font-chakra text-slate-300 truncate">
                          {equippedRelic.eggId === pet.eggId
                            ? pet.stage === 'rookie'
                              ? 'Resonates with your Rookie! Triggers Armor Digivolution at timer completion.'
                              : 'Matches your Digi-Egg! Triggers Armor Digivolution once Rookie stage is reached.'
                            : 'Equipped, but resonates with another Digi-Egg line.'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playButton();
                        triggerHaptic('light');
                        onEquipSpecialItem(null);
                      }}
                      className="min-h-[36px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-[9px] shrink-0 cursor-pointer"
                    >
                      UNEQUIP
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-chakra text-slate-400">
                    No Armor Crest Relic equipped. Win Wave 6 Boss battles in Adventure Mode to unlock Crests &amp; Armor Digi-Eggs, then equip one here!
                  </div>
                )}
              </div>

              {/* All Armor Crest Relics Vault */}
              <div className="space-y-2.5">
                {allRelics.map((relic) => {
                  const isOwned = ownedRelics.includes(relic.id);
                  const isEquipped = pet.equippedSpecialItem === relic.id;
                  const eggInfo = DIGI_EGGS.find((e) => e.id === relic.eggId);
                  const armorSpecies = DIGIMON_DATABASE[relic.armorSpeciesId];
                  const matchesCurrentEgg = relic.eggId === pet.eggId;
                  const dropZone = ADVENTURE_ZONES.find((z) => z.firstClearRelicId === relic.id);
                  const isArmorUnlocked = Boolean(
                    isOwned || (pet.unlockedSpeciesIds || []).includes(relic.armorSpeciesId)
                  );

                  return (
                    <div
                      key={relic.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isEquipped
                          ? 'bg-amber-950/25 border-amber-400/70 shadow-lg shadow-amber-500/10'
                          : isOwned
                          ? 'bg-slate-950/85 border-emerald-500/35'
                          : 'bg-slate-950/60 border-slate-800 opacity-85'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Crest Emblem + Armor Evolution Preview */}
                        <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden">
                          {armorSpecies ? (
                            <div
                              className={
                                isArmorUnlocked
                                  ? 'opacity-95'
                                  : 'brightness-0 contrast-200 opacity-50'
                              }
                            >
                              <DigimonSprite species={armorSpecies} scale={0.55} />
                            </div>
                          ) : (
                            <span className="text-2xl">{relic.icon}</span>
                          )}
                          <span
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-xs shadow"
                            title={relic.shortName}
                          >
                            {isOwned ? relic.icon : <Lock className="w-3 h-3 text-slate-400" />}
                          </span>
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-chakra font-bold text-white text-sm sm:text-base">
                              {relic.name}
                            </h4>
                            {isEquipped && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-pixel text-[8px] font-bold">
                                EQUIPPED
                              </span>
                            )}
                            {matchesCurrentEgg && (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-pixel text-[8px]">
                                CURRENT EGG
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-chakra text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            {eggInfo && (
                              <span style={{ color: eggInfo.crestColor }} className="font-semibold">
                                Egg #{String(eggInfo.eggNumber).padStart(2, '0')} · {eggInfo.crestName}
                              </span>
                            )}
                            <span className="text-slate-500">→</span>
                            <span className="text-amber-300 font-semibold">
                              Armor: {isArmorUnlocked ? armorSpecies?.name || relic.armorSpeciesId : '??? (Defeat Boss to Reveal)'}
                            </span>
                          </div>

                          <p className="text-[11px] font-chakra text-slate-400">
                            {isOwned
                              ? relic.description
                              : dropZone
                              ? `Locked — Clear Zone ${String(dropZone.order).padStart(2, '0')} (${dropZone.name}) Wave 6 Boss in Adventure Mode.`
                              : 'Locked — Defeat Adventure Mode Wave 6 Bosses to unlock.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end shrink-0">
                        {isOwned ? (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playButton();
                              triggerHaptic('medium');
                              onEquipSpecialItem(isEquipped ? null : relic.id);
                            }}
                            className={`min-h-[38px] px-4 py-1.5 rounded-xl font-pixel text-[10px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                              isEquipped
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                                : matchesCurrentEgg
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>UNEQUIP</span>
                              </>
                            ) : (
                              <>
                                <Shield className="w-3.5 h-3.5" />
                                <span>EQUIP</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-pixel text-[9px] flex items-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            <span>LOCKED</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
