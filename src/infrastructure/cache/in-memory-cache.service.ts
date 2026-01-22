import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { LRUCache } from 'lru-cache';
import { CacheService } from '../../domain/adapters/cache.interface';

@Injectable()
export class InMemoryCacheService implements CacheService, OnModuleDestroy {
    private cache: LRUCache<string, any>;

    constructor() {
        const ttl = parseInt(process.env.CACHE_TTL ?? '300000', 10); // 5 minutes default
        const max = parseInt(process.env.CACHE_MAX_ITEMS ?? '500', 10);

        this.cache = new LRUCache({
            max,
            ttl,
        });
    }

    async get<T>(key: string): Promise<T | null> {
        const value = this.cache.get(key);
        return (value as T) || null;
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        this.cache.set(key, value, { ttl });
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async deletePattern(pattern: string): Promise<void> {
        // Simple pattern matching (wildcard at end usually)
        // lru-cache doesn't support glob patterns natively on keys iterator efficiently without walking.
        // Spec mentions "pokemon:list:*"
        // We will iterate and delete.

        // Convert glob-like pattern to regex. 
        // "pokemon:list:*" -> starts with "pokemon:list:"
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');

        // In lru-cache v7+, we can iterate over keys
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }

    onModuleDestroy() {
        this.cache.clear();
    }
}
