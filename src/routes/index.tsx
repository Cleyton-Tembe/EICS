import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Shuffle, ArrowUp } from "lucide-react";
import { Starfield } from "@/components/jukebox/Starfield";
import { Navbar, type Filter } from "@/components/jukebox/Navbar";
import { Hero } from "@/components/jukebox/Hero";
import { VideoCard } from "@/components/jukebox/VideoCard";
import type { HudState } from "@/components/jukebox/SonificationPanel";
import {
  VISUALIZATIONS,
  categoryById,
  categoryText,
  featuredOrder,
  vizText,
  shuffleMixed,
  type Visualization,
} from "@/lib/visualizations";
import { analyzeFrame, fallbackFeatures, mapToMusic } from "@/lib/sonification";
import { JukeboxAudio } from "@/lib/jukebox-audio";
import { fadeOutIntro } from "@/lib/intro-sound";
import { useLang } from "@/components/jukebox/LangProvider";
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
      { title: "Earth Jukebox — Hear the Earth change" },
      {
        name: "description",
        content:
          "NASA visualizations of the atmosphere, oceans, ice and land turned into sound in real time.",
      },
      { property: "og:title", content: "Earth Jukebox — Hear the Earth change" },
      {
        property: "og:description",
        content: "Scroll through NASA visualizations and hear each one play its own soundscape.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SAMPLE_W = 48;
const SAMPLE_H = 27;
const PANELS_KEY = "earth-jukebox:panels";

function Index() {
  // Curated order (ice first, then CO₂…); the same on server and browser.
  const [order, setOrder] = useState<Visualization[]>(() => featuredOrder());
  const [filter, setFilter] = useState<Filter>("todas");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  // Sound is on by default.
  const [soundOn, setSoundOn] = useState(true);
  const [hud, setHud] = useState<HudState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [immersive, setImmersive] = useState(false);
  // Title card minimised, description and live sonification closed at first; the viewer's
  // choice is remembered.
  const [showInfo, setShowInfo] = useState(false);
  const [showSound, setShowSound] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const { lang, t: tr } = useLang();
  const audioRef = useRef<JukeboxAudio | null>(null);
  const videoEls = useRef(new Map<string, HTMLVideoElement>());

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(PANELS_KEY) ?? "{}") as {
        info?: boolean;
        sound?: boolean;
        card?: boolean;
      };
      if (saved.info) setShowInfo(true);
      if (saved.sound) setShowSound(true);
      if (saved.card) setShowCard(true);
    } catch {
      /* storage can be blocked; panels just start closed */
    }
  }, []);

  const savePanels = (p: { info: boolean; sound: boolean; card: boolean }) => {
    try {
      window.localStorage.setItem(PANELS_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  };
  const toggleInfo = useCallback(() => {
    // Opening the description also opens the title card it belongs to.
    const next = !showInfo;
    setShowInfo(next);
    if (next) setShowCard(true);
    savePanels({ info: next, sound: showSound, card: next || showCard });
  }, [showInfo, showSound, showCard]);
  const toggleSoundPanel = useCallback(() => {
    const next = !showSound;
    setShowSound(next);
    savePanels({ info: showInfo, sound: next, card: showCard });
  }, [showInfo, showSound, showCard]);
  const toggleCard = useCallback(() => {
    const next = !showCard;
    setShowCard(next);
    savePanels({ info: showInfo, sound: showSound, card: next });
  }, [showInfo, showSound, showCard]);

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
      setAnnouncement(
        tr("page.playing", {
          title: vizText(activeViz, lang).title,
          category: categoryText(categoryById(activeViz.category), lang).label,
        }),
      );
    }
  }, [activeViz, lang, tr]);

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
          phenomenon: { level },
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

  // Sound is on by default: start the soundscape as the page opens (it plays at once where the
  // browser allows) and wake it on the first tap or key, which browsers require before any sound.
  const enableSoundRef = useRef(enableSound);
  enableSoundRef.current = enableSound;
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;
  useEffect(() => {
    const events = ["pointerdown", "keydown", "touchend"] as const;
    const wake = () => {
      if (soundOnRef.current) void enableSoundRef.current();
      if (audioRef.current?.ctx.state === "running") {
        events.forEach((e) => window.removeEventListener(e, wake, true));
      }
    };
    wake();
    events.forEach((e) => window.addEventListener(e, wake, { capture: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, wake, true));
  }, []);

  // The welcome sound belongs to the hero: leaving it for the videos fades it out.
  useEffect(() => {
    if (activeId !== null) fadeOutIntro();
  }, [activeId]);

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
    setAnnouncement(immersive ? tr("page.fullscreenOn") : "");
    // Only when the mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immersive]);

  // Keyboard: ↓/J next, ↑/K previous, ←/→ back and forward in time, M sound, F full screen,
  // I description, S live sonification.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("#inicio, [data-vid], #fim"),
      );
      const current = sections.findIndex(
        (s) => (s.dataset["vid"] ?? null) === activeId && s.id !== "fim",
      );
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        sections[Math.min(current + 1, sections.length - 1)]?.scrollIntoView({
          behavior: "smooth",
        });
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        sections[Math.max(current - 1, 0)]?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "m") {
        toggleSound();
      } else if (e.key === "f") {
        toggleImmersive();
      } else if (e.key === "i" && activeViz) {
        toggleInfo();
      } else if (e.key === "s" && activeViz) {
        toggleSoundPanel();
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
  }, [activeId, activeViz, immersive, toggleSound, toggleImmersive, toggleInfo, toggleSoundPanel]);

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

        <div id="feed" aria-label={tr("page.feed")}>
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
              showInfo={showInfo}
              showSound={showSound}
              onToggleInfo={toggleInfo}
              onToggleSound={toggleSoundPanel}
              showCard={showCard}
              onToggleCard={toggleCard}
            />
          ))}
        </div>

        <section
          id="fim"
          hidden={immersive}
          aria-labelledby="fim-title"
          className="relative flex h-svh snap-start flex-col items-center justify-center px-5 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {tr("end.kicker")}
          </p>
          <h2
            id="fim-title"
            className="mt-4 max-w-2xl font-display text-3xl font-semibold md:text-5xl"
          >
            {tr("end.title.before")}
            <span className="text-cosmic">{tr("end.title.highlight")}</span>
            {tr("end.title.after")}
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            {tr("end.howQuestion")}{" "}
            <Link to="/sobre" className="text-primary underline-offset-4 hover:underline">
              {tr("end.howLink")}
            </Link>
            .
          </p>
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
              {tr("end.shuffle")}
            </button>
            <button
              type="button"
              className="btn-ghost-star"
              onClick={() =>
                document.getElementById("inicio")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
              {tr("end.back")}
            </button>
          </div>
          <p className="mt-10 max-w-md text-xs text-muted-foreground">{tr("end.keys")}</p>
        </section>
      </main>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
