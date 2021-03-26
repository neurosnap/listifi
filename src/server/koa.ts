import Koa from 'koa';

import { UserJWTServer } from '@app/types';

export interface KoaState extends Koa.DefaultState {
  user?: UserJWTServer;
}
