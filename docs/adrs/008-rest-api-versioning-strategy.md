# ADR-008: REST API Versioning Strategy

**Status:** Accepted

**Context:**
The REST API may evolve over time while maintaining backward compatibility for existing consumers. Changes to request or response contracts must not break existing integrations.

**Decision:**
Adopt **URI-based versioning** for the REST API (e.g. `/api/v1/pokemons`). Each major version represents a stable contract and maps to the same underlying application use cases whenever possible.

**Consequences:**

* Clear and explicit versioning for API consumers.
* Multiple REST versions can coexist if needed.
* Slight duplication at the routing/controller level, while business logic remains shared.
