import Redis from 'ioredis';
import { createLogger } from './logger';

const logger = createLogger('External:Redis');

/**
 * Redis client for caching enriched trends
 * Uses REDIS_URL from environment (Vercel/Upstash Redis)
 *
 * Connection is lazy - only connects when first command is executed
 * Falls back to in-memory cache in development if Redis is unavailable
 */

let redis: Redis | null = null;
let redisAvailable = true;

// In-memory cache fallback for development
const memoryCache = new Map<string, { value: string; expires: number }>();

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
      logger.error('Redis connection error', error instanceof Error ? error : new Error(String(error)));

      // In development, mark Redis as unavailable and use memory fallback
      if (process.env.NODE_ENV === 'development') {
        redisAvailable = false;
        logger.warn('Falling back to in-memory cache for development');
      }
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
  // Try Redis first
  if (redisAvailable) {
    try {
      const client = getRedisClient();
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      logger.info(`Cache set: ${key} (Redis, TTL: ${ttlSeconds}s)`);
      return;
    } catch (error) {
      logger.error(
        'Redis set failed',
        error instanceof Error ? error : new Error(String(error))
      );

      // Fall back to memory cache in development
      if (process.env.NODE_ENV === 'development') {
        redisAvailable = false;
      } else {
        throw error;
      }
    }
  }

  // Use memory cache fallback (development only)
  if (process.env.NODE_ENV === 'development') {
    const expires = Date.now() + ttlSeconds * 1000;
    memoryCache.set(key, { value: JSON.stringify(value), expires });
    logger.info(`Cache set: ${key} (memory fallback, TTL: ${ttlSeconds}s)`);
  }
}

/**
 * Helper to get a value from cache
 *
 * @param key - Cache key
 * @returns Parsed value or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // Try Redis first
  if (redisAvailable) {
    try {
      const client = getRedisClient();
      const value = await client.get(key);

      if (!value) {
        logger.info(`Cache miss: ${key} (Redis)`);
        return null;
      }

      logger.info(`Cache hit: ${key} (Redis)`);
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(
        'Redis get failed',
        error instanceof Error ? error : new Error(String(error))
      );

      // Fall back to memory cache in development
      if (process.env.NODE_ENV === 'development') {
        redisAvailable = false;
      } else {
        throw error;
      }
    }
  }

  // Use memory cache fallback (development only)
  if (process.env.NODE_ENV === 'development') {
    const cached = memoryCache.get(key);

    if (!cached) {
      logger.info(`Cache miss: ${key} (memory fallback)`);
      return null;
    }

    // Check if expired
    if (cached.expires < Date.now()) {
      memoryCache.delete(key);
      logger.info(`Cache expired: ${key} (memory fallback)`);
      return null;
    }

    logger.info(`Cache hit: ${key} (memory fallback)`);
    try {
      return JSON.parse(cached.value) as T;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Helper to delete a key from cache
 *
 * @param key - Cache key
 */
export async function deleteCache(key: string): Promise<void> {
  // Try Redis first
  if (redisAvailable) {
    try {
      const client = getRedisClient();
      await client.del(key);
      logger.info(`Cache deleted: ${key} (Redis)`);
      return;
    } catch (error) {
      logger.error(
        'Redis delete failed',
        error instanceof Error ? error : new Error(String(error))
      );

      // Fall back to memory cache in development
      if (process.env.NODE_ENV === 'development') {
        redisAvailable = false;
      } else {
        throw error;
      }
    }
  }

  // Use memory cache fallback (development only)
  if (process.env.NODE_ENV === 'development') {
    memoryCache.delete(key);
    logger.info(`Cache deleted: ${key} (memory fallback)`);
  }
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
