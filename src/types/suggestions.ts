import { plugin_suggestions } from './db';
import { UserResponse } from './user';

export interface ApiPostListSuggestions {
  text: string;
}

export type ListSuggestionResponse = plugin_suggestions;

export interface ApiFetchListSuggestionsResponse {
  suggestions: ListSuggestionResponse[];
  users: UserResponse[];
}

export interface ListSuggestion {
  id: string;
  listId: string;
  itemId: string;
  userId: string;
  text: string;
  rejected: boolean;
  createdAt: string;
  updatedAt: string;
}
