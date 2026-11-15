import { useEffect } from "react";
import { ChevronDown, Headphones } from "lucide-react";
import { playIntroOnArrival } from "@/lib/intro-sound";
import { useLang } from "./LangProvider";
import { EarthGlobe } from "./EarthGlobe";

export function Hero({ onStart }: { onStart: () => void }) {
  const { t } = useLang();
  // Welcome sound on the first visit, as the site opens (never triggered by a click).
  useEffect(() => playIntroOnArrival(), []);

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh snap-start flex-col items-center justify-center overflow-hidden px-5 pb-14 pt-28 text-center md:pb-16 md:pt-32"
    >
      <EarthGlobe />

      <div className="text-legible relative z-10 flex flex-col items-center">
        <p className="animate-float-up font-mono text-xs uppercase tracking-[0.3em] text-foreground/80">
          {t("hero.kicker")}
        </p>
        <h1
          id="hero-title"
          className="animate-float-up mt-5 max-w-4xl font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight md:mt-6 md:text-7xl"
          style={{ animationDelay: "0.1s" }}
        >
          {t("hero.title.before")}
          <span className="text-cosmic">{t("hero.title.highlight")}</span>
          {t("hero.title.after")}
        </h1>
        <p
          className="animate-float-up mt-5 max-w-xl text-[0.95rem] text-foreground/85 md:mt-6 md:text-lg"
          style={{ animationDelay: "0.2s" }}
        >
          {t("hero.text")}
        </p>

        <div
          className="animate-float-up mt-8 flex flex-col items-center gap-4 md:mt-10 [text-shadow:none]"
          style={{ animationDelay: "0.3s" }}
        >
          <button type="button" onClick={onStart} className="btn-cosmic">
            <Headphones className="h-5 w-5" aria-hidden />
            {t("hero.start")}
          </button>
        </div>
      </div>

      <ChevronDown
        aria-hidden
        className="animate-scroll-hint absolute bottom-6 z-10 h-6 w-6 text-muted-foreground"
      />
    </section>
  );
}
