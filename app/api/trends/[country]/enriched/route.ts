import { NextRequest, NextResponse } from 'next/server';
import type {
  EnrichedTrendsResponse,
  EnrichedTrendItem,
  TrendItem,
  SearchResponse,
  SearchProduct,
  SiteId,
} from '@/types/meli';

/**
 * Cache for enriched trends data
 * Key: SiteId, Value: { data, timestamp }
 */
const enrichedTrendsCache = new Map<
  string,
  { data: EnrichedTrendsResponse; timestamp: number }
>();

// Cache TTL: 24 hours in milliseconds
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Number of concurrent requests
const CONCURRENCY_LIMIT = 5;

// Products to fetch per keyword
const PRODUCTS_PER_KEYWORD = 3;

/**
 * Simplify keyword for better search results
 * Examples:
 * - "black edition 4x4" -> "black edition 4x4" (try exact first)
 * - If no results -> "black edition" (remove last word)
 * - If still no results -> "black" (first significant word)
 */
function getKeywordVariants(keyword: string): string[] {
  const variants: string[] = [keyword]; // Start with exact keyword

  // Split into words and remove common filler words
  const words = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2) // Remove very short words
    .filter((w) => !['de', 'la', 'el', 'los', 'las', 'con', 'para'].includes(w));

  // Add progressively shorter variants
  if (words.length > 2) {
    // Try first 2-3 words
    variants.push(words.slice(0, 3).join(' '));
    variants.push(words.slice(0, 2).join(' '));
  }

  if (words.length > 1) {
    // Try first word if it's meaningful
    const firstWord = words[0];
    if (firstWord.length > 3) {
      variants.push(firstWord);
    }
  }

  return [...new Set(variants)]; // Remove duplicates
}

/**
 * Fetch search results for a keyword with fallback variants
 */
