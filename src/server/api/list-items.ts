import Router from '@koa/router';
import jwt from 'koa-jwt';

import {
  FetchListCommentsResponse,
  Computedlists,
  UpsertListItem,
  ListItemResponse,
  UserResponse,
} from '@app/types';

import { getBody, requireBody, sendBody } from '../body';
import { db } from '../knex';
import { listQueryBuilder, userQueryBuilder } from '../query';
import { jwtOptions } from '../env';
import { getLastOrder, extractOgData } from '../services';

export const listItemsRouter = new Router({ prefix: '/api/lists' });

listItemsRouter.get('/:listId/items/:id/comments', async (ctx) => {
  const { id } = ctx.params;
  const item = await db('list_items').where('id', id).first();

  if (!item) {
    return ctx.throw(404, `list item not found with id ${id}`);
  }

  const comments = await db('list_comments').where('item_id', id);

  const users: UserResponse[] = await userQueryBuilder()
    .leftOuterJoin('list_comments', 'list_comments.user_id', 'app_users.id')
    .where('list_comments.item_id', id)
    .groupBy([
      'app_users.id',
      'app_users.email',
      'app_users.name',
      'app_users.picture',
      'app_users.username',
      'app_users.created_at',
      'app_users.verified',
    ]);

  sendBody<FetchListCommentsResponse>(ctx, { users, comments });
});

/**
 * PRIVATE ROUTES
 */
listItemsRouter.use(jwt(jwtOptions));

listItemsRouter.post('/:listId/items', async (ctx) => {
  requireBody(ctx, ['text']);
  const userId: string = ctx.state.user.id;
  const body = getBody<UpsertListItem>(ctx);
  const { listId } = ctx.params;
  const list: Computedlists | undefined = await listQueryBuilder()
    .where('lists.id', listId)
    .first();
  if (!list) {
    return ctx.throw(404, `list not found with id ${listId}`);
  }

  if (list.owner_id !== userId) {
    return ctx.throw(
      403,
      `you do not have access to create a list item for list id ${listId}`,
    );
  }

  const items = await db('list_items').where('list_id', listId);
  const lastOrder = getLastOrder(items);
  const order = body.order || lastOrder + 1;

  const ogData: any = await extractOgData(body.text);

  const [listItem] = await db('list_items').insert(
    {
      list_id: listId,
      text: body.text,
      order,
      notes: body.notes,
      metadata: {
        ogData,
      },
    },
    '*',
  );
  if (!listItem) {
    return ctx.throw(500, 'could not create list item');
  }

  await db('lists').where('id', list.id).update({ updated_at: new Date() });

  sendBody<ListItemResponse>(ctx, listItem);
});

listItemsRouter.put('/:listId/items/:id', async (ctx) => {
  requireBody(ctx, ['text']);
  const userId: string = ctx.state.user.id;
  const body = getBody<UpsertListItem>(ctx);
  const { listId, id } = ctx.params;
  const list = await db('lists').where('id', listId).first();

  if (!list) {
    return ctx.throw(404, `list not found with id ${listId}`);
  }

  if (list.owner_id !== userId) {
    return ctx.throw(
      403,
      `you do not have access to create a list item for list id ${listId}`,
    );
  }

  const ogData: any = await extractOgData(body.text);

  const updatedAt = new Date();
  const data: any = {
    text: body.text,
    metadata: {
      ogData,
    },
    order: body.order,
    updated_at: updatedAt,
  };

  if (body.notes) {
    data.notes = body.notes;
  }

  const [listItem] = await db('list_items')
    .where('id', id)
    .update(data)
    .returning('*');
  if (!listItem) {
    return ctx.throw(500, 'could not create list item');
  }

  await db('lists').where('id', list.id).update({ updated_at: updatedAt });

  sendBody<ListItemResponse>(ctx, listItem);
});

listItemsRouter.delete('/:listId/items/:id', async (ctx) => {
  const userId: string = ctx.state.user.id;
  const { id } = ctx.params;
  const item = await db('list_items').where('id', id).first();
  if (!item) {
    return ctx.throw(404, `list item not found with id ${id}`);
  }

  const list = await db('lists').where('id', item.list_id).first();
  if (!list) {
    return ctx.throw(404, `list not found with id ${item.list_id}`);
  }

  if (list.owner_id !== userId) {
    return ctx.throw(
      403,
      `you do not have access to delete this list item ${list.id}`,
    );
  }

  await db('list_items').where('id', id).delete();
  await db('lists').where('id', list.id).update({ updated_at: new Date() });

  ctx.status = 204;
});
