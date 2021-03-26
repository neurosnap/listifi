import knex from 'knex';

import { env } from './env';

export const db = knex({
  client: 'pg',
  connection: env.databaseUrl,
  pool: { min: 2, max: 10 },
});
