import type { ArticleKind } from '../articles/article.entity';

interface SeedCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

interface SeedProduct {
  slug: string;
  name: string;
  summary: string;
  description: string;
  price: string;
  powerSource: 'petrol' | 'battery' | 'electric';
  isNew: boolean;
  category: string;
  specs: Record<string, string>;
}

interface SeedArticle {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  kind: ArticleKind;
  publishedAt: string;
}

export const categories: SeedCategory[] = [
  {
    slug: 'motosierras',
    name: 'Motosierras',
    icon: 'chainsaw',
    description: 'Potencia y precisión para tala, poda y trabajos forestales.',
  },
  {
    slug: 'motoguadanas',
    name: 'Motoguadañas',
    icon: 'trimmer',
    description: 'Desbroce de terrenos, bordes y vegetación densa.',
  },
  {
    slug: 'motobombas',
    name: 'Motobombas',
    icon: 'pump',
    description: 'Riego y trasvase de agua con alto caudal.',
  },
  {
    slug: 'motofumigadoras',
    name: 'Motofumigadoras',
    icon: 'sprayer',
    description: 'Pulverización eficiente para cultivos y jardines.',
  },
  {
    slug: 'hidrolavadoras',
    name: 'Hidrolavadoras',
    icon: 'washer',
    description: 'Limpieza a alta presión para maquinaria y superficies.',
  },
  {
    slug: 'cortasetos',
    name: 'Cortasetos',
    icon: 'hedge',
    description: 'Cortes limpios y uniformes en setos y arbustos.',
  },
  {
    slug: 'podadoras-de-altura',
    name: 'Podadoras de altura',
    icon: 'pole',
    description: 'Poda de ramas altas sin escaleras.',
  },
  {
    slug: 'sopladores',
    name: 'Sopladores',
    icon: 'blower',
    description: 'Limpieza rápida de hojas y residuos.',
  },
  {
    slug: 'equipos-de-proteccion',
    name: 'Equipos de protección',
    icon: 'shield',
    description: 'Cascos, guantes y pantalones anticorte.',
  },
  {
    slug: 'lubricantes',
    name: 'Lubricantes',
    icon: 'oil',
    description: 'Aceites de mezcla y de cadena para el máximo rendimiento.',
  },
];

