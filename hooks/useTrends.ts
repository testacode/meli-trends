'use client';

import { useQuery } from '@tanstack/react-query';
import type { SiteId, TrendsResponse, ApiError, TrendItem } from '@/types/meli';
import { enrichTrendsWithType } from '@/utils/trends';

interface UseTrendsOptions {
  siteId: SiteId;
  categoryId?: string;
}

interface UseTrendsReturn {
  data: TrendItem[] | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch trends from internal API and enrich with trend_type
 */
async function fetchTrends({
  siteId,
  categoryId,
}: {
  siteId: SiteId;
  categoryId?: string;
}): Promise<TrendItem[]> {
  const endpoint = categoryId
    ? `/api/trends/${siteId}/${categoryId}`
    : `/api/trends/${siteId}`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.error || 'Failed to fetch trends',
      error: 'API_ERROR',
      status: response.status,
    } as ApiError;
  }

  const trends: TrendsResponse = await response.json();

  // Enrich trends with trend_type based on position
  return enrichTrendsWithType(trends);
}

/**
 * Hook to fetch trends from internal API
 * No authentication required from user - handled server-side
 *
 * Features:
 * - Automatic caching (24h with 5min stale time)
 * - Request deduplication
 * - Error handling
 * - Loading states
 */
export function useTrends({ siteId, categoryId }: UseTrendsOptions): UseTrendsReturn {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: categoryId
      ? ['trends', siteId, 'category', categoryId]
      : ['trends', siteId, 'all'],
    queryFn: () => fetchTrends({ siteId, categoryId }),
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
