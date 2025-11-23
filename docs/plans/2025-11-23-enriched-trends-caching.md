# Enriched Trends Caching Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add server-side Vercel KV caching for enriched trends to share cached data across all users, reducing Search API calls by ~95% and providing instant results for 90%+ of users.

**Architecture:** Two-layer caching strategy - Vercel KV (server-side, 1 hour TTL) shared across all users + TanStack Query (client-side, 1 hour staleTime) per browser. GET endpoint checks cache, POST endpoint writes cache. Client-side enrichment remains unchanged, just adds cache check before and cache write after.

**Tech Stack:** Vercel KV (Upstash Redis), Next.js 16 App Router, TanStack Query v5, TypeScript 5

---

## Background Context

### Current Architecture
- **Basic trends**: `/api/trends/[country]` returns keywords only (cached 5 min)
- **Enriched trends**: Client-side `useClientEnrichedTrends` hook
  - Fetches basic trends
  - Enriches via client-side Search API calls (batches of 2, 1s delay)
  - Takes 10-15 seconds per load
  - Every user waits, no sharing

### Why Client-Side Search API?
MercadoLibre Search API uses CloudFront that blocks datacenter IPs (Vercel, AWS). Server-side requests get 403 errors. Client-side requests from end-user IPs work perfectly. See `docs/architecture/api-cloudfront-blocking.md`.

### Trends Update Frequency
MercadoLibre Trends API updates **weekly** (not real-time). Product data (prices, stock) updates continuously. 1 hour cache balances freshness with performance.

### Vercel KV Pricing
**Free tier** (Upstash Redis via Vercel Marketplace):
- 500K requests/month
- 256 MB storage
- Our usage: ~95K requests/month, ~280 KB storage
- **Cost: $0** ✅

---

## Implementation Tasks

### Task 1: Create Vercel KV Database

**Manual Step** (via Vercel Dashboard):

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project
2. Click "Storage" tab
3. Click "Create Database" → Select "KV"
4. **Name**: `meli-trends-cache`
5. **Region**: Same as deployment region (check in Settings → General)
6. Click "Create"

**Verification:**
- Environment variables auto-injected:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `KV_REST_API_READ_ONLY_TOKEN`
- `@vercel/kv` package already installed (done in previous fix)

**Expected:** Database created, env vars available in Vercel project

---

### Task 2: Create API Endpoint - GET Handler

**Files:**
- Create: `app/api/trends/[country]/enriched/route.ts`

**Step 1: Write the failing test first**

Create: `app/api/trends/[country]/enriched/route.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { kv } from '@vercel/kv';
import type { NextRequest } from 'next/server';

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
  },
}));

describe('GET /api/trends/[country]/enriched', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cached data when available', async () => {
    const mockCachedData = [
      { keyword: 'iPhone 15', url: 'https://...', products: [] },
    ];
    vi.mocked(kv.get).mockResolvedValue(mockCachedData);

    const request = {} as NextRequest;
    const params = Promise.resolve({ country: 'MLA' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockCachedData);
    expect(response.headers.get('X-Cache-Status')).toBe('HIT');
    expect(kv.get).toHaveBeenCalledWith('enriched_trends:MLA');
  });

  it('should return null when cache miss', async () => {
    vi.mocked(kv.get).mockResolvedValue(null);

    const request = {} as NextRequest;
    const params = Promise.resolve({ country: 'MLA' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeNull();
    expect(response.headers.get('X-Cache-Status')).toBe('MISS');
  });

  it('should reject invalid country codes', async () => {
    const request = {} as NextRequest;
    const params = Promise.resolve({ country: 'INVALID' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid country ID' });
    expect(kv.get).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/api/trends/[country]/enriched/route.test.ts`

Expected: FAIL - "Cannot find module './route'"

**Step 3: Write minimal GET implementation**

Create: `app/api/trends/[country]/enriched/route.ts`

```typescript
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import type { EnrichedTrendItem } from '@/types/meli';

/**
 * API route for cached enriched trends
 *
 * GET: Returns cached enriched trends from Vercel KV (null if cache miss)
 * POST: Stores enriched trends in Vercel KV with 1 hour TTL
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

    // Check Vercel KV cache
    const cacheKey = `enriched_trends:${country}`;
    const cached = await kv.get<EnrichedTrendItem[]>(cacheKey);

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
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/api/trends/[country]/enriched/route.test.ts`

Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add app/api/trends/\[country\]/enriched/route.ts app/api/trends/\[country\]/enriched/route.test.ts
git commit -m "feat: add GET endpoint for cached enriched trends

