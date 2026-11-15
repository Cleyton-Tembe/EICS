// Welcome sound played when the site opens: a slow, airy chord that swells in, a few bell notes
// rising like stars appearing, and a last high note left hanging — an open question that invites
// the visitor to scroll on. About 9 seconds, synthesized with Web Audio (browser only).
//
// Browsers only let a page make sound after the visitor interacts with it (a tap, click or key),
// so `armIntroSound` tries straight away and otherwise waits for that first gesture.

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// D Lydian (D, E, F♯, A, C♯, G♯): bright and floating, a little mysterious.
const PAD = [50, 57, 64, 66, 73]; // D3 A3 E4 F♯4 C♯5
const BELLS = [69, 73, 76, 78, 81]; // A4 C♯5 E5 F♯5 A5
const QUESTION = 80; // G♯5 — the raised 4th, left unresolved

function impulse(ctx: BaseAudioContext, seconds: number) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

/** Schedules the whole intro on `ctx`, starting at `at`. Returns when it ends. */
export function scheduleIntro(
  ctx: BaseAudioContext,
  out: AudioNode,
  at = ctx.currentTime + 0.05,
): number {
  const master = ctx.createGain();
  master.gain.value = 0.85;
  const verb = ctx.createConvolver();
  verb.buffer = impulse(ctx, 4.5);
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  master.connect(out);
  master.connect(verb).connect(wet).connect(out);

  // Echo for the bells: notes repeat softly, like light bouncing.
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.42;
  const fb = ctx.createGain();
  fb.gain.value = 0.38;
  const echo = ctx.createGain();
  echo.gain.value = 0.5;
  delay.connect(fb).connect(delay);
  delay.connect(echo).connect(master);

  // 1. The pad swells in, opens up and fades.
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(300, at);
  filter.frequency.exponentialRampToValueAtTime(2600, at + 3.5);
  filter.frequency.exponentialRampToValueAtTime(700, at + 8.5);
  const pad = ctx.createGain();
  pad.gain.setValueAtTime(0.0001, at);
  pad.gain.exponentialRampToValueAtTime(0.16, at + 2.6);
  pad.gain.setValueAtTime(0.16, at + 5);
  pad.gain.exponentialRampToValueAtTime(0.0001, at + 9);
  filter.connect(pad).connect(master);
  for (const n of PAD) {
    for (const det of [-7, 7]) {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = midi(n);
      o.detune.value = det;
      const g = ctx.createGain();
      g.gain.value = 0.12;
      o.connect(g).connect(filter);
      o.start(at);
      o.stop(at + 9.2);
    }
  }

  // 2. A deep sub swell underneath, like the planet itself.
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.value = midi(38); // D2
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(0.0001, at);
  subG.gain.exponentialRampToValueAtTime(0.22, at + 3);
  subG.gain.exponentialRampToValueAtTime(0.0001, at + 8.5);
  sub.connect(subG).connect(master);
  sub.start(at);
  sub.stop(at + 8.7);

  // 3. Bells rising like stars appearing, then a last high note left hanging.
  const bell = (t: number, m: number, amp: number) => {
    const f = midi(m);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(amp, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    const pan = ctx.createStereoPanner();
    pan.pan.value = ((m % 5) - 2) * 0.25;
    env.connect(pan);
    pan.connect(master);
    pan.connect(delay);
    for (const [ratio, g] of [
      [1, 1],
      [2.76, 0.28],
      [5.4, 0.08],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f * ratio;
      const og = ctx.createGain();
      og.gain.value = g;
      o.connect(og).connect(env);
      o.start(t);
      o.stop(t + 2.7);
    }
  };
  BELLS.forEach((m, i) => bell(at + 1.3 + i * 0.42, m, 0.11 - i * 0.01));
  bell(at + 4.1, QUESTION, 0.09);

  // 4. A faint breath of "solar wind" to finish.
  const len = Math.floor(ctx.sampleRate * 3);
  const nb = ctx.createBuffer(1, len, ctx.sampleRate);
  const nd = nb.getChannelData(0);
  for (let i = 0; i < len; i++) nd[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = nb;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 2;
  bp.frequency.setValueAtTime(600, at + 3.5);
  bp.frequency.exponentialRampToValueAtTime(3200, at + 6.5);
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, at + 3.5);
  ng.gain.exponentialRampToValueAtTime(0.05, at + 5.2);
  ng.gain.exponentialRampToValueAtTime(0.0001, at + 6.5);
  noise.connect(bp).connect(ng).connect(master);
  noise.start(at + 3.5);

  return at + 9.5;
}

export type IntroState = "waiting" | "playing" | "done";

/**
 * Plays the intro once: right away if the browser allows sound, otherwise on the visitor's
 * first tap, click or key press. Returns a cleanup function.
 */
export function armIntroSound(onState: (s: IntroState) => void): () => void {
  const Ctx: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) {
    onState("done");
    return () => undefined;
  }
  const ctx = new Ctx();
  let started = false;
  let timer = 0;
  const events = ["pointerdown", "keydown", "touchend"] as const;

  const start = () => {
    if (started || ctx.state !== "running") return;
    started = true;
    events.forEach((e) => window.removeEventListener(e, onGesture, true));
    const end = scheduleIntro(ctx, ctx.destination);
    onState("playing");
    timer = window.setTimeout(
      () => {
        onState("done");
        void ctx.close();
      },
      (end - ctx.currentTime) * 1000 + 300,
    );
  };
  function onGesture() {
    void ctx.resume().then(start);
  }

  onState("waiting");
  // Some browsers allow sound straight away (e.g. after earlier visits).
  void ctx.resume().then(start);
  events.forEach((e) => window.addEventListener(e, onGesture, { capture: true, passive: true }));

  return () => {
    events.forEach((e) => window.removeEventListener(e, onGesture, true));
    window.clearTimeout(timer);
    if (ctx.state !== "closed") void ctx.close();
  };
}
