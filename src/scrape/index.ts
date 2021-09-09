import { leading } from 'saga-query';

import { scrapeApi } from '@app/api';
import { ApiGen } from '@app/types';

export const scrape = scrapeApi.post<{ url: string }>(
  '/scrape',
  { saga: leading },
  function* scraper(ctx, next): ApiGen {
    ctx.request = {
      body: JSON.stringify({
        url: ctx.payload.url,
      }),
      simpleCache: true,
    };
    yield next();
  },
);
