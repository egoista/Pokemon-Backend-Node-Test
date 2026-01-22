import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokemonAlreadyExistsError, PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';
import { ValidationError } from '../shared/errors/application.errors';
import { Type } from '../../domain/type.entity';

export interface UpdatePokemonInput {
    id: number;
    name?: string;
    types?: string[];
}

export class UpdatePokemonUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository
    ) { }

    async execute(input: UpdatePokemonInput): Promise<Pokemon> {
        const { id, name, types } = input;

        if (name === undefined && types === undefined) {
            throw new ValidationError('At least one field (name or types) must be provided for update.');
        }

        const pokemon = await this.pokemonRepository.findById(id);
        if (!pokemon) {
            throw new PokemonNotFoundError(id);
        }

        if (name !== undefined && name !== pokemon.name) {
            const existingPokemon = await this.pokemonRepository.findByName(name);
            if (existingPokemon) {
                throw new PokemonAlreadyExistsError(name);
            }
        }

        if (name !== undefined) {
            pokemon.name = name;
        }
        if (types !== undefined) {
            pokemon.types = types.map(
                (typeName) => new Type(0, typeName, new Date())
            );
        }

        return this.pokemonRepository.update(pokemon);
    }
}
