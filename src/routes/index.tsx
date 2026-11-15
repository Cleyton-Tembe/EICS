import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Shuffle, ArrowUp } from "lucide-react";
import { Starfield } from "@/components/jukebox/Starfield";
import { Navbar, type Filter } from "@/components/jukebox/Navbar";
import { Hero } from "@/components/jukebox/Hero";
import { VideoCard } from "@/components/jukebox/VideoCard";
import type { HudState } from "@/components/jukebox/SonificationPanel";
import { VISUALIZATIONS, categoryById, shuffleMixed, type Visualization } from "@/lib/visualizations";
import { analyzeFrame, fallbackFeatures, mapToMusic } from "@/lib/sonification";
import { JukeboxAudio } from "@/lib/jukebox-audio";
import {
  PHENOMENON_SAMPLE_H,
  PHENOMENON_SAMPLE_W,
  fallbackLevel,
  mapPhenomenonSound,
  measurePhenomenon,
  phenomenonLevel,
  smoothLevel,
} from "@/lib/phenomena";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Earth Jukebox — Ouve a Terra a mudar" },
      {
        name: "description",
        content:
          "Visualizações da NASA sobre atmosfera, oceanos, gelo e terra transformadas em som em tempo real.",
      },
      { property: "og:title", content: "Earth Jukebox — Ouve a Terra a mudar" },
      {
        property: "og:description",
        content: "Desliza pelas visualizações da NASA e ouve cada uma a tocar a sua própria paisagem sonora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SAMPLE_W = 48;
const SAMPLE_H = 27;

function Index() {
  // Initial order is fixed so server and browser render the same; shuffled after load.
  const [order, setOrder] = useState<Visualization[]>(VISUALIZATIONS);
  const [filter, setFilter] = useState<Filter>("todas");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const [soundOn, setSoundOn] = useState(false);
  const [hud, setHud] = useState<HudState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [immersive, setImmersive] = useState(false);
  const audioRef = useRef<JukeboxAudio | null>(null);
  const videoEls = useRef(new Map<string, HTMLVideoElement>());

  useEffect(() => {
    setOrder(shuffleMixed(VISUALIZATIONS));
  }, []);

  const list = useMemo(
    () => (filter === "todas" ? order : order.filter((v) => v.category === filter)),
    [order, filter],
  );
  const activeIndex = list.findIndex((v) => v.id === activeId);
  const activeViz = activeIndex >= 0 ? list[activeIndex] : null;

  // Keep current, previous and next videos loaded; once loaded, keep them.
  useEffect(() => {
    const center = Math.max(activeIndex, 0);
    setLoaded((prev) => {
      const next = new Set(prev);
      for (let i = center - 1; i <= center + 1; i++) {
        const item = list[i];
        if (item) next.add(item.id);
      }
      return next.size === prev.size ? prev : next;
    });
  }, [activeIndex, list]);

  // Autoplay: whichever section fills most of the screen becomes active.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-vid], #inicio, #fim");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            setActiveId((e.target as HTMLElement).dataset["vid"] ?? null);
          }
        }
      },
      { threshold: [0.6] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [list, immersive]);

  // Announce the playing visualization for screen readers.
  useEffect(() => {
    if (activeViz) {
      setAnnouncement(`A tocar: ${activeViz.title}. ${categoryById(activeViz.category).label}.`);
    }
  }, [activeViz]);

  // Frame analysis → music, for the active video.
  useEffect(() => {
    setHud(null);
    const audio = audioRef.current;
    if (!activeViz) {
      audio?.updatePhenomenon(null);
      audio?.setActive(false);
      return;
    }
    audio?.setCategory(activeViz.category);
    audio?.updatePhenomenon(null);
    audio?.setActive(true);

    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_W;
    canvas.height = SAMPLE_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    // Larger sample for the phenomenon: small features (city lights, algal blooms) vanish at 48×27.
    const pCanvas = document.createElement("canvas");
    pCanvas.width = PHENOMENON_SAMPLE_W;
    pCanvas.height = PHENOMENON_SAMPLE_H;
    const pCtx = pCanvas.getContext("2d", { willReadFrequently: true });
    const spec = activeViz.phenomenon;
    let level: number | null = null;
    let prev: Float32Array | null = null;
    let raf = 0;
    let last = 0;
    let lastHud = 0;
    const started = performance.now();

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 140) return;
      last = t;
      const v = videoEls.current.get(activeViz.id);
      let features;
      let target: number;
      let fallback = false;
      if (v && ctx && pCtx && v.readyState >= 2) {
        try {
          ctx.drawImage(v, 0, 0, SAMPLE_W, SAMPLE_H);
          const img = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
          const r = analyzeFrame(img.data, SAMPLE_W, SAMPLE_H, prev);
          prev = r.lum;
          features = r.features;
          pCtx.drawImage(v, 0, 0, PHENOMENON_SAMPLE_W, PHENOMENON_SAMPLE_H);
          const pImg = pCtx.getImageData(0, 0, PHENOMENON_SAMPLE_W, PHENOMENON_SAMPLE_H);
          const raw = measurePhenomenon(pImg.data, PHENOMENON_SAMPLE_W, PHENOMENON_SAMPLE_H, spec);
          target = phenomenonLevel(raw, spec);
        } catch {
          fallback = true;
          features = fallbackFeatures((t - started) / 1000, activeViz.svsId % 97);
          target = fallbackLevel((t - started) / 1000);
        }
      } else {
        return;
      }
      const music = mapToMusic(features, activeViz.category);
      audioRef.current?.update(music);
      level = smoothLevel(level, target, spec.smoothing);
      const sound = mapPhenomenonSound(spec.kind, level);
      audioRef.current?.updatePhenomenon(sound);
      if (t - lastHud > 250) {
        lastHud = t;
        setHud({
          features,
          music,
          fallback,
          phenomenon: { level, sound: spec.sound, measures: spec.measures },
        });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeViz]);

  // Pause sound when the tab is hidden.
  useEffect(() => {
    const onVis = () => audioRef.current?.setActive(!document.hidden && activeId !== null);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [activeId]);

  useEffect(() => () => audioRef.current?.dispose(), []);

  const enableSound = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new JukeboxAudio();
    const audio = audioRef.current;
    if (activeViz) audio.setCategory(activeViz.category);
    audio.setActive(activeViz !== null);
    audio.setMuted(false);
    setSoundOn(true);
    await audio.resume();
  }, [activeViz]);

  const toggleSound = useCallback(() => {
    if (soundOn) {
      audioRef.current?.setMuted(true);
      setSoundOn(false);
    } else {
      void enableSound();
    }
  }, [soundOn, enableSound]);

  const scrollToFirst = () => {
    document.querySelector("[data-vid]")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilter = (f: Filter) => {
    setFilter(f);
    requestAnimationFrame(scrollToFirst);
  };

  const start = () => {
    void enableSound();
    scrollToFirst();
  };

  // Full screen: only the video and the navbar stay. Uses the browser's full-screen mode when
  // allowed (not on iPhone or inside some iframes); the layout works without it too.
  const toggleImmersive = useCallback(() => {
    const next = !immersive;
    setImmersive(next);
    const doc = document;
    if (next && !doc.fullscreenElement) {
      doc.documentElement.requestFullscreen?.().catch(() => undefined);
    } else if (!next && doc.fullscreenElement) {
      doc.exitFullscreen?.().catch(() => undefined);
    }
  }, [immersive]);

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Keep the video in view when the layout changes; from the start screen, go to the first video.
  useEffect(() => {
    requestAnimationFrame(() => {
      const el = activeId
        ? document.querySelector(`[data-vid="${activeId}"]`)
        : immersive
          ? document.querySelector("[data-vid]")
          : null;
      el?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    });
    // Only when the mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immersive]);

  useEffect(() => {
    setAnnouncement(immersive ? "Ecrã inteiro: só o vídeo e a navegação." : "");
  }, [immersive]);

  // Keyboard: ↓/J next, ↑/K previous, ←/→ back and forward in time, M sound, F full screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const sections = Array.from(document.querySelectorAll<HTMLElement>("#inicio, [data-vid], #fim"));
      const current = sections.findIndex((s) => (s.dataset["vid"] ?? null) === activeId && s.id !== "fim");
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        sections[Math.min(current + 1, sections.length - 1)]?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        sections[Math.max(current - 1, 0)]?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "m") {
        toggleSound();
      } else if (e.key === "f") {
        toggleImmersive();
      } else if (e.key === "Escape" && immersive && !document.fullscreenElement) {
        setImmersive(false);
      } else if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && activeViz?.timeline) {
        const v = videoEls.current.get(activeViz.id);
        if (!v || !Number.isFinite(v.duration)) return;
        e.preventDefault();
        const step = v.duration * 0.05 * (e.key === "ArrowRight" ? 1 : -1);
        v.currentTime = Math.min(v.duration - 0.05, Math.max(0, v.currentTime + step));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, activeViz, immersive, toggleSound, toggleImmersive]);

  const registerVideo = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videoEls.current.set(id, el);
    else videoEls.current.delete(id);
  }, []);

  return (
    <div className="relative">
      <Starfield />
      <Navbar
        filter={filter}
        playingCategory={activeViz?.category ?? null}
        soundOn={soundOn}
        onFilter={handleFilter}
        onToggleSound={toggleSound}
        immersive={immersive}
        onToggleImmersive={toggleImmersive}
        onHome={() => document.getElementById("inicio")?.scrollIntoView({ behavior: "smooth" })}
      />

      <main className="relative z-10">
        <div hidden={immersive}>
          <Hero onStart={start} />
        </div>

        <div id="feed" aria-label="Visualizações">
          {list.map((viz, i) => (
            <VideoCard
              key={viz.id}
              viz={viz}
              index={i}
              total={list.length}
              isActive={viz.id === activeId}
              shouldLoad={loaded.has(viz.id)}
              soundOn={soundOn}
              hud={viz.id === activeId ? hud : null}
              analyser={audioRef.current?.analyser ?? null}
              onEnableSound={() => void enableSound()}
              registerVideo={registerVideo}
              immersive={immersive}
            />
          ))}
        </div>

        <section
          id="fim"
          hidden={immersive}
          aria-labelledby="fim-title"
          className="relative flex h-svh snap-start flex-col items-center justify-center px-5 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Fim da órbita</p>
          <h2 id="fim-title" className="mt-4 max-w-2xl font-display text-3xl font-semibold md:text-5xl">
            Cada mudança no planeta tem <span className="text-cosmic">um som</span>.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn-cosmic"
              onClick={() => {
                setOrder(shuffleMixed(VISUALIZATIONS));
                requestAnimationFrame(scrollToFirst);
              }}
            >
              <Shuffle className="h-5 w-5" aria-hidden />
              Baralhar e ouvir de novo
            </button>
            <button
              type="button"
              className="btn-ghost-star"
              onClick={() => document.getElementById("inicio")?.scrollIntoView({ behavior: "smooth" })}
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
              Voltar ao início
            </button>
          </div>
          <p className="mt-10 max-w-md text-xs text-muted-foreground">
            Teclado: ↓ / ↑ para mudar de vídeo · ← / → para recuar ou avançar no tempo · M para ligar ou
            desligar o som · F para ecrã inteiro.
          </p>
        </section>
      </main>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
