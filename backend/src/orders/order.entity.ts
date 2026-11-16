import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export const ORDER_STATUSES = [
  'pending_payment',
  'payment_failed',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  /** Public order number, e.g. "P-2026-000012". */
  @Column({ unique: true })
  code: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  user: User | null;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', default: 'pending_payment' })
  status: OrderStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: string;

  @Column()
  email: string;

  @Column()
  fullName: string;

  @Column()
  documentNumber: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  region: string;

  @Column({ type: 'varchar' })
  paymentProvider: string;

  @Column({ type: 'varchar', nullable: true })
  paymentReference: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/** A line of an order. Product data is copied so later catalogue edits never change past orders. */
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  /** Plain id, no foreign key: deleting a product must not break past orders. */
  @Column({ type: 'int' })
  productId: number;

  @Column()
  productSlug: string;

  @Column()
  productName: string;

  @Column()
  reference: string;

  @Column({ type: 'varchar', nullable: true })
  variantLabel: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unitPrice: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  lineTotal: string;
}
