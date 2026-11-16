import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryKind } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { applyFacetFilters, computeFacets, facetsFor } from './facets';
import type { Facet } from './facets';

export const PRODUCT_SORTS = [
  'name',
  'popular',
  'price-asc',
  'price-desc',
] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export interface ProductQuery {
  category?: string;
  kind?: CategoryKind;
  isNew?: boolean;
  search?: string;
  powerSources?: string[];
  maxPrice?: number;
  sort?: ProductSort;
  /** Selected facet options keyed by facet key (see facets.ts). */
  facets?: Record<string, string[]>;
}

const SORT_COLUMNS: Record<ProductSort, [string, 'ASC' | 'DESC']> = {
  name: ['product.name', 'ASC'],
  // Newest catalogue entries first, then by name: a stand-in for real sales data.
  popular: ['product.isNew', 'DESC'],
  'price-asc': ['product.price', 'ASC'],
  'price-desc': ['product.price', 'DESC'],
};

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  findCategories(kind?: CategoryKind): Promise<Category[]> {
    return this.categories.find({
      where: kind ? { kind } : {},
      order: { position: 'ASC' },
    });
  }

  async findCategory(slug: string): Promise<Category> {
    const category = await this.categories.findOne({ where: { slug } });
    if (!category) throw new NotFoundException(`Category "${slug}" not found`);
    return category;
  }

  async findProducts(query: ProductQuery): Promise<Product[]> {
    const [column, direction] = SORT_COLUMNS[query.sort ?? 'name'];
    const qb = this.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy(column, direction)
      .addOrderBy('product.name', 'ASC');

    if (query.category) {
      qb.andWhere('category.slug = :slug', { slug: query.category });
    }
    if (query.kind) {
      qb.andWhere('category.kind = :kind', { kind: query.kind });
    }
    if (query.isNew !== undefined) {
      qb.andWhere('product.isNew = :isNew', { isNew: query.isNew });
    }
    if (query.search) {
      qb.andWhere(
        '(product.name ILIKE :q OR product.summary ILIKE :q OR category.name ILIKE :q)',
        { q: `%${query.search}%` },
      );
    }
    if (query.powerSources?.length) {
      qb.andWhere('product.powerSource IN (:...power)', {
        power: query.powerSources,
      });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }
    const products = await qb.getMany();
    if (!query.facets || Object.keys(query.facets).length === 0) {
      return products;
    }
    return applyFacetFilters(products, facetsFor(query.category), query.facets);
  }

  /** Facets of a category (or search) with option counts over its products. */
  async findFacets(category?: string, search?: string): Promise<Facet[]> {
    const products = await this.findProducts({ category, search });
    return computeFacets(products, facetsFor(category));
  }

  async findProduct(slug: string): Promise<Product> {
    const product = await this.products.findOne({
      where: { slug },
      relations: { variants: true },
      order: { variants: { position: 'ASC' } },
    });
    if (!product) throw new NotFoundException(`Product "${slug}" not found`);
    return product;
  }
}
