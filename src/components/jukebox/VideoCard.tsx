import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Globe2, Headphones, Loader2, MoveHorizontal } from "lucide-react";
import { categoryById, type Visualization } from "@/lib/visualizations";
import { svsVideoProxyUrl } from "@/lib/svs";
import { scrubPosition, timelineLabel, worldviewUrl } from "@/lib/worldview";
import { CategoryIcon } from "./CategoryIcon";
import { SonificationPanel, type HudState } from "./SonificationPanel";

interface Props {
  viz: Visualization;
  index: number;
  total: number;
  isActive: boolean;
  shouldLoad: boolean;
  soundOn: boolean;
  hud: HudState | null;
  analyser: AnalyserNode | null;
  onEnableSound: () => void;
  registerVideo: (id: string, el: HTMLVideoElement | null) => void;
  /** Full-screen mode: only the video (and the navbar) stay visible. */
  immersive: boolean;
}

/** Move a video to a point of its timeline (0..1). */
function seekVideo(v: HTMLVideoElement, progress: number) {
  if (!Number.isFinite(v.duration) || v.duration <= 0) return;
  v.currentTime = Math.min(v.duration - 0.05, Math.max(0, progress * v.duration));
}

export function VideoCard({
  viz,
  index,
  total,
  isActive,
  shouldLoad,
  soundOn,
  hud,
  analyser,
  onEnableSound,
  registerVideo,
  immersive,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const drag = useRef<{ x: number; start: number; width: number; moved: boolean } | null>(null);
  const pendingSeek = useRef<number | null>(null);
  const cat = categoryById(viz.category);
  const timeline = viz.timeline;
  const canScrub = Boolean(timeline) && isActive && shouldLoad;

  // Seeks are batched to one per animation frame so dragging stays smooth.
  const requestSeek = useCallback((p: number) => {
    const first = pendingSeek.current === null;
    pendingSeek.current = p;
    setProgress(p);
    if (!first) return;
    requestAnimationFrame(() => {
      const v = videoRef.current;
      const target = pendingSeek.current;
      pendingSeek.current = null;
      if (v && target !== null) seekVideo(v, target);
    });
  }, []);

  const resume = useCallback(() => {
    if (isActive) videoRef.current?.play().catch(() => undefined);
  }, [isActive]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!canScrub || !v || !Number.isFinite(v.duration)) return;
    // Mouse drags would otherwise select the page text.
    if (e.pointerType === "mouse") e.preventDefault();
    drag.current = {
      x: e.clientX,
      start: v.currentTime / v.duration,
      width: e.currentTarget.clientWidth,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      videoRef.current?.pause();
      setScrubbing(true);
    }
    requestSeek(scrubPosition(d.start, dx, d.width));
  };

  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      setScrubbing(false);
      resume();
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive && shouldLoad) {
      v.play().catch(() => {
        /* autoplay can be refused; the poster stays visible */
      });
    } else {
      v.pause();
    }
  }, [isActive, shouldLoad]);

  return (
    <section
      data-vid={viz.id}
      aria-label={`${index + 1} de ${total}: ${viz.title}. Categoria ${cat.label}.`}
      className={`cat-${viz.category} relative h-svh snap-start overflow-hidden`}
    >
      <img
        src={viz.poster}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
      />

      <div
        className={`absolute inset-x-0 ${
          immersive ? "bottom-0 top-28 md:top-16" : "top-28 h-[44svh] md:inset-0 md:top-16 md:h-auto"
        } ${canScrub ? (scrubbing ? "cursor-grabbing" : "cursor-grab") : ""}`}
        style={canScrub ? { touchAction: "pan-y" } : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <video
          ref={(el) => {
            videoRef.current = el;
            registerVideo(viz.id, el);
          }}
          src={shouldLoad ? svsVideoProxyUrl(viz.videoPath) : undefined}
          poster={viz.poster}
          muted
          loop
          playsInline
          preload={isActive ? "auto" : "metadata"}
          aria-label={viz.altText}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (!drag.current && Number.isFinite(v.duration) && v.duration > 0) {
              setProgress(v.currentTime / v.duration);
            }
          }}
          className="pointer-events-none h-full w-full select-none object-contain"
        />
        {scrubbing && timeline && (
          <div
            aria-hidden
            className="glass pointer-events-none absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 font-mono text-sm text-foreground"
          >
            <MoveHorizontal className="h-4 w-4 text-primary" />
            {timelineLabel(timeline, progress)}
          </div>
        )}
      </div>

      {!immersive && <div aria-hidden className="pointer-events-none absolute inset-0 bg-scrim" />}

      {isActive && buffering && !immersive && (
        <div className="glass absolute left-1/2 top-1/3 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />A receber dados da NASA…
        </div>
      )}

      <div
        hidden={immersive}
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-6 md:flex-row md:items-end md:justify-between md:gap-10 md:px-8 md:pb-10">
        <div className="pointer-events-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cat bg-cat-soft px-3 py-1 text-xs font-semibold text-foreground">
              <CategoryIcon id={viz.category} className="h-3.5 w-3.5 text-cat" />
              {cat.label}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
            {viz.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground md:line-clamp-none md:text-base">
            {viz.description}
          </p>
          <p className="sr-only">Descrição visual: {viz.altText}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="hidden md:inline">
              <span className="text-cat">♪</span> {cat.timbre}
            </span>
            <span className="hidden md:inline">
              <span className="text-cat">≋</span> {viz.phenomenon.sound}
              <span className="sr-only">
                , que fica mais forte e agudo quanto maior for: {viz.phenomenon.measures}.
              </span>
            </span>
            <a
              href={`https://svs.gsfc.nasa.gov/${viz.svsId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline"
            >
              NASA SVS #{viz.svsId}
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
            <a
              href={worldviewUrl(viz.worldview)}
              target="_blank"
              rel="noreferrer"
              title={`Explorar no NASA Worldview: ${viz.worldview.what}`}
              aria-label={`Explorar no NASA Worldview: ${viz.worldview.what} (abre num novo separador)`}
              className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
            >
              <Globe2 className="h-3.5 w-3.5 text-cat" aria-hidden />
              Ver no Worldview
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </div>
          {timeline && isActive && (
            <div className="mt-3 max-w-md md:mt-4">
              <label
                htmlFor={`linha-${viz.id}`}
                className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
              >
                <span className="inline-flex items-center gap-1.5">
                  <MoveHorizontal className="h-3.5 w-3.5 text-cat" aria-hidden />
                  <span className="md:hidden">Arrasta no tempo</span>
                  <span className="hidden md:inline">Arrasta para avançar ou recuar no tempo</span>
                </span>
                <span className="font-mono text-foreground">{timelineLabel(timeline, progress)}</span>
              </label>
              <input
                id={`linha-${viz.id}`}
                type="range"
                min={0}
                max={1000}
                step={1}
                value={Math.round(progress * 1000)}
                disabled={!shouldLoad}
                aria-valuetext={`${timelineLabel(timeline, progress)}, entre ${timeline.from} e ${timeline.to}`}
                onPointerDown={() => {
                  videoRef.current?.pause();
                  setScrubbing(true);
                }}
                onPointerUp={() => {
                  setScrubbing(false);
                  resume();
                }}
                onChange={(e) => requestSeek(Number(e.target.value) / 1000)}
                className="timeline-range mt-1.5 w-full"
              />
              <div aria-hidden className="mt-0.5 flex justify-between font-mono text-[0.65rem] text-muted-foreground">
                <span>{timeline.from}</span>
                <span>{timeline.to}</span>
              </div>
            </div>
          )}
          {isActive && !soundOn && (
            <button type="button" onClick={onEnableSound} className="btn-cosmic mt-4 px-5 py-2.5 text-sm">
              <Headphones className="h-4 w-4" aria-hidden />
              Ouvir esta visualização
            </button>
          )}
        </div>

        {isActive && (
          <div className="pointer-events-auto shrink-0">
            <SonificationPanel hud={hud} soundOn={soundOn} analyser={analyser} />
          </div>
        )}
      </div>
    </section>
  );
}
