import { Languages } from "lucide-react";
import { useLang } from "./LangProvider";

/** EN / PT switch; English is the default. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const next = lang === "en" ? "pt" : "en";
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={`${t("nav.language")}: ${lang === "en" ? "English" : "Português"}. ${
        next === "pt" ? "Mudar para português" : "Switch to English"
      }`}
      title={next === "pt" ? "Português" : "English"}
      className={`flex items-center gap-1.5 rounded-full border border-border bg-glass px-2.5 py-2 font-mono text-xs font-semibold uppercase text-foreground transition-colors hover:border-primary md:px-3 ${className}`}
    >
      <Languages className="h-4 w-4 text-muted-foreground" aria-hidden />
      {lang}
    </button>
  );
}
