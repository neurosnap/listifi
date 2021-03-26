import Koa from 'koa';

export class ApiError extends Error {
  statusCode: number;

  constructor(message = '', statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function errorHandler(
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>,
  next: Koa.Next,
) {
  return next().catch((err) => {
    const { statusCode, message } = err;

    ctx.type = 'json';
    ctx.status = statusCode || 500;
    ctx.body = {
      status: 'error',
      message,
    };

    ctx.app.emit('error', err, ctx);
  });
}
