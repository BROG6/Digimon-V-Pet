import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PetState, 
  DigimonSpecies, 
  DigiEggInfo, 
  FurnitureItem, 
  DigimonStage,
  SpecialItemId,
  AdventureBattleResult
} from './types/digimon';
import { DIGI_EGGS, DIGIMON_DATABASE, FURNITURE_SHOP, ROOM_THEMES, SPECIAL_ITEMS } from './data/digidex';
import { DigiviceHUD } from './components/DigiviceHUD';
import { PixelMeatIcon, PixelVitaminIcon, PixelPoopIcon } from './components/PixelItemIcons';
import { FloatingOverlay } from './components/FloatingOverlay';
import { EggSelectionModal } from './components/EggSelectionModal';
import { TrainingArena } from './components/TrainingArena';
import { FoodCatchGame } from './components/FoodCatchGame';
import { ColosseumBattle } from './components/ColosseumBattle';
import { AdventureModal } from './components/AdventureModal';
import { EvolutionModal } from './components/EvolutionModal';
import { DigiRoom } from './components/DigiRoom';
import { DigidexModal } from './components/DigidexModal';
import { StatsModal } from './components/StatsModal';
import { ShopModal } from './components/ShopModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { NativePipOverlay } from './components/NativePipOverlay';
import { DigiChat } from './components/DigiChat';
import { DigimonTalkModal } from './components/DigimonTalkModal';
import { DigimonGallery } from './components/DigimonGallery';
import { AppUpdateModal } from './components/AppUpdateModal';
import { GridAlignmentModal } from './components/GridAlignmentModal';
import {
  GRID_RATIOS_CHANGED_EVENT,
  getSavedGridPreset,
  hasCustomRowRatios,
} from './utils/petOverlayEngine';
import {
  checkForUpdate,
  UpdateManifest,
  UpdateCheckResult,
  getAutoCheckEnabled,
  markUpdateNotified,
  dismissUpdateVersion,
} from './utils/appUpdater';
import { getHideGalleryButtonPref, syncOverridesToRepository } from './utils/customSpriteManager';
import { Capacitor } from '@capacitor/core';
import { 
  checkOverlayPermission, 
  requestOverlayPermission, 
  startNativeFloatingOverlay, 
  stopNativeFloatingOverlay, 
  isNativeOverlayActive,
  consumeNativeOverlayEvolution,
  consumeNativeOverlayCareActions,
} from './utils/nativeOverlay';
import {
  applyEvolutionToPetState,
  buildNativeOverlayPayload,
  checkEvolutionEligibility,
  computeNaturalEvoTiming,
  formatDurationMs,
  loadUnlockedSpeciesIds,
  recordUnlockedSpeciesId,
  saveUnlockedSpeciesIds,
} from './utils/evolutionEngine';
import confetti from 'canvas-confetti';
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
  ExternalLink,
  Download,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

const STORAGE_KEY = 'digipet_vpet_save_v1';

