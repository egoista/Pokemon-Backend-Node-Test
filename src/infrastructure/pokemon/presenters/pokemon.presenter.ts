import { Pokemon } from '../../../domain/pokemon/pokemon.entity';

// ARCH: Presentation mapper for transport responses.
// ADR-002: Clean Architecture.
export class PokemonPresenter {
    id: number;
    name: string;
    type: string;
    created_at: string;

    constructor(pokemon: Pokemon) {
        this.id = pokemon.id;
        this.name = pokemon.name;
        this.type = pokemon.type;
        this.created_at = pokemon.createdAt.toISOString();
    }
}
