# ADR-009: No Versioning Strategy for GraphQL API

**Status:** Accepted

**Context:**
GraphQL APIs are designed to evolve without breaking existing clients by adding fields and types while preserving backward compatibility. Traditional versioning approaches used in REST do not align well with GraphQL principles.

**Decision:**
Do **not version the GraphQL API**. Instead, evolve the schema in a backward-compatible manner, deprecating fields and types using GraphQL's built-in deprecation mechanisms when necessary.

**Consequences:**

* Clients can progressively adopt new fields without migrating versions.
* Schema evolution remains explicit and self-documented.
* Requires discipline to avoid breaking changes in existing fields.
