import { PokeApiClientImpl } from './poke-api.client';
import { HttpClient } from '../common/http/http-client.interface';
import { CacheService } from '../../domain/adapters/cache.interface';
import { AppLogger } from '../../application/shared/logger/logger.interface';
import {
  PokemonNotFoundInExternalApiError,
  ExternalApiTimeoutError,
  ExternalApiClientError,
  ExternalApiRateLimitError,
  ExternalApiServerError,
  ExternalApiUnavailableError,
} from '../../domain/pokemon/pokemon.errors';

describe('PokeApiClientImpl', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let cacheService: jest.Mocked<CacheService>;
  let logger: jest.Mocked<AppLogger>;
  const originalEnv = process.env;

  const buildClient = () =>
    new PokeApiClientImpl(httpClient, cacheService, logger);

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      POKEAPI_RETRY_MAX_ATTEMPTS: '2',
      POKEAPI_RETRY_BASE_DELAY_MS: '0',
      POKEAPI_RETRY_MAX_DELAY_MS: '0',
      POKEAPI_CB_FAILURE_THRESHOLD: '2',
      POKEAPI_CB_OPEN_MS: '10000',
      POKEAPI_CACHE_ENABLED: 'true',
      POKEAPI_CACHE_TTL_MS: '60000',
    };

    httpClient = {
      get: jest.fn(),
    } as jest.Mocked<HttpClient>;

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      deletePattern: jest.fn(),
      clear: jest.fn(),
    } as jest.Mocked<CacheService>;

    logger = {
      info: jest.fn(),
      error: jest.fn(),
    } as jest.Mocked<AppLogger>;

    cacheService.get.mockResolvedValue(null);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should fetch and map pokemon data', async () => {
    const mockResponse = {
      status: 200,
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

    httpClient.get.mockResolvedValue(mockResponse);

    const client = buildClient();
    const result = await client.getPokemonById(25);

    expect(httpClient.get).toHaveBeenCalledWith('/pokemon/25');
    expect(result).toEqual({
      id: 25,
      name: 'pikachu',
      types: mockResponse.data.types,
    });
  });

  it('should return cached data and skip external call', async () => {
    const cached = {
      id: 1,
      name: 'bulbasaur',
      types: [],
    };

    cacheService.get.mockResolvedValue(cached);

    const client = buildClient();
    const result = await client.getPokemonById(1);

    expect(cacheService.get).toHaveBeenCalledWith('pokeapi:pokemon:id=1');
    expect(httpClient.get).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  it('should cache successful responses', async () => {
    const mockResponse = {
      status: 200,
      data: {
        id: 1,
        name: 'bulbasaur',
        types: [],
      },
    };

    httpClient.get.mockResolvedValue(mockResponse);

    const client = buildClient();
    await client.getPokemonById(1);

    expect(cacheService.set).toHaveBeenCalledWith(
      'pokeapi:pokemon:id=1',
      {
        id: 1,
        name: 'bulbasaur',
        types: [],
      },
      60000,
    );
  });

  it('should retry on 5xx and succeed', async () => {
    httpClient.get
      .mockRejectedValueOnce({
        response: { status: 500 },
        message: 'Internal Server Error',
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { id: 4, name: 'charmander', types: [] },
      });

    const client = buildClient();
    const result = await client.getPokemonById(4);

    expect(httpClient.get).toHaveBeenCalledTimes(2);
    expect(result.name).toBe('charmander');
  });

  it('should throw ExternalApiServerError after retries are exhausted', async () => {
    httpClient.get.mockRejectedValue({
      response: { status: 500 },
      message: 'Internal Server Error',
    });

    const client = buildClient();

    await expect(client.getPokemonById(1)).rejects.toThrow(
      ExternalApiServerError,
    );
    expect(httpClient.get).toHaveBeenCalledTimes(2);
  });

  it('should throw ExternalApiTimeoutError on timeout', async () => {
    httpClient.get.mockRejectedValue({
      code: 'ECONNABORTED',
      message: 'timeout of 3000ms exceeded',
    });

    const client = buildClient();

    await expect(client.getPokemonById(1)).rejects.toThrow(
      ExternalApiTimeoutError,
    );
    expect(httpClient.get).toHaveBeenCalledTimes(2);
  });

  it('should throw PokemonNotFoundInExternalApiError on 404 response', async () => {
    httpClient.get.mockRejectedValue({
      response: { status: 404 },
      message: 'Not Found',
    });

    const client = buildClient();

    await expect(client.getPokemonById(99999)).rejects.toThrow(
      PokemonNotFoundInExternalApiError,
    );
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should throw ExternalApiClientError on 4xx responses', async () => {
    httpClient.get.mockRejectedValue({
      response: { status: 400 },
      message: 'Bad Request',
    });

    const client = buildClient();

    await expect(client.getPokemonById(1)).rejects.toThrow(
      ExternalApiClientError,
    );
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should throw ExternalApiRateLimitError on 429 responses', async () => {
    httpClient.get.mockRejectedValue({
      response: { status: 429 },
      message: 'Too Many Requests',
    });

    const client = buildClient();

    await expect(client.getPokemonById(1)).rejects.toThrow(
      ExternalApiRateLimitError,
    );
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should open circuit after consecutive failures', async () => {
    process.env.POKEAPI_RETRY_MAX_ATTEMPTS = '1';
    process.env.POKEAPI_CB_FAILURE_THRESHOLD = '2';

    httpClient.get.mockRejectedValue({
      response: { status: 500 },
      message: 'Internal Server Error',
    });

    const client = buildClient();

    await expect(client.getPokemonById(1)).rejects.toThrow(
      ExternalApiServerError,
    );
    await expect(client.getPokemonById(1)).rejects.toThrow(
      ExternalApiServerError,
    );

    httpClient.get.mockClear();

    await expect(client.getPokemonById(1)).rejects.toThrow(
      ExternalApiUnavailableError,
    );
    expect(httpClient.get).not.toHaveBeenCalled();
  });
});
