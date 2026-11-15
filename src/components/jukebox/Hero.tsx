import { ChevronDown, Headphones } from "lucide-react";
import { EarthGlobe } from "./EarthGlobe";

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative h-svh snap-start overflow-hidden"
    >
      <EarthGlobe />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-start px-5 pt-36 md:justify-center md:px-8 md:pt-16">
        <div className="max-w-xl">
          <p className="animate-float-up font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
            NASA Earth Information Center
          </p>
          <h1
            id="hero-title"
            className="animate-float-up mt-4 font-display text-[2.5rem] font-bold leading-[1.02] tracking-tight md:text-7xl"
            style={{ animationDelay: "0.1s" }}
          >
            Ouve a <span className="text-cosmic">Terra</span> a mudar.
          </h1>
          <p
            className="animate-float-up mt-4 max-w-md text-[0.95rem] text-muted-foreground md:mt-6 md:text-lg"
            style={{ animationDelay: "0.2s" }}
          >
            16 vídeos reais da NASA — furacões, gelo, oceanos, cidades — tocados como som enquanto
            os vês.
          </p>
          <div className="animate-float-up mt-7 md:mt-9" style={{ animationDelay: "0.3s" }}>
            <button type="button" onClick={onStart} className="btn-cosmic">
              <Headphones className="h-5 w-5" aria-hidden />
              Começar a ouvir
            </button>
          </div>
        </div>
      </div>

      <ChevronDown
        aria-hidden
        className="animate-scroll-hint absolute bottom-6 left-1/2 z-10 h-6 w-6 -translate-x-1/2 text-muted-foreground"
      />
    </section>
  );
}
