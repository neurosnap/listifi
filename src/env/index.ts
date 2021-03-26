import { createAssign, createReducerMap } from 'robodux';
import { Env, State } from '@app/types';

export const defaultEnv = (e: Partial<Env> = {}): Env => {
  return {
    googleClientId: '',
    nodeEnv: 'development',
    apiUrl: '/',
    ...e,
  };
};

export const ENV_SLICE = 'env';
const slice = createAssign({ name: ENV_SLICE, initialState: defaultEnv() });
export const { set: setEnv, reset: resetEnv } = slice.actions;

export const selectEnv = (state: State): Env => state[ENV_SLICE];

export const reducers = createReducerMap(slice);
