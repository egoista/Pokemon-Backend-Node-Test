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


## Project Context: A Story in Commits

This project was built with a specific intention: **to tell a story through its commit history and Pull Requests**. 

Rather than just seeing the final state of the code, the history reflects the decision-making process, architectural evolution, and feature implementation steps. Each Pull Request represents a distinct unit of work, often corresponding to specific Architecture Decision Records (ADRs) or feature requirements. Reviewers are encouraged to look at the commit history and PRs to understand the *why* and *how* of the implementation.

## Architecture Constitution (Summary)

These are the core, non-negotiable decisions for the project. Each item links to the ADR.

- **Runtime & Framework**: Node.js and NestJS. [ADR-001](docs/adrs/001-use-node-js-as-the-runtime-and-nestjs-as-the-application-framework.md)
- **Clean Architecture**: Inward dependency rule. [ADR-002](docs/adrs/002-adopt-clean-architecture.md)
- **Adapters**: Use cases exposed via REST (versioned) and GraphQL. [ADR-003](docs/adrs/003-expose-use-cases-via-both-rest-and-graphql.md), [ADR-008](docs/adrs/008-rest-api-versioning-strategy.md), [ADR-009](docs/adrs/009-no-versioning-strategy-for-graphql-api.md)
- **Persistence**: Repository pattern supporting multiple ORMs (Prisma, TypeORM). [ADR-004](docs/adrs/004-support-multiple-orms-via-repository-abstractions.md)
- **Wiring**: Manual composition root for explicit dependency management. [ADR-006](docs/adrs/006-manual-composition-root.md)
- **Workflow**: Feature branches and Semantic Commits. [ADR-010](docs/adrs/010-commit-message-convention.md), [ADR-011](docs/adrs/011-feature-branch-strategy.md)
- **Domain Identity**: System-defined IDs as primary keys. [ADR-012](docs/adrs/012-use-domain-identifier-as-pk.md)
- **Error Handling**: Domain errors mapped to HTTP/GraphQL errors via filters. [ADR-013](docs/adrs/013-error-ownership.md), [ADR-014](docs/adrs/014-http-error-using-filters.md)
- **Testing**: Supertest for integration and unit testing layers. [ADR-015](docs/adrs/015-testing-strategy.md), [ADR-016](docs/adrs/016-use-supertest-for-controller-testing.md)

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
