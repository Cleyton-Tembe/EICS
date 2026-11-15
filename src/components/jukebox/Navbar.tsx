import { Link } from "@tanstack/react-router";
import { Info, Maximize2, Minimize2, Orbit, Volume2, VolumeX } from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/visualizations";
import { CategoryIcon } from "./CategoryIcon";

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
  const items: { id: Filter; label: string }[] = [
    { id: "todas", label: "Todas" },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-scrim-top">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:flex-nowrap md:px-8"
      >
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2.5 rounded-full pr-2 text-foreground"
          aria-label="Earth Jukebox — voltar ao início"
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
          aria-label="Categorias"
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
                <span className="relative ml-0.5 flex h-2 w-2" aria-label="a tocar agora">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cat animate-pulse-ring" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cat" />
                </span>
              )}
            </button>
          ))}
        </div>

        <Link
          to="/sobre"
          aria-label="Sobre: como funciona"
          className="ml-auto flex items-center gap-2 rounded-full border border-border bg-glass px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary md:ml-0"
        >
          <Info className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="hidden lg:inline">Sobre</span>
        </Link>

        <button
          type="button"
          onClick={onToggleImmersive}
          aria-pressed={immersive}
          aria-label={immersive ? "Sair do ecrã inteiro" : "Ecrã inteiro: só o vídeo"}
          title={immersive ? "Sair do ecrã inteiro (F)" : "Ecrã inteiro (F)"}
          className="flex items-center gap-2 rounded-full border border-border bg-glass px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary"
        >
          {immersive ? (
            <Minimize2 className="h-4 w-4 text-primary" aria-hidden />
          ) : (
            <Maximize2 className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
          <span className="hidden lg:inline">{immersive ? "Sair" : "Ecrã inteiro"}</span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          className="flex items-center gap-2 rounded-full border border-border bg-glass px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary md:ml-0"
        >
          {soundOn ? (
            <Volume2 className="h-4 w-4 text-primary" aria-hidden />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
          <span className="sr-only sm:not-sr-only">{soundOn ? "Som ligado" : "Ligar som"}</span>
        </button>
      </nav>
    </header>
  );
}
