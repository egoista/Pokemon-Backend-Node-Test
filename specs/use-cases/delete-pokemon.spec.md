# Use Case: Delete Pokemon

## Description
Removes a Pokemon from the system.

## Actors
- System User (via API)

## Input Data
- `id`: Integer (Required)

## Output Data
- `void`

## Errors
- `PokemonNotFoundError`: when no Pokemon exists with the given `id`.

## Flow
1. **Find Entity**  
   - Retrieve the Pokemon by `id` using the repository.
   - If not found, throw `PokemonNotFoundError`.
2. **Delete Entity**  
   - Remove the Pokemon using the repository.
3. **Finish Execution**  
   - Complete successfully without returning data.
