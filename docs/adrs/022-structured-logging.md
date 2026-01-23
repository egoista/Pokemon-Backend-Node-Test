# ADR 022: Structured Logging for Key Operations

## Status
Accepted

## Context
There is no structured logging for key operations (create/update/import) or for
failures when integrating with external services. This makes production debugging
and auditing harder and limits log search/aggregation.

## Decision
We will adopt structured logging using a JSON logger (e.g., Pino via NestJS).
Log key business events (create, update, import, delete, list, fetch) and
integration errors (PokeAPI failures) with consistent fields (use case, entity
id, correlation id when available).

## Consequences
- **Positive**:
  - Logs are machine-parsable and easier to search and aggregate.
  - Operational visibility improves for core workflows and failures.
- **Negative**:
  - Slightly more code in use cases for logging.
  - Need to keep logging fields consistent across modules.

## Notes
- Logging should avoid sensitive data and focus on identifiers and outcomes.
