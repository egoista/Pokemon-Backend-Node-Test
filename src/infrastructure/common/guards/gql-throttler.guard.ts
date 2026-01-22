
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
    getRequestResponse(context: ExecutionContext) {
        const type = context.getType<GqlContextType>();

        if (type === 'graphql') {
            // First try to get from GraphQL context
            const gqlCtx = GqlExecutionContext.create(context);
            const ctx = gqlCtx.getContext();

            // Standard Apollo setup has req/res in context
            if (ctx && ctx.req && ctx.res) {
                return { req: ctx.req, res: ctx.res };
            }

            // Fallback: GraphQL is served over HTTP, so get from HTTP context
            const httpCtx = context.switchToHttp();
            return { req: httpCtx.getRequest(), res: httpCtx.getResponse() };
        }

        // For non-GraphQL requests, use standard behavior
        return super.getRequestResponse(context);
    }
}
