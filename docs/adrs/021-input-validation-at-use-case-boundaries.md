# ADR 021: Input Validation at Use Case Boundaries

## Status
Accepted

## Context
Use cases are currently invoked mostly through transport layers that validate inputs
(DTOs, pipes). This makes tests and future integrations risky if they call use cases
directly with invalid data.

## Decision
We will validate inputs at the use case boundary with basic checks (presence,
types, and simple invariants). Transport-layer validation remains, but it is
no longer the only guard.

## Consequences
- **Positive**:
  - Use cases are safer to call from tests, CLI, or future integrations.
  - Validation failures are explicit and consistent across entry points.
- **Negative**:
  - Slightly more code in use cases for validation.

## Notes
- Transport DTO validation stays in place for client-facing error reporting.
