# Rate Limiting Specification

## Overview
This specification defines the rate limiting strategy for the Pokemon API to prevent abuse and ensure fair resource allocation across all users.

## Strategy
**Algorithm**: Fixed Window  
**Scope**: IP-based rate limiting

## Rate Limits

### Configuration via Environment Variables

Rate limits are configurable through environment variables to allow flexibility across different deployment environments:

| Environment Variable | Description | Default Value |
|:---------------------|:------------|:--------------|
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per time window per IP | `100` |
| `RATE_LIMIT_WINDOW_MS` | Time window in milliseconds | `60000` (1 minute) |

### Default Limits
- **Requests per window**: 100 requests per IP address (configurable via `RATE_LIMIT_MAX_REQUESTS`)
- **Time window**: 60 seconds (configurable via `RATE_LIMIT_WINDOW_MS`)

### Endpoint-Specific Limits
All endpoints share the same rate limit pool per IP address.

### Exemptions
The following endpoints are exempt from rate limiting:
- Health check endpoints (`/health`, `/readiness`)
- Metrics endpoints (if exposed)

## HTTP Headers

### Response Headers
All API responses MUST include the following headers:

| Header | Description | Example |
|:-------|:------------|:--------|
| `X-RateLimit-Limit` | Maximum requests allowed per minute | `100` |
| `X-RateLimit-Remaining` | Remaining requests in current window | `87` |
| `X-RateLimit-Reset` | Unix timestamp when the rate limit resets | `1674567890` |

### Rate Limit Exceeded Response

**Status Code**: `429 Too Many Requests`

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1674567890
Retry-After: 30
```

**Response Body**:
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Please try again later.",
  "error": "Too Many Requests"
}
```

## Implementation Requirements

### Configuration Loading
1. Load rate limit settings from environment variables on application startup
2. Validate configuration values:
   - `RATE_LIMIT_MAX_REQUESTS` must be a positive integer
   - `RATE_LIMIT_WINDOW_MS` must be a positive integer
3. Log the active rate limit configuration on startup
4. Fallback to default values if environment variables are not set

### Fixed Window Algorithm
1. Each IP address has a counter that tracks requests within the current time window
2. Counter resets when the time window expires
3. Each request increments the counter by 1
4. If counter exceeds the maximum allowed requests, request is rejected with 429 status
5. Window starts from the first request and lasts for the configured duration

### Storage
- Use in-memory storage for rate limit counters
- Consider distributed storage (Redis) for multi-instance deployments
- Implement cleanup mechanism for expired IP entries

### IP Address Extraction
- Extract IP from `X-Forwarded-For` header (if behind proxy)
- Fallback to direct connection IP
- Handle IPv4 and IPv6 addresses

## Monitoring and Logging

### Metrics to Track
- Total requests per endpoint
- Rate limit violations per IP
- Average requests per minute per IP
- Burst usage patterns

### Logging
- Log rate limit violations with IP address and timestamp
- Log suspicious patterns (e.g., rapid repeated violations)

## Future Considerations
- User-based rate limiting (after authentication is implemented)
- Endpoint-specific rate limits for expensive operations
- Dynamic rate limits based on user tier/subscription
- Rate limit bypass for internal services
