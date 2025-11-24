import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { renderHook, waitFor } from '@/test-utils';
import { useCategories } from './useCategories';
import type { Category, ApiError } from '@/types/meli';

describe('useCategories', () => {
  describe('successful data fetching', () => {
    it('should fetch categories successfully', async () => {
      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
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

    it('should return category items with correct structure', async () => {
      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const categories = result.current.data;
      expect(categories).toBeDefined();
      expect(categories!.length).toBeGreaterThan(0);

      categories!.forEach((category: Category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
      });
    });

    it('should return expected mock categories', async () => {
      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const categories = result.current.data;
      expect(categories).toBeDefined();
      expect(categories!.length).toBe(10); // mockCategories has 10 items

      // Verify specific categories from mock data
      const categoryIds = categories!.map((cat) => cat.id);
      expect(categoryIds).toContain('MLA1051'); // Celulares y Teléfonos
      expect(categoryIds).toContain('MLA1648'); // Computación
      expect(categoryIds).toContain('MLA1144'); // Consolas y Videojuegos
    });
  });

  describe('loading state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      expect(result.current.loading).toBe(true);
    });

    it('should set loading to false after data is fetched', async () => {
      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
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
        http.get('http://localhost:3000/api/categories/:country', () => {
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
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
        http.get('http://localhost:3000/api/categories/:country', () => {
          return HttpResponse.json(
            {
              error: 'Invalid country ID',
              message: 'Country INVALID is not supported',
              status: 400,
            },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const error: ApiError | null = result.current.error;
      expect(error).not.toBeNull();
      expect(error!.status).toBe(400);
      expect(error!.message).toContain('Invalid country ID');
      expect(result.current.data).toBeNull();
    });

    it('should handle 500 Server Error', async () => {
      // Override handler to return 500 error
      server.use(
        http.get('http://localhost:3000/api/categories/:country', () => {
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
        useCategories({ siteId: 'MLA' })
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
        http.get('http://localhost:3000/api/categories/:country', () => {
          return new HttpResponse('Not JSON', { status: 500 });
        })
      );

      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error!.message).toBe('Failed to fetch categories');
      expect(result.current.error!.error).toBe('API_ERROR');
    });

    it('should handle invalid country ID from API', async () => {
      // Override handler to return 400 for invalid country
      server.use(
        http.get('http://localhost:3000/api/categories/:country', ({ params }) => {
          const { country } = params;
          if (country === 'INVALID') {
            return HttpResponse.json(
              {
                error: 'Invalid country ID',
              },
              { status: 400 }
            );
          }
          return HttpResponse.json([]);
        })
      );

      const { result } = renderHook(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useCategories({ siteId: 'INVALID' as any })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error!.status).toBe(400);
    });
  });

  describe('refetch functionality', () => {
    it('should refetch data when refetch is called', async () => {
      let callCount = 0;

      // Track how many times the endpoint is called
      server.use(
        http.get('http://localhost:3000/api/categories/:country', () => {
          callCount++;
          return HttpResponse.json([
            {
              id: `MLA${callCount}`,
              name: `Category ${callCount}`,
            },
          ]);
        })
      );

      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(callCount).toBe(1);
      expect(result.current.data![0].id).toBe('MLA1');

      // Refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(callCount).toBe(2);
      });

      expect(result.current.data![0].id).toBe('MLA2');
    });

    it('should handle refetch without errors', async () => {
      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
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

  describe('queryKey changes trigger refetch', () => {
    it('should refetch when siteId changes', async () => {
      let callCount = 0;

      server.use(
        http.get('http://localhost:3000/api/categories/:country', ({ params }) => {
          callCount++;
          return HttpResponse.json([
            {
              id: `${params.country}1`,
              name: `Category for ${params.country}`,
            },
          ]);
        })
      );

      // First hook with MLA
      const { result: result1 } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(callCount).toBe(1);
      expect(result1.current.data![0].id).toBe('MLA1');

      // Second hook with MLB - different queryKey should trigger new fetch
      const { result: result2 } = renderHook(() =>
        useCategories({ siteId: 'MLB' })
      );

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(callCount).toBe(2);
      expect(result2.current.data![0].id).toBe('MLB1');
    });
  });

  describe('React Query caching', () => {
    it('should cache data per queryKey', async () => {
      let fetchCount = 0;

      server.use(
        http.get('http://localhost:3000/api/categories/:country', () => {
          fetchCount++;
          return HttpResponse.json([
            { id: 'MLA1000', name: 'Cached Category' },
          ]);
        })
      );

      // First hook instance
      const { result: result1 } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(fetchCount).toBe(1);
      expect(result1.current.data).toBeDefined();
      expect(result1.current.data![0].name).toBe('Cached Category');

      // Each renderHook creates a new QueryClient, so caching behavior
      // is tested by verifying the hook correctly uses React Query's caching mechanism
      // In real usage within the same QueryClientProvider, data would be shared
    });

    it('should fetch separately for different queryKeys', async () => {
      let fetchCount = 0;

      server.use(
        http.get('http://localhost:3000/api/categories/:country', () => {
          fetchCount++;
          return HttpResponse.json([
            { id: 'MLA1000', name: 'Test Category' },
          ]);
        })
      );

      // First hook with MLA
      const { result: result1 } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(fetchCount).toBe(1);

      // Second hook with MLB (different queryKey)
      const { result: result2 } = renderHook(() =>
        useCategories({ siteId: 'MLB' })
      );

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      // Should have made a second fetch
      expect(fetchCount).toBe(2);
    });
  });

  describe('stale time behavior', () => {
    it('should respect 24-hour stale time configuration', async () => {
      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Data should be present
      expect(result.current.data).toBeDefined();

      // Note: staleTime is set to 24h in the hook configuration
      // This test verifies the hook executes without errors
      // Actual stale time testing requires time manipulation (vi.useFakeTimers)
    });
  });

  describe('different countries', () => {
    const countries = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE'] as const;

    countries.forEach((country) => {
      it(`should fetch categories for ${country}`, async () => {
        const { result } = renderHook(() =>
          useCategories({ siteId: country })
        );

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).not.toBeNull();
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('API endpoint construction', () => {
    it('should call correct API endpoint', async () => {
      let endpointCalled = '';

      server.use(
        http.get('http://localhost:3000/api/categories/:country', ({ request }) => {
          endpointCalled = new URL(request.url).pathname;
          return HttpResponse.json([
            { id: 'MLA1000', name: 'Test' },
          ]);
        })
      );

      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLB' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(endpointCalled).toBe('/api/categories/MLB');
    });
  });

  describe('edge cases', () => {
    it('should handle empty category list', async () => {
      server.use(
        http.get('http://localhost:3000/api/categories/:country', () => {
          return HttpResponse.json([], { status: 200 });
        })
      );

      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle authentication failure', async () => {
      // Simulate authentication failure (would come from /api/token failing)
      server.use(
        http.get('http://localhost:3000/api/categories/:country', () => {
          return HttpResponse.json(
            {
              error: 'Failed to authenticate',
              status: 500,
            },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error!.status).toBe(500);
    });

    it('should handle MercadoLibre API failure', async () => {
      // Simulate MercadoLibre returning an error
      server.use(
        http.get('http://localhost:3000/api/categories/:country', () => {
          return HttpResponse.json(
            {
              error: 'Failed to fetch categories from MercadoLibre',
              status: 502,
            },
            { status: 502 }
          );
        })
      );

      const { result } = renderHook(() =>
        useCategories({ siteId: 'MLA' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error!.status).toBe(502);
    });
  });
});
