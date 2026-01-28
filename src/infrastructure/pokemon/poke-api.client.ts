import { Inject, Injectable } from '@nestjs/common';
import {
  ExternalApiError,
  ExternalApiTimeoutError,
  ExternalApiClientError,
  ExternalApiRateLimitError,
  ExternalApiServerError,
  ExternalApiUnavailableError,
  PokemonNotFoundInExternalApiError,
} from '../../domain/pokemon/pokemon.errors';
import {
  PokeApiClient,
  PokeApiPokemonDto,
} from '../../application/pokemon/ports/poke-api.client.interface';
import { HttpClient } from '../common/http/http-client.interface';
import { CacheService } from '../../domain/adapters/cache.interface';
import {
  APP_LOGGER,
  POKE_API_HTTP_CLIENT,
} from '../../application/shared/di.tokens';
import {
  AppLogger,
  NullLogger,
} from '../../application/shared/logger/logger.interface';

// ARCH: External API adapter implementing the PokeApiClient port.
@Injectable()
export class PokeApiClientImpl implements PokeApiClient {
  private readonly retryMaxAttempts: number;
  private readonly retryBaseDelayMs: number;
  private readonly retryMaxDelayMs: number;
  private readonly cacheEnabled: boolean;
  private readonly cacheTtlMs: number;
  private readonly circuitFailureThreshold: number;
  private readonly circuitOpenMs: number;
  private consecutiveFailures = 0;
  private circuitOpenUntil: number | null = null;
  private halfOpen = false;

  constructor(
    @Inject(POKE_API_HTTP_CLIENT) private readonly httpClient: HttpClient,
    @Inject(CacheService) private readonly cacheService: CacheService,
    @Inject(APP_LOGGER) private readonly logger: AppLogger = new NullLogger(),
  ) {
    this.retryMaxAttempts = this.getNumberEnv(
      'POKEAPI_RETRY_MAX_ATTEMPTS',
      2,
      1,
    );
    this.retryBaseDelayMs = this.getNumberEnv(
      'POKEAPI_RETRY_BASE_DELAY_MS',
      200,
      0,
    );
    this.retryMaxDelayMs = this.getNumberEnv(
      'POKEAPI_RETRY_MAX_DELAY_MS',
      1000,
      0,
    );
    this.cacheEnabled = this.getBooleanEnv('POKEAPI_CACHE_ENABLED', true);
    this.cacheTtlMs = this.getNumberEnv('POKEAPI_CACHE_TTL_MS', 30000, 0);
    this.circuitFailureThreshold = this.getNumberEnv(
      'POKEAPI_CB_FAILURE_THRESHOLD',
      3,
      1,
    );
    this.circuitOpenMs = this.getNumberEnv('POKEAPI_CB_OPEN_MS', 10000, 0);
  }

  async getPokemonById(id: number): Promise<PokeApiPokemonDto> {
    const endpoint = `/pokemon/${id}`;
    const cacheKey = `pokeapi:pokemon:id=${id}`;

    if (this.cacheEnabled) {
      const cached = await this.cacheService.get<PokeApiPokemonDto>(cacheKey);
      if (cached) {
        this.logger.info('pokeapi.cache.hit', { endpoint });
        return cached;
      }
    }

    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.retryMaxAttempts; attempt++) {
      this.ensureCircuitClosed(endpoint);

      try {
        const response = await this.httpClient.get<PokeApiPokemonDto>(endpoint);
        this.recordSuccess(endpoint);

        const result = {
          id: response.data.id,
          name: response.data.name,
          types: response.data.types,
        };

        if (this.cacheEnabled && this.cacheTtlMs > 0) {
          await this.cacheService.set(cacheKey, result, this.cacheTtlMs);
        }

        const durationMs = Date.now() - startTime;
        this.logger.info('pokeapi.request.success', {
          endpoint,
          status: response.status,
          durationMs,
          attempts: attempt,
        });

        return result;
      } catch (error: unknown) {
        const normalized = this.normalizeError(error);
        const circuitOpened = this.isCircuitFailure(normalized)
          ? this.recordFailure(endpoint)
          : false;

        const shouldRetry =
          this.isRetryable(normalized) &&
          attempt < this.retryMaxAttempts &&
          !circuitOpened;

        if (shouldRetry) {
          const delayMs = this.calculateBackoff(attempt);
          this.logger.info('pokeapi.request.retry', {
            endpoint,
            attempt,
            delayMs,
            status: normalized.status,
            code: normalized.code,
          });
          await this.sleep(delayMs);
          continue;
        }

        const durationMs = Date.now() - startTime;
        this.logger.error('pokeapi.request.failed', {
          endpoint,
          status: normalized.status,
          durationMs,
          attempts: attempt,
          code: normalized.code,
        });
        throw this.mapToDomainError(normalized, id);
      }
    }

