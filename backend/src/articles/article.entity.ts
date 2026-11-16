import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ArticleKind = 'news' | 'guide';

export interface ArticleSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  excerpt: string;

  /** Italic introduction shown under the title on the article page. */
  @Column({ type: 'text', default: '' })
  lead: string;

  @Column({ type: 'text', default: '' })
  body: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  sections: ArticleSection[];

  @Column({ type: 'varchar', default: 'news' })
  kind: ArticleKind;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'date' })
  publishedAt: string;
}
