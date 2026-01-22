import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
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

        const existingPokemon = await this.pokemonRepository.findByName(name);
        if (existingPokemon) {
            throw new PokemonAlreadyExistsError(name);
        }

        const pokemon = new Pokemon(id, name, type);

        return this.pokemonRepository.save(pokemon);
    }
}
