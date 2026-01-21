# ADR-005: Handle Rate Limiting as a Cross-Cutting Concern

**Status:** Accepted

**Context:**
Rate limiting must apply consistently to both REST and GraphQL APIs without polluting business logic.

**Decision:**
Implement rate limiting as an infrastructure-level component applied at the API boundary, shared between REST middleware and GraphQL plugins.

**Consequences:**

* Rate limiting is protocol-agnostic.
* Domain and use cases remain pure.
* Infrastructure layer becomes the single place for operational policies.
