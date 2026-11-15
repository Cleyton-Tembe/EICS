import { Link } from "@tanstack/react-router";
import { ChevronDown, Info, Maximize2, Minimize2, Orbit, Volume2, VolumeX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const currentLabel = items.find((i) => i.id === filter)?.label ?? t("nav.all");

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-scrim-top">
      <nav
        aria-label={t("nav.main")}
        className="mx-auto flex max-w-7xl flex-nowrap items-center gap-2 px-4 py-3 md:gap-3 md:px-8"
      >
        <button
          type="button"
          onClick={onHome}
          className="flex shrink-0 items-center gap-2.5 rounded-full pr-1 text-foreground"
          aria-label={t("nav.home")}
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-glass">
            <Orbit className="h-5 w-5 text-primary animate-orbit" aria-hidden />
          </span>
          <span className="whitespace-nowrap font-display text-sm font-semibold tracking-tight md:text-base">
            Earth <span className="text-cosmic">Jukebox</span>
          </span>
        </button>

        {/* All categories in one menu, to keep the navbar light. */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`${t("nav.categories")}: ${currentLabel}`}
            className={`cat-${filter} flex min-w-0 items-center gap-2 rounded-full border border-border bg-glass px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary data-[state=open]:border-primary`}
          >
            <CategoryIcon id={filter} className="h-4 w-4 shrink-0 text-cat" />
            <span className="hidden truncate sm:inline">{currentLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="glass z-[60] min-w-56 rounded-2xl border-border p-1.5 text-foreground"
          >
            <DropdownMenuLabel className="px-2.5 pb-1 pt-1.5 font-mono text-[0.65rem] font-normal uppercase tracking-[0.2em] text-muted-foreground">
              {t("nav.categories")}
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={filter} onValueChange={(v) => onFilter(v as Filter)}>
              {items.map((item) => (
                <DropdownMenuRadioItem
                  key={item.id}
                  value={item.id}
                  className={`cat-${item.id} cursor-pointer gap-2.5 rounded-xl py-2 pl-8 pr-3 text-sm focus:bg-secondary`}
                >
                  <CategoryIcon id={item.id} className="h-4 w-4 text-cat" />
                  {item.label}
                  {item.id !== "todas" && playingCategory === item.id && (
                    <span
                      className="relative ml-auto flex h-2 w-2"
                      aria-label={t("nav.playingNow")}
                    >
                      <span className="absolute inline-flex h-full w-full rounded-full bg-cat animate-pulse-ring" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-cat" />
                    </span>
                  )}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator className="my-1.5 bg-border" />
            <DropdownMenuItem
              asChild
              className="cursor-pointer gap-2.5 rounded-xl py-2 pl-8 pr-3 text-sm focus:bg-secondary"
            >
              <Link to="/sobre">
                <Info className="h-4 w-4 text-muted-foreground" aria-hidden />
                {t("nav.about")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" aria-hidden />

        <Link
          to="/sobre"
          aria-label={t("nav.aboutLabel")}
          className="hidden items-center gap-2 rounded-full border border-border bg-glass px-2.5 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary md:flex md:px-3"
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
