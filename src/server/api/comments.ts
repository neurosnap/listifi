import Router from '@koa/router';
import jwt from 'koa-jwt';

import { FetchListCommentsResponse, ListCommentResponse } from '@app/types';
import { validEmail } from '@app/validate';
import { listDetailUrl } from '@app/routes';

import { EmailTemplates, getCommentsForList, sendEmail } from '../services';
import { getBody, requireBody, sendBody } from '../body';
import { env, jwtOptions } from '../env';
import { db } from '../knex';
import { createActivity } from '../services/activity';

export const commentsRouter = new Router({ prefix: '/api/comments' });

commentsRouter.get('/:listId', async (ctx) => {
  const { listId } = ctx.params;
  const result = await getCommentsForList(listId);
  if (!result.success) {
    return ctx.throw(result.data.status, result.data.message);
  }

  sendBody<FetchListCommentsResponse>(ctx, result.data);
});

commentsRouter.use(jwt(jwtOptions));

commentsRouter.delete('/:id', async (ctx) => {
  const userId: string = ctx.state.user.id;
  const { id } = ctx.params;
  const comment = await db('list_comments').where('id', id).first();

  if (!comment) {
    return ctx.throw(404, `list comment not found with id ${id}`);
  }

  if (comment.user_id !== userId) {
    return ctx.throw(403, `you do not have access to delete this comment`);
  }

  await db('list_comments').where('id', id).delete();
  ctx.status = 204;
});

commentsRouter.post('/', async (ctx) => {
  requireBody(ctx, ['comment']);
  const body = getBody<{
    comment: string;
    list_id: string;
    item_id: string;
  }>(ctx);
  const userId: string = ctx.state.user.id;

  const list = await db('lists').where('id', body.list_id).first();
  if (!list) {
    return ctx.throw(404, `list not found with id ${body.list_id}`);
  }

  const user = await db('app_users').where('id', userId).first();
  if (!user) {
    return ctx.throw(404, 'user trying to post does not exist');
  }

  const [listComment] = await db('list_comments').insert(
    {
      comment: body.comment,
      list_id: list.id,
      user_id: userId,
      item_id: body.item_id || null,
    },
    '*',
  );
  if (!listComment) {
    return ctx.throw(500, 'could not create comment');
  }

  if (body.item_id) {
    await createActivity({
      activity_type: 'comment',
      subject_type: 'list_item',
      subject_id: body.item_id,
      creator_id: userId,
    });
  } else {
    await createActivity({
      activity_type: 'comment',
      subject_type: 'list',
      subject_id: body.list_id,
      creator_id: userId,
    });
  }

  const owner = await db('app_users').where('id', list.owner_id).first();
  if (!owner) {
    return ctx.throw(500, 'could not find user');
  }

  if (validEmail(owner.email).isValid && owner.email_notifications) {
    sendEmail(EmailTemplates.comment, owner.email, {
      username: user.username,
      listname: list.name,
      text: body.comment,
      list_url: `${env.apiUrl}${listDetailUrl(owner.username, list.url_name)}`,
    });
  }

  sendBody<ListCommentResponse>(ctx, listComment);
});
