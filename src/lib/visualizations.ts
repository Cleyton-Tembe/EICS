import { svsAssetUrl } from "./svs";
import type { PhenomenonSpec } from "./phenomena";
import type { Timeline, WorldviewLink } from "./worldview";

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
  /** What the changes in the video mean, in plain words (shown in "Descrição"). */
  meaning: string;
  /** Longer description for screen readers. */
  altText: string;
  videoPath: string;
  poster: string;
  /** How the phenomenon is measured in each frame and which natural sound plays it. */
  phenomenon: PhenomenonSpec;
  /** The same phenomenon in NASA Worldview, with the matching data layer. */
  worldview: WorldviewLink;
  /** Period shown; when present the user can drag to move forward and back in time. */
  timeline?: Timeline;
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
  extra: { meaning: string; worldview: WorldviewLink; timeline?: Timeline },
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
  ...extra,
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
    {
      meaning:
        "As cores do radar mostram onde chove com mais força: vermelho é chuva intensa. Quanto mais fechada e vermelha a espiral, mais energia o furacão tira do oceano quente — e oceanos mais quentes alimentam furacões mais fortes.",
      worldview: {
        layers: [
          "IMERG_Precipitation_Rate",
          "Coastlines_15m",
          "VIIRS_SNPP_CorrectedReflectance_TrueColor",
        ],
        date: "2025-08-17",
        view: [-75, 10, -50, 30],
        what: "chuva do Erin medida por satélite (IMERG)",
      },
      timeline: { from: "16 ago 2025", to: "19 ago 2025" },
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
    {
      meaning:
        "Azul e roxo marcam onde há pouco ozono, a camada que nos protege da radiação ultravioleta. O buraco cresceu com os gases CFC e deixou de crescer depois de o Protocolo de Montreal (1987) os proibir.",
      worldview: {
        layers: [
          "OMPS_Ozone_Total_Column",
          "Coastlines_15m",
          "MODIS_Terra_CorrectedReflectance_TrueColor",
        ],
        date: "2025-09-09",
        view: [-180, -90, 180, -35],
        what: "ozono total sobre a Antártida (OMPS)",
      },
      timeline: { from: "1979", to: "2025" },
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
    {
      meaning:
        "As plumas laranja e amarelas são CO₂ libertado sobretudo pela queima de combustíveis fósseis e por incêndios, levado pelo vento. É o principal gás que está a aquecer o planeta.",
      worldview: {
        layers: [
          "OCO-2_Carbon_Dioxide_Total_Column_Average",
          "Coastlines_15m",
          "MODIS_Terra_CorrectedReflectance_TrueColor",
        ],
        date: "2020-02-15",
        view: [-180, -60, 180, 80],
        what: "CO₂ medido pelo satélite OCO-2",
      },
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
    {
      meaning:
        "Cada curva mostra quantas zonas de terra tiveram um ano mais frio (azul) ou mais quente (vermelho) do que o normal. A curva desliza para a direita: o calor que antes era raro é hoje comum.",
      worldview: {
        layers: ["MERRA2_2m_Air_Temperature_Monthly", "Coastlines_15m"],
        date: "2025-07-01",
        view: [-180, -90, 180, 90],
        what: "temperatura do ar à superfície (MERRA-2)",
      },
      timeline: { from: "1954", to: "2025" },
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
    {
      meaning:
        "As linhas são correntes calculadas a partir de dados reais. A Corrente do Golfo leva água quente para norte e ajuda a regular o clima da América do Norte e da Europa; os redemoinhos misturam calor e nutrientes.",
      worldview: {
        layers: [
          "GHRSST_L4_MUR_Sea_Surface_Temperature",
          "Coastlines_15m",
          "MODIS_Terra_CorrectedReflectance_TrueColor",
        ],
        date: "2025-06-01",
        view: [-85, 22, -50, 46],
        what: "temperatura do mar: a Corrente do Golfo (MUR)",
      },
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
    {
      meaning:
        "Cada quadrado colorido é sargaço visto por satélite; vermelho é mais denso. Desde 2011 estas algas multiplicaram-se com mais nutrientes e água quente, e chegam em massa às praias das Caraíbas e de África.",
      worldview: {
        layers: ["MODIS_Aqua_CorrectedReflectance_TrueColor", "Coastlines_15m"],
        date: "2023-07-15",
        view: [-90, 0, -15, 32],
        what: "imagens de satélite do Atlântico tropical (MODIS)",
      },
      timeline: { from: "2010", to: "2023" },
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
    {
      meaning:
        "A cor mostra a vida no mar: verde e amarelo indicam mais fitoplâncton. Com o El Niño, a água fria e rica em nutrientes deixa de subir no Pacífico equatorial e a faixa verde enfraquece em 2026 face a 2025.",
      worldview: {
        layers: [
          "GHRSST_L4_MUR25_Sea_Surface_Temperature_Anomalies",
          "OCI_PACE_Chlorophyll_a(hidden)",
          "Coastlines_15m",
        ],
        date: "2026-10-01",
        view: [-180, -35, -70, 35],
        what: "anomalia de temperatura do Pacífico e clorofila PACE",
      },
      timeline: { from: "mar", to: "nov" },
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
    {
      meaning:
        "As manchas laranja e vermelhas são uma floração de algas nocivas detetada pelo satélite PACE. Água mais quente favorece estas florações, que podem matar peixes e afetar a pesca.",
      worldview: {
        layers: ["OCI_PACE_Chlorophyll_a", "OCI_PACE_True_Color", "Coastlines_15m"],
        date: "2025-05-05",
        view: [134.5, -37.5, 140.5, -33.5],
        what: "clorofila medida pela missão PACE",
      },
      timeline: { from: "mar 2025", to: "jun 2025" },
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
    {
      meaning:
        "Laranja e vermelho mostram onde o manto de gelo perdeu massa desde 2002. A Gronelândia perde em média 264 mil milhões de toneladas de gelo por ano, e essa água faz subir o nível do mar.",
      worldview: {
        layers: [
          "GRACE_Tellus_Liquid_Water_Equivalent_Thickness_Mascon_CRI",
          "Coastlines_15m",
          "MODIS_Terra_CorrectedReflectance_TrueColor",
        ],
        date: "2022-07-01",
        view: [-80, 57, -5, 85],
        what: "variação de massa medida pelo GRACE-FO",
      },
      timeline: { from: "2002", to: "2025" },
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
    {
      meaning:
        "Vermelho é gelo perdido, azul é gelo ganho. As costas da Gronelândia e da Antártida Ocidental perdem gelo cada vez mais depressa — juntas, são uma das maiores causas da subida do mar.",
      worldview: {
        layers: [
          "GRACE_Tellus_Liquid_Water_Equivalent_Thickness_Mascon_CRI",
          "Coastlines_15m",
          "MODIS_Terra_CorrectedReflectance_TrueColor",
        ],
        date: "2022-07-01",
        view: [-180, -90, 180, 90],
        what: "variação de massa medida pelo GRACE-FO",
      },
      timeline: { from: "2002", to: "2025" },
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
    {
      meaning:
        "Vermelho mostra onde a superfície do gelo baixou desde 2020, medida por um laser a partir do espaço. Ano após ano, o gelo destas ilhas árticas fica mais fino.",
      worldview: {
        layers: [
          "GRACE_Tellus_Liquid_Water_Equivalent_Thickness_Mascon_CRI",
          "Coastlines_15m",
          "MODIS_Terra_CorrectedReflectance_TrueColor",
        ],
        date: "2022-07-01",
        view: [5, 74, 70, 82],
        what: "perda de massa de gelo no Ártico medida pelo GRACE-FO",
      },
      timeline: { from: "2020", to: "2025" },
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
    {
      meaning:
        "Em falsa cor, o gelo aparece azul-claro e a vegetação verde. O glaciar recuou cerca de 1,6 km desde 1986 e as plantas ocupam o vale que o gelo deixou livre.",
      worldview: {
        layers: ["HLS_False_Color_Landsat", "MODIS_Terra_CorrectedReflectance_TrueColor"],
        date: "2024-08-06",
        view: [-134.8, 58.3, -134.3, 58.65],
        what: "o glaciar em falsa cor (Landsat HLS)",
      },
      timeline: { from: "1986", to: "2024" },
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
    {
      meaning:
        "Em falsa cor, as culturas aparecem vermelhas. Os círculos são campos regados com água subterrânea muito antiga: acendem-se quando as plantas crescem e apagam-se com a colheita.",
      worldview: {
        layers: ["HLS_False_Color_Landsat", "MODIS_Terra_CorrectedReflectance_TrueColor"],
        date: "2024-03-15",
        view: [37.3, 29.4, 39.3, 31.0],
        what: "campos de cultivo em falsa cor (Landsat HLS)",
      },
      timeline: { from: "jan 2024", to: "jan 2025" },
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
    {
      meaning:
        "O lago está quase sempre seco. Depois de tempestades tropicais enche-se de água (verde-azulada) e volta a secar em poucos meses — a chuva extrema transforma o deserto.",
      worldview: {
        layers: [
          "HLS_L30_Nadir_BRDF_Adjusted_Reflectance",
          "MODIS_Terra_CorrectedReflectance_TrueColor",
        ],
        date: "2020-06-14",
        view: [121.5, -26.9, 123.7, -25.6],
        what: "o lago visto por satélite (Landsat HLS e MODIS)",
      },
      timeline: { from: "2019", to: "2021" },
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
    {
      meaning:
        "Dourado mostra onde as luzes da noite ficaram mais fortes entre 2014 e 2022 (cidades novas, mais eletricidade); roxo, onde enfraqueceram (crises, conflitos ou mudança para iluminação LED).",
      worldview: {
        layers: ["VIIRS_SNPP_DayNightBand_At_Sensor_Radiance", "Coastlines_15m"],
        date: "2022-12-15",
        view: [-180, -60, 180, 75],
        what: "luzes noturnas (VIIRS Black Marble)",
      },
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
    {
      meaning:
        "O azul escuro das albufeiras desaparece quando as barragens caem e o rio volta a correr livre. A terra exposta volta a ficar verde e os salmões podem voltar a subir o rio.",
      worldview: {
        layers: [
          "HLS_L30_Nadir_BRDF_Adjusted_Reflectance",
          "MODIS_Terra_CorrectedReflectance_TrueColor",
        ],
        date: "2024-08-27",
        view: [-122.7, 41.8, -122.1, 42.15],
        what: "o rio Klamath visto por satélite (Landsat HLS e MODIS)",
      },
      timeline: { from: "out 2023", to: "mar 2025" },
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

/**
 * Order a visitor sees when scrolling: ice first (Greenland losing mass), then CO₂, then the
 * most striking ones, alternating themes.
 */
export const FEATURED_ORDER: number[] = [
  31156, // Gronelândia a perder massa
  5196, // CO₂ à volta do planeta
  5575, // Furacão Erin
  5613, // A curva das temperaturas
  15030, // Glaciar Mendenhall
  31392, // Buraco do ozono
  5687, // El Niño
  15022, // Lago Carnegie
  5425, // Corrente do Golfo
  31166, // Os polos a derreter
  15025, // Agricultura no deserto
  5634, // Luzes noturnas
  5298, // Sargaço
  5591, // ICESat-2
  15027, // Barragens do Klamath
  5599, // Fitoplâncton
];

export function featuredOrder(items: Visualization[] = VISUALIZATIONS): Visualization[] {
  const rank = (v: Visualization) => {
    const i = FEATURED_ORDER.indexOf(v.svsId);
    return i === -1 ? FEATURED_ORDER.length : i;
  };
  return [...items].sort((a, b) => rank(a) - rank(b));
}
