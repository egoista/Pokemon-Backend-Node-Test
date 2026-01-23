import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';

describe('PokemonModule', () => {
  const originalEnv = process.env.POKEMON_REPOSITORY;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.POKEMON_REPOSITORY;
    } else {
      process.env.POKEMON_REPOSITORY = originalEnv;
    }
    jest.resetModules();
  });

  it('uses PrismaModule when repository is prisma', async () => {
    process.env.POKEMON_REPOSITORY = 'prisma';
    jest.resetModules();
    const module = await import('./pokemon.module');
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      module.PokemonModule,
    ) as any[];
    const flattenedImports = imports.flatMap((entry: any) =>
      Array.isArray(entry) ? entry : [entry],
    );
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      module.PokemonModule,
    ) as any[];

    const hasPrismaImport = flattenedImports.some(
      (entry) => entry?.name === 'PrismaModule',
    );
    const hasPrismaProvider = providers.some(
      (provider) => provider?.name === 'PokemonRepositoryPrisma',
    );
    const hasTypeOrmProvider = providers.some(
      (provider) => provider?.name === 'PokemonRepositoryTypeORM',
    );

    expect(hasPrismaImport).toBe(true);
    expect(hasPrismaProvider).toBe(true);
    expect(hasTypeOrmProvider).toBe(false);
  });

  it('uses TypeOrmModule when repository is typeorm', async () => {
    process.env.POKEMON_REPOSITORY = 'typeorm';
    jest.resetModules();
    const module = await import('./pokemon.module');
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      module.PokemonModule,
    ) as any[];
    const flattenedImports = imports.flatMap((entry: any) =>
      Array.isArray(entry) ? entry : [entry],
    );
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      module.PokemonModule,
    ) as any[];
    const hasTypeOrmImport = flattenedImports.some(
      (entry) => entry?.module?.name === 'TypeOrmModule',
    );
    const hasTypeOrmProvider = providers.some(
      (provider) => provider?.name === 'PokemonRepositoryTypeORM',
    );
    const hasPrismaProvider = providers.some(
      (provider) => provider?.name === 'PokemonRepositoryPrisma',
    );

    expect(hasTypeOrmImport).toBe(true);
    expect(hasTypeOrmProvider).toBe(true);
    expect(hasPrismaProvider).toBe(false);
  });
});
