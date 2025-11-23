'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { EnrichedTrendsResponse, EnrichedTrendItem, SiteId } from '@/types/meli';

interface UseEnrichedTrendsOptions {
  siteId: SiteId;
  limit?: number;
  autoLoad?: boolean; // Auto-load first page on mount
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
 * Hook for fetching enriched trends with infinite scroll support
 *
 * Features:
 * - Infinite scroll pagination
 * - Automatic deduplication
 * - Cache awareness
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
  const [trends, setTrends] = useState<EnrichedTrendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [cacheAge, setCacheAge] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const hasMore = trends.length < total && trends.length > 0;

  /**
   * Fetch trends from API
   */
  const fetchTrends = useCallback(
    async (currentOffset: number, append: boolean = false) => {
      // Prevent concurrent requests
      if (loadingRef.current) {
        console.log('⏸️  Skipping fetch - already loading');
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const url = `/api/trends/${siteId}/enriched?offset=${currentOffset}&limit=${limit}`;
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

        if (cacheStatus === 'HIT' && cacheAgeSeconds) {
          const ageMinutes = Math.round(parseInt(cacheAgeSeconds, 10) / 60);
          setCacheAge(`${ageMinutes}min ago`);
        } else {
          setCacheAge('fresh');
        }

        console.log(
          `✅ Fetched ${data.trends.length} trends (total: ${data.total}, cache: ${cacheStatus || 'N/A'})`
        );

        // Update state
        setTotal(data.total);

        if (append) {
          setTrends((prev) => {
            // Deduplicate by keyword
            const existing = new Set(prev.map((t) => t.keyword));
            const newTrends = data.trends.filter(
              (t) => !existing.has(t.keyword)
            );
            return [...prev, ...newTrends];
          });
        } else {
          setTrends(data.trends);
        }

        setOffset(currentOffset + data.trends.length);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('❌ Error fetching enriched trends:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [siteId, limit]
  );

  /**
   * Load more trends (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }

    console.log(`⬇️  Loading more trends from offset ${offset}`);
    await fetchTrends(offset, true);
  }, [hasMore, loading, offset, fetchTrends]);

  /**
   * Refresh trends from beginning
   */
  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing trends...');
    setTrends([]);
    setOffset(0);
    await fetchTrends(0, false);
  }, [fetchTrends]);

  // Auto-load first page on mount
  useEffect(() => {
    if (autoLoad && trends.length === 0 && !loading && !error) {
      fetchTrends(0, false);
    }
  }, [autoLoad, siteId, trends.length, loading, error, fetchTrends]);

  // Reset when site changes
  useEffect(() => {
    setTrends([]);
    setOffset(0);
    setError(null);
    setTotal(0);
    setCacheAge(null);
  }, [siteId]);

  return {
    trends,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total,
    cacheAge,
  };
}
