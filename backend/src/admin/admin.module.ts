import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Module,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import type { EntityManager, ObjectLiteral } from 'typeorm';
import { Article } from '../articles/article.entity';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { Category } from '../catalog/entities/category.entity';
import { ProductVariant } from '../catalog/entities/product-variant.entity';
import { Product } from '../catalog/entities/product.entity';
import { Complaint } from '../complaints/complaints.module';
import { Dealer } from '../dealers/dealer.entity';
import { ORDER_STATUSES, Order } from '../orders/order.entity';
import type { OrderStatus } from '../orders/order.entity';
import { User } from '../users/user.entity';
import {
  ArticleDto,
  CategoryDto,
  DealerDto,
  OrderStatusDto,
  ProductDto,
  UpdateArticleDto,
  UpdateCategoryDto,
  UpdateDealerDto,
  UpdateProductDto,
  VariantDto,
} from './dto';

/** Turns a Postgres unique violation into a 409 with a readable message. */
export async function uniqueOr409<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    const code = (
      error as QueryFailedError & { driverError?: { code?: string } }
    ).driverError?.code;
    if (error instanceof QueryFailedError && code === '23505') {
      throw new ConflictException('Ya existe un registro con ese slug');
    }
    throw error;
  }
}

async function findOr404<T extends ObjectLiteral>(
  repo: Repository<T>,
  id: number,
  label: string,
): Promise<T> {
  const entity = await repo.findOne({ where: { id } as never });
  if (!entity) throw new NotFoundException(`${label} no encontrado`);
  return entity;
}

const money = (value: number) => value.toFixed(2);

/** Keeps only the fields sent in a partial update (DTO class fields default to undefined). */
// Optional DTO validators skip null, so null is dropped too, except where a
// column may really be cleared.
const NULLABLE = new Set(['imageUrl', 'lat', 'lng']);

function defined<T extends object>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(
      ([key, value]) =>
        value !== undefined && (value !== null || NULLABLE.has(key)),
    ),
  ) as Partial<T>;
}
/**
 * Makes the product's variants exactly the given list, in that order: rows
 * with an id are updated (so their ids stay stable), new ones are inserted and
 * missing ones deleted. Order lines copy variant data, so deleting is safe.
 */
async function replaceVariants(
  manager: EntityManager,
  product: Product,
  variants: VariantDto[],
) {
  const current = await manager.find(ProductVariant, {
    where: { product: { id: product.id } },
  });
  const currentIds = new Set(current.map((v) => v.id));
  if (variants.some((v) => v.id != null && !currentIds.has(v.id))) {
    throw new BadRequestException('La variante no pertenece a este producto');
  }
  const keep = new Set(variants.map((v) => v.id).filter((id) => id != null));
  if (keep.size !== variants.filter((v) => v.id != null).length) {
    throw new BadRequestException('Una variante aparece repetida');
  }
  const removed = current.filter((v) => !keep.has(v.id)).map((v) => v.id);
  if (removed.length) await manager.delete(ProductVariant, removed);
  await manager.save(
    ProductVariant,
    variants.map((v, position) => ({
      ...(v.id != null ? { id: v.id } : {}),
      label: v.label,
      reference: v.reference ?? '',
      price: money(v.price),
      position,
      product: { id: product.id },
    })),
  );
}

