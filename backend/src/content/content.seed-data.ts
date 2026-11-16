import type {
  FairEvent,
  FaqGroup,
  LegalPage,
  Sector,
} from './content.entities';

/** Demo photography (Unsplash License). Replace with own photos before launch. */
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

type Seed<T> = Omit<T, 'id'>[];

export const sectors: Seed<Sector> = [
  {
    slug: 'forestal',
    title: 'Sector forestal',
    machinesTitle: 'Máquinas forestales',
    intro:
      'En la silvicultura, Casa Maderero es un compañero fiable para las tareas diarias más exigentes. Los profesionales de la tala y la poda aprecian la manejabilidad y el rendimiento de nuestras motosierras, que llevan la productividad y la seguridad a otro nivel.',
    imageUrl: unsplash('1760217280768-92a693be7f1e'),
    categories: ['motosierras', 'motoguadanas', 'podadoras-de-altura'],
    productSlugs: ['cm-661', 'cm-462', 'espada-rollo-16', 'casco-forestal'],
    position: 0,
  },
  {
    slug: 'jardineria-paisajismo',
    title: 'Jardinería y paisajismo',
    machinesTitle: 'Máquinas para jardinería y paisajismo',
    intro:
      'Parques, jardines privados y áreas verdes públicas exigen precisión y bajo ruido. Nuestros cortasetos, sopladores y motoguadañas están pensados para jornadas largas en entornos urbanos.',
    imageUrl: unsplash('1621272156568-7306716648df'),
    categories: ['cortasetos', 'sopladores', 'motoguadanas'],
    productSlugs: ['cta-86', 'ct-82', 'cs-86', 'guantes-anticorte'],
    position: 1,
  },
  {
    slug: 'soluciones-bateria',
    title: 'Soluciones de batería',
    machinesTitle: 'Máquinas a batería',
    intro:
      'Sin emisiones en el punto de uso, con menos ruido y menos mantenimiento: un único sistema de baterías para motosierras, cortasetos y más. Ideal para trabajar en zonas residenciales, hospitales y colegios.',
    imageUrl: unsplash('1733286125300-b4c5563295ad'),
    categories: ['motosierras', 'cortasetos', 'sopladores'],
    productSlugs: ['cma-160', 'cta-40', 'cta-86'],
    position: 2,
  },
];

export const events: Seed<FairEvent> = [
  {
    name: 'Expo Amazónica Forestal',
    kind: 'Feria',
    city: 'Pucallpa',
    startDate: '2026-11-27',
    endDate: '2026-11-29',
    description:
      'Stand con toda la gama forestal, demostraciones de tala y asesoría sobre equipos de protección.',
    link: '',
  },
  {
    name: 'Copa Casa Maderero de Hacheros',
    kind: 'Competencia',
    city: 'Pucallpa',
    startDate: '2026-12-12',
    endDate: '2026-12-13',
    description:
      'La gran final nacional de deportes de tala con transmisión en vivo.',
    link: '/experiencia/copa-de-hacheros',
  },
  {
    name: 'AgroExpo Norte',
    kind: 'Feria',
    city: 'Chiclayo',
    startDate: '2027-02-18',
    endDate: '2027-02-21',
    description:
      'Motobombas, motofumigadoras y soluciones para el agro de la costa norte.',
    link: '',
  },
  {
    name: 'Día de demostración a batería',
    kind: 'Demostración',
    city: 'Lima',
    startDate: '2027-03-06',
    endDate: '2027-03-06',
    description:
      'Prueba sin compromiso nuestras máquinas a batería para jardinería profesional.',
    link: '',
  },
];

