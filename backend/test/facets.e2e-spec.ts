import type { Product } from '../src/catalog/entities/product.entity';
import {
  applyFacetFilters,
  computeFacets,
  facetsFor,
} from '../src/catalog/facets';

const product = (
  slug: string,
  powerSource: string,
  attributes: Product['attributes'],
): Product => ({ slug, powerSource, attributes }) as Product;

const saws = [
  product('light', 'petrol', {
    userGroup: 'ocasional',
    weightKg: 3.9,
    barLengthCm: 35,
  }),
  product('mid', 'petrol', {
    userGroup: 'ocasional',
    weightKg: 4.6,
    barLengthCm: 40,
  }),
  product('pro', 'petrol', {
    userGroup: 'profesional',
    weightKg: 6.0,
    barLengthCm: 50,
  }),
  product('battery', 'battery', {
    userGroup: 'ocasional',
    weightKg: 3.1,
    barLengthCm: 30,
  }),
];

describe('category facets', () => {
  const defs = facetsFor('motosierras');

  it('uses the chainsaw facets of the reference', () => {
    expect(defs.map((d) => d.label)).toEqual([
      'Accionamiento',
      'Grupo de usuarios',
      'Potencia',
      'Peso',
      'Longitud de la espada',
    ]);
    expect(facetsFor('cortasetos').map((d) => d.label)).toEqual([
      'Accionamiento',
      'Sistema a batería',
      'Grupo de usuarios',
      'Peso',
      'Longitud de corte',
    ]);
  });

  it('counts options and range buckets, omitting empty ones', () => {
    const facets = computeFacets(saws, defs);
    const weight = facets.find((f) => f.key === 'weightKg');
    expect(weight?.options).toEqual([
      { value: '0-4', label: 'Hasta 4.0 kg', count: 2 },
      { value: '4.1-5', label: '4.1 kg a 5.0 kg', count: 1 },
      { value: '5.1-6', label: '5.1 kg a 6.0 kg', count: 1 },
    ]);
    expect(facets.find((f) => f.key === 'power')?.options).toEqual([
      { value: 'battery', label: 'Batería', count: 1 },
      { value: 'petrol', label: 'Combustión', count: 3 },
    ]);
    // No product has powerKw, so the "Potencia" facet is dropped.
    expect(facets.some((f) => f.key === 'powerKw')).toBe(false);
  });

  it('ORs options inside a facet and ANDs across facets', () => {
    const slugs = (selected: Record<string, string[]>) =>
      applyFacetFilters(saws, defs, selected).map((p) => p.slug);

    expect(slugs({ weightKg: ['0-4', '5.1-6'] })).toEqual([
      'light',
      'pro',
      'battery',
    ]);
    expect(slugs({ weightKg: ['0-4', '5.1-6'], power: ['petrol'] })).toEqual([
      'light',
      'pro',
    ]);
    expect(
      slugs({ userGroup: ['profesional'], barLengthCm: ['25-35'] }),
    ).toEqual([]);
  });

  it('ignores unknown facet keys and bucket ids', () => {
    expect(applyFacetFilters(saws, defs, { color: ['red'] })).toHaveLength(4);
    expect(applyFacetFilters(saws, defs, { weightKg: ['nope'] })).toHaveLength(
      0,
    );
  });
});
