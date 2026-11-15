import { svsAssetUrl } from "./svs";
import type { PhenomenonSpec } from "./phenomena";

export type CategoryId = "atmosfera" | "oceanos" | "gelo" | "terra";

export interface Category {
  id: CategoryId;
  label: string;
  tagline: string;
  /** How this category sounds — shown to users and screen readers. */
  timbre: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "atmosfera",
    label: "Atmosfera",
    tagline: "Furacões, ozono e CO₂",
    timbre: "Pads etéreos e vento filtrado",
  },
  {
    id: "oceanos",
    label: "Oceanos",
    tagline: "Correntes, cor e El Niño",
    timbre: "Graves profundos e ondas que respiram",
  },
  {
    id: "gelo",
    label: "Gelo",
    tagline: "Glaciares e mantos de gelo",
    timbre: "Sinos cristalinos e brilho agudo",
  },
  {
    id: "terra",
    label: "Terra",
    tagline: "Solo, água e luzes noturnas",
    timbre: "Cordas quentes e pulsação rítmica",
  },
];

export interface Visualization {
  id: string;
  svsId: number;
  category: CategoryId;
  title: string;
  description: string;
  /** Longer description for screen readers. */
  altText: string;
  videoPath: string;
  poster: string;
  /** How the phenomenon is measured in each frame and which natural sound plays it. */
  phenomenon: PhenomenonSpec;
}

const v = (
  svsId: number,
  category: CategoryId,
  title: string,
  description: string,
  altText: string,
  videoPath: string,
  posterPath: string,
  phenomenon: PhenomenonSpec,
): Visualization => ({
  id: `svs-${svsId}`,
  svsId,
  category,
  title,
  description,
  altText,
  videoPath,
  poster: svsAssetUrl(posterPath),
  phenomenon,
});

