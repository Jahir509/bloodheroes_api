import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthedRequest } from './jwt-auth.guard';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<AuthedRequest>().userId,
);