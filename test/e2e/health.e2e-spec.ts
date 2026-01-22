import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('HealthController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        // We need to replicate main.ts config here (prefix) to reproduce issues accurately if they depend on it
        // But AppModule usually doesn't have the prefix config, it's in main.ts bootstrap.
        // However, if we want to test the *Module* wiring, supertest on the app instance is enough.
        // BUT, if the issue is the global prefix set in main.ts, this test MIGHT PASS if I don't set it here!
        // Wait, E2E tests in NestJS usually recreate the app.
        // If I want to verify the URL structure, I must configure the app same as main.ts.

        app.setGlobalPrefix('api', {
            exclude: ['graphql', 'health'],
        });

        await app.init();
    });

    afterEach(async () => {
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
