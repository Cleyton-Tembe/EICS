// Interface text in English (default) and Portuguese. Pure data + a tiny formatter.

export type Lang = "en" | "pt";
export const DEFAULT_LANG: Lang = "en";
export const LANGS: Lang[] = ["en", "pt"];
export const LANG_KEY = "earth-jukebox:lang";

const en = {
  // Navbar
  "nav.all": "All",
  "nav.about": "About",
  "nav.aboutLabel": "About: how it works",
  "nav.home": "Earth Jukebox — back to the start",
  "nav.categories": "Categories",
  "nav.main": "Main navigation",
  "nav.playingNow": "playing now",
  "nav.fullscreen": "Full screen",
  "nav.fullscreenLabel": "Full screen: video only",
  "nav.exitFullscreen": "Exit",
  "nav.exitFullscreenLabel": "Exit full screen",
  "nav.soundOn": "Sound on",
  "nav.soundOff": "Turn sound on",
  "nav.language": "Language",
  // Hero
  "hero.kicker": "Data from the NASA Earth Information Center",
  "hero.title.before": "Hear the ",
  "hero.title.highlight": "Earth",
  "hero.title.after": " change.",
  "hero.text":
    "Real NASA visualizations turned into sound, live. Scroll and each video starts playing its own soundscape.",
  "hero.start": "Start listening",
  // Video card
  "card.position": "{n} of {total}: {title}. Category {category}.",
  "card.open": "Show details",
  "card.close": "Hide details",
  "card.listen": "Listen",
  "card.description": "Description",
  "card.sonification": "Sonification",
  "card.descriptionHint": "Description (I)",
  "card.sonificationHint": "Sonification (S)",
  "card.meaningTitle": "What the changes mean",
  "card.closeDescription": "Close description",
  "card.soundLine": "Sound: {sound} — gets louder and higher as {measures}.",
  "card.soundLabel": "Sound",
  "card.visual": "Visual description: {alt}",
  "card.worldviewTitle": "Explore in NASA Worldview: {what}",
  "card.worldviewLabel": "See in NASA Worldview: {what} (opens in a new tab)",
  "card.svsLabel": "Original page at NASA SVS, number {id} (opens in a new tab)",
  "card.loading": "Receiving NASA data…",
  // Sonification panel
  "panel.title": "Live sonification",
  "panel.close": "Close sonification",
  "panel.chord": "Chord",
  "panel.rhythm": "Rhythm",
  "panel.notesPerSecond": "notes/s",
  "panel.soundOff": "sound off",
  "panel.color": "Dominant colour",
  "panel.hue": "hue",
  "panel.brightness": "Brightness",
  "panel.brightnessHint": "timbre",
  "panel.warmth": "Warmth",
  "panel.warmthHint": "tension",
  "panel.texture": "Texture",
  "panel.textureHint": "rhythm",
  "panel.motion": "Motion",
  "panel.motionHint": "intensity",
  "panel.fallback": "approximate mode: the image could not be read",
  "panel.measures": "rises as {measures}",
  "panel.meterLabel": "Phenomenon intensity, which rises as {measures}",
  "panel.spoken": "Phenomenon intensity {level}: the sound gets {how}.",
  "level.low": "low",
  "level.medium": "medium",
  "level.high": "high",
  "level.how.low": "soft and deep",
  "level.how.medium": "moderate",
  "level.how.high": "strong and high",
  // Page
  "page.playing": "Playing: {title}. {category}.",
  "page.fullscreenOn": "Full screen: only the video and the navigation.",
  "page.feed": "Visualizations",
  "end.kicker": "End of the orbit",
  "end.title.before": "Every change on the planet has ",
  "end.title.highlight": "a sound",
  "end.title.after": ".",
  "end.howQuestion": "Want to know how the images become music?",
  "end.howLink": "Read how it works",
  "end.shuffle": "Shuffle and listen again",
  "end.back": "Back to the start",
  "end.keys":
    "Keyboard: ↓ / ↑ change video · ← / → back and forward in time · I description · S sonification · M sound · F full screen.",
  "chord.major": "major",
  "chord.minor": "minor",
  "chord.sus": "sus",
};

type Dict = Record<keyof typeof en, string>;

