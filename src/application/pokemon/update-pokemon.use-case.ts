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
        this.validateInput(input);
        const { id, name, types } = input;

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
                (typeName) => new Type(typeName, new Date())
            );
        }

        return this.pokemonRepository.update(pokemon);
    }

    private validateInput(input: UpdatePokemonInput): void {
        if (!input) {
            throw new ValidationError('Input is required.');
        }
        if (typeof input.id !== 'number' || Number.isNaN(input.id)) {
            throw new ValidationError('id must be a number.');
        }
        if (input.name !== undefined && typeof input.name !== 'string') {
            throw new ValidationError('name must be a string.');
        }
        if (input.types !== undefined && !Array.isArray(input.types)) {
            throw new ValidationError('types must be an array.');
        }
        if (input.types?.some((type) => typeof type !== 'string')) {
            throw new ValidationError('types must be an array of strings.');
        }
        if (input.name === undefined && input.types === undefined) {
            throw new ValidationError('At least one field (name or types) must be provided for update.');
        }
    }
}
