import { createReducerMap, createTable, MapEntity } from 'robodux';
import {
  FetchListCommentsResponse,
  ListCommentClient,
  ListCommentResponse,
  State,
} from '@app/types';
import { createSelector } from 'reselect';
import { batch, call, createEffects, put } from 'redux-cofx';
import {
  Loaders,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from '@app/loaders';
import { apiFetch, ApiFetchResponse } from '@app/fetch';
import { deserializeModelBase } from '@app/model-helpers';
import { addUsers, processUsers } from '@app/users';

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

function* onFetchComments({
  itemId,
  listId,
}: {
  itemId: string;
  listId: string;
}) {
  const loaderName = Loaders.fetchComments;
  yield put(setLoaderStart({ id: loaderName }));
  const res: ApiFetchResponse<FetchListCommentsResponse> = yield call(
    apiFetch,
    `/lists/${listId}/items/${itemId}/comments`,
  );

  if (!res.ok) {
    yield put(setLoaderError({ id: loaderName, message: res.data.message }));
    return;
  }

  const comments = processComments(res.data.comments);
  const users = processUsers(res.data.users);

  yield batch([
    setLoaderSuccess({ id: loaderName }),
    addComments(comments),
    addUsers(users),
  ]);
}

function* onFetchListComments({ listId }: { listId: string }) {
  const loaderName = Loaders.fetchListComments;
  yield put(setLoaderStart({ id: loaderName }));
  const res: ApiFetchResponse<FetchListCommentsResponse> = yield call(
    apiFetch,
    `/comments/${listId}`,
  );

  if (!res.ok) {
    yield put(setLoaderError({ id: loaderName, message: res.data.message }));
    return;
  }

  const comments = processComments(res.data.comments);
  const users = processUsers(res.data.users);

  yield batch([
    setLoaderSuccess({ id: loaderName }),
    addComments(comments),
    addUsers(users),
  ]);
}

function* onCreateComment({
  itemId,
  listId,
  comment,
}: {
  itemId?: string;
  listId: string;
  comment: string;
}) {
  const loaderName = Loaders.createComment;
  yield put(setLoaderStart({ id: loaderName }));
  const res: ApiFetchResponse<ListCommentResponse> = yield call(
    apiFetch,
    '/comments',
    {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        list_id: listId,
        comment,
      }),
    },
  );

  if (!res.ok) {
    yield put(setLoaderError({ id: loaderName, message: res.data.message }));
    return;
  }

  const nextComment = deserializeComment(res.data);

  yield batch([
    setLoaderSuccess({ id: loaderName }),
    addComments({ [nextComment.id]: nextComment }),
  ]);
}

function* onRemoveComment(id: string) {
  const loaderName = Loaders.deleteComment;
  yield put(setLoaderStart({ id: loaderName }));
  const res: ApiFetchResponse = yield call(apiFetch, `/comments/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    yield put(setLoaderError({ id: loaderName, message: res.data.message }));
    return;
  }

  yield batch([removeComments([id]), setLoaderSuccess({ id: loaderName })]);
}

export const {
  fetchComments,
  createComment,
  removeComment,
  fetchListComments,
} = createEffects({
  fetchComments: onFetchComments,
  fetchListComments: onFetchListComments,
  createComment: onCreateComment,
  removeComment: onRemoveComment,
});
