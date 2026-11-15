import { useEffect, useRef } from "react";

// NASA palette: mostly white stars, some blue, a few red. Kept faint so it never competes
// with the visualizations.
const STAR_COLORS = [
  { color: "#F4F6FA", share: 0.82 },
  { color: "#9DB7E8", share: 0.14 }, // NASA blue, lightened to show on black
  { color: "#F7A08F", share: 0.04 }, // NASA red, softened
];

function pickColor(r: number) {
  let acc = 0;
  for (const c of STAR_COLORS) {
    acc += c.share;
    if (r < acc) return c.color;
  }
  return STAR_COLORS[0]!.color;
}

/** Softly twinkling stars fixed behind the whole site. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: {
      x: number;
      y: number;
      r: number;
      base: number;
      p: number;
      s: number;
      c: string;
    }[] = [];
    let raf = 0;
    let last = 0;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const count = Math.floor((window.innerWidth * window.innerHeight) / 4200);
      stars = Array.from({ length: count }, () => {
        const big = Math.random() < 0.05;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: (big ? 1.6 : 0.2 + Math.random() * 1.1) * dpr,
          base: big ? 0.75 : 0.35 + Math.random() * 0.35,
          p: Math.random() * Math.PI * 2,
          s: 0.4 + Math.random() * 1.6,
          c: pickColor(Math.random()),
        };
      });
    };

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      // 20 fps is plenty for a slow twinkle.
      if (t - last < 50 && last !== 0) return;
      last = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const st of stars) {
        const tw = reduce ? 0 : Math.sin(st.p + (t / 1000) * st.s * 0.6) * 0.3;
        ctx.globalAlpha = Math.max(0.05, st.base + tw);
        ctx.fillStyle = st.c;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (reduce) cancelAnimationFrame(raf);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      // With reduced motion only one frame is drawn, so draw again after a resize.
      if (reduce) {
        last = 0;
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-void">
      <div className="absolute inset-0 bg-nebula" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
