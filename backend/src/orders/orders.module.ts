import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Inject,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { In, Repository } from 'typeorm';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { Product } from '../catalog/entities/product.entity';
import type { PublicUser } from '../users/user.entity';
import { Order, OrderItem } from './order.entity';
import type { OrderStatus } from './order.entity';
import { PAYMENT_GATEWAY, SimulatedPaymentGateway } from './payment-gateway';
import type { PaymentGateway } from './payment-gateway';

const MAX_QUANTITY = 20;
const PAYABLE: OrderStatus[] = ['pending_payment', 'payment_failed'];

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class OrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  variantId?: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  // The upper limit is checked after merging duplicate lines (see priceItems),
  // which also keeps the message free of the "items.0." prefix.
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Tu carrito está vacío' })
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Ingresa el nombre de quien recibe' })
  @MaxLength(120)
  fullName: string;

  @Transform(trim)
  @Matches(/^[A-Za-z0-9]{8,12}$/, {
    message: 'El número de documento debe tener entre 8 y 12 caracteres',
  })
  documentNumber: string;

  @Transform(trim)
  @Matches(/^\+?[0-9 ]{6,15}$/, { message: 'Ingresa un teléfono válido' })
  phone: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Ingresa la dirección de entrega' })
  @MaxLength(200)
  address: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Ingresa la ciudad' })
  @MaxLength(80)
  city: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Ingresa la región' })
  @MaxLength(80)
  region: string;
}

export class SimulatedPaymentDto {
  @IsBoolean()
  approved: boolean;
}

export interface CreatedOrder {
  code: string;
  status: OrderStatus;
  total: string;
  redirectUrl: string;
}

const toCents = (amount: string) => Math.round(Number(amount) * 100);
const fromCents = (cents: number) => (cents / 100).toFixed(2);

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
  ) {}

  async create(user: PublicUser, dto: CreateOrderDto): Promise<CreatedOrder> {
    const items = await this.priceItems(dto.items);
    const totalCents = items.reduce((sum, i) => sum + toCents(i.lineTotal), 0);

    // The public code derives from the row id, so concurrent orders never collide.
    const order = await this.orders.manager.transaction(async (manager) => {
      const saved = await manager.save(
        manager.create(Order, {
          code: `pending-${randomUUID()}`,
          userId: user.id,
          email: user.email,
          status: 'pending_payment',
          total: fromCents(totalCents),
          fullName: dto.fullName,
          documentNumber: dto.documentNumber,
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          region: dto.region,
          paymentProvider: this.gateway.provider,
          paymentReference: null,
          items: items.map((item) => manager.create(OrderItem, item)),
        }),
      );
      saved.code = `P-${saved.createdAt.getFullYear()}-${String(saved.id).padStart(6, '0')}`;
      await manager.update(Order, saved.id, { code: saved.code });
      return saved;
    });

    const checkout = await this.gateway.createCheckout({
      orderCode: order.code,
      amount: order.total,
      email: order.email,
    });
    await this.orders.update(order.id, {
      paymentReference: checkout.reference,
    });

    return {
      code: order.code,
      status: order.status,
      total: order.total,
      redirectUrl: checkout.redirectUrl,
    };
  }

  findMine(userId: number): Promise<Order[]> {
    return this.orders.find({
      where: { userId },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findMineByCode(userId: number, code: string): Promise<Order> {
    const order = await this.orders.findOne({
      where: { userId, code },
      relations: { items: true },
    });
    // Same answer for "missing" and "someone else's", so codes cannot be probed.
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  /** Approves or rejects a payment on the simulated provider (development only). */
  async paySimulated(
    userId: number,
    code: string,
    approved: boolean,
  ): Promise<Order> {
    if (this.gateway.provider !== 'simulated') {
      throw new NotFoundException('Pago simulado no disponible');
    }
    const order = await this.findMineByCode(userId, code);
    if (order.paymentProvider !== 'simulated') {
      throw new ConflictException('Este pedido se paga en la pasarela real');
    }
    const result = await this.orders.update(
      // Conditional update: two concurrent confirmations cannot both apply.
      { id: order.id, status: In(PAYABLE) },
      approved
        ? { status: 'paid', paidAt: new Date() }
        : { status: 'payment_failed' },
    );
    if (!result.affected) {
      throw new ConflictException('Este pedido ya no admite pagos');
    }
    return this.findMineByCode(userId, code);
  }

  /** Looks prices up in the catalogue; the client never sets a price. */
  private async priceItems(
    lines: OrderItemDto[],
  ): Promise<Omit<OrderItem, 'id' | 'order'>[]> {
    const merged = new Map<string, OrderItemDto>();
    for (const line of lines) {
      const key = `${line.productId}:${line.variantId ?? ''}`;
      const current = merged.get(key);
      merged.set(key, {
        ...line,
        quantity: (current?.quantity ?? 0) + line.quantity,
      });
    }

    const ids = [...new Set(lines.map((l) => l.productId))];
    const products = await this.products.find({
      where: { id: In(ids) },
      relations: { variants: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    return [...merged.values()].map((line) => {
      const product = byId.get(line.productId);
      if (!product) {
        throw new BadRequestException(
          'Uno de los productos de tu carrito ya no está disponible',
        );
      }
      if (line.quantity > MAX_QUANTITY) {
        throw new BadRequestException(
          `Puedes comprar hasta ${MAX_QUANTITY} unidades por producto`,
        );
      }
      const variant =
        line.variantId === undefined
          ? undefined
          : product.variants?.find((v) => v.id === line.variantId);
      if (line.variantId === undefined && product.variants?.length) {
        throw new BadRequestException(`Elige una variante de ${product.name}`);
      }
      if (line.variantId !== undefined && !variant) {
        throw new BadRequestException(
          `La variante elegida de ${product.name} ya no está disponible`,
        );
      }
      const unitPrice = variant?.price ?? product.price;
      return {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        reference: variant?.reference ?? product.reference,
        variantLabel: variant?.label ?? null,
        imageUrl: product.imageUrl,
        unitPrice: fromCents(toCents(unitPrice)),
        quantity: line.quantity,
        lineTotal: fromCents(toCents(unitPrice) * line.quantity),
      };
    });
  }
}

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@CurrentUser() user: PublicUser, @Body() dto: CreateOrderDto) {
    return this.orders.create(user, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: PublicUser) {
    return this.orders.findMine(user.id);
  }

  @Get('mine/:code')
  findOne(@CurrentUser() user: PublicUser, @Param('code') code: string) {
    return this.orders.findMineByCode(user.id, code);
  }

  @Post('mine/:code/simulated-payment')
  @HttpCode(200)
  pay(
    @CurrentUser() user: PublicUser,
    @Param('code') code: string,
    @Body() dto: SimulatedPaymentDto,
  ) {
    return this.orders.paySimulated(user.id, code, dto.approved);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product])],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: PAYMENT_GATEWAY,
      inject: [ConfigService],
      useFactory: (config: ConfigService): PaymentGateway => {
        const provider = config.get<string>('PAYMENT_PROVIDER', 'simulated');
        // Add real providers (Mercado Pago, Culqi, Niubiz) here when one is chosen.
        if (provider !== 'simulated') {
          throw new Error(`Unknown PAYMENT_PROVIDER "${provider}"`);
        }
        // The simulator lets buyers approve their own payments: never in production.
        if (config.get<string>('NODE_ENV') === 'production') {
          throw new Error(
            'PAYMENT_PROVIDER=simulated is not allowed in production',
          );
        }
        return new SimulatedPaymentGateway();
      },
    },
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
