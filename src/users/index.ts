import {
  createReducerMap,
  createTable,
  MapEntity,
  mustSelectEntity,
} from 'robodux';
import { createSelector } from 'reselect';

import { api, ApiCtx } from '@app/api';
import {
  ApiUpdateSettings,
  State,
  UpdateSettings,
  UserClient,
  UserFetchResponse,
  UserResponse,
} from '@app/types';
import {
  addLists,
  addListItems,
  addListItemIds,
  processLists,
  processListItemsForLists,
} from '@app/lists';
import { addComments, processComments } from '@app/comments';
import { processActivities, addActivities } from '@app/activities';
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
export const selectUserByName = createSelector(
  selectors.selectTableAsList,
  (_: State, p: { username: string }) => p.username,
  (users, username) => {
    return (
      users.find((u) => u.username === username) ||
      defaultUserClient({ username })
    );
  },
);

export const fetchUser = api.get<{ username: string }>(
  '/users/:username',
  function* (ctx: ApiCtx<UserFetchResponse, { username: string }>, next) {
    yield next();
    if (!ctx.response.ok) return;

    const { data } = ctx.response;
    const activities = processActivities(ctx.payload.username, data.activities);
    const users = processUsers(data.users);
    const lists = processLists(data.lists);
    const comments = processComments(data.comments);
    const { itemMap, listItemIdMap } = processListItemsForLists(data.items);

    ctx.actions.push(
      addActivities(activities),
      addUsers(users),
      addLists(lists),
      addListItems(itemMap),
      addListItemIds(listItemIdMap),
      addComments(comments),
    );
  },
);

export const updateSettings = api.post<UpdateSettings>(
  '/settings',
  function* (ctx: ApiCtx<ApiUpdateSettings, UpdateSettings>, next) {
    ctx.request = {
      body: JSON.stringify(ctx.payload),
    };
    yield next();
    if (!ctx.response.ok) return;
    const { data } = ctx.response;
    const { token } = data;
    const users = processUsers([data.user]);
    ctx.actions.push(addUsers(users), setToken(token));
  },
);
