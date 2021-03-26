import { ListCommentResponse } from './comments';
import { ListItemResponse } from './list-items';
import { ListResponse } from './lists';
import { ListSuggestionResponse } from './suggestions';
import { UserResponse } from './user';

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
export interface UserFetchResponse {
  user: UserResponse;
  lists: ListResponse[];
}

export interface ApproveSuggestionResponse {
  item: ListItemResponse;
  suggestion: ListSuggestionResponse;
}

export interface ApiUpdateSettings {
  token: string;
  user: UserResponse;
}
