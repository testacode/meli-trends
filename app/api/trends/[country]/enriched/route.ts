import { NextRequest, NextResponse } from 'next/server';
import type { EnrichedTrendItem } from '@/types/meli';
import { getCache, setCache } from '@/lib/redis';

/**
 * API route for cached enriched trends
 *
 * GET: Returns cached enriched trends from Redis (null if cache miss)
 * POST: Stores enriched trends in Redis with 1 hour TTL
 *
 * Cache key format: enriched_trends:${country}
 * TTL: 3600 seconds (1 hour)
 */

const CACHE_TTL_SECONDS = 3600; // 1 hour
const VALID_COUNTRIES = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const { country } = await params;

    // Validate country ID
    if (!VALID_COUNTRIES.includes(country)) {
      return NextResponse.json(
        { error: 'Invalid country ID' },
        { status: 400 }
      );
    }

    // Check Redis cache
    const cacheKey = `enriched_trends:${country}`;
    const cached = await getCache<EnrichedTrendItem[]>(cacheKey);

    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache-Status': 'HIT' },
      });
    }

    // Cache miss - return null (client will enrich)
    return NextResponse.json(null, {
      status: 200,
      headers: { 'X-Cache-Status': 'MISS' },
    });
  } catch (error) {
    console.error('Error fetching cached enriched trends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const { country } = await params;

    // Validate country ID
    if (!VALID_COUNTRIES.includes(country)) {
      return NextResponse.json(
        { error: 'Invalid country ID' },
        { status: 400 }
      );
    }

    const enrichedData = await request.json();

    // Validate data format
    if (!enrichedData || !Array.isArray(enrichedData)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Store in Redis with 1 hour TTL
    const cacheKey = `enriched_trends:${country}`;
    await setCache(cacheKey, enrichedData, CACHE_TTL_SECONDS);

    return NextResponse.json({
      success: true,
      cached: true,
    });
  } catch (error) {
    console.error('Error caching enriched trends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
