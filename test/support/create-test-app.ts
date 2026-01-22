import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

// NOTE: Mirror main.ts global pipes so e2e apps behave like the real bootstrap.
export async function createTestApp(module: TestingModule): Promise<INestApplication> {
    const app = module.createNestApplication();
    // Required for proper IP extraction behind proxies (e.g. load balancers, rate limiting)
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, transformOptions: { enableImplicitConversion: true } }));
    await app.init();
    return app;
}
