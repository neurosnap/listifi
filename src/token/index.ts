import { createSelector } from 'reselect';
import { createAssign, createReducerMap } from 'robodux';
import jwtDecode from 'jwt-decode';

import { State, Token, UserJWT } from '@app/types';

export const TOKEN_SLICE = 'token';
const slice = createAssign({ name: TOKEN_SLICE, initialState: '' });
export const { set: setToken, reset: resetToken } = slice.actions;

export const selectToken = (state: State): Token => state[TOKEN_SLICE];

export const defaultJWTUser = (u: Partial<UserJWT> = {}): UserJWT => {
  const now = new Date();
  return {
    id: '',
    email: '',
    username: '',
    created_at: now.toISOString(),
    is_guest: false,
    picture: '',
    name: '',
    iat: 0,
    exp: 0,
    verified: false,
    email_notifications: true,
    ...u,
  };
};
const initUser = defaultJWTUser();
export const hasUser = (u: UserJWT): boolean => !!u.id;

export const selectUser = createSelector(
  selectToken,
  (token): UserJWT => {
    if (!token) return initUser;
    const user = jwtDecode<UserJWT>(token);
    return user;
  },
);

export const selectHasTokenExpired = (state: State) => {
  const user = selectUser(state);
  const cur = Math.floor(Date.now() / 1000);
  return cur > user.exp;
};

export const selectIsUserGuest = (state: State) => {
  const user = selectUser(state);
  return user.is_guest;
};

export const reducers = createReducerMap(slice);
