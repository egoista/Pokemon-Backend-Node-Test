import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';

export class ListPokemonsUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository
    ) { }

    async execute(): Promise<Pokemon[]> {
        return this.pokemonRepository.findAll();
    }
}
