import { NextRequest, NextResponse } from 'next/server';

/**
 * DEBUG endpoint - Check what Search API returns for a keyword
 * Usage: /api/debug/search?keyword=iphone&site=MLA
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const keyword = searchParams.get('keyword') || 'iphone';
    const siteId = searchParams.get('site') || 'MLA';

    // Get token
    const tokenResponse = await fetch(
      `${request.nextUrl.origin}/api/token`,
      { cache: 'no-store' }
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get token' },
        { status: 500 }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Call Search API
    const searchUrl = `https://api.mercadolibre.com/sites/${siteId}/search?q=${encodeURIComponent(keyword)}&limit=5`;

    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: 'no-store',
    });

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      return NextResponse.json(
        { error: 'Search failed', details: error },
        { status: searchResponse.status }
      );
    }

    const data = await searchResponse.json();

    return NextResponse.json({
      success: true,
      keyword,
      siteId,
      total_results: data.paging?.total || 0,
      results_count: data.results?.length || 0,
      search_url: searchUrl,
      sample_titles: data.results?.slice(0, 3).map((r: any) => r.title) || [],
      full_response: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
