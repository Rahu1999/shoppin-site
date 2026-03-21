import Redis from 'ioredis';
import { env } from './env';

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error('❌ Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  enableOfflineQueue: false,
  lazyConnect: true,
};

export const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err.message));

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.warn('⚠️  Redis not available – caching disabled');
  }
};

// Cache helpers
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch {
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: string,
  ttlSeconds = 300
): Promise<void> => {
  try {
    await redisClient.setex(key, ttlSeconds, value);
  } catch {
    // silent fail — Redis is optional
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch {
    // silent fail
  }
};

export const cacheDeletePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) await redisClient.del(...keys);
  } catch {
    // silent fail
  }
};
