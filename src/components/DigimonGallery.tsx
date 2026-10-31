import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DigimonSpecies, DigimonStage } from '../types/digimon';
import { DIGIMON_DATABASE } from '../data/digidex';
import { NEW_DIGIMON_SPRITES, SpriteFrame, DigimonSpriteConfig } from '../utils/newDigimonSprites';
import {
  getEffectiveSpriteConfig,
  saveCustomSpriteConfig,
  resetCustomSpriteConfig,
  isSpeciesCustomized,
  getMatchingSpritesheets,
  ALL_AVAILABLE_SPRITESHEETS,
  AvailableSpritesheet,
  getHideGalleryButtonPref,
  setHideGalleryButtonPref,
} from '../utils/customSpriteManager';
import { sound } from '../utils/audio';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Layers,
  Search,
  Compass,
  Crosshair,
  Grid,
  ChevronRight,
  CheckCircle2,
  Check,
  Sliders,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Copy,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Code,
  MousePointer,
  Hand,
  Target,
  Maximize2
} from 'lucide-react';
import { dissectSpritesheet, DissectedSprite } from '../utils/spriteDissector';


export type GalleryPose =
  | 'standing'
  | 'walking'
  | 'sitting'
  | 'training'
  | 'eating'
  | 'sleeping'
  | 'sick'
  | 'happy'
  | 'all';

interface DigimonGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  currentSpecies?: DigimonSpecies;
}

const POSE_INFO: Record<Exclude<GalleryPose, 'all'>, { label: string; icon: string; desc: string }> = {
  standing: { label: 'Idle / Standing', icon: '🧍', desc: 'Standard standing breathing loop' },
  walking: { label: 'Walking Cycle', icon: '🚶', desc: 'Forward step/hop stride sequence' },
  sitting: { label: 'Sitting / Rest', icon: '🪑', desc: 'Resting, perching, or relaxed pose' },
  training: { label: 'Training / Attack', icon: '🥊', desc: 'Dojo exercise, strike, or projectile pose' },
  eating: { label: 'Eating / Feast', icon: '🍖', desc: 'Munching Big Meat or vitamins' },
  sleeping: { label: 'Sleeping', icon: '💤', desc: 'Lying flat or curled up in bed' },
  sick: { label: 'Sick / Faint', icon: '☠️', desc: 'Hurt, exhausted, or illness pose' },
  happy: { label: 'Happy / Joy', icon: '❤️', desc: 'Cheering, praise, and victory reaction' },
};

const STAGE_ORDER: DigimonStage[] = ['fresh', 'in-training', 'rookie', 'champion', 'ultimate', 'mega'];

