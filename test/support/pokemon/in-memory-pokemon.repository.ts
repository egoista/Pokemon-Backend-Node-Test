import { PokemonListFilters, PokemonListResult, PokemonRepository } from '../../../src/domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../../src/domain/pokemon/pokemon.entity';

export class InMemoryPokemonRepository implements PokemonRepository {
    private pokemons: Pokemon[] = [];

    clear(): void {
        this.pokemons = [];
    }

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

    async findWithFilters(filters: PokemonListFilters): Promise<PokemonListResult> {
        let filtered = [...this.pokemons];

        if (filters.type) {
            filtered = filtered.filter((pokemon) =>
                pokemon.types.some((t) => t.name === filters.type)
            );
        }

        if (filters.name) {
            const name = filters.name.toLowerCase();
            filtered = filtered.filter((pokemon) => pokemon.name.toLowerCase().includes(name));
        }

        filtered.sort((a, b) => {
            let comparison = 0;
            switch (filters.sortBy) {
                case 'id':
                    comparison = a.id - b.id;
                    break;
                case 'type':
                    // Sort by first type name
                    const typeA = a.types[0]?.name || '';
                    const typeB = b.types[0]?.name || '';
                    comparison = typeA.localeCompare(typeB);
                    break;
                case 'created_at':
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
                case 'name':
                default:
                    comparison = a.name.localeCompare(b.name);
                    break;
            }
            return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        const totalCount = filtered.length;
        const data = filtered.slice(filters.offset, filters.offset + filters.limit);

        return { data, totalCount };
    }

    async update(pokemon: Pokemon): Promise<Pokemon> {
        const index = this.pokemons.findIndex((p) => p.id === pokemon.id);
        if (index !== -1) {
            this.pokemons[index] = pokemon;
        }
        return pokemon;
    }

    async upsert(pokemon: Pokemon): Promise<Pokemon> {
        const index = this.pokemons.findIndex((p) => p.id === pokemon.id);
        if (index !== -1) {
            this.pokemons[index] = pokemon;
        } else {
            this.pokemons.push(pokemon);
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
