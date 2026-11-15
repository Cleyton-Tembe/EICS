import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Globe2, Headphones, Info, Loader2, MoveHorizontal, X } from "lucide-react";
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
  /** Panels the user chose to open (closed at first; the choice is remembered). */
  showInfo: boolean;
  showSound: boolean;
  onToggleInfo: () => void;
  onToggleSound: () => void;
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
  showInfo,
  showSound,
  onToggleInfo,
  onToggleSound,
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

  const infoId = `descricao-${viz.id}`;
  const soundPanelId = `sonificacao-${viz.id}`;
  const level = hud?.phenomenon.level ?? 0;

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
          immersive
            ? "bottom-0 top-28 md:top-16"
            : "top-28 h-[44svh] md:inset-0 md:top-16 md:h-auto"
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

      {isActive && buffering && !immersive && (
        <div className="glass absolute left-1/2 top-1/3 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />A receber dados da
          NASA…
        </div>
      )}

      <div
        hidden={immersive}
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-6 md:flex-row md:items-end md:justify-between md:gap-10 md:px-8 md:pb-10"
      >
        <div className="pointer-events-auto max-w-2xl">
          {/* Short description, opened on demand. */}
          {isActive && showInfo && (
            <div
              id={infoId}
              className="glass mb-4 max-h-[24svh] overflow-y-auto rounded-2xl p-4 [text-shadow:none] md:max-h-none"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  O que significam as mudanças
                </h3>
                <button
                  type="button"
                  onClick={onToggleInfo}
                  aria-label="Fechar descrição"
                  className="-mr-1 -mt-1 rounded-full p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{viz.meaning}</p>
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="text-cat">≋</span> Som:{" "}
                <span className="text-foreground">{viz.phenomenon.sound}</span> — mais forte e agudo
                quanto maior for {viz.phenomenon.measures}.
              </p>
            </div>
          )}

          {/* Solid translucent card (no gradient) keeps the text readable over any frame. */}
          <div className="text-legible md:rounded-2xl md:border md:border-border md:bg-void/65 md:p-5 md:backdrop-blur-md">
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
            <p className="sr-only">
              {viz.meaning} Descrição visual: {viz.altText}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 [text-shadow:none]">
              {isActive && !soundOn && (
                <button
                  type="button"
                  onClick={onEnableSound}
                  className="btn-cosmic px-4 py-2 text-sm"
                >
                  <Headphones className="h-4 w-4" aria-hidden />
                  Ouvir
                </button>
              )}
              <button
                type="button"
                className="btn-chip"
                aria-expanded={showInfo}
                aria-controls={infoId}
                onClick={onToggleInfo}
                title="Descrição (I)"
              >
                <Info className="h-4 w-4" aria-hidden />
                Descrição
              </button>
              <button
                type="button"
                className="btn-chip"
                aria-expanded={showSound}
                aria-controls={soundPanelId}
                onClick={onToggleSound}
                title="Sonificação (S)"
              >
                {/* Tiny live bars: there is live data inside, and how strong the phenomenon is now. */}
                <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
                  {[0.55, 1, 0.75].map((k, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded-sm bg-accent transition-[height] duration-300"
                      style={{
                        height: `${Math.max(18, (isActive && soundOn ? level : 0.15) * k * 100)}%`,
                      }}
                    />
                  ))}
                </span>
                Sonificação
              </button>
              <a
                href={worldviewUrl(viz.worldview)}
                target="_blank"
                rel="noreferrer"
                title={`Explorar no NASA Worldview: ${viz.worldview.what}`}
                aria-label={`Ver no NASA Worldview: ${viz.worldview.what} (abre num novo separador)`}
                className="btn-chip"
              >
                <Globe2 className="h-4 w-4 text-primary" aria-hidden />
                <span className="hidden sm:inline">Worldview</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden />
              </a>
              <a
                href={`https://svs.gsfc.nasa.gov/${viz.svsId}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Página original na NASA SVS, número ${viz.svsId} (abre num novo separador)`}
                className="hidden items-center gap-1 px-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline md:inline-flex"
              >
                NASA SVS #{viz.svsId}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </div>
          </div>
        </div>

        {/* Live sonification, opened on demand (bottom right, as before). */}
        {isActive && showSound && (
          <div className="pointer-events-auto max-h-[28svh] shrink-0 overflow-y-auto md:max-h-none md:w-72">
            <SonificationPanel
              id={soundPanelId}
              hud={hud}
              soundOn={soundOn}
              analyser={analyser}
              onClose={onToggleSound}
            />
          </div>
        )}
      </div>
    </section>
  );
}
