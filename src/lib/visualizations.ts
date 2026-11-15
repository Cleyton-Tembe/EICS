import { svsAssetUrl } from "./svs";
import type { PhenomenonSpec } from "./phenomena";
import type { Timeline, WorldviewLink } from "./worldview";

export type CategoryId = "atmosfera" | "oceanos" | "gelo" | "terra";

export interface CategoryText {
  label: string;
  tagline: string;
  /** How this category sounds — shown to users and screen readers. */
  timbre: string;
}

export interface Category extends CategoryText {
  id: CategoryId;
  /** English text (the Portuguese is in the fields above). */
  en: CategoryText;
}

export const CATEGORIES: Category[] = [
  {
    id: "atmosfera",
    label: "Atmosfera",
    tagline: "Furacões, ozono e CO₂",
    timbre: "Pads etéreos e vento filtrado",
    en: {
      label: "Atmosphere",
      tagline: "Hurricanes, ozone and CO₂",
      timbre: "Airy pads and filtered wind",
    },
  },
  {
    id: "oceanos",
    label: "Oceanos",
    tagline: "Correntes, cor e El Niño",
    timbre: "Graves profundos e ondas que respiram",
    en: {
      label: "Oceans",
      tagline: "Currents, colour and El Niño",
      timbre: "Deep basses and breathing waves",
    },
  },
  {
    id: "gelo",
    label: "Gelo",
    tagline: "Glaciares e mantos de gelo",
    timbre: "Sinos cristalinos e brilho agudo",
    en: {
      label: "Ice",
      tagline: "Glaciers and ice sheets",
      timbre: "Crystal bells and bright highs",
    },
  },
  {
    id: "terra",
    label: "Terra",
    tagline: "Solo, água e luzes noturnas",
    timbre: "Cordas quentes e pulsação rítmica",
    en: {
      label: "Land",
      tagline: "Soil, water and night lights",
      timbre: "Warm strings and a rhythmic pulse",
    },
  },
];

/** Text of a visualization in one language. */
export interface VizText {
  title: string;
  description: string;
  meaning: string;
  altText: string;
  /** What you hear (phenomenon sound) and what makes it stronger. */
  sound: string;
  measures: string;
  /** What the Worldview link shows. */
  what: string;
  timeline?: Timeline;
}

