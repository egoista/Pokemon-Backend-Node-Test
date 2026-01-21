# ADR-001: Use Node.js as the Runtime and NestJS as the Application Framework

**Status:** Accepted

**Context:**
The project requires a stable, widely adopted runtime with a mature ecosystem, as well as a framework that supports modularization, dependency injection, and scalability while remaining compatible with Clean Architecture principles.

**Decision:**
Adopt **Node.js** as the runtime environment and **NestJS** as the primary application framework. NestJS is used strictly as an infrastructure and delivery mechanism, leveraging its module system, adapters, and tooling without coupling domain or application layers to framework-specific concepts.

**Consequences:**

* Strong ecosystem and community support through Node.js.
* Improved structure and consistency for REST and GraphQL adapters via NestJS.
* Requires discipline to prevent framework-specific abstractions from leaking into the core layers.
