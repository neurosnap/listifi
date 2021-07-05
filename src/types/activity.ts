import { activity_feed } from './db';
import { ModelBase } from './model';

interface ActivityBase {
  subject_id: string;
  creator_id: string;
  metadata?: { [key: string]: any } | null;
}

interface CommentActivity extends ActivityBase {
  activity_type: 'comment';
  subject_type: 'list';
}

interface ListActivity extends ActivityBase {
  activity_type: 'list';
  subject_type: 'list';
}

interface UpdateListActivity extends ActivityBase {
  activity_type: 'update_list';
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

interface ViewListActivity extends ActivityBase {
  activity_type: 'view_list';
  subject_type: 'list';
}

export type CreateActivity =
  | CommentActivity
  | ListActivity
  | StarActivity
  | VoteActivity
  | SuggestionActivity
  | ViewListActivity
  | UpdateListActivity;

export type ActivityType =
  | 'comment'
  | 'list'
  | 'update_list'
  | 'star'
  | 'vote'
  | 'suggestion'
  | 'view_list'
  | 'unknown';
export type ActivityResponse = activity_feed;

export interface ActivityClient extends ModelBase {
  creatorId: string;
  subjectType: string;
  subjectId: string;
  activityType: ActivityType;
  metadata: { [key: string]: any };
}
