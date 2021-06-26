import { IPagination, IPaginateParams } from 'knex-paginate';

import { ListCommentResponse } from './comments';
import { ListItemResponse } from './list-items';
import { ListResponse } from './lists';
import { ListSuggestionResponse } from './suggestions';
import { UserResponse } from './user';
import { ActivityResponse } from './activity';

export interface FetchListResponse {
  list: ListResponse;
  items: ListItemResponse[];
  users: UserResponse[];
  comments: ListCommentResponse[];
}

export interface ApiListsResponse {
  lists: ListResponse[];
  users: UserResponse[];
}

export interface ApiListsPaginatedResponse extends ApiListsResponse {
  items: ListItemResponse[];
  meta: IPagination<IPaginateParams>;
}

export interface UserFetchResponse {
  activities: ActivityResponse[];
  users: UserResponse[];
  lists: ListResponse[];
  items: ListItemResponse[];
  comments: ListCommentResponse[];
  meta?: IPagination<IPaginateParams>;
}

export interface ApproveSuggestionResponse {
  item: ListItemResponse;
  suggestion: ListSuggestionResponse;
}

export interface ApiUpdateSettings {
  token: string;
  user: UserResponse;
}
