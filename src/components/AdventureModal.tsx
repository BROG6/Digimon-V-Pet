import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdventureBattleResult,
  AdventureWave,
  AdventureZone,
  BattleFighter,
  BattleLogEntry,
  BattleMove,
  DigimonSpecies,
  PetState,
} from '../types/digimon';
import { ADVENTURE_ZONES } from '../data/adventureZones';
import { DIGIMON_DATABASE, SPECIAL_ITEMS } from '../data/digidex';
import {
  ATTACK_ELEMENT_META,
  getEffectiveBattleStats,
  getElementDamageMultiplier,
  getEquippedBattleMoves,
  getSpeciesElementType,
  mapMoveTypeToElement,
} from '../data/battleTechniques';
import { DigimonSprite } from './DigimonSprite';
import { PixelMeatIcon, PixelVitaminIcon } from './PixelItemIcons';
import { sound, triggerHaptic } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Flame,
  Lock,
  Shield,
  Swords,
  Trophy,
  X,
  Zap,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface AdventureModalProps {
  pet: PetState;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
  onAdventureComplete: (result: AdventureBattleResult) => void;
}

type ScreenView = 'zones' | 'trail' | 'battling' | 'victory' | 'defeat';

const STAGE_STYLES: Record<AdventureWave['stageLabel'], string> = {
  Rookie: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60',
  Champion: 'text-sky-300 border-sky-500/40 bg-sky-950/60',
  Ultimate: 'text-amber-300 border-amber-500/40 bg-amber-950/60',
  Mega: 'text-rose-300 border-rose-500/40 bg-rose-950/60',
};

