import { PokeApiClientImpl } from './poke-api.client';
import axios from 'axios';
import {
    PokemonNotFoundInExternalApiError,
    ExternalApiTimeoutError,
    ExternalApiError,
} from '../../domain/pokemon/pokemon.errors';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PokeApiClientImpl', () => {
    let client: PokeApiClientImpl;
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        client = new PokeApiClientImpl();
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    describe('getPokemonById', () => {
        it('should successfully fetch and return Pokemon data', async () => {
            const mockResponse = {
                data: {
                    id: 25,
                    name: 'pikachu',
                    types: [
                        {
                            slot: 1,
                            type: {
                                name: 'electric',
                                url: 'https://pokeapi.co/api/v2/type/13/',
                            },
                        },
                    ],
                },
            };

            mockedAxios.get.mockResolvedValue(mockResponse);

            const result = await client.getPokemonById(25);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://pokeapi.co/api/v2/pokemon/25',
                { timeout: 3000 }
            );
            expect(result).toEqual({
                id: 25,
                name: 'pikachu',
                types: mockResponse.data.types,
            });
        });

        it('should use configured base URL and timeout from environment variables', async () => {
            process.env.POKEAPI_BASE_URL = 'https://custom-api.com/v1';
            process.env.POKEAPI_TIMEOUT = '5000';

            const customClient = new PokeApiClientImpl();

            const mockResponse = {
                data: {
                    id: 1,
                    name: 'bulbasaur',
                    types: [],
                },
            };

            mockedAxios.get.mockResolvedValue(mockResponse);

            await customClient.getPokemonById(1);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://custom-api.com/v1/pokemon/1',
                { timeout: 5000 }
            );
        });

        it('should use default values when environment variables are not set', async () => {
            delete process.env.POKEAPI_BASE_URL;
            delete process.env.POKEAPI_TIMEOUT;

            const defaultClient = new PokeApiClientImpl();

            const mockResponse = {
                data: {
                    id: 1,
                    name: 'bulbasaur',
                    types: [],
                },
            };

            mockedAxios.get.mockResolvedValue(mockResponse);

            await defaultClient.getPokemonById(1);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://pokeapi.co/api/v2/pokemon/1',
                { timeout: 3000 }
            );
        });

        it('should throw PokemonNotFoundInExternalApiError on 404 response', async () => {
            const error: any = {
                isAxiosError: true,
                response: {
                    status: 404,
                },
                message: 'Request failed with status code 404',
            };

            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedAxios.get.mockRejectedValue(error);

            await expect(client.getPokemonById(99999)).rejects.toThrow(
                PokemonNotFoundInExternalApiError
            );
        });

        it('should throw ExternalApiTimeoutError on timeout (ECONNABORTED)', async () => {
            const error: any = {
                isAxiosError: true,
                code: 'ECONNABORTED',
                message: 'timeout of 3000ms exceeded',
            };

            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedAxios.get.mockRejectedValue(error);

            await expect(client.getPokemonById(1)).rejects.toThrow(ExternalApiTimeoutError);
        });

        it('should throw ExternalApiTimeoutError when message contains "timeout"', async () => {
            const error: any = {
                isAxiosError: true,
                message: 'timeout of 3000ms exceeded',
            };

            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedAxios.get.mockRejectedValue(error);

            await expect(client.getPokemonById(1)).rejects.toThrow(ExternalApiTimeoutError);
        });

        it('should throw ExternalApiError on other axios errors', async () => {
            const error: any = {
                isAxiosError: true,
                message: 'Network Error',
            };

            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedAxios.get.mockRejectedValue(error);

            await expect(client.getPokemonById(1)).rejects.toThrow(ExternalApiError);
            await expect(client.getPokemonById(1)).rejects.toThrow('Network Error');
        });

        it('should throw ExternalApiError on unknown errors', async () => {
            const error = new Error('Something unexpected happened');

            mockedAxios.isAxiosError.mockReturnValue(false);
            mockedAxios.get.mockRejectedValue(error);

            await expect(client.getPokemonById(1)).rejects.toThrow(ExternalApiError);
            await expect(client.getPokemonById(1)).rejects.toThrow('Unknown error occurred');
        });

        it('should throw ExternalApiError on 500 response', async () => {
            const error: any = {
                isAxiosError: true,
                response: {
                    status: 500,
                },
                message: 'Internal Server Error',
            };

            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedAxios.get.mockRejectedValue(error);

            await expect(client.getPokemonById(1)).rejects.toThrow(ExternalApiError);
        });
    });
});
