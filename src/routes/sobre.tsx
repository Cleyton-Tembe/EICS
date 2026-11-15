import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  Globe2,
  Keyboard,
  Layers,
  MoveHorizontal,
  Music,
  Orbit,
  Palette,
  Sun,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";
import { Starfield } from "@/components/jukebox/Starfield";
import { CategoryIcon } from "@/components/jukebox/CategoryIcon";
import { CATEGORIES, VISUALIZATIONS, categoryById } from "@/lib/visualizations";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Earth Jukebox" },
      {
        name: "description",
        content:
          "Como o Earth Jukebox transforma visualizações da NASA em som: a música, o som de cada fenómeno e os dados por trás.",
      },
      { property: "og:title", content: "Sobre — Earth Jukebox" },
      {
        property: "og:description",
        content: "Como as imagens da NASA se transformam em música e no som de cada fenómeno.",
      },
    ],
  }),
  component: About,
});

const MUSIC_RULES = [
  {
    icon: Palette,
    from: "Cor dominante",
    to: "tonalidade do acorde",
    how: "As cores vizinhas dão tons vizinhos, seguindo o círculo de quintas.",
  },
  {
    icon: Thermometer,
    from: "Tons quentes",
    to: "acorde menor",
    how: "Vermelhos e laranjas criam tensão; azuis frios dão acordes maiores e calmos.",
  },
  {
    icon: Sun,
    from: "Brilho",
    to: "timbre e registo",
    how: "Imagens claras abrem o som e sobem as notas; imagens escuras soam abafadas e graves.",
  },
  {
    icon: Activity,
    from: "Detalhe e movimento",
    to: "ritmo",
    how: "Quanto mais textura e mudança entre frames, mais notas por segundo.",
  },
];

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 text-foreground">
        {icon}
        <h3 className="font-display text-base font-semibold">{title}</h3>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-20 md:mt-28">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
        {kicker}
      </p>
      <h2
        id={id}
        className="mt-3 max-w-2xl font-display text-2xl font-semibold leading-tight md:text-4xl"
      >
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function About() {
  return (
    <div className="relative min-h-svh">
      <Starfield />
      <header className="bg-scrim-top fixed inset-x-0 top-0 z-50">
        <nav
          aria-label="Navegação"
          className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8"
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 text-foreground"
            aria-label="Earth Jukebox — início"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-glass">
              <Orbit className="h-5 w-5 text-primary animate-orbit" aria-hidden />
            </span>
            <span className="font-display text-sm font-semibold tracking-tight md:text-base">
              Earth <span className="text-cosmic">Jukebox</span>
            </span>
          </Link>
          <Link to="/" className="btn-chip">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar às visualizações
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
          Sobre
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          Como a <span className="text-cosmic">Terra</span> vira som.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          O Earth Jukebox pega em visualizações reais do NASA Earth Information Center e lê cada
          frame enquanto o vídeo corre. As cores, o brilho e o movimento tornam-se música, e os
          dados de cada fenómeno tornam-se o seu próprio som. Assim, quem não pode ver as imagens
          também pode ouvir o planeta a mudar — e quem vê, ouve detalhes que os olhos deixam
          escapar.
        </p>

        <Section id="camadas" kicker="Duas camadas" title="O que estás a ouvir">
          <div className="grid gap-4 md:grid-cols-2">
            <Card icon={<Music className="h-5 w-5 text-primary" aria-hidden />} title="A música">
              Um acompanhamento calmo — acordes, arpejos e textura — gerado a partir do aspeto de
              cada frame. Dá o ambiente e muda suavemente com a imagem.
            </Card>
            <Card
              icon={<Wind className="h-5 w-5 text-accent" aria-hidden />}
              title="O som do fenómeno"
            >
              Por cima da música, o som natural do que o vídeo mostra: vento num furacão, gelo a
              estalar na Gronelândia, chuva no El Niño. A sua força segue os dados, frame a frame.
            </Card>
          </div>
        </Section>

        <Section id="musica" kicker="A música" title="Das imagens às notas">
          <ul className="grid gap-4 sm:grid-cols-2">
            {MUSIC_RULES.map(({ icon: Icon, from, to, how }) => (
              <li key={from} className="glass rounded-2xl p-5">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <p className="mt-3 font-semibold text-foreground">
                  {from} <span className="text-muted-foreground">→</span> {to}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{how}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Cada categoria tem o seu instrumento e o seu registo:
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {CATEGORIES.map((c) => (
              <li key={c.id} className={`cat-${c.id} glass rounded-2xl p-4`}>
                <p className="flex items-center gap-2 font-semibold text-foreground">
                  <CategoryIcon id={c.id} className="h-4 w-4 text-cat" />
                  {c.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{c.timbre}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="fenomenos"
          kicker="O som dos fenómenos"
          title="Baixo quando o fenómeno é fraco, alto quando é forte"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              icon={<Layers className="h-5 w-5 text-primary" aria-hidden />}
              title="1. Ler os dados"
            >
              Em cada frame medimos as cores que a NASA usa para guardar os dados — por exemplo, o
              vermelho da perda de gelo ou o roxo do buraco do ozono.
            </Card>
            <Card
              icon={<Activity className="h-5 w-5 text-primary" aria-hidden />}
              title="2. Medir a intensidade"
            >
              Calibrámos cada medida no vídeo real: 0% é o momento mais calmo do vídeo, 100% o mais
              intenso.
            </Card>
            <Card
              icon={<Waves className="h-5 w-5 text-accent" aria-hidden />}
              title="3. Tocar o som"
            >
              A intensidade controla o volume e o tom ao mesmo tempo, e quantas gotas, rajadas ou
              estalos se ouvem.
            </Card>
          </div>
          <div className="glass mt-6 overflow-hidden rounded-2xl">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Som de cada visualização e o que o faz mudar</caption>
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Visualização
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Som
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                    Fica mais forte com
                  </th>
                </tr>
              </thead>
              <tbody>
                {VISUALIZATIONS.map((v) => (
                  <tr
                    key={v.id}
                    className={`cat-${v.category} border-b border-border last:border-0`}
                  >
                    <th scope="row" className="px-4 py-3 font-medium text-foreground">
                      <span className="flex items-start gap-2">
                        <CategoryIcon
                          id={v.category}
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cat"
                        />
                        <span>
                          {v.title}
                          <span className="sr-only">, {categoryById(v.category).label}</span>
                        </span>
                      </span>
                    </th>
                    <td className="px-4 py-3 text-foreground">{v.phenomenon.sound}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {v.phenomenon.measures}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="explorar" kicker="Explorar" title="Recua e avança no tempo">
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              icon={<MoveHorizontal className="h-5 w-5 text-primary" aria-hidden />}
              title="Arrasta o vídeo"
            >
              Nos vídeos que mostram uma evolução — o gelo, o ozono, as temperaturas — arrasta o
              vídeo para os lados (ou usa as teclas ← e →). A música e o som do fenómeno seguem o ano
              que estás a ver.
            </Card>
            <Card
              icon={<Globe2 className="h-5 w-5 text-primary" aria-hidden />}
              title="Vê os dados no Worldview"
            >
              O botão Worldview abre o NASA Worldview com os dados de satélite do mesmo fenómeno, na
              mesma região e data, para explorares por tua conta.
            </Card>
          </div>
        </Section>

        <Section id="acessibilidade" kicker="Para todos" title="Acessibilidade">
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              icon={<Waves className="h-5 w-5 text-primary" aria-hidden />}
              title="Leitores de ecrã"
            >
              Cada vídeo tem uma descrição visual completa e o significado das mudanças. A
              intensidade do fenómeno é anunciada quando passa de baixa a média ou alta, sem
              interromper a cada frame.
            </Card>
            <Card icon={<Keyboard className="h-5 w-5 text-primary" aria-hidden />} title="Teclado">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="font-mono text-foreground">↓ ↑</dt>
                <dd>mudar de vídeo</dd>
                <dt className="font-mono text-foreground">← →</dt>
                <dd>recuar ou avançar no tempo</dd>
                <dt className="font-mono text-foreground">I</dt>
                <dd>abrir ou fechar a descrição</dd>
                <dt className="font-mono text-foreground">S</dt>
                <dd>abrir ou fechar a sonificação</dd>
                <dt className="font-mono text-foreground">M</dt>
                <dd>ligar ou desligar o som</dd>
                <dt className="font-mono text-foreground">F</dt>
                <dd>ecrã inteiro</dd>
              </dl>
            </Card>
          </div>
        </Section>

        <Section id="dados" kicker="Créditos" title="Dados da NASA">
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              Vídeos: <span className="text-foreground">NASA Scientific Visualization Studio</span>{" "}
              e NASA Earth Information Center. Cada vídeo leva à sua página original.
            </li>
            <li>
              Terra da página inicial: <span className="text-foreground">Blue Marble</span> (dia) e{" "}
              <span className="text-foreground">Black Marble</span> (luzes da noite), através do
              NASA GIBS.
            </li>
            <li>
              Dados para explorar: <span className="text-foreground">NASA Worldview</span>.
            </li>
            <li>Todos os sons são sintetizados no teu browser, em tempo real; nada é gravado.</li>
          </ul>
          <Link to="/" className="btn-cosmic mt-10">
            Voltar às visualizações
          </Link>
        </Section>
      </main>
    </div>
  );
}
