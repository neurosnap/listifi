import Router from '@koa/router';
import { ParameterizedContext } from 'koa';
import debug from 'debug';

import { deserializeList, processListItems } from '@app/lists';
import { processComments } from '@app/comments';

import { KoaState } from '../koa';
import {
  // compileTemplate,
  generateImage,
  fetchListDetailData,
  TemplateData,
} from '../services';

import { redisGet, redisSet } from '../redis';

const log = debug('server:og');

export const ogRouter = new Router({ prefix: '/og' });

interface RedisCache {
  data: string;
  expiresAt: string;
}

function getKey(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, { [key: string]: any }>
  >,
) {
  const { username, listname } = ctx.params;
  return `${username}/${listname}`;
}

async function processImage(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, { [key: string]: any }>
  >,
  data: TemplateData,
) {
  const key = getKey(ctx);
  const imageData = await generateImage(data);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  redisSet(
    key,
    JSON.stringify({
      expiresAt: tomorrow.toISOString(),
      data: imageData.toString('base64'),
    }),
  );

  ctx.type = 'image/png';
  // const imageData = await compileTemplate(data);
  // ctx.type = 'text/html';
  ctx.body = imageData;
}

ogRouter.get('/:username/:listname', async (ctx) => {
  const { username, listname } = ctx.params;
  const result = await fetchListDetailData(username, listname);
  if (!result.success) {
    ctx.throw(404, 'list not found');
    return;
  }
  const list = deserializeList(result.data.list);
  const { items, itemIds } = processListItems(result.data.items);
  const comments = processComments(result.data.comments);
  const data = { list, itemIds, items, comments };
  const key = getKey(ctx);

  const cache = await redisGet(key);
  if (cache) {
    const jso: RedisCache = JSON.parse(cache);
    if (new Date(jso.expiresAt) < new Date()) {
      log(`${key} has expired, processing new image`);
      await processImage(ctx, data);
      return;
    }

    log(`${key} cache found, using it`);
    ctx.type = 'image/png';
    const buff = Buffer.from(jso.data, 'base64');
    ctx.body = buff;
    return;
  }

  log(`${key} no cache found, processing new image`);
  await processImage(ctx, data);
});
