import { Link } from "@tanstack/react-router";
import { Info, Maximize2, Minimize2, Orbit, Volume2, VolumeX } from "lucide-react";
import { CATEGORIES, categoryText, type CategoryId } from "@/lib/visualizations";
import { CategoryIcon } from "./CategoryIcon";
import { LangSwitch } from "./LangSwitch";
import { useLang } from "./LangProvider";

export type Filter = CategoryId | "todas";

interface NavbarProps {
  filter: Filter;
  playingCategory: CategoryId | null;
  soundOn: boolean;
  onFilter: (f: Filter) => void;
  onToggleSound: () => void;
  immersive: boolean;
  onToggleImmersive: () => void;
  onHome: () => void;
}

export function Navbar({
  filter,
  playingCategory,
  soundOn,
  onFilter,
  onToggleSound,
  immersive,
  onToggleImmersive,
  onHome,
}: NavbarProps) {
  const { lang, t } = useLang();
  const items: { id: Filter; label: string }[] = [
    { id: "todas", label: t("nav.all") },
    ...CATEGORIES.map((c) => ({ id: c.id, label: categoryText(c, lang).label })),
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-scrim-top">
      <nav
        aria-label={t("nav.main")}
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3 md:flex-nowrap md:gap-x-4 md:px-8"
      >
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2.5 rounded-full pr-2 text-foreground"
          aria-label={t("nav.home")}
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-glass">
            <Orbit className="h-5 w-5 text-primary animate-orbit" aria-hidden />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight md:text-base">
            Earth <span className="text-cosmic">Jukebox</span>
          </span>
        </button>

        <div
          role="group"
          aria-label={t("nav.categories")}
          className="no-scrollbar order-3 -mx-4 flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 md:order-none md:mx-auto md:w-auto md:justify-center md:px-0"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              data-active={filter === item.id}
              onClick={() => onFilter(item.id)}
              className={`chip-category cat-${item.id}`}
            >
              <CategoryIcon id={item.id} className="h-4 w-4 text-cat" />
              {item.label}
              {item.id !== "todas" && playingCategory === item.id && (
                <span className="relative ml-0.5 flex h-2 w-2" aria-label={t("nav.playingNow")}>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cat animate-pulse-ring" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cat" />
                </span>
              )}
            </button>
          ))}
        </div>

        <Link
          to="/sobre"
          aria-label={t("nav.aboutLabel")}
          className="ml-auto flex items-center gap-2 rounded-full border border-border bg-glass px-2.5 py-2 md:px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary md:ml-0"
        >
          <Info className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="hidden lg:inline">{t("nav.about")}</span>
        </Link>

        <button
          type="button"
          onClick={onToggleImmersive}
          aria-pressed={immersive}
          aria-label={immersive ? t("nav.exitFullscreenLabel") : t("nav.fullscreenLabel")}
          title={`${immersive ? t("nav.exitFullscreenLabel") : t("nav.fullscreen")} (F)`}
          className="hidden items-center gap-2 rounded-full border border-border bg-glass px-2.5 py-2 sm:flex md:px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary"
        >
          {immersive ? (
            <Minimize2 className="h-4 w-4 text-primary" aria-hidden />
          ) : (
            <Maximize2 className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
          <span className="hidden lg:inline">
            {immersive ? t("nav.exitFullscreen") : t("nav.fullscreen")}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          className="flex items-center gap-2 rounded-full border border-border bg-glass px-2.5 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary md:ml-0 md:px-3.5"
        >
          {soundOn ? (
            <Volume2 className="h-4 w-4 text-primary" aria-hidden />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
          <span className="sr-only sm:not-sr-only">
            {soundOn ? t("nav.soundOn") : t("nav.soundOff")}
          </span>
        </button>

        <LangSwitch />
      </nav>
    </header>
  );
}
