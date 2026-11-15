// Pure mapping from a video frame to "how strong is the phenomenon right now" and from that
// level to the natural sound of the phenomenon (wind, rain, ice cracking…). No browser APIs
// here, so it is easy to test. The Web Audio side (phenomenon-audio.ts) only renders a
// PhenomenonSound.
//
// Each visualization measures its phenomenon from the colours NASA used to encode the data
// (e.g. red = ice mass lost, purple/blue = ozone hole). The ranges below were calibrated on
// the real SVS videos (5th–95th percentile of the raw measure over the whole video, sampled
// at 128×72), so level 0 is the calmest frame of that video and 1 the most intense one.

export const PHENOMENON_SAMPLE_W = 128;
export const PHENOMENON_SAMPLE_H = 72;

/** The natural sound that represents a phenomenon. */
export type SoundKind =
  | "furacao"
  | "estratosfera"
  | "fumo"
  | "fogo"
  | "correntes"
  | "ondas"
  | "temporal"
  | "bolhas"
  | "degelo"
  | "glaciar"
  | "aspersores"
  | "chuva"
  | "cidade"
  | "rio";

export type MetricId =
  | "hurricane"
  | "ozoneHole"
  | "co2"
  | "warmShare"
  | "currents"
  | "sargassum"
  | "elNino"
  | "bloom"
  | "iceLoss"
  | "glacierIce"
  | "crops"
  | "lakeWater"
  | "cityLights"
  | "reservoir";

/** Region of the frame to look at, as fractions: [x0, y0, x1, y1]. */
export type Region = [number, number, number, number];

export interface PhenomenonSpec {
  kind: SoundKind;
  metric: MetricId;
  /** Raw values mapped to level 0 and level 1 (calibrated on the real video). */
  range: [number, number];
  /** Level goes up when the raw measure goes down (e.g. less glacier ice = more retreat). */
  invert?: boolean;
  region?: Region;
  /** 0..1 — how fast the level follows the frame (higher = faster). */
  smoothing?: number;
  /** What you hear — shown to users and screen readers. */
  sound: string;
  /** What in the image drives the level. */
  measures: string;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const clamp01 = (x: number) => clamp(x, 0, 1);

/** Hue in [a, b) on the colour wheel; wraps when a > b (e.g. reds 340→20). */
const inHue = (h: number, a: number, b: number) => (a < b ? h >= a && h < b : h >= a || h < b);

type Weigher = (h: number, s: number, v: number) => number;

// Weights per pixel (h in degrees, s and v 0..1). The first matching rule wins.
const WEIGHERS: Record<Exclude<MetricId, "warmShare" | "elNino">, Weigher> = {
  // Radar rain (red heaviest, then yellow, green) and bright storm clouds.
  hurricane: (h, s, v) =>
    inHue(h, 340, 20) && s > 0.5 && v > 0.4
      ? 1
      : inHue(h, 40, 70) && s > 0.5 && v > 0.5
        ? 0.6
        : inHue(h, 70, 160) && s > 0.4 && v > 0.35
          ? 0.35
          : s < 0.18 && v > 0.75
            ? 0.5
            : 0,
  // Total-ozone colour scale: purple/blue = the hole.
  ozoneHole: (h, s, v) =>
    inHue(h, 250, 300) && s > 0.35 && v > 0.2
      ? 1
      : inHue(h, 215, 250) && s > 0.35 && v > 0.2
        ? 0.8
        : 0,
  // Orange/yellow CO₂ plumes, brighter = denser.
  co2: (h, s, v) => (inHue(h, 10, 60) && s > 0.25 ? v : 0),
  // Bright streamlines of moving water.
  currents: (h, s, v) => ((inHue(h, 180, 240) && v > 0.6) || (s < 0.3 && v > 0.7) ? 1 : 0),
  // Sargassum density squares (red = most, yellow, cyan = least).
  sargassum: (h, s, v) =>
    inHue(h, 340, 20) && s > 0.5 && v > 0.4
      ? 1
      : inHue(h, 40, 70) && s > 0.45 && v > 0.45
        ? 0.7
        : inHue(h, 160, 200) && s > 0.4 && v > 0.45
          ? 0.4
          : 0,
  // Harmful algal bloom intensity (red/orange = most).
  bloom: (h, s, v) =>
    inHue(h, 340, 45) && s > 0.3 && v > 0.35
      ? 1
      : inHue(h, 45, 70) && s > 0.3 && v > 0.45
        ? 0.7
        : inHue(h, 160, 200) && s > 0.35 && v > 0.5
          ? 0.4
          : 0,
  // GRACE / ICESat-2 scale: dark red = most mass/height lost, then red, orange, peach.
  iceLoss: (h, s, v) =>
    inHue(h, 345, 20) && s > 0.5 && v > 0.1 && v < 0.6
      ? 1
      : inHue(h, 345, 20) && s > 0.5 && v >= 0.6
        ? 0.85
        : inHue(h, 20, 40) && s > 0.4 && v > 0.3
          ? 0.55
          : inHue(h, 15, 45) && s > 0.15 && s <= 0.4 && v > 0.7
            ? 0.25
            : 0,
  // Landsat false colour: glacier ice is bright cyan.
  glacierIce: (h, s, v) => (inHue(h, 170, 215) && s > 0.35 && v > 0.55 ? 1 : 0),
  // Landsat false colour: growing crops are red circles.
  crops: (h, s, v) => (inHue(h, 330, 15) && s > 0.45 && v > 0.3 ? 1 : 0),
  // Natural colour: green/teal water over the red desert.
  lakeWater: (h, s, v) => (inHue(h, 100, 190) && s > 0.3 && v > 0.2 ? 1 : 0),
  // Golden city lights on the night side, brighter = more.
  cityLights: (h, s, v) => (inHue(h, 15, 65) && s > 0.25 && v > 0.12 ? v : 0),
  // Dark teal reservoir water behind the dams.
  reservoir: (h, s, v) => (inHue(h, 140, 215) && s > 0.15 && v > 0.05 && v < 0.4 ? 1 : 0),
};

function hsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d > 1e-4) {
    if (max === r) h = ((((g - b) / d) % 6) + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, max];
}

