import type { ArticleSection } from '../articles/article.entity';
import type { DealerService } from '../dealers/dealer.entity';

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

/** Categories listed under "Accesorios" instead of "Máquinas y herramientas". */
export const accessoryCategorySlugs = new Set([
  'equipos-de-proteccion',
  'lubricantes',
  'cadenas-y-espadas',
]);

export const extraCategories = [
  {
    slug: 'cadenas-y-espadas',
    name: 'Cadenas y espadas',
    icon: 'chainsaw',
    description: 'Repuestos originales de corte para tu motosierra.',
    imageUrl: unsplash('1641366784341-446c64b421a2'),
  },
];

export const extraProducts = [
  {
    slug: 'cadena-pm3-14',
    name: 'Cadena PM3 14"',
    category: 'cadenas-y-espadas',
    powerSource: 'electric' as const,
    isNew: false,
    price: '89.90',
    imageUrl: unsplash('1708346061371-4da170d706a9'),
    summary: 'Cadena de bajo contragolpe para motosierras de uso doméstico.',
    description:
      'Paso 3/8" P, calibre 1,3 mm. Compatible con CM 250 y CMA 160.',
    specs: { Paso: '3/8" P', Calibre: '1,3 mm', Eslabones: '50' },
  },
  {
    slug: 'espada-rollo-16',
    name: 'Espada Rollo 16"',
    category: 'cadenas-y-espadas',
    powerSource: 'electric' as const,
    isNew: true,
    price: '149.00',
    imageUrl: unsplash('1636706529713-7cceb3d46365'),
    summary: 'Espada con estrella de retorno para cortes suaves.',
    description:
      'Acero templado con canal endurecido y piñón de punta reemplazable.',
    specs: { Longitud: '40 cm', Paso: '.325"', Peso: '0,6 kg' },
  },
  {
    slug: 'kit-afilado',
    name: 'Kit de afilado',
    category: 'cadenas-y-espadas',
    powerSource: 'electric' as const,
    isNew: false,
    price: '69.00',
    imageUrl: unsplash('1641366784341-446c64b421a2'),
    summary: 'Lima redonda, lima plana y guía para afilar en campo.',
    description:
      'Incluye portalimas con marcas de ángulo para un afilado preciso.',
    specs: { Incluye: 'Portalimas, 2 limas, calibrador' },
  },
  {
    slug: 'casco-forestal',
    name: 'Casco forestal',
    category: 'equipos-de-proteccion',
    powerSource: 'electric' as const,
    isNew: false,
    price: '219.00',
    imageUrl: unsplash('1768158988512-ad31657fe5b8'),
    summary: 'Casco con visor de malla y orejeras integradas.',
    description: 'Certificado EN 397, ajuste por rueda y ventilación superior.',
    specs: { Norma: 'EN 397', Peso: '0,8 kg' },
  },
  {
    slug: 'guantes-anticorte',
    name: 'Guantes anticorte',
    category: 'equipos-de-proteccion',
    powerSource: 'electric' as const,
    isNew: true,
    price: '119.00',
    imageUrl: unsplash('1617576683096-00fc8eecb3af'),
    summary: 'Guantes con protección anticorte en la mano izquierda.',
    description: 'Piel de cabra reforzada y dorso transpirable.',
    specs: { Clase: '1 (20 m/s)', Tallas: 'S – XXL' },
  },
  {
    slug: 'pantalon-anticorte',
    name: 'Pantalón anticorte',
    category: 'equipos-de-proteccion',
    powerSource: 'electric' as const,
    isNew: false,
    price: '389.00',
    imageUrl: unsplash('1760217280768-92a693be7f1e'),
    summary: 'Pantalón de trabajo con protección anticorte delantera.',
    description:
      'Tejido elástico, rodilleras reforzadas y bolsillos funcionales.',
    specs: { Clase: '1 (20 m/s)', Diseño: 'A (frontal)' },
  },
  {
    slug: 'aceite-cadena-bio',
    name: 'Aceite de cadena Bio',
    category: 'lubricantes',
    powerSource: 'electric' as const,
    isNew: false,
    price: '34.90',
    imageUrl: unsplash('1766933181278-16bf0bb27e13'),
    summary: 'Aceite biodegradable para la lubricación de cadenas.',
    description:
      'Alta adherencia y protección contra el desgaste incluso a bajas temperaturas.',
    specs: { Contenido: '1 l', Base: 'Vegetal' },
  },
];

