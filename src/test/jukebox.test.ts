import { describe, expect, it } from "vitest";
import { isAllowedSvsPath } from "@/lib/svs";
import { analyzeFrame, mapToMusic, type FrameFeatures } from "@/lib/sonification";
import { CATEGORIES, VISUALIZATIONS, shuffleMixed } from "@/lib/visualizations";

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
