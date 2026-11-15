import { useEffect, useState } from "react";
import { ChevronDown, Headphones, Volume2 } from "lucide-react";
import { armIntroSound, type IntroState } from "@/lib/intro-sound";
import { EarthGlobe } from "./EarthGlobe";

export function Hero({ onStart }: { onStart: () => void }) {
  const [intro, setIntro] = useState<IntroState>("done");

  // Welcome sound: plays on arrival if the browser allows, otherwise on the first tap or key.
  useEffect(() => armIntroSound(setIntro), []);

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh snap-start flex-col items-center justify-center overflow-hidden px-5 pb-14 pt-28 text-center md:pb-16 md:pt-32"
    >
      <EarthGlobe />

      <div className="text-legible relative z-10 flex flex-col items-center">
        <p className="animate-float-up font-mono text-xs uppercase tracking-[0.3em] text-foreground/80">
          Dados do NASA Earth Information Center
        </p>
        <h1
          id="hero-title"
          className="animate-float-up mt-5 max-w-4xl font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight md:mt-6 md:text-7xl"
          style={{ animationDelay: "0.1s" }}
        >
          Ouve a <span className="text-cosmic">Terra</span> a mudar.
        </h1>
        <p
          className="animate-float-up mt-5 max-w-xl text-[0.95rem] text-foreground/85 md:mt-6 md:text-lg"
          style={{ animationDelay: "0.2s" }}
        >
          Visualizações reais da NASA transformadas em som, ao vivo. Desliza e cada vídeo começa a
          tocar a sua própria paisagem sonora.
        </p>

        <div
          className="animate-float-up mt-8 flex flex-col items-center gap-4 md:mt-10 [text-shadow:none]"
          style={{ animationDelay: "0.3s" }}
        >
          <button type="button" onClick={onStart} className="btn-cosmic">
            <Headphones className="h-5 w-5" aria-hidden />
            Começar a ouvir
          </button>
          <p
            aria-live="polite"
            className={`glass flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground transition-opacity duration-700 ${
              intro === "waiting" ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Volume2 className="h-3.5 w-3.5 text-primary" aria-hidden />
            {intro === "waiting" ? "Toca em qualquer lado para ouvir a Terra" : ""}
          </p>
        </div>
      </div>

      <ChevronDown
        aria-hidden
        className="animate-scroll-hint absolute bottom-6 z-10 h-6 w-6 text-muted-foreground"
      />
    </section>
  );
}