interface ArticleContent {
  lead: string;
  sections: ArticleSection[];
}

const section = (
  id: string,
  title: string,
  paragraphs: string[],
  bullets?: string[],
): ArticleSection => ({ id, title, paragraphs, bullets });

export const articleContent: Record<string, ArticleContent> = {
  'gestion-energetica': {
    lead: 'Planificar la carga de baterías es la clave para trabajar todo el día sin interrupciones en jardinería y paisajismo.',
    sections: [
      section(
        'resumen',
        'Resumen: gestión energética',
        [],
        [
          'Rotar al menos dos baterías por máquina durante la jornada.',
          'Cargar en el vehículo durante los traslados entre obras.',
          'Almacenar las baterías a media carga y lejos del calor.',
        ],
      ),
      section('se-busca', 'Se busca: potencia durante todo el día', [
        'Los equipos de mantenimiento urbano trabajan muchas horas seguidas. Con un plan de carga sencillo, las herramientas a batería rinden igual que las de combustión.',
        'Además, el menor ruido permite empezar más temprano en zonas residenciales.',
      ]),
      section('soluciones', 'Soluciones de carga', [
        'Un cargador rápido en el taller y otro en el vehículo cubren la mayoría de jornadas. Para flotas grandes conviene un armario de carga con ventilación.',
      ]),
    ],
  },
  'cambio-a-bateria': {
    lead: 'Menos ruido, cero emisiones en el punto de uso y menos mantenimiento: por qué cada vez más profesionales se pasan a la batería.',
    sections: [
      section(
        'ventajas',
        'Ventajas principales',
        [],
        [
          'Arranque inmediato, sin mezcla ni tirador.',
          'Hasta 50 % menos vibraciones.',
          'Uso en interiores, hospitales y colegios.',
        ],
      ),
      section('costes', 'Costes a largo plazo', [
        'El coste inicial es mayor, pero el ahorro en combustible y mantenimiento lo compensa en dos o tres temporadas de uso intensivo.',
      ]),
      section('primeros-pasos', 'Primeros pasos', [
        'Empieza por las máquinas que más horas usas en zonas sensibles al ruido: sopladores y cortasetos.',
      ]),
    ],
  },
  'afilado-de-cadenas': {
    lead: 'Una cadena bien afilada corta más rápido, cansa menos y alarga la vida de la espada y del motor.',
    sections: [
      section('cuando', '¿Cuándo afilar?', [
        'Si la máquina produce polvo en lugar de virutas o tienes que empujarla, es momento de afilar.',
      ]),
      section(
        'como',
        'Cómo hacerlo',
        [],
        [
          'Fija la espada y tensa ligeramente la cadena.',
          'Usa una lima del diámetro correcto y mantén el ángulo marcado en el portalimas.',
          'Da el mismo número de pasadas a cada diente.',
          'Revisa y rebaja los limitadores de profundidad.',
        ],
      ),
      section('seguridad', 'Seguridad', [
        'Trabaja siempre con guantes y con el motor apagado.',
      ]),
    ],
  },
  'cuidado-arboledas': {
    lead: 'Los primeros años de una plantación definen la calidad de la madera que se cosechará décadas después.',
    sections: [
      section('clareo', 'Clareo', [
        'Eliminar ejemplares débiles da espacio y luz a los árboles con mejor porvenir.',
      ]),
      section(
        'poda',
        'Poda temprana',
        [
          'Retirar ramas bajas cuando aún son delgadas produce troncos limpios y sin nudos.',
        ],
        [
          'Usa podadoras de altura para no dañar la corteza.',
          'Corta junto al cuello de la rama, sin dejar tocones.',
        ],
      ),
      section('herramientas', 'Herramientas recomendadas', [
        'Motosierras ligeras, podadoras de altura y equipos de protección completos.',
      ]),
    ],
  },
  'catalogo-2026': {
    lead: 'Toda nuestra gama de herramientas forestales, agrícolas y de jardinería, reunida en un solo catálogo.',
    sections: [
      section('novedades', 'Novedades', [
        'Este año presentamos nuevas máquinas a batería y una línea de protección renovada.',
      ]),
      section('descarga', 'Cómo conseguirlo', [
        'Solicítalo en tu distribuidor autorizado o consulta la gama completa en la sección Productos.',
      ]),
    ],
  },
  'distribuidores-autorizados': {
    lead: 'Asesoría experta, repuestos originales y servicio técnico cerca de ti.',
    sections: [
      section(
        'por-que',
        '¿Por qué un distribuidor autorizado?',
        [],
        [
          'Puesta en marcha y explicación de uso.',
          'Repuestos y accesorios originales.',
          'Garantía y servicio técnico certificado.',
        ],
      ),
    ],
  },
  'uso-seguro-motoguadana': {
    lead: 'Unos pocos hábitos marcan la diferencia entre una jornada productiva y un accidente.',
    sections: [
      section(
        'equipo',
        'Equipo de protección',
        [],
        [
          'Visor o gafas',
          'Protección auditiva',
          'Guantes y calzado de seguridad',
        ],
      ),
      section('antes', 'Antes de empezar', [
        'Revisa el cabezal, el protector y el arnés. Retira piedras y alambres de la zona de trabajo.',
      ]),
      section('distancia', 'Distancia de seguridad', [
        'Mantén a otras personas a por lo menos 15 metros.',
      ]),
    ],
  },
  'mezcla-lista': {
    lead: 'La proporción correcta de aceite y combustible prolonga la vida del motor de dos tiempos.',
    sections: [
      section('proporcion', 'La proporción', [
        'Usa 1:50 con aceite de alta calidad: 20 ml de aceite por cada litro de gasolina.',
      ]),
      section('almacenamiento', 'Almacenamiento', [
        'Prepara solo la mezcla que vayas a usar en un mes y guárdala en un bidón homologado.',
      ]),
    ],
  },
};