export interface Visualization {
  id: string;
  svsId: number;
  category: CategoryId;
  title: string;
  description: string;
  /** What the changes in the video mean, in plain words (shown in "Descrição"). */
  meaning: string;
  /** English text; the Portuguese is in the main fields. */
  en: VizText;
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
  extra: { meaning: string; en: VizText; worldview: WorldviewLink; timeline?: Timeline },
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
      en: {
        title: "Hurricane Erin takes shape in the Atlantic",
        description:
          "August 2025: one of the season's strongest hurricanes spins east of Puerto Rico.",
        meaning:
          "The radar colours show where rain falls hardest: red is heavy rain. The tighter and redder the spiral, the more energy the hurricane draws from the warm ocean — and warmer oceans feed stronger hurricanes.",
        altText:
          "Satellite view of white clouds spiralling over the dark blue ocean, with the hurricane's eye clearly defined in the centre.",
        sound: "Hurricane wind and rain",
        measures: "clouds and heavy rain increase (red and yellow on the radar)",
        what: "Erin's rain measured by satellite (IMERG)",
        timeline: { from: "Aug 16 2025", to: "Aug 19 2025" },
      },
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
      sound: "Pulsos gelados da estratosfera",
      measures: "área do buraco do ozono (azul e roxo)",
    },
    {
      meaning:
        "Azul e roxo marcam onde há pouco ozono, a camada que nos protege da radiação ultravioleta. O buraco cresceu com os gases CFC e deixou de crescer depois de o Protocolo de Montreal (1987) os proibir.",
      en: {
        title: "The Antarctic ozone hole, 1979–2025",
        description: "The largest extent of the ozone hole each year since 1979.",
        meaning:
          "Blue and purple mark where ozone is low — the layer that shields us from ultraviolet radiation. The hole grew with CFC gases and stopped growing after the Montreal Protocol (1987) banned them.",
        altText:
          "Globe centred on the South Pole. A blue and purple patch over Antarctica grows through the 1980s and 1990s and levels off in the following decades.",
        sound: "Icy stratospheric pulses",
        measures: "the ozone hole grows (blue and purple)",
        what: "total ozone over Antarctica (OMPS)",
        timeline: { from: "1979", to: "2025" },
      },
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
      en: {
        title: "Carbon dioxide around the planet",
        description:
          "Global CO₂ concentration from January to March 2020, simulated at high resolution.",
        meaning:
          "The orange and yellow plumes are CO₂ released mostly by burning fossil fuels and by fires, carried by the wind. It is the main gas warming the planet.",
        altText:
          "The camera orbits the Earth as orange and yellow plumes of CO₂ spread across the northern hemisphere against a dark background.",
        sound: "Breath of gas and smoke",
        measures: "the CO₂ plumes get denser (orange and yellow)",
        what: "CO₂ measured by the OCO-2 satellite",
      },
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
      sound: "Batimento e crepitar do calor",
      measures: "parte quente da curva (amarelo e vermelho)",
    },
    {
      meaning:
        "Cada curva mostra quantas zonas de terra tiveram um ano mais frio (azul) ou mais quente (vermelho) do que o normal. A curva desliza para a direita: o calor que antes era raro é hoje comum.",
      en: {
        title: "The temperature curve shifts",
        description:
          "The spread of land temperature anomalies from 1964 to 2025: extreme heat becomes common.",
        meaning:
          "Each curve shows how many land areas had a colder (blue) or hotter (red) year than normal. The curve slides to the right: heat that used to be rare is now common.",
        altText:
          "A bell-shaped curve moves to the right over the decades, turning from blue to red.",
        sound: "Heartbeat and crackle of heat",
        measures: "more of the curve turns warm (yellow and red)",
        what: "surface air temperature (MERRA-2)",
        timeline: { from: "1954", to: "2025" },
      },
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
      en: {
        title: "Perpetual Ocean 2: the Gulf Stream",
        description: "North Atlantic currents, down to 600 m deep, drawn as brushstrokes of light.",
        meaning:
          "The lines are currents computed from real data. The Gulf Stream carries warm water north and helps regulate the climate of North America and Europe; the eddies mix heat and nutrients.",
        altText:
          "East coast of North America; over the blue ocean, thousands of white and blue lines flow and swirl along the Gulf Stream.",
        sound: "Running water and waves",
        measures: "the moving currents glow brighter",
        what: "sea temperature: the Gulf Stream (MUR)",
      },
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
      en: {
        title: "Sargassum in the Atlantic, 2010–2023",
        description: "July average of sargassum seaweed seen by the Terra and Aqua satellites.",
        meaning:
          "Each coloured square is sargassum seen from space; red is densest. Since 2011 this seaweed has multiplied with more nutrients and warm water, washing ashore in huge amounts in the Caribbean and West Africa.",
        altText:
          "Map of the tropical Atlantic where coloured squares of sargassum appear and multiply year after year between Africa and the Caribbean.",
        sound: "Waves lapping the seaweed",
        measures: "sargassum spreads at sea",
        what: "satellite images of the tropical Atlantic (MODIS)",
        timeline: { from: "2010", to: "2023" },
      },
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
      en: {
        title: "El Niño 2026 seen in the ocean's colour",
        description:
          "NASA's PACE mission compares the colour of the Pacific in 2025 and 2026 as El Niño develops.",
        meaning:
          "Colour shows life in the sea: green and yellow mean more phytoplankton. During El Niño, cold nutrient-rich water stops rising in the equatorial Pacific, and the green band fades in 2026 compared with 2025.",
        altText:
          "Two maps of the Pacific Ocean, one above the other, in shades of blue, green and yellow that change day by day.",
        sound: "El Niño swell and rain",
        measures: "the equatorial Pacific loses green in 2026 compared with 2025",
        what: "Pacific temperature anomaly and PACE chlorophyll",
        timeline: { from: "Mar", to: "Nov" },
      },
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
      en: {
        title: "Coastal phytoplankton blooms",
        description:
          "Data from the PACE mission reveal the microscopic life that paints the coasts.",
        meaning:
          "The orange and red patches are a harmful algal bloom detected by the PACE satellite. Warmer water favours these blooms, which can kill fish and hurt fisheries.",
        altText:
          "Close-up of a coastline where green and turquoise swirls of phytoplankton spread over the deep blue.",
        sound: "Bubbles of microscopic life",
        measures: "the algal bloom intensifies",
        what: "chlorophyll measured by the PACE mission",
        timeline: { from: "Mar 2025", to: "Jun 2025" },
      },
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
      en: {
        title: "Greenland losing mass, 2002–2025",
        description: "Gravity measurements from the GRACE satellites show the ice sheet shrinking.",
        meaning:
          "Orange and red show where the ice sheet has lost mass since 2002. Greenland loses on average 264 billion tonnes of ice a year, and that water raises sea level.",
        altText:
          "Greenland on a black background; its coasts turn red and dark as ice is lost over the years.",
        sound: "Ice cracking and water dripping",
        measures: "ice mass is lost (orange to dark red)",
        what: "mass change measured by GRACE-FO",
        timeline: { from: "2002", to: "2025" },
      },
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
      en: {
        title: "The poles melting: Antarctica and Greenland",
        description: "Two decades of ice mass loss at both poles, measured by GRACE and GRACE-FO.",
        meaning:
          "Red is ice lost, blue is ice gained. The coasts of Greenland and West Antarctica are losing ice faster and faster — together they are one of the biggest causes of sea-level rise.",
        altText:
          "Antarctica and Greenland side by side, their edges turning from white to deep red.",
        sound: "Ice cracking and water dripping",
        measures: "ice mass is lost (orange to dark red)",
        what: "mass change measured by GRACE-FO",
        timeline: { from: "2002", to: "2025" },
      },
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
      en: {
        title: "ICESat-2: ice height changing",
        description:
          "ICESat-2's laser measures how the ice of Svalbard and northern Russia thinned between 2020 and 2025.",
        meaning:
          "Red shows where the ice surface has dropped since 2020, measured by a laser from space. Year after year, the ice on these Arctic islands gets thinner.",
        altText:
          "Arctic islands seen from above, covered in red patches where the ice lost height and blue where it gained.",
        sound: "Ice cracking and water dripping",
        measures: "the ice loses height (red)",
        what: "Arctic ice mass loss measured by GRACE-FO",
        timeline: { from: "2020", to: "2025" },
      },
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
      kind: "glaciar",
      metric: "glacierIce",
      region: [0.35, 0, 0.8, 0.75],
      range: [0.271, 0.583],
      invert: true,
      smoothing: 0.15,
      sound: "Glaciar a pingar e a ranger",
      measures: "recuo do gelo do glaciar (azul-claro)",
    },
    {
      meaning:
        "Em falsa cor, o gelo aparece azul-claro e a vegetação verde. O glaciar recuou cerca de 1,6 km desde 1986 e as plantas ocupam o vale que o gelo deixou livre.",
      en: {
        title: "The retreat of Mendenhall Glacier, Alaska",
        description:
          "From 1986 to 2024 the glacier retreated about 1.6 km and lost hundreds of metres of thickness.",
        meaning:
          "In false colour, ice appears light blue and vegetation green. The glacier has retreated about 1.6 km since 1986 and plants are taking over the valley the ice left behind.",
        altText:
          "Landsat images of a valley: the light-blue tongue of ice retreats as red vegetation advances.",
        sound: "Glacier dripping and creaking",
        measures: "the glacier ice retreats (light blue)",
        what: "the glacier in false colour (Landsat HLS)",
        timeline: { from: "1986", to: "2024" },
      },
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
      en: {
        title: "Farming in the Saudi Arabian desert",
        description:
          "Circular fields of corn, barley, sorghum and wheat light up and fade with the harvests.",
        meaning:
          "In false colour, crops appear red. The circles are fields watered with very old groundwater: they light up as plants grow and fade with the harvest.",
        altText:
          "Brown desert dotted with green circles that appear and disappear like blinking lights.",
        sound: "Irrigation sprinklers",
        measures: "more fields are cultivated (red circles)",
        what: "crop fields in false colour (Landsat HLS)",
        timeline: { from: "Jan 2024", to: "Jan 2025" },
      },
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
      en: {
        title: "The ephemeral Lake Carnegie, Australia",
        description: "A dry bed that turns into a temporary oasis after tropical storms.",
        meaning:
          "The lake is almost always dry. After tropical storms it fills with water (blue-green) and dries again within months — extreme rain transforming the desert.",
        altText:
          "Arid brown plain where patches of dark blue water suddenly spread and then dry up.",
        sound: "Rain and water filling the lake",
        measures: "water fills the lake (blue-green)",
        what: "the lake seen by satellite (Landsat HLS and MODIS)",
        timeline: { from: "2019", to: "2021" },
      },
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
      en: {
        title: "Earth's night lights changing",
        description: "How city lights grew or dimmed between 2014 and 2022.",
        meaning:
          "Gold shows where night lights got brighter between 2014 and 2022 (new cities, more electricity); purple where they dimmed (crises, conflicts or a switch to LED lighting).",
        altText:
          "Dark night-time globe with points of light; regions that shine brighter turn gold and those that dim turn purple.",
        sound: "Hum and traffic of the cities",
        measures: "the city lights shine brighter",
        what: "night lights (VIIRS Black Marble)",
      },
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
      en: {
        title: "Removing the Klamath dams",
        description: "Between 2023 and 2024 four dams came down and the river ran free again.",
        meaning:
          "The dark blue of the reservoirs disappears as the dams fall and the river runs free again. The exposed land turns green and salmon can swim upstream once more.",
        altText:
          "Valley seen from space: a blue reservoir drains and gives way to a narrow river surrounded by brown land that turns green again.",
        sound: "River running free",
        measures: "the reservoirs drain",
        what: "the Klamath River seen by satellite (Landsat HLS and MODIS)",
        timeline: { from: "Oct 2023", to: "Mar 2025" },
      },
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

export type { Lang } from "./i18n";
import type { Lang } from "./i18n";

/** Text of a visualization in the visitor's language. */
export function vizText(v: Visualization, lang: Lang): VizText {
  if (lang === "en") return v.en;
  return {
    title: v.title,
    description: v.description,
    meaning: v.meaning,
    altText: v.altText,
    sound: v.phenomenon.sound,
    measures: v.phenomenon.measures,
    what: v.worldview.what,
    ...(v.timeline ? { timeline: v.timeline } : {}),
  };
}

export function categoryText(c: Category, lang: Lang): CategoryText {
  return lang === "en" ? c.en : c;
}

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
 * Order a visitor sees when scrolling: CO₂ first, then the most striking ones alternating
 * themes, and Greenland losing mass last.
 */
export const FEATURED_ORDER: number[] = [
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
  31156, // Gronelândia a perder massa (last)
];

export function featuredOrder(items: Visualization[] = VISUALIZATIONS): Visualization[] {
  const rank = (v: Visualization) => {
    const i = FEATURED_ORDER.indexOf(v.svsId);
    return i === -1 ? FEATURED_ORDER.length : i;
  };
  return [...items].sort((a, b) => rank(a) - rank(b));
}
