import { createStore as createReduxStore, applyMiddleware } from 'redux';
import { prepareStore, BATCH } from 'saga-query';
// import logger from 'redux-logger';

import { State } from '@app/types';
import { setClientId } from '@app/client-id';
import { resetReducer } from '@app/reset-store';

import { reducers, sagas } from './packages';

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
  const prepared = prepareStore({
    reducers,
    sagas,
  });
  const middleware: any[] = [lsMiddleware, ...prepared.middleware];
  const reducer = resetReducer(prepared.reducer);

  if (process.env.NODE_ENV === 'development') {
    // middleware.push(logger);
  }

  const store = createReduxStore(
    reducer,
    initialState as any,
    applyMiddleware(...middleware),
  );

  prepared.run();

  return { store };
};
