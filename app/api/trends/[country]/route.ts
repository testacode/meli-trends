import { NextRequest, NextResponse } from 'next/server';
import { createLogger, startTimer } from '@/lib/logger';

const logger = createLogger('API:trends');

/**
 * API route to fetch MercadoLibre trends for a specific country
 * This route handles authentication internally and returns public trend data
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const timer = startTimer();
  const { country } = await params;

  logger.info(`Fetching trends for ${country}`);

  try {

    // Validate country ID
    const validCountries = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE'];
    if (!validCountries.includes(country)) {
      logger.error(`Invalid country ID: ${country}`);
      return NextResponse.json(
        { error: 'Invalid country ID' },
        { status: 400 }
      );
    }

    // Get access token from our internal API
    const tokenResponse = await fetch(
      `${request.nextUrl.origin}/api/token`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!tokenResponse.ok) {
      logger.error(`Token fetch failed with status ${tokenResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to authenticate' },
        { status: 500 }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Fetch trends from MercadoLibre
    const fetchTimer = startTimer();
    const trendsResponse = await fetch(
      `https://api.mercadolibre.com/trends/${country}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes (aligns with client-side staleTime)
      }
    );

    if (!trendsResponse.ok) {
      logger.error(
        `Trends API failed with status ${trendsResponse.status}`,
        undefined,
        fetchTimer.end()
      );
      return NextResponse.json(
        { error: 'Failed to fetch trends from MercadoLibre' },
        { status: trendsResponse.status }
      );
    }

    const trends = await trendsResponse.json();

    logger.success(
      `Trends fetched successfully for ${country}: ${trends.length} trends`,
      { ...timer.end(), fetchDuration: fetchTimer.end().formatted }
    );

    return NextResponse.json(trends);
  } catch (error) {
    logger.error(
      `Trends endpoint failed for ${country}`,
      error instanceof Error ? error : new Error(String(error)),
      timer.end()
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
