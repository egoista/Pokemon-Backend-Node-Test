import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseFilters } from '@nestjs/common';
import { CreatePokemonUseCase } from '../../../application/pokemon/create-pokemon.use-case';
import { GetPokemonByIdUseCase } from '../../../application/pokemon/get-pokemon-by-id.use-case';
import { ListPokemonsUseCase } from '../../../application/pokemon/list-pokemons.use-case';
import { UpdatePokemonUseCase } from '../../../application/pokemon/update-pokemon.use-case';
import { DeletePokemonUseCase } from '../../../application/pokemon/delete-pokemon.use-case';
import { CreatePokemonDto } from '../dtos/pokemon.dto';
import { UpdatePokemonDto } from '../dtos/update-pokemon.dto';
import { PokemonPresenter } from '../presenters/pokemon.presenter';
import { PokemonHttpExceptionFilter } from './pokemon.exception-filter';

@Controller('pokemons')
@UseFilters(PokemonHttpExceptionFilter)
export class PokemonController {
    constructor(
        private readonly createPokemonUseCase: CreatePokemonUseCase,
        private readonly getPokemonByIdUseCase: GetPokemonByIdUseCase,
        private readonly listPokemonsUseCase: ListPokemonsUseCase,
        private readonly updatePokemonUseCase: UpdatePokemonUseCase,
        private readonly deletePokemonUseCase: DeletePokemonUseCase,
    ) { }

    @Post()
    async create(@Body() body: CreatePokemonDto): Promise<PokemonPresenter> {
        const pokemon = await this.createPokemonUseCase.execute(body);
        return new PokemonPresenter(pokemon);
    }

    @Get()
    async list(): Promise<PokemonPresenter[]> {
        const pokemons = await this.listPokemonsUseCase.execute();
        return pokemons.map(p => new PokemonPresenter(p));
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number): Promise<PokemonPresenter> {
        const pokemon = await this.getPokemonByIdUseCase.execute(id);
        return new PokemonPresenter(pokemon);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdatePokemonDto
    ): Promise<PokemonPresenter> {
        const pokemon = await this.updatePokemonUseCase.execute({ id, ...body });
        return new PokemonPresenter(pokemon);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.deletePokemonUseCase.execute(id);
    }
}
