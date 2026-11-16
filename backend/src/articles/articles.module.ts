import {
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import type { ArticleKind } from './article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article) private readonly articles: Repository<Article>,
  ) {}

  findAll(kind?: ArticleKind): Promise<Article[]> {
    return this.articles.find({
      where: kind ? { kind } : {},
      order: { publishedAt: 'DESC' },
    });
  }

  async findOne(slug: string): Promise<Article> {
    const article = await this.articles.findOne({ where: { slug } });
    if (!article) throw new NotFoundException(`Article "${slug}" not found`);
    return article;
  }
}

@Controller('articles')
export class ArticlesController {
  constructor(private readonly service: ArticlesService) {}

  @Get()
  findAll(@Query('kind') kind?: ArticleKind) {
    return this.service.findAll(kind);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findOne(slug);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
