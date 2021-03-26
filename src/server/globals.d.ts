import Knex from 'knex';

import { dbTypes } from '@app/types';

declare module 'knex/types/tables' {
  interface Tables {
    app_users: Knex.CompositeTableType<
      // This interface will be used for return type and
      // `where`, `having` etc where full type is required
      dbTypes.app_users,
      // This interface is used for "insert()"  calls.
      Pick<dbTypes.app_users, 'email' | 'username'> &
        Partial<
          Pick<
            dbTypes.app_users,
            | 'passhash'
            | 'is_active'
            | 'picture'
            | 'name'
            | 'client_id'
            | 'is_guest'
          >
        >,
      // This interface is used for "update()" calls.
      Partial<Omit<dbTypes.app_users, 'id'>> &
        Pick<dbTypes.app_users, 'updated_at'>
    >;
    lists: Knex.CompositeTableType<
      // select
      dbTypes.lists,
      // insert
      Pick<dbTypes.lists, 'name' | 'owner_id' | 'url_name'> &
        Partial<
          Pick<dbTypes.lists, 'description' | 'public' | 'plugins' | 'settings'>
        >,
      // update
      Partial<Omit<dbTypes.lists, 'id'>> & Pick<dbTypes.lists, 'updated_at'>
    >;
    list_items: Knex.CompositeTableType<
      // select
      dbTypes.list_items,
      // insert
      Pick<dbTypes.list_items, 'list_id' | 'text' | 'order'> &
        Partial<Pick<dbTypes.list_items, 'notes' | 'metadata'>>,
      // update
      Partial<Omit<dbTypes.list_items, 'id'>> &
        Pick<dbTypes.list_items, 'updated_at'>
    >;
    plugin_voting: Knex.CompositeTableType<
      dbTypes.plugin_voting,
      Pick<dbTypes.plugin_voting, 'list_id' | 'item_id' | 'user_id'>
    >;
    plugins: dbTypes.plugins;
    list_comments: Knex.CompositeTableType<
      dbTypes.list_comments,
      Pick<dbTypes.list_comments, 'comment' | 'list_id' | 'item_id' | 'user_id'>
    >;
    list_stars: Knex.CompositeTableType<
      dbTypes.list_stars,
      Pick<dbTypes.list_stars, 'user_id' | 'list_id'>
    >;
    email_verifications: Knex.CompositeTableType<
      dbTypes.email_verifications,
      Pick<dbTypes.email_verifications, 'email' | 'code'>,
      Pick<dbTypes.email_verifications, 'used_at'>
    >;
    plugin_suggestions: Knex.CompositeTableType<
      dbTypes.plugin_suggestions,
      Pick<dbTypes.plugin_suggestions, 'list_id' | 'user_id' | 'text'>,
      | Pick<dbTypes.plugin_suggestions, 'updated_at' | 'item_id'>
      | Pick<dbTypes.plugin_suggestions, 'updated_at' | 'rejected'>
    >;
    activity_feed: Knex.CompositeTableType<
      dbTypes.activity_feed,
      Pick<
        dbTypes.activity_feed,
        'activity_type' | 'creator_id' | 'subject_id' | 'subject_type'
      > &
        Partial<dbTypes.activity_feed, 'metadata'>
    >;
  }
}

// count and countDistinct invocations (for any table)
declare module 'knex/types/result' {
  interface Registry {
    Count: number;
  }
}
