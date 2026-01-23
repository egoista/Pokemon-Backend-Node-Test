import { Module } from '@nestjs/common';
import { PokemonPersistencePrismaModule } from './pokemon-persistence-prisma.module';
import { PokemonPersistenceTypeormModule } from './pokemon-persistence-typeorm.module';

const pokemonRepositoryImpl = process.env.POKEMON_REPOSITORY ?? 'prisma';
const useTypeOrm = pokemonRepositoryImpl === 'typeorm';
const persistenceModule = useTypeOrm
  ? PokemonPersistenceTypeormModule
  : PokemonPersistencePrismaModule;

@Module({
  imports: [persistenceModule],
  exports: [persistenceModule],
})
export class PokemonPersistenceModule {}
