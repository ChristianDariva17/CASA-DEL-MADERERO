import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

export const CATEGORY_KINDS = ['machine', 'accessory'] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ default: 'tool' })
  icon: string;

  @Column({ type: 'varchar', default: 'machine' })
  kind: CategoryKind;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ default: 0 })
  position: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
