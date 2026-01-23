# Use Case: Update Pokemon

## Description
Updates the details of an existing Pokemon.

## Actors
- System User (via API)

## Input Data
- `id`: Integer (Required)
- `name`: String (Optional)
- `types`: List<String> (Optional)

## Output Data
- `Pokemon`: The updated Pokemon entity.

## Business Rules
- At least one field (`name` or `types`) must be provided.
- `id` must be a positive integer.
- If provided, `name` must not be empty.
- If provided, `types` must not be empty.
- `name` must be unique across all Pokemons.

## Errors
- `ValidationError`: when input data is invalid or no fields are provided.
- `PokemonNotFoundError`: when no Pokemon exists with the given `id`.
- `PokemonAlreadyExistsError`: when another Pokemon already uses the given `name`.

## Flow
1. **Validate Input**  
   - Ensure at least one updatable field is provided.
2. **Find Entity**  
   - Retrieve the Pokemon by `id` using the repository.
   - If not found, throw `PokemonNotFoundError`.
3. **Check Uniqueness**  
   - If `name` is provided and differs from the current value:
     - Verify no other Pokemon exists with the same name.
     - If it exists, throw `PokemonAlreadyExistsError`.
4. **Update Entity**  
   - Apply valid changes to the Pokemon entity.
   - If `types` is provided, replace all types.
5. **Persist Entity**  
   - Save the updated Pokemon using the repository.
6. **Return Result**  
   - Return the updated Pokemon entity.
