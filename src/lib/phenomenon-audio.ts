// Web Audio renderer for the natural sound of a phenomenon (wind, rain, ice, fire…).
// It only renders a PhenomenonSound computed by the pure mapping in phenomena.ts.
import type { GrainKind, PhenomenonEvent, PhenomenonSound } from "./phenomena";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class PhenomenonLayer {
  private ctx: AudioContext;
  private out: GainNode;
  private white: AudioBuffer;
  private bedFilter: BiquadFilterNode;
  private bedGain: GainNode;
  private swellA: OscillatorNode;
  private swellB: OscillatorNode;
  private swellGain: GainNode;
  private swellFreqGain: GainNode;
  private rumbleFilter: BiquadFilterNode;
  private rumbleGain: GainNode;
  private tone: OscillatorNode;
  private toneGain: GainNode;
  private sound: PhenomenonSound | null = null;
  private nextEvent: number[] = [];

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 1;
    this.out.connect(destination);

    this.white = this.makeNoise("white", 4);
    const pink = this.makeNoise("pink", 4);
    const brown = this.makeNoise("brown", 4);

    // Continuous bed (wind, surf, rain hiss, city murmur…) with a slow "swell" that makes
    // it breathe like gusts or waves.
    const bedSrc = ctx.createBufferSource();
    bedSrc.buffer = pink;
    bedSrc.loop = true;
    this.bedFilter = ctx.createBiquadFilter();
    this.bedGain = ctx.createGain();
    this.bedGain.gain.value = 0;
    bedSrc.connect(this.bedFilter).connect(this.bedGain).connect(this.out);
    bedSrc.start();

    this.swellA = ctx.createOscillator();
    this.swellB = ctx.createOscillator();
    this.swellGain = ctx.createGain();
    this.swellGain.gain.value = 0;
    this.swellFreqGain = ctx.createGain();
    this.swellFreqGain.gain.value = 0;
    const mixB = ctx.createGain();
    mixB.gain.value = 0.6;
    this.swellA.connect(this.swellGain);
    this.swellB.connect(mixB).connect(this.swellGain);
    this.swellA.connect(this.swellFreqGain);
    mixB.connect(this.swellFreqGain);
    this.swellGain.connect(this.bedGain.gain);
    this.swellFreqGain.connect(this.bedFilter.frequency);
    this.swellA.start();
    this.swellB.start();

    // Deep rumble underneath (storm, deep water, engines).
    const rumbleSrc = ctx.createBufferSource();
    rumbleSrc.buffer = brown;
    rumbleSrc.loop = true;
    this.rumbleFilter = ctx.createBiquadFilter();
    this.rumbleFilter.type = "lowpass";
    this.rumbleGain = ctx.createGain();
    this.rumbleGain.gain.value = 0;
    rumbleSrc.connect(this.rumbleFilter).connect(this.rumbleGain).connect(this.out);
    rumbleSrc.start();

    // Electrical hum (city lights).
    this.tone = ctx.createOscillator();
    this.tone.type = "sawtooth";
    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = "lowpass";
    toneFilter.frequency.value = 380;
    this.toneGain = ctx.createGain();
    this.toneGain.gain.value = 0;
    this.tone.connect(toneFilter).connect(this.toneGain).connect(this.out);
    this.tone.start();
  }

  private makeNoise(color: "white" | "pink" | "brown", seconds: number) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0,
      last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (color === "white") d[i] = w;
      else if (color === "pink") {
        // Paul Kellet's pink-noise filter
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    // Normalise so every colour has a similar loudness.
    let rms = 0;
    for (let i = 0; i < len; i++) rms += d[i]! * d[i]!;
    rms = Math.sqrt(rms / len) || 1;
    for (let i = 0; i < len; i++) d[i] = (d[i]! / rms) * 0.25;
    return buf;
  }

  /** Smoothly follow the new state; the level of the frame drives every parameter. */
  update(sound: PhenomenonSound | null) {
    const t = this.ctx.currentTime;
    const changed = sound?.kind !== this.sound?.kind;
    this.sound = sound;
    if (!sound) {
      this.bedGain.gain.setTargetAtTime(0, t, 0.3);
      this.swellGain.gain.setTargetAtTime(0, t, 0.3);
      this.rumbleGain.gain.setTargetAtTime(0, t, 0.3);
      this.toneGain.gain.setTargetAtTime(0, t, 0.3);
      this.nextEvent = [];
      return;
    }
    const tc = changed ? 0.05 : 0.35;
    const { bed, rumble, tone } = sound;
    if (this.bedFilter.type !== bed.type) this.bedFilter.type = bed.type;
    this.bedFilter.frequency.setTargetAtTime(bed.freq, t, tc);
    this.bedFilter.Q.setTargetAtTime(bed.q, t, tc);
    this.bedGain.gain.setTargetAtTime(bed.gain, t, tc);
    this.swellGain.gain.setTargetAtTime(bed.gain * bed.swellDepth * 0.6, t, tc);
    this.swellFreqGain.gain.setTargetAtTime(bed.freq * bed.freqSwell * 0.6, t, tc);
    this.swellA.frequency.setTargetAtTime(bed.swellRate, t, tc);
    this.swellB.frequency.setTargetAtTime(bed.swellRate * 0.37, t, tc);
    this.rumbleFilter.frequency.setTargetAtTime(rumble.freq, t, tc);
    this.rumbleGain.gain.setTargetAtTime(rumble.gain, t, tc);
    this.tone.frequency.setTargetAtTime(tone.freq, t, tc);
    this.toneGain.gain.setTargetAtTime(tone.gain, t, tc);
    if (changed || this.nextEvent.length !== sound.events.length) {
      this.nextEvent = sound.events.map(() => t + rand(0.05, 0.4));
    }
  }

  /** Restart the event clock (after a pause), so no burst of overdue events plays. */
  resetClock(now: number) {
    this.nextEvent = this.nextEvent.map(() => now + rand(0.05, 0.3));
  }

  /** Schedule discrete sounds (drops, cracks, crackles…) up to `horizon`. */
  schedule(now: number, horizon: number) {
    const s = this.sound;
    if (!s) return;
    s.events.forEach((e, i) => {
      let next = this.nextEvent[i] ?? now;
      if (next < now - 0.2) next = now;
      while (next < horizon) {
        this.play(e, Math.max(next, now));
        const period = 1 / Math.max(0.01, e.rate);
        // Regular events keep a steady rhythm (sprinklers, heartbeat, pings, drops);
        // natural ones arrive at random.
        next += e.regular
          ? period * rand(0.99, 1.01)
          : -Math.log(1 - Math.random() * 0.999) * period;
      }
      this.nextEvent[i] = next;
    });
  }

  private noiseBurst(t: number, dur: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.white;
    const len = dur + 0.05;
    if (len >= this.white.duration) {
      src.loop = true;
      src.start(t);
      src.stop(t + len);
    } else {
      src.start(t, rand(0, this.white.duration - len), len);
    }
    return src;
  }

  private play(e: PhenomenonEvent, t: number) {
    const ctx = this.ctx;
    const pan = ctx.createStereoPanner();
    pan.pan.value = rand(-0.8, 0.8);
    pan.connect(this.out);
    const g = ctx.createGain();
    g.connect(pan);
    const amp = e.gain * rand(0.5, 1);
    const pitch = e.pitch * rand(0.85, 1.15);
    const grain: GrainKind = e.grain;

    switch (grain) {
      case "pingo":
      case "estalido":
      case "jato": {
        const dur =
          grain === "pingo"
            ? rand(0.006, 0.02)
            : grain === "estalido"
              ? rand(0.002, 0.008)
              : rand(0.03, 0.06);
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = pitch;
        f.Q.value = grain === "jato" ? 2 : 1.2;
        const loud = grain === "estalido" && Math.random() < 0.12 ? 2.2 : 1;
        g.gain.setValueAtTime(amp * loud, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.01);
        this.noiseBurst(t, dur + 0.02)
          .connect(f)
          .connect(g);
        break;
      }
      case "gota":
      case "bolha": {
        const o = ctx.createOscillator();
        o.type = "sine";
        const dur = grain === "gota" ? rand(0.06, 0.12) : rand(0.04, 0.1);
        o.frequency.setValueAtTime(pitch, t);
        o.frequency.exponentialRampToValueAtTime(
          pitch * (grain === "gota" ? 1.9 : 2.4),
          t + dur * 0.7,
        );
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(amp, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g);
        o.start(t);
        o.stop(t + dur + 0.02);
        break;
      }
      case "racha": {
        // Sharp crack + low groan of the ice.
        const dur = rand(0.18, 0.45);
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.Q.value = 3;
        f.frequency.setValueAtTime(pitch * 6, t);
        f.frequency.exponentialRampToValueAtTime(pitch, t + dur);
        g.gain.setValueAtTime(amp, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        this.noiseBurst(t, dur).connect(f).connect(g);
        const o = ctx.createOscillator();
        const og = ctx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(pitch * 0.5, t);
        o.frequency.exponentialRampToValueAtTime(pitch * 0.3, t + dur);
        og.gain.setValueAtTime(amp * 0.6, t);
        og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(og).connect(pan);
        o.start(t);
        o.stop(t + dur + 0.02);
        break;
      }
      case "carro": {
        // A car passing: rises, peaks, fades, while it crosses the stereo field.
        const dur = rand(1.6, 3);
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.Q.value = 1.2;
        f.frequency.setValueAtTime(pitch * 0.7, t);
        f.frequency.linearRampToValueAtTime(pitch * 1.2, t + dur * 0.5);
        f.frequency.linearRampToValueAtTime(pitch * 0.6, t + dur);
        const dir = Math.random() < 0.5 ? -1 : 1;
        pan.pan.setValueAtTime(-0.9 * dir, t);
        pan.pan.linearRampToValueAtTime(0.9 * dir, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(amp, t + dur * 0.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        this.noiseBurst(t, dur).connect(f).connect(g);
        break;
      }
      case "rajada": {
        // A gust: rises and falls with a whistling resonance, sweeping across the stereo field.
        const dur = rand(1.4, 2.2);
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.Q.value = 4;
        f.frequency.setValueAtTime(pitch * 0.6, t);
        f.frequency.exponentialRampToValueAtTime(pitch * 1.4, t + dur * 0.45);
        f.frequency.exponentialRampToValueAtTime(pitch * 0.7, t + dur);
        const dir = Math.random() < 0.5 ? -1 : 1;
        pan.pan.setValueAtTime(-0.7 * dir, t);
        pan.pan.linearRampToValueAtTime(0.7 * dir, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(amp, t + dur * 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        this.noiseBurst(t, dur).connect(f).connect(g);
        break;
      }
      case "cristal": {
        // Crystalline ping with a fifth above, ringing out like a sonar.
        pan.pan.value = rand(-0.4, 0.4);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(amp, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        for (const [ratio, k] of [
          [1, 1],
          [1.5, 0.35],
          [3.01, 0.15],
        ] as const) {
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.value = e.pitch * ratio;
          const og = ctx.createGain();
          og.gain.value = k;
          o.connect(og).connect(g);
          o.start(t);
          o.stop(t + 0.95);
        }
        break;
      }
      case "pulso": {
        // Heartbeat: "lub" then a softer "dub".
        pan.pan.value = 0;
        for (const [dt, k] of [
          [0, 1],
          [0.24, 0.65],
        ] as const) {
          const o = ctx.createOscillator();
          o.type = "sine";
          const s0 = t + dt;
          o.frequency.setValueAtTime(e.pitch * 2.2, s0);
          o.frequency.exponentialRampToValueAtTime(e.pitch, s0 + 0.09);
          const og = ctx.createGain();
          og.gain.setValueAtTime(0.0001, s0);
          og.gain.exponentialRampToValueAtTime(e.gain * k, s0 + 0.012);
          og.gain.exponentialRampToValueAtTime(0.0001, s0 + 0.3);
          o.connect(og).connect(pan);
          o.start(s0);
          o.stop(s0 + 0.32);
        }
        break;
      }
      case "sopro":
      case "marulho": {
        const dur = grain === "sopro" ? rand(0.8, 1.6) : rand(0.5, 1.1);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.setValueAtTime(pitch * 0.6, t);
        f.frequency.linearRampToValueAtTime(pitch, t + dur * 0.35);
        f.frequency.linearRampToValueAtTime(pitch * 0.5, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(amp, t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        this.noiseBurst(t, dur).connect(f).connect(g);
        break;
      }
    }
  }
}