export const faqGroups: Seed<FaqGroup> = [
  {
    slug: 'portafolio',
    title: 'Productos y portafolio',
    intro:
      'Respondemos las preguntas más frecuentes sobre nuestra gama de productos y su compra.',
    position: 0,
    items: [
      {
        question: '¿Dónde puedo comprar productos Casa Maderero?',
        answer:
          'En nuestra tienda online o en nuestra red de [distribuidores autorizados](/distribuidores). Allí recibirás asesoría, puesta en marcha y garantía.',
      },
      {
        question: '¿Los precios de la web son finales?',
        answer:
          'Son precios con IGV. En la tienda de un distribuidor el precio final y la disponibilidad pueden variar.',
      },
      {
        question: '¿Cómo elijo la motosierra adecuada?',
        answer:
          'Depende del diámetro de los troncos y de la frecuencia de uso. Usa la función **Comparar** en los listados o consulta a tu distribuidor.',
      },
    ],
  },
  {
    slug: 'baterias',
    title: 'Baterías y equipos eléctricos',
    intro: 'Todo sobre autonomía, carga y cuidado de las baterías.',
    position: 1,
    items: [
      {
        question: '¿Cuánto dura una carga?',
        answer:
          'Entre 30 y 60 minutos de trabajo continuo según la máquina y la batería. Consulta la autonomía en los datos técnicos de cada producto.',
      },
      {
        question: '¿Cómo almaceno las baterías?',
        answer:
          'A media carga, en un lugar seco, entre 5 °C y 25 °C y fuera del alcance de los niños.',
      },
      {
        question: '¿Qué hago con una batería usada?',
        answer:
          'Llévala a tu distribuidor autorizado: la gestionamos para su reciclaje.',
      },
    ],
  },
  {
    slug: 'servicio',
    title: 'Garantía y servicio técnico',
    intro: 'Mantenimiento, repuestos y garantía de tus equipos.',
    position: 2,
    items: [
      {
        question: '¿Qué cubre la garantía?',
        answer:
          'Defectos de fabricación durante el periodo indicado en la documentación del producto, siempre que se use según el manual.',
      },
      {
        question: '¿Dónde encuentro el manual de mi máquina?',
        answer: 'En la sección [Manuales de instrucciones](/manuales).',
      },
      {
        question: '¿Cómo presento un reclamo?',
        answer:
          'Desde el [Libro de Reclamaciones](/libro-de-reclamaciones). Recibirás un código de seguimiento.',
      },
    ],
  },
];

export const legalPages: Seed<LegalPage> = [
  {
    slug: 'aviso-legal',
    title: 'Aviso legal',
    body: [
      'CASA MADERERO S.A.C.\nAv. Argentina 1450, Cercado de Lima\n15081 Lima\nPerú',
      'Teléfono: 01 400 1200\nEmail: [ventas@casamaderero.pe](mailto:ventas@casamaderero.pe)',
      'RUC: 20000000000 (dato de ejemplo)',
    ].join('\n\n'),
  },
  {
    slug: 'privacidad',
    title: 'Aviso de privacidad y protección de datos',
    body: [
      'Tratamos tus datos personales conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su reglamento. Solo recogemos los datos necesarios para atender tus solicitudes y pedidos, enviarte el newsletter si te suscribes y gestionar reclamos.',
      'Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición escribiendo a [datos@casamaderero.pe](mailto:datos@casamaderero.pe).',
    ].join('\n\n'),
  },
  {
    slug: 'cookies',
    title: 'Cookies',
    body: [
      'Usamos cookies estrictamente necesarias para el funcionamiento del sitio y, solo con tu consentimiento, cookies analíticas y de publicidad personalizada.',
      'Puedes cambiar tu elección en cualquier momento borrando los datos del sitio en tu navegador: el aviso de cookies volverá a mostrarse.',
    ].join('\n\n'),
  },
  {
    slug: 'informacion-legal',
    title: 'Información legal',
    body: [
      '- [Aviso legal](/legal/aviso-legal)',
      '- [Aviso de privacidad y protección de datos](/legal/privacidad)',
      '- [Cookies](/legal/cookies)',
      '- [Libro de Reclamaciones](/libro-de-reclamaciones)',
    ].join('\n'),
  },
];
