import { MapEntity } from 'robodux';
import { QueryState } from 'saga-query';

import { ListCommentClient } from './comments';
import { Env } from './env';
import { ListItemClient } from './list-items';
import { ListClient } from './lists';
import { PluginClient } from './plugins';
import { StarClient } from './stars';
import { ListSuggestion } from './suggestions';
import { Token } from './token';
import { UserClient } from './user';
import { VerifyEmail } from './verify';
import { ActivityClient } from './activity';

export interface State extends QueryState {
  env: Env;
  token: Token;
  lists: MapEntity<ListClient>;
  listItems: MapEntity<ListItemClient>;
  listItemIds: MapEntity<string[]>;
  listIdsPublic: string[];
  clientId: string;
  stars: MapEntity<StarClient>;
  users: MapEntity<UserClient>;
  usernameStarIds: MapEntity<string[]>;
  verifyEmail: VerifyEmail;
  plugins: MapEntity<PluginClient>;
  comments: MapEntity<ListCommentClient>;
  suggestions: MapEntity<ListSuggestion>;
  activities: MapEntity<ActivityClient[]>;
}
