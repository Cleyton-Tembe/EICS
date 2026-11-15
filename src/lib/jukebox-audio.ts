// Web Audio synth that turns MusicState into a soundscape. Browser-only: create it from a
// click handler (browsers only allow audio after a user gesture).
import type { CategoryId } from "./visualizations";
import { midiToFreq, type MusicState } from "./sonification";
import type { PhenomenonSound } from "./phenomena";
import { PhenomenonLayer } from "./phenomenon-audio";

type PluckKind = "sine" | "triangle" | "bell";

interface Voice {
  pad: OscillatorType;
  pluck: PluckKind;
  noiseFreq: number;
  noiseQ: number;
  lfoRate: number;
  lfoDepth: number;
  pulse: boolean;
}

const VOICES: Record<CategoryId, Voice> = {
  atmosfera: {
    pad: "sine",
    pluck: "sine",
    noiseFreq: 1400,
    noiseQ: 0.6,
    lfoRate: 0.07,
    lfoDepth: 0.5,
    pulse: false,
  },
  oceanos: {
    pad: "triangle",
    pluck: "sine",
    noiseFreq: 450,
    noiseQ: 0.5,
    lfoRate: 0.11,
    lfoDepth: 1,
    pulse: false,
  },
  gelo: {
    pad: "sine",
    pluck: "bell",
    noiseFreq: 7000,
    noiseQ: 1.8,
    lfoRate: 0.3,
    lfoDepth: 0.25,
    pulse: false,
  },
  terra: {
    pad: "sawtooth",
    pluck: "triangle",
    noiseFreq: 260,
    noiseQ: 0.9,
    lfoRate: 0.45,
    lfoDepth: 0.3,
    pulse: true,
  },
};

export class JukeboxAudio {
  readonly ctx: AudioContext;
  readonly analyser: AnalyserNode;
  private master: GainNode;
  private bus: GainNode;
  private filter: BiquadFilterNode;
  private panner: StereoPannerNode;
  private padGain: GainNode;
  private padOscs: OscillatorNode[] = [];
  private noiseFilter: BiquadFilterNode;
  private noiseGain: GainNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private reverbSend: GainNode;
  private phenomenon: PhenomenonLayer;
  private voice: Voice = VOICES.atmosfera;
  private music: MusicState | null = null;
  private nextNoteTime = 0;
  private step = 0;
  private timer: number | null = null;
  private active = false;
  private muted = false;

  constructor() {
    const Ctx: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.master.connect(comp).connect(this.analyser).connect(ctx.destination);

    // Reverb built from a decaying noise impulse.
    const reverb = ctx.createConvolver();
    reverb.buffer = this.makeImpulse(3.2);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.45;
    this.reverbSend.connect(reverb).connect(this.master);

    this.panner = ctx.createStereoPanner();
    this.bus = ctx.createGain();
    this.bus.gain.value = 0.8;
    this.panner.connect(this.bus);
    this.bus.connect(this.master);
    this.bus.connect(this.reverbSend);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1200;
    this.filter.Q.value = 0.8;
    this.filter.connect(this.panner);

    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.0;
    this.padGain.connect(this.filter);
    for (let i = 0; i < 4; i++) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = 220;
      o.detune.value = (i - 1.5) * 6;
      const g = ctx.createGain();
      g.gain.value = 0.18;
      o.connect(g).connect(this.padGain);
      o.start();
      this.padOscs.push(o);
    }

    // Texture noise (wind / surf / shimmer / rumble)
    const noise = ctx.createBufferSource();
    noise.buffer = this.makeNoise(2);
    noise.loop = true;
    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = "bandpass";
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0;
    noise.connect(this.noiseFilter).connect(this.noiseGain).connect(this.panner);
    noise.start();

    this.lfo = ctx.createOscillator();
    this.lfoGain = ctx.createGain();
    this.lfo.connect(this.lfoGain).connect(this.noiseGain.gain);
    this.lfo.start();

    // Natural sound of the phenomenon (wind, rain, ice…), on its own bus next to the music.
    const phenBus = ctx.createGain();
    phenBus.gain.value = 0.9;
    const phenVerb = ctx.createGain();
    phenVerb.gain.value = 0.35;
    phenBus.connect(this.master);
    phenBus.connect(phenVerb).connect(this.reverbSend);
    this.phenomenon = new PhenomenonLayer(ctx, phenBus);

