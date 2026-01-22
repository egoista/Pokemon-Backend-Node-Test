import { Pokemon } from './pokemon.entity';

export interface PokemonRepository {
    findById(id: number): Promise<Pokemon | null>;
    findByName(name: string): Promise<Pokemon | null>;
    findAll(): Promise<Pokemon[]>;
    save(pokemon: Pokemon): Promise<Pokemon>;
    update(pokemon: Pokemon): Promise<Pokemon>;
    delete(id: number): Promise<void>;
}
