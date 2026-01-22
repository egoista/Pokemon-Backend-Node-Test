import { Resolver, Mutation, Args, ResolveField } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { CreatePokemonUseCase } from '../../application/pokemon/create-pokemon.use-case';
import { CreatePokemonInput } from '../../graphql.schema';
import { PokemonAlreadyExistsError } from '../../domain/pokemon/pokemon.errors';

@Resolver('Pokemon')
export class PokemonResolver {
    constructor(private readonly createPokemonUseCase: CreatePokemonUseCase) { }

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
