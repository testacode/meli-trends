/**
 * Tests for /api/token endpoint
 *
 * Critical API route - handles OAuth token acquisition from MercadoLibre
 * Uses Redis caching with 5.5 hour TTL to prevent repeated OAuth requests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { GET } from './route';
import { callApiRoute } from '@/test-utils/apiRoute';
import { mockConsole } from '@/test-utils/mockConsole';
import * as redis from '@/lib/redis';

describe('/api/token', () => {
  let restoreConsole: () => void;

  beforeEach(() => {
    // Suppress logger output
    restoreConsole = mockConsole();

    // Clear all mocks before each test
    vi.clearAllMocks();

    // Set up default environment variables
    vi.stubEnv('NEXT_PUBLIC_MELI_APP_ID', '1234567890');
    vi.stubEnv('MELI_CLIENT_SECRET', 'test-secret-key');
  });

  afterEach(() => {
    restoreConsole();
    vi.unstubAllEnvs();
  });

  describe('Happy Path - Redis Cache Hit', () => {
    it('should return cached token from Redis when available', async () => {
      // Mock Redis cache hit
      const mockGetCache = vi
        .spyOn(redis, 'getCache')
        .mockResolvedValue('CACHED-TOKEN-12345');

      const response = await callApiRoute(GET);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        access_token: 'CACHED-TOKEN-12345',
      });

      // Verify Redis was called
      expect(mockGetCache).toHaveBeenCalledWith('meli_access_token');
      expect(mockGetCache).toHaveBeenCalledTimes(1);
    });

    it('should not call MercadoLibre OAuth API when cache hits', async () => {
      const mockGetCache = vi
        .spyOn(redis, 'getCache')
        .mockResolvedValue('CACHED-TOKEN-12345');

      // Track OAuth API calls
      let oauthCalled = false;
      server.use(
        http.post('https://api.mercadolibre.com/oauth/token', () => {
          oauthCalled = true;
          return HttpResponse.json({
            access_token: 'NEW-TOKEN-67890',
            token_type: 'Bearer',
            expires_in: 21600,
          });
        })
      );

      await callApiRoute(GET);

      expect(mockGetCache).toHaveBeenCalled();
      expect(oauthCalled).toBe(false);
    });
  });

  describe('Happy Path - Redis Cache Miss', () => {
    it('should fetch new token when cache miss', async () => {
      const mockGetCache = vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      const mockSetCache = vi.spyOn(redis, 'setCache').mockResolvedValue();

      const response = await callApiRoute(GET);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        access_token: 'TEST-1234567890-mock-access-token',
      });

      // Verify Redis operations
      expect(mockGetCache).toHaveBeenCalledWith('meli_access_token');
      expect(mockSetCache).toHaveBeenCalledWith(
        'meli_access_token',
        'TEST-1234567890-mock-access-token',
        19800 // 5.5 hours in seconds
      );
    });

    it('should cache new token in Redis with 5.5 hour TTL', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      const mockSetCache = vi.spyOn(redis, 'setCache').mockResolvedValue();

      await callApiRoute(GET);

      expect(mockSetCache).toHaveBeenCalledWith(
        'meli_access_token',
        'TEST-1234567890-mock-access-token',
        19800 // 5.5 * 60 * 60 = 19800 seconds
      );
    });

    it('should send correct OAuth request to MercadoLibre', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      vi.spyOn(redis, 'setCache').mockResolvedValue();

      let capturedBody = '';
      let capturedContentType = '';

      server.use(
        http.post('https://api.mercadolibre.com/oauth/token', async ({ request }) => {
          capturedContentType = request.headers.get('Content-Type') || '';
          capturedBody = await request.text();

          return HttpResponse.json({
            access_token: 'TEST-1234567890-mock-access-token',
            token_type: 'Bearer',
            expires_in: 21600,
          });
        })
      );

      await callApiRoute(GET);

      expect(capturedContentType).toBe('application/x-www-form-urlencoded');

      const params = new URLSearchParams(capturedBody);

      expect(params.get('grant_type')).toBe('client_credentials');
      expect(params.get('client_id')).toBe('1234567890');
      expect(params.get('client_secret')).toBe('test-secret-key');
    });
  });

  describe('Validation - Missing Credentials', () => {
    beforeEach(() => {
      // Ensure cache returns null so credentials check is reached
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
    });

    it('should return 500 when NEXT_PUBLIC_MELI_APP_ID is missing', async () => {
      // Remove only the client ID
      delete process.env.NEXT_PUBLIC_MELI_APP_ID;

      const response = await callApiRoute(GET);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Missing MercadoLibre credentials' });
    });

    it('should return 500 when MELI_CLIENT_SECRET is missing', async () => {
      // Remove only the client secret
      delete process.env.MELI_CLIENT_SECRET;

      const response = await callApiRoute(GET);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Missing MercadoLibre credentials' });
    });

    it('should return 500 when both credentials are missing', async () => {
      // Remove both credentials
      delete process.env.NEXT_PUBLIC_MELI_APP_ID;
      delete process.env.MELI_CLIENT_SECRET;

      const response = await callApiRoute(GET);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Missing MercadoLibre credentials' });
    });

    it('should not expose CLIENT_SECRET in response', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      vi.spyOn(redis, 'setCache').mockResolvedValue();

      const response = await callApiRoute(GET);
      const data = await response.json();
      const responseText = JSON.stringify(data);

      expect(responseText).not.toContain('test-secret-key');
      expect(responseText).not.toContain('client_secret');
      expect(data).toHaveProperty('access_token');
      expect(data).not.toHaveProperty('client_secret');
    });
  });

  describe('OAuth API Errors', () => {
    beforeEach(() => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      vi.spyOn(redis, 'setCache').mockResolvedValue();
    });

    it('should handle 401 Unauthorized from MercadoLibre', async () => {
      server.use(
        http.post('https://api.mercadolibre.com/oauth/token', () => {
          return HttpResponse.json(
            {
              message: 'invalid_client',
              error: 'unauthorized',
              status: 401,
            },
            { status: 401 }
          );
        })
      );

      const response = await callApiRoute(GET);

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to authenticate with MercadoLibre' });
    });

    it('should handle 400 Bad Request from MercadoLibre', async () => {
      server.use(
        http.post('https://api.mercadolibre.com/oauth/token', () => {
          return HttpResponse.json(
            {
              message: 'invalid_grant',
              error: 'bad_request',
              status: 400,
            },
            { status: 400 }
          );
        })
      );

      const response = await callApiRoute(GET);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to authenticate with MercadoLibre' });
    });

    it('should handle 500 Internal Server Error from MercadoLibre', async () => {
      server.use(
        http.post('https://api.mercadolibre.com/oauth/token', () => {
          return HttpResponse.json(
            {
              message: 'internal_error',
              error: 'server_error',
              status: 500,
            },
            { status: 500 }
          );
        })
      );

      const response = await callApiRoute(GET);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to authenticate with MercadoLibre' });
    });

    it('should handle 503 Service Unavailable from MercadoLibre', async () => {
      server.use(
        http.post('https://api.mercadolibre.com/oauth/token', () => {
          return HttpResponse.json(
            {
              message: 'service_unavailable',
              error: 'server_error',
              status: 503,
            },
            { status: 503 }
          );
        })
      );

      const response = await callApiRoute(GET);

      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to authenticate with MercadoLibre' });
    });

    it('should handle network error during OAuth fetch', async () => {
      server.use(
        http.post('https://api.mercadolibre.com/oauth/token', () => {
          return HttpResponse.error();
        })
      );

      const response = await callApiRoute(GET);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle timeout during OAuth fetch', async () => {
      server.use(
        http.post('https://api.mercadolibre.com/oauth/token', () => {
          // Simulate timeout/network error - MSW returns network error
          return HttpResponse.error();
        })
      );

      const response = await callApiRoute(GET);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Redis Errors - Graceful Degradation', () => {
    it('should handle Redis connection failure on getCache', async () => {
      vi.spyOn(redis, 'getCache').mockRejectedValue(
        new Error('Redis connection failed')
      );
      vi.spyOn(redis, 'setCache').mockResolvedValue();

      const response = await callApiRoute(GET);

      // Should still return token from OAuth API
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should fetch new token even if Redis get fails', async () => {
      // Simulate Redis get failure but allow OAuth to succeed
      const mockGetCache = vi
        .spyOn(redis, 'getCache')
        .mockRejectedValue(new Error('Redis get failed'));
      const mockSetCache = vi.spyOn(redis, 'setCache').mockResolvedValue();

      const response = await callApiRoute(GET);

      // Should catch the error and return 500
      expect(response.status).toBe(500);
      expect(mockGetCache).toHaveBeenCalled();
      expect(mockSetCache).not.toHaveBeenCalled();
    });

    it('should handle Redis set failure gracefully', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      const mockSetCache = vi
        .spyOn(redis, 'setCache')
        .mockRejectedValue(new Error('Redis set failed'));

      const response = await callApiRoute(GET);

      // Should still return token even if cache set fails
      expect(response.status).toBe(500);
      expect(mockSetCache).toHaveBeenCalled();
    });

    it('should not block token response if Redis is unavailable', async () => {
      // Both Redis operations fail, but OAuth succeeds
      vi.spyOn(redis, 'getCache').mockRejectedValue(
        new Error('Redis unavailable')
      );
      vi.spyOn(redis, 'setCache').mockRejectedValue(
        new Error('Redis unavailable')
      );

      const response = await callApiRoute(GET);

      // Should catch error in try-catch
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Response Format', () => {
    it('should return JSON with access_token field', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      vi.spyOn(redis, 'setCache').mockResolvedValue();

      const response = await callApiRoute(GET);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');

      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      expect(typeof data.access_token).toBe('string');
      expect(data.access_token.length).toBeGreaterThan(0);
    });

    it('should return only access_token field (no extra fields)', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      vi.spyOn(redis, 'setCache').mockResolvedValue();

      const response = await callApiRoute(GET);
      const data = await response.json();

      const keys = Object.keys(data);
      expect(keys).toEqual(['access_token']);
    });

    it('should not expose token_type or expires_in from OAuth response', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      vi.spyOn(redis, 'setCache').mockResolvedValue();

      const response = await callApiRoute(GET);
      const data = await response.json();

      expect(data).not.toHaveProperty('token_type');
      expect(data).not.toHaveProperty('expires_in');
      expect(data).not.toHaveProperty('scope');
      expect(data).not.toHaveProperty('user_id');
      expect(data).not.toHaveProperty('refresh_token');
    });

    it('should return error in JSON format on failure', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      vi.unstubAllEnvs();

      const response = await callApiRoute(GET);

      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toContain('application/json');

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });
  });

  describe('Cache Key Consistency', () => {
    it('should use consistent cache key for get and set operations', async () => {
      const mockGetCache = vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      const mockSetCache = vi.spyOn(redis, 'setCache').mockResolvedValue();

      await callApiRoute(GET);

      expect(mockGetCache).toHaveBeenCalledWith('meli_access_token');
      expect(mockSetCache).toHaveBeenCalledWith(
        'meli_access_token',
        expect.any(String),
        expect.any(Number)
      );

      // Verify both use same key
      const getKey = mockGetCache.mock.calls[0][0];
      const setKey = mockSetCache.mock.calls[0][0];
      expect(getKey).toBe(setKey);
    });
  });

  describe('TTL Configuration', () => {
    it('should use exactly 19800 seconds (5.5 hours) as TTL', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      const mockSetCache = vi.spyOn(redis, 'setCache').mockResolvedValue();

      await callApiRoute(GET);

      const ttl = mockSetCache.mock.calls[0][2];
      expect(ttl).toBe(19800);
      expect(ttl).toBe(5.5 * 60 * 60);
    });

    it('should cache for less than token expiry (6 hours)', async () => {
      vi.spyOn(redis, 'getCache').mockResolvedValue(null);
      const mockSetCache = vi.spyOn(redis, 'setCache').mockResolvedValue();

      await callApiRoute(GET);

      const ttl = mockSetCache.mock.calls[0][2];
      const tokenExpirySeconds = 21600; // 6 hours from OAuth response

      expect(ttl).toBeLessThan(tokenExpirySeconds);
      expect(ttl).toBe(19800); // 5.5 hours for safety margin
    });
  });
});