export const VISUALIZATIONS: Visualization[] = [
  // Atmosfera
  v(
    5575,
    "atmosfera",
    "O furacão Erin forma-se no Atlântico",
    "Agosto de 2025: um dos furacões mais intensos da temporada gira a leste de Porto Rico.",
    "Vista de satélite de nuvens brancas em espiral sobre o oceano azul escuro, com o olho do furacão bem definido no centro.",
    "/vis/a000000/a005500/a005575/Erin_v01_2025-08-18_141507.mp4",
    "/vis/a000000/a005500/a005575/Erin_v01_2025-08-18_141507.01300_print.jpg",
    {
      kind: "furacao",
      metric: "hurricane",
      range: [0.032, 0.138],
      sound: "Vento e chuva do furacão",
      measures: "nuvens e chuva intensa (vermelho e amarelo no radar)",
    },
  ),
  v(
    31392,
    "atmosfera",
    "O buraco do ozono na Antártida, 1979–2025",
    "A área máxima do buraco do ozono em cada ano, desde 1979.",
    "Globo centrado no Polo Sul. Uma mancha azul e roxa sobre a Antártida cresce nos anos 80 e 90 e estabiliza nas décadas seguintes.",
    "/vis/a030000/a031300/a031392/ozone_hole_max_area_1979-2025_1080p.mp4",
    "/vis/a030000/a031300/a031392/ozone_hole_max_area_1979-2025.png",
    {
      kind: "estratosfera",
      metric: "ozoneHole",
      region: [0.22, 0, 0.78, 1],
      range: [0.013, 0.224],
      sound: "Vento gelado da estratosfera",
      measures: "área do buraco do ozono (azul e roxo)",
    },
  ),
  v(
    5196,
    "atmosfera",
    "Dióxido de carbono à volta do planeta",
    "Concentração global de CO₂ entre janeiro e março de 2020, simulada em alta resolução.",
    "A câmara orbita a Terra enquanto plumas laranja e amarelas de CO₂ se espalham pelo hemisfério norte sobre um fundo escuro.",
    "/vis/a000000/a005100/a005196/dyamondPointCloud_12-4-2023b_dyamond_co2_anim_globe_tilt_1080p30.mp4",
    "/vis/a000000/a005100/a005196/dyamondPointCloud_12-1-2023b_dyamond_co2_anim_globe_orbit_3x3Hyperwall.00200_print.jpg",
    {
      kind: "fumo",
      metric: "co2",
      range: [0.031, 0.158],
      sound: "Sopro de gases e fumo",
      measures: "densidade das plumas de CO₂ (laranja e amarelo)",
    },
  ),
  v(
    5613,
    "atmosfera",
    "A curva das temperaturas desloca-se",
    "Distribuição das anomalias de temperatura em terra, de 1964 a 2025: o calor extremo torna-se comum.",
    "Uma curva em forma de sino desloca-se para a direita ao longo das décadas, passando de tons azuis para vermelhos.",
    "/vis/a000000/a005600/a005613/GISTEMPDist_2025_C_1080p30.mp4",
    "/vis/a000000/a005600/a005613/GISTEMPDist_2025_C.png",
    {
      kind: "fogo",
      metric: "warmShare",
      range: [0.277, 0.746],
      sound: "Crepitar do calor",
      measures: "parte quente da curva (amarelo e vermelho)",
    },
  ),
  // Oceanos
  v(
    5425,
    "oceanos",
    "Oceano Perpétuo 2: a Corrente do Golfo",
    "As correntes do Atlântico Norte, até 600 m de profundidade, desenhadas como pinceladas de luz.",
    "Costa leste da América do Norte; sobre o oceano azul, milhares de linhas brancas e azuis fluem e formam redemoinhos ao longo da Corrente do Golfo.",
    "/vis/a000000/a005400/a005425/perpetual_ocean2_CLOSE_095_beauty_600m_and_below_1080p30.mp4",
    "/vis/a000000/a005400/a005425/perpetual_ocean2_CLOSE_095_beauty_600m_and_below.14000_print.jpg",
    {
      kind: "correntes",
      metric: "currents",
      range: [0.058, 0.085],
      sound: "Água a correr e ondas",
      measures: "brilho das correntes em movimento",
    },
  ),
  v(
    5298,
    "oceanos",
    "Sargaço no Atlântico, 2010–2023",
    "Média de julho das algas sargaço observadas pelos satélites Terra e Aqua.",
    "Mapa do Atlântico tropical onde quadrados coloridos de sargaço surgem e se multiplicam ano após ano entre África e as Caraíbas.",
    "/vis/a000000/a005200/a005298/sargassum_v28_JulyMean_4k_noOL_2024-05-29_0825_30p_1080p30.mp4",
    "/vis/a000000/a005200/a005298/sargassum_v28_JulyMean_4k_2024-05-28_1650.01775_print.jpg",
    {
      kind: "ondas",
      metric: "sargassum",
      range: [0.0024, 0.011],
      sound: "Ondas a bater nas algas",
      measures: "quantidade de sargaço no mar",
    },
  ),
  v(
    5687,
    "oceanos",
    "El Niño 2026 visto pela cor do oceano",
    "A missão PACE compara a cor do Pacífico em 2025 e 2026 enquanto o El Niño se desenvolve.",
    "Dois mapas lado a lado do oceano Pacífico em tons de azul, verde e amarelo que mudam dia após dia.",
    "/vis/a000000/a005600/a005687/elnino_avw_2025_2026_daily_1900x800.mp4",
    "/vis/a000000/a005600/a005687/elnino_avw_2025_2026_daily_1900x800.jpg",
    {
      kind: "temporal",
      metric: "elNino",
      region: [0.35, 0.25, 0.9, 0.75],
      range: [-0.0086, 0.0217],
      sound: "Ondulação e chuva do El Niño",
      measures: "perda de verde no Pacífico equatorial de 2026 face a 2025",
    },
  ),
  v(
    5599,
    "oceanos",
    "Florações costeiras de fitoplâncton",
    "Dados da missão PACE revelam a vida microscópica que pinta as costas.",
    "Vista aproximada de uma costa onde redemoinhos verdes e turquesa de fitoplâncton se espalham sobre o azul profundo.",
    "/vis/a000000/a005500/a005599/pace_tour_06_coastal_bloom_1080p60.mp4",
    "/vis/a000000/a005500/a005599/pace_tour_full.01845_preview.jpg",
    {
      kind: "bolhas",
      metric: "bloom",
      region: [0, 0, 1, 0.68],
      range: [0, 0.0019],
      sound: "Bolhas de vida microscópica",
      measures: "intensidade da floração de algas",
    },
  ),
  // Gelo
  v(
    31156,
    "gelo",
    "A Gronelândia a perder massa, 2002–2025",
    "Medições de gravidade dos satélites GRACE mostram o manto de gelo a encolher.",
    "A Gronelândia sobre fundo preto; as costas tornam-se vermelhas e escuras à medida que o gelo se perde ao longo dos anos.",
    "/vis/a030000/a031100/a031156/gris_200204-202503_black_1080p6.mp4",
    "/vis/a030000/a031100/a031156/gris_202503_black_with_vel.jpg",
    {
      kind: "degelo",
      metric: "iceLoss",
      range: [0.0034, 0.06],
      sound: "Gelo a estalar e água a pingar",
      measures: "perda de massa de gelo (laranja a vermelho escuro)",
    },
  ),
  v(
    31166,
    "gelo",
    "Os polos a derreter: Antártida e Gronelândia",
    "Duas décadas de perda de massa de gelo nos dois polos, medidas pelo GRACE e GRACE-FO.",
    "A Antártida e a Gronelândia lado a lado, com as margens a passar de branco para vermelho intenso.",
    "/vis/a030000/a031100/a031166/ais_gris_200204-202503_black_1080p6.mp4",
    "/vis/a030000/a031100/a031166/ais_gris_202503_black_with_vel.jpg",
    {
      kind: "degelo",
      metric: "iceLoss",
      range: [0.0018, 0.0277],
      sound: "Gelo a estalar e água a pingar",
      measures: "perda de massa de gelo (laranja a vermelho escuro)",
    },
  ),
  v(
    5591,
    "gelo",
    "ICESat-2: a altura do gelo a mudar",
    "O laser do ICESat-2 mede como o gelo de Svalbard e do norte da Rússia ficou mais fino entre 2020 e 2025.",
    "Ilhas árticas vistas de cima, cobertas por manchas vermelhas onde o gelo perdeu altura e azuis onde ganhou.",
    "/vis/a000000/a005500/a005591/icesat2_land-ice-change_2020-2025_svalbard-north-russia_1080p60.mp4",
    "/vis/a000000/a005500/a005591/icesat2_land-ice-change_2020-2025_antarctica.02080_preview.jpg",
    {
      kind: "degelo",
      metric: "iceLoss",
      range: [0, 0.0134],
      sound: "Gelo a estalar e água a pingar",
      measures: "gelo que perdeu altura (vermelho)",
    },
  ),
  v(
    15030,
    "gelo",
    "O recuo do glaciar Mendenhall, Alasca",
    "De 1986 a 2024 o glaciar recuou cerca de 1,6 km e perdeu centenas de metros de espessura.",
    "Imagens Landsat de um vale: a língua de gelo azul-clara recua enquanto a vegetação vermelha avança.",
    "/vis/a010000/a015000/a015030/Mendenhall_Glacier,_Alaska_-_Web.mp4",
    "/vis/a010000/a015000/a015030/15030---Mendenhall-Glacier_print.jpg",
    {
      kind: "degelo",
      metric: "glacierIce",
      region: [0.35, 0, 0.8, 0.75],
      range: [0.271, 0.583],
      invert: true,
      smoothing: 0.15,
      sound: "Gelo a estalar e água a pingar",
      measures: "recuo do gelo do glaciar (azul-claro)",
    },
  ),
  // Terra
  v(
    15025,
    "terra",
    "Agricultura no deserto da Arábia Saudita",
    "Campos circulares de milho, cevada e trigo acendem-se e apagam-se ao ritmo das colheitas.",
    "Deserto castanho pontilhado de círculos verdes que surgem e desaparecem como luzes a piscar.",
    "/vis/a010000/a015000/a015025/Saudi_Arabia_Crops_-_Web.mp4",
    "/vis/a010000/a015000/a015025/SaudiArabia_Print.jpg",
    {
      kind: "aspersores",
      metric: "crops",
      range: [0.094, 0.437],
      sound: "Aspersores de rega",
      measures: "área de campos cultivados (círculos vermelhos)",
    },
  ),
  v(
    15022,
    "terra",
    "O lago efémero de Carnegie, Austrália",
    "Um leito seco que se transforma num oásis temporário depois de tempestades tropicais.",
    "Planície árida castanha onde, de repente, manchas de água azul escura se espalham e depois secam.",
    "/vis/a010000/a015000/a015022/Lake_Carnegie_-_Natural_Color_-_Web.mp4",
    "/vis/a010000/a015000/a015022/LakeCarnegie_Natural_Print.jpg",
    {
      kind: "chuva",
      metric: "lakeWater",
      range: [0, 0.089],
      sound: "Chuva e água a encher o lago",
      measures: "área de água no lago (verde-azulado)",
    },
  ),
  v(
    5634,
    "terra",
    "As luzes noturnas da Terra a mudar",
    "Como as luzes das cidades cresceram ou se apagaram entre 2014 e 2022.",
    "Globo noturno escuro com pontos de luz; regiões que brilham mais ficam douradas e as que escurecem ficam roxas.",
    "/vis/a000000/a005600/a005634/nightlights_cumulative_change_no_dates_1080p60.mp4",
    "/vis/a000000/a005600/a005634/nightlights_cumulative_change.04589_preview.jpg",
    {
      kind: "cidade",
      metric: "cityLights",
      range: [0, 0.0019],
      sound: "Zumbido e trânsito das cidades",
      measures: "brilho das luzes das cidades",
    },
  ),
  v(
    15027,
    "terra",
    "Desmantelar as barragens do Klamath",
    "Entre 2023 e 2024 quatro barragens caíram e o rio voltou a correr livre.",
    "Vale visto de satélite: um reservatório azul esvazia-se e dá lugar a um rio estreito rodeado de terra castanha que reverdece.",
    "/vis/a010000/a015000/a015027/Klamath_River_Reservoir_-_Web.mp4",
    "/vis/a010000/a015000/a015027/Klamath_Print.jpg",
    {
      kind: "rio",
      metric: "reservoir",
      range: [0, 0.1],
      invert: true,
      smoothing: 0.15,
      sound: "Rio a correr livre",
      measures: "esvaziamento das albufeiras",
    },
  ),
];

export function categoryById(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id)!;
}

/**
 * Random order that mixes categories: no two neighbours share a category
 * whenever that is possible.
 */
export function shuffleMixed<T extends { category: string }>(
  items: T[],
  random: () => number = Math.random,
): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  const out: T[] = [];
  while (pool.length) {
    const prev = out[out.length - 1]?.category;
    // Prefer the category with the most remaining items to avoid a forced repeat at the end.
    const counts = new Map<string, number>();
    for (const p of pool) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    let bestIdx = -1;
    let bestCount = -1;
    pool.forEach((p, idx) => {
      if (p.category === prev) return;
      const c = counts.get(p.category)!;
      if (c > bestCount) {
        bestCount = c;
        bestIdx = idx;
      }
    });
    if (bestIdx === -1) bestIdx = 0;
    out.push(pool.splice(bestIdx, 1)[0]!);
  }
  return out;
}
