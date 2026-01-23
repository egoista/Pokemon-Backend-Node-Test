import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonRepositoryTypeORM } from '../../infrastructure/pokemon/repositories/pokemon.repository.typeorm';
import { PokemonEntity } from '../../infrastructure/pokemon/entities/pokemon.entity.typeorm';
import { TypeEntity } from '../../infrastructure/pokemon/entities/type.entity.typeorm';
import { POKEMON_REPOSITORY } from '../../application/shared/di.tokens';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database/database_orm.sqlite',
      autoLoadEntities: true,
      synchronize: true,
      migrations: ['../typeorm/migrations/*.ts'],
    }),
    TypeOrmModule.forFeature([PokemonEntity, TypeEntity]),
  ],
  providers: [
    PokemonRepositoryTypeORM,
    {
      provide: POKEMON_REPOSITORY,
      useExisting: PokemonRepositoryTypeORM,
    },
  ],
  exports: [POKEMON_REPOSITORY],
})
export class PokemonPersistenceTypeormModule {}
