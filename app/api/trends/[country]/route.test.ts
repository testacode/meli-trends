/**
 * Tests for /api/trends/[country] endpoint
 *
 * Critical API route - tests trend fetching, authentication, and error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { GET } from './route';
import { callApiRoute } from '@/test-utils/apiRoute';
import { mockConsole } from '@/test-utils/mockConsole';
import { mockTrends } from '@/mocks/data';

describe('/api/trends/[country]', () => {
  let restoreConsole: () => void;

  beforeEach(() => {
    // Suppress logger output
    restoreConsole = mockConsole();
  });

  afterEach(() => {
    restoreConsole();
  });

  describe('Happy Path', () => {
    it('should return trends for valid country', async () => {
      const response = await callApiRoute(GET, {
        params: { country: 'MLA' },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual(mockTrends);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should work for all valid countries', async () => {
      const validCountries = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE'];

      for (const country of validCountries) {
        const response = await callApiRoute(GET, {
          params: { country },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });
  });

  describe('Validation', () => {
    it('should reject invalid country ID', async () => {
      const response = await callApiRoute(GET, {
        params: { country: 'INVALID' },
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({ error: 'Invalid country ID' });
    });

    it('should reject empty country ID', async () => {
      const response = await callApiRoute(GET, {
        params: { country: '' },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: 'Invalid country ID' });
    });

    it('should reject lowercase country ID', async () => {
      const response = await callApiRoute(GET, {
        params: { country: 'mla' },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: 'Invalid country ID' });
    });
  });

  describe('Authentication Errors', () => {
    it('should handle token fetch failure', async () => {
      // Override token endpoint to fail
      server.use(
        http.get('http://localhost:3000/api/token', () => {
          return HttpResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
          );
        })
      );

      const response = await callApiRoute(GET, {
        params: { country: 'MLA' },
      });

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to authenticate' });
    });

    it('should handle token endpoint network error', async () => {
      // Override token endpoint to throw network error
      server.use(
        http.get('http://localhost:3000/api/token', () => {
          return HttpResponse.error();
        })
      );

      const response = await callApiRoute(GET, {
        params: { country: 'MLA' },
      });

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('MercadoLibre API Errors', () => {
    it('should handle Trends API 404 error', async () => {
      // Override Trends API to return 404
      server.use(
        http.get('https://api.mercadolibre.com/trends/:country', () => {
          return HttpResponse.json(
            { message: 'not_found', error: 'Not found' },
            { status: 404 }
          );
        })
      );

      const response = await callApiRoute(GET, {
        params: { country: 'MLA' },
      });

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toEqual({
        error: 'Failed to fetch trends from MercadoLibre',
      });
    });

    it('should handle Trends API 500 error', async () => {
      // Override Trends API to return 500
      server.use(
        http.get('https://api.mercadolibre.com/trends/:country', () => {
          return HttpResponse.json(
            { message: 'internal_error' },
            { status: 500 }
          );
        })
      );

      const response = await callApiRoute(GET, {
        params: { country: 'MLA' },
      });

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        error: 'Failed to fetch trends from MercadoLibre',
      });
    });

    it('should handle Trends API 401 unauthorized', async () => {
      // Override Trends API to return 401
      server.use(
        http.get('https://api.mercadolibre.com/trends/:country', () => {
          return HttpResponse.json(
            { message: 'invalid credentials' },
            { status: 401 }
          );
        })
      );

      const response = await callApiRoute(GET, {
        params: { country: 'MLA' },
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data).toEqual({
        error: 'Failed to fetch trends from MercadoLibre',
      });
    });

    it('should handle Trends API network error', async () => {
      // Override Trends API to throw network error
      server.use(
        http.get('https://api.mercadolibre.com/trends/:country', () => {
          return HttpResponse.error();
        })
      );

      const response = await callApiRoute(GET, {
        params: { country: 'MLA' },
      });

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Response Format', () => {
    it('should return array of trends', async () => {
      const response = await callApiRoute(GET, {
        params: { country: 'MLA' },
      });

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should return trends with correct structure', async () => {
      const response = await callApiRoute(GET, {
        params: { country: 'MLA' },
      });

      const data = await response.json();
      const firstTrend = data[0];

      // Check TrendItem structure
      expect(firstTrend).toHaveProperty('keyword');
      expect(firstTrend).toHaveProperty('url');
      expect(typeof firstTrend.keyword).toBe('string');
      expect(typeof firstTrend.url).toBe('string');
    });
  });
});
