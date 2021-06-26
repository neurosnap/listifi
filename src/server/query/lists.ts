import { Computedlists } from '@app/types';
import { db } from '../knex';

export function listQueryBuilder() {
  const listIdentifier = db.ref('lists.id');
  const stars = db('list_stars')
    .where('list_stars.list_id', listIdentifier)
    .count<number>('list_stars.id')
    .as('stars');
  const comments = db('list_comments')
    .where('list_comments.list_id', listIdentifier)
    .count<number>('list_comments.id')
    .as('comments');
  const views = db('activity_feed')
    .where('activity_feed.subject_id', listIdentifier)
    .where('activity_feed.activity_type', 'view_list')
    .count<number>('activity_feed.id')
    .as('views');
  return db<Computedlists>('lists')
    .select(
      'lists.id',
      'lists.name',
      'lists.description',
      'lists.owner_id',
      'lists.public',
      'lists.created_at',
      'lists.updated_at',
      'lists.url_name',
      'lists.plugins',
      'lists.settings',
      'app_users.username',
      stars,
      comments,
      views,
    )
    .leftOuterJoin('app_users', 'app_users.id', 'lists.owner_id')
    .groupBy(
      'lists.id',
      'lists.name',
      'lists.description',
      'lists.owner_id',
      'lists.public',
      'lists.created_at',
      'lists.updated_at',
      'lists.url_name',
      'lists.plugins',
      'lists.settings',
      'app_users.username',
    );
}
