
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
    getRequestResponse(context: ExecutionContext) {
        const type = context.getType<GqlContextType>();
        if (type === 'graphql') {
            const gqlCtx = GqlExecutionContext.create(context);
            const ctx = gqlCtx.getContext();
            return { req: ctx.req, res: ctx.res };
        }
        return super.getRequestResponse(context);
    }
}