export const products: SeedProduct[] = [
  {
    slug: 'cm-250',
    name: 'CM 250',
    category: 'motosierras',
    powerSource: 'petrol',
    isNew: false,
    price: '1299.00',
    summary:
      'Motosierra versátil para leña y trabajos de construcción en madera.',
    description:
      'Motor de 2 tiempos de bajo consumo, arranque fácil y sistema antivibración para jornadas largas.',
    specs: {
      Cilindrada: '45,4 cm³',
      Potencia: '2,3 kW',
      Peso: '4,6 kg',
      Espada: '40 cm',
    },
  },
  {
    slug: 'cm-462',
    name: 'CM 462',
    category: 'motosierras',
    powerSource: 'petrol',
    isNew: true,
    price: '3490.00',
    summary: 'Motosierra profesional de alto rendimiento para tala forestal.',
    description:
      'Excelente relación peso-potencia, filtro de aire de larga duración y gestión electrónica del motor.',
    specs: {
      Cilindrada: '72,2 cm³',
      Potencia: '4,4 kW',
      Peso: '6,0 kg',
      Espada: '50 cm',
    },
  },
  {
    slug: 'cma-160',
    name: 'CMA 160',
    category: 'motosierras',
    powerSource: 'battery',
    isNew: true,
    price: '1590.00',
    summary: 'Motosierra a batería, silenciosa y sin emisiones.',
    description:
      'Ideal para poda en zonas urbanas y trabajos de mantenimiento con bajo nivel de ruido.',
    specs: {
      Voltaje: '36 V',
      Peso: '3,1 kg',
      Espada: '30 cm',
      Autonomía: '45 min',
    },
  },
  {
    slug: 'cg-255',
    name: 'CG 255',
    category: 'motoguadanas',
    powerSource: 'petrol',
    isNew: true,
    price: '2190.00',
    summary: 'Motoguadaña robusta para desbroce profesional.',
    description:
      'Manillar ergonómico, arnés de doble hombro y cabezal de corte de alto rendimiento.',
    specs: { Cilindrada: '41,6 cm³', Potencia: '1,6 kW', Peso: '7,9 kg' },
  },
  {
    slug: 'cg-120',
    name: 'CG 120',
    category: 'motoguadanas',
    powerSource: 'petrol',
    isNew: false,
    price: '1090.00',
    summary: 'Motoguadaña ligera para jardines y bordes.',
    description: 'Fácil de manejar, con hilo de corte y arranque simplificado.',
    specs: { Cilindrada: '27,2 cm³', Potencia: '0,9 kW', Peso: '5,4 kg' },
  },
  {
    slug: 'cb-600',
    name: 'CB 600',
    category: 'motobombas',
    powerSource: 'petrol',
    isNew: false,
    price: '1890.00',
    summary: 'Motobomba de alto caudal para riego agrícola.',
    description:
      'Bomba autocebante con motor de 4 tiempos, ideal para trasvase y riego por inundación.',
    specs: { Caudal: '600 l/min', Altura: '28 m', Peso: '24 kg' },
  },
  {
    slug: 'cf-450',
    name: 'CF 450',
    category: 'motofumigadoras',
    powerSource: 'petrol',
    isNew: false,
    price: '1690.00',
    summary: 'Atomizador de mochila para grandes superficies.',
    description:
      'Alcance de pulverización horizontal de hasta 14 metros con depósito de 14 litros.',
    specs: { Depósito: '14 l', Alcance: '14 m', Peso: '11,1 kg' },
  },
  {
    slug: 'ch-140',
    name: 'CH 140',
    category: 'hidrolavadoras',
    powerSource: 'electric',
    isNew: false,
    price: '990.00',
    summary: 'Hidrolavadora compacta para el hogar y el taller.',
    description:
      'Presión regulable, manguera de 8 metros y boquilla rotativa incluida.',
    specs: { Presión: '140 bar', Caudal: '500 l/h', Potencia: '2,3 kW' },
  },
  {
    slug: 'ct-82',
    name: 'CT 82',
    category: 'cortasetos',
    powerSource: 'petrol',
    isNew: false,
    price: '1490.00',
    summary: 'Cortasetos profesional de cuchilla doble.',
    description:
      'Empuñadura giratoria y cuchillas de 60 cm para un corte rápido y preciso.',
    specs: { Cuchilla: '60 cm', Peso: '5,3 kg', Cilindrada: '22,7 cm³' },
  },
  {
    slug: 'cta-40',
    name: 'CTA 40',
    category: 'cortasetos',
    powerSource: 'battery',
    isNew: true,
    price: '890.00',
    summary: 'Cortasetos a batería ligero para mantenimiento diario.',
    description:
      'Sin cables ni mezclas: carga la batería y empieza a trabajar.',
    specs: { Voltaje: '36 V', Cuchilla: '50 cm', Peso: '3,0 kg' },
  },
  {
    slug: 'cp-131',
    name: 'CP 131',
    category: 'podadoras-de-altura',
    powerSource: 'petrol',
    isNew: false,
    price: '2390.00',
    summary: 'Podadora de altura telescópica.',
    description:
      'Alcance de hasta 5 metros con eje telescópico y cabezal ajustable.',
    specs: { Alcance: '5 m', Peso: '7,2 kg', Cilindrada: '36,3 cm³' },
  },
  {
    slug: 'cs-86',
    name: 'CS 86',
    category: 'sopladores',
    powerSource: 'petrol',
    isNew: false,
    price: '1190.00',
    summary: 'Soplador de mano potente para hojas y residuos.',
    description: 'Gran velocidad de aire, bajo peso y fácil arranque.',
    specs: { 'Velocidad de aire': '76 m/s', Peso: '4,4 kg' },
  },
  {
    slug: 'kit-proteccion-forestal',
    name: 'Kit protección forestal',
    category: 'equipos-de-proteccion',
    powerSource: 'electric',
    isNew: false,
    price: '459.00',
    summary: 'Casco, protector auditivo, visor y guantes anticorte.',
    description: 'Equipamiento certificado para trabajos con motosierra.',
    specs: { Incluye: 'Casco, visor, orejeras, guantes' },
  },
  {
    slug: 'aceite-mix-2t',
    name: 'Aceite Mix 2T',
    category: 'lubricantes',
    powerSource: 'electric',
    isNew: false,
    price: '39.90',
    summary: 'Aceite sintético para motores de 2 tiempos.',
    description: 'Combustión limpia y protección del motor. Proporción 1:50.',
    specs: { Contenido: '1 l', Proporción: '1:50' },
  },
];

