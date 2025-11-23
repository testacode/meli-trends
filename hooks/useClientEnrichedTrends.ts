'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSearchDirect } from '@/lib/searchAPI';
import type {
  TrendItem,
  EnrichedTrendItem,
  SiteId,
  SearchResponse,
} from '@/types/meli';

interface UseClientEnrichedTrendsOptions {
  siteId: SiteId;
  limit?: number;
  autoLoad?: boolean;
}

interface UseClientEnrichedTrendsReturn {
  trends: EnrichedTrendItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  total: number;
  cacheAge: string | null;
  progress: number; // Percentage of trends enriched (0-100)
}

const BATCH_SIZE = 2; // Process 2 trends at a time
const BATCH_DELAY_MS = 1000; // 1s between batches
const PRODUCTS_PER_KEYWORD = 3;

/**
 * Calculate metrics for an enriched trend item
 * (Same logic as server-side version)
 * Exported for testing purposes
 */
export function calculateMetrics(
  trendItem: TrendItem,
  searchData: SearchResponse
): EnrichedTrendItem {
  const products = searchData.results.slice(0, PRODUCTS_PER_KEYWORD);
  const prices = products.map((p) => p.price).filter((p) => p > 0);
  const soldQuantities = products
    .map((p) => p.sold_quantity || 0)
    .filter((q) => q > 0);
  const freeShippingCount = products.filter(
    (p) => p.shipping?.free_shipping
  ).length;

  // Calculate average, min, max prices
  const avgPrice =
    prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : undefined;
  const minPrice = prices.length > 0 ? Math.min(...prices) : undefined;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : undefined;

  // Total sold across all products
  const totalSold =
    soldQuantities.length > 0
      ? soldQuantities.reduce((sum, q) => sum + q, 0)
      : undefined;

  // Free shipping percentage
  const freeShippingPercentage =
    products.length > 0 ? (freeShippingCount / products.length) * 100 : 0;

  // Opportunity Score (0-100)
  let opportunityScore = 0;

  // Factor 1: Search volume score (0-30)
  const searchVolumeScore = Math.min(
    30,
    (searchData.paging.total / 10000) * 30
  );
  opportunityScore += searchVolumeScore;

  // Factor 2: Sold quantity score (0-25)
  if (totalSold !== undefined) {
    const soldScore = Math.min(25, (totalSold / 1000) * 25);
    opportunityScore += soldScore;
  }

  // Factor 3: Free shipping score (0-20)
  opportunityScore += (freeShippingPercentage / 100) * 20;

  // Factor 4: Price range score (0-15)
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > 0) {
    const priceRangeRatio = (maxPrice - minPrice) / minPrice;
    const priceRangeScore = Math.min(15, priceRangeRatio * 10);
    opportunityScore += priceRangeScore;
  }

  // Factor 5: Available quantity score (0-10)
  const totalAvailable = products.reduce(
    (sum, p) => sum + (p.available_quantity || 0),
    0
  );
  const availabilityScore = Math.min(10, (totalAvailable / 100) * 10);
  opportunityScore += availabilityScore;

  return {
    ...trendItem,
    products,
    total_results: searchData.paging.total,
    avg_price: avgPrice,
    min_price: minPrice,
    max_price: maxPrice,
    total_sold: totalSold,
    free_shipping_percentage: freeShippingPercentage,
    opportunity_score: Math.round(opportunityScore),
  };
}

/**
 * Sleep utility for delays between batches
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hook for fetching enriched trends with CLIENT-SIDE Search API calls
 *
 * This version calls MercadoLibre Search API directly from the browser to avoid
 * CloudFront blocking server IPs. The Search API is public and doesn't require auth.
 *
 * Features:
 * - Progressive loading (enriches trends in batches)
 * - No server-side Search API calls (avoids CloudFront 403 errors)
 * - Basic trends from server (OAuth stays secure)
 * - Client-side caching via React Query
 * - Same API interface as useEnrichedTrends
 *
 * @example
 * ```tsx
 * const { trends, loading, progress } = useClientEnrichedTrends({
 *   siteId: 'MLA',
 *   limit: 10,
 *   autoLoad: true,
 * });
 *
 * <div>
 *   {loading && <div>Loading... {progress}%</div>}
 *   {trends.map(trend => <TrendCard key={trend.keyword} trend={trend} />)}
 * </div>
 * ```
 */
