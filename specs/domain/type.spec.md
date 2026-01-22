# Pokemon Type Domain Specification

## Entity: Type

Represents a Pokemon elemental type (e.g., Electric, Water, Fire).

### Properties

| Name       | Type     | Description                          |
| :--------- | :------- | :----------------------------------- |
| id         | Integer  | Unique identifier (Auto-incremented) |
| name       | String   | Name of the Type (unique)            |
| created_at | DateTime | Timestamp of creation                |

### Invariants
- `name` must not be empty.
- `name` must be unique across all Types.
