import { selectUser } from '@app/token';
import { ListItemClient, StarClient, State } from '@app/types';
import { createSelector } from 'reselect';
import { excludesFalse, mustSelectEntity } from 'robodux';
import { defaultList, defaultListItem } from './entities';
import {
  sortListByComments,
  sortListByNew,
  sortListByPopular,
  sortListByUpdated,
} from './helpers';
import {
  listSlice,
  itemsSlice,
  listItemIdsSlice,
  starsSlice,
  STARS_SLICE,
  USERNAME_STAR_IDS_SLICE,
} from './slice';

const initList = defaultList();
export const listSelectors = listSlice.getSelectors(
  (state: State) => state.lists,
);
const createListEntitySelector = mustSelectEntity(initList);
export const selectListById = createListEntitySelector(
  listSelectors.selectById,
);

export const {
  selectTable: selectListTable,
  selectTableAsList: selectLists,
} = listSelectors;
export const selectListByUrl = createSelector(
  selectLists,
  (_: State, p: { username: string }) => p.username,
  (_: State, p: { listname: string }) => p.listname,
  (lists, username, listname) => {
    const foundList = lists.find(
      (list) => list.username === username && list.urlName === listname,
    );
    return foundList || initList;
  },
);
export const selectListsByUser = createSelector(
  selectLists,
  selectUser,
  (lists, user) => lists.filter((list) => list.ownerId === user.id),
);
export const selectListsByUserId = createSelector(
  selectLists,
  (_: State, p: { id: string }) => p.id,
  (lists, userId) => lists.filter((list) => list.ownerId === userId),
);

const initItem = defaultListItem();
const itemSelectors = itemsSlice.getSelectors(
  (state: State) => state.listItems,
);
const createItemEntitySelector = mustSelectEntity(initItem);
export const selectItemById = createItemEntitySelector(
  itemSelectors.selectById,
);
export const {
  selectById: selectListItemById,
  selectByIds: selectListItemsByIds,
  selectTable: selectItemsTable,
} = itemSelectors;

const listItemIdsSelectors = listItemIdsSlice.getSelectors(
  (state: State) => state.listItemIds,
);
const emptyIds: string[] = [];
export const selectItemIdsByList = (state: State, props: { id: string }) =>
  listItemIdsSelectors.selectById(state, props) || emptyIds;

const empty: ListItemClient[] = [];
export const createSelectItemsByList = () =>
  createSelector(selectItemIdsByList, selectItemsTable, (itemIds, items) => {
    if (!itemIds) return empty;
    return itemIds.map((id) => items[id]).filter(excludesFalse);
  });

export const selectPublicListsByPopularity = createSelector(
  selectLists,
  (lists) => lists.filter((list) => list.public).sort(sortListByPopular),
);

export const selectPublicListsByNew = createSelector(selectLists, (lists) =>
  lists.filter((list) => list.public).sort(sortListByNew),
);

export const selectPublicListsByUpdated = createSelector(selectLists, (lists) =>
  lists.filter((list) => list.public).sort(sortListByUpdated),
);

export const selectPublicListsByComments = createSelector(
  selectLists,
  (lists) => lists.filter((list) => list.public).sort(sortListByComments),
);

export const {
  selectTable: selectStarsTable,
  selectTableAsList: selectStarsAsList,
  selectById: selectStarByListId,
} = starsSlice.getSelectors((state: State) => state[STARS_SLICE]);

const selectStarMapByStarId = createSelector(selectStarsAsList, (stars) => {
  return stars.reduce<{ [key: string]: StarClient }>((acc, star) => {
    acc[star.id] = star;
    return acc;
  }, {});
});

const selectUsernameStarIdsTable = (state: State) =>
  state[USERNAME_STAR_IDS_SLICE] || {};

const selectUsernameStarIdsByUsername = (
  state: State,
  p: { username: string },
) => {
  return selectUsernameStarIdsTable(state)[p.username] || [];
};

export const selectStarredLists = createSelector(
  selectStarMapByStarId,
  selectListTable,
  selectUsernameStarIdsByUsername,
  (_: State, props: { username: string }) => props.username,
  (stars, lists, starIds) => {
    return starIds
      .map((id) => {
        const star = stars[id];
        if (!star) return;
        return lists[star.listId];
      })
      .filter(excludesFalse);
  },
);
