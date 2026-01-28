# Project Readme (Interview Test)

This repository is a technical interview project that demonstrates Clean Architecture with REST and GraphQL adapters, plus multiple ORM implementations behind a repository abstraction.

## Quick Start

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```
Ensure you have the database ready (sqlite default for this test).

### 2. Install & Run

```bash
npm install
npm run start:dev
```

### 3. Tests

```bash
npm run test        # Default suite (excludes e2e)
npm run test:e2e    # E2E tests
```

---

## Technical Features & Configuration

### Environment Variables

| Variable | Description | Default |
| -------- | ----- | ----------- |
| `POKEMON_REPOSITORY` | `prisma` or `typeorm` | `prisma` |
| `POKEAPI_BASE_URL` | External API URL | `https://pokeapi.co/api/v2` |
| `POKEAPI_TIMEOUT` | External API timeout (ms) | `3000` |
| `POKEAPI_ACCEPT` | External API Accept header | `application/json` |
| `POKEAPI_USER_AGENT` | External API User-Agent | `Backend-Node-Test/1.0` |
| `POKEAPI_RETRY_MAX_ATTEMPTS` | Max retry attempts | `2` |
| `POKEAPI_RETRY_BASE_DELAY_MS` | Retry base backoff (ms) | `200` |
| `POKEAPI_RETRY_MAX_DELAY_MS` | Retry max backoff (ms) | `1000` |
| `POKEAPI_CB_FAILURE_THRESHOLD` | Circuit breaker failure threshold | `3` |
| `POKEAPI_CB_OPEN_MS` | Circuit breaker open time (ms) | `10000` |
| `POKEAPI_CACHE_ENABLED` | Cache external API responses | `true` |
| `POKEAPI_CACHE_TTL_MS` | External API cache TTL (ms) | `30000` |
| `CACHE_TTL` | Cache time-to-live (ms) | `60000` |
| `CACHE_MAX_ITEMS` | Cache max items | `500` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `60000` |

### Switching ORMs

The project supports both Prisma and TypeORM, selectable at runtime:

```bash
# Use Prisma (Default)
export POKEMON_REPOSITORY=prisma
npm run start:dev

# Use TypeORM
export POKEMON_REPOSITORY=typeorm
npm run db:typeorm:migrate # Ensure migrations
npm run start:dev
```

### Endpoints

**REST API** (Versioning via URI `v1`)
- `GET /api/v1/pokemons` - List with pagination/filters
- `GET /api/v1/pokemons/:id` - Get detail
- `POST /api/v1/pokemons` - Create
- `POST /api/v1/pokemons/import` - Import from PokeAPI
- `PATCH /api/v1/pokemons/:id` - Update
- `DELETE /api/v1/pokemons/:id` - Delete

**GraphQL**
- Endpoint: `/graphql`
- Queries: `pokemons`, `pokemon(id)`
- Mutations: `createPokemon`, `importPokemon`, `updatePokemon`, `deletePokemon`

---

## Architectural Notes for Reviewers

### Overengineering & Design Choices
**Note:** You might find this project "overengineered" for a simple CRUD. This is intentional.
- **Multiple ORMs:** To demonstrate abstraction layers and Repository pattern.
- **REST + GraphQL:** To show how Use Cases can serve multiple drivers.
- **Rate Limiting & Caching:** To demonstrate cross-cutting concerns handling.

### Key Decisions (ADRs)
- **Framework:** NestJS [ADR-001]
- **Architecture:** Clean Architecture (Inward Dependency Rule) [ADR-002]
- **API Strategy:** REST (Versioned) + GraphQL [ADR-003, 008, 009]
- **Persistence:** Repository Pattern for ORM Agnosticism [ADR-004]

Full ADR Index: [docs/adrs/index.md](docs/adrs/index.md)
