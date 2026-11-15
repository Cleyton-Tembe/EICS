// Links to NASA Worldview (https://worldview.earthdata.nasa.gov) and the timeline used to
// scrub through a visualization. Pure functions, no browser APIs.

export interface WorldviewLink {
  /** Worldview layer ids, top layer first (checked against Worldview's config). */
  layers: string[];
  /** Day to open, YYYY-MM-DD (inside every layer's date range). */
  date: string;
  /** Map extent: [west, south, east, north] in degrees. */
  view?: [number, number, number, number];
  /** What the user will see there — shown in the link and read by screen readers. */
  what: string;
}

export const WORLDVIEW_BASE = "https://worldview.earthdata.nasa.gov/";

export function worldviewUrl(w: WorldviewLink): string {
  const params = new URLSearchParams();
  if (w.view) params.set("v", w.view.join(","));
  params.set("l", w.layers.join(","));
  params.set("t", `${w.date}-T12:00:00Z`);
  return `${WORLDVIEW_BASE}?${params.toString()}`;
}

/** Start and end of the period a visualization covers, e.g. "2002" → "2025". */
export interface Timeline {
  from: string;
  to: string;
}

const YEAR_RE = /^\d{4}$/;

/** Approximate moment shown at a point of the video (0..1). */
export function timelineLabel(t: Timeline, progress: number): string {
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  if (YEAR_RE.test(t.from) && YEAR_RE.test(t.to)) {
    const a = Number(t.from);
    const b = Number(t.to);
    return `≈ ${Math.round(a + (b - a) * p)}`;
  }
  return `${Math.round(p * 100)}% · ${t.from} → ${t.to}`;
}

/** New playback position after a horizontal drag of `dx` pixels over a `width`-pixel video. */
export function scrubPosition(startProgress: number, dx: number, width: number): number {
  if (width <= 0) return Math.min(1, Math.max(0, startProgress));
  return Math.min(1, Math.max(0, startProgress + dx / width));
}
