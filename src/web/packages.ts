import { createApp } from 'robodux';

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
];

const { reducer } = createApp(packages);
export { reducer };
