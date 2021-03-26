import { dbTypes, ListResponse, UserResponse } from '@app/types';

import { db } from '../knex';
import { listQueryBuilder } from '../query/lists';
import { userQueryBuilder } from '../query/users';
import { FnResult } from '../types';

export async function getStarsForUser(
  username: string,
): Promise<FnResult<{ stars: dbTypes.list_stars[]; lists: ListResponse[] }>> {
  const user: UserResponse | null = await userQueryBuilder()
    .where('username', username)
    .first();
  if (!user) {
    return {
      success: false,
      data: {
        status: 404,
        message: `could not find user with username ${username}`,
      },
    };
  }

  const stars = await db('list_stars').where('user_id', user.id);
  if (stars.length === 0) {
    return {
      success: true,
      data: {
        stars: [],
        lists: [],
      },
    };
  }

  const starIds = stars.map((star) => star.list_id);
  const lists = await listQueryBuilder().whereIn('lists.id', starIds);
  return {
    success: true,
    data: {
      stars,
      lists,
    },
  };
}
