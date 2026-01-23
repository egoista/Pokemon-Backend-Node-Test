# Pokemon Domain Specification

## Entity: Pokemon

Represents a Pokemon in the system.

### Properties

| Name       | Type     | Description                          |
| :--------- | :------- | :----------------------------------- |
| id         | Integer  | Unique identifier (Client-provided)  |
| name       | String   | Name of the Pokemon                  |
| types      | List<Type> | List of Pokemon types                |
| created_at | DateTime | Timestamp of creation                |

### Invariants
- `name` must not be empty.
- `name` must be unique across all Pokemons.
- `types` must not be empty (a Pokemon must have at least one type).
- `id` must be a positive integer.
- `id` must be unique across all Pokemons.
