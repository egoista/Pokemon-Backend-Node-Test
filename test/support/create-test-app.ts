import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

// NOTE: Mirror main.ts global pipes so e2e apps behave like the real bootstrap.
export async function createTestApp(module: TestingModule): Promise<INestApplication> {
    const app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    return app;
}
