import jwt from 'jsonwebtoken';

import {
  Computedlists,
  dbTypes,
  ListResponse,
  UserResponse,
  StarResponse,
} from '@app/types';

import { env } from '../env';
import { listQueryBuilder, userQueryBuilder } from '../query';
import { FnResult } from '../types';
import { getStarsForUser } from './stars';

export function getTokenForUser(
  user: dbTypes.app_users,
  expiresIn = '365d',
): string {
  const tokenUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    picture: user.picture,
    is_guest: user.is_guest,
    verified: user.verified,
    created_at: user.created_at,
    email_notifications: user.email_notifications,
  };
  const clientToken = jwt.sign(tokenUser, env.secret, { expiresIn });
  return clientToken;
}

export async function getUserProfileData(
  curUserId: string,
  username: string,
): Promise<
  FnResult<{
    lists: ListResponse[];
    user: UserResponse;
    stars: StarResponse[];
  }>
> {
  const user: UserResponse | undefined = await userQueryBuilder()
    .where('username', username)
    .first();
  if (!user) {
    return {
      success: false,
      data: {
        status: 404,
        message: 'user not found',
      },
    };
  }

  const listBuilder = listQueryBuilder().where('lists.owner_id', user.id);

  if (curUserId !== user.id) {
    listBuilder.where('lists.public', true);
  }

  const userLists: Computedlists[] = await listBuilder;

  const starData = await getStarsForUser(username);
  if (!starData.success) {
    return starData;
  }
  const lists = [...userLists, ...starData.data.lists];

  return { success: true, data: { lists, user, stars: starData.data.stars } };
}
