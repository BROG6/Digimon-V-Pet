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
import { getHideGalleryButtonPref, syncOverridesToRepository, getEffectiveSpriteConfig } from './utils/customSpriteManager';
import { NEW_DIGIMON_SPRITES } from './utils/newDigimonSprites';
import { Capacitor } from '@capacitor/core';
import { 
  checkOverlayPermission, 
  requestOverlayPermission, 
  startNativeFloatingOverlay, 
  stopNativeFloatingOverlay, 
  isNativeOverlayActive 
} from './utils/nativeOverlay';
import { sound, triggerHaptic } from './utils/audio';
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
  Smartphone,
  Menu,
  X,
  ChevronUp,
  Utensils,
  ExternalLink
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
  const [isCareSheetOpen, setIsCareSheetOpen] = useState<boolean>(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState<boolean>(false);

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
    try {
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

        const currentSpeciesConf = getEffectiveSpriteConfig(pet.currentSpeciesId) || NEW_DIGIMON_SPRITES[pet.currentSpeciesId] || NEW_DIGIMON_SPRITES['agumon'];
        const activeFrame = currentSpeciesConf?.frames?.walking?.[0] || currentSpeciesConf?.frames?.standing?.[0] || { x: 2, y: 2, w: 48, h: 48 };

        const ok = await startNativeFloatingOverlay({
          speciesName: currentSpecies?.name || 'Digimon',
          spriteUrl: currentSpeciesConf?.sheetPath || '/assets/aistudio/Copy_of_Agumon_Adventure_04d0832a.png',
          frameX: activeFrame.x || 0,
          frameY: activeFrame.y || 0,
          frameW: activeFrame.w || 48,
          frameH: activeFrame.h || 48,
        });

        if (ok) {
          setStatusNotification(`✓ ${currentSpecies?.name || 'Digimon'} is now floating over all apps! Drag to move.`);
        } else {
          // If native overlay isn't supported, fall back to in-app overlay
          setIsOverlayMode(true);
          setStatusNotification('Floating companion active on screen! Drag to move.');
        }
        setTimeout(() => setStatusNotification(null), 4000);
        return;
      }

      // In web browser: Launch Hellopet Screen Overlay Mode
      setIsOverlayMode(true);
    } catch (err: any) {
      console.warn('handleLaunchOverlay non-fatal error:', err);
      setIsOverlayMode(true);
      setStatusNotification('Floating companion active on screen! Drag to move.');
      setTimeout(() => setStatusNotification(null), 3000);
    }
  };

  const handleLaunchFloatOverApps = async () => {
    sound.playButton();
    try {
      if (isOverlayMode) {
        setIsOverlayMode(false);
        showNotification('Docked Digimon back into Digivice.');
        return;
      }

      if (Capacitor.isNativePlatform()) {
        await handleLaunchOverlay();
        return;
      }

      // In browser / PWA / preview: toggle floating screen overlay
      setIsOverlayMode(true);
      showNotification(`✨ ${currentSpecies?.name || 'Digimon'} is now floating on screen! Drag to move or tap for actions.`);
    } catch (err: any) {
      console.error('handleLaunchFloatOverApps error:', err);
      setIsOverlayMode(true);
    }
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


      {/* TOP APP HEADER BAR (MOBILE-NATIVE & NOTCH SAFE) */}
      <header
        className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 flex items-center justify-between gap-2 android-safe-top-bar"
        style={extraTopPad > 0 ? { paddingTop: `calc(max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 2.75rem) + ${extraTopPad}px)` } : undefined}
      >
        {/* Left: Crest Badge + Name + Stage + Quick Vitals */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-md border border-white/20 shrink-0"
            style={{ backgroundColor: currentEgg.crestColor }}
            title={currentEgg.crestName}
          >
            📟
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-chakra font-bold text-sm tracking-wide text-white truncate">
                {pet.nickname}
              </h1>
              <span className="text-[8px] font-pixel text-amber-400 px-1.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-900 shrink-0">
                {currentSpecies?.stage.toUpperCase()}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
              <span className="text-amber-300 font-pixel text-[9px]">🪙 {pet.digiBits}</span>
              <span>•</span>
              <span className="text-orange-300 font-pixel text-[9px]">🍖 {pet.bigMeatStock}</span>
              <span>•</span>
              <span className="text-purple-300 font-pixel text-[9px]">💊 {pet.vitaminStock}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Mobile Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Float Pet Over Apps (Android System Alert / PiP) */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              triggerHaptic('medium');
              handleLaunchFloatOverApps();
            }}
            className={`px-2.5 py-1.5 rounded-xl font-pixel text-[9px] font-bold shadow-md flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${
              isOverlayMode
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/25 ring-1 ring-emerald-400'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25'
            }`}
            title={isOverlayMode ? 'Dock Digimon back to Digivice' : 'Float Digimon on screen'}
          >
            <span>{isOverlayMode ? '📟' : '📱'}</span>
            <span>{isOverlayMode ? 'DOCK' : 'FLOAT'}</span>
          </motion.button>

          {/* Reset / Hatch New Egg */}
          <button
            onClick={() => {
              sound.playButton();
              setIsEggModalOpen(true);
            }}
            className="p-1.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 hover:bg-amber-900/60 transition-colors cursor-pointer"
            title="Hatch New Egg / Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
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
            className="fixed top-24 sm:top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-cyan-400 text-cyan-200 font-pixel text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 pointer-events-none max-w-[90vw] text-center"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            <span className="truncate">{statusNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN VIEWPORT: PURE MOBILE PORTRAIT LAYOUT */}
      <main className="flex-1 flex flex-col items-center justify-start px-3 py-2 relative z-10 max-w-md mx-auto w-full pb-24">
        
        {/* Prominent Evolution Ready Callout Banner */}
        {evolutionCheck.can && (
          <motion.button
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            onClick={() => {
              triggerHaptic('success');
              triggerEvolution();
            }}
            className="w-full mb-2.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-slate-950 py-2.5 px-4 rounded-2xl font-pixel text-xs font-bold shadow-xl shadow-amber-500/30 border-2 border-amber-300 cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
            <span>⚡ DIGIVOLUTION READY! (TAP TO EVOLVE) ⚡</span>
          </motion.button>
        )}

        {/* Mobile Vitals Dashboard Bar */}
        <div className="w-full grid grid-cols-4 gap-1.5 mb-2.5 text-[9px] font-pixel">
          {/* Hunger */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-300">
              <span>🍖</span>
              <span>{pet.hunger}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pet.hunger}%` }} />
            </div>
          </div>

          {/* Energy */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 flex flex-col items-center">
            <div className="flex items-center gap-1 text-cyan-300">
              <span>⚡</span>
              <span>{pet.energy}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full transition-all" style={{ width: `${pet.energy}%` }} />
            </div>
          </div>

          {/* Happiness */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 flex flex-col items-center">
            <div className="flex items-center gap-1 text-rose-300">
              <span>💖</span>
              <span>{pet.happiness}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
              <div className="bg-rose-400 h-full rounded-full transition-all" style={{ width: `${pet.happiness}%` }} />
            </div>
          </div>

          {/* DP / Battles */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 flex flex-col items-center">
            <div className="flex items-center gap-1 text-purple-300">
              <span>⚔️</span>
              <span>{pet.dpPoints} DP</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
              <div className="bg-purple-400 h-full rounded-full transition-all" style={{ width: `${Math.min(100, pet.dpPoints * 2)}%` }} />
            </div>
          </div>
        </div>

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

        {/* Quick Care Actions Ribbon */}
        <div className="w-full grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => {
              handleFeedMeat();
              triggerHaptic('heavy');
            }}
            className="py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 rounded-2xl flex items-center justify-center gap-2 font-pixel text-[11px] text-amber-300 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-base">🍖</span>
            <span>FEED MEAT ({pet.bigMeatStock})</span>
          </button>

          <button
            onClick={() => {
              handleGiveVitamin();
              triggerHaptic('heavy');
            }}
            className="py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 rounded-2xl flex items-center justify-center gap-2 font-pixel text-[11px] text-purple-300 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-base">💊</span>
            <span>VITAMIN ({pet.vitaminStock})</span>
          </button>
        </div>

        {/* Poop cleaning / Sickness urgent alerts */}
        {(pet.poopCount > 0 || pet.isSick) && (
          <div className="w-full flex gap-2 mt-2">
            {pet.poopCount > 0 && (
              <button
                onClick={() => {
                  handleCleanPoop();
                  triggerHaptic('medium');
                }}
                className="flex-1 py-2 px-3 bg-amber-950/70 border border-amber-500 rounded-xl flex items-center justify-center gap-1.5 font-pixel text-[10px] text-amber-200 animate-pulse active:scale-95 cursor-pointer"
              >
                <span>💩</span>
                <span>FLUSH {pet.poopCount} POOP(S)</span>
              </button>
            )}
            {pet.isSick && (
              <button
                onClick={() => {
                  handleCureSick();
                  triggerHaptic('heavy');
                }}
                className="flex-1 py-2 px-3 bg-rose-950/70 border border-rose-500 rounded-xl flex items-center justify-center gap-1.5 font-pixel text-[10px] text-rose-200 animate-bounce active:scale-95 cursor-pointer"
              >
                <span>💉</span>
                <span>INJECT MEDICINE</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* SLIDE-UP CARE ACTION SHEET */}
      <AnimatePresence>
        {isCareSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCareSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-14 left-0 right-0 z-50 max-w-md mx-auto bg-slate-900 border-t-2 border-amber-500 rounded-t-3xl p-4 shadow-2xl"
            >
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-pixel text-xs text-amber-300 flex items-center gap-1.5">
                  <span>🍖</span>
                  <span>DIGIPET CARE CENTER</span>
                </h3>
                <button
                  onClick={() => setIsCareSheetOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-pixel">
                <button
                  onClick={() => {
                    handleFeedMeat();
                    triggerHaptic('heavy');
                  }}
                  className="p-3 bg-slate-800 hover:bg-amber-950/60 border border-amber-500/40 rounded-2xl flex flex-col items-center gap-1 text-amber-300 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-2xl">🍖</span>
                  <span>FEED MEAT</span>
                  <span className="text-[9px] text-slate-400">Stock: {pet.bigMeatStock}</span>
                </button>

                <button
                  onClick={() => {
                    handleGiveVitamin();
                    triggerHaptic('heavy');
                  }}
                  className="p-3 bg-slate-800 hover:bg-purple-950/60 border border-purple-500/40 rounded-2xl flex flex-col items-center gap-1 text-purple-300 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-2xl">💊</span>
                  <span>GIVE VITAMIN</span>
                  <span className="text-[9px] text-slate-400">Stock: {pet.vitaminStock}</span>
                </button>

                <button
                  onClick={() => {
                    handleCleanPoop();
                    triggerHaptic('medium');
                  }}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 rounded-2xl flex flex-col items-center gap-1 text-amber-300 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-2xl">💩</span>
                  <span>FLUSH POOP</span>
                  <span className="text-[9px] text-slate-400">{pet.poopCount > 0 ? `${pet.poopCount} on screen` : 'Clean!'}</span>
                </button>

                <button
                  onClick={() => {
                    handlePetDigimon();
                    triggerHaptic('medium');
                  }}
                  className="p-3 bg-slate-800 hover:bg-rose-950/60 border border-rose-500/40 rounded-2xl flex flex-col items-center gap-1 text-rose-300 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-2xl">💖</span>
                  <span>PET & PRAISE</span>
                  <span className="text-[9px] text-slate-400">Happiness: {pet.happiness}%</span>
                </button>

                <button
                  onClick={() => {
                    handleCureSick();
                    triggerHaptic('heavy');
                  }}
                  className="p-3 bg-slate-800 hover:bg-teal-950/60 border border-teal-500/40 rounded-2xl flex flex-col items-center gap-1 text-teal-300 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-2xl">💉</span>
                  <span>MEDICINE</span>
                  <span className="text-[9px] text-slate-400">{pet.isSick ? 'SICK!' : 'Healthy'}</span>
                </button>

                <button
                  onClick={() => {
                    handleToggleLights();
                    triggerHaptic('light');
                  }}
                  className="p-3 bg-slate-800 hover:bg-indigo-950/60 border border-indigo-500/40 rounded-2xl flex flex-col items-center gap-1 text-indigo-300 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-2xl">{pet.lightsOff ? '☀️' : '🌙'}</span>
                  <span>{pet.lightsOff ? 'LIGHTS ON' : 'SLEEP / OFF'}</span>
                  <span className="text-[9px] text-slate-400">{pet.isSleeping ? 'Sleeping zzz' : 'Awake'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SLIDE-UP MORE MENU SHEET */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-14 left-0 right-0 z-50 max-w-md mx-auto bg-slate-900 border-t-2 border-cyan-500 rounded-t-3xl p-4 shadow-2xl"
            >
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-pixel text-xs text-cyan-300 flex items-center gap-1.5">
                  <span>📱</span>
                  <span>MORE MOBILE FEATURES</span>
                </h3>
                <button
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-chakra font-bold">
                <button
                  onClick={() => {
                    sound.playButton();
                    setIsMoreSheetOpen(false);
                    setIsDigidexOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-sky-950/60 border border-sky-500/40 rounded-2xl flex items-center gap-2.5 text-sky-300 cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-sky-400 shrink-0" />
                  <span className="truncate">DIGIDEX GUIDE</span>
                </button>

                <button
                  onClick={() => {
                    sound.playButton();
                    setIsMoreSheetOpen(false);
                    setIsStatsOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-amber-950/60 border border-amber-500/40 rounded-2xl flex items-center gap-2.5 text-amber-300 cursor-pointer"
                >
                  <Activity className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="truncate">RADAR STATS</span>
                </button>

                <button
                  onClick={() => {
                    sound.playButton();
                    setIsMoreSheetOpen(false);
                    setIsFoodGameOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-amber-950/60 border border-amber-500/40 rounded-2xl flex items-center gap-2.5 text-amber-300 cursor-pointer"
                >
                  <span className="text-xl shrink-0">🍖</span>
                  <span className="truncate">MEAT CATCH GAME</span>
                </button>

                <button
                  onClick={() => {
                    sound.playButton();
                    setIsMoreSheetOpen(false);
                    setIsChatOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-pink-950/60 border border-pink-500/40 rounded-2xl flex items-center gap-2.5 text-pink-300 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5 text-pink-400 shrink-0" />
                  <span className="truncate">TAMER LOUNGE</span>
                </button>

                {!isGalleryHidden && (
                  <button
                    onClick={() => {
                      sound.playButton();
                      setIsMoreSheetOpen(false);
                      setIsGalleryOpen(true);
                    }}
                    className="p-3 bg-slate-800 hover:bg-cyan-950/60 border border-cyan-500/40 rounded-2xl flex items-center gap-2.5 text-cyan-300 cursor-pointer"
                  >
                    <Layers className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span className="truncate">SPRITE STUDIO</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    sound.playButton();
                    setIsMoreSheetOpen(false);
                    setIsNativePipOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-purple-950/60 border border-purple-500/40 rounded-2xl flex items-center gap-2.5 text-purple-300 cursor-pointer"
                >
                  <ExternalLink className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="truncate">SYSTEM OVERLAY (PIP)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playButton();
                    setIsMoreSheetOpen(false);
                    setIsPwaModalOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center gap-2.5 text-emerald-300 cursor-pointer"
                >
                  <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="truncate">INSTALL APK</span>
                </button>

                <button
                  onClick={() => {
                    toggleExtraTopPad();
                  }}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl flex items-center gap-2.5 text-slate-300 cursor-pointer"
                >
                  <span className="text-amber-400 font-pixel text-xs">📐</span>
                  <span className="truncate text-xs">NOTCH: +{extraTopPad}px</span>
                </button>

                <button
                  onClick={() => {
                    sound.playButton();
                    setIsMoreSheetOpen(false);
                    setIsEggModalOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-red-950/60 border border-red-500/40 rounded-2xl flex items-center gap-2.5 text-rose-300 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5 text-rose-400 shrink-0" />
                  <span className="truncate">RESET / HATCH</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NATIVE MOBILE FIXED BOTTOM DOCK */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-[max(calc(env(safe-area-inset-bottom,0px)+0.4rem),0.6rem)] pt-1.5 px-2">
        <div className="max-w-md mx-auto grid grid-cols-7 gap-1 items-center text-center">
          
          {/* 1. DIGIVICE */}
          <button
            onClick={() => {
              sound.playButton();
              triggerHaptic('light');
              setIsCareSheetOpen(false);
              setIsMoreSheetOpen(false);
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-slate-800 active:scale-90 transition-transform cursor-pointer text-cyan-400"
          >
            <span className="text-lg">📟</span>
            <span className="font-pixel text-[8px] mt-0.5">DEVICE</span>
          </button>

          {/* 2. CARE SHEET */}
          <button
            onClick={() => {
              sound.playButton();
              triggerHaptic('medium');
              setIsCareSheetOpen((prev) => !prev);
              setIsMoreSheetOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl active:scale-90 transition-transform cursor-pointer relative ${
              isCareSheetOpen ? 'bg-amber-950/80 text-amber-300 ring-1 ring-amber-400' : 'text-amber-400 hover:bg-slate-800'
            }`}
          >
            <span className="text-lg">🍖</span>
            <span className="font-pixel text-[8px] mt-0.5">CARE</span>
            {(pet.poopCount > 0 || pet.isSick) && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          {/* 3. BATTLE */}
          <button
            onClick={() => {
              sound.playButton();
              triggerHaptic('light');
              setIsColosseumOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-slate-800 active:scale-90 transition-transform cursor-pointer text-indigo-400"
          >
            <Swords className="w-4.5 h-4.5 text-indigo-400" />
            <span className="font-pixel text-[8px] mt-0.5">BATTLE</span>
          </button>

          {/* 4. DOJO */}
          <button
            onClick={() => {
              sound.playButton();
              triggerHaptic('light');
              setIsTrainingOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-slate-800 active:scale-90 transition-transform cursor-pointer text-emerald-400"
          >
            <Dumbbell className="w-4.5 h-4.5 text-emerald-400" />
            <span className="font-pixel text-[8px] mt-0.5">DOJO</span>
          </button>

          {/* 5. ROOM */}
          <button
            onClick={() => {
              sound.playButton();
              triggerHaptic('light');
              setIsRoomOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-slate-800 active:scale-90 transition-transform cursor-pointer text-teal-400"
          >
            <Home className="w-4.5 h-4.5 text-teal-400" />
            <span className="font-pixel text-[8px] mt-0.5">ROOM</span>
          </button>

          {/* 6. SHOP */}
          <button
            onClick={() => {
              sound.playButton();
              triggerHaptic('light');
              setIsShopOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-slate-800 active:scale-90 transition-transform cursor-pointer text-amber-300"
          >
            <ShoppingBag className="w-4.5 h-4.5 text-amber-300" />
            <span className="font-pixel text-[8px] mt-0.5">SHOP</span>
          </button>

          {/* 7. MORE */}
          <button
            onClick={() => {
              sound.playButton();
              triggerHaptic('light');
              setIsMoreSheetOpen((prev) => !prev);
              setIsCareSheetOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl active:scale-90 transition-transform cursor-pointer ${
              isMoreSheetOpen ? 'bg-slate-800 text-white ring-1 ring-cyan-400' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Menu className="w-4.5 h-4.5 text-slate-300" />
            <span className="font-pixel text-[8px] mt-0.5">MORE</span>
          </button>

        </div>
      </nav>

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
