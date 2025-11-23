# Logging System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a Consola-based logging system for development-only debugging with NewRelic-style formatting across API routes, hooks, and external API calls.

**Architecture:** Factory-based logger creation with tagged instances per module. Auto-disabled in production/test environments. Uses Consola for colored console output with custom timestamp formatting (dayjs) and duration tracking (Date.now()).

**Tech Stack:** Consola (logging library), dayjs (timestamp formatting), TypeScript, Vitest (testing)

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Consola**

```bash
npm install consola
```

Expected: Consola added to dependencies in package.json

**Step 2: Verify installation**

```bash
npm list consola
```

Expected: Shows consola@^3.x.x

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add consola for logging system"
```

---

## Task 2: Create Logger Types

**Files:**
- Create: `lib/logger/types.ts`

**Step 1: Write the types file**

Create `lib/logger/types.ts`:

```typescript
/**
 * Logger context types for tag-based organization
 * - API: Server-side API route handlers
 * - Hook: Client-side React hooks
 * - External: External API calls (MercadoLibre)
 */
export type LogContext =
  | `API:${string}`
  | `Hook:${string}`
  | `External:${string}`;

/**
 * Timer result returned by startTimer().end()
 */
export type TimerResult = {
  duration: number; // milliseconds
  formatted: string; // "245ms" or "1.2s"
};

/**
 * Logger interface
 * All methods are no-op in production/test environments
 */
export type Logger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, error?: Error, meta?: Record<string, unknown>) => void;
  success: (message: string, meta?: Record<string, unknown>) => void;
};

/**
 * Timer interface for duration tracking
 */
export type Timer = {
  end: () => TimerResult;
};
```

**Step 2: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Commit**

```bash
git add lib/logger/types.ts
git commit -m "feat(logger): add TypeScript types for logger system"
```

---

## Task 3: Create Timer and Utility Functions

**Files:**
- Create: `lib/logger/utils.ts`
- Create: `lib/logger/utils.test.ts`

**Step 1: Write the failing test**

Create `lib/logger/utils.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startTimer, formatDuration, sanitizeUrl } from './utils';

describe('startTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should track elapsed time in milliseconds', () => {
    const timer = startTimer();
    vi.advanceTimersByTime(245);
    const result = timer.end();

    expect(result.duration).toBe(245);
    expect(result.formatted).toBe('245ms');
  });

  it('should format durations under 1000ms as milliseconds', () => {
    const timer = startTimer();
    vi.advanceTimersByTime(850);
    const result = timer.end();

    expect(result.formatted).toBe('850ms');
  });

  it('should format durations over 1000ms as seconds', () => {
    const timer = startTimer();
    vi.advanceTimersByTime(1234);
    const result = timer.end();

    expect(result.formatted).toBe('1.2s');
  });

  it('should format durations over 1000ms with one decimal', () => {
    const timer = startTimer();
    vi.advanceTimersByTime(3567);
    const result = timer.end();

    expect(result.formatted).toBe('3.6s');
  });
});

describe('formatDuration', () => {
  it('should format milliseconds correctly', () => {
    expect(formatDuration(0)).toBe('0ms');
    expect(formatDuration(1)).toBe('1ms');
    expect(formatDuration(999)).toBe('999ms');
  });

  it('should format seconds with one decimal', () => {
    expect(formatDuration(1000)).toBe('1.0s');
    expect(formatDuration(1234)).toBe('1.2s');
    expect(formatDuration(5678)).toBe('5.7s');
  });
});

