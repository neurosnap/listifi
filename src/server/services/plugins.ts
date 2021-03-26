import { db } from '../knex';

export async function getPlugins() {
  const plugins = await db('plugins').select('*');
  return plugins;
}
