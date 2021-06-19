import { batch, call, createEffects, put, select } from 'redux-cofx';
import { MapEntity } from 'robodux';

import { apiFetch, ApiFetchResponse } from '@app/fetch';
import {
  UpsertList,
  UpsertListItem,
  ListClient,
  ListItemClient,
  ListItemResponse,
  ListResponse,
  StarResponse,
  StarClient,
  FetchListResponse,
  ApiListsResponse,
  ApiStarsResponse,
  BulkCreateListResponse,
  ApiOrderResponse,
  ApiGen,
} from '@app/types';
import {
  deleteItemLoader,
  fetchListLoader,
  Loaders,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from '@app/loaders';
import { selectHasTokenExpired } from '@app/token';
import { addUsers, processUsers } from '@app/users';
import { processComments, addComments } from '@app/comments';

import {
  deserializeList,
  deserializeListItem,
  deserializeStar,
} from './serializers';
import { selectItemIdsByList, selectListById } from './selectors';
import {
  addListItemIds,
  addListItems,
  addLists,
  removeLists,
  removeListItemIds,
  removeListItems,
  addStars,
  removeStars,
  patchLists,
  addUsernameStarIds,
} from './slice';

export function processLists(lists: ListResponse[]) {
  return lists.reduce<MapEntity<ListClient>>((acc, list) => {
    acc[list.id] = deserializeList(list);
    return acc;
  }, {});
}

export function processStars(stars: StarResponse[]) {
  return stars.reduce<MapEntity<StarClient>>((acc, star) => {
    acc[star.list_id] = deserializeStar(star);
    return acc;
  }, {});
}

export function processListItems(itemsArr: ListItemResponse[]) {
  const itemIds: string[] = [];
  const items = itemsArr.reduce<MapEntity<ListItemClient>>((acc, item) => {
    itemIds.push(item.id);
    acc[item.id] = deserializeListItem(item);
    return acc;
  }, {});

  return { items, itemIds };
}

function* onCreateList(payload: UpsertList) {
  const loader = Loaders.createList;
  yield put(setLoaderStart({ id: loader }));
  const resp: ApiFetchResponse<BulkCreateListResponse> = yield call(
    apiFetch,
    '/lists',
    {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description,
        public: payload.public,
        items: payload.items,
        plugins: payload.plugins,
      }),
    },
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loader, message: resp.data.message }));
    return;
  }

  const list = deserializeList(resp.data.list);
  const listIds: string[] = [];
  const items = resp.data.items.reduce<MapEntity<ListItemClient>>(
    (acc, item) => {
      acc[item.id] = deserializeListItem(item);
      listIds.push(item.id);
      return acc;
    },
    {},
  );
  yield batch([
    setLoaderSuccess({ id: loader, meta: { list } }),
    addLists({ [list.id]: list }),
    addListItems(items),
    addListItemIds({ [list.id]: listIds }),
  ]);
}

