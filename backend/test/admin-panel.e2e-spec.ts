import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AdminModule } from '../src/admin/admin.module';
import { AuthModule, AuthService } from '../src/auth/auth.module';
import { Category } from '../src/catalog/entities/category.entity';
import { ProductVariant } from '../src/catalog/entities/product-variant.entity';
import { Product } from '../src/catalog/entities/product.entity';
import { ContentModule, ContentSeed } from '../src/content/content.module';
import {
  FairEvent,
  FaqGroup,
  LegalPage,
  Sector,
} from '../src/content/content.entities';
import { serveUploads } from '../src/content/uploads';
import { dbOptions } from './db';

const ADMIN = { email: 'admin@test.local', password: 'admin-test-password' };

const PNG = Buffer.from(
  '89504e470d0a1a0a0000000d4948445200000001000000010806000000' +
    '1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082',
  'hex',
);

interface Variant {
  id: number;
  label: string;
  reference: string;
  price: string;
  position: number;
}

describe('Admin panel: variants, uploads and site content (Postgres)', () => {
  let app: NestExpressApplication;
  let http: App;
  let data: DataSource;
  let product: Product;
  let other: Product;
  let kept: ProductVariant;
  let foreign: ProductVariant;
  let adminToken: string;
  let customerToken: string;
  let uploadDir: string;

  const asAdmin = () => ({ Authorization: `Bearer ${adminToken}` });

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters';
    process.env.AUTH_THROTTLE_LIMIT = '1000';
    uploadDir = mkdtempSync(join(tmpdir(), 'cm-uploads-'));
    process.env.UPLOAD_DIR = uploadDir;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TypeOrmModule.forRoot({ ...dbOptions, dropSchema: true }),
        AuthModule,
        AdminModule,
        ContentModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    serveUploads(app);
    await app.init();
    http = app.getHttpServer();
    data = moduleRef.get(DataSource);

    const category = await data.getRepository(Category).save({
      slug: 'motosierras',
      name: 'Motosierras',
      kind: 'machine',
    });
    [product, other] = await data.getRepository(Product).save([
      {
        slug: 'cm-250',
        name: 'CM 250',
        reference: 'CM250',
        summary: 'Motosierra',
        price: '1299.00',
        category,
      },
      {
        slug: 'cm-180',
        name: 'CM 180',
        reference: 'CM180',
        summary: 'Motosierra ligera',
        price: '899.00',
        category,
      },
    ]);
    [kept, foreign] = await data.getRepository(ProductVariant).save([
      {
        label: '45 cm',
        reference: 'CM250-02',
        price: '1349.50',
        position: 0,
        product,
      },
      {
        label: '35 cm',
        reference: 'CM180-01',
        price: '899.00',
        position: 0,
        product: other,
      },
    ]);

    await moduleRef
      .get(AuthService)
      .ensureAdmin(ADMIN.email, ADMIN.password, 'Admin');
    adminToken = (
      (await request(http).post('/auth/login').send(ADMIN).expect(200))
        .body as { accessToken: string }
    ).accessToken;
    customerToken = (
      (
        await request(http)
          .post('/auth/register')
          .send({
            fullName: 'Cliente',
            email: 'cliente@example.com',
            password: 'customer-pass-123',
          })
          .expect(201)
      ).body as { accessToken: string }
    ).accessToken;
  });

  afterAll(async () => {
    await app.close();
    rmSync(uploadDir, { recursive: true, force: true });
  });

  const variantsOf = async (id: number) =>
    (
      (
        await request(http)
          .get(`/admin/products/${id}`)
          .set(asAdmin())
          .expect(200)
      ).body as { variants: Variant[] }
    ).variants;

  describe('product variants', () => {
    it('lists products with their variants for the panel form', async () => {
      const res = await request(http)
        .get('/admin/products')
        .set(asAdmin())
        .expect(200);
      const cm250 = (res.body as (Product & { variants: Variant[] })[]).find(
        (p) => p.id === product.id,
      );
      expect(cm250?.variants.map((v) => v.label)).toEqual(['45 cm']);
    });

    it('replaces the variant set in the given order, keeping existing ids', async () => {
      await request(http)
        .patch(`/admin/products/${product.id}`)
        .set(asAdmin())
        .send({
          variants: [
            { label: ' 40 cm ', reference: 'CM250-01', price: 1299 },
            { id: kept.id, label: '45 cm', reference: 'CM250-02', price: 1399 },
          ],
        })
        .expect(200);

      const variants = await variantsOf(product.id);
      expect(variants).toEqual([
        {
          id: expect.any(Number) as number,
          label: '40 cm',
          reference: 'CM250-01',
          price: '1299.00',
          position: 0,
        },
        {
          id: kept.id,
          label: '45 cm',
          reference: 'CM250-02',
          price: '1399.00',
          position: 1,
        },
      ]);
    });

    it('leaves variants untouched when the update does not send them', async () => {
      await request(http)
        .patch(`/admin/products/${product.id}`)
        .set(asAdmin())
        .send({ name: 'CM 250 Pro' })
        .expect(200);
      expect((await variantsOf(product.id)).map((v) => v.label)).toEqual([
        '40 cm',
        '45 cm',
      ]);
    });

    it('rejects invalid variants and ids from another product', async () => {
      const send = (variants: unknown[]) =>
        request(http)
          .patch(`/admin/products/${product.id}`)
          .set(asAdmin())
          .send({ variants });

      const noPrice = await send([{ label: '50 cm', price: 0 }]).expect(400);
      expect(JSON.stringify(noPrice.body)).toContain(
        'El precio de la variante debe ser mayor que 0',
      );
      const noLabel = await send([{ label: ' ', price: 10 }]).expect(400);
      expect(JSON.stringify(noLabel.body)).toContain(
        'La variante necesita un nombre',
      );
      const repeated = await send([
        { id: kept.id, label: 'A', price: 1 },
        { id: kept.id, label: 'B', price: 2 },
      ]).expect(400);
      expect((repeated.body as { message: string }).message).toBe(
        'Una variante aparece repetida',
      );
      const stolen = await send([
        { id: foreign.id, label: '35 cm', price: 10 },
      ]).expect(400);
      expect((stolen.body as { message: string }).message).toBe(
        'La variante no pertenece a este producto',
      );
      // Nothing changed after the rejected requests.
      expect((await variantsOf(product.id)).length).toBe(2);
      expect((await variantsOf(other.id)).map((v) => v.id)).toEqual([
        foreign.id,
      ]);
    });

    it('creates a product with variants and removes them all with an empty list', async () => {
      const created = await request(http)
        .post('/admin/products')
        .set(asAdmin())
        .send({
          name: 'Espada',
          slug: 'espada',
          summary: 'Espada guía',
          price: 120,
          powerSource: 'petrol',
          categoryId: product.category.id,
          variants: [{ label: '16"', price: 120 }],
        })
        .expect(201);
      const id = (created.body as Product).id;
      expect((await variantsOf(id)).map((v) => v.label)).toEqual(['16"']);

      await request(http)
        .patch(`/admin/products/${id}`)
        .set(asAdmin())
        .send({ variants: [] })
        .expect(200);
      expect(await variantsOf(id)).toEqual([]);
    });
  });

  describe('image uploads', () => {
    const upload = (buffer: Buffer, filename: string, contentType: string) =>
      request(http)
        .post('/admin/uploads')
        .set(asAdmin())
        .attach('file', buffer, { filename, contentType });

    it('requires an admin', async () => {
      await request(http)
        .post('/admin/uploads')
        .attach('file', PNG, 'a.png')
        .expect(401);
      await request(http)
        .post('/admin/uploads')
        .set({ Authorization: `Bearer ${customerToken}` })
        .attach('file', PNG, 'a.png')
        .expect(403);
    });

    it('stores a PNG under a random name and serves it', async () => {
      const res = await upload(PNG, '../../evil name.png', 'image/png').expect(
        201,
      );
      const { url } = res.body as { url: string };
      expect(url).toMatch(/^\/api\/uploads\/[0-9a-f-]{36}\.png$/);
      expect(readdirSync(uploadDir)).toEqual([url.split('/').pop()]);

      // Static files ignore the global prefix, so the URL is served as-is.
      const served = await request(http).get(url).expect(200);
      expect(served.headers['content-type']).toBe('image/png');
      expect(served.headers['x-content-type-options']).toBe('nosniff');
    });

    it('rejects files that are not JPG, PNG or WebP by content', async () => {
      const res = await upload(
        Buffer.from('<svg onload="alert(1)"/>'),
        'fake.png',
        'image/png',
      ).expect(400);
      expect((res.body as { message: string }).message).toBe(
        'Solo se aceptan imágenes JPG, PNG o WebP',
      );
      const missing = await request(http)
        .post('/admin/uploads')
        .set(asAdmin())
        .expect(400);
      expect((missing.body as { message: string }).message).toBe(
        'Selecciona una imagen',
      );
    });

    it('rejects images over 5 MB', async () => {
      const big = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]);
      const res = await upload(big, 'big.png', 'image/png').expect(413);
      expect((res.body as { message: string }).message).toBe(
        'La imagen supera los 5 MB',
      );
    });

    it('accepts an uploaded image path in image fields and rejects other schemes', async () => {
      const ok = await request(http)
        .patch(`/admin/products/${product.id}`)
        .set(asAdmin())
        .send({
          imageUrl: '/api/uploads/0b9c1c4e-1d2f-4e5a-9b8c-7d6e5f4a3b2c.webp',
        })
        .expect(200);
      expect((ok.body as Product).imageUrl).toBe(
        '/api/uploads/0b9c1c4e-1d2f-4e5a-9b8c-7d6e5f4a3b2c.webp',
      );
      for (const imageUrl of ['javascript:alert(1)', '/api/uploads/../x.png']) {
        await request(http)
          .patch(`/admin/products/${product.id}`)
          .set(asAdmin())
          .send({ imageUrl })
          .expect(400);
      }
    });
  });

  describe('site content', () => {
    it('seeds empty content tables once without overwriting edits', async () => {
      const seed = data;
      const seeder = app.get(ContentSeed);
      await seeder.seedEmpty();
      const counts = async () => [
        await seed.getRepository(Sector).count(),
        await seed.getRepository(FairEvent).count(),
        await seed.getRepository(FaqGroup).count(),
        await seed.getRepository(LegalPage).count(),
      ];
      const first = await counts();
      expect(first.every((n) => n > 0)).toBe(true);

      await seed
        .getRepository(LegalPage)
        .update({ slug: 'cookies' }, { title: 'Cookies (editado)' });
      await seeder.seedEmpty();
      expect(await counts()).toEqual(first);
      expect(
        (
          await seed
            .getRepository(LegalPage)
            .findOneByOrFail({ slug: 'cookies' })
        ).title,
      ).toBe('Cookies (editado)');
    });

    it('serves the public content endpoints', async () => {
      const sector = await request(http)
        .get('/content/sectors/forestal')
        .expect(200);
      expect(sector.body).toMatchObject({
        slug: 'forestal',
        title: 'Sector forestal',
        categories: expect.arrayContaining(['motosierras']) as string[],
      });
      await request(http).get('/content/sectors/no-existe').expect(404);

      const events = (await request(http).get('/content/events').expect(200))
        .body as FairEvent[];
      const starts = events.map((e) => e.startDate);
      expect(starts).toEqual([...starts].sort());

      const faqs = (await request(http).get('/content/faqs').expect(200))
        .body as FaqGroup[];
      expect(faqs[0].items[0]).toEqual({
        question: expect.any(String) as string,
        answer: expect.any(String) as string,
      });

      const legal = await request(http)
        .get('/content/legal/privacidad')
        .expect(200);
      expect((legal.body as LegalPage).body).toContain('Ley N.° 29733');
    });

    it('lets only admins manage content', async () => {
      await request(http).get('/admin/content/sectors').expect(401);
      await request(http)
        .get('/admin/content/sectors')
        .set({ Authorization: `Bearer ${customerToken}` })
        .expect(403);
      await request(http)
        .get('/admin/content/unknown')
        .set(asAdmin())
        .expect(404);
    });

    it('creates, updates and deletes each content type', async () => {
      const cases: [
        string,
        Record<string, unknown>,
        Record<string, unknown>,
      ][] = [
        [
          'sectors',
          {
            slug: 'agro',
            title: 'Sector agrícola',
            machinesTitle: 'Máquinas agrícolas',
            intro: 'Para el campo.',
            imageUrl: '',
            categories: ['motosierras'],
            productSlugs: ['cm-250'],
            position: 9,
          },
          { title: 'Agro' },
        ],
        [
          'events',
          {
            name: 'Feria Sur',
            kind: 'Feria',
            city: 'Arequipa',
            startDate: '2027-05-01',
            endDate: '2027-05-03',
            description: 'Stand completo.',
            link: '',
          },
          { city: 'Cusco' },
        ],
        [
          'faqs',
          {
            slug: 'pagos',
            title: 'Pagos',
            intro: 'Medios de pago.',
            items: [{ question: '¿Aceptan tarjetas?', answer: 'Sí.' }],
            position: 5,
          },
          { title: 'Pagos y facturación' },
        ],
        [
          'legal',
          {
            slug: 'terminos',
            title: 'Términos y condiciones',
            body: 'Texto legal.',
          },
          { body: 'Texto legal actualizado.' },
        ],
      ];

      for (const [resource, payload, patch] of cases) {
        const created = await request(http)
          .post(`/admin/content/${resource}`)
          .set(asAdmin())
          .send(payload)
          .expect(201);
        const id = (created.body as { id: number }).id;
        const updated = await request(http)
          .patch(`/admin/content/${resource}/${id}`)
          .set(asAdmin())
          .send(patch)
          .expect(200);
        expect(updated.body).toMatchObject(patch);
        await request(http)
          .delete(`/admin/content/${resource}/${id}`)
          .set(asAdmin())
          .expect(204);
        await request(http)
          .delete(`/admin/content/${resource}/${id}`)
          .set(asAdmin())
          .expect(404);
      }
    });

    it('validates content with readable messages', async () => {
      const post = (resource: string, body: object) =>
        request(http)
          .post(`/admin/content/${resource}`)
          .set(asAdmin())
          .send(body);

      const dates = await post('events', {
        name: 'Demo',
        kind: 'Demostración',
        city: 'Lima',
        startDate: '2027-03-06',
        endDate: '2027-03-05',
        description: 'x',
      }).expect(400);
      expect((dates.body as { message: string }).message).toBe(
        'La fecha de fin no puede ser anterior al inicio',
      );

      const kind = await post('events', {
        name: 'Demo',
        kind: 'Concierto',
        city: 'Lima',
        startDate: '2027-03-06',
        endDate: '2027-03-06',
        description: 'x',
      }).expect(400);
      expect(JSON.stringify(kind.body)).toContain(
        'Selecciona feria, demostración o competencia',
      );

      for (const link of [
        '//evil.example',
        '/\\evil.example',
        'javascript:alert(1)',
      ]) {
        const res = await post('events', {
          name: 'Demo',
          kind: 'Feria',
          city: 'Lima',
          startDate: '2027-03-06',
          endDate: '2027-03-06',
          link,
        }).expect(400);
        expect((res.body as { message: string[] }).message).toContain(
          'El enlace debe empezar con "/" o con https://',
        );
      }

      const question = await post('faqs', {
        slug: 'vacia',
        title: 'Vacía',
        items: [{ question: '', answer: 'x' }],
      }).expect(400);
      expect(JSON.stringify(question.body)).toContain(
        'Cada pregunta necesita su texto',
      );

      const dup = await post('legal', {
        slug: 'cookies',
        title: 'Otra',
        body: 'x',
      }).expect(409);
      expect((dup.body as { message: string }).message).toBe(
        'Ya existe un registro con ese slug',
      );

      const extra = await request(http)
        .patch('/admin/content/legal/999999')
        .set(asAdmin())
        .send({ title: 'x' })
        .expect(404);
      expect((extra.body as { message: string }).message).toBe(
        'Registro no encontrado',
      );
    });
  });
});
