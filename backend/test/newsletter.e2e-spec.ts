import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import {
  NewsletterController,
  NewsletterService,
  Subscription,
} from '../src/newsletter/newsletter.module';

describe('POST /newsletter', () => {
  let app: INestApplication<App>;
  const stored = new Set<string>();

  beforeEach(async () => {
    stored.clear();
    const repository = {
      exists: ({ where }: { where: { email: string } }) =>
        Promise.resolve(stored.has(where.email)),
      create: (entity: { email: string }) => entity,
      save: (entity: { email: string }) => {
        stored.add(entity.email);
        return Promise.resolve(entity);
      },
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [NewsletterController],
      providers: [
        NewsletterService,
        { provide: getRepositoryToken(Subscription), useValue: repository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(() => app.close());

  it('normalizes and stores an e-mail with surrounding spaces', async () => {
    await request(app.getHttpServer())
      .post('/newsletter')
      .send({ email: '  Test@Example.com ' })
      .expect(201, { email: 'test@example.com' });
    expect([...stored]).toEqual(['test@example.com']);
  });

  it('rejects an invalid e-mail', async () => {
    await request(app.getHttpServer())
      .post('/newsletter')
      .send({ email: 'nope' })
      .expect(400);
    expect(stored.size).toBe(0);
  });

  it('rejects a duplicate subscription regardless of case', async () => {
    const server = app.getHttpServer();
    await request(server)
      .post('/newsletter')
      .send({ email: 'a@b.com' })
      .expect(201);
    await request(server)
      .post('/newsletter')
      .send({ email: 'A@B.com' })
      .expect(409);
  });
});