function* onUpdateList(payload: UpsertList) {
  const { id, ...data } = payload;
  if (!id) {
    return;
  }

  const loader = Loaders.updateList;

  yield put(setLoaderStart({ id: loader }));
  const resp: ApiFetchResponse<ListResponse> = yield call(
    apiFetch,
    `/lists/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        public: data.public,
        plugins: data.plugins,
      }),
    },
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loader, message: resp.data.message }));
    return;
  }

  const list = deserializeList(resp.data);
  yield batch([
    addLists({ [list.id]: list }),
    setLoaderSuccess({ id: loader, meta: { list } }),
  ]);
}

export function* onFetchLists(): ApiGen {
  const hasTokenExpired = yield select(selectHasTokenExpired);
  if (hasTokenExpired) {
    return;
  }

  const resp: ApiFetchResponse<ApiListsResponse> = yield call(
    apiFetch,
    '/lists',
  );

  if (!resp.ok) {
    return;
  }

  const users = processUsers(resp.data.users);
  const lists = processLists(resp.data.lists);
  yield batch([addLists(lists), addUsers(users)]);
}

export function* onFetchPublicLists() {
  const resp: ApiFetchResponse<ApiListsResponse> = yield call(
    apiFetch,
    '/lists/public',
  );

  if (!resp.ok) {
    return;
  }

  const lists = processLists(resp.data.lists);
  const users = processUsers(resp.data.users);
  yield batch([addLists(lists), addUsers(users)]);
}

export function* onFetchStars(username: string) {
  if (!username) {
    return;
  }

  const resp: ApiFetchResponse<ApiStarsResponse> = yield call(
    apiFetch,
    `/users/${username}/stars`,
  );

  if (!resp.ok) {
    return;
  }

  const stars = processStars(resp.data.stars);
  const lists = processLists(resp.data.lists);
  const starIds = resp.data.stars.map((s) => s.id);
  yield batch([
    addStars(stars),
    addLists(lists),
    addUsernameStarIds({ [username]: starIds }),
  ]);
}

const isEmpty = (obj: any) =>
  Object.keys(obj).length === 0 && obj.constructor === Object;

function* onStarList(listId: string) {
  const resp: ApiFetchResponse<StarResponse> = yield call(
    apiFetch,
    `/lists/${listId}/star`,
    {
      method: 'POST',
    },
  );

  if (!resp.ok) {
    return;
  }

  const list: ListClient = yield select(selectListById, { id: listId });
  if (isEmpty(resp.data)) {
    yield batch([
      removeStars([listId]),
      patchLists({ [listId]: { stars: list.stars - 1 } }),
    ]);
  } else {
    const star = deserializeStar(resp.data);
    yield batch([
      addStars({ [star.listId]: star }),
      patchLists({ [listId]: { stars: list.stars + 1 } }),
    ]);
  }
}

function* onCreateListItem(payload: UpsertListItem): ApiGen {
  const { listId } = payload;
  const loader = Loaders.createItem;

  yield put(setLoaderStart({ id: loader }));

  const resp: ApiFetchResponse<ListItemResponse> = yield call(
    apiFetch,
    `/lists/${listId}/items`,
    {
      method: 'POST',
      body: JSON.stringify({
        text: payload.text,
      }),
    },
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loader }));
    return;
  }

  const listItem = deserializeListItem(resp.data);
  const itemIds = yield select(selectItemIdsByList, { id: listId });
  yield batch([
    addListItems({ [listItem.id]: listItem }),
    addListItemIds({ [listId]: [...itemIds, listItem.id] }),
    setLoaderSuccess({ id: loader, message: listItem.id }),
  ]);
}

function* onCreateListItemBulk(payload: UpsertListItem): ApiGen {
  const { listId } = payload;
  const loader = Loaders.createItem;

  yield put(setLoaderStart({ id: loader }));

  const resp: ApiFetchResponse<BulkCreateListResponse> = yield call(
    apiFetch,
    `/lists/${listId}/bulk`,
    {
      method: 'POST',
      body: JSON.stringify({
        text: payload.text,
      }),
    },
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loader }));
    return;
  }

  const list = deserializeList(resp.data.list);
  const { items, itemIds } = processListItems(resp.data.items);
  const curItemIds = yield select(selectItemIdsByList, { id: listId });
  yield batch([
    addLists({ [list.id]: list }),
    addListItems(items),
    addListItemIds({
      [listId]: [...curItemIds, ...itemIds],
    }),
    setLoaderSuccess({ id: loader }),
  ]);
}

export function* onUpdateListItem(payload: UpsertListItem) {
  const { listId } = payload;
  const { id, text, metadata, notes } = payload;
  if (!id) {
    return;
  }

  const loader = Loaders.updateListItem;
  yield put(setLoaderStart({ id: loader }));
  const resp: ApiFetchResponse<ListItemResponse> = yield call(
    apiFetch,
    `/lists/${listId}/items/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        text,
        notes,
        metadata,
      }),
    },
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loader, message: resp.data.message }));
    return;
  }

  const listItem = deserializeListItem(resp.data);
  yield batch([
    addListItems({ [listItem.id]: listItem }),
    setLoaderSuccess({ id: loader, message: listItem.id }),
  ]);
}

