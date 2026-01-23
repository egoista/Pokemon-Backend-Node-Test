import { Module } from '@nestjs/common';
import { CreatePokemonUseCase } from '../../application/pokemon/create-pokemon.use-case';
import { DeletePokemonUseCase } from '../../application/pokemon/delete-pokemon.use-case';
import { GetPokemonByIdUseCase } from '../../application/pokemon/get-pokemon-by-id.use-case';
import { ImportPokemonByIdUseCase } from '../../application/pokemon/import-pokemon-by-id.use-case';
import { ListPokemonsUseCase } from '../../application/pokemon/list-pokemons.use-case';
import { UpdatePokemonUseCase } from '../../application/pokemon/update-pokemon.use-case';
import { PokeApiClient } from '../../application/pokemon/ports/poke-api.client.interface';
import {
  APP_LOGGER,
  POKE_API_CLIENT,
  POKEMON_REPOSITORY,
} from '../../application/shared/di.tokens';
import { AppLogger } from '../../application/shared/logger/logger.interface';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';

@Module({
  providers: [
    {
      provide: CreatePokemonUseCase,
      useFactory: (repo: PokemonRepository, logger: AppLogger) =>
        new CreatePokemonUseCase(repo, logger),
      inject: [POKEMON_REPOSITORY, APP_LOGGER],
    },
    {
      provide: GetPokemonByIdUseCase,
      useFactory: (repo: PokemonRepository, logger: AppLogger) =>
        new GetPokemonByIdUseCase(repo, logger),
      inject: [POKEMON_REPOSITORY, APP_LOGGER],
    },
    {
      provide: ListPokemonsUseCase,
      useFactory: (repo: PokemonRepository, logger: AppLogger) =>
        new ListPokemonsUseCase(repo, logger),
      inject: [POKEMON_REPOSITORY, APP_LOGGER],
    },
    {
      provide: UpdatePokemonUseCase,
      useFactory: (repo: PokemonRepository, logger: AppLogger) =>
        new UpdatePokemonUseCase(repo, logger),
      inject: [POKEMON_REPOSITORY, APP_LOGGER],
    },
    {
      provide: DeletePokemonUseCase,
      useFactory: (repo: PokemonRepository, logger: AppLogger) =>
        new DeletePokemonUseCase(repo, logger),
      inject: [POKEMON_REPOSITORY, APP_LOGGER],
    },
    {
      provide: ImportPokemonByIdUseCase,
      useFactory: (
        repo: PokemonRepository,
        client: PokeApiClient,
        logger: AppLogger,
      ) => new ImportPokemonByIdUseCase(repo, client, logger),
      inject: [POKEMON_REPOSITORY, POKE_API_CLIENT, APP_LOGGER],
    },
  ],
  exports: [
    CreatePokemonUseCase,
    GetPokemonByIdUseCase,
    ListPokemonsUseCase,
    UpdatePokemonUseCase,
    DeletePokemonUseCase,
    ImportPokemonByIdUseCase,
  ],
})
export class PokemonCoreModule {}
