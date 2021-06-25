import Router from '@koa/router';

import { generateListDetailImage } from '../services';

export const ogRouter = new Router({ prefix: '/og' });

ogRouter.get('/:username/:listname', async (ctx) => {
  const { username, listname } = ctx.params;
  const result = await generateListDetailImage(username, listname);
  if (!result.success) {
    return ctx.throw(result.data.status, result.data.message);
  }

  ctx.type = 'image/png';
  ctx.body = result.data;
});
