'use client';

import { useState } from 'react';
import { fetchSearchDirect } from '@/lib/searchAPI';
import { createLogger, startTimer } from '@/lib/logger';
import type {
  TrendItem,
  EnrichedTrendItem,
  SiteId,
  SearchResponse,
} from '@/types/meli';

const logger = createLogger('Hook:useEnrichTrendOnDemand');
const PRODUCTS_PER_KEYWORD = 3;

/**
 * Calculate metrics for an enriched trend item
 */
function calculateMetrics(
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

type EnrichState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: EnrichedTrendItem }
  | { status: 'error'; error: string };

/**
 * Hook to enrich a single trend on-demand (when user clicks button)
 *
 * This prevents making too many Search API calls at once, which triggers
 * CloudFront 403 blocking. Instead, user controls when to fetch detailed data.
 *
 * @example
 * ```tsx
 * const { state, enrich } = useEnrichTrendOnDemand(siteId, trend);
 *
 * <Button onClick={enrich} loading={state.status === 'loading'}>
 *   Ver detalles
 * </Button>
 *
 * {state.status === 'success' && (
 *   <div>Opportunity score: {state.data.opportunity_score}</div>
 * )}
 * ```
 */
export function useEnrichTrendOnDemand(siteId: SiteId, trend: TrendItem) {
  const [state, setState] = useState<EnrichState>({ status: 'idle' });

  const enrich = async () => {
    // Don't re-enrich if already enriched or loading
    if (state.status === 'loading' || state.status === 'success') {
      return;
    }

    const timer = startTimer();
    logger.info(`Enriching on-demand: "${trend.keyword}"`);

    setState({ status: 'loading' });

    try {
      console.log(`🔍 [ON-DEMAND] Enriching trend: "${trend.keyword}"`);

      const searchData = await fetchSearchDirect(
        siteId,
        trend.keyword,
        PRODUCTS_PER_KEYWORD
      );

      if (!searchData.results || searchData.results.length === 0) {
        logger.warn(`No products found for "${trend.keyword}"`, timer.end());
        console.log(`⚠️ [ON-DEMAND] No products found for "${trend.keyword}"`);
        setState({
          status: 'error',
          error: 'API de Búsqueda temporalmente no disponible (error 403)',
        });
        return;
      }

      const enrichedTrend = calculateMetrics(trend, searchData);

      logger.success(
        `Enriched "${trend.keyword}": ${searchData.results.length} products, score ${enrichedTrend.opportunity_score}`,
        timer.end()
      );
      console.log(
        `✅ [ON-DEMAND] Enriched "${trend.keyword}": ${enrichedTrend.total_results} results, score: ${enrichedTrend.opportunity_score}`
      );

      setState({ status: 'success', data: enrichedTrend });
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message.includes('403')
          ? 'API de Búsqueda bloqueada por CloudFront (error 403)'
          : error instanceof Error
            ? error.message
            : 'Error desconocido';
      logger.error(
        `Failed to enrich "${trend.keyword}"`,
        error instanceof Error ? error : new Error(String(error)),
        timer.end()
      );
      console.error(`❌ [ON-DEMAND] Error enriching "${trend.keyword}":`, error);
      setState({ status: 'error', error: errorMessage });
    }
  };

  return { state, enrich };
}
