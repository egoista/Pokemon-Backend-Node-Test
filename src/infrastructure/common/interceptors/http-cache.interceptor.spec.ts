import { HttpCacheInterceptor } from './http-cache.interceptor';
import { CacheService } from '../../../domain/adapters/cache.interface';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';

describe('HttpCacheInterceptor', () => {
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      deletePattern: jest.fn(),
      clear: jest.fn(),
    };
  });

  it('passes through when method is not cacheable', async () => {
    const interceptor = new HttpCacheInterceptor(cacheService);
    const request = { method: 'OPTIONS', params: {}, query: {} };
    const response = { header: jest.fn() };
    const context = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of('ok')),
    };

    const result$ = await interceptor.intercept(context, next);
    await lastValueFrom(result$);

    expect(next.handle).toHaveBeenCalled();
  });

  it('uses a detail cache key when id param is present', async () => {
    const interceptor = new HttpCacheInterceptor(cacheService);
    const request = {
      method: 'GET',
      params: { id: '123' },
      query: {},
      headers: {},
    };
    const response = {
      header: jest.fn(),
      status: jest.fn(),
    };
    const context = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of({ ok: true })),
    };

    cacheService.get.mockResolvedValue(null);
    cacheService.set.mockResolvedValue(undefined);

    const result$ = await interceptor.intercept(context, next);
    await lastValueFrom(result$);

    expect(cacheService.get).toHaveBeenCalledWith('pokemon:get:id=123');
  });
});
