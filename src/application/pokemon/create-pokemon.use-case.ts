import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokemonAlreadyExistsError } from '../../domain/pokemon/pokemon.errors';
import { ValidationError } from '../shared/errors/application.errors';
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
        this.validateInput(input);
        const { id, name, types } = input;

        await this.checkUniqueness(id, name);

        const typeEntities = types.map(
            (typeName) => new Type(typeName, new Date())
        );

        const pokemon = new Pokemon(id, name, typeEntities);

        return this.pokemonRepository.save(pokemon);
    }

    private validateInput(input: CreatePokemonInput): void {
        if (!input) {
            throw new ValidationError('Input is required.');
        }
        if (typeof input.id !== 'number' || Number.isNaN(input.id)) {
            throw new ValidationError('id must be a number.');
        }
        if (typeof input.name !== 'string') {
            throw new ValidationError('name must be a string.');
        }
        if (!Array.isArray(input.types)) {
            throw new ValidationError('types must be an array.');
        }
        if (input.types.some((type) => typeof type !== 'string')) {
            throw new ValidationError('types must be an array of strings.');
        }
    }

    private async checkUniqueness(id: number, name: string): Promise<void> {
        // Check for duplicate name
        const existingPokemonByName = await this.pokemonRepository.findByName(name);
        if (existingPokemonByName) {
            throw new PokemonAlreadyExistsError(name);
        }

        // Check for duplicate ID to prevent database constraint violations
        const existingPokemonById = await this.pokemonRepository.findById(id);
        if (existingPokemonById) {
            throw new PokemonAlreadyExistsError(existingPokemonById.name);
        }
    }
}
