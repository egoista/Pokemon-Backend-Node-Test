# ADR 019: Caching Strategy

## Status
Accepted

## Context
The Pokemon API requires high performance and reduced database load. We needed a caching strategy that is pluggable, supports different backends (starting with in-memory), and correctly handles HTTP cache headers and invalidation.

## Decision
We decided to implement a custom Caching Strategy with the following components:

1. **`CacheService` Interface**: An abstraction to decouple the application from the caching implementation (Adapter Pattern).
2. **`InMemoryCacheService`**: The default implementation using `lru-cache` (v10+), configurable via environment variables (`CACHE_TTL`, `CACHE_MAX_ITEMS`).
3. **`HttpCacheInterceptor`**: A global NestJS interceptor that:
   - Caches GET requests using a key derived from the URL and query parameters.
   - Adds `X-Cache-Status` header (`HIT` or `MISS`) to responses for easier debugging.
   - Handles standard HTTP `Cache-Control` and `ETag` headers.
   - Invalidates cache on mutation requests (POST, PUT, PATCH, DELETE) using a pattern matching strategy (`pokemon:list:*` and specific IDs).

## Consequences
- **Positive**:
  - Improved response times for repeated queries.
  - Reduced load on the database.
  - Flexibility to switch to Redis or Memcached in the future without changing business logic.
  - Standardized cache behavior across the API.
- **Negative**:
  - In-memory cache is ensuring consistency across multiple instances requires sticky sessions or a distributed cache (Redis), which is a future step.
  - Added complexity in the invalidation logic.

## Configuration
The following environment variables control the cache:
- `CACHE_TTL`: Time within milliseconds for cache expiration (default: 5 minutes).
- `CACHE_MAX_ITEMS`: Maximum number of items in the cache (default: 500).
