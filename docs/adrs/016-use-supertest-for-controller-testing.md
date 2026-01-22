# 16. Use Supertest for Controller Integration Testing

Date: 2026-01-22

## Status

Accepted

## Context

We have adopted the Clean Architecture pattern (ADR-002) and use Exception Filters (ADR-014) to map Domain Errors to HTTP responses.

Standard unit tests for Controllers, where dependencies are mocked and methods are called directly, do not pass through the NestJS Exception Layer. Consequently, these tests cannot verify that:
1.  Exceptions thrown by the Use Case are correctly caught by the Filter.
2.  The correct HTTP Status Codes (e.g., 400, 404, 409) are returned to the client.

We need a testing strategy that verifies the HTTP contract, including error handling, without spinning up the entire application infrastructure (e.g., real database) if possible, or at least isolates the Controller-UseCase-Filter integration.

## Decision

We will use **Supertest** combined with NestJS's `INestApplication` for Controller testing.

Instead of unit testing Controller methods directly instantiation:
1.  We will create a `TestingModule` that wires the Controller, a real or mocked Use Case, and the Exception Filter.
2.  We will use `supertest` to send real HTTP requests to the test application.
3.  We will verify the HTTP Status Code, Response Body, and Headers.

This approach treats the Controller test as an **Integration Test** of the HTTP Layer.

## Consequences

### Positive
-   **Accurate Error Handling Verification**: Ensures Exception Filters are active and functioning, verifying the actual HTTP response sent to clients.
-   **Contract Verification**: Tests the actual HTTP interface (paths, verbs, status codes) rather than just internal method logic.
-   **Confidence**: Higher confidence that the API behaves as expected from a consumer's perspective.

### Negative
-   **Performance**: These tests are slightly slower than pure unit tests because they require bootstrapping a NestJS application context (even if minimal).
-   **Complexity**: Requires setting up `supertest` and `INestApplication` in the test suite.

## Example

```typescript
describe('PokemonController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            controllers: [PokemonController],
            providers: [/* dependencies */],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should return 409 Conflict', () => {
        return request(app.getHttpServer())
            .post('/pokemons')
            .send(dto)
            .expect(409);
    });
});
```
