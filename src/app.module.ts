import { Module } from '@nestjs/common';
import { AppPlatformModule } from './main/app-platform.module';
import { PokemonApiGraphqlModule } from './main/pokemon/pokemon-api-graphql.module';
import { PokemonApiRestModule } from './main/pokemon/pokemon-api-rest.module';
import { PokemonIntegrationModule } from './main/pokemon/pokemon-integration.module';
import { PokemonPersistenceModule } from './main/pokemon/pokemon-persistence.module';

@Module({
  imports: [
    AppPlatformModule,
    PokemonPersistenceModule,
    PokemonIntegrationModule,
    PokemonApiRestModule,
    PokemonApiGraphqlModule,
  ],
})
export class AppModule {}
