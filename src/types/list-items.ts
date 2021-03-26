import { list_items } from './db';
import { ModelBase } from './model';
import { OGData } from './og';

export type ListItemResponse = list_items;

export interface MetaData {
  ogData: OGData;
}

export interface ListItemClient extends ModelBase {
  text: string;
  metadata: MetaData | null;
  listId: string;
  order: number;
  notes: string;
}
export interface UpsertListItem {
  id?: string;
  text: string;
  notes?: string;
  order: number;
  listId: string;
  metadata: MetaData | null;
}
