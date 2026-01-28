import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PokeApiClientImpl } from '../../infrastructure/pokemon/poke-api.client';
import {
  POKE_API_CLIENT,
  POKE_API_HTTP_CLIENT,
} from '../../application/shared/di.tokens';
import { NestHttpClient } from '../../infrastructure/common/http/nest-http.client';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        baseURL: process.env.POKEAPI_BASE_URL ?? 'https://pokeapi.co/api/v2',
        timeout: parseInt(process.env.POKEAPI_TIMEOUT ?? '3000', 10),
        headers: {
          Accept: process.env.POKEAPI_ACCEPT ?? 'application/json',
          'User-Agent': process.env.POKEAPI_USER_AGENT ?? 'Backend-Node-Test/1.0',
        },
      }),
    }),
  ],
  providers: [
    NestHttpClient,
    {
      provide: POKE_API_HTTP_CLIENT,
      useExisting: NestHttpClient,
    },
    PokeApiClientImpl,
    {
      provide: POKE_API_CLIENT,
      useExisting: PokeApiClientImpl,
    },
  ],
  exports: [POKE_API_CLIENT],
})
export class PokemonIntegrationModule {}
