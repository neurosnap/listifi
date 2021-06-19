import { put, select } from 'redux-saga/effects';
import { MapEntity } from 'robodux';

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
  // deleteItemLoader,
  // fetchListLoader,
  setLoaderSuccess,
} from '@app/loaders';
import { selectHasTokenExpired } from '@app/token';
import { addUsers, processUsers } from '@app/users';
import { processComments, addComments } from '@app/comments';
import { api, ApiCtx } from '@app/api';

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

const isEmpty = (obj: any) =>
  Object.keys(obj).length === 0 && obj.constructor === Object;

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

export const createList = api.post<UpsertList>('/lists', function* (
  ctx: ApiCtx<BulkCreateListResponse, UpsertList>,
  next,
) {
  ctx.request = {
    body: JSON.stringify({
      name: ctx.payload.name,
      description: ctx.payload.description,
      public: ctx.payload.public,
      items: ctx.payload.items,
      plugins: ctx.payload.plugins,
    }),
  };
  yield next();
  if (!ctx.response.ok) return;

  const { data } = ctx.response;
  const list = deserializeList(data.list);
  const listIds: string[] = [];
  const items = data.items.reduce<MapEntity<ListItemClient>>((acc, item) => {
    acc[item.id] = deserializeListItem(item);
    listIds.push(item.id);
    return acc;
  }, {});
  ctx.actions.push(
    setLoaderSuccess({ id: ctx.name, meta: { list } }),
    addLists({ [list.id]: list }),
    addListItems(items),
    addListItemIds({ [list.id]: listIds }),
  );
});

export const updateList = api.put<UpsertList>('/lists/:id', function* (
  ctx,
  next,
) {
  if (!ctx.payload.id) return;
  ctx.request = {
    body: JSON.stringify({
      name: ctx.payload.name,
      description: ctx.payload.description,
      public: ctx.payload.public,
      plugins: ctx.payload.plugins,
    }),
  };
  yield next();
  if (!ctx.response.ok) return;
  const list = deserializeList(ctx.response.data);
  ctx.actions.push(
    addLists({ [list.id]: list }),
    setLoaderSuccess({ id: ctx.name, meta: { list } }),
  );
});

export const fetchLists = api.get('/lists', function* (
  ctx: ApiCtx<ApiListsResponse>,
  next,
): ApiGen {
  const hasTokenExpired = yield select(selectHasTokenExpired);
  if (hasTokenExpired) {
    return;
  }

  yield next();
  const { ok, data } = ctx.response;
  if (!ok) return;
  const users = processUsers(data.users);
  const lists = processLists(data.lists);
  ctx.actions.push(addLists(lists), addUsers(users));
});

export const fetchPublicLists = api.get('/lists/public', function* (
  ctx: ApiCtx<ApiListsResponse>,
  next,
) {
  yield next();
  if (!ctx.response.ok) return;
  const { data } = ctx.response;
  const lists = processLists(data.lists);
  const users = processUsers(data.users);
  ctx.actions.push(addLists(lists), addUsers(users));
});

export const fetchStars = api.get<{ username: string }>(
  '/users/:username/stars',
  function* (ctx: ApiCtx<ApiStarsResponse>, next) {
    const { username } = ctx.payload;
    if (!username) return;
    yield next();
    if (!ctx.response.ok) return;
    const { data } = ctx.response;
    const stars = processStars(data.stars);
    const lists = processLists(data.lists);
    const starIds = data.stars.map((s) => s.id);
    ctx.actions.push(
      addStars(stars),
      addLists(lists),
      addUsernameStarIds({ [username]: starIds }),
    );
  },
);

export const startList = api.post<{ listId: string }>(
  '/lists/:listId/star',
  function* (ctx: ApiCtx<StarResponse>, next) {
    const { listId } = ctx.payload;
    yield next();
    const { ok, data } = ctx.response;
    if (!ok) return;

    const list: ListClient = yield select(selectListById, { id: listId });
    if (isEmpty(data)) {
      ctx.actions.push(
        removeStars([listId]),
        patchLists({ [listId]: { stars: list.stars - 1 } }),
      );
    } else {
      const star = deserializeStar(data);
      ctx.actions.push(
        addStars({ [star.listId]: star }),
        patchLists({ [listId]: { stars: list.stars + 1 } }),
      );
    }
  },
);