export const DigimonGallery: React.FC<DigimonGalleryProps> = ({
  isOpen,
  onClose,
  currentSpecies,
}) => {
  // Selected species state - defaults to currentSpecies or Agumon
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(() => {
    return currentSpecies?.id || 'agumon';
  });

  // Keep synced if currentSpecies changes and modal is re-opened
  useEffect(() => {
    if (isOpen && currentSpecies?.id) {
      setSelectedSpeciesId(currentSpecies.id);
    }
  }, [isOpen, currentSpecies?.id]);

  // Working copy of sprite configuration for editing
  const [workingConfig, setWorkingConfig] = useState<DigimonSpriteConfig | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Load config whenever selectedSpeciesId changes
  useEffect(() => {
    const config = getEffectiveSpriteConfig(selectedSpeciesId);
    if (config) {
      setWorkingConfig(JSON.parse(JSON.stringify(config)));
    } else {
      setWorkingConfig(null);
    }
    setHasUnsavedChanges(false);
  }, [selectedSpeciesId]);

  // Active pose selection
  const [activePose, setActivePose] = useState<GalleryPose>('standing');

  // Animation player state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [facing, setFacing] = useState<'right' | 'left'>('right');
  const [scale, setScale] = useState<number>(4); // Default large 4x
  const [showGroundLine, setShowGroundLine] = useState<boolean>(true);
  const [showCenterCrosshair, setShowCenterCrosshair] = useState<boolean>(false);
  const [showBoxGuides, setShowBoxGuides] = useState<boolean>(false);
  const [showFilmstrip, setShowFilmstrip] = useState<boolean>(false);
  const [backgroundTheme, setBackgroundTheme] = useState<'cyber' | 'checker' | 'lcd' | 'white'>('cyber');
  
  // View mode: 'dissected' (Pictures Gallery), 'animation' (Stage), 'picker' (Full Spritesheet), 'json'
  const [activeViewMode, setActiveViewMode] = useState<'dissected' | 'animation' | 'picker' | 'json'>('dissected');

  // Sheet Picker Zoom & Tool Mode
  const [sheetZoom, setSheetZoom] = useState<number>(1.5);
  const [sheetToolMode, setSheetToolMode] = useState<'pick' | 'pan'>('pick');
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const sheetImageRef = useRef<HTMLImageElement>(null);
  const sheetScrollContainerRef = useRef<HTMLDivElement>(null);

  // Pan dragging state
  const isPanningRef = useRef<boolean>(false);
  const startPanPos = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Compact D-Pad state
  const [dpadStep, setDpadStep] = useState<number>(1); // 1px, 5px, 10px
  const [isEditorDrawerOpen, setIsEditorDrawerOpen] = useState<boolean>(true); // Accessible in both views!

  // Preference for hiding the gallery button from header
  const [isGalleryHidden, setIsGalleryHidden] = useState<boolean>(() => getHideGalleryButtonPref());

  // Species search & stage filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [isSpeciesPickerOpen, setIsSpeciesPickerOpen] = useState<boolean>(false);

  // Retrieve active species info
  const activeSpecies: DigimonSpecies = useMemo(() => {
    return DIGIMON_DATABASE[selectedSpeciesId] || DIGIMON_DATABASE['agumon'];
  }, [selectedSpeciesId]);

  // Available frames for current active pose from workingConfig
  const framesForPose: SpriteFrame[] = useMemo(() => {
    if (!workingConfig) return [];
    if (activePose === 'all') return workingConfig.frames.standing || [];
    const frames = workingConfig.frames[activePose];
    return frames && frames.length > 0 ? frames : workingConfig.frames.standing || [];
  }, [workingConfig, activePose]);

  // Bound current frame index
  const safeFrameIndex = framesForPose.length > 0 ? Math.min(currentFrameIndex, framesForPose.length - 1) : 0;
  const currentFrame: SpriteFrame | undefined = framesForPose[safeFrameIndex];

  // Active Spritesheet Path & Dimensions
  const activeSheetPath = currentFrame?.sheetPath || workingConfig?.sheetPath || '';
  const activeSheetW = currentFrame?.sheetWidth || workingConfig?.sheetWidth || 512;
  const activeSheetH = currentFrame?.sheetHeight || workingConfig?.sheetHeight || 512;

  // Dissected Pictures Gallery State
  const [dissectedSprites, setDissectedSprites] = useState<DissectedSprite[]>([]);
  const [isDissecting, setIsDissecting] = useState<boolean>(false);
  const [dissectFilter, setDissectFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');

  // Automatically dissect spritesheet whenever activeSheetPath changes
  useEffect(() => {
    if (!activeSheetPath) return;
    let isCurrent = true;
    setIsDissecting(true);

    const allFrames: SpriteFrame[] = [];
    if (workingConfig) {
      Object.values(workingConfig.frames).forEach((fList) => {
        if (Array.isArray(fList)) allFrames.push(...fList);
      });
    }

    dissectSpritesheet(activeSheetPath, allFrames)
      .then((sprites) => {
        if (isCurrent) {
          setDissectedSprites(sprites);
          setIsDissecting(false);
        }
      })
      .catch((err) => {
        console.warn('Spritesheet dissection failed:', err);
        if (isCurrent) {
          setIsDissecting(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [activeSheetPath, workingConfig?.sheetPath]);

  // Filtered dissected sprites
  const filteredDissectedSprites = useMemo(() => {
    return dissectedSprites.filter((s) => {
      const maxDim = Math.max(s.w, s.h);
      if (dissectFilter === 'small') return maxDim < 36;
      if (dissectFilter === 'medium') return maxDim >= 36 && maxDim <= 52;
      if (dissectFilter === 'large') return maxDim > 52;
      return true;
    });
  }, [dissectedSprites, dissectFilter]);

  // Matching alternate spritesheets for current species
  const matchingSheets = useMemo(() => {
    return getMatchingSpritesheets(selectedSpeciesId);
  }, [selectedSpeciesId]);


  // Reset frame index on pose or species change
  useEffect(() => {
    setCurrentFrameIndex(0);
  }, [selectedSpeciesId, activePose]);

  // Animation interval timer
  useEffect(() => {
    if (!isPlaying || framesForPose.length <= 1) return;

    let baseInterval = 250;
    if (activePose === 'walking') baseInterval = 140;
    else if (activePose === 'eating') baseInterval = 180;
    else if (activePose === 'training') baseInterval = 150;
    else if (activePose === 'happy') baseInterval = 160;

    const intervalTime = Math.max(50, Math.round(baseInterval / playbackSpeed));

    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % framesForPose.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, framesForPose.length, activePose, playbackSpeed]);

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => {
      setSavedToast(null);
    }, 2800);
  };

  // Helper to update current frame property in workingConfig
  const updateCurrentFrame = useCallback((updater: (frame: SpriteFrame) => Partial<SpriteFrame>) => {
    if (!workingConfig || activePose === 'all') return;
    const poseKey = activePose as Exclude<GalleryPose, 'all'>;
    const frames = workingConfig.frames[poseKey] || [];
    if (frames.length === 0) return;

    const targetIdx = safeFrameIndex;
    const oldFrame = frames[targetIdx];
    const updates = updater(oldFrame);
    const newFrame = { ...oldFrame, ...updates };

    const newFrames = [...frames];
    newFrames[targetIdx] = newFrame;

    setWorkingConfig({
      ...workingConfig,
      frames: {
        ...workingConfig.frames,
        [poseKey]: newFrames,
      },
    });
    setHasUnsavedChanges(true);
  }, [workingConfig, activePose, safeFrameIndex]);

  // D-PAD NUDGE HANDLERS
  const nudgeX = (delta: number) => {
    sound.playButton();
    setIsPlaying(false);
    updateCurrentFrame((f) => ({ x: Math.max(0, f.x + delta) }));
  };

  const nudgeY = (delta: number) => {
    sound.playButton();
    setIsPlaying(false);
    updateCurrentFrame((f) => ({ y: Math.max(0, f.y + delta) }));
  };

  const adjustWidth = (delta: number) => {
    sound.playButton();
    setIsPlaying(false);
    updateCurrentFrame((f) => ({ w: Math.max(8, f.w + delta) }));
  };

  const adjustHeight = (delta: number) => {
    sound.playButton();
    setIsPlaying(false);
    updateCurrentFrame((f) => ({ h: Math.max(8, f.h + delta) }));
  };

  const rotateCw = () => {
    sound.playButton();
    setIsPlaying(false);
    updateCurrentFrame((f) => {
      const cur = f.rotate || 0;
      const next = (cur + 90) % 360;
      return { rotate: next };
    });
  };

  const setExactRotate = (deg: number) => {
    sound.playButton();
    setIsPlaying(false);
    updateCurrentFrame(() => ({ rotate: deg }));
  };

  // Adjust ground position for the current frame (+ lifts up, - lowers down)
  const adjustFrameGroundOffset = (delta: number) => {
    sound.playButton();
    setIsPlaying(false);
    updateCurrentFrame((f) => ({
      offsetY: (f.offsetY || 0) + delta,
    }));
    const newOff = (currentFrame?.offsetY || 0) + delta;
    showToast(`Frame #${safeFrameIndex + 1} Ground Offset: ${newOff > 0 ? '+' : ''}${newOff}px`);
  };

  // Adjust species-wide ground hover height
  const adjustSpeciesGroundOffset = (delta: number) => {
    if (!workingConfig) return;
    sound.playButton();
    setIsPlaying(false);
    const newOffset = (workingConfig.groundOffset || 0) + delta;
    setWorkingConfig({
      ...workingConfig,
      groundOffset: newOffset,
    });
    setHasUnsavedChanges(true);
    showToast(`${activeSpecies.name} Species Ground Hover: ${newOffset > 0 ? '+' : ''}${newOffset}px`);
  };

  const resetGroundOffsets = () => {
    sound.playButton();
    setIsPlaying(false);
    updateCurrentFrame(() => ({ offsetY: 0 }));
    if (workingConfig) {
      setWorkingConfig({
        ...workingConfig,
        groundOffset: 0,
      });
    }
    setHasUnsavedChanges(true);
    showToast('Reset ground alignment to factory baseline (0px)');
  };


  // Switch spritesheet for current frame or entire digimon
  const handleSelectSpritesheet = (sheet: AvailableSpritesheet, applyToAll: boolean = false) => {
    sound.playButton();
    const img = new Image();
    img.src = sheet.path;
    img.onload = () => {
      const sw = img.naturalWidth || 512;
      const sh = img.naturalHeight || 512;

      if (!workingConfig) return;

      if (applyToAll) {
        setWorkingConfig({
          ...workingConfig,
          sheetPath: sheet.path,
          sheetWidth: sw,
          sheetHeight: sh,
        });
      } else {
        updateCurrentFrame(() => ({
          sheetPath: sheet.path,
          sheetWidth: sw,
          sheetHeight: sh,
        }));
      }
      setHasUnsavedChanges(true);
      showToast(`Switched sheet to: ${sheet.displayName}`);
    };
  };

  // Select a dissected picture for current active frame
  const handleSelectDissectedSprite = (sprite: DissectedSprite, customRotate?: number) => {
    sound.playButton();
    setIsPlaying(false);
    updateCurrentFrame((cur) => ({
      x: sprite.x,
      y: sprite.y,
      w: sprite.w,
      h: sprite.h,
      sheetPath: sprite.sheetPath,
      sheetWidth: sprite.sheetWidth,
      sheetHeight: sprite.sheetHeight,
      rotate: customRotate !== undefined ? customRotate : (cur.rotate || 0),
    }));
    showToast(`Set Frame #${safeFrameIndex + 1} to Sprite #${sprite.id.replace('slice-', '')} (${sprite.w}×${sprite.h}px)`);
  };

  // Add dissected picture as a brand new frame in current sequence
  const handleAddDissectedAsNewFrame = (sprite: DissectedSprite, customRotate?: number) => {
    if (!workingConfig || activePose === 'all') return;
    sound.playButton();
    const poseKey = activePose as Exclude<GalleryPose, 'all'>;
    const frames = workingConfig.frames[poseKey] || [];
    const newFrame: SpriteFrame = {
      x: sprite.x,
      y: sprite.y,
      w: sprite.w,
      h: sprite.h,
      sheetPath: sprite.sheetPath,
      sheetWidth: sprite.sheetWidth,
      sheetHeight: sprite.sheetHeight,
      rotate: customRotate !== undefined ? customRotate : 0,
    };

    setWorkingConfig({
      ...workingConfig,
      frames: {
        ...workingConfig.frames,
        [poseKey]: [...frames, newFrame],
      },
    });
    setCurrentFrameIndex(frames.length);
    setIsPlaying(false);
    setHasUnsavedChanges(true);
    showToast(`Added Sprite #${sprite.id.replace('slice-', '')} as new Frame #${frames.length + 1}!`);
  };


  // Center scroll container on the active sprite frame
  const centerOnActiveFrame = useCallback(() => {
    if (!sheetScrollContainerRef.current || !currentFrame) return;
    const container = sheetScrollContainerRef.current;
    const targetX = (currentFrame.x + currentFrame.w / 2) * sheetZoom;
    const targetY = (currentFrame.y + currentFrame.h / 2) * sheetZoom;

    container.scrollTo({
      left: Math.max(0, targetX - container.clientWidth / 2),
      top: Math.max(0, targetY - container.clientHeight / 2),
      behavior: 'smooth',
    });
  }, [currentFrame, sheetZoom]);

  // STABLE POINTER & TOUCH PICKER HANDLER (Zero Random Scrolling!)
  const handlePointerDownOnSheet = (e: React.PointerEvent<HTMLDivElement>) => {
    if (sheetToolMode === 'pan') {
      // Pan Drag Mode
      if (!sheetScrollContainerRef.current) return;
      isPanningRef.current = true;
      startPanPos.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: sheetScrollContainerRef.current.scrollLeft,
        scrollTop: sheetScrollContainerRef.current.scrollTop,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Touch / Click Pick Mode: Prevent default scrolling and accurately calculate coordinates
    e.preventDefault();
    e.stopPropagation();

    if (!currentFrame || !sheetImageRef.current) return;
    const rect = sheetImageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const sheetW = currentFrame.sheetWidth || workingConfig?.sheetWidth || 512;
    const sheetH = currentFrame.sheetHeight || workingConfig?.sheetHeight || 512;

    const scaleFactor = rect.width / sheetW;
    const naturalX = Math.round(clickX / scaleFactor);
    const naturalY = Math.round(clickY / scaleFactor);

    // Center the current frame's crop box on the touch point
    const currentW = currentFrame.w;
    const currentH = currentFrame.h;

    const newX = Math.max(0, Math.min(sheetW - currentW, Math.round(naturalX - currentW / 2)));
    const newY = Math.max(0, Math.min(sheetH - currentH, Math.round(naturalY - currentH / 2)));

    sound.playButton();
    updateCurrentFrame(() => ({
      x: newX,
      y: newY,
    }));
    showToast(`Set Frame #${safeFrameIndex + 1} to (${newX}, ${newY})`);
  };

  const handlePointerMoveOnSheet = (e: React.PointerEvent<HTMLDivElement>) => {
    if (sheetToolMode === 'pan' && isPanningRef.current && sheetScrollContainerRef.current) {
      const dx = e.clientX - startPanPos.current.x;
      const dy = e.clientY - startPanPos.current.y;
      sheetScrollContainerRef.current.scrollLeft = startPanPos.current.scrollLeft - dx;
      sheetScrollContainerRef.current.scrollTop = startPanPos.current.scrollTop - dy;
      return;
    }

    if (!sheetImageRef.current || !currentFrame) return;
    const rect = sheetImageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const sheetW = currentFrame.sheetWidth || workingConfig?.sheetWidth || 512;
    const scaleFactor = rect.width / sheetW;
    const naturalX = Math.round(clickX / scaleFactor);
    const naturalY = Math.round(clickY / scaleFactor);
    setHoverCoord({ x: naturalX, y: naturalY });
  };

  const handlePointerUpOnSheet = (e: React.PointerEvent<HTMLDivElement>) => {
    if (sheetToolMode === 'pan' && isPanningRef.current) {
      isPanningRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Frame sequence manipulation: Add, Duplicate, Delete, Reorder
  const handleAddFrame = () => {
    if (!workingConfig || activePose === 'all') return;
    sound.playButton();
    const poseKey = activePose as Exclude<GalleryPose, 'all'>;
    const frames = workingConfig.frames[poseKey] || [];
    const template = currentFrame || { x: 0, y: 0, w: 48, h: 48, rotate: 0 };
    const newFrames = [...frames, { ...template }];

    setWorkingConfig({
      ...workingConfig,
      frames: {
        ...workingConfig.frames,
        [poseKey]: newFrames,
      },
    });
    setCurrentFrameIndex(newFrames.length - 1);
    setIsPlaying(false);
    setHasUnsavedChanges(true);
  };

  const handleDuplicateFrame = () => {
    if (!workingConfig || activePose === 'all' || !currentFrame) return;
    sound.playButton();
    const poseKey = activePose as Exclude<GalleryPose, 'all'>;
    const frames = workingConfig.frames[poseKey] || [];
    const newFrames = [...frames];
    newFrames.splice(safeFrameIndex + 1, 0, { ...currentFrame });

    setWorkingConfig({
      ...workingConfig,
      frames: {
        ...workingConfig.frames,
        [poseKey]: newFrames,
      },
    });
    setCurrentFrameIndex(safeFrameIndex + 1);
    setIsPlaying(false);
    setHasUnsavedChanges(true);
  };

  const handleDeleteFrame = () => {
    if (!workingConfig || activePose === 'all') return;
    const poseKey = activePose as Exclude<GalleryPose, 'all'>;
    const frames = workingConfig.frames[poseKey] || [];
    if (frames.length <= 1) {
      showToast('Animation requires at least 1 frame');
      return;
    }
    sound.playButton();
    const newFrames = frames.filter((_, idx) => idx !== safeFrameIndex);
    setWorkingConfig({
      ...workingConfig,
      frames: {
        ...workingConfig.frames,
        [poseKey]: newFrames,
      },
    });
    setCurrentFrameIndex(Math.max(0, safeFrameIndex - 1));
    setIsPlaying(false);
    setHasUnsavedChanges(true);
  };

  const handleMoveFrame = (direction: 'left' | 'right') => {
    if (!workingConfig || activePose === 'all') return;
    const poseKey = activePose as Exclude<GalleryPose, 'all'>;
    const frames = workingConfig.frames[poseKey] || [];
    const targetIdx = direction === 'left' ? safeFrameIndex - 1 : safeFrameIndex + 1;
    if (targetIdx < 0 || targetIdx >= frames.length) return;

    sound.playButton();
    const newFrames = [...frames];
    const temp = newFrames[safeFrameIndex];
    newFrames[safeFrameIndex] = newFrames[targetIdx];
    newFrames[targetIdx] = temp;

    setWorkingConfig({
      ...workingConfig,
      frames: {
        ...workingConfig.frames,
        [poseKey]: newFrames,
      },
    });
    setCurrentFrameIndex(targetIdx);
    setIsPlaying(false);
    setHasUnsavedChanges(true);
  };

  // Save changes permanently
  const handleSavePermanently = () => {
    if (!workingConfig) return;
    sound.playVictory();
    saveCustomSpriteConfig(selectedSpeciesId, workingConfig);
    setHasUnsavedChanges(false);
    showToast(`Saved ${activeSpecies.name} calibrated sprites permanently! Applied app-wide.`);
  };

  // Reset to default coordinates
  const handleResetToDefault = () => {
    sound.playAlert();
    resetCustomSpriteConfig(selectedSpeciesId);
    const defaults = NEW_DIGIMON_SPRITES[selectedSpeciesId];
    if (defaults) {
      setWorkingConfig(JSON.parse(JSON.stringify(defaults)));
    }
    setHasUnsavedChanges(false);
    showToast(`Reset ${activeSpecies.name} to default factory coordinates.`);
  };

  // Toggle Hide Gallery Button
  const handleToggleHideGallery = (hide: boolean) => {
    sound.playButton();
    setIsGalleryHidden(hide);
    setHideGalleryButtonPref(hide);
    if (hide) {
      showToast('Gallery button hidden from header! Reopen anytime with "G" key or footer link.');
    } else {
      showToast('Gallery button restored to main navigation header.');
    }
  };

  // Keyboard shortcut listener (arrow keys work everywhere in studio!)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        nudgeY(-dpadStep);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nudgeY(dpadStep);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nudgeX(-dpadStep);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nudgeX(dpadStep);
      } else if (e.key === 'r' || e.key === 'R') {
        rotateCw();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dpadStep, currentFrameIndex, workingConfig]);

  // Filtered species list
  const filteredSpecies = useMemo(() => {
    return Object.values(DIGIMON_DATABASE).filter((sp) => {
      const matchesSearch =
        sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = selectedStageFilter === 'all' || sp.stage === selectedStageFilter;
      return matchesSearch && matchesStage;
    });
  }, [searchQuery, selectedStageFilter]);

  if (!isOpen) return null;

  const isCustomized = isSpeciesCustomized(selectedSpeciesId);

  // =========================================================================
  // REUSABLE COMPACT D-PAD & FRAME EDITOR COMPONENT (Accessible in Both Views!)
  // =========================================================================
  const renderCompactEditor = (isInPickerView: boolean = false) => {
    if (!currentFrame || activePose === 'all') return null;

    return (
      <div className={`flex flex-col gap-2 p-2.5 bg-slate-950/95 border border-amber-500/40 rounded-2xl shadow-xl ${
        isInPickerView ? 'w-full md:w-64 lg:w-72 shrink-0' : 'w-full md:w-64 lg:w-72 shrink-0'
      }`}>
        {/* Editor Title & Close toggle */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-chakra font-bold text-amber-300">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>FRAME #{safeFrameIndex + 1} CONTROLLER</span>
          </div>
          <button
            onClick={() => setIsEditorDrawerOpen((p) => !p)}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
            title="Toggle editor visibility"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Mini Preview Box */}
        <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1.5 border border-slate-800">
          <div className="w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative">
            {(() => {
              const isRotated =
                currentFrame.rotate === 90 ||
                currentFrame.rotate === -90 ||
                currentFrame.rotate === 270;
              const dW = (isRotated ? currentFrame.h : currentFrame.w) * 1.5;
              const dH = (isRotated ? currentFrame.w : currentFrame.h) * 1.5;

              return (
                <div
                  className="relative overflow-hidden pixel-art"
                  style={{ width: `${dW}px`, height: `${dH}px` }}
                >
                  <div
                    style={{
                      width: `${currentFrame.w * 1.5}px`,
                      height: `${currentFrame.h * 1.5}px`,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) ${
                        currentFrame.rotate ? `rotate(${currentFrame.rotate}deg)` : ''
                      }`,
                      transformOrigin: 'center center',
                    }}
                  >
                    <img
                      src={currentFrame.sheetPath || workingConfig?.sheetPath || activeSheetPath}
                      alt=""
                      className="pixel-art absolute max-w-none"
                      style={{
                        width: `${(currentFrame.sheetWidth || workingConfig?.sheetWidth || activeSheetW) * 1.5}px`,
                        height: `${(currentFrame.sheetHeight || workingConfig?.sheetHeight || activeSheetH) * 1.5}px`,
                        left: `-${currentFrame.x * 1.5}px`,
                        top: `-${currentFrame.y * 1.5}px`,
                        imageRendering: 'pixelated',
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-between h-16 py-0.5">
            <div className="flex items-center justify-between">
              <span className="font-chakra font-bold text-xs text-white">
                {POSE_INFO[activePose as Exclude<GalleryPose, 'all'>].label.split(' ')[0]}
              </span>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              </button>
            </div>
            <div className="font-mono text-[10px] text-cyan-300 truncate">
              {currentFrame.w}×{currentFrame.h}px • ({currentFrame.x}, {currentFrame.y})
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={rotateCw}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-chakra text-amber-300 flex items-center gap-0.5 cursor-pointer"
                title="Rotate 90 degrees CW"
              >
                <RotateCw className="w-2.5 h-2.5" />
                <span>{currentFrame.rotate || 0}°</span>
              </button>
              {isInPickerView && (
                <button
                  onClick={centerOnActiveFrame}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-chakra text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                  title="Scroll sheet directly to this sprite"
                >
                  <Target className="w-2.5 h-2.5" />
                  <span>Center</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MICRO D-PAD CONTROLLER (COMPACT & ERGONOMIC) */}
        <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex flex-col items-center gap-1">
          <div className="w-full flex items-center justify-between">
            <span className="font-chakra font-bold text-[11px] text-slate-300 flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Micro D-Pad Nudge</span>
            </span>

            {/* Step buttons */}
            <div className="flex items-center gap-0.5 bg-slate-950 rounded p-0.5 border border-slate-800 text-[9px] font-pixel">
              {[1, 5, 10].map((step) => (
                <button
                  key={step}
                  onClick={() => {
                    sound.playButton();
                    setDpadStep(step);
                  }}
                  className={`px-1 py-0.2 rounded transition-colors cursor-pointer ${
                    dpadStep === step
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {step}px
                </button>
              ))}
            </div>
          </div>

          {/* Compact Mini D-Pad Cross */}
          <div className="relative w-24 h-24 flex items-center justify-center select-none my-0.5">
            <div className="absolute w-20 h-20 rounded-full bg-slate-950 border border-slate-800" />

            {/* UP */}
            <button
              onClick={() => nudgeY(-dpadStep)}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-7 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 border border-slate-700 active:border-cyan-400 rounded-t-lg flex items-center justify-center text-slate-200 active:text-slate-950 cursor-pointer shadow active:scale-95 transition-all"
              title={`Nudge Up (-${dpadStep}px)`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* DOWN */}
            <button
              onClick={() => nudgeY(dpadStep)}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-7 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 border border-slate-700 active:border-cyan-400 rounded-b-lg flex items-center justify-center text-slate-200 active:text-slate-950 cursor-pointer shadow active:scale-95 transition-all"
              title={`Nudge Down (+${dpadStep}px)`}
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* LEFT */}
            <button
              onClick={() => nudgeX(-dpadStep)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 border border-slate-700 active:border-cyan-400 rounded-l-lg flex items-center justify-center text-slate-200 active:text-slate-950 cursor-pointer shadow active:scale-95 transition-all"
              title={`Nudge Left (-${dpadStep}px)`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {/* RIGHT */}
            <button
              onClick={() => nudgeX(dpadStep)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 border border-slate-700 active:border-cyan-400 rounded-r-lg flex items-center justify-center text-slate-200 active:text-slate-950 cursor-pointer shadow active:scale-95 transition-all"
              title={`Nudge Right (+${dpadStep}px)`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Center Pivot */}
            <div className="absolute w-6 h-6 bg-slate-850 rounded border border-slate-700 pointer-events-none flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
          </div>

          <div className="text-[8px] text-slate-400 font-pixel">
            Arrow keys on keyboard also nudge!
          </div>
        </div>

        {/* DIMENSIONS FINE-TUNE */}
        <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex flex-col gap-1 text-xs">
          <span className="font-chakra font-bold text-[11px] text-slate-300">
            Box Dimensions
          </span>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[11px]">W: {currentFrame.w}px</span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => adjustWidth(-5)}
                className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[8px] font-pixel text-slate-300 cursor-pointer"
              >
                -5
              </button>
              <button
                onClick={() => adjustWidth(-1)}
                className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[8px] font-pixel text-slate-300 cursor-pointer"
              >
                -1
              </button>
              <button
                onClick={() => adjustWidth(1)}
                className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[8px] font-pixel text-slate-300 cursor-pointer"
              >
                +1
              </button>
              <button
                onClick={() => adjustWidth(5)}
                className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[8px] font-pixel text-slate-300 cursor-pointer"
              >
                +5
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[11px]">H: {currentFrame.h}px</span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => adjustHeight(-5)}
                className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[8px] font-pixel text-slate-300 cursor-pointer"
              >
                -5
              </button>
              <button
                onClick={() => adjustHeight(-1)}
                className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[8px] font-pixel text-slate-300 cursor-pointer"
              >
                -1
              </button>
              <button
                onClick={() => adjustHeight(1)}
                className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[8px] font-pixel text-slate-300 cursor-pointer"
              >
                +1
              </button>
              <button
                onClick={() => adjustHeight(5)}
                className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[8px] font-pixel text-slate-300 cursor-pointer"
              >
                +5
              </button>
            </div>
          </div>
        </div>

        {/* GROUND POSITIONING & FEET ALIGNMENT */}
        <div className="bg-slate-900 rounded-xl p-2 border border-emerald-500/40 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-chakra font-bold text-[11px] text-emerald-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Feet Ground Level</span>
            </span>
            <button
              onClick={resetGroundOffsets}
              className="text-[8px] font-pixel text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
              title="Reset ground offset to 0px"
            >
              RESET
            </button>
          </div>

          {/* Current Frame Ground Offset (Lift / Lower Feet) */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-slate-300 font-mono text-[11px]">
                Frame Offset: <strong className="text-emerald-300 font-bold">{currentFrame.offsetY || 0}px</strong>
              </span>
              <span className="text-[8px] text-slate-500 font-pixel">
                {((currentFrame.offsetY || 0) > 0) ? 'Lifted up' : ((currentFrame.offsetY || 0) < 0) ? 'Lowered down' : 'On baseline'}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => adjustFrameGroundOffset(5)}
                className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-[9px] font-chakra font-bold text-emerald-300 cursor-pointer shadow-sm active:scale-95"
                title="Lift feet +5px above ground"
              >
                ▲ +5
              </button>
              <button
                onClick={() => adjustFrameGroundOffset(1)}
                className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-[9px] font-chakra font-bold text-emerald-300 cursor-pointer shadow-sm active:scale-95"
                title="Lift feet +1px above ground"
              >
                ▲ +1
              </button>
              <button
                onClick={() => adjustFrameGroundOffset(-1)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-chakra font-bold text-slate-300 cursor-pointer shadow-sm active:scale-95"
                title="Lower feet -1px toward ground"
              >
                ▼ -1
              </button>
              <button
                onClick={() => adjustFrameGroundOffset(-5)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-chakra font-bold text-slate-300 cursor-pointer shadow-sm active:scale-95"
                title="Lower feet -5px toward ground"
              >
                ▼ -5
              </button>
            </div>
          </div>

          {/* Species Global Hover Height (Useful for Flying/Floating Digimon like Birdramon, Phoenixmon, Patamon) */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 font-mono text-[10px]">
              Species Hover: <strong className="text-cyan-300">{workingConfig?.groundOffset || 0}px</strong>
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => adjustSpeciesGroundOffset(5)}
                className="px-1.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-[8px] font-pixel text-cyan-300 cursor-pointer shadow-sm active:scale-95"
                title="Lift all frames by +5px (great for flying/hovering species)"
              >
                ▲ +5
              </button>
              <button
                onClick={() => adjustSpeciesGroundOffset(-5)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[8px] font-pixel text-slate-300 cursor-pointer shadow-sm active:scale-95"
                title="Lower all frames by -5px"
              >
                ▼ -5
              </button>
            </div>
          </div>
        </div>

        {/* ROTATION CHIPS */}
        <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex flex-col gap-1 text-xs">

          <span className="font-chakra font-bold text-[11px] text-slate-300">
            Rotate Frame
          </span>
          <div className="grid grid-cols-4 gap-1">
            {[0, 90, 180, 270].map((deg) => (
              <button
                key={deg}
                onClick={() => setExactRotate(deg)}
                className={`py-0.5 rounded font-chakra font-bold text-[10px] transition-colors cursor-pointer border ${
                  (currentFrame.rotate || 0) === deg
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>

        {/* NUMERIC COORDINATE INPUTS */}
        <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex flex-col gap-1 text-[10px] font-mono">
          <span className="font-chakra font-bold text-[11px] text-slate-300">
            Exact Cut Coordinates
          </span>
          <div className="grid grid-cols-4 gap-1">
            <div>
              <span className="text-[8px] text-slate-500 block">X</span>
              <input
                type="number"
                value={currentFrame.x}
                onChange={(e) =>
                  updateCurrentFrame(() => ({ x: Math.max(0, parseInt(e.target.value) || 0) }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-cyan-300"
              />
            </div>
            <div>
              <span className="text-[8px] text-slate-500 block">Y</span>
              <input
                type="number"
                value={currentFrame.y}
                onChange={(e) =>
                  updateCurrentFrame(() => ({ y: Math.max(0, parseInt(e.target.value) || 0) }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-cyan-300"
              />
            </div>
            <div>
              <span className="text-[8px] text-slate-500 block">W</span>
              <input
                type="number"
                value={currentFrame.w}
                onChange={(e) =>
                  updateCurrentFrame(() => ({ w: Math.max(8, parseInt(e.target.value) || 8) }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-cyan-300"
              />
            </div>
            <div>
              <span className="text-[8px] text-slate-500 block">H</span>
              <input
                type="number"
                value={currentFrame.h}
                onChange={(e) =>
                  updateCurrentFrame(() => ({ h: Math.max(8, parseInt(e.target.value) || 8) }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-cyan-300"
              />
            </div>
          </div>
        </div>

        {/* SAVE FIXES BUTTON */}
        <button
          onClick={handleSavePermanently}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold font-chakra text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 transition-all mt-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>SAVE FIXES</span>
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 bg-slate-950/95 backdrop-blur-md font-sans">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative w-full max-w-6xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col h-[95vh] max-h-[95vh] overflow-hidden text-slate-100"
      >
        {/* ================================================================= */}
        {/* TOP MODAL HEADER */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0 gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            {/* Species Dropdown Trigger */}
            <button
              onClick={() => {
                sound.playButton();
                setIsSpeciesPickerOpen((prev) => !prev);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-left cursor-pointer transition-all hover:border-cyan-400 shadow-sm group shrink-0"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: activeSpecies.colorTheme || '#06b6d4' }}
              />
              <span className="font-chakra font-bold text-xs sm:text-sm text-cyan-300 group-hover:text-cyan-200">
                {activeSpecies.name}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">({activeSpecies.stage})</span>
              <span className="text-[9px] text-slate-500 font-pixel">▼</span>
            </button>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => {
                  sound.playButton();
                  setActiveViewMode('dissected');
                }}
                className={`px-2.5 py-1 rounded-lg font-chakra font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewMode === 'dissected'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md font-black'
                    : 'text-emerald-300/90 hover:text-white'
                }`}
                title="View dissected individual pictures from the spritesheet"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Pictures (Dissected)</span>
              </button>

              <button
                onClick={() => {
                  sound.playButton();
                  setActiveViewMode('animation');
                }}
                className={`px-2.5 py-1 rounded-lg font-chakra font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewMode === 'animation'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🎬</span>
                <span>Stage</span>
              </button>

              <button
                onClick={() => {
                  sound.playButton();
                  setActiveViewMode('picker');
                }}
                className={`px-2.5 py-1 rounded-lg font-chakra font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewMode === 'picker'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-amber-300/80 hover:text-amber-200'
                }`}
                title="View full spritesheet and click any sprite to select for this frame"
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>Full Sheet</span>
              </button>

              <button
                onClick={() => {
                  sound.playButton();
                  setActiveViewMode('json');
                }}
                className={`px-2 py-1 rounded-lg font-chakra font-medium text-xs transition-all cursor-pointer ${
                  activeViewMode === 'json'
                    ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View JSON coordinates"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle D-Pad / Frame Controls Drawer */}
            <button
              onClick={() => {
                sound.playButton();
                setIsEditorDrawerOpen((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-chakra font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95 border ${
                isEditorDrawerOpen
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
              }`}
              title={isEditorDrawerOpen ? 'Hide Frame Controls' : 'Show Frame Controls & Micro D-Pad'}
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">{isEditorDrawerOpen ? 'HIDE CONTROLS' : 'MICRO D-PAD'}</span>
              <span className="sm:hidden">{isEditorDrawerOpen ? 'HIDE' : 'D-PAD'}</span>
            </button>

            {/* Save Permanently Button */}
            <button
              onClick={handleSavePermanently}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-chakra font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95 ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/30 animate-pulse'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300'
              }`}
              title="Save all changes permanently to app storage"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">SAVE FIXES</span>
            </button>

            <button
              onClick={() => {
                sound.playButton();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Studio (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* FLOATING CONFIRMATION TOAST */}
        {/* ================================================================= */}
        <AnimatePresence>
          {savedToast && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 border-2 border-emerald-400 text-emerald-200 font-pixel text-xs px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 pointer-events-none"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>{savedToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* DROPDOWN SPECIES PICKER OVERLAY */}
        {/* ================================================================= */}
        <AnimatePresence>
          {isSpeciesPickerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-3 my-1.5 shrink-0 overflow-hidden shadow-2xl z-30"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Digimon name..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedStageFilter('all')}
                    className={`px-2 py-0.5 rounded text-[9px] font-pixel transition-colors ${
                      selectedStageFilter === 'all'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    ALL
                  </button>
                  {STAGE_ORDER.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setSelectedStageFilter(stage)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-pixel capitalize transition-colors ${
                        selectedStageFilter === stage
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1 max-h-36 overflow-y-auto pr-1">
                {filteredSpecies.map((sp) => {
                  const isSelected = sp.id === selectedSpeciesId;
                  const isUserPet = sp.id === currentSpecies?.id;
                  const custom = isSpeciesCustomized(sp.id);
                  return (
                    <button
                      key={sp.id}
                      onClick={() => {
                        sound.playButton();
                        setSelectedSpeciesId(sp.id);
                        setIsSpeciesPickerOpen(false);
                      }}
                      className={`px-2 py-1 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-chakra font-medium text-xs truncate flex items-center gap-1">
                          <span>{sp.name}</span>
                          {custom && <span className="text-[7px] text-emerald-400 font-pixel">★</span>}
                        </div>
                        <div className="text-[8px] text-slate-500 capitalize">{sp.stage}</div>
                      </div>
                      {isUserPet && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* ANIMATION POSES NAVIGATION TABS */}
        {/* ================================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 shrink-0 no-scrollbar">
          {(Object.keys(POSE_INFO) as Array<Exclude<GalleryPose, 'all'>>).map((poseKey) => {
            const count = workingConfig?.frames[poseKey]?.length || 0;
            const isCurrent = activePose === poseKey;
            const info = POSE_INFO[poseKey];

            return (
              <button
                key={poseKey}
                onClick={() => {
                  sound.playButton();
                  setActivePose(poseKey);
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-xl font-chakra text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-950 to-slate-900 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={info.desc}
              >
                <span>{info.icon}</span>
                <span className="font-medium text-xs">{info.label.split(' ')[0]}</span>
                <span
                  className={`text-[8px] sm:text-[9px] font-pixel px-1.5 py-0.2 rounded-full ${
                    isCurrent ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}f
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              sound.playButton();
              setActivePose('all');
              setActiveViewMode('animation');
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-xl font-chakra text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
              activePose === 'all'
                ? 'bg-gradient-to-r from-purple-950 to-slate-900 border-purple-400 text-purple-300 shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>✨</span>
            <span className="font-medium">All Poses</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* VIEW MODE 0: DISSECTED SPRITE PICTURES GRID */}
        {/* ================================================================= */}
        {activeViewMode === 'dissected' && currentFrame && (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 overflow-hidden">
            
            {/* LEFT / CENTER: DISSECTED PICTURES CATALOG */}
            <div className="flex-1 min-h-0 flex flex-col bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-2.5 overflow-hidden">
              
              {/* Top Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-800 shrink-0 text-xs">
                
                {/* Spritesheet Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-chakra font-bold text-emerald-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sheet Source:</span>
                  </span>
                  
                  <select
                    value={activeSheetPath}
                    onChange={(e) => {
                      const found = ALL_AVAILABLE_SPRITESHEETS.find((s) => s.path === e.target.value);
                      if (found) handleSelectSpritesheet(found, true);
                    }}
                    className="bg-slate-900 border border-emerald-500/50 rounded-lg px-2 py-1 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer font-mono max-w-[210px] truncate"
                  >
                    <optgroup label="Sheets for this Digimon">
                      {matchingSheets.map((s) => (
                        <option key={s.path} value={s.path}>
                          {s.displayName}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="All Spritesheets in Library">
                      {ALL_AVAILABLE_SPRITESHEETS.map((s) => (
                        <option key={s.path} value={s.path}>
                          {s.displayName}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Size Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
                  {(['all', 'small', 'medium', 'large'] as const).map((filter) => {
                    const count = filter === 'all'
                      ? dissectedSprites.length
                      : dissectedSprites.filter((s) => {
                          const m = Math.max(s.w, s.h);
                          if (filter === 'small') return m < 36;
                          if (filter === 'medium') return m >= 36 && m <= 52;
                          return m > 52;
                        }).length;

                    return (
                      <button
                        key={filter}
                        onClick={() => setDissectFilter(filter)}
                        className={`px-2 py-0.5 rounded font-chakra font-medium text-[10px] capitalize transition-colors cursor-pointer ${
                          dissectFilter === filter
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Background theme toggle & Status */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                    {(['cyber', 'checker', 'lcd', 'white'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setBackgroundTheme(theme)}
                        className={`px-1.5 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                          backgroundTheme === theme ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-pixel">
                    {isDissecting ? (
                      <span className="flex items-center gap-1 text-amber-300 animate-pulse">
                        <Sparkles className="w-3 h-3 animate-spin" /> Slicing...
                      </span>
                    ) : (
                      <span>{filteredDissectedSprites.length} Pictures</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Frame Selection Bar */}
              <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-800/80 shrink-0 text-xs overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5">
                  <span className="font-chakra font-bold text-amber-300 text-xs flex items-center gap-1">
                    <span>Target Frame:</span>
                  </span>

                  {framesForPose.map((frame, idx) => {
                    const isSelected = idx === safeFrameIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          sound.playButton();
                          setCurrentFrameIndex(idx);
                          setIsPlaying(false);
                        }}
                        className={`px-2.5 py-1 rounded-xl font-chakra font-bold text-xs flex items-center gap-1 cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                        }`}
                      >
                        <span>Frame #{idx + 1}</span>
                        <span className="text-[9px] font-mono opacity-80">
                          ({frame.w}×{frame.h})
                        </span>
                        {frame.rotate ? (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-amber-900/90 text-amber-200">
                            {frame.rotate}°
                          </span>
                        ) : null}
                      </button>
                    );
                  })}

                  <button
                    onClick={handleAddFrame}
                    className="px-2 py-1 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-chakra font-bold text-xs flex items-center gap-1 cursor-pointer ml-1"
                    title="Add a new blank frame to assign"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Frame</span>
                  </button>

                  <button
                    onClick={handleDeleteFrame}
                    disabled={framesForPose.length <= 1}
                    className="px-1.5 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-chakra text-xs flex items-center gap-0.5 disabled:opacity-30 cursor-pointer"
                    title="Delete current frame"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-[10px] text-emerald-300/80 font-pixel hidden lg:inline">
                  Click any picture to assign to Frame #{safeFrameIndex + 1}
                </div>
              </div>

              {/* PICTURES GRID VIEWPORT */}
              <div className="flex-1 overflow-y-auto p-2 my-1 rounded-xl bg-slate-950 border border-slate-800">
                {isDissecting ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
                    <div className="font-chakra font-bold text-sm text-emerald-300">
                      Dissecting Spritesheet into Individual Pictures...
                    </div>
                    <div className="text-xs text-slate-500">
                      Isolating sprite components, contours, and bounds
                    </div>
                  </div>
                ) : filteredDissectedSprites.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <div className="text-3xl">🔍</div>
                    <div className="font-chakra font-bold text-slate-300">No sprite pictures match this filter</div>
                    <button
                      onClick={() => setDissectFilter('all')}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-chakra cursor-pointer"
                    >
                      Show All Pictures
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                    {filteredDissectedSprites.map((sprite, idx) => {
                      const isCurrent =
                        currentFrame.x === sprite.x &&
                        currentFrame.y === sprite.y &&
                        currentFrame.w === sprite.w &&
                        currentFrame.h === sprite.h;

                      const usedFrameIdx = framesForPose.findIndex(
                        (f) => f.x === sprite.x && f.y === sprite.y && f.w === sprite.w && f.h === sprite.h
                      );

                      return (
                        <div
                          key={sprite.id}
                          onClick={() => handleSelectDissectedSprite(sprite)}
                          className={`group relative rounded-2xl p-2 flex flex-col items-center justify-between gap-1.5 border transition-all cursor-pointer select-none ${
                            isCurrent
                              ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02] ring-2 ring-emerald-400/40'
                              : usedFrameIdx !== -1
                              ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 text-slate-200'
                              : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-emerald-500/50 text-slate-300'
                          }`}
                        >
                          {/* Top Bar with Number & Badges */}
                          <div className="flex items-center justify-between w-full text-[9px] font-mono">
                            <span className="text-slate-400 font-bold">#{idx + 1}</span>
                            <span className="px-1 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                              {sprite.w}×{sprite.h}
                            </span>
                          </div>

                          {/* Picture Preview Frame */}
                          <div
                            className={`w-full h-24 rounded-xl flex items-center justify-center p-1 relative overflow-hidden transition-all ${
                              backgroundTheme === 'lcd'
                                ? 'bg-[#8ca281]'
                                : backgroundTheme === 'checker'
                                ? 'bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:12px_12px] bg-slate-900'
                                : backgroundTheme === 'white'
                                ? 'bg-white'
                                : 'bg-slate-950 border border-slate-800/80'
                            }`}
                          >
                            {sprite.dataUrl ? (
                              <img
                                src={sprite.dataUrl}
                                alt={`Sprite ${idx + 1}`}
                                className="max-h-20 max-w-full object-contain pixel-art drop-shadow-md group-hover:scale-110 transition-transform"
                                style={{
                                  imageRendering: 'pixelated',
                                  transform: isCurrent && currentFrame.rotate ? `rotate(${currentFrame.rotate}deg)` : undefined,
                                }}
                              />
                            ) : (
                              <div className="text-xs text-slate-500 font-pixel">Loading...</div>
                            )}

                            {/* Status Badges Overlay */}
                            {isCurrent && (
                              <div className="absolute top-1 left-1 bg-emerald-500 text-slate-950 font-chakra font-black text-[8px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" />
                                <span>ACTIVE</span>
                              </div>
                            )}

                            {usedFrameIdx !== -1 && !isCurrent && (
                              <div className="absolute top-1 left-1 bg-cyan-600 text-white font-chakra font-bold text-[8px] px-1.5 py-0.5 rounded shadow">
                                Frame #{usedFrameIdx + 1}
                              </div>
                            )}
                          </div>

                          {/* Card Controls */}
                          <div className="w-full flex items-center gap-1 mt-0.5">
                            {/* Primary Button: Use for Current Frame */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDissectedSprite(sprite);
                              }}
                              className={`flex-1 py-1 px-1.5 rounded-lg font-chakra font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                                isCurrent
                                  ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                                  : 'bg-emerald-950/80 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/50'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>Use #{safeFrameIndex + 1}</span>
                            </button>

                            {/* Quick Rotate Button: 0° -> 90° -> 180° -> 270° */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentRot = isCurrent ? (currentFrame.rotate || 0) : 0;
                                const nextRot = (currentRot + 90) % 360;
                                handleSelectDissectedSprite(sprite, nextRot);
                              }}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 text-[10px] flex items-center justify-center cursor-pointer transition-colors"
                              title="Rotate 90° clockwise and apply to active frame"
                            >
                              <RotateCw className="w-3 h-3" />
                            </button>

                            {/* Add as New Frame Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddDissectedAsNewFrame(sprite);
                              }}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-slate-700 text-[10px] flex items-center justify-center cursor-pointer transition-colors"
                              title="Add as a new frame in sequence"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dissected Bottom Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span>Active Frame #{safeFrameIndex + 1}: <strong className="text-emerald-300 font-bold">X: {currentFrame.x}, Y: {currentFrame.y}</strong> ({currentFrame.w}×{currentFrame.h}px)</span>
                  {currentFrame.rotate ? (
                    <span className="text-amber-300 font-bold">Rotate: {currentFrame.rotate}°</span>
                  ) : null}
                </div>
                <div className="text-[10px] font-pixel text-slate-500 hidden sm:inline">
                  Tip: Tap any picture to apply directly, or click ↻ to rotate sideways sprites!
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: LIVE ANIMATION PREVIEW & MINI STAGE + CONTROLS */}
            <div className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col gap-2 overflow-y-auto">
              
              {/* Live Animated Preview Card */}
              <div className="p-2.5 bg-slate-950/90 border border-cyan-500/40 rounded-2xl shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 font-chakra font-bold text-cyan-300">
                    <span>🎬</span>
                    <span>LIVE ANIMATION</span>
                  </div>
                  <span className="font-pixel text-[9px] text-cyan-400">
                    {activePose !== 'all' && POSE_INFO[activePose] ? POSE_INFO[activePose].label.split(' ')[0] : 'All Poses'} ({framesForPose.length}f)
                  </span>
                </div>

                {/* Live Stage Display */}
                <div
                  className={`h-40 rounded-xl relative flex items-center justify-center overflow-hidden border ${
                    backgroundTheme === 'lcd'
                      ? 'bg-[#8ca281] border-[#5e7255]'
                      : backgroundTheme === 'checker'
                      ? 'bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:12px_12px] bg-slate-900 border-slate-700'
                      : backgroundTheme === 'white'
                      ? 'bg-white border-slate-300'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  {/* Ground Line */}
                  {showGroundLine && (
                    <div
                      className="absolute left-0 right-0 border-b-2 border-dashed border-emerald-400/50 pointer-events-none z-10"
                      style={{ bottom: '20%' }}
                    />
                  )}

                  {/* Animated Sprite - Grounded Baseline Anchor */}
                  {currentFrame && workingConfig && (
                    <div
                      className="absolute left-1/2 transition-all flex flex-col items-center"
                      style={{
                        bottom: '20%',
                        transform: `translateX(-50%) translateY(${-( (currentFrame.offsetY || 0) + (workingConfig.groundOffset || 0) ) * 2.4}px) scaleX(${facing === 'left' ? -1 : 1})`,
                        transformOrigin: 'bottom center',
                      }}
                    >
                      <div
                        className="relative overflow-hidden pixel-art"
                        style={{
                          width: `${currentFrame.w * 2.4}px`,
                          height: `${currentFrame.h * 2.4}px`,
                        }}
                      >

                      <div
                        style={{
                          width: `${currentFrame.w * 2.4}px`,
                          height: `${currentFrame.h * 2.4}px`,
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) ${
                            currentFrame.rotate ? `rotate(${currentFrame.rotate}deg)` : ''
                          }`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <img
                          src={currentFrame.sheetPath || workingConfig.sheetPath}
                          alt={activeSpecies.name}
                          className="pixel-art absolute max-w-none"
                          style={{
                            width: `${(currentFrame.sheetWidth || workingConfig.sheetWidth) * 2.4}px`,
                            height: `${(currentFrame.sheetHeight || workingConfig.sheetHeight) * 2.4}px`,
                            left: `-${currentFrame.x * 2.4}px`,
                            top: `-${currentFrame.y * 2.4}px`,
                            imageRendering: 'pixelated',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Frame Counter Tag */}
                  <div className="absolute bottom-1 right-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-pixel text-slate-300 border border-slate-800">
                    F#{safeFrameIndex + 1}
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        sound.playButton();
                        setIsPlaying((p) => !p);
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => {
                        sound.playButton();
                        setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : framesForPose.length - 1));
                        setIsPlaying(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Previous Frame"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        sound.playButton();
                        setCurrentFrameIndex((prev) => (prev + 1) % framesForPose.length);
                        setIsPlaying(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Next Frame"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setFacing((p) => (p === 'right' ? 'left' : 'right'))}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[9px] font-pixel cursor-pointer"
                    >
                      {facing === 'right' ? 'R →' : '← L'}
                    </button>

                    <button
                      onClick={() => setShowGroundLine((p) => !p)}
                      className={`px-1.5 py-1 rounded-lg text-[9px] font-pixel cursor-pointer ${
                        showGroundLine ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      GND
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Drawer / Micro D-Pad if open */}
              {isEditorDrawerOpen && renderCompactEditor(true)}

            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW MODE 1: INTERACTIVE FULL SPRITESHEET PICKER */}
        {/* ================================================================= */}
        {activeViewMode === 'picker' && currentFrame && (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 overflow-hidden">

            
            {/* LEFT / CENTER: FULL SPRITESHEET CANVAS */}
            <div className="flex-1 min-h-0 flex flex-col bg-slate-950/90 border border-amber-500/40 rounded-2xl p-2.5 overflow-hidden">
              
              {/* Top Toolbar: Spritesheet Source, Zoom, and Pan / Pick Mode */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-800 shrink-0 text-xs">
                
                {/* Spritesheet Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-chakra font-bold text-amber-300 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sheet:</span>
                  </span>
                  
                  <select
                    value={activeSheetPath}
                    onChange={(e) => {
                      const found = ALL_AVAILABLE_SPRITESHEETS.find((s) => s.path === e.target.value);
                      if (found) handleSelectSpritesheet(found, false);
                    }}
                    className="bg-slate-900 border border-amber-500/50 rounded-lg px-2 py-1 text-xs text-amber-200 focus:outline-none focus:border-amber-400 cursor-pointer font-mono max-w-[200px] truncate"
                  >
                    <optgroup label="Sheets for this Digimon">
                      {matchingSheets.map((s) => (
                        <option key={s.path} value={s.path}>
                          {s.displayName}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="All Spritesheets in Library">
                      {ALL_AVAILABLE_SPRITESHEETS.map((s) => (
                        <option key={s.path} value={s.path}>
                          {s.displayName}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Tool Mode: Pick vs Pan */}
                <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
                  <button
                    onClick={() => setSheetToolMode('pick')}
                    className={`px-2 py-0.5 rounded font-chakra font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                      sheetToolMode === 'pick'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tap / Click directly on any sprite to position the crop box"
                  >
                    <MousePointer className="w-3 h-3" />
                    <span>Tap to Pick</span>
                  </button>

                  <button
                    onClick={() => setSheetToolMode('pan')}
                    className={`px-2 py-0.5 rounded font-chakra font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                      sheetToolMode === 'pan'
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Drag / Pan across the spritesheet without moving the box"
                  >
                    <Hand className="w-3 h-3" />
                    <span>Pan Sheet</span>
                  </button>
                </div>

                {/* Zoom & Center Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      sound.playButton();
                      setActiveViewMode('dissected');
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 text-[10px] font-pixel flex items-center gap-1 cursor-pointer"
                    title="Switch to Dissected Pictures Gallery"
                  >
                    <Grid className="w-3 h-3 text-emerald-400" />
                    <span className="hidden sm:inline">PICTURES</span>
                  </button>

                  <button
                    onClick={centerOnActiveFrame}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-[10px] font-pixel flex items-center gap-1 cursor-pointer"
                    title="Scroll to center active sprite"
                  >
                    <Target className="w-3 h-3 text-cyan-400" />
                    <span className="hidden sm:inline">CENTER SPRITE</span>
                  </button>

                  <div className="flex items-center gap-0.5 bg-slate-900 rounded-lg px-1.5 py-0.5 border border-slate-800 text-[10px]">
                    <span className="text-slate-500 font-pixel mr-0.5">ZOOM:</span>
                    {[1, 1.5, 2, 3].map((z) => (
                      <button
                        key={z}
                        onClick={() => setSheetZoom(z)}
                        className={`px-1 py-0.5 rounded cursor-pointer transition-colors ${
                          sheetZoom === z ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {z}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sub-bar: Frame Sequence Selector Bar */}
              <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-800/80 shrink-0 text-xs overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1">
                  <span className="font-chakra font-bold text-slate-400 text-[11px] mr-1">
                    Frame:
                  </span>
                  
                  {framesForPose.map((frame, idx) => {
                    const isSelected = idx === safeFrameIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          sound.playButton();
                          setCurrentFrameIndex(idx);
                          setIsPlaying(false);
                        }}
                        className={`px-2 py-0.5 rounded-lg font-chakra font-bold text-xs flex items-center gap-1 cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                        }`}
                      >
                        <span>#{idx + 1}</span>
                        <span className="text-[9px] font-mono opacity-80">
                          ({frame.w}×{frame.h})
                        </span>
                      </button>
                    );
                  })}

                  <button
                    onClick={handleAddFrame}
                    className="px-1.5 py-0.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-chakra text-xs flex items-center gap-0.5 cursor-pointer ml-1"
                    title="Add new frame"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>

                  <button
                    onClick={handleDuplicateFrame}
                    className="px-1.5 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-chakra text-xs flex items-center gap-0.5 cursor-pointer"
                    title="Duplicate current frame"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    onClick={handleDeleteFrame}
                    disabled={framesForPose.length <= 1}
                    className="px-1.5 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-chakra text-xs flex items-center gap-0.5 disabled:opacity-30 cursor-pointer"
                    title="Delete current frame"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-[10px] text-amber-300/80 font-pixel hidden lg:flex items-center gap-1">
                  <span>{sheetToolMode === 'pick' ? 'Touch/click any sprite on sheet to position box' : 'Drag anywhere to scroll sheet'}</span>
                </div>
              </div>

              {/* STABLE SPRITESHEET SCROLL CONTAINER (NO FLEX CENTERING JITTER) */}
              <div
                ref={sheetScrollContainerRef}
                className={`flex-1 relative overflow-auto my-1 rounded-xl bg-slate-950 border border-slate-800 select-none ${
                  sheetToolMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
                }`}
                style={{
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* Spacious inner stage padding so the sheet never clings to edges */}
                <div
                  className="min-w-full min-h-full p-8 flex items-center justify-center"
                  style={{ width: 'max-content', height: 'max-content' }}
                >
                  <div
                    onPointerDown={handlePointerDownOnSheet}
                    onPointerMove={handlePointerMoveOnSheet}
                    onPointerUp={handlePointerUpOnSheet}
                    className="relative inline-block border-2 border-slate-700 bg-slate-900/40 shadow-2xl transition-all"
                    style={{
                      width: `${activeSheetW * sheetZoom}px`,
                      height: `${activeSheetH * sheetZoom}px`,
                      touchAction: sheetToolMode === 'pick' ? 'none' : 'auto', // Stops erratic mobile touch scrolling in pick mode!
                    }}
                  >
                    {/* Spritesheet image */}
                    <img
                      ref={sheetImageRef}
                      src={activeSheetPath}
                      alt="Full Spritesheet"
                      className="pixel-art absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                      style={{ imageRendering: 'pixelated' }}
                    />

                    {/* CURRENT SELECTED FRAME HIGHLIGHT BOX */}
                    <div
                      className="absolute border-2 border-amber-400 bg-amber-400/25 pointer-events-none shadow-lg shadow-amber-500/30 transition-all z-10"
                      style={{
                        left: `${currentFrame.x * sheetZoom}px`,
                        top: `${currentFrame.y * sheetZoom}px`,
                        width: `${currentFrame.w * sheetZoom}px`,
                        height: `${currentFrame.h * sheetZoom}px`,
                      }}
                    >
                      {/* Center Target Dot in Selection Box */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-300" />
                      
                      {/* Badge */}
                      <span className="absolute -top-5 left-0 bg-amber-500 text-slate-950 font-chakra font-bold text-[9px] px-1.5 py-0.2 rounded shadow whitespace-nowrap">
                        Frame #{safeFrameIndex + 1} ({currentFrame.w}×{currentFrame.h})
                      </span>
                    </div>

                    {/* GHOST FRAMES FOR OTHER FRAMES IN POSE */}
                    {framesForPose.map((f, i) => {
                      if (i === safeFrameIndex) return null;
                      return (
                        <div
                          key={i}
                          className="absolute border border-cyan-400/60 bg-cyan-400/10 pointer-events-none z-0"
                          style={{
                            left: `${f.x * sheetZoom}px`,
                            top: `${f.y * sheetZoom}px`,
                            width: `${f.w * sheetZoom}px`,
                            height: `${f.h * sheetZoom}px`,
                          }}
                        >
                          <span className="absolute top-0.5 left-0.5 text-[8px] font-mono text-cyan-300">
                            #{i + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Coordinate Readout */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span>Selected: <strong className="text-amber-300 font-bold">X: {currentFrame.x}, Y: {currentFrame.y}</strong> ({currentFrame.w}×{currentFrame.h}px)</span>
                  {hoverCoord && (
                    <span className="text-slate-500 hidden sm:inline">| Pointer: X: {hoverCoord.x}, Y: {hoverCoord.y}</span>
                  )}
                </div>
                <div className="text-[10px] font-pixel text-slate-500">
                  Tip: Tap on sprite, then fine-tune with micro D-Pad on right!
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: COMPACT D-PAD & FRAME CONTROLS (DIRECTLY ACCESSIBLE IN PICKER!) */}
            {isEditorDrawerOpen && renderCompactEditor(true)}

          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW MODE 2: MAIN UNOBSTRUCTED STAGE VIEWPORT */}
        {/* ================================================================= */}
        {activeViewMode === 'animation' && (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 relative overflow-hidden">
            
            {/* STAGE & PLAYBACK AREA */}
            <div className="flex-1 min-h-0 flex flex-col bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5 overflow-hidden relative">
              
              {activePose !== 'all' && (
                <>
                  {/* STAGE TOOLBAR */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-800/80 text-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-chakra font-bold text-sm text-cyan-400">
                        {POSE_INFO[activePose].label}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="font-pixel text-[10px] text-slate-300">
                        Frame {safeFrameIndex + 1} of {framesForPose.length}
                      </span>
                    </div>

                    {/* Toolbar Controls */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Dissected Pictures Button */}
                      <button
                        onClick={() => {
                          sound.playButton();
                          setActiveViewMode('dissected');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-[10px] font-chakra font-black cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95"
                        title="View dissected individual pictures gallery"
                      >
                        <Grid className="w-3 h-3" />
                        <span>CHOOSE PICTURE</span>
                      </button>

                      {/* Full Spritesheet Picker Button */}
                      <button
                        onClick={() => {
                          sound.playButton();
                          setActiveViewMode('picker');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-chakra font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
                        title="Open full spritesheet and click any sprite directly"
                      >
                        <MousePointer className="w-3 h-3" />
                        <span>PICK FROM SHEET</span>
                      </button>

                      {/* Background Selector */}
                      <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                        {(['cyber', 'checker', 'lcd', 'white'] as const).map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setBackgroundTheme(theme)}
                            className={`px-1.5 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                              backgroundTheme === theme ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                            }`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>

                      {/* Center Crosshair toggle */}
                      <button
                        onClick={() => setShowCenterCrosshair((p) => !p)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-pixel cursor-pointer transition-colors flex items-center gap-1 ${
                          showCenterCrosshair
                            ? 'bg-amber-950/90 border-amber-500/80 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                        title="Toggle Center Alignment Crosshair Reticle"
                      >
                        <Crosshair className="w-3 h-3" />
                        <span>CROSSHAIR</span>
                      </button>

                      {/* Ground baseline toggle */}
                      <button
                        onClick={() => setShowGroundLine((p) => !p)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-pixel cursor-pointer transition-colors flex items-center gap-1 ${
                          showGroundLine
                            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                        title="Toggle Ground Line"
                      >
                        <Compass className="w-3 h-3" />
                        <span>GROUND</span>
                      </button>

                      {/* Bounding box guide toggle */}
                      <button
                        onClick={() => setShowBoxGuides((p) => !p)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-pixel cursor-pointer transition-colors flex items-center gap-1 ${
                          showBoxGuides
                            ? 'bg-cyan-950/90 border-cyan-500/80 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                        title="Toggle Bounding Box Outline"
                      >
                        <Grid className="w-3 h-3" />
                        <span>BOX</span>
                      </button>

                      {/* Facing Direction Flip */}
                      <button
                        onClick={() => {
                          sound.playButton();
                          setFacing((p) => (p === 'right' ? 'left' : 'right'));
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-pixel cursor-pointer transition-colors"
                        title="Flip Sprite Facing Direction"
                      >
                        {facing === 'right' ? 'RIGHT →' : '← LEFT'}
                      </button>

                      {/* Filmstrip Toggle Button */}
                      <button
                        onClick={() => setShowFilmstrip((p) => !p)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-pixel cursor-pointer transition-colors ${
                          showFilmstrip
                            ? 'bg-indigo-950/90 border-indigo-500/80 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                        title="Toggle Frame Filmstrip at bottom"
                      >
                        {showFilmstrip ? 'HIDE STRIP' : 'SHOW STRIP'}
                      </button>
                    </div>
                  </div>

                  {/* ============================================================= */}
                  {/* THE ENLARGED, COMPLETELY UNOBSTRUCTED PIXEL STAGE */}
                  {/* ============================================================= */}
                  <div
                    className={`flex-1 relative flex items-center justify-center overflow-hidden my-1 rounded-2xl border select-none transition-colors min-h-[220px] ${
                      backgroundTheme === 'cyber'
                        ? 'bg-slate-950 border-slate-800'
                        : backgroundTheme === 'checker'
                        ? 'bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:16px_16px] bg-slate-900 border-slate-700'
                        : backgroundTheme === 'lcd'
                        ? 'bg-[#8ca281] border-[#5e7255]'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {/* Ground Baseline Guide */}
                    {showGroundLine && (
                      <div
                        className="absolute left-0 right-0 border-b-2 border-dashed pointer-events-none z-10 transition-all flex items-center justify-between px-4"
                        style={{
                          top: '72%',
                          borderColor: backgroundTheme === 'lcd' ? '#2f3b2a' : '#10b981',
                          opacity: 0.85,
                        }}
                      >
                        <span className="text-[9px] font-pixel text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/40 -translate-y-1/2">
                          ▲ FEET GROUND LEVEL
                        </span>
                        {((currentFrame.offsetY || 0) !== 0 || (workingConfig?.groundOffset || 0) !== 0) && (
                          <span className="text-[9px] font-mono text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/40 -translate-y-1/2">
                            Adjusted: {((currentFrame.offsetY || 0) + (workingConfig?.groundOffset || 0)) > 0 ? '+' : ''}
                            {(currentFrame.offsetY || 0) + (workingConfig?.groundOffset || 0)}px
                          </span>
                        )}
                      </div>
                    )}

                    {/* Center Crosshair Guide (Exact Midpoint) */}
                    {showCenterCrosshair && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute left-0 right-0 border-b border-amber-400/60" style={{ top: '50%' }} />
                        <div className="absolute top-0 bottom-0 border-r border-amber-400/60" style={{ left: '50%' }} />
                        <div
                          className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/70"
                          style={{ left: '50%', top: '50%' }}
                        />
                        <div
                          className="absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400"
                          style={{ left: '50%', top: '50%' }}
                        />
                      </div>
                    )}

                    {/* SPRITE RENDERING BOX - GROUNDED ANCHOR */}
                    {currentFrame && workingConfig && (
                      <div
                        className="absolute left-1/2 transition-all z-20 flex flex-col items-center select-none"
                        style={{
                          bottom: '28%', // Matches top: 72% ground baseline exactly!
                          transform: `translateX(-50%) translateY(${-( (currentFrame.offsetY || 0) + (workingConfig.groundOffset || 0) ) * scale}px) scaleX(${facing === 'left' ? -1 : 1})`,
                          transformOrigin: 'bottom center',
                        }}
                      >

                        {(() => {
                          const isRotated =
                            currentFrame.rotate === 90 ||
                            currentFrame.rotate === -90 ||
                            currentFrame.rotate === 270;
                          const displayW = (isRotated ? currentFrame.h : currentFrame.w) * scale;
                          const displayH = (isRotated ? currentFrame.w : currentFrame.h) * scale;

                          return (
                            <div
                              className="relative overflow-hidden pixel-art transition-all"
                              style={{
                                width: `${displayW}px`,
                                height: `${displayH}px`,
                                outline: showBoxGuides
                                  ? '1.5px dashed rgba(6, 182, 212, 0.8)'
                                  : 'none',
                              }}
                            >
                              <div
                                style={{
                                  width: `${currentFrame.w * scale}px`,
                                  height: `${currentFrame.h * scale}px`,
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: `translate(-50%, -50%) ${
                                    currentFrame.rotate ? `rotate(${currentFrame.rotate}deg)` : ''
                                  }`,
                                  transformOrigin: 'center center',
                                  overflow: 'hidden',
                                }}
                              >
                                <img
                                  src={currentFrame.sheetPath || workingConfig.sheetPath}
                                  alt={activeSpecies.name}
                                  className="pixel-art absolute max-w-none pointer-events-none select-none"
                                  style={{
                                    width: `${(currentFrame.sheetWidth || workingConfig.sheetWidth) * scale}px`,
                                    height: `${(currentFrame.sheetHeight || workingConfig.sheetHeight) * scale}px`,
                                    left: `-${currentFrame.x * scale}px`,
                                    top: `-${currentFrame.y * scale}px`,
                                    imageRendering: 'pixelated',
                                    filter:
                                      backgroundTheme === 'lcd'
                                        ? 'grayscale(100%) contrast(160%) brightness(0.65)'
                                        : undefined,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* ============================================================= */}
                  {/* PLAYBACK CONTROL BAR */}
                  {/* ============================================================= */}
                  <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 border-t border-slate-800 shrink-0 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          sound.playButton();
                          setCurrentFrameIndex((prev) => (prev - 1 + framesForPose.length) % framesForPose.length);
                          setIsPlaying(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                        title="Step Previous Frame"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          sound.playButton();
                          setIsPlaying((prev) => !prev);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-chakra text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20 transition-all"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playButton();
                          setCurrentFrameIndex((prev) => (prev + 1) % framesForPose.length);
                          setIsPlaying(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                        title="Step Next Frame"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      {currentFrame && (
                        <div className="hidden sm:flex items-center gap-1.5 ml-1 font-mono text-[11px] text-slate-300 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                          <span className="text-cyan-400 font-bold">{currentFrame.w}×{currentFrame.h}px</span>
                          <span className="text-slate-600">|</span>
                          <span>({currentFrame.x}, {currentFrame.y})</span>
                          <span className="text-slate-600">|</span>
                          <span className={currentFrame.rotate ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                            {currentFrame.rotate ? `${currentFrame.rotate}°` : '0°'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Zoom & Speed Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-0.5 border border-slate-800 text-[10px] font-pixel">
                        {[0.25, 0.5, 1, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => {
                              sound.playButton();
                              setPlaybackSpeed(spd);
                            }}
                            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                              playbackSpeed === spd
                                ? 'bg-cyan-600 text-white font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 bg-slate-900 rounded-xl px-2 py-1 border border-slate-800 text-[10px]">
                        <button
                          onClick={() => setScale((s) => Math.max(1, s - 1))}
                          disabled={scale <= 1}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-cyan-300 w-5 text-center font-bold">{scale}x</span>
                        <button
                          onClick={() => setScale((s) => Math.min(6, s + 1))}
                          disabled={scale >= 6}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* FILMSTRIP */}
                  {showFilmstrip && (
                    <div className="mt-1 pt-1.5 border-t border-slate-800 shrink-0">
                      <div className="flex items-center justify-between pb-1 text-xs text-slate-400">
                        <span className="font-chakra font-bold text-slate-300 flex items-center gap-1.5">
                          <Grid className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Animation Filmstrip ({framesForPose.length} frames)</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleAddFrame}
                            className="px-2 py-0.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-pixel text-[9px] flex items-center gap-1 cursor-pointer"
                            title="Add new frame"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>ADD</span>
                          </button>
                          <button
                            onClick={handleDuplicateFrame}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-pixel text-[9px] flex items-center gap-1 cursor-pointer"
                            title="Duplicate current frame"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>DUP</span>
                          </button>
                          <button
                            onClick={() => handleMoveFrame('left')}
                            disabled={safeFrameIndex === 0}
                            className="px-1.5 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-pixel text-[9px] disabled:opacity-30 cursor-pointer"
                            title="Move frame left"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => handleMoveFrame('right')}
                            disabled={safeFrameIndex >= framesForPose.length - 1}
                            className="px-1.5 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-pixel text-[9px] disabled:opacity-30 cursor-pointer"
                            title="Move frame right"
                          >
                            →
                          </button>
                          <button
                            onClick={handleDeleteFrame}
                            disabled={framesForPose.length <= 1}
                            className="px-1.5 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-pixel text-[9px] disabled:opacity-30 cursor-pointer"
                            title="Delete current frame"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {framesForPose.map((frame, idx) => {
                          const isSelected = idx === safeFrameIndex;
                          const isRotated =
                            frame.rotate === 90 || frame.rotate === -90 || frame.rotate === 270;
                          const dW = (isRotated ? frame.h : frame.w) * 1.3;
                          const dH = (isRotated ? frame.w : frame.h) * 1.3;

                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                sound.playButton();
                                setCurrentFrameIndex(idx);
                                setIsPlaying(false);
                              }}
                              className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                isSelected
                                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950 scale-[1.02]'
                                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                                {workingConfig && (
                                  <div
                                    className="relative overflow-hidden pixel-art"
                                    style={{ width: `${dW}px`, height: `${dH}px` }}
                                  >
                                    <div
                                      style={{
                                        width: `${frame.w * 1.3}px`,
                                        height: `${frame.h * 1.3}px`,
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: `translate(-50%, -50%) ${
                                          frame.rotate ? `rotate(${frame.rotate}deg)` : ''
                                        }`,
                                        transformOrigin: 'center center',
                                      }}
                                    >
                                      <img
                                        src={frame.sheetPath || workingConfig.sheetPath}
                                        alt=""
                                        className="pixel-art absolute max-w-none"
                                        style={{
                                          width: `${(frame.sheetWidth || workingConfig.sheetWidth) * 1.3}px`,
                                          height: `${(frame.sheetHeight || workingConfig.sheetHeight) * 1.3}px`,
                                          left: `-${frame.x * 1.3}px`,
                                          top: `-${frame.y * 1.3}px`,
                                          imageRendering: 'pixelated',
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                                {isSelected && (
                                  <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                )}
                              </div>

                              <div className="min-w-0 pr-1">
                                <div className="flex items-center gap-1">
                                  <span className="font-chakra font-bold text-xs text-white">
                                    #{idx + 1}
                                  </span>
                                  {frame.rotate ? (
                                    <span className="text-[7px] font-pixel text-amber-400 bg-amber-950/80 px-1 rounded border border-amber-800">
                                      {frame.rotate}°
                                    </span>
                                  ) : (
                                    <span className="text-[7px] font-pixel text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-800">
                                      0°
                                    </span>
                                  )}
                                </div>
                                <div className="text-[9px] font-mono text-cyan-300 whitespace-nowrap">
                                  {frame.w}×{frame.h}px
                                </div>
                                <div className="text-[8px] font-mono text-slate-500 whitespace-nowrap">
                                  ({frame.x}, {frame.y})
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* View Mode: All Poses Matrix */}
              {activePose === 'all' && (
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs">
                    <div className="font-chakra font-bold text-sm text-purple-300">
                      All Animation Poses for {activeSpecies.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Click any pose to inspect and calibrate on the big stage
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(POSE_INFO) as Array<Exclude<GalleryPose, 'all'>>).map((poseKey) => {
                      const frames = workingConfig?.frames[poseKey] || [];
                      const pInfo = POSE_INFO[poseKey];
                      const frame = frames[0] || { x: 0, y: 0, w: 32, h: 32 };
                      const isRotated = frame.rotate === 90 || frame.rotate === -90 || frame.rotate === 270;
                      const dW = (isRotated ? frame.h : frame.w) * 2;
                      const dH = (isRotated ? frame.w : frame.h) * 2;

                      return (
                        <div
                          key={poseKey}
                          onClick={() => {
                            sound.playButton();
                            setActivePose(poseKey);
                          }}
                          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 flex flex-col items-center justify-between gap-2 cursor-pointer transition-all hover:scale-[1.02] group shadow-md"
                        >
                          <div className="flex items-center justify-between w-full text-xs">
                            <span className="font-chakra font-bold text-slate-200 group-hover:text-cyan-300 flex items-center gap-1 truncate">
                              <span>{pInfo.icon}</span>
                              <span className="truncate">{pInfo.label.split(' ')[0]}</span>
                            </span>
                            <span className="font-pixel text-[9px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded-full border border-cyan-800/80">
                              {frames.length}f
                            </span>
                          </div>

                          <div className="h-28 w-full flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800/80 relative overflow-hidden">
                            {workingConfig && (
                              <div
                                className="relative overflow-hidden pixel-art"
                                style={{ width: `${dW}px`, height: `${dH}px` }}
                              >
                                <div
                                  style={{
                                    width: `${frame.w * 2}px`,
                                    height: `${frame.h * 2}px`,
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: `translate(-50%, -50%) ${
                                      frame.rotate ? `rotate(${frame.rotate}deg)` : ''
                                    }`,
                                    transformOrigin: 'center center',
                                  }}
                                >
                                  <img
                                    src={frame.sheetPath || workingConfig.sheetPath}
                                    alt=""
                                    className="pixel-art absolute max-w-none"
                                    style={{
                                      width: `${(frame.sheetWidth || workingConfig.sheetWidth) * 2}px`,
                                      height: `${(frame.sheetHeight || workingConfig.sheetHeight) * 2}px`,
                                      left: `-${frame.x * 2}px`,
                                      top: `-${frame.y * 2}px`,
                                      imageRendering: 'pixelated',
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="w-full flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{frame.w}×{frame.h}px</span>
                            <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5">
                              Inspect <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDE: COMPACT D-PAD & CONTROLS IN ANIMATION STAGE VIEW */}
            {isEditorDrawerOpen && renderCompactEditor(false)}

          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW MODE 3: JSON VIEWER */}
        {/* ================================================================= */}
        {activeViewMode === 'json' && workingConfig && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/90 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs shrink-0">
              <span className="font-chakra font-bold text-sm text-purple-300">
                Configuration Coordinates (JSON)
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(workingConfig, null, 2));
                  sound.playButton();
                  showToast('Copied coordinates JSON to clipboard!');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-950 rounded-xl p-3 my-2 border border-slate-800 font-mono text-[11px] text-cyan-300">
              <pre>{JSON.stringify(workingConfig, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* BOTTOM STATUS & HELPER FOOTNOTE */}
        {/* ================================================================= */}
        <div className="pt-2 border-t border-slate-800 shrink-0 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isGalleryHidden}
                onChange={(e) => handleToggleHideGallery(e.target.checked)}
                className="accent-cyan-400 w-3.5 h-3.5 rounded cursor-pointer"
              />
              <span>Hide "Sprite Gallery" button from app header</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToDefault}
              className="text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Species to Default</span>
            </button>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-500">
              Press <kbd className="px-1 py-0.2 bg-slate-800 rounded border border-slate-700 text-slate-300">G</kbd> to open anytime
            </span>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
