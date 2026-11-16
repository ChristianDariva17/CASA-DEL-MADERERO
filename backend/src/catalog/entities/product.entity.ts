import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { ProductAttributes } from '../facets';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  /** Article reference shown on the product page, e.g. "CM250-1001". */
  @Column({ type: 'varchar', default: '' })
  reference: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ default: 'petrol' })
  powerSource: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  specs: Record<string, string>;

  /** Structured values used by the category filters. */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  attributes: ProductAttributes;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ default: false })
  isNew: boolean;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: true,
    onDelete: 'CASCADE',
  })
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @CreateDateColumn()
  createdAt: Date;
}
