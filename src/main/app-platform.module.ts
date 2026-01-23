import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '../infrastructure/cache/cache.module';
import { ThrottlerExceptionFilter } from '../infrastructure/common/filters/throttler-exception.filter';
import { GqlThrottlerGuard } from '../infrastructure/common/guards/gql-throttler.guard';
import { HttpCacheInterceptor } from '../infrastructure/common/interceptors/http-cache.interceptor';
import { envValidationSchema } from '../infrastructure/config/env.validation';
import { HealthModule } from '../infrastructure/health/health.module';
import { APP_LOGGER } from '../application/shared/di.tokens';
import { NestLoggerAdapter } from '../infrastructure/common/logger/nest-logger.adapter';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      cache: true,
    }),
    HealthModule,
    CacheModule,
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000'),
          limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100'),
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    {
      provide: APP_LOGGER,
      useFactory: () => new NestLoggerAdapter('App'),
    },
  ],
  exports: [APP_LOGGER],
})
export class AppPlatformModule {}
