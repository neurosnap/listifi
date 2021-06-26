import Router from '@koa/router';
import jwt from 'koa-jwt';

import { ApiStarsResponse, UserFetchResponse, UserJWTServer } from '@app/types';

import { jwtOptions } from '../env';
import { sendBody } from '../body';
import { getStarsForUser, getActivityForUser } from '../services';

export const userRouter = new Router({ prefix: '/api/users' });

userRouter.get('/:username', async (ctx) => {
  const { username } = ctx.params;
  const curUser: UserJWTServer | undefined = ctx.state.user;
  const result = await getActivityForUser(curUser?.id || '', username);
  if (!result.success) {
    return ctx.throw(result.data.status, result.data.message);
  }

  sendBody<UserFetchResponse>(ctx, result.data);
});

userRouter.get('/:username/stars', async (ctx) => {
  const { username } = ctx.params;
  const result = await getStarsForUser(username);
  if (!result.success) {
    return ctx.throw(result.data.status, result.data.message);
  }

  sendBody<ApiStarsResponse>(ctx, result.data);
});

userRouter.use(jwt(jwtOptions));
