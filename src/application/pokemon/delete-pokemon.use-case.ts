import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';
import { ValidationError } from '../shared/errors/application.errors';
import { AppLogger, NullLogger } from '../shared/logger/logger.interface';

export class DeletePokemonUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository,
        private readonly logger: AppLogger = new NullLogger(),
    ) { }

    async execute(id: number): Promise<void> {
        this.validateInput(id);
        const pokemon = await this.pokemonRepository.findById(id);
        if (!pokemon) {
            throw new PokemonNotFoundError(id);
        }

        await this.pokemonRepository.delete(id);
        this.logger.info('pokemon.deleted', { pokemonId: id });
    }

    private validateInput(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new ValidationError('id must be a positive integer.');
        }
    }
}
