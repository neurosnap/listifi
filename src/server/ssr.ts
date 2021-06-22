import ReactDOMServer from 'react-dom/server';
import path from 'path';
import fs from 'fs';
import Router from '@koa/router';
import util from 'util';
import { ParameterizedContext } from 'koa';
import { ViteDevServer } from 'vite';

import { App, createStore } from '@app/web';
import { defaultEnv } from '@app/env';
import { deserializeUserClient, processUsers, USERS_SLICE } from '@app/users';
import {
  HOME_URL,
  LIST_DETAIL_URL,
  LIST_CREATE_URL,
  LOGIN_URL,
  REGISTER_URL,
  EXPLORE_URL,
  PROFILE_URL,
  VERIFY_URL,
  TERMS_URL,
  PRIVACY_URL,
  LIST_ITEM_DETAIL_URL,
  EXPLORE_BY_URL,
  SETTINGS_URL,
  AUTH_USERNAME_URL,
  ABOUT_URL,
} from '@app/routes';
import { State } from '@app/types';
import {
  deserializeList,
  LISTS_SLICE,
  LIST_ITEMS_SLICE,
  LIST_ITEM_IDS_SLICE,
  processListItems,
  processLists,
  processStars,
  STARS_SLICE,
  USERNAME_STAR_IDS_SLICE,
} from '@app/lists';
import { VERIFY_EMAIL_SLICE, defaultVerifyEmail } from '@app/verify';
import { COMMENTS_SLICE, processComments } from '@app/comments';
import { PLUGIN_SLICE, processPlugins } from '@app/plugins';

import { env as serverEnv } from './env';
import { KoaState } from './koa';
import { getCookie } from './cookie';
import {
  getStarsForUser,
  verifyEmail,
  fetchListDetailData,
  fetchPublicListData,
  getUserProfileData,
  getPlugins,
} from './services';
import { db } from './knex';

const readFile = util.promisify(fs.readFile);

const notFoundData = {
  state: {},
};

async function getPluginData() {
  const pluginsDb = await getPlugins();
  const plugins = processPlugins(pluginsDb);
  return {
    state: {
      [PLUGIN_SLICE]: plugins,
    },
  };
}

async function getUserData(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, Record<string, unknown>>
  >,
) {
  const { user } = ctx.state;
  if (!user) {
    return { state: { [LISTS_SLICE]: {}, [USERS_SLICE]: {} } };
  }
  const results = await getStarsForUser(user.username);
  const userData = await db('app_users').where('id', user.id).first();
  if (!results.success || !userData) {
    return { state: { [LISTS_SLICE]: {}, [USERS_SLICE]: {} } };
  }

  const stars = processStars(results.data.stars);
  const lists = processLists(results.data.lists);
  const starIds = results.data.stars.map((s) => s.id);

  const { state: pluginState } = await getPluginData();

  return {
    state: {
      ...pluginState,
      [STARS_SLICE]: stars,
      [LISTS_SLICE]: lists,
      [USERNAME_STAR_IDS_SLICE]: { [user.username]: starIds },
      [USERS_SLICE]: { [userData.id]: deserializeUserClient(userData) },
    },
  };
}

async function listDetailData(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, Record<string, unknown>>
  >,
) {
  const { username, listname } = ctx.params;
  const result = await fetchListDetailData(username, listname);
  if (!result.success) {
    return notFoundData;
  }
  const { data } = result;
  const list = deserializeList(data.list);
  const { items, itemIds } = processListItems(data.items);
  const comments = processComments(result.data.comments);
  const users = processUsers(result.data.users);

  const { state } = await getUserData(ctx);
  const { state: pluginState } = await getPluginData();

  return {
    state: {
      ...state,
      ...pluginState,
      [LISTS_SLICE]: { ...state[LISTS_SLICE], [list.id]: list },
      [LIST_ITEMS_SLICE]: items,
      [LIST_ITEM_IDS_SLICE]: { [list.id]: itemIds },
      [COMMENTS_SLICE]: comments,
      [USERS_SLICE]: { ...state[USERS_SLICE], ...users },
    },
  };
}

async function exploreData() {
  const data = await fetchPublicListData();
  const lists = processLists(data.lists);
  const users = processUsers(data.users);
  const { state: pluginState } = await getPluginData();

  return {
    state: {
      ...pluginState,
      [LISTS_SLICE]: lists,
      [USERS_SLICE]: users,
    },
  };
}

async function verifyEmailData(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, Record<string, unknown>>
  >,
) {
  const { id, code } = ctx.params;
  const result = await verifyEmail(ctx, { id, code });
  if (!result.success) {
    return {
      state: {
        [VERIFY_EMAIL_SLICE]: defaultVerifyEmail({
          success: false,
          error: true,
          data: result.data,
        }),
      },
    };
  }

  return {
    state: {
      [VERIFY_EMAIL_SLICE]: defaultVerifyEmail({
        success: true,
        error: false,
      }),
    },
  };
}

