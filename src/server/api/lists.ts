import Router from '@koa/router';
import jwt from 'koa-jwt';

import {
  ApiListsResponse,
  ApiListsPaginatedResponse,
  FetchListResponse,
  UpsertList,
  BulkCreateListResponse,
  ListResponse,
  BulkCreateList,
  Computedlists,
  StarResponse,
  ApiOrderResponse,
  UserFetchResponse,
} from '@app/types';
import { formatUrlName, validListName } from '@app/validate';

import { getBody, requireBody, sendBody } from '../body';
import { db } from '../knex';
import { listQueryBuilder } from '../query';
import { jwtOptions } from '../env';
import {
  createItems,
  getLastOrder,
  textToItems,
  getExploreData,
  getListDetailData,
  getUserListData,
  createActivity,
  getActivityForFeed,
  markAsViewed,
} from '../services';

export const listRouter = new Router({ prefix: '/api/lists' });

listRouter.get('/explore', async (ctx) => {
  const currentPage = ctx.request.query.page;
  const result = await getExploreData({ currentPage });
  if (!result.success) {
    return ctx.throw(result.data.status, result.data.message);
  }
  sendBody<ApiListsPaginatedResponse>(ctx, result.data);
});

listRouter.get('/feed', async (ctx) => {
  const curUserId = ctx.state.user.id;
  const currentPage = ctx.request.query.page;
  const result = await getActivityForFeed({
    curUserId,
    currentPage,
  });
  if (!result.success) {
    return ctx.throw(result.data.status, result.data.message);
  }
  sendBody<UserFetchResponse>(ctx, result.data);
});

listRouter.get('/:username/:listname', async (ctx) => {
  const { username, listname } = ctx.params;
  const result = await getListDetailData(username, listname);
  if (!result.success) {
    return ctx.throw(result.data.status, result.data.message);
  }

  sendBody<FetchListResponse>(ctx, result.data);
});

/**
 * PRIVATE ROUTES
 */
listRouter.use(jwt(jwtOptions));

listRouter.get('/', async (ctx) => {
  const userId: string = ctx.state.user.id;
  const { lists, user } = await getUserListData(userId);
  sendBody<ApiListsResponse>(ctx, { lists, users: [user] });
});

listRouter.post('/', async (ctx) => {
  requireBody(ctx, ['name']);
  const userId: string = ctx.state.user.id;
  if (!userId) {
    return ctx.throw(422, 'User id not found on token');
  }

  const body = getBody<UpsertList>(ctx);
  const urlName = formatUrlName(body.name);

  const nameValidator = validListName(body.name);
  if (!nameValidator.isValid) {
    return ctx.throw(422, nameValidator.reason);
  }

  const listAlreadyExists = await db('lists')
    .where('owner_id', userId)
    .where('url_name', urlName)
    .first();

  if (listAlreadyExists) {
    return ctx.throw(422, `List ${urlName} already exists`);
  }

  const data: any = {
    owner_id: userId,
    name: body.name,
    description: body.description || '',
    public: body.public || false,
    url_name: urlName,
  };
  if (body.plugins) {
    data.plugins = JSON.stringify(body.plugins);
  }
  if (body.settings) {
    data.settings = JSON.stringify(body.settings);
  }

  const [ls] = await db('lists').insert(data, ['id']);
  if (!ls) {
    return ctx.throw(500, 'list creation did not return a valid id');
  }
  const list: Computedlists = await listQueryBuilder()
    .where('lists.id', ls.id)
    .first();
  if (!list) {
    return ctx.throw(404, `list not found with id ${ls.id}`);
  }

  await createActivity({
    activity_type: 'list',
    subject_type: 'list',
    subject_id: list.id,
    creator_id: userId,
  });

  const itemsText = textToItems(body.items);
  const items = await createItems(ls.id, 0, itemsText);
  sendBody<BulkCreateListResponse>(ctx, { list, items });
});

