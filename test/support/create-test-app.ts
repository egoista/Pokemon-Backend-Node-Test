import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { PokemonGraphQLExceptionFilter } from '../../src/infrastructure/pokemon/graphql/pokemon-graphql-exception.filter';

// NOTE: Mirror main.ts global pipes so e2e apps behave like the real bootstrap.
export async function createTestApp(
  module: TestingModule,
): Promise<INestApplication> {
  const app = module.createNestApplication();
  // Required for proper IP extraction behind proxies (e.g. load balancers, rate limiting)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.setGlobalPrefix('api', {
    exclude: ['graphql', 'health'],
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

  // Register GraphQL exception filter globally for E2E tests
  app.useGlobalFilters(new PokemonGraphQLExceptionFilter());

  // Bind to loopback so supertest doesn't attempt 0.0.0.0 in restricted environments.
  await app.listen(0, '127.0.0.1');
  return app;
}
