# Candidate Interview Project

## Project Overview

Welcome to the interview project! This project is designed to assess your skills in building a backend API using Node.

### Goals

- Understand your proficiency with Node.
- Assess your ability to design and implement a scalable API.
- Evaluate your coding practices and problem-solving approach.

## Installation

```bash
$ npm install
or
$ yarn
```

## (Optional) generate prisma files

```bash
$ npm run prisma generate
or
$ yarn prisma generate

```

## Running the app

```bash
$ npm run start:dev
or
$ yarn start:dev
```

## Test

```bash
$ npm run test # default suite (excludes e2e)
or
$ yarn test

# E2E suite (optional)
$ npm run test:e2e
or
$ yarn test:e2e
```

## Architecture Comments

Use short, standardized comments to document non-obvious architectural constraints.

- `ARCH:` for architecture rules and boundaries.
- `ADR-XXX:` to reference the decision record that justifies the rule.
- Keep comments focused on "why", not "what".

Place these comments at feature boundaries (controllers/resolvers, concrete repositories, presenters/mappers, modules/composition root, exception filters).

## Architecture Decision Records (ADR)

All ADRs live in `docs/adrs/index.md`. Key decisions to reference in code comments include:

- `ADR-002` Clean Architecture
- `ADR-003` REST + GraphQL adapters
- `ADR-004` Multiple ORMs via repository abstraction
- `ADR-006` Manual composition root
- `ADR-012` Domain identifier as primary key
- `ADR-013` Error ownership by layer
- `ADR-014` HTTP error mapping with filters
