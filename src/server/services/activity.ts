import { db } from '../knex';

interface ActivityBase {
  subject_id: string;
  creator_id: string;
}

interface CommentActivity extends ActivityBase {
  activity_type: 'comment';
  subject_type: 'list_item' | 'list';
}

interface ListActivity extends ActivityBase {
  activity_type: 'list';
  subject_type: 'list';
}

interface StarActivity extends ActivityBase {
  activity_type: 'star';
  subject_type: 'list';
}

interface VoteActivity extends ActivityBase {
  activity_type: 'vote';
  subject_type: 'list_item';
}

interface SuggestionActivity extends ActivityBase {
  activity_type: 'suggestion';
  subject_type: 'list';
}

export type CreateActivity =
  | CommentActivity
  | ListActivity
  | StarActivity
  | VoteActivity
  | SuggestionActivity;

export async function createActivity(activity: CreateActivity) {
  const [feed] = await db('activity_feed').insert(activity, '*');
  return feed;
}