function regionMean(
  data: ArrayLike<number>,
  width: number,
  height: number,
  region: Region,
  weigh: Weigher,
): number {
  const [x0, y0, x1, y1] = region;
  const xa = Math.floor(x0 * width);
  const xb = Math.min(width, Math.ceil(x1 * width));
  const ya = Math.floor(y0 * height);
  const yb = Math.min(height, Math.ceil(y1 * height));
  let sum = 0;
  let n = 0;
  for (let y = ya; y < yb; y++) {
    for (let x = xa; x < xb; x++) {
      const i = (y * width + x) * 4;
      const [h, s, v] = hsv(
        (data[i] ?? 0) / 255,
        (data[i + 1] ?? 0) / 255,
        (data[i + 2] ?? 0) / 255,
      );
      sum += weigh(h, s, v);
      n++;
    }
  }
  return n ? sum / n : 0;
}

/** Share of the temperature curve that is warm (red > orange > yellow) vs cold (blue). */
function warmShare(data: ArrayLike<number>, width: number, height: number): number {
  let warm = 0;
  let total = 0;
  for (let i = 0; i < width * height; i++) {
    const [h, s, v] = hsv(
      (data[i * 4] ?? 0) / 255,
      (data[i * 4 + 1] ?? 0) / 255,
      (data[i * 4 + 2] ?? 0) / 255,
    );
    if (inHue(h, 340, 15) && s > 0.5 && v > 0.25) {
      warm += 1;
      total++;
    } else if (inHue(h, 15, 40) && s > 0.5 && v > 0.4) {
      warm += 0.75;
      total++;
    } else if (inHue(h, 40, 65) && s > 0.5 && v > 0.5) {
      warm += 0.5;
      total++;
    } else if (inHue(h, 190, 250) && s > 0.3 && v > 0.2) {
      total++;
    }
  }
  return total ? warm / total : 0;
}

const productive: Weigher = (h, s, v) => (inHue(h, 50, 160) && s > 0.35 && v > 0.35 ? 1 : 0);

/**
 * El Niño video: 2026 on top, 2025 below. El Niño stops the cold, nutrient-rich water
 * rising in the equatorial Pacific, so the 2026 tongue loses green compared with 2025.
 */
function elNino(data: ArrayLike<number>, width: number, height: number, r: Region): number {
  const top: Region = [r[0], r[1] * 0.5, r[2], r[3] * 0.5];
  const bottom: Region = [r[0], 0.5 + r[1] * 0.5, r[2], 0.5 + r[3] * 0.5];
  return (
    regionMean(data, width, height, bottom, productive) -
    regionMean(data, width, height, top, productive)
  );
}

