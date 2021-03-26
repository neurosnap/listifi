import { list_stars } from './db';
import { ListResponse } from './lists';

export type StarResponse = list_stars;

export interface StarClient {
  id: string;
  userId: string;
  listId: string;
  createdAt: string;
}

export interface ApiStarsResponse {
  stars: StarResponse[];
  lists: ListResponse[];
}
