import redisClient from 'redis';
import { promisify } from 'util';

import { env } from './env';

export const redis = redisClient.createClient({
  password: env.redisPassword,
  host: env.redisHost,
});
export const redisGet = promisify(redis.get).bind(redis);
export const redisSet = promisify(redis.set).bind(redis);

redis.on('error', function (error) {
  console.error(error);
});
