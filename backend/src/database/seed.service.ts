import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import type { EntityTarget, ObjectLiteral } from 'typeorm';
import { Article } from '../articles/article.entity';
import { Category } from '../catalog/entities/category.entity';
import { ProductVariant } from '../catalog/entities/product-variant.entity';
import { Product } from '../catalog/entities/product.entity';
import { Dealer } from '../dealers/dealer.entity';
import * as data from './seed-data';
import * as extras from './seed-extras';
import { articleImages, categoryImages, productImages } from './seed-images';

/** Populates an empty database with demo content on startup. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.DB_SEED === 'false') return;

    await this.dataSource.transaction(async (manager) => {
      if ((await manager.count(Category)) === 0) {
        await this.seed(manager);
        this.logger.log('Demo data seeded');
      }
      const filled = await this.backfillImages(manager);
      if (filled > 0) this.logger.log(`Backfilled ${filled} demo images`);
    });
  }

  private async seed(manager: EntityManager): Promise<void> {
    const categories = [...data.categories, ...extras.extraCategories].map(
      (c, position) => ({
        ...c,
        position,
        kind: extras.accessoryCategorySlugs.has(c.slug)
          ? ('accessory' as const)
          : ('machine' as const),
      }),
    );
    const saved = await manager.save(Category, categories);
    const bySlug = new Map(saved.map((c) => [c.slug, c]));

    const products = [
      ...data.products,
      ...extras.extraProducts,
      ...extras.moreMachines,
    ];
    const savedProducts = await manager.save(
      Product,
      products.map(({ category, ...p }, i) => ({
        ...p,
        reference: `${p.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}-${String(1001 + i)}`,
        specs: { ...p.specs, ...extras.extraSpecs[p.slug] },
        attributes: extras.productAttributes[p.slug] ?? {},
        category: bySlug.get(category),
      })),
    );
    await manager.save(
      ProductVariant,
      savedProducts.flatMap((product) =>
        (extras.productVariants[product.slug] ?? []).map((v, position) => ({
          ...v,
          position,
          reference: `${product.reference}-${String(position + 1).padStart(2, '0')}`,
          product,
        })),
      ),
    );
    await manager.save(
      Article,
      data.articles.map((a) => ({ ...a, ...extras.articleContent[a.slug] })),
    );
    await manager.save(Dealer, extras.dealers);
  }

  /** Sets demo images only on known rows that still have none, never overwriting edits. */
  private async backfillImages(manager: EntityManager): Promise<number> {
    const targets: [EntityTarget<ObjectLiteral>, Record<string, string>][] = [
      [Category, categoryImages],
      [Product, productImages],
      [Article, articleImages],
    ];
    let filled = 0;
    for (const [entity, images] of targets) {
      for (const [slug, imageUrl] of Object.entries(images)) {
        const result = await manager.update(
          entity,
          { slug, imageUrl: IsNull() },
          { imageUrl },
        );
        filled += result.affected ?? 0;
      }
    }
    return filled;
  }
}
