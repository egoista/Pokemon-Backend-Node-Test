# Caching Strategy Specification

## Overview
This specification defines the caching strategy for the Pokemon API to improve performance and reduce database load. The design uses a pluggable architecture to allow easy implementation of different caching solutions.

## Architecture

### Cache Interface (Pluggable Strategy Pattern)

The caching layer is abstracted through an interface to support multiple implementations:

```typescript
interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  clear(): Promise<void>;
}
```

### Supported Implementations

1. **In-Memory Cache** (Default)
   - Implementation: LRU (Least Recently Used) cache
   - Suitable for: Single-instance deployments, development
   - Limitations: Not shared across multiple instances

2. **Redis Cache** (Future)
   - Implementation: Redis client
   - Suitable for: Multi-instance deployments, production
   - Benefits: Distributed cache, persistence options

3. **Memcached** (Future)
   - Implementation: Memcached client
   - Suitable for: High-performance caching scenarios

### Configuration

Cache implementation is configured via dependency injection, making it easy to swap implementations:

```typescript
// Example: Switching from in-memory to Redis
providers: [
  {
    provide: 'CACHE_SERVICE',
    useClass: InMemoryCacheService, // or RedisCacheService
  },
]
```

## Cache Keys Structure

### Key Format
```
pokemon:{operation}:{params}
```

### Examples
- List all: `pokemon:list:all`
- List filtered: `pokemon:list:type=fire&page=1&limit=20`
- Get by ID: `pokemon:get:id=25`
- List sorted: `pokemon:list:sortBy=name&sortOrder=desc`

### Key Generation Rules
- Use consistent parameter ordering for cache hits
- Normalize query parameters (lowercase, sorted)
- Include all filter, pagination, and sort parameters

## TTL (Time To Live) Configuration

| Operation | TTL | Rationale |
|:----------|:----|:----------|
| List queries (filtered/sorted) | 5 minutes | Balances freshness with performance |
| Individual Pokemon (by ID) | 15 minutes | Rarely changes, can cache longer |
| Count queries | 5 minutes | Same as list queries |

## Cache Invalidation Strategy

### Invalidation Triggers

1. **Create Pokemon**
   - Invalidate: All list queries (`pokemon:list:*`)
   - Reason: New Pokemon affects all list results

2. **Update Pokemon**
   - Invalidate: 
     - Specific Pokemon (`pokemon:get:id={id}`)
     - All list queries (`pokemon:list:*`)
   - Reason: Updated data must be reflected immediately

3. **Delete Pokemon**
   - Invalidate:
     - Specific Pokemon (`pokemon:get:id={id}`)
     - All list queries (`pokemon:list:*`)
   - Reason: Deleted Pokemon must not appear in results

### Invalidation Methods
- **Pattern-based**: Delete all keys matching a pattern (e.g., `pokemon:list:*`)
- **Specific key**: Delete exact cache key
- **Full clear**: Clear entire cache (use sparingly, e.g., during deployment)

## HTTP Cache-Control Headers

### Response Headers

#### Cacheable Responses (GET requests)
```
Cache-Control: public, max-age=300
ETag: "hash-of-response"
```

#### Non-Cacheable Responses (POST, PATCH, DELETE)
```
Cache-Control: no-store, no-cache, must-revalidate
```

### Client-Side Caching
- Allow browsers and CDNs to cache GET responses
- Use ETags for conditional requests (304 Not Modified)
- Respect cache-control directives

## In-Memory Cache Implementation Details

### Default Implementation: LRU Cache

**Library**: `lru-cache` (or similar)

**Configuration**:
```typescript
{
  max: 500,              // Maximum number of items
  maxSize: 50 * 1024 * 1024,  // 50MB max memory
  ttl: 1000 * 60 * 5,    // Default 5 minutes
  updateAgeOnGet: true,  // Refresh TTL on access
  updateAgeOnHas: false,
}
```

**Features**:
- Automatic eviction of least recently used items
- Memory-efficient
- Fast O(1) operations
- Built-in TTL support

### Memory Management
- Monitor cache size and hit/miss ratio
- Adjust max items based on available memory
- Implement cache warming for frequently accessed data

## Monitoring and Metrics

### Metrics to Track
- Cache hit rate (hits / (hits + misses))
- Cache miss rate
- Average response time (cached vs uncached)
- Cache size and memory usage
- Eviction rate

### Performance Goals
- Cache hit rate: > 70%
- Response time improvement: > 50% for cached requests
- Memory usage: < 100MB for in-memory cache

## Migration Path

### From In-Memory to Redis

1. Install Redis client dependency
2. Implement `RedisCacheService` following the `CacheService` interface
3. Update dependency injection configuration
4. Deploy with Redis connection configuration
5. Monitor cache performance and adjust TTLs as needed

**No code changes required** in controllers, services, or use cases due to the pluggable interface design.

## Best Practices

1. **Always use the cache interface** - Never directly access cache implementation
2. **Invalidate proactively** - Clear cache immediately after mutations
3. **Monitor cache performance** - Track hit rates and adjust strategy
4. **Use appropriate TTLs** - Balance freshness with performance
5. **Handle cache failures gracefully** - Application should work even if cache is unavailable
6. **Test cache invalidation** - Ensure stale data is never served
