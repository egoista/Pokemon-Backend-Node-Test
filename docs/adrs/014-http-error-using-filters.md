# ADR-014: HTTP Error Mapping Using Exception Filters

## Status
Accepted

## Context

REST controllers should remain thin adapters, responsible only for request/response mapping.  
Handling error translation inside controllers leads to duplicated `try/catch` blocks and reduces readability.

NestJS provides Exception Filters as a first-class mechanism for centralized exception handling.

## Decision

Use **NestJS Exception Filters** to translate domain and application errors into HTTP responses.

- Controllers must not contain `try/catch` blocks for business errors.
- Domain and use case layers throw their own errors.
- Exception Filters perform the mapping to HTTP exceptions.

The filter acts as the boundary between application errors and HTTP semantics.

## Consequences

- Controllers remain clean and focused.
- Error-to-HTTP mapping is centralized and reusable.
- New endpoints automatically benefit from consistent error handling.
- The same error catalog can be reused for GraphQL adapters with a different mapping strategy.
