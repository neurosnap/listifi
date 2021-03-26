import { deserializeDate, deserializeModelBase } from '@app/model-helpers';
import {
  dbTypes,
  ListClient,
  ListItemClient,
  ListItemResponse,
  ListResponse,
  StarClient,
  StarResponse,
  ListSettings,
} from '@app/types';

const deserializePlugins = (jso: dbTypes.JSONValue): string[] => {
  if (!jso) return [];
  if (Array.isArray(jso)) {
    return jso as string[];
  }
  return [];
};

const deserializeSettings = (jso: dbTypes.JSONValue): ListSettings => {
  if (!jso) return {};
  if (Array.isArray(jso)) return {};
  return jso as ListSettings;
};

export function deserializeList(list: ListResponse): ListClient {
  return {
    ...deserializeModelBase(list),
    name: list.name,
    description: list.description || '',
    ownerId: list.owner_id,
    public: list.public || false,
    stars: parseInt(list.stars, 10) || 0,
    comments: parseInt(list.comments, 10) || 0,
    username: list.username,
    urlName: list.url_name,
    plugins: deserializePlugins(list.plugins),
    settings: deserializeSettings(list.settings),
  };
}

export function deserializeListItem(item: ListItemResponse): ListItemClient {
  return {
    ...deserializeModelBase(item),
    text: item.text,
    notes: item.notes || '',
    metadata: item.metadata as any,
    listId: item.list_id || '',
    order: 0,
  };
}

export function deserializeStar(star: StarResponse): StarClient {
  return {
    id: star.id,
    createdAt: deserializeDate(star.created_at),
    listId: star.list_id,
    userId: star.user_id,
  };
}
