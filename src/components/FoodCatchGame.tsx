import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DigimonSpecies, PetState } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { sound } from '../utils/audio';
import { Trophy, Clock, X, Sparkles, Heart } from 'lucide-react';

interface FoodCatchGameProps {
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onGameComplete: (score: number, meatEarned: number, vitaminsEarned: number, coinsEarned: number) => void;
}

interface FallingItem {
  id: number;
  x: number; // percentage 5% to 90%
  y: number; // percentage 0% to 100%
  type: 'meat' | 'vitamin' | 'rock';
  speed: number;
}

export const FoodCatchGame: React.FC<FoodCatchGameProps> = ({
  species,
  isOpen,
  onClose,
  onGameComplete,
}) => {
  const [basketX, setBasketX] = useState<number>(50); // percentage
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState<number>(0);
  const [vitaminsCaught, setVitaminsCaught] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(25);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const nextIdRef = useRef<number>(1);
  const gameLoopRef = useRef<number | null>(null);
  const basketXRef = useRef<number>(50);
  const itemsRef = useRef<FallingItem[]>([]);
  const moveStopTimerRef = useRef<number | null>(null);

  // Keep basketXRef in sync with state
  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  // Move Digimon catcher with facing direction & walking/idle state
  const moveCatcherTo = (targetX: number) => {
    const clamped = Math.max(10, Math.min(90, targetX));
    const delta = clamped - basketXRef.current;
    if (Math.abs(delta) > 0.15) {
      setFacing(delta > 0 ? 'right' : 'left');
      setIsMoving(true);
      if (moveStopTimerRef.current !== null) {
        window.clearTimeout(moveStopTimerRef.current);
      }
      moveStopTimerRef.current = window.setTimeout(() => {
        setIsMoving(false);
        moveStopTimerRef.current = null;
      }, 150);
    }
    basketXRef.current = clamped;
    setBasketX(clamped);
  };

  useEffect(() => {
    return () => {
      if (moveStopTimerRef.current !== null) {
        window.clearTimeout(moveStopTimerRef.current);
      }
    };
  }, []);

  // Start game
  const startGame = () => {
    sound.playButton();
    setScore(0);
    setVitaminsCaught(0);
    setTimeLeft(25);
    itemsRef.current = [];
    setItems([]);
    setIsMoving(false);
    setIsPlaying(true);
    setIsGameOver(false);
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Main game animation loop - normalized with delta time for 60Hz/90Hz/120Hz/144Hz displays
  const lastTimeRef = useRef<number>(0);
  const spawnTimerAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) return;

    lastTimeRef.current = performance.now();
    spawnTimerAccumulatorRef.current = 0;

    const loop = (timestamp: number) => {
      // Calculate delta time in ms, capped to prevent massive leaps when tab is backgrounded
      const deltaMs = Math.min(64, Math.max(8, timestamp - lastTimeRef.current));
      lastTimeRef.current = timestamp;
      const deltaFactor = deltaMs / 16.667; // 1.0 at standard 60 FPS

      const workingItems = [...itemsRef.current];

      // Spawn an item every ~550ms
      spawnTimerAccumulatorRef.current += deltaMs;
      if (spawnTimerAccumulatorRef.current >= 550) {
        spawnTimerAccumulatorRef.current = 0;
        const types: ('meat' | 'vitamin' | 'rock')[] = [
          'meat',
          'meat',
          'meat',
          'vitamin',
          'rock',
        ];
        const randomType = types[Math.floor(Math.random() * types.length)];
        workingItems.push({
          id: nextIdRef.current++,
          x: Math.random() * 80 + 10,
          y: -5,
          type: randomType,
          speed: Math.random() * 0.15 + 0.45,
        });
      }

      // Update falling items positions & check collisions against current basketX
      const remaining: FallingItem[] = [];
      const currentBasketX = basketXRef.current;
      let deltaScore = 0;
      let deltaVitamins = 0;

      for (const item of workingItems) {
        const nextY = item.y + item.speed * deltaFactor;

        // Check if caught at basket level (around 75% - 85% y)
        if (nextY >= 75 && nextY <= 85) {
          const distanceX = Math.abs(item.x - currentBasketX);
          if (distanceX < 13) {
            if (item.type === 'meat') {
              sound.playEat();
              deltaScore += 10;
            } else if (item.type === 'vitamin') {
              sound.playMedicine();
              deltaScore += 25;
              deltaVitamins += 1;
            } else if (item.type === 'rock') {
              sound.playPunch();
              deltaScore -= 15;
            }
            continue;
          }
        }

        if (nextY < 100) {
          remaining.push({ ...item, y: nextY });
        }
      }

      itemsRef.current = remaining;
      setItems(remaining);

      if (deltaScore !== 0) {
        setScore((s) => Math.max(0, s + deltaScore));
      }
      if (deltaVitamins > 0) {
        setVitaminsCaught((v) => v + deltaVitamins);
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying]);

  const endGame = () => {
    setIsPlaying(false);
    setIsMoving(false);
    setIsGameOver(true);
    sound.playVictory();
  };

  const handleClaimReward = () => {
    const meatEarned = Math.floor(score / 30) + 1;
    const coinsEarned = score * 2;
    onGameComplete(score, meatEarned, vitaminsCaught, coinsEarned);
    onClose();
  };

  // Keyboard navigation & mouse drag support
  useEffect(() => {
    if (!isPlaying) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        moveCatcherTo(basketXRef.current - 7);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        moveCatcherTo(basketXRef.current + 7);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const handleAreaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    moveCatcherTo(percent);
  };

  const handleAreaTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPlaying) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const percent = ((touch.clientX - rect.left) / rect.width) * 100;
    moveCatcherTo(percent);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍖</span>
            <div>
              <h3 className="font-chakra font-bold text-white text-lg">
                "I'M HUNGRY!" MEAT CATCH
              </h3>
              <p className="text-slate-400 text-xs">Hellopet & Digimon mini-game</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Stats Bar */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-slate-950/80 rounded-xl mt-3 border border-slate-800 font-pixel text-xs">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>SCORE: {score}</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-300">
            <span>💊 VIT: {vitaminsCaught}</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>TIME: {timeLeft}s</span>
          </div>
        </div>

        {/* Playfield Area */}
        <div
          onMouseMove={handleAreaMouseMove}
          onMouseDown={handleAreaMouseMove}
          onTouchMove={handleAreaTouchMove}
          onTouchStart={handleAreaTouchMove}
          className="relative w-full h-[320px] bg-gradient-to-b from-sky-950 via-slate-900 to-emerald-950/80 rounded-2xl border-2 border-slate-700 mt-3 overflow-hidden cursor-crosshair touch-none select-none"
        >
          {/* Falling items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="absolute text-2xl filter drop-shadow-md transition-none"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {item.type === 'meat' && '🍖'}
              {item.type === 'vitamin' && '💊'}
              {item.type === 'rock' && '🪨'}
            </div>
          ))}

          {/* Player Catcher (Digimon at bottom: walking while moving, idle when still) */}
          <div
            className="absolute bottom-2 transition-transform duration-75"
            style={{
              left: `${basketX}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-4 bg-amber-500/30 border border-amber-400 rounded-full mb-1 flex items-center justify-center text-[9px] font-pixel text-amber-300">
                CATCH!
              </div>
              <DigimonSprite
                species={species}
                action={isMoving ? 'walk' : 'idle'}
                facing={facing}
                scale={0.8}
              />
            </div>
          </div>

          {/* Start Screen Overlay */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-4xl mb-2">🍖</span>
              <h4 className="font-chakra font-bold text-white text-xl">FEED YOUR DIGIMON!</h4>
              <p className="text-slate-300 text-xs mt-1 mb-4 max-w-xs">
                Catch falling Big Meat 🍖 and Vitamins 💊 to add to your stock! Dodge rocks 🪨! Drag mouse or touch to move.
              </p>
              <button
                onClick={startGame}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/40 active:scale-95 transition-transform"
              >
                START GAME
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <Trophy className="w-12 h-12 text-amber-400 mb-2" />
              <h4 className="font-chakra font-bold text-white text-2xl">DELICIOUS FEAST!</h4>
              <div className="font-pixel text-sm text-amber-300 mt-2">
                FINAL SCORE: {score}
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 my-4 flex flex-wrap items-center justify-center gap-3 text-xs font-chakra">
                <span className="text-amber-400">🍖 +{Math.floor(score / 30) + 1} Big Meat</span>
                <span className="text-purple-300">💊 +{vitaminsCaught} Vitamins</span>
                <span className="text-emerald-400">🪙 +{score * 2} DigiBits</span>
              </div>
              <button
                onClick={handleClaimReward}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-xs px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform"
              >
                CLAIM REWARDS
              </button>
            </div>
          )}
        </div>

        {/* Quick controls hint */}
        <div className="text-center text-[10px] text-slate-400 mt-2">
          Use Mouse, Touch, or Left/Right Arrow keys to steer your Digimon
        </div>
      </div>
    </div>
  );
};
