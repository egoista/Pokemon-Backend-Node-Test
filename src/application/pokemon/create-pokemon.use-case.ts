import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokemonAlreadyExistsError } from '../../domain/pokemon/pokemon.errors';
import { Type } from '../../domain/type.entity';

export interface CreatePokemonInput {
    id: number;
    name: string;
    types: string[];
}

export class CreatePokemonUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository
    ) { }

    async execute(input: CreatePokemonInput): Promise<Pokemon> {
        const { id, name, types } = input;

        const existingPokemon = await this.pokemonRepository.findByName(name);
        if (existingPokemon) {
            throw new PokemonAlreadyExistsError(name);
        }

        const typeEntities = types.map(
            (typeName) => new Type(0, typeName, new Date())
        );

        const pokemon = new Pokemon(id, name, typeEntities);

        return this.pokemonRepository.save(pokemon);
    }
}
