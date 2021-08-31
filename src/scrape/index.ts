import { api } from '@app/api';
import { select } from 'redux-saga/effects';
import { ApiGen } from '@app/types';

import { selectClientId } from '@app/client-id';

export const scrape = api.post<{ url: string }>(
  '/scrape',
  function* scraper(ctx, next): ApiGen {
    const clientId = yield select(selectClientId);
    ctx.request = {
      body: JSON.stringify({
        url: ctx.payload.url,
        clientId,
      }),
      quickSave: true,
    };
    yield next();
  },
);
