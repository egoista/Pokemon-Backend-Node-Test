import { Global, Module } from '@nestjs/common';
import { PokeApiClientImpl } from '../../infrastructure/pokemon/poke-api.client';
import { POKE_API_CLIENT } from '../../application/shared/di.tokens';

@Global()
@Module({
  providers: [
    PokeApiClientImpl,
    {
      provide: POKE_API_CLIENT,
      useExisting: PokeApiClientImpl,
    },
  ],
  exports: [POKE_API_CLIENT],
})
export class PokemonIntegrationModule {}
