import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CatalogController } from '../src/catalog/catalog.controller';
import { CatalogService } from '../src/catalog/catalog.service';
import {
  Complaint,
  ComplaintsController,
  ComplaintsService,
} from '../src/complaints/complaints.module';
import { Dealer } from '../src/dealers/dealer.entity';
import {
  DealersController,
  DealersService,
  distanceKm,
} from '../src/dealers/dealers.module';

const LIMA = { lat: -12.0464, lng: -77.0428 };

const dealers: Partial<Dealer>[] = [
  {
    id: 1,
    name: 'Lima',
    city: 'Lima',
    region: 'Lima',
    ...LIMA,
    services: ['venta', 'alquiler'],
    categories: [],
  },
  {
    id: 2,
    name: 'Surco',
    city: 'Surco',
    region: 'Lima',
    lat: -12.1105,
    lng: -76.9907,
    services: ['venta'],
    categories: ['cortasetos'],
  },
  {
    id: 3,
    name: 'Cusco',
    city: 'Cusco',
    region: 'Cusco',
    lat: -13.5319,
    lng: -71.9675,
    services: ['venta', 'alquiler'],
    categories: [],
  },
];

const validComplaint = {
  kind: 'reclamo',
  fullName: '  Ana Pérez ',
  documentType: 'DNI',
  documentNumber: '12345678',
  email: ' Ana@Example.com ',
  phone: '+51 999 888 777',
  address: 'Av. Siempre Viva 123',
  productOrService: 'CM 250',
  amount: 1299,
  detail: 'La máquina no arranca.',
  request: 'Revisión en garantía.',
};

describe('Inner views API', () => {
  let app: INestApplication<App>;
  const savedComplaints: Partial<Complaint>[] = [];

  beforeEach(async () => {
    savedComplaints.length = 0;
    let nextId = 41;
    const transactionManager = {
      create: (_: unknown, entity: Partial<Complaint>) => ({ ...entity }),
      save: (entity: Partial<Complaint>) => {
        entity.id ??= nextId++;
        entity.createdAt ??= new Date('2026-11-15T12:00:00Z');
        if (!savedComplaints.includes(entity)) savedComplaints.push(entity);
        return Promise.resolve(entity);
      },
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [DealersController, ComplaintsController, CatalogController],
      providers: [
        DealersService,
        ComplaintsService,
        CatalogService,
        {
          provide: getRepositoryToken(Dealer),
          useValue: {
            find: () => Promise.resolve(dealers.map((d) => ({ ...d }))),
          },
        },
        {
          provide: getRepositoryToken(Complaint),
          useValue: {
            manager: {
              transaction: (fn: (m: typeof transactionManager) => unknown) =>
                fn(transactionManager),
            },
          },
        },
        { provide: 'CategoryRepository', useValue: {} },
        { provide: 'ProductRepository', useValue: {} },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(() => app.close());

  describe('GET /dealers', () => {
    it('computes great-circle distances', () => {
      expect(distanceKm(LIMA, { lat: -13.5319, lng: -71.9675 })).toBeCloseTo(
        574,
        -1,
      );
    });

    it('keeps only dealers within the radius, nearest first, with distance', async () => {
      const res = await request(app.getHttpServer())
        .get('/dealers')
        .query({ lat: LIMA.lat, lng: LIMA.lng, radiusKm: 20 })
        .expect(200);
      const body = res.body as { name: string; distanceKm: number }[];
      expect(body.map((d) => d.name)).toEqual(['Lima', 'Surco']);
      expect(body[0].distanceKm).toBe(0);
      expect(body[1].distanceKm).toBeGreaterThan(0);
    });

    it('filters by service and by stocked product range', async () => {
      const byService = await request(app.getHttpServer())
        .get('/dealers?service=alquiler')
        .expect(200);
      expect((byService.body as Dealer[]).map((d) => d.name)).toEqual([
        'Lima',
        'Cusco',
      ]);

      const byCategory = await request(app.getHttpServer())
        .get('/dealers?category=motosierras')
        .expect(200);
      expect((byCategory.body as Dealer[]).map((d) => d.name)).toEqual([
        'Lima',
        'Cusco',
      ]);
    });

    it('returns distanceKm null without an origin', async () => {
      const res = await request(app.getHttpServer())
        .get('/dealers')
        .expect(200);
      expect((res.body as { distanceKm: null }[])[0].distanceKm).toBeNull();
    });

    it('rejects an unknown service and a lone coordinate', async () => {
      await request(app.getHttpServer()).get('/dealers?service=x').expect(400);
      await request(app.getHttpServer()).get('/dealers?lat=-12').expect(400);
    });
  });

  describe('POST /complaints', () => {
    it('stores a normalized complaint and returns a code derived from its id', async () => {
      await request(app.getHttpServer())
        .post('/complaints')
        .send(validComplaint)
        .expect(201, {
          code: 'R-2026-000041',
          createdAt: '2026-11-15T12:00:00.000Z',
        });
      expect(savedComplaints).toHaveLength(1);
      expect(savedComplaints[0]).toMatchObject({
        fullName: 'Ana Pérez',
        email: 'ana@example.com',
        amount: '1299.00',
        code: 'R-2026-000041',
      });
    });

    it('rejects an invalid document number and missing detail', async () => {
      const res = await request(app.getHttpServer())
        .post('/complaints')
        .send({ ...validComplaint, documentNumber: '12', detail: '   ' })
        .expect(400);
      const messages = (res.body as { message: string[] }).message;
      expect(messages).toEqual(
        expect.arrayContaining([
          'El número de documento debe tener entre 8 y 12 caracteres',
          'Describe el detalle de tu reclamo o queja',
        ]),
      );
      expect(savedComplaints).toHaveLength(0);
    });
  });

  describe('GET /products', () => {
    it('rejects an unknown sort and kind', async () => {
      await request(app.getHttpServer())
        .get('/products?sort=random')
        .expect(400);
      await request(app.getHttpServer()).get('/categories?kind=x').expect(400);
    });
  });
});
