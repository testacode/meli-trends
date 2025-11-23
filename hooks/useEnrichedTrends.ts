'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { EnrichedTrendsResponse, EnrichedTrendItem, SiteId } from '@/types/meli';
import { useMemo } from 'react';

interface UseEnrichedTrendsOptions {
  siteId: SiteId;
  limit?: number;
  autoLoad?: boolean;
}

interface UseEnrichedTrendsReturn {
  trends: EnrichedTrendItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  total: number;
  cacheAge: string | null;
}

/**
 * Fetch enriched trends from API
 */
async function fetchEnrichedTrends({
  siteId,
  limit,
  offset,
}: {
  siteId: SiteId;
  limit: number;
  offset: number;
}): Promise<EnrichedTrendsResponse & { cacheInfo: { status: string | null; age: string | null } }> {
  const url = `/api/trends/${siteId}/enriched?offset=${offset}&limit=${limit}`;
  console.log(`📡 Fetching enriched trends: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch trends');
  }

  const data: EnrichedTrendsResponse = await response.json();

  // Extract cache info from headers
  const cacheStatus = response.headers.get('X-Cache');
  const cacheAgeSeconds = response.headers.get('X-Cache-Age');

  let cacheAge: string | null = null;
  if (cacheStatus === 'HIT' && cacheAgeSeconds) {
    const ageMinutes = Math.round(parseInt(cacheAgeSeconds, 10) / 60);
    cacheAge = `${ageMinutes}min ago`;
  } else if (cacheStatus === 'MISS') {
    cacheAge = 'fresh';
  }

  console.log(
    `✅ Fetched ${data.trends.length} trends (total: ${data.total}, cache: ${cacheStatus || 'N/A'})`
  );

  return {
    ...data,
    cacheInfo: {
      status: cacheStatus,
      age: cacheAge,
    },
  };
}

/**
 * Hook for fetching enriched trends with infinite scroll support
 *
 * Features:
 * - Infinite scroll pagination (powered by React Query)
 * - Automatic request deduplication
 * - Client-side caching (24h with 5min stale time)
 * - Error handling
 * - Loading states
 *
 * @example
 * ```tsx
 * const { trends, loading, loadMore, hasMore } = useEnrichedTrends({
 *   siteId: 'MLA',
 *   limit: 10,
 *   autoLoad: true,
 * });
 *
 * // In component
 * <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
 *   {trends.map(trend => <TrendCard key={trend.keyword} trend={trend} />)}
 * </InfiniteScroll>
 * ```
 */
export function useEnrichedTrends({
  siteId,
  limit = 10,
  autoLoad = true,
}: UseEnrichedTrendsOptions): UseEnrichedTrendsReturn {
  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['enrichedTrends', siteId, limit],
    queryFn: ({ pageParam }) =>
      fetchEnrichedTrends({
        siteId,
        limit,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Calculate total trends fetched so far
      const totalFetched = allPages.reduce(
        (sum, page) => sum + page.trends.length,
        0
      );

      // If we've fetched all trends, no more pages
      if (totalFetched >= lastPage.total || lastPage.trends.length === 0) {
        return undefined;
      }

      // Return next offset
      return totalFetched;
    },
    enabled: autoLoad,
  });

  // Flatten all pages into single array
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const trends = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.trends);
  }, [data?.pages]);

  // Get total from first page
  const total = data?.pages[0]?.total ?? 0;

  // Get cache info from first page
  const cacheAge = data?.pages[0]?.cacheInfo.age ?? null;

  // Determine if we're loading (initial or next page)
  const loading = isPending || isFetchingNextPage;

  // Convert error to string
  const errorMessage = isError && error ? error.message : null;

  // Load more function for infinite scroll
  const loadMore = async () => {
    if (!hasNextPage || loading) {
      return;
    }

    console.log(`⬇️  Loading more trends...`);
    await fetchNextPage();
  };

  // Refresh function to invalidate and refetch
  const refresh = async () => {
    console.log('🔄 Refreshing trends...');
    await refetch();
  };

  return {
    trends,
    loading,
    error: errorMessage,
    hasMore: hasNextPage ?? false,
    loadMore,
    refresh,
    total,
    cacheAge,
  };
}
