import { dbTypes } from '@app/types';
import { db } from '../knex';

export function activityQueryBuilder() {
  return db<dbTypes.activity_feed>('activity_feed')
    .select(
      'activity_feed.id',
      'activity_feed.activity_type',
      'activity_feed.subject_type',
      'activity_feed.subject_id',
      'activity_feed.creator_id',
      'activity_feed.metadata',
      'activity_feed.created_at',
      'activity_feed.updated_at',
    )
    .innerJoin('lists', 'activity_feed.subject_id', 'lists.id')
    .whereIn('activity_type', ['list', 'comment', 'star'])
    .orderBy('activity_feed.created_at', 'desc');
}
