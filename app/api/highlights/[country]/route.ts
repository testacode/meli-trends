import { NextRequest, NextResponse } from "next/server";
import type { SiteId } from "@/types/meli";
import { createLogger, startTimer } from "@/lib/logger";

const logger = createLogger("API:highlights");

type RouteParams = {
  params: Promise<{ country: SiteId }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const timer = startTimer();
  const { country } = await params;
  const categoryId = request.nextUrl.searchParams.get("category");

  logger.info(`Fetching best sellers for ${country}`, {
    category: categoryId || "none",
  });

  if (!categoryId) {
    logger.error("Missing category parameter");
    return NextResponse.json(
      { error: "Category ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get OAuth token
    const origin =
      process.env.VERCEL_URL || process.env.NEXT_PUBLIC_REDIRECT_URI || "";
    const tokenUrl = origin.startsWith("http")
      ? `${origin}/api/token`
      : `http://${origin}/api/token`;

    const tokenResponse = await fetch(tokenUrl);

    if (!tokenResponse.ok) {
      logger.error("Failed to get OAuth token", undefined, {
        status: tokenResponse.status,
      });
      return NextResponse.json(
        {
          error: "Failed to authenticate with MercadoLibre",
          message: "Failed to authenticate with MercadoLibre",
        },
        { status: 500 }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Fetch highlights from MercadoLibre API
    const highlightsUrl = `https://api.mercadolibre.com/highlights/${country}/category/${categoryId}`;
    logger.info(`Calling Highlights API: ${highlightsUrl}`);

    const highlightsResponse = await fetch(highlightsUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Log response headers to detect CloudFront blocking
    const xCache = highlightsResponse.headers.get("x-cache");
    const cfRay = highlightsResponse.headers.get("cf-ray");
    const server = highlightsResponse.headers.get("server");

    logger.info("Response headers", {
      status: highlightsResponse.status,
      "x-cache": xCache,
      "cf-ray": cfRay,
      server: server,
    });

    // Check for CloudFront 403 blocking
    if (
      highlightsResponse.status === 403 &&
      (xCache?.includes("cloudfront") || xCache?.includes("Error"))
    ) {
      logger.error("🔴 CLOUDFRONT BLOCKING DETECTED", undefined, {
        status: 403,
        "x-cache": xCache,
        "cf-ray": cfRay,
      });
      return NextResponse.json(
        {
          error: "CloudFront blocking detected",
          details:
            "Highlights API is blocked by CloudFront when called from server-side (datacenter IPs)",
          headers: {
            "x-cache": xCache,
            "cf-ray": cfRay,
            server: server,
          },
          solution:
            "Need to implement client-side calls like Search API (see /docs/architecture/search-api-403-investigation-2025-11.md)",
        },
        { status: 403 }
      );
    }

    if (!highlightsResponse.ok) {
      const errorText = await highlightsResponse.text();
      logger.error("Highlights API error", undefined, {
        status: highlightsResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        {
          error: "Failed to fetch highlights from MercadoLibre",
          message: "Failed to fetch highlights from MercadoLibre",
          details: errorText,
        },
        { status: highlightsResponse.status }
      );
    }

    const data = await highlightsResponse.json();

    logger.success(
      `✅ Successfully fetched ${data.content?.length || 0} best sellers`,
      timer.end()
    );

    // Return data with diagnostic headers
    return NextResponse.json(
      {
        ...data,
        _meta: {
          cloudfront_status: xCache || "no-cloudfront-header",
          server: server || "unknown",
          tested_at: new Date().toISOString(),
          tested_from: "server-side",
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    logger.error("Unexpected error fetching highlights", errorObj, timer.end());
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Internal server error",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