const ALL: DealerService[] = ['venta', 'servicio-tecnico', 'repuestos'];

export const dealers = [
  {
    name: 'Casa Maderero Lima Centro',
    city: 'Lima',
    region: 'Lima',
    address: 'Av. Argentina 1450',
    phone: '+51 1 400 1200',
    lat: -12.0464,
    lng: -77.0428,
    services: [...ALL, 'alquiler'] as DealerService[],
    categories: [],
  },
  {
    name: 'Forestal Lima Norte',
    city: 'Los Olivos',
    region: 'Lima',
    address: 'Av. Alfredo Mendiola 5210',
    phone: '+51 1 522 3300',
    lat: -11.9711,
    lng: -77.0712,
    services: ALL,
    categories: [],
  },
  {
    name: 'Jardín y Equipos Surco',
    city: 'Santiago de Surco',
    region: 'Lima',
    address: 'Av. Primavera 1820',
    phone: '+51 1 448 9010',
    lat: -12.1105,
    lng: -76.9907,
    services: ['venta', 'repuestos'] as DealerService[],
    categories: ['cortasetos', 'sopladores', 'motoguadanas', 'hidrolavadoras'],
  },
  {
    name: 'Maderas y Equipos del Norte',
    city: 'Trujillo',
    region: 'La Libertad',
    address: 'Av. España 820',
    phone: '+51 44 200 300',
    lat: -8.1118,
    lng: -79.0287,
    services: ALL,
    categories: [],
  },
  {
    name: 'Agro Chiclayo',
    city: 'Chiclayo',
    region: 'Lambayeque',
    address: 'Av. Balta 1260',
    phone: '+51 74 230 450',
    lat: -6.7714,
    lng: -79.8409,
    services: ['venta', 'repuestos'] as DealerService[],
    categories: ['motobombas', 'motofumigadoras', 'motoguadanas'],
  },
  {
    name: 'Ferretería Industrial Piura',
    city: 'Piura',
    region: 'Piura',
    address: 'Av. Sánchez Cerro 1180',
    phone: '+51 73 300 900',
    lat: -5.1945,
    lng: -80.6328,
    services: ALL,
    categories: [],
  },
  {
    name: 'Agroforestal Sur',
    city: 'Arequipa',
    region: 'Arequipa',
    address: 'Calle Mercaderes 312',
    phone: '+51 54 210 450',
    lat: -16.409,
    lng: -71.5375,
    services: [...ALL, 'alquiler'] as DealerService[],
    categories: [],
  },
  {
    name: 'Herramientas Andinas',
    city: 'Cusco',
    region: 'Cusco',
    address: 'Av. de la Cultura 1020',
    phone: '+51 84 230 780',
    lat: -13.5319,
    lng: -71.9675,
    services: ALL,
    categories: [],
  },
  {
    name: 'Centro Maderero Huancayo',
    city: 'Huancayo',
    region: 'Junín',
    address: 'Av. Ferrocarril 940',
    phone: '+51 64 210 330',
    lat: -12.0651,
    lng: -75.2049,
    services: ['venta', 'servicio-tecnico'] as DealerService[],
    categories: [],
  },
  {
    name: 'Selva Equipos',
    city: 'Pucallpa',
    region: 'Ucayali',
    address: 'Jr. Tarapacá 540',
    phone: '+51 61 570 120',
    lat: -8.3791,
    lng: -74.5539,
    services: [...ALL, 'alquiler'] as DealerService[],
    categories: [],
  },
  {
    name: 'Oriente Forestal',
    city: 'Tarapoto',
    region: 'San Martín',
    address: 'Jr. Ramón Castilla 380',
    phone: '+51 42 520 610',
    lat: -6.4825,
    lng: -76.3655,
    services: ALL,
    categories: [
      'motosierras',
      'cadenas-y-espadas',
      'equipos-de-proteccion',
      'lubricantes',
    ],
  },
];

