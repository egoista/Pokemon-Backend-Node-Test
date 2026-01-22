import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Check system health' })
    check() {
        return this.health.check([
            () => this.http.pingCheck('pokeapi', 'https://pokeapi.co'),
        ]);
    }
}
