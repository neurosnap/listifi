import Router from '@koa/router';
import { ParameterizedContext } from 'koa';

import { setCookie } from '../cookie';
import { db } from '../knex';
import { KoaState } from '../koa';
import { FnResult } from '../types';
import { getTokenForUser } from './user';
import { comparePass } from './pass';

export async function verifyEmail(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, { [key: string]: any }>
  >,
  { id, code }: { id: string; code: string },
): Promise<FnResult<string>> {
  const emailVerification = await db('email_verifications')
    .where('id', id)
    .first();

  if (!emailVerification) {
    return {
      success: false,
      data: {
        status: 404,
        message: 'could not find email verification record',
      },
    };
  }

  const user = await db('app_users')
    .where('email', emailVerification.email)
    .first();

  if (!user) {
    return {
      success: false,
      data: {
        status: 404,
        message: `could not find user associated with email ${emailVerification.email}`,
      },
    };
  }

  if (user.verified) {
    return {
      success: false,
      data: {
        status: 422,
        message: 'user has already been verified',
      },
    };
  }

  if (emailVerification.used_at) {
    return {
      success: false,
      data: {
        status: 422,
        message: 'verification code has already been used',
      },
    };
  }

  const success = await comparePass(code, emailVerification.code);
  if (!success) {
    return {
      success: false,
      data: {
        status: 422,
        message: 'verification code provided does not match our records',
      },
    };
  }

  const now = new Date();
  const EXPIRE_DAYS = 7;
  const createdAt = new Date(emailVerification.created_at);
  const expiresAt = new Date(
    createdAt.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  );
  if (now > expiresAt) {
    return {
      success: false,
      data: {
        status: 422,
        message: 'email verification code has expired',
      },
    };
  }

  await db('app_users')
    .where('id', user.id)
    .update({ verified: true, updated_at: now });
  await db('email_verifications').where('id', id).update({
    used_at: now,
  });
  const verifiedUser = await db('app_users').where('id', user.id).first();
  if (!verifiedUser) {
    return {
      success: false,
      data: {
        status: 500,
        message: 'could not find verified user after updating',
      },
    };
  }

  const clientToken = getTokenForUser(verifiedUser);
  setCookie(ctx, clientToken);
  return { success: true, data: clientToken };
}