listRouter.put('/:id', async (ctx) => {
  requireBody(ctx, ['name']);
  const userId: string = ctx.state.user.id;
  const { id } = ctx.params;
  const body = getBody<UpsertList>(ctx);
  const urlName = formatUrlName(body.name);

  const list = await db('lists').where('id', id).first();
  if (!list) {
    return ctx.throw(404, `list not found with id ${id}`);
  }

  if (list.owner_id !== userId) {
    return ctx.throw(
      403,
      `you do not have access to update this list id ${id}`,
    );
  }

  const data: any = {
    name: body.name,
    url_name: urlName,
    updated_at: new Date(),
  };
  if (typeof body.description === 'string') {
    data.description = body.description;
  }
  if (typeof body.public === 'boolean') {
    data.public = body.public;
  }
  if (body.plugins) {
    data.plugins = JSON.stringify(body.plugins);
  }
  if (body.settings) {
    data.settings = JSON.stringify(body.settings);
  }

  try {
    await db('lists').where('id', id).update(data);
    const newList = await listQueryBuilder().where('lists.id', id).first();
    if (!newList) {
      return ctx.throw(
        500,
        'a list was updated successfully but could not be queried',
      );
    }

    sendBody<ListResponse>(ctx, newList);
  } catch (err) {
    if (err.code === 'P2002') {
      return ctx.throw(
        409,
        `List name must be unique and (${body.name}) already exists.`,
      );
    }

    throw err;
  }
});

listRouter.post('/:listId/bulk', async (ctx) => {
  requireBody(ctx, ['text']);
  const userId: string = ctx.state.user.id;
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

  const { text } = getBody<BulkCreateList>(ctx);
  const items = textToItems(text);

  const listItems = await db('list_items').where('list_id', listId);
  const lastOrder = getLastOrder(listItems);
  const results = await createItems(listId, lastOrder, items);
  await db('lists').where('id', listId).update({ updated_at: new Date() });

  sendBody<BulkCreateListResponse>(ctx, { list, items: results });
});

listRouter.post('/:id/view', async (ctx) => {
  const { id } = ctx.params;
  const userId = ctx.state.user.id;
  await markAsViewed({ creatorId: userId, listId: id });
  ctx.status = 204;
});

listRouter.post('/:id/star', async (ctx) => {
  const { id } = ctx.params;
  const userId: string = ctx.state.user.id;
  const list = await db('lists').where('id', id);
  if (!list) {
    return ctx.throw(404, `list not found with id ${id}`);
  }

  const listStar = await db('list_stars')
    .where('list_id', id)
    .where('user_id', userId)
    .first();

  if (listStar) {
    await db('list_stars').where('id', listStar.id).delete();
    ctx.status = 204;
  } else {
    const [star] = await db('list_stars').insert(
      {
        user_id: userId,
        list_id: id,
      },
      '*',
    );
    if (!star) {
      return ctx.throw(500, 'star was not returned after being created');
    }

    await createActivity({
      activity_type: 'star',
      subject_type: 'list',
      subject_id: id,
      creator_id: userId,
    });

    sendBody<StarResponse>(ctx, star);
  }
});

listRouter.post('/:id/order', async (ctx) => {
  requireBody(ctx, ['order']);
  const userId: string = ctx.state.user.id;
  const { id } = ctx.params;
  const body = getBody<{ order: string[] }>(ctx);
  const list: Computedlists | undefined = await listQueryBuilder()
    .where('lists.id', id)
    .first();
  if (!list) {
    return ctx.throw(404, `list not found with id ${id}`);
  }

  if (list.owner_id !== userId) {
    return ctx.throw(
      403,
      `you do not have access to update this list id ${id}`,
    );
  }

  // figure out how to update the order for all items in the list
  const updates = body.order.map((itemId, order) => {
    return db('list_items')
      .where('id', itemId)
      .update({ order, updated_at: new Date() });
  });
  await Promise.all(updates);
  const items = await db('list_items')
    .where('list_id', id)
    .orderBy('order', 'asc');

  await db('lists').where('id', list.id).update({ updated_at: new Date() });

  sendBody<ApiOrderResponse>(ctx, { list, items });
});

listRouter.delete('/:id', async (ctx) => {
  const userId: string = ctx.state.user.id;
  const { id } = ctx.params;
  const list = await db('lists').where('id', id).first();
  if (!list) {
    return ctx.throw(404, `list not found with id ${id}`);
  }

  if (list.owner_id !== userId) {
    return ctx.throw(
      403,
      `you do not have access to create a list item for list id ${id}`,
    );
  }

  await db('lists').where('id', id).delete();
  ctx.status = 204;
});
