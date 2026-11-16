import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AdminModule } from '../src/admin/admin.module';
import { AuthModule, AuthService } from '../src/auth/auth.module';
import { Category } from '../src/catalog/entities/category.entity';
import { ProductVariant } from '../src/catalog/entities/product-variant.entity';
import { Product } from '../src/catalog/entities/product.entity';
import { Order } from '../src/orders/order.entity';
import { OrdersModule } from '../src/orders/orders.module';
import { User } from '../src/users/user.entity';
import { dbOptions } from './db';

/** Runs against the shared Postgres test database (see ./db.ts), wiped on start. */
const ADMIN = { email: 'admin@test.local', password: 'admin-test-password' };
const PASSWORD = 'customer-pass-123';

interface Session {
  accessToken: string;
  user: { id: number; email: string; role: string; passwordHash?: string };
}

describe('Accounts, orders and admin (Postgres)', () => {
  let app: INestApplication<App>;
  let http: App;
  let data: DataSource;
  let product: Product;
  /** A product without variants. */
  let simple: Product;
  let variant: ProductVariant;
  let category: Category;
  let adminToken: string;

  const register = async (email: string) =>
    (
      await request(http)
        .post('/auth/register')
        .send({ fullName: 'Cliente Prueba', email, password: PASSWORD })
        .expect(201)
    ).body as Session;

  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  const checkout = {
    fullName: 'Cliente Prueba',
    documentNumber: '12345678',
    phone: '+51 999 888 777',
    address: 'Av. Los Pinos 123',
    city: 'Lima',
    region: 'Lima',
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters';
    process.env.AUTH_THROTTLE_LIMIT = '1000';
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TypeOrmModule.forRoot({ ...dbOptions, dropSchema: true }),
        AuthModule,
        OrdersModule,
        AdminModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    http = app.getHttpServer();
    data = moduleRef.get(DataSource);

    category = await data.getRepository(Category).save({
      slug: 'motosierras',
      name: 'Motosierras',
      kind: 'machine',
    });
    product = await data.getRepository(Product).save({
      slug: 'cm-250',
      name: 'CM 250',
      reference: 'CM250-1001',
      summary: 'Motosierra',
      price: '1299.00',
      category,
    });
    simple = await data.getRepository(Product).save({
      slug: 'cm-180',
      name: 'CM 180',
      reference: 'CM180-1002',
      summary: 'Motosierra ligera',
      price: '899.00',
      category,
    });
    variant = await data.getRepository(ProductVariant).save({
      label: '45 cm',
      reference: 'CM250-1001-02',
      price: '1349.50',
      product,
    });

    await moduleRef
      .get(AuthService)
      .ensureAdmin(ADMIN.email, ADMIN.password, 'Admin');
    adminToken = (
      (await request(http).post('/auth/login').send(ADMIN).expect(200))
        .body as Session
    ).accessToken;
  });

  afterAll(() => app.close());

  it('rate-limits login attempts per client (429)', async () => {
    process.env.AUTH_THROTTLE_LIMIT = '3';
    const ref = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TypeOrmModule.forRoot({ ...dbOptions, dropSchema: false }),
        AuthModule,
      ],
    }).compile();
    const limited = ref.createNestApplication<INestApplication<App>>();
    limited.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await limited.init();
    try {
      const attempt = () =>
        request(limited.getHttpServer())
          .post('/auth/login')
          .send({ email: 'nobody@example.com', password: 'wrong-pass' });
      for (let i = 0; i < 3; i++) await attempt().expect(401);
      await attempt().expect(429);
    } finally {
      await limited.close();
      process.env.AUTH_THROTTLE_LIMIT = '1000';
    }
  });

  describe('auth', () => {
    it('registers customers only, ignoring a requested role, and never returns the hash', async () => {
      const res = await request(http)
        .post('/auth/register')
        .send({
          fullName: ' Ana ',
          email: ' Ana@Example.com ',
          password: PASSWORD,
          role: 'admin',
        })
        .expect(201);
      const body = res.body as Session;
      expect(body.user).toEqual({
        id: expect.any(Number) as number,
        email: 'ana@example.com',
        fullName: 'Ana',
        role: 'customer',
      });
      expect(body.accessToken).toEqual(expect.any(String));
      const stored = await data.getRepository(User).findOne({
        where: { email: 'ana@example.com' },
        select: { passwordHash: true },
      });
      expect(stored?.passwordHash).toMatch(/^\$2[aby]\$10\$/);
      expect(stored?.passwordHash).not.toContain(PASSWORD);
    });

    it('rejects a duplicate email and a short password', async () => {
      await register('dup@example.com');
      const dup = await request(http)
        .post('/auth/register')
        .send({ fullName: 'X', email: 'DUP@example.com', password: PASSWORD })
        .expect(409);
      expect((dup.body as { message: string }).message).toBe(
        'Ya existe una cuenta con este correo',
      );
      const short = await request(http)
        .post('/auth/register')
        .send({ fullName: 'X', email: 'short@example.com', password: '123' })
        .expect(400);
      expect((short.body as { message: string[] }).message).toContain(
        'La contraseña debe tener al menos 8 caracteres',
      );
    });

    it('answers the same 401 for a wrong password and an unknown email', async () => {
      await register('login@example.com');
      for (const body of [
        { email: 'login@example.com', password: 'wrong-password' },
        { email: 'nobody@example.com', password: PASSWORD },
      ]) {
        const res = await request(http)
          .post('/auth/login')
          .send(body)
          .expect(401);
        expect((res.body as { message: string }).message).toBe(
          'Correo o contraseña incorrectos',
        );
      }
      const ok = await request(http)
        .post('/auth/login')
        .send({ email: ' LOGIN@example.com', password: PASSWORD })
        .expect(200);
      expect((ok.body as Session).user.role).toBe('customer');
    });

    it('returns the current user for a valid token and 401 otherwise', async () => {
      const session = await register('me@example.com');
      const me = await request(http)
        .get('/auth/me')
        .set(bearer(session.accessToken))
        .expect(200);
      expect(me.body).toEqual(session.user);
      await request(http).get('/auth/me').expect(401);
      await request(http).get('/auth/me').set(bearer('not-a-jwt')).expect(401);
    });

    it('logs the seeded admin in with the admin role', async () => {
      const res = await request(http)
        .post('/auth/login')
        .send(ADMIN)
        .expect(200);
      expect((res.body as Session).user.role).toBe('admin');
    });
  });

  describe('admin access', () => {
    it('requires a token (401) and the admin role (403)', async () => {
      const customer = await register('nosy@example.com');
      await request(http).get('/admin/summary').expect(401);
      const res = await request(http)
        .get('/admin/summary')
        .set(bearer(customer.accessToken))
        .expect(403);
      expect((res.body as { message: string }).message).toBe(
        'No tienes permiso para esta sección',
      );
      await request(http)
        .post('/admin/categories')
        .set(bearer(customer.accessToken))
        .send({ name: 'X', slug: 'x', kind: 'machine' })
        .expect(403);
      await request(http)
        .get('/admin/summary')
        .set(bearer(adminToken))
        .expect(200);
    });

    it('rejects a token whose user no longer exists', async () => {
      const gone = await register('gone@example.com');
      await data.getRepository(User).delete(gone.user.id);
      await request(http)
        .get('/auth/me')
        .set(bearer(gone.accessToken))
        .expect(401);
    });
  });

  describe('orders', () => {
    it('prices the order from the catalogue, ignoring any client price', async () => {
      const customer = await register('buyer@example.com');
      const res = await request(http)
        .post('/orders')
        .set(bearer(customer.accessToken))
        .send({
          ...checkout,
          items: [
            { productId: simple.id, quantity: 2, price: 1 },
            { productId: product.id, variantId: variant.id, quantity: 1 },
            { productId: simple.id, quantity: 1 },
          ],
        })
        .expect(201);
      const created = res.body as {
        code: string;
        total: string;
        status: string;
        redirectUrl: string;
      };
      // 3 × 899.00 + 1 × 1349.50
      expect(created.total).toBe('4046.50');
      expect(created.status).toBe('pending_payment');
      expect(created.code).toMatch(/^P-\d{4}-\d{6}$/);
      expect(created.redirectUrl).toBe(`/pago/${created.code}`);

      const order = await data.getRepository(Order).findOne({
        where: { code: created.code },
        relations: { items: true },
      });
      expect(order).toMatchObject({
        userId: customer.user.id,
        email: 'buyer@example.com',
        paymentProvider: 'simulated',
      });
      expect(order?.paymentReference).toMatch(/^SIM-/);
      expect(
        order?.items
          .map((i) => [i.variantLabel, i.quantity, i.unitPrice, i.lineTotal])
          .sort(),
      ).toEqual([
        [null, 3, '899.00', '2697.00'],
        ['45 cm', 1, '1349.50', '1349.50'],
      ]);
    });

    it('rejects unknown products, foreign variants, bad quantities and anonymous buyers', async () => {
      const customer = await register('picky@example.com');
      const post = (items: object[]) =>
        request(http)
          .post('/orders')
          .set(bearer(customer.accessToken))
          .send({ ...checkout, items });

      const unknown = await post([{ productId: 99999, quantity: 1 }]).expect(
        400,
      );
      expect((unknown.body as { message: string }).message).toBe(
        'Uno de los productos de tu carrito ya no está disponible',
      );
      await post([
        { productId: product.id, variantId: 99999, quantity: 1 },
      ]).expect(400);
      const noVariant = await post([
        { productId: product.id, quantity: 1 },
      ]).expect(400);
      expect((noVariant.body as { message: string }).message).toBe(
        'Elige una variante de CM 250',
      );
      const tooMany = await post([
        { productId: simple.id, quantity: 21 },
      ]).expect(400);
      expect((tooMany.body as { message: string }).message).toBe(
        'Puedes comprar hasta 20 unidades por producto',
      );
      const empty = await post([]).expect(400);
      expect((empty.body as { message: string[] }).message).toContain(
        'Tu carrito está vacío',
      );
      await request(http)
        .post('/orders')
        .send({ ...checkout, items: [{ productId: simple.id, quantity: 1 }] })
        .expect(401);
      expect(
        await data
          .getRepository(Order)
          .count({ where: { email: 'picky@example.com' } }),
      ).toBe(0);
    });

    it('lets only the owner see and pay an order, and pays it once', async () => {
      const owner = await register('owner@example.com');
      const other = await register('other@example.com');
      const { code } = (
        await request(http)
          .post('/orders')
          .set(bearer(owner.accessToken))
          .send({
            ...checkout,
            items: [{ productId: simple.id, quantity: 1 }],
          })
          .expect(201)
      ).body as { code: string };

      await request(http)
        .get(`/orders/mine/${code}`)
        .set(bearer(other.accessToken))
        .expect(404);
      await request(http)
        .post(`/orders/mine/${code}/simulated-payment`)
        .set(bearer(other.accessToken))
        .send({ approved: true })
        .expect(404);

      const rejected = await request(http)
        .post(`/orders/mine/${code}/simulated-payment`)
        .set(bearer(owner.accessToken))
        .send({ approved: false })
        .expect(200);
      expect((rejected.body as Order).status).toBe('payment_failed');

      const paid = await request(http)
        .post(`/orders/mine/${code}/simulated-payment`)
        .set(bearer(owner.accessToken))
        .send({ approved: true })
        .expect(200);
      expect((paid.body as Order).status).toBe('paid');
      expect((paid.body as Order).paidAt).not.toBeNull();

      await request(http)
        .post(`/orders/mine/${code}/simulated-payment`)
        .set(bearer(owner.accessToken))
        .send({ approved: true })
        .expect(409);

      const mine = await request(http)
        .get('/orders/mine')
        .set(bearer(owner.accessToken))
        .expect(200);
      expect((mine.body as Order[]).map((o) => o.code)).toEqual([code]);
      const others = await request(http)
        .get('/orders/mine')
        .set(bearer(other.accessToken))
        .expect(200);
      expect(others.body).toEqual([]);
    });
  });

  describe('admin content and orders', () => {
    it('creates, partially updates and deletes a product', async () => {
      const created = await request(http)
        .post('/admin/products')
        .set(bearer(adminToken))
        .send({
          name: 'CM 999',
          slug: 'cm-999',
          summary: 'Nueva',
          price: 999.9,
          powerSource: 'battery',
          categoryId: category.id,
          imageUrl: '',
        })
        .expect(201);
      const id = (created.body as Product).id;
      expect(created.body).toMatchObject({ price: '999.90', imageUrl: null });

      const updated = await request(http)
        .patch(`/admin/products/${id}`)
        .set(bearer(adminToken))
        .send({ price: 1050 })
        .expect(200);
      expect(updated.body).toMatchObject({
        name: 'CM 999',
        summary: 'Nueva',
        price: '1050.00',
        powerSource: 'battery',
      });

      const dup = await request(http)
        .post('/admin/products')
        .set(bearer(adminToken))
        .send({
          name: 'Otra',
          slug: 'cm-999',
          summary: 'x',
          price: 1,
          powerSource: 'petrol',
          categoryId: category.id,
        })
        .expect(409);
      expect((dup.body as { message: string }).message).toBe(
        'Ya existe un registro con ese slug',
      );

      await request(http)
        .delete(`/admin/products/${id}`)
        .set(bearer(adminToken))
        .expect(204);
      expect(await data.getRepository(Product).count({ where: { id } })).toBe(
        0,
      );
    });

    it('ignores nulls in a partial update instead of failing', async () => {
      const res = await request(http)
        .patch(`/admin/products/${simple.id}`)
        .set(bearer(adminToken))
        .send({ name: null, price: null, categoryId: null, imageUrl: null })
        .expect(200);
      expect(res.body).toMatchObject({
        name: 'CM 180',
        price: '899.00',
        imageUrl: null,
        category: { id: category.id },
      });
      const zero = await request(http)
        .post('/admin/products')
        .set(bearer(adminToken))
        .send({
          name: 'Gratis',
          slug: 'gratis',
          summary: 'x',
          price: 0,
          powerSource: 'petrol',
          categoryId: category.id,
        })
        .expect(400);
      expect((zero.body as { message: string[] }).message).toContain(
        'El precio debe ser mayor que 0',
      );
    });

    it('refuses to delete a category that still has products', async () => {
      const res = await request(http)
        .delete(`/admin/categories/${category.id}`)
        .set(bearer(adminToken))
        .expect(409);
      expect((res.body as { message: string }).message).toBe(
        'La categoría tiene 2 producto(s). Muévelos o elimínalos primero',
      );
      expect(await data.getRepository(Product).count()).toBe(2);
    });

    it('changes an order status and counts collected revenue', async () => {
      const customer = await register('ship@example.com');
      const { code } = (
        await request(http)
          .post('/orders')
          .set(bearer(customer.accessToken))
          .send({
            ...checkout,
            items: [{ productId: simple.id, quantity: 1 }],
          })
          .expect(201)
      ).body as { code: string };
      const order = await data.getRepository(Order).findOneByOrFail({ code });

      await request(http)
        .patch(`/admin/orders/${order.id}`)
        .set(bearer(adminToken))
        .send({ status: 'teleported' })
        .expect(400);
      const shipped = await request(http)
        .patch(`/admin/orders/${order.id}`)
        .set(bearer(adminToken))
        .send({ status: 'shipped' })
        .expect(200);
      expect(shipped.body).toMatchObject({ status: 'shipped' });
      expect((shipped.body as Order).paidAt).not.toBeNull();

      const summary = await request(http)
        .get('/admin/summary')
        .set(bearer(adminToken))
        .expect(200);
      const body = summary.body as {
        ordersByStatus: Record<string, number>;
        revenue: string;
      };
      expect(body.ordersByStatus.shipped).toBe(1);
      // The earlier paid order (899.00) plus this shipped one.
      expect(body.revenue).toBe('1798.00');

      const reopened = await request(http)
        .patch(`/admin/orders/${order.id}`)
        .set(bearer(adminToken))
        .send({ status: 'pending_payment' })
        .expect(200);
      expect((reopened.body as Order).paidAt).toBeNull();
    });
  });
});
