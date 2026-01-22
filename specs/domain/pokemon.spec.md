# Pokemon Domain Specification

## Entity: Pokemon

Represents a Pokemon in the system.

### Properties

| Name       | Type     | Description                          |
| :--------- | :------- | :----------------------------------- |
| id         | Integer  | Unique identifier (Auto-incremented) |
| name       | String   | Name of the Pokemon                  |
| type       | String   | Type of the Pokemon (e.g., Electric) |
| created_at | DateTime | Timestamp of creation                |

### Invariants
- `name` must not be empty.
- `name` must be unique across all Pokemons.
- `type` must not be empty.
