import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PetState, 
  DigimonSpecies, 
  DigiEggInfo, 
  FurnitureItem, 
  DigimonStage 
} from './types/digimon';
import { DIGI_EGGS, DIGIMON_DATABASE, FURNITURE_SHOP, ROOM_THEMES } from './data/digidex';
import { DigiviceHUD } from './components/DigiviceHUD';
import { FloatingOverlay } from './components/FloatingOverlay';
import { EggSelectionModal } from './components/EggSelectionModal';
import { TrainingArena } from './components/TrainingArena';
import { FoodCatchGame } from './components/FoodCatchGame';
import { ColosseumBattle } from './components/ColosseumBattle';
import { EvolutionModal } from './components/EvolutionModal';
import { DigiRoom } from './components/DigiRoom';
import { DigidexModal } from './components/DigidexModal';
import { StatsModal } from './components/StatsModal';
import { ShopModal } from './components/ShopModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { NativePipOverlay } from './components/NativePipOverlay';
import { DigiChat } from './components/DigiChat';
import { DigimonGallery } from './components/DigimonGallery';
import { getHideGalleryButtonPref, syncOverridesToRepository } from './utils/customSpriteManager';
import { NEW_DIGIMON_SPRITES } from './utils/newDigimonSprites';
import { Capacitor } from '@capacitor/core';
import { 
  checkOverlayPermission, 
  requestOverlayPermission, 
  startNativeFloatingOverlay, 
  stopNativeFloatingOverlay, 
  isNativeOverlayActive 
} from './utils/nativeOverlay';
import { sound } from './utils/audio';
import { 
  Sparkles, 
  Home, 
  Swords, 
  Dumbbell, 
  BookOpen, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw,
  Plus,
  Shield,
  Layers,
  Heart,
  Activity,
  ShoppingBag,
  Smartphone
} from 'lucide-react';

const STORAGE_KEY = 'digipet_vpet_save_v1';

