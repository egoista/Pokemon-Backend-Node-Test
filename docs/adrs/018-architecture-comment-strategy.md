# ADR-018: Architecture Comment Strategy

**Status:** Accepted

**Context:**
The codebase uses Clean Architecture with multiple adapters (REST, GraphQL, ORM implementations).
There is a need to preserve architectural intent without cluttering code, while still capturing
local trade-offs, security considerations, and actionable follow-ups when necessary.

**Decision:**
Adopt short, standardized architecture comments at boundary points only:

* `ARCH:` for architectural rules or constraints.
* `ADR-XXX:` to reference the decision that justifies the rule.
* `NOTE:` for non-obvious intent or local trade-offs.
* `SEC:` for security-sensitive behavior (e.g., error sanitization).
* `TODO:` only for real, actionable work with context.

Comments must be short, explain "why", and avoid restating code.

**Consequences:**

* Architectural intent is discoverable at boundaries without cluttering code.
* Security-sensitive behavior and local trade-offs are explicitly documented when needed.
* Decisions remain traceable through ADR references.
* Routine logic stays clean and readable.
