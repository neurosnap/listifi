import { call, select } from 'redux-saga/effects';
import {
  createApi,
  requestMonitor,
  simpleCache,
  urlParser,
  Next,
  ApiCtx,
} from 'saga-query';

import { selectEnv } from '@app/env';
import { ApiGen } from '@app/types';

interface FetchApiOpts extends RequestInit {
  url?: string;
}

function* fetchApi(request: FetchApiOpts): ApiGen<ApiCtx['response']> {
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

function* onFetchApi(baseUrl: string, ctx: ApiCtx, next: Next): ApiGen {
  const { url = '' } = ctx.request;
  if (!url) return;
  ctx.request.url = `${baseUrl}/api${url}`;
  ctx.response = yield call(fetchApi, ctx.request);
  yield next();
}

function* useFetchApi(ctx: ApiCtx, next: Next): ApiGen<any> {
  const env = yield select(selectEnv);
  const baseUrl = env.apiUrl;
  yield call(onFetchApi, baseUrl, ctx, next);
}

function* useScrapeApi(ctx: ApiCtx, next: Next): ApiGen<any> {
  const env = yield select(selectEnv);
  const baseUrl = env.apiScrapeUrl;
  (ctx.request as any).credentials = 'omit';
  yield call(onFetchApi, baseUrl, ctx, next);
}

export const api = createApi<ApiCtx>();
api.use(requestMonitor());
api.use(api.routes());
api.use(urlParser);
api.use(simpleCache);
api.use(useFetchApi);

export const scrapeApi = createApi<ApiCtx>();
scrapeApi.use(requestMonitor());
scrapeApi.use(scrapeApi.routes());
scrapeApi.use(urlParser);
scrapeApi.use(simpleCache);
scrapeApi.use(useScrapeApi);
