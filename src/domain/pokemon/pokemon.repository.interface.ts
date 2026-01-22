import { Pokemon } from './pokemon.entity';

export interface PokemonListFilters {
    type?: string;
    name?: string;
    sortBy: 'name' | 'id' | 'type' | 'created_at';
    sortOrder: 'asc' | 'desc';
    offset: number;
    limit: number;
}

export interface PokemonListResult {
    data: Pokemon[];
    totalCount: number;
}

/**
 * ARCH: Repository is a domain boundary; implementations live in infrastructure.
 * ADR-002: Clean Architecture. ADR-004: Multiple ORMs via repository abstraction.
 */
export interface PokemonRepository {
    findById(id: number): Promise<Pokemon | null>;
    findByName(name: string): Promise<Pokemon | null>;
    findAll(): Promise<Pokemon[]>;
    findWithFilters(filters: PokemonListFilters): Promise<PokemonListResult>;
    save(pokemon: Pokemon): Promise<Pokemon>;
    update(pokemon: Pokemon): Promise<Pokemon>;
    upsert(pokemon: Pokemon): Promise<Pokemon>;
    delete(id: number): Promise<void>;
}
