import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to fetch MercadoLibre trends for a specific country
 * This route handles authentication internally and returns public trend data
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const { country } = await params;

    // Validate country ID
    const validCountries = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE'];
    if (!validCountries.includes(country)) {
      return NextResponse.json(
        { error: 'Invalid country ID' },
        { status: 400 }
      );
    }

    // Get access token from our internal API
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

    // Fetch trends from MercadoLibre
    const trendsResponse = await fetch(
      `https://api.mercadolibre.com/trends/${country}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        cache: 'no-store',
      }
    );

    if (!trendsResponse.ok) {
      const error = await trendsResponse.text();
      console.error('MercadoLibre API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trends from MercadoLibre' },
        { status: trendsResponse.status }
      );
    }

    const trends = await trendsResponse.json();

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