/** Orders whose money is already collected. */
const COLLECTED: OrderStatus[] = ['paid', 'shipped', 'delivered'];

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(Article) private readonly articles: Repository<Article>,
    @InjectRepository(Dealer) private readonly dealers: Repository<Dealer>,
    @InjectRepository(Complaint)
    private readonly complaints: Repository<Complaint>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async summary() {
    const [byStatus, revenue, products, customers, complaints, recentOrders] =
      await Promise.all([
        this.orders
          .createQueryBuilder('o')
          .select('o.status', 'status')
          .addSelect('COUNT(*)::int', 'count')
          .groupBy('o.status')
          .getRawMany<{ status: OrderStatus; count: number }>(),
        this.orders
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.total), 0)', 'total')
          .where('o.status IN (:...collected)', { collected: COLLECTED })
          .getRawOne<{ total: string }>(),
        this.products.count(),
        this.users.count({ where: { role: 'customer' } }),
        this.complaints.count(),
        this.orders.find({ order: { createdAt: 'DESC' }, take: 5 }),
      ]);
    return {
      ordersByStatus: Object.fromEntries(
        ORDER_STATUSES.map((s) => [
          s,
          byStatus.find((row) => row.status === s)?.count ?? 0,
        ]),
      ),
      revenue: money(Number(revenue?.total ?? 0)),
      products,
      customers,
      complaints,
      recentOrders,
    };
  }

  // Products

  /** With variants, so the panel form can edit them. */
  listProducts() {
    return this.products.find({
      relations: { variants: true },
      order: { name: 'ASC', variants: { position: 'ASC' } },
    });
  }

  async getProduct(id: number) {
    const product = await this.products.findOne({
      where: { id },
      relations: { variants: true },
      order: { variants: { position: 'ASC' } },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async createProduct(dto: ProductDto) {
    const category = await this.requireCategory(dto.categoryId);
    const { id } = await uniqueOr409(() =>
      this.products.manager.transaction(async (manager) => {
        const product = await manager.save(
          manager.create(Product, {
            ...this.productFields(dto),
            category,
            description: dto.description ?? '',
            reference: dto.reference ?? '',
            specs: dto.specs ?? {},
            isNew: dto.isNew ?? false,
          }),
        );
        if (dto.variants) {
          await replaceVariants(manager, product, dto.variants);
        }
        return product;
      }),
    );
    return this.getProduct(id);
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const product = await findOr404(this.products, id, 'Producto');
    const category =
      dto.categoryId == null
        ? product.category
        : await this.requireCategory(dto.categoryId);
    await uniqueOr409(() =>
      this.products.manager.transaction(async (manager) => {
        await manager.save(Product, {
          ...product,
          ...this.productFields(dto),
          category,
        });
        if (dto.variants) {
          await replaceVariants(manager, product, dto.variants);
        }
      }),
    );
    return this.getProduct(id);
  }

  async deleteProduct(id: number) {
    await findOr404(this.products, id, 'Producto');
    await this.products.delete(id);
  }

  /** DTO fields as entity columns: price as a 2-decimal string, no categoryId. */
  private productFields(dto: UpdateProductDto): Partial<Product> {
    const fields: Partial<Product> = {
      name: dto.name,
      slug: dto.slug,
      reference: dto.reference,
      summary: dto.summary,
      description: dto.description,
      price: typeof dto.price === 'number' ? money(dto.price) : undefined,
      powerSource: dto.powerSource,
      imageUrl: dto.imageUrl,
      isNew: dto.isNew,
      specs: dto.specs,
    };
    return defined(fields);
  }

  private async requireCategory(id: number) {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) throw new BadRequestException('La categoría no existe');
    return category;
  }

  // Categories

  listCategories() {
    return this.categories.find({ order: { kind: 'ASC', position: 'ASC' } });
  }

  createCategory(dto: CategoryDto) {
    return uniqueOr409(() => this.categories.save(this.categories.create(dto)));
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await findOr404(this.categories, id, 'Categoría');
    return uniqueOr409(() =>
      this.categories.save({ ...category, ...defined(dto) }),
    );
  }

  async deleteCategory(id: number) {
    await findOr404(this.categories, id, 'Categoría');
    // Products cascade with their category, so never delete one that has products.
    const inUse = await this.products.count({ where: { category: { id } } });
    if (inUse > 0) {
      throw new ConflictException(
        `La categoría tiene ${inUse} producto(s). Muévelos o elimínalos primero`,
      );
    }
    await this.categories.delete(id);
  }

  // Articles

  listArticles() {
    return this.articles.find({ order: { publishedAt: 'DESC' } });
  }

  createArticle(dto: ArticleDto) {
    return uniqueOr409(() =>
      this.articles.save(
        this.articles.create({
          ...dto,
          lead: dto.lead ?? '',
          body: dto.body ?? '',
          sections: dto.sections ?? [],
        }),
      ),
    );
  }

  async updateArticle(id: number, dto: UpdateArticleDto) {
    const article = await findOr404(this.articles, id, 'Artículo');
    return uniqueOr409(() =>
      this.articles.save({ ...article, ...defined(dto) }),
    );
  }

  async deleteArticle(id: number) {
    await findOr404(this.articles, id, 'Artículo');
    await this.articles.delete(id);
  }

  // Dealers

  listDealers() {
    return this.dealers.find({ order: { region: 'ASC', name: 'ASC' } });
  }

  createDealer(dto: DealerDto) {
    return this.dealers.save(
      this.dealers.create({
        ...dto,
        lat: dto.lat ?? null,
        lng: dto.lng ?? null,
      }),
    );
  }

  async updateDealer(id: number, dto: UpdateDealerDto) {
    const dealer = await findOr404(this.dealers, id, 'Distribuidor');
    return this.dealers.save({ ...dealer, ...defined(dto) });
  }

  async deleteDealer(id: number) {
    await findOr404(this.dealers, id, 'Distribuidor');
    await this.dealers.delete(id);
  }

  // Orders, customers, complaints

  listOrders(status?: OrderStatus) {
    return this.orders.find({
      where: status ? { status } : {},
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(id: number, status: OrderStatus) {
    const order = await findOr404(this.orders, id, 'Pedido');
    // Back to an unpaid state clears the payment date; collected keeps the first one.
    const paidAt = COLLECTED.includes(status)
      ? (order.paidAt ?? new Date())
      : status === 'cancelled'
        ? order.paidAt
        : null;
    await this.orders.update(id, { status, paidAt });
    return this.orders.findOne({ where: { id }, relations: { items: true } });
  }

  async listCustomers() {
    const customers = await this.users.find({
      where: { role: 'customer' },
      order: { createdAt: 'DESC' },
    });
    const counts = customers.length
      ? await this.orders
          .createQueryBuilder('o')
          .select('o.userId', 'userId')
          .addSelect('COUNT(*)::int', 'count')
          .where({ userId: In(customers.map((c) => c.id)) })
          .groupBy('o.userId')
          .getRawMany<{ userId: number; count: number }>()
      : [];
    return customers.map((c) => ({
      ...c,
      orders: counts.find((row) => row.userId === c.id)?.count ?? 0,
    }));
  }

  listComplaints() {
    return this.complaints.find({ order: { createdAt: 'DESC' } });
  }
}

function parseStatus(status?: string): OrderStatus | undefined {
  if (status === undefined || status === '') return undefined;
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new BadRequestException('Estado de pedido no válido');
  }
  return status as OrderStatus;
}

/** Every route here requires a signed-in admin. */
@Controller('admin')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('summary')
  summary() {
    return this.admin.summary();
  }

  @Get('products')
  listProducts() {
    return this.admin.listProducts();
  }

  @Get('products/:id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.admin.getProduct(id);
  }

  @Post('products')
  createProduct(@Body() dto: ProductDto) {
    return this.admin.createProduct(dto);
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.admin.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @HttpCode(204)
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteProduct(id);
  }

  @Get('categories')
  listCategories() {
    return this.admin.listCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CategoryDto) {
    return this.admin.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.admin.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(204)
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteCategory(id);
  }

  @Get('articles')
  listArticles() {
    return this.admin.listArticles();
  }

  @Post('articles')
  createArticle(@Body() dto: ArticleDto) {
    return this.admin.createArticle(dto);
  }

  @Patch('articles/:id')
  updateArticle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.admin.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  @HttpCode(204)
  deleteArticle(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteArticle(id);
  }

  @Get('dealers')
  listDealers() {
    return this.admin.listDealers();
  }

  @Post('dealers')
  createDealer(@Body() dto: DealerDto) {
    return this.admin.createDealer(dto);
  }

  @Patch('dealers/:id')
  updateDealer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDealerDto,
  ) {
    return this.admin.updateDealer(id, dto);
  }

  @Delete('dealers/:id')
  @HttpCode(204)
  deleteDealer(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteDealer(id);
  }

  @Get('orders')
  listOrders(@Query('status') status?: string) {
    return this.admin.listOrders(parseStatus(status));
  }

  @Patch('orders/:id')
  updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OrderStatusDto,
  ) {
    return this.admin.updateOrderStatus(id, dto.status);
  }

  @Get('customers')
  listCustomers() {
    return this.admin.listCustomers();
  }

  @Get('complaints')
  listComplaints() {
    return this.admin.listComplaints();
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Article,
      Dealer,
      Complaint,
      Order,
      User,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
