import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetState, DigimonSpecies, FurnitureItem, PlacedFurniture } from '../types/digimon';
import { FURNITURE_SHOP, ROOM_THEMES } from '../data/digidex';
import { DigimonSprite } from './DigimonSprite';
import { sound } from '../utils/audio';
import { Home, ShoppingBag, Palette, X, Sparkles, Plus, Trash2, Check } from 'lucide-react';

interface DigiRoomProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onBuyFurniture: (item: FurnitureItem) => void;
  onPlaceFurniture: (furnitureId: string, x: number, y: number) => void;
  onRemoveFurniture: (instanceId: string) => void;
  onUpdateFurniturePosition?: (instanceId: string, x: number, y: number) => void;
  onChangeTheme: (themeId: string) => void;
}

export const DigiRoom: React.FC<DigiRoomProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onBuyFurniture,
  onPlaceFurniture,
  onRemoveFurniture,
  onUpdateFurniturePosition,
  onChangeTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'shop' | 'themes'>('room');
  const [interactMsg, setInteractMsg] = useState<string | null>(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);

  // Autonomous Digimon roaming state inside room (replaces infinite jumping loop)
  const [digimonPos, setDigimonPos] = useState<number>(45); // percentage (15 - 85)
  const [digimonFacing, setDigimonFacing] = useState<'left' | 'right'>('right');
  const [digimonAction, setDigimonAction] = useState<'walk' | 'idle' | 'happy' | 'sit' | 'sleep'>('idle');
  const roomContainerRef = useRef<HTMLDivElement>(null);

  // Autonomous wandering logic
  useEffect(() => {
    if (!isOpen) return;

    if (pet.isSleeping) {
      setDigimonAction('sleep');
      return;
    }

    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.55) {
        // Walk smoothly to a new spot
        const target = Math.floor(Math.random() * 65 + 18);
        setDigimonFacing(target > digimonPos ? 'right' : 'left');
        setDigimonAction('walk');
        setDigimonPos(target);

        setTimeout(() => {
          setDigimonAction(Math.random() > 0.4 ? 'idle' : 'sit');
        }, 2200);
      } else if (rand < 0.85) {
        setDigimonAction(Math.random() > 0.5 ? 'idle' : 'sit');
        setDigimonFacing(Math.random() > 0.5 ? 'left' : 'right');
      } else {
        setDigimonAction('happy');
        setTimeout(() => setDigimonAction('idle'), 1600);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, pet.isSleeping, digimonPos]);

  if (!isOpen) return null;

  const currentTheme = ROOM_THEMES.find((t) => t.id === pet.activeRoomTheme) || ROOM_THEMES[0];

  const handleFurnitureClick = (item: FurnitureItem, instanceId: string) => {
    sound.playButton();
    setSelectedFurnitureId((prev) => (prev === instanceId ? null : instanceId));
    const effect = item.interactEffect || `Your Digimon interacts with the ${item.name}!`;
    setInteractMsg(effect);
    setTimeout(() => setInteractMsg(null), 3000);
  };

  const handleBuy = (item: FurnitureItem) => {
    if (pet.digiBits < item.price) {
      sound.playAlert();
      return;
    }
    sound.playMedicine();
    onBuyFurniture(item);

    // Stagger furniture cleanly across distinct floor slots to prevent overlapping
    const defaultSlots = [
      { x: 20, y: 72 },
      { x: 38, y: 76 },
      { x: 58, y: 70 },
      { x: 78, y: 76 },
      { x: 28, y: 56 },
      { x: 70, y: 56 },
      { x: 48, y: 80 },
    ];
    const slot = defaultSlots[pet.placedFurniture.length % defaultSlots.length];
    onPlaceFurniture(item.id, slot.x, slot.y);
  };

  const handleDigimonPet = () => {
    sound.playHappy();
    setDigimonAction('happy');
    setInteractMsg(`❤ ${pet.nickname || species?.name} feels loved and happy!`);
    setTimeout(() => {
      setInteractMsg(null);
      setDigimonAction('idle');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-chakra font-bold text-white text-lg">
                "MY ROOM" HABITAT & DECOR
              </h3>
              <p className="text-slate-400 text-xs">Hellopet-style interactive sanctuary</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full font-pixel text-xs text-amber-300 border border-slate-700">
              <span>🪙</span>
              <span>{pet.digiBits} BITS</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-3 mb-2 font-pixel text-xs">
          <button
            onClick={() => setActiveTab('room')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === 'room'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            VIEW ROOM
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === 'shop'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            FURNITURE SHOP
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === 'themes'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ROOM THEMES
          </button>
        </div>

        {/* TAB 1: THE VIRTUAL ROOM */}
        {activeTab === 'room' && (
          <div 
            ref={roomContainerRef}
            className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border-2 border-slate-700 select-none flex flex-col justify-between"
          >
            {/* Room Sky / Wall Background */}
            <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.skyColor} opacity-90`} />

            {/* Room Floor */}
            <div className={`absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t ${currentTheme.floorColor} border-t-2 border-black/20 shadow-inner`} />

            {/* Hint Overlay */}
            <div className="absolute top-3 left-3 z-30 bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-pixel text-slate-300 border border-slate-700 flex items-center gap-1.5 pointer-events-none">
              <span>💡</span>
              <span>Drag furniture to arrange • Tap Digimon to cheer</span>
            </div>

            {/* Interactive Message Banner */}
            <AnimatePresence>
              {interactMsg && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="relative top-3 mx-auto z-40 bg-slate-900/95 border border-emerald-400 text-emerald-300 font-pixel text-xs px-4 py-2 rounded-full shadow-lg"
                >
                  {interactMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Placed Furniture Items (Freely Draggable) */}
            {pet.placedFurniture.map((placed) => {
              const item = FURNITURE_SHOP.find((f) => f.id === placed.furnitureId);
              if (!item) return null;
              const isSelected = selectedFurnitureId === placed.instanceId;

              return (
                <motion.div
                  key={placed.instanceId}
                  drag
                  dragMomentum={false}
                  dragConstraints={roomContainerRef}
                  onDragEnd={(_e, info) => {
                    if (roomContainerRef.current && onUpdateFurniturePosition) {
                      const rect = roomContainerRef.current.getBoundingClientRect();
                      const xPercent = Math.min(88, Math.max(12, placed.x + (info.offset.x / rect.width) * 100));
                      const yPercent = Math.min(84, Math.max(30, placed.y + (info.offset.y / rect.height) * 100));
                      onUpdateFurniturePosition(placed.instanceId, Math.round(xPercent), Math.round(yPercent));
                    }
                  }}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => handleFurnitureClick(item, placed.instanceId)}
                  className={`absolute cursor-grab active:cursor-grabbing filter drop-shadow-xl z-20 flex flex-col items-center group touch-none ${
                    isSelected ? 'ring-2 ring-amber-400 rounded-2xl p-1 bg-black/20' : ''
                  }`}
                  style={{
                    left: `${placed.x}%`,
                    top: `${placed.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <span className="text-4xl sm:text-5xl select-none pointer-events-none">{item.icon}</span>
                  
                  {/* Item Label & Remove Button */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 text-white text-[9px] font-pixel px-2 py-0.5 rounded-full mt-1 border border-slate-700 shadow-lg">
                    <span>{item.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playAlert();
                        onRemoveFurniture(placed.instanceId);
                      }}
                      title="Remove furniture"
                      className="text-rose-400 hover:text-rose-300 ml-1 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {/* Roaming Digimon inside the room (Autonomous walking, sitting, resting) */}
            <motion.div 
              animate={{ left: `${digimonPos}%` }}
              transition={{ duration: digimonAction === 'walk' ? 2.2 : 0.4, ease: 'easeInOut' }}
              onClick={handleDigimonPet}
              className="absolute bottom-8 -translate-x-1/2 z-20 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <DigimonSprite
                species={species}
                action={pet.isSleeping ? 'sleep' : digimonAction}
                facing={digimonFacing}
                scale={1.1}
              />
            </motion.div>

            {/* Room Name Badge */}
            <div className="relative bottom-2 left-2 z-30 self-start bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-slate-300 font-pixel text-[10px] border border-slate-700">
              {currentTheme.name}
            </div>
          </div>
        )}

        {/* TAB 2: FURNITURE SHOP */}
        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 max-h-[380px] overflow-y-auto pr-1">
            {FURNITURE_SHOP.map((item) => {
              const isAffordable = pet.digiBits >= item.price;
              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                      {item.icon}
                    </span>
                    <div>
                      <h4 className="font-chakra font-bold text-white text-sm">
                        {item.name}
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {item.description}
                      </p>
                      <div className="text-amber-400 font-pixel text-[10px] mt-1">
                        🪙 {item.price} BITS
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!isAffordable}
                    onClick={() => handleBuy(item)}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-pixel text-[10px] px-3 py-2 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-transform"
                  >
                    BUY & PLACE
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: THEMES */}
        {activeTab === 'themes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            {ROOM_THEMES.map((theme) => {
              const isSelected = theme.id === pet.activeRoomTheme;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    sound.playButton();
                    onChangeTheme(theme.id);
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-chakra font-bold text-white text-base">
                        {theme.name}
                      </h4>
                      {isSelected && (
                        <div className="text-emerald-400 flex items-center gap-1 font-pixel text-[9px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>ACTIVE</span>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs">{theme.description}</p>
                  </div>
                  <div className={`h-8 w-full rounded-xl bg-gradient-to-r ${theme.skyColor} mt-3 border border-black/30`} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
