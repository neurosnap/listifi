import { ParameterizedContext } from 'koa';
import Router from '@koa/router';

import { COOKIE_TOKEN, env } from './env';

export function getCookie(
  ctx: ParameterizedContext<
    any,
    Router.RouterParamContext<any, { [key: string]: any }>
  >,
) {
  return ctx.cookies.get(COOKIE_TOKEN, { signed: true });
}

const isProd = env.nodeEnv === 'production';
const prod = {
  httpOnly: true,
  signed: true,
  sameSite: 'lax' as any,
  domain: 'listifi.app',
};
const dev = {
  httpOnly: true,
  signed: true,
  sameSite: 'lax' as any,
  domain: 'localhost',
};
const options = isProd ? prod : dev;

export function setCookie(
  ctx: ParameterizedContext<
    any,
    Router.RouterParamContext<any, { [key: string]: any }>
  >,
  token: string,
) {
  ctx.cookies.set(COOKIE_TOKEN, token, options);
}

export function unsetCookie(
  ctx: ParameterizedContext<
    any,
    Router.RouterParamContext<any, { [key: string]: any }>
  >,
) {
  ctx.cookies.set(COOKIE_TOKEN, '', options);
}
