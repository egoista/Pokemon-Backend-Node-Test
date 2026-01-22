import { Pokemon } from './pokemon.entity';

export interface PokemonRepository {
    findByName(name: string): Promise<Pokemon | null>;
    save(pokemon: Pokemon): Promise<Pokemon>;
}
