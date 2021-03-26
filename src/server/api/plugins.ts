import Router from '@koa/router';
import { getPlugins } from '../services';

export const pluginsRouter = new Router({ prefix: '/api/plugins' });

pluginsRouter.get('/', async (ctx) => {
  const plugins = await getPlugins();
  ctx.body = { plugins };
});
