import { Resolver, Mutation, Query, Args, ResolveField } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { CreatePokemonUseCase } from '../../../application/pokemon/create-pokemon.use-case';
import { ListPokemonsUseCase } from '../../../application/pokemon/list-pokemons.use-case';
import { UpdatePokemonUseCase } from '../../../application/pokemon/update-pokemon.use-case';
import { DeletePokemonUseCase } from '../../../application/pokemon/delete-pokemon.use-case';
import { CreatePokemonInput, UpdatePokemonInput } from '../../graphql/generated/graphql.schema';
import { PokemonAlreadyExistsError, PokemonNotFoundError } from '../../../domain/pokemon/pokemon.errors';

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

@Resolver('Pokemon')
export class PokemonResolver {
    constructor(
        private readonly createPokemonUseCase: CreatePokemonUseCase,
        private readonly listPokemonsUseCase: ListPokemonsUseCase,
        private readonly updatePokemonUseCase: UpdatePokemonUseCase,
        private readonly deletePokemonUseCase: DeletePokemonUseCase,
    ) { }

    @Query('pokemons')
    async listPokemons(
        @Args('filter') filter?: PokemonFilterInput,
        @Args('pagination') pagination?: PaginationInput,
        @Args('sort') sort?: SortInput,
    ) {
        return this.listPokemonsUseCase.execute({
            type: filter?.type,
            name: filter?.name,
            page: pagination?.page,
            limit: pagination?.limit,
            sortBy: sort?.sortBy,
            sortOrder: sort?.sortOrder,
        });
    }

    @Mutation('createPokemon')
    async create(@Args('input') input: CreatePokemonInput) {
        try {
            const pokemon = await this.createPokemonUseCase.execute(input);
            return pokemon;
        } catch (error) {
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
    async update(@Args('input') input: UpdatePokemonInput) {
        try {
            const pokemon = await this.updatePokemonUseCase.execute(input);
            return pokemon;
        } catch (error) {
            if (error instanceof PokemonNotFoundError) {
                throw error;
            }
            if (error instanceof PokemonAlreadyExistsError) {
                throw error;
            }
            throw error;
        }
    }

    @Mutation('deletePokemon')
    async delete(@Args('id') id: number) {
        try {
            await this.deletePokemonUseCase.execute(id);
            return true;
        } catch (error) {
            if (error instanceof PokemonNotFoundError) {
                throw error;
            }
            throw error;
        }
    }
}

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

@Resolver('Pokemon')
export class PokemonFieldResolver {
    @ResolveField('created_at')
    createdAt(pokemon) {
        return pokemon.createdAt;
    }
}
