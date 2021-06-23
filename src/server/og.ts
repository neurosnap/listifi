import Router from '@koa/router';

import { deserializeList } from '@app/lists';

import { generateImage, fetchListDetailData } from './services';

export const ogRouter = new Router({ prefix: '/og' });

ogRouter.get('/:username/:listname/og.png', async (ctx) => {
  const { username, listname } = ctx.params;
  const result = await fetchListDetailData(username, listname);
  ctx.type = 'image/png';
  if (!result.success) {
    ctx.body = '';
    return;
  }
  const list = deserializeList(result.data.list);
  // const { items, itemIds } = processListItems(data.items);

  const imageData = await generateImage({ list });
  ctx.body = imageData;
});
