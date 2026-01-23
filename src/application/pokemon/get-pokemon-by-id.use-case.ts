import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';
import { ValidationError } from '../shared/errors/application.errors';

export class GetPokemonByIdUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository
    ) { }

    async execute(id: number): Promise<Pokemon> {
        this.validateInput(id);
        const pokemon = await this.pokemonRepository.findById(id);

        if (!pokemon) {
            throw new PokemonNotFoundError(id);
        }

        return pokemon;
    }

    private validateInput(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new ValidationError('id must be a positive integer.');
        }
    }
}
