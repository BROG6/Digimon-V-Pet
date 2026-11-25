import { AttackElement } from '../types/digimon';
import {
  AttackMotionKind,
  AttackVisualSpec,
  getBasicAttackVisual,
  getRangedVolleyVisual,
} from '../data/battleTechniques';
import { sound } from './audio';

export const BATTLE_SFX_STORAGE_KEY = 'digipet_battle_sfx_enabled';
export const BATTLE_SFX_CHANGED_EVENT = 'digipet-battle-sfx-changed';

export interface PlayBattleAttackOptions {
  spec: AttackVisualSpec;
  isCrit?: boolean;
  isSuperEffective?: boolean;
}

class BattleSoundLibrary {
  private enabled: boolean = true;
  private noiseBuffer: AudioBuffer | null = null;
  private noiseSampleRate: number = 0;

  constructor() {
    this.enabled = this.loadPreference();
  }

  private loadPreference(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const saved = window.localStorage.getItem(BATTLE_SFX_STORAGE_KEY);
      if (saved === 'false' || saved === '0') return false;
      if (saved === 'true' || saved === '1') return true;
    } catch {}
    return true;
  }

  private persistPreference() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(BATTLE_SFX_STORAGE_KEY, this.enabled ? 'true' : 'false');
    } catch {}
    try {
      window.dispatchEvent(
        new CustomEvent(BATTLE_SFX_CHANGED_EVENT, { detail: { enabled: this.enabled } })
      );
    } catch {}
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.persistPreference();
  }

  public toggleEnabled(): boolean {
    this.enabled = !this.enabled;
    this.persistPreference();
    return this.enabled;
  }

  public canPlay(): boolean {
    return this.enabled && !sound.getMuted();
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseSampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = Math.floor(ctx.sampleRate * 0.8);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    this.noiseSampleRate = ctx.sampleRate;
    return buffer;
  }

  private scheduleTone(
    ctx: AudioContext,
    opts: {
      type: OscillatorType;
      startTime: number;
      duration: number;
      freqStart: number;
      freqEnd?: number;
      peakGain: number;
      attack?: number;
      filterType?: BiquadFilterType;
      filterFreqStart?: number;
      filterFreqEnd?: number;
      filterQ?: number;
      detune?: number;
    }
  ) {
    const {
      type,
      startTime,
      duration,
      freqStart,
      freqEnd,
      peakGain,
      attack = 0.008,
      filterType,
      filterFreqStart,
      filterFreqEnd,
      filterQ = 1.5,
      detune = 0,
    } = opts;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    if (detune) osc.detune.setValueAtTime(detune, startTime);

    const safeStartFreq = Math.max(20, freqStart);
    osc.frequency.setValueAtTime(safeStartFreq, startTime);
    if (freqEnd !== undefined) {
      const safeEndFreq = Math.max(20, freqEnd);
      osc.frequency.exponentialRampToValueAtTime(safeEndFreq, startTime + Math.max(0.02, duration));
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, peakGain), startTime + Math.min(attack, duration * 0.4));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    if (filterType && filterFreqStart) {
      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.Q.setValueAtTime(filterQ, startTime);
      filter.frequency.setValueAtTime(Math.max(40, filterFreqStart), startTime);
      if (filterFreqEnd) {
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(40, filterFreqEnd),
          startTime + Math.max(0.02, duration)
        );
      }
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(ctx.destination);
    sound.trackExternalNode(osc, gain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private scheduleNoise(
    ctx: AudioContext,
    opts: {
      startTime: number;
      duration: number;
      peakGain: number;
      filterType: BiquadFilterType;
      freqStart: number;
      freqEnd?: number;
      Q?: number;
      attack?: number;
    }
  ) {
    const {
      startTime,
      duration,
      peakGain,
      filterType,
      freqStart,
      freqEnd,
      Q = 1.6,
      attack = 0.01,
    } = opts;

    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.Q.setValueAtTime(Q, startTime);
    filter.frequency.setValueAtTime(Math.max(40, freqStart), startTime);
    if (freqEnd !== undefined) {
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(40, freqEnd),
        startTime + Math.max(0.02, duration)
      );
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, peakGain), startTime + Math.min(attack, duration * 0.35));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    sound.trackExternalNode(src, gain);
    src.start(startTime);
    src.stop(startTime + duration + 0.02);
  }

  /**
   * Plays a two-phase Web Audio attack SFX (launch at t=0 + elemental impact at t=0.24s)
   * tailored to both attack motion (melee vs ranged) and attack element.
   */
  public playAttackSound({ spec, isCrit = false, isSuperEffective = false }: PlayBattleAttackOptions) {
    if (!this.canPlay()) return;
    const ctx = sound.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const impactAt = now + (spec.motion === 'melee' ? 0.22 : 0.25);

    if (spec.motion === 'melee') {
      this.playPhysicalLaunch(ctx, now, spec);
      this.playPhysicalImpact(ctx, impactAt, spec, isCrit);
    } else {
      this.playRangedLaunch(ctx, now, spec);
      this.playRangedImpact(ctx, impactAt, spec, isCrit);
    }

    if (isCrit) {
      this.playCriticalLayer(ctx, impactAt);
    }
    if (isSuperEffective) {
      this.playSuperEffectiveLayer(ctx, impactAt + 0.03);
    }
  }

  public playPreview(motion: AttackMotionKind, element: AttackElement) {
    if (!this.canPlay()) return;
    const spec =
      motion === 'melee'
        ? getBasicAttackVisual(element)
        : getRangedVolleyVisual(element, `${element} preview`);
    this.playAttackSound({ spec, isCrit: false, isSuperEffective: false });
  }

  // ---------------------------------------------------------------------------
  // PHYSICAL / MELEE SYNTHESIS
  // ---------------------------------------------------------------------------

  private playPhysicalLaunch(ctx: AudioContext, t: number, spec: AttackVisualSpec) {
    const isSlash = spec.variant === 'slash';

    // Dash wind / kinetic rush
    this.scheduleNoise(ctx, {
      startTime: t,
      duration: 0.16,
      peakGain: isSlash ? 0.11 : 0.09,
      filterType: 'bandpass',
      freqStart: isSlash ? 520 : 280,
      freqEnd: isSlash ? 2100 : 980,
      Q: isSlash ? 2.4 : 1.5,
    });

    // Element-specific physical wind-up accent
    switch (spec.element) {
      case 'fire':
        this.scheduleNoise(ctx, {
          startTime: t + 0.02,
          duration: 0.14,
          peakGain: 0.09,
          filterType: 'highpass',
          freqStart: 1200,
          freqEnd: 2600,
          Q: 1.2,
        });
        break;
      case 'ice':
        this.scheduleTone(ctx, {
          type: 'sine',
          startTime: t + 0.03,
          duration: 0.1,
          freqStart: 1480,
          freqEnd: 2217,
          peakGain: 0.06,
        });
        break;
      case 'air':
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t,
          duration: 0.12,
          freqStart: 620,
          freqEnd: 1760,
          peakGain: 0.07,
        });
        break;
      case 'weapon':
        // Metallic blade draw ring
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t + 0.01,
          duration: 0.14,
          freqStart: 1620,
          freqEnd: 2450,
          peakGain: 0.06,
        });
        break;
      case 'holy':
        this.scheduleTone(ctx, {
          type: 'sine',
          startTime: t + 0.02,
          duration: 0.15,
          freqStart: 784,
          freqEnd: 1174,
          peakGain: 0.06,
        });
        break;
      case 'dark':
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t,
          duration: 0.15,
          freqStart: 220,
          freqEnd: 110,
          peakGain: 0.06,
          filterType: 'lowpass',
          filterFreqStart: 650,
        });
        break;
      case 'filth':
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t,
          duration: 0.13,
          freqStart: 240,
          freqEnd: 390,
          peakGain: 0.07,
        });
        break;
      default:
        break;
    }
  }

  private playPhysicalImpact(ctx: AudioContext, t: number, spec: AttackVisualSpec, isCrit: boolean) {
    const boost = isCrit ? 1.2 : 1.0;
    const isSlash = spec.variant === 'slash';

    // Core kinetic impact (heavy punch thud vs blade slash)
    if (isSlash) {
      this.scheduleNoise(ctx, {
        startTime: t,
        duration: 0.14,
        peakGain: 0.16 * boost,
        filterType: 'highpass',
        freqStart: 2400,
        freqEnd: 620,
        Q: 2.0,
        attack: 0.004,
      });
      this.scheduleTone(ctx, {
        type: 'sawtooth',
        startTime: t,
        duration: 0.12,
        freqStart: 740,
        freqEnd: 140,
        peakGain: 0.11 * boost,
        filterType: 'bandpass',
        filterFreqStart: 1400,
        filterFreqEnd: 420,
      });
    } else {
      // Heavy body punch thump + crack
      this.scheduleTone(ctx, {
        type: 'triangle',
        startTime: t,
        duration: 0.16,
        freqStart: 175,
        freqEnd: 38,
        peakGain: 0.22 * boost,
        attack: 0.004,
      });
      this.scheduleNoise(ctx, {
        startTime: t,
        duration: 0.09,
        peakGain: 0.14 * boost,
        filterType: 'bandpass',
        freqStart: 750,
        freqEnd: 240,
        Q: 1.4,
        attack: 0.003,
      });
    }

    // Elemental physical impact overlay
    switch (spec.element) {
      case 'fire':
        this.scheduleNoise(ctx, {
          startTime: t + 0.01,
          duration: 0.22,
          peakGain: 0.14,
          filterType: 'bandpass',
          freqStart: 1400,
          freqEnd: 320,
          Q: 1.3,
        });
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t,
          duration: 0.18,
          freqStart: 210,
          freqEnd: 58,
          peakGain: 0.11,
          filterType: 'lowpass',
          filterFreqStart: 900,
        });
        break;
      case 'ice':
        [1760, 2349, 3136].forEach((freq, idx) => {
          this.scheduleTone(ctx, {
            type: 'sine',
            startTime: t + idx * 0.025,
            duration: 0.14,
            freqStart: freq,
            freqEnd: freq * 0.88,
            peakGain: 0.075,
            attack: 0.003,
          });
        });
        break;
      case 'air':
        this.scheduleTone(ctx, {
          type: 'square',
          startTime: t,
          duration: 0.13,
          freqStart: 1320,
          freqEnd: 320,
          peakGain: 0.09,
          filterType: 'bandpass',
          filterFreqStart: 1600,
          filterFreqEnd: 600,
        });
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.12,
          peakGain: 0.12,
          filterType: 'highpass',
          freqStart: 2800,
          freqEnd: 1100,
        });
        break;
      case 'nature':
        // Crisp whip / thorn snap
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t,
          duration: 0.12,
          freqStart: 620,
          freqEnd: 150,
          peakGain: 0.12,
        });
        this.scheduleNoise(ctx, {
          startTime: t + 0.01,
          duration: 0.15,
          peakGain: 0.1,
          filterType: 'bandpass',
          freqStart: 1850,
          freqEnd: 700,
          Q: 2.2,
        });
        break;
      case 'holy':
        this.scheduleTone(ctx, {
          type: 'sine',
          startTime: t,
          duration: 0.24,
          freqStart: 1046.5,
          peakGain: 0.1,
          attack: 0.005,
        });
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t + 0.02,
          duration: 0.22,
          freqStart: 1567.98,
          peakGain: 0.075,
        });
        break;
      case 'dark':
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t,
          duration: 0.24,
          freqStart: 135,
          freqEnd: 36,
          peakGain: 0.14,
          filterType: 'lowpass',
          filterFreqStart: 580,
          filterFreqEnd: 160,
        });
        this.scheduleTone(ctx, {
          type: 'square',
          startTime: t + 0.02,
          duration: 0.16,
          freqStart: 277,
          freqEnd: 92,
          peakGain: 0.06,
          detune: -18,
        });
        break;
      case 'hand':
        // Extra heavy martial shockwave thud + snap
        this.scheduleTone(ctx, {
          type: 'sine',
          startTime: t,
          duration: 0.2,
          freqStart: 130,
          freqEnd: 34,
          peakGain: 0.18,
          attack: 0.003,
        });
        break;
      case 'weapon':
        // Metallic blade / mech clang
        [940, 1490, 2240].forEach((freq) => {
          this.scheduleTone(ctx, {
            type: 'triangle',
            startTime: t,
            duration: 0.18,
            freqStart: freq,
            freqEnd: freq * 0.94,
            peakGain: 0.065,
            attack: 0.002,
          });
        });
        break;
      case 'filth':
        // Wet splat impact
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t,
          duration: 0.17,
          freqStart: 390,
          freqEnd: 85,
          peakGain: 0.11,
          filterType: 'bandpass',
          filterFreqStart: 920,
          filterFreqEnd: 220,
          filterQ: 4.0,
        });
        break;
      case 'neutral':
      default:
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // RANGED / PROJECTILE / BEAM SYNTHESIS
  // ---------------------------------------------------------------------------

  private playRangedLaunch(ctx: AudioContext, t: number, spec: AttackVisualSpec) {
    if (spec.variant === 'beam') {
      // Sci-fi charged laser / energy beam firing sweep
      this.scheduleTone(ctx, {
        type: 'sawtooth',
        startTime: t,
        duration: 0.26,
        freqStart: 310,
        freqEnd: 1280,
        peakGain: 0.11,
        filterType: 'bandpass',
        filterFreqStart: 600,
        filterFreqEnd: 2600,
        filterQ: 2.2,
      });
      this.scheduleTone(ctx, {
        type: 'sine',
        startTime: t + 0.04,
        duration: 0.22,
        freqStart: 620,
        freqEnd: 940,
        peakGain: 0.09,
        detune: 10,
      });
      return;
    }

    switch (spec.element) {
      case 'fire':
        // Roaring flame blast whoosh
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.24,
          peakGain: 0.15,
          filterType: 'bandpass',
          freqStart: 420,
          freqEnd: 1750,
          Q: 1.5,
        });
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t,
          duration: 0.22,
          freqStart: 380,
          freqEnd: 130,
          peakGain: 0.1,
          filterType: 'lowpass',
          filterFreqStart: 1100,
        });
        break;
      case 'ice':
        // Shimmering frost shard launch arpeggio
        [1174.66, 1567.98, 2093].forEach((freq, idx) => {
          this.scheduleTone(ctx, {
            type: 'sine',
            startTime: t + idx * 0.035,
            duration: 0.12,
            freqStart: freq,
            freqEnd: freq * 1.06,
            peakGain: 0.08,
          });
        });
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.18,
          peakGain: 0.07,
          filterType: 'highpass',
          freqStart: 3200,
        });
        break;
      case 'air':
        // Electric plasma zip / thunder discharge
        this.scheduleTone(ctx, {
          type: 'square',
          startTime: t,
          duration: 0.2,
          freqStart: 1580,
          freqEnd: 410,
          peakGain: 0.095,
          filterType: 'bandpass',
          filterFreqStart: 2200,
          filterFreqEnd: 780,
          filterQ: 2.5,
        });
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t + 0.03,
          duration: 0.16,
          freqStart: 920,
          freqEnd: 290,
          peakGain: 0.07,
          detune: 14,
        });
        break;
      case 'nature':
        // Swirling leaf / gale whistle
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.22,
          peakGain: 0.11,
          filterType: 'bandpass',
          freqStart: 900,
          freqEnd: 2400,
          Q: 3.2,
        });
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t + 0.02,
          duration: 0.18,
          freqStart: 520,
          freqEnd: 980,
          peakGain: 0.07,
        });
        break;
      case 'holy':
        // Radiant choir-bell launch chord
        [523.25, 659.25, 1046.5].forEach((freq, idx) => {
          this.scheduleTone(ctx, {
            type: 'sine',
            startTime: t + idx * 0.02,
            duration: 0.22,
            freqStart: freq,
            freqEnd: freq * 1.12,
            peakGain: 0.075,
          });
        });
        break;
      case 'dark':
        // Shadow void pulse sweep
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t,
          duration: 0.25,
          freqStart: 260,
          freqEnd: 78,
          peakGain: 0.12,
          filterType: 'lowpass',
          filterFreqStart: 920,
          filterFreqEnd: 210,
        });
        this.scheduleTone(ctx, {
          type: 'square',
          startTime: t,
          duration: 0.24,
          freqStart: 245,
          freqEnd: 74,
          peakGain: 0.06,
          detune: -22,
        });
        break;
      case 'weapon':
        // Lock-on beep + missile booster ignition
        this.scheduleTone(ctx, {
          type: 'square',
          startTime: t,
          duration: 0.06,
          freqStart: 1760,
          peakGain: 0.075,
        });
        this.scheduleNoise(ctx, {
          startTime: t + 0.04,
          duration: 0.2,
          peakGain: 0.14,
          filterType: 'bandpass',
          freqStart: 1500,
          freqEnd: 520,
          Q: 1.4,
        });
        break;
      case 'filth':
        // Bubbling toxic glob launch
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t,
          duration: 0.2,
          freqStart: 240,
          freqEnd: 560,
          peakGain: 0.1,
          filterType: 'bandpass',
          filterFreqStart: 380,
          filterFreqEnd: 1100,
          filterQ: 4.5,
        });
        break;
      case 'hand':
      case 'neutral':
      default:
        // Classic energy ki / plasma wave launch
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t,
          duration: 0.22,
          freqStart: 620,
          freqEnd: 240,
          peakGain: 0.11,
          filterType: 'lowpass',
          filterFreqStart: 1800,
          filterFreqEnd: 540,
        });
        break;
    }
  }

  private playRangedImpact(ctx: AudioContext, t: number, spec: AttackVisualSpec, isCrit: boolean) {
    const boost = isCrit ? 1.18 : 1.0;

    switch (spec.element) {
      case 'fire':
        // Fireball detonation boom + crackle
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t,
          duration: 0.24,
          freqStart: 155,
          freqEnd: 36,
          peakGain: 0.2 * boost,
          attack: 0.005,
        });
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.28,
          peakGain: 0.15 * boost,
          filterType: 'lowpass',
          freqStart: 1900,
          freqEnd: 260,
        });
        break;
      case 'ice':
        // Frozen crystal shatter burst
        [1975.53, 2637.02, 3520].forEach((freq, idx) => {
          this.scheduleTone(ctx, {
            type: 'sine',
            startTime: t + idx * 0.02,
            duration: 0.18,
            freqStart: freq,
            freqEnd: freq * 0.85,
            peakGain: 0.075 * boost,
            attack: 0.003,
          });
        });
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.16,
          peakGain: 0.11 * boost,
          filterType: 'highpass',
          freqStart: 2800,
          freqEnd: 1400,
        });
        break;
      case 'air':
        // Thunderclap strike + electric static
        this.scheduleTone(ctx, {
          type: 'square',
          startTime: t,
          duration: 0.18,
          freqStart: 880,
          freqEnd: 110,
          peakGain: 0.12 * boost,
          filterType: 'bandpass',
          filterFreqStart: 1800,
          filterFreqEnd: 320,
        });
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.22,
          peakGain: 0.15 * boost,
          filterType: 'highpass',
          freqStart: 1600,
          freqEnd: 420,
        });
        break;
      case 'nature':
        // Bursting seed/petal scatter + wind thump
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t,
          duration: 0.16,
          freqStart: 320,
          freqEnd: 95,
          peakGain: 0.14 * boost,
        });
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.2,
          peakGain: 0.12 * boost,
          filterType: 'bandpass',
          freqStart: 2100,
          freqEnd: 650,
          Q: 2.0,
        });
        break;
      case 'holy':
        // Radiant bell resonance + warm sub pulse
        this.scheduleTone(ctx, {
          type: 'sine',
          startTime: t,
          duration: 0.3,
          freqStart: 1046.5,
          peakGain: 0.11 * boost,
        });
        this.scheduleTone(ctx, {
          type: 'sine',
          startTime: t + 0.02,
          duration: 0.28,
          freqStart: 1567.98,
          peakGain: 0.09 * boost,
        });
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t,
          duration: 0.16,
          freqStart: 160,
          freqEnd: 55,
          peakGain: 0.13 * boost,
        });
        break;
      case 'dark':
        // Void implosion drop
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t,
          duration: 0.28,
          freqStart: 190,
          freqEnd: 32,
          peakGain: 0.17 * boost,
          filterType: 'lowpass',
          filterFreqStart: 620,
          filterFreqEnd: 110,
        });
        this.scheduleNoise(ctx, {
          startTime: t + 0.01,
          duration: 0.22,
          peakGain: 0.11 * boost,
          filterType: 'bandpass',
          freqStart: 780,
          freqEnd: 180,
          Q: 2.5,
        });
        break;
      case 'weapon':
        // Concussive missile explosion
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t,
          duration: 0.24,
          freqStart: 145,
          freqEnd: 34,
          peakGain: 0.21 * boost,
        });
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.26,
          peakGain: 0.17 * boost,
          filterType: 'lowpass',
          freqStart: 2200,
          freqEnd: 240,
        });
        break;
      case 'filth':
        // Toxic splash detonation
        this.scheduleTone(ctx, {
          type: 'sawtooth',
          startTime: t,
          duration: 0.2,
          freqStart: 420,
          freqEnd: 78,
          peakGain: 0.13 * boost,
          filterType: 'bandpass',
          filterFreqStart: 1100,
          filterFreqEnd: 210,
          filterQ: 4.2,
        });
        break;
      case 'hand':
      case 'neutral':
      default:
        // Balanced energy detonation
        this.scheduleTone(ctx, {
          type: 'triangle',
          startTime: t,
          duration: 0.2,
          freqStart: 180,
          freqEnd: 46,
          peakGain: 0.17 * boost,
        });
        this.scheduleNoise(ctx, {
          startTime: t,
          duration: 0.18,
          peakGain: 0.12 * boost,
          filterType: 'bandpass',
          freqStart: 1300,
          freqEnd: 300,
        });
        break;
    }
  }

  private playCriticalLayer(ctx: AudioContext, t: number) {
    // High-energy kinetic flash stab
    this.scheduleTone(ctx, {
      type: 'square',
      startTime: t,
      duration: 0.12,
      freqStart: 1318.5,
      freqEnd: 523.25,
      peakGain: 0.08,
      attack: 0.002,
    });
    this.scheduleTone(ctx, {
      type: 'sine',
      startTime: t + 0.03,
      duration: 0.14,
      freqStart: 1975.5,
      peakGain: 0.075,
      attack: 0.002,
    });
  }

  private playSuperEffectiveLayer(ctx: AudioContext, t: number) {
    // Subtle rewarding resonant harmonic chime for 1.5x elemental advantage
    this.scheduleTone(ctx, {
      type: 'sine',
      startTime: t,
      duration: 0.16,
      freqStart: 880,
      freqEnd: 1318.5,
      peakGain: 0.065,
      attack: 0.004,
    });
  }
}

export const battleSoundLibrary = new BattleSoundLibrary();