async function fetchSearchResults(
  siteId: SiteId,
  keyword: string,
  accessToken: string,
  limit: number = PRODUCTS_PER_KEYWORD
): Promise<SearchResponse> {
  const variants = getKeywordVariants(keyword);

  // Try each variant until we get results
  for (const variant of variants) {
    try {
      const encodedKeyword = encodeURIComponent(variant);
      const url = `https://api.mercadolibre.com/sites/${siteId}/search?q=${encodedKeyword}&limit=${limit}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(
          `Search API error for "${variant}":`,
          response.status,
          await response.text()
        );
        continue; // Try next variant
      }

      const data: SearchResponse = await response.json();

      // If we got results, return them
      if (data.paging.total > 0) {
        if (variant !== keyword) {
          console.log(
            `✅ Found results for "${keyword}" using variant "${variant}" (${data.paging.total} results)`
          );
        }
        return data;
      }

      console.log(`⚠️  No results for variant "${variant}", trying next...`);
    } catch (error) {
      console.error(`Error with variant "${variant}":`, error);
      continue;
    }
  }

  // No variants worked, return empty response
  console.log(`❌ No results found for "${keyword}" with any variant`);
  return {
    site_id: siteId,
    query: keyword,
    paging: {
      total: 0,
      offset: 0,
      limit,
      primary_results: 0,
    },
    results: [],
    sort: { id: 'relevance', name: 'Relevance' },
    available_sorts: [],
  };
}

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
  // Factors:
  // 1. High search volume (total_results) - 30%
  // 2. High sold quantity - 25%
  // 3. Free shipping availability - 20%
  // 4. Price range (higher range = more opportunity) - 15%
  // 5. Available quantity (higher = more opportunity) - 10%

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
 * Process trends in parallel with concurrency limit
 * NOTE: Filters out trends with 0 results, so may return fewer than 'limit'
 */
async function processEnrichedTrends(
  trends: TrendItem[],
  siteId: SiteId,
  accessToken: string,
  offset: number = 0,
  limit: number = 10
): Promise<EnrichedTrendItem[]> {
  // Process more trends than requested to account for filtering
  // This ensures we get enough trends with data
  const fetchSize = Math.min(limit * 3, trends.length); // Fetch 3x to ensure we get enough with data
  const paginatedTrends = trends.slice(offset, offset + fetchSize);

  // Process in chunks to respect concurrency limit
  const enrichedTrends: EnrichedTrendItem[] = [];

  for (let i = 0; i < paginatedTrends.length; i += CONCURRENCY_LIMIT) {
    const chunk = paginatedTrends.slice(i, i + CONCURRENCY_LIMIT);

    const chunkResults = await Promise.all(
      chunk.map(async (trend) => {
        try {
          const searchData = await fetchSearchResults(
            siteId,
            trend.keyword,
            accessToken
          );

          return calculateMetrics(trend, searchData);
        } catch (error) {
          console.error(`Error processing trend "${trend.keyword}":`, error);

          // Return minimal data on error
          return {
            ...trend,
            products: [],
            total_results: 0,
            opportunity_score: 0,
          };
        }
      })
    );

    enrichedTrends.push(...chunkResults);

    // If we already have enough trends with data, stop processing
    const trendsWithData = enrichedTrends.filter((t) => t.total_results > 0);
    if (trendsWithData.length >= limit) {
      break;
    }
  }

  // Filter out trends without data
  const trendsWithData = enrichedTrends.filter((t) => t.total_results > 0);

  console.log(
    `📊 Processed ${enrichedTrends.length} trends, ${trendsWithData.length} have data`
  );

  // Return up to the requested limit
  return trendsWithData.slice(0, limit);
}

/**
 * GET /api/trends/[country]/enriched
 *
 * Query params:
 * - offset: number (default: 0)
 * - limit: number (default: 10, max: 50)
 * - nocache: boolean (default: false) - bypass cache
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const { country } = await params;
    const { searchParams } = request.nextUrl;

    // Parse query params
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10', 10),
      50
    );
    const noCache = searchParams.get('nocache') === 'true';

    // Validate country ID
    const validCountries = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE'];
    if (!validCountries.includes(country)) {
      return NextResponse.json(
        { error: 'Invalid country ID' },
        { status: 400 }
      );
    }

    const siteId = country as SiteId;

    // Check cache
    const cacheKey = `${siteId}-${offset}-${limit}`;
    const cached = enrichedTrendsCache.get(cacheKey);

    if (!noCache && cached) {
      const age = Date.now() - cached.timestamp;

      if (age < CACHE_TTL_MS) {
        console.log(`✅ Cache HIT for ${cacheKey} (age: ${Math.round(age / 1000 / 60)}min)`);

        return NextResponse.json(cached.data, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Age': Math.round(age / 1000).toString(),
          },
        });
      } else {
        console.log(`🗑️  Cache EXPIRED for ${cacheKey}`);
        enrichedTrendsCache.delete(cacheKey);
      }
    }

    console.log(`❌ Cache MISS for ${cacheKey}, fetching fresh data...`);

    // Get access token
    const tokenResponse = await fetch(
      `${request.nextUrl.origin}/api/token`,
      { cache: 'no-store' }
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to authenticate' },
        { status: 500 }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Fetch base trends
    const trendsResponse = await fetch(
      `${request.nextUrl.origin}/api/trends/${country}`,
      { cache: 'no-store' }
    );

    if (!trendsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch trends' },
        { status: 500 }
      );
    }

    const trends: TrendItem[] = await trendsResponse.json();

    // Process enriched trends with pagination
    const enrichedTrends = await processEnrichedTrends(
      trends,
      siteId,
      access_token,
      offset,
      limit
    );

    // Build response
    const response: EnrichedTrendsResponse = {
      site_id: siteId,
      trends: enrichedTrends,
      total: trends.length,
      offset,
      limit,
      cached_at: new Date().toISOString(),
      cache_ttl: CACHE_TTL_MS / 1000, // seconds
    };

    // Cache the response
    enrichedTrendsCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });

    console.log(`💾 Cached enriched trends for ${cacheKey}`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching enriched trends:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
