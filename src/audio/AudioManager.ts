export type AudioCue = "launch" | "arrival" | "movement" | "proximity" | "interaction" | "dialogue" | "correct" | "incorrect" | "stamp" | "low-oxygen" | "failure" | "travel";
export type AudioSettings = {
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
  status: "needs-gesture" | "ready" | "unavailable";
};
const AUDIO_SAVE_KEY = "astralis-audio-v1";
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Original Web Audio score and effects. No downloaded audio, NASA recordings,
 * wind, or atmosphere-transmitted lunar footsteps. This module never reads
 * or writes the player's progress or changes gameplay.
 */
export class AudioManager {
  private context: AudioContext | null = null;
  private musicBus: GainNode | null = null;
  private effectsBus: GainNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicNodes = new Set<OscillatorNode>();
  private exploring = false;
  private chordIndex = 0;
  private lastPlayed = new Map<AudioCue, number>();
  private listeners = new Set<() => void>();
  private snapshot: AudioSettings = { muted: false, musicVolume: .3, sfxVolume: .55, status: "needs-gesture" };

  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(AUDIO_SAVE_KEY) ?? "null");
      if (saved && typeof saved.muted === "boolean") {
        this.snapshot = {
          ...this.snapshot, muted: saved.muted,
          musicVolume: typeof saved.musicVolume === "number" && Number.isFinite(saved.musicVolume) ? clamp(saved.musicVolume) : .3,
          sfxVolume: typeof saved.sfxVolume === "number" && Number.isFinite(saved.sfxVolume) ? clamp(saved.sfxVolume) : .55
        };
      }
    } catch { /* Audio preferences are optional; player progress is separate. */ }
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => this.syncMusic());
  }

  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  getSnapshot = () => this.snapshot;

  private update(settings: Partial<AudioSettings>, persist = true) {
    this.snapshot = { ...this.snapshot, ...settings };
    if (persist) {
      try {
        const { muted, musicVolume, sfxVolume } = this.snapshot;
        localStorage.setItem(AUDIO_SAVE_KEY, JSON.stringify({ muted, musicVolume, sfxVolume }));
      } catch { /* A blocked preference store does not disable the controls. */ }
    }
    this.applyVolumes();
    this.syncMusic();
    this.listeners.forEach(listener => listener());
  }

  async unlock() {
    if (this.snapshot.status === "unavailable") return;
    try {
      if (!this.context) {
        const Constructor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Constructor) { this.update({ status: "unavailable" }, false); return; }
        this.context = new Constructor();
        this.musicBus = this.context.createGain();
        this.effectsBus = this.context.createGain();
        this.musicBus.connect(this.context.destination);
        this.effectsBus.connect(this.context.destination);
        this.applyVolumes();
      }
      if (this.context.state === "suspended") await this.context.resume();
      this.update({ status: this.context.state === "running" ? "ready" : "needs-gesture" }, false);
    } catch {
      this.update({ status: "unavailable" }, false);
    }
  }

  setMuted(muted: boolean) { this.update({ muted }); }
  setMusicVolume(value: number) { this.update({ musicVolume: clamp(value) }); }
  setSfxVolume(value: number) { this.update({ sfxVolume: clamp(value) }); }
  setExploring(exploring: boolean) { this.exploring = exploring; this.syncMusic(); }

  private applyVolumes() {
    if (!this.context) return;
    const { muted, musicVolume, sfxVolume } = this.snapshot;
    this.musicBus?.gain.setTargetAtTime(muted ? 0 : musicVolume * .32, this.context.currentTime, .04);
    this.effectsBus?.gain.setTargetAtTime(muted ? 0 : sfxVolume * .24, this.context.currentTime, .02);
  }

  private syncMusic() {
    const shouldPlay = this.exploring && !this.snapshot.muted && this.snapshot.musicVolume > 0
      && this.context?.state === "running" && !document.hidden;
    if (shouldPlay && !this.musicTimer) {
      this.playAmbientChord();
      this.musicTimer = setInterval(() => this.playAmbientChord(), 6500);
    } else if (!shouldPlay && this.musicTimer) {
      clearInterval(this.musicTimer); this.musicTimer = null;
      this.musicNodes.forEach(node => { try { node.stop(); } catch { /* already ended */ } });
      this.musicNodes.clear();
    }
  }

  private playAmbientChord() {
    const ctx = this.context, bus = this.musicBus;
    if (!ctx || !bus) return;
    const chords = [
      [130.81, 196, 246.94, 293.66], [110, 164.81, 220, 261.63],
      [87.31, 174.61, 220, 261.63], [98, 146.83, 196, 246.94]
    ];
    const notes = chords[this.chordIndex++ % chords.length];
    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      oscillator.type = "sine"; oscillator.frequency.value = frequency;
      oscillator.detune.value = index % 2 ? 3 : -3;
      const start = ctx.currentTime + index * .15;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.14, start + 2.5);
      gain.gain.linearRampToValueAtTime(.09, start + 5);
      gain.gain.linearRampToValueAtTime(0, start + 8.5);
      oscillator.connect(gain); gain.connect(bus);
      this.musicNodes.add(oscillator);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.musicNodes.delete(oscillator); };
      oscillator.start(start); oscillator.stop(start + 8.6);
    });
  }

  private tone(frequency: number, delay: number, duration: number, volume = .35, endFrequency?: number, type: OscillatorType = "sine") {
    const ctx = this.context, bus = this.effectsBus;
    if (!ctx || !bus) return;
    const oscillator = ctx.createOscillator(), gain = ctx.createGain(), start = ctx.currentTime + delay;
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain); gain.connect(bus);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(start); oscillator.stop(start + duration + .02);
  }

  private suitNoise(duration = .075, volume = .16) {
    const ctx = this.context, bus = this.effectsBus;
    if (!ctx || !bus) return;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = buffer; filter.type = "bandpass"; filter.frequency.value = 850; filter.Q.value = 1.8;
    gain.gain.value = volume; source.connect(filter); filter.connect(gain); gain.connect(bus);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start();
  }

  play(cue: AudioCue) {
    if (this.snapshot.muted || this.context?.state !== "running" || document.hidden) return;
    const now = performance.now(), cooldown = cue === "movement" ? 330 : cue === "low-oxygen" ? 4000 : 120;
    if (now - (this.lastPlayed.get(cue) ?? -Infinity) < cooldown) return;
    this.lastPlayed.set(cue, now);
    switch (cue) {
      case "launch":
        this.tone(130.81, 0, .7, .18, 261.63);
        this.tone(261.63, .17, .56, .15, 392);
        this.tone(523.25, .38, .74, .14, 783.99);
        break;
      case "movement": this.suitNoise(); break;
      case "arrival": [196, 293.66, 392, 587.33].forEach((n, i) => this.tone(n, i * .13, .6, .22)); break;
      case "proximity": this.tone(783.99, 0, .18, .2); this.tone(1046.5, .12, .3, .16); break;
      case "interaction": this.suitNoise(.06, .08); this.tone(440, 0, .24, .3, 660); break;
      case "dialogue": this.tone(523.25, 0, .08, .12); this.tone(659.25, .045, .14, .08); break;
      case "correct": [523.25, 659.25, 783.99].forEach((n, i) => this.tone(n, i * .09, .38, .24)); break;
      case "incorrect": this.tone(311.13, 0, .26, .3, 196, "triangle"); this.suitNoise(.09, .08); break;
      case "stamp": [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => this.tone(n, i * .09, .7, .26)); break;
      case "low-oxygen": this.tone(440, .25, .18, .23); this.tone(440, .65, .22, .23); break;
      case "failure": this.tone(196, 0, .8, .3, 73.42, "triangle"); this.tone(98, .3, 1, .25); break;
      case "travel": this.tone(146.83, 0, 1.2, .24, 880); this.tone(293.66, .3, 1.1, .2, 1174.66); break;
    }
  }
}

export const audioManager = new AudioManager();
