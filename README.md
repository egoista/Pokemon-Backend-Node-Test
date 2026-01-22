# Project Readme (Interview Test)

This repository is a technical interview project that demonstrates Clean Architecture with
REST and GraphQL adapters, plus multiple ORM implementations behind a repository abstraction.

## Quick Start

```bash
npm install
npm run start:dev
```

## Tests

```bash
npm run test
```

### Manual Curl Tests

There is a shell script available to run some manual curl requests against the REST and GraphQL APIs.

```bash
./test/scripts/test-requests.sh
```

This script performs Create, List, Update, and Delete operations.


## Architecture Constitution (Summary)

These are the core, non-negotiable decisions for the project. Each item links to the ADR.

- Clean Architecture with inward dependencies. [ADR-002](docs/adrs/002-adopt-clean-architecture.md)
- Use cases are exposed via REST and GraphQL adapters. [ADR-003](docs/adrs/003-expose-use-cases-via-both-rest-and-graphql.md)
- Multiple ORMs supported behind a repository interface. [ADR-004](docs/adrs/004-support-multiple-orms-via-repository-abstractions.md)
- Manual composition root (explicit wiring). [ADR-006](docs/adrs/006-manual-composition-root.md)
- Domain identifier is the primary key. [ADR-012](docs/adrs/012-use-domain-identifier-as-pk.md)
- Error ownership and mapping via filters. [ADR-013](docs/adrs/013-error-ownership.md), [ADR-014](docs/adrs/014-http-error-using-filters.md)
- Tests cover units and adapters with Supertest. [ADR-015](docs/adrs/015-testing-strategy.md), [ADR-016](docs/adrs/016-use-supertest-for-controller-testing.md)

Full ADR index: [docs/adrs/index.md](docs/adrs/index.md)

## Folder Structure

- `src/domain`: entities and business rules (framework-agnostic).
- `src/application`: use cases and application-level policies.
- `src/infrastructure`: adapters (REST/GraphQL, persistence, presenters).
- `src/main`: composition root and feature wiring.
- `prisma`, `typeorm`: ORM schemas and migrations.
- `test`: integration/e2e tests and support utilities.
- `docs/adrs`: architecture decisions.

## Repository Implementation (Prisma or TypeORM)

The active repository is selected by environment variable.

```bash
export POKEMON_REPOSITORY=typeorm
```

Accepted values: `prisma` (default) or `typeorm`.

## Notes for Reviewers

- The project focuses on architectural clarity and testability over framework convenience.
- Comments are intentionally minimal and reference ADRs when decisions are non-obvious.
- Both REST and GraphQL share the same use cases.
- Rate Limiting is implemented using `@nestjs/throttler` as it provides a standard, robust, and easy-to-configure solution for IP-based rate limiting in NestJS applications.