/** Raw measure of the phenomenon in one RGBA frame. */
export function measurePhenomenon(
  data: ArrayLike<number>,
  width: number,
  height: number,
  spec: Pick<PhenomenonSpec, "metric" | "region">,
): number {
  const region = spec.region ?? [0, 0, 1, 1];
  if (spec.metric === "warmShare") return warmShare(data, width, height);
  if (spec.metric === "elNino") return elNino(data, width, height, region);
  return regionMean(data, width, height, region, WEIGHERS[spec.metric]);
}

/** Raw measure → level 0..1 using the calibrated range. */
export function phenomenonLevel(
  raw: number,
  spec: Pick<PhenomenonSpec, "range" | "invert">,
): number {
  const [lo, hi] = spec.range;
  const t = hi === lo ? 0 : clamp01((raw - lo) / (hi - lo));
  return spec.invert ? 1 - t : t;
}

/** Follows the frame without jitter. `null` = first frame, jump straight to it. */
export function smoothLevel(prev: number | null, next: number, smoothing = 0.25): number {
  if (prev === null) return next;
  return prev + (next - prev) * clamp01(smoothing);
}

/** Gentle, time-based level used when a frame cannot be read. */
export function fallbackLevel(t: number): number {
  return 0.45 + 0.25 * Math.sin(t / 6);
}

export type IntensityLabel = "baixa" | "média" | "alta";

export function intensityLabel(level: number): IntensityLabel {
  return level < 0.34 ? "baixa" : level < 0.67 ? "média" : "alta";
}

// ---------------------------------------------------------------------------------------
// Level → sound. Every parameter moves with the level: louder, higher-pitched and busier
// when the phenomenon is strong; quiet, low and sparse when it is weak.

export type GrainKind =
  | "pingo" // raindrop tick
  | "estalido" // fire crackle
  | "gota" // water drip "plink"
  | "bolha" // bubble
  | "racha" // ice crack
  | "jato" // sprinkler spray
  | "carro" // car passing by
  | "rajada" // gust of wind sweeping past (hurricane rain bands)
  | "cristal" // crystalline ping, like a sonar
  | "pulso" // heartbeat "lub-dub"
  | "sopro" // gas puff
  | "marulho"; // wave lapping

type Range = [number, number];
export type FilterType = "lowpass" | "bandpass" | "highpass";

interface Recipe {
  bed: {
    type: FilterType;
    gain: Range;
    freq: Range;
    q: Range;
    swellRate: Range;
    /** 0..1 how much the bed volume breathes (gusts, waves). */
    swellDepth: number;
    /** 0..1 how much the filter frequency follows the swell (wind howl, wave wash). */
    freqSwell: number;
  };
  rumble?: { gain: Range; freq: Range };
  tone?: { gain: Range; freq: Range };
  events: { grain: GrainKind; rate: Range; gain: Range; pitch: Range; regular?: boolean }[];
}

