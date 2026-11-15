import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe2,
  Headphones,
  Info,
  Loader2,
  MoveHorizontal,
  X,
} from "lucide-react";
import { categoryById, categoryText, vizText, type Visualization } from "@/lib/visualizations";
import { svsVideoProxyUrl } from "@/lib/svs";
import { scrubPosition, timelineLabel, worldviewUrl } from "@/lib/worldview";
import { CategoryIcon } from "./CategoryIcon";
import { SonificationPanel, type HudState } from "./SonificationPanel";
import { useLang } from "./LangProvider";

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
  /** Title card: minimised to a small button at first, so it does not cover the video. */
  showCard: boolean;
  onToggleCard: () => void;
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
  showCard,
  onToggleCard,
}: Props) {
  const { lang, t } = useLang();
  const text = vizText(viz, lang);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const drag = useRef<{ x: number; start: number; width: number; moved: boolean } | null>(null);
  const pendingSeek = useRef<number | null>(null);
  const catText = categoryText(categoryById(viz.category), lang);
  const timeline = text.timeline;
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
  const cardId = `cartao-${viz.id}`;
  const level = hud?.phenomenon.level ?? 0;

  return (
    <section
      data-vid={viz.id}
      aria-label={t("card.position", {
        n: index + 1,
        total,
        title: text.title,
        category: catText.label,
      })}
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
            ? "bottom-0 top-16"
            : "top-16 h-[48svh] md:inset-0 md:top-16 md:h-auto"
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
          aria-label={text.altText}
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
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
          {t("card.loading")}
        </div>
      )}

      <div
        hidden={immersive}
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl flex-col items-start gap-4 px-5 pb-6 md:flex-row md:items-end md:justify-between md:gap-10 md:px-8 md:pb-10"
      >
        <div className="pointer-events-auto max-w-2xl">
          <p className="sr-only">
            {text.description} {text.meaning} {t("card.visual", { alt: text.altText })}
          </p>

          {!showCard ? (
            /* Minimised: one small button, so the video stays clear. */
            <button
              type="button"
              onClick={onToggleCard}
              aria-expanded={false}
              aria-controls={cardId}
              aria-label={`${t("card.open")}: ${text.title}`}
              className="glass group flex max-w-[calc(100vw-2.5rem)] items-center gap-2.5 rounded-full py-2 pl-3 pr-3.5 text-left text-sm font-semibold text-foreground transition-colors hover:border-primary md:max-w-md"
            >
              <CategoryIcon id={viz.category} className="h-4 w-4 shrink-0 text-cat" />
              <span className="truncate">{text.title}</span>
              <span className="shrink-0 font-mono text-[0.65rem] font-normal text-muted-foreground">
                {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
              </span>
              <ChevronUp
                className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                aria-hidden
              />
            </button>
          ) : (
            <div id={cardId}>
              {/* Short description, opened on demand. */}
              {isActive && showInfo && (
                <div
                  id={infoId}
                  className="glass mb-3 max-h-[24svh] overflow-y-auto rounded-2xl p-4 md:max-h-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {t("card.meaningTitle")}
                    </h3>
                    <button
                      type="button"
                      onClick={onToggleInfo}
                      aria-label={t("card.closeDescription")}
                      className="-mr-1 -mt-1 rounded-full p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">{text.meaning}</p>
                  <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="text-cat">≋</span>{" "}
                    {t("card.soundLine", { sound: text.sound, measures: text.measures })}
                  </p>
                </div>
              )}

              <div className="glass rounded-2xl p-4 md:p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cat bg-cat-soft px-3 py-1 text-xs font-semibold text-foreground">
                    <CategoryIcon id={viz.category} className="h-3.5 w-3.5 text-cat" />
                    {catText.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={onToggleCard}
                    aria-expanded
                    aria-controls={cardId}
                    aria-label={t("card.close")}
                    title={t("card.close")}
                    className="ml-auto -mr-1 rounded-full p-1 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                <h2 className="mt-2.5 font-display text-xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
                  {text.title}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground md:line-clamp-none">
                  {text.description}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  {isActive && !soundOn && (
                    <button
                      type="button"
                      onClick={onEnableSound}
                      className="btn-cosmic px-4 py-2 text-sm"
                    >
                      <Headphones className="h-4 w-4" aria-hidden />
                      {t("card.listen")}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-chip"
                    aria-expanded={showInfo}
                    aria-controls={infoId}
                    onClick={onToggleInfo}
                    title={t("card.descriptionHint")}
                  >
                    <Info className="h-4 w-4" aria-hidden />
                    {t("card.description")}
                  </button>
                  <button
                    type="button"
                    className="btn-chip"
                    aria-expanded={showSound}
                    aria-controls={soundPanelId}
                    onClick={onToggleSound}
                    title={t("card.sonificationHint")}
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
                    {t("card.sonification")}
                  </button>
                  <a
                    href={worldviewUrl(viz.worldview)}
                    target="_blank"
                    rel="noreferrer"
                    title={t("card.worldviewTitle", { what: text.what })}
                    aria-label={t("card.worldviewLabel", { what: text.what })}
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
                    aria-label={t("card.svsLabel", { id: viz.svsId })}
                    className="hidden items-center gap-1 px-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline md:inline-flex"
                  >
                    NASA SVS #{viz.svsId}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live sonification, opened on demand (bottom right). */}
        {isActive && showSound && (
          <div className="pointer-events-auto max-h-[28svh] w-full shrink-0 overflow-y-auto md:max-h-none md:w-72">
            <SonificationPanel
              id={soundPanelId}
              hud={hud}
              soundOn={soundOn}
              analyser={analyser}
              sound={text.sound}
              measures={text.measures}
              onClose={onToggleSound}
            />
          </div>
        )}
      </div>
    </section>
  );
}