export const createListItem = api.post<UpsertListItem>(
  '/lists/:listId/items',
  function* (ctx: ApiCtx<ListItemResponse, UpsertListItem>, next): ApiGen {
    const { listId } = ctx.payload;
    ctx.request = {
      body: JSON.stringify({
        text: ctx.payload.text,
      }),
    };
    yield next();
    const { ok, data } = ctx.response;
    if (!ok) return;
    const listItem = deserializeListItem(data);
    const itemIds = yield select(selectItemIdsByList, { id: listId });
    ctx.actions.push(
      addListItems({ [listItem.id]: listItem }),
      addListItemIds({ [listId]: [...itemIds, listItem.id] }),
      setLoaderSuccess({ id: ctx.name, message: listItem.id }),
    );
  },
);

export const createListItemBulk = api.post<UpsertListItem>(
  '/lists/:listId/bulk',
  function* (
    ctx: ApiCtx<BulkCreateListResponse, UpsertListItem>,
    next,
  ): ApiGen {
    const { listId } = ctx.payload;
    ctx.request = {
      body: JSON.stringify({
        text: ctx.payload.text,
      }),
    };
    yield next();
    const { ok, data } = ctx.response;
    if (!ok) return;
    const list = deserializeList(data.list);
    const { items, itemIds } = processListItems(data.items);
    const curItemIds = yield select(selectItemIdsByList, { id: listId });
    ctx.actions.push(
      addLists({ [list.id]: list }),
      addListItems(items),
      addListItemIds({
        [listId]: [...curItemIds, ...itemIds],
      }),
    );
  },
);

export const updateListItem = api.put<UpsertListItem>(
  '/lists/:listId/items/:id',
  function* (ctx: ApiCtx<ListItemResponse, UpsertListItem>, next) {
    const { id, text, metadata, notes } = ctx.payload;
    if (!id) return;
    ctx.request = {
      body: JSON.stringify({
        text,
        notes,
        metadata,
      }),
    };
    yield next();
    const { ok, data } = ctx.response;
    if (!ok) return;
    const listItem = deserializeListItem(data);
    ctx.actions.push(addListItems({ [listItem.id]: listItem }));
  },
);

interface OrderListItems {
  listId: string;
  order: string[];
}

export const orderListItems = api.post<OrderListItems>(
  '/lists/:listId/order',
  function* (ctx: ApiCtx<ApiOrderResponse, OrderListItems>, next): ApiGen {
    const { listId, order } = ctx.payload;
    const curListIds = yield select(selectItemIdsByList, { id: listId });
    yield put(addListItemIds({ [listId]: order }));
    ctx.request = {
      body: JSON.stringify({ order }),
    };
    yield next();
    if (!ctx.response.ok) {
      // undo
      ctx.actions.push(addListItemIds({ [listId]: curListIds }));
      return;
    }
  },
);

export const deleteList = api.delete<{ listId: string }>(
  '/lists/:listId',
  function* (ctx: ApiCtx<any, { listId: string }>, next): ApiGen {
    const { listId } = ctx.payload;
    yield next();
    const { ok } = ctx.response;
    if (!ok) return;
    const itemIds = yield select(selectItemIdsByList, { id: listId });
    ctx.actions.push(
      removeLists([listId]),
      removeListItemIds([listId]),
      removeListItems(itemIds),
      setLoaderSuccess({ id: ctx.name, message: listId }),
    );
  },
);

interface DeleteListItem {
  listId: string;
  itemId: string;
}

export const deleteListItem = api.delete<DeleteListItem>(
  '/lists/:listId/items/:itemId',
  function* (ctx: ApiCtx<any, DeleteListItem>, next): ApiGen {
    // TODO: const loader = deleteItemLoader(itemId);
    const { itemId, listId } = ctx.payload;
    yield next();
    const { ok } = ctx.response;
    if (!ok) return;

    const itemIds: string[] = yield select(selectItemIdsByList, {
      id: listId,
    });
    const newItemIds = itemIds.filter((id) => id !== itemId);
    ctx.actions.push(addListItemIds({ [listId]: newItemIds }));
  },
);

interface FetchList {
  username: string;
  listname: string;
}

export const fetchList = api.get<FetchList>(
  '/lists/:username/:listname',
  function* (ctx: ApiCtx<FetchListResponse, FetchList>, next) {
    // TODO: const loader = fetchListLoader(username, listname);
    if (!ctx.payload.username || !ctx.payload.listname) {
      return;
    }
    yield next();
    const { ok, data } = ctx.response;
    if (!ok) return;

    const list = deserializeList(data.list);
    const { items, itemIds } = processListItems(data.items);
    const users = processUsers(data.users);
    const comments = processComments(data.comments);

    ctx.actions.push(
      addLists({ [list.id]: list }),
      addListItems(items),
      addListItemIds({ [list.id]: itemIds }),
      addUsers(users),
      addComments(comments),
    );
  },
);
