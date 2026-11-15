import { useEffect, useRef } from "react";

/** Twinkling star canvas fixed behind the whole page. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const starColor = getComputedStyle(canvas).getPropertyValue("--star").trim() || "white";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: { x: number; y: number; r: number; p: number; s: number }[] = [];
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const count = Math.floor((window.innerWidth * window.innerHeight) / 4200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() < 0.08 ? 1.6 : Math.random() * 1.1 + 0.2) * dpr,
        p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.6,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = starColor;
      for (const st of stars) {
        ctx.globalAlpha = reduce ? 0.7 : 0.35 + 0.65 * Math.abs(Math.sin(st.p + (t / 1000) * st.s * 0.6));
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-nebula" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
