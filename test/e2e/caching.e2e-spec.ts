import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Caching Strategy (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api', {
      exclude: ['graphql'],
    });

    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.listen(0, '127.0.0.1');
  }, 30000); // Increase timeout for database connection

  afterAll(async () => {
    // Clear cache maybe?
    await app.close();
  });

  describe('GET /api/v1/pokemons (Caching)', () => {
    it('should cache GET requests', async () => {
      // 1. First Request: MISS
      const response1 = await request(app.getHttpServer())
        .get('/api/v1/pokemons')
        .expect(200);

      expect(response1.headers['x-cache-status']).toBe('MISS');
      const etag1 = response1.headers['etag'];
      expect(etag1).toBeDefined();

      // 2. Second Request: HIT
      const response2 = await request(app.getHttpServer())
        .get('/api/v1/pokemons')
        .expect(200);

      expect(response2.headers['x-cache-status']).toBe('HIT');
      expect(response2.headers['etag']).toBe(etag1);
      expect(response2.body).toEqual(response1.body);
    });

    it('should support ETag (304 Not Modified)', async () => {
      // Ensure we have a cached version
      const response1 = await request(app.getHttpServer()).get(
        '/api/v1/pokemons',
      );
      const etag = response1.headers['etag'];

      // Request with If-None-Match
      await request(app.getHttpServer())
        .get('/api/v1/pokemons')
        .set('If-None-Match', etag)
        .expect(304);
    });

    it('should differentiate keys by query params', async () => {
      // Query A
      // Query A
      const resA = await request(app.getHttpServer())
        .get('/api/v1/pokemons?limit=1')
        .expect(200);
      expect(resA.headers['x-cache-status']).toBe('MISS');

      // Query B (different)
      const resB = await request(app.getHttpServer())
        .get('/api/v1/pokemons?limit=2')
        .expect(200);
      expect(resB.headers['x-cache-status']).toBe('MISS');

      // Query A again (Hit)
      const resA2 = await request(app.getHttpServer())
        .get('/api/v1/pokemons?limit=1')
        .expect(200);
      expect(resA2.headers['x-cache-status']).toBe('HIT');
    });
  });

  describe('Invalidation', () => {
    it('should invalidate cache on mutation (POST/DELETE)', async () => {
      // 1. Warm up list cache
      await request(app.getHttpServer()).get('/api/v1/pokemons');

      // 2. Create a new Pokemon (POST)
      // We need a valid payload.
      const newPokemon = {
        id: 9999,
        name: 'PikachusCousin',
        types: ['Electric'],
        attack: 50,
        defense: 40,
        hp: 35,
        speed: 90,
      };

      await request(app.getHttpServer())
        .post('/api/v1/pokemons')
        .send(newPokemon)
        .expect(201);

      // 3. Request list again: should be MISS due to invalidation
      const res = await request(app.getHttpServer())
        .get('/api/v1/pokemons')
        .expect(200);

      expect(res.headers['x-cache-status']).toBe('MISS');

      // Cleanup
      await request(app.getHttpServer()).delete('/api/v1/pokemons/9999');
    });
  });
});