    this.setCategory("atmosfera");
  }

  private makeNoise(seconds: number) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  private makeImpulse(seconds: number) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  async resume() {
    if (this.ctx.state !== "running") await this.ctx.resume();
    if (this.timer === null) {
      this.nextNoteTime = this.ctx.currentTime + 0.1;
      this.timer = window.setInterval(() => this.schedule(), 25);
    }
  }

  setCategory(category: CategoryId) {
    this.voice = VOICES[category];
    const t = this.ctx.currentTime;
    for (const o of this.padOscs) o.type = this.voice.pad;
    this.noiseFilter.frequency.setTargetAtTime(this.voice.noiseFreq, t, 0.3);
    this.noiseFilter.Q.setTargetAtTime(this.voice.noiseQ, t, 0.3);
    this.lfo.frequency.setTargetAtTime(this.voice.lfoRate, t, 0.3);
  }

  /** Whether a visualization is on screen; fades the whole soundscape in or out. */
  setActive(active: boolean) {
    this.active = active;
    this.applyMaster();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyMaster();
  }

  private applyMaster() {
    const target = this.active && !this.muted ? 0.7 : 0;
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
  }

  update(music: MusicState) {
    this.music = music;
    const t = this.ctx.currentTime;
    const notes =
      music.chord.length >= 4 ? music.chord : [...music.chord, (music.chord[0] ?? 48) - 12];
    this.padOscs.forEach((o, i) => o.frequency.setTargetAtTime(midiToFreq(notes[i] ?? 48), t, 0.6));
    const padScale = this.voice.pad === "sawtooth" ? 0.35 : 1;
    this.padGain.gain.setTargetAtTime(music.padLevel * padScale, t, 0.5);
    this.filter.frequency.setTargetAtTime(music.cutoff, t, 0.4);
    this.panner.pan.setTargetAtTime(music.pan, t, 0.5);
    const noiseBase = music.noiseLevel * 0.35;
    this.noiseGain.gain.setTargetAtTime(noiseBase, t, 0.5);
    this.lfoGain.gain.setTargetAtTime(noiseBase * this.voice.lfoDepth, t, 0.5);
  }

  /** Sound of the phenomenon for the current frame; `null` silences it. */
  updatePhenomenon(sound: PhenomenonSound | null) {
    this.phenomenon.update(sound);
  }

  private schedule() {
    if (!this.active || this.muted) {
      this.phenomenon.resetClock(this.ctx.currentTime);
    } else {
      this.phenomenon.schedule(this.ctx.currentTime, this.ctx.currentTime + 0.12);
    }
    const m = this.music;
    if (!m || !this.active || this.muted) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
      return;
    }
    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      this.playStep(this.nextNoteTime, m);
      this.nextNoteTime += 1 / m.rate;
      this.step++;
    }
  }

  private playStep(t: number, m: MusicState) {
    // Up-and-down walk through the scale with an occasional leap, so it stays musical.
    const len = m.arpNotes.length;
    const cycle = len * 2 - 2;
    let idx = this.step % cycle;
    if (idx >= len) idx = cycle - idx;
    if (Math.random() < 0.15) idx = Math.floor(Math.random() * len);
    const freq = midiToFreq(m.arpNotes[idx] ?? 60);
    const velocity = 0.08 + Math.min(0.12, m.padLevel * 0.15);
    this.pluck(t, freq, velocity);

    if (this.voice.pulse && this.step % 4 === 0) this.thump(t, midiToFreq((m.chord[0] ?? 48) - 12));
  }

  private pluck(t: number, freq: number, velocity: number) {
    const ctx = this.ctx;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(velocity, t + 0.008);
    const decay = this.voice.pluck === "bell" ? 1.8 : 0.9;
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    env.connect(this.panner);

    const o = ctx.createOscillator();
    o.type = this.voice.pluck === "triangle" ? "triangle" : "sine";
    o.frequency.value = freq;
    o.connect(env);
    o.start(t);
    o.stop(t + decay + 0.05);

    if (this.voice.pluck === "bell") {
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      g2.gain.value = 0.35;
      o2.frequency.value = freq * 2.76; // inharmonic partial = bell
      o2.connect(g2).connect(env);
      o2.start(t);
      o2.stop(t + decay + 0.05);
    }
  }

  private thump(t: number, freq: number) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq * 2, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + 0.4);
  }

  dispose() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    void this.ctx.close();
  }
}
