import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { FrameFeatures, MusicState } from "@/lib/sonification";
import { intensityLabel, type IntensityLabel } from "@/lib/phenomena";

export interface HudState {
  features: FrameFeatures;
  music: MusicState;
  fallback: boolean;
  phenomenon: {
    /** 0..1 intensity of the phenomenon in the current frame */
    level: number;
    /** What you hear */
    sound: string;
    /** What in the image drives the level */
    measures: string;
  };
}

interface Props {
  id?: string;
  hud: HudState | null;
  soundOn: boolean;
  analyser: AnalyserNode | null;
  onClose?: () => void;
}

function Meter({ label, hint, value }: { label: string; hint: string; value: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <dt className="text-xs font-semibold text-foreground">{label}</dt>
        <dd className="font-mono text-[0.65rem] text-muted-foreground">
          {hint} · {pct}%
        </dd>
      </div>
      <div className="meter-track mt-1" aria-hidden>
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Spectrum({ analyser, soundOn }: { analyser: AnalyserNode | null; soundOn: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !analyser || !soundOn) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const color = getComputedStyle(canvas).getPropertyValue("--primary").trim() || "#5b8def";
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const bars = 40;
      const bw = width / bars;
      ctx.fillStyle = color;
      for (let i = 0; i < bars; i++) {
        const v = (data[Math.floor((i / bars) * data.length * 0.7)] ?? 0) / 255;
        const h = Math.max(2, v * height);
        ctx.fillRect(i * bw + 1, height - h, bw - 2, h);
      }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, soundOn]);

  return (
    <canvas
      ref={ref}
      width={480}
      height={80}
      aria-hidden
      className="h-10 w-full"
    />
  );
}

/** Phenomenon level, kept in step with the sound: low = quiet and low, high = loud and high. */
function PhenomenonMeter({ phenomenon }: { phenomenon: HudState["phenomenon"] }) {
  const pct = Math.round(Math.min(1, Math.max(0, phenomenon.level)) * 100);
  const label = intensityLabel(phenomenon.level);
  // Screen readers hear only when the intensity changes band, not every frame.
  const [spoken, setSpoken] = useState<IntensityLabel | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setSpoken(label), 1200);
    return () => window.clearTimeout(id);
  }, [label]);

  return (
    <div className="mt-3 rounded-lg bg-void/60 p-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{phenomenon.sound}</p>
        <p className="shrink-0 whitespace-nowrap font-mono text-[0.65rem] text-muted-foreground">
          {label} · {pct}%
        </p>
      </div>
      <div
        role="meter"
        aria-label={`Intensidade do fenómeno: ${phenomenon.measures}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${label}, ${pct}%`}
        className="meter-track mt-1.5"
      >
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 font-mono text-[0.6rem] text-muted-foreground">mede: {phenomenon.measures}</p>
      <p aria-live="polite" className="sr-only">
        {spoken ? `Intensidade do fenómeno ${spoken}: o som fica ${spoken === "alta" ? "forte e agudo" : spoken === "baixa" ? "suave e grave" : "moderado"}.` : ""}
      </p>
    </div>
  );
}

export function SonificationPanel({ id, hud, soundOn, analyser, onClose }: Props) {
  const f = hud?.features;
  const m = hud?.music;

  return (
    <aside id={id} aria-label="Sonificação ao vivo" className="glass w-full rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="relative flex h-2 w-2">
            {soundOn && <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-pulse-ring" />}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${soundOn ? "bg-accent" : "bg-muted-foreground"}`} />
          </span>
          Sonificação ao vivo
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar sonificação"
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {hud && <PhenomenonMeter phenomenon={hud.phenomenon} />}

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Acorde</p>
          <p className="font-display text-xl font-semibold text-foreground">{m?.chordName ?? "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Ritmo</p>
          <p className="font-mono text-sm text-foreground">{m ? `${m.rate.toFixed(1)} notas/s` : "—"}</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-void/60 px-2 py-1">
        {soundOn ? (
          <Spectrum analyser={analyser} soundOn={soundOn} />
        ) : (
          <p className="py-2.5 text-center font-mono text-[0.7rem] text-muted-foreground">som desligado</p>
        )}
      </div>

      {f && (
        <dl className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-semibold text-foreground">Cor dominante</dt>
            <dd className="flex items-center gap-2 font-mono text-[0.65rem] text-muted-foreground">
              tom · {Math.round(f.hue)}°
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-full border border-border"
                style={{ backgroundColor: `hsl(${f.hue} 80% 60%)` }}
              />
            </dd>
          </div>
          <Meter label="Brilho" hint="timbre" value={f.brightness} />
          <Meter label="Calor" hint="tensão" value={(f.warmth + 1) / 2} />
          <Meter label="Textura" hint="ritmo" value={f.texture} />
          <Meter label="Movimento" hint="intensidade" value={f.motion} />
        </dl>
      )}
      {hud?.fallback && (
        <p className="mt-3 font-mono text-[0.65rem] text-muted-foreground">
          modo aproximado: a imagem não pôde ser lida
        </p>
      )}
    </aside>
  );
}
