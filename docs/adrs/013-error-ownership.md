# ADR-013: Error Ownership and Layering

## Status
Accepted

## Context

The project follows Clean Architecture principles, separating domain logic, application orchestration, and delivery mechanisms (REST / GraphQL).  
Errors must reflect this separation to avoid leaking protocol or infrastructure concerns into the core of the system.

Without clear ownership, errors tend to mix HTTP concepts, business rules, and validation logic across layers.

## Decision

Errors are categorized and owned by specific layers:

### Domain Errors
- Represent violations of domain invariants.
- Thrown by entities or value objects.
- Do not reference HTTP, GraphQL, or infrastructure concepts.

Examples:
- `InvalidPokemonIdError`
- `InvalidPokemonNameError`
- `InvalidPokemonTypeError`

### Application (Use Case) Errors
- Represent violations of business rules that require orchestration or external state.
- Thrown by use cases.
- Still independent of delivery mechanisms.

Examples:
- `PokemonAlreadyExistsError`
- `PokemonNotFoundError`

### Delivery Errors (HTTP / GraphQL)
- Represent protocol-specific responses.
- Never thrown from domain or use cases.
- Created only by adapters (controllers, resolvers, filters).

Examples:
- `400 Bad Request`
- `404 Not Found`
- `409 Conflict`

## Consequences

- Clear separation of responsibilities.
- Domain and application layers remain framework-agnostic.
- Error handling logic becomes predictable and testable.
- Adapters are responsible for translating errors into protocol-specific responses.
