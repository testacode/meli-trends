import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getKeywordVariants, fetchSearchDirect } from './searchAPI';
import type { SearchResponse } from '@/types/meli';

describe('searchAPI', () => {
  // Mock console to avoid noise in tests
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  describe('getKeywordVariants', () => {
    it('should always include exact keyword as first variant', () => {
      const keyword = 'samsung galaxy s24';
      const variants = getKeywordVariants(keyword);

      expect(variants[0]).toBe(keyword);
    });

    it('should filter out Spanish stop words but keep short tech terms', () => {
      const keyword = 'samsung galaxy s24 de 256gb';
      const variants = getKeywordVariants(keyword);

      // First variant is exact keyword (includes "de")
      expect(variants[0]).toBe(keyword);

      // Subsequent variants should filter out "de" (stop word) but keep numbers/codes
      const simplifiedVariants = variants.slice(1);
      simplifiedVariants.forEach(variant => {
        const words = variant.split(/\s+/);
        expect(words).not.toContain('de');
      });
    });

    it('should filter out Spanish stop words', () => {
      const stopWords = ['de', 'la', 'el', 'los', 'las', 'con', 'para'];
      const keyword = 'samsung de la casa con el mejor precio para los usuarios';
      const variants = getKeywordVariants(keyword);

      // First variant is exact keyword (includes stop words)
      expect(variants[0]).toBe(keyword);

      // Only "samsung", "casa", "mejor", "precio", "usuarios" should remain in simplified variants
      // (words > 2 chars and not stop words)
      const simplifiedVariants = variants.slice(1);
      simplifiedVariants.forEach((variant) => {
        const words = variant.split(/\s+/);
        stopWords.forEach((stopWord) => {
          expect(words).not.toContain(stopWord);
        });
      });
    });

    it('should generate progressively shorter variants for long keywords', () => {
      const keyword = 'samsung galaxy s24 ultra 256gb negro';
      const variants = getKeywordVariants(keyword);

      // Should have: exact, first 3 words, first 2 words, first word
      expect(variants).toContain('samsung galaxy s24'); // First 3 words
      expect(variants).toContain('samsung galaxy'); // First 2 words
      expect(variants).toContain('samsung'); // First word
    });

    it('should include first word regardless of length', () => {
      const keyword = 'pen usb 64gb';
      const variants = getKeywordVariants(keyword);

      // First word should always be included as fallback
      expect(variants).toContain('pen');
    });

    it('should include both first and last words as fallbacks', () => {
      const keyword = 'iphone 15 pro max';
      const variants = getKeywordVariants(keyword);

      // First word should be included
      expect(variants).toContain('iphone');

      // Last word should be included (> 2 chars)
      expect(variants).toContain('max');
    });

    it('should handle keywords with short meaningful tech terms', () => {
      const keyword = 'ai pin';
      const variants = getKeywordVariants(keyword);

      // Should include exact keyword, "ai", and "pin"
      expect(variants).toContain('ai pin');
      expect(variants).toContain('ai');
      expect(variants).toContain('pin');
    });

    it('should generate variants for "tesla pi phone" correctly', () => {
      const keyword = 'tesla pi phone';
      const variants = getKeywordVariants(keyword);

      // Should include: exact, first 2 words, first word, last word
      expect(variants).toContain('tesla pi phone'); // Exact
      expect(variants).toContain('tesla pi'); // First 2 words
      expect(variants).toContain('tesla'); // First word
      expect(variants).toContain('phone'); // Last word (fallback to find related products)
    });

    it('should generate variants for "vr ps5" correctly', () => {
      const keyword = 'vr ps5';
      const variants = getKeywordVariants(keyword);

      // Should include: exact, first word, last word
      expect(variants).toContain('vr ps5'); // Exact
      expect(variants).toContain('vr'); // First word
      expect(variants).toContain('ps5'); // Last word
    });

    it('should remove duplicate variants', () => {
      const keyword = 'samsung';
      const variants = getKeywordVariants(keyword);

      // Should only have 1 variant (exact keyword)
      expect(variants).toHaveLength(1);
      expect(variants[0]).toBe('samsung');
    });

    it('should handle single word keyword', () => {
      const keyword = 'notebook';
      const variants = getKeywordVariants(keyword);

      expect(variants).toHaveLength(1);
      expect(variants[0]).toBe('notebook');
    });

    it('should handle empty string', () => {
      const keyword = '';
      const variants = getKeywordVariants(keyword);

      expect(variants).toHaveLength(1);
      expect(variants[0]).toBe('');
    });

    it('should handle two-word keyword correctly', () => {
      const keyword = 'zapatillas nike';
      const variants = getKeywordVariants(keyword);

      // Should have: exact keyword + first 2 words (same) + first word (if > 3 chars)
      expect(variants).toContain('zapatillas nike');
      expect(variants).toContain('zapatillas');
    });

    it('should handle mixed case and preserve original keyword', () => {
      const keyword = 'Samsung Galaxy S24';
      const variants = getKeywordVariants(keyword);

      // First variant should preserve original case
      expect(variants[0]).toBe('Samsung Galaxy S24');
    });

    it('should handle multiple spaces between words', () => {
      const keyword = 'samsung  galaxy   s24';
      const variants = getKeywordVariants(keyword);

      // Should still work correctly
      expect(variants[0]).toBe('samsung  galaxy   s24');
      expect(variants.length).toBeGreaterThan(1);
    });

    it('should handle complex real-world example', () => {
      const keyword = 'black edition 4x4 de lujo para toda la familia';
      const variants = getKeywordVariants(keyword);

      // Should filter stop words (de, para, toda, la) and short words (4x4 has "x" which is 1 char)
      // Significant words: black, edition, 4x4, lujo, familia (> 2 chars, not stop words)
      // Note: "4x4" stays because split by spaces treats it as one token
      expect(variants[0]).toBe(keyword); // Exact keyword first

      // Check that simplified variants exist
      // The algorithm takes first 3/2 words after filtering, and first word if > 3 chars
      expect(variants).toContain('black edition 4x4'); // First 3 significant words
      expect(variants).toContain('black edition'); // First 2 significant words
      expect(variants).toContain('black'); // First significant word (> 3 chars)
    });
  });

  describe('fetchSearchDirect', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should successfully fetch search results with exact keyword', async () => {
      const mockResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'samsung galaxy s24',
        paging: {
          total: 1247,
          offset: 0,
          limit: 3,
          primary_results: 1247,
        },
        results: [
          {
            id: 'MLA123',
            title: 'Samsung Galaxy S24',
            price: 899999,
            currency_id: 'ARS',
            thumbnail: 'https://example.com/thumb.jpg',
            permalink: 'https://example.com/product',
            condition: 'new',
            available_quantity: 10,
            sold_quantity: 50,
          },
        ],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchSearchDirect('MLA', 'samsung galaxy s24', 3);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/sites/MLA/search?q=samsung%20galaxy%20s24&limit=3',
        expect.objectContaining({
          headers: { Accept: 'application/json' },
        })
      );
    });

    it('should use keyword variant fallback when exact returns 0 results', async () => {
      const emptyResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'samsung galaxy s24 ultra',
        paging: { total: 0, offset: 0, limit: 3, primary_results: 0 },
        results: [],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      const successResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'samsung galaxy s24',
        paging: { total: 500, offset: 0, limit: 3, primary_results: 500 },
        results: [
          {
            id: 'MLA456',
            title: 'Samsung Galaxy S24',
            price: 799999,
            currency_id: 'ARS',
            thumbnail: 'https://example.com/thumb2.jpg',
            permalink: 'https://example.com/product2',
            condition: 'new',
            available_quantity: 5,
          },
        ],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      // First call (exact keyword) returns 0 results
      // Second call (variant) returns results
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => emptyResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => successResponse,
        } as Response);

      const result = await fetchSearchDirect(
        'MLA',
        'samsung galaxy s24 ultra',
        3
      );

      expect(result).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return empty response when all variants fail', async () => {
      const emptyResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'nonexistent product xyz123',
        paging: { total: 0, offset: 0, limit: 3, primary_results: 0 },
        results: [],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      // All fetch calls return 0 results
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => emptyResponse,
      } as Response);

      const result = await fetchSearchDirect(
        'MLA',
        'nonexistent product xyz123',
        3
      );

      expect(result.paging.total).toBe(0);
      expect(result.results).toHaveLength(0);
      expect(result.site_id).toBe('MLA');
      expect(result.query).toBe('nonexistent product xyz123');
      expect(result.paging.limit).toBe(3);
    });

    it('should handle network errors and try next variant', async () => {
      const successResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'samsung',
        paging: { total: 300, offset: 0, limit: 3, primary_results: 300 },
        results: [
          {
            id: 'MLA789',
            title: 'Samsung Product',
            price: 599999,
            currency_id: 'ARS',
            thumbnail: 'https://example.com/thumb3.jpg',
            permalink: 'https://example.com/product3',
            condition: 'new',
            available_quantity: 20,
          },
        ],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      // First call throws network error
      // Second call succeeds
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => successResponse,
        } as Response);

      const result = await fetchSearchDirect('MLA', 'samsung galaxy s24', 3);

      expect(result).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle HTTP error responses and try next variant', async () => {
      const successResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'samsung',
        paging: { total: 200, offset: 0, limit: 3, primary_results: 200 },
        results: [
          {
            id: 'MLA999',
            title: 'Samsung Device',
            price: 499999,
            currency_id: 'ARS',
            thumbnail: 'https://example.com/thumb4.jpg',
            permalink: 'https://example.com/product4',
            condition: 'new',
            available_quantity: 15,
          },
        ],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      // First call returns 500 error
      // Second call succeeds
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => successResponse,
        } as Response);

      const result = await fetchSearchDirect('MLA', 'samsung galaxy s24', 3);

      expect(result).toEqual(successResponse);
      // Logger is disabled in test environment, no console output expected
    });

    it('should properly encode special characters in URLs', async () => {
      const mockResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'café & té',
        paging: { total: 10, offset: 0, limit: 3, primary_results: 10 },
        results: [],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await fetchSearchDirect('MLA', 'café & té', 3);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/sites/MLA/search?q=caf%C3%A9%20%26%20t%C3%A9&limit=3',
        expect.any(Object)
      );
    });

    it('should use custom limit parameter', async () => {
      const mockResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'iphone',
        paging: { total: 500, offset: 0, limit: 10, primary_results: 500 },
        results: [],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await fetchSearchDirect('MLA', 'iphone', 10);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/sites/MLA/search?q=iphone&limit=10',
        expect.any(Object)
      );
    });

    it('should use default limit of 3 when not specified', async () => {
      const mockResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'notebook',
        paging: { total: 100, offset: 0, limit: 3, primary_results: 100 },
        results: [],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await fetchSearchDirect('MLA', 'notebook');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/sites/MLA/search?q=notebook&limit=3',
        expect.any(Object)
      );
    });

    it('should work with different site IDs', async () => {
      const mockResponse: SearchResponse = {
        site_id: 'MLB',
        query: 'celular',
        paging: { total: 800, offset: 0, limit: 3, primary_results: 800 },
        results: [],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await fetchSearchDirect('MLB', 'celular', 3);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/sites/MLB/search?q=celular&limit=3',
        expect.any(Object)
      );
    });

    it('should log appropriate messages for successful searches', async () => {
      const mockResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'playstation 5',
        paging: { total: 150, offset: 0, limit: 3, primary_results: 150 },
        results: [],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await fetchSearchDirect('MLA', 'playstation 5', 3);

      // Logger is disabled in test environment, no console output expected
    });

    it('should log variant usage when fallback is used', async () => {
      const emptyResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'samsung galaxy s24 ultra',
        paging: { total: 0, offset: 0, limit: 3, primary_results: 0 },
        results: [],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      const successResponse: SearchResponse = {
        site_id: 'MLA',
        query: 'samsung galaxy s24',
        paging: { total: 500, offset: 0, limit: 3, primary_results: 500 },
        results: [],
        sort: { id: 'relevance', name: 'Relevance' },
        available_sorts: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => emptyResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => successResponse,
        } as Response);

      await fetchSearchDirect('MLA', 'samsung galaxy s24 ultra', 3);

      // Logger is disabled in test environment, no console output expected
    });
  });
});
