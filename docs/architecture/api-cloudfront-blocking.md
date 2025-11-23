# MercadoLibre API & CloudFront Blocking - Quick Reference

## The Problem

MercadoLibre's Search API uses **CloudFront with aggressive bot detection** that blocks requests from datacenter IPs (Vercel, AWS, etc.).

**Common Symptoms:**

- HTTP 403 Forbidden responses
- Response header: `x-cache: Error from cloudfront`
- Works locally, fails in production
- Multiple rapid requests trigger blocking

## The Solution: Client-Side API Calls

**Root Cause:** CloudFront blocks datacenter IPs, not end-user IPs.

**Fix:** Move Search API calls from server-side to client-side (browser).

```typescript
// ❌ Server-side (blocked by CloudFront)
// app/api/trends/[country]/enriched/route.ts - DELETED

// ✅ Client-side (uses end-user IPs)
// lib/searchAPI.ts
export async function fetchSearchDirect(siteId: SiteId, keyword: string) {
  const url = `https://api.mercadolibre.com/sites/${siteId}/search?q=${keyword}`;
  return fetch(url); // Direct browser request
}
```

**Security:** Safe because Search API is **public** (no authentication required).

## Best Practices

### ✅ DO

1. **Make Search API calls from browser** (`lib/searchAPI.ts`)
2. **Use keyword variant fallbacks** (many trends don't match exact keywords)
3. **Process in small batches with delays** (2 per batch, 1s delay)
4. **Filter 0-result trends** (check `data.paging.total > 0`)
5. **Don't retry 403 errors** (won't help, see `QueryProvider.tsx`)

### ❌ DON'T

1. **Don't call Search API from server routes** (datacenter IPs get blocked)
2. **Don't use exact keywords without variants** (causes 0-result issues)
3. **Don't exceed 5 concurrent requests** (triggers rate limiting)
4. **Don't skip delays between batches** (minimum 1000ms)

## Key Patterns

### Pattern 1: Keyword Variants Fallback

Many trending keywords don't match Search API exactly. Try progressively simpler variants.

```typescript
// "samsung galaxy s24 ultra" → "samsung galaxy s24" → "samsung galaxy" → "samsung"
function getKeywordVariants(keyword: string): string[] {
  const words = keyword.toLowerCase().split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !['de', 'la', 'el', 'con', 'para'].includes(w));

  return [
    keyword,                              // Exact
    words.slice(0, 3).join(' '),         // First 3 words
    words.slice(0, 2).join(' '),         // First 2 words
    words[0]                              // First word only
  ];
}
```

**Location:** `lib/searchAPI.ts:15-35`

### Pattern 2: Progressive Batching

Load and enrich trends in small batches with UI updates between batches.

```typescript
const BATCH_SIZE = 2;
const BATCH_DELAY_MS = 1000;

for (let i = 0; i < trends.length; i += BATCH_SIZE) {
  const batch = trends.slice(i, i + BATCH_SIZE);

  const results = await Promise.all(
    batch.map(trend => fetchSearchDirect(siteId, trend.keyword))
  );

  setEnrichedTrends(prev => [...prev, ...results]); // Update UI progressively

  if (i + BATCH_SIZE < trends.length) {
    await sleep(BATCH_DELAY_MS); // Space out requests
  }
}
```

**Location:** `hooks/useClientEnrichedTrends.ts:208-252`

### Pattern 3: On-Demand Enrichment

Let users control when to fetch detailed data (prevents burst API calls).

```typescript
const { state, enrich } = useEnrichTrendOnDemand(siteId, trend);

// Show "+" button when idle
<ActionIcon onClick={enrich} loading={state.status === 'loading'}>
  <IconPlus />
</ActionIcon>

// Show metrics when enriched
{state.status === 'success' && <MetricsDisplay data={state.data} />}
```

**Location:** `hooks/useEnrichTrendOnDemand.ts`, `components/trends/EnrichedTrendCard.tsx`

## Implementation Timeline

- **Phase 1:** Server-side with OAuth → 403 errors ❌
- **Phase 2:** Added browser headers → Still blocked ❌
- **Phase 3:** Reduced concurrency (5→3) → Partial improvement ⚠️
- **Phase 4:** Keyword variants → Fixed 0-results issue ✅
- **Phase 5:** Client-side migration → Complete solution ✅

**Breaking change commit:** `e33cbbe` - Removed `/api/trends/[country]/enriched` endpoint

## Additional Resources

**MercadoLibre API:**

- [MercadoLibre API Essentials](https://rollout.com/integration-guides/mercado-libre/api-essentials)
- [MercadoLibre Developers API Guide](https://api2cart.com/api-technology/mercadolibre-developers-api/)
- Official: [developers.mercadolibre.com](https://developers.mercadolibre.com.ar)

**CloudFront & Bot Detection:**

- [How to Bypass Cloudflare (ZenRows)](https://www.zenrows.com/blog/bypass-cloudflare)
- [AWS CloudFront Bot Control](https://aws.amazon.com/blogs/networking-and-content-delivery/how-to-optimize-content-for-search-engines-with-aws-waf-bot-control-and-amazon-cloudfront/)
- [Vercel Rate Limiting Guide](https://vercel.com/guides/add-rate-limiting-vercel)

**API Rate Limiting Best Practices:**

- [10 Best Practices for API Rate Limiting (2025)](https://zuplo.com/learning-center/10-best-practices-for-api-rate-limiting-in-2025)
- [Vercel WAF IP Blocking](https://vercel.com/docs/vercel-firewall/vercel-waf/ip-blocking)
