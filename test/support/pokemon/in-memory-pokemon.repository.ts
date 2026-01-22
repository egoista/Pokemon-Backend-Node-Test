import { PokemonRepository } from '../../../src/domain/pokemon/pokemon.repository';
import { Pokemon } from '../../../src/domain/pokemon/pokemon.entity';

export class InMemoryPokemonRepository implements PokemonRepository {
    private pokemons: Pokemon[] = [];

    async findByName(name: string): Promise<Pokemon | null> {
        const found = this.pokemons.find((p) => p.name === name);
        return found || null;
    }

    async save(pokemon: Pokemon): Promise<Pokemon> {
        this.pokemons.push(pokemon);
        return pokemon;
    }
}
