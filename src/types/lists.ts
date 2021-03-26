import { lists } from './db';
import { ListItemResponse } from './list-items';
import { ModelBase } from './model';

export interface Computedlists extends lists {
  username: string;
  stars: string;
  comments: string;
}

export type ListResponse = Computedlists;

export interface ListSettings {
  [key: string]: string | number;
}
export interface ListClient extends ModelBase {
  name: string;
  description: string;
  ownerId: string;
  public: boolean;
  stars: number;
  comments: number;
  username: string;
  urlName: string;
  plugins: string[];
  settings: ListSettings;
}

export interface UpsertList {
  id?: string;
  name: string;
  description?: string;
  public?: boolean;
  items?: string;
  plugins?: string[];
  settings?: ListSettings;
}

export interface BulkCreateList {
  text: string;
}

export interface BulkCreateListResponse {
  list: ListResponse;
  items: ListItemResponse[];
}

export interface ApiOrderResponse {
  list: ListResponse;
  items: ListItemResponse[];
}
