import { FetchListCommentsResponse, UserResponse } from '@app/types';

import { db } from '../knex';
import { listQueryBuilder, userQueryBuilder } from '../query';
import { FnResult } from '../types';

export async function getCommentsForList(
  id: string,
): Promise<FnResult<FetchListCommentsResponse>> {
  const list = await listQueryBuilder().where('lists.id', id);

  if (!list) {
    return {
      success: false,
      data: {
        status: 404,
        message: 'list not found',
      },
    };
  }

  const comments = await db('list_comments').where('list_id', id);

  const users: UserResponse[] = await userQueryBuilder()
    .leftOuterJoin('list_comments', 'list_comments.user_id', 'app_users.id')
    .where('list_comments.list_id', id)
    .groupBy([
      'app_users.id',
      'app_users.email',
      'app_users.name',
      'app_users.picture',
      'app_users.username',
      'app_users.created_at',
      'app_users.verified',
      'list_comments.list_id',
    ]);

  return {
    success: true,
    data: { comments, users },
  };
}
