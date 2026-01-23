# ADR 021: Input Validation and Structured Logging

## Status
Accepted

## Context
Use cases are currently invoked mostly through transport layers that validate inputs
(DTOs, pipes). This makes tests and future integrations risky if they call use cases
directly with invalid data. Additionally, there is no structured logging for key
operations (create/update/import) or for failures when integrating with external
services, which makes production debugging harder.

## Decision
We will:

1. **Validate inputs at the use case boundary** with basic checks (presence,
   types, and simple invariants). Transport-layer validation remains, but it is
   no longer the only guard.
2. **Adopt structured logging** using a JSON logger (e.g., Pino via NestJS).
   Log key business events (create, update, import) and integration errors
   (PokeAPI failures) with consistent fields (use case, entity id, correlation
   id when available).

## Consequences
- **Positive**:
  - Use cases are safer to call from tests, CLI, or future integrations.
  - Validation failures are explicit and consistent across entry points.
  - Logs are machine-parsable and easier to search and aggregate.
- **Negative**:
  - Slightly more code in use cases for validation and logging.
  - Need to keep logging fields consistent across modules.

## Notes
- Transport DTO validation stays in place for client-facing error reporting.
- Logging should avoid sensitive data and focus on identifiers and outcomes.
