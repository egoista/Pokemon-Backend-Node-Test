import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonController } from '../../infrastructure/pokemon/controllers/pokemon.controller';
import { PokemonRepositoryPrisma } from '../../infrastructure/pokemon/repositories/pokemon.repository.prisma';
import { PokemonRepositoryTypeORM } from '../../infrastructure/pokemon/repositories/pokemon.repository.typeorm';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CreatePokemonUseCase } from '../../application/pokemon/create-pokemon.use-case';
import { GetPokemonByIdUseCase } from '../../application/pokemon/get-pokemon-by-id.use-case';
import { ListPokemonsUseCase } from '../../application/pokemon/list-pokemons.use-case';
import { UpdatePokemonUseCase } from '../../application/pokemon/update-pokemon.use-case';
import { DeletePokemonUseCase } from '../../application/pokemon/delete-pokemon.use-case';
import { ImportPokemonByIdUseCase } from '../../application/pokemon/import-pokemon-by-id.use-case';
import { PokeApiClientImpl } from '../../infrastructure/pokemon/poke-api.client';
import { PokeApiClient } from '../../application/pokemon/ports/poke-api.client.interface';
import {
  PokemonResolver,
  CreatePokemonResultResolver,
} from '../../infrastructure/pokemon/graphql/pokemon.resolver';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokemonEntity } from '../../infrastructure/pokemon/entities/pokemon.entity.typeorm';
import { TypeEntity } from '../../infrastructure/pokemon/entities/type.entity.typeorm';
import { PokemonGraphQLExceptionFilter } from '../../infrastructure/pokemon/graphql/pokemon-graphql-exception.filter';
import { NestLoggerAdapter } from '../../infrastructure/common/logger/nest-logger.adapter';

const POKEMON_REPOSITORY = 'POKEMON_REPOSITORY';
const POKE_API_CLIENT = 'POKE_API_CLIENT';
const pokemonRepositoryImpl = process.env.POKEMON_REPOSITORY ?? 'prisma';
const useTypeOrm = pokemonRepositoryImpl === 'typeorm';

// ARCH: Pokemon composition root; bind concrete adapters and use cases.
// ADR-006: Manual composition root. ADR-004: Multiple ORMs via repository abstraction.
@Module({
  imports: useTypeOrm
    ? [TypeOrmModule.forFeature([PokemonEntity, TypeEntity])]
    : [PrismaModule],
  controllers: [PokemonController],
  providers: [
    ...(useTypeOrm ? [PokemonRepositoryTypeORM] : [PokemonRepositoryPrisma]),
    PokemonResolver,
    CreatePokemonResultResolver,
    PokemonGraphQLExceptionFilter,
    PokeApiClientImpl,
    useTypeOrm
      ? { provide: POKEMON_REPOSITORY, useExisting: PokemonRepositoryTypeORM }
      : { provide: POKEMON_REPOSITORY, useExisting: PokemonRepositoryPrisma },
    {
      provide: POKE_API_CLIENT,
      useExisting: PokeApiClientImpl,
    },
    {
      provide: CreatePokemonUseCase,
      useFactory: (repo: PokemonRepository) => {
        return new CreatePokemonUseCase(
          repo,
          new NestLoggerAdapter(CreatePokemonUseCase.name),
        );
      },
      inject: [POKEMON_REPOSITORY],
    },
    {
      provide: GetPokemonByIdUseCase,
      useFactory: (repo: PokemonRepository) => {
        return new GetPokemonByIdUseCase(
          repo,
          new NestLoggerAdapter(GetPokemonByIdUseCase.name),
        );
      },
      inject: [POKEMON_REPOSITORY],
    },
    {
      provide: ListPokemonsUseCase,
      useFactory: (repo: PokemonRepository) => {
        return new ListPokemonsUseCase(
          repo,
          new NestLoggerAdapter(ListPokemonsUseCase.name),
        );
      },
      inject: [POKEMON_REPOSITORY],
    },
    {
      provide: UpdatePokemonUseCase,
      useFactory: (repo: PokemonRepository) => {
        return new UpdatePokemonUseCase(
          repo,
          new NestLoggerAdapter(UpdatePokemonUseCase.name),
        );
      },
      inject: [POKEMON_REPOSITORY],
    },
    {
      provide: DeletePokemonUseCase,
      useFactory: (repo: PokemonRepository) => {
        return new DeletePokemonUseCase(
          repo,
          new NestLoggerAdapter(DeletePokemonUseCase.name),
        );
      },
      inject: [POKEMON_REPOSITORY],
    },
    {
      provide: ImportPokemonByIdUseCase,
      useFactory: (repo: PokemonRepository, client: PokeApiClient) => {
        return new ImportPokemonByIdUseCase(
          repo,
          client,
          new NestLoggerAdapter(ImportPokemonByIdUseCase.name),
        );
      },
      inject: [POKEMON_REPOSITORY, POKE_API_CLIENT],
    },
  ],
})
export class PokemonModule {}
