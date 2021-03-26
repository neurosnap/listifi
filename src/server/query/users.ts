import { db } from '../knex';

export function userQueryBuilder() {
  return db('app_users').select(
    'app_users.id',
    'app_users.email',
    'app_users.name',
    'app_users.picture',
    'app_users.username',
    'app_users.created_at',
    'app_users.is_guest',
    'app_users.verified',
  );
}
