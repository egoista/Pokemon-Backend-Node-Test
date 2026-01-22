import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokeApiClient } from './ports/poke-api.client.interface';
import { ValidationError } from '../shared/errors/application.errors';
import { Type } from '../../domain/type.entity';

export interface ImportPokemonInput {
    id: number;
}

export class ImportPokemonByIdUseCase {
    constructor(
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
