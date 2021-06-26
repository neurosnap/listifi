import { createListTable, createReducerMap } from 'robodux';

import {
  State,
  ActivityResponse,
  ActivityClient,
  ActivityType,
} from '@app/types';
import { deserializeModelBase } from '@app/model-helpers';

export const defaultActivity = (
  a: Partial<ActivityClient> = {},
): ActivityClient => {
  return {
    id: '',
    createdAt: '',
    updatedAt: '',
    creatorId: '',
    subjectId: '',
    subjectType: '',
    activityType: 'unknown',
    metadata: {},
    ...a,
  };
};

export const deserializeActivity = (a: ActivityResponse): ActivityClient => {
  const base = deserializeModelBase(a);
  return {
    ...base,
    creatorId: a.creator_id,
    subjectId: a.subject_id,
    subjectType: a.subject_type,
    activityType: a.activity_type as ActivityType,
    metadata: (a.metadata as any) || {},
  };
};

export function processActivities(id: string, activities: ActivityResponse[]) {
  return { [id]: activities.map((act) => deserializeActivity(act)) };
}

export const ACTIVITIES_NAME = 'activities';
const activities = createListTable<ActivityClient[]>({ name: ACTIVITIES_NAME });
export const { add: addActivities } = activities.actions;
export const selectActivities = (s: State) => s[ACTIVITIES_NAME] || {};
export const selectActivityByIds = (s: State, p: { ids: string[] }) =>
  p.ids.reduce<ActivityClient[]>((acc, id) => {
    const activities = selectActivities(s)[id] || [];
    acc.push(...activities);
    return acc;
  }, []);

export const reducers = createReducerMap(activities);
