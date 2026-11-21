import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Backpack, Check, Shield, Sparkles, Utensils, X } from 'lucide-react';
import { DigiEggInfo, PetState } from '../types/digimon';
import { DIGI_EGGS, DIGIMON_DATABASE } from '../data/digidex';
import { DigimonSprite } from './DigimonSprite';
import {
  PixelBerryIcon,
  PixelMeatIcon,
  PixelMushroomIcon,
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
  onSelectEgg: (egg: DigiEggInfo, nickname: string, playerName: string) => void;
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
  onSelectEgg,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'eggs'>('items');
  const [selectedEgg, setSelectedEgg] = useState<DigiEggInfo>(
    () => DIGI_EGGS.find((e) => e.id === pet.eggId) || DIGI_EGGS[0]
  );
  const [eggNickname, setEggNickname] = useState<string>('');

  if (!isOpen) return null;

  const sirloinStock = pet.sirloinStock ?? 0;
  const mushroomStock = pet.mushroomStock ?? 0;
  const berryStock = pet.berryStock ?? 0;

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

  const handleHatchSelectedEgg = () => {
    sound.playButton();
    triggerHaptic('heavy');
    onSelectEgg(selectedEgg, eggNickname.trim(), pet.playerName || '');
    onClose();
  };

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
                TAMER INVENTORY &amp; DIGI-EGGS
              </h3>
              <p className="text-slate-400 text-xs truncate">
                Feed Meat, Sirloin, Mushrooms &amp; Berries, or hatch any of the 15 Digi-Eggs
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
              setActiveTab('eggs');
            }}
            className={`min-h-[42px] rounded-xl font-chakra font-bold text-sm flex items-center justify-center gap-2 border cursor-pointer transition-all ${
              activeTab === 'eggs'
                ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Digi-Eggs ({DIGI_EGGS.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5">
          {activeTab === 'items' && (
            <>
              {isDisabledForPet && (
                <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs font-chakra">
                  {pet.isDead
                    ? 'Your Digimon passed away. Switch to the Digi-Eggs tab to hatch a new partner!'
                    : pet.isFrozen
                    ? 'Cold Mode (Fridge) is active — unfreeze under Care before feeding.'
                    : 'Your Digitama is still incubating! Wait for it to hatch before feeding.'}
                </div>
              )}

              {/* Quick Vitals Strip */}
              <div className="grid grid-cols-3 gap-2 text-center font-pixel text-[9px] bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-amber-300">HUNGER: {pet.hunger}%</div>
                <div className="text-cyan-300">ENERGY: {pet.energy}%</div>
                <div className="text-rose-300">HAPPY: {pet.happiness}%</div>
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

          {activeTab === 'eggs' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/35 text-xs text-cyan-200 font-chakra">
                Select any of the 15 Digi-Eggs below to hatch a new partner. Your inventory items, DigiBits, Relics, and Adventure progress carry over!
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {DIGI_EGGS.map((egg) => {
                  const isSelected = selectedEgg.id === egg.id;
                  const isCurrent = pet.eggId === egg.id;
                  return (
                    <button
                      type="button"
                      key={egg.id}
                      onClick={() => {
                        sound.playButton();
                        setSelectedEgg(egg);
                      }}
                      className={`rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center justify-between text-center cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-amber-400 shadow-lg shadow-amber-500/15'
                          : 'bg-slate-950/75 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className="w-full text-[8px] font-pixel py-0.5 rounded-full mb-1 font-bold truncate px-1.5 text-slate-950"
                        style={{ backgroundColor: egg.crestColor }}
                      >
                        #{String(egg.eggNumber).padStart(2, '0')} {egg.archetypeTitle}
                      </div>

                      <div className="my-1 h-16 flex items-center justify-center">
                        <DigimonSprite egg={egg} scale={0.52} />
                      </div>

                      <div className="w-full space-y-0.5">
                        <div className="font-chakra font-bold text-xs text-white truncate">
                          {egg.crestName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {DIGIMON_DATABASE[egg.baby1Id]?.name || egg.baby1Id}
                        </div>
                        {egg.armorOption && (
                          <div className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/15 text-[8px] font-pixel text-amber-300">
                            <Shield className="w-2.5 h-2.5" /> ARMOR
                          </div>
                        )}
                      </div>

                      {isSelected ? (
                        <span className="mt-1 text-amber-400 flex items-center gap-1 text-[8px] font-pixel">
                          <Check className="w-3 h-3" /> SELECTED
                        </span>
                      ) : isCurrent ? (
                        <span className="mt-1 text-cyan-400 text-[8px] font-pixel">CURRENT</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Selected Egg Incubation Action Card */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 flex items-center justify-center shrink-0">
                    <DigimonSprite egg={selectedEgg} scale={0.68} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-chakra font-bold text-white text-sm truncate">
                      Egg #{String(selectedEgg.eggNumber).padStart(2, '0')}: {selectedEgg.crestName}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                      {selectedEgg.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={eggNickname}
                    onChange={(e) => setEggNickname(e.target.value)}
                    maxLength={14}
                    placeholder="Nickname (optional)"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-chakra focus:outline-none focus:border-amber-400 placeholder:text-slate-500 sm:w-36"
                  />
                  <button
                    type="button"
                    onClick={handleHatchSelectedEgg}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-pixel text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>HATCH THIS EGG</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
