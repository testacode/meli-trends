import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@/test-utils';
import { useEnrichTrendOnDemand } from './useEnrichTrendOnDemand';
import * as searchAPI from '@/lib/searchAPI';
import type { TrendItem, SearchResponse, SearchProduct } from '@/types/meli';

// Mock fetchSearchDirect from searchAPI
vi.mock('@/lib/searchAPI', () => ({
  fetchSearchDirect: vi.fn(),
}));

describe('useEnrichTrendOnDemand', () => {
  let mockConsoleLog: ReturnType<typeof vi.spyOn>;
  let mockConsoleError: ReturnType<typeof vi.spyOn>;

  const mockTrend: TrendItem = {
    keyword: 'iPhone 15',
    url: 'https://www.mercadolibre.com.ar/trends/iphone-15',
  };

  const mockProduct: SearchProduct = {
    id: 'MLA123456',
    title: 'iPhone 15 Pro Max 256gb',
    price: 1500000,
    currency_id: 'ARS',
    thumbnail: 'https://http2.mlstatic.com/D_123456-MLA.jpg',
    permalink: 'https://www.mercadolibre.com.ar/product/MLA123456',
    condition: 'new' as const,
    available_quantity: 50,
    sold_quantity: 100,
    shipping: {
      free_shipping: true,
      logistic_type: 'fulfillment',
    },
  };

  const mockSearchResponse: SearchResponse = {
    site_id: 'MLA',
    query: 'iPhone 15',
    paging: {
      total: 5000,
      offset: 0,
      limit: 3,
      primary_results: 5000,
    },
    results: [
      mockProduct,
      { ...mockProduct, id: 'MLA123457', price: 1400000, sold_quantity: 80 },
      { ...mockProduct, id: 'MLA123458', price: 1600000, sold_quantity: 120 },
    ],
    sort: { id: 'relevance', name: 'Relevance' },
    available_sorts: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup console spies
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('Initial State Tests', () => {
    it('should start with status="idle"', () => {
      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      expect(result.current.state).toEqual({ status: 'idle' });
    });

    it('should provide enrich function', () => {
      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      expect(result.current.enrich).toBeDefined();
      expect(typeof result.current.enrich).toBe('function');
    });
  });

  describe('Successful Enrichment Tests', () => {
    it('should change status to "loading" when calling enrich()', async () => {
      vi.mocked(searchAPI.fetchSearchDirect).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockSearchResponse), 100);
          })
      );

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      // Initial state
      expect(result.current.state.status).toBe('idle');

      // Call enrich
      void result.current.enrich();

      // Wait for state to update to loading
      await waitFor(() => {
        expect(result.current.state.status).toBe('loading');
      });
    });

    it('should have status="success" with enriched data after successful enrichment', async () => {
      vi.mocked(searchAPI.fetchSearchDirect).mockResolvedValue(
        mockSearchResponse
      );

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      // Call enrich
      await result.current.enrich();

      // Wait for success
      await waitFor(() => {
        expect(result.current.state.status).toBe('success');
      });

      // Verify discriminated union type
      if (result.current.state.status === 'success') {
        expect(result.current.state.data).toBeDefined();
        expect(result.current.state.data.keyword).toBe('iPhone 15');
      }
    });

    it('should include opportunity_score, products, and metrics in enriched data', async () => {
      vi.mocked(searchAPI.fetchSearchDirect).mockResolvedValue(
        mockSearchResponse
      );

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      await result.current.enrich();

      await waitFor(() => {
        expect(result.current.state.status).toBe('success');
      });

      if (result.current.state.status === 'success') {
        const enrichedData = result.current.state.data;

        // Check products
        expect(enrichedData.products).toHaveLength(3);
        expect(enrichedData.products[0].id).toBe('MLA123456');

        // Check metrics
        expect(enrichedData.total_results).toBe(5000);
        expect(enrichedData.avg_price).toBeDefined();
        expect(enrichedData.min_price).toBe(1400000);
        expect(enrichedData.max_price).toBe(1600000);
        expect(enrichedData.total_sold).toBe(300); // 100 + 80 + 120
        expect(enrichedData.free_shipping_percentage).toBe(100); // All 3 have free shipping

        // Check opportunity score
        expect(enrichedData.opportunity_score).toBeDefined();
        expect(enrichedData.opportunity_score).toBeGreaterThan(0);
        expect(enrichedData.opportunity_score).toBeLessThanOrEqual(100);
      }
    });

    it('should prevent re-enrichment when already successful (enrich() does nothing)', async () => {
      vi.mocked(searchAPI.fetchSearchDirect).mockResolvedValue(
        mockSearchResponse
      );

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      // First enrichment
      await result.current.enrich();
      await waitFor(() => {
        expect(result.current.state.status).toBe('success');
      });

      // Clear mock calls
      vi.clearAllMocks();

      // Try to enrich again
      await result.current.enrich();

      // Should not call API again
      expect(searchAPI.fetchSearchDirect).not.toHaveBeenCalled();

      // Status should remain success
      expect(result.current.state.status).toBe('success');
    });
  });

  describe('Loading State Tests', () => {
    it('should have status="loading" during API call', async () => {
      vi.mocked(searchAPI.fetchSearchDirect).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockSearchResponse), 200);
          })
      );

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      void result.current.enrich();

      // Should be loading
      await waitFor(() => {
        expect(result.current.state.status).toBe('loading');
      });

      // Eventually should be success
      await waitFor(
        () => {
          expect(result.current.state.status).toBe('success');
        },
        { timeout: 500 }
      );
    });

    it('should prevent re-enrichment while loading (enrich() does nothing)', async () => {
      vi.mocked(searchAPI.fetchSearchDirect).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockSearchResponse), 200);
          })
      );

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      // Start first enrichment
      void result.current.enrich();

      await waitFor(() => {
        expect(result.current.state.status).toBe('loading');
      });

      // Clear mocks after first call
      const callCount = vi.mocked(searchAPI.fetchSearchDirect).mock.calls.length;

      // Try to enrich again while loading
      await result.current.enrich();

      // Should not call API again (same call count)
      expect(vi.mocked(searchAPI.fetchSearchDirect).mock.calls.length).toBe(
        callCount
      );
    });
  });

  describe('Error Handling Tests', () => {
    it('should have status="error" when fetchSearchDirect fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(searchAPI.fetchSearchDirect).mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      await result.current.enrich();

      await waitFor(() => {
        expect(result.current.state.status).toBe('error');
      });
    });

    it('should capture error message in state.error', async () => {
      const mockError = new Error('Search API timeout');
      vi.mocked(searchAPI.fetchSearchDirect).mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      await result.current.enrich();

      await waitFor(() => {
        expect(result.current.state.status).toBe('error');
      });

      // Verify discriminated union type
      if (result.current.state.status === 'error') {
        expect(result.current.state.error).toBe('Search API timeout');
      }
    });
  });

  describe('Integration with fetchSearchDirect', () => {
    it('should call fetchSearchDirect with correct parameters (siteId, keyword, limit=3)', async () => {
      vi.mocked(searchAPI.fetchSearchDirect).mockResolvedValue(
        mockSearchResponse
      );

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      await result.current.enrich();

      await waitFor(() => {
        expect(result.current.state.status).toBe('success');
      });

      expect(searchAPI.fetchSearchDirect).toHaveBeenCalledTimes(1);
      expect(searchAPI.fetchSearchDirect).toHaveBeenCalledWith(
        'MLA',
        'iPhone 15',
        3
      );
    });

    it('should use mock data and calculate metrics correctly', async () => {
      vi.mocked(searchAPI.fetchSearchDirect).mockResolvedValue(
        mockSearchResponse
      );

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      await result.current.enrich();

      await waitFor(() => {
        expect(result.current.state.status).toBe('success');
      });

      if (result.current.state.status === 'success') {
        const enrichedData = result.current.state.data;

        // Verify it used the mock data
        expect(enrichedData.products).toHaveLength(3);
        expect(enrichedData.total_results).toBe(5000);

        // Verify metrics calculation
        expect(enrichedData.avg_price).toBe(1500000); // (1500000 + 1400000 + 1600000) / 3
        expect(enrichedData.min_price).toBe(1400000);
        expect(enrichedData.max_price).toBe(1600000);
        expect(enrichedData.total_sold).toBe(300);
        expect(enrichedData.free_shipping_percentage).toBe(100);

        // Verify opportunity score is calculated
        // Based on the weights in calculateMetrics:
        // - Search volume (30%): min(30, (5000/10000) * 30) = 15
        // - Sold quantity (25%): min(25, (300/1000) * 25) = 7.5
        // - Free shipping (20%): (100/100) * 20 = 20
        // - Price range (15%): min(15, ((1600000-1400000)/1400000) * 10) = 1.43
        // - Available quantity (10%): min(10, (150/100) * 10) = 10
        // Total: ~54
        expect(enrichedData.opportunity_score).toBeGreaterThan(50);
        expect(enrichedData.opportunity_score).toBeLessThan(60);
      }
    });
  });

  describe('Console Logging Tests', () => {
    it('should log enrichment start and success messages', async () => {
      vi.mocked(searchAPI.fetchSearchDirect).mockResolvedValue(
        mockSearchResponse
      );

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      await result.current.enrich();

      await waitFor(() => {
        expect(result.current.state.status).toBe('success');
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[ON-DEMAND] Enriching trend: "iPhone 15"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[ON-DEMAND] Enriched "iPhone 15"')
      );
    });

    it('should log error messages when enrichment fails', async () => {
      const mockError = new Error('API error');
      vi.mocked(searchAPI.fetchSearchDirect).mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useEnrichTrendOnDemand('MLA', mockTrend)
      );

      await result.current.enrich();

      await waitFor(() => {
        expect(result.current.state.status).toBe('error');
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('[ON-DEMAND] Error enriching "iPhone 15"'),
        mockError
      );
    });
  });
});