async function profileData(
  ctx: ParameterizedContext<
    KoaState,
    Router.RouterParamContext<any, Record<string, unknown>>
  >,
) {
  const { username } = ctx.params;
  const curUser = ctx.state.user;
  const result = await getUserProfileData(curUser?.id || '', username);
  if (!result.success) {
    return notFoundData;
  }

  const user = deserializeUserClient(result.data.user);
  const lists = processLists(result.data.lists);

  const { state } = await getUserData(ctx);
  const { state: pluginState } = await getPluginData();

  return {
    state: {
      ...state,
      ...pluginState,
      [LISTS_SLICE]: { ...state[LISTS_SLICE], ...lists },
      [USERS_SLICE]: { [user.username]: user },
    },
  };
}

interface RouteData {
  state: Partial<State>;
}
interface RouteConfig {
  route: string;
  data: (
    ctx: ParameterizedContext<
      KoaState,
      Router.RouterParamContext<any, Record<string, unknown>>
    >,
  ) => Promise<RouteData>;
}

const defaultRouteConfig = (config: Partial<RouteConfig> = {}): RouteConfig => {
  return {
    route: '',
    data: () =>
      Promise.resolve({
        state: {},
      }),
    ...config,
  };
};

const routes = [
  defaultRouteConfig({ route: HOME_URL, data: exploreData }),
  defaultRouteConfig({
    route: LIST_DETAIL_URL,
    data: listDetailData,
  }),
  defaultRouteConfig({
    route: LIST_ITEM_DETAIL_URL,
    data: listDetailData,
  }),
  defaultRouteConfig({ route: LIST_CREATE_URL }),
  defaultRouteConfig({ route: LOGIN_URL }),
  defaultRouteConfig({ route: REGISTER_URL }),
  defaultRouteConfig({ route: EXPLORE_URL, data: exploreData }),
  defaultRouteConfig({ route: EXPLORE_BY_URL, data: exploreData }),
  defaultRouteConfig({ route: PROFILE_URL, data: profileData }),
  defaultRouteConfig({ route: VERIFY_URL, data: verifyEmailData }),
  defaultRouteConfig({ route: TERMS_URL }),
  defaultRouteConfig({ route: PRIVACY_URL }),
  defaultRouteConfig({ route: SETTINGS_URL }),
  defaultRouteConfig({ route: AUTH_USERNAME_URL }),
  defaultRouteConfig({ route: ABOUT_URL }),
];

function createSSR(config: RouteConfig, vite: ViteDevServer) {
  return async function ssrFn(
    ctx: ParameterizedContext<
      KoaState,
      Router.RouterParamContext<any, Record<string, unknown>>
    >,
  ) {
    const loadedData = await config.data(ctx);
    const env = defaultEnv({
      googleClientId: serverEnv.googleClientId,
      nodeEnv: serverEnv.nodeEnv,
      apiUrl: serverEnv.apiUrl,
    });
    const token = getCookie(ctx);
    const { store } = createStore({ env, token, ...loadedData.state });

    const indexFile = path.resolve(__dirname, '..', '..', 'index.html');
    let template = await readFile(indexFile, 'utf8');

    // 2. Apply vite HTML transforms. This injects the vite HMR client, and
    //    also applies HTML transforms from Vite plugins, e.g. global preambles
    //    from @vitejs/plugin-react-refresh
    template = await vite.transformIndexHtml(ctx.url, template);

    const { renderServer } = await vite.ssrLoadModule(
      '/src/web/entry-server.ts',
    );

    // 4. render the app HTML. This assumes entry-server.js's exported `render`
    //    function calls appropriate framework SSR APIs,
    //    e.g. ReactDOMServer.renderToString()
    const { appHtml, helmet } = renderServer(ctx.url, store);

    // 5. Inject the app-rendered HTML into the template.
    let html = template.replace(`<!--ssr-outlet-->`, appHtml);
    html = html.replace(
      '{{data}}',
      JSON.stringify(store.getState()).replace(/</g, '\\u003c'),
    );
    html = html.replace('{{title}}', helmet.title.toString());
    html = html.replace('{{meta}}', helmet.meta.toString());
    html = html.replace('{{link}}', helmet.link.toString());
    html = html.replace('{{bodyAttributes}}', helmet.bodyAttributes.toString());
    html = html.replace('{{htmlAttributes}}', helmet.htmlAttributes.toString());

    ctx.set('Content-Type', 'text/html');
    ctx.status = 200;
    ctx.body = html;
  };
}

export function createRoutes(vite: ViteDevServer) {
  const ssr = new Router();
  const notFound = createSSR(defaultRouteConfig({ route: '/404' }), vite);

  routes.forEach((routeConfig) => {
    ssr.get(routeConfig.route, createSSR(routeConfig, vite));
  });
  return { ssr, notFound };
}
