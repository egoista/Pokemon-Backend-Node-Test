import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository';
import { PokemonAlreadyExistsError } from '../../domain/pokemon/pokemon.errors';

export interface CreatePokemonInput {
    id: number;
    name: string;
    type: string;
}

export class CreatePokemonUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository
    ) { }

    async execute(input: CreatePokemonInput): Promise<Pokemon> {
        const { id, name, type } = input;

        // 1. Check uniqueness (business rule)
        const existingPokemon = await this.pokemonRepository.findByName(name);
        if (existingPokemon) {
            throw new PokemonAlreadyExistsError(name);
        }

        // 2. Create entity (entity validates invariants)
        const pokemon = new Pokemon(id, name, type);

        // 3. Persist
        return this.pokemonRepository.save(pokemon);
    }
}
