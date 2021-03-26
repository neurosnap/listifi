import { plugin_voting } from './db';

export type VotingResponse = plugin_voting;
export interface ItemVoteTally {
  [key: string]: number;
}

export interface ApiVoteResponse {
  votes: VotingResponse[];
  tally: ItemVoteTally;
}
