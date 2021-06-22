import Koa, { ParameterizedContext } from 'koa';
import debug from 'debug';
import shutdown from 'http-graceful-shutdown';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import { createServer as createViteServer } from 'vite';
import c2k from 'koa-connect';

import { env, jwtOptions } from './env';
import { errorHandler } from './error-handler';
import { createRoutes } from './ssr';
import { jwtUser } from './jwt-user';
import { KoaState } from './koa';
import {
  userRouter,
  authRouter,
  pluginsRouter,
  commentsRouter,
  searchRouter,
  listRouter,
  votingRouter,
  listItemsRouter,
  suggestionsRouter,
  settingsRouter,
} from './api';
import { db } from './knex';

createServer();

async function createServer() {
  const app = new Koa();
  const log = debug('server:index');

  console.log(env);

  app.keys = [env.secret];

  app.on('error', (err) => {
    log('server error:', err);
  });

  app
    .use(
      cors({
        origin: '*',
      }),
    )
    .use(bodyParser())
    .use(errorHandler)
    .use(jwtUser(jwtOptions));

  // Create vite server in middleware mode. This disables Vite's own HTML
  // serving logic and let the parent server take control.
  //
  // If you want to use Vite's own HTML serving logic (using Vite as
  // a development middleware), using 'html' instead.
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' },
  });
  // use vite's connect instance as middleware
  app.use(c2k(vite.middlewares));
  const { ssr, notFound } = createRoutes(vite);

  app
    .use(userRouter.routes())
    .use(userRouter.allowedMethods())
    .use(authRouter.routes())
    .use(userRouter.allowedMethods())
    .use(pluginsRouter.routes())
    .use(pluginsRouter.allowedMethods())
    .use(commentsRouter.routes())
    .use(commentsRouter.allowedMethods())
    .use(searchRouter.routes())
    .use(searchRouter.allowedMethods())
    .use(listRouter.routes())
    .use(listRouter.allowedMethods())
    .use(listItemsRouter.routes())
    .use(listItemsRouter.allowedMethods())
    .use(votingRouter.routes())
    .use(votingRouter.allowedMethods())
    .use(suggestionsRouter.routes())
    .use(suggestionsRouter.allowedMethods())
    .use(settingsRouter.routes())
    .use(settingsRouter.allowedMethods())
    .use(ssr.routes())
    .use(ssr.allowedMethods())
    .use(serve('./public'));

  app.use(async (ctx: ParameterizedContext<KoaState, any>) => {
    if (ctx.status === 404) {
      await notFound(ctx);
      ctx.status = 404;
    }
  });

  const { port } = env;
  const server = app.listen(port, () => {
    log(`server started on port ${port}`);
  });

  async function onShutdown() {
    await db.destroy();
  }

  shutdown(server, {
    signals: 'SIGINT SIGTERM SIGHUP',
    timeout: 30000,
    development: false,
    onShutdown,
    finally: () => {
      log('server shutdown!');
    },
  });
}
