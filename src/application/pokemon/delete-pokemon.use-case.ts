import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';

export class DeletePokemonUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository
    ) { }

    async execute(id: number): Promise<void> {
        const pokemon = await this.pokemonRepository.findById(id);
        if (!pokemon) {
            throw new PokemonNotFoundError(id);
        }

        await this.pokemonRepository.delete(id);
    }
}
