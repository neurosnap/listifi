import Koa from 'koa';
import jwt from 'jsonwebtoken';

function resolveHeader(
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>,
) {
  if (!ctx.header || !ctx.header.authorization) {
    return null;
  }

  const parts = ctx.header.authorization.trim().split(' ');

  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
  }

  return null;
}

function resolveCookie(
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>,
  cookie?: string,
) {
  return cookie && ctx.cookies.get(cookie);
}

function verify(
  token: string,
  secretOrPublicKey: jwt.Secret,
  options?: jwt.VerifyOptions | undefined,
) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, options, (error, decoded) => {
      if (error) {
        reject(error);
      } else {
        resolve(decoded);
      }
    });
  });
}

export function jwtUser(opts: { secret: string; cookie?: string }) {
  async function jwtMiddleware(
    ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>,
    next: Koa.Next,
  ) {
    const token = resolveHeader(ctx) || resolveCookie(ctx, opts.cookie);
    if (!token) {
      return next();
    }

    try {
      const decoded = await verify(token, opts.secret);
      ctx.state.user = decoded;
      return next();
    } catch (err) {
      return next();
    }
  }

  return jwtMiddleware;
}
