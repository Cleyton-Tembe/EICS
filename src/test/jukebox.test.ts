import { describe, expect, it } from "vitest";
import { isAllowedSvsPath } from "@/lib/svs";
import { analyzeFrame, mapToMusic, type FrameFeatures } from "@/lib/sonification";
import { CATEGORIES, VISUALIZATIONS, featuredOrder, shuffleMixed } from "@/lib/visualizations";
import {
  mapPhenomenonSound,
  measurePhenomenon,
  phenomenonLevel,
  smoothLevel,
} from "@/lib/phenomena";
import { scrubPosition, timelineLabel, worldviewUrl } from "@/lib/worldview";

const base: FrameFeatures = {
  brightness: 0.4,
  hue: 220,
  saturation: 0.3,
  warmth: -0.3,
  texture: 0.2,
  balance: 0,
  motion: 0,
};

function solidFrame(r: number, g: number, b: number, w = 4, h = 4) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) data.set([r, g, b, 255], i * 4);
  return data;
}

describe("video proxy only serves NASA visualization files", () => {
  it("accepts an SVS /vis/ mp4 path", () => {
    expect(isAllowedSvsPath("/vis/a010000/a015000/a015030/Mendenhall_Glacier,_Alaska_-_Web.mp4")).toBe(true);
  });
  it("rejects other paths and traversal", () => {
    expect(isAllowedSvsPath("/api/4964")).toBe(false);
    expect(isAllowedSvsPath("/vis/a000000/a004900/a004964/../../secret.mp4")).toBe(false);
    expect(isAllowedSvsPath("https://evil.com/vis/a000000/a004900/a004964/x.mp4")).toBe(false);
    expect(isAllowedSvsPath(null)).toBe(false);
  });
  it("every catalogue video passes the proxy check", () => {
    for (const v of VISUALIZATIONS) expect(isAllowedSvsPath(v.videoPath)).toBe(true);
  });
});

describe("there are exactly four categories, each with videos", () => {
  it("has atmosfera, oceanos, gelo, terra", () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual(["atmosfera", "oceanos", "gelo", "terra"]);
    for (const c of CATEGORIES) {
      expect(VISUALIZATIONS.filter((v) => v.category === c.id).length).toBeGreaterThan(0);
    }
  });
});

describe("random order mixes categories", () => {
  it("keeps every video and never puts two of the same category side by side", () => {
    for (let seed = 1; seed < 30; seed++) {
      let s = seed;
      const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const out = shuffleMixed(VISUALIZATIONS, rnd);
      expect(new Set(out.map((v) => v.id))).toEqual(new Set(VISUALIZATIONS.map((v) => v.id)));
      for (let i = 1; i < out.length; i++) expect(out[i]!.category).not.toBe(out[i - 1]!.category);
    }
  });
});

describe("frame analysis", () => {
  it("reads a red frame as warm and a blue frame as cold", () => {
    expect(analyzeFrame(solidFrame(230, 40, 30), 4, 4).features.warmth).toBeGreaterThan(0.5);
    expect(analyzeFrame(solidFrame(30, 60, 230), 4, 4).features.warmth).toBeLessThan(-0.3);
  });
  it("reports motion only when the frame changes", () => {
    const a = analyzeFrame(solidFrame(10, 10, 10), 4, 4);
    expect(analyzeFrame(solidFrame(10, 10, 10), 4, 4, a.lum).features.motion).toBe(0);
    expect(analyzeFrame(solidFrame(240, 240, 240), 4, 4, a.lum).features.motion).toBe(1);
  });
});

describe("music mapping", () => {
  it("warm colours give a minor chord, cold colours a major chord", () => {
    expect(mapToMusic({ ...base, warmth: 0.5 }, "atmosfera").mode).toBe("menor");
    expect(mapToMusic({ ...base, warmth: -0.5 }, "atmosfera").mode).toBe("maior");
  });
  it("more detail and motion means faster rhythm", () => {
    const calm = mapToMusic({ ...base, texture: 0, motion: 0 }, "oceanos").rate;
    const busy = mapToMusic({ ...base, texture: 0.8, motion: 0.5 }, "oceanos").rate;
    expect(busy).toBeGreaterThan(calm);
  });
  it("ice sits higher than ocean", () => {
    expect(mapToMusic(base, "gelo").chord[0]!).toBeGreaterThan(mapToMusic(base, "oceanos").chord[0]!);
  });
});

