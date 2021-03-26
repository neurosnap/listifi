import { State } from '@app/types';
import { createAssign, createReducerMap } from 'robodux';
import { v4 as uuid } from 'uuid';

export const createId = () => uuid();

export const CLIENT_ID_SLICE = 'clientId';
const slice = createAssign({ name: CLIENT_ID_SLICE, initialState: '' });
export const { set: setClientId } = slice.actions;

export const reducers = createReducerMap(slice);

export const selectClientId = (state: State) => state[CLIENT_ID_SLICE] || '';
