import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { CatalogService, PRODUCT_SORTS } from './catalog.service';
import type { ProductSort } from './catalog.service';
import { CATEGORY_KINDS } from './entities/category.entity';
import type { CategoryKind } from './entities/category.entity';

function parseKind(kind?: string): CategoryKind | undefined {
  if (kind === undefined) return undefined;
  if (!CATEGORY_KINDS.includes(kind as CategoryKind)) {
    throw new BadRequestException(
      `kind must be one of: ${CATEGORY_KINDS.join(', ')}`,
    );
  }
  return kind as CategoryKind;
}

/** Reads `f_<facetKey>=a,b` query params into selected facet options. */
function parseFacetParams(
  query: Record<string, string | undefined>,
): Record<string, string[]> {
  const facets: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith('f_') || !value) continue;
    const values = value.split(',').filter(Boolean);
    if (values.length) facets[key.slice(2)] = values;
  }
  return facets;
}

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  findCategories(@Query('kind') kind?: string) {
    return this.catalog.findCategories(parseKind(kind));
  }

  @Get('categories/:slug')
  findCategory(@Param('slug') slug: string) {
    return this.catalog.findCategory(slug);
  }

  @Get('products/facets')
  findFacets(
    @Query('category') category?: string,
    @Query('q') search?: string,
  ) {
    return this.catalog.findFacets(category || undefined, search);
  }

  @Get('products')
  findProducts(
    @Query('category') category?: string,
    @Query('kind') kind?: string,
    @Query('new') isNew?: string,
    @Query('q') search?: string,
    @Query('power') power?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: string,
    @Query() all: Record<string, string | undefined> = {},
  ) {
    if (sort !== undefined && !PRODUCT_SORTS.includes(sort as ProductSort)) {
      throw new BadRequestException(
        `sort must be one of: ${PRODUCT_SORTS.join(', ')}`,
      );
    }
    const max = maxPrice === undefined ? undefined : Number(maxPrice);
    if (max !== undefined && !Number.isFinite(max)) {
      throw new BadRequestException('maxPrice must be a number');
    }
    return this.catalog.findProducts({
      category,
      kind: parseKind(kind),
      search,
      isNew: isNew === undefined ? undefined : isNew === 'true',
      powerSources: power?.split(',').filter(Boolean),
      maxPrice: max,
      sort: sort as ProductSort | undefined,
      facets: parseFacetParams(all),
    });
  }

  @Get('products/:slug')
  findProduct(@Param('slug') slug: string) {
    return this.catalog.findProduct(slug);
  }
}