const RECIPES: Record<SoundKind, Recipe> = {
  furacao: {
    // Wind with a whistle, a deep roar underneath, dense rain, and gusts that come in a steady
    // rhythm like the rain bands turning around the eye.
    bed: {
      type: "bandpass",
      gain: [0.1, 0.5],
      freq: [300, 1000],
      q: [1, 3],
      swellRate: [0.15, 0.5],
      swellDepth: 0.5,
      freqSwell: 0.4,
    },
    rumble: { gain: [0.08, 0.5], freq: [60, 150] },
    events: [
      { grain: "rajada", rate: [0.35, 1.3], gain: [0.12, 0.5], pitch: [350, 1200], regular: true },
      { grain: "pingo", rate: [10, 120], gain: [0.02, 0.07], pitch: [2500, 5500] },
    ],
  },
  estratosfera: {
    // Thin high wind with steady crystalline pings, like a sonar: faster and higher as the hole grows.
    bed: {
      type: "bandpass",
      gain: [0.12, 0.9],
      freq: [1300, 4200],
      q: [2, 5],
      swellRate: [0.05, 0.2],
      swellDepth: 0.5,
      freqSwell: 0.25,
    },
    rumble: { gain: [0.02, 0.08], freq: [80, 140] },
    events: [
      { grain: "cristal", rate: [1, 4], gain: [0.05, 0.18], pitch: [1100, 2600], regular: true },
    ],
  },
  fumo: {
    bed: {
      type: "lowpass",
      gain: [0.08, 0.5],
      freq: [220, 900],
      q: [0.7, 1.2],
      swellRate: [0.07, 0.22],
      swellDepth: 0.6,
      freqSwell: 0.3,
    },
    rumble: { gain: [0.06, 0.35], freq: [55, 110] },
    events: [{ grain: "sopro", rate: [0.15, 1.4], gain: [0.06, 0.25], pitch: [300, 900] }],
  },
  fogo: {
    // A heartbeat that speeds up with the heat (a planet with a fever), under the crackle of fire.
    bed: {
      type: "lowpass",
      gain: [0.05, 0.3],
      freq: [200, 750],
      q: [0.8, 0.8],
      swellRate: [0.2, 0.6],
      swellDepth: 0.3,
      freqSwell: 0.2,
    },
    rumble: { gain: [0.04, 0.25], freq: [60, 120] },
    events: [
      { grain: "pulso", rate: [0.8, 2.2], gain: [0.18, 0.55], pitch: [45, 90], regular: true },
      { grain: "estalido", rate: [2, 40], gain: [0.05, 0.18], pitch: [1400, 5200] },
    ],
  },
  correntes: {
    bed: {
      type: "lowpass",
      gain: [0.08, 0.45],
      freq: [300, 1300],
      q: [0.6, 1],
      swellRate: [0.08, 0.22],
      swellDepth: 0.7,
      freqSwell: 0.4,
    },
    rumble: { gain: [0.05, 0.3], freq: [60, 130] },
    events: [{ grain: "bolha", rate: [0.4, 6], gain: [0.03, 0.08], pitch: [250, 800] }],
  },
  ondas: {
    bed: {
      type: "lowpass",
      gain: [0.08, 0.45],
      freq: [400, 1600],
      q: [0.7, 1],
      swellRate: [0.1, 0.25],
      swellDepth: 0.8,
      freqSwell: 0.5,
    },
    rumble: { gain: [0.03, 0.2], freq: [70, 120] },
    events: [{ grain: "marulho", rate: [0.3, 3], gain: [0.05, 0.18], pitch: [350, 900] }],
  },
  temporal: {
    bed: {
      type: "lowpass",
      gain: [0.08, 0.42],
      freq: [350, 1200],
      q: [0.7, 1],
      swellRate: [0.08, 0.18],
      swellDepth: 0.7,
      freqSwell: 0.4,
    },
    rumble: { gain: [0.05, 0.3], freq: [55, 110] },
    events: [{ grain: "pingo", rate: [2, 50], gain: [0.025, 0.08], pitch: [2200, 4800] }],
  },
  bolhas: {
    bed: {
      type: "lowpass",
      gain: [0.06, 0.32],
      freq: [250, 600],
      q: [0.7, 1],
      swellRate: [0.05, 0.15],
      swellDepth: 0.4,
      freqSwell: 0.2,
    },
    rumble: { gain: [0.02, 0.12], freq: [60, 100] },
    events: [{ grain: "bolha", rate: [0.8, 18], gain: [0.08, 0.26], pitch: [350, 1400] }],
  },
  degelo: {
    bed: {
      type: "bandpass",
      gain: [0.12, 0.9],
      freq: [900, 2600],
      q: [1, 2],
      swellRate: [0.3, 0.9],
      swellDepth: 0.5,
      freqSwell: 0.3,
    },
    rumble: { gain: [0.02, 0.12], freq: [50, 90] },
    events: [
      { grain: "gota", rate: [0.5, 9], gain: [0.15, 0.5], pitch: [700, 2000] },
      { grain: "racha", rate: [0.05, 0.9], gain: [0.2, 0.8], pitch: [180, 520] },
    ],
  },
  glaciar: {
    // Meltwater trickling, drops falling in a steady rhythm (a melting water clock) and the
    // glacier creaking now and then.
    bed: {
      type: "bandpass",
      gain: [0.08, 0.6],
      freq: [700, 2000],
      q: [1, 1.8],
      swellRate: [0.3, 0.8],
      swellDepth: 0.4,
      freqSwell: 0.25,
    },
    rumble: { gain: [0.03, 0.15], freq: [45, 80] },
    events: [
      { grain: "gota", rate: [1.2, 4], gain: [0.14, 0.45], pitch: [600, 1500], regular: true },
      { grain: "racha", rate: [0.05, 0.6], gain: [0.2, 0.7], pitch: [150, 420] },
    ],
  },
  aspersores: {
    bed: {
      type: "highpass",
      gain: [0.06, 0.4],
      freq: [2000, 3600],
      q: [0.7, 0.9],
      swellRate: [0.05, 0.12],
      swellDepth: 0.5,
      freqSwell: 0.1,
    },
    events: [
      { grain: "jato", rate: [1.5, 9], gain: [0.08, 0.32], pitch: [2800, 5200], regular: true },
    ],
  },
  chuva: {
    bed: {
      type: "highpass",
      gain: [0.06, 0.45],
      freq: [2500, 5000],
      q: [0.7, 0.7],
      swellRate: [0.1, 0.3],
      swellDepth: 0.3,
      freqSwell: 0.1,
    },
    rumble: { gain: [0.02, 0.15], freq: [80, 140] },
    events: [
      { grain: "pingo", rate: [3, 70], gain: [0.03, 0.1], pitch: [1800, 4500] },
      { grain: "gota", rate: [0.3, 5], gain: [0.04, 0.1], pitch: [500, 1200] },
    ],
  },
  cidade: {
    bed: {
      type: "lowpass",
      gain: [0.04, 0.3],
      freq: [180, 600],
      q: [0.7, 1],
      swellRate: [0.05, 0.15],
      swellDepth: 0.3,
      freqSwell: 0.2,
    },
    rumble: { gain: [0.03, 0.22], freq: [50, 90] },
    tone: { gain: [0.01, 0.06], freq: [50, 100] },
    events: [{ grain: "carro", rate: [0.08, 1.2], gain: [0.06, 0.22], pitch: [400, 1100] }],
  },
  rio: {
    bed: {
      type: "bandpass",
      gain: [0.08, 0.6],
      freq: [450, 1500],
      q: [0.8, 1.4],
      swellRate: [2.5, 6],
      swellDepth: 0.25,
      freqSwell: 0.15,
    },
    rumble: { gain: [0.03, 0.22], freq: [60, 120] },
    events: [{ grain: "bolha", rate: [2, 25], gain: [0.02, 0.07], pitch: [300, 1000] }],
  },
};

