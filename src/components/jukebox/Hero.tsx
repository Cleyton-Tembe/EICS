import { ChevronDown, Headphones, Palette, Sun, Thermometer, Activity } from "lucide-react";

const MAPPINGS = [
  { icon: Palette, from: "Cor dominante", to: "tonalidade do acorde" },
  { icon: Thermometer, from: "Tons quentes", to: "acorde menor, tensão" },
  { icon: Sun, from: "Brilho", to: "timbre e registo" },
  { icon: Activity, from: "Detalhe e movimento", to: "ritmo das notas" },
];

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh snap-start flex-col items-center justify-center overflow-hidden px-5 pb-14 pt-28 text-center md:pb-16 md:pt-32"
    >
      <div aria-hidden className="planet-horizon" />

      <p className="animate-float-up font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Dados do NASA Earth Information Center
      </p>
      <h1
        id="hero-title"
        className="animate-float-up mt-5 max-w-4xl font-display text-[2.6rem] font-bold md:mt-6 md:text-7xl leading-[1.02] tracking-tight"
        style={{ animationDelay: "0.1s" }}
      >
        Ouve a <span className="text-cosmic">Terra</span> a mudar.
      </h1>
      <p
        className="animate-float-up mt-5 max-w-xl text-[0.95rem] md:mt-6 md:text-lg text-muted-foreground"
        style={{ animationDelay: "0.2s" }}
      >
        Visualizações reais da NASA transformadas em som, ao vivo. Desliza e cada vídeo começa a tocar a
        sua própria paisagem sonora.
      </p>

      <div
        className="animate-float-up mt-8 flex md:mt-10 flex-wrap items-center justify-center gap-3"
        style={{ animationDelay: "0.3s" }}
      >
        <button type="button" onClick={onStart} className="btn-cosmic">
          <Headphones className="h-5 w-5" aria-hidden />
          Começar a ouvir
        </button>
        <a href="#como-soa" className="btn-ghost-star">
          Como soa?
        </a>
      </div>

      <ul
        id="como-soa"
        aria-label="Como as imagens viram som"
        className="animate-float-up relative mt-10 grid w-full max-w-4xl grid-cols-2 gap-2 md:mt-16 md:grid-cols-4 md:gap-3"
        style={{ animationDelay: "0.45s" }}
      >
        {MAPPINGS.map(({ icon: Icon, from, to }) => (
          <li key={from} className="glass rounded-2xl p-3 text-left md:p-4">
            <Icon className="hidden h-5 w-5 text-primary md:block" aria-hidden />
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground md:mt-3">
              <Icon className="h-4 w-4 shrink-0 text-primary md:hidden" aria-hidden />
              {from}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">→ {to}</p>
          </li>
        ))}
      </ul>

      <ChevronDown aria-hidden className="animate-scroll-hint absolute bottom-6 h-6 w-6 text-muted-foreground" />
    </section>
  );
}
