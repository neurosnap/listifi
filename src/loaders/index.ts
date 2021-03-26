import { State } from '@app/types';
import {
  createLoaderTable,
  createReducerMap,
  defaultLoadingItem,
} from 'robodux';

export enum Loaders {
  createList = 'createList',
  createItem = 'createItem',
  updateList = 'updateList',
  deleteList = 'deleteList',
  updateListItem = 'updateListItem',
  login = 'login',
  loginGoogle = 'loginGoogle',
  register = 'register',
  fetchUser = 'fetchUser',
  fetchComments = 'fetchComments',
  fetchListComments = 'fetchListComments',
  createComment = 'createComment',
  deleteComment = 'deleteComment',
  fetchSuggestions = 'fetchSuggestions',
  createSuggestion = 'createSuggestion',
  updateSettings = 'updateSettings',
}

export const deleteItemLoader = (id: string) => `delete-item:${id}`;
export const fetchListLoader = (username: string, listname: string) =>
  `fetch-list:${username}/${listname}`;

export const updateSuggestionLoader = (id: string) => `update-suggestion:${id}`;

export const LOADERS_SLICE = 'loaders';
const slice = createLoaderTable({ name: 'loaders' });
export const {
  loading: setLoaderStart,
  error: setLoaderError,
  success: setLoaderSuccess,
  resetById: resetLoaderById,
} = slice.actions;
export const reducers = createReducerMap(slice);
const selectLoaders = (state: State) => state[LOADERS_SLICE] || {};
const initLoader = defaultLoadingItem();
export const selectLoaderById = (
  state: State,
  { id }: { id: Loaders | string },
) => {
  const loaders = selectLoaders(state);
  return loaders[id] || initLoader;
};