export const AdventureModal: React.FC<AdventureModalProps> = ({
  pet,
  species,
  isOpen,
  onClose,
  onAdventureComplete,
}) => {
  const [view, setView] = useState<ScreenView>('zones');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(ADVENTURE_ZONES[0].id);
  const [activeWave, setActiveWave] = useState<AdventureWave | null>(null);

  // Combat State
  const [playerFighter, setPlayerFighter] = useState<BattleFighter | null>(null);
  const [opponentFighter, setOpponentFighter] = useState<BattleFighter | null>(null);
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [playerActionAnim, setPlayerActionAnim] = useState<'idle' | 'attack' | 'happy' | 'sick'>('idle');
  const [opponentActionAnim, setOpponentActionAnim] = useState<'idle' | 'attack' | 'happy' | 'sick'>('idle');
  const [isDefending, setIsDefending] = useState<boolean>(false);
  const [isCharged, setIsCharged] = useState<boolean>(false);

  // Animations & Popups
  const [playerEffect, setPlayerEffect] = useState<'none' | 'lunge' | 'hit' | 'shield' | 'charge'>('none');
  const [opponentEffect, setOpponentEffect] = useState<'none' | 'lunge' | 'hit'>('none');
  const [arenaShake, setArenaShake] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<'none' | 'white' | 'red' | 'special'>('none');
  const [damagePopups, setDamagePopups] = useState<{ id: number; target: 'player' | 'opponent'; text: string; color: string }[]>([]);

  // Field supplies used in the current encounter
  const [meatUsed, setMeatUsed] = useState<number>(0);
  const [vitaminsUsed, setVitaminsUsed] = useState<number>(0);
  const [lastResult, setLastResult] = useState<AdventureBattleResult | null>(null);
  const completionReportedRef = useRef<boolean>(false);

  const clearedMap = pet.adventureClearedWave || {};
  const selectedZone: AdventureZone = useMemo(
    () => ADVENTURE_ZONES.find((z) => z.id === selectedZoneId) || ADVENTURE_ZONES[0],
    [selectedZoneId]
  );

  const totalClearedWaves = useMemo(
    () => ADVENTURE_ZONES.reduce((acc, z) => acc + Math.min(z.waves.length, clearedMap[z.id] ?? 0), 0),
    [clearedMap]
  );
  const totalPossibleWaves = ADVENTURE_ZONES.reduce((acc, z) => acc + z.waves.length, 0);

  const remainingMeat = Math.max(0, pet.bigMeatStock - meatUsed);
  const remainingVitamins = Math.max(0, pet.vitaminStock - vitaminsUsed);

  // Reset modal view when opened
  useEffect(() => {
    if (isOpen) {
      setView('zones');
      setActiveWave(null);
      setPlayerFighter(null);
      setOpponentFighter(null);
      setBattleLogs([]);
      setIsPlayerTurn(true);
      setIsDefending(false);
      setIsCharged(false);
      setPlayerEffect('none');
      setOpponentEffect('none');
      setArenaShake(false);
      setScreenFlash('none');
      setDamagePopups([]);
      setMeatUsed(0);
      setVitaminsUsed(0);
      setLastResult(null);
      completionReportedRef.current = false;
    }
  }, [isOpen]);

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

  const estimateOpponentStats = (wave: AdventureWave) => {
    const oppSpecies = DIGIMON_DATABASE[wave.speciesId] || DIGIMON_DATABASE['agumon'];
    const mult = wave.statMultiplier;
    return {
      oppSpecies,
      hp: Math.round(oppSpecies.baseHp * mult),
      atk: Math.round(oppSpecies.baseAtk * mult),
      def: Math.round(oppSpecies.baseDef * mult),
      spd: Math.round(oppSpecies.baseSpd * (0.9 + (mult - 0.8) * 0.4)),
    };
  };

  const startWaveBattle = (zone: AdventureZone, wave: AdventureWave) => {
    if (!species || pet.stage === 'egg') return;

    sound.playButton();
    triggerHaptic('medium');

    const stats = getEffectiveBattleStats(pet, species);
    const equippedMoves = getEquippedBattleMoves(pet, species);
    const playerEl = getSpeciesElementType(species);

    const player: BattleFighter = {
      id: 'adv-player',
      name: pet.nickname || species.name,
      speciesId: species.id,
      stage: pet.stage,
      crest: species.crest || 'courage',
      element: playerEl,
      currentHp: stats.maxHp,
      maxHp: stats.maxHp,
      mp: stats.maxMp,
      maxMp: stats.maxMp,
      sp: 35,
      atk: stats.offense,
      def: stats.defense,
      spd: stats.speed,
      brains: stats.brains,
      signatureMove: species.signatureMove,
      equippedMoves,
      isPlayer: true,
    };

    const { oppSpecies, hp, atk: oppAtk, def: oppDef, spd } = estimateOpponentStats(wave);
    const oppEl = getSpeciesElementType(oppSpecies);
    const opponent: BattleFighter = {
      id: `adv-opp-${wave.waveNumber}`,
      name: oppSpecies.name,
      speciesId: oppSpecies.id,
      stage: oppSpecies.stage,
      crest: oppSpecies.crest,
      element: oppEl,
      currentHp: hp,
      maxHp: hp,
      mp: 60,
      maxMp: 60,
      sp: wave.waveNumber >= 4 ? 30 : 15,
      atk: oppAtk,
      def: oppDef,
      spd,
      signatureMove: oppSpecies.signatureMove,
      isPlayer: false,
    };

    completionReportedRef.current = false;
    setSelectedZoneId(zone.id);
    setActiveWave(wave);
    setPlayerFighter(player);
    setOpponentFighter(opponent);
    setIsPlayerTurn(true);
    setIsDefending(false);
    setIsCharged(false);
    setPlayerActionAnim('idle');
    setOpponentActionAnim('idle');
    setPlayerEffect('none');
    setOpponentEffect('none');
    setDamagePopups([]);
    setMeatUsed(0);
    setVitaminsUsed(0);
    setLastResult(null);
    setBattleLogs([
      {
        id: 'adv-start',
        text: `${zone.name} · Wave ${wave.waveNumber}: ${wave.bossFlavor}`,
        type: 'action',
      },
    ]);
    setView('battling');
  };

  // Enemy Turn Loop
  useEffect(() => {
    if (view !== 'battling' || isPlayerTurn || !opponentFighter || !playerFighter || !activeWave) return;

    const timer = setTimeout(() => {
      const canUseSpecial = opponentFighter.sp >= 50;
      const specialChance = activeWave.waveNumber >= 5 ? 0.65 : 0.48;
      const shouldUseSpecial = canUseSpecial && Math.random() < specialChance;
      const oppSpecies = DIGIMON_DATABASE[opponentFighter.speciesId];

      if (shouldUseSpecial) {
        sound.playBlast();
        triggerHaptic('heavy');
        setOpponentActionAnim('attack');
        setOpponentEffect('lunge');

        const moveEl = mapMoveTypeToElement(opponentFighter.signatureMove, oppSpecies);
        const typeMult = getElementDamageMultiplier(moveEl, playerFighter.element || 'neutral');
        const movePower = Math.round(opponentFighter.signatureMove.power * (0.64 + activeWave.statMultiplier * 0.18));
        const rawDamage = Math.max(
          7,
          Math.floor((movePower - (isDefending ? playerFighter.def * 0.8 : playerFighter.def * 0.36)) * typeMult)
        );
        const finalDamage = isDefending ? Math.max(3, Math.floor(rawDamage * 0.4)) : rawDamage;

        setOpponentFighter((prev) => (prev ? { ...prev, sp: prev.sp - 50 } : null));

        setTimeout(() => {
          setPlayerEffect('hit');
          triggerScreenFlash('special');
          triggerArenaShake();
          showDamagePopup(
            'player',
            `${typeMult > 1 ? '1.5x ' : ''}-${finalDamage}!`,
            isDefending ? 'text-cyan-300' : 'text-rose-400 font-extrabold'
          );
          setPlayerFighter((prev) =>
            prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - finalDamage) } : null
          );
        }, 180);

        setBattleLogs((logs) => [
          {
            id: `opp-${Date.now()}`,
            text: `${opponentFighter.name} fired ${opponentFighter.signatureMove.name} (${ATTACK_ELEMENT_META[moveEl].label}) for ${finalDamage} damage${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
            type: 'special',
          },
          ...logs,
        ]);
      } else {
        sound.playPunch();
        triggerHaptic('medium');
        setOpponentActionAnim('attack');
        setOpponentEffect('lunge');

        const oppEl = opponentFighter.element || 'neutral';
        const typeMult = getElementDamageMultiplier(oppEl, playerFighter.element || 'neutral');
        const rawDamage = Math.max(
          5,
          Math.floor((opponentFighter.atk * 0.64 - (isDefending ? playerFighter.def * 0.7 : playerFighter.def * 0.32)) * typeMult)
        );
        const finalDamage = isDefending ? Math.max(2, Math.floor(rawDamage * 0.4)) : rawDamage;

        setOpponentFighter((prev) => (prev ? { ...prev, sp: Math.min(100, prev.sp + 18) } : null));

        setTimeout(() => {
          setPlayerEffect('hit');
          triggerScreenFlash('red');
          triggerArenaShake();
          showDamagePopup(
            'player',
            `${typeMult > 1 ? '1.5x ' : ''}-${finalDamage}`,
            isDefending ? 'text-cyan-300' : 'text-rose-400 font-bold'
          );
          setPlayerFighter((prev) =>
            prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - finalDamage) } : null
          );
        }, 160);

        setBattleLogs((logs) => [
          {
            id: `opp-${Date.now()}`,
            text: `${opponentFighter.name} attacked for ${finalDamage} damage${typeMult > 1 ? ' [1.5x ADV]' : ''}.`,
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
      }, 720);
    }, 1050);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, view, opponentFighter, playerFighter, isDefending, activeWave]);

  // Detect Battle Completion & Immediately Persist Rewards
  useEffect(() => {
    if (view !== 'battling' || !playerFighter || !opponentFighter || !activeWave) return;
    if (completionReportedRef.current) return;

    if (opponentFighter.currentHp <= 0) {
      completionReportedRef.current = true;
      sound.playVictory();
      try {
        confetti({ particleCount: 95, spread: 75, origin: { y: 0.6 } });
      } catch {}

      const prevCleared = clearedMap[selectedZone.id] ?? 0;
      const isFirstClearOfWave = activeWave.waveNumber > prevCleared;
      const isBossWave = activeWave.waveNumber === selectedZone.waves.length;
      const ownedRelics = pet.ownedSpecialItems || [];
      const unlockedRelicId =
        isBossWave &&
        selectedZone.firstClearRelicId &&
        !ownedRelics.includes(selectedZone.firstClearRelicId)
          ? selectedZone.firstClearRelicId
          : undefined;

      // Net Ocean Boss special supply bonus if no Crest relic attached
      const supplyCacheBonusBits = isBossWave && isFirstClearOfWave && !selectedZone.firstClearRelicId ? 200 : 0;
      const supplyCacheBonusMeat = isBossWave && isFirstClearOfWave && !selectedZone.firstClearRelicId ? 3 : 0;
      const supplyCacheBonusVit = isBossWave && isFirstClearOfWave && !selectedZone.firstClearRelicId ? 2 : 0;

      const result: AdventureBattleResult = {
        zoneId: selectedZone.id,
        waveNumber: activeWave.waveNumber,
        won: true,
        strengthGained: activeWave.strengthReward + (isFirstClearOfWave ? 2 : 0),
        dpGained: activeWave.dpReward + (isFirstClearOfWave ? 5 : 0),
        effortGained: activeWave.effortReward,
        bitsGained: activeWave.bitsReward + supplyCacheBonusBits + (isFirstClearOfWave ? 20 : 0),
        meatGained: activeWave.meatDrop + supplyCacheBonusMeat,
        vitaminsGained: activeWave.vitaminDrop + supplyCacheBonusVit,
        unlockedRelicId,
        meatUsed,
        vitaminsUsed,
        isFirstClearOfWave,
      };

      setLastResult(result);
      onAdventureComplete(result);
      setView('victory');
    } else if (playerFighter.currentHp <= 0) {
      completionReportedRef.current = true;
      const result: AdventureBattleResult = {
        zoneId: selectedZone.id,
        waveNumber: activeWave.waveNumber,
        won: false,
        strengthGained: 2,
        dpGained: 5,
        effortGained: 1,
        bitsGained: 15,
        meatGained: 0,
        vitaminsGained: 0,
        meatUsed,
        vitaminsUsed,
        isFirstClearOfWave: false,
      };

      setLastResult(result);
      onAdventureComplete(result);
      setView('defeat');
    }
  }, [
    playerFighter?.currentHp,
    opponentFighter?.currentHp,
    view,
    activeWave,
    selectedZone,
    clearedMap,
    pet.ownedSpecialItems,
    meatUsed,
    vitaminsUsed,
    onAdventureComplete,
  ]);

  // Player Combat Actions
  const handlePlayerAttack = () => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter) return;
    setIsPlayerTurn(false);
    sound.playPunch();
    triggerHaptic('medium');
    setPlayerActionAnim('attack');
    setPlayerEffect('lunge');

    const chargeMult = isCharged ? 1.6 : 1.0;
    const typeMult = getElementDamageMultiplier(
      playerFighter.element || 'neutral',
      opponentFighter.element || 'neutral'
    );
    const damage = Math.max(
      14,
      Math.floor((playerFighter.atk * 0.96 * chargeMult - opponentFighter.def * 0.26) * typeMult)
    );

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            sp: Math.min(100, prev.sp + 20),
            mp: Math.min(prev.maxMp || 100, (prev.mp || 0) + 8),
          }
        : null
    );
    setIsCharged(false);

    setTimeout(() => {
      setOpponentEffect('hit');
      triggerScreenFlash('white');
      triggerArenaShake();
      showDamagePopup(
        'opponent',
        `${typeMult > 1 ? '1.5x ADV! ' : ''}-${damage}`,
        typeMult > 1 ? 'text-emerald-300 font-extrabold' : 'text-amber-300 font-bold'
      );
      setOpponentFighter((prev) =>
        prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - damage) } : null
      );
    }, 160);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `${playerFighter.name} struck ${opponentFighter.name} for ${damage} damage (+8 MP)${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
        type: 'damage',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
    }, 680);
  };

  const handlePlayerSpecial = () => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter || playerFighter.sp < 50) return;
    setIsPlayerTurn(false);
    sound.playBlast();
    triggerHaptic('heavy');
    setPlayerActionAnim('attack');
    setPlayerEffect('lunge');

    const moveEl = mapMoveTypeToElement(playerFighter.signatureMove, species);
    const typeMult = getElementDamageMultiplier(moveEl, opponentFighter.element || 'neutral');
    const mult = isCharged ? 1.65 : 1.25;
    const brainsBonus = Math.floor((playerFighter.brains || 20) * 0.14);
    const damage = Math.max(
      26,
      Math.floor((playerFighter.signatureMove.power * mult + playerFighter.atk * 0.35 + brainsBonus - opponentFighter.def * 0.35) * typeMult)
    );

    setPlayerFighter((prev) => (prev ? { ...prev, sp: prev.sp - 50 } : null));
    setIsCharged(false);

    setTimeout(() => {
      setOpponentEffect('hit');
      triggerScreenFlash('special');
      triggerArenaShake();
      showDamagePopup(
        'opponent',
        `${typeMult > 1 ? '1.5x ADV! ' : ''}-${damage}!`,
        typeMult > 1 ? 'text-emerald-300 font-extrabold' : 'text-orange-400 font-extrabold'
      );
      setOpponentFighter((prev) =>
        prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - damage) } : null
      );
    }, 180);

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `${playerFighter.name} unleashed ${playerFighter.signatureMove.name} (${ATTACK_ELEMENT_META[moveEl].label}) for ${damage} damage${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
        type: 'special',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
    }, 760);
  };

  const handleUseLearnedTechnique = (move: BattleMove) => {
    if (!isPlayerTurn || !playerFighter || !opponentFighter) return;
    const currentMp = playerFighter.mp ?? 0;
    if (currentMp < move.mpCost) return;

    setIsPlayerTurn(false);
    if (move.soundType === 'punch') sound.playPunch();
    else sound.playBlast();
    triggerHaptic('heavy');
    setPlayerActionAnim('attack');
    setPlayerEffect('lunge');

    const typeMult = getElementDamageMultiplier(move.element, opponentFighter.element || 'neutral');
    const chargeMult = isCharged ? 1.55 : 1.0;
    const brainsBonus = Math.floor((playerFighter.brains || 20) * 0.16);
    const damage = Math.max(
      18,
      Math.floor((move.power * 1.15 * chargeMult + playerFighter.atk * 0.42 + brainsBonus - opponentFighter.def * 0.25) * typeMult)
    );

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            mp: Math.max(0, (prev.mp ?? 0) - move.mpCost),
            sp: Math.min(100, prev.sp + 15),
          }
        : null
    );
    setIsCharged(false);

    setTimeout(() => {
      setOpponentEffect('hit');
      triggerScreenFlash(typeMult > 1 ? 'special' : 'white');
      triggerArenaShake();
      showDamagePopup(
        'opponent',
        `${typeMult > 1 ? '1.5x ADV! ' : ''}-${damage}!`,
        typeMult > 1 ? 'text-emerald-300 font-extrabold' : 'text-cyan-300 font-bold'
      );
      setOpponentFighter((prev) =>
        prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - damage) } : null
      );
    }, 170);

    setBattleLogs((logs) => [
      {
        id: `pl-tech-${Date.now()}`,
        text: `${playerFighter.name} cast ${move.name} (${ATTACK_ELEMENT_META[move.element].label}, -${move.mpCost} MP) for ${damage} damage${typeMult > 1 ? ' [1.5x ADV!]' : ''}!`,
        type: typeMult > 1 ? 'special' : 'damage',
      },
      ...logs,
    ]);

    setTimeout(() => {
      setPlayerActionAnim('idle');
      setPlayerEffect('none');
      setOpponentEffect('none');
    }, 720);
  };

  const handlePlayerDefend = () => {
    if (!isPlayerTurn || !playerFighter) return;
    setIsPlayerTurn(false);
    sound.playButton();
    triggerHaptic('light');
    setIsDefending(true);
    setPlayerEffect('shield');
    showDamagePopup('player', 'SHIELD', 'text-cyan-300 font-bold');

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            sp: Math.min(100, prev.sp + 15),
            mp: Math.min(prev.maxMp || 100, (prev.mp || 0) + 12),
          }
        : null
    );

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `${playerFighter.name} braced with Digi-Shield (-60% incoming damage, +12 MP).`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => setPlayerEffect('none'), 900);
  };

  const handlePlayerCharge = () => {
    if (!isPlayerTurn || !playerFighter) return;
    setIsPlayerTurn(false);
    sound.playMedicine();
    triggerHaptic('medium');
    setIsCharged(true);
    setPlayerEffect('charge');
    showDamagePopup('player', 'CHARGED', 'text-amber-300 font-bold');

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            sp: Math.min(100, prev.sp + 35),
            mp: Math.min(prev.maxMp || 100, (prev.mp || 0) + 18),
          }
        : null
    );

    setBattleLogs((logs) => [
      {
        id: `pl-${Date.now()}`,
        text: `${playerFighter.name} focused battle energy (+35 SP, +18 MP & boosted next strike).`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => setPlayerEffect('none'), 900);
  };

  const handleUseMeatInBattle = () => {
    if (!isPlayerTurn || !playerFighter || remainingMeat <= 0) return;
    if (playerFighter.currentHp >= playerFighter.maxHp) return;

    setIsPlayerTurn(false);
    sound.playEat();
    triggerHaptic('medium');
    setMeatUsed((m) => m + 1);
    const healAmount = Math.max(25, Math.round(playerFighter.maxHp * 0.45));
    setPlayerActionAnim('happy');
    showDamagePopup('player', `+${healAmount} HP`, 'text-emerald-300 font-extrabold');

    setPlayerFighter((prev) =>
      prev ? { ...prev, currentHp: Math.min(prev.maxHp, prev.currentHp + healAmount) } : null
    );

    setBattleLogs((logs) => [
      {
        id: `pl-heal-${Date.now()}`,
        text: `${playerFighter.name} ate Big Meat and restored ${healAmount} HP!`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => setPlayerActionAnim('idle'), 700);
  };

  const handleUseVitaminInBattle = () => {
    if (!isPlayerTurn || !playerFighter || remainingVitamins <= 0) return;

    setIsPlayerTurn(false);
    sound.playMedicine();
    triggerHaptic('medium');
    setVitaminsUsed((v) => v + 1);
    const healAmount = Math.max(18, Math.round(playerFighter.maxHp * 0.3));
    const mpRecover = Math.max(15, Math.round((playerFighter.maxMp || 60) * 0.35));
    setPlayerActionAnim('happy');
    showDamagePopup('player', `+${healAmount} HP · +${mpRecover} MP`, 'text-purple-300 font-extrabold');

    setPlayerFighter((prev) =>
      prev
        ? {
            ...prev,
            currentHp: Math.min(prev.maxHp, prev.currentHp + healAmount),
            mp: Math.min(prev.maxMp || 100, (prev.mp || 0) + mpRecover),
            sp: Math.min(100, prev.sp + 30),
          }
        : null
    );

    setBattleLogs((logs) => [
      {
        id: `pl-vit-${Date.now()}`,
        text: `${playerFighter.name} took a Vitamin (+${healAmount} HP, +${mpRecover} MP & +30 SP)!`,
        type: 'action',
      },
      ...logs,
    ]);

    setTimeout(() => setPlayerActionAnim('idle'), 700);
  };

  if (!isOpen) return null;

  const zoneClearedCount = Math.min(selectedZone.waves.length, clearedMap[selectedZone.id] ?? 0);
  const nextWaveAfterVictory =
    activeWave && activeWave.waveNumber < selectedZone.waves.length
      ? selectedZone.waves[activeWave.waveNumber]
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {view === 'trail' && (
              <button
                onClick={() => {
                  sound.playButton();
                  setView('zones');
                }}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Back to Environments"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h2 className="font-chakra font-bold text-white text-lg sm:text-xl truncate">
                {view === 'zones'
                  ? 'Digital World Adventure'
                  : view === 'trail'
                  ? selectedZone.name
                  : `${selectedZone.name} · Wave ${activeWave?.waveNumber || 1}`}
              </h2>
              <p className="text-xs text-slate-400 truncate tabular-nums">
                {pet.nickname || species?.name || 'Partner'} · STR {pet.strength} · DP {pet.dpPoints} · Cleared{' '}
                {totalClearedWaves}/{totalPossibleWaves} Waves
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close Adventure Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Egg Guard Warning */}
        {pet.stage === 'egg' && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs font-chakra">
            Your Digi-Egg needs to hatch before entering Adventure expeditions. Tap your Digivice egg or wait a few moments to hatch!
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pt-4 pr-0.5">
          {/* VIEW 1: ENVIRONMENT SELECTION */}
          {view === 'zones' && (
            <div className="space-y-4">
              {/* Partner Readiness Strip */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {species && (
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
                      <DigimonSprite species={species} action="idle" scale={0.62} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-chakra font-bold text-white text-sm truncate">
                      {pet.nickname || species?.name} ({species?.stage || pet.stage})
                    </div>
                    <div className="text-xs text-slate-400 tabular-nums">
                      Strength {pet.strength} · Effort {pet.effort ?? 0}/10 · Big Meat {pet.bigMeatStock} · Vitamins{' '}
                      {pet.vitaminStock}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-emerald-300 font-chakra">
                  Waves 1–3 Rookie · Wave 4 Champion · Wave 5 Ultimate · Wave 6 Mega Boss
                </div>
              </div>

              {/* Environment Biome Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ADVENTURE_ZONES.map((zone) => {
                  const zoneCleared = Math.min(zone.waves.length, clearedMap[zone.id] ?? 0);
                  const isComplete = zoneCleared >= zone.waves.length;
                  const bossWave = zone.waves[zone.waves.length - 1];
                  const bossSpecies = DIGIMON_DATABASE[bossWave.speciesId];
                  const relic = zone.firstClearRelicId ? SPECIAL_ITEMS[zone.firstClearRelicId] : undefined;
                  const hasRelic = zone.firstClearRelicId
                    ? (pet.ownedSpecialItems || []).includes(zone.firstClearRelicId)
                    : false;

                  return (
                    <button
                      key={zone.id}
                      onClick={() => {
                        sound.playButton();
                        triggerHaptic('light');
                        setSelectedZoneId(zone.id);
                        setView('trail');
                      }}
                      className={`group text-left rounded-2xl border p-4 transition-all cursor-pointer bg-gradient-to-br ${zone.backdropClass} hover:brightness-110 active:scale-[0.99] min-h-[138px] flex flex-col justify-between ${
                        isComplete
                          ? 'border-emerald-400/50'
                          : 'border-slate-700/80 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-chakra font-semibold text-slate-300/90">
                            Zone {String(zone.order).padStart(2, '0')} · {zone.environmentTag}
                          </div>
                          <h3 className="font-chakra font-bold text-white text-lg mt-0.5 truncate">
                            {zone.name}
                          </h3>
                          <p className="text-xs text-slate-300/80 mt-1 line-clamp-2">{zone.subtitle}</p>
                        </div>

                        {bossSpecies && (
                          <div className="w-16 h-16 rounded-xl bg-slate-950/65 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            <DigimonSprite species={bossSpecies} action="idle" facing="left" scale={0.7} />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-xs tabular-nums">
                        <div className="text-slate-200 font-chakra">
                          Cleared {zoneCleared}/{zone.waves.length} · Rec. STR {zone.recommendedStrength}+
                          {relic && (
                            <span className="text-amber-300">
                              {' '}
                              · {relic.shortName} {hasRelic ? '(Owned)' : '(Boss Drop)'}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-white font-semibold shrink-0 whitespace-nowrap">
                          Explore <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: WAVE TRAIL FOR SELECTED ENVIRONMENT */}
          {view === 'trail' && (
            <div className="space-y-4">
              {/* Zone Banner */}
              <div
                className={`rounded-2xl border border-slate-700/80 p-4 bg-gradient-to-br ${selectedZone.backdropClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div>
                  <div className="text-xs text-slate-300 font-chakra">
                    {selectedZone.environmentTag} · Recommended Strength {selectedZone.recommendedStrength}+
                  </div>
                  <p className="text-sm text-white font-chakra mt-0.5">{selectedZone.subtitle}</p>
                  <p className="text-xs text-amber-300 font-chakra mt-1">{selectedZone.firstClearBonusText}</p>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <div className="text-xs text-slate-300">Zone Progress</div>
                  <div className="font-chakra font-bold text-2xl text-white">
                    {zoneClearedCount} / {selectedZone.waves.length}
                  </div>
                </div>
              </div>

              {/* 6 Progressive Waves */}
              <div className="space-y-2.5">
                {selectedZone.waves.map((wave) => {
                  const opp = estimateOpponentStats(wave);
                  const isUnlocked = wave.waveNumber <= zoneClearedCount + 1;
                  const isCleared = wave.waveNumber <= zoneClearedCount;
                  const isNextTarget = wave.waveNumber === zoneClearedCount + 1;
                  const stageStyle = STAGE_STYLES[wave.stageLabel];

                  return (
                    <div
                      key={wave.waveNumber}
                      className={`rounded-2xl border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        !isUnlocked
                          ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                          : isNextTarget
                          ? 'bg-slate-800/90 border-amber-400/60'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                          <DigimonSprite species={opp.oppSpecies} action="idle" facing="left" scale={0.72} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-chakra font-bold text-white text-base truncate">
                              Wave {wave.waveNumber}: {opp.oppSpecies.name}
                            </span>
                            <span className={`text-[11px] font-chakra font-semibold px-2 py-0.5 rounded-md border ${stageStyle}`}>
                              {wave.stageLabel}
                            </span>
                            {isCleared && (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-chakra">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-300 mt-0.5 truncate">{wave.title}</div>

                          <div className="text-xs text-slate-400 mt-1 tabular-nums">
                            HP {opp.hp} · ATK {opp.atk} · Rewards: +{wave.strengthReward} STR · +{wave.dpReward} DP · +
                            {wave.bitsReward} Bits · +{wave.meatDrop} Meat
                            {wave.vitaminDrop > 0 ? ` · +${wave.vitaminDrop} Vit` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          disabled={!isUnlocked || pet.stage === 'egg'}
                          onClick={() => startWaveBattle(selectedZone, wave)}
                          className={`w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-chakra font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
                            !isUnlocked || pet.stage === 'egg'
                              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              : isNextTarget
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                          }`}
                        >
                          {!isUnlocked ? (
                            <>
                              <Lock className="w-4 h-4" /> Locked
                            </>
                          ) : isCleared ? (
                            <>
                              <RotateCcw className="w-4 h-4" /> Replay Wave
                            </>
                          ) : (
                            <>
                              <Swords className="w-4 h-4" /> Fight Wave {wave.waveNumber}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: ENVIRONMENT COMBAT STAGE */}
          {view === 'battling' && playerFighter && opponentFighter && activeWave && (
            <div className="space-y-3.5">
              {/* Arena Canvas */}
              <div
                className={`relative w-full h-56 sm:h-64 rounded-2xl border border-slate-700 bg-gradient-to-b ${selectedZone.backdropClass} p-3.5 sm:p-5 flex justify-between items-center overflow-hidden ${
                  arenaShake ? 'battle-arena-shake' : ''
                }`}
              >
                {/* Ground plane accent */}
                <div
                  className={`absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${selectedZone.groundClass} pointer-events-none`}
                />

                {/* Screen Impact Flash */}
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

                {/* Turn Status Banner */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950/90 border border-slate-700 rounded-lg font-chakra font-semibold text-xs text-amber-300 z-20 whitespace-nowrap">
                  {isPlayerTurn
                    ? 'Your Turn — Choose Command'
                    : `${opponentFighter.name} (${activeWave.stageLabel}) Acting...`}
                </div>

                {/* Player Fighter */}
                <div className="flex flex-col items-center z-10 relative">
                  <div className="w-32 sm:w-40 bg-slate-950/90 border border-cyan-500/40 rounded-xl p-2 mb-2 text-xs font-chakra tabular-nums">
                    <div className="flex justify-between text-cyan-200 font-bold mb-0.5 gap-1">
                      <span className="truncate">{playerFighter.name}</span>
                      <span className="text-[10px] text-slate-300 shrink-0">
                        {ATTACK_ELEMENT_META[playerFighter.element || 'neutral'].shortLabel}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                      <span>HP {playerFighter.currentHp}/{playerFighter.maxHp}</span>
                      <span className="text-cyan-300">MP {playerFighter.mp ?? 0}/{playerFighter.maxMp ?? 60}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${(playerFighter.currentHp / playerFighter.maxHp) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${((playerFighter.mp ?? 0) / (playerFighter.maxMp || 1)) * 100}%` }}
                        />
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${playerFighter.sp}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`relative flex items-center justify-center ${
                      playerEffect === 'lunge'
                        ? 'battle-lunge-right'
                        : playerEffect === 'hit'
                        ? 'battle-shake-hit'
                        : ''
                    }`}
                  >
                    <DigimonSprite
                      species={DIGIMON_DATABASE[playerFighter.speciesId]}
                      action={playerActionAnim}
                      facing="right"
                      scale={1.0}
                    />

                    {(isDefending || playerEffect === 'shield') && (
                      <div className="absolute inset-0 -m-3 rounded-full border-2 border-cyan-400 bg-cyan-400/20 battle-shield-aura pointer-events-none z-20 flex items-center justify-center">
                        <Shield className="w-7 h-7 text-cyan-300" />
                      </div>
                    )}

                    {(isCharged || playerEffect === 'charge') && (
                      <div className="absolute inset-0 -m-3 rounded-full border-2 border-amber-400 bg-amber-400/20 battle-charge-aura pointer-events-none z-20 flex items-center justify-center">
                        <Zap className="w-7 h-7 text-amber-300" />
                      </div>
                    )}

                    {damagePopups
                      .filter((p) => p.target === 'player')
                      .map((p) => (
                        <div
                          key={p.id}
                          className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none z-40 battle-damage-float ${p.color}`}
                        >
                          {p.text}
                        </div>
                      ))}
                  </div>
                </div>

                {/* VS Indicator */}
                <div className="hidden sm:flex flex-col items-center opacity-50 z-10">
                  <span className="font-chakra font-bold text-xl text-slate-300">VS</span>
                  <span className="text-[11px] text-slate-400">{activeWave.stageLabel}</span>
                </div>

                {/* Opponent Fighter */}
                <div className="flex flex-col items-center z-10 relative">
                  <div className="w-32 sm:w-40 bg-slate-950/90 border border-rose-500/40 rounded-xl p-2 mb-2 text-xs font-chakra tabular-nums">
                    <div className="flex justify-between text-rose-200 font-bold mb-0.5 gap-1">
                      <span className="truncate">{opponentFighter.name}</span>
                      <span className="text-[10px] text-slate-300 shrink-0">
                        {ATTACK_ELEMENT_META[opponentFighter.element || 'neutral'].shortLabel}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                      <span>HP {opponentFighter.currentHp}/{opponentFighter.maxHp}</span>
                      <span className="text-amber-300">SP {opponentFighter.sp}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 transition-all duration-300"
                        style={{ width: `${(opponentFighter.currentHp / opponentFighter.maxHp) * 100}%` }}
                      />
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${opponentFighter.sp}%` }}
                      />
                    </div>
                  </div>

                  <div
                    className={`relative flex items-center justify-center ${
                      opponentEffect === 'lunge'
                        ? 'battle-lunge-left'
                        : opponentEffect === 'hit'
                        ? 'battle-shake-hit'
                        : ''
                    }`}
                  >
                    <DigimonSprite
                      species={DIGIMON_DATABASE[opponentFighter.speciesId]}
                      action={opponentActionAnim}
                      facing="left"
                      scale={1.0}
                    />

                    {damagePopups
                      .filter((p) => p.target === 'opponent')
                      .map((p) => (
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

              {/* Equipped Techniques (Max 4 MP Attacks) */}
              {playerFighter.equippedMoves && playerFighter.equippedMoves.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {playerFighter.equippedMoves.map((move) => {
                    const hasMp = (playerFighter.mp ?? 0) >= move.mpCost;
                    const mult = getElementDamageMultiplier(
                      move.element,
                      opponentFighter.element || 'neutral'
                    );
                    const elMeta = ATTACK_ELEMENT_META[move.element];
                    return (
                      <button
                        key={move.id}
                        disabled={!isPlayerTurn || !hasMp}
                        onClick={() => handleUseLearnedTechnique(move)}
                        className={`min-h-[50px] px-2.5 py-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer active:scale-95 disabled:opacity-40 ${
                          mult > 1
                            ? 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-400/70'
                            : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-chakra font-bold text-xs text-white truncate">
                            {move.name}
                          </span>
                          {mult > 1 && (
                            <span className="text-[10px] font-chakra font-bold text-emerald-300 shrink-0">
                              1.5x
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-chakra text-slate-300 w-full mt-0.5">
                          <span>{elMeta.shortLabel} · {move.power}P</span>
                          <span className="text-cyan-300 font-semibold">{move.mpCost} MP</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Combat Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  disabled={!isPlayerTurn}
                  onClick={handlePlayerAttack}
                  className="min-h-[54px] px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold text-white cursor-pointer active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-slate-200" /> Attack
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">+20 SP · +8 MP</span>
                </button>

                <button
                  disabled={!isPlayerTurn || playerFighter.sp < 50}
                  onClick={handlePlayerSpecial}
                  className="min-h-[54px] px-3 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-45 text-slate-950 border border-amber-300 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold cursor-pointer active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5 max-w-full truncate">
                    <Flame className="w-4 h-4 shrink-0" />
                    <span className="truncate">{playerFighter.signatureMove.name}</span>
                  </span>
                  <span className="text-[11px] font-semibold opacity-80">50 SP</span>
                </button>

                <button
                  disabled={!isPlayerTurn}
                  onClick={handlePlayerDefend}
                  className="min-h-[54px] px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold text-white cursor-pointer active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" /> Shield
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">-60% DMG · +12 MP</span>
                </button>

                <button
                  disabled={!isPlayerTurn}
                  onClick={handlePlayerCharge}
                  className="min-h-[54px] px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 border border-slate-600 rounded-xl flex flex-col items-center justify-center font-chakra text-sm font-bold text-white cursor-pointer active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Charge
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">+35 SP · +18 MP</span>
                </button>
              </div>

              {/* Field Supply Pouch + Retreat */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  disabled={!isPlayerTurn || remainingMeat <= 0 || playerFighter.currentHp >= playerFighter.maxHp}
                  onClick={handleUseMeatInBattle}
                  className="min-h-[44px] px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-45 border border-amber-500/35 rounded-xl flex items-center justify-center gap-2 font-chakra text-xs font-semibold text-amber-200 cursor-pointer tabular-nums"
                >
                  <PixelMeatIcon className="w-4 h-4" />
                  <span>Use Big Meat (+45% HP · {remainingMeat})</span>
                </button>

                <button
                  disabled={!isPlayerTurn || remainingVitamins <= 0}
                  onClick={handleUseVitaminInBattle}
                  className="min-h-[44px] px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-45 border border-purple-500/35 rounded-xl flex items-center justify-center gap-2 font-chakra text-xs font-semibold text-purple-200 cursor-pointer tabular-nums"
                >
                  <PixelVitaminIcon className="w-4 h-4" />
                  <span>Use Vitamin (+30% HP/+30 SP · {remainingVitamins})</span>
                </button>

                <button
                  onClick={() => {
                    sound.playButton();
                    setView('trail');
                  }}
                  className="min-h-[44px] px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl font-chakra text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Retreat to Trail
                </button>
              </div>

              {/* Combat Log */}
              <div className="h-24 bg-slate-950 border border-slate-800 rounded-xl p-2.5 overflow-y-auto font-chakra text-xs space-y-1">
                {battleLogs.map((log) => (
                  <div
                    key={log.id}
                    className={
                      log.type === 'special'
                        ? 'text-amber-300 font-semibold'
                        : log.type === 'damage'
                        ? 'text-rose-300'
                        : 'text-slate-300'
                    }
                  >
                    {log.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 4: VICTORY & SPOILS */}
          {view === 'victory' && lastResult && activeWave && (
            <div className="py-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mb-3">
                <Trophy className="w-9 h-9 text-amber-300" />
              </div>
              <h3 className="font-chakra font-bold text-white text-2xl sm:text-3xl">
                Wave {activeWave.waveNumber} Cleared!
              </h3>
              <p className="text-slate-300 text-sm mt-1 max-w-md">
                {pet.nickname || species?.name} defeated {DIGIMON_DATABASE[activeWave.speciesId]?.name} ({activeWave.stageLabel}) in{' '}
                {selectedZone.name}.
              </p>

              {/* Battle Experience & Item Drops */}
              <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-4 my-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left tabular-nums">
                <div>
                  <div className="text-xs text-slate-400">Strength Exp</div>
                  <div className="font-chakra font-bold text-lg text-emerald-300">+{lastResult.strengthGained} STR</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Battle Power</div>
                  <div className="font-chakra font-bold text-lg text-cyan-300">+{lastResult.dpGained} DP</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Effort</div>
                  <div className="font-chakra font-bold text-lg text-amber-300">+{lastResult.effortGained} EF</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">DigiBits</div>
                  <div className="font-chakra font-bold text-lg text-amber-200">+{lastResult.bitsGained} Bits</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Big Meat Drop</div>
                  <div className="font-chakra font-bold text-lg text-orange-300">+{lastResult.meatGained}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Vitamin Drop</div>
                  <div className="font-chakra font-bold text-lg text-purple-300">+{lastResult.vitaminsGained}</div>
                </div>
              </div>

              {lastResult.unlockedRelicId && SPECIAL_ITEMS[lastResult.unlockedRelicId] && (
                <div className="w-full max-w-lg mb-5 p-3.5 rounded-2xl bg-amber-950/50 border border-amber-400/50 text-amber-200 text-sm font-chakra">
                  Special Relic Unlocked: <strong className="text-white">{SPECIAL_ITEMS[lastResult.unlockedRelicId].name}</strong> added to your Relic Vault!
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                {nextWaveAfterVictory ? (
                  <button
                    onClick={() => startWaveBattle(selectedZone, nextWaveAfterVictory)}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                  >
                    Next Wave: {DIGIMON_DATABASE[nextWaveAfterVictory.speciesId]?.name} ({nextWaveAfterVictory.stageLabel})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playButton();
                      setView('zones');
                    }}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                  >
                    Choose Another Environment
                  </button>
                )}

                <button
                  onClick={() => startWaveBattle(selectedZone, activeWave)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                >
                  Replay Wave
                </button>

                <button
                  onClick={() => {
                    sound.playButton();
                    setView('trail');
                  }}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                >
                  Back to Trail
                </button>
              </div>
            </div>
          )}

          {/* VIEW 5: DEFEAT & CONSOLATION EXP */}
          {view === 'defeat' && lastResult && activeWave && (
            <div className="py-6 flex flex-col items-center text-center">
              <h3 className="font-chakra font-bold text-white text-2xl sm:text-3xl">Defeated by {DIGIMON_DATABASE[activeWave.speciesId]?.name}</h3>
              <p className="text-slate-300 text-sm mt-1 max-w-md">
                Even a tough defeat built combat instinct. Train in the Dojo, evolve higher, or stock up on Big Meat and Vitamins before returning!
              </p>

              <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl p-4 my-5 flex items-center justify-around font-chakra tabular-nums">
                <div>
                  <div className="text-xs text-slate-400">Battle Exp</div>
                  <div className="font-bold text-emerald-300">+{lastResult.strengthGained} STR</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Power</div>
                  <div className="font-bold text-cyan-300">+{lastResult.dpGained} DP</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Bits</div>
                  <div className="font-bold text-amber-300">+{lastResult.bitsGained}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => startWaveBattle(selectedZone, activeWave)}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                >
                  Retry Wave {activeWave.waveNumber}
                </button>
                <button
                  onClick={() => {
                    sound.playButton();
                    setView('trail');
                  }}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-chakra font-bold text-sm cursor-pointer whitespace-nowrap"
                >
                  Back to Trail
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
