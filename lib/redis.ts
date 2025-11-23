import Redis from 'ioredis';

/**
 * Redis client for caching enriched trends
 * Uses REDIS_URL from environment (Vercel/Upstash Redis)
 *
 * Connection is lazy - only connects when first command is executed
 */

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        // Exponential backoff: 50ms, 100ms, 200ms
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true, // Don't connect until first command
    });

    // Handle connection errors
    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }

  return redis;
}

/**
 * Helper to set a value with TTL (Time To Live)
 *
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param ttlSeconds - TTL in seconds (default: 1 hour)
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<void> {
  const client = getRedisClient();
  await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

/**
 * Helper to get a value from cache
 *
 * @param key - Cache key
 * @returns Parsed value or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  const value = await client.get(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Helper to delete a key from cache
 *
 * @param key - Cache key
 */
export async function deleteCache(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
