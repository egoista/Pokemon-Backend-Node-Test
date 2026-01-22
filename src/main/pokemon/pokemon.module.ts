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
import { PokeApiClient } from '../../infrastructure/pokemon/poke-api.client';
import { PokemonResolver, CreatePokemonResultResolver } from '../../infrastructure/pokemon/graphql/pokemon.resolver';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokemonEntity } from '../../infrastructure/pokemon/entities/pokemon.entity.typeorm';

const POKEMON_REPOSITORY = 'POKEMON_REPOSITORY';
const pokemonRepositoryImpl = process.env.POKEMON_REPOSITORY ?? 'prisma';
const useTypeOrm = pokemonRepositoryImpl === 'typeorm';

// ARCH: Composition root for Pokemon feature; wire concrete adapters here.
// ADR-006: Manual composition root. ADR-004: Multiple ORMs via repository abstraction.
@Module({
    imports: useTypeOrm
        ? [TypeOrmModule.forFeature([PokemonEntity])]
        : [PrismaModule],
    controllers: [PokemonController],
    providers: [
        ...(useTypeOrm ? [PokemonRepositoryTypeORM] : [PokemonRepositoryPrisma]),
        PokemonResolver,
        CreatePokemonResultResolver,
        useTypeOrm
            ? { provide: POKEMON_REPOSITORY, useExisting: PokemonRepositoryTypeORM }
            : { provide: POKEMON_REPOSITORY, useExisting: PokemonRepositoryPrisma },
        {
            provide: CreatePokemonUseCase,
            useFactory: (repo: PokemonRepository) => {
                return new CreatePokemonUseCase(repo);
            },
            inject: [POKEMON_REPOSITORY],
        },
        {
            provide: GetPokemonByIdUseCase,
            useFactory: (repo: PokemonRepository) => {
                return new GetPokemonByIdUseCase(repo);
            },
            inject: [POKEMON_REPOSITORY],
        },
        {
            provide: ListPokemonsUseCase,
            useFactory: (repo: PokemonRepository) => {
                return new ListPokemonsUseCase(repo);
            },
            inject: [POKEMON_REPOSITORY],
        },
        {
            provide: UpdatePokemonUseCase,
            useFactory: (repo: PokemonRepository) => {
                return new UpdatePokemonUseCase(repo);
            },
            inject: [POKEMON_REPOSITORY],
        },
        {
            provide: DeletePokemonUseCase,
            useFactory: (repo: PokemonRepository) => {
                return new DeletePokemonUseCase(repo);
            },
            inject: [POKEMON_REPOSITORY],
        },
        PokeApiClient,
        {
            provide: ImportPokemonByIdUseCase,
            useFactory: (repo: PokemonRepository, client: PokeApiClient) => {
                return new ImportPokemonByIdUseCase(repo, client);
            },
            inject: [POKEMON_REPOSITORY, PokeApiClient],
        },
    ],
})
export class PokemonModule { }
