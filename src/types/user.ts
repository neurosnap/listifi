import { app_users } from './db';

export type UserResponse = Pick<
  app_users,
  | 'id'
  | 'username'
  | 'email'
  | 'name'
  | 'picture'
  | 'is_guest'
  | 'created_at'
  | 'verified'
>;

export type UserJWTServer = app_users & {
  iat: number;
  exp: number;
  email_notifications: boolean;
};

export type UserJWT = Omit<UserResponse, 'created_at'> & {
  iat: number;
  exp: number;
  created_at: string;
  email_notifications: boolean;
};

export interface UserClient {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  isGuest: boolean;
  picture: string;
  name: string;
}
