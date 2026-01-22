# Use Case: Import Pokemon By ID

## Description
Imports a Pokemon from the official PokeAPI (https://pokeapi.co) and adds or updates the record in the local database based on its ID.

## Actors
- System User (via API)

## Input Data
- `id`: Integer (Required) - The Pokemon ID from PokeAPI

## Output Data
- `Pokemon`: The imported/updated Pokemon entity

## Business Rules
- `id` must be a positive integer (greater than 0)
- If a Pokemon with the given ID already exists in the database, it should be updated (upsert operation)
- Only relevant Pokemon data should be stored (name, types) - not all PokeAPI fields
- External API calls must have a timeout (2-3 seconds)
- The operation should be idempotent (calling it multiple times with the same ID produces the same result)

## Errors
- `ValidationError`: when the ID is not a positive integer
- `ExternalApiError`: when PokeAPI is unreachable or times out (map to 502/504 HTTP status)
- `PokemonNotFoundInExternalApiError`: when PokeAPI returns 404 for the given ID (map to 404/422 HTTP status)
- `ExternalApiTimeoutError`: when the request to PokeAPI exceeds the timeout limit

## Architecture Layers

### Use Case Layer: `ImportPokemonByIdUseCase`
**Responsibility**: Orchestrates the import flow
- Validates input (positive integer)
- Calls `PokeApiClient` to fetch Pokemon data
- Maps external DTO to internal domain entity
- Calls `PokemonRepository.upsertById()` to persist
- Returns the persisted Pokemon

### Infrastructure Layer: `PokeApiClient`
**Responsibility**: HTTP communication with PokeAPI
- Makes HTTP GET request to `https://pokeapi.co/api/v2/pokemon/{id}`
- Implements timeout (2-3 seconds)
- Returns minimal DTO with only needed fields
- Throws appropriate errors for HTTP failures

**DTO Structure**:
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

### Repository Layer: `PokemonRepository.upsertById()`
**Responsibility**: Database persistence with upsert logic
- Uses unique constraint on `id` field
- Performs INSERT or UPDATE based on ID existence
- Returns the persisted Pokemon entity

## Flow

1. **Validate Input**
   - Validate that `id` is a positive integer
   - If invalid, throw `ValidationError`

2. **Fetch from PokeAPI**
   - Call `pokeApiClient.getPokemonById(id)`
   - Handle timeout (2-3s)
   - If timeout, throw `ExternalApiTimeoutError`
   - If PokeAPI returns 404, throw `PokemonNotFoundInExternalApiError`
   - If other HTTP error or network failure, throw `ExternalApiError`

3. **Map to Domain Entity**
   - Extract only needed fields: `id`, `name`, `types`
   - Map `types` array to internal Type entities
   - Create Pokemon domain entity

4. **Upsert to Database**
   - Call `repository.upsertById(id, pokemon)`
   - This will INSERT if ID doesn't exist, UPDATE if it does
   - Ensure unique constraint on `id` field

5. **Return Result**
   - Return the persisted `Pokemon` entity

## Error Handling Details

### PokeAPI 404 Response
- **Scenario**: User requests Pokemon ID that doesn't exist in PokeAPI
- **Error**: `PokemonNotFoundInExternalApiError`
- **HTTP Status**: 404 or 422
- **Message**: "Pokemon with ID {id} not found in PokeAPI"

### PokeAPI Timeout
- **Scenario**: PokeAPI doesn't respond within 2-3 seconds
- **Error**: `ExternalApiTimeoutError`
- **HTTP Status**: 504 Gateway Timeout
- **Message**: "Request to PokeAPI timed out. Please try again later."

### PokeAPI Other Errors
- **Scenario**: PokeAPI returns 5xx, network error, etc.
- **Error**: `ExternalApiError`
- **HTTP Status**: 502 Bad Gateway
- **Message**: "Failed to fetch Pokemon from PokeAPI. Please try again later."

### Invalid ID
- **Scenario**: User provides non-positive integer (0, -1, "abc", etc.)
- **Error**: `ValidationError`
- **HTTP Status**: 400 Bad Request
- **Message**: "Pokemon ID must be a positive integer"

## Example Usage

### Successful Import (New Pokemon)
```
Input: { id: 158 }
PokeAPI Response: { id: 158, name: "totodile", types: [...] }
Database: INSERT new record
Output: Pokemon { id: 158, name: "totodile", types: [...] }
```

### Successful Import (Existing Pokemon)
```
Input: { id: 158 }
Database: Pokemon with ID 158 already exists
PokeAPI Response: { id: 158, name: "totodile", types: [...] }
Database: UPDATE existing record
Output: Pokemon { id: 158, name: "totodile", types: [...] }
```

### Error Case - Not Found
```
Input: { id: 99999 }
PokeAPI Response: 404 Not Found
Error: PokemonNotFoundInExternalApiError
HTTP Status: 404
```

### Error Case - Timeout
```
Input: { id: 158 }
PokeAPI: No response after 3 seconds
Error: ExternalApiTimeoutError
HTTP Status: 504
```
