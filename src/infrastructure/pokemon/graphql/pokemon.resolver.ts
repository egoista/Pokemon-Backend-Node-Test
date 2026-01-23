import { Resolver, Mutation, Query, Args, ResolveField } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { CreatePokemonUseCase } from '../../../application/pokemon/create-pokemon.use-case';
import { ListPokemonsUseCase } from '../../../application/pokemon/list-pokemons.use-case';
import { UpdatePokemonUseCase } from '../../../application/pokemon/update-pokemon.use-case';
import { DeletePokemonUseCase } from '../../../application/pokemon/delete-pokemon.use-case';
import { ImportPokemonByIdUseCase } from '../../../application/pokemon/import-pokemon-by-id.use-case';
import { PokemonAlreadyExistsError } from '../../../domain/pokemon/pokemon.errors';
import { PokemonPresenter } from '../presenters/pokemon.presenter';
import { PokemonListPresenter } from '../presenters/pokemon-list.presenter';
import { PokemonGraphQLExceptionFilter } from './pokemon-graphql-exception.filter';

interface PokemonFilterInput {
  type?: string;
  name?: string;
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

interface SortInput {
  sortBy?: string;
  sortOrder?: string;
}

interface CreatePokemonArgs {
  input: {
    id: number;
    name: string;
    types: string[];
  };
}

interface UpdatePokemonArgs {
  input: {
    id: number;
    name?: string;
    types?: string[];
  };
}

// ARCH: GraphQL adapter only; use cases remain transport-agnostic.
// ADR-002: Clean Architecture. ADR-003: REST + GraphQL adapters. ADR-009: No GraphQL versioning.
@Resolver('Pokemon')
@UseFilters(PokemonGraphQLExceptionFilter)
export class PokemonResolver {
  constructor(
    private readonly createPokemonUseCase: CreatePokemonUseCase,
    private readonly listPokemonsUseCase: ListPokemonsUseCase,
    private readonly updatePokemonUseCase: UpdatePokemonUseCase,
    private readonly deletePokemonUseCase: DeletePokemonUseCase,
    private readonly importPokemonByIdUseCase: ImportPokemonByIdUseCase,
  ) {}

  @Query('pokemons')
  async listPokemons(
    @Args('filter') filter?: PokemonFilterInput,
    @Args('pagination') pagination?: PaginationInput,
    @Args('sort') sort?: SortInput,
  ) {
    const result = await this.listPokemonsUseCase.execute({
      type: filter?.type,
      name: filter?.name,
      page: pagination?.page,
      limit: pagination?.limit,
      sortBy: sort?.sortBy,
      sortOrder: sort?.sortOrder,
    });
    return new PokemonListPresenter(result);
  }

  @Mutation('createPokemon')
  async create(@Args() args: CreatePokemonArgs) {
    try {
      const input = args.input;
      const pokemon = await this.createPokemonUseCase.execute({
        id: Number(input.id),
        name: input.name,
        types: input.types,
      });
      return new PokemonPresenter(pokemon);
    } catch (error) {
      // NOTE: Preserve GraphQL union contract by returning error type for conflicts.
      if (error instanceof PokemonAlreadyExistsError) {
        return {
          __typename: 'PokemonAlreadyExistsError',
          message: error.message,
        };
      }
      throw error;
    }
  }

  @Mutation('updatePokemon')
  async update(@Args() args: UpdatePokemonArgs) {
    const input = args.input;
    const pokemon = await this.updatePokemonUseCase.execute({
      id: Number(input.id),
      name: input.name,
      types: input.types,
    });
    return new PokemonPresenter(pokemon);
  }

  @Mutation('deletePokemon')
  async delete(@Args('id') id: number) {
    // NOTE: GraphQL IDs may arrive as strings; coerce for use case.
    await this.deletePokemonUseCase.execute(Number(id));
    return true;
  }

  @Mutation('importPokemon')
  async importPokemon(@Args('id') id: number) {
    const pokemon = await this.importPokemonByIdUseCase.execute({
      id: Number(id),
    });
    return new PokemonPresenter(pokemon);
  }
}

// ARCH: Map GraphQL union types without leaking domain errors.
// ADR-003: REST + GraphQL adapters. ADR-013: Error ownership.
@Resolver('CreatePokemonResult')
export class CreatePokemonResultResolver {
  @ResolveField()
  __resolveType(value) {
    if (value.id && value.name) {
      return 'Pokemon';
    }
    if (value.message) {
      return 'PokemonAlreadyExistsError';
    }
    return null;
  }
}
