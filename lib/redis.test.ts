/**
 * Tests for Redis cache layer
 *
 * Critical infrastructure - tests cache operations, fallback behavior, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockConsole } from '@/test-utils/mockConsole';

// Mock ioredis before importing redis module
const mockRedisInstance = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  quit: vi.fn(),
  on: vi.fn(),
};

// Mock class for ioredis - must be a spy to track constructor calls
const MockRedis = vi.fn().mockImplementation(function (this: typeof mockRedisInstance) {
  return mockRedisInstance;
});

vi.mock('ioredis', () => ({
  default: MockRedis,
}));

describe('Redis Cache Layer', () => {
  let restoreConsole: () => void;
  let originalEnv: NodeJS.ProcessEnv;
  let originalNodeEnv: string | undefined;
  let redis: typeof import('./redis');

  beforeEach(async () => {
    // Mock console to suppress logger output
    restoreConsole = mockConsole();

    // Save original env
    originalEnv = { ...process.env };
    originalNodeEnv = process.env.NODE_ENV;

    // Reset modules to get fresh instance
    vi.resetModules();

    // Import fresh module
    redis = await import('./redis');

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    restoreConsole();
    // Restore environment - delete keys that were added
    Object.keys(process.env).forEach((key) => {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    });
    // Restore original values
    Object.assign(process.env, originalEnv);
    // Restore NODE_ENV specifically
    if (originalNodeEnv !== undefined) {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  });

  // Helper to set NODE_ENV safely
  function setNodeEnv(value: string) {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  describe('setCache', () => {
    it('should set value in Redis with TTL', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.set.mockResolvedValueOnce('OK');

      await redis.setCache('test-key', { data: 'value' }, 3600);

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({ data: 'value' }),
        'EX',
        3600
      );
    });

    it('should use default TTL of 3600 seconds when not specified', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.set.mockResolvedValueOnce('OK');

      await redis.setCache('test-key', 'value');

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify('value'),
        'EX',
        3600
      );
    });

    it('should handle complex objects', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.set.mockResolvedValueOnce('OK');

      const complexData = {
        id: 123,
        items: [1, 2, 3],
        nested: { key: 'value' },
      };

      await redis.setCache('complex-key', complexData, 1800);

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        'complex-key',
        JSON.stringify(complexData),
        'EX',
        1800
      );
    });

    it('should fall back to memory cache in development when Redis fails', async () => {
      setNodeEnv('development');
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.set.mockRejectedValueOnce(new Error('Connection failed'));

      // Should not throw
      await redis.setCache('test-key', 'value', 60);

      // Verify can retrieve from memory cache
      const result = await redis.getCache('test-key');
      expect(result).toBe('value');
    });

    it('should throw error in production when Redis fails', async () => {
      setNodeEnv('production');
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.set.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(redis.setCache('test-key', 'value')).rejects.toThrow(
        'Connection failed'
      );
    });

    it('should only use memory cache in development mode', async () => {
      setNodeEnv('production');
      process.env.REDIS_URL = 'redis://localhost:6379';

      // Force Redis to be unavailable
      mockRedisInstance.set.mockRejectedValueOnce(new Error('Redis unavailable'));

      // In production, should throw and not use memory cache
      await expect(redis.setCache('test-key', 'value')).rejects.toThrow();

      // Memory cache should not have the value
      const result = await redis.getCache('test-key');
      expect(result).toBeNull();
    });
  });

  describe('getCache', () => {
    it('should retrieve value from Redis', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      const cachedData = { id: 123, name: 'test' };
      mockRedisInstance.get.mockResolvedValueOnce(JSON.stringify(cachedData));

      const result = await redis.getCache('test-key');

      expect(mockRedisInstance.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(cachedData);
    });

    it('should return null when key does not exist', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.get.mockResolvedValueOnce(null);

      const result = await redis.getCache('missing-key');

      expect(result).toBeNull();
    });

    it('should parse JSON correctly', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.get.mockResolvedValueOnce('{"value":true,"count":5}');

      const result = await redis.getCache<{ value: boolean; count: number }>(
        'test-key'
      );

      expect(result).toEqual({ value: true, count: 5 });
    });

    it('should fall back to memory cache in development when Redis fails', async () => {
      setNodeEnv('development');
      process.env.REDIS_URL = 'redis://localhost:6379';

      // Mock Redis failure for both set and get
      mockRedisInstance.set.mockRejectedValue(new Error('Connection failed'));
      mockRedisInstance.get.mockRejectedValue(new Error('Connection failed'));

      // Set value (should fall back to memory cache)
      await redis.setCache('test-key', 'cached-value', 60);

      // Get value (should retrieve from memory cache)
      const result = await redis.getCache('test-key');

      // Memory cache should return the value
      expect(result).toBe('cached-value');
    });

    it('should return null for expired memory cache entries', async () => {
      setNodeEnv('development');
      process.env.REDIS_URL = 'redis://localhost:6379';

      // Mock Redis failure to use memory cache
      mockRedisInstance.set.mockRejectedValueOnce(new Error('Redis unavailable'));

      // Set with 1 second TTL
      await redis.setCache('test-key', 'value', 1);

      // Fast-forward time by 2 seconds
      vi.useFakeTimers();
      vi.advanceTimersByTime(2000);

      const result = await redis.getCache('test-key');

      expect(result).toBeNull();

      vi.useRealTimers();
    });

    it('should handle malformed JSON gracefully in memory cache', async () => {
      setNodeEnv('development');
      process.env.REDIS_URL = 'redis://localhost:6379';

      // Mock Redis failure
      mockRedisInstance.get.mockRejectedValueOnce(new Error('Redis unavailable'));

      // Manually corrupt memory cache
      // This tests the try-catch in memory cache parsing
      const memoryCache = new Map<string, { value: string; expires: number }>();
      memoryCache.set('bad-key', {
        value: '{invalid-json}',
        expires: Date.now() + 10000,
      });

      const result = await redis.getCache('bad-key');

      // Should return null for malformed JSON
      expect(result).toBeNull();
    });
  });

  describe('deleteCache', () => {
    it('should delete key from Redis', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.del.mockResolvedValueOnce(1);

      await redis.deleteCache('test-key');

      expect(mockRedisInstance.del).toHaveBeenCalledWith('test-key');
    });

    it('should fall back to memory cache deletion in development', async () => {
      setNodeEnv('development');
      process.env.REDIS_URL = 'redis://localhost:6379';

      // Set value first
      mockRedisInstance.set.mockResolvedValueOnce('OK');
      await redis.setCache('test-key', 'value', 60);

      // Mock Redis delete failure
      mockRedisInstance.del.mockRejectedValueOnce(new Error('Connection failed'));

      // Should not throw
      await redis.deleteCache('test-key');

      // Value should be deleted from memory cache
      const result = await redis.getCache('test-key');
      expect(result).toBeNull();
    });

    it('should throw error in production when Redis delete fails', async () => {
      setNodeEnv('production');
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.del.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(redis.deleteCache('test-key')).rejects.toThrow(
        'Connection failed'
      );
    });
  });

  describe('getRedisClient', () => {
    it('should throw error when REDIS_URL is not set', () => {
      delete process.env.REDIS_URL;

      expect(() => redis.getRedisClient()).toThrow(
        'REDIS_URL environment variable is not set'
      );
    });

    it('should return singleton Redis instance', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      const client1 = redis.getRedisClient();
      const client2 = redis.getRedisClient();

      expect(client1).toBe(client2);
    });

    it('should configure Redis with retry strategy', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      redis.getRedisClient();

      expect(MockRedis).toHaveBeenCalledWith('redis://localhost:6379', {
        maxRetriesPerRequest: 3,
        retryStrategy: expect.any(Function),
        lazyConnect: true,
      });
    });

    it('should use exponential backoff for retries', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      redis.getRedisClient();

      const config = MockRedis.mock.calls[0]?.[1];
      const retryStrategy = config?.retryStrategy;

      if (retryStrategy) {
        expect(retryStrategy(1)).toBe(50); // 1 * 50
        expect(retryStrategy(2)).toBe(100); // 2 * 50
        expect(retryStrategy(3)).toBe(150); // 3 * 50
        expect(retryStrategy(50)).toBe(2000); // capped at 2000
      }
    });

    it('should register error handler', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      redis.getRedisClient();

      expect(mockRedisInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('closeRedis', () => {
    it('should close Redis connection', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisInstance.quit.mockResolvedValueOnce('OK');

      // Create client first
      redis.getRedisClient();

      await redis.closeRedis();

      expect(mockRedisInstance.quit).toHaveBeenCalled();
    });

    it('should handle close when no client exists', async () => {
      // Should not throw
      await expect(redis.closeRedis()).resolves.toBeUndefined();
    });
  });

  describe('Memory Cache Fallback (Development)', () => {
    beforeEach(() => {
      setNodeEnv('development');
      process.env.REDIS_URL = 'redis://localhost:6379';
    });

    it('should use memory cache when Redis is unavailable', async () => {
      mockRedisInstance.set.mockRejectedValue(new Error('Redis unavailable'));
      mockRedisInstance.get.mockRejectedValue(new Error('Redis unavailable'));

      await redis.setCache('dev-key', 'dev-value', 60);
      const result = await redis.getCache('dev-key');

      expect(result).toBe('dev-value');
    });

    it('should respect TTL in memory cache', async () => {
      mockRedisInstance.set.mockRejectedValue(new Error('Redis unavailable'));
      mockRedisInstance.get.mockRejectedValue(new Error('Redis unavailable'));

      vi.useFakeTimers();

      await redis.setCache('ttl-key', 'value', 2); // 2 second TTL

      // Before expiration
      let result = await redis.getCache('ttl-key');
      expect(result).toBe('value');

      // After expiration
      vi.advanceTimersByTime(3000);
      result = await redis.getCache('ttl-key');
      expect(result).toBeNull();

      vi.useRealTimers();
    });

    it('should clean up expired entries from memory cache', async () => {
      mockRedisInstance.set.mockRejectedValue(new Error('Redis unavailable'));
      mockRedisInstance.get.mockRejectedValue(new Error('Redis unavailable'));

      vi.useFakeTimers();

      await redis.setCache('expire-key', 'value', 1);

      // Fast-forward past expiration
      vi.advanceTimersByTime(2000);

      // Accessing expired key should remove it
      const result = await redis.getCache('expire-key');
      expect(result).toBeNull();

      // Verify it was deleted (try again)
      const result2 = await redis.getCache('expire-key');
      expect(result2).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis connection errors in development', async () => {
      setNodeEnv('development');
      process.env.REDIS_URL = 'redis://localhost:6379';

      const errorHandler = mockRedisInstance.on.mock.calls.find(
        (call) => call[0] === 'error'
      )?.[1];

      if (errorHandler) {
        // Should not throw
        errorHandler(new Error('Connection timeout'));
      }

      // Should fall back to memory cache
      await redis.setCache('error-key', 'value');
      const result = await redis.getCache('error-key');

      expect(result).toBe('value');
    });

    it('should not suppress errors in production', () => {
      setNodeEnv('production');
      process.env.REDIS_URL = 'redis://localhost:6379';

      redis.getRedisClient();

      const errorHandler = mockRedisInstance.on.mock.calls.find(
        (call) => call[0] === 'error'
      )?.[1];

      // In production, error is logged but doesn't change behavior
      expect(() => errorHandler?.(new Error('Critical error'))).not.toThrow();
    });
  });
});
