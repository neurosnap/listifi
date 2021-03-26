import { createStore as createReduxStore, applyMiddleware } from 'redux';
import {
  createMiddleware,
  enableBatching,
  BATCH,
  BATCH_ACTIONS,
} from 'redux-cofx';
// import logger from 'redux-logger';

import { State } from '@app/types';
import { setClientId } from '@app/client-id';
import { resetReducer } from '@app/reset-store';

import { reducer } from './packages';

const processStorage = (action: any) => {
  if (action.type === `${setClientId}`) {
    localStorage.setItem('clientId', action.payload);
  }
};

const lsMiddleware = () => (next: any) => (action: any) => {
  if (action.type === `${BATCH}` || action.type === `${BATCH_ACTIONS}`) {
    action.payload.forEach(processStorage);
  } else {
    processStorage(action);
  }
  return next(action);
};

export const createStore = (initialState: Partial<State> = {}) => {
  const rootReducer = enableBatching(resetReducer(reducer));

  const middleware: any[] = [lsMiddleware];
  if (process.env.NODE_ENV === 'development') {
    // middleware.push(logger);
  }
  const cofx = createMiddleware();
  middleware.push(cofx.middleware);

  const store = createReduxStore(
    rootReducer,
    initialState as any,
    applyMiddleware(...middleware),
  );

  return { store, emitter: cofx.emitter };
};
