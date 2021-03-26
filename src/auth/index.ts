import { call, createEffects, put, select } from 'redux-cofx';

import { selectHasTokenExpired, selectUser, setToken } from '@app/token';
import { apiFetch, ApiFetchResponse } from '@app/fetch';
import { LoginLocalParams, RegisterParams, TokenResponse } from '@app/types';
import {
  Loaders,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from '@app/loaders';
import { selectClientId } from '@app/client-id';
import { resetStore } from '@app/reset-store';

interface AuthGoogle {
  token: string;
  clientId: string;
}

function* postLogin(clientToken: string, loaderName: Loaders) {
  yield put(setToken(clientToken));
  const user = yield select(selectUser);
  yield put(setLoaderSuccess({ id: loaderName, meta: { user } }));
}

function* onLoginGoogle(body: AuthGoogle) {
  const loaderName = Loaders.loginGoogle;

  yield put(setLoaderStart({ id: loaderName }));

  const resp: ApiFetchResponse<TokenResponse> = yield call(
    apiFetch,
    '/auth/login/google',
    {
      auth: false,
      method: 'POST',
      body: JSON.stringify(body),
    },
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loaderName, message: resp.data.message }));
    return;
  }

  const clientToken = resp.data.token;
  yield call(postLogin, clientToken, loaderName);
}

export function* onLoginGuest() {
  const loaderName = Loaders.login;
  const clientId = yield select(selectClientId);
  const hasTokenExpired = yield select(selectHasTokenExpired);
  if (!hasTokenExpired) {
    return;
  }

  yield put(setLoaderStart({ id: loaderName }));
  const resp: ApiFetchResponse<TokenResponse> = yield call(
    apiFetch,
    '/auth/login/guest',
    {
      auth: false,
      method: 'POST',
      body: JSON.stringify({ clientId }),
    },
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loaderName }));
    return;
  }

  const clientToken = resp.data.token;
  yield call(postLogin, clientToken, loaderName);
}

function* onLoginLocal(body: LoginLocalParams) {
  const loaderName = Loaders.login;
  yield put(setLoaderStart({ id: loaderName }));

  const resp: ApiFetchResponse<TokenResponse> = yield call(
    apiFetch,
    '/auth/login/local',
    {
      auth: false,
      method: 'POST',
      body: JSON.stringify(body),
    },
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loaderName, message: resp.data.message }));
    return;
  }

  const clientToken = resp.data.token;
  yield call(postLogin, clientToken, loaderName);
}

function* onLogout() {
  yield call(apiFetch, '/auth/logout', { method: 'POST' });
  yield put(resetStore());
}

function* onRegister(body: RegisterParams) {
  const loaderName = Loaders.register;

  yield put(setLoaderStart({ id: loaderName }));
  const resp: ApiFetchResponse<TokenResponse> = yield call(
    apiFetch,
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loaderName, message: resp.data.message }));
    return;
  }

  const clientToken = resp.data.token;
  yield call(postLogin, clientToken, loaderName);
}

export const {
  register,
  loginGoogle,
  loginGuest,
  login,
  logout,
} = createEffects({
  loginGoogle: onLoginGoogle,
  loginGuest: onLoginGuest,
  login: onLoginLocal,
  logout: onLogout,
  register: onRegister,
});
