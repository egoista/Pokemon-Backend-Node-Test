# ADR-003: Expose Use Cases via Both REST and GraphQL

**Status:** Accepted

**Context:**
Different consumers may benefit from different API styles. REST offers simplicity and cache-friendliness, while GraphQL provides flexible querying.

**Decision:**
Expose the same application use cases through both REST controllers and GraphQL resolvers, treating them as interchangeable delivery adapters.

**Consequences:**

* No duplication of business logic.
* Consistent behavior across APIs.
* Slight increase in adapter code.
