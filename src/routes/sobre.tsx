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
import { LangSwitch } from "@/components/jukebox/LangSwitch";
import { useLang } from "@/components/jukebox/LangProvider";
import {
  CATEGORIES,
  VISUALIZATIONS,
  categoryById,
  categoryText,
  vizText,
} from "@/lib/visualizations";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "About — Earth Jukebox" },
      {
        name: "description",
        content:
          "How Earth Jukebox turns NASA visualizations into sound: the music, the sound of each phenomenon and the data behind them.",
      },
      { property: "og:title", content: "About — Earth Jukebox" },
      {
        property: "og:description",
        content: "How NASA images become music and the sound of each phenomenon.",
      },
    ],
  }),
  component: About,
});

const COPY = {
  en: {
    nav: "Navigation",
    home: "Earth Jukebox — home",
    back: "Back to the visualizations",
    kicker: "About",
    titleBefore: "How the ",
    titleHighlight: "Earth",
    titleAfter: " becomes sound.",
    intro:
      "Earth Jukebox takes real visualizations from the NASA Earth Information Center and reads every frame while the video plays. Colours, brightness and motion become music, and the data of each phenomenon becomes its own sound. So people who cannot see the images can still hear the planet change — and those who can see them hear details the eye misses.",
    layersKicker: "Two layers",
    layersTitle: "What you are hearing",
    musicTitle: "The music",
    musicText:
      "A calm accompaniment — chords, arpeggios and texture — generated from how each frame looks. It sets the mood and changes gently with the image.",
    phenTitle: "The sound of the phenomenon",
    phenText:
      "On top of the music, the natural sound of what the video shows: wind in a hurricane, ice cracking in Greenland, rain during El Niño. Its strength follows the data, frame by frame.",
    notesKicker: "The music",
    notesTitle: "From images to notes",
    rules: [
      {
        icon: Palette,
        from: "Dominant colour",
        to: "key of the chord",
        how: "Neighbouring colours give neighbouring keys, following the circle of fifths.",
      },
      {
        icon: Thermometer,
        from: "Warm tones",
        to: "minor chord",
        how: "Reds and oranges create tension; cool blues give calm major chords.",
      },
      {
        icon: Sun,
        from: "Brightness",
        to: "timbre and register",
        how: "Bright images open up the sound and raise the notes; dark images sound muffled and low.",
      },
      {
        icon: Activity,
        from: "Detail and motion",
        to: "rhythm",
        how: "The more texture and change between frames, the more notes per second.",
      },
    ],
    instruments: "Each category has its own instrument and register:",
    phenKicker: "The sound of the phenomena",
    phenSectionTitle: "Quiet when the phenomenon is weak, loud when it is strong",
    steps: [
      {
        title: "1. Read the data",
        text: "In each frame we measure the colours NASA uses to store the data — for example, the red of ice loss or the purple of the ozone hole.",
      },
      {
        title: "2. Measure the intensity",
        text: "Each measure was calibrated on the real video: 0% is the calmest moment of the video, 100% the most intense.",
      },
      {
        title: "3. Play the sound",
        text: "The intensity drives volume and pitch together, and how many drops, gusts, pulses or cracks you hear. Some sounds keep a steady rhythm — a heartbeat for heat, pings for the ozone hole, drips for the glacier.",
      },
    ],
    tableCaption: "Sound of each visualization and what makes it change",
    colViz: "Visualization",
    colSound: "Sound",
    colMore: "Gets stronger as",
    exploreKicker: "Explore",
    exploreTitle: "Go back and forward in time",
    dragTitle: "Drag the video",
    dragText:
      "In the videos that show change over time — the ice, the ozone, the temperatures — drag the video sideways or use the ← → keys. The music and the phenomenon sound follow the year on screen.",
    wvTitle: "See the data in Worldview",
    wvText:
      "The Worldview button opens NASA Worldview with satellite data of the same phenomenon, in the same region and date, so you can explore on your own.",
    a11yKicker: "For everyone",
    a11yTitle: "Accessibility",
    srTitle: "Screen readers",
    srText:
      "Every video has a full visual description and the meaning of its changes. The phenomenon intensity is announced when it moves between low, medium and high, without interrupting at every frame.",
    keysTitle: "Keyboard",
    keys: [
      ["↓ ↑", "change video"],
      ["← →", "back and forward in time"],
      ["I", "open or close the description"],
      ["S", "open or close the sonification"],
      ["M", "sound on or off"],
      ["F", "full screen"],
    ],
    creditsKicker: "Credits",
    creditsTitle: "NASA data",
    credits: [
      [
        "Videos: ",
        "NASA Scientific Visualization Studio",
        " and the NASA Earth Information Center. Each video links to its original page.",
      ],
      [
        "Home page Earth: ",
        "Blue Marble",
        " (day) and Black Marble (night lights), via NASA GIBS.",
      ],
      ["Data to explore: ", "NASA Worldview", "."],
      ["", "", "All sounds are synthesized in your browser, in real time; nothing is recorded."],
    ],
  },
  pt: {
    nav: "Navegação",
    home: "Earth Jukebox — início",
    back: "Voltar às visualizações",
    kicker: "Sobre",
    titleBefore: "Como a ",
    titleHighlight: "Terra",
    titleAfter: " vira som.",
    intro:
      "O Earth Jukebox pega em visualizações reais do NASA Earth Information Center e lê cada frame enquanto o vídeo corre. As cores, o brilho e o movimento tornam-se música, e os dados de cada fenómeno tornam-se o seu próprio som. Assim, quem não pode ver as imagens também pode ouvir o planeta a mudar — e quem vê, ouve detalhes que os olhos deixam escapar.",
    layersKicker: "Duas camadas",
    layersTitle: "O que estás a ouvir",
    musicTitle: "A música",
    musicText:
      "Um acompanhamento calmo — acordes, arpejos e textura — gerado a partir do aspeto de cada frame. Dá o ambiente e muda suavemente com a imagem.",
    phenTitle: "O som do fenómeno",
    phenText:
      "Por cima da música, o som natural do que o vídeo mostra: vento num furacão, gelo a estalar na Gronelândia, chuva no El Niño. A sua força segue os dados, frame a frame.",
    notesKicker: "A música",
    notesTitle: "Das imagens às notas",
    rules: [
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
    ],
    instruments: "Cada categoria tem o seu instrumento e o seu registo:",
    phenKicker: "O som dos fenómenos",
    phenSectionTitle: "Baixo quando o fenómeno é fraco, alto quando é forte",
    steps: [
      {
        title: "1. Ler os dados",
        text: "Em cada frame medimos as cores que a NASA usa para guardar os dados — por exemplo, o vermelho da perda de gelo ou o roxo do buraco do ozono.",
      },
      {
        title: "2. Medir a intensidade",
        text: "Calibrámos cada medida no vídeo real: 0% é o momento mais calmo do vídeo, 100% o mais intenso.",
      },
      {
        title: "3. Tocar o som",
        text: "A intensidade controla o volume e o tom ao mesmo tempo, e quantas gotas, rajadas, pulsos ou estalos se ouvem. Alguns sons têm um ritmo regular — um batimento para o calor, pulsos para o buraco do ozono, gotas para o glaciar.",
      },
    ],
    tableCaption: "Som de cada visualização e o que o faz mudar",
    colViz: "Visualização",
    colSound: "Som",
    colMore: "Fica mais forte com",
    exploreKicker: "Explorar",
    exploreTitle: "Recua e avança no tempo",
    dragTitle: "Arrasta o vídeo",
    dragText:
      "Nos vídeos que mostram uma evolução — o gelo, o ozono, as temperaturas — arrasta o vídeo para os lados ou usa as teclas ← →. A música e o som do fenómeno seguem o ano que estás a ver.",
    wvTitle: "Vê os dados no Worldview",
    wvText:
      "O botão Worldview abre o NASA Worldview com os dados de satélite do mesmo fenómeno, na mesma região e data, para explorares por tua conta.",
    a11yKicker: "Para todos",
    a11yTitle: "Acessibilidade",
    srTitle: "Leitores de ecrã",
    srText:
      "Cada vídeo tem uma descrição visual completa e o significado das mudanças. A intensidade do fenómeno é anunciada quando passa de baixa a média ou alta, sem interromper a cada frame.",
    keysTitle: "Teclado",
    keys: [
      ["↓ ↑", "mudar de vídeo"],
      ["← →", "recuar ou avançar no tempo"],
      ["I", "abrir ou fechar a descrição"],
      ["S", "abrir ou fechar a sonificação"],
      ["M", "ligar ou desligar o som"],
      ["F", "ecrã inteiro"],
    ],
    creditsKicker: "Créditos",
    creditsTitle: "Dados da NASA",
    credits: [
      [
        "Vídeos: ",
        "NASA Scientific Visualization Studio",
        " e NASA Earth Information Center. Cada vídeo leva à sua página original.",
      ],
      [
        "Terra da página inicial: ",
        "Blue Marble",
        " (dia) e Black Marble (luzes da noite), através do NASA GIBS.",
      ],
      ["Dados para explorar: ", "NASA Worldview", "."],
      ["", "", "Todos os sons são sintetizados no teu browser, em tempo real; nada é gravado."],
    ],
  },
} satisfies Record<Lang, unknown>;

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
  const { lang } = useLang();
  const c = COPY[lang];

  return (
    <div className="relative min-h-svh">
      <Starfield />
      <header className="bg-scrim-top fixed inset-x-0 top-0 z-50">
        <nav
          aria-label={c.nav}
          className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 md:gap-4 md:px-8"
        >
          <Link to="/" className="flex items-center gap-2.5 text-foreground" aria-label={c.home}>
            <span className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-glass">
              <Orbit className="h-5 w-5 text-primary animate-orbit" aria-hidden />
            </span>
            <span className="hidden font-display text-sm font-semibold tracking-tight sm:inline md:text-base">
              Earth <span className="text-cosmic">Jukebox</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn-chip">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {c.back}
            </Link>
            <LangSwitch />
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
          {c.kicker}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          {c.titleBefore}
          <span className="text-cosmic">{c.titleHighlight}</span>
          {c.titleAfter}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {c.intro}
        </p>

        <Section id="camadas" kicker={c.layersKicker} title={c.layersTitle}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              icon={<Music className="h-5 w-5 text-primary" aria-hidden />}
              title={c.musicTitle}
            >
              {c.musicText}
            </Card>
            <Card icon={<Wind className="h-5 w-5 text-accent" aria-hidden />} title={c.phenTitle}>
              {c.phenText}
            </Card>
          </div>
        </Section>

        <Section id="musica" kicker={c.notesKicker} title={c.notesTitle}>
          <ul className="grid gap-4 sm:grid-cols-2">
            {c.rules.map(({ icon: Icon, from, to, how }) => (
              <li key={from} className="glass rounded-2xl p-5">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <p className="mt-3 font-semibold text-foreground">
                  {from} <span className="text-muted-foreground">→</span> {to}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{how}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">{c.instruments}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const ct = categoryText(cat, lang);
              return (
                <li key={cat.id} className={`cat-${cat.id} glass rounded-2xl p-4`}>
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <CategoryIcon id={cat.id} className="h-4 w-4 text-cat" />
                    {ct.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{ct.timbre}</p>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section id="fenomenos" kicker={c.phenKicker} title={c.phenSectionTitle}>
          <div className="grid gap-4 md:grid-cols-3">
            {c.steps.map((step, i) => (
              <Card
                key={step.title}
                icon={
                  i === 0 ? (
                    <Layers className="h-5 w-5 text-primary" aria-hidden />
                  ) : i === 1 ? (
                    <Activity className="h-5 w-5 text-primary" aria-hidden />
                  ) : (
                    <Waves className="h-5 w-5 text-accent" aria-hidden />
                  )
                }
                title={step.title}
              >
                {step.text}
              </Card>
            ))}
          </div>
          <div className="glass mt-6 overflow-hidden rounded-2xl">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{c.tableCaption}</caption>
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {c.colViz}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {c.colSound}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                    {c.colMore}
                  </th>
                </tr>
              </thead>
              <tbody>
                {VISUALIZATIONS.map((v) => {
                  const vt = vizText(v, lang);
                  return (
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
                            {vt.title}
                            <span className="sr-only">
                              , {categoryText(categoryById(v.category), lang).label}
                            </span>
                          </span>
                        </span>
                      </th>
                      <td className="px-4 py-3 text-foreground">{vt.sound}</td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {vt.measures}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="explorar" kicker={c.exploreKicker} title={c.exploreTitle}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              icon={<MoveHorizontal className="h-5 w-5 text-primary" aria-hidden />}
              title={c.dragTitle}
            >
              {c.dragText}
            </Card>
            <Card icon={<Globe2 className="h-5 w-5 text-primary" aria-hidden />} title={c.wvTitle}>
              {c.wvText}
            </Card>
          </div>
        </Section>

        <Section id="acessibilidade" kicker={c.a11yKicker} title={c.a11yTitle}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card icon={<Waves className="h-5 w-5 text-primary" aria-hidden />} title={c.srTitle}>
              {c.srText}
            </Card>
            <Card
              icon={<Keyboard className="h-5 w-5 text-primary" aria-hidden />}
              title={c.keysTitle}
            >
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                {c.keys.map(([k, what]) => (
                  <div key={k} className="contents">
                    <dt className="font-mono text-foreground">{k}</dt>
                    <dd>{what}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </Section>

        <Section id="dados" kicker={c.creditsKicker} title={c.creditsTitle}>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {c.credits.map(([before, strong, after], i) => (
              <li key={i}>
                {before}
                {strong && <span className="text-foreground">{strong}</span>}
                {after}
              </li>
            ))}
          </ul>
          <Link to="/" className="btn-cosmic mt-10">
            {c.back}
          </Link>
        </Section>
      </main>
    </div>
  );
}
