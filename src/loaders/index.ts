import { State } from '@app/types';
import { createLoaderTable, createReducerMap } from 'robodux';

export const deleteItemLoader = (id: string) => `delete-item:${id}`;
export const fetchListLoader = (username: string, listname: string) =>
  `fetch-list:${username}/${listname}`;

export const updateSuggestionLoader = (id: string) => `update-suggestion:${id}`;

export const LOADERS_SLICE = 'loaders';
export const loaders = createLoaderTable({ name: 'loaders' });
export const {
  loading: setLoaderStart,
  error: setLoaderError,
  success: setLoaderSuccess,
  resetById: resetLoaderById,
} = loaders.actions;
export const reducers = createReducerMap(loaders);
export const { selectById: selectLoaderById } = loaders.getSelectors(
  (state: State) => state[LOADERS_SLICE],
);
