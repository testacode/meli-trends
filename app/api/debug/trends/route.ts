import { NextRequest, NextResponse } from 'next/server';

/**
 * DEBUG endpoint - Check what Trends API returns
 * Usage: /api/debug/trends?site=MLA
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const siteId = searchParams.get('site') || 'MLA';

    // Get base trends
    const trendsResponse = await fetch(
      `${request.nextUrl.origin}/api/trends/${siteId}`,
      { cache: 'no-store' }
    );

    if (!trendsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch trends' },
        { status: 500 }
      );
    }

    const trends = await trendsResponse.json();

    return NextResponse.json({
      success: true,
      siteId,
      total_trends: trends.length,
      first_10_keywords: trends.slice(0, 10).map((t: any) => t.keyword),
      full_trends: trends,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
