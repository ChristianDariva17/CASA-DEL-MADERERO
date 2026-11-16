import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Logger,
  Module,
  NotFoundException,
  OnApplicationBootstrap,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { ValidationError } from 'class-validator';
import { DataSource, Repository } from 'typeorm';
import type { ObjectLiteral } from 'typeorm';
import { uniqueOr409 } from '../admin/admin.module';
import { AuthGuard, Roles } from '../auth/auth.guard';
import {
  EventDto,
  FaqGroupDto,
  LegalPageDto,
  SectorDto,
  UpdateEventDto,
  UpdateFaqGroupDto,
  UpdateLegalPageDto,
  UpdateSectorDto,
} from './content.dto';
import { FairEvent, FaqGroup, LegalPage, Sector } from './content.entities';
import * as seed from './content.seed-data';
import { UploadsController } from './uploads';

type Dto = new () => object;

interface ContentResource {
  entity: new () => ObjectLiteral;
  create: Dto;
  update: Dto;
  order: Record<string, 'ASC' | 'DESC'>;
  /** Fills fields a create may omit. */
  defaults: Record<string, unknown>;
}

/** Admin-editable site content, by URL segment. */
const RESOURCES: Record<string, ContentResource> = {
  sectors: {
    entity: Sector,
    create: SectorDto,
    update: UpdateSectorDto,
    order: { position: 'ASC', id: 'ASC' },
    defaults: { intro: '', imageUrl: null, position: 0 },
  },
  events: {
    entity: FairEvent,
    create: EventDto,
    update: UpdateEventDto,
    order: { startDate: 'ASC', id: 'ASC' },
    defaults: { description: '', link: '' },
  },
  faqs: {
    entity: FaqGroup,
    create: FaqGroupDto,
    update: UpdateFaqGroupDto,
    order: { position: 'ASC', id: 'ASC' },
    defaults: { intro: '', position: 0 },
  },
  legal: {
    entity: LegalPage,
    create: LegalPageDto,
    update: UpdateLegalPageDto,
    order: { title: 'ASC' },
    defaults: {},
  },
};

/** Fields that an update may set back to null. */
const NULLABLE = new Set(['imageUrl']);

function flatten(errors: ValidationError[]): string[] {
  return errors.flatMap((e) => [
    ...Object.values(e.constraints ?? {}),
    ...flatten(e.children ?? []),
  ]);
}

/** Same rules as the global ValidationPipe, for routes whose DTO depends on a param. */
async function validated(dto: Dto, body: unknown): Promise<object> {
  const instance = plainToInstance(dto, body ?? {});
  const errors = await validate(instance, { whitelist: true });
  if (errors.length) throw new BadRequestException(flatten(errors));
  // Optional DTO fields default to undefined; null only clears nullable columns.
  return Object.fromEntries(
    Object.entries(instance).filter(
      ([key, value]) =>
        value !== undefined && (value !== null || NULLABLE.has(key)),
    ),
  );
}

function checkDates(values: { startDate?: string; endDate?: string }) {
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    throw new BadRequestException(
      'La fecha de fin no puede ser anterior al inicio',
    );
  }
}

@Injectable()
export class ContentService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Sector) private readonly sectors: Repository<Sector>,
    @InjectRepository(FairEvent) private readonly events: Repository<FairEvent>,
    @InjectRepository(FaqGroup) private readonly faqs: Repository<FaqGroup>,
    @InjectRepository(LegalPage) private readonly legal: Repository<LegalPage>,
  ) {}

  // Public

  listSectors() {
    return this.sectors.find({ order: RESOURCES.sectors.order });
  }

  async getSector(slug: string) {
    const sector = await this.sectors.findOneBy({ slug });
    if (!sector) throw new NotFoundException('Sector no encontrado');
    return sector;
  }

  listEvents() {
    return this.events.find({ order: RESOURCES.events.order });
  }

  listFaqs() {
    return this.faqs.find({ order: RESOURCES.faqs.order });
  }

  async getLegalPage(slug: string) {
    const page = await this.legal.findOneBy({ slug });
    if (!page) throw new NotFoundException('Página no encontrada');
    return page;
  }

  // Admin

  private resource(name: string) {
    const resource = RESOURCES[name];
    if (!Object.hasOwn(RESOURCES, name) || !resource) {
      throw new NotFoundException('Sección no encontrada');
    }
    return {
      ...resource,
      repo: this.dataSource.getRepository(resource.entity),
    };
  }

  list(name: string) {
    const { repo, order } = this.resource(name);
    return repo.find({ order });
  }

  async create(name: string, body: unknown) {
    const { repo, create, defaults } = this.resource(name);
    const values = await validated(create, body);
    checkDates(values);
    return uniqueOr409(() =>
      repo.save(repo.create({ ...defaults, ...values })),
    );
  }

  async update(name: string, id: number, body: unknown) {
    const { repo, update } = this.resource(name);
    const values = await validated(update, body);
    const current = await repo.findOneBy({ id });
    if (!current) throw new NotFoundException('Registro no encontrado');
    const merged = { ...current, ...values };
    checkDates(merged);
    return uniqueOr409(() => repo.save(merged));
  }

  async remove(name: string, id: number) {
    const { repo } = this.resource(name);
    const { affected } = await repo.delete(id);
    if (!affected) throw new NotFoundException('Registro no encontrado');
  }
}

/** Public, read-only content for the site pages. */
@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('sectors')
  listSectors() {
    return this.content.listSectors();
  }

  @Get('sectors/:slug')
  getSector(@Param('slug') slug: string) {
    return this.content.getSector(slug);
  }

  @Get('events')
  listEvents() {
    return this.content.listEvents();
  }

  @Get('faqs')
  listFaqs() {
    return this.content.listFaqs();
  }

  @Get('legal/:slug')
  getLegalPage(@Param('slug') slug: string) {
    return this.content.getLegalPage(slug);
  }
}

@Controller('admin/content')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  @Get(':resource')
  list(@Param('resource') resource: string) {
    return this.content.list(resource);
  }

  @Post(':resource')
  create(@Param('resource') resource: string, @Body() body: unknown) {
    return this.content.create(resource, body);
  }

  @Patch(':resource/:id')
  update(
    @Param('resource') resource: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
  ) {
    return this.content.update(resource, id, body);
  }

  @Delete(':resource/:id')
  @HttpCode(204)
  remove(
    @Param('resource') resource: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.content.remove(resource, id);
  }
}

/** Fills each empty content table with the site's original texts; never touches edited rows. */
@Injectable()
export class ContentSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(ContentSeed.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    if (process.env.DB_SEED === 'false') return;
    const seeded = await this.seedEmpty();
    if (seeded.length) this.logger.log(`Seeded content: ${seeded.join(', ')}`);
  }

  async seedEmpty(): Promise<string[]> {
    const tables: [new () => ObjectLiteral, ObjectLiteral[], string][] = [
      [Sector, seed.sectors, 'sectors'],
      [FairEvent, seed.events, 'events'],
      [FaqGroup, seed.faqGroups, 'faqs'],
      [LegalPage, seed.legalPages, 'legal'],
    ];
    const seeded: string[] = [];
    await this.dataSource.transaction(async (manager) => {
      for (const [entity, rows, name] of tables) {
        if ((await manager.count(entity)) > 0) continue;
        await manager.save(entity, rows);
        seeded.push(name);
      }
    });
    return seeded;
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Sector, FairEvent, FaqGroup, LegalPage])],
  controllers: [ContentController, AdminContentController, UploadsController],
  providers: [ContentService, ContentSeed],
})
export class ContentModule {}
