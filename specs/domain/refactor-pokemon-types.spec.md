# Domain Spec: Many-to-Many Pokemon Types Refactor

## Description
This domain specification defines the structural changes required to convert the Pokemon `type` field into a many-to-many relationship with a new `types` table.
This change in the domain model enforces updates across the application layers, specifically requiring changes to the following Use Cases.

## Impacted Use Cases

### 1. Create Pokemon
**Changes:**
- **Input:**
  - `type` (String) is replaced by `types` (List of Strings).
  - Validation: Ensure `types` list is not empty.
- **Flow:**
  - Instead of saving a single string, resolve/create `Type` entities for each string in the input list and associate them with the new Pokemon.

### 2. Update Pokemon
**Changes:**
- **Input:**
  - `type` (String) is replaced by `types` (List of Strings).
  - Optional update: If provided, `types` list must not be empty.
- **Flow:**
  - If `types` is provided, update the associations. Remove old associations and add new ones (or sync).

### 3. List Pokemons with Filters
**Changes:**
- **Input:**
  - `type` filter stays as a String, but semantically changes to "contains one of". A Pokemon matches if it has *at least one* of its types matching the filter value.
- **Flow:**
  - Query should join the `types` table and filter where `types.name` matches the input.

## Data Model Changes (Summary)
- **New Entity:** `Type` (id, name, created_at)
- **Pokemon Entity:** `type` (string) -> `types` (List<Type>)

## API Changes (Summary)
- **REST:**
  - `POST /pokemons`: Input `types: string[]`
  - `PATCH /pokemons/{id}`: Input `types: string[]`
  - `GET /pokemons`: Response includes `types` array.
- **GraphQL:**
  - Types `Type` and `Pokemon` changes.
  - Inputs `CreatePokemonInput`, `UpdatePokemonInput` take `[String!]`.
