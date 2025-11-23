import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/redis';
import { createLogger, startTimer } from '@/lib/logger';

const logger = createLogger('API:token');

/**
 * Internal API route to obtain MercadoLibre access token
 * This uses the app's credentials (server-side only)
 * NEVER exposes CLIENT_SECRET to the client
 *
 * Token is cached in Redis (via ioredis) for 5.5 hours
 * This ensures cache persists across serverless deployments/regions
 */

export async function GET() {
  const timer = startTimer();

  try {
    // Check if we have a valid cached token in Redis
    const cachedToken = await getCache<string>('meli_access_token');
    if (cachedToken) {
      logger.info('Token cache hit', timer.end());
      return NextResponse.json({
        access_token: cachedToken,
      });
    }

    logger.info('Token cache miss, fetching new token');

    // Get credentials from environment (server-side only)
    const clientId = process.env.NEXT_PUBLIC_MELI_APP_ID;
    const clientSecret = process.env.MELI_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      logger.error('Missing MercadoLibre credentials');
      return NextResponse.json(
        { error: 'Missing MercadoLibre credentials' },
        { status: 500 }
      );
    }

    // Get app access token using client credentials flow
    const fetchTimer = startTimer();
    const tokenResponse = await fetch(
      'https://api.mercadolibre.com/oauth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logger.error(
        `Token fetch failed with status ${tokenResponse.status}`,
        new Error(errorText),
        fetchTimer.end()
      );
      return NextResponse.json(
        { error: 'Failed to authenticate with MercadoLibre' },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    // Cache token in Redis with TTL (expires in 21600 seconds = 6 hours, cache for 5.5 hours to be safe)
    const ttlSeconds = 5.5 * 60 * 60; // 19800 seconds
    await setCache('meli_access_token', tokenData.access_token, ttlSeconds);

    logger.success(
      'Token fetched and cached successfully',
      { ...timer.end(), fetchDuration: fetchTimer.end().formatted }
    );

    return NextResponse.json({
      access_token: tokenData.access_token,
    });
  } catch (error) {
    logger.error(
      'Token endpoint failed',
      error instanceof Error ? error : new Error(String(error)),
      timer.end()
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
