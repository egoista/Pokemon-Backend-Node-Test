# ADR-006: Manual Composition Root

**Status:** Accepted

**Context:**
Automatic dependency injection containers can obscure object creation and make architectural boundaries harder to reason about.

**Decision:**
Use a manually defined composition root to wire dependencies, select ORM implementations, and configure cross-cutting services.

**Consequences:**

* Dependency graph is explicit and easy to audit.
* Slightly more boilerplate code.
* Better control over application startup behavior.
