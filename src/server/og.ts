import Router from '@koa/router';

import { deserializeList, processListItems } from '@app/lists';
import { processComments } from '@app/comments';

import {
  // compileTemplate,
  generateImage,
  fetchListDetailData,
} from './services';

export const ogRouter = new Router({ prefix: '/og' });

ogRouter.get('/:username/:listname', async (ctx) => {
  const { username, listname } = ctx.params;
  const result = await fetchListDetailData(username, listname);
  if (!result.success) {
    ctx.body = '';
    return;
  }
  const list = deserializeList(result.data.list);
  const { items, itemIds } = processListItems(result.data.items);
  const comments = processComments(result.data.comments);

  const data = { list, itemIds, items, comments };
  const imageData = await generateImage(data);
  ctx.type = 'image/png';
  //const imageData = compileTemplate(data);
  // ctx.type = 'text/html';
  ctx.body = imageData;
});
