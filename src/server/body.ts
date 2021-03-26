import Router from '@koa/router';
import { ParameterizedContext } from 'koa';
import { KoaState } from './koa';

export function getBody<T = any>(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, { [key: string]: any }>
  >,
): T {
  return ctx.request.body;
}

export function requireBody(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, { [key: string]: any }>
  >,
  params: string[],
) {
  const errors: string[] = [];
  params.forEach((p) => {
    if (!ctx.request.body.hasOwnProperty(p)) {
      errors.push(p);
    }
  });
  if (errors.length > 0) {
    ctx.throw(422, `${errors.join(', ')} are required`);
  }
}

export function sendBody<T>(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, { [key: string]: any }>
  >,
  body: T,
) {
  ctx.body = body;
}
