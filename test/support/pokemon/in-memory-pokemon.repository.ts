import { PokemonRepository } from '../../../src/domain/pokemon/pokemon.repository.interface';
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

    async findById(id: number): Promise<Pokemon | null> {
        const found = this.pokemons.find((p) => p.id === id);
        return found || null;
    }

    async findAll(): Promise<Pokemon[]> {
        return [...this.pokemons];
    }

    async update(pokemon: Pokemon): Promise<Pokemon> {
        const index = this.pokemons.findIndex((p) => p.id === pokemon.id);
        if (index !== -1) {
            this.pokemons[index] = pokemon;
        }
        return pokemon;
    }

    async delete(id: number): Promise<void> {
        const index = this.pokemons.findIndex((p) => p.id === id);
        if (index !== -1) {
            this.pokemons.splice(index, 1);
        }
    }
}
