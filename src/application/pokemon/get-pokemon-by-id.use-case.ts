import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';

export class GetPokemonByIdUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository
    ) { }

    async execute(id: number): Promise<Pokemon> {
        const pokemon = await this.pokemonRepository.findById(id);

        if (!pokemon) {
            throw new PokemonNotFoundError(id);
        }

        return pokemon;
    }
}
