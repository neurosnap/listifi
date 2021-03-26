import { Computedlists, dbTypes, ListResponse, UserResponse } from '@app/types';
import { db } from '../knex';
import { listQueryBuilder, userQueryBuilder } from '../query';
import { FnResult } from '../types';
import { getCommentsForList } from './comments';

export async function fetchPublicListData() {
  const lists: Computedlists[] = await listQueryBuilder().where('public', true);
  const userIds = [...new Set(lists.map((list) => list.owner_id))];
  const users = await userQueryBuilder().whereIn('id', [...userIds]);
  return { lists, users };
}

export async function fetchUserListData(userId: string) {
  const lists = await listQueryBuilder().where('lists.owner_id', userId);
  const user = await userQueryBuilder().where('id', userId).first();
  return { lists, user };
}

export async function fetchListDetailData(
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