const pt: Dict = {
  "nav.all": "Todas",
  "nav.about": "Sobre",
  "nav.aboutLabel": "Sobre: como funciona",
  "nav.home": "Earth Jukebox — voltar ao início",
  "nav.categories": "Categorias",
  "nav.main": "Navegação principal",
  "nav.playingNow": "a tocar agora",
  "nav.fullscreen": "Ecrã inteiro",
  "nav.fullscreenLabel": "Ecrã inteiro: só o vídeo",
  "nav.exitFullscreen": "Sair",
  "nav.exitFullscreenLabel": "Sair do ecrã inteiro",
  "nav.soundOn": "Som ligado",
  "nav.soundOff": "Ligar som",
  "nav.language": "Língua",
  "hero.kicker": "Dados do NASA Earth Information Center",
  "hero.title.before": "Ouve a ",
  "hero.title.highlight": "Terra",
  "hero.title.after": " a mudar.",
  "hero.text":
    "Visualizações reais da NASA transformadas em som, ao vivo. Desliza e cada vídeo começa a tocar a sua própria paisagem sonora.",
  "hero.start": "Começar a ouvir",
  "card.position": "{n} de {total}: {title}. Categoria {category}.",
  "card.open": "Mostrar detalhes",
  "card.close": "Esconder detalhes",
  "card.listen": "Ouvir",
  "card.description": "Descrição",
  "card.sonification": "Sonificação",
  "card.descriptionHint": "Descrição (I)",
  "card.sonificationHint": "Sonificação (S)",
  "card.meaningTitle": "O que significam as mudanças",
  "card.closeDescription": "Fechar descrição",
  "card.soundLine": "Som: {sound} — mais forte e agudo quanto maior for {measures}.",
  "card.soundLabel": "Som",
  "card.visual": "Descrição visual: {alt}",
  "card.worldviewTitle": "Explorar no NASA Worldview: {what}",
  "card.worldviewLabel": "Ver no NASA Worldview: {what} (abre num novo separador)",
  "card.svsLabel": "Página original na NASA SVS, número {id} (abre num novo separador)",
  "card.loading": "A receber dados da NASA…",
  "panel.title": "Sonificação ao vivo",
  "panel.close": "Fechar sonificação",
  "panel.chord": "Acorde",
  "panel.rhythm": "Ritmo",
  "panel.notesPerSecond": "notas/s",
  "panel.soundOff": "som desligado",
  "panel.color": "Cor dominante",
  "panel.hue": "tom",
  "panel.brightness": "Brilho",
  "panel.brightnessHint": "timbre",
  "panel.warmth": "Calor",
  "panel.warmthHint": "tensão",
  "panel.texture": "Textura",
  "panel.textureHint": "ritmo",
  "panel.motion": "Movimento",
  "panel.motionHint": "intensidade",
  "panel.fallback": "modo aproximado: a imagem não pôde ser lida",
  "panel.measures": "mede: {measures}",
  "panel.meterLabel": "Intensidade do fenómeno: {measures}",
  "panel.spoken": "Intensidade do fenómeno {level}: o som fica {how}.",
  "level.low": "baixa",
  "level.medium": "média",
  "level.high": "alta",
  "level.how.low": "suave e grave",
  "level.how.medium": "moderado",
  "level.how.high": "forte e agudo",
  "page.playing": "A tocar: {title}. {category}.",
  "page.fullscreenOn": "Ecrã inteiro: só o vídeo e a navegação.",
  "page.feed": "Visualizações",
  "end.kicker": "Fim da órbita",
  "end.title.before": "Cada mudança no planeta tem ",
  "end.title.highlight": "um som",
  "end.title.after": ".",
  "end.howQuestion": "Queres saber como as imagens se transformam em música?",
  "end.howLink": "Lê como funciona",
  "end.shuffle": "Baralhar e ouvir de novo",
  "end.back": "Voltar ao início",
  "end.keys":
    "Teclado: ↓ / ↑ mudar de vídeo · ← / → recuar ou avançar no tempo · I descrição · S sonificação · M som · F ecrã inteiro.",
  "chord.major": "maior",
  "chord.minor": "menor",
  "chord.sus": "sus",
};

export const STRINGS: Record<Lang, Dict> = { en, pt };
export type StringKey = keyof typeof en;

export function translate(
  lang: Lang,
  key: StringKey,
  vars?: Record<string, string | number>,
): string {
  let s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

export function isLang(x: unknown): x is Lang {
  return x === "en" || x === "pt";
}

const NOTE_NAMES: Record<Lang, string[]> = {
  en: ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"],
  pt: ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Lá♭", "Lá", "Si♭", "Si"],
};

/** Chord name in the visitor's language, e.g. "F♯ major 7" / "Fá♯ maior 7". */
export function chordName(
  lang: Lang,
  rootPc: number,
  mode: "maior" | "menor" | "suspenso",
  seventh: boolean,
): string {
  const m = mode === "maior" ? "chord.major" : mode === "menor" ? "chord.minor" : "chord.sus";
  return `${NOTE_NAMES[lang][((rootPc % 12) + 12) % 12]} ${translate(lang, m)}${seventh ? " 7" : ""}`;
}
