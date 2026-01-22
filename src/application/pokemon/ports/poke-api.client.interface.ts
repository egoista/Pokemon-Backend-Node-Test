export interface PokeApiPokemonDto {
    id: number;
    name: string;
    types: Array<{
        type: {
            name: string;
        };
    }>;
}

export interface PokeApiClient {
    getPokemonById(id: number): Promise<PokeApiPokemonDto>;
}
