import { ThrottlerExceptionFilter } from './throttler-exception.filter';
import { ThrottlerException } from '@nestjs/throttler';
import { ArgumentsHost } from '@nestjs/common';

describe('ThrottlerExceptionFilter', () => {
    it('returns a standardized 429 payload', () => {
        const filter = new ThrottlerExceptionFilter();
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const host = {
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        } as unknown as ArgumentsHost;

        filter.catch(new ThrottlerException(), host);

        expect(response.status).toHaveBeenCalledWith(429);
        expect(response.json).toHaveBeenCalledWith({
            statusCode: 429,
            message: 'Rate limit exceeded. Please try again later.',
            error: 'Too Many Requests',
        });
    });
});
