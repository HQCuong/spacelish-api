import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (key: string, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return key ? (request.cookies[key] as string | undefined) : undefined;
  },
);
