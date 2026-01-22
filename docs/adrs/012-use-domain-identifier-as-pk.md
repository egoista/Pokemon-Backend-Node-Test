# ADR-012: Use Domain Identifier as Primary Key

## Status
Accepted

## Context

In the Pokemon domain, each Pokemon has a **conceptual identifier** defined by the business itself  
(e.g., Pokédex number: Bulbasaur = 1, Mewtwo = 150).

This identifier is:
- Unique by definition
- Immutable
- Known at creation time
- Stable over time
- Part of the domain language and meaning

Initially, the architecture considered using a separate technical identifier (auto-increment or UUID) for persistence. This introduced duplication between a *domain identifier* and a *persistence identifier*, increasing complexity without clear benefits.

## Decision

Use the **domain identifier (Pokédex number)** as the **primary key for persistence**.

The `id` field in the domain entity represents the **conceptual identity of the Pokemon**, not a technical database artifact.

No additional technical identifier will be introduced.

## Rationale

- The domain already provides a strong, meaningful identifier.
- Introducing a separate persistence ID would add unnecessary indirection.
- Clean Architecture allows the domain to define identity, with infrastructure adapting to it.
- This approach avoids invalid entity states (e.g., entities without IDs).
- It simplifies use cases, repositories, and API contracts.

## Consequences

### Positive
- Clear and expressive domain model
- No duplication of identity concepts
- Simpler entity lifecycle (no temporary IDs)
- APIs expose meaningful identifiers
- Repository implementations are straightforward

### Negative / Trade-offs
- The persistence layer becomes coupled to the domain identifier
- IDs are predictable and sequential
- Future domain changes (e.g., supporting custom Pokemons without Pokédex numbers) would require revisiting this decision

These trade-offs are acceptable given the current domain scope.

## Impact on Architecture

- **Domain Layer**
  - `Pokemon.id` represents the Pokédex number
  - ID is required at creation time
- **Application Layer**
  - Use cases operate directly with the domain identifier
- **Infrastructure Layer**
  - Database primary key maps directly to the domain ID
- **API Layer (REST / GraphQL)**
  - `id` exposed to clients is the domain identifier

## Example

```ts
const pokemon = new Pokemon(150, 'Mewtwo', 'Psychic');
await pokemonRepository.save(pokemon);
```

## Notes

If future requirements introduce Pokemons without a predefined conceptual identifier, this ADR must be revisited and an alternative identity strategy evaluated.