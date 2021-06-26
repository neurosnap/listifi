import { defaultMetadata } from '@app/metadata';
import { ListClient, ListItemClient } from '@app/types';

export const defaultList = (list: Partial<ListClient> = {}): ListClient => {
  const now = new Date().toISOString();
  return {
    id: '',
    name: '',
    description: '',
    ownerId: '',
    public: false,
    stars: 0,
    comments: 0,
    views: 0,
    username: '',
    urlName: '',
    plugins: [],
    settings: {},
    createdAt: now,
    updatedAt: now,
    ...list,
  };
};

export function defaultListItem(
  item: Partial<ListItemClient> = {},
): ListItemClient {
  const now = new Date().toISOString();
  return {
    id: '',
    text: '',
    listId: '',
    order: 0,
    notes: '',
    createdAt: now,
    updatedAt: now,
    metadata: defaultMetadata(),
    ...item,
  };
}