export function useClientEnrichedTrends({
  siteId,
  limit = 10,
  autoLoad = true,
}: UseClientEnrichedTrendsOptions): UseClientEnrichedTrendsReturn {
  const [enrichedTrends, setEnrichedTrends] = useState<EnrichedTrendItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);

  // Fetch basic trends from server (OAuth still server-side, secure ✅)
  const {
    data: trendsData,
    isLoading: loadingBasicTrends,
    error: basicTrendsError,
    refetch: refetchBasicTrends,
  } = useQuery({
    queryKey: ['trends', siteId],
    queryFn: async () => {
      const res = await fetch(`/api/trends/${siteId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch basic trends');
      }
      return res.json() as Promise<TrendItem[]>;
    },
    enabled: autoLoad,
  });

  const basicTrends = trendsData || [];
  const paginatedTrends = basicTrends.slice(0, currentOffset + limit);

  // Calculate progress percentage
  const progress =
    paginatedTrends.length > 0
      ? Math.round((enrichedTrends.length / paginatedTrends.length) * 100)
      : 0;

  // Enrich trends progressively in batches (CLIENT-SIDE)
  useEffect(() => {
    if (
      paginatedTrends.length === 0 ||
      processing ||
      enrichedTrends.length >= paginatedTrends.length
    ) {
      return;
    }

    async function enrichBatches() {
      setProcessing(true);
      setError(null);

      try {
        const startIndex = enrichedTrends.length;
        const trendsToEnrich = paginatedTrends.slice(startIndex);

        console.log(
          `🔄 [CLIENT] Starting enrichment of ${trendsToEnrich.length} trends in batches of ${BATCH_SIZE}`
        );

        for (let i = 0; i < trendsToEnrich.length; i += BATCH_SIZE) {
          const batch = trendsToEnrich.slice(i, i + BATCH_SIZE);
          const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
          const totalBatches = Math.ceil(trendsToEnrich.length / BATCH_SIZE);

          console.log(
            `🔄 [CLIENT] Processing batch ${batchNumber}/${totalBatches} (${batch.length} trends)`
          );

          // Process batch in parallel (within batch)
          const batchResults = await Promise.all(
            batch.map(async (trend) => {
              try {
                const searchData = await fetchSearchDirect(
                  siteId,
                  trend.keyword,
                  PRODUCTS_PER_KEYWORD
                );
                return calculateMetrics(trend, searchData);
              } catch (err) {
                console.error(
                  `❌ [CLIENT] Error enriching "${trend.keyword}":`,
                  err
                );
                // Return trend with empty data instead of failing completely
                return {
                  ...trend,
                  products: [],
                  total_results: 0,
                  opportunity_score: 0,
                };
              }
            })
          );

          // Update UI progressively after each batch
          setEnrichedTrends((prev) => [...prev, ...batchResults]);

          // Delay before next batch (except last)
          if (i + BATCH_SIZE < trendsToEnrich.length) {
            console.log(
              `⏳ [CLIENT] Waiting ${BATCH_DELAY_MS}ms before next batch...`
            );
            await sleep(BATCH_DELAY_MS);
          }
        }

        console.log(
          `✅ [CLIENT] Enrichment complete: ${enrichedTrends.length + trendsToEnrich.length} trends`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ [CLIENT] Enrichment error:', errorMessage);
        setError(errorMessage);
      } finally {
        setProcessing(false);
      }
    }

    enrichBatches();
  }, [paginatedTrends, enrichedTrends.length, siteId, processing]);

  // Load more function (pagination)
  const loadMore = useCallback(async () => {
    if (currentOffset + limit >= basicTrends.length) {
      return; // No more trends to load
    }

    console.log(`⬇️  [CLIENT] Loading more trends from offset ${currentOffset + limit}`);
    setCurrentOffset((prev) => prev + limit);
  }, [currentOffset, limit, basicTrends.length]);

  // Refresh function
  const refresh = useCallback(async () => {
    console.log('🔄 [CLIENT] Refreshing trends...');
    setEnrichedTrends([]);
    setCurrentOffset(0);
    setError(null);
    await refetchBasicTrends();
  }, [refetchBasicTrends]);

  const hasMore = currentOffset + limit < basicTrends.length;
  const loading = loadingBasicTrends || processing;
  const finalError = basicTrendsError
    ? basicTrendsError.message
    : error;

  return {
    trends: enrichedTrends,
    loading,
    error: finalError,
    hasMore,
    loadMore,
    refresh,
    total: basicTrends.length,
    cacheAge: null, // Client-side doesn't have server cache info
    progress,
  };
}