export default function App() {
  // Master Pet State
  const [pet, setPet] = useState<PetState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validSpeciesId = DIGIMON_DATABASE[parsed.currentSpeciesId] ? parsed.currentSpeciesId : 'botamon';
        const seedUnlocked = [
          ...(Array.isArray(parsed.unlockedSpeciesIds) ? parsed.unlockedSpeciesIds : []),
          ...(parsed.stage && parsed.stage !== 'egg' ? [validSpeciesId] : []),
        ];
        const unlockedSpeciesIds = saveUnlockedSpeciesIds(loadUnlockedSpeciesIds(seedUnlocked));
        return {
          playerName: '',
          effort: 0,
          stageBattlesWon: parsed.battlesWon ?? 0,
          stageBattlesTotal: parsed.battlesTotal ?? 0,
          stageTrainingCount: parsed.trainingCount ?? 0,
          equippedSpecialItem: null,
          ownedSpecialItems: [],
          adventureClearedWave: {},
          battleExp: 0,
          evolutionLocked: false,
          isDead: false,
          neglectTicks: 0,
          ...parsed,
          stageEnteredAt: parsed.stageEnteredAt || Date.now(),
          currentSpeciesId: validSpeciesId,
          unlockedSpeciesIds,
        };
      }
    } catch (e) {}

    // Default starting state (Egg 01: Dragon / Fire incubating on Digivice)
    return {
      eggId: 'egg-courage',
      currentSpeciesId: 'botamon',
      stage: 'egg',
      nickname: '',
      playerName: '',
      birthTimestamp: Date.now(),
      stageEnteredAt: Date.now(),
      hunger: 90,
      energy: 100,
      happiness: 100,
      discipline: 60,
      weight: 12,
      strength: 15,
      dpPoints: 20,
      effort: 0,
      isSick: false,
      isSleeping: false,
      lightsOff: false,
      poopCount: 0,
      careMistakes: 0,
      battlesWon: 0,
      battlesTotal: 0,
      trainingCount: 0,
      stageBattlesWon: 0,
      stageBattlesTotal: 0,
      stageTrainingCount: 0,
      equippedSpecialItem: null,
      ownedSpecialItems: [],
      digiBits: 150,
      bigMeatStock: 8,
      vitaminStock: 5,
      activeRoomTheme: 'file-island',
      placedFurniture: [
        { instanceId: 'init-1', furnitureId: 'meat-grill', x: 28, y: 68 },
        { instanceId: 'init-2', furnitureId: 'cozy-cushion', x: 74, y: 72 },
      ],
      lastCareCheck: Date.now(),
      evolutionLocked: false,
      isDead: false,
      neglectTicks: 0,
      adventureClearedWave: {},
      battleExp: 0,
      unlockedSpeciesIds: loadUnlockedSpeciesIds(),
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
  const [isAdventureOpen, setIsAdventureOpen] = useState<boolean>(false);
  const [isRoomOpen, setIsRoomOpen] = useState<boolean>(false);
  const [isDigidexOpen, setIsDigidexOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  const [isNativePipOpen, setIsNativePipOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isTalkModalOpen, setIsTalkModalOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isGalleryHidden, setIsGalleryHidden] = useState<boolean>(() => getHideGalleryButtonPref());
  const [isCareSheetOpen, setIsCareSheetOpen] = useState<boolean>(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState<boolean>(false);
  const [isGridModalOpen, setIsGridModalOpen] = useState<boolean>(false);
  const [isGridCustom, setIsGridCustom] = useState<boolean>(() => hasCustomRowRatios(getSavedGridPreset()));
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [updateManifest, setUpdateManifest] = useState<UpdateManifest | null>(null);
  const [hasUpdateAvailable, setHasUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    const syncGridFlag = () => setIsGridCustom(hasCustomRowRatios(getSavedGridPreset()));
    window.addEventListener(GRID_RATIOS_CHANGED_EVENT, syncGridFlag);
    return () => window.removeEventListener(GRID_RATIOS_CHANGED_EVENT, syncGridFlag);
  }, []);

  // Background Auto-Updater check on startup (Native APK builds only — Web app is always up to date)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (!getAutoCheckEnabled()) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      checkForUpdate()
        .then((res) => {
          if (cancelled) return;
          if (res.updateAvailable && res.manifest) {
            setUpdateManifest(res.manifest);
            setHasUpdateAvailable(res.shouldShowBanner);
            if (res.shouldNotify) {
              markUpdateNotified(res.manifest.versionName);
              setStatusNotification(`New update v${res.manifest.versionName} available! Tap UPDATE NOW to install.`);
              setTimeout(() => setStatusNotification(null), 5000);
            }
          } else {
            setHasUpdateAvailable(false);
          }
        })
        .catch(() => {});
    }, 2400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

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

  // Evolution & Egg Hatching Transition State
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState<boolean>(false);
  const [prevEvoSpecies, setPrevEvoSpecies] = useState<DigimonSpecies | undefined>(undefined);
  const [nextEvoSpecies, setNextEvoSpecies] = useState<DigimonSpecies>(DIGIMON_DATABASE['agumon']);
  const [isHatchingEgg, setIsHatchingEgg] = useState<boolean>(false);
  const eggHatchInProgressRef = useRef<boolean>(false);

  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [hudAction, setHudAction] = useState<{ pose: 'eating' | 'happy' | 'flushing'; nonce: number; eatItem?: 'meat' | 'vitamin' } | null>(null);

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
          setStatusNotification('Android: Opening "Allow display over other apps" Settings...');
          setTimeout(() => setStatusNotification(null), 5000);
          await requestOverlayPermission();
          setIsNativePipOpen(true);
          return;
        }

        const active = await isNativeOverlayActive();
        if (active) {
          await stopNativeFloatingOverlay();
          setStatusNotification('Floating screen overlay closed.');
          setTimeout(() => setStatusNotification(null), 3000);
          return;
        }

        const ok = await startNativeFloatingOverlay(
          buildNativeOverlayPayload({
            pet,
            species: currentSpecies,
          })
        );

        if (ok) {
          setStatusNotification(`✓ ${currentSpecies?.name || 'Digimon'} is now floating over all apps! Drag to move.`);
        } else {
          setIsNativePipOpen(true);
        }
        setTimeout(() => setStatusNotification(null), 4000);
        return;
      }

      // In web browser: Launch permission / overlay modal
      setIsNativePipOpen(true);
    } catch (err: any) {
      console.warn('handleLaunchOverlay non-fatal error:', err);
      setIsNativePipOpen(true);
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

      if (!requireAliveAndHatched()) return;

      if (Capacitor.isNativePlatform()) {
        const hasPerm = await checkOverlayPermission();
        if (!hasPerm) {
          // Immediately prompt Android's system overlay permission setting AND open modal!
          await requestOverlayPermission();
          setIsNativePipOpen(true);
          showNotification('Android: Opening "Allow display over other apps" Settings...');
          return;
        }
      }

      // Always pop up the Display Over Other Apps Permission & Controller modal
      setIsNativePipOpen(true);
    } catch (err: any) {
      console.error('handleLaunchFloatOverApps error:', err);
      setIsNativePipOpen(true);
    }
  };

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
    } catch (e) {}
  }, [pet]);

  // Periodic Virtual Pet Care Loop (Hunger, Poop, Neglect Care Mistakes & Death)
  useEffect(() => {
    const careInterval = setInterval(() => {
      const now = Date.now();
      let criticalWarning: string | null = null;
      let deathNotice: string | null = null;

      setPet((prev) => {
        if (prev.stage === 'egg' || prev.isDead) {
          return prev;
        }

        const hunger = prev.lightsOff ? prev.hunger : Math.max(0, prev.hunger - 3);
        const energy = prev.lightsOff ? Math.min(100, prev.energy + 10) : Math.max(0, prev.energy - 2);
        let poopCount = prev.poopCount;
        let isSick = prev.isSick;
        let sickSince = prev.sickSince;
        let careMistakes = prev.careMistakes;
        let neglectTicks = prev.neglectTicks ?? 0;

        // Chance to poop while awake and fed
        if (!prev.lightsOff && prev.hunger > 50 && Math.random() < 0.25 && poopCount < 4) {
          poopCount += 1;
        }

        const isNeglectedNow = !prev.lightsOff && (hunger === 0 || poopCount >= 3 || energy === 0);

        if (isNeglectedNow) {
          neglectTicks += 1;
          if (neglectTicks >= 3) {
            neglectTicks = 0;
            careMistakes += 1;
            sound.playAlert();
          }
          if ((poopCount >= 3 || hunger === 0) && !isSick && Math.random() < 0.45) {
            isSick = true;
            sickSince = sickSince ?? now;
            if (neglectTicks > 0) {
              careMistakes += 1;
              neglectTicks = 0;
            }
            sound.playAlert();
          }
        } else if (!isSick) {
          neglectTicks = 0;
        }

        if (isSick && !sickSince) {
          sickSince = now;
        }

        const sickElapsedMs = isSick && sickSince ? now - sickSince : 0;

        // Death check from severe / prolonged neglect
        if (careMistakes >= 8) {
          deathNotice = 'Your Digimon passed away from severe neglect (8+ Care Mistakes).';
          sound.playAlert();
          return {
            ...prev,
            hunger,
            energy,
            poopCount,
            isSick,
            sickSince,
            careMistakes,
            neglectTicks,
            isDead: true,
            diedAt: now,
            deathReason: 'Severe neglect (8+ Care Mistakes).',
            isSleeping: false,
            lightsOff: false,
            lastCareCheck: now,
          };
        }

        if (isSick && sickElapsedMs >= 20 * 60_000 && (!prev.lightsOff || (hunger === 0 && poopCount >= 3))) {
          deathNotice = 'Your Digimon passed away from untreated sickness and neglect.';
          sound.playAlert();
          return {
            ...prev,
            hunger,
            energy,
            poopCount,
            isSick,
            sickSince,
            careMistakes,
            neglectTicks,
            isDead: true,
            diedAt: now,
            deathReason: 'Untreated sickness persisted too long.',
            isSleeping: false,
            lightsOff: false,
            lastCareCheck: now,
          };
        }

        if (careMistakes >= 6 || (isSick && sickElapsedMs >= 10 * 60_000)) {
          criticalWarning = '🚨 CRITICAL NEGLECT! Feed, flush & cure sickness right away!';
        }

        return {
          ...prev,
          hunger,
          energy,
          poopCount,
          isSick,
          sickSince,
          careMistakes,
          neglectTicks,
          lastCareCheck: now,
        };
      });

      if (deathNotice) {
        showNotification(`🪦 ${deathNotice}`);
      } else if (criticalWarning) {
        showNotification(criticalWarning);
      }
    }, 25000);

    return () => clearInterval(careInterval);
  }, []);

  const [evoNowMs, setEvoNowMs] = useState<number>(() => Date.now());
  const evoElig = checkEvolutionEligibility(pet, currentSpecies);
  const evoTiming = computeNaturalEvoTiming(pet, currentSpecies, evoNowMs);
  const evolutionCheck = { can: evoTiming.readyToEvolve, nextId: evoElig.nextId };

  // Continuous 1s clock tick while Pendulum Ver. 20th timer is active (ticks even during sleep)
  useEffect(() => {
    if (pet.isDead || pet.evolutionLocked || pet.stage === 'mega') return;
    setEvoNowMs(Date.now());
    const id = setInterval(() => {
      setEvoNowMs(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [pet.isDead, pet.evolutionLocked, pet.stage, pet.currentSpeciesId, pet.stageEnteredAt]);

  // Lock evolution permanently for this lifetime if Pendulum Ver. 20th deadline expired without meeting requirements
  useEffect(() => {
    if (!evoTiming.missedDeadline || pet.evolutionLocked || pet.isDead) return;
    sound.playAlert();
    const monName = pet.nickname?.trim() || currentSpecies?.name || 'Digimon';
    setPet((prev) => {
      if (prev.evolutionLocked || prev.isDead) return prev;
      return {
        ...prev,
        evolutionLocked: true,
      };
    });
    showNotification(`🔒 Evolution window expired! ${monName} missed the requirements and can no longer evolve.`);
  }, [evoTiming.missedDeadline, pet.evolutionLocked, pet.isDead, pet.nickname, currentSpecies?.name]);

  // Evolution Trigger (supports silent in-place updates while overlay is active)
  const triggerEvolution = (targetSpeciesId?: string, opts?: { silentForOverlay?: boolean }) => {
    if (pet.isDead || pet.evolutionLocked) return;
    const targetId = targetSpeciesId || evolutionCheck.nextId;
    if (!targetId || !DIGIMON_DATABASE[targetId]) return;

    const prevName = currentSpecies?.name || pet.nickname || 'Digimon';
    const target = DIGIMON_DATABASE[targetId];

    if (opts?.silentForOverlay) {
      sound.playEvolution();
      showNotification(`⚡ ${prevName} naturally Digivolved into ${target.name}!`);
    } else {
      setPrevEvoSpecies(currentSpecies);
      setNextEvoSpecies(target);
      setIsEvolutionModalOpen(true);
    }

    setPet((prev) => applyEvolutionToPetState(prev, target));
  };

  // Automatic Egg Hatching Animation -> Baby I + Pendulum Ver. 20th Automatic Evolution
  useEffect(() => {
    if (pet.isDead || pet.evolutionLocked) return;

    // 1. Egg -> Fresh hatching sequence on the Digivice
    if (pet.stage === 'egg' && evoTiming.readyToEvolve && !eggHatchInProgressRef.current) {
      eggHatchInProgressRef.current = true;
      setIsHatchingEgg(true);
      sound.playDigivolve();
      showNotification(`🥚✨ Egg #${String(currentEgg.eggNumber).padStart(2, '0')} (${currentEgg.crestName}) is hatching!`);

      const hatchTimer = window.setTimeout(() => {
        const baby1Id = currentEgg.baby1Id || 'botamon';
        const baby1 = DIGIMON_DATABASE[baby1Id];
        const now = Date.now();
        sound.playVictory();
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.55 },
            colors: [currentEgg.crestColor, '#ffffff', '#fbbf24'],
          });
        } catch {}

        setPet((prev) => ({
          ...prev,
          currentSpeciesId: baby1Id,
          stage: 'fresh',
          birthTimestamp: now,
          stageEnteredAt: now,
          evoGoalMetAt: undefined,
          evolutionLocked: false,
          hunger: 90,
          energy: 100,
          happiness: 100,
          isSick: false,
          sickSince: undefined,
          neglectTicks: 0,
          unlockedSpeciesIds: recordUnlockedSpeciesId(baby1Id, prev.unlockedSpeciesIds || []),
        }));
        setIsHatchingEgg(false);
        eggHatchInProgressRef.current = false;
        showNotification(`🐣 Hatched into ${baby1?.name || 'Baby Digimon'}!`);
      }, 2200);

      return () => {
        window.clearTimeout(hatchTimer);
      };
    }

    if (pet.stage === 'egg') return;

    // 2. Fresh -> In-Training -> Rookie -> Champion -> Ultimate -> Mega
    if (!evoTiming.readyToEvolve || !evoTiming.nextId) return;
    if (
      isTrainingOpen ||
      isFoodGameOpen ||
      isColosseumOpen ||
      isAdventureOpen ||
      isEvolutionModalOpen ||
      isEggModalOpen
    ) {
      return;
    }

    triggerEvolution(evoTiming.nextId, { silentForOverlay: isOverlayMode });
  }, [
    pet.isDead,
    pet.evolutionLocked,
    pet.stage,
    evoTiming.readyToEvolve,
    evoTiming.nextId,
    currentEgg.eggNumber,
    currentEgg.crestName,
    currentEgg.crestColor,
    currentEgg.baby1Id,
    isOverlayMode,
    isTrainingOpen,
    isFoodGameOpen,
    isColosseumOpen,
    isAdventureOpen,
    isEvolutionModalOpen,
    isEggModalOpen,
  ]);

  // Native Android Overlay: sync evolutions done in background & push live updates in-place
  const lastNativeSpeciesRef = useRef<string>(pet.currentSpeciesId);
  const skipNativeEvoBubbleForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isPulling = false;
    const pullNativeOverlayEvolution = async () => {
      if (isPulling) return;
      isPulling = true;
      try {
        const pending = await consumeNativeOverlayEvolution();
        if (pending.speciesId && DIGIMON_DATABASE[pending.speciesId]) {
          const evolvedSpecies = DIGIMON_DATABASE[pending.speciesId];
          skipNativeEvoBubbleForRef.current = pending.speciesId;
          setPet((prev) => {
            if (prev.currentSpeciesId === evolvedSpecies.id) return prev;
            return applyEvolutionToPetState(prev, evolvedSpecies, pending.evolvedAt || Date.now());
          });
          showNotification(`⚡ ${evolvedSpecies.name} naturally Digivolved while roaming!`);
        }

        const care = await consumeNativeOverlayCareActions();
        if (care.meatUsed > 0 || care.vitUsed > 0 || care.praiseCount > 0) {
          setPet((prev) => {
            if (prev.stage === 'egg' || prev.isDead) return prev;
            const usedMeat = Math.min(prev.bigMeatStock, Math.max(0, care.meatUsed));
            const usedVit = Math.min(prev.vitaminStock, Math.max(0, care.vitUsed));
            const praises = Math.max(0, care.praiseCount);
            const curedSick = usedVit > 0;
            return {
              ...prev,
              bigMeatStock: prev.bigMeatStock - usedMeat,
              vitaminStock: prev.vitaminStock - usedVit,
              hunger: Math.min(100, prev.hunger + usedMeat * 35),
              weight: prev.weight + usedMeat,
              energy: Math.min(100, prev.energy + usedVit * 10),
              isSick: curedSick ? false : prev.isSick,
              sickSince: curedSick ? undefined : prev.sickSince,
              neglectTicks: curedSick ? 0 : prev.neglectTicks,
              happiness: Math.min(100, prev.happiness + usedMeat * 8 + usedVit * 20 + praises * 15),
            };
          });
        }
      } finally {
        isPulling = false;
      }
    };

    pullNativeOverlayEvolution();
    const syncTimer = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        pullNativeOverlayEvolution();
      }
    }, 2500);
    const onFocusOrVisible = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        pullNativeOverlayEvolution();
      }
    };
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);
    return () => {
      clearInterval(syncTimer);
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      lastNativeSpeciesRef.current = pet.currentSpeciesId;
      return;
    }

    const prevSpeciesId = lastNativeSpeciesRef.current;
    const speciesChanged = prevSpeciesId !== pet.currentSpeciesId;
    lastNativeSpeciesRef.current = pet.currentSpeciesId;

    let evolvedMessage: string | undefined;
    if (speciesChanged) {
      if (skipNativeEvoBubbleForRef.current === pet.currentSpeciesId) {
        skipNativeEvoBubbleForRef.current = null;
      } else {
        evolvedMessage = `Digivolved into ${currentSpecies?.name || 'Digimon'}!`;
      }
    }

    let cancelled = false;
    isNativeOverlayActive().then((active) => {
      if (cancelled || !active) return;
      startNativeFloatingOverlay(
        buildNativeOverlayPayload({
          pet,
          species: currentSpecies,
          evolvedMessage,
        })
      ).catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [pet.currentSpeciesId, pet.playerName, pet.hunger, pet.happiness, pet.bigMeatStock, pet.vitaminStock, pet.isSleeping, pet.lightsOff, pet.evoGoalMetAt, pet.stageEnteredAt, pet.evolutionLocked, pet.isDead]);

  const requireAliveAndHatched = (): boolean => {
    if (pet.isDead) {
      sound.playAlert();
      showNotification('🪦 Your Digimon passed away! Hatch a new Digi-Egg to continue.');
      return false;
    }
    if (pet.stage === 'egg') {
      sound.playButton();
      showNotification(`🥚 Digitama is still incubating! Hatches in ${formatDurationMs(evoTiming.remainingMs)}.`);
      return false;
    }
    return true;
  };

  // CARE ACTIONS
  const handleFeedMeat = () => {
    if (!requireAliveAndHatched()) return;
    if (pet.bigMeatStock <= 0) {
      sound.playAlert();
      showNotification('Out of Big Meat! Play "I\'m Hungry!" mini-game to earn more 🍖');
      return;
    }
    sound.playEat();
    setHudAction({ pose: 'eating', nonce: Date.now() + Math.random(), eatItem: 'meat' });
    setPet((prev) => ({
      ...prev,
      bigMeatStock: prev.bigMeatStock - 1,
      hunger: Math.min(100, prev.hunger + 25),
      weight: prev.weight + 2,
      happiness: Math.min(100, prev.happiness + 10),
      neglectTicks: 0,
    }));
    showNotification('Fed delicious Big Meat! (+25 Hunger, +2g Weight)');
  };

  const handleGiveVitamin = () => {
    if (!requireAliveAndHatched()) return;
    if (pet.vitaminStock <= 0) {
      sound.playAlert();
      showNotification('Out of Vitamins! Buy some from the Digi-Shop or catch in mini-game');
      return;
    }
    sound.playMedicine();
    setHudAction({ pose: 'eating', nonce: Date.now() + Math.random(), eatItem: 'vitamin' });
    setPet((prev) => ({
      ...prev,
      vitaminStock: prev.vitaminStock - 1,
      isSick: false,
      sickSince: undefined,
      neglectTicks: 0,
      energy: Math.min(100, prev.energy + 20),
      strength: prev.strength + 2,
      dpPoints: prev.dpPoints + 5,
    }));
    showNotification('Gave Vitamin Protein! 💊 (Cured sickness & restored energy!)');
  };

  const handleCleanPoop = () => {
    if (!requireAliveAndHatched()) return;
    sound.playFlush();
    setHudAction({ pose: 'flushing', nonce: Date.now() + Math.random() });
    setPet((prev) => ({
      ...prev,
      poopCount: 0,
      neglectTicks: 0,
      happiness: Math.min(100, prev.happiness + 5),
    }));
    showNotification('Flushed and cleaned room spotless! 🧹');
  };

  const handleToggleLights = () => {
    if (!requireAliveAndHatched()) return;
    sound.playButton();
    setPet((prev) => ({
      ...prev,
      lightsOff: !prev.lightsOff,
      isSleeping: !prev.lightsOff,
    }));
  };

  const handleCureSick = () => {
    if (!requireAliveAndHatched()) return;
    if (pet.isSick) {
      handleGiveVitamin();
    } else {
      sound.playButton();
      showNotification('Digimon is healthy and active! No medicine needed.');
    }
  };

  const handlePetDigimon = () => {
    if (!requireAliveAndHatched()) return;
    sound.playButton();
    setHudAction({ pose: 'happy', nonce: Date.now() + Math.random() });
    setPet((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
    }));
    showNotification(`Pet ${pet.nickname?.trim() || currentSpecies?.name || 'Digimon'}! ❤️ Filled with affection!`);
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
        stageTrainingCount: (prev.stageTrainingCount ?? 0) + 1,
        effort: Math.min(10, (prev.effort ?? 0) + 2),
        strength: prev.strength + 10,
        dpPoints: prev.dpPoints + 15,
        weight: Math.max(10, prev.weight - 2),
        happiness: Math.min(100, prev.happiness + 15),
        digiBits: prev.digiBits + 25,
      }));
      showNotification('Dojo Workout Complete! 🥊 (+2 Effort, +15 DP, -2g, +25 Bits)');
    } else {
      setPet((prev) => ({
        ...prev,
        trainingCount: prev.trainingCount + 1,
        stageTrainingCount: (prev.stageTrainingCount ?? 0) + 1,
        effort: Math.min(10, (prev.effort ?? 0) + 1),
        weight: Math.max(10, prev.weight - 1),
      }));
      showNotification('Training round finished! (+1 Effort) Keep practicing!');
    }
  };

  const handleFoodGameComplete = (_score: number, meatEarned: number, vitaminsEarned: number, coinsEarned: number) => {
    setPet((prev) => ({
      ...prev,
      bigMeatStock: prev.bigMeatStock + meatEarned,
      vitaminStock: prev.vitaminStock + vitaminsEarned,
      digiBits: prev.digiBits + coinsEarned,
      hunger: Math.min(100, prev.hunger + 30),
      happiness: Math.min(100, prev.happiness + 20),
      stageTrainingCount: (prev.stageTrainingCount ?? 0) + 1,
      effort: Math.min(10, (prev.effort ?? 0) + 2),
    }));
    const vitText = vitaminsEarned > 0 ? `, +${vitaminsEarned} Vitamin${vitaminsEarned === 1 ? '' : 's'} 💊` : '';
    showNotification(`Feast Over! +2 Effort, +${meatEarned} Big Meat 🍖${vitText} & +${coinsEarned} Bits 🪙!`);
  };

  const handleBattleEnd = (won: boolean, coinsReward: number, dpReward: number) => {
    setPet((prev) => ({
      ...prev,
      battlesTotal: prev.battlesTotal + 1,
      battlesWon: won ? prev.battlesWon + 1 : prev.battlesWon,
      stageBattlesTotal: (prev.stageBattlesTotal ?? 0) + 1,
      stageBattlesWon: won ? (prev.stageBattlesWon ?? 0) + 1 : (prev.stageBattlesWon ?? 0),
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

  const handleAdventureComplete = (result: AdventureBattleResult) => {
    setPet((prev) => {
      const prevCleared = prev.adventureClearedWave?.[result.zoneId] ?? 0;
      const nextCleared = result.won ? Math.max(prevCleared, result.waveNumber) : prevCleared;
      const existingRelics = prev.ownedSpecialItems || [];
      const nextRelics =
        result.unlockedRelicId && !existingRelics.includes(result.unlockedRelicId)
          ? [...existingRelics, result.unlockedRelicId]
          : existingRelics;
      const unlockedRelicInfo = result.unlockedRelicId ? SPECIAL_ITEMS[result.unlockedRelicId] : undefined;
      const shouldAutoEquip = unlockedRelicInfo && prev.eggId === unlockedRelicInfo.eggId;

      return {
        ...prev,
        battlesTotal: prev.battlesTotal + 1,
        battlesWon: result.won ? prev.battlesWon + 1 : prev.battlesWon,
        stageBattlesTotal: (prev.stageBattlesTotal ?? 0) + 1,
        stageBattlesWon: result.won ? (prev.stageBattlesWon ?? 0) + 1 : (prev.stageBattlesWon ?? 0),
        strength: prev.strength + result.strengthGained,
        dpPoints: prev.dpPoints + result.dpGained,
        battleExp: (prev.battleExp ?? 0) + result.strengthGained * 10 + result.dpGained,
        effort: Math.min(10, (prev.effort ?? 0) + result.effortGained),
        digiBits: prev.digiBits + result.bitsGained,
        bigMeatStock: Math.max(0, prev.bigMeatStock - result.meatUsed) + result.meatGained,
        vitaminStock: Math.max(0, prev.vitaminStock - result.vitaminsUsed) + result.vitaminsGained,
        energy: Math.max(10, prev.energy - 12),
        ownedSpecialItems: nextRelics,
        equippedSpecialItem: shouldAutoEquip ? result.unlockedRelicId : prev.equippedSpecialItem,
        adventureClearedWave: {
          ...(prev.adventureClearedWave || {}),
          [result.zoneId]: nextCleared,
        },
      };
    });

    if (result.won) {
      const relicNote = result.unlockedRelicId
        ? ` · Unlocked ${SPECIAL_ITEMS[result.unlockedRelicId]?.shortName || result.unlockedRelicId}!`
        : '';
      showNotification(
        `Adventure Wave ${result.waveNumber} Cleared! +${result.strengthGained} STR, +${result.bitsGained} Bits & Items${relicNote}`
      );
    } else {
      showNotification(`Adventure Battle Exp: +${result.strengthGained} STR & +${result.dpGained} DP gained!`);
    }
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
        sickSince: itemId === 'medicine' ? undefined : prev.sickSince,
        neglectTicks: itemId === 'medicine' ? 0 : prev.neglectTicks,
      };
    });

    showNotification(`Purchased item from Bazaar! 🪙 (-${cost} Bits)`);
  };

  const handleBuySpecialItem = (itemId: SpecialItemId, cost: number) => {
    if (pet.digiBits < cost) {
      sound.playAlert();
      showNotification('Not enough DigiBits to purchase this Relic!');
      return;
    }
    const relic = SPECIAL_ITEMS[itemId];
    setPet((prev) => {
      const existing = prev.ownedSpecialItems || [];
      if (existing.includes(itemId)) return prev;
      const nextOwned = [...existing, itemId];
      const shouldAutoEquip = relic && prev.eggId === relic.eggId;
      return {
        ...prev,
        digiBits: prev.digiBits - cost,
        ownedSpecialItems: nextOwned,
        equippedSpecialItem: shouldAutoEquip ? itemId : prev.equippedSpecialItem,
      };
    });
    showNotification(`Acquired ${relic?.shortName || itemId}! ✨ Ready in Special Item slot.`);
  };

  const handleEquipSpecialItem = (itemId: SpecialItemId | null) => {
    setPet((prev) => ({
      ...prev,
      equippedSpecialItem: itemId,
    }));
    if (itemId) {
      const relic = SPECIAL_ITEMS[itemId];
      showNotification(`Equipped ${relic?.shortName || itemId}! Check Stats & Matrix for Armor Evolution.`);
    } else {
      showNotification('Unequipped Special Relic — Standard Matrix active.');
    }
  };

  const handleChangeTheme = (themeId: string) => {
    setPet((prev) => ({
      ...prev,
      activeRoomTheme: themeId,
    }));
  };

  const handleUpdatePlayerName = (name: string) => {
    const clean = name.trim();
    setPet((prev) => ({
      ...prev,
      playerName: clean,
    }));
    showNotification(
      clean
        ? `Saved your name (${clean})! Your Digimon will call you by name!`
        : 'Cleared custom name — Digimon will call you Tamer.'
    );
  };

  const handleUpdateNickname = (name: string) => {
    const clean = name.trim();
    setPet((prev) => ({
      ...prev,
      nickname: clean,
    }));
    showNotification(
      clean
        ? `Renamed your Digimon to ${clean}!`
        : `Cleared nickname — using ${currentSpecies?.name || 'Digimon'}!`
    );
  };

  // NEW EGG / RESET (Places Egg onto Digivice to incubate for 1m before hatching)
  const handleSelectNewEgg = (egg: DigiEggInfo, nickname: string, playerName?: string) => {
    const starterSpecies = egg.baby1Id || 'botamon';
    const cleanNickname = nickname.trim();
    const now = Date.now();
    eggHatchInProgressRef.current = false;
    setIsHatchingEgg(false);

    setPet((prev) => ({
      eggId: egg.id,
      currentSpeciesId: starterSpecies,
      stage: 'egg',
      nickname: cleanNickname,
      playerName: playerName !== undefined ? playerName.trim() : (prev.playerName || ''),
      birthTimestamp: now,
      stageEnteredAt: now,
      evoGoalMetAt: undefined,
      evolutionLocked: false,
      isDead: false,
      diedAt: undefined,
      deathReason: undefined,
      sickSince: undefined,
      neglectTicks: 0,
      hunger: 90,
      energy: 100,
      happiness: 100,
      discipline: 50,
      weight: 12,
      strength: 15,
      dpPoints: 20,
      effort: 0,
      isSick: false,
      isSleeping: false,
      lightsOff: false,
      poopCount: 0,
      careMistakes: 0,
      battlesWon: 0,
      battlesTotal: 0,
      trainingCount: 0,
      stageBattlesWon: 0,
      stageBattlesTotal: 0,
      stageTrainingCount: 0,
      equippedSpecialItem: null,
      ownedSpecialItems: prev.ownedSpecialItems || [],
      digiBits: Math.max(100, prev.digiBits),
      bigMeatStock: 8,
      vitaminStock: 5,
      activeRoomTheme: prev.activeRoomTheme || 'file-island',
      placedFurniture: prev.placedFurniture?.length
        ? prev.placedFurniture
        : [{ instanceId: 'init-1', furnitureId: 'meat-grill', x: 28, y: 68 }],
      lastCareCheck: now,
      adventureClearedWave: prev.adventureClearedWave || {},
      battleExp: prev.battleExp ?? 0,
      unlockedSpeciesIds: loadUnlockedSpeciesIds(prev.unlockedSpeciesIds || []),
    }));
    setIsEggModalOpen(false);
    showNotification(`🥚 Selected Egg #${String(egg.eggNumber).padStart(2, '0')} (${egg.crestName})! Hatches in 1 minute.`);
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
        onForageReward={(reward) => {
          if (reward === 'meat') {
            setPet((prev) => ({
              ...prev,
              bigMeatStock: prev.bigMeatStock + 1,
              happiness: Math.min(100, prev.happiness + 4),
            }));
            showNotification(`${pet.nickname?.trim() || currentSpecies?.name || 'Digimon'} returned from foraging with +1 Big Meat!`);
          } else {
            setPet((prev) => ({
              ...prev,
              happiness: Math.min(100, prev.happiness + 10),
            }));
            showNotification(`${pet.nickname?.trim() || currentSpecies?.name || 'Digimon'} visited friends! (+10 Happiness)`);
          }
        }}
        onOpenRoom={() => setIsRoomOpen(true)}
        onOpenColosseum={() => setIsColosseumOpen(true)}
        onOpenDigivice={() => setIsOverlayMode(false)}
        onOpenTraining={() => setIsTrainingOpen(true)}
        onOpenNativePip={() => setIsNativePipOpen(true)}
        onUpdatePlayerName={handleUpdatePlayerName}
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
                {pet.stage === 'egg'
                  ? pet.nickname?.trim() || 'Digitama'
                  : pet.nickname?.trim() || currentSpecies?.name || 'Digimon'}
              </h1>
              <span className={`text-[8px] font-pixel px-1.5 py-0.5 rounded-full border shrink-0 ${
                pet.isDead
                  ? 'text-rose-300 bg-rose-950/70 border-rose-700'
                  : pet.evolutionLocked
                  ? 'text-slate-300 bg-slate-800 border-slate-600'
                  : 'text-amber-400 bg-amber-950/60 border-amber-900'
              }`}>
                {pet.isDead ? 'R.I.P.' : pet.stage === 'egg' ? 'DIGITAMA' : currentSpecies?.stage.toUpperCase()}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
              <span className="text-amber-300 font-pixel text-[9px]">🪙 {pet.digiBits}</span>
              <span>•</span>
              <span className="text-orange-300 font-pixel text-[9px] inline-flex items-center gap-1">
                <PixelMeatIcon className="w-3.5 h-3.5" /> {pet.bigMeatStock}
              </span>
              <span>•</span>
              <span className="text-purple-300 font-pixel text-[9px] inline-flex items-center gap-1">
                <PixelVitaminIcon className="w-3.5 h-3.5" /> {pet.vitaminStock}
              </span>
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

          {/* Native Auto Updater Action */}
          <button
            onClick={() => {
              sound.playButton();
              setIsUpdateModalOpen(true);
            }}
            className={`relative p-1.5 rounded-xl border transition-colors cursor-pointer ${
              Capacitor.isNativePlatform() && hasUpdateAvailable
                ? 'bg-amber-950/80 border-amber-500/70 text-amber-300 shadow-md shadow-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="App Updates & Auto-Updater"
          >
            <Download className={`w-3.5 h-3.5 ${Capacitor.isNativePlatform() && hasUpdateAvailable ? 'text-amber-400 animate-bounce' : 'text-cyan-400'}`} />
            {Capacitor.isNativePlatform() && hasUpdateAvailable && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            )}
            {Capacitor.isNativePlatform() && hasUpdateAvailable && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-950" />
            )}
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

      {/* MAIN VIEWPORT: EDGE-TO-EDGE MOBILE & TABLET LAYOUT */}
      <main className="flex-1 flex flex-col items-center justify-start px-0 py-2 relative z-10 max-w-2xl mx-auto w-full pb-24">
        
        {/* Prominent Auto-Update Available Callout Banner (Native Android APK only — Web is always up-to-date) */}
        {Capacitor.isNativePlatform() && hasUpdateAvailable && updateManifest && (
          <div className="w-full px-2.5 sm:px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full mb-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 py-2 px-3 rounded-2xl font-pixel text-xs font-bold shadow-lg shadow-amber-500/25 flex items-center justify-between gap-2 border-2 border-amber-300"
            >
              <button
                onClick={() => {
                  sound.playButton();
                  markUpdateNotified(updateManifest.versionName);
                  setIsUpdateModalOpen(true);
                }}
                className="flex-1 min-w-0 flex items-center justify-between gap-2 cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Download className="w-4 h-4 text-slate-950 animate-bounce shrink-0" />
                  <span className="truncate">NEW UPDATE: v{updateManifest.versionName} AVAILABLE!</span>
                </div>
                <span className="bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full text-[9px] shrink-0 font-bold border border-amber-400/50">
                  UPDATE NOW
                </span>
              </button>
              {!updateManifest.isMandatory && (
                <button
                  onClick={() => {
                    sound.playButton();
                    dismissUpdateVersion(updateManifest.versionName);
                    setHasUpdateAvailable(false);
                  }}
                  className="p-1 rounded-full hover:bg-slate-950/15 text-slate-950 shrink-0 cursor-pointer"
                  aria-label="Dismiss update notification"
                  title="Dismiss notification for this version"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          </div>
        )}
        
        {/* Lifecycle & Pendulum Ver. 20th Status Callout Banner */}
        {pet.isDead ? (
          <div className="w-full px-2.5 sm:px-4">
            <div className="w-full mb-2.5 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-rose-100 py-2.5 px-3.5 rounded-2xl font-chakra text-xs shadow-lg border-2 border-rose-500/60 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-pixel text-[10px] text-rose-300">
                  🪦 {pet.nickname?.trim() || currentSpecies?.name || 'Digimon'} PASSED AWAY
                </div>
                <div className="text-[11px] text-rose-200/85 truncate mt-0.5">
                  {pet.deathReason || 'Neglected for too long.'}
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playButton();
                  setIsEggModalOpen(true);
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-pixel text-[9px] font-bold px-3 py-2 rounded-xl shrink-0 cursor-pointer"
              >
                NEW DIGI-EGG
              </button>
            </div>
          </div>
        ) : pet.stage === 'egg' ? (
          <div className="w-full px-2.5 sm:px-4">
            <div className="w-full mb-2.5 bg-slate-900/95 border border-cyan-500/40 text-cyan-200 py-2 px-3.5 rounded-2xl font-pixel text-[10px] flex items-center justify-between gap-2 shadow-md">
              <span>🥚 {currentEgg.crestName.toUpperCase()} INCUBATING</span>
              <span className="text-amber-300 tabular-nums">
                {isHatchingEgg ? 'HATCHING NOW!' : `HATCH IN ${formatDurationMs(evoTiming.remainingMs)}`}
              </span>
            </div>
          </div>
        ) : pet.evolutionLocked ? (
          <div className="w-full px-2.5 sm:px-4">
            <button
              onClick={() => {
                sound.playButton();
                setIsStatsOpen(true);
              }}
              className="w-full mb-2.5 bg-slate-900/95 border border-rose-500/50 text-rose-200 py-2 px-3.5 rounded-2xl font-pixel text-[10px] flex items-center justify-between gap-2 cursor-pointer"
            >
              <span>🔒 EVOLUTION LOCKED (MISSED WINDOW)</span>
              <span className="text-slate-400 text-[9px]">VIEW STATS »</span>
            </button>
          </div>
        ) : evolutionCheck.can ? (
          <div className="w-full px-2.5 sm:px-4">
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
          </div>
        ) : pet.stage !== 'mega' && (
          <div className="w-full px-2.5 sm:px-4">
            <button
              onClick={() => {
                sound.playButton();
                setIsStatsOpen(true);
              }}
              className="w-full mb-2.5 py-2 px-3.5 rounded-2xl font-pixel text-[9px] flex items-center justify-between gap-2 border cursor-pointer transition-colors bg-slate-900/90 border-slate-700/80 text-slate-200 hover:bg-slate-800/90"
            >
              <span className="truncate">
                NEXT EVOLUTION: ??? (UNKNOWN)
              </span>
              <span className="shrink-0 tabular-nums text-cyan-300 font-bold">
                {formatDurationMs(evoTiming.remainingMs)}
              </span>
            </button>
          </div>
        )}

        {/* Mobile Vitals Dashboard Bar */}
        <div className="w-full px-2.5 sm:px-4 grid grid-cols-4 gap-1.5 mb-2.5 text-[9px] font-pixel">
          {/* Hunger */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-300">
              <PixelMeatIcon className="w-3.5 h-3.5" />
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

        {/* 1997 Digivice Hardware Shell (Edge-to-Edge) */}
        <DigiviceHUD
          pet={pet}
          species={currentSpecies}
          egg={pet.stage === 'egg' ? currentEgg : undefined}
          isHatchingEgg={isHatchingEgg}
          evoRemainingMs={evoTiming.remainingMs}
          onFeedMeat={handleFeedMeat}
          onGiveVitamin={handleGiveVitamin}
          onCleanPoop={handleCleanPoop}
          onToggleLights={handleToggleLights}
          onCureSick={handleCureSick}
          onOpenTraining={() => {
            if (!requireAliveAndHatched()) return;
            setIsTrainingOpen(true);
          }}
          onOpenColosseum={() => {
            if (!requireAliveAndHatched()) return;
            setIsColosseumOpen(true);
          }}
          onOpenRoom={() => setIsRoomOpen(true)}
          onOpenDigidex={() => setIsDigidexOpen(true)}
          onOpenStatsModal={() => setIsStatsOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
          onEvolveTrigger={() => triggerEvolution()}
          onResetEgg={() => setIsEggModalOpen(true)}
          canEvolve={evolutionCheck.can && pet.stage !== 'egg'}
          externalAction={hudAction}
        />

        {/* Quick Care Actions Ribbon */}
        <div className="w-full px-2.5 sm:px-4 grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={() => {
              handleFeedMeat();
              triggerHaptic('heavy');
            }}
            className="py-2.5 px-2 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 rounded-2xl flex items-center justify-center gap-1.5 font-pixel text-[10px] text-amber-300 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <PixelMeatIcon className="w-5 h-5" />
            <span className="truncate">MEAT ({pet.bigMeatStock})</span>
          </button>

          <button
            onClick={() => {
              handleGiveVitamin();
              triggerHaptic('heavy');
            }}
            className="py-2.5 px-2 bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 rounded-2xl flex items-center justify-center gap-1.5 font-pixel text-[10px] text-purple-300 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <PixelVitaminIcon className="w-5 h-5" />
            <span className="truncate">VIT ({pet.vitaminStock})</span>
          </button>

          <button
            onClick={() => {
              if (!requireAliveAndHatched()) return;
              sound.playButton();
              triggerHaptic('light');
              setIsTalkModalOpen(true);
            }}
            className="py-2.5 px-2 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 rounded-2xl flex items-center justify-center gap-1.5 font-pixel text-[10px] text-cyan-300 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">TALK</span>
          </button>
        </div>

        {/* Poop cleaning / Sickness urgent alerts */}
        {(pet.poopCount > 0 || pet.isSick) && (
          <div className="w-full px-2.5 sm:px-4 flex gap-2 mt-2">
            {pet.poopCount > 0 && (
              <button
                onClick={() => {
                  handleCleanPoop();
                  triggerHaptic('medium');
                }}
                className="flex-1 py-2 px-3 bg-amber-950/70 border border-amber-500 rounded-xl flex items-center justify-center gap-1.5 font-pixel text-[10px] text-amber-200 animate-pulse active:scale-95 cursor-pointer"
              >
                <PixelPoopIcon className="w-4 h-4" />
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
                  <PixelMeatIcon className="w-4 h-4" />
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
                  <PixelMeatIcon className="w-7 h-7" />
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
                  <PixelVitaminIcon className="w-7 h-7" />
                  <span>GIVE VITAMIN</span>
                  <span className="text-[9px] text-slate-400">Stock: {pet.vitaminStock}</span>
                </button>

                <button
                  onClick={() => {
                    handleCleanPoop();
                    triggerHaptic('medium');
                    setIsCareSheetOpen(false);
                  }}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 rounded-2xl flex flex-col items-center gap-1 text-amber-300 active:scale-95 transition-all cursor-pointer"
                >
                  <PixelPoopIcon className="w-7 h-7" />
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
                    if (!requireAliveAndHatched()) return;
                    sound.playButton();
                    setIsMoreSheetOpen(false);
                    setIsAdventureOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center gap-2.5 text-emerald-300 cursor-pointer"
                >
                  <Compass className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="truncate">ADVENTURE MODE</span>
                </button>

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
                  <PixelMeatIcon className="w-5 h-5" />
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
                    setIsUpdateModalOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-amber-950/60 border border-amber-500/40 rounded-2xl flex items-center gap-2.5 text-amber-300 cursor-pointer relative"
                >
                  <Download className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="truncate">AUTO UPDATER</span>
                  {Capacitor.isNativePlatform() && hasUpdateAvailable && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
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
                    sound.playButton();
                    setIsMoreSheetOpen(false);
                    setIsGridModalOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-cyan-950/60 border border-cyan-500/40 rounded-2xl flex items-center gap-2.5 text-cyan-300 cursor-pointer relative"
                >
                  <SlidersHorizontal className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="truncate text-xs">
                    GRID LINES{isGridCustom ? ' • CUSTOM' : ''}
                  </span>
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
            <PixelMeatIcon className="w-5 h-5" />
            <span className="font-pixel text-[8px] mt-0.5">CARE</span>
            {(pet.poopCount > 0 || pet.isSick) && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          {/* 3. BATTLE */}
          <button
            onClick={() => {
              if (!requireAliveAndHatched()) return;
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
              if (!requireAliveAndHatched()) return;
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
        currentPlayerName={pet.playerName}
        onClose={() => setIsEggModalOpen(false)}
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
        onOpenAdventure={() => {
          setIsColosseumOpen(false);
          setIsAdventureOpen(true);
        }}
      />

      <AdventureModal
        pet={pet}
        species={currentSpecies}
        isOpen={isAdventureOpen}
        onClose={() => setIsAdventureOpen(false)}
        onAdventureComplete={handleAdventureComplete}
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
        currentEggId={pet.eggId}
        currentSpeciesId={pet.currentSpeciesId}
        pet={pet}
        isOpen={isDigidexOpen}
        onClose={() => setIsDigidexOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        pet={pet}
        species={currentSpecies}
        egg={pet.stage === 'egg' ? currentEgg : undefined}
        onOpenTraining={() => {
          if (!requireAliveAndHatched()) return;
          setIsTrainingOpen(true);
        }}
        onOpenColosseum={() => {
          if (!requireAliveAndHatched()) return;
          setIsColosseumOpen(true);
        }}
        onOpenDigidex={() => setIsDigidexOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onEquipSpecialItem={handleEquipSpecialItem}
        onUpdatePlayerName={handleUpdatePlayerName}
        onUpdateNickname={handleUpdateNickname}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        pet={pet}
        onBuyItem={handleBuyShopItem}
        onBuySpecialItem={handleBuySpecialItem}
        onEquipSpecialItem={handleEquipSpecialItem}
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
        onOpenGridAlignment={() => {
          setIsNativePipOpen(false);
          setIsGridModalOpen(true);
        }}
        onStartInAppOverlay={() => {
          setIsOverlayMode(true);
          showNotification(`✨ ${currentSpecies?.name || 'Digimon'} is now roaming on screen! Drag to move.`);
        }}
      />

      <GridAlignmentModal
        isOpen={isGridModalOpen}
        onClose={() => setIsGridModalOpen(false)}
        pet={pet}
        species={currentSpecies}
        onNotify={showNotification}
      />

      <DigiChat
        pet={pet}
        playerName={pet.playerName}
        species={currentSpecies}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <DigimonTalkModal
        pet={pet}
        species={currentSpecies}
        egg={pet.stage === 'egg' ? currentEgg : undefined}
        isOpen={isTalkModalOpen}
        onClose={() => setIsTalkModalOpen(false)}
        onUpdatePlayerName={handleUpdatePlayerName}
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

      <AppUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        initialManifest={updateManifest}
        onUpdateDownloaded={() => {
          if (updateManifest?.versionName) {
            markUpdateNotified(updateManifest.versionName);
          }
          setHasUpdateAvailable(false);
        }}
        onCheckComplete={(res: UpdateCheckResult) => {
          setUpdateManifest(res.manifest);
          setHasUpdateAvailable(Boolean(res.updateAvailable && res.manifest && res.shouldShowBanner));
        }}
        onSaveRestored={() => {
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              const validSpeciesId = DIGIMON_DATABASE[parsed.currentSpeciesId] ? parsed.currentSpeciesId : 'botamon';
              const restoredUnlocked = saveUnlockedSpeciesIds(
                loadUnlockedSpeciesIds([
                  ...(Array.isArray(parsed.unlockedSpeciesIds) ? parsed.unlockedSpeciesIds : []),
                  ...(parsed.stage && parsed.stage !== 'egg' ? [validSpeciesId] : []),
                ])
              );
              setPet({
                playerName: '',
                effort: 0,
                stageBattlesWon: parsed.battlesWon ?? 0,
                stageBattlesTotal: parsed.battlesTotal ?? 0,
                stageTrainingCount: parsed.trainingCount ?? 0,
                equippedSpecialItem: null,
                ownedSpecialItems: [],
                adventureClearedWave: {},
                battleExp: 0,
                evolutionLocked: false,
                isDead: false,
                neglectTicks: 0,
                ...parsed,
                stageEnteredAt: parsed.stageEnteredAt || Date.now(),
                currentSpeciesId: validSpeciesId,
                unlockedSpeciesIds: restoredUnlocked,
              });
              showNotification(`Restored ${parsed.nickname?.trim() || DIGIMON_DATABASE[parsed.currentSpeciesId]?.name || 'Digimon'} save successfully!`);
            }
          } catch {}
        }}
      />

    </div>
  );
}
