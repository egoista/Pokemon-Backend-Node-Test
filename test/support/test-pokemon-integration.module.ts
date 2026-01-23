import { Global, Module } from '@nestjs/common';
import { POKE_API_CLIENT } from '../../src/application/shared/di.tokens';
import { PokeApiClientStub } from './poke-api.client.stub';

@Global()
@Module({
  providers: [
    PokeApiClientStub,
    {
      provide: POKE_API_CLIENT,
      useExisting: PokeApiClientStub,
    },
  ],
  exports: [POKE_API_CLIENT],
})
export class TestPokemonIntegrationModule {}
