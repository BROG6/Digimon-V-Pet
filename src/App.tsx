import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PetState, 
  DigimonSpecies, 
  DigiEggInfo, 
  FurnitureItem, 
  DigimonStage,
  SpecialItemId,
  AdventureBattleResult,
  BattleHistoryEntry,
  TrainingStatKey,
  ShopItemId
} from './types/digimon';
import { DIGI_EGGS, DIGIMON_DATABASE, FURNITURE_SHOP, ROOM_THEMES, SPECIAL_ITEMS } from './data/digidex';
import {
  calculateTrainingOutcome,
  getEffectiveBattleStats,
  getEquippedBattleMoves,
  getLearnedTechniqueIds,
  MAX_EQUIPPED_ATTACKS,
} from './data/battleTechniques';
import { DigiviceHUD } from './components/DigiviceHUD';
import { PixelMeatIcon, PixelVitaminIcon, PixelPoopIcon } from './components/PixelItemIcons';
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
import { TamerRankModal } from './components/TamerRankModal';
import { InventoryModal } from './components/InventoryModal';
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
import {
  TRAINING_ENERGY_COST,
  advanceCareState,
  computeFutureCareAlertSchedule,
  evaluateCareNeeds,
  formatEarlyBedtimeLabel,
  getStageBedtimeHour,
  isWithinEarlyOrSleepWindow,
} from './utils/carePacing';
import {
  getCareAlertsEnabled,
  requestCareNotificationPermission,
  sendCareSystemNotification,
  setCareAlertsEnabled,
  syncBackgroundCareAlarms,
} from './utils/careNotifications';
import {
  DayNightPreference,
  DARK_ROOM_THEME_IDS,
  loadDayNightPref,
  resolveNightMode,
  saveDayNightPref,
  saveDaytimeTheme,
  syncRoomThemeForLightCycle,
} from './utils/dayNightCycle';
import {
  computeTamerRankProgress,
  getLifetimeBattlesWon,
  getTamerRankTier,
  isRankRequirementMet,
} from './utils/tamerRank';
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
  Compass,
  Bell,
  BellOff,
  Moon,
  Sun,
  Backpack,
  Award
} from 'lucide-react';

const STORAGE_KEY = 'digipet_vpet_save_v1';

