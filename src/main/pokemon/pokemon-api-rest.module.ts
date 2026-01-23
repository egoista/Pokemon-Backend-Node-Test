import { Module } from '@nestjs/common';
import { PokemonController } from '../../infrastructure/pokemon/controllers/pokemon.controller';
import { PokemonCoreModule } from './pokemon-core.module';

@Module({
  imports: [PokemonCoreModule],
  controllers: [PokemonController],
})
export class PokemonApiRestModule {}
