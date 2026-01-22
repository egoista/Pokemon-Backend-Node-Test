# Infrastructure: PokeAPI Client

## Description
Implementation of the client to communicate with the official PokeAPI (https://pokeapi.co).

## Responsibilities
- Fetch Pokemon data by ID.
- Handle HTTP errors and timeouts.
- Transform external data into a minimal DTO.

## Configuration
- `POKEAPI_BASE_URL`: Base URL for the API (default: `https://pokeapi.co/api/v2`)
- `POKEAPI_TIMEOUT`: Request timeout in milliseconds (default: `3000`)

## Interfaces

### DTO
```typescript
interface PokeApiPokemonDto {
  id: number;
  name: string;
  types: Array<{
    type: {
      name: string;
    }
  }>;
}
```

### Methods
#### `getPokemonById(id: number): Promise<PokeApiPokemonDto>`

**Input:**
- `id`: number (Positive integer)

**Output:**
- `Promise<PokeApiPokemonDto>`

**Behavior:**
1. Make a GET request to `{POKEAPI_BASE_URL}/pokemon/{id}`.
2. Set timeout to `POKEAPI_TIMEOUT`.
3. If successful (200 OK):
   - Parse JSON response.
   - Extract `id`, `name`, and `types`.
   - Return `PokeApiPokemonDto`.
4. If 404 Not Found:
   - Throw `PokemonNotFoundInExternalApiError`.
5. If Timeout:
   - Throw `ExternalApiTimeoutError`.
6. If other error (5xx, network):
   - Throw `ExternalApiError`.

## Error Mapping

| Scenario | HTTP Status (PokeService) | Domain Error | Use Case Reaction |
| :--- | :--- | :--- | :--- |
| Success | 200 | - | Return DTO |
| Not Found | 404 | `PokemonNotFoundInExternalApiError` | Throw 404/422 |
| Timeout | - (Abort) | `ExternalApiTimeoutError` | Throw 504 |
| Server Error | 500, 502, 503 | `ExternalApiError` | Throw 502 |
| Bad Request | 400 | `ExternalApiError` | Throw 502 |

## Dependencies
- `axios` or native `fetch` (Use `axios` for easier timeout/interceptor handling if already in project, otherwise `fetch` is fine but `axios` is preferred for this level of control).
