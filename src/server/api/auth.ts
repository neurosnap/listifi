import Router from '@koa/router';
import { LoginTicket, OAuth2Client } from 'google-auth-library';

import { dbTypes, LoginLocalParams, RegisterParams } from '@app/types';
import { validEmail, validUsername } from '@app/validate';

import { db } from '../knex';
import { setCookie, unsetCookie } from '../cookie';
import { getBody, requireBody } from '../body';
import {
  getTokenForUser,
  verifyEmail,
  comparePass,
  hashPass,
  sendEmailVerification,
  generateUsername,
} from '../services';
import { env } from '../env';

const googleClient = new OAuth2Client(env.googleClientId);

export const authRouter = new Router({ prefix: '/api/auth' });

const sanitizeUsername = (username = '') => username.toLocaleLowerCase();
const sanitizeEmail = (email = '') => email.toLocaleLowerCase();

authRouter.post('/register', async (ctx) => {
  requireBody(ctx, ['username', 'email', 'password', 'clientId']);
  const body = getBody<RegisterParams>(ctx);
  const { password, clientId } = body;
  const username = sanitizeUsername(body.username);
  const email = sanitizeEmail(body.email);

  const validateEmail = validEmail(email);
  if (!validateEmail.isValid) {
    return ctx.throw(422, validateEmail.reason);
  }

  const validateUsername = validUsername(username);
  if (!validateUsername.isValid) {
    return ctx.throw(422, validateUsername.reason);
  }

  const user = await db('app_users').where({ email: clientId }).first();
  if (user && !user.is_guest) {
    return ctx.throw(401, 'user already exists');
  }

  const passhash = await hashPass(password);

  const data = {
    username,
    email,
    passhash,
    client_id: clientId,
    is_guest: false,
    verified: false,
  };

  // if there is a user in our system then that means they are a guest
  // so we should update the current user record for that guest user
  // so they can keep all their lists
  if (user) {
    await db('app_users')
      .where({ id: user.id })
      .update({ ...data, updated_at: new Date() });
  } else {
    await db('app_users').insert(data);
  }
  const nextUser = await db('app_users').where('email', data.email).first();

  if (!nextUser) {
    ctx.throw(500, 'user could not be create user');
    return;
  }

  const token = getTokenForUser(nextUser);
  setCookie(ctx, token);
  await sendEmailVerification(nextUser.email);
  ctx.body = { token };
});

authRouter.post('/login/local', async (ctx) => {
  requireBody(ctx, ['password']);
  const body = getBody<LoginLocalParams>(ctx);
  const { password } = body;
  const email = sanitizeEmail(body.email);
  const username = sanitizeEmail(body.username);

  let user: dbTypes.app_users | undefined;
  if (email) {
    user = await db('app_users').where('email', email).first();
  } else if (username) {
    user = await db('app_users').where('username', username).first();
  } else {
    return ctx.throw(422, 'username or email required to login');
  }

  if (!user) {
    return ctx.throw(404, 'user not found');
  }

  if (!user.passhash) {
    return ctx.throw(422, 'user does not have a local login');
  }

  const verified = await comparePass(password, user.passhash);
  if (!verified) {
    return ctx.throw(400, 'password does not match our records');
  }
  const token = getTokenForUser(user);
  setCookie(ctx, token);
  ctx.body = { token };
});

authRouter.post('/login/guest', async (ctx) => {
  requireBody(ctx, ['clientId']);
  const { clientId } = getBody<{ clientId: string }>(ctx);
  const curUser = await db('app_users').where('email', clientId).first();

  let username = curUser?.username || '';

  if (curUser) {
    if (!curUser.is_guest) {
      return ctx.throw(
        401,
        'the guest id you are using is associated with a registered user',
      );
    }
  } else {
    let tries = 0;
    // probably not a great idea since we could never find a unique name
    while (tries !== 10) {
      username = generateUsername();
      const already = await db('app_users').where('username', username).first();
      if (!already) {
        break;
      }
      tries += 1;
    }
  }

  const data = {
    username,
    email: clientId,
    name: clientId,
    client_id: clientId,
    verified: false,
    is_guest: true,
  };
  const userFound = await db('app_users').where('email', data.email).first();
  if (userFound) {
    await db('app_users')
      .where('email', data.email)
      .update({ ...data, updated_at: new Date() });
  } else {
    await db('app_users').insert(data);
  }

  const user = await db('app_users').where('email', data.email).first();
  if (!user) {
    return ctx.throw(500, 'could not create guest user');
  }

  const clientToken = getTokenForUser(user);
  setCookie(ctx, clientToken);
  ctx.body = { token: clientToken };
});

authRouter.post('/logout', async (ctx) => {
  unsetCookie(ctx);
  ctx.status = 204;
});

authRouter.post('/verify', async (ctx) => {
  requireBody(ctx, ['id', 'code']);
  const body = getBody<{ id: string; code: string }>(ctx);
  const result = await verifyEmail(ctx, body);
  if (!result.success) {
    ctx.throw(result.data.status, result.data.message);
    return;
  }

  ctx.body = { token: result.data };
});

authRouter.post('/login/google', async (ctx) => {
  requireBody(ctx, ['token']);
  const { token, clientId } = getBody<{ token: string; clientId: string }>(ctx);
  let ticket: LoginTicket | null = null;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.googleClientId,
    });
  } catch (err) {
    return ctx.throw(422, err);
  }

  if (!ticket) {
    return ctx.throw(404, 'login ticket not found');
  }

  const payload = ticket.getPayload();

  if (!payload) {
    return ctx.throw(404, 'login payload not found');
  }

  const { name, picture, email } = payload;
  const data = {
    name: name || '',
    username: clientId,
    picture: picture || '',
    email: email || '',
    verified: true,
    client_id: clientId,
    is_guest: false,
    updated_at: new Date(),
  };

  // todo: no not allow empty string (clientId could be '') to be queried
  const userByClientId = await db('app_users').where('email', clientId).first();
  if (userByClientId) {
    await db('app_users').where('id', userByClientId.id).update(data);
  } else {
    const user = await db('app_users').where('email', data.email).first();
    if (!user) {
      await db('app_users').where('email', data.email).insert(data);
    } else {
      const { username, ...d } = data;
      await db('app_users').where('email', data.email).update(d);
    }
  }

  const user = await db('app_users').where('email', data.email).first();
  if (!user) {
    return ctx.throw(500, 'could not find user');
  }
  const clientToken = getTokenForUser(user);
  setCookie(ctx, clientToken);
  ctx.body = { token: clientToken };
});
