import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetState, DigimonSpecies, BattleFighter, BattleLogEntry } from '../types/digimon';
import { DIGIMON_DATABASE } from '../data/digidex';
import { DigimonSprite } from './DigimonSprite';
import { sound } from '../utils/audio';
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
  Sparkles
} from 'lucide-react';

interface ColosseumBattleProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onBattleEnd: (won: boolean, coinsReward: number, dpReward: number) => void;
}

export const ColosseumBattle: React.FC<ColosseumBattleProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onBattleEnd,
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
      crest: pet.eggId ? (pet.eggId.replace('egg-', '') as any) : 'courage',
      currentHp: baseHp,
      maxHp: baseHp,
      sp: 30,
      atk,
      def,
      spd: species.baseSpd,
      signatureMove: species.signatureMove,
      isPlayer: true,
    };

    // Determine an evenly matched opponent
    const opponentKeys = Object.keys(DIGIMON_DATABASE).filter(
      (k) => DIGIMON_DATABASE[k].stage === pet.stage && k !== species.id
    );
    const oppId = oppSpeciesId || (opponentKeys.length > 0 ? opponentKeys[Math.floor(Math.random() * opponentKeys.length)] : 'greymon');
    const oppSpecies = DIGIMON_DATABASE[oppId] || DIGIMON_DATABASE['agumon'];

    const oppHp = oppSpecies.baseHp + Math.floor(Math.random() * 20);
    const opponent: BattleFighter = {
      id: 'opponent-fighter',
      name: oppSpecies.name,
      speciesId: oppSpecies.id,
      stage: oppSpecies.stage,
      crest: oppSpecies.crest,
      currentHp: oppHp,
      maxHp: oppHp,
      sp: 25,
      atk: oppSpecies.baseAtk,
      def: oppSpecies.baseDef,
      spd: oppSpecies.baseSpd,
      signatureMove: oppSpecies.signatureMove,
      isPlayer: false,
    };

    setPlayerFighter(player);
    setOpponentFighter(opponent);
    setBattleLogs([
      {
        id: 'start-1',
        text: `⚔️ Online Colosseum Match Started! ${player.name} VS ${opponent.name}!`,
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
      const shouldUseSpecial = canUseSpecial && Math.random() < 0.7;

      if (shouldUseSpecial) {
        // Special move
        sound.playBlast();
        setOpponentActionAnim('attack');
        const rawDamage = Math.max(15, Math.floor(opponentFighter.signatureMove.power * 0.9 - (isDefending ? playerFighter.def * 0.8 : playerFighter.def * 0.4)));
        const finalDamage = isDefending ? Math.floor(rawDamage * 0.4) : rawDamage;

        setOpponentFighter((prev) => prev ? { ...prev, sp: prev.sp - 50 } : null);
        setPlayerFighter((prev) => {
          if (!prev) return null;
          const nextHp = Math.max(0, prev.currentHp - finalDamage);
          return { ...prev, currentHp: nextHp };
        });

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
        setOpponentActionAnim('attack');
        const rawDamage = Math.max(10, Math.floor(opponentFighter.atk * 0.8 - (isDefending ? playerFighter.def * 0.7 : playerFighter.def * 0.3)));
        const finalDamage = isDefending ? Math.floor(rawDamage * 0.4) : rawDamage;

        setOpponentFighter((prev) => prev ? { ...prev, sp: Math.min(100, prev.sp + 15) } : null);
        setPlayerFighter((prev) => {
          if (!prev) return null;
          const nextHp = Math.max(0, prev.currentHp - finalDamage);
          return { ...prev, currentHp: nextHp };
        });

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
        setIsPlayerTurn(true);
      }, 700);
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
    setPlayerActionAnim('attack');

    const mult = isCharged ? 1.5 : 1.0;
    const damage = Math.max(12, Math.floor((playerFighter.atk * 0.85 * mult) - (opponentFighter.def * 0.35)));

    setPlayerFighter((prev) => prev ? { ...prev, sp: Math.min(100, prev.sp + 20) } : null);
    setIsCharged(false);

    setOpponentFighter((prev) => {
      if (!prev) return null;
      const nextHp = Math.max(0, prev.currentHp - damage);
      return { ...prev, currentHp: nextHp };
    });

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
    }, 700);
  };

  const handlePlayerSpecial = () => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter || playerFighter.sp < 50) return;
    setIsPlayerTurn(false);
    sound.playBlast();
    setPlayerActionAnim('attack');

    const mult = isCharged ? 1.6 : 1.2;
    const damage = Math.max(25, Math.floor((playerFighter.signatureMove.power * mult) - (opponentFighter.def * 0.4)));

    setPlayerFighter((prev) => prev ? { ...prev, sp: prev.sp - 50 } : null);
    setIsCharged(false);

    setOpponentFighter((prev) => {
      if (!prev) return null;
      const nextHp = Math.max(0, prev.currentHp - damage);
      return { ...prev, currentHp: nextHp };
    });

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
    }, 700);
  };

  const handlePlayerDefend = () => {
    if (!isPlayerTurn || !playerFighter) return;
    setIsPlayerTurn(false);
    sound.playButton();
    setIsDefending(true);

    setPlayerFighter((prev) => prev ? { ...prev, sp: Math.min(100, prev.sp + 10) } : null);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `🛡️ ${playerFighter.name} raised a Digi-Shield! Incoming damage drastically reduced!`,
        type: 'action',
      },
      ...logs,
    ]);
  };

  const handlePlayerCharge = () => {
    if (!isPlayerTurn || !playerFighter) return;
    setIsPlayerTurn(false);
    sound.playMedicine();
    setIsCharged(true);

    setPlayerFighter((prev) => prev ? { ...prev, sp: Math.min(100, prev.sp + 35) } : null);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `⚡ ${playerFighter.name} gathered Digital Soul energy! Attack power amplified!`,
        type: 'action',
      },
      ...logs,
    ]);
  };

  const handleClaimVictory = () => {
    sound.playEvolution();
    onBattleEnd(true, 80, 25);
    setMatchState('lobby');
    setPlayerFighter(null);
    setOpponentFighter(null);
    onClose();
  };

  const handleClaimDefeat = () => {
    sound.playButton();
    onBattleEnd(false, 20, 5);
    setMatchState('lobby');
    setPlayerFighter(null);
    setOpponentFighter(null);
    onClose();
  };

  const handleRematch = () => {
    sound.playButton();
    onBattleEnd(matchState === 'victory', matchState === 'victory' ? 80 : 20, matchState === 'victory' ? 25 : 5);
    setMatchState('lobby');
    setPlayerFighter(null);
    setOpponentFighter(null);
    setBattleLogs([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md">
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
            <div className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 rounded-2xl border-2 border-slate-700 p-4 flex justify-between items-center overflow-hidden scanlines">
              {/* Turn Banner */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/90 border border-slate-700 rounded-full font-pixel text-[9px] text-amber-300 z-10">
                {isPlayerTurn ? "YOUR TURN - CHOOSE MOVE!" : `${opponentFighter.name.toUpperCase()} IS ATTACKING...`}
              </div>

              {/* Player Fighter Side (Left) */}
              <div className="flex flex-col items-center z-10">
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

                <DigimonSprite
                  species={DIGIMON_DATABASE[playerFighter.speciesId]}
                  action={playerActionAnim}
                  facing="right"
                  scale={1.0}
                />
              </div>

              {/* VS Crest in Center */}
              <div className="flex flex-col items-center opacity-40">
                <span className="font-pixel text-2xl text-slate-400 font-bold">VS</span>
              </div>

              {/* Opponent Fighter Side (Right) */}
              <div className="flex flex-col items-center z-10">
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

                <DigimonSprite
                  species={DIGIMON_DATABASE[opponentFighter.speciesId]}
                  action={opponentActionAnim}
                  facing="left"
                  scale={1.0}
                />
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
              <span className="text-amber-400">🪙 +80 BITS</span>
              <span className="text-cyan-400">⚡ +25 DP POWER</span>
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
