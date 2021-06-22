import React from 'react';
import { hydrate } from 'react-dom';
import debug from 'debug';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { bootup } from '@app/bootup';
import { setClientId } from '@app/client-id';

import { createStore } from './store';
import { App } from './app';

const log = debug('app:web');

function init() {
  log('initializing app ...');
  // Grab the state from a global variable injected into the server-generated HTML
  const preloadedState = (window as any).__PRELOADED_STATE__;
  // Allow the passed state to be garbage-collected
  delete (window as any).__PRELOADED_STATE__;
  const { store } = createStore(preloadedState);
  (window as any).reduxStore = store;

  const clientId = localStorage.getItem('clientId');
  store.dispatch(setClientId(clientId || ''));
  store.dispatch(bootup());

  hydrate(
    <BrowserRouter>
      <HelmetProvider>
        <App store={store} />
      </HelmetProvider>
    </BrowserRouter>,
    document.getElementById('app'),
  );
}

init();
