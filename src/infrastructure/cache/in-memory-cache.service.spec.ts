import { InMemoryCacheService } from './in-memory-cache.service';

describe('InMemoryCacheService', () => {
    it('clears cached entries', async () => {
        const cache = new InMemoryCacheService();

        await cache.set('pokemon:list:all', { ok: true });
        await cache.clear();

        expect(await cache.get('pokemon:list:all')).toBeNull();
    });
});
