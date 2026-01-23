import { GqlThrottlerGuard } from './gql-throttler.guard';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('GqlThrottlerGuard', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('falls back to HTTP context when GraphQL context lacks req/res', () => {
        const guard = Object.create(GqlThrottlerGuard.prototype) as GqlThrottlerGuard;
        const request = { headers: {} };
        const response = { statusCode: 200 };
        const httpContext = {
            getRequest: () => request,
            getResponse: () => response,
        };

        const context = {
            getType: jest.fn().mockReturnValue('graphql'),
            switchToHttp: jest.fn().mockReturnValue(httpContext),
        } as unknown as ExecutionContext;

        jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
            getContext: () => ({}),
        } as any);

        const result = guard.getRequestResponse(context);

        expect(result).toEqual({ req: request, res: response });
        expect(context.switchToHttp).toHaveBeenCalled();
    });
});