export default function App() {
  const [dayNightPref, setDayNightPref] = useState<DayNightPreference>(() => loadDayNightPref());
  const [isNightMode, setIsNightMode] = useState<boolean>(() => resolveNightMode(loadDayNightPref()));

  // Master Pet State
  const [pet, setPet] = useState<PetState>(() => {
    const initialNight = resolveNightMode(loadDayNightPref());
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
        const syncedTheme = syncRoomThemeForLightCycle(
          parsed.activeRoomTheme || 'file-island',
          initialNight
        );
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
          sirloinStock: 0,
          mushroomStock: 0,
          berryStock: 0,
          ...parsed,
          lifetimeBattlesWon: Math.max(parsed.lifetimeBattlesWon ?? 0, parsed.battlesWon ?? 0),
          battleHistory: Array.isArray(parsed.battleHistory) ? parsed.battleHistory.slice(0, 10) : [],
          currentWinStreak: typeof parsed.currentWinStreak === 'number' ? Math.max(0, parsed.currentWinStreak) : 0,
          activeRoomTheme: syncedTheme,
          stageEnteredAt: parsed.stageEnteredAt || Date.now(),
          lastHungerDropAt: parsed.lastHungerDropAt || parsed.lastCareCheck || Date.now(),
          lastPoopAt: parsed.lastPoopAt || parsed.lastCareCheck || Date.now(),
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
      lifetimeBattlesWon: 0,
      trainingCount: 0,
      stageBattlesWon: 0,
      stageBattlesTotal: 0,
      stageTrainingCount: 0,
      equippedSpecialItem: null,
      ownedSpecialItems: [],
      digiBits: 150,
      bigMeatStock: 8,
      sirloinStock: 0,
      mushroomStock: 0,
      berryStock: 0,
      vitaminStock: 5,
      activeRoomTheme: syncRoomThemeForLightCycle('file-island', initialNight),
      placedFurniture: [
        { instanceId: 'init-1', furnitureId: 'meat-grill', x: 28, y: 68 },
        { instanceId: 'init-2', furnitureId: 'cozy-cushion', x: 74, y: 72 },
      ],
      lastCareCheck: Date.now(),
      lastHungerDropAt: Date.now(),
      lastPoopAt: Date.now(),
      evolutionLocked: false,
      isDead: false,
      neglectTicks: 0,
      adventureClearedWave: {},
      battleExp: 0,
      battleHistory: [],
      currentWinStreak: 0,
      unlockedSpeciesIds: loadUnlockedSpeciesIds(),
    };
  });

  // Active species & egg info
  const currentSpecies: DigimonSpecies | undefined = DIGIMON_DATABASE[pet.currentSpeciesId];
  const currentEgg: DigiEggInfo = DIGI_EGGS.find((e) => e.id === pet.eggId) || DIGI_EGGS[0];

  // Active UI Views & Modals
  const [isEggModalOpen, setIsEggModalOpen] = useState<boolean>(false);
  const [isTrainingOpen, setIsTrainingOpen] = useState<boolean>(false);
  const [isFoodGameOpen, setIsFoodGameOpen] = useState<boolean>(false);
  const [isColosseumOpen, setIsColosseumOpen] = useState<boolean>(false);
  const [isAdventureOpen, setIsAdventureOpen] = useState<boolean>(false);
  const [isRoomOpen, setIsRoomOpen] = useState<boolean>(false);
  const [isDigidexOpen, setIsDigidexOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isTamerRankOpen, setIsTamerRankOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
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

  // Day/Night Cycle: auto-evaluate evening hours on resume/focus/minute tick
  const manualThemeOverrideRef = useRef<boolean>(false);
  useEffect(() => {
    const evaluateCycle = () => {
      const nextNight = resolveNightMode(dayNightPref);
      setIsNightMode((prevNight) => {
        if (prevNight !== nextNight) {
          manualThemeOverrideRef.current = false;
        }
        return nextNight;
      });
      if (!manualThemeOverrideRef.current) {
        setPet((prev) => {
          const synced = syncRoomThemeForLightCycle(
            prev.activeRoomTheme || 'file-island',
            nextNight
          );
          return synced !== prev.activeRoomTheme
            ? { ...prev, activeRoomTheme: synced }
            : prev;
        });
      }
    };

    evaluateCycle();
    const timer = window.setInterval(evaluateCycle, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        evaluateCycle();
      }
    };
    window.addEventListener('focus', evaluateCycle);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', evaluateCycle);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [dayNightPref]);

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
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => getCareAlertsEnabled());
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [hudAction, setHudAction] = useState<{
    pose: 'eating' | 'happy' | 'flushing';
    nonce: number;
    eatItem?: 'meat' | 'vitamin' | 'sirloin' | 'mushroom' | 'berry';
  } | null>(null);

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

  // Stage-accurate Virtual Pet Care Loop (Hunger, Toilet, 10m Care Grace & Death)
  const lastStepEventsRef = useRef<ReturnType<typeof advanceCareState>['events'] | null>(null);
  useEffect(() => {
    const runCareTick = () => {
      const now = Date.now();
      setPet((prev) => {
        const res = advanceCareState(prev, now);
        lastStepEventsRef.current = res.events;
        return res.nextPet;
      });
    };

    runCareTick();
    const careInterval = setInterval(runCareTick, 15000);
    const onVisibilityCareSync = () => {
      runCareTick();
    };
    document.addEventListener('visibilitychange', onVisibilityCareSync);
    return () => {
      clearInterval(careInterval);
      document.removeEventListener('visibilitychange', onVisibilityCareSync);
    };
  }, []);

  // Notification Alerts for Hunger, Toilet, Sleep & Sickness Needs
  const alertTrackerRef = useRef<{
    hungerLevel: 'ok' | 'low' | 'empty';
    poopCount: number;
    isSick: boolean;
    isDead: boolean;
    isSleepy: boolean;
    stage: DigimonStage;
  }>({
    hungerLevel: pet.hunger === 0 ? 'empty' : pet.hunger <= 25 ? 'low' : 'ok',
    poopCount: pet.poopCount,
    isSick: pet.isSick,
    isDead: Boolean(pet.isDead),
    isSleepy: Boolean(pet.sleepCallStartedAt) && !pet.lightsOff,
    stage: pet.stage,
  });

  useEffect(() => {
    const tracker = alertTrackerRef.current;
    const hungerLevel: 'ok' | 'low' | 'empty' =
      pet.hunger <= 0 ? 'empty' : pet.hunger <= 25 ? 'low' : 'ok';
    const isSleepyNow = Boolean(pet.sleepCallStartedAt) && !pet.lightsOff && !pet.isFrozen && !pet.isDead;

    if (pet.stage === 'egg' || pet.stage !== tracker.stage) {
      tracker.hungerLevel = hungerLevel;
      tracker.poopCount = pet.poopCount;
      tracker.isSick = pet.isSick;
      tracker.isDead = Boolean(pet.isDead);
      tracker.isSleepy = isSleepyNow;
      tracker.stage = pet.stage;
      return;
    }

    const monName = pet.nickname?.trim() || currentSpecies?.name || 'Your Digimon';

    if (lastStepEventsRef.current?.wokeUpMorning) {
      lastStepEventsRef.current.wokeUpMorning = false;
      sound.playButton();
      showNotification(`☀️ Good morning! ${monName} woke up refreshed at 7:00 AM!`);
    }

    if (pet.isDead && !tracker.isDead) {
      sound.playAlert();
      triggerHaptic('alert');
      const body = `${monName} passed away: ${pet.deathReason || 'Neglected for too long.'}`;
      showNotification(`🪦 ${body}`);
      if (alertsEnabled) {
        sendCareSystemNotification({
          id: 2004,
          title: `Digivice Memorial Alert`,
          body,
          tag: 'digipet-death',
        });
      }
      tracker.isDead = true;
      return;
    }

    if (!pet.isDead) {
      // 1. Hunger Alert (crossed <= 25% or hit 0% empty)
      if (hungerLevel === 'empty' && tracker.hungerLevel !== 'empty') {
        sound.playAlert();
        triggerHaptic('alert');
        const msg = `${monName} is starving (0%)! Feed within 10 minutes before a Care Mistake.`;
        showNotification(`🚨 ${msg}`);
        if (alertsEnabled) {
          sendCareSystemNotification({
            id: 2001,
            title: `🚨 ${monName} is Starving!`,
            body: msg,
            tag: 'digipet-hunger',
          });
        }
      } else if (hungerLevel === 'low' && tracker.hungerLevel === 'ok') {
        sound.playAlert();
        triggerHaptic('alert');
        const msg = `${monName} is getting hungry (${pet.hunger}%). Time to feed Big Meat!`;
        showNotification(`🍖 ${msg}`);
        if (alertsEnabled) {
          sendCareSystemNotification({
            id: 2001,
            title: `🍖 Hunger Alert: ${monName}`,
            body: msg,
            tag: 'digipet-hunger',
          });
        }
      }

      // 2. Bedtime Call Light Alert
      if (isSleepyNow && !tracker.isSleepy) {
        sound.playAlert();
        triggerHaptic('alert');
        const msg = `🌙 Bedtime! Turn ${monName}'s lights off within 10 minutes to avoid a Care Mistake.`;
        showNotification(msg);
        if (alertsEnabled) {
          sendCareSystemNotification({
            id: 2005,
            title: `🌙 ${monName} is Sleepy!`,
            body: msg,
            tag: 'digipet-bedtime',
          });
        }
      }

      // 3. Toilet Alert (new poop pile added — 4 piles causes sickness + 1 Care Mistake)
      if (pet.poopCount > tracker.poopCount) {
        sound.playAlert();
        triggerHaptic('alert');
        const msg =
          pet.poopCount >= 4
            ? `${monName} has 4 toilet piles — got sick & +1 Care Mistake! Flush & cure now.`
            : `${monName} needs the toilet! (${pet.poopCount}/4 pile${pet.poopCount === 1 ? '' : 's'})`;
        showNotification(`💩 ${msg}`);
        if (alertsEnabled) {
          sendCareSystemNotification({
            id: 2002,
            title: `💩 Toilet Alert: ${monName}`,
            body: msg,
            tag: 'digipet-toilet',
          });
        }
      }

      // 4. Sickness / Critical Neglect Alert
      if (pet.isSick && !tracker.isSick && pet.poopCount < 4) {
        sound.playAlert();
        triggerHaptic('alert');
        const msg = `${monName} fell sick! Give Vitamin or Medicine right away.`;
        showNotification(`💉 ${msg}`);
        if (alertsEnabled) {
          sendCareSystemNotification({
            id: 2003,
            title: `💉 Sickness Alert: ${monName}`,
            body: msg,
            tag: 'digipet-sick',
          });
        }
      } else if (lastStepEventsRef.current?.criticalWarning) {
        showNotification(lastStepEventsRef.current.criticalWarning);
        lastStepEventsRef.current.criticalWarning = null;
      }
    }

    tracker.hungerLevel = hungerLevel;
    tracker.poopCount = pet.poopCount;
    tracker.isSick = pet.isSick;
    tracker.isDead = Boolean(pet.isDead);
    tracker.isSleepy = isSleepyNow;
    tracker.stage = pet.stage;
  }, [
    pet.hunger,
    pet.poopCount,
    pet.isSick,
    pet.isDead,
    pet.stage,
    pet.sleepCallStartedAt,
    pet.lightsOff,
    pet.isFrozen,
    pet.nickname,
    pet.deathReason,
    currentSpecies?.name,
    alertsEnabled,
  ]);

  // Arm / update future OS background notifications (fires only when app is closed or backgrounded)
  useEffect(() => {
    const monName = pet.nickname?.trim() || currentSpecies?.name || 'Your Digimon';
    const armAlarms = () => {
      const now = Date.now();
      const schedule = computeFutureCareAlertSchedule(pet, now);
      syncBackgroundCareAlarms({
        enabled: alertsEnabled,
        petName: monName,
        schedule,
      });
    };

    armAlarms();
    const handleVisibility = () => {
      armAlarms();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [
    alertsEnabled,
    pet.isDead,
    pet.isFrozen,
    pet.isSleeping,
    pet.lightsOff,
    pet.sleepCallStartedAt,
    pet.stage,
    pet.hunger,
    pet.poopCount,
    pet.lastHungerDropAt,
    pet.lastPoopAt,
    pet.nickname,
    currentSpecies?.name,
  ]);

  const [evoNowMs, setEvoNowMs] = useState<number>(() => Date.now());
  const evoElig = checkEvolutionEligibility(pet, currentSpecies);
  const evoTiming = computeNaturalEvoTiming(pet, currentSpecies, evoNowMs);
  const evolutionCheck = { can: evoTiming.readyToEvolve, nextId: evoElig.nextId };

  // Continuous 1s clock tick while Pendulum Ver. 20th timer is active (pauses in Cold Mode / Fridge)
  useEffect(() => {
    if (pet.isDead || pet.evolutionLocked || pet.stage === 'mega' || pet.isFrozen) return;
    setEvoNowMs(Date.now());
    const id = setInterval(() => {
      setEvoNowMs(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [pet.isDead, pet.evolutionLocked, pet.stage, pet.isFrozen, pet.currentSpeciesId, pet.stageEnteredAt]);

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
    if (pet.isDead || pet.evolutionLocked || pet.isFrozen) return;

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
          careCallStartedAt: undefined,
          sleepCallStartedAt: undefined,
          battleStats: undefined,
          learnedAttackIds: undefined,
          equippedAttackIds: undefined,
          lastCareCheck: now,
          lastHungerDropAt: now,
          lastPoopAt: now,
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

    triggerEvolution(evoTiming.nextId);
  }, [
    pet.isDead,
    pet.evolutionLocked,
    pet.isFrozen,
    pet.stage,
    evoTiming.readyToEvolve,
    evoTiming.nextId,
    currentEgg.eggNumber,
    currentEgg.crestName,
    currentEgg.crestColor,
    currentEgg.baby1Id,
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
          const now = Date.now();
          setPet((prev) => {
            if (prev.stage === 'egg' || prev.isDead) return prev;
            const usedMeat = Math.min(prev.bigMeatStock, Math.max(0, care.meatUsed));
            const usedVit = Math.min(prev.vitaminStock, Math.max(0, care.vitUsed));
            const praises = Math.max(0, care.praiseCount);
            const curedSick = usedVit > 0;
            const nextHunger = Math.min(100, prev.hunger + usedMeat * 25);
            const nextEnergy = Math.min(100, prev.energy + usedVit * 20);
            return {
              ...prev,
              bigMeatStock: prev.bigMeatStock - usedMeat,
              vitaminStock: prev.vitaminStock - usedVit,
              hunger: nextHunger,
              weight: prev.weight + usedMeat * 2,
              energy: nextEnergy,
              isSick: curedSick ? false : prev.isSick,
              sickSince: curedSick ? undefined : prev.sickSince,
              neglectTicks: curedSick || usedMeat > 0 ? 0 : prev.neglectTicks,
              lastHungerDropAt:
                usedMeat > 0
                  ? Math.max(prev.lastHungerDropAt ?? 0, care.lastMeatAtMs || now)
                  : prev.lastHungerDropAt,
              careCallStartedAt:
                nextHunger > 0 && prev.poopCount < 4 && nextEnergy > 0
                  ? undefined
                  : prev.careCallStartedAt,
              happiness: Math.min(100, prev.happiness + usedMeat * 10 + usedVit * 20 + praises * 15),
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
  }, [pet.currentSpeciesId, pet.playerName, pet.stage, pet.hunger, pet.happiness, pet.bigMeatStock, pet.vitaminStock, pet.lastHungerDropAt, pet.isSleeping, pet.lightsOff, pet.isFrozen, pet.evoGoalMetAt, pet.stageEnteredAt, pet.evolutionLocked, pet.isDead]);

  const requireAliveAndHatched = (): boolean => {
    if (pet.isDead) {
      sound.playAlert();
      showNotification('🪦 Your Digimon passed away! Hatch a new Digi-Egg to continue.');
      return false;
    }
    if (pet.isFrozen) {
      sound.playButton();
      showNotification('❄️ Cold Mode (Fridge) is active! Unfreeze under LIGHT to resume.');
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
    setPet((prev) => {
      const now = Date.now();
      const nextHunger = Math.min(100, prev.hunger + 25);
      return {
        ...prev,
        bigMeatStock: prev.bigMeatStock - 1,
        hunger: nextHunger,
        weight: prev.weight + 2,
        happiness: Math.min(100, prev.happiness + 10),
        neglectTicks: 0,
        lastHungerDropAt: now,
        careCallStartedAt: nextHunger > 0 ? undefined : prev.careCallStartedAt,
      };
    });
    showNotification('Fed delicious Big Meat! (+25 Hunger, +2g Weight)');
  };

  const handleFeedSirloin = () => {
    if (!requireAliveAndHatched()) return;
    if ((pet.sirloinStock ?? 0) <= 0) {
      sound.playAlert();
      showNotification('Out of Prime Sirloin! Defeat Ultimates/Megas in Adventure Mode or visit the Shop.');
      return;
    }
    sound.playEat();
    setHudAction({ pose: 'eating', nonce: Date.now() + Math.random(), eatItem: 'sirloin' });
    setPet((prev) => {
      const now = Date.now();
      const nextHunger = Math.min(100, prev.hunger + 50);
      return {
        ...prev,
        sirloinStock: Math.max(0, (prev.sirloinStock ?? 0) - 1),
        hunger: nextHunger,
        weight: prev.weight + 4,
        happiness: Math.min(100, prev.happiness + 20),
        neglectTicks: 0,
        lastHungerDropAt: now,
        careCallStartedAt: nextHunger > 0 ? undefined : prev.careCallStartedAt,
      };
    });
    showNotification('Fed Prime Sirloin (2x Meat)! (+50 Hunger, +4g Weight, +20 Happy)');
  };

  const handleFeedMushroom = () => {
    if (!requireAliveAndHatched()) return;
    if ((pet.mushroomStock ?? 0) <= 0) {
      sound.playAlert();
      showNotification('Out of Digi-Mushrooms! Forage them in Adventure Mode.');
      return;
    }
    sound.playEat();
    setHudAction({ pose: 'eating', nonce: Date.now() + Math.random(), eatItem: 'mushroom' });
    setPet((prev) => {
      const now = Date.now();
      const nextHunger = Math.min(100, prev.hunger + 18);
      return {
        ...prev,
        mushroomStock: Math.max(0, (prev.mushroomStock ?? 0) - 1),
        hunger: nextHunger,
        energy: Math.min(100, prev.energy + 15),
        weight: prev.weight + 1,
        neglectTicks: 0,
        lastHungerDropAt: now,
        careCallStartedAt: nextHunger > 0 ? undefined : prev.careCallStartedAt,
      };
    });
    showNotification('Fed Digi-Mushroom! (+18 Hunger, +15 Energy, +1g Weight)');
  };

  const handleFeedBerry = () => {
    if (!requireAliveAndHatched()) return;
    if ((pet.berryStock ?? 0) <= 0) {
      sound.playAlert();
      showNotification('Out of Digi-Berries! Forage them in Adventure Mode.');
      return;
    }
    sound.playEat();
    setHudAction({ pose: 'eating', nonce: Date.now() + Math.random(), eatItem: 'berry' });
    setPet((prev) => {
      const now = Date.now();
      const nextHunger = Math.min(100, prev.hunger + 12);
      return {
        ...prev,
        berryStock: Math.max(0, (prev.berryStock ?? 0) - 1),
        hunger: nextHunger,
        happiness: Math.min(100, prev.happiness + 20),
        neglectTicks: 0,
        lastHungerDropAt: now,
        careCallStartedAt: nextHunger > 0 ? undefined : prev.careCallStartedAt,
      };
    });
    showNotification('Fed sweet Digi-Berry! (+12 Hunger, +20 Happiness)');
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
    setPet((prev) => {
      const nextEnergy = Math.min(100, prev.energy + 20);
      return {
        ...prev,
        vitaminStock: prev.vitaminStock - 1,
        isSick: false,
        sickSince: undefined,
        neglectTicks: 0,
        energy: nextEnergy,
        strength: prev.strength + 2,
        dpPoints: prev.dpPoints + 5,
      };
    });
    showNotification('Gave Vitamin Protein! 💊 (Cured sickness & restored energy!)');
  };

  const handleCleanPoop = () => {
    if (!requireAliveAndHatched()) return;
    sound.playFlush();
    setHudAction({ pose: 'flushing', nonce: Date.now() + Math.random() });
    setPet((prev) => {
      const now = Date.now();
      return {
        ...prev,
        poopCount: 0,
        neglectTicks: 0,
        lastPoopAt: now,
        happiness: Math.min(100, prev.happiness + 5),
      };
    });
    showNotification('Flushed and cleaned room spotless! 🧹');
  };

  const handleToggleLights = () => {
    if (!requireAliveAndHatched()) return;
    const now = Date.now();
    const nowDate = new Date(now);
    const monName = pet.nickname?.trim() || currentSpecies?.name || 'Digimon';
    const hasFixedBedtime = getStageBedtimeHour(pet.stage) !== null;

    if (!pet.lightsOff && hasFixedBedtime && !isWithinEarlyOrSleepWindow(pet.stage, nowDate)) {
      sound.playAlert();
      showNotification(
        `⏰ ${monName} isn't sleepy yet! Sleep opens ${formatEarlyBedtimeLabel(pet.stage)} (up to 3h before bedtime).`
      );
      return;
    }

    sound.playButton();
    const nextLightsOff = !pet.lightsOff;
    setPet((prev) => ({
      ...prev,
      lightsOff: nextLightsOff,
      isSleeping: nextLightsOff,
      sleepCallStartedAt: nextLightsOff ? undefined : prev.sleepCallStartedAt,
      lastCareCheck: now,
      lastHungerDropAt: now,
      lastPoopAt: now,
      lastEnergyRegenAt: now,
    }));
    showNotification(
      nextLightsOff
        ? `🌙 Lights OFF — ${monName} is resting until 7:00 AM!`
        : `☀️ Lights ON — ${monName} woke up!`
    );
  };

  const handleToggleFridge = () => {
    if (pet.isDead) {
      sound.playAlert();
      showNotification('🪦 Hatch a new Digi-Egg to use Cold Mode.');
      return;
    }
    sound.playButton();
    const now = Date.now();
    const monName = pet.nickname?.trim() || currentSpecies?.name || 'Digimon';
    if (!pet.isFrozen) {
      setPet((prev) => ({
        ...prev,
        isFrozen: true,
        frozenAt: now,
        lightsOff: false,
        isSleeping: false,
        sleepCallStartedAt: undefined,
        lastCareCheck: now,
        lastHungerDropAt: now,
        lastPoopAt: now,
      }));
      showNotification(`❄️ Fridge (Cold Mode) ON — ${monName} is safely paused!`);
    } else {
      setPet((prev) => {
        const pausedMs = prev.frozenAt ? Math.max(0, now - prev.frozenAt) : 0;
        return {
          ...prev,
          isFrozen: false,
          frozenAt: undefined,
          stageEnteredAt: (prev.stageEnteredAt || now) + pausedMs,
          birthTimestamp: (prev.birthTimestamp || now) + pausedMs,
          sickSince: prev.sickSince ? prev.sickSince + pausedMs : undefined,
          careCallStartedAt: prev.careCallStartedAt ? prev.careCallStartedAt + pausedMs : undefined,
          sleepCallStartedAt: prev.sleepCallStartedAt ? prev.sleepCallStartedAt + pausedMs : undefined,
          evoGoalMetAt: prev.evoGoalMetAt ? prev.evoGoalMetAt + pausedMs : undefined,
          lastCareCheck: now,
          lastHungerDropAt: now,
          lastPoopAt: now,
        };
      });
      setEvoNowMs(now);
      showNotification(`☀️ Fridge OFF — ${monName} resumed!`);
    }
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
  const handleTrainingComplete = (
    success: boolean,
    statKey: TrainingStatKey = 'offense',
    hits: number = success ? 2 : 1
  ) => {
    const speciesObj = DIGIMON_DATABASE[pet.currentSpeciesId];
    const outcome = calculateTrainingOutcome(statKey, pet, speciesObj, hits);

    setPet((prev) => {
      const now = Date.now();
      const prevSpecies = DIGIMON_DATABASE[prev.currentSpeciesId];
      const existingLearned = getLearnedTechniqueIds(prev, prevSpecies);
      const nextLearned = Array.from(
        new Set([...existingLearned, ...outcome.newlyLearnedMoves.map((m) => m.id)])
      );
      const existingEquipped = getEquippedBattleMoves(prev, prevSpecies).map((m) => m.id);
      const nextEquipped = [...existingEquipped];
      for (const m of outcome.newlyLearnedMoves) {
        if (nextEquipped.length < MAX_EQUIPPED_ATTACKS && !nextEquipped.includes(m.id)) {
          nextEquipped.push(m.id);
        }
      }
      const nextEnergy = Math.max(0, prev.energy - TRAINING_ENERGY_COST);

      return {
        ...prev,
        trainingCount: prev.trainingCount + 1,
        stageTrainingCount: (prev.stageTrainingCount ?? 0) + 1,
        effort: Math.min(10, (prev.effort ?? 0) + (success ? 2 : 1)),
        strength: prev.strength + (success ? 10 : 4),
        dpPoints: prev.dpPoints + (success ? 15 : 5),
        energy: nextEnergy,
        lastEnergyRegenAt: prev.energy >= 100 ? now : (prev.lastEnergyRegenAt ?? now),
        weight: Math.max(10, prev.weight - (success ? 2 : 1)),
        happiness: Math.min(100, prev.happiness + (success ? 15 : 6)),
        digiBits: prev.digiBits + (success ? 25 : 10),
        battleStats: outcome.nextStats,
        learnedAttackIds: nextLearned,
        equippedAttackIds: nextEquipped.slice(0, MAX_EQUIPPED_ATTACKS),
      };
    });

    const statGainSummary = [
      outcome.deltas.maxHp ? `+${outcome.deltas.maxHp} HP` : '',
      outcome.deltas.maxMp ? `+${outcome.deltas.maxMp} MP` : '',
      outcome.deltas.offense ? `+${outcome.deltas.offense} OFF` : '',
      outcome.deltas.defense ? `+${outcome.deltas.defense} DEF` : '',
      outcome.deltas.speed ? `+${outcome.deltas.speed} SPD` : '',
      outcome.deltas.brains ? `+${outcome.deltas.brains} BRN` : '',
    ]
      .filter(Boolean)
      .join(', ');

    if (outcome.newlyLearnedMoves.length > 0) {
      const learnedNames = outcome.newlyLearnedMoves.map((m) => m.name).join(', ');
      showNotification(`💡 Learned ${learnedNames}! (${statGainSummary})`);
    } else {
      showNotification(`Gym Session Complete: ${statGainSummary} (+${success ? 2 : 1} Effort)`);
    }
  };

  const handleToggleEquipAttack = (moveId: string) => {
    setPet((prev) => {
      const prevSpecies = DIGIMON_DATABASE[prev.currentSpeciesId];
      const learned = getLearnedTechniqueIds(prev, prevSpecies);
      if (!learned.includes(moveId)) return prev;

      const currentEquipped = getEquippedBattleMoves(prev, prevSpecies).map((m) => m.id);
      if (currentEquipped.includes(moveId)) {
        return {
          ...prev,
          learnedAttackIds: learned,
          equippedAttackIds: currentEquipped.filter((id) => id !== moveId),
        };
      }
      if (currentEquipped.length >= MAX_EQUIPPED_ATTACKS) {
        return prev;
      }
      return {
        ...prev,
        learnedAttackIds: learned,
        equippedAttackIds: [...currentEquipped, moveId],
      };
    });
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

  const triggerRankUpCelebration = (newRank: number, newTitle: string) => {
    sound.playVictory();
    triggerHaptic('success');
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#fbbf24', '#38bdf8', '#c084fc', '#ffffff'],
      });
    } catch {}
    showNotification(`🎖️ TAMER RANK UP! Reached Rank ${newRank} (${newTitle}) — New Shop & Room unlocks!`);
  };

  const handleBattleEnd = (
    won: boolean,
    coinsReward: number,
    dpReward: number,
    opponentInfo?: { name: string; speciesId?: string }
  ) => {
    const prevRank = computeTamerRankProgress(pet).rank;
    const nextLifetimeWins = won ? getLifetimeBattlesWon(pet) + 1 : getLifetimeBattlesWon(pet);
    const nextRankProgress = computeTamerRankProgress({
      battlesWon: won ? pet.battlesWon + 1 : pet.battlesWon,
      lifetimeBattlesWon: nextLifetimeWins,
      adventureClearedWave: pet.adventureClearedWave,
    });
    const newEntry: BattleHistoryEntry = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      opponentName: opponentInfo?.name || 'Colosseum Rival',
      opponentSpeciesId: opponentInfo?.speciesId,
      outcome: won ? 'win' : 'loss',
      mode: 'colosseum',
      timestamp: Date.now(),
    };

    setPet((prev) => ({
      ...prev,
      battlesTotal: prev.battlesTotal + 1,
      battlesWon: won ? prev.battlesWon + 1 : prev.battlesWon,
      lifetimeBattlesWon: won ? getLifetimeBattlesWon(prev) + 1 : getLifetimeBattlesWon(prev),
      stageBattlesTotal: (prev.stageBattlesTotal ?? 0) + 1,
      stageBattlesWon: won ? (prev.stageBattlesWon ?? 0) + 1 : (prev.stageBattlesWon ?? 0),
      digiBits: prev.digiBits + coinsReward,
      dpPoints: prev.dpPoints + dpReward,
      energy: Math.max(10, prev.energy - 15),
      battleHistory: [newEntry, ...(prev.battleHistory || [])].slice(0, 10),
      currentWinStreak: won ? (prev.currentWinStreak ?? 0) + 1 : 0,
    }));

    if (won && nextRankProgress.rank > prevRank) {
      triggerRankUpCelebration(nextRankProgress.rank, nextRankProgress.title);
      return;
    }

    showNotification(
      won
        ? `Colosseum Victory! +${coinsReward} Bits 🪙 & +${dpReward} DP Power ⚡!`
        : `Battle ended. Earned +${coinsReward} Bits 🪙.`
    );
  };

  const handleAdventureComplete = (result: AdventureBattleResult) => {
    const prevRank = computeTamerRankProgress(pet).rank;
    const prevCleared = pet.adventureClearedWave?.[result.zoneId] ?? 0;
    const nextCleared = result.won ? Math.max(prevCleared, result.waveNumber) : 0;
    const nextAdventureWaves = {
      ...(pet.adventureClearedWave || {}),
      [result.zoneId]: nextCleared,
    };
    const nextLifetimeWins = result.won ? getLifetimeBattlesWon(pet) + 1 : getLifetimeBattlesWon(pet);
    const nextRankProgress = computeTamerRankProgress({
      battlesWon: result.won ? pet.battlesWon + 1 : pet.battlesWon,
      lifetimeBattlesWon: nextLifetimeWins,
      adventureClearedWave: nextAdventureWaves,
    });

    setPet((prev) => {
      const prevWave = prev.adventureClearedWave?.[result.zoneId] ?? 0;
      const updatedWave = result.won ? Math.max(prevWave, result.waveNumber) : 0;
      const existingRelics = prev.ownedSpecialItems || [];
      const nextRelics =
        result.unlockedRelicId && !existingRelics.includes(result.unlockedRelicId)
          ? [...existingRelics, result.unlockedRelicId]
          : existingRelics;
      const unlockedRelicInfo = result.unlockedRelicId ? SPECIAL_ITEMS[result.unlockedRelicId] : undefined;
      const shouldAutoEquip = unlockedRelicInfo && prev.eggId === unlockedRelicInfo.eggId;

      const newEntry: BattleHistoryEntry = {
        id: `adv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        opponentName: result.opponentName || `Wave ${result.waveNumber} Opponent`,
        opponentSpeciesId: result.opponentSpeciesId,
        outcome: result.won ? 'win' : 'loss',
        mode: 'adventure',
        timestamp: Date.now(),
      };

      return {
        ...prev,
        battlesTotal: prev.battlesTotal + 1,
        battlesWon: result.won ? prev.battlesWon + 1 : prev.battlesWon,
        lifetimeBattlesWon: result.won ? getLifetimeBattlesWon(prev) + 1 : getLifetimeBattlesWon(prev),
        stageBattlesTotal: (prev.stageBattlesTotal ?? 0) + 1,
        stageBattlesWon: result.won ? (prev.stageBattlesWon ?? 0) + 1 : (prev.stageBattlesWon ?? 0),
        strength: prev.strength + result.strengthGained,
        dpPoints: prev.dpPoints + result.dpGained,
        battleExp: (prev.battleExp ?? 0) + result.strengthGained * 10 + result.dpGained,
        effort: Math.min(10, (prev.effort ?? 0) + result.effortGained),
        digiBits: prev.digiBits + result.bitsGained,
        bigMeatStock: Math.max(0, prev.bigMeatStock - result.meatUsed) + result.meatGained,
        sirloinStock: (prev.sirloinStock ?? 0) + (result.sirloinGained ?? 0),
        mushroomStock: (prev.mushroomStock ?? 0) + (result.mushroomGained ?? 0),
        berryStock: (prev.berryStock ?? 0) + (result.berryGained ?? 0),
        vitaminStock: Math.max(0, prev.vitaminStock - result.vitaminsUsed) + result.vitaminsGained,
        energy: Math.max(10, prev.energy - 12),
        ownedSpecialItems: nextRelics,
        equippedSpecialItem: shouldAutoEquip ? result.unlockedRelicId : prev.equippedSpecialItem,
        adventureClearedWave: {
          ...(prev.adventureClearedWave || {}),
          [result.zoneId]: updatedWave,
        },
        battleHistory: [newEntry, ...(prev.battleHistory || [])].slice(0, 10),
        currentWinStreak: result.won ? (prev.currentWinStreak ?? 0) + 1 : 0,
      };
    });

    if (result.won && nextRankProgress.rank > prevRank) {
      triggerRankUpCelebration(nextRankProgress.rank, nextRankProgress.title);
      return;
    }

    if (result.won) {
      const relicNote = result.unlockedRelicId
        ? ` · Unlocked ${SPECIAL_ITEMS[result.unlockedRelicId]?.shortName || result.unlockedRelicId}!`
        : '';
      const bonusFoods = [
        result.sirloinGained ? `+${result.sirloinGained} Sirloin` : '',
        result.mushroomGained ? `+${result.mushroomGained} Mushroom` : '',
        result.berryGained ? `+${result.berryGained} Berry` : '',
      ]
        .filter(Boolean)
        .join(', ');
      showNotification(
        `Adventure Wave ${result.waveNumber} Cleared! +${result.strengthGained} STR, +${result.bitsGained} Bits${bonusFoods ? ` · ${bonusFoods}` : ''}${relicNote}`
      );
    } else {
      showNotification(
        `Defeated in Wave ${result.waveNumber}! Area reset to Wave 1 (+${result.strengthGained} STR, +${result.dpGained} DP).`
      );
    }
  };

  // ROOM CUSTOMIZATION
  const handleBuyFurniture = (item: FurnitureItem) => {
    if (!isRankRequirementMet(pet, item.minTamerRank)) {
      sound.playAlert();
      const tier = getTamerRankTier(item.minTamerRank || 1);
      showNotification(`🔒 Requires Rank ${tier.rank} (${tier.title}) for ${item.name}!`);
      return;
    }
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

  const handleBuyShopItem = (itemId: ShopItemId, cost: number) => {
    const itemRankRequirements: Partial<Record<ShopItemId, number>> = {
      sirloin: 2,
      forage_basket: 2,
      training_chip: 3,
      miracle_elixir: 4,
      sovereign_core: 5,
    };
    const requiredRank = itemRankRequirements[itemId] ?? 1;
    if (!isRankRequirementMet(pet, requiredRank)) {
      sound.playAlert();
      const tier = getTamerRankTier(requiredRank);
      showNotification(`🔒 Requires Rank ${tier.rank} (${tier.title}) to unlock this item!`);
      return;
    }

    const needsActivePartner =
      itemId === 'training_chip' || itemId === 'miracle_elixir' || itemId === 'sovereign_core';
    if (needsActivePartner && !requireAliveAndHatched()) {
      return;
    }

    const itemMinPrices: Partial<Record<ShopItemId, number>> = {
      sirloin: 90,
      forage_basket: 180,
      training_chip: 550,
      miracle_elixir: 750,
      sovereign_core: 1450,
    };
    const effectiveCost = Math.max(cost, itemMinPrices[itemId] ?? 0);

    if (pet.digiBits < effectiveCost) {
      sound.playAlert();
      showNotification('Not enough DigiBits! Win Colosseum battles or train in mini-games!');
      return;
    }

    let purchaseMessage = `Purchased item from Bazaar! 🪙 (-${effectiveCost} Bits)`;
    if (itemId === 'forage_basket') {
      purchaseMessage = `Bought Trail Ration Crate! (-${effectiveCost} Bits · +2 Digi-Mushrooms & +2 Digi-Berries)`;
    } else if (itemId === 'training_chip') {
      purchaseMessage = `Installed Gym Mastery Chip! (-${effectiveCost} Bits · +6 OFF/DEF, +4 SPD/BRN, +2 Effort, +25 EXP)`;
    } else if (itemId === 'miracle_elixir') {
      purchaseMessage = `Applied Royal Miracle Elixir! (-${effectiveCost} Bits · 100% Hunger & Energy, Cure, +30 Happy, +15 DP)`;
    } else if (itemId === 'sovereign_core') {
      purchaseMessage = `Merged Sovereign Data Core! (-${effectiveCost} Bits · +12 All RPG Stats, +15 STR, +30 DP, +100 EXP)`;
    }

    setPet((prev) => {
      const speciesObj = DIGIMON_DATABASE[prev.currentSpeciesId];
      const baseBattle = getEffectiveBattleStats(prev, speciesObj);
      let bigMeatStock = prev.bigMeatStock;
      let sirloinStock = prev.sirloinStock ?? 0;
      let mushroomStock = prev.mushroomStock ?? 0;
      let berryStock = prev.berryStock ?? 0;
      let vitaminStock = prev.vitaminStock;
      let isSick = prev.isSick;
      let hunger = prev.hunger;
      let energy = prev.energy;
      let happiness = prev.happiness;
      let strength = prev.strength;
      let dpPoints = prev.dpPoints;
      let effort = prev.effort ?? 0;
      let battleExp = prev.battleExp ?? 0;
      let battleStats = prev.battleStats;
      let careCallStartedAt = prev.careCallStartedAt;
      let lastHungerDropAt = prev.lastHungerDropAt;
      let sickSince = prev.sickSince;
      let neglectTicks = prev.neglectTicks;

      if (itemId === 'meat') {
        bigMeatStock += 1;
      } else if (itemId === 'meat_bundle') {
        bigMeatStock += 5;
      } else if (itemId === 'sirloin') {
        sirloinStock += 1;
      } else if (itemId === 'forage_basket') {
        mushroomStock += 2;
        berryStock += 2;
      } else if (itemId === 'vitamin') {
        vitaminStock += 1;
      } else if (itemId === 'vitamin_bundle') {
        vitaminStock += 5;
      } else if (itemId === 'medicine') {
        isSick = false;
        sickSince = undefined;
        neglectTicks = 0;
      } else if (itemId === 'training_chip') {
        effort = Math.min(10, effort + 2);
        battleExp += 25;
        strength += 5;
        battleStats = {
          ...baseBattle,
          offense: baseBattle.offense + 6,
          defense: baseBattle.defense + 6,
          speed: baseBattle.speed + 4,
          brains: baseBattle.brains + 4,
        };
      } else if (itemId === 'miracle_elixir') {
        hunger = 100;
        energy = 100;
        happiness = Math.min(100, happiness + 30);
        dpPoints += 15;
        isSick = false;
        sickSince = undefined;
        neglectTicks = 0;
        careCallStartedAt = undefined;
        lastHungerDropAt = Date.now();
      } else if (itemId === 'sovereign_core') {
        battleExp += 100;
        strength += 15;
        dpPoints += 30;
        effort = Math.min(10, effort + 3);
        battleStats = {
          maxHp: baseBattle.maxHp + 40,
          maxMp: baseBattle.maxMp + 15,
          offense: baseBattle.offense + 12,
          defense: baseBattle.defense + 12,
          speed: baseBattle.speed + 12,
          brains: baseBattle.brains + 12,
        };
      }

      return {
        ...prev,
        digiBits: prev.digiBits - effectiveCost,
        bigMeatStock,
        sirloinStock,
        mushroomStock,
        berryStock,
        vitaminStock,
        isSick,
        sickSince,
        neglectTicks,
        hunger,
        energy,
        happiness,
        strength,
        dpPoints,
        effort,
        battleExp,
        battleStats,
        careCallStartedAt,
        lastHungerDropAt,
      };
    });

    showNotification(purchaseMessage);
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
    const theme = ROOM_THEMES.find((t) => t.id === themeId);
    if (!theme) return;
    if (!isRankRequirementMet(pet, theme.minTamerRank)) {
      sound.playAlert();
      const tier = getTamerRankTier(theme.minTamerRank || 1);
      showNotification(`🔒 ${theme.name} unlocks at Rank ${tier.rank} (${tier.title})!`);
      return;
    }
    manualThemeOverrideRef.current = true;
    if (!DARK_ROOM_THEME_IDS.has(themeId)) {
      saveDaytimeTheme(themeId);
    }
    setPet((prev) => ({
      ...prev,
      activeRoomTheme: themeId,
    }));
  };

  const handleCycleDayNight = () => {
    const order: DayNightPreference[] = ['auto', 'night', 'day'];
    const nextPref = order[(order.indexOf(dayNightPref) + 1) % order.length];
    saveDayNightPref(nextPref);
    setDayNightPref(nextPref);
    manualThemeOverrideRef.current = false;
    const nextNight = resolveNightMode(nextPref);
    setIsNightMode(nextNight);
    setPet((prev) => ({
      ...prev,
      activeRoomTheme: syncRoomThemeForLightCycle(prev.activeRoomTheme || 'file-island', nextNight),
    }));
    showNotification(
      nextPref === 'auto'
        ? `🕒 Day/Night Cycle set to AUTO (${nextNight ? 'Evening Night' : 'Daytime'})`
        : nextPref === 'night'
        ? '🌙 Evening Mode enabled — UI dimmed & dark room theme active.'
        : '☀️ Daylight Mode enabled — Full brightness & daytime room restored.'
    );
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
      isFrozen: false,
      frozenAt: undefined,
      poopCount: 0,
      careMistakes: 0,
      battlesWon: 0,
      battlesTotal: 0,
      lifetimeBattlesWon: getLifetimeBattlesWon(prev),
      trainingCount: 0,
      stageBattlesWon: 0,
      stageBattlesTotal: 0,
      stageTrainingCount: 0,
      equippedSpecialItem: null,
      ownedSpecialItems: prev.ownedSpecialItems || [],
      digiBits: Math.max(100, prev.digiBits),
      bigMeatStock: Math.max(8, prev.bigMeatStock),
      sirloinStock: prev.sirloinStock ?? 0,
      mushroomStock: prev.mushroomStock ?? 0,
      berryStock: prev.berryStock ?? 0,
      vitaminStock: Math.max(5, prev.vitaminStock),
      activeRoomTheme: prev.activeRoomTheme || 'file-island',
      placedFurniture: prev.placedFurniture?.length
        ? prev.placedFurniture
        : [{ instanceId: 'init-1', furnitureId: 'meat-grill', x: 28, y: 68 }],
      lastCareCheck: now,
      lastHungerDropAt: now,
      lastPoopAt: now,
      careCallStartedAt: undefined,
      sleepCallStartedAt: undefined,
      battleStats: undefined,
      learnedAttackIds: undefined,
      equippedAttackIds: undefined,
      adventureClearedWave: prev.adventureClearedWave || {},
      battleExp: prev.battleExp ?? 0,
      battleHistory: prev.battleHistory || [],
      currentWinStreak: prev.currentWinStreak ?? 0,
      unlockedSpeciesIds: loadUnlockedSpeciesIds(prev.unlockedSpeciesIds || []),
    }));
    setIsEggModalOpen(false);
    showNotification(`🥚 Selected Egg #${String(egg.eggNumber).padStart(2, '0')} (${egg.crestName})! Hatches in 1 minute.`);
  };

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const toggleCareAlerts = async () => {
    sound.playButton();
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    setCareAlertsEnabled(next);
    if (next) {
      const perm = await requestCareNotificationPermission();
      if (perm === 'granted') {
        showNotification('🔔 Hunger & Toilet alerts enabled!');
      } else {
        showNotification('🔔 In-app Hunger & Toilet alerts enabled!');
      }
    } else {
      showNotification('🔕 System push alerts muted (LCD care calls stay visible).');
    }
  };

  const careNeeds = evaluateCareNeeds(pet, evoNowMs);
  const tamerRank = computeTamerRankProgress(pet);

  return (
    <div
      className={`relative min-h-screen w-full text-slate-100 flex flex-col justify-between font-display overflow-x-hidden selection:bg-amber-400 selection:text-slate-950 transition-colors duration-700 ${
        isNightMode ? 'bg-[#02040a]' : 'bg-slate-950'
      }`}
    >
      
      {/* Dynamic Background Mesh / Digital Grid (shifts to quiet evening starfield at night) */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${isNightMode ? 'opacity-30' : 'opacity-20'}`}>
        <div
          className={`absolute inset-0 ${
            isNightMode
              ? 'bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:28px_28px]'
              : 'bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]'
          }`}
        />
      </div>

      {/* Subtle Nighttime Ambient Dimming Veil */}
      {isNightMode && (
        <div className="fixed inset-0 pointer-events-none z-[35] bg-[#020512]/28 transition-opacity duration-700" />
      )}

      {/* TOP APP HEADER BAR (MOBILE-NATIVE & NOTCH SAFE) */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-3.5 py-2 flex items-center justify-between gap-2 android-safe-top-bar transition-all duration-700 ${
          isNightMode
            ? 'border-indigo-950/90 bg-slate-950/95 brightness-[0.88]'
            : 'border-slate-800/80 bg-slate-900/95'
        }`}
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
            className="px-2.5 py-1.5 rounded-xl font-pixel text-[9px] font-bold shadow-md flex items-center gap-1 cursor-pointer active:scale-95 transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25"
            title="Float Digimon over all apps"
          >
            <span>📱</span>
            <span>FLOAT</span>
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

          {/* Care Alert Bell Toggle */}
          <button
            onClick={toggleCareAlerts}
            className={`relative p-1.5 rounded-xl transition-colors cursor-pointer ${
              alertsEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-500'
            }`}
            title={alertsEnabled ? 'Care Alerts ON (Hunger & Toilet)' : 'Care Alerts Muted'}
            aria-label={alertsEnabled ? 'Mute care alerts' : 'Enable care alerts'}
          >
            {alertsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            {alertsEnabled && careNeeds.hasAnyNeed && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
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
      <main
        className={`flex-1 flex flex-col items-center justify-start px-0 py-2 relative z-10 max-w-2xl mx-auto w-full pb-24 transition-[filter] duration-700 ${
          isNightMode ? 'brightness-[0.84] saturate-[0.9]' : ''
        }`}
      >
        
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
        ) : pet.isFrozen ? (
          <div className="w-full px-2.5 sm:px-4">
            <div className="w-full mb-2.5 py-2 px-3.5 rounded-2xl border border-cyan-400/60 bg-sky-950/85 text-cyan-100 flex items-center justify-between gap-2 shadow-md">
              <div className="min-w-0">
                <div className="font-pixel text-[10px] text-cyan-300 flex items-center gap-1.5">
                  <span>❄️</span>
                  <span>COLD MODE (FRIDGE ACTIVE)</span>
                </div>
                <div className="text-[11px] font-chakra text-cyan-100/80 truncate mt-0.5">
                  Game state paused — no hunger drain, poop, or care mistakes.
                </div>
              </div>
              <button
                onClick={handleToggleFridge}
                className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-pixel text-[9px] font-bold shrink-0 cursor-pointer active:scale-95"
              >
                UNFREEZE
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
        ) : evolutionCheck.can && (
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
        )}

        {/* Active Hunger, Bedtime & Toilet Notification Alerts */}
        {!pet.isDead &&
          !pet.isFrozen &&
          pet.stage !== 'egg' &&
          (careNeeds.isHungry || careNeeds.needsToilet || careNeeds.isSleepy) && (
            <div className="w-full px-2.5 sm:px-4 flex flex-col gap-1.5 mb-2.5">
              {careNeeds.isSleepy && (
                <div className="w-full py-2 px-3 rounded-2xl border bg-indigo-950/85 border-indigo-400/70 text-indigo-100 flex items-center justify-between gap-2 shadow-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0">🌙</span>
                    <div className="min-w-0">
                      <div className="font-pixel text-[9px] truncate">
                        BEDTIME CALL! LIGHTS NEEDED
                      </div>
                      <div className="text-[10px] font-chakra opacity-90 truncate tabular-nums">
                        {careNeeds.graceRemainingMs > 0
                          ? `Turn lights off within ${formatDurationMs(careNeeds.graceRemainingMs)} to avoid Care Mistake!`
                          : `${pet.nickname?.trim() || currentSpecies?.name || 'Digimon'} is sleepy — turn lights off!`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleToggleLights();
                      triggerHaptic('medium');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-400 hover:bg-indigo-300 text-slate-950 font-pixel text-[9px] font-bold shrink-0 cursor-pointer active:scale-95"
                  >
                    LIGHTS OFF
                  </button>
                </div>
              )}

              {careNeeds.isHungry && (
                <div
                  className={`w-full py-2 px-3 rounded-2xl border flex items-center justify-between gap-2 shadow-md ${
                    careNeeds.isStarving
                      ? 'bg-rose-950/85 border-rose-500/80 text-rose-100'
                      : 'bg-amber-950/75 border-amber-500/60 text-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <PixelMeatIcon className="w-5 h-5 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-pixel text-[9px] truncate">
                        {careNeeds.isStarving
                          ? `🚨 STARVING ALERT! (${pet.hunger}%)`
                          : `🍖 HUNGER ALERT! (${pet.hunger}%)`}
                      </div>
                      <div className="text-[10px] font-chakra opacity-90 truncate tabular-nums">
                        {careNeeds.isStarving && careNeeds.graceRemainingMs > 0
                          ? `Feed within ${formatDurationMs(careNeeds.graceRemainingMs)} to avoid Care Mistake!`
                          : `${pet.nickname?.trim() || currentSpecies?.name || 'Digimon'} wants Big Meat.`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleFeedMeat();
                      triggerHaptic('heavy');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-pixel text-[9px] font-bold shrink-0 cursor-pointer active:scale-95"
                  >
                    FEED
                  </button>
                </div>
              )}

              {careNeeds.needsToilet && (
                <div
                  className={`w-full py-2 px-3 rounded-2xl border flex items-center justify-between gap-2 shadow-md ${
                    careNeeds.toiletUrgent
                      ? 'bg-rose-950/85 border-rose-500/80 text-rose-100'
                      : 'bg-amber-950/75 border-amber-500/60 text-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <PixelPoopIcon className="w-5 h-5 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-pixel text-[9px] truncate tabular-nums">
                        💩 TOILET ALERT! ({pet.poopCount}/4 PILE{pet.poopCount === 1 ? '' : 'S'})
                      </div>
                      <div className="text-[10px] font-chakra opacity-90 truncate">
                        {pet.poopCount >= 4
                          ? '4 piles reached — got sick & +1 Care Mistake! Flush & cure now.'
                          : pet.poopCount >= 3
                          ? 'Urgent! Sickness & Care Mistake trigger at 4 piles.'
                          : `${pet.nickname?.trim() || currentSpecies?.name || 'Digimon'} needs a toilet flush.`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleCleanPoop();
                      triggerHaptic('medium');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-pixel text-[9px] font-bold shrink-0 cursor-pointer active:scale-95"
                  >
                    FLUSH
                  </button>
                </div>
              )}
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

        {/* Compact Tamer Rank Progression Strip */}
        <div className="w-full px-2.5 sm:px-4 mb-2">
          <button
            type="button"
            onClick={() => {
              sound.playButton();
              triggerHaptic('light');
              setIsTamerRankOpen(true);
            }}
            className={`w-full px-3 py-2 rounded-xl border ${tamerRank.currentTier.borderClass} bg-slate-900/90 hover:bg-slate-800/90 flex items-center justify-between gap-2.5 cursor-pointer transition-colors text-left`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{tamerRank.badge}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-pixel text-[9px] font-bold truncate ${tamerRank.currentTier.accentClass}`}>
                    RANK {tamerRank.rank} · {tamerRank.title.toUpperCase()}
                  </span>
                </div>
                <div className="text-[10px] font-chakra text-slate-400 truncate tabular-nums">
                  {tamerRank.battlesWon} Wins · {tamerRank.zonesCleared}/{tamerRank.totalZones} Zones ·{' '}
                  {tamerRank.nextTier
                    ? `${tamerRank.pointsToNext} pts to Rank ${tamerRank.nextTier.rank}`
                    : 'Max Rank'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${tamerRank.currentTier.barClass}`}
                  style={{ width: `${tamerRank.progressPct}%` }}
                />
              </div>
              <span className="font-pixel text-[8px] text-amber-300 tabular-nums whitespace-nowrap">
                {tamerRank.score} PT »
              </span>
            </div>
          </button>
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
          onToggleFridge={handleToggleFridge}
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
          isNightTime={isNightMode}
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

        {/* Sickness urgent alert */}
        {pet.isSick && (
          <div className="w-full px-2.5 sm:px-4 flex gap-2 mt-2">
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

                <button
                  onClick={() => {
                    handleToggleFridge();
                    triggerHaptic('light');
                  }}
                  className={`col-span-2 p-3 border rounded-2xl flex items-center justify-between gap-2 active:scale-95 transition-all cursor-pointer ${
                    pet.isFrozen
                      ? 'bg-sky-950/75 hover:bg-sky-900/80 border-cyan-400 text-cyan-200'
                      : 'bg-slate-800 hover:bg-sky-950/50 border-cyan-500/40 text-cyan-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <span className="text-2xl">❄️</span>
                    <div>
                      <div>{pet.isFrozen ? 'TAKE OUT OF FRIDGE' : 'FRIDGE (COLD MODE)'}</div>
                      <div className="text-[9px] text-slate-400 font-chakra">
                        {pet.isFrozen
                          ? 'Game state is currently paused'
                          : 'Pauses hunger, poop & evolution while away'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-1 rounded-lg bg-slate-950/80 border border-cyan-500/40">
                    {pet.isFrozen ? 'RESUME' : 'PAUSE'}
                  </span>
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
                    setIsInventoryOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-cyan-950/60 border border-cyan-500/40 rounded-2xl flex items-center gap-2.5 text-cyan-300 cursor-pointer"
                >
                  <Backpack className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="truncate">INVENTORY &amp; RELICS</span>
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
                    setIsTamerRankOpen(true);
                  }}
                  className="p-3 bg-slate-800 hover:bg-yellow-950/60 border border-yellow-500/40 rounded-2xl flex items-center gap-2.5 text-yellow-300 cursor-pointer"
                >
                  <Award className="w-5 h-5 text-yellow-400 shrink-0" />
                  <span className="truncate">TAMER RANK</span>
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
                    handleCycleDayNight();
                  }}
                  className={`p-3 border rounded-2xl flex items-center gap-2.5 cursor-pointer transition-colors ${
                    isNightMode
                      ? 'bg-indigo-950/75 hover:bg-indigo-900/80 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-800 hover:bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  {isNightMode ? (
                    <Moon className="w-5 h-5 text-indigo-300 shrink-0" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-300 shrink-0" />
                  )}
                  <span className="truncate text-xs">
                    {dayNightPref === 'auto'
                      ? `CYCLE: AUTO (${isNightMode ? 'NIGHT' : 'DAY'})`
                      : dayNightPref === 'night'
                      ? 'CYCLE: NIGHT MODE'
                      : 'CYCLE: DAY MODE'}
                  </span>
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
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t pb-[max(calc(env(safe-area-inset-bottom,0px)+0.4rem),0.6rem)] pt-1.5 px-2 transition-all duration-700 ${
          isNightMode
            ? 'bg-slate-950/95 border-indigo-950/90 brightness-[0.88]'
            : 'bg-slate-900/95 border-slate-800'
        }`}
      >
        <div className="max-w-md mx-auto grid grid-cols-6 gap-1 items-center text-center">
          {/* 1. CARE SHEET */}
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
            {(pet.poopCount > 0 || pet.isSick || pet.hunger <= 25) && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          {/* 2. BATTLE */}
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

          {/* 3. DOJO */}
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

          {/* 4. ROOM */}
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

          {/* 5. SHOP */}
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

          {/* 6. MORE */}
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
        onToggleEquipAttack={handleToggleEquipAttack}
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
        isNightTime={isNightMode}
        dayNightPref={dayNightPref}
        onCycleDayNight={handleCycleDayNight}
        onOpenTamerRank={() => setIsTamerRankOpen(true)}
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
        onOpenTamerRank={() => setIsTamerRankOpen(true)}
        onEquipSpecialItem={handleEquipSpecialItem}
        onToggleEquipAttack={handleToggleEquipAttack}
        onUpdatePlayerName={handleUpdatePlayerName}
        onUpdateNickname={handleUpdateNickname}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        pet={pet}
        onBuyItem={handleBuyShopItem}
        onOpenTamerRank={() => setIsTamerRankOpen(true)}
      />

      <TamerRankModal
        isOpen={isTamerRankOpen}
        onClose={() => setIsTamerRankOpen(false)}
        pet={pet}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenRoom={() => setIsRoomOpen(true)}
        onOpenAdventure={() => {
          if (!requireAliveAndHatched()) return;
          setIsAdventureOpen(true);
        }}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        pet={pet}
        onFeedMeat={handleFeedMeat}
        onFeedSirloin={handleFeedSirloin}
        onFeedMushroom={handleFeedMushroom}
        onFeedBerry={handleFeedBerry}
        onGiveVitamin={handleGiveVitamin}
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
                isFrozen: false,
                frozenAt: undefined,
                neglectTicks: 0,
                sirloinStock: 0,
                mushroomStock: 0,
                berryStock: 0,
                ...parsed,
                lifetimeBattlesWon: Math.max(parsed.lifetimeBattlesWon ?? 0, parsed.battlesWon ?? 0),
                battleHistory: Array.isArray(parsed.battleHistory) ? parsed.battleHistory.slice(0, 10) : [],
                currentWinStreak: typeof parsed.currentWinStreak === 'number' ? Math.max(0, parsed.currentWinStreak) : 0,
                stageEnteredAt: parsed.stageEnteredAt || Date.now(),
                lastHungerDropAt: parsed.lastHungerDropAt || parsed.lastCareCheck || Date.now(),
                lastPoopAt: parsed.lastPoopAt || parsed.lastCareCheck || Date.now(),
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
