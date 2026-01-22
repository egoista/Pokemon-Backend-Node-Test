import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { CreatePokemonUseCase } from '../../application/pokemon/create-pokemon.use-case';
import { CreatePokemonDto } from './pokemon.dto';
import { PokemonPresenter } from './pokemon.presenter';
import { PokemonHttpExceptionFilter } from './pokemon.exception-filter';

@Controller('pokemons')
@UseFilters(PokemonHttpExceptionFilter)
export class PokemonController {
    constructor(private readonly createPokemonUseCase: CreatePokemonUseCase) { }

    @Post()
    async create(@Body() body: CreatePokemonDto): Promise<PokemonPresenter> {
        const pokemon = await this.createPokemonUseCase.execute(body);
        return new PokemonPresenter(pokemon);
    }
}
