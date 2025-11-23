'use client';

import { useQuery } from '@tanstack/react-query';
import type { SiteId, Category, ApiError } from '@/types/meli';

interface UseCategoriesOptions {
  siteId: SiteId;
}

interface UseCategoriesReturn {
  data: Category[] | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch categories from internal API
 */
async function fetchCategories({ siteId }: { siteId: SiteId }): Promise<Category[]> {
  const endpoint = `/api/categories/${siteId}`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.error || 'Failed to fetch categories',
      error: 'API_ERROR',
      status: response.status,
    } as ApiError;
  }

  return response.json();
}

/**
 * Hook to fetch categories from internal API
 * No authentication required from user - handled server-side
 *
 * Features:
 * - Automatic caching (24h stale time - categories don't change often)
 * - Request deduplication
 * - Error handling
 * - Loading states
 */
export function useCategories({ siteId }: UseCategoriesOptions): UseCategoriesReturn {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories', siteId],
    queryFn: () => fetchCategories({ siteId }),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (categories rarely change)
  });

  // Convert error to ApiError format
  const apiError: ApiError | null = isError && error
    ? {
        message: error.message || 'Unknown error',
        error: 'API_ERROR',
        status: (error as unknown as ApiError).status || 500,
      }
    : null;

  return {
    data: data ?? null,
    loading: isPending,
    error: apiError,
    refetch: async () => {
      await refetch();
    },
  };
}