export interface PhenomenonEvent {
  grain: GrainKind;
  /** Events per second */
  rate: number;
  gain: number;
  /** Centre frequency / pitch in Hz */
  pitch: number;
  regular: boolean;
}

export interface PhenomenonSound {
  kind: SoundKind;
  level: number;
  bed: {
    type: FilterType;
    gain: number;
    freq: number;
    q: number;
    swellRate: number;
    swellDepth: number;
    freqSwell: number;
  };
  rumble: { gain: number; freq: number };
  tone: { gain: number; freq: number };
  events: PhenomenonEvent[];
}

const lin = ([a, b]: Range, t: number) => a + (b - a) * t;
/** Exponential interpolation: equal level steps sound like equal pitch steps. */
const expo = ([a, b]: Range, t: number) => a * Math.pow(b / a, t);

export function mapPhenomenonSound(kind: SoundKind, level: number): PhenomenonSound {
  const t = clamp01(level);
  const r = RECIPES[kind];
  return {
    kind,
    level: t,
    bed: {
      type: r.bed.type,
      gain: lin(r.bed.gain, t),
      freq: expo(r.bed.freq, t),
      q: lin(r.bed.q, t),
      swellRate: expo(r.bed.swellRate, t),
      swellDepth: r.bed.swellDepth,
      freqSwell: r.bed.freqSwell,
    },
    rumble: r.rumble
      ? { gain: lin(r.rumble.gain, t), freq: expo(r.rumble.freq, t) }
      : { gain: 0, freq: 80 },
    tone: r.tone
      ? { gain: lin(r.tone.gain, t), freq: expo(r.tone.freq, t) }
      : { gain: 0, freq: 60 },
    events: r.events.map((e) => ({
      grain: e.grain,
      rate: expo(e.rate, t),
      gain: lin(e.gain, t),
      pitch: expo(e.pitch, t),
      regular: e.regular ?? false,
    })),
  };
}
