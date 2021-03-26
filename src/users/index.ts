import { batch, call, createEffect, createEffects, put } from 'redux-cofx';
import {
  createReducerMap,
  createTable,
  MapEntity,
  mustSelectEntity,
} from 'robodux';

import { apiFetch, ApiFetchResponse } from '@app/fetch';
import {
  Loaders,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from '@app/loaders';
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

function* onFetchUser(id: string) {
  if (!id) {
    return;
  }

  yield put(setLoaderStart({ id: Loaders.fetchUser }));
  const resp: ApiFetchResponse<UserFetchResponse> = yield call(
    apiFetch,
    `/users/${id}`,
  );
  if (!resp.ok) {
    yield put(setLoaderError({ id: Loaders.fetchUser }));
    return;
  }

  const user = deserializeUserClient(resp.data.user);
  const listArr = resp.data.lists;
  const lists = listArr.reduce<MapEntity<ListClient>>((acc, list) => {
    acc[list.id] = deserializeList(list);
    return acc;
  }, {});
  yield batch([
    setLoaderSuccess({ id: Loaders.fetchUser }),
    addUsers({ [user.username]: user }),
    addLists(lists),
  ]);
}

function* onUpdateSettings(settings: UpdateSettings) {
  const loaderName = Loaders.updateSettings;
  yield put(setLoaderStart({ id: loaderName }));
  const res: ApiFetchResponse<ApiUpdateSettings> = yield call(
    apiFetch,
    '/settings',
    {
      method: 'POST',
      body: JSON.stringify(settings),
    },
  );

  if (!res.ok) {
    yield put(setLoaderError({ id: loaderName }));
    return;
  }

  const { token } = res.data;
  const users = processUsers([res.data.user]);
  yield batch([
    addUsers(users),
    setToken(token),
    setLoaderSuccess({ id: loaderName }),
  ]);
}

export const updateSettings = (u: UpdateSettings) =>
  createEffect(onUpdateSettings, u);
export const { fetchUser } = createEffects({
  fetchUser: onFetchUser,
});
