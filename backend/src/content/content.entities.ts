import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Landing page of a professional sector, "/profesional/:slug". */
@Entity('sectors')
export class Sector {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  machinesTitle: string;

  @Column({ type: 'text', default: '' })
  intro: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  /** Category slugs shown as "Todas las … profesionales" links. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  categories: string[];

  /** Products shown in "Máquinas … y accesorios". */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  productSlugs: string[];

  @Column({ default: 0 })
  position: number;
}

export const EVENT_KINDS = ['Feria', 'Demostración', 'Competencia'] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

/** A fair, demo day or competition listed on "/ferias-y-eventos". */
@Entity('events')
export class FairEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  kind: EventKind;

  @Column()
  city: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'text', default: '' })
  description: string;

  /** Optional "Más información" link, a site path or an http(s) URL. */
  @Column({ type: 'varchar', default: '' })
  link: string;
}

export interface FaqItem {
  question: string;
  /** Rich text: see the content format in the README. */
  answer: string;
}

/** A group of questions on "/preguntas-frecuentes"; slug is the anchor. */
@Entity('faq_groups')
export class FaqGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text', default: '' })
  intro: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  items: FaqItem[];

  @Column({ default: 0 })
  position: number;
}

/** A legal text served at "/legal/:slug". */
@Entity('legal_pages')
export class LegalPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  /** Rich text: see the content format in the README. */
  @Column({ type: 'text', default: '' })
  body: string;
}
