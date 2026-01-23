import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppPlatformModule } from '../../src/main/app-platform.module';
import { createTestApp } from '../support/create-test-app';

describe('HealthController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppPlatformModule],
    }).compile();

    app = await createTestApp(moduleFixture);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.info).toBeDefined();
      });
  });
});
