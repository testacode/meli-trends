import { NextRequest, NextResponse } from 'next/server';
import { createLogger, startTimer } from '@/lib/logger';

const logger = createLogger('API:categories');

/**
 * API route to fetch MercadoLibre categories for a specific country
 * Returns the category tree structure for the given site
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const timer = startTimer();
  const { country } = await params;

  logger.info(`Fetching categories for ${country}`);

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

    // Fetch categories from MercadoLibre
    const fetchTimer = startTimer();
    const categoriesResponse = await fetch(
      `https://api.mercadolibre.com/sites/${country}/categories`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        next: { revalidate: 86400 }, // Cache for 24 hours (categories don't change often)
      }
    );

    if (!categoriesResponse.ok) {
      logger.error(
        `Categories API failed with status ${categoriesResponse.status}`,
        undefined,
        fetchTimer.end()
      );
      return NextResponse.json(
        { error: 'Failed to fetch categories from MercadoLibre' },
        { status: categoriesResponse.status }
      );
    }

    const categories = await categoriesResponse.json();

    logger.success(
      `Categories fetched successfully for ${country}: ${categories.length} categories`,
      { ...timer.end(), fetchDuration: fetchTimer.end().formatted }
    );

    return NextResponse.json(categories);
  } catch (error) {
    logger.error(
      `Categories endpoint failed for ${country}`,
      error instanceof Error ? error : new Error(String(error)),
      timer.end()
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
