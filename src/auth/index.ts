import { call, put, select } from 'redux-saga/effects';
import { Next, setLoaderSuccess } from 'saga-query';

import { selectHasTokenExpired, selectUser, setToken } from '@app/token';
import {
  LoginLocalParams,
  RegisterParams,
  TokenResponse,
  ApiGen,
} from '@app/types';
import { selectClientId } from '@app/client-id';
import { resetStore } from '@app/reset-store';
import { api, ApiCtx } from '@app/api';

interface AuthGoogle {
  token: string;
  clientId: string;
}

function* postLogin(ctx: ApiCtx<TokenResponse>): ApiGen {
  if (!ctx.response.ok) return;
  yield put(setToken(ctx.response.data.token));
  const user = yield select(selectUser);
  ctx.actions.push(setLoaderSuccess({ id: ctx.name, meta: { user } }));
}

function* authBasic(ctx: ApiCtx<{ token: string }>, next: Next) {
  ctx.request = {
    body: JSON.stringify(ctx.payload),
  };
  yield next();
  yield call(postLogin, ctx);
}

export const loginGoogle = api.post<AuthGoogle>(
  '/auth/login/google',
  authBasic,
);
export const login = api.post<LoginLocalParams>('/auth/login/local', authBasic);
export const register = api.post<RegisterParams>('/auth/register', authBasic);

export const loginGuest = api.post('/auth/login/guest', function* (
  ctx: ApiCtx<TokenResponse>,
  next,
): ApiGen {
  const clientId = yield select(selectClientId);
  const hasTokenExpired = yield select(selectHasTokenExpired);
  if (!hasTokenExpired) {
    return;
  }

  ctx.request = {
    body: JSON.stringify({ clientId }),
  };
  yield next();
  yield call(postLogin, ctx);
});

export const logout = api.post('/auth/logout', function* (ctx, next) {
  yield next();
  if (!ctx.response.ok) return;
  yield put(resetStore());
});