describe("phenomenon level follows the data in the frame", () => {
  it("more red (ice mass lost) means a higher ice-loss level", () => {
    const spec = { metric: "iceLoss" as const, range: [0, 1] as [number, number] };
    const white = measurePhenomenon(solidFrame(245, 245, 245), 4, 4, spec);
    const red = measurePhenomenon(solidFrame(150, 20, 20), 4, 4, spec);
    expect(red).toBeGreaterThan(white);
    expect(phenomenonLevel(red, spec)).toBe(1);
    expect(phenomenonLevel(white, spec)).toBe(0);
  });
  it("purple reads as ozone hole, green does not", () => {
    const spec = { metric: "ozoneHole" as const };
    expect(measurePhenomenon(solidFrame(110, 40, 200), 4, 4, spec)).toBe(1);
    expect(measurePhenomenon(solidFrame(40, 180, 60), 4, 4, spec)).toBe(0);
  });
  it("calibrated range is clamped and can be inverted", () => {
    expect(phenomenonLevel(0.5, { range: [0, 1] })).toBe(0.5);
    expect(phenomenonLevel(-3, { range: [0, 1] })).toBe(0);
    expect(phenomenonLevel(9, { range: [0, 1] })).toBe(1);
    expect(phenomenonLevel(0.2, { range: [0, 1], invert: true })).toBeCloseTo(0.8);
  });
  it("smoothing moves towards the new frame without jumping", () => {
    expect(smoothLevel(null, 0.7)).toBe(0.7);
    const s = smoothLevel(0, 1, 0.25);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });
  it("every visualization has a calibrated phenomenon", () => {
    for (const v of VISUALIZATIONS) {
      expect(v.phenomenon.range[1]).toBeGreaterThan(v.phenomenon.range[0]);
      expect(v.phenomenon.sound.length).toBeGreaterThan(0);
    }
  });
});

describe("phenomenon sound is in sync with the level", () => {
  const kinds = [...new Set(VISUALIZATIONS.map((v) => v.phenomenon.kind))];
  it.each(kinds)("%s: low level = quiet and low, high level = loud and high", (kind) => {
    const low = mapPhenomenonSound(kind, 0.1);
    const high = mapPhenomenonSound(kind, 0.9);
    expect(high.bed.gain).toBeGreaterThan(low.bed.gain);
    expect(high.bed.freq).toBeGreaterThan(low.bed.freq);
    high.events.forEach((e, i) => {
      expect(e.rate).toBeGreaterThan(low.events[i]!.rate);
      expect(e.pitch).toBeGreaterThan(low.events[i]!.pitch);
      expect(e.gain).toBeGreaterThan(low.events[i]!.gain);
    });
  });
  it("hurricane is wind with rain, not the accompaniment", () => {
    const s = mapPhenomenonSound("furacao", 0.8);
    expect(s.bed.swellDepth).toBeGreaterThan(0.3); // gusts
    expect(s.events.map((e) => e.grain)).toContain("pingo"); // rain
  });
});

describe("NASA Worldview links", () => {
  it("opens the matching layers, date and region", () => {
    const url = new URL(
      worldviewUrl({
        layers: ["IMERG_Precipitation_Rate", "Coastlines_15m"],
        date: "2025-08-17",
        view: [-75, 10, -50, 30],
        what: "chuva",
      }),
    );
    expect(url.origin).toBe("https://worldview.earthdata.nasa.gov");
    expect(url.searchParams.get("l")).toBe("IMERG_Precipitation_Rate,Coastlines_15m");
    expect(url.searchParams.get("t")).toBe("2025-08-17-T12:00:00Z");
    expect(url.searchParams.get("v")).toBe("-75,10,-50,30");
  });
  it("every visualization links to Worldview with a valid date", () => {
    for (const v of VISUALIZATIONS) {
      expect(v.worldview.layers.length).toBeGreaterThan(0);
      expect(v.worldview.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("timeline scrubbing", () => {
  it("dragging across the whole video goes from start to end, and is clamped", () => {
    expect(scrubPosition(0.5, 100, 400)).toBeCloseTo(0.75);
    expect(scrubPosition(0.5, -1000, 400)).toBe(0);
    expect(scrubPosition(0.9, 400, 400)).toBe(1);
  });
  it("labels the year shown at that point of the video", () => {
    expect(timelineLabel({ from: "2002", to: "2025" }, 0)).toBe("≈ 2002");
    expect(timelineLabel({ from: "2002", to: "2025" }, 1)).toBe("≈ 2025");
    expect(timelineLabel({ from: "mar", to: "nov" }, 0.5)).toBe("50% · mar → nov");
  });
});

describe("featured order", () => {
  it("starts with CO₂, ends with Greenland, and keeps every video once", () => {
    const out = featuredOrder();
    expect(out[0]!.svsId).toBe(5196);
    expect(out[out.length - 1]!.svsId).toBe(31156);
    expect(new Set(out.map((v) => v.id))).toEqual(new Set(VISUALIZATIONS.map((v) => v.id)));
    expect(out.length).toBe(VISUALIZATIONS.length);
  });
});
