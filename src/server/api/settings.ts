import { ApiUpdateSettings, UpdateSettings, UserResponse } from '@app/types';
import Router from '@koa/router';
import jwt from 'koa-jwt';
import { getBody, sendBody } from '../body';
import { setCookie } from '../cookie';

import { jwtOptions } from '../env';
import { db } from '../knex';
import { userQueryBuilder } from '../query';
import { getTokenForUser } from '../services';

export const settingsRouter = new Router({ prefix: '/api/settings' });

settingsRouter.use(jwt(jwtOptions));

settingsRouter.post('/', async (ctx) => {
  const userId: string = ctx.state.user.id;
  const user = await db('app_users').where('id', userId);
  if (!user) {
    return ctx.throw(404, 'user not found');
  }

  const body = getBody<UpdateSettings>(ctx);
  if (!body.username && !body.email_notifications) {
    return ctx.throw(422, 'no value data provided');
  }

  const data: UpdateSettings = {};
  if (body.email_notifications) {
    data.email_notifications = body.email_notifications;
  }

  if (body.username) {
    data.username = body.username;
  }

  const [nextUser] = await db('app_users')
    .where('id', userId)
    .update(
      {
        ...data,
        updated_at: new Date(),
      },
      '*',
    );

  const token = getTokenForUser(nextUser);
  const userClient: UserResponse | undefined = await userQueryBuilder()
    .where('id', userId)
    .first();
  if (!userClient) {
    return ctx.throw(500, 'user not found');
  }
  setCookie(ctx, token);
  sendBody<ApiUpdateSettings>(ctx, { token, user: userClient });
});
