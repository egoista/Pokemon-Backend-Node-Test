import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { GRAPHQL_MODULE_OPTIONS } from '@nestjs/graphql';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { GraphQLFormattedError } from 'graphql';
import { getOptionsToken } from '@nestjs/throttler';

describe('AppModule', () => {
  const originalEnv = {
    JEST_WORKER_ID: process.env.JEST_WORKER_ID,
    NODE_ENV: process.env.NODE_ENV,
    POKEMON_REPOSITORY: process.env.POKEMON_REPOSITORY,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  };

  afterEach(() => {
    if (originalEnv.JEST_WORKER_ID === undefined) {
      delete process.env.JEST_WORKER_ID;
    } else {
      process.env.JEST_WORKER_ID = originalEnv.JEST_WORKER_ID;
    }
    if (originalEnv.NODE_ENV === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalEnv.NODE_ENV;
    }
    if (originalEnv.POKEMON_REPOSITORY === undefined) {
      delete process.env.POKEMON_REPOSITORY;
    } else {
      process.env.POKEMON_REPOSITORY = originalEnv.POKEMON_REPOSITORY;
    }
    if (originalEnv.RATE_LIMIT_WINDOW_MS === undefined) {
      delete process.env.RATE_LIMIT_WINDOW_MS;
    } else {
      process.env.RATE_LIMIT_WINDOW_MS = originalEnv.RATE_LIMIT_WINDOW_MS;
    }
    if (originalEnv.RATE_LIMIT_MAX_REQUESTS === undefined) {
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
    } else {
      process.env.RATE_LIMIT_MAX_REQUESTS = originalEnv.RATE_LIMIT_MAX_REQUESTS;
    }
    jest.resetModules();
  });

  it('formats GraphQL errors with sanitized payload', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const gqlOptions = moduleRef.get<any>(GRAPHQL_MODULE_OPTIONS);
    const result = gqlOptions.formatError({
      message: 'Boom',
    } as GraphQLFormattedError);

    expect(result).toEqual({ message: 'Boom' });
  });

  it('enables landing page plugin outside test environment', async () => {
    delete process.env.JEST_WORKER_ID;
    process.env.NODE_ENV = 'development';
    process.env.POKEMON_REPOSITORY = 'prisma';
    jest.resetModules();

    const module = await import('./app.module');
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      module.AppModule,
    ) as any[];
    const graphqlApiModule = imports.find(
      (entry) => entry?.name === 'PokemonApiGraphqlModule',
    );
    const graphqlImports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      graphqlApiModule,
    ) as any[];
    const graphqlModule = graphqlImports.find(
      (entry) => entry?.module?.name === 'GraphQLModule',
    );
    const gqlOptionsProvider = graphqlModule?.providers?.find(
      (provider: any) => provider?.provide === GRAPHQL_MODULE_OPTIONS,
    );
    const gqlOptions = gqlOptionsProvider?.useValue;

    const definitionsPath = String(gqlOptions?.definitions?.path ?? '').replace(
      /\\/g,
      '/',
    );

    expect(Array.isArray(gqlOptions?.plugins)).toBe(true);
    expect(gqlOptions?.plugins?.length).toBe(1);
    expect(definitionsPath).toContain(
      '/src/infrastructure/graphql/generated/graphql.ts',
    );
  });

  it('imports TypeOrmModule when repository is typeorm', async () => {
    process.env.POKEMON_REPOSITORY = 'typeorm';
    jest.resetModules();

    const module = await import('./app.module');
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      module.AppModule,
    ) as any[];
    const persistenceModule = imports.find(
      (entry) => entry?.name === 'PokemonPersistenceModule',
    );
    const persistenceImports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      persistenceModule,
    ) as any[];
    const hasTypeOrmImport = persistenceImports.some(
      (entry) => entry?.name === 'PokemonPersistenceTypeormModule',
    );
    const hasPrismaImport = persistenceImports.some(
      (entry) => entry?.name === 'PokemonPersistencePrismaModule',
    );

    expect(hasTypeOrmImport).toBe(true);
    expect(hasPrismaImport).toBe(false);
  });

  it('uses throttler env overrides when provided', async () => {
    process.env.RATE_LIMIT_WINDOW_MS = '5000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '42';
    jest.resetModules();

    const module = await import('./app.module');
    process.env.RATE_LIMIT_WINDOW_MS = '5000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '42';
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      module.AppModule,
    ) as any[];
    const platformModule = imports.find(
      (entry) => entry?.name === 'AppPlatformModule',
    );
    const platformImports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      platformModule,
    ) as any[];
    const throttlerModule = platformImports.find(
      (entry) => entry?.module?.name === 'ThrottlerModule',
    );
    const optionsProvider = throttlerModule?.providers?.find(
      (provider: any) => provider?.provide === getOptionsToken(),
    );

    const options = optionsProvider?.useFactory();

    expect(options).toEqual([{ ttl: 5000, limit: 42 }]);
  });

  it('uses throttler defaults when env is missing', async () => {
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
    jest.resetModules();

    const module = await import('./app.module');
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      module.AppModule,
    ) as any[];
    const platformModule = imports.find(
      (entry) => entry?.name === 'AppPlatformModule',
    );
    const platformImports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      platformModule,
    ) as any[];
    const throttlerModule = platformImports.find(
      (entry) => entry?.module?.name === 'ThrottlerModule',
    );
    const optionsProvider = throttlerModule?.providers?.find(
      (provider: any) => provider?.provide === getOptionsToken(),
    );

    const options = optionsProvider?.useFactory();

    expect(options).toEqual([{ ttl: 60000, limit: 100 }]);
  });
});
