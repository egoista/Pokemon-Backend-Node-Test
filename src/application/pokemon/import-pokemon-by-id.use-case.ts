import { Inject, Injectable } from '@nestjs/common';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokeApiClient } from '../../infrastructure/pokemon/poke-api.client';
import { ValidationError } from '../shared/errors/application.errors';
import { Type } from '../../domain/type.entity';

export interface ImportPokemonInput {
    id: number;
}

@Injectable()
export class ImportPokemonByIdUseCase {
    constructor(
        // @Inject('PokemonRepository') // Assuming injection token is 'PokemonRepository' based on other use cases? 
        // Or maybe direct injection if token is same as interface name (unlikely in NestJS with interfaces)
        // I need to check how other use cases inject repository.
        private readonly pokemonRepository: PokemonRepository,
        private readonly pokeApiClient: PokeApiClient
    ) { }

    async execute(input: ImportPokemonInput): Promise<Pokemon> {
        const { id } = input;

        if (!Number.isInteger(id) || id <= 0) {
            throw new ValidationError('Pokemon ID must be a positive integer.');
        }

        // 1. Fetch from external API
        const pokeApiDto = await this.pokeApiClient.getPokemonById(id);

        // 2. Map to domain entities
        const types = pokeApiDto.types.map(
            (t) => new Type(0, t.type.name, new Date())
        );

        // We use the ID from PokeAPI
        const pokemon = new Pokemon(pokeApiDto.id, pokeApiDto.name, types);

        // 3. Upsert to repository
        return this.pokemonRepository.upsert(pokemon);
    }
}
