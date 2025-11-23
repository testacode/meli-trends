import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren } from 'react';
import { calculateMetrics, useClientEnrichedTrends } from './useClientEnrichedTrends';
import { fetchSearchDirect } from '@/lib/searchAPI';
import type { TrendItem, SearchResponse, SiteId } from '@/types/meli';
import { mockTrends, mockSearchResponse } from '@/mocks/data';

// Mock the searchAPI module
vi.mock('@/lib/searchAPI', () => ({
  fetchSearchDirect: vi.fn(),
}));

const mockFetchSearchDirect = vi.mocked(fetchSearchDirect);

/**
 * Helper to create QueryClient for tests
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

/**
 * Helper to create wrapper with QueryClientProvider
 */
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('calculateMetrics', () => {
  const baseTrendItem: TrendItem = {
    keyword: 'samsung galaxy s24',
    url: 'https://www.mercadolibre.com.ar/samsung-galaxy-s24',
  };

  describe('price calculations', () => {
    it('should calculate average, min, and max prices correctly', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [
          {
            ...mockSearchResponse.results[0],
            price: 899999,
          },
          {
            ...mockSearchResponse.results[1],
            price: 799999,
          },
          {
            ...mockSearchResponse.results[2],
            price: 1299999,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.avg_price).toBe(999999);
      expect(result.min_price).toBe(799999);
      expect(result.max_price).toBe(1299999);
    });

    it('should handle products with zero prices', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [
          {
            ...mockSearchResponse.results[0],
            price: 0,
          },
          {
            ...mockSearchResponse.results[1],
            price: 799999,
          },
          {
            ...mockSearchResponse.results[2],
            price: 899999,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      // Should ignore zero prices
      expect(result.avg_price).toBe(849999);
      expect(result.min_price).toBe(799999);
      expect(result.max_price).toBe(899999);
    });

    it('should handle empty products array', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [],
        paging: {
          ...mockSearchResponse.paging,
          total: 0,
        },
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.avg_price).toBeUndefined();
      expect(result.min_price).toBeUndefined();
      expect(result.max_price).toBeUndefined();
    });

    it('should handle all products with zero prices', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [
          {
            ...mockSearchResponse.results[0],
            price: 0,
          },
          {
            ...mockSearchResponse.results[1],
            price: 0,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.avg_price).toBeUndefined();
      expect(result.min_price).toBeUndefined();
      expect(result.max_price).toBeUndefined();
    });
  });

  describe('sold quantity calculations', () => {
    it('should calculate total sold correctly', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [
          {
            ...mockSearchResponse.results[0],
            sold_quantity: 234,
          },
          {
            ...mockSearchResponse.results[1],
            sold_quantity: 156,
          },
          {
            ...mockSearchResponse.results[2],
            sold_quantity: 89,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.total_sold).toBe(479);
    });

    it('should handle missing sold quantities', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [
          {
            ...mockSearchResponse.results[0],
            sold_quantity: undefined,
          },
          {
            ...mockSearchResponse.results[1],
            sold_quantity: 156,
          },
          {
            ...mockSearchResponse.results[2],
            sold_quantity: 0,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.total_sold).toBe(156);
    });

    it('should return undefined if no sold quantities', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [
          {
            ...mockSearchResponse.results[0],
            sold_quantity: undefined,
          },
          {
            ...mockSearchResponse.results[1],
            sold_quantity: 0,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.total_sold).toBeUndefined();
    });
  });

  describe('free shipping calculations', () => {
    it('should calculate free shipping percentage correctly', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [
          {
            ...mockSearchResponse.results[0],
            shipping: { free_shipping: true },
          },
          {
            ...mockSearchResponse.results[1],
            shipping: { free_shipping: true },
          },
          {
            ...mockSearchResponse.results[2],
            shipping: { free_shipping: false },
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.free_shipping_percentage).toBeCloseTo(66.67, 1);
    });

    it('should handle all products with free shipping', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: mockSearchResponse.results.map((p) => ({
          ...p,
          shipping: { free_shipping: true },
        })),
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.free_shipping_percentage).toBe(100);
    });

    it('should handle no products with free shipping', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: mockSearchResponse.results.map((p) => ({
          ...p,
          shipping: { free_shipping: false },
        })),
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.free_shipping_percentage).toBe(0);
    });

    it('should handle empty products array', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.free_shipping_percentage).toBe(0);
    });
  });

  describe('opportunity score calculation', () => {
    it('should calculate opportunity score with all factors', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        paging: {
          ...mockSearchResponse.paging,
          total: 10000, // Max search volume score (30)
        },
        results: [
          {
            ...mockSearchResponse.results[0],
            price: 100000,
            sold_quantity: 500, // Contributes to sold score (12.5)
            shipping: { free_shipping: true },
            available_quantity: 100, // Max availability score (10)
          },
          {
            ...mockSearchResponse.results[1],
            price: 200000, // Price range ratio: 1.0 = 10 score
            sold_quantity: 500, // Total sold: 1000 = 25 score
            shipping: { free_shipping: true }, // 100% free shipping = 20 score
            available_quantity: 50,
          },
          {
            ...mockSearchResponse.results[2],
            price: 150000,
            sold_quantity: 0,
            shipping: { free_shipping: true },
            available_quantity: 25,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      // Expected: 30 (search) + 25 (sold) + 20 (shipping) + 10 (price range) + 10 (availability) = 95
      expect(result.opportunity_score).toBeGreaterThanOrEqual(90);
      expect(result.opportunity_score).toBeLessThanOrEqual(100);
    });

    it('should cap search volume score at 30', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        paging: {
          ...mockSearchResponse.paging,
          total: 100000, // Way above 10000 threshold
        },
        results: [],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      // Should be 30 (search volume capped) + 0 (everything else)
      expect(result.opportunity_score).toBe(30);
    });

    it('should cap sold quantity score at 25', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        paging: {
          ...mockSearchResponse.paging,
          total: 0, // No search volume
        },
        results: [
          {
            ...mockSearchResponse.results[0],
            sold_quantity: 5000, // Way above 1000 threshold
            shipping: { free_shipping: false },
            available_quantity: 0,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      // Should be 0 (search) + 25 (sold capped) + 0 (shipping) + 0 (price) + 0 (availability)
      expect(result.opportunity_score).toBe(25);
    });

    it('should give full shipping score for 100% free shipping', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        paging: {
          ...mockSearchResponse.paging,
          total: 0,
        },
        results: [
          {
            ...mockSearchResponse.results[0],
            price: 100000,
            shipping: { free_shipping: true },
            available_quantity: 0,
            sold_quantity: 0,
          },
          {
            ...mockSearchResponse.results[1],
            price: 100000, // Same price = no price range
            shipping: { free_shipping: true },
            available_quantity: 0,
            sold_quantity: 0,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      // 100% free shipping = 20 score, no price range = 0
      expect(result.opportunity_score).toBe(20);
    });

    it('should cap price range score at 15', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        paging: {
          ...mockSearchResponse.paging,
          total: 0,
        },
        results: [
          {
            ...mockSearchResponse.results[0],
            price: 100000,
            shipping: { free_shipping: false },
            available_quantity: 0,
            sold_quantity: 0,
          },
          {
            ...mockSearchResponse.results[1],
            price: 500000, // Huge price range ratio
            shipping: { free_shipping: false },
            available_quantity: 0,
            sold_quantity: 0,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      // Price range ratio: (500000-100000)/100000 = 4.0
      // Score: min(15, 4.0 * 10) = 15
      expect(result.opportunity_score).toBe(15);
    });

    it('should cap availability score at 10', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        paging: {
          ...mockSearchResponse.paging,
          total: 0,
        },
        results: [
          {
            ...mockSearchResponse.results[0],
            available_quantity: 500, // Way above 100 threshold
            shipping: { free_shipping: false },
            sold_quantity: 0,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      // Should be 0 (search) + 0 (sold) + 0 (shipping) + 0 (price) + 10 (availability capped)
      expect(result.opportunity_score).toBe(10);
    });

    it('should handle empty data gracefully', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        paging: {
          ...mockSearchResponse.paging,
          total: 0,
        },
        results: [],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.opportunity_score).toBe(0);
    });

    it('should round opportunity score to integer', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        paging: {
          ...mockSearchResponse.paging,
          total: 5000, // 15 score
        },
        results: [
          {
            ...mockSearchResponse.results[0],
            shipping: { free_shipping: true },
            available_quantity: 50, // 5 score
            sold_quantity: 0,
          },
          {
            ...mockSearchResponse.results[1],
            shipping: { free_shipping: false },
            available_quantity: 0,
            sold_quantity: 0,
          },
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      // 15 (search) + 10 (50% shipping) + 5 (availability) = 30
      expect(Number.isInteger(result.opportunity_score)).toBe(true);
    });
  });

  describe('result structure', () => {
    it('should include all trend item properties', () => {
      const result = calculateMetrics(baseTrendItem, mockSearchResponse);

      expect(result.keyword).toBe(baseTrendItem.keyword);
      expect(result.url).toBe(baseTrendItem.url);
    });

    it('should include products (limited to 3)', () => {
      const searchData: SearchResponse = {
        ...mockSearchResponse,
        results: [
          mockSearchResponse.results[0],
          mockSearchResponse.results[1],
          mockSearchResponse.results[2],
          mockSearchResponse.results[0], // 4th product
        ],
      };

      const result = calculateMetrics(baseTrendItem, searchData);

      expect(result.products).toHaveLength(3);
    });

    it('should include total_results', () => {
      const result = calculateMetrics(baseTrendItem, mockSearchResponse);

      expect(result.total_results).toBe(mockSearchResponse.paging.total);
    });
  });
});

