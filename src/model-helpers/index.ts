import { isValidDate } from '@app/date-helpers';
import { ModelBase, ModelBaseResponse } from '@app/types';

export function deserializeDate(date: Date | string | null): string {
  const d = isValidDate(date)
    ? (date as Date).toISOString()
    : (date as string | null);

  return d || '';
}

export function deserializeModelBase(model: ModelBaseResponse): ModelBase {
  return {
    id: model.id,
    createdAt: deserializeDate(model.created_at),
    updatedAt: deserializeDate(model.updated_at),
  };
}
