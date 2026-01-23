import { Type } from '../../../domain/type.entity';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';

// ARCH: Presentation mapper for Pokemon responses.
// ADR-002: Clean Architecture.
export class PokemonPresenter {
    id: number;
    name: string;
    types: Type[];
    created_at: string;

    constructor(pokemon: Pokemon) {
        this.id = pokemon.id;
        this.name = pokemon.name;
        this.types = pokemon.types;
        this.created_at = pokemon.createdAt.toISOString();
    }
}
