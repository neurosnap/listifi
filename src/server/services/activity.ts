import {
  UserResponse,
  Computedlists,
  UserFetchResponse,
  CreateActivity,
  ActivityResponse,
  dbTypes,
} from '@app/types';

import { db } from '../knex';
import { FnResult } from '../types';
import {
  activityQueryBuilder,
  listQueryBuilder,
  userQueryBuilder,
} from '../query';
import { DEFAULT_PER_PAGE } from '../constants';

export async function createActivity(activity: CreateActivity) {
  const [feed] = await db('activity_feed').insert(activity, '*');
  return feed;
}

export async function getActivityData({
  activities,
  sameUser,
  userId,
}: {
  activities: ActivityResponse[];
  sameUser: boolean;
  userId: string;
}): Promise<FnResult<UserFetchResponse>> {
  const listIds = activities
    .filter((act) => act.subject_type === 'list')
    .map((act) => act.subject_id);

  if (listIds.length === 0) {
    return {
      success: true,
      data: { activities, lists: [], users: [], items: [], comments: [] },
    };
  }

  const listBuilder = listQueryBuilder().whereIn('lists.id', listIds);
  if (!sameUser) {
    listBuilder.where('lists.public', true);
  }
  const lists: Computedlists[] = await listBuilder;
  if (!lists) {
    return lists;
  }
  const items = await db('list_items')
    .whereIn('list_id', listIds)
    .orderBy('order', 'asc');
  const userIds = lists.map((list) => list.owner_id);
  const users: UserResponse[] = await userQueryBuilder().whereIn(
    'app_users.id',
    [userId, ...userIds],
  );

  const commentIds = activities
    .map((act) => {
      const metadata = (act.metadata as { [key: string]: any }) || {};
      return metadata.comment_id;
    })
    .filter(Boolean);
  const comments = await db<dbTypes.list_comments>('list_comments').whereIn(
    'id',
    commentIds,
  );

  return { success: true, data: { activities, lists, users, items, comments } };
}

export async function getActivityForUser(
  curUserName: string,
  username: string,
): Promise<FnResult<UserFetchResponse>> {
  const sameUser = curUserName === username;
  const user = await db<{ id: string }>('app_users')
    .first('id')
    .where('username', username);
  if (!user) {
    return { success: false, data: { status: 404, message: 'user not found' } };
  }

  const activityBuilder = activityQueryBuilder().where('creator_id', user.id);
  if (!sameUser) {
    activityBuilder.where('lists.public', true);
  }
  const activities: ActivityResponse[] = await activityBuilder;
  if (activities.length === 0) {
    return {
      success: true,
      data: { activities: [], lists: [], users: [], items: [], comments: [] },
    };
  }

  const data = await getActivityData({ activities, sameUser, userId: user.id });
  return data;
}

export async function getActivityForFeed({
  curUserId,
  currentPage = 1,
  perPage = DEFAULT_PER_PAGE,
}: {
  curUserId: string;
  currentPage: number;
  perPage?: number;
}): Promise<FnResult<UserFetchResponse>> {
  const sameUser = false;
  const subquery = db('activity_feed')
    .where('creator_id', curUserId)
    .whereIn('activity_type', ['star', 'comment'])
    .select('id');

  const { data: activities, pagination: meta } = await activityQueryBuilder()
    .where('lists.public', true)
    .where('activity_feed.id', 'not in', subquery)
    .paginate({
      perPage,
      currentPage,
    });

  if (activities.length === 0) {
    return {
      success: true,
      data: {
        activities,
        meta,
        lists: [],
        users: [],
        items: [],
        comments: [],
      },
    };
  }

  const data = await getActivityData({
    activities,
    sameUser,
    userId: curUserId,
  });
  if (data.success) {
    data.data.meta = meta;
  }
  return data;
}

export async function markAsViewed(props: {
  listId: string;
  creatorId: string;
}) {
  const exists = await db('activity_feed')
    .select('id')
    .where({
      activity_type: 'view_list',
      subject_id: props.listId,
      subject_type: 'list',
      creator_id: props.creatorId,
    })
    .first();

  if (exists?.id) {
    return {
      success: true,
      data: {},
    };
  }

  await createActivity({
    activity_type: 'view_list',
    subject_id: props.listId,
    subject_type: 'list',
    creator_id: props.creatorId,
  });
}