interface OrderListItems {
  listId: string;
  order: string[];
}

function* onOrderListItems(payload: OrderListItems): ApiGen {
  const { listId, order } = payload;

  const curListIds = yield select(selectItemIdsByList, { id: listId });

  yield put(addListItemIds({ [listId]: order }));

  const resp: ApiFetchResponse<ApiOrderResponse> = yield call(
    apiFetch,
    `/lists/${listId}/order`,
    {
      method: 'POST',
      body: JSON.stringify({ order }),
    },
  );

  if (!resp.ok) {
    // undo
    yield put(addListItemIds({ [listId]: curListIds }));
  }
}

function* onDeleteList(listId: string): ApiGen {
  const loader = Loaders.deleteList;
  yield put(setLoaderStart({ id: loader }));
  const resp: ApiFetchResponse = yield call(apiFetch, `/lists/${listId}`, {
    method: 'DELETE',
  });
  if (!resp.ok) {
    yield put(setLoaderError({ id: loader, message: resp.data.message }));
    return;
  }

  const itemIds = yield select(selectItemIdsByList, { id: listId });
  yield batch([
    removeLists([listId]),
    removeListItemIds([listId]),
    removeListItems(itemIds),
    setLoaderSuccess({ id: loader, message: listId }),
  ]);
}

interface DeleteListItem {
  listId: string;
  itemId: string;
}

function* onDeleteListItem(payload: DeleteListItem): ApiGen {
  const { itemId, listId } = payload;
  const loader = deleteItemLoader(itemId);

  yield put(setLoaderStart({ id: loader }));

  const resp = yield call(apiFetch, `/lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
  });

  if (!resp.ok) {
    yield put(setLoaderError({ id: loader }));
    return;
  }

  const itemIds: string[] = yield select(selectItemIdsByList, {
    id: payload.listId,
  });
  const newItemIds = itemIds.filter((id) => id !== itemId);
  yield batch([
    addListItemIds({ [listId]: newItemIds }),
    setLoaderSuccess({ id: loader }),
  ]);
}

interface FetchList {
  username: string;
  listname: string;
}

export function* onFetchList({ username, listname }: FetchList) {
  if (!username || !listname) {
    return;
  }

  const loader = fetchListLoader(username, listname);
  yield put(setLoaderStart({ id: loader }));
  const resp: ApiFetchResponse<FetchListResponse> = yield call(
    apiFetch,
    `/lists/${username}/${listname}`,
  );

  if (!resp.ok) {
    yield put(setLoaderError({ id: loader, message: resp.data.message }));
    return;
  }

  const list = deserializeList(resp.data.list);
  const { items, itemIds } = processListItems(resp.data.items);
  const users = processUsers(resp.data.users);
  const comments = processComments(resp.data.comments);

  yield batch([
    addLists({ [list.id]: list }),
    addListItems(items),
    addListItemIds({ [list.id]: itemIds }),
    addUsers(users),
    addComments(comments),
    setLoaderSuccess({ id: loader }),
  ]);
}

export const {
  fetchList,
  deleteListItem,
  deleteList,
  orderListItems,
  updateListItem,
  updateList,
  fetchLists,
  createList,
  createListItem,
  createListItemBulk,
  fetchPublicLists,
  starList,
  fetchStars,
} = createEffects({
  fetchList: onFetchList,
  deleteListItem: onDeleteListItem,
  deleteList: onDeleteList,
  orderListItems: onOrderListItems,
  updateListItem: onUpdateListItem,
  updateList: onUpdateList,
  fetchLists: onFetchLists,
  createList: onCreateList,
  fetchPublicLists: onFetchPublicLists,
  createListItem: onCreateListItem,
  starList: onStarList,
  fetchStars: onFetchStars,
  createListItemBulk: onCreateListItemBulk,
});
