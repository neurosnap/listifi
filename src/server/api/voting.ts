import Router from '@koa/router';
import jwt from 'koa-jwt';
import { ApiVoteResponse, ItemVoteTally, dbTypes } from '@app/types';

import { getBody, requireBody, sendBody } from '../body';
import { jwtOptions } from '../env';
import { db } from '../knex';
import { createActivity } from '../services/activity';

export const votingRouter = new Router({
  prefix: '/api/votes',
});

function calculateVotes(votes: dbTypes.plugin_voting[]) {
  return votes.reduce<ItemVoteTally>((acc, vote) => {
    if (!acc[vote.item_id]) {
      acc[vote.item_id] = 0;
    }

    acc[vote.item_id] += 1;
    return acc;
  }, {});
}

async function getVotesForList(listId: string) {
  const votes = await db('plugin_voting').where('list_id', listId);
  const tally = calculateVotes(votes);
  return { votes, tally };
}

votingRouter.get('/:listId', async (ctx) => {
  const { listId } = ctx.params;
  const res = await getVotesForList(listId);
  sendBody<ApiVoteResponse>(ctx, res);
});

/**
 * PRIVATE ROUTES
 */
votingRouter.use(jwt(jwtOptions));

interface UpsertVote {
  item_id: string;
  user_id: string;
}

votingRouter.post('/:listId/vote', async (ctx) => {
  requireBody(ctx, ['item_id', 'user_id']);
  const { listId } = ctx.params;
  const userId: string = ctx.state.user.id;
  const body = getBody<UpsertVote>(ctx);
  const hasVoted = await db('plugin_voting')
    .where({ list_id: listId, item_id: body.item_id, user_id: body.user_id })
    .first();

  if (hasVoted) {
    await db('plugin_voting').where('id', hasVoted.id).delete();
  } else {
    const item = await db('list_items').where('id', body.item_id).first();
    if (!item) {
      return ctx.throw(404, 'list item not found');
    }

    await db('plugin_voting').insert({
      list_id: listId,
      user_id: body.user_id,
      item_id: body.item_id,
    });

    await createActivity({
      activity_type: 'vote',
      subject_type: 'list_item',
      subject_id: body.item_id,
      creator_id: userId,
    });
  }

  const res = await getVotesForList(listId);
  sendBody<ApiVoteResponse>(ctx, res);
});
