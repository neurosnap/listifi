import { ApiListsResponse, Computedlists, UserResponse } from '@app/types';
import Router from '@koa/router';
import { sendBody } from '../body';
import { listQueryBuilder, userQueryBuilder } from '../query';

export const searchRouter = new Router({ prefix: '/api/search' });

searchRouter.get('/:query', async (ctx) => {
  const userId: string = ctx.state.user.id;
  const { query } = ctx.params;
  if (!query) {
    return ctx.throw(422, 'must provide query in order to search lists');
  }

  if (query.length < 2) {
    return ctx.throw(422, 'query must be at least two characters');
  }

  const builder = listQueryBuilder().where((qb) => {
    qb.where('lists.public', true);
    if (userId) {
      qb.orWhere('lists.owner_id', userId);
    }
    return qb;
  });

  const lists: Computedlists[] = await builder
    .andWhere((qb) => {
      return qb
        .where('lists.name', 'ilike', `%${query}%`)
        .orWhere('app_users.username', 'ilike', `%${query}%`);
    })
    .limit(8);

  const userIds = lists.map((list) => list.owner_id);
  const users: UserResponse[] = await userQueryBuilder().whereIn('id', userIds);

  sendBody<ApiListsResponse>(ctx, { lists, users });
});