describe('sanitizeUrl', () => {
  it('should remove query parameters from URL', () => {
    const url = 'https://api.mercadolibre.com/sites/MLA/search?access_token=SECRET123';
    const result = sanitizeUrl(url);
    expect(result).toBe('https://api.mercadolibre.com/sites/MLA/search');
  });

  it('should keep pathname intact', () => {
    const url = 'https://api.example.com/v1/users/123?token=abc';
    const result = sanitizeUrl(url);
    expect(result).toBe('https://api.example.com/v1/users/123');
  });

  it('should handle URLs without query parameters', () => {
    const url = 'https://api.example.com/endpoint';
    const result = sanitizeUrl(url);
    expect(result).toBe('https://api.example.com/endpoint');
  });

  it('should handle URLs with hash fragments', () => {
    const url = 'https://example.com/page?token=secret#section';
    const result = sanitizeUrl(url);
    expect(result).toBe('https://example.com/page');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test lib/logger/utils.test.ts
```

Expected: FAIL - Cannot find module './utils'

**Step 3: Write minimal implementation**

Create `lib/logger/utils.ts`:

```typescript
import type { Timer, TimerResult } from './types';

/**
 * Format duration in milliseconds to human-readable string
 * @param duration Duration in milliseconds
 * @returns Formatted string ("245ms" or "1.2s")
 */
export function formatDuration(duration: number): string {
  if (duration < 1000) {
    return `${duration}ms`;
  }
  return `${(duration / 1000).toFixed(1)}s`;
}

/**
 * Start a timer for duration tracking
 * @returns Timer object with end() method
 */
export function startTimer(): Timer {
  const start = Date.now();

  return {
    end: (): TimerResult => {
      const duration = Date.now() - start;
      return {
        duration,
        formatted: formatDuration(duration),
      };
    },
  };
}

/**
 * Remove query parameters and hash from URL to prevent logging sensitive data
 * @param url Full URL with potential query params and tokens
 * @returns Sanitized URL (origin + pathname only)
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    // If URL parsing fails, return as-is (better than crashing)
    return url;
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test lib/logger/utils.test.ts
```

Expected: PASS - All tests pass

**Step 5: Commit**

```bash
git add lib/logger/utils.ts lib/logger/utils.test.ts
git commit -m "feat(logger): add timer and sanitization utilities with tests"
```

---

## Task 4: Create Logger Factory

**Files:**
- Create: `lib/logger/index.ts`
- Create: `lib/logger/index.test.ts`

**Step 1: Write the failing test**

Create `lib/logger/index.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from './index';

describe('createLogger', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('in development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should create a logger with all methods', () => {
      const logger = createLogger('Test');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
      expect(logger).toHaveProperty('success');
    });

    it('should not throw when calling logger methods', () => {
      const logger = createLogger('Test');
      expect(() => logger.info('test message')).not.toThrow();
      expect(() => logger.warn('test warning')).not.toThrow();
      expect(() => logger.error('test error')).not.toThrow();
      expect(() => logger.success('test success')).not.toThrow();
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return no-op logger', () => {
      const logger = createLogger('Test');
      logger.info('this should not log');
      logger.warn('this should not log');
      logger.error('this should not log');
      logger.success('this should not log');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('in test environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return no-op logger', () => {
      const logger = createLogger('Test');
      logger.info('this should not log');
      logger.warn('this should not log');
      logger.error('this should not log');
      logger.success('this should not log');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test lib/logger/index.test.ts
```

Expected: FAIL - Cannot find module './index'

**Step 3: Write minimal implementation**

Create `lib/logger/index.ts`:

```typescript
import { createConsola } from 'consola';
import dayjs from 'dayjs';
import type { Logger, LogContext } from './types';

/**
 * Create a tagged logger instance
 *
 * @param tag - Context tag for this logger (e.g., 'API:token', 'Hook:useTrends')
 * @returns Logger instance (no-op in production/test, Consola in development)
 *
 * @example
 * ```typescript
 * const logger = createLogger('API:token');
 * logger.info('Token fetched successfully');
 * // Output: [2025-11-23 14:30:45] ℹ [API:token] Token fetched successfully
 * ```
 */
export function createLogger(tag: LogContext | string): Logger {
  const env = process.env.NODE_ENV;

  // Return no-op logger in production or test environments
  if (env === 'production' || env === 'test') {
    return {
      info: () => {},
      warn: () => {},
      error: () => {},
      success: () => {},
    };
  }

  // Development environment: create Consola instance
  try {
    const consola = createConsola({
      level: 3, // info and above (no debug/trace)
      formatOptions: {
        date: true,
        colors: true,
      },
    });

    // Wrap Consola methods to add custom timestamp and tag
    const withTimestamp = (level: 'info' | 'warn' | 'error' | 'success') => {
      return (message: string, meta?: Record<string, unknown>) => {
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const formattedMessage = `[${timestamp}] [${tag}] ${message}`;

        if (meta) {
          consola[level](formattedMessage, meta);
        } else {
          consola[level](formattedMessage);
        }
      };
    };

    return {
      info: withTimestamp('info'),
      warn: withTimestamp('warn'),
      error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const formattedMessage = `[${timestamp}] [${tag}] ${message}`;

        if (error && meta) {
          consola.error(formattedMessage, error, meta);
        } else if (error) {
          consola.error(formattedMessage, error);
        } else if (meta) {
          consola.error(formattedMessage, meta);
        } else {
          consola.error(formattedMessage);
        }
      },
      success: withTimestamp('success'),
    };
  } catch (error) {
    // Fallback to console if Consola fails to initialize
    console.warn('Consola failed to initialize, using console fallback', error);

    return {
      info: (msg: string) => console.log(`[INFO] [${tag}] ${msg}`),
      warn: (msg: string) => console.warn(`[WARN] [${tag}] ${msg}`),
      error: (msg: string, err?: Error) => console.error(`[ERROR] [${tag}] ${msg}`, err),
      success: (msg: string) => console.log(`[SUCCESS] [${tag}] ${msg}`),
    };
  }
}

// Re-export utilities and types for convenience
export { startTimer, formatDuration, sanitizeUrl } from './utils';
export type { Logger, LogContext, Timer, TimerResult } from './types';
```

**Step 4: Run test to verify it passes**

```bash
npm run test lib/logger/index.test.ts
```

Expected: PASS - All tests pass

**Step 5: Commit**

```bash
git add lib/logger/index.ts lib/logger/index.test.ts
git commit -m "feat(logger): add logger factory with environment-based behavior"
```

---

## Task 5: Add Logging to Token API Route

**Files:**
- Modify: `app/api/token/route.ts`

**Step 1: Import logger at top of file**

In `app/api/token/route.ts`, add import after existing imports:

```typescript
import { createLogger, startTimer } from '@/lib/logger';

const logger = createLogger('API:token');
```

**Step 2: Add logging to GET function**

Replace the `GET` function with this version that includes logging:

```typescript
export async function GET() {
  const timer = startTimer();

  try {
    // Check if we have a valid cached token in KV
    const cachedToken = await kv.get<string>('meli_access_token');
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

    // Request token from MercadoLibre
    const fetchTimer = startTimer();
    const response = await fetch(
      `https://api.mercadolibre.com/oauth/token?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        `Token fetch failed with status ${response.status}`,
        new Error(errorText),
        fetchTimer.end()
      );
      return NextResponse.json(
        { error: 'Failed to obtain access token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const accessToken = data.access_token;

    // Cache token in Vercel KV for 5.5 hours (token expires in 6 hours)
    await kv.set('meli_access_token', accessToken, { ex: 5.5 * 60 * 60 });

    logger.success(
      'Token fetched and cached successfully',
      { ...timer.end(), fetchDuration: fetchTimer.end().formatted }
    );

    return NextResponse.json({
      access_token: accessToken,
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
```

**Step 3: Test manually**

```bash
# Start dev server (if not running)
npm run dev

# In another terminal, test the endpoint
curl http://localhost:3000/api/token
```

Expected:
- Console shows colored log output with timestamps
- API response includes access_token

**Step 4: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

**Step 5: Commit**

```bash
git add app/api/token/route.ts
git commit -m "feat(logger): add logging to token API route"
```

---

## Task 6: Add Logging to Trends API Route

**Files:**
- Modify: `app/api/trends/[country]/route.ts`

**Step 1: Import logger at top of file**

In `app/api/trends/[country]/route.ts`, add import after existing imports:

```typescript
import { createLogger, startTimer } from '@/lib/logger';

const logger = createLogger('API:trends');
```

**Step 2: Add logging to GET function**

Update the `GET` function to include logging. Find the existing function and modify it:

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ country: SiteId }> }
) {
  const timer = startTimer();
  const { country } = await params;

  logger.info(`Fetching trends for ${country}`);

  try {
    // Get access token from our internal endpoint
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const tokenResponse = await fetch(`${origin}/api/token`);

    if (!tokenResponse.ok) {
      logger.error(`Token fetch failed with status ${tokenResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to obtain access token' },
        { status: 500 }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Fetch trends from MercadoLibre Trends API
    const fetchTimer = startTimer();
    const trendsResponse = await fetch(
      `https://api.mercadolibre.com/trends/${country}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!trendsResponse.ok) {
      logger.error(
        `Trends API failed with status ${trendsResponse.status}`,
        undefined,
        fetchTimer.end()
      );
      return NextResponse.json(
        { error: 'Failed to fetch trends' },
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
```

**Step 3: Test manually**

```bash
# With dev server running, test the endpoint
curl http://localhost:3000/api/trends/MLA
```

Expected:
- Console shows colored log output for trends fetch
- API response includes trends array

**Step 4: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

**Step 5: Commit**

```bash
git add app/api/trends/[country]/route.ts
git commit -m "feat(logger): add logging to trends API route"
```

---

## Task 7: Add Logging to Search API Client

**Files:**
- Modify: `lib/searchAPI.ts`

**Step 1: Import logger at top of file**

In `lib/searchAPI.ts`, add import after existing imports:

```typescript
import { createLogger, startTimer, sanitizeUrl } from '@/lib/logger';

const logger = createLogger('External:SearchAPI');
```

**Step 2: Add logging to fetchSearchDirect function**

Find the `fetchSearchDirect` function and update it to include logging:

```typescript
export async function fetchSearchDirect(
  keyword: string,
  siteId: SiteId,
  limit: number = 3
): Promise<SearchResponse> {
  const timer = startTimer();
  const variants = getKeywordVariants(keyword);

  logger.info(`Searching for "${keyword}" (${variants.length} variants to try)`);

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const isLastVariant = i === variants.length - 1;

    logger.info(`Trying variant ${i + 1}/${variants.length}: "${variant}"`);

    const searchUrl = `https://api.mercadolibre.com/sites/${siteId}/search?q=${encodeURIComponent(
      variant
    )}&limit=${limit}`;

    try {
      const fetchTimer = startTimer();
      const response = await fetch(searchUrl);

      if (response.status === 429) {
        logger.warn(
          `Rate limited (429) on variant "${variant}"`,
          fetchTimer.end()
        );
        // Continue to next variant
        continue;
      }

      if (response.status === 403) {
        const cacheHeader = response.headers.get('x-cache');
        logger.error(
          `CloudFront blocking detected (403)`,
          undefined,
          {
            variant,
            'x-cache': cacheHeader,
            url: sanitizeUrl(searchUrl),
            ...fetchTimer.end(),
          }
        );
        // Continue to next variant
        continue;
      }

      if (!response.ok) {
        logger.error(
          `Search API failed with status ${response.status}`,
          undefined,
          { variant, url: sanitizeUrl(searchUrl), ...fetchTimer.end() }
        );

        if (isLastVariant) {
          throw new Error(
            `Search API failed for all variants: ${response.status} ${response.statusText}`
          );
        }
        continue;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        logger.success(
          `Search completed: ${data.results.length} products (variant: "${variant}")`,
          { ...timer.end(), fetchDuration: fetchTimer.end().formatted }
        );
        return data;
      }

      logger.warn(`No results for variant "${variant}", trying next`);
    } catch (error) {
      logger.error(
        `Search request failed for variant "${variant}"`,
        error instanceof Error ? error : new Error(String(error)),
        { url: sanitizeUrl(searchUrl) }
      );

      if (isLastVariant) {
        throw error;
      }
    }
  }

  // All variants exhausted with no results
  logger.warn(
    `All ${variants.length} variants exhausted, returning empty results`,
    timer.end()
  );

  return {
    site_id: siteId,
    query: keyword,
    results: [],
  };
}
```

**Step 3: Test manually**

```bash
# With dev server running, navigate to enriched trends page
# Open browser to http://localhost:3000/trends/MLA/enriched
# Check browser console for search API logs
```

Expected: Browser console shows colored search API logs with variants tried

**Step 4: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

**Step 5: Commit**

```bash
git add lib/searchAPI.ts
git commit -m "feat(logger): add logging to search API client with variant tracking"
```

---

## Task 8: Add Logging to useClientEnrichedTrends Hook

**Files:**
- Modify: `hooks/useClientEnrichedTrends.ts`

**Step 1: Import logger at top of file**

In `hooks/useClientEnrichedTrends.ts`, add import after existing imports:

```typescript
import { createLogger, startTimer } from '@/lib/logger';

const logger = createLogger('Hook:useClientEnrichedTrends');
```

**Step 2: Add logging to enrichBatch function**

Find the `enrichBatch` function inside the hook and update it:

```typescript
const enrichBatch = async (batch: TrendItem[], batchIndex: number) => {
  const timer = startTimer();
  const totalBatches = Math.ceil(basicTrends.length / BATCH_SIZE);

  logger.info(
    `Enriching batch ${batchIndex + 1}/${totalBatches} (${batch.length} trends)`
  );

  try {
    const enrichedBatch = await Promise.all(
      batch.map(async (trend) => {
        try {
          const searchData = await fetchSearchDirect(
            trend.keyword,
            trend.site_id,
            PRODUCTS_PER_KEYWORD
          );

          if (!searchData.results || searchData.results.length === 0) {
            return null;
          }

          const metrics = calculateMetrics(searchData.results);

          return {
            ...trend,
            products: searchData.results,
            metrics,
            opportunity_score: metrics.opportunityScore,
          };
        } catch (error) {
          logger.error(
            `Failed to enrich trend "${trend.keyword}"`,
            error instanceof Error ? error : new Error(String(error))
          );
          return null;
        }
      })
    );

    const validTrends = enrichedBatch.filter(
      (t): t is EnrichedTrendItem => t !== null
    );

    logger.success(
      `Batch ${batchIndex + 1}/${totalBatches} completed: ${validTrends.length}/${batch.length} trends enriched`,
      timer.end()
    );

    return validTrends;
  } catch (error) {
    logger.error(
      `Batch ${batchIndex + 1}/${totalBatches} failed`,
      error instanceof Error ? error : new Error(String(error)),
      timer.end()
    );
    return [];
  }
};
```

**Step 3: Add logging to main enrichment flow**

Find where enrichment starts and add logging:

```typescript
// At the start of enrichment process
useEffect(() => {
  if (!basicTrends.length || isEnriching) return;

  const enrichAllTrends = async () => {
    const overallTimer = startTimer();
    logger.info(`Starting enrichment of ${basicTrends.length} trends`);

    setIsEnriching(true);
    setEnrichedTrends([]);
    setProgress(0);

    // ... existing batching logic ...

    // At the end, after all batches
    const finalCount = allEnriched.length;
    logger.success(
      `Enrichment complete: ${finalCount}/${basicTrends.length} trends enriched`,
      overallTimer.end()
    );
  };

  enrichAllTrends();
}, [basicTrends]);
```

**Step 4: Test manually**

```bash
# With dev server running, navigate to enriched trends page
# Open browser to http://localhost:3000/trends/MLA/enriched
# Check browser console for batch enrichment logs
```

Expected: Browser console shows batch progress logs with timing

**Step 5: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

**Step 6: Commit**

```bash
git add hooks/useClientEnrichedTrends.ts
git commit -m "feat(logger): add logging to useClientEnrichedTrends hook with batch tracking"
```

---

## Task 9: Add Logging to useEnrichTrendOnDemand Hook

**Files:**
- Modify: `hooks/useEnrichTrendOnDemand.ts`

**Step 1: Import logger at top of file**

In `hooks/useEnrichTrendOnDemand.ts`, add import after existing imports:

```typescript
import { createLogger, startTimer } from '@/lib/logger';

const logger = createLogger('Hook:useEnrichTrendOnDemand');
```

**Step 2: Add logging to enrichTrend function**

Find the `enrichTrend` function and update it:

```typescript
const enrichTrend = async (trend: TrendItem): Promise<EnrichedTrendItem | null> => {
  const timer = startTimer();
  logger.info(`Enriching on-demand: "${trend.keyword}"`);

  try {
    const searchData = await fetchSearchDirect(
      trend.keyword,
      trend.site_id,
      PRODUCTS_PER_KEYWORD
    );

    if (!searchData.results || searchData.results.length === 0) {
      logger.warn(`No products found for "${trend.keyword}"`, timer.end());
      return null;
    }

    const metrics = calculateMetrics(searchData.results);

    const enriched: EnrichedTrendItem = {
      ...trend,
      products: searchData.results,
      metrics,
      opportunity_score: metrics.opportunityScore,
    };

    logger.success(
      `Enriched "${trend.keyword}": ${searchData.results.length} products, score ${metrics.opportunityScore}`,
      timer.end()
    );

    return enriched;
  } catch (error) {
    logger.error(
      `Failed to enrich "${trend.keyword}"`,
      error instanceof Error ? error : new Error(String(error)),
      timer.end()
    );
    return null;
  }
};
```

**Step 3: Test manually**

```bash
# With dev server running, navigate to basic trends page
# Open browser to http://localhost:3000/trends/MLA
# Click "+" button on a trend card
# Check browser console for on-demand enrichment log
```

Expected: Browser console shows on-demand enrichment log when clicking "+"

**Step 4: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

**Step 5: Commit**

```bash
git add hooks/useEnrichTrendOnDemand.ts
git commit -m "feat(logger): add logging to useEnrichTrendOnDemand hook"
```

---

## Task 10: Run Full Test Suite

**Files:**
- None (verification step)

**Step 1: Run all tests**

```bash
npm run test
```

Expected: All tests pass (including new logger tests)

**Step 2: Check test output for console noise**

Verify that no logger output appears during test runs (should be silent in test environment).

Expected: Clean test output, no console logs from logger

**Step 3: Run type checking**

```bash
npm run typecheck
```

Expected: No TypeScript errors

**Step 4: Run linting**

```bash
npm run lint
```

Expected: No linting errors

**Step 5: Run full check**

```bash
npm run check
```

Expected: All checks pass (typecheck + lint + tests)

---

## Task 11: Manual Integration Testing

**Files:**
- None (manual verification)

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test API route logging**

Open browser DevTools (Console tab) and navigate to:
- http://localhost:3000/api/token

Check terminal output for colored logs with:
- Timestamp in format `[YYYY-MM-DD HH:mm:ss]`
- Tag `[API:token]`
- Duration in format `(245ms)` or `(1.2s)`

**Step 3: Test trends API logging**

Navigate to:
- http://localhost:3000/api/trends/MLA

Check terminal output for:
- `[API:trends]` logs
- Token fetch logs
- Trends fetch with count

**Step 4: Test client-side enrichment logging**

Navigate to:
- http://localhost:3000/trends/MLA/enriched

Check browser console for:
- `[Hook:useClientEnrichedTrends]` batch logs
- `[External:SearchAPI]` search logs with variants
- Progress indicators (Batch 1/5, 2/5, etc.)
- Color-coded output (if browser supports)

**Step 5: Test on-demand enrichment logging**

Navigate to:
- http://localhost:3000/trends/MLA

Click "+" button on a trend card and check browser console for:
- `[Hook:useEnrichTrendOnDemand]` log
- `[External:SearchAPI]` search log
- Duration tracking

**Step 6: Verify error logging**

Temporarily break an API call (e.g., change API URL) and verify:
- Error logs appear with full stack trace
- Error context includes timing and metadata
- Red/error colored output

Then revert the breaking change.

---

## Task 12: Production Build Verification

**Files:**
- None (verification step)

**Step 1: Build for production**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 2: Check build output for logger code**

```bash
# Search for logger imports in build output
grep -r "consola" .next/
```

Expected: No matches (logger should be tree-shaken)

**Step 3: Start production server**

```bash
npm run start
```

**Step 4: Verify no logging in production**

Navigate to production URLs and check:
- Terminal: No log output
- Browser console: No log output

Expected: Complete silence from logger in production mode

**Step 5: Stop production server**

```bash
# Ctrl+C to stop
```

---

## Task 13: Update Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add logging section to CLAUDE.md**

Add this section after the "Development Commands" section:

```markdown
### Logging System

The application uses Consola for development logging. Logs are automatically disabled in production and test environments.

**Logger usage:**

```typescript
import { createLogger, startTimer } from '@/lib/logger';

const logger = createLogger('API:myroute');

export async function GET() {
  const timer = startTimer();

  logger.info('Starting operation');

  try {
    // ... do work ...
    logger.success('Operation completed', timer.end());
  } catch (error) {
    logger.error('Operation failed', error, timer.end());
  }
}
```

**Log output format:**

```
[YYYY-MM-DD HH:mm:ss] <icon> [TAG] Message (duration)
```

**Context tags:**
- `API:*` - Server-side API routes (cyan)
- `Hook:*` - Client-side React hooks (green)
- `External:*` - External API calls (yellow)

**When to log:**
- API route entry/exit with duration
- External API calls with status
- Enrichment batch progress
- Errors with full context

**What NOT to log:**
- Sensitive data (tokens, secrets)
- Full URLs with query parameters (use `sanitizeUrl()`)
- Routine renders or state changes

See `/docs/plans/2025-11-23-logging-system-design.md` for full design documentation.
```

**Step 2: Verify documentation renders correctly**

```bash
cat CLAUDE.md | grep -A 20 "Logging System"
```

Expected: New section appears in CLAUDE.md

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add logging system usage guide to CLAUDE.md"
```

---

## Task 14: Final Verification and Cleanup

**Files:**
- None (final checks)

**Step 1: Run full check suite**

```bash
npm run check
```

Expected: All checks pass

**Step 2: Verify all files are committed**

```bash
git status
```

Expected: Working tree clean (no uncommitted changes)

**Step 3: Review commit history**

```bash
git log --oneline -15
```

Expected: See all logging-related commits in chronological order

**Step 4: Create summary commit (if needed)**

If you made any small fixes during testing, create a final commit:

```bash
git add .
git commit -m "chore(logger): final cleanup and verification"
```

**Step 5: Push to remote (optional)**

```bash
git push origin master
```

---

## Success Criteria Checklist

After completing all tasks, verify these success criteria from the design doc:

- [ ] Clean, colored console output in development
- [ ] Zero console output in production build
- [ ] Zero console output during test runs
- [ ] All critical path events logged (API calls, enrichment, errors)
- [ ] Timestamps in NewRelic-style format (`YYYY-MM-DD HH:mm:ss`)
- [ ] Visual separation between contexts (API, Hook, External) via colors
- [ ] Duration tracking for all async operations
- [ ] No sensitive data in logs (tokens sanitized)
- [ ] Works in browser console (client-side)
- [ ] Works in terminal (server-side)
- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] Linting passes
- [ ] Production build succeeds and is tree-shaken

---

## Rollback Plan

If something goes wrong and you need to rollback:

```bash
# Find the commit before logging implementation
git log --oneline

# Reset to that commit (replace <commit-hash>)
git reset --hard <commit-hash>

# Force push if already pushed to remote
git push origin master --force
```

---

## Future Enhancements (Out of Scope)

These are explicitly not part of this implementation:

- Production logging or log shipping
- Structured JSON logging
- Per-module log level control
- Log rotation or persistence
- Performance profiling beyond basic timers
- Distributed tracing

If needed, create a new design document and implementation plan.
