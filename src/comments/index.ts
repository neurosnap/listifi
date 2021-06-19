import { createReducerMap, createTable, MapEntity } from 'robodux';
import { createSelector } from 'reselect';
import { Next } from 'saga-query';

import {
  FetchListCommentsResponse,
  ListCommentClient,
  ListCommentResponse,
  State,
} from '@app/types';
import { deserializeModelBase } from '@app/model-helpers';
import { addUsers, processUsers } from '@app/users';
import { api, ApiCtx } from '@app/api';

export const defaultComment = (
  c: Partial<ListCommentClient> = {},
): ListCommentClient => {
  const now = new Date().toISOString();
  return {
    id: '',
    userId: '',
    listId: '',
    itemId: '',
    comment: '',
    createdAt: now,
    updatedAt: now,
    ...c,
  };
};

const deserializeComment = (c: ListCommentResponse): ListCommentClient => {
  return {
    ...deserializeModelBase(c),
    userId: c.user_id,
    listId: c.list_id,
    itemId: c.item_id,
    comment: c.comment,
  };
};

export const COMMENTS_SLICE = 'comments';
const slice = createTable<ListCommentClient>({ name: COMMENTS_SLICE });
export const { add: addComments, remove: removeComments } = slice.actions;
export const reducers = createReducerMap(slice);
const selectors = slice.getSelectors(
  (state: State) => state[COMMENTS_SLICE] || {},
);
const { selectTableAsList: selectCommentAsList } = selectors;
export const selectCommentsByItemId = createSelector(
  selectCommentAsList,
  (state: State, props: { id: string }) => props.id,
  (comments, itemId) =>
    comments
      .filter((comment) => comment.itemId === itemId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      }),
);
export const selectCommentsByListId = createSelector(
  selectCommentAsList,
  (state: State, props: { id: string }) => props.id,
  (comments, listId) =>
    comments
      .filter((comment) => comment.listId === listId && !comment.itemId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      }),
);
export const selectCommentItemCountByListId = createSelector(
  selectCommentAsList,
  (state: State, props: { listId: string }) => props.listId,
  (comments, listId) => {
    return comments
      .filter((comment) => comment.listId === listId)
      .reduce<{ total: number; [key: string]: number }>(
        (acc, comment) => {
          if (!comment.itemId) {
            return acc;
          }

          if (!acc[comment.itemId]) {
            acc[comment.itemId] = 0;
          }

          acc[comment.itemId] += 1;
          return acc;
        },
        { total: comments.length },
      );
  },
);

export function processComments(comments: ListCommentResponse[]) {
  return comments
    .map(deserializeComment)
    .reduce<MapEntity<ListCommentClient>>((acc, comment) => {
      acc[comment.id] = comment;
      return acc;
    }, {});
}

interface FetchComments {
  itemId: string;
  listId: string;
}

function* basicComments(ctx: ApiCtx<FetchListCommentsResponse>, next: Next) {
  yield next();
  if (!ctx.response.ok) return;
  const { data } = ctx.response;
  const comments = processComments(data.comments);
  const users = processUsers(data.users);
  ctx.actions.push(addComments(comments), addUsers(users));
}

export const fetchComments = api.get<FetchComments>(
  '/lists/:listId/items/:itemId/comments',
  basicComments,
);

export const fetchListComments = api.get<{ listId: string }>(
  '/comments/:listId',
  basicComments,
);

interface CreateComment {
  itemId?: string;
  listId: string;
  comment: string;
}

export const createComment = api.post<CreateComment>('/comments', function* (
  ctx,
  next,
) {
  ctx.request = {
    body: JSON.stringify({
      item_id: ctx.payload.itemId,
      list_id: ctx.payload.listId,
      comment: ctx.payload.comment,
    }),
  };
  yield next();
  if (!ctx.response.ok) return;
  const nextComment = deserializeComment(ctx.response.data);
  ctx.actions.push(addComments({ [nextComment.id]: nextComment }));
});

interface RemoveComment {
  id: string;
}

export const removeComment = api.delete<RemoveComment>(
  '/comments/:id',
  function* (ctx: ApiCtx<null, RemoveComment>, next) {
    yield next();
    if (!ctx.response.ok) return;
    ctx.actions.push(removeComments([ctx.payload.id]));
  },
);