export default function App() {
  // Master Pet State
  const [pet, setPet] = useState<PetState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Default starting state (Tai Kamiya / Courage egg)
    return {
      eggId: 'egg-courage',
      currentSpeciesId: 'botamon',
      stage: 'fresh',
      nickname: 'Agumon',
      birthTimestamp: Date.now(),
      hunger: 75,
      energy: 90,
      happiness: 80,
      discipline: 60,
      weight: 15,
      strength: 20,
      dpPoints: 35,
      isSick: false,
      isSleeping: false,
      lightsOff: false,
      poopCount: 0,
      careMistakes: 0,
      battlesWon: 0,
      battlesTotal: 0,
      trainingCount: 0,
      digiBits: 150,
      bigMeatStock: 6,
      vitaminStock: 4,
      activeRoomTheme: 'file-island',
      placedFurniture: [
        { instanceId: 'init-1', furnitureId: 'meat-grill', x: 28, y: 68 },
        { instanceId: 'init-2', furnitureId: 'cozy-cushion', x: 74, y: 72 },
      ],
      lastCareCheck: Date.now(),
    };
  });

  // Active species & egg info
  const currentSpecies: DigimonSpecies | undefined = DIGIMON_DATABASE[pet.currentSpeciesId];
  const currentEgg: DigiEggInfo = DIGI_EGGS.find((e) => e.id === pet.eggId) || DIGI_EGGS[0];

  // Active UI Views & Modals
  const [isOverlayMode, setIsOverlayMode] = useState<boolean>(false);
  const [isEggModalOpen, setIsEggModalOpen] = useState<boolean>(false);
  const [isTrainingOpen, setIsTrainingOpen] = useState<boolean>(false);
  const [isFoodGameOpen, setIsFoodGameOpen] = useState<boolean>(false);
  const [isColosseumOpen, setIsColosseumOpen] = useState<boolean>(false);
  const [isRoomOpen, setIsRoomOpen] = useState<boolean>(false);
  const [isDigidexOpen, setIsDigidexOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  const [isNativePipOpen, setIsNativePipOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isGalleryHidden, setIsGalleryHidden] = useState<boolean>(() => getHideGalleryButtonPref());

  // Listen for hide gallery button preference changes
  useEffect(() => {
    const handleVisChange = (e: any) => {
      if (typeof e.detail?.hide === 'boolean') {
        setIsGalleryHidden(e.detail.hide);
      }
    };
    window.addEventListener('digipet-gallery-visibility-changed', handleVisChange);
    return () => window.removeEventListener('digipet-gallery-visibility-changed', handleVisChange);
  }, []);

  // Global keyboard shortcut ('G') to open Sprite Studio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (e.key === 'g' || e.key === 'G') {
        setIsGalleryOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Automatically flush any browser-calibrated sprite fixes to repository files on disk
  useEffect(() => {
    syncOverridesToRepository(true).catch(() => {});
  }, []);

  // Evolution Transition Modal State
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState<boolean>(false);
  const [prevEvoSpecies, setPrevEvoSpecies] = useState<DigimonSpecies | undefined>(undefined);
  const [nextEvoSpecies, setNextEvoSpecies] = useState<DigimonSpecies>(DIGIMON_DATABASE['agumon']);

  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Android Safe Area & Status Bar Clearance Custom Offset
  const [extraTopPad, setExtraTopPad] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('digipet_top_pad_offset') || '0', 10);
    } catch {
      return 0;
    }
  });

  const toggleExtraTopPad = () => {
    sound.playButton();
    const next = extraTopPad === 0 ? 14 : extraTopPad === 14 ? 28 : 0;
    setExtraTopPad(next);
    try {
      localStorage.setItem('digipet_top_pad_offset', next.toString());
    } catch {}
    setStatusNotification(
      next === 0
        ? 'Status bar clearance: Standard Android (44px)'
        : `Status bar clearance: Extended (+${next}px safe padding)`
    );
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Check Android overlay permission on native startup and inform user if needed
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      checkOverlayPermission().then((granted) => {
        if (!granted) {
          setStatusNotification('Tap "FLOAT OVER APPS" to enable Android Screen Overlay permission!');
          setTimeout(() => setStatusNotification(null), 6000);
        }
      });
    }
  }, []);

  // Android Native & Web Screen Overlay Launchers
  const handleLaunchOverlay = async () => {
    sound.playButton();
    if (Capacitor.isNativePlatform()) {
      const hasPerm = await checkOverlayPermission();
      if (!hasPerm) {
        setStatusNotification('Android: Please switch ON "Allow display over other apps" in Settings');
        setTimeout(() => setStatusNotification(null), 5000);
        await requestOverlayPermission();
        return;
      }

      const active = await isNativeOverlayActive();
      if (active) {
        await stopNativeFloatingOverlay();
        setStatusNotification('Floating screen overlay closed.');
        setTimeout(() => setStatusNotification(null), 3000);
        return;
      }

      const currentSpeciesConf = NEW_DIGIMON_SPRITES[pet.currentSpeciesId] || NEW_DIGIMON_SPRITES['agumon'];
      const activeFrame = currentSpeciesConf?.frames?.walking?.[0] || currentSpeciesConf?.frames?.standing?.[0] || { x: 2, y: 2, w: 48, h: 48 };

      const ok = await startNativeFloatingOverlay({
        speciesName: currentSpecies?.name || 'Digimon',
        spriteUrl: currentSpeciesConf?.sheetPath || '/assets/aistudio/Copy_of_Agumon_Adventure_04d0832a.png',
        frameX: activeFrame.x,
        frameY: activeFrame.y,
        frameW: activeFrame.w,
        frameH: activeFrame.h,
      });

      if (ok) {
        setStatusNotification(`✓ ${currentSpecies?.name || 'Digimon'} is now floating over all apps! Drag to move.`);
      } else {
        setStatusNotification('Please enable "Allow display over other apps" to float.');
      }
      setTimeout(() => setStatusNotification(null), 4000);
      return;
    }

    // In web browser: Launch Hellopet Screen Overlay Mode
    setIsOverlayMode(true);
  };

  const handleLaunchFloatOverApps = async () => {
    sound.playButton();
    if (Capacitor.isNativePlatform()) {
      await handleLaunchOverlay();
      return;
    }
    // Web Picture-in-Picture window popup
    setIsNativePipOpen(true);
  };

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
    } catch (e) {}
  }, [pet]);

  // Periodic Virtual Pet Care Loop (Hunger drops, Pooping, Sleep recovery)
  useEffect(() => {
    const careInterval = setInterval(() => {
      setPet((prev) => {
        let hunger = Math.max(0, prev.hunger - 3);
        let energy = prev.lightsOff ? Math.min(100, prev.energy + 10) : Math.max(0, prev.energy - 2);
        let poopCount = prev.poopCount;
        let isSick = prev.isSick;
        let careMistakes = prev.careMistakes;

        // Chance to poop if fed
        if (prev.hunger > 50 && Math.random() < 0.25 && poopCount < 4) {
          poopCount += 1;
        }

        // Neglect causes sickness
        if ((poopCount >= 3 || hunger === 0) && !isSick && Math.random() < 0.4) {
          isSick = true;
          careMistakes += 1;
          sound.playAlert();
        }

        return {
          ...prev,
          hunger,
          energy,
          poopCount,
          isSick,
          careMistakes,
          lastCareCheck: Date.now(),
        };
      });
    }, 25000);

    return () => clearInterval(careInterval);
  }, []);

  // Determine if ready to evolve
  const checkCanEvolve = (): { can: boolean; nextId?: string } => {
    if (!currentSpecies || !currentSpecies.nextEvolutions || currentSpecies.nextEvolutions.length === 0) {
      return { can: false };
    }

    const nextOption = currentSpecies.nextEvolutions[0];
    const targetSpecies = DIGIMON_DATABASE[nextOption.speciesId];
    if (!targetSpecies) return { can: false };

    // Stage evolution criteria
    if (pet.stage === 'fresh') {
      return { can: true, nextId: nextOption.speciesId };
    }

    if (pet.stage === 'in-training') {
      const minTrain = nextOption.minTraining || 1;
      if (pet.trainingCount >= minTrain) {
        return { can: true, nextId: nextOption.speciesId };
      }
    }

    if (pet.stage === 'rookie') {
      const minBattles = nextOption.minBattles || 2;
      const minTraining = nextOption.minTraining || 4;
      if (pet.battlesWon >= minBattles && pet.trainingCount >= minTraining) {
        return { can: true, nextId: nextOption.speciesId };
      }
    }

    if (pet.stage === 'champion') {
      const minBattles = nextOption.minBattles || 5;
      const minTraining = nextOption.minTraining || 8;
      if (pet.battlesWon >= minBattles && pet.trainingCount >= minTraining) {
        return { can: true, nextId: nextOption.speciesId };
      }
    }

    if (pet.stage === 'ultimate') {
      const minBattles = nextOption.minBattles || 10;
      const minTraining = nextOption.minTraining || 15;
      if (pet.battlesWon >= minBattles && pet.trainingCount >= minTraining) {
        return { can: true, nextId: nextOption.speciesId };
      }
    }

    return { can: false, nextId: nextOption.speciesId };
  };

  const evolutionCheck = checkCanEvolve();

  // Evolution Trigger
  const triggerEvolution = (targetSpeciesId?: string) => {
    const targetId = targetSpeciesId || evolutionCheck.nextId;
    if (!targetId || !DIGIMON_DATABASE[targetId]) return;

    const target = DIGIMON_DATABASE[targetId];
    setPrevEvoSpecies(currentSpecies);
    setNextEvoSpecies(target);
    setIsEvolutionModalOpen(true);

    setPet((prev) => ({
      ...prev,
      currentSpeciesId: target.id,
      stage: target.stage,
      weight: prev.weight + 8,
      strength: prev.strength + 30,
      dpPoints: prev.dpPoints + 40,
      happiness: 100,
    }));
  };

  // CARE ACTIONS
  const handleFeedMeat = () => {
    if (pet.bigMeatStock <= 0) {
      sound.playAlert();
      showNotification('Out of Big Meat! Play "I\'m Hungry!" mini-game to earn more 🍖');
      return;
    }
    sound.playEat();
    setPet((prev) => ({
      ...prev,
      bigMeatStock: prev.bigMeatStock - 1,
      hunger: Math.min(100, prev.hunger + 25),
      weight: prev.weight + 1,
      happiness: Math.min(100, prev.happiness + 10),
    }));
    showNotification('Fed delicious Big Meat! 🍖 (+25 Hunger, +1g)');
  };

  const handleGiveVitamin = () => {
    if (pet.vitaminStock <= 0) {
      sound.playAlert();
      showNotification('Out of Vitamins! Buy some from the Digi-Shop or catch in mini-game 💊');
      return;
    }
    sound.playMedicine();
    setPet((prev) => ({
      ...prev,
      vitaminStock: prev.vitaminStock - 1,
      isSick: false,
      energy: Math.min(100, prev.energy + 20),
      strength: prev.strength + 2,
      dpPoints: prev.dpPoints + 5,
    }));
    showNotification('Gave Vitamin Protein! 💊 (Cured sickness & restored energy!)');
  };

  const handleCleanPoop = () => {
    sound.playFlush();
    setPet((prev) => ({
      ...prev,
      poopCount: 0,
      happiness: Math.min(100, prev.happiness + 5),
    }));
    showNotification('Flushed and cleaned room spotless! 🧹');
  };

  const handleToggleLights = () => {
    sound.playButton();
    setPet((prev) => ({
      ...prev,
      lightsOff: !prev.lightsOff,
      isSleeping: !prev.lightsOff,
    }));
  };

  const handleCureSick = () => {
    if (pet.isSick) {
      handleGiveVitamin();
    } else {
      sound.playButton();
      showNotification('Digimon is healthy and active! No medicine needed.');
    }
  };

  const handlePetDigimon = () => {
    sound.playButton();
    setPet((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
    }));
    showNotification(`Pet ${pet.nickname || 'Digimon'}! ❤️ Filled with affection!`);
  };

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // MINI-GAMES & BATTLE REWARDS
  const handleTrainingComplete = (success: boolean) => {
    if (success) {
      setPet((prev) => ({
        ...prev,
        trainingCount: prev.trainingCount + 1,
        strength: prev.strength + 10,
        dpPoints: prev.dpPoints + 15,
        weight: Math.max(10, prev.weight - 2),
        happiness: Math.min(100, prev.happiness + 15),
        digiBits: prev.digiBits + 25,
      }));
      showNotification('Dojo Workout Complete! 🥊 (+15 DP, -2g Weight, +25 Bits)');
    } else {
      setPet((prev) => ({
        ...prev,
        trainingCount: prev.trainingCount + 1,
        weight: Math.max(10, prev.weight - 1),
      }));
      showNotification('Training round finished! Keep practicing!');
    }
  };

  const handleFoodGameComplete = (score: number, meatEarned: number, coinsEarned: number) => {
    setPet((prev) => ({
      ...prev,
      bigMeatStock: prev.bigMeatStock + meatEarned,
      digiBits: prev.digiBits + coinsEarned,
      hunger: Math.min(100, prev.hunger + 30),
      happiness: Math.min(100, prev.happiness + 20),
    }));
    showNotification(`Feast Over! Earned +${meatEarned} Big Meat 🍖 & +${coinsEarned} Bits 🪙!`);
  };

  const handleBattleEnd = (won: boolean, coinsReward: number, dpReward: number) => {
    setPet((prev) => ({
      ...prev,
      battlesTotal: prev.battlesTotal + 1,
      battlesWon: won ? prev.battlesWon + 1 : prev.battlesWon,
      digiBits: prev.digiBits + coinsReward,
      dpPoints: prev.dpPoints + dpReward,
      energy: Math.max(10, prev.energy - 15),
    }));
    showNotification(
      won
        ? `Colosseum Victory! +${coinsReward} Bits 🪙 & +${dpReward} DP Power ⚡!`
        : `Battle ended. Earned +${coinsReward} Bits 🪙.`
    );
  };

  // ROOM CUSTOMIZATION
  const handleBuyFurniture = (item: FurnitureItem) => {
    setPet((prev) => ({
      ...prev,
      digiBits: prev.digiBits - item.price,
    }));
  };

  const handlePlaceFurniture = (furnitureId: string, x: number, y: number) => {
    setPet((prev) => ({
      ...prev,
      placedFurniture: [
        ...prev.placedFurniture,
        { instanceId: `inst-${Date.now()}-${Math.random()}`, furnitureId, x, y },
      ],
    }));
    showNotification('Placed new decoration in your Digi-Room! 🛋️');
  };

  const handleRemoveFurniture = (instanceId: string) => {
    setPet((prev) => ({
      ...prev,
      placedFurniture: prev.placedFurniture.filter((f) => f.instanceId !== instanceId),
    }));
    showNotification('Removed decoration from room.');
  };

  const handleUpdateFurniturePosition = (instanceId: string, x: number, y: number) => {
    setPet((prev) => ({
      ...prev,
      placedFurniture: prev.placedFurniture.map((f) =>
        f.instanceId === instanceId ? { ...f, x, y } : f
      ),
    }));
  };

  const handleBuyShopItem = (
    itemId: 'meat' | 'meat_bundle' | 'sirloin' | 'vitamin' | 'vitamin_bundle' | 'energy_drink' | 'medicine',
    cost: number
  ) => {
    if (pet.digiBits < cost) {
      sound.playAlert();
      showNotification('Not enough DigiBits! Win Colosseum battles or train in mini-games!');
      return;
    }

    setPet((prev) => {
      let bigMeatStock = prev.bigMeatStock;
      let vitaminStock = prev.vitaminStock;
      let energy = prev.energy;
      let hunger = prev.hunger;
      let happiness = prev.happiness;
      let isSick = prev.isSick;

      if (itemId === 'meat') {
        bigMeatStock += 1;
      } else if (itemId === 'meat_bundle') {
        bigMeatStock += 5;
      } else if (itemId === 'sirloin') {
        bigMeatStock += 2;
        hunger = Math.min(100, hunger + 35);
        happiness = Math.min(100, happiness + 20);
      } else if (itemId === 'vitamin') {
        vitaminStock += 1;
      } else if (itemId === 'vitamin_bundle') {
        vitaminStock += 5;
      } else if (itemId === 'energy_drink') {
        energy = Math.min(100, energy + 50);
      } else if (itemId === 'medicine') {
        isSick = false;
      }

      return {
        ...prev,
        digiBits: prev.digiBits - cost,
        bigMeatStock,
        vitaminStock,
        energy,
        hunger,
        happiness,
        isSick,
      };
    });

    showNotification(`Purchased item from Bazaar! 🪙 (-${cost} Bits)`);
  };

  const handleChangeTheme = (themeId: string) => {
    setPet((prev) => ({
      ...prev,
      activeRoomTheme: themeId,
    }));
  };

  // NEW EGG / RESET
  const handleSelectNewEgg = (egg: DigiEggInfo, nickname: string) => {
    const starterSpecies = {
      'courage': 'botamon',
      'friendship': 'punimon',
      'love': 'nyokimon',
      'knowledge': 'pabumon',
      'sincerity': 'yuramon',
      'reliability': 'pichimon',
      'hope': 'poyomon',
      'light': 'yukimibotamon',
    }[egg.crest] || 'botamon';

    setPet({
      eggId: egg.id,
      currentSpeciesId: starterSpecies,
      stage: 'fresh',
      nickname,
      birthTimestamp: Date.now(),
      hunger: 90,
      energy: 100,
      happiness: 100,
      discipline: 50,
      weight: 12,
      strength: 15,
      dpPoints: 20,
      isSick: false,
      isSleeping: false,
      lightsOff: false,
      poopCount: 0,
      careMistakes: 0,
      battlesWon: 0,
      battlesTotal: 0,
      trainingCount: 0,
      digiBits: 100,
      bigMeatStock: 8,
      vitaminStock: 5,
      activeRoomTheme: 'file-island',
      placedFurniture: [
        { instanceId: 'init-1', furnitureId: 'meat-grill', x: 28, y: 68 },
      ],
      lastCareCheck: Date.now(),
    });
    setIsEggModalOpen(false);
    showNotification(`Hatched the ${egg.crestName}! Welcome, ${nickname}! ✨`);
  };

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between font-display overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
      
      {/* Dynamic Background Mesh / Digital Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Hellopet Floating Screen Overlay (Active when toggled) */}
      <FloatingOverlay
        pet={pet}
        species={currentSpecies}
        egg={pet.stage === 'egg' ? currentEgg : undefined}
        onFeedMeat={handleFeedMeat}
        onGiveVitamin={handleGiveVitamin}
        onCleanPoop={handleCleanPoop}
        onPet={handlePetDigimon}
        onOpenRoom={() => setIsRoomOpen(true)}
        onOpenColosseum={() => setIsColosseumOpen(true)}
        onOpenDigivice={() => setIsOverlayMode(false)}
        onOpenTraining={() => setIsTrainingOpen(true)}
        onOpenNativePip={() => setIsNativePipOpen(true)}
        isOverlayActive={isOverlayMode}
        onToggleOverlay={() => setIsOverlayMode(false)}
      />


      {/* TOP APP HEADER BAR */}
      <header
        className="relative z-40 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar android-safe-top-bar pb-2.5 sm:pb-2.5"
        style={extraTopPad > 0 ? { paddingTop: `calc(max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 2.75rem) + ${extraTopPad}px)` } : undefined}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          {/* DigiDestined Crest Badge */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-md border border-white/20 shrink-0"
            style={{ backgroundColor: currentEgg.crestColor }}
            title={currentEgg.crestName}
          >
            📟
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-chakra font-bold text-xs sm:text-base tracking-wide text-white truncate">
                DIGIPET
                <span className="hidden sm:inline">: HELLOPET COMPANION</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] font-pixel text-amber-400 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-900 shrink-0">
                {currentSpecies?.stage.toUpperCase()}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
              <span className="truncate">Tamer: {currentEgg.tamerName}</span>
              <span>•</span>
              <span className="text-cyan-400 font-medium truncate">{pet.nickname}</span>
            </div>
          </div>
        </div>

        {/* Top Control Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Meat & Vitamin Quick Stocks (Large Screens) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-full border border-slate-800 text-xs">
            <button
              onClick={handleFeedMeat}
              className="flex items-center gap-1 hover:text-amber-400 transition-colors"
              title="Feed Big Meat"
            >
              <span>🍖</span>
              <span className="font-pixel text-[10px]">{pet.bigMeatStock}</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={handleGiveVitamin}
              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
              title="Give Vitamin"
            >
              <span>💊</span>
              <span className="font-pixel text-[10px]">{pet.vitaminStock}</span>
            </button>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1 text-amber-400" title="DigiBits">
              <span>🪙</span>
              <span className="font-pixel text-[10px]">{pet.digiBits}</span>
            </div>
          </div>

          {/* Hellopet Overlay Mode Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLaunchOverlay}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 px-2 sm:px-3 py-1.5 rounded-full font-pixel text-[10px] font-bold shadow-md shadow-cyan-500/30 flex items-center gap-1 cursor-pointer shrink-0"
            title="Launch Screen Overlay Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">SCREEN OVERLAY</span>
            <span className="md:hidden hidden sm:inline">OVERLAY</span>
          </motion.button>

          {/* Native Floating Window / Overlay */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLaunchFloatOverApps}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white px-2 sm:px-3 py-1.5 rounded-full font-pixel text-[10px] font-bold shadow-md shadow-purple-500/30 flex items-center gap-1 cursor-pointer shrink-0"
            title="Float over YouTube, WhatsApp, and Android Home Screen"
          >
            <span>📱</span>
            <span className="hidden md:inline">FLOAT OVER APPS</span>
            <span className="md:hidden hidden sm:inline">FLOAT</span>
          </motion.button>

          {/* Prominent Reset Button - ALWAYS clearly visible & accessible before volume button */}
          <button
            onClick={() => {
              sound.playButton();
              setIsEggModalOpen(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 hover:from-amber-500/50 hover:to-orange-500/50 border border-amber-400 text-amber-300 font-pixel text-[10px] font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all"
            title="Reset Digimon / Hatch New Egg"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>RESET</span>
          </button>

          {/* Android Notch / Status Bar Spacing Adjuster */}
          <button
            onClick={toggleExtraTopPad}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer flex items-center gap-1 text-[10px] font-pixel border border-slate-700/60"
            title={extraTopPad > 0 ? `Android Notch Offset: +${extraTopPad}px (Click to cycle)` : 'Adjust Android Status Bar / Notch Spacing'}
          >
            <span className="text-amber-400">📐</span>
            <span className="hidden xl:inline">{extraTopPad > 0 ? `+${extraTopPad}px` : 'SAFE AREA'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </header>

      {/* Floating Status Notification Toast */}
      <AnimatePresence>
        {statusNotification && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="fixed top-24 sm:top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-cyan-400 text-cyan-200 font-pixel text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{statusNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN VIEWPORT: AUTHENTIC 1999 DIGIVICE + QUICK TABS */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        
        {/* Navigation Quick Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <button
            onClick={() => {
              sound.playButton();
              setIsShopOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/50 text-amber-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer hover:border-amber-400"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>FILE CITY SHOP</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setIsPwaModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer hover:border-emerald-400"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>INSTALL APK (WEBAPK)</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setIsStatsOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>DIGIMON STATS</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setIsRoomOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MY ROOM (DECOR)</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setIsTrainingOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>TRAINING DOJO</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setIsFoodGameOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <span>🍖</span>
            <span>MEAT CATCH MINI-GAME</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setIsColosseumOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>ONLINE COLOSSEUM</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setIsDigidexOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-sky-950/60 border border-sky-500/40 text-sky-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>DIGIDEX EVOLUTION</span>
          </button>

          {!isGalleryHidden && (
            <button
              onClick={() => {
                sound.playButton();
                setIsGalleryOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/90 to-slate-900 border border-cyan-400/60 text-cyan-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer hover:border-cyan-300 hover:text-white"
              title="Browse all animation frames & verify sprite orientation"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPRITE GALLERY</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playButton();
              setIsChatOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-chakra font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>TAMER LOUNGE</span>
          </button>
        </div>

        {/* Prominent Evolution Ready Callout Banner */}
        {evolutionCheck.can && (
          <motion.button
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            onClick={() => triggerEvolution()}
            className="mb-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-slate-950 px-6 py-2.5 rounded-2xl font-pixel text-xs font-bold shadow-xl shadow-amber-500/30 border-2 border-amber-300 hover:from-amber-300 hover:to-orange-300 cursor-pointer flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
            <span>⚡ DIGIVOLUTION READY! (CLICK TO EVOLVE) ⚡</span>
          </motion.button>
        )}

        {/* 1997 Digivice Hardware Shell */}
        <DigiviceHUD
          pet={pet}
          species={currentSpecies}
          egg={pet.stage === 'egg' ? currentEgg : undefined}
          onFeedMeat={handleFeedMeat}
          onGiveVitamin={handleGiveVitamin}
          onCleanPoop={handleCleanPoop}
          onToggleLights={handleToggleLights}
          onCureSick={handleCureSick}
          onOpenTraining={() => setIsTrainingOpen(true)}
          onOpenColosseum={() => setIsColosseumOpen(true)}
          onOpenRoom={() => setIsRoomOpen(true)}
          onOpenDigidex={() => setIsDigidexOpen(true)}
          onOpenStatsModal={() => setIsStatsOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
          onEvolveTrigger={() => triggerEvolution()}
          onResetEgg={() => setIsEggModalOpen(true)}
          canEvolve={evolutionCheck.can}
        />

        {/* Quick Care Actions Ribbon below device */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          <button
            onClick={handleFeedMeat}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 rounded-2xl flex items-center gap-2 font-pixel text-xs text-amber-300 shadow-md active:scale-95 transition-all"
          >
            <span className="text-base">🍖</span>
            <span>FEED BIG MEAT ({pet.bigMeatStock})</span>
          </button>

          <button
            onClick={handleGiveVitamin}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-purple-500/40 rounded-2xl flex items-center gap-2 font-pixel text-xs text-purple-300 shadow-md active:scale-95 transition-all"
          >
            <span className="text-base">💊</span>
            <span>GIVE VITAMIN ({pet.vitaminStock})</span>
          </button>

          <button
            onClick={() => setIsShopOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 rounded-2xl flex items-center gap-2 font-pixel text-xs text-emerald-300 shadow-md active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>BUY SUPPLIES 🛒</span>
          </button>

          <button
            onClick={handlePetDigimon}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-rose-500/40 rounded-2xl flex items-center gap-2 font-pixel text-xs text-rose-300 shadow-md active:scale-95 transition-all"
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>PET & PRAISE</span>
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-40 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-pixel gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span>DIGIPET VIRTUAL COMPANION • BANDAI 1997 DIGIVICE TOY SIMULATOR</span>
          <button
            onClick={() => {
              sound.playButton();
              setIsGalleryOpen(true);
            }}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Open Sprite Studio & Calibrator (Shortcut: Press G)"
          >
            <Layers className="w-3 h-3" />
            <span>SPRITE STUDIO {isGalleryHidden && '(HIDDEN)'}</span>
          </button>
        </div>
        <button
          onClick={() => setIsPwaModalOpen(true)}
          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>INSTALL NATIVE ANDROID APK (WEBAPK) »</span>
        </button>
      </footer>

      {/* MODALS */}
      <EggSelectionModal
        isOpen={isEggModalOpen}
        onSelectEgg={handleSelectNewEgg}
      />

      <TrainingArena
        pet={pet}
        species={currentSpecies}
        isOpen={isTrainingOpen}
        onClose={() => setIsTrainingOpen(false)}
        onTrainingComplete={handleTrainingComplete}
        onOpenFoodGame={() => setIsFoodGameOpen(true)}
      />

      <FoodCatchGame
        species={currentSpecies}
        isOpen={isFoodGameOpen}
        onClose={() => setIsFoodGameOpen(false)}
        onGameComplete={handleFoodGameComplete}
      />

      <ColosseumBattle
        pet={pet}
        species={currentSpecies}
        isOpen={isColosseumOpen}
        onClose={() => setIsColosseumOpen(false)}
        onBattleEnd={handleBattleEnd}
      />

      <DigiRoom
        pet={pet}
        species={currentSpecies}
        isOpen={isRoomOpen}
        onClose={() => setIsRoomOpen(false)}
        onBuyFurniture={handleBuyFurniture}
        onPlaceFurniture={handlePlaceFurniture}
        onRemoveFurniture={handleRemoveFurniture}
        onUpdateFurniturePosition={handleUpdateFurniturePosition}
        onChangeTheme={handleChangeTheme}
      />

      <DigidexModal
        currentCrest={currentEgg.crest}
        currentSpeciesId={pet.currentSpeciesId}
        isOpen={isDigidexOpen}
        onClose={() => setIsDigidexOpen(false)}
        onSelectSpecies={(speciesId) => triggerEvolution(speciesId)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        pet={pet}
        species={currentSpecies}
        egg={pet.stage === 'egg' ? currentEgg : undefined}
        onOpenTraining={() => setIsTrainingOpen(true)}
        onOpenColosseum={() => setIsColosseumOpen(true)}
        onOpenDigidex={() => setIsDigidexOpen(true)}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        pet={pet}
        onBuyItem={handleBuyShopItem}
      />

      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        onLaunchPip={() => setIsNativePipOpen(true)}
      />

      <NativePipOverlay
        pet={pet}
        species={currentSpecies}
        isOpen={isNativePipOpen}
        onClose={() => setIsNativePipOpen(false)}
      />

      <DigiChat
        pet={pet}
        species={currentSpecies}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <EvolutionModal
        prevSpecies={prevEvoSpecies}
        newSpecies={nextEvoSpecies}
        isOpen={isEvolutionModalOpen}
        onClose={() => setIsEvolutionModalOpen(false)}
      />

      <DigimonGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        currentSpecies={currentSpecies}
      />

    </div>
  );
}
