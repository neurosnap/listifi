import { LoadingItemState, MapEntity } from 'robodux';
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

export interface State {
  env: Env;
  token: Token;
  lists: MapEntity<ListClient>;
  listItems: MapEntity<ListItemClient>;
  listItemIds: MapEntity<string[]>;
  listIdsPublic: string[];
  clientId: string;
  loaders: MapEntity<LoadingItemState>;
  stars: MapEntity<StarClient>;
  users: MapEntity<UserClient>;
  usernameStarIds: MapEntity<string[]>;
  verifyEmail: VerifyEmail;
  plugins: MapEntity<PluginClient>;
  comments: MapEntity<ListCommentClient>;
  suggestions: MapEntity<ListSuggestion>;
  data: MapEntity<any>;
}
