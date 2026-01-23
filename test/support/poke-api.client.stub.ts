import {
  PokeApiClient,
  PokeApiPokemonDto,
} from '../../src/application/pokemon/ports/poke-api.client.interface';

export class PokeApiClientStub implements PokeApiClient {
  async getPokemonById(id: number): Promise<PokeApiPokemonDto> {
    return {
      id,
      name: `pokemon-${id}`,
      types: [{ type: { name: 'stub' } }],
    };
  }
}
