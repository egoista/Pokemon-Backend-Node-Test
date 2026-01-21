# ADR-002: Adopt Clean Architecture

**Status:** Accepted

**Context:**
The project must support both REST and GraphQL APIs, remain testable, and allow infrastructure details (frameworks, ORMs, external APIs) to change without impacting business rules.

**Decision:**
Adopt **Clean Architecture**, separating the system into Domain, Application, Infrastructure, and Delivery layers, with dependency direction pointing inward.

**Consequences:**

* Business rules are isolated and framework-agnostic.
* REST and GraphQL share the same use cases.
* Initial setup is more verbose, but long-term maintainability and testability are improved.
