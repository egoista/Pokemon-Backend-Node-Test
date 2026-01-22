# 20. Adopt OpenAPI (Swagger)

Date: 2026-01-22

## Status

Accepted

## Context

The project exposes a REST API but lacks a standardized, interactive documentation.
Developers and reviewers have to rely on reading the code or executing manual curl scripts to understand the API capabilities.

## Decision

We will adopt **OpenAPI (Swagger)** to document the REST API.
We will use `@nestjs/swagger` to generate the documentation automatically from the code (Decorators + DTOs).

## Consequences

**Positive:**
- Interactive API documentation available at `/api/docs`.
- Easier onboarding for new developers and reviewers.
- Standardized documentation format (OpenAPI 3.0).

**Negative:**
- Need to maintain decorators in Controllers and DTOs.
- Slight increase in bundle size (mitigated by using `swagger-ui-express` only in dev environments if needed, though we keep it enabled for this demo).