- New route returns cached enriched trends from Vercel KV
- Returns null on cache miss (client handles enrichment)
- Validates country codes
- Includes X-Cache-Status header (HIT/MISS)
- Cache key format: enriched_trends:{country}
- Comprehensive tests for cache hit, miss, and validation"
```

---

### Task 3: Add POST Handler to Cache Endpoint

**Files:**
- Modify: `app/api/trends/[country]/enriched/route.ts`
- Modify: `app/api/trends/[country]/enriched/route.test.ts`

**Step 1: Write the failing test**

Add to: `app/api/trends/[country]/enriched/route.test.ts`

```typescript
import { GET, POST } from './route';

// Add to existing mocks
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('POST /api/trends/[country]/enriched', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cache valid enriched data', async () => {
    const enrichedData = [
      { keyword: 'iPhone 15', url: 'https://...', products: [] },
      { keyword: 'Samsung Galaxy', url: 'https://...', products: [] },
    ];

    vi.mocked(kv.set).mockResolvedValue('OK');

    const request = {
      json: async () => enrichedData,
    } as unknown as NextRequest;
    const params = Promise.resolve({ country: 'MLA' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, cached: true });
    expect(kv.set).toHaveBeenCalledWith(
      'enriched_trends:MLA',
      enrichedData,
      { ex: 3600 }
    );
  });

  it('should reject non-array data', async () => {
    const request = {
      json: async () => ({ invalid: 'data' }),
    } as unknown as NextRequest;
    const params = Promise.resolve({ country: 'MLA' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid data format' });
    expect(kv.set).not.toHaveBeenCalled();
  });

  it('should reject invalid country codes', async () => {
    const request = {
      json: async () => [],
    } as unknown as NextRequest;
    const params = Promise.resolve({ country: 'INVALID' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid country ID' });
    expect(kv.set).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/api/trends/[country]/enriched/route.test.ts`

Expected: FAIL - "POST is not exported"

**Step 3: Write minimal POST implementation**

Add to: `app/api/trends/[country]/enriched/route.ts`

```typescript
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

    // Store in Vercel KV with 1 hour TTL
    const cacheKey = `enriched_trends:${country}`;
    await kv.set(cacheKey, enrichedData, { ex: CACHE_TTL_SECONDS });

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
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/api/trends/[country]/enriched/route.test.ts`

Expected: 6 tests PASS (3 GET + 3 POST)

**Step 5: Commit**

```bash
git add app/api/trends/\[country\]/enriched/route.ts app/api/trends/\[country\]/enriched/route.test.ts
git commit -m "feat: add POST endpoint to cache enriched trends

- Accepts enriched trends array and stores in Vercel KV
- 1 hour TTL (3600 seconds)
- Validates data format (must be array)
- Validates country codes
- Background cache write (fire-and-forget from client)
- Tests for valid data, invalid format, invalid country"
```

---

### Task 4: Modify useClientEnrichedTrends Hook

**Files:**
- Modify: `hooks/useClientEnrichedTrends.ts`

**Step 1: Write the failing test**

Add to: `hooks/useClientEnrichedTrends.test.tsx`

```typescript
describe('Cache integration', () => {
  it('should use cached data when available', async () => {
    const cachedData = [
      {
        keyword: 'iPhone 15',
        url: 'https://mercadolibre.com/iphone-15',
        products: mockProducts.slice(0, 3),
        metrics: {
          avgPrice: 1000,
          minPrice: 900,
          maxPrice: 1100,
          totalResults: 100,
          freeShippingCount: 50,
          totalSold: 200,
        },
        opportunity_score: 75,
      },
    ];

    // Mock cache hit
    server.use(
      http.get('/api/trends/MLA/enriched', () => {
        return HttpResponse.json(cachedData);
      })
    );

    const { result } = renderHook(
      () => useClientEnrichedTrends({ siteId: 'MLA', autoLoad: true }),
      { wrapper: createWrapper(queryClient) }
    );

    // Should load immediately from cache
    await waitFor(() => {
      expect(result.current.trends).toEqual(cachedData);
      expect(result.current.isLoading).toBe(false);
    });

    // Should NOT call Search API
    expect(searchAPICalls).toBe(0);
  });

  it('should enrich when cache miss and POST result', async () => {
    let postCalled = false;
    let postedData: unknown = null;

    // Mock cache miss
    server.use(
      http.get('/api/trends/MLA/enriched', () => {
        return HttpResponse.json(null);
      }),
      http.post('/api/trends/MLA/enriched', async ({ request }) => {
        postCalled = true;
        postedData = await request.json();
        return HttpResponse.json({ success: true, cached: true });
      })
    );

    const { result } = renderHook(
      () => useClientEnrichedTrends({ siteId: 'MLA', limit: 2, autoLoad: true }),
      { wrapper: createWrapper(queryClient) }
    );

    // Should enrich client-side
    await waitFor(
      () => {
        expect(result.current.trends.length).toBe(2);
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 10000 }
    );

    // Should POST enriched data to cache
    await waitFor(() => {
      expect(postCalled).toBe(true);
      expect(postedData).toEqual(result.current.trends);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- hooks/useClientEnrichedTrends.test.tsx`

Expected: FAIL - "Expected 0 Search API calls, got 2" (cache not implemented yet)

**Step 3: Modify hook to check cache first**

Modify: `hooks/useClientEnrichedTrends.ts`

Find the existing hook and add cache check at the beginning:

```typescript
export function useClientEnrichedTrends({
  siteId,
  limit,
  autoLoad = false,
}: UseClientEnrichedTrendsOptions) {
  // NEW: Try to fetch cached enriched data first
  const cachedQuery = useQuery({
    queryKey: ['enriched-trends-cached', siteId],
    queryFn: async () => {
      const response = await fetch(`/api/trends/${siteId}/enriched`);
      if (!response.ok) {
        return null;
      }
      return response.json() as Promise<EnrichedTrendItem[] | null>;
    },
    enabled: autoLoad,
    staleTime: 1000 * 60 * 60, // 1 hour (matches server cache)
  });

  // Existing basic trends query
  const { data: basicTrends, ...basicQuery } = useTrends({
    siteId,
    categoryId: undefined,
  });

  // State for enriched trends
  const [enrichedTrends, setEnrichedTrends] = useState<EnrichedTrendItem[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState(0);

  // NEW: Determine if we should enrich
  // Only enrich if cache miss (null) and autoLoad is true
  const shouldEnrich = cachedQuery.data === null && autoLoad;

  // Modified: Only run enrichment if shouldEnrich is true
  useEffect(() => {
    if (!shouldEnrich || !basicTrends || basicTrends.length === 0) {
      return;
    }

    // Existing enrichment logic...
    // (Keep all existing batching, Search API calls, etc.)

  }, [shouldEnrich, basicTrends, siteId, limit]);

  // NEW: POST enriched data to cache after enrichment completes
  useEffect(() => {
    if (
      enrichedTrends.length > 0 &&
      !isEnriching &&
      cachedQuery.data === null
    ) {
      // Fire-and-forget POST to cache
      fetch(`/api/trends/${siteId}/enriched`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedTrends),
      }).catch((error) => {
        console.error('Failed to cache enriched trends:', error);
        // Silent fail - not critical
      });
    }
  }, [enrichedTrends, isEnriching, siteId, cachedQuery.data]);

  // Return cached data if available, otherwise enriched data
  const trends = cachedQuery.data || enrichedTrends;

  return {
    trends,
    isLoading: cachedQuery.isLoading || basicQuery.isPending || isEnriching,
    isError: cachedQuery.isError || basicQuery.isError,
    error: cachedQuery.error || basicQuery.error,
    progress,
    refetch: basicQuery.refetch,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- hooks/useClientEnrichedTrends.test.tsx`

Expected: All tests PASS (including new cache tests)

**Step 5: Commit**

```bash
git add hooks/useClientEnrichedTrends.ts hooks/useClientEnrichedTrends.test.tsx
git commit -m "feat: add cache check to useClientEnrichedTrends hook

- Check /api/trends/{country}/enriched before enriching
- Use cached data if available (instant results)
- Fall back to client-side enrichment on cache miss
- POST enriched result to cache (background, fire-and-forget)
- TanStack Query caches API response for 1 hour
- Tests for cache hit and cache miss scenarios"
```

---

### Task 5: Update TanStack Query Config

**Files:**
- Modify: `components/providers/QueryProvider.tsx:17`

**Step 1: Locate and modify staleTime**

Current code:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

New code:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour (matches server cache TTL)
      refetchOnWindowFocus: false,
    },
  },
});
```

**Step 2: Verify change**

Run: `npm run typecheck`

Expected: No errors

**Step 3: Commit**

```bash
git add components/providers/QueryProvider.tsx
git commit -m "config: increase TanStack Query staleTime to 1 hour

- Changed from 5 minutes to 1 hour
- Aligns with server-side Vercel KV cache TTL
- Reduces redundant API calls
- Client-side cache now matches server cache duration"
```

---

### Task 6: Run Full Test Suite

**Step 1: Run all checks**

Run: `npm run check`

Expected:
- TypeScript: ✅ No errors
- ESLint: ✅ No errors
- Tests: ✅ All tests pass

**Step 2: If tests fail, debug**

Common issues:
- Mock not matching actual implementation
- Missing await in async tests
- Cache key format mismatch

Fix and re-run until all pass.

---

### Task 7: Write Design Documentation

**Files:**
- Create: `docs/plans/2025-11-23-enriched-trends-caching-design.md`

**Content:** (Write the complete design we discussed earlier)

```markdown
# Enriched Trends Caching Design

## Overview
Server-side caching for enriched trends using Vercel KV (Upstash Redis).
First user after cache expiry enriches data, all subsequent users get instant results.

## Architecture

### Two-Layer Caching
1. **Vercel KV** (server-side): 1 hour TTL, shared across all users
2. **TanStack Query** (client-side): 1 hour staleTime, per-browser cache

### Data Flow
...
(Include complete design from our brainstorming session)
```

**Commit:**

```bash
git add docs/plans/2025-11-23-enriched-trends-caching-design.md
git commit -m "docs: add enriched trends caching design

- Two-layer caching strategy (Vercel KV + TanStack Query)
- Architecture and data flow diagrams
- Performance expectations (~95% instant results)
- Vercel KV pricing analysis (free tier)
- Testing strategy
- Deployment and rollout plan"
```

---

## Verification Checklist

Before deploying:

- [ ] Vercel KV database created via dashboard
- [ ] `KV_REST_API_URL` environment variable exists in Vercel project
- [ ] All tests pass: `npm run check`
- [ ] `/api/trends/MLA/enriched` GET returns null (cache empty)
- [ ] `/api/trends/MLA/enriched` POST succeeds
- [ ] Second GET returns cached data
- [ ] `useClientEnrichedTrends` uses cache when available
- [ ] Hook enriches on cache miss
- [ ] Hook POSTs enriched data after enrichment

## Deployment Steps

1. **Create Vercel KV database** (Task 1)
2. **Deploy code** (push to master triggers Vercel deployment)
3. **Verify production**:
   - Visit `/trends/MLA/enriched` (first user waits)
   - Check Network tab: `X-Cache-Status: MISS`
   - Refresh page (should be instant)
   - Check Network tab: `X-Cache-Status: HIT`
4. **Monitor**:
   - Vercel KV dashboard for storage usage
   - Application logs for errors

## Expected Metrics

**Before** (current):
- Every user: 10-15 second load time
- Search API calls: ~100% of visits

**After** (with cache):
- 90%+ users: < 100ms load time
- 10% users: 10-15 second load time (cache miss)
- Search API calls: ~10% of visits (95% reduction)

## Rollback Plan

If issues arise:
1. Cache miss returns null → hook falls back to existing enrichment
2. Worst case: delete KV database → everything still works (just slower)
3. Code rollback: Revert commits, redeploy

---

## Notes for Future Maintenance

### Cache Invalidation
Current: TTL-based (1 hour automatic expiration)

If manual invalidation needed:
```typescript
// Clear specific country cache
await kv.del('enriched_trends:MLA');

// Clear all enriched trends
const keys = await kv.keys('enriched_trends:*');
await Promise.all(keys.map(key => kv.del(key)));
```

### Monitoring Cache Hit Rate
Add logging to GET handler:
```typescript
console.log(`Cache ${cached ? 'HIT' : 'MISS'} for ${country}`);
```

Track in Vercel Analytics or external monitoring.

### Adjusting TTL
Modify `CACHE_TTL_SECONDS` constant in `route.ts`. Remember to update TanStack Query `staleTime` to match.

---

**End of Implementation Plan**
