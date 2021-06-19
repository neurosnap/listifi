import { apiFetch, ApiFetchResponse } from '@app/fetch';
import {
  addListItemIds,
  addListItems,
  deserializeListItem,
  selectItemIdsByList,
} from '@app/lists';
import {
  Loaders,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
  updateSuggestionLoader,
} from '@app/loaders';
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
import { batch, call, createEffects, put, select } from 'redux-cofx';
import { createSelector } from 'reselect';
import { createReducerMap, createTable, MapEntity } from 'robodux';

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

function* onFetchSuggestions(listId: string) {
  const loaderName = Loaders.fetchSuggestions;
  yield put(setLoaderStart({ id: loaderName }));
  const res: ApiFetchResponse<ApiFetchListSuggestionsResponse> = yield call(
    apiFetch,
    `/suggestions/${listId}`,
  );

  if (!res.ok) {
    yield put(setLoaderError({ id: loaderName, message: res.data.message }));
    return;
  }

  const suggestions = processSuggestions(res.data.suggestions);
  const users = processUsers(res.data.users);

  yield batch([
    setLoaderSuccess({ id: loaderName }),
    addSuggestions(suggestions),
    addUsers(users),
  ]);
}

export interface CreateSuggestion {
  userId: string;
  listId: string;
  text: string;
}

function* onCreateSuggestion({ listId, userId, text }: CreateSuggestion) {
  const loaderName = Loaders.createSuggestion;
  yield put(setLoaderStart({ id: loaderName }));

  const res: ApiFetchResponse<ListSuggestionResponse> = yield call(
    apiFetch,
    `/suggestions/${listId}`,
    {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, text }),
    },
  );

  if (!res.ok) {
    yield put(setLoaderError({ id: loaderName, message: res.data.message }));
    return;
  }

  const suggestions = processSuggestions([res.data]);
  yield batch([
    setLoaderSuccess({ id: loaderName }),
    addSuggestions(suggestions),
  ]);
}

function* onApproveSuggestion({
  listId,
  suggestionId,
}: {
  listId: string;
  suggestionId: string;
}): ApiGen {
  const loaderName = updateSuggestionLoader(suggestionId);
  yield put(setLoaderStart({ id: loaderName }));

  const res: ApiFetchResponse<ApproveSuggestionResponse> = yield call(
    apiFetch,
    `/suggestions/${listId}/approve/${suggestionId}`,
    {
      method: 'POST',
    },
  );

  if (!res.ok) {
    yield put(setLoaderError({ id: loaderName, message: res.data.message }));
    return;
  }

  const suggestions = processSuggestions([res.data.suggestion]);
  const listItem = deserializeListItem(res.data.item);
  const itemIds = yield select(selectItemIdsByList, { id: listId });
  yield batch([
    setLoaderSuccess({ id: loaderName }),
    addSuggestions(suggestions),
    addListItems({ [listItem.id]: listItem }),
    addListItemIds({ [listId]: [...itemIds, listItem.id] }),
  ]);
}

function* onRejectSuggestion({
  listId,
  suggestionId,
}: {
  listId: string;
  suggestionId: string;
}) {
  const loaderName = updateSuggestionLoader(suggestionId);
  yield put(setLoaderStart({ id: loaderName }));

  const res: ApiFetchResponse<ListSuggestionResponse> = yield call(
    apiFetch,
    `/suggestions/${listId}/reject/${suggestionId}`,
    {
      method: 'POST',
    },
  );

  if (!res.ok) {
    yield put(setLoaderError({ id: loaderName, message: res.data.message }));
    return;
  }

  const suggestions = processSuggestions([res.data]);

  yield batch([
    setLoaderSuccess({ id: loaderName }),
    addSuggestions(suggestions),
  ]);
}

export const {
  fetchSuggestions,
  createSuggestion,
  approveSuggestion,
  rejectSuggestion,
} = createEffects({
  approveSuggestion: onApproveSuggestion,
  createSuggestion: onCreateSuggestion,
  fetchSuggestions: onFetchSuggestions,
  rejectSuggestion: onRejectSuggestion,
});