/** Extra machines so the category facets have a meaningful spread. */
export const moreMachines = [
  {
    slug: 'cm-180',
    name: 'CM 180',
    category: 'motosierras',
    powerSource: 'petrol' as const,
    isNew: false,
    price: '899.00',
    imageUrl: unsplash('1708346061371-4da170d706a9'),
    summary: 'Motosierra ligera para el hogar y la finca.',
    description:
      'Arranque fácil, freno de cadena y tensado lateral. Ideal para leña y poda ocasional.',
    specs: {
      Cilindrada: '31,8 cm³',
      Potencia: '1,5 kW',
      Peso: '3,9 kg',
      Espada: '35 cm',
    },
  },
  {
    slug: 'cm-661',
    name: 'CM 661',
    category: 'motosierras',
    powerSource: 'petrol' as const,
    isNew: false,
    price: '5290.00',
    imageUrl: unsplash('1550305490-75e5ba3e301c'),
    summary: 'Motosierra de máxima potencia para tala pesada.',
    description:
      'Diseñada para árboles de gran diámetro y trabajo forestal intensivo.',
    specs: {
      Cilindrada: '91,1 cm³',
      Potencia: '5,4 kW',
      Peso: '7,4 kg',
      Espada: '71 cm',
    },
  },
  {
    slug: 'ct-45',
    name: 'CT 45',
    category: 'cortasetos',
    powerSource: 'petrol' as const,
    isNew: false,
    price: '990.00',
    imageUrl: unsplash('1543309959-4d45288d1629'),
    summary: 'Cortasetos a gasolina para jardines domésticos.',
    description: 'Ligero y equilibrado, con cuchillas de doble filo.',
    specs: { Cuchilla: '45 cm', Peso: '4,5 kg', Cilindrada: '18,6 cm³' },
  },
  {
    slug: 'cta-86',
    name: 'CTA 86',
    category: 'cortasetos',
    powerSource: 'battery' as const,
    isNew: true,
    price: '1790.00',
    imageUrl: unsplash('1788610830488-1343095c571c'),
    summary: 'Cortasetos profesional a batería de largo alcance.',
    description:
      'Tres niveles de velocidad y protección de cuchillas reforzada.',
    specs: { Voltaje: '36 V', Cuchilla: '60 cm', Peso: '3,9 kg' },
  },
];

type Attributes = {
  userGroup?: 'profesional' | 'ocasional';
  powerKw?: number;
  weightKg?: number;
  barLengthCm?: number;
  cuttingLengthCm?: number;
  batterySystem?: string;
};

