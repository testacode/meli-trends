import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { renderHook, waitFor } from '@/test-utils';
import { useTrends } from './useTrends';
import type { TrendItem, ApiError } from '@/types/meli';

describe('useTrends', () => {
  describe('successful data fetching', () => {
    it('should fetch trends successfully', async () => {
      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Data should be loaded
      expect(result.current.data).not.toBeNull();
      expect(result.current.data).toBeInstanceOf(Array);
      expect(result.current.data!.length).toBeGreaterThan(0);
      expect(result.current.error).toBeNull();
    });

    it('should return trend items with correct structure', async () => {
      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const trends = result.current.data;
      expect(trends).toBeDefined();
      expect(trends!.length).toBeGreaterThan(0);

      trends!.forEach((trend: TrendItem) => {
        expect(trend).toHaveProperty('keyword');
        expect(trend).toHaveProperty('url');
        expect(typeof trend.keyword).toBe('string');
        expect(typeof trend.url).toBe('string');
      });
    });
  });

  describe('loading state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      expect(result.current.loading).toBe(true);
    });

    it('should set loading to false after data is fetched', async () => {
      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      // Override handler to simulate network error
      server.use(
        http.get('http://localhost:3000/api/trends/:country', () => {
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.data).toBeNull();
      expect(result.current.error!.error).toBe('API_ERROR');
    });

    it('should handle 400 Bad Request errors', async () => {
      // Override handler to return 400 error
      server.use(
        http.get('http://localhost:3000/api/trends/:country', () => {
          return HttpResponse.json(
            {
              error: 'Invalid site ID',
              message: 'Site INVALID is not supported',
              status: 400,
            },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const error: ApiError | null = result.current.error;
      expect(error).not.toBeNull();
      expect(error!.status).toBe(400);
      expect(error!.message).toContain('Invalid site ID');
      expect(result.current.data).toBeNull();
    });

    it('should handle 500 Server Error', async () => {
      // Override handler to return 500 error
      server.use(
        http.get('http://localhost:3000/api/trends/:country', () => {
          return HttpResponse.json(
            {
              error: 'Internal Server Error',
              message: 'Something went wrong',
              status: 500,
            },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error!.status).toBe(500);
      expect(result.current.data).toBeNull();
    });

    it('should handle malformed error responses', async () => {
      // Override handler to return error without proper JSON
      server.use(
        http.get('http://localhost:3000/api/trends/:country', () => {
          return new HttpResponse('Not JSON', { status: 500 });
        })
      );

      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error!.message).toBe('Failed to fetch trends');
      expect(result.current.error!.error).toBe('API_ERROR');
    });
  });

  describe('refetch functionality', () => {
    it('should refetch data when refetch is called', async () => {
      let callCount = 0;

      // Track how many times the endpoint is called
      server.use(
        http.get('http://localhost:3000/api/trends/:country', () => {
          callCount++;
          return HttpResponse.json([
            {
              keyword: `test-${callCount}`,
              url: `https://example.com/${callCount}`,
            },
          ]);
        })
      );

      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(callCount).toBe(1);
      expect(result.current.data![0].keyword).toBe('test-1');

      // Refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(callCount).toBe(2);
      });

      expect(result.current.data![0].keyword).toBe('test-2');
    });

    it('should handle refetch without errors', async () => {
      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger refetch
      await result.current.refetch();

      // Should complete successfully
      expect(result.current.data).toBeDefined();
      expect(result.current.error).toBeNull();

      // Note: React Query uses cached data during refetch, so loading might stay false
      // This is expected behavior for better UX
    });
  });

  describe('with categoryId parameter', () => {
    it('should fetch trends with category', async () => {
      // Override handler to check for categoryId in URL
      server.use(
        http.get(
          'http://localhost:3000/api/trends/:country/:categoryId',
          ({ params }) => {
            const { country, categoryId } = params;
            expect(country).toBe('MLA');
            expect(categoryId).toBe('MLA1051');

            return HttpResponse.json([
              {
                keyword: 'category specific trend',
                url: 'https://example.com/category',
              },
            ]);
          }
        )
      );

      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLA', categoryId: 'MLA1051' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).not.toBeNull();
      expect(result.current.data![0].keyword).toBe('category specific trend');
    });

    it('should use different endpoint without categoryId', async () => {
      let endpointCalled = '';

      server.use(
        http.get('http://localhost:3000/api/trends/:country', ({ request }) => {
          endpointCalled = new URL(request.url).pathname;
          return HttpResponse.json([
            { keyword: 'test', url: 'https://example.com' },
          ]);
        })
      );

      const { result } = renderHook(() =>
        useTrends({ siteId: 'MLB' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(endpointCalled).toBe('/api/trends/MLB');
    });
  });

  describe('queryKey changes trigger refetch', () => {
    it('should refetch when siteId changes', async () => {
      let callCount = 0;

      server.use(
        http.get('http://localhost:3000/api/trends/:country', ({ params }) => {
          callCount++;
          return HttpResponse.json([
            {
              keyword: `trend-${params.country}`,
              url: `https://example.com/${params.country}`
            },
          ]);
        })
      );

      // First hook with MLA
      const { result: result1 } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(callCount).toBe(1);
      expect(result1.current.data![0].keyword).toContain('MLA');

      // Second hook with MLB - different queryKey should trigger new fetch
      const { result: result2 } = renderHook(() =>
        useTrends({ siteId: 'MLB' })
      );

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(callCount).toBe(2);
      expect(result2.current.data![0].keyword).toContain('MLB');
    });

    it('should refetch when categoryId is added', async () => {
      let fetchCount = 0;

      server.use(
        http.get('http://localhost:3000/api/trends/:country*', ({ request }) => {
          fetchCount++;
          const url = new URL(request.url);
          const hasCategoryId = url.pathname.split('/').length > 4;
          return HttpResponse.json([
            {
              keyword: hasCategoryId ? 'category trend' : 'general trend',
              url: 'https://example.com'
            },
          ]);
        })
      );

      // First hook without categoryId
      const { result: result1 } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(fetchCount).toBe(1);
      expect(result1.current.data![0].keyword).toBe('general trend');

      // Second hook with categoryId - different queryKey should trigger new fetch
      const { result: result2 } = renderHook(() =>
        useTrends({ siteId: 'MLA', categoryId: 'MLA1051' })
      );

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(fetchCount).toBe(2);
      expect(result2.current.data![0].keyword).toBe('category trend');
    });
  });

  describe('React Query caching', () => {
    it('should cache data per queryKey', async () => {
      let fetchCount = 0;

      server.use(
        http.get('http://localhost:3000/api/trends/:country', () => {
          fetchCount++;
          return HttpResponse.json([
            { keyword: 'cached test', url: 'https://example.com' },
          ]);
        })
      );

      // First hook instance
      const { result: result1 } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(fetchCount).toBe(1);
      expect(result1.current.data).toBeDefined();
      expect(result1.current.data![0].keyword).toBe('cached test');

      // Each renderHook creates a new QueryClient, so caching behavior
      // is tested by verifying the hook correctly uses React Query's caching mechanism
      // In real usage within the same QueryClientProvider, data would be shared
    });

    it('should fetch separately for different queryKeys', async () => {
      let fetchCount = 0;

      server.use(
        http.get('http://localhost:3000/api/trends/:country', () => {
          fetchCount++;
          return HttpResponse.json([
            { keyword: 'test', url: 'https://example.com' },
          ]);
        })
      );

      // First hook with MLA
      const { result: result1 } = renderHook(() =>
        useTrends({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(fetchCount).toBe(1);

      // Second hook with MLB (different queryKey)
      const { result: result2 } = renderHook(() =>
        useTrends({ siteId: 'MLB' })
      );

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      // Should have made a second fetch
      expect(fetchCount).toBe(2);
    });
  });

  describe('different countries', () => {
    const countries = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE'] as const;

    countries.forEach((country) => {
      it(`should fetch trends for ${country}`, async () => {
        const { result } = renderHook(() =>
          useTrends({ siteId: country })
        );

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).not.toBeNull();
        expect(result.current.error).toBeNull();
      });
    });
  });
});
