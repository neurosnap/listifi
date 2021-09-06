import Router from '@koa/router';

import { extractListsFromSite } from '../services';
import { getBody, requireBody, sendBody } from '../body';

export const scrapeRouter = new Router({ prefix: '/api/scrape' });

scrapeRouter.post('/', async (ctx) => {
  requireBody(ctx, ['clientId', 'url']);
  const body = getBody<{ clientId: string; url: string }>(ctx);
  const resp = await extractListsFromSite(body.url);
  sendBody<{ lists: string[][] }>(ctx, resp);
});
