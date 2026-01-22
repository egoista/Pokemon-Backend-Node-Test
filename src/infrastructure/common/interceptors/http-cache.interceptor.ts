import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CacheService } from '../../../domain/adapters/cache.interface';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
    constructor(
        @Inject(CacheService) private readonly cacheService: CacheService,
    ) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        // Skip caching for GraphQL contexts (GraphQL has its own caching strategies)
        const type = context.getType<string>();
        if (type === 'graphql') {
            return next.handle();
        }

        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<Request>();
        const response = httpContext.getResponse<Response>();
        const method = request.method;

        // Only cache GET requests
        if (method === 'GET') {
            return this.handleGetRequest(context, next, request, response);
        }

        // Invalidate cache for mutations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return this.handleMutationRequest(context, next, request, response);
        }

        return next.handle();
    }

    private async handleGetRequest(
        context: ExecutionContext,
        next: CallHandler,
        request: Request,
        response: Response,
    ): Promise<Observable<any>> {
        const key = this.generateKey(request);

        // Check cache
        const cachedResponse = await this.cacheService.get<any>(key);

        if (cachedResponse) {
            response.header('X-Cache-Status', 'HIT');
            response.header('Cache-Control', 'public, max-age=300'); // 5 mins

            // ETag check
            const ifNoneMatch = request.headers['if-none-match'];
            if (ifNoneMatch === cachedResponse.etag) {
                response.status(304);
                return of(null); // Body is empty for 304
            }

            response.header('ETag', cachedResponse.etag);
            return of(cachedResponse.data);
        }

        response.header('X-Cache-Status', 'MISS');

        return next.handle().pipe(
            mergeMap(async (data) => {
                // Generate ETag
                const etag = this.generateETag(JSON.stringify(data));
                response.header('ETag', etag);
                response.header('Cache-Control', 'public, max-age=300');

                await this.cacheService.set(key, {
                    data,
                    etag,
                });
                return data;
            }),
        );
    }

    private handleMutationRequest(
        context: ExecutionContext,
        next: CallHandler,
        request: Request,
        response: Response,
    ): Observable<any> {
        response.header('Cache-Control', 'no-store, no-cache, must-revalidate');

        return next.handle().pipe(
            mergeMap(async (data) => {
                // Invalidation Strategy
                // If we are modifying Pokemons
                if (request.url.includes('/pokemons')) {
                    // 1. Invalidate all list queries
                    await this.cacheService.deletePattern('pokemon:list:*');

                    // 2. Invalidate specific ID if applicable (Update/Delete)
                    const id = request.params.id; // Assuming route structure /pokemons/:id
                    if (id) {
                        await this.cacheService.delete(`pokemon:get:id=${id}`);
                    }
                }
                return data;
            }),
        );
    }

    private generateKey(request: Request): string {
        const isList = !request.params.id;

        if (isList) {
            // Format: pokemon:list:type=fire&page=1...
            // Sort query params for consistency
            const keys = Object.keys(request.query).sort();
            if (keys.length === 0) {
                return 'pokemon:list:all';
            }

            const queryString = keys.map(k => `${k}=${request.query[k]}`).join('&');
            return `pokemon:list:${queryString}`;
        } else {
            // Format: pokemon:get:id=25
            return `pokemon:get:id=${request.params.id}`;
        }
    }

    private generateETag(data: string): string {
        return `"${crypto.createHash('md5').update(data).digest('hex')}"`;
    }
}
