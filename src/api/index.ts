import { call, select } from 'redux-saga/effects';
import {
  createApi,
  requestMonitor,
  requestParser,
  FetchCtx,
  Next,
} from 'saga-query';

import { selectEnv } from '@app/env';
import { ApiGen } from '@app/types';

interface FetchApiOpts extends RequestInit {
  url?: string;
  quickSave?: boolean;
}

export interface ApiCtx<D = any, P = any, E = any> extends FetchCtx<D, E, P> {
  request: FetchApiOpts;
}

function* fetchApi(request: FetchApiOpts): ApiGen<FetchCtx['response']> {
  const { url = '', ...options } = request;

  if (!options.headers) {
    options.headers = {} as HeadersInit;
  }

  if (!options.credentials) {
    // https://github.com/github/fetch#sending-cookies
    options.credentials = 'include';
  }

  if (!(options.headers as any)['Content-Type']) {
    (options.headers as any)['Content-Type'] = 'application/json';
  }

  const resp: Response = yield call(fetch, url, {
    ...options,
  });

  if (resp.status === 204) {
    return {
      status: resp.status,
      ok: resp.ok,
      data: {},
    };
  }

  let data = {};
  try {
    data = yield call([resp, 'json']);
  } catch (err) {
    return { status: resp.status, ok: false, data: { message: err.message } };
  }

  if (!resp.ok) {
    return { status: resp.status, ok: false, data };
  }

  return {
    status: resp.status,
    ok: true,
    data,
  };
}

function* onFetchApi(ctx: FetchCtx, next: Next): ApiGen {
  const { url = '' } = ctx.request;
  if (!url) return;
  const env = yield select(selectEnv);
  const baseUrl = env.apiUrl;
  ctx.request.url = `${baseUrl}/api${url}`;

  ctx.response = yield call(fetchApi, ctx.request);
  yield next();
}

export const api = createApi<ApiCtx>();
api.use(requestMonitor());
api.use(api.routes());
api.use(requestParser());
api.use(onFetchApi);
