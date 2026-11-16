/**
 * Demo photography from Unsplash (free to use under the Unsplash License).
 * Replace with the company's own product photos before going live.
 */
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const categoryImages: Record<string, string> = {
  motosierras: unsplash('1708346061371-4da170d706a9'),
  motoguadanas: unsplash('1793440890401-5aed5b9d7a15'),
  motobombas: unsplash('1700318092011-6e4666e94ab5'),
  motofumigadoras: unsplash('1593999094742-4f5280054b23'),
  hidrolavadoras: unsplash('1782235869457-069673be2dc3'),
  cortasetos: unsplash('1543309959-4d45288d1629'),
  'podadoras-de-altura': unsplash('1764421175587-f1fe472c411d'),
  sopladores: unsplash('1742093798436-bea70f40f187'),
  'equipos-de-proteccion': unsplash('1768158988512-ad31657fe5b8'),
  lubricantes: unsplash('1766933181278-16bf0bb27e13'),
};

export const productImages: Record<string, string> = {
  'cm-250': unsplash('1636706529713-7cceb3d46365'),
  'cm-462': unsplash('1769028587967-7227d9e0ea8e'),
  'cma-160': unsplash('1625337905972-56fb1efe20a3'),
  'cg-255': unsplash('1793440890401-5aed5b9d7a15'),
  'cg-120': unsplash('1793441410243-e1c4e47a1a65'),
  'cb-600': unsplash('1700318092011-6e4666e94ab5'),
  'cf-450': unsplash('1628352081506-83c43123ed6d'),
  'ch-140': unsplash('1782235869457-069673be2dc3'),
  'ct-82': unsplash('1543309959-4d45288d1629'),
  'cta-40': unsplash('1788610830488-1343095c571c'),
  'cp-131': unsplash('1764421175587-f1fe472c411d'),
  'cs-86': unsplash('1742093798436-bea70f40f187'),
  'kit-proteccion-forestal': unsplash('1768158988512-ad31657fe5b8'),
  'aceite-mix-2t': unsplash('1766933181278-16bf0bb27e13'),
};

export const articleImages: Record<string, string> = {
  'catalogo-2026': unsplash('1513936024644-50689b4bcb5c'),
  'distribuidores-autorizados': unsplash('1550305490-75e5ba3e301c'),
  'uso-seguro-motoguadana': unsplash('1754322449185-31f56117ed87'),
  'mezcla-lista': unsplash('1561098704-335f7f66bf27'),
  'gestion-energetica': unsplash('1621272156568-7306716648df'),
  'cambio-a-bateria': unsplash('1622383563227-04401ab4e5ea'),
  'afilado-de-cadenas': unsplash('1641366784341-446c64b421a2'),
  'cuidado-arboledas': unsplash('1588878309774-4b3f42a19a8f'),
};
