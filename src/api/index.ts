import { call, put, select } from 'redux-saga/effects';
import { Action, createTable, createReducerMap } from 'robodux';
import { createApi, queryCtx, urlParser, FetchCtx, Next } from 'saga-query';
import { batchActions } from 'redux-batched-actions';

import { selectEnv } from '@app/env';
import { State, ApiGen } from '@app/types';
import { loaders } from '@app/loaders';

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
  ctx.request.url = `${baseUrl}${url}`;

  ctx.response = yield call(fetchApi, ctx.request);
  yield next();
}

function* trackLoading(
  ctx: {
    name: string;
    actions: Action[];
    payload: FetchCtx['payload'];
    response: FetchCtx['response'];
  },
  next: Next,
) {
  const id = ctx.name;
  yield put(loaders.actions.loading({ id }));

  yield next();

  if (!ctx.response.ok) {
    ctx.actions.push(
      loaders.actions.error({ id, message: ctx.response.data.message }),
    );
    return;
  }

  ctx.actions.push(loaders.actions.success({ id }));
}

export function* dispatchActions(ctx: { actions: Action[] }, next: Next) {
  yield next();
  if (ctx.actions.length === 0) return;
  yield put(batchActions(ctx.actions));
}

const DATA_NAME = 'data';
const data = createTable<any>({ name: DATA_NAME });
export const { selectById: selectDataById } = data.getSelectors(
  (s: State) => s[DATA_NAME],
);
export const reducers = createReducerMap(data);
function* quickSave(ctx: ApiCtx, next: Next) {
  yield next();
  if (!ctx.response.ok) return;
  if (!ctx.request.quickSave) return;
  ctx.actions.push(
    data.actions.add({
      [JSON.stringify(ctx.action)]: ctx.response.data,
    }),
  );
}

export const api = createApi<ApiCtx>();
api.use(dispatchActions);
api.use(api.routes());
api.use(queryCtx);
api.use(urlParser);
api.use(quickSave);
api.use(trackLoading);
api.use(onFetchApi);
