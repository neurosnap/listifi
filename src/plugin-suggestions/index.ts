import { select } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { createReducerMap, createTable, MapEntity } from 'robodux';

import { api, ApiCtx } from '@app/api';
import {
  addListItemIds,
  addListItems,
  deserializeListItem,
  selectItemIdsByList,
} from '@app/lists';
import { deserializeModelBase } from '@app/model-helpers';
import {
  ApiFetchListSuggestionsResponse,
  ApproveSuggestionResponse,
  ListSuggestion,
  ListSuggestionResponse,
  State,
  ApiGen,
} from '@app/types';
import { addUsers, processUsers } from '@app/users';
import { updateSuggestionLoader } from '@app/loaders';

export const defaultListSuggestion = (
  s: Partial<ListSuggestion> = {},
): ListSuggestion => {
  const now = new Date().toISOString();
  return {
    id: '',
    listId: '',
    itemId: '',
    userId: '',
    text: '',
    rejected: false,
    createdAt: now,
    updatedAt: now,
    ...s,
  };
};

export const deserializeListSuggestion = (
  s: ListSuggestionResponse,
): ListSuggestion => {
  return {
    ...deserializeModelBase(s),
    id: s.id,
    listId: s.list_id,
    itemId: s.item_id || '',
    userId: s.user_id,
    text: s.text,
    rejected: s.rejected,
  };
};

export const SUGGESTIONS_SLICE = 'suggestions';
const slice = createTable<ListSuggestion>({ name: SUGGESTIONS_SLICE });
export const reducers = createReducerMap(slice);
const { add: addSuggestions } = slice.actions;

const selectors = slice.getSelectors(
  (state: State) => state[SUGGESTIONS_SLICE],
);
export const {
  selectTable: selectSuggestionTable,
  selectTableAsList: selectSuggestionsAsList,
} = selectors;
export const selectSuggestionsByListId = createSelector(
  selectSuggestionsAsList,
  (state: State, p: { listId: string }) => p.listId,
  (suggestions, listId) =>
    suggestions
      .filter((suggestion) => suggestion.listId === listId)
      .sort((a, b) => {
        const aDate = new Date(a.updatedAt).getTime();
        const bDate = new Date(b.updatedAt).getTime();
        return bDate - aDate;
      }),
);

function processSuggestions(
  suggs: ListSuggestionResponse[],
): MapEntity<ListSuggestion> {
  return suggs.reduce<MapEntity<ListSuggestion>>((acc, s) => {
    acc[s.id] = deserializeListSuggestion(s);
    return acc;
  }, {});
}

export const fetchSuggestions = api.get<{ listId: string }>(
  '/suggestions/:listId',
  function* (ctx: ApiCtx<ApiFetchListSuggestionsResponse>, next) {
    yield next();
    if (!ctx.response.ok) return;
    const { data } = ctx.response;
    const suggestions = processSuggestions(data.suggestions);
    const users = processUsers(data.users);
    ctx.actions.push(addSuggestions(suggestions), addUsers(users));
  },
);

export interface CreateSuggestion {
  userId: string;
  listId: string;
  text: string;
}

export const createSuggestion = api.post<CreateSuggestion>(
  '/suggestions/:listId',
  function* (ctx: ApiCtx<ListSuggestionResponse, CreateSuggestion>, next) {
    ctx.request = {
      body: JSON.stringify({
        user_id: ctx.payload.userId,
        text: ctx.payload.text,
      }),
    };
    yield next();
    if (!ctx.response.ok) return;
    const suggestions = processSuggestions([ctx.response.data]);
    ctx.actions.push(addSuggestions(suggestions));
  },
);

interface ChangeSuggestion {
  listId: string;
  suggestionId: string;
}

export const approveSuggestion = api.post<ChangeSuggestion>(
  '/suggestions/:listId/approve/:suggestionId',
  function* (
    ctx: ApiCtx<ApproveSuggestionResponse, ChangeSuggestion>,
    next,
  ): ApiGen {
    const { suggestionId } = ctx.payload;
    const loader = updateSuggestionLoader(suggestionId);
    ctx.loader.loading = { id: loader };
    yield next();
    if (!ctx.response.ok) {
      ctx.loader.error = { id: loader, message: ctx.response.data.message };
      return;
    }
    const { data } = ctx.response;
    const suggestions = processSuggestions([data.suggestion]);
    const listItem = deserializeListItem(data.item);
    const itemIds = yield select(selectItemIdsByList, {
      id: ctx.payload.listId,
    });
    ctx.loader.success = { id: loader };
    ctx.actions.push(
      addSuggestions(suggestions),
      addListItems({ [listItem.id]: listItem }),
      addListItemIds({ [ctx.payload.listId]: [...itemIds, listItem.id] }),
    );
  },
);

export const rejectSuggestion = api.post<ChangeSuggestion>(
  '/suggestions/:listId/reject/:suggestionId',
  function* (ctx: ApiCtx<ListSuggestionResponse, ChangeSuggestion>, next) {
    const { suggestionId } = ctx.payload;
    const loader = updateSuggestionLoader(suggestionId);
    ctx.loader.loading = { id: loader };
    yield next();
    if (!ctx.response.ok) {
      ctx.loader.error = { id: loader, message: ctx.response.data.message };
      return;
    }
    const suggestions = processSuggestions([ctx.response.data]);
    ctx.loader.success = { id: loader };
    ctx.actions.push(addSuggestions(suggestions));
  },
);
