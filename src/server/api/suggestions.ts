import Router from '@koa/router';
import jwt from 'koa-jwt';
import debug from 'debug';

import {
  ApiFetchListSuggestionsResponse,
  ApiPostListSuggestions,
  ApproveSuggestionResponse,
  ListSuggestionResponse,
  UserResponse,
} from '@app/types';
import { listDetailUrl } from '@app/routes';
import { validEmail } from '@app/validate';

import { getBody, requireBody, sendBody } from '../body';
import { env, jwtOptions } from '../env';
import { db } from '../knex';
import {
  createItems,
  EmailTemplates,
  getLastOrder,
  sendEmail,
} from '../services';
import { userQueryBuilder } from '../query';
import { createActivity } from '../services/activity';

const log = debug('server:suggestions');

export const suggestionsRouter = new Router({
  prefix: '/api/suggestions',
});

suggestionsRouter.get('/:listId', async (ctx) => {
  // const userId: string = ctx.state.user.id;
  const { listId } = ctx.params;
  const list = await db('lists').where('id', listId).first();
  if (!list) {
    return ctx.throw(404, 'list not found');
  }

  /* if (list.owner_id !== userId) {
    return ctx.throw(
      401,
      'you are not authorized to view the suggestions for this list',
    );
  } */

  const suggestions = await db('plugin_suggestions').where('list_id', listId);
  const users: UserResponse[] = await userQueryBuilder()
    .innerJoin('plugin_suggestions as ps', 'ps.user_id', 'app_users.id')
    .groupBy('app_users.id', 'ps.list_id')
    .where('ps.list_id', listId);
  sendBody<ApiFetchListSuggestionsResponse>(ctx, { suggestions, users });
});

/**
 * PRIVATE ROUTES
 */
suggestionsRouter.use(jwt(jwtOptions));

suggestionsRouter.post('/:listId', async (ctx) => {
  requireBody(ctx, ['text']);
  const userId: string = ctx.state.user.id;
  const { listId } = ctx.params;
  const { text } = getBody<ApiPostListSuggestions>(ctx);

  const list = await db('lists').where('id', listId).first();
  if (!list) {
    return ctx.throw(404, 'list not found');
  }

  const owner = await db('app_users').where('id', list.owner_id).first();
  if (!owner) {
    return ctx.throw(404, 'owner not found');
  }

  const user = await db('app_users').where('id', userId).first();
  if (!user) {
    return ctx.throw(404, 'user not found');
  }

  if (owner.id === user.id) {
    return ctx.throw(422, 'owner of list cannot make a suggestion');
  }

  const [suggestion] = await db('plugin_suggestions').insert(
    {
      user_id: userId,
      list_id: listId,
      text,
    },
    '*',
  );

  await createActivity({
    activity_type: 'suggestion',
    subject_type: 'list',
    subject_id: list.id,
    creator_id: userId,
  });

  if (validEmail(owner.email).isValid && owner.email_notifications) {
    try {
      await sendEmail(EmailTemplates.suggestionRequest, owner.email, {
        username: user.username,
        listname: list.name,
        text,
        list_url: `${env.apiUrl}${listDetailUrl(
          owner.username,
          list.url_name,
        )}`,
      });
    } catch (err) {
      log(err);
    }
  }

  sendBody<ListSuggestionResponse>(ctx, suggestion);
});

suggestionsRouter.post('/:listId/approve/:id', async (ctx) => {
  const userId: string = ctx.state.user.id;
  const { listId, id } = ctx.params;

  const suggestion = await db('plugin_suggestions').where('id', id).first();
  if (!suggestion) {
    return ctx.throw(404, 'suggestion not found');
  }

  const list = await db('lists').where('id', listId).first();
  if (!list) {
    return ctx.throw(404, 'list not found');
  }

  if (list.owner_id !== userId) {
    return ctx.throw(
      401,
      'you are not authorized to approve a suggestion on this list',
    );
  }

  const owner = await db('app_users').where('id', list.owner_id).first();
  if (!owner) {
    return ctx.throw(404, 'owner not found');
  }

  const user = await db('app_users').where('id', suggestion.user_id).first();

  const listItems = await db('list_items').where('list_id', listId);
  const lastOrder = getLastOrder(listItems);
  const [item] = await createItems(listId, lastOrder, [suggestion.text]);
  const [nextSuggestion] = await db('plugin_suggestions')
    .where('id', id)
    .update({ updated_at: new Date(), item_id: item.id })
    .returning('*');

  if (user && validEmail(user.email).isValid && user.email_notifications) {
    try {
      await sendEmail(EmailTemplates.suggestionApproved, user.email, {
        username: owner.username,
        listname: list.name,
        text: suggestion.text,
        list_url: `${env.apiUrl}${listDetailUrl(
          owner.username,
          list.url_name,
        )}`,
      });
    } catch (err) {
      log(err);
    }
  }

  sendBody<ApproveSuggestionResponse>(ctx, {
    item,
    suggestion: nextSuggestion,
  });
});

suggestionsRouter.post('/:listId/reject/:id', async (ctx) => {
  const userId: string = ctx.state.user.id;
  const { listId, id } = ctx.params;

  const suggestion = await db('plugin_suggestions').where('id', id).first();
  if (!suggestion) {
    return ctx.throw(404, 'suggestion not found');
  }

  const list = await db('lists').where('id', listId).first();
  if (!list) {
    return ctx.throw(404, 'list not found');
  }

  if (list.owner_id !== userId) {
    return ctx.throw(
      401,
      'you are not authorized to reject a suggestion on this list',
    );
  }

  const [nextSuggestion] = await db('plugin_suggestions')
    .where('id', id)
    .update({ updated_at: new Date(), rejected: true }, '*');
  sendBody<ListSuggestionResponse>(ctx, nextSuggestion);
});
