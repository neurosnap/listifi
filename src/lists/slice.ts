import { ListClient, ListItemClient, StarClient } from '@app/types';
import { createListTable, createTable } from 'robodux';

export const LISTS_SLICE = 'lists';
export const listSlice = createTable<ListClient>({ name: LISTS_SLICE });
export const {
  add: addLists,
  remove: removeLists,
  patch: patchLists,
} = listSlice.actions;

export const LIST_ITEMS_SLICE = 'listItems';
export const itemsSlice = createTable<ListItemClient>({
  name: LIST_ITEMS_SLICE,
});
export const {
  add: addListItems,
  remove: removeListItems,
} = itemsSlice.actions;

export const LIST_ITEM_IDS_SLICE = 'listItemIds';
export const listItemIdsSlice = createTable<string[]>({
  name: LIST_ITEM_IDS_SLICE,
});
export const {
  add: addListItemIds,
  remove: removeListItemIds,
} = listItemIdsSlice.actions;

export const STARS_SLICE = 'stars';
export const starsSlice = createTable<StarClient>({
  name: STARS_SLICE,
});
export const { add: addStars, remove: removeStars } = starsSlice.actions;

export const USERNAME_STAR_IDS_SLICE = 'usernameStarIds';
export const usernameStarIdsSlice = createListTable<string[]>({
  name: USERNAME_STAR_IDS_SLICE,
});
export const { add: addUsernameStarIds } = usernameStarIdsSlice.actions;
