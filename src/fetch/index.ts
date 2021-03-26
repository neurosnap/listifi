import { call, select } from 'redux-cofx';
import { selectEnv } from '@app/env';
import { Env } from '@app/types';

interface FetchOptions {
  auth?: boolean;
}

type ApiOpts = RequestInit & FetchOptions;

export interface ApiFetchSuccess<Data = any> {
  status: number;
  ok: true;
  data: Data;
}

interface ApiFetchData {
  status: number;
  ok: false;
  data: {
    status: string;
    message: string;
  };
}

export type ApiFetchResponse<Data = any> = ApiFetchSuccess<Data> | ApiFetchData;

export function* apiFetch<Data = any>(
  uri: string,
  opts: ApiOpts = {},
): Generator<any, ApiFetchResponse<Data>, any> {
  const env: Env = yield select(selectEnv);
  // const auth = typeof opts.auth === 'undefined' ? true : opts.auth;
  const options = { ...opts };
  delete options.auth;

  const url = `${env.apiUrl}/api${uri}`;
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };

  /* if (auth) {
    const token = yield select(selectToken);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } */

  options.headers = headers;

  const res: Response = yield call(fetch, url, options);

  if (res.status === 204) {
    return {
      status: res.status,
      ok: res.ok,
      data: {},
    } as ApiFetchSuccess<Data>;
  }
  const data = yield call([res, 'json']);

  return { status: res.status, ok: res.ok, data };
}
