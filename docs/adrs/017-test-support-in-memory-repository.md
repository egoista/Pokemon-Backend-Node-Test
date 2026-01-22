# ADR-017: Test Support Folder for In-Memory Repositories

## Status
Accepted

## Context

The project uses Clean Architecture and separates domain/application logic from infrastructure concerns.  
For integration tests (REST and GraphQL), we need a **deterministic repository implementation** that:

- Implements the same `PokemonRepository` interface used in production
- Avoids coupling tests to a real database/ORM
- Keeps production infrastructure free from test-only code

Placing in-memory repositories under `src/infrastructure` can blur the boundary between production code and test utilities.

## Decision

Create a dedicated test support folder to host in-memory repository implementations:

```txt
test/
  support/
    pokemon/
      in-memory-pokemon.repository.ts
```

Integration tests will override the Nest provider for PokemonRepository to use this in-memory implementation.

## Consequences

### Positive

Clear separation between production infrastructure and test-only utilities

Integration tests remain fast, deterministic, and focused on adapter behavior (REST/GraphQL)

Repositories used in tests still respect the domain interface (no jest.fn-based mocks)

Encourages consistent test patterns across features

### Negative / Trade-offs

Requires maintaining a small amount of additional code for test support

Some behaviors (e.g., DB constraints, transactions) are not covered by these tests and would require separate DB integration tests if needed

### Notes

This decision aligns with the broader testing strategy:

Unit tests may use mocks/stubs for repositories

Integration tests use in-memory implementations to validate framework pipelines and API contracts

DB integration tests remain optional and separate when persistence behavior must be validated