import { useEffect, useRef, useState } from "react";
import { ExternalLink, Headphones, Loader2 } from "lucide-react";
import { categoryById, type Visualization } from "@/lib/visualizations";
import { svsVideoProxyUrl } from "@/lib/svs";
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
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [buffering, setBuffering] = useState(false);
  const cat = categoryById(viz.category);

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

      <div className="absolute inset-x-0 top-28 h-[44svh] md:inset-0 md:top-16 md:h-auto">
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
          className="h-full w-full object-contain"
        />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 bg-scrim" />

      {isActive && buffering && (
        <div className="glass absolute left-1/2 top-1/3 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />A receber dados da NASA…
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-6 md:flex-row md:items-end md:justify-between md:gap-10 md:px-8 md:pb-10">
        <div className="max-w-2xl">
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
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{viz.description}</p>
          <p className="sr-only">Descrição visual: {viz.altText}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>
              <span className="text-cat">♪</span> {cat.timbre}
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
          </div>
          {isActive && !soundOn && (
            <button type="button" onClick={onEnableSound} className="btn-cosmic mt-4 px-5 py-2.5 text-sm">
              <Headphones className="h-4 w-4" aria-hidden />
              Ouvir esta visualização
            </button>
          )}
        </div>

        {isActive && (
          <div className="shrink-0">
            <SonificationPanel hud={hud} soundOn={soundOn} analyser={analyser} />
          </div>
        )}
      </div>
    </section>
  );
}
