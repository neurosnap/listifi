import {
  createReducerMap,
  createTable,
  MapEntity,
  mustSelectEntity,
} from 'robodux';

import { api, ApiCtx } from '@app/api';
import {
  ApiUpdateSettings,
  ListClient,
  State,
  UpdateSettings,
  UserClient,
  UserFetchResponse,
  UserResponse,
} from '@app/types';
import { addLists, deserializeList } from '@app/lists';
import { deserializeDate } from '@app/model-helpers';
import { setToken } from '@app/token';

export const USERS_SLICE = 'users';
const slice = createTable<UserClient>({ name: USERS_SLICE });
export const { add: addUsers } = slice.actions;
export const reducers = createReducerMap(slice);

export const defaultUserClient = (u: Partial<UserClient> = {}): UserClient => {
  const now = new Date().toISOString();
  return {
    id: '',
    email: '',
    username: '',
    isGuest: false,
    createdAt: now,
    picture: '',
    name: '',
    ...u,
  };
};

export const deserializeUserClient = (r: UserResponse): UserClient => {
  return {
    id: r.id,
    email: r.email,
    username: r.username || '',
    isGuest: r.is_guest || false,
    picture: r.picture || '',
    name: r.name || '',
    createdAt: deserializeDate(r.created_at),
  };
};

export const processUsers = (users: UserResponse[]) => {
  return users
    .map(deserializeUserClient)
    .reduce<MapEntity<UserClient>>((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
};

const initUserClient = defaultUserClient();
const selectors = slice.getSelectors((state: State) => state[USERS_SLICE]);
const must = mustSelectEntity(initUserClient);
export const selectUserById = must(selectors.selectById);

export const fetchUser = api.get<{ username: string }>(
  '/users/:username',
  function* (ctx: ApiCtx<UserFetchResponse>, next) {
    yield next();
    if (!ctx.response.ok) return;

    const { data } = ctx.response;
    const user = deserializeUserClient(data.user);
    const listArr = data.lists;
    const lists = listArr.reduce<MapEntity<ListClient>>((acc, list) => {
      acc[list.id] = deserializeList(list);
      return acc;
    }, {});
    ctx.actions.push(addUsers({ [user.username]: user }), addLists(lists));
  },
);

export const updateSettings = api.post<UpdateSettings>('/settings', function* (
  ctx: ApiCtx<ApiUpdateSettings, UpdateSettings>,
  next,
) {
  ctx.request = {
    body: JSON.stringify(ctx.payload),
  };
  yield next();
  if (!ctx.response.ok) return;
  const { data } = ctx.response;
  const { token } = data;
  const users = processUsers([data.user]);
  ctx.actions.push(addUsers(users), setToken(token));
});
