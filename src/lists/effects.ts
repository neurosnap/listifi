import { put, select } from 'redux-saga/effects';
import { MapEntity } from 'robodux';
import { setLoaderStart, setLoaderError, setLoaderSuccess } from 'saga-query';

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
  UserFetchResponse,
  ApiGen,
} from '@app/types';
import { deleteItemLoader, fetchListLoader } from '@app/loaders';
import { selectHasTokenExpired } from '@app/token';
import { addUsers, processUsers } from '@app/users';
import { processComments, addComments } from '@app/comments';
import { api, ApiCtx } from '@app/api';
import { processActivities, addActivities } from '@app/activities';

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
import { ApiListsPaginatedResponse } from '../types';

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

export const createList = api.post<UpsertList>(
  '/lists',
  function* (ctx: ApiCtx<BulkCreateListResponse, UpsertList>, next) {
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
    ctx.loader = { id: ctx.name, meta: { list } };
    ctx.actions.push(
      addLists({ [list.id]: list }),
      addListItems(items),
      addListItemIds({ [list.id]: listIds }),
    );
  },
);

export const updateList = api.put<UpsertList>(
  '/lists/:id',
  function* (ctx, next) {
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
    ctx.loader = { id: ctx.name, meta: { list } };
    ctx.actions.push(addLists({ [list.id]: list }));
  },
);

export const fetchLists = api.get(
  '/lists',
  function* (ctx: ApiCtx<ApiListsResponse>, next): ApiGen {
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
  },
);

interface FetchList {
  username: string;
  listname: string;
}

export const fetchList = api.get<FetchList>(
  '/lists/:username/:listname',
  function* (ctx: ApiCtx<FetchListResponse, FetchList>, next) {
    const { username, listname } = ctx.payload;
    if (!ctx.payload.username || !ctx.payload.listname) {
      return;
    }
    const loader = fetchListLoader(username, listname);
    yield put(setLoaderStart({ id: loader }));

    yield next();
    if (!ctx.response.ok) {
      ctx.actions.push(
        setLoaderError({ id: loader, message: ctx.response.data.message }),
      );
      return;
    }

    const { data } = ctx.response;
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
      setLoaderSuccess({ id: loader }),
    );
  },
);

export function processListItemsForLists(items: ListItemResponse[]) {
  const itemMap: MapEntity<ListItemClient> = {};
  const itemIdMap: { [key: string]: Set<string> } = {};

  items.forEach((item) => {
    const itemClient = deserializeListItem(item);
    itemMap[itemClient.id] = itemClient;
    if (!itemIdMap[itemClient.listId]) {
      itemIdMap[itemClient.listId] = new Set<string>();
    }
    itemIdMap[itemClient.listId].add(itemClient.id);
  });

  const listItemIdMap = Object.keys(itemIdMap).reduce<MapEntity<string[]>>(
    (acc, key) => {
      acc[key] = [...itemIdMap[key]];
      return acc;
    },
    {},
  );

  return { listItemIdMap, itemMap };
}

export const fetchExplore = api.get<{ page: number }>(
  '/lists/explore?page=:page',
  function* (ctx: ApiCtx<ApiListsPaginatedResponse>, next) {
    yield next();
    if (!ctx.response.ok) return;
    const { data } = ctx.response;
    const lists = processLists(data.lists);
    const users = processUsers(data.users);
    const { itemMap, listItemIdMap } = processListItemsForLists(data.items);

    const { meta } = data;
    ctx.loader = {
      id: ctx.name,
      meta: { ...meta, ids: data.lists.map((list) => list.id) },
    };
    ctx.actions.push(
      addUsers(users),
      addLists(lists),
      addListItems(itemMap),
      addListItemIds(listItemIdMap),
    );
  },
);

export const fetchFeed = api.get<{ page: number }>(
  '/lists/feed?page=:page',
  function* (ctx: ApiCtx<UserFetchResponse, { page: number }>, next) {
    yield next();
    if (!ctx.response.ok) return;

    const { data } = ctx.response;
    const activities = processActivities(
      `feed-${ctx.payload.page}`,
      data.activities,
    );
    const users = processUsers(data.users);
    const lists = processLists(data.lists);
    const comments = processComments(data.comments);
    const { itemMap, listItemIdMap } = processListItemsForLists(data.items);
    const { meta } = data;
    ctx.loader = {
      id: ctx.name,
      meta: { ...meta, ids: data.lists.map((list) => list.id) },
    };

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

export const fetchPublicLists = api.get(
  '/lists/public',
  function* (ctx: ApiCtx<ApiListsResponse>, next) {
    yield next();
    if (!ctx.response.ok) return;
    const { data } = ctx.response;
    const lists = processLists(data.lists);
    const users = processUsers(data.users);
    ctx.actions.push(addLists(lists), addUsers(users));
  },
);

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

export const starList = api.post<{ listId: string }>(
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
    if (!ctx.response.ok) return;
    const { data } = ctx.response;
    const listItem = deserializeListItem(data);
    const itemIds = yield select(selectItemIdsByList, { id: listId });
    ctx.loader = { id: ctx.name, message: listItem.id };
    ctx.actions.push(
      addListItems({ [listItem.id]: listItem }),
      addListItemIds({ [listId]: [...itemIds, listItem.id] }),
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
    if (!ctx.response.ok) return;
    const { data } = ctx.response;
    const listItem = deserializeListItem(data);
    ctx.loader = { id: ctx.name, message: listItem.id };
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

interface ListPayload {
  listId: string;
}

export const deleteList = api.delete<ListPayload>(
  '/lists/:listId',
  function* (ctx: ApiCtx<any, ListPayload>, next): ApiGen {
    const { listId } = ctx.payload;
    yield next();
    const { ok } = ctx.response;
    if (!ok) return;
    const itemIds = yield select(selectItemIdsByList, { id: listId });
    ctx.loader = { id: ctx.name, message: listId };
    ctx.actions.push(
      removeLists([listId]),
      removeListItemIds([listId]),
      removeListItems(itemIds),
    );
  },
);

export const markAsViewed = api.post<ListPayload>('/lists/:listId/view');

interface DeleteListItem {
  listId: string;
  itemId: string;
}

export const deleteListItem = api.delete<DeleteListItem>(
  '/lists/:listId/items/:itemId',
  function* (ctx: ApiCtx<any, DeleteListItem>, next): ApiGen {
    const { itemId, listId } = ctx.payload;
    const loader = deleteItemLoader(itemId);
    yield put(setLoaderStart({ id: loader }));
    yield next();
    const { ok } = ctx.response;
    if (!ok) {
      ctx.actions.push(
        setLoaderError({ id: loader, message: ctx.response.data.message }),
      );
      return;
    }

    const itemIds: string[] = yield select(selectItemIdsByList, {
      id: listId,
    });
    const newItemIds = itemIds.filter((id) => id !== itemId);

    ctx.actions.push(
      addListItemIds({ [listId]: newItemIds }),
      setLoaderSuccess({ id: loader }),
    );
  },
);
