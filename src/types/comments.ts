import { list_comments } from './db';
import { ModelBase } from './model';
import { UserResponse } from './user';

export type ListCommentResponse = list_comments;

export interface FetchListCommentsResponse {
  comments: ListCommentResponse[];
  users: UserResponse[];
}

export interface ListCommentClient extends ModelBase {
  listId: string;
  itemId: string | null;
  userId: string;
  comment: string;
}

export interface UpsertListComment {
  id?: string;
  list_id: string;
  user_id: string;
  item_id?: string;
  comment: string;
}
