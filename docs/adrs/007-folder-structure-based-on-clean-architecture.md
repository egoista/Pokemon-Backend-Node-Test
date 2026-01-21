# ADR-007: Folder Structure Based on Clean Architecture

**Status:** Accepted

## Context

The project aims to enforce clear architectural boundaries while supporting a spec-first and AI-assisted development workflow.
Without a well-defined folder structure, responsibilities may become blurred and automated code generation can introduce unintended coupling between layers.

## Decision

Adopt a **layered folder structure aligned with Clean Architecture**, where each top-level directory represents a distinct architectural responsibility.

### Source Code Structure

```txt
src/
 ├─ domain/          # Core business rules and entities
 ├─ application/     # Use cases and application orchestration
 ├─ infrastructure/  # Frameworks, ORMs, external services, adapters
 ├─ main/            # Composition root and application bootstrap
 └─ shared/          # Cross-cutting utilities and abstractions
```

### Specifications Structure

Specifications are stored outside the source code to reinforce the spec-first approach:

```txt
specs/
 ├─ domain/
 ├─ use-cases/
 └─ api/
```

## Consequences

* Architectural boundaries become explicit and easier to reason about.
* REST and GraphQL adapters remain isolated from business logic.
* AI-assisted code generation can be safely guided by targeting specific layers.
* Developers must remain disciplined to avoid placing logic in the wrong layer.
