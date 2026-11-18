/**
 * Web Audio API retro synthesizer for authentic Digivice and arcade sound effects
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeNodes: Set<{ source: AudioScheduledSourceNode; gain?: GainNode }> = new Set();

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.stopAll();
          if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
          }
        }
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => {
        this.stopAll();
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      });
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private trackSource(source: AudioScheduledSourceNode, gain?: GainNode) {
    const entry = { source, gain };
    this.activeNodes.add(entry);
    source.onended = () => {
      this.activeNodes.delete(entry);
      try {
        source.disconnect();
      } catch {}
      if (gain) {
        try {
          gain.disconnect();
        } catch {}
      }
    };
  }

  public stopAll() {
    this.activeNodes.forEach((entry) => {
      try {
        entry.source.stop();
      } catch {}
      try {
        entry.source.disconnect();
      } catch {}
      if (entry.gain) {
        try {
          entry.gain.disconnect();
        } catch {}
      }
    });
    this.activeNodes.clear();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAll();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAll();
    }
    return this.isMuted;
  }

  // Classic Digivice button blip with mobile haptic feedback
  public playButton() {
    triggerHaptic('light');
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    this.trackSource(osc, gain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Digivice Attention Call (3 high-pitched beeps)
  public playAlert() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.12, 0.24].forEach((timeOffset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1320, now + timeOffset);
      gain.gain.setValueAtTime(0.12, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      this.trackSource(osc, gain);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.09);
    });
  }

  // Feeding Big Meat (munch munch)
  public playEat() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.08, 0.16, 0.24].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 + idx * 40, now + offset);
      osc.frequency.exponentialRampToValueAtTime(120, now + offset + 0.06);

      gain.gain.setValueAtTime(0.15, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      this.trackSource(osc, gain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.07);
    });
  }

  // Vitamin / Medicine cure chime
  public playMedicine() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      this.trackSource(osc, gain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.16);
    });
  }

  // Clean Poop / Flush
  public playFlush() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 0.65;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(1.4, now);
    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.linearRampToValueAtTime(280, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    this.trackSource(noise, gain);

    noise.start(now);
    noise.stop(now + duration + 0.02);
  }

  // Punch / Physical Strike
  public playPunch() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    this.trackSource(osc, gain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Special Energy Blast / Pepper Breath / Laser
  public playBlast() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    this.trackSource(osc, gain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Epic Digivolution Fanfare
  public playDigivolve() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
    arpeggio.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.14, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      this.trackSource(osc, gain);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.26);
    });
  }

  // Victory Jingle (strictly finite stop + clean node disposal)
  public playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.12 }, // C
      { f: 523.25, d: 0.12 }, // C
      { f: 523.25, d: 0.12 }, // C
      { f: 659.25, d: 0.35 }, // E
      { f: 783.99, d: 0.35 }, // G
      { f: 1046.5, d: 0.55 }, // C High
    ];
    let time = now;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, time);
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);
      this.trackSource(osc, gain);
      osc.start(time);
      osc.stop(time + note.d + 0.02);
      time += note.d * 0.9;
    });
  }

  // Aliases for component convenience
  public playEvolution() {
    this.playDigivolve();
  }

  public playHappy() {
    this.playMedicine();
  }

  public playClean() {
    this.playFlush();
  }
}

export const sound = new SoundEngine();

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'alert' = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(35);
        break;
      case 'heavy':
        navigator.vibrate(60);
        break;
      case 'success':
        navigator.vibrate([40, 60, 40]);
        break;
      case 'alert':
        navigator.vibrate([70, 50, 70, 50, 70]);
        break;
    }
  } catch {}
}
