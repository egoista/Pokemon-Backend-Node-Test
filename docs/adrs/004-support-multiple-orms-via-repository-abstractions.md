# ADR-004: Support Multiple ORMs via Repository Abstractions

**Status:** Accepted

**Context:**
The project includes both Prisma and TypeORM configurations. Persistence technology should remain a detail of infrastructure.

**Decision:**
Define a single repository interface per aggregate in the domain layer, with separate infrastructure adapters for Prisma and TypeORM. The active implementation is selected in the composition root.

**Consequences:**

* ORM choice does not impact domain or use cases.
* Switching ORMs is possible with minimal changes.
* Requires careful mapping between entities and persistence models.