export const productAttributes: Record<string, Attributes> = {
  'cm-180': {
    userGroup: 'ocasional',
    powerKw: 1.5,
    weightKg: 3.9,
    barLengthCm: 35,
  },
  'cm-250': {
    userGroup: 'ocasional',
    powerKw: 2.3,
    weightKg: 4.6,
    barLengthCm: 40,
  },
  'cm-462': {
    userGroup: 'profesional',
    powerKw: 4.4,
    weightKg: 6.0,
    barLengthCm: 50,
  },
  'cm-661': {
    userGroup: 'profesional',
    powerKw: 5.4,
    weightKg: 7.4,
    barLengthCm: 71,
  },
  'cma-160': {
    userGroup: 'ocasional',
    powerKw: 1.4,
    weightKg: 3.1,
    barLengthCm: 30,
    batterySystem: 'Compact 36V',
  },
  'cg-255': { userGroup: 'profesional', powerKw: 1.6, weightKg: 7.9 },
  'cg-120': { userGroup: 'ocasional', powerKw: 0.9, weightKg: 5.4 },
  'cb-600': { userGroup: 'profesional', weightKg: 24 },
  'cf-450': { userGroup: 'profesional', weightKg: 11.1 },
  'ch-140': { userGroup: 'ocasional', powerKw: 2.3 },
  'ct-82': { userGroup: 'profesional', weightKg: 5.3, cuttingLengthCm: 60 },
  'ct-45': { userGroup: 'ocasional', weightKg: 4.5, cuttingLengthCm: 45 },
  'cta-40': {
    userGroup: 'ocasional',
    weightKg: 3.0,
    cuttingLengthCm: 50,
    batterySystem: 'Compact 36V',
  },
  'cta-86': {
    userGroup: 'profesional',
    weightKg: 3.9,
    cuttingLengthCm: 60,
    batterySystem: 'Pro 36V',
  },
  'cp-131': { userGroup: 'profesional', weightKg: 7.2 },
  'cs-86': { userGroup: 'profesional', weightKg: 4.4 },
};

/** Purchasable articles per product; the first one is the default. */
export const productVariants: Record<
  string,
  { label: string; price: string }[]
> = {
  'cm-250': [
    { label: 'Espada 40 cm', price: '1299.00' },
    { label: 'Espada 35 cm', price: '1249.00' },
    { label: 'Espada 45 cm', price: '1349.00' },
  ],
  'cm-462': [
    { label: 'Espada 50 cm', price: '3490.00' },
    { label: 'Espada 63 cm', price: '3690.00' },
  ],
  'cm-661': [
    { label: 'Espada 71 cm', price: '5290.00' },
    { label: 'Espada 90 cm', price: '5590.00' },
  ],
  'cg-255': [
    { label: 'Con cabezal de hilo', price: '2190.00' },
    { label: 'Con disco de 3 dientes', price: '2290.00' },
  ],
  'pantalon-anticorte': [
    { label: 'Talla M', price: '389.00' },
    { label: 'Talla L', price: '389.00' },
    { label: 'Talla XL', price: '409.00' },
  ],
  'guantes-anticorte': [
    { label: 'Talla M', price: '119.00' },
    { label: 'Talla L', price: '119.00' },
    { label: 'Talla XL', price: '119.00' },
  ],
};

const sawSheet = (
  tank: string,
  noise: string,
  vibration: string,
  pitch: string,
) => ({
  'Capacidad del depósito de combustible': tank,
  'Nivel de presión sonora': noise,
  'Nivel de vibraciones izq./der.': vibration,
  'Paso de cadena': pitch,
});

/** Full technical sheets (shown behind "Mostrar todo"). */
export const extraSpecs: Record<string, Record<string, string>> = {
  'cm-180': sawSheet('0,25 l', '98 dB(A)', '3,5 / 3,5 m/s²', '3/8" P'),
  'cm-250': sawSheet('0,47 l', '101 dB(A)', '3,8 / 3,8 m/s²', '.325"'),
  'cm-462': sawSheet('0,72 l', '104 dB(A)', '3,1 / 3,5 m/s²', '3/8"'),
  'cm-661': sawSheet('0,83 l', '105 dB(A)', '4,5 / 5,0 m/s²', '3/8"'),
  'cma-160': {
    'Nivel de presión sonora': '83 dB(A)',
    'Paso de cadena': '1/4" P',
    'Tiempo de carga': '60 min',
  },
  'ct-82': {
    'Nivel de presión sonora': '97 dB(A)',
    'Separación entre dientes': '35 mm',
    'Carreras por minuto': '4 400',
  },
  'cta-86': {
    'Nivel de presión sonora': '84 dB(A)',
    'Separación entre dientes': '33 mm',
    'Carreras por minuto': '3 000',
  },
};
