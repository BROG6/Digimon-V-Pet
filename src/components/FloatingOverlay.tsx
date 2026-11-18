import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { PetState, DigimonSpecies, DigiEggInfo } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { PixelMeatIcon, PixelVitaminIcon, PixelPoopIcon } from './PixelItemIcons';
import { sound } from '../utils/audio';
import { getBatteryStatus, DeviceBatteryInfo } from '../utils/battery';
import {
  Battery,
  BatteryCharging,
  Clock,
  Sparkles,
  Heart,
  Minimize2,
  Volume2,
  VolumeX,
  Gamepad2,
  Home,
  Smartphone,
  MessageSquare,
  Send,
  LayoutGrid,
  X
} from 'lucide-react';
import { fetchDigimonAiDialogue, getContextualQuote, DigimonChatTurn } from '../utils/digimonPersonality';
import {
  OverlayPetState,
  GridLayoutPresetId,
  GRID_LAYOUT_PRESETS,
  GRID_RATIOS_CHANGED_EVENT,
  getSavedGridPreset,
  setSavedGridPreset,
  getGridRowRatios,
  isFlyingSpecies,
  computeSurfaceRowYs,
  snapToNearestSurfaceRow,
  computeParabolicJumpPoint,
  stepWaypointFlight,
  pickOffScreenTrigger,
} from '../utils/petOverlayEngine';

interface FloatingOverlayProps {
  pet: PetState;
  species?: DigimonSpecies;
  egg?: DigiEggInfo;
  onFeedMeat: () => void;
  onGiveVitamin: () => void;
  onCleanPoop: () => void;
  onPet: () => void;
  onForageReward?: (reward: 'meat' | 'friends') => void;
  onOpenRoom: () => void;
  onOpenColosseum: () => void;
  onOpenDigivice: () => void;
  onOpenTraining: () => void;
  onOpenStats?: () => void;
  onOpenNativePip?: () => void;
  isOverlayActive: boolean;
  onToggleOverlay: () => void;
}

const SPRITE_FOOT_OFFSET = 86;
const SPRITE_BOX_WIDTH = 96;
const JUMP_DURATION_MS = 560;

const PRESET_ORDER: GridLayoutPresetId[] = ['asus-4row', 'compact-5row', 'dock-only'];

