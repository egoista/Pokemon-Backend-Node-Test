import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { CreatePokemonUseCase } from '../../../application/pokemon/create-pokemon.use-case';
import { GetPokemonByIdUseCase } from '../../../application/pokemon/get-pokemon-by-id.use-case';
import { ListPokemonsUseCase } from '../../../application/pokemon/list-pokemons.use-case';
import { UpdatePokemonUseCase } from '../../../application/pokemon/update-pokemon.use-case';
import { DeletePokemonUseCase } from '../../../application/pokemon/delete-pokemon.use-case';
import { ImportPokemonByIdUseCase } from '../../../application/pokemon/import-pokemon-by-id.use-case';
import { CreatePokemonDto } from '../dtos/pokemon.dto';
import { ImportPokemonDto } from '../dtos/import-pokemon.dto';
import { ListPokemonsQueryDto } from '../dtos/list-pokemons-query.dto';
import { UpdatePokemonDto } from '../dtos/update-pokemon.dto';
import { PokemonPresenter } from '../presenters/pokemon.presenter';
import { PokemonListPresenter } from '../presenters/pokemon-list.presenter';
import { PokemonHttpExceptionFilter } from './pokemon.exception-filter';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

// ARCH: HTTP adapter only; business rules live in use cases.
// ADR-002: Clean Architecture. ADR-003: REST + GraphQL adapters. ADR-014: HTTP error mapping via filters.
@ApiTags('pokemons')
@Controller({
  path: 'pokemons',
  version: '1',
})
@UseFilters(PokemonHttpExceptionFilter)
export class PokemonController {
  constructor(
    private readonly createPokemonUseCase: CreatePokemonUseCase,
    private readonly getPokemonByIdUseCase: GetPokemonByIdUseCase,
    private readonly listPokemonsUseCase: ListPokemonsUseCase,
    private readonly updatePokemonUseCase: UpdatePokemonUseCase,
    private readonly deletePokemonUseCase: DeletePokemonUseCase,
    private readonly importPokemonByIdUseCase: ImportPokemonByIdUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Pokemon' })
  @ApiResponse({
    status: 201,
    description: 'The pokemon has been successfully created.',
    type: PokemonPresenter,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 409, description: 'Pokemon already exists.' })
  async create(@Body() body: CreatePokemonDto): Promise<PokemonPresenter> {
    const pokemon = await this.createPokemonUseCase.execute(body);
    return new PokemonPresenter(pokemon);
  }

  @Get()
  @ApiOperation({ summary: 'List pokemons with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Return list of pokemons.',
    type: PokemonListPresenter,
  })
  async list(
    @Query() query: ListPokemonsQueryDto,
  ): Promise<PokemonListPresenter> {
    const result = await this.listPokemonsUseCase.execute(query);
    return new PokemonListPresenter(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Pokemon by ID' })
  @ApiParam({ name: 'id', description: 'Pokemon ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the pokemon.',
    type: PokemonPresenter,
  })
  @ApiResponse({ status: 404, description: 'Pokemon not found.' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PokemonPresenter> {
    const pokemon = await this.getPokemonByIdUseCase.execute(id);
    return new PokemonPresenter(pokemon);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Pokemon' })
  @ApiParam({ name: 'id', description: 'Pokemon ID' })
  @ApiResponse({
    status: 200,
    description: 'The pokemon has been successfully updated.',
    type: PokemonPresenter,
  })
  @ApiResponse({ status: 404, description: 'Pokemon not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePokemonDto,
  ): Promise<PokemonPresenter> {
    const pokemon = await this.updatePokemonUseCase.execute({ id, ...body });
    return new PokemonPresenter(pokemon);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Pokemon' })
  @ApiParam({ name: 'id', description: 'Pokemon ID' })
  @ApiResponse({
    status: 204,
    description: 'The pokemon has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Pokemon not found.' })
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deletePokemonUseCase.execute(id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import a Pokemon from PokeAPI' })
  @ApiResponse({
    status: 200,
    description: 'The pokemon has been successfully imported.',
    type: PokemonPresenter,
  })
  @ApiResponse({
    status: 404,
    description: 'Pokemon not found in external API.',
  })
  @HttpCode(200)
  async import(@Body() body: ImportPokemonDto): Promise<PokemonPresenter> {
    const pokemon = await this.importPokemonByIdUseCase.execute(body);
    return new PokemonPresenter(pokemon);
  }
}
