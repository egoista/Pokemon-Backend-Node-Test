import { Pokemon } from './pokemon.entity';

export interface PokemonListFilters {
    type?: string;
    name?: string;
    sortBy: 'name';
    sortOrder: 'asc' | 'desc';
    offset: number;
    limit: number;
}

export interface PokemonListResult {
    data: Pokemon[];
    totalCount: number;
}

export interface PokemonRepository {
    findById(id: number): Promise<Pokemon | null>;
    findByName(name: string): Promise<Pokemon | null>;
    findAll(): Promise<Pokemon[]>;
    findWithFilters(filters: PokemonListFilters): Promise<PokemonListResult>;
    save(pokemon: Pokemon): Promise<Pokemon>;
    update(pokemon: Pokemon): Promise<Pokemon>;
    delete(id: number): Promise<void>;
}
