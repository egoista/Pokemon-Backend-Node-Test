export abstract class CacheService {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract deletePattern(pattern: string): Promise<void>;
  abstract clear(): Promise<void>;
}
