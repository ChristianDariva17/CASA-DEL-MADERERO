import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const DEALER_SERVICES = [
  'venta',
  'servicio-tecnico',
  'repuestos',
  'alquiler',
] as const;
export type DealerService = (typeof DEALER_SERVICES)[number];

@Entity('dealers')
export class Dealer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  region: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column({ type: 'double precision', nullable: true })
  lat: number | null;

  @Column({ type: 'double precision', nullable: true })
  lng: number | null;

  @Column({ type: 'simple-array', default: '' })
  services: DealerService[];

  /** Category slugs this dealer stocks; empty means the full range. */
  @Column({ type: 'simple-array', default: '' })
  categories: string[];
}
