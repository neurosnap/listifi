import Router from '@koa/router';

import { deserializeList, processListItems } from '@app/lists';
import { processComments } from '@app/comments';

import { generateImage, fetchListDetailData } from './services';

export const ogRouter = new Router({ prefix: '/og' });

ogRouter.get('/:username/:listname', async (ctx) => {
  const { username, listname } = ctx.params;
  const result = await fetchListDetailData(username, listname);
  ctx.type = 'image/png';
  if (!result.success) {
    ctx.body = '';
    return;
  }
  const list = deserializeList(result.data.list);
  const { items, itemIds } = processListItems(result.data.items);
  const comments = processComments(result.data.comments);

  const imageData = await generateImage({ list, itemIds, items, comments });
  ctx.body = imageData;
});
