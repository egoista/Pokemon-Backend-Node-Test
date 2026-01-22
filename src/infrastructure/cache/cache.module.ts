import { Module, Global } from '@nestjs/common';
import { InMemoryCacheService } from './in-memory-cache.service';
import { CacheService } from '../../domain/adapters/cache.interface';

@Global()
@Module({
    providers: [
        {
            provide: CacheService,
            useClass: InMemoryCacheService,
        },
    ],
    exports: [CacheService],
})
export class CacheModule { }
