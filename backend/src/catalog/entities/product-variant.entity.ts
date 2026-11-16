import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

/** A purchasable article of a product, e.g. a bar length or a size. */
@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  reference: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ default: 0 })
  position: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
