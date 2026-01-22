import { ListPokemonsResult } from '../../../application/pokemon/list-pokemons.use-case';
import { PokemonPresenter } from './pokemon.presenter';

export class PokemonListPresenter {
    data: PokemonPresenter[];
    pagination: ListPokemonsResult['pagination'];

    constructor(result: ListPokemonsResult) {
        this.data = result.data.map((pokemon) => new PokemonPresenter(pokemon));
        this.pagination = result.pagination;
    }
}
