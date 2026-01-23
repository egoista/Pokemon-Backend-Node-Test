import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';

describe('PokemonPersistenceModule', () => {
  const originalEnv = process.env.POKEMON_REPOSITORY;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.POKEMON_REPOSITORY;
    } else {
      process.env.POKEMON_REPOSITORY = originalEnv;
    }
    jest.resetModules();
  });

  it('uses Prisma persistence when repository is prisma', async () => {
    process.env.POKEMON_REPOSITORY = 'prisma';
    jest.resetModules();
    const module = await import('./pokemon-persistence.module');
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      module.PokemonPersistenceModule,
    ) as any[];
    const hasPrismaImport = imports.some(
      (entry) => entry?.name === 'PokemonPersistencePrismaModule',
    );
    const hasTypeOrmImport = imports.some(
      (entry) => entry?.name === 'PokemonPersistenceTypeormModule',
    );

    expect(hasPrismaImport).toBe(true);
    expect(hasTypeOrmImport).toBe(false);
  });

  it('uses TypeORM persistence when repository is typeorm', async () => {
    process.env.POKEMON_REPOSITORY = 'typeorm';
    jest.resetModules();
    const module = await import('./pokemon-persistence.module');
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      module.PokemonPersistenceModule,
    ) as any[];
    const hasTypeOrmImport = imports.some(
      (entry) => entry?.name === 'PokemonPersistenceTypeormModule',
    );
    const hasPrismaImport = imports.some(
      (entry) => entry?.name === 'PokemonPersistencePrismaModule',
    );

    expect(hasTypeOrmImport).toBe(true);
    expect(hasPrismaImport).toBe(false);
  });
});
