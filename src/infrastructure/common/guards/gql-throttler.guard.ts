import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const type = context.getType<GqlContextType>();

    if (type === 'graphql') {
      // NOTE: GraphQL context shapes vary; fall back to HTTP req/res for throttling.
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();

      if (ctx && ctx.req && ctx.res) {
        return { req: ctx.req, res: ctx.res };
      }

      const httpCtx = context.switchToHttp();
      return { req: httpCtx.getRequest(), res: httpCtx.getResponse() };
    }

    return super.getRequestResponse(context);
  }
}