    throw new ExternalApiError('Unknown error occurred');
  }

  private ensureCircuitClosed(endpoint: string): void {
    if (!this.circuitOpenUntil) {
      return;
    }

    const now = Date.now();
    if (now < this.circuitOpenUntil) {
      this.logger.error('pokeapi.circuit.blocked', {
        endpoint,
        openUntil: this.circuitOpenUntil,
      });
      throw new ExternalApiUnavailableError();
    }

    this.circuitOpenUntil = null;
    this.halfOpen = true;
    this.logger.info('pokeapi.circuit.half_open', { endpoint });
  }

  private recordSuccess(endpoint: string): void {
    this.consecutiveFailures = 0;
    if (this.halfOpen) {
      this.halfOpen = false;
      this.logger.info('pokeapi.circuit.closed', { endpoint });
    }
  }

  private recordFailure(endpoint: string): boolean {
    if (this.halfOpen) {
      return this.openCircuit(endpoint);
    }

    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= this.circuitFailureThreshold) {
      return this.openCircuit(endpoint);
    }

    return false;
  }

  private openCircuit(endpoint: string): boolean {
    this.circuitOpenUntil = Date.now() + this.circuitOpenMs;
    this.consecutiveFailures = 0;
    this.halfOpen = false;
    this.logger.error('pokeapi.circuit.open', {
      endpoint,
      openUntil: this.circuitOpenUntil,
    });
    return true;
  }

  private normalizeError(error: unknown): {
    status?: number;
    code?: string;
    message: string;
    isTimeout: boolean;
  } {
    const message =
      error instanceof Error ? error.message : String(error ?? 'Unknown error');
    const code =
      typeof (error as { code?: unknown })?.code === 'string'
        ? (error as { code: string }).code
        : undefined;
    const status =
      typeof (error as { response?: { status?: unknown } })?.response
        ?.status === 'number'
        ? (error as { response: { status: number } }).response.status
        : undefined;
    const isTimeout =
      code === 'ECONNABORTED' || message.toLowerCase().includes('timeout');

    return {
      status,
      code,
      message,
      isTimeout,
    };
  }

  private isRetryable(error: { status?: number; isTimeout: boolean }): boolean {
    return (
      error.isTimeout ||
      (typeof error.status === 'number' && error.status >= 500)
    );
  }

  private isCircuitFailure(error: {
    status?: number;
    isTimeout: boolean;
  }): boolean {
    return (
      error.isTimeout ||
      (typeof error.status === 'number' && error.status >= 500)
    );
  }

  private mapToDomainError(
    error: { status?: number; isTimeout: boolean; message: string },
    id: number,
  ): Error {
    if (error.status === 404) {
      return new PokemonNotFoundInExternalApiError(id);
    }
    if (error.isTimeout) {
      return new ExternalApiTimeoutError();
    }
    if (error.status === 429) {
      return new ExternalApiRateLimitError();
    }
    if (typeof error.status === 'number' && error.status >= 400) {
      if (error.status < 500) {
        return new ExternalApiClientError(
          `External API rejected the request with status ${error.status}.`,
        );
      }
      return new ExternalApiServerError(
        `External API failed with status ${error.status}.`,
      );
    }
    return new ExternalApiError(error.message || 'Unknown error occurred');
  }

  private calculateBackoff(attempt: number): number {
    const delay = this.retryBaseDelayMs * Math.pow(2, attempt - 1);
    return Math.min(delay, this.retryMaxDelayMs);
  }

  private async sleep(delayMs: number): Promise<void> {
    if (delayMs <= 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  private getNumberEnv(key: string, fallback: number, min: number): number {
    const raw = process.env[key];
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.max(min, parsed);
  }

  private getBooleanEnv(key: string, fallback: boolean): boolean {
    const raw = process.env[key];
    if (raw === undefined) {
      return fallback;
    }
    return ['true', '1', 'yes'].includes(raw.toLowerCase());
  }
}