describe('useClientEnrichedTrends', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
    mockFetchSearchDirect.mockClear();
  });

  describe('basic trends fetching', () => {
    it('should fetch basic trends from /api/trends/:country', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 10, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.trends).toEqual([]);

      // Wait for data to load (with longer timeout for enrichment)
      await waitFor(
        () => {
          expect(result.current.total).toBeGreaterThan(0);
        },
        { timeout: 10000 }
      );
    });

    it('should not auto-fetch when autoLoad is false', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 10, autoLoad: false }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.trends).toEqual([]);
      expect(result.current.total).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      // Override MSW handler to return error
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'INVALID' as SiteId, limit: 10, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(
        () => {
          expect(result.current.error).toBeTruthy();
        },
        { timeout: 10000 }
      );
    });
  });

  describe('progressive enrichment in batches', () => {
    beforeEach(() => {
      // Mock fetchSearchDirect to return successful responses
      mockFetchSearchDirect.mockClear();
      mockFetchSearchDirect.mockResolvedValue(mockSearchResponse);
    });

    it('should enrich trends progressively', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 5, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for basic trends to load
      await waitFor(
        () => {
          expect(result.current.total).toBeGreaterThan(0);
        },
        { timeout: 10000 }
      );

      // Should start processing
      expect(result.current.loading).toBe(true);

      // Eventually all should be enriched
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
          expect(result.current.trends.length).toBe(5);
        },
        { timeout: 15000 }
      );
    });

    it('should update progress percentage as trends are enriched', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 4, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Initial state
      expect(result.current.progress).toBe(0);

      // Wait for first batch
      await waitFor(
        () => {
          expect(result.current.trends.length).toBeGreaterThan(0);
        },
        { timeout: 10000 }
      );

      // Progress should be 50% (2 out of 4)
      expect(result.current.progress).toBeGreaterThanOrEqual(50);
      expect(result.current.progress).toBeLessThan(100);

      // Eventually 100%
      await waitFor(
        () => {
          expect(result.current.progress).toBe(100);
        },
        { timeout: 15000 }
      );
    });

    it('should call Search API for each trend', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 3, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for completion
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      // Should have called fetchSearchDirect for each trend
      expect(mockFetchSearchDirect).toHaveBeenCalledTimes(3);
    });
  });

  describe('error handling during enrichment', () => {
    it('should continue enriching other trends if one fails', async () => {
      // Mock first call to fail, second to succeed
      mockFetchSearchDirect
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValue(mockSearchResponse);

      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 2, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for completion
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      // Should have 2 trends (one with error data, one successful)
      expect(result.current.trends).toHaveLength(2);

      // First trend should have empty data (error case)
      expect(result.current.trends[0].products).toEqual([]);
      expect(result.current.trends[0].total_results).toBe(0);
      expect(result.current.trends[0].opportunity_score).toBe(0);

      // Second trend should have real data
      expect(result.current.trends[1].products.length).toBeGreaterThan(0);
    });

    it('should return trends with empty data on Search API failure', async () => {
      mockFetchSearchDirect.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 1, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for completion
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      // Should have 1 trend with empty data
      expect(result.current.trends).toHaveLength(1);
      expect(result.current.trends[0].products).toEqual([]);
      expect(result.current.trends[0].total_results).toBe(0);
    });
  });

  describe('loadMore pagination', () => {
    beforeEach(() => {
      mockFetchSearchDirect.mockResolvedValue(mockSearchResponse);
    });

    it('should load more trends when loadMore is called', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 2, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for first page to load
      await waitFor(
        () => {
          expect(result.current.trends.length).toBe(2);
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      // Check if more trends available
      const hasMoreInitially = result.current.hasMore;
      if (!hasMoreInitially) {
        // Test expects more trends to be available
        return;
      }

      // Load more
      await result.current.loadMore();

      // Wait for new trends to load
      await waitFor(
        () => {
          expect(result.current.trends.length).toBe(4);
        },
        { timeout: 15000 }
      );
    });

    it('should set hasMore to false when all trends are loaded', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 10, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for all trends to load
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      // If total is 5 (from mockTrends) and limit is 10, hasMore should be false
      expect(result.current.hasMore).toBe(false);
    });

    it('should not load more if already at the end', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 10, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for all trends to load
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      const trendsCountBefore = result.current.trends.length;

      // Try to load more
      await result.current.loadMore();

      // Should not change
      expect(result.current.trends.length).toBe(trendsCountBefore);
    });
  });

  describe('refresh functionality', () => {
    beforeEach(() => {
      mockFetchSearchDirect.mockResolvedValue(mockSearchResponse);
    });

    it('should clear trends and refetch from beginning', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 2, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for initial load
      await waitFor(
        () => {
          expect(result.current.trends.length).toBe(2);
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      const initialFirstKeyword = result.current.trends[0].keyword;

      // Refresh
      await result.current.refresh();

      // Wait for re-enrichment to complete
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
          expect(result.current.trends.length).toBe(2);
        },
        { timeout: 15000 }
      );

      // Verify trends were refreshed (should have same keywords)
      expect(result.current.trends[0].keyword).toBe(initialFirstKeyword);
    });

    it('should reset offset to 0 on refresh', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 2, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for initial load
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      // Load more
      if (result.current.hasMore) {
        await result.current.loadMore();

        await waitFor(
          () => {
            expect(result.current.trends.length).toBe(4);
          },
          { timeout: 15000 }
        );
      }

      // Refresh
      await result.current.refresh();

      // Should be back to first page
      await waitFor(
        () => {
          expect(result.current.trends.length).toBe(2);
        },
        { timeout: 15000 }
      );
    });

    it('should clear errors on refresh', async () => {
      // Start with an error
      mockFetchSearchDirect.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 1, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for completion
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      // Mock successful response for refresh
      mockFetchSearchDirect.mockResolvedValue(mockSearchResponse);

      // Refresh
      await result.current.refresh();

      expect(result.current.error).toBeNull();

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
          expect(result.current.trends.length).toBeGreaterThan(0);
        },
        { timeout: 15000 }
      );
    });
  });

  describe('return values', () => {
    beforeEach(() => {
      mockFetchSearchDirect.mockResolvedValue(mockSearchResponse);
    });

    it('should return correct total count', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 10, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(
        () => {
          expect(result.current.total).toBe(mockTrends.length);
        },
        { timeout: 10000 }
      );
    });

    it('should return null for cacheAge (client-side has no server cache)', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 10, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.cacheAge).toBeNull();
    });

    it('should provide loadMore and refresh functions', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 10, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(typeof result.current.loadMore).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
    });
  });

  describe('batching logic with different dataset sizes', () => {
    beforeEach(() => {
      mockFetchSearchDirect.mockResolvedValue(mockSearchResponse);
    });

    it('should process 5 trends in 3 batches (2+2+1)', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 5, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for basic trends
      await waitFor(
        () => {
          expect(result.current.total).toBeGreaterThan(0);
        },
        { timeout: 10000 }
      );

      // Batch 1: 2 trends
      await waitFor(
        () => {
          expect(result.current.trends.length).toBe(2);
        },
        { timeout: 10000 }
      );
      expect(result.current.progress).toBe(40); // 2/5 = 40%

      // Batch 2: 2 more trends (total 4)
      await waitFor(
        () => {
          expect(result.current.trends.length).toBe(4);
        },
        { timeout: 10000 }
      );
      expect(result.current.progress).toBe(80); // 4/5 = 80%

      // Batch 3: 1 final trend (total 5)
      await waitFor(
        () => {
          expect(result.current.trends.length).toBe(5);
        },
        { timeout: 10000 }
      );
      expect(result.current.progress).toBe(100); // 5/5 = 100%
    });

    it('should handle 1 trend in 1 batch', async () => {
      const { result } = renderHook(
        () => useClientEnrichedTrends({ siteId: 'MLA', limit: 1, autoLoad: true }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for completion
      await waitFor(
        () => {
          expect(result.current.trends.length).toBe(1);
          expect(result.current.progress).toBe(100);
          expect(result.current.loading).toBe(false);
        },
        { timeout: 15000 }
      );

      // Should only call fetchSearchDirect once
      expect(mockFetchSearchDirect).toHaveBeenCalledTimes(1);
    });
  });
});
