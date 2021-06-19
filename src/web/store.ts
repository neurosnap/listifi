import { createStore as createReduxStore, applyMiddleware } from 'redux';
import { Action } from 'robodux';
import createSagaMiddleware, { stdChannel } from 'redux-saga';
import { enableBatching, BATCH } from 'redux-batched-actions';
// import logger from 'redux-logger';

import { State } from '@app/types';
import { setClientId } from '@app/client-id';
import { resetReducer } from '@app/reset-store';

import { rootReducer, rootSaga } from './packages';

const processStorage = (action: any) => {
  if (action.type === `${setClientId}`) {
    localStorage.setItem('clientId', action.payload);
  }
};

const lsMiddleware = () => (next: any) => (action: any) => {
  if (action.type === BATCH) {
    action.payload.forEach(processStorage);
  } else {
    processStorage(action);
  }
  return next(action);
};

export const createStore = (initialState: Partial<State> = {}) => {
  const middleware: any[] = [lsMiddleware];

  const channel = stdChannel();
  const rawPut = channel.put;
  channel.put = (action: Action<any>) => {
    if (action.type === BATCH) {
      action.payload.forEach(rawPut);
      return;
    }
    rawPut(action);
  };

  const sagaMiddleware = createSagaMiddleware({ channel } as any);
  middleware.push(sagaMiddleware);

  const reducer = enableBatching(resetReducer(rootReducer));

  if (process.env.NODE_ENV === 'development') {
    // middleware.push(logger);
  }

  const store = createReduxStore(
    reducer,
    initialState as any,
    applyMiddleware(...middleware),
  );

  sagaMiddleware.run(rootSaga);

  return { store };
};
