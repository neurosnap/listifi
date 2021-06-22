import ReactDOMServer from 'react-dom/server';
import { createElement as h } from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, HelmetData } from 'react-helmet-async';

import { App, createStore } from '@app/web';

export const renderServer = (url: string, store: any) => {
  const helmetContext = {};
  const appHtml = ReactDOMServer.renderToString(
    h(StaticRouter as any, { location: url }, [
      h(HelmetProvider, { key: 'helmet', context: helmetContext }, [
        h(App, { store, key: 'app' }, null),
      ]),
    ]),
  );
  const { helmet } = helmetContext as { helmet: HelmetData };

  return { appHtml, helmet };
};
