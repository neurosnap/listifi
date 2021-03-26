import { createReducerMap } from 'robodux';

import {
  listSlice,
  itemsSlice,
  listItemIdsSlice,
  starsSlice,
  usernameStarIdsSlice,
} from './slice';

export const reducers = createReducerMap(
  listSlice,
  itemsSlice,
  listItemIdsSlice,
  starsSlice,
  usernameStarIdsSlice,
);

export * from './slice';
export * from './selectors';
export * from './effects';
export * from './entities';
export * from './serializers';
export * from './helpers';
