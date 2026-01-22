import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
    ExternalApiError,
    ExternalApiTimeoutError,
    PokemonNotFoundInExternalApiError,
} from '../../domain/pokemon/pokemon.errors';
import { PokeApiClient, PokeApiPokemonDto } from '../../application/pokemon/ports/poke-api.client.interface';

@Injectable()
export class PokeApiClientImpl implements PokeApiClient {
    private readonly baseUrl: string;
    private readonly timeout: number;

    constructor() {
        this.baseUrl = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';
        this.timeout = Number(process.env.POKEAPI_TIMEOUT) || 3000;
    }

    async getPokemonById(id: number): Promise<PokeApiPokemonDto> {
        try {
            const response = await axios.get<PokeApiPokemonDto>(`${this.baseUrl}/pokemon/${id}`, {
                timeout: this.timeout,
            });

            return {
                id: response.data.id,
                name: response.data.name,
                types: response.data.types,
            };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    throw new PokemonNotFoundInExternalApiError(id);
                }
                if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                    throw new ExternalApiTimeoutError();
                }
                throw new ExternalApiError(error.message);
            }
            throw new ExternalApiError('Unknown error occurred');
        }
    }
}
