import {
  IWithPagination,
  IPaginateParams,
  IBasePagination,
} from 'knex-paginate';

import { Computedlists, dbTypes, ListResponse, UserResponse } from '@app/types';

import { db } from '../knex';
import { listQueryBuilder, userQueryBuilder } from '../query';
import { FnResult } from '../types';
import { getCommentsForList } from './comments';
import { DEFAULT_PER_PAGE } from '../constants';

export async function getExploreData({
  perPage = DEFAULT_PER_PAGE,
  currentPage = 1,
  ...props
}: Partial<IPaginateParams>): Promise<
  FnResult<{
    lists: ListResponse[];
    users: UserResponse[];
    items: dbTypes.list_items[];
    meta: IBasePagination;
  }>
> {
  const { data: lists, pagination: meta }: IWithPagination<Computedlists[]> =
    await listQueryBuilder()
      .where('public', true)
      .orderBy([
        { column: 'views', order: 'desc' },
        { column: 'comments', order: 'desc' },
        { column: 'stars', order: 'desc' },
        { column: 'lists.updated_at', order: 'desc' },
      ])
      .paginate({
        perPage,
        currentPage,
        ...props,
      });
  const userIds = [...new Set(lists.map((list) => list.owner_id))];
  const users = await userQueryBuilder().whereIn('id', [...userIds]);
  const listIds = lists.map((list) => list.id);
  const items = await db('list_items')
    .whereIn('list_id', listIds)
    .orderBy('order', 'asc');
  return { success: true, data: { lists, users, meta, items } };
}

export async function getUserListData(userId: string) {
  const lists = await listQueryBuilder().where('lists.owner_id', userId);
  const user = await userQueryBuilder().where('id', userId).first();
  return { lists, user };
}

export async function getListDetailData(
  username: string,
  listname: string,
): Promise<
  FnResult<{
    list: ListResponse;
    users: UserResponse[];
    comments: dbTypes.list_comments[];
    items: dbTypes.list_items[];
  }>
> {
  const list: Computedlists | undefined = await listQueryBuilder()
    .where({ username, url_name: listname })
    .first();

  if (!list) {
    return {
      success: false,
      data: {
        status: 404,
        message: `list not found with ${username}/${listname}`,
      },
    };
  }

  const user: UserResponse | undefined = await userQueryBuilder()
    .where('id', list.owner_id)
    .first();

  if (!user) {
    return {
      success: false,
      data: {
        status: 404,
        message: 'could not find user',
      },
    };
  }

  const items = await db('list_items')
    .where('list_id', list.id)
    .orderBy('order', 'asc');

  const commentData = await getCommentsForList(list.id);
  if (!commentData.success) {
    return commentData;
  }

  return {
    success: true,
    data: {
      list,
      items,
      users: [user, ...commentData.data.users],
      comments: commentData.data.comments,
    },
  };
}
