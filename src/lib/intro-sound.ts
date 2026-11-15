// Welcome sound played when the site opens: a slow, airy chord that swells in, a few bell notes
// rising like stars appearing, a question left hanging and asked again higher — curiosity that
// leads into the phenomenon sounds. About 10 seconds, synthesized with Web Audio (browser only).
// It only plays in the hero: leaving the hero fades it out.
//
// Browsers only let a page make sound after the visitor interacts with it (a tap, click or key),
// so `armIntroSound` tries straight away and otherwise waits for that first gesture.

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// D Lydian (D, E, F♯, A, C♯, G♯): bright and floating, a little mysterious.
const PAD = [50, 57, 64, 66, 73]; // D3 A3 E4 F♯4 C♯5
const BELLS = [69, 73, 76, 78, 81]; // A4 C♯5 E5 F♯5 A5
const QUESTION = 80; // G♯5 — the raised 4th, left unresolved
const ANSWER = [76, 73, 69]; // E5 C♯5 A4

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
  filter.frequency.exponentialRampToValueAtTime(1500, at + 7);
  filter.frequency.exponentialRampToValueAtTime(600, at + 10);
  const pad = ctx.createGain();
  pad.gain.setValueAtTime(0.0001, at);
  pad.gain.exponentialRampToValueAtTime(0.16, at + 2.6);
  pad.gain.setValueAtTime(0.16, at + 6.5);
  pad.gain.exponentialRampToValueAtTime(0.0001, at + 10);
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
      o.stop(at + 10.2);
    }
  }

  // 2. A deep sub swell underneath, like the planet itself.
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.value = midi(38); // D2
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(0.0001, at);
  subG.gain.exponentialRampToValueAtTime(0.22, at + 3);
  subG.gain.setValueAtTime(0.22, at + 6);
  subG.gain.exponentialRampToValueAtTime(0.0001, at + 9.8);
  sub.connect(subG).connect(master);
  sub.start(at);
  sub.stop(at + 10);

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
  // An answer that does not resolve: a few notes drift down, then the question returns an
  // octave higher and is left hanging as the phenomenon sounds take over.
  ANSWER.forEach((m, i) => bell(at + 5.6 + i * 0.5, m, 0.08 - i * 0.012));
  bell(at + 7.9, QUESTION + 12, 0.07);

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

  return at + 10.2;
}

export const INTRO_PLAYED_KEY = "earth-jukebox:intro-played";

// Output of the welcome sound while it plays, so it can be faded out when the visitor leaves
// the hero: the welcome sound belongs to the hero only.
let introOut: { ctx: AudioContext; gain: GainNode } | null = null;

/** Fades the welcome sound out (e.g. when the visitor scrolls from the hero to the videos). */
export function fadeOutIntro(seconds = 0.6) {
  if (!introOut || introOut.ctx.state !== "running") return;
  const { ctx, gain } = introOut;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setTargetAtTime(0, ctx.currentTime, seconds / 3);
}

/**
 * Plays the intro when the site opens, on the visitor's first visit only. It never waits for a
 * click: if the browser does not allow sound on arrival (most do not on a first visit), it stays
 * silent and tries again on the next visit. Returns a cleanup function.
 */
export function playIntroOnArrival(): () => void {
  try {
    if (window.localStorage.getItem(INTRO_PLAYED_KEY)) return () => undefined;
  } catch {
    /* storage blocked: still try once */
  }
  const Ctx: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return () => undefined;

  const ctx = new Ctx();
  let closeTimer = 0;
  const finish = () => {
    if (introOut?.ctx === ctx) introOut = null;
    if (ctx.state !== "closed") void ctx.close();
  };
  const start = () => {
    if (ctx.state !== "running" || closeTimer) return;
    const out = ctx.createGain();
    out.connect(ctx.destination);
    introOut = { ctx, gain: out };
    const end = scheduleIntro(ctx, out);
    try {
      window.localStorage.setItem(INTRO_PLAYED_KEY, "1");
    } catch {
      /* ignore */
    }
    closeTimer = window.setTimeout(finish, (end - ctx.currentTime) * 1000 + 300);
  };

  void ctx.resume().then(start);
  // If sound is still blocked shortly after arrival, give up quietly (no click fallback).
  const giveUp = window.setTimeout(() => {
    if (!closeTimer) finish();
  }, 1500);

  return () => {
    window.clearTimeout(giveUp);
    window.clearTimeout(closeTimer);
    finish();
  };
}
