import { Global, Module } from '@nestjs/common';
import { POKEMON_REPOSITORY } from '../../src/application/shared/di.tokens';
import { InMemoryPokemonRepository } from './pokemon/in-memory-pokemon.repository';

@Global()
@Module({
  providers: [
    InMemoryPokemonRepository,
    {
      provide: POKEMON_REPOSITORY,
      useExisting: InMemoryPokemonRepository,
    },
  ],
  exports: [POKEMON_REPOSITORY, InMemoryPokemonRepository],
})
export class TestPokemonPersistenceModule {}