export const articles: SeedArticle[] = [
  {
    slug: 'catalogo-2026',
    kind: 'news',
    publishedAt: '2026-10-01',
    title: 'Catálogo Casa Maderero 2026',
    excerpt:
      'Conoce toda nuestra gama de herramientas forestales y de jardinería.',
    body: 'Nuestro nuevo catálogo reúne más de 200 equipos, accesorios y equipos de protección.',
  },
  {
    slug: 'distribuidores-autorizados',
    kind: 'news',
    publishedAt: '2026-09-15',
    title: 'Conoce a nuestros distribuidores autorizados',
    excerpt:
      'Asesoría experta, repuestos originales y servicio técnico cerca de ti.',
    body: 'Nuestra red de distribuidores cubre todas las regiones del país.',
  },
  {
    slug: 'uso-seguro-motoguadana',
    kind: 'news',
    publishedAt: '2026-08-20',
    title: 'Utiliza con seguridad la motoguadaña',
    excerpt: 'Consejos prácticos para trabajar de forma segura y eficiente.',
    body: 'Usa siempre equipo de protección y revisa el cabezal antes de cada jornada.',
  },
  {
    slug: 'mezcla-lista',
    kind: 'news',
    publishedAt: '2026-07-10',
    title: 'Con Aceite Mix domina cualquier trabajo',
    excerpt: 'La proporción correcta prolonga la vida de tu motor.',
    body: 'Utiliza siempre aceite de calidad y combustible fresco.',
  },
  {
    slug: 'gestion-energetica',
    kind: 'guide',
    publishedAt: '2026-10-05',
    title: 'Gestión energética en jardinería y paisajismo',
    excerpt: 'Cómo planificar la carga de baterías en equipos profesionales.',
    body: 'Una buena rotación de baterías evita tiempos muertos en obra.',
  },
  {
    slug: 'cambio-a-bateria',
    kind: 'guide',
    publishedAt: '2026-09-02',
    title: 'Cambio a máquinas de batería: por qué merece la pena',
    excerpt: 'Menos ruido, cero emisiones y menor mantenimiento.',
    body: 'Las herramientas a batería han alcanzado la potencia de las de combustión.',
  },
  {
    slug: 'afilado-de-cadenas',
    kind: 'guide',
    publishedAt: '2026-08-11',
    title: 'Así se afila correctamente una cadena',
    excerpt: 'Una cadena afilada corta más rápido y con menos esfuerzo.',
    body: 'Usa la lima del diámetro correcto y mantén el ángulo constante.',
  },
  {
    slug: 'cuidado-arboledas',
    kind: 'guide',
    publishedAt: '2026-07-25',
    title: 'Cuidado de arboledas jóvenes',
    excerpt: 'Tareas clave en los primeros años de una plantación.',
    body: 'El clareo y la poda temprana definen la calidad futura de la madera.',
  },
];
