import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './server';
import { mockAccessToken, mockTrends, mockSearchResponse } from './data';

/**
 * Test suite for MSW handlers
 * Verifies that mock API endpoints return expected data
 */
describe('MSW Handlers', () => {
  // Start server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Close server after all tests
  afterAll(() => server.close());

  describe('Token API', () => {
    it('should return mock access token', async () => {
      const response = await fetch('http://localhost:3000/api/token');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.access_token).toBe(mockAccessToken.access_token);
      expect(data.token_type).toBe(mockAccessToken.token_type);
      expect(data.expires_in).toBe(mockAccessToken.expires_in);
    });
  });

  describe('Trends API', () => {
    it('should return trends for valid country', async () => {
      const response = await fetch('http://localhost:3000/api/trends/MLA');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTrends);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid country', async () => {
      const response = await fetch('http://localhost:3000/api/trends/INVALID');
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid site ID');
    });

    it('should handle all valid site IDs', async () => {
      const validSites = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE'];

      for (const site of validSites) {
        const response = await fetch(
          `http://localhost:3000/api/trends/${site}`
        );
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Search API', () => {
    it('should return search results with query', async () => {
      const response = await fetch(
        'https://api.mercadolibre.com/sites/MLA/search?q=samsung+galaxy+s24'
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.site_id).toBe('MLA');
      expect(data.query).toBe('samsung galaxy s24');
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results.length).toBeGreaterThan(0);
    });

    it('should return empty results without query', async () => {
      const response = await fetch(
        'https://api.mercadolibre.com/sites/MLA/search'
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(data.paging.total).toBe(0);
    });

    it('should handle pagination parameters', async () => {
      const response = await fetch(
        'https://api.mercadolibre.com/sites/MLA/search?q=test&limit=10&offset=20'
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.paging.limit).toBe(10);
      expect(data.paging.offset).toBe(20);
    });

    it('should return 400 for invalid site ID', async () => {
      const response = await fetch(
        'https://api.mercadolibre.com/sites/INVALID/search?q=test'
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('bad_request');
    });

    it('should match mock search response structure', async () => {
      const response = await fetch(
        'https://api.mercadolibre.com/sites/MLA/search?q=samsung'
      );
      const data = await response.json();

      expect(data).toMatchObject({
        site_id: expect.any(String),
        query: expect.any(String),
        paging: {
          total: expect.any(Number),
          offset: expect.any(Number),
          limit: expect.any(Number),
          primary_results: expect.any(Number),
        },
        results: expect.any(Array),
        sort: {
          id: expect.any(String),
          name: expect.any(String),
        },
        available_sorts: expect.any(Array),
      });
    });
  });

  describe('Mock Products', () => {
    it('should have realistic product data', async () => {
      const response = await fetch(
        'https://api.mercadolibre.com/sites/MLA/search?q=samsung'
      );
      const data = await response.json();
      const firstProduct = data.results[0];

      expect(firstProduct).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        price: expect.any(Number),
        currency_id: 'ARS',
        thumbnail: expect.any(String),
        permalink: expect.any(String),
        condition: expect.stringMatching(/^(new|used)$/),
        available_quantity: expect.any(Number),
        shipping: {
          free_shipping: expect.any(Boolean),
        },
      });
    });

    it('should include Argentine peso pricing', async () => {
      const response = await fetch(
        'https://api.mercadolibre.com/sites/MLA/search?q=samsung'
      );
      const data = await response.json();

      data.results.forEach((product: typeof mockSearchResponse.results[0]) => {
        expect(product.currency_id).toBe('ARS');
        expect(product.price).toBeGreaterThan(0);
      });
    });
  });
});