export const FloatingOverlay: React.FC<FloatingOverlayProps> = ({
  pet,
  species,
  egg,
  onFeedMeat,
  onGiveVitamin,
  onCleanPoop,
  onPet,
  onForageReward,
  onOpenRoom,
  onOpenColosseum,
  onOpenTraining: _onOpenTraining,
  onOpenNativePip,
  isOverlayActive,
  onToggleOverlay,
}) => {
  const winW = typeof window !== 'undefined' ? window.innerWidth : 380;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 760;

  const [gridPreset, setGridPreset] = useState<GridLayoutPresetId>(() => getSavedGridPreset());
  const initialRowYs = computeSurfaceRowYs(winH, getGridRowRatios(getSavedGridPreset()));
  const initialY = (initialRowYs[initialRowYs.length - 1] ?? winH - 120) - SPRITE_FOOT_OFFSET;
  const initialX = Math.max(16, winW / 2 - 48);

  const xMotion = useMotionValue(initialX);
  const yMotion = useMotionValue(initialY);

  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [currentAction, setCurrentAction] = useState<'idle' | 'walk' | 'sleep' | 'sick' | 'eat' | 'happy' | 'sit' | 'poop'>('idle');
  const [activeEatItem, setActiveEatItem] = useState<'meat' | 'vitamin'>('meat');
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [bubblePlacement, setBubblePlacement] = useState<{ align: 'left' | 'center' | 'right'; below: boolean }>({
    align: 'center',
    below: false,
  });
  const [carriedItem, setCarriedItem] = useState<'meat' | null>(null);
  const [isOffScreenHidden, setIsOffScreenHidden] = useState<boolean>(false);
  const [isEvolvingFlash, setIsEvolvingFlash] = useState<boolean>(false);
  const [isDraggingPet, setIsDraggingPet] = useState<boolean>(false);
  const [isOverDismissZone, setIsOverDismissZone] = useState<boolean>(false);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isChatInputOpen, setIsChatInputOpen] = useState<boolean>(false);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<DigimonChatTurn[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [battery, setBattery] = useState<DeviceBatteryInfo>({ level: 85, charging: false, supported: false });
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  const isDraggingRef = useRef<boolean>(false);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const carriedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapMsRef = useRef<number>(0);
  const prevSpeciesIdRef = useRef<string | undefined>(species?.id);
  const isFlying = isFlyingSpecies(species);

  const petVitalsRef = useRef({
    hunger: pet.hunger,
    happiness: pet.happiness,
    isSick: pet.isSick,
    isSleeping: pet.isSleeping,
  });
  petVitalsRef.current = {
    hunger: pet.hunger,
    happiness: pet.happiness,
    isSick: pet.isSick,
    isSleeping: pet.isSleeping,
  };

  const onForageRewardRef = useRef(onForageReward);
  onForageRewardRef.current = onForageReward;

  const physicsRef = useRef<{
    petState: OverlayPetState;
    offScreenPhase: 'none' | 'exiting' | 'hidden' | 'entering';
    posX: number;
    posY: number;
    targetX: number;
    targetY: number;
    rowIndex: number;
    jumpStartX: number;
    jumpStartY: number;
    jumpEndX: number;
    jumpEndY: number;
    jumpTargetRow: number;
    jumpStartMs: number;
    stateUntilMs: number;
    offScreenWakeMs: number;
    exitToRight: boolean;
    enterFromTop: boolean;
    forageKind: 'forage_meat' | 'visit_friends';
    cyclesSinceForage: number;
    hoverPhase: number;
  }>({
    petState: isFlying ? 'FLYING' : 'IDLE',
    offScreenPhase: 'none',
    posX: initialX,
    posY: initialY,
    targetX: initialX,
    targetY: initialY,
    rowIndex: Math.max(0, initialRowYs.length - 1),
    jumpStartX: initialX,
    jumpStartY: initialY,
    jumpEndX: initialX,
    jumpEndY: initialY,
    jumpTargetRow: Math.max(0, initialRowYs.length - 1),
    jumpStartMs: 0,
    stateUntilMs: Date.now() + 1400,
    offScreenWakeMs: 0,
    exitToRight: true,
    enterFromTop: false,
    forageKind: 'forage_meat',
    cyclesSinceForage: 0,
    hoverPhase: 0,
  });

  // Initialize battery and clock
  useEffect(() => {
    getBatteryStatus().then((b) => setBattery(b));

    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Re-snap grounded pet immediately when grid preset changes
  const handleCycleGridPreset = () => {
    sound.playButton();
    const nextIdx = (PRESET_ORDER.indexOf(gridPreset) + 1) % PRESET_ORDER.length;
    const nextPreset = PRESET_ORDER[nextIdx];
    setSavedGridPreset(nextPreset);
    setGridPreset(nextPreset);

    if (!isFlying) {
      const h = typeof window !== 'undefined' ? window.innerHeight : 760;
      const rowYs = computeSurfaceRowYs(h, getGridRowRatios(nextPreset));
      const p = physicsRef.current;
      const snapped = snapToNearestSurfaceRow(p.posY + SPRITE_FOOT_OFFSET, rowYs);
      p.rowIndex = snapped.rowIndex;
      p.posY = snapped.y - SPRITE_FOOT_OFFSET;
      yMotion.set(p.posY);
    }
  };

  useEffect(() => {
    const handleGridUpdated = () => {
      const nextPreset = getSavedGridPreset();
      setGridPreset(nextPreset);
      if (!isFlying) {
        const h = typeof window !== 'undefined' ? window.innerHeight : 760;
        const rowYs = computeSurfaceRowYs(h, getGridRowRatios(nextPreset));
        const p = physicsRef.current;
        const idx = Math.max(0, Math.min(p.rowIndex, rowYs.length - 1));
        p.rowIndex = idx;
        p.posY = (rowYs[idx] ?? h - 120) - SPRITE_FOOT_OFFSET;
        yMotion.set(p.posY);
      }
    };
    window.addEventListener(GRID_RATIOS_CHANGED_EVENT, handleGridUpdated);
    return () => window.removeEventListener(GRID_RATIOS_CHANGED_EVENT, handleGridUpdated);
  }, [isFlying, yMotion]);

  const updateBubblePlacement = () => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 380;
    const px = xMotion.get();
    const py = yMotion.get();
    const align: 'left' | 'center' | 'right' =
      px < 90 ? 'left' : px + SPRITE_BOX_WIDTH > w - 90 ? 'right' : 'center';
    const below = py < 150;
    setBubblePlacement({ align, below });
  };

  // Show speech helper for state engine & user interactions
  const showShortSpeech = (msg: string, durationMs: number = 4500) => {
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    updateBubblePlacement();
    setSpeechBubble(msg);
    const readMs = Math.max(durationMs, Math.min(9500, 2600 + msg.length * 45));
    speechTimerRef.current = setTimeout(() => {
      setSpeechBubble(null);
    }, readMs);
  };

  // Main 5-State Overlay Engine Loop (~30fps)
  useEffect(() => {
    if (!isOverlayActive) return;

    if (pet.isSleeping) {
      physicsRef.current.petState = 'IDLE';
      setCurrentAction('sleep');
      return;
    }

    const getBounds = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 380;
      const h = typeof window !== 'undefined' ? window.innerHeight : 760;
      const rowYs = computeSurfaceRowYs(h, getGridRowRatios(gridPreset));
      const minX = 12;
      const maxX = Math.max(minX + 40, w - SPRITE_BOX_WIDTH - 12);
      const minSkyY = 76;
      const maxSkyY = Math.max(minSkyY + 100, h - 130);
      return { w, h, rowYs, minX, maxX, minSkyY, maxSkyY };
    };

    const pickFlyWaypoint = (p: typeof physicsRef.current) => {
      const { minX, maxX, minSkyY, maxSkyY } = getBounds();
      p.targetX = minX + Math.random() * (maxX - minX);
      p.targetY = minSkyY + Math.random() * (maxSkyY - minSkyY);
      setFacing(p.targetX >= p.posX ? 'right' : 'left');
    };

    const chooseNextBehavior = (now: number) => {
      const p = physicsRef.current;
      const { w, rowYs, minX, maxX } = getBounds();

      if (isFlying) {
        p.petState = 'FLYING';
        pickFlyWaypoint(p);
        setCurrentAction('walk');
        return;
      }

      p.rowIndex = Math.max(0, Math.min(p.rowIndex, rowYs.length - 1));

      if (rowYs.length > 1 && Math.random() < 0.42) {
        let nextRow = p.rowIndex;
        if (p.rowIndex === 0) {
          nextRow = 1;
        } else if (p.rowIndex === rowYs.length - 1) {
          nextRow = p.rowIndex - 1;
        } else {
          nextRow = Math.random() < 0.5 ? p.rowIndex - 1 : p.rowIndex + 1;
        }
        p.jumpStartX = p.posX;
        p.jumpStartY = p.posY;
        p.jumpTargetRow = nextRow;
        p.jumpEndX = minX + Math.random() * (maxX - minX);
        p.jumpEndY = rowYs[nextRow] - SPRITE_FOOT_OFFSET;
        p.jumpStartMs = now;
        p.petState = 'JUMPING';
        setFacing(p.jumpEndX >= p.jumpStartX ? 'right' : 'left');
        setCurrentAction('walk');
      } else {
        p.petState = 'WALKING_GRID';
        let nextX = minX + Math.random() * (maxX - minX);
        if (Math.abs(nextX - p.posX) < 36) {
          nextX = p.posX < w * 0.45 ? maxX - 10 : minX + 10;
        }
        p.targetX = nextX;
        p.targetY = rowYs[p.rowIndex] - SPRITE_FOOT_OFFSET;
        setFacing(p.targetX >= p.posX ? 'right' : 'left');
        setCurrentAction('walk');
      }
    };

    const startOffScreen = (kind: 'forage_meat' | 'visit_friends') => {
      const p = physicsRef.current;
      const { w } = getBounds();
      p.cyclesSinceForage = 0;
      p.petState = 'OFF_SCREEN';
      p.offScreenPhase = 'exiting';
      p.forageKind = kind;
      p.exitToRight = p.posX > w * 0.4;
      p.targetX = p.exitToRight ? w + 120 : -140;
      setFacing(p.exitToRight ? 'right' : 'left');
      setCurrentAction('walk');
      setIsMenuOpen(false);
      showShortSpeech(
        kind === 'forage_meat' ? 'Going foraging for food! 🍖' : 'Visiting Digi-friends! 👋',
        2600
      );
    };

    const completeCycle = (now: number) => {
      const p = physicsRef.current;
      p.cyclesSinceForage += 1;
      const decision = pickOffScreenTrigger({
        hunger: petVitalsRef.current.hunger,
        happiness: petVitalsRef.current.happiness,
        cyclesSinceForage: p.cyclesSinceForage,
      });

      if (decision.trigger) {
        startOffScreen(decision.kind);
        return;
      }

      if (Math.random() < 0.45) {
        p.petState = 'IDLE';
        p.stateUntilMs = now + 1800 + Math.random() * 2400;
        setCurrentAction(
          petVitalsRef.current.isSick
            ? 'sick'
            : Math.random() < 0.35
            ? 'sit'
            : 'idle'
        );
      } else {
        chooseNextBehavior(now);
      }
    };

    const finishReEntry = (now: number) => {
      const p = physicsRef.current;
      p.offScreenPhase = 'none';
      p.petState = 'IDLE';
      p.stateUntilMs = now + 2200;
      setCurrentAction(petVitalsRef.current.isSick ? 'sick' : 'happy');

      if (p.forageKind === 'forage_meat') {
        setCarriedItem('meat');
        showShortSpeech('Found Big Meat! 🍖 (+1 Stock)', 3200);
        onForageRewardRef.current?.('meat');
        if (carriedTimerRef.current) clearTimeout(carriedTimerRef.current);
        carriedTimerRef.current = setTimeout(() => {
          setCarriedItem(null);
        }, 2200);
      } else {
        showShortSpeech('Back from visiting friends! 🤝', 3600);
        onForageRewardRef.current?.('friends');
      }
      sound.playAlert();
    };

    // Ensure grounded pet starts cleanly snapped onto a row
    if (!isFlying) {
      const { rowYs } = getBounds();
      const snapped = snapToNearestSurfaceRow(physicsRef.current.posY + SPRITE_FOOT_OFFSET, rowYs);
      physicsRef.current.rowIndex = snapped.rowIndex;
      physicsRef.current.posY = snapped.y - SPRITE_FOOT_OFFSET;
      yMotion.set(physicsRef.current.posY);
    } else if (physicsRef.current.petState !== 'FLYING') {
      physicsRef.current.petState = 'FLYING';
      pickFlyWaypoint(physicsRef.current);
    }

    const tick = setInterval(() => {
      const p = physicsRef.current;
      if (isDraggingRef.current || isChatInputOpen || petVitalsRef.current.isSleeping) {
        return;
      }

      const now = Date.now();
      const { w, h, rowYs, minX, maxX } = getBounds();

      switch (p.petState) {
        case 'WALKING_GRID': {
          const speed = 2.4;
          const dx = p.targetX - p.posX;
          if (Math.abs(dx) <= speed) {
            p.posX = p.targetX;
            p.posY = rowYs[Math.min(p.rowIndex, rowYs.length - 1)] - SPRITE_FOOT_OFFSET;
            xMotion.set(p.posX);
            yMotion.set(p.posY);
            completeCycle(now);
          } else {
            p.posX += dx > 0 ? speed : -speed;
            p.posY = rowYs[Math.min(p.rowIndex, rowYs.length - 1)] - SPRITE_FOOT_OFFSET;
            xMotion.set(p.posX);
            yMotion.set(p.posY);
          }
          break;
        }

        case 'JUMPING': {
          const t = (now - p.jumpStartMs) / JUMP_DURATION_MS;
          if (t >= 1) {
            p.posX = p.jumpEndX;
            p.posY = p.jumpEndY;
            p.rowIndex = p.jumpTargetRow;
            xMotion.set(p.posX);
            yMotion.set(p.posY);
            completeCycle(now);
          } else {
            const pt = computeParabolicJumpPoint(
              p.jumpStartX,
              p.jumpStartY,
              p.jumpEndX,
              p.jumpEndY,
              t,
              58
            );
            p.posX = pt.x;
            p.posY = pt.y;
            xMotion.set(p.posX);
            yMotion.set(p.posY);
          }
          break;
        }

        case 'FLYING': {
          const res = stepWaypointFlight(p.posX, p.posY, p.targetX, p.targetY, 2.7);
          p.hoverPhase += 0.14;
          const hoverY = Math.sin(p.hoverPhase) * 5;
          p.posX = res.x;
          p.posY = res.y;
          xMotion.set(p.posX);
          yMotion.set(p.posY + hoverY);
          if (res.arrived) {
            completeCycle(now);
          }
          break;
        }

        case 'IDLE': {
          if (isFlying) {
            p.hoverPhase += 0.1;
            yMotion.set(p.posY + Math.sin(p.hoverPhase) * 4);
          }
          if (now >= p.stateUntilMs) {
            chooseNextBehavior(now);
          }
          break;
        }

        case 'OFF_SCREEN': {
          const speed = 3.6;
          if (p.offScreenPhase === 'exiting') {
            p.posX += p.exitToRight ? speed : -speed;
            xMotion.set(p.posX);
            if ((p.exitToRight && p.posX >= w + 90) || (!p.exitToRight && p.posX <= -120)) {
              p.offScreenPhase = 'hidden';
              p.offScreenWakeMs = now + 30000 + Math.random() * 30000;
              setIsOffScreenHidden(true);
            }
          } else if (p.offScreenPhase === 'hidden') {
            if (now >= p.offScreenWakeMs) {
              setIsOffScreenHidden(false);
              p.offScreenPhase = 'entering';
              p.enterFromTop = Math.random() < 0.38;

              if (p.enterFromTop) {
                p.posX = minX + Math.random() * (maxX - minX);
                p.posY = -110;
                p.targetX = p.posX;
                if (isFlying) {
                  p.targetY = h * (0.28 + Math.random() * 0.36);
                } else {
                  p.rowIndex = Math.floor(Math.random() * rowYs.length);
                  p.targetY = rowYs[p.rowIndex] - SPRITE_FOOT_OFFSET;
                }
              } else {
                const fromLeft = p.exitToRight;
                p.posX = fromLeft ? -110 : w + 30;
                if (isFlying) {
                  p.posY = h * (0.28 + Math.random() * 0.42);
                  p.targetY = p.posY;
                } else {
                  p.rowIndex = Math.floor(Math.random() * rowYs.length);
                  p.posY = rowYs[p.rowIndex] - SPRITE_FOOT_OFFSET;
                  p.targetY = p.posY;
                }
                p.targetX = fromLeft ? 48 : Math.max(48, maxX - 36);
                setFacing(fromLeft ? 'right' : 'left');
              }

              xMotion.set(p.posX);
              yMotion.set(p.posY);
              setCurrentAction('walk');
            }
          } else if (p.offScreenPhase === 'entering') {
            if (p.enterFromTop) {
              p.posY += 4.5;
              if (p.posY >= p.targetY) {
                p.posY = p.targetY;
                yMotion.set(p.posY);
                finishReEntry(now);
              } else {
                yMotion.set(p.posY);
              }
            } else {
              const dx = p.targetX - p.posX;
              if (Math.abs(dx) <= speed) {
                p.posX = p.targetX;
                xMotion.set(p.posX);
                finishReEntry(now);
              } else {
                setFacing(dx > 0 ? 'right' : 'left');
                p.posX += dx > 0 ? speed : -speed;
                xMotion.set(p.posX);
              }
            }
          }
          break;
        }
      }
    }, 33);

    return () => {
      clearInterval(tick);
      if (carriedTimerRef.current) clearTimeout(carriedTimerRef.current);
    };
  }, [isOverlayActive, isFlying, gridPreset, pet.isSleeping, isChatInputOpen, xMotion, yMotion]);

  // Live in-place evolution reaction while overlay remains open
  useEffect(() => {
    const nextId = species?.id;
    const prevId = prevSpeciesIdRef.current;
    prevSpeciesIdRef.current = nextId;

    if (!isOverlayActive || !nextId || !prevId || nextId === prevId) return;

    sound.playEvolution();
    setIsOffScreenHidden(false);
    setIsEvolvingFlash(true);
    setCurrentAction('happy');
    showShortSpeech(`⚡ Digivolved into ${species?.name || 'Digimon'}!`, 5200);

    const p = physicsRef.current;
    p.offScreenPhase = 'none';
    if (isFlyingSpecies(species)) {
      p.petState = 'FLYING';
      const w = typeof window !== 'undefined' ? window.innerWidth : 380;
      const h = typeof window !== 'undefined' ? window.innerHeight : 760;
      p.targetX = 24 + Math.random() * Math.max(60, w - SPRITE_BOX_WIDTH - 48);
      p.targetY = 90 + Math.random() * Math.max(80, h - 220);
      setFacing(p.targetX >= p.posX ? 'right' : 'left');
    } else if (p.petState === 'FLYING') {
      const h = typeof window !== 'undefined' ? window.innerHeight : 760;
      const rowYs = computeSurfaceRowYs(h, getGridRowRatios(gridPreset));
      const snapped = snapToNearestSurfaceRow(p.posY + SPRITE_FOOT_OFFSET, rowYs);
      p.rowIndex = snapped.rowIndex;
      p.posY = snapped.y - SPRITE_FOOT_OFFSET;
      yMotion.set(p.posY);
      p.petState = 'IDLE';
      p.stateUntilMs = Date.now() + 2000;
    }

    const flashTimer = setTimeout(() => {
      setIsEvolvingFlash(false);
      setCurrentAction(petVitalsRef.current.isSick ? 'sick' : 'idle');
    }, 1600);

    return () => clearTimeout(flashTimer);
  }, [species?.id, isOverlayActive]);

  // Safety watchdog to prevent talk function from ever getting stuck
  useEffect(() => {
    if (!isAiThinking) return;
    const safetyTimer = setTimeout(() => {
      setIsAiThinking(false);
    }, 13000);
    return () => clearTimeout(safetyTimer);
  }, [isAiThinking]);

  // Generate context-aware speech bubble (with species lore and Gemini AI)
  const triggerSpeech = async (customMessage?: string) => {
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);

    updateBubblePlacement();
    if (customMessage) {
      setSpeechBubble('💭 ...');
      setIsAiThinking(true);
      sound.playButton();

      const priorHistory = chatHistory.slice(-8);
      setChatHistory((prev) => [...prev, { role: 'user', text: customMessage }]);

      try {
        const result = await fetchDigimonAiDialogue({
          speciesName: species?.name || pet.nickname || 'Digimon',
          speciesId: pet.currentSpeciesId,
          stage: pet.stage,
          attribute: species?.attribute,
          type: species?.type,
          description: species?.description,
          signatureMove: species?.signatureMove?.name,
          crestName: egg?.crestName,
          tamerName: egg?.tamerName,
          hunger: pet.hunger,
          happiness: pet.happiness,
          energy: pet.energy,
          strength: pet.strength,
          weight: pet.weight,
          isSick: pet.isSick,
          poopCount: pet.poopCount,
          battlesWon: pet.battlesWon,
          battlesTotal: pet.battlesTotal,
          careMistakes: pet.careMistakes,
          userMessage: customMessage,
          history: priorHistory,
        });

        setChatHistory((prev) => [...prev, { role: 'model', text: result.text }]);
        updateBubblePlacement();
        setSpeechBubble(result.text);
        sound.playAlert();
        setCurrentAction('happy');
        setTimeout(() => {
          setCurrentAction(pet.isSick ? 'sick' : 'idle');
        }, 1500);

        const aiReadMs = Math.max(9000, Math.min(14000, 3500 + result.text.length * 45));
        speechTimerRef.current = setTimeout(() => {
          setSpeechBubble(null);
        }, aiReadMs);
      } catch (err) {
        console.warn('Speech trigger error:', err);
        const fallback = getContextualQuote(pet.currentSpeciesId, {
          isSick: pet.isSick,
          hunger: pet.hunger,
          poopCount: pet.poopCount,
          happiness: pet.happiness,
        });
        updateBubblePlacement();
        setSpeechBubble(fallback);
      } finally {
        setIsAiThinking(false);
      }
      return;
    }

    const msg = getContextualQuote(pet.currentSpeciesId, {
      isSick: pet.isSick,
      hunger: pet.hunger,
      poopCount: pet.poopCount,
      happiness: pet.happiness,
      isSleeping: pet.isSleeping,
      batteryLevel: battery.level,
      currentTimeStr,
    });

    updateBubblePlacement();
    setSpeechBubble(msg);
    sound.playAlert();

    const quoteReadMs = Math.max(5000, Math.min(9000, 2600 + msg.length * 45));
    speechTimerRef.current = setTimeout(() => {
      setSpeechBubble(null);
    }, quoteReadMs);
  };

  const handleSendUserChat = (text: string) => {
    if (!text || !text.trim() || isAiThinking) return;
    const clean = text.trim();
    setChatInputText('');
    triggerSpeech(clean);
  };

  const handleSpriteClick = () => {
    const now = Date.now();
    if (lastTapMsRef.current > 0 && now - lastTapMsRef.current <= 300) {
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
      lastTapMsRef.current = 0;
      sound.playButton();
      onToggleOverlay();
      return;
    }

    lastTapMsRef.current = now;
    if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    singleTapTimerRef.current = setTimeout(() => {
      lastTapMsRef.current = 0;
      sound.playButton();
      setIsMenuOpen((prev) => !prev);
      if (!speechBubble) {
        triggerSpeech();
      }
    }, 260);
  };

  const handlePetDigimon = () => {
    sound.playButton();
    setCurrentAction('happy');
    onPet();
    setTimeout(() => {
      setCurrentAction(pet.isSick ? 'sick' : 'idle');
    }, 1500);
  };

  const handleFeedMeat = () => {
    if (pet.bigMeatStock <= 0) {
      onFeedMeat();
      return;
    }
    setActiveEatItem('meat');
    setCurrentAction('eat');
    onFeedMeat();
    setTimeout(() => {
      setCurrentAction('happy');
      setTimeout(() => {
        setCurrentAction(pet.isSick ? 'sick' : 'idle');
      }, 900);
    }, 1700);
  };

  const handleGiveVitamin = () => {
    if (pet.vitaminStock <= 0) {
      onGiveVitamin();
      return;
    }
    setActiveEatItem('vitamin');
    setCurrentAction('eat');
    onGiveVitamin();
    setTimeout(() => {
      setCurrentAction('happy');
      setTimeout(() => {
        setCurrentAction(pet.isSick ? 'sick' : 'idle');
      }, 900);
    }, 1700);
  };

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  if (!isOverlayActive) return null;

  const shortPresetLabel =
    gridPreset === 'asus-4row'
      ? '4-ROW'
      : gridPreset === 'compact-5row'
      ? '5-ROW'
      : 'DOCK';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden font-display">
      {/* Floating System HUD Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-[max(calc(env(safe-area-inset-top,0px)+0.75rem),3rem)] sm:top-4 left-1/2 -translate-x-1/2 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 rounded-full px-3.5 py-1.5 flex items-center gap-2.5 sm:gap-3 text-xs text-slate-200 max-w-[95vw] overflow-x-auto"
      >
        <div className="flex items-center gap-1.5 text-cyan-400 font-pixel text-[10px] shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isFlying ? 'FLIGHT' : 'GRID'}</span>
        </div>

        {!isFlying && (
          <>
            <div className="h-3 w-[1px] bg-slate-700 shrink-0" />
            <button
              onClick={handleCycleGridPreset}
              className="flex items-center gap-1 text-[10px] font-pixel text-amber-300 hover:text-amber-200 transition-colors cursor-pointer shrink-0"
              title={`Launcher Grid: ${GRID_LAYOUT_PRESETS[gridPreset].label} (tap to cycle)`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{shortPresetLabel}</span>
            </button>
          </>
        )}

        <div className="h-3 w-[1px] bg-slate-700 shrink-0" />

        {/* Battery Monitor */}
        <div className="flex items-center gap-1 text-slate-300 shrink-0">
          {battery.charging ? (
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          ) : (
            <Battery className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{battery.level}%</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-700 shrink-0" />

        {/* Clock */}
        <div className="flex items-center gap-1 text-slate-300 shrink-0">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{currentTimeStr}</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-700 shrink-0" />

        {/* Mute button */}
        <button
          onClick={toggleSound}
          className="p-1 hover:text-cyan-400 transition-colors shrink-0 cursor-pointer"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Pop out to Native Android Overlay */}
        {onOpenNativePip && (
          <>
            <div className="h-3 w-[1px] bg-slate-700 shrink-0" />
            <button
              onClick={onOpenNativePip}
              className="bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-medium transition-all cursor-pointer shadow-sm shadow-purple-500/20 active:scale-95 shrink-0"
              title="Pop out to Native Android Floating Window (over all apps)"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Float Over Apps</span>
            </button>
          </>
        )}

        <div className="h-3 w-[1px] bg-slate-700 shrink-0" />

        {/* Switch back to Main Digivice */}
        <button
          onClick={onToggleOverlay}
          className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-medium transition-all cursor-pointer shrink-0"
        >
          <Minimize2 className="w-3 h-3" />
          <span>Dock</span>
        </button>
      </motion.div>

      {/* Drag-to-Bottom Dismiss Drop Target */}
      <AnimatePresence>
        {isDraggingPet && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1, scale: isOverDismissZone ? 1.15 : 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-1"
          >
            <div
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-xl transition-colors ${
                isOverDismissZone
                  ? 'bg-rose-500 border-white text-white shadow-rose-500/50'
                  : 'bg-slate-900/90 border-rose-400/80 text-rose-300'
              }`}
            >
              <X className="w-6 h-6" />
            </div>
            <span
              className={`font-pixel text-[8px] px-2 py-0.5 rounded-full ${
                isOverDismissZone
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900/85 text-rose-200'
              }`}
            >
              {isOverDismissZone ? 'RELEASE TO CLOSE' : 'DROP TO CLOSE'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Digimon Companion Hitbox */}
      <motion.div
        drag={!isOffScreenHidden}
        dragMomentum={false}
        style={{ x: xMotion, y: yMotion }}
        onDragStart={() => {
          isDraggingRef.current = true;
          setIsDraggingPet(true);
          setIsOverDismissZone(false);
          setCurrentAction('walk');
        }}
        onDrag={() => {
          const screenH = typeof window !== 'undefined' ? window.innerHeight : 760;
          const over = yMotion.get() + SPRITE_FOOT_OFFSET >= screenH - 105;
          setIsOverDismissZone(over);
        }}
        onDragEnd={() => {
          isDraggingRef.current = false;
          setIsDraggingPet(false);
          const screenW = typeof window !== 'undefined' ? window.innerWidth : 380;
          const screenH = typeof window !== 'undefined' ? window.innerHeight : 760;
          const shouldClose = yMotion.get() + SPRITE_FOOT_OFFSET >= screenH - 105;
          setIsOverDismissZone(false);
          if (shouldClose) {
            sound.playButton();
            onToggleOverlay();
            return;
          }
          const clampedX = Math.max(10, Math.min(screenW - SPRITE_BOX_WIDTH - 10, xMotion.get()));
          let droppedY = Math.max(70, Math.min(screenH - 110, yMotion.get()));

          const p = physicsRef.current;
          if (!isFlying) {
            const rowYs = computeSurfaceRowYs(screenH, getGridRowRatios(gridPreset));
            const snapped = snapToNearestSurfaceRow(droppedY + SPRITE_FOOT_OFFSET, rowYs);
            p.rowIndex = snapped.rowIndex;
            droppedY = snapped.y - SPRITE_FOOT_OFFSET;
            p.petState = 'IDLE';
            p.stateUntilMs = Date.now() + 1200;
          } else {
            p.petState = 'FLYING';
          }

          p.posX = clampedX;
          p.posY = droppedY;
          xMotion.set(clampedX);
          yMotion.set(droppedY);
          setCurrentAction(pet.isSick ? 'sick' : 'idle');
        }}
        className={`absolute top-0 left-0 flex flex-col items-center select-none transition-opacity duration-200 ${
          isOffScreenHidden
            ? 'opacity-0 pointer-events-none'
            : 'pointer-events-auto cursor-grab active:cursor-grabbing'
        }`}
      >
        {/* Speech Dialogue Bubble - Anchored by bottom/top edge so long messages never clip behind sprite or screen edges */}
        <AnimatePresence>
          {speechBubble && !isOffScreenHidden && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: bubblePlacement.below ? -8 : 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: bubblePlacement.below ? -8 : 8 }}
              className={`absolute pointer-events-none max-w-[min(260px,calc(100vw-24px))] w-max z-30 select-none ${
                bubblePlacement.below ? 'top-full mt-2' : 'bottom-full mb-2'
              } ${
                bubblePlacement.align === 'left'
                  ? 'left-0'
                  : bubblePlacement.align === 'right'
                  ? 'right-0'
                  : 'left-1/2 -translate-x-1/2'
              }`}
            >
              <div className="relative bg-white/95 backdrop-blur-md text-slate-900 border-2 border-slate-950 rounded-2xl px-3.5 py-2 shadow-2xl text-xs font-bold text-center filter drop-shadow-xl leading-snug whitespace-normal break-words">
                <span>{speechBubble}</span>
                {bubblePlacement.below ? (
                  <>
                    <div
                      className={`absolute -top-2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white ${
                        bubblePlacement.align === 'left'
                          ? 'left-6'
                          : bubblePlacement.align === 'right'
                          ? 'right-6'
                          : 'left-1/2 -translate-x-1/2'
                      }`}
                    />
                    <div
                      className={`absolute -top-2.5 w-0 h-0 border-x-[9px] border-x-transparent border-b-[9px] border-b-slate-950 -z-10 ${
                        bubblePlacement.align === 'left'
                          ? 'left-[23px]'
                          : bubblePlacement.align === 'right'
                          ? 'right-[23px]'
                          : 'left-1/2 -translate-x-1/2'
                      }`}
                    />
                  </>
                ) : (
                  <>
                    <div
                      className={`absolute -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white ${
                        bubblePlacement.align === 'left'
                          ? 'left-6'
                          : bubblePlacement.align === 'right'
                          ? 'right-6'
                          : 'left-1/2 -translate-x-1/2'
                      }`}
                    />
                    <div
                      className={`absolute -bottom-2.5 w-0 h-0 border-x-[9px] border-x-transparent border-t-[9px] border-t-slate-950 -z-10 ${
                        bubblePlacement.align === 'left'
                          ? 'left-[23px]'
                          : bubblePlacement.align === 'right'
                          ? 'right-[23px]'
                          : 'left-1/2 -translate-x-1/2'
                      }`}
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carried Forage Item Badge (Meat found off-screen) */}
        <AnimatePresence>
          {carriedItem === 'meat' && !isOffScreenHidden && (
            <motion.div
              initial={{ scale: 0, y: 6 }}
              animate={{ scale: 1, y: [0, -3, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ y: { repeat: Infinity, duration: 0.9 } }}
              className="absolute -top-5 -right-3 z-30 bg-indigo-950/90 border-2 border-amber-400 rounded-xl p-1 shadow-lg pointer-events-none"
            >
              <PixelMeatIcon className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Poop next to Digimon if present */}
        {pet.poopCount > 0 && !isOffScreenHidden && (
          <motion.div
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onCleanPoop();
            }}
            className="absolute -right-7 bottom-2 cursor-pointer filter drop-shadow-md z-30"
            title="Clean Poop!"
          >
            <PixelPoopIcon className="w-7 h-7" />
          </motion.div>
        )}

        {/* Digimon Sprite (with in-place evolution aura) */}
        <div className={`relative z-20 transition-all duration-300 ${isEvolvingFlash ? 'scale-125 brightness-150 drop-shadow-[0_0_16px_rgba(250,204,21,0.95)]' : ''}`}>
          <AnimatePresence>
            {isEvolvingFlash && (
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.6, 1.5, 1.9], opacity: [0.95, 0.75, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute -inset-6 rounded-full bg-radial from-amber-300/80 via-cyan-400/40 to-transparent pointer-events-none z-0"
              />
            )}
          </AnimatePresence>
          <DigimonSprite
            species={species}
            egg={pet.stage === 'egg' ? egg : undefined}
            action={currentAction}
            eatItem={activeEatItem}
            facing={facing}
            scale={0.8}
            onClick={handleSpriteClick}
          />
        </div>

        {/* Quick Interaction Radial / Drawer Menu on Tap */}
        <AnimatePresence>
          {isMenuOpen && !isOffScreenHidden && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute -bottom-16 bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 z-50 text-slate-100"
            >
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsChatInputOpen(true);
                  sound.playButton();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-transform active:scale-90"
                title="Talk with Digimon (AI)"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px] font-pixel mt-1">TALK</span>
              </button>

              <button
                onClick={handleFeedMeat}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-transform active:scale-90"
                title="Feed Big Meat"
              >
                <PixelMeatIcon className="w-5 h-5" />
                <span className="text-[9px] font-pixel mt-1">MEAT</span>
              </button>

              <button
                onClick={handleGiveVitamin}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-transform active:scale-90"
                title="Give Vitamin"
              >
                <PixelVitaminIcon className="w-5 h-5" />
                <span className="text-[9px] font-pixel mt-1">VIT</span>
              </button>

              <button
                onClick={handlePetDigimon}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-transform active:scale-90"
                title="Pet & Praise"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span className="text-[9px] font-pixel mt-1">PET</span>
              </button>

              {pet.poopCount > 0 && (
                <button
                  onClick={onCleanPoop}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-transform active:scale-90"
                  title="Flush Poop"
                >
                  <span className="text-base">🧹</span>
                  <span className="text-[9px] font-pixel mt-1">FLUSH</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenRoom();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-transform active:scale-90"
                title="My Room"
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] font-pixel mt-1">ROOM</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenColosseum();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-transform active:scale-90"
                title="Colosseum Battle"
              >
                <Gamepad2 className="w-4 h-4 text-blue-400" />
                <span className="text-[9px] font-pixel mt-1">ARENA</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Interactive AI Talk Popover */}
      <AnimatePresence>
        {isChatInputOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            className="fixed bottom-[max(calc(env(safe-area-inset-bottom,0px)+1rem),1rem)] left-1/2 -translate-x-1/2 w-[min(92vw,360px)] bg-slate-950/95 backdrop-blur-md border-2 border-cyan-500/60 rounded-2xl p-3 shadow-2xl z-50 text-slate-100 flex flex-col gap-2 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-chakra font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>TALK TO {species?.name?.toUpperCase() || 'DIGIMON'}</span>
              </div>
              <button
                onClick={() => setIsChatInputOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {chatHistory.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 bg-slate-900/70 border border-slate-800 rounded-xl p-2">
                {chatHistory.slice(-6).map((turn, idx) => (
                  <div
                    key={idx}
                    className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-2.5 py-1 text-[11px] leading-snug ${
                        turn.role === 'user'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-100 border border-slate-700'
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {['How are you feeling?', 'Tell me your attack!', 'Ready to battle?', 'Want some meat?'].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendUserChat(prompt)}
                  disabled={isAiThinking}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendUserChat(chatInputText);
              }}
              className="flex items-center gap-1.5 pt-0.5"
            >
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder={isAiThinking ? `${species?.name || 'Digimon'} is thinking...` : `Say something to ${species?.name || 'Digimon'}...`}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim() || isAiThinking}
                className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 rounded-xl cursor-pointer disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-cyan-500/20 flex items-center justify-center"
              >
                {isAiThinking ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
