import type { Product } from './entities/product.entity';

export interface ProductAttributes {
  userGroup?: 'profesional' | 'ocasional';
  powerKw?: number;
  weightKg?: number;
  barLengthCm?: number;
  cuttingLengthCm?: number;
  batterySystem?: string;
}

interface Bucket {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

interface ValueFacet {
  key: string;
  label: string;
  type: 'value';
  read: (p: Product) => string | undefined;
  labels?: Record<string, string>;
}

interface RangeFacet {
  key: string;
  label: string;
  type: 'range';
  read: (p: Product) => number | undefined;
  buckets: Bucket[];
}

export type FacetDefinition = ValueFacet | RangeFacet;

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface Facet {
  key: string;
  label: string;
  options: FacetOption[];
}

const POWER_SOURCE: ValueFacet = {
  key: 'power',
  label: 'Accionamiento',
  type: 'value',
  read: (p) => p.powerSource,
  labels: { petrol: 'Combustión', battery: 'Batería', electric: 'Eléctrico' },
};

const USER_GROUP: ValueFacet = {
  key: 'userGroup',
  label: 'Grupo de usuarios',
  type: 'value',
  read: (p) => p.attributes?.userGroup,
  labels: { profesional: 'Profesional', ocasional: 'Ocasional' },
};

const BATTERY_SYSTEM: ValueFacet = {
  key: 'batterySystem',
  label: 'Sistema a batería',
  type: 'value',
  read: (p) => p.attributes?.batterySystem,
};

const POWER_KW: RangeFacet = {
  key: 'powerKw',
  label: 'Potencia',
  type: 'range',
  read: (p) => p.attributes?.powerKw,
  buckets: [
    { id: '0-1.5', label: 'Hasta 1.5 kW', max: 1.5 },
    { id: '1.6-2.5', label: '1.6 kW a 2.5 kW', min: 1.6, max: 2.5 },
    { id: '2.6-3.5', label: '2.6 kW a 3.5 kW', min: 2.6, max: 3.5 },
    { id: '3.6-', label: 'De 3.6 kW', min: 3.6 },
  ],
};

const WEIGHT_KG: RangeFacet = {
  key: 'weightKg',
  label: 'Peso',
  type: 'range',
  read: (p) => p.attributes?.weightKg,
  buckets: [
    { id: '0-4', label: 'Hasta 4.0 kg', max: 4 },
    { id: '4.1-5', label: '4.1 kg a 5.0 kg', min: 4.1, max: 5 },
    { id: '5.1-6', label: '5.1 kg a 6.0 kg', min: 5.1, max: 6 },
    { id: '6.1-', label: 'De 6.1 kg', min: 6.1 },
  ],
};

const BAR_LENGTH: RangeFacet = {
  key: 'barLengthCm',
  label: 'Longitud de la espada',
  type: 'range',
  read: (p) => p.attributes?.barLengthCm,
  buckets: [
    { id: '25-35', label: '25 cm a 35 cm', min: 25, max: 35 },
    { id: '40-45', label: '40 cm a 45 cm', min: 40, max: 45 },
    { id: '50-63', label: '50 cm a 63 cm', min: 50, max: 63 },
    { id: '71-', label: 'De 71 cm', min: 71 },
  ],
};

const CUTTING_LENGTH: RangeFacet = {
  key: 'cuttingLengthCm',
  label: 'Longitud de corte',
  type: 'range',
  read: (p) => p.attributes?.cuttingLengthCm,
  buckets: [
    { id: '0-45', label: 'Hasta 45 cm', max: 45 },
    { id: '46-60', label: '46 cm a 60 cm', min: 46, max: 60 },
    { id: '61-', label: 'De 61 cm', min: 61 },
  ],
};

const BY_CATEGORY: Record<string, FacetDefinition[]> = {
  motosierras: [POWER_SOURCE, USER_GROUP, POWER_KW, WEIGHT_KG, BAR_LENGTH],
  cortasetos: [
    POWER_SOURCE,
    BATTERY_SYSTEM,
    USER_GROUP,
    WEIGHT_KG,
    CUTTING_LENGTH,
  ],
};

const DEFAULT_FACETS: FacetDefinition[] = [
  POWER_SOURCE,
  USER_GROUP,
  POWER_KW,
  WEIGHT_KG,
];

export function facetsFor(category?: string): FacetDefinition[] {
  return (category && BY_CATEGORY[category]) || DEFAULT_FACETS;
}

function matchesOption(
  def: FacetDefinition,
  product: Product,
  value: string,
): boolean {
  if (def.type === 'value') return def.read(product) === value;
  const bucket = def.buckets.find((b) => b.id === value);
  const n = def.read(product);
  if (!bucket || n === undefined) return false;
  return (
    (bucket.min === undefined || n >= bucket.min) &&
    (bucket.max === undefined || n <= bucket.max)
  );
}

/** Keeps products matching every facet (AND) and any selected option within one facet (OR). */
export function applyFacetFilters(
  products: Product[],
  defs: FacetDefinition[],
  selected: Record<string, string[]>,
): Product[] {
  const active = defs.filter((d) => selected[d.key]?.length);
  return products.filter((p) =>
    active.every((def) =>
      selected[def.key].some((value) => matchesOption(def, p, value)),
    ),
  );
}

/** Lists each facet's options with how many of `products` match; empty options are omitted. */
export function computeFacets(
  products: Product[],
  defs: FacetDefinition[],
): Facet[] {
  return defs
    .map((def) => {
      const options: FacetOption[] =
        def.type === 'range'
          ? def.buckets.map((b) => ({
              value: b.id,
              label: b.label,
              count: products.filter((p) => matchesOption(def, p, b.id)).length,
            }))
          : [...new Set(products.map(def.read).filter((v) => v !== undefined))]
              .sort()
              .map((value) => ({
                value,
                label: def.labels?.[value] ?? value,
                count: products.filter((p) => def.read(p) === value).length,
              }));
      return {
        key: def.key,
        label: def.label,
        options: options.filter((o) => o.count > 0),
      };
    })
    .filter((facet) => facet.options.length > 0);
}
