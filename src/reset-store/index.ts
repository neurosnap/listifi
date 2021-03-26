import { CLIENT_ID_SLICE } from '@app/client-id';
import { ENV_SLICE } from '@app/env';
import { State } from '@app/types';
import { Action, Reducer } from 'redux';
import { createAction } from 'robodux';

export const resetStore = createAction('RESET_STORE');

const keepState = (state: State | undefined): Partial<State> | undefined => {
  if (!state) {
    return state;
  }

  return { [CLIENT_ID_SLICE]: state.clientId, [ENV_SLICE]: { ...state.env } };
};

export const resetReducer = (reducer: Reducer) => (
  state: State | undefined,
  action: Action<any>,
) => {
  if (action.type === `${resetStore}`) {
    return reducer(keepState(state), action);
  }

  return reducer(state, action);
};
