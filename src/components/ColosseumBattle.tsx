import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetState, DigimonSpecies, BattleFighter, BattleLogEntry } from '../types/digimon';
import { DIGIMON_DATABASE } from '../data/digidex';
import { DigimonSprite } from './DigimonSprite';
import { sound, triggerHaptic } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Swords, 
  Shield, 
  Zap, 
  Flame, 
  X, 
  Trophy, 
  Users, 
  Globe, 
  Wifi, 
  RefreshCw,
  Sparkles,
  Compass
} from 'lucide-react';

interface ColosseumBattleProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onBattleEnd: (won: boolean, coinsReward: number, dpReward: number) => void;
  onOpenAdventure?: () => void;
}

export const ColosseumBattle: React.FC<ColosseumBattleProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onBattleEnd,
  onOpenAdventure,
}) => {
  const [matchState, setMatchState] = useState<'lobby' | 'matching' | 'battling' | 'victory' | 'defeat'>('lobby');
  const [roomCode, setRoomCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [playerFighter, setPlayerFighter] = useState<BattleFighter | null>(null);
  const [opponentFighter, setOpponentFighter] = useState<BattleFighter | null>(null);
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [playerActionAnim, setPlayerActionAnim] = useState<'idle' | 'attack' | 'happy' | 'sick'>('idle');
  const [opponentActionAnim, setOpponentActionAnim] = useState<'idle' | 'attack' | 'happy' | 'sick'>('idle');
  const [isDefending, setIsDefending] = useState<boolean>(false);
  const [isCharged, setIsCharged] = useState<boolean>(false);

  // CSS-based Attack & Hit Animation States
  const [playerEffect, setPlayerEffect] = useState<'none' | 'lunge' | 'hit' | 'shield' | 'charge'>('none');
  const [opponentEffect, setOpponentEffect] = useState<'none' | 'lunge' | 'hit'>('none');
  const [arenaShake, setArenaShake] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<'none' | 'white' | 'red' | 'special'>('none');
  const [damagePopups, setDamagePopups] = useState<{ id: number; target: 'player' | 'opponent'; text: string; color: string }[]>([]);

  const showDamagePopup = (target: 'player' | 'opponent', text: string, color: string) => {
    const id = Date.now() + Math.random();
    setDamagePopups((prev) => [...prev, { id, target, text, color }]);
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  };

  const triggerScreenFlash = (type: 'white' | 'red' | 'special') => {
    setScreenFlash(type);
    setTimeout(() => setScreenFlash('none'), 350);
  };

  const triggerArenaShake = () => {
    setArenaShake(true);
    setTimeout(() => setArenaShake(false), 450);
  };

  // Always reset battle state to lobby whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setMatchState('lobby');
      setPlayerFighter(null);
      setOpponentFighter(null);
      setBattleLogs([]);
      setIsPlayerTurn(true);
      setIsDefending(false);
      setIsCharged(false);
      setPlayerActionAnim('idle');
      setOpponentActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
      setArenaShake(false);
      setScreenFlash('none');
      setDamagePopups([]);
    }
  }, [isOpen]);

  // Initialize Player fighter
  const setupFighters = (oppSpeciesId?: string) => {
    if (!species) return;

    const baseHp = species.baseHp + Math.floor(pet.strength * 1.5) + (pet.dpPoints * 2);
    const atk = species.baseAtk + Math.floor(pet.strength * 0.8) + (pet.trainingCount * 2);
    const def = species.baseDef + Math.floor(pet.weight * 0.3);

    const player: BattleFighter = {
      id: 'player-fighter',
      name: pet.nickname || species.name,
      speciesId: species.id,
      stage: pet.stage,
      crest: species.crest || 'courage',
      currentHp: baseHp,
      maxHp: baseHp,
      sp: 30,
      atk,
      def,
      spd: species.baseSpd,
      signatureMove: species.signatureMove,
      isPlayer: true,
    };

    // Determine an evenly matched, competitive opponent scaled to the player's power
    const opponentKeys = Object.keys(DIGIMON_DATABASE).filter(
      (k) => DIGIMON_DATABASE[k].stage === pet.stage && k !== species.id
    );
    const oppId = oppSpeciesId || (opponentKeys.length > 0 ? opponentKeys[Math.floor(Math.random() * opponentKeys.length)] : 'greymon');
    const oppSpecies = DIGIMON_DATABASE[oppId] || DIGIMON_DATABASE['agumon'];

    const stageScaleMap: Record<string, number> = {
      egg: 1.0,
      fresh: 1.1,
      'in-training': 1.2,
      rookie: 1.35,
      champion: 1.48,
      ultimate: 1.58,
      mega: 1.68,
    };
    const stageMult = stageScaleMap[pet.stage] || 1.35;

    const oppHp = Math.round(
      Math.max(baseHp * 1.22, oppSpecies.baseHp * stageMult * 1.45) + 45 + Math.floor(Math.random() * 35)
    );
    const oppAtk = Math.round(Math.max(oppSpecies.baseAtk * 1.28, atk * 0.96) + 6);
    const oppDef = Math.round(Math.max(oppSpecies.baseDef * 1.35, def * 1.15) + 12);
    const scaledSigPower = Math.max(
      oppSpecies.signatureMove.power,
      Math.round(species.signatureMove.power * 0.95)
    );

    const opponent: BattleFighter = {
      id: 'opponent-fighter',
      name: oppSpecies.name,
      speciesId: oppSpecies.id,
      stage: oppSpecies.stage,
      crest: oppSpecies.crest,
      currentHp: oppHp,
      maxHp: oppHp,
      sp: 35,
      atk: oppAtk,
      def: oppDef,
      spd: Math.max(oppSpecies.baseSpd, species.baseSpd),
      signatureMove: {
        ...oppSpecies.signatureMove,
        power: scaledSigPower,
      },
      isPlayer: false,
    };

    setPlayerFighter(player);
    setOpponentFighter(opponent);
    setBattleLogs([
      {
        id: 'start-1',
        text: `⚔️ Online Colosseum Match Started! ${player.name} VS Challenger ${opponent.name}!`,
        type: 'action',
      },
    ]);
  };

  // Quick matchmaking
  const handleStartQuickMatch = () => {
    sound.playButton();
    setMatchState('matching');
    setTimeout(() => {
      setupFighters();
      setMatchState('battling');
      setIsPlayerTurn(true);
    }, 1500);
  };

  // Host room
  const handleHostRoom = () => {
    sound.playButton();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setMatchState('matching');
    setTimeout(() => {
      setupFighters();
      setMatchState('battling');
      setIsPlayerTurn(true);
    }, 2000);
  };

  // Opponent AI Turn
  useEffect(() => {
    if (matchState !== 'battling' || isPlayerTurn || !opponentFighter || !playerFighter) return;

    const timer = setTimeout(() => {
      // Opponent chooses move
      const canUseSpecial = opponentFighter.sp >= 50;
      const shouldUseSpecial = canUseSpecial && Math.random() < 0.8;

      if (shouldUseSpecial) {
        // Special move
        sound.playBlast();
        triggerHaptic('heavy');
        setOpponentActionAnim('attack');
        setOpponentEffect('lunge');
        const rawDamage = Math.max(18, Math.floor(opponentFighter.signatureMove.power * 1.08 - (isDefending ? playerFighter.def * 0.75 : playerFighter.def * 0.35)));
        const finalDamage = isDefending ? Math.floor(rawDamage * 0.4) : rawDamage;

        setOpponentFighter((prev) => prev ? { ...prev, sp: prev.sp - 50 } : null);

        // Impact timing: shake player and flash screen
        setTimeout(() => {
          setPlayerEffect('hit');
          triggerScreenFlash('special');
          triggerArenaShake();
          showDamagePopup('player', `💥 -${finalDamage}!`, isDefending ? 'text-cyan-300' : 'text-rose-400 font-extrabold');

          setPlayerFighter((prev) => {
            if (!prev) return null;
            const nextHp = Math.max(0, prev.currentHp - finalDamage);
            return { ...prev, currentHp: nextHp };
          });
        }, 180);

        setBattleLogs((logs) => [
          {
            id: `opp-${Date.now()}`,
            text: `💥 ${opponentFighter.name} unleashed ${opponentFighter.signatureMove.name} for ${finalDamage} damage!`,
            type: 'special',
          },
          ...logs,
        ]);
      } else {
        // Standard attack
        sound.playPunch();
        triggerHaptic('medium');
        setOpponentActionAnim('attack');
        setOpponentEffect('lunge');
        const rawDamage = Math.max(14, Math.floor(opponentFighter.atk * 0.95 - (isDefending ? playerFighter.def * 0.7 : playerFighter.def * 0.3)));
        const finalDamage = isDefending ? Math.floor(rawDamage * 0.4) : rawDamage;

        setOpponentFighter((prev) => prev ? { ...prev, sp: Math.min(100, prev.sp + 20) } : null);

        // Impact timing: shake player and flash screen
        setTimeout(() => {
          setPlayerEffect('hit');
          triggerScreenFlash('red');
          triggerArenaShake();
          showDamagePopup('player', `-${finalDamage}`, isDefending ? 'text-cyan-300' : 'text-rose-400 font-bold');

          setPlayerFighter((prev) => {
            if (!prev) return null;
            const nextHp = Math.max(0, prev.currentHp - finalDamage);
            return { ...prev, currentHp: nextHp };
          });
        }, 160);

        setBattleLogs((logs) => [
          {
            id: `opp-${Date.now()}`,
            text: `⚡ ${opponentFighter.name} struck with a physical attack for ${finalDamage} damage!`,
            type: 'damage',
          },
          ...logs,
        ]);
      }

      setIsDefending(false);
      setTimeout(() => {
        setOpponentActionAnim('idle');
        setOpponentEffect('none');
        setPlayerEffect('none');
        setIsPlayerTurn(true);
      }, 750);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, matchState, opponentFighter, playerFighter, isDefending]);

  // Check victory / defeat conditions
  useEffect(() => {
    if (matchState !== 'battling' || !playerFighter || !opponentFighter) return;

    if (opponentFighter.currentHp <= 0) {
      sound.playVictory();
      setMatchState('victory');
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } else if (playerFighter.currentHp <= 0) {
      setMatchState('defeat');
    }
  }, [playerFighter?.currentHp, opponentFighter?.currentHp, matchState]);

  // Player Moves
  const handlePlayerAttack = () => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter) return;
    setIsPlayerTurn(false);
    sound.playPunch();
    triggerHaptic('medium');
    setPlayerActionAnim('attack');
    setPlayerEffect('lunge');

    const mult = isCharged ? 1.5 : 1.0;
    const damage = Math.max(12, Math.floor((playerFighter.atk * 0.82 * mult) - (opponentFighter.def * 0.48)));

    setPlayerFighter((prev) => prev ? { ...prev, sp: Math.min(100, prev.sp + 20) } : null);
    setIsCharged(false);

    // Impact timing on opponent
    setTimeout(() => {
      setOpponentEffect('hit');
      triggerScreenFlash('white');
      triggerArenaShake();
      showDamagePopup('opponent', `-${damage}`, 'text-amber-300 font-bold');

      setOpponentFighter((prev) => {
        if (!prev) return null;
        const nextHp = Math.max(0, prev.currentHp - damage);
        return { ...prev, currentHp: nextHp };
      });
    }, 160);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `⚔️ ${playerFighter.name} lands an attack dealing ${damage} damage!`,
        type: 'damage',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
    }, 700);
  };

  const handlePlayerSpecial = () => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter || playerFighter.sp < 50) return;
    setIsPlayerTurn(false);
    sound.playBlast();
    triggerHaptic('heavy');
    setPlayerActionAnim('attack');
    setPlayerEffect('lunge');

    const mult = isCharged ? 1.6 : 1.15;
    const damage = Math.max(24, Math.floor((playerFighter.signatureMove.power * mult) - (opponentFighter.def * 0.5)));

    setPlayerFighter((prev) => prev ? { ...prev, sp: prev.sp - 50 } : null);
    setIsCharged(false);

    // Impact timing on opponent
    setTimeout(() => {
      setOpponentEffect('hit');
      triggerScreenFlash('special');
      triggerArenaShake();
      showDamagePopup('opponent', `🔥 -${damage}!`, 'text-orange-400 font-extrabold text-sm');

      setOpponentFighter((prev) => {
        if (!prev) return null;
        const nextHp = Math.max(0, prev.currentHp - damage);
        return { ...prev, currentHp: nextHp };
      });
    }, 180);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `🔥 SIGNATURE MOVE! ${playerFighter.name} unleashed ${playerFighter.signatureMove.name} for ${damage} massive damage!`,
        type: 'special',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
    }, 800);
  };

  const handlePlayerDefend = () => {
    if (!isPlayerTurn || !playerFighter) return;
    setIsPlayerTurn(false);
    sound.playButton();
    triggerHaptic('light');
    setIsDefending(true);
    setPlayerEffect('shield');
    showDamagePopup('player', '🛡️ SHIELD UP!', 'text-cyan-300 font-bold');

    setPlayerFighter((prev) => prev ? { ...prev, sp: Math.min(100, prev.sp + 10) } : null);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `🛡️ ${playerFighter.name} raised a Digi-Shield! Incoming damage drastically reduced!`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerEffect('none');
    }, 1000);
  };

  const handlePlayerCharge = () => {
    if (!isPlayerTurn || !playerFighter) return;
    setIsPlayerTurn(false);
    sound.playMedicine();
    triggerHaptic('medium');
    setIsCharged(true);
    setPlayerEffect('charge');
    showDamagePopup('player', '⚡ CHARGED!', 'text-amber-300 font-bold');

    setPlayerFighter((prev) => prev ? { ...prev, sp: Math.min(100, prev.sp + 35) } : null);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `⚡ ${playerFighter.name} gathered Digital Soul energy! Attack power amplified!`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerEffect('none');
    }, 1000);
  };

  const handleClaimVictory = () => {
    sound.playEvolution();
    onBattleEnd(true, 100, 30);
    setMatchState('lobby');
    setPlayerFighter(null);
    setOpponentFighter(null);
    onClose();
  };

  const handleClaimDefeat = () => {
    sound.playButton();
    onBattleEnd(false, 25, 8);
    setMatchState('lobby');
    setPlayerFighter(null);
    setOpponentFighter(null);
    onClose();
  };

  const handleRematch = () => {
    sound.playButton();
    onBattleEnd(matchState === 'victory', matchState === 'victory' ? 100 : 25, matchState === 'victory' ? 30 : 8);
    setMatchState('lobby');
    setPlayerFighter(null);
    setOpponentFighter(null);
    setBattleLogs([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-chakra font-bold text-white text-lg">
                ONLINE DIGITAL COLOSSEUM
              </h3>
              <p className="text-slate-400 text-xs">Battle Real-Time Tamers Across the Digital World</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOBBY STATE */}
        {matchState === 'lobby' && (
          <div className="py-6 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-pixel text-[10px] border border-emerald-500/30 mb-2">
                <Globe className="w-3.5 h-3.5" />
                <span>SERVER STATUS: ONLINE (1,429 TAMERS READY)</span>
              </div>
              <h4 className="font-chakra font-bold text-white text-xl">CHOOSE YOUR BATTLE FORMAT</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quick Ranked Match */}
              <div
                onClick={handleStartQuickMatch}
                className="p-5 bg-gradient-to-br from-indigo-950/80 to-slate-900 border-2 border-indigo-500/40 hover:border-indigo-400 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl mb-3">
                    ⚔️
                  </div>
                  <h5 className="font-chakra font-bold text-white text-lg">QUICK MATCH</h5>
                  <p className="text-slate-400 text-xs mt-1">
                    Instantly pair against an evenly matched rival DigiDestined at your current evolution stage.
                  </p>
                </div>
                <button className="mt-4 w-full bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-pixel text-xs py-2.5 rounded-xl font-bold">
                  FIND OPPONENT
                </button>
              </div>

              {/* Private Room PvP */}
              <div
                onClick={handleHostRoom}
                className="p-5 bg-gradient-to-br from-cyan-950/80 to-slate-900 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl mb-3">
                    📟
                  </div>
                  <h5 className="font-chakra font-bold text-white text-lg">CREATE BATTLE ROOM</h5>
                  <p className="text-slate-400 text-xs mt-1">
                    Generate a 4-digit Digivice code to challenge a friend or rival directly.
                  </p>
                </div>
                <button className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-pixel text-xs py-2.5 rounded-xl font-bold">
                  HOST 4-DIGIT ROOM
                </button>
              </div>
            </div>

            {onOpenAdventure && (
              <div
                onClick={() => {
                  sound.playButton();
                  onOpenAdventure();
                }}
                className="p-4 bg-gradient-to-r from-emerald-950/90 to-slate-900 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Compass className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-chakra font-bold text-white text-base">
                      WORLD ADVENTURE MODE
                    </h5>
                    <p className="text-slate-300 text-xs truncate">
                      7 Biomes · Rookie to Mega Waves · Farm Strength EXP & Items
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-chakra text-xs font-bold rounded-xl shrink-0 cursor-pointer whitespace-nowrap">
                  Enter Adventure
                </button>
              </div>
            )}
          </div>
        )}

        {/* MATCHING STATE */}
        {matchState === 'matching' && (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent mb-4"
            />
            <h4 className="font-chakra font-bold text-white text-xl">
              CONNECTING TO DIGITAL NETWORK...
            </h4>
            <p className="text-slate-400 text-xs mt-1">
              {roomCode ? `ROOM CODE: #${roomCode} (Waiting for rival)` : 'Searching for rival Tamer...'}
            </p>
          </div>
        )}

        {/* BATTLING STATE */}
        {matchState === 'battling' && playerFighter && opponentFighter && (
          <div className="flex flex-col space-y-4 py-2">
            {/* Arena Battle Stage */}
            <div className={`relative w-full h-56 sm:h-64 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 rounded-2xl border-2 border-slate-700 p-4 flex justify-between items-center overflow-hidden scanlines transition-transform ${arenaShake ? 'battle-arena-shake' : ''}`}>
              {/* Screen Impact Flash Layer */}
              {screenFlash !== 'none' && (
                <div
                  className={`absolute inset-0 pointer-events-none z-30 ${
                    screenFlash === 'white'
                      ? 'battle-flash-white'
                      : screenFlash === 'red'
                      ? 'battle-flash-red'
                      : 'battle-flash-special'
                  }`}
                />
              )}

              {/* Turn Banner */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/90 border border-slate-700 rounded-full font-pixel text-[9px] text-amber-300 z-20 shadow-md">
                {isPlayerTurn ? "YOUR TURN - CHOOSE MOVE!" : `${opponentFighter.name.toUpperCase()} IS ATTACKING...`}
              </div>

              {/* Player Fighter Side (Left) */}
              <div className="flex flex-col items-center z-10 relative">
                {/* Health & SP Bar */}
                <div className="w-28 sm:w-36 bg-slate-950/90 border border-cyan-500/40 rounded-xl p-2 mb-2 font-pixel text-[9px]">
                  <div className="flex justify-between text-cyan-300 font-bold mb-1">
                    <span className="truncate">{playerFighter.name}</span>
                    <span>{playerFighter.currentHp}/{playerFighter.maxHp}</span>
                  </div>
                  {/* HP bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${(playerFighter.currentHp / playerFighter.maxHp) * 100}%` }}
                    />
                  </div>
                  {/* SP bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${playerFighter.sp}%` }}
                    />
                  </div>
                </div>

                {/* Animated Sprite Box (Lunge forward on attack, shake on hit) */}
                <div className={`relative flex items-center justify-center ${
                  playerEffect === 'lunge' ? 'battle-lunge-right' :
                  playerEffect === 'hit' ? 'battle-shake-hit' : ''
                }`}>
                  <DigimonSprite
                    species={DIGIMON_DATABASE[playerFighter.speciesId]}
                    action={playerActionAnim}
                    facing="right"
                    scale={1.0}
                  />

                  {/* Active Shield Barrier Aura */}
                  {(isDefending || playerEffect === 'shield') && (
                    <div className="absolute inset-0 -m-3 rounded-full border-2 border-cyan-400 bg-cyan-400/20 battle-shield-aura pointer-events-none z-20 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-cyan-300 opacity-90 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    </div>
                  )}

                  {/* Active Digital Soul Charged Aura */}
                  {(isCharged || playerEffect === 'charge') && (
                    <div className="absolute inset-0 -m-3 rounded-full border-2 border-amber-400 bg-amber-400/20 battle-charge-aura pointer-events-none z-20 flex items-center justify-center">
                      <Zap className="w-7 h-7 text-amber-300 opacity-95 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
                    </div>
                  )}

                  {/* Floating Damage & Status Popups */}
                  {damagePopups.filter((p) => p.target === 'player').map((p) => (
                    <div
                      key={p.id}
                      className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none z-40 battle-damage-float ${p.color}`}
                    >
                      {p.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* VS Crest in Center */}
              <div className="flex flex-col items-center opacity-40">
                <span className="font-pixel text-2xl text-slate-400 font-bold">VS</span>
              </div>

              {/* Opponent Fighter Side (Right) */}
              <div className="flex flex-col items-center z-10 relative">
                {/* Health & SP Bar */}
                <div className="w-28 sm:w-36 bg-slate-950/90 border border-rose-500/40 rounded-xl p-2 mb-2 font-pixel text-[9px]">
                  <div className="flex justify-between text-rose-300 font-bold mb-1">
                    <span className="truncate">{opponentFighter.name}</span>
                    <span>{opponentFighter.currentHp}/{opponentFighter.maxHp}</span>
                  </div>
                  {/* HP bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 transition-all duration-300"
                      style={{ width: `${(opponentFighter.currentHp / opponentFighter.maxHp) * 100}%` }}
                    />
                  </div>
                  {/* SP bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${opponentFighter.sp}%` }}
                    />
                  </div>
                </div>

                {/* Animated Sprite Box (Lunge forward on attack, shake on hit) */}
                <div className={`relative flex items-center justify-center ${
                  opponentEffect === 'lunge' ? 'battle-lunge-left' :
                  opponentEffect === 'hit' ? 'battle-shake-hit' : ''
                }`}>
                  <DigimonSprite
                    species={DIGIMON_DATABASE[opponentFighter.speciesId]}
                    action={opponentActionAnim}
                    facing="left"
                    scale={1.0}
                  />

                  {/* Floating Damage & Status Popups */}
                  {damagePopups.filter((p) => p.target === 'opponent').map((p) => (
                    <div
                      key={p.id}
                      className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none z-40 battle-damage-float ${p.color}`}
                    >
                      {p.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Battle Actions Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                disabled={!isPlayerTurn}
                onClick={handlePlayerAttack}
                className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-pixel text-[10px] text-white active:scale-95 transition-all"
              >
                <span className="text-xl mb-1">⚔️</span>
                <span>ATTACK</span>
                <span className="text-[8px] text-slate-400 mt-0.5">+20 SP</span>
              </button>

              <button
                disabled={!isPlayerTurn || playerFighter.sp < 50}
                onClick={handlePlayerSpecial}
                className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-slate-950 border border-amber-300 rounded-xl flex flex-col items-center justify-center font-pixel text-[10px] font-bold active:scale-95 transition-all"
              >
                <Flame className="w-5 h-5 mb-1 fill-slate-950" />
                <span className="truncate max-w-[110px]">{playerFighter.signatureMove.name.split(' ')[0]}</span>
                <span className="text-[8px] opacity-80 mt-0.5">50 SP COST</span>
              </button>

              <button
                disabled={!isPlayerTurn}
                onClick={handlePlayerDefend}
                className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-pixel text-[10px] text-white active:scale-95 transition-all"
              >
                <Shield className="w-5 h-5 mb-1 text-cyan-400" />
                <span>SHIELD</span>
                <span className="text-[8px] text-slate-400 mt-0.5">-60% DMG</span>
              </button>

              <button
                disabled={!isPlayerTurn}
                onClick={handlePlayerCharge}
                className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-pixel text-[10px] text-white active:scale-95 transition-all"
              >
                <Zap className="w-5 h-5 mb-1 text-amber-400" />
                <span>CHARGE</span>
                <span className="text-[8px] text-slate-400 mt-0.5">+35 SP & BOOST</span>
              </button>
            </div>

            {/* Combat Log */}
            <div className="h-24 bg-slate-950 border border-slate-800 rounded-xl p-2.5 overflow-y-auto font-chakra text-xs space-y-1">
              {battleLogs.map((log) => (
                <div
                  key={log.id}
                  className={`${
                    log.type === 'special'
                      ? 'text-amber-400 font-bold'
                      : log.type === 'damage'
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VICTORY STATE */}
        {matchState === 'victory' && (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <Trophy className="w-16 h-16 text-amber-400 mb-2 animate-bounce" />
            <h4 className="font-chakra font-bold text-white text-3xl">VICTORY ACHIEVED!</h4>
            <p className="text-slate-300 text-sm mt-1 max-w-sm">
              Your Digimon fought heroically and earned triumphant glory in the Online Colosseum!
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 my-5 flex items-center justify-center gap-6 font-pixel text-xs">
              <span className="text-amber-400">🪙 +100 BITS</span>
              <span className="text-cyan-400">⚡ +30 DP POWER</span>
              <span className="text-emerald-400">★ +1 BATTLE WIN</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRematch}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-pixel text-xs px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                <span>⚔️</span>
                <span>BATTLE ANOTHER RIVAL</span>
              </button>
              <button
                onClick={handleClaimVictory}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-amber-500/40"
              >
                CLAIM SPOILS & RETURN
              </button>
            </div>
          </div>
        )}

        {/* DEFEAT STATE */}
        {matchState === 'defeat' && (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <span className="text-5xl mb-2">💔</span>
            <h4 className="font-chakra font-bold text-white text-3xl">DEFEATED IN COMBAT</h4>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              Do not lose heart! Feed Big Meat, give vitamins to recover, and train at the punching bag!
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 my-5 flex items-center justify-center gap-4 font-pixel text-xs text-slate-400">
              <span>🪙 +20 Consolation Bits</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRematch}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-pixel text-xs px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>TRY ANOTHER BATTLE</span>
              </button>
              <button
                onClick={handleClaimDefeat}
                className="bg-slate-700 hover:bg-slate-600 text-white font-pixel text-xs px-6 py-3.5 rounded-xl font-bold"
              >
                RETURN & HEAL
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
