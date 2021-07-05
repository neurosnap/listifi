import * as env from '@app/env';
import * as token from '@app/token';
import * as lists from '@app/lists';
import * as clientId from '@app/client-id';
import * as loaders from '@app/loaders';
import * as users from '@app/users';
import * as verify from '@app/verify';
import * as plugins from '@app/plugins';
import * as comments from '@app/comments';
import * as pluginSuggestions from '@app/plugin-suggestions';
import * as api from '@app/api';
import * as bootup from '@app/bootup';
import * as activities from '@app/activities';

const packages: any[] = [
  env,
  token,
  lists,
  clientId,
  loaders,
  users,
  verify,
  plugins,
  comments,
  pluginSuggestions,
  api,
  bootup,
  activities,
];

export const sagas = packages.reduce(
  (acc, pkg) => {
    if (!pkg.sagas) return acc;
    return { ...acc, ...pkg.sagas };
  },
  { api: api.api.saga() },
);

export const reducers = packages.reduce((acc, pkg) => {
  if (!pkg.reducers) return acc;
  return { ...acc, ...pkg.reducers };
}, {});
