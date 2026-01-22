# ADR-015: Testing Strategy – Unit vs Integration

## Status
Accepted

## Context

The project emphasizes correctness of business rules and stability of API contracts.  
Different types of tests serve different purposes, and mixing responsibilities reduces test clarity and maintainability.

A clear testing strategy is required to define what is validated at each level.

## Decision

Adopt a layered testing strategy aligned with the architecture.

### Unit Tests

**Purpose:** Validate business rules and invariants.

**Scope:**
- Domain entities
- Value objects
- Use cases

**Characteristics:**
- No HTTP
- No framework
- Repositories are mocked or replaced with in-memory implementations
- Errors are asserted as domain/application errors

Examples:
- Entity invariant validation
- Use case uniqueness rules
- Error throwing behavior

---

### Integration Tests

**Purpose:** Validate adapter behavior and contracts.

**Scope:**
- REST controllers
- GraphQL resolvers
- Exception filters
- Serialization and response formats

**Characteristics:**
- Real HTTP requests
- Real NestJS pipeline
- Real error-to-response mapping
- Focus on status codes and payloads, not business logic

Examples:
- `POST /pokemons` returns `201` on success
- `POST /pokemons` returns `409` on conflict
- `DELETE /pokemons/:id` returns `404` when not found

## Consequences

- Business rules are tested once, in isolation.
- API contracts are validated independently of internal logic.
- Tests are faster, clearer, and easier to maintain.
- Architectural boundaries are enforced by the test suite itself.
