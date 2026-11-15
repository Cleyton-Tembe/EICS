// Pure mapping from video frames to music. No browser APIs here, so it is easy to test.
import type { CategoryId } from "./visualizations";

export interface FrameFeatures {
  /** Mean luminance 0..1 */
  brightness: number;
  /** Dominant hue in degrees 0..360 (saturation-weighted circular mean) */
  hue: number;
  /** Mean saturation 0..1 */
  saturation: number;
  /** Red vs blue balance -1 (cold) .. 1 (warm) */
  warmth: number;
  /** Local contrast / detail 0..1 */
  texture: number;
  /** Left/right luminance balance -1..1 */
  balance: number;
  /** Change since the previous frame 0..1 */
  motion: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function analyzeFrame(
  data: ArrayLike<number>,
  width: number,
  height: number,
  prevLum?: Float32Array | null,
): { features: FrameFeatures; lum: Float32Array } {
  const n = width * height;
  const lum = new Float32Array(n);
  let sumL = 0;
  let sumS = 0;
  let hx = 0;
  let hy = 0;
  let warm = 0;
  let left = 0;
  let right = 0;

  for (let i = 0; i < n; i++) {
    const r = (data[i * 4] ?? 0) / 255;
    const g = (data[i * 4 + 1] ?? 0) / 255;
    const b = (data[i * 4 + 2] ?? 0) / 255;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[i] = l;
    sumL += l;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    sumS += s;

    if (d > 1e-4) {
      let h: number;
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      const rad = (h * 60 * Math.PI) / 180;
      const w = s * max;
      hx += Math.cos(rad) * w;
      hy += Math.sin(rad) * w;
    }

    warm += (r - b) * max;
    if (i % width < width / 2) left += l;
    else right += l;
  }

  let diff = 0;
  let diffCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (x < width - 1) {
        diff += Math.abs(lum[i]! - lum[i + 1]!);
        diffCount++;
      }
      if (y < height - 1) {
        diff += Math.abs(lum[i]! - lum[i + width]!);
        diffCount++;
      }
    }
  }

  let motion = 0;
  if (prevLum && prevLum.length === n) {
    let m = 0;
    for (let i = 0; i < n; i++) m += Math.abs(lum[i]! - prevLum[i]!);
    motion = clamp((m / n) * 10, 0, 1);
  }

  let hue = (Math.atan2(hy, hx) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  return {
    lum,
    features: {
      brightness: n ? sumL / n : 0,
      hue,
      saturation: n ? sumS / n : 0,
      warmth: n ? clamp((warm / n) * 3, -1, 1) : 0,
      texture: diffCount ? clamp((diff / diffCount) * 6, 0, 1) : 0,
      balance: clamp((right - left) / (right + left + 1e-6), -1, 1),
      motion,
    },
  };
}

export type Mode = "maior" | "menor" | "suspenso";

export interface MusicState {
  rootPc: number;
  mode: Mode;
  /** MIDI notes of the sustained chord */
  chord: number[];
  /** MIDI notes the arpeggiator walks through */
  arpNotes: number[];
  /** Arpeggio notes per second */
  rate: number;
  /** Low-pass cutoff in Hz */
  cutoff: number;
  pan: number;
  padLevel: number;
  noiseLevel: number;
  chordName: string;
}

export const NOTE_NAMES_PT = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Lá♭", "Lá", "Si♭", "Si"];

/** Base octave (MIDI of C) for each category's register */
export const CATEGORY_REGISTER: Record<CategoryId, number> = {
  oceanos: 36,
  terra: 43,
  atmosfera: 48,
  gelo: 60,
};

export function mapToMusic(f: FrameFeatures, category: CategoryId): MusicState {
  // Hue walks around the circle of fifths so neighbouring colours give related keys.
  const fifthStep = Math.round(f.hue / 30) % 12;
  const rootPc = (fifthStep * 7) % 12;

  let mode: Mode;
  if (f.saturation < 0.08) mode = "suspenso"; // grey / monochrome frames feel open
  else if (f.warmth > 0.06) mode = "menor"; // warm reds = tension, urgency
  else mode = "maior"; // cool blues = calm

  const root = CATEGORY_REGISTER[category] + rootPc;
  const middle = mode === "menor" ? 3 : mode === "maior" ? 4 : 2;
  const chord = [root, root + middle, root + 7];
  const hasSeventh = f.saturation > 0.35 && mode !== "suspenso";
  if (hasSeventh) chord.push(root + (mode === "menor" ? 10 : 11));

  const scale = mode === "menor" ? [0, 3, 5, 7, 10] : mode === "maior" ? [0, 2, 4, 7, 9] : [0, 2, 5, 7, 9];
  const arpBase = root + 12 + (f.brightness > 0.5 ? 12 : 0);
  const arpNotes = [...scale.map((s) => arpBase + s), arpBase + 12];

  const rate = clamp(0.6 + f.texture * 5 + f.motion * 6, 0.5, 9);
  const cutoff = 250 + Math.pow(clamp(f.brightness, 0, 1), 1.2) * 5200 + f.saturation * 800;

  const modeLabel = mode === "suspenso" ? "sus" : mode;
  const chordName = `${NOTE_NAMES_PT[rootPc]} ${modeLabel}${hasSeventh ? " 7" : ""}`;

  return {
    rootPc,
    mode,
    chord,
    arpNotes,
    rate,
    cutoff,
    pan: clamp(f.balance * 1.5, -0.8, 0.8),
    padLevel: 0.25 + clamp(f.brightness, 0, 1) * 0.35,
    noiseLevel: clamp(f.texture * 0.6 + f.motion * 0.5, 0.02, 0.5),
    chordName,
  };
}

export const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Gentle, time-based features used when a frame cannot be read. */
export function fallbackFeatures(t: number, seed: number): FrameFeatures {
  return {
    brightness: 0.35 + 0.15 * Math.sin(t / 7 + seed),
    hue: (seed * 47 + t * 3) % 360,
    saturation: 0.3 + 0.1 * Math.sin(t / 5),
    warmth: 0.2 * Math.sin(t / 11 + seed),
    texture: 0.3 + 0.1 * Math.sin(t / 3),
    balance: 0.3 * Math.sin(t / 9),
    motion: 0.15,
  };
}
