# Use Case: Create Pokemon

## Description
Creates a new Pokemon entity in the system.

## Actors
- System User (via API)

## Input Data
- `id`: Integer (Required)
- `name`: String (Required)
- `types`: List<String> (Required)

## Output Data
- `Pokemon`: The created Pokemon entity.

## Business Rules
- `id` must be a positive integer.
- `name` must not be empty.
- `types` must not be empty.
- `name` must be unique across all Pokemons.
- `id` must be unique across all Pokemons.

## Errors
- `ValidationError`: when required input data is missing or invalid.
- `PokemonAlreadyExistsError`: when a Pokemon with the same name already exists.

## Flow
1. **Validate Input**  
   - Validate required fields (`id`, `name`, `types`).
2. **Check Uniqueness**  
   - Query the repository to verify if a Pokemon with the same name or ID already exists.
   - If it exists, throw `PokemonAlreadyExistsError`.
3. **Create Entity**  
   - Create a new Pokemon entity.
4. **Persist Entity**  
   - Save the entity using the repository.
5. **Return Result**  
   - Return the created `Pokemon` entity.
