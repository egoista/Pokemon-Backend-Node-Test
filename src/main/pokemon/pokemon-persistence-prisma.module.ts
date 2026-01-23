import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PokemonRepositoryPrisma } from '../../infrastructure/pokemon/repositories/pokemon.repository.prisma';
import { POKEMON_REPOSITORY } from '../../application/shared/di.tokens';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PokemonRepositoryPrisma,
    {
      provide: POKEMON_REPOSITORY,
      useExisting: PokemonRepositoryPrisma,
    },
  ],
  exports: [POKEMON_REPOSITORY],
})
export class PokemonPersistencePrismaModule {}
