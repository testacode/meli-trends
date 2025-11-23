# Logging System Design

**Date**: 2025-11-23
**Status**: Approved
**Library**: Consola
**Target**: Development-only logging with NewRelic-style formatting

## Overview

This design implements a comprehensive logging system for the MeLi Trends Next.js application using Consola. The system provides beautiful, colored console output during development while remaining completely silent in production and test environments.

## Goals

- **Development-focused**: Rich, visual logs for debugging during local development
- **Minimal logging**: Only critical path events (errors, API calls, enrichment operations)
- **NewRelic-style format**: Professional timestamp and tag formatting (`YYYY-MM-DD HH:mm:ss [TAG]`)
- **Edge Runtime compatible**: Works in Edge Runtime, Node.js runtime, and browser
- **Zero production overhead**: Completely disabled in production (tree-shaken no-op)
- **Test-friendly**: Auto-silent in test environment (no console noise)

## Technology Choice

**Consola** was selected over alternatives (Pino, Winston, custom solution) because:

- ✅ **Edge Runtime compatible**: Unlike Pino/Winston which require Node.js streams
- ✅ **Beautiful formatting**: Built-in colored output with icons and timestamps
- ✅ **Lightweight**: ~8KB bundle size
- ✅ **Universal**: Works in browser, Node.js, and Edge Runtime
- ✅ **Popular**: Used by Nuxt and UnJS ecosystem

**Rejected alternatives:**
- **Pino**: Excellent performance but requires Node.js runtime (no Edge support)
- **Winston**: Feature-rich but heavy (~40KB+) and Node.js only
- **Custom solution**: Requires maintaining ANSI color codes and timestamp formatting ourselves

## Architecture

### File Structure

```
lib/
  logger/
    index.ts          # Logger factory, Consola configuration, no-op fallback
    types.ts          # TypeScript types (LogContext, TimerResult, LogMetadata)
    utils.ts          # startTimer(), formatDuration(), sanitize helpers
```

### Core Components

#### 1. Logger Factory (`createLogger`)

**Signature:**
```typescript
function createLogger(tag: string): Logger
```

**Behavior:**
- Checks `NODE_ENV`:
  - `production` or `test` → Returns no-op logger (empty functions)
  - `development` → Returns configured Consola instance
- Configures Consola with:
  - Custom reporter for timestamp formatting
  - Tag-based color coding
  - Log level 3 (info, warn, error only - no debug/trace)

**Usage:**
```typescript
const logger = createLogger('API:token');
logger.info('Token cache miss, fetching new token');
// Output: [2025-11-23 14:30:45] ℹ [API:token] Token cache miss, fetching new token
```

#### 2. Timing Utilities

**Timer API:**
```typescript
const timer = startTimer();
// ... perform operation ...
logger.info('Operation completed', timer.end());
// Output: [2025-11-23 14:30:45] ℹ [TAG] Operation completed (245ms)
```

**Implementation:**
- `startTimer()`: Returns object with `end()` method
- Uses `Date.now()` for simple millisecond arithmetic (not dayjs - overkill for duration)
- Formats as:
  - `< 1000ms`: Show milliseconds (`245ms`, `850ms`)
  - `>= 1000ms`: Show seconds with decimals (`1.2s`, `3.5s`)

**Timestamp Formatting:**
- Uses **dayjs** (already installed) for log timestamps
- Format: `YYYY-MM-DD HH:mm:ss`
- Example: `2025-11-23 14:30:45`

#### 3. Type Definitions

**`types.ts`:**
```typescript
export type LogContext =
  | `API:${string}`     // API routes
  | `Hook:${string}`    // React hooks
  | `External:${string}`; // External API calls

export type TimerResult = {
  duration: number;
  formatted: string; // "245ms" or "1.2s"
};

export type Logger = {
  info: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
  error: (message: string, error?: Error, meta?: Record<string, any>) => void;
  success: (message: string, meta?: Record<string, any>) => void;
};
```

## Visual Formatting

### Log Output Format

```
[YYYY-MM-DD HH:mm:ss] <icon> [TAG] Message (duration)
```

**Examples:**
```
[2025-11-23 14:30:45] ℹ [API:token] Token fetched successfully (125ms)
[2025-11-23 14:30:47] ⚠ [Hook:useClientEnrichedTrends] Batch 2/10 enriched (1.2s)
[2025-11-23 14:30:48] ✔ [External:SearchAPI] Search completed: 15 products (342ms)
[2025-11-23 14:30:49] ✖ [API:trends] Failed to fetch trends (Error: 429 Rate Limited)
```

### Color Scheme

Context-based colors for visual separation:

| Context | Tag Pattern | Color | Use Case |
|---------|-------------|-------|----------|
| API Routes | `API:*` | Cyan/Blue | Server-side route handlers |
| Hooks | `Hook:*` | Green | Client-side React operations |
| External APIs | `External:*` | Yellow | Third-party API calls |
| Errors | (any) | Red | Error messages and traces |
| Warnings | (any) | Yellow/Orange | Warning messages |
| Success/Info | (any) | Default (white/gray) | General information |

### Log Level Icons

Consola provides these automatically:
- `ℹ` Info (gray)
- `✔` Success (green)
- `⚠` Warning (yellow)
- `✖` Error (red)

## Integration Points

### What Gets Logged (Minimal/Critical Path Only)

#### API Routes (`app/api/**/route.ts`)

**Logger tag pattern**: `API:<endpoint>` (e.g., `API:token`, `API:trends`)

**Log these events:**
- Route entry: Request method + path
- Token operations: Cache hit/miss, fetch success/failure
- External API calls: Before/after with status codes
- Errors: Full error context with stack trace
- Route exit: Success with status code and total duration

**Example:**
```typescript
// app/api/token/route.ts
const logger = createLogger('API:token');

export async function GET() {
  const timer = startTimer();

  const cachedToken = await kv.get<string>('meli_access_token');
  if (cachedToken) {
    logger.info('Token cache hit', timer.end());
    return NextResponse.json({ access_token: cachedToken });
  }

  logger.info('Token cache miss, fetching new token');

  try {
    const response = await fetch(/* ... */);
    logger.success('Token fetched successfully', timer.end());
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Token fetch failed', error, timer.end());
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}
```

#### Client-Side Hooks (`hooks/*.ts`)

**Logger tag pattern**: `Hook:<hookName>` (e.g., `Hook:useClientEnrichedTrends`)

**Log these events:**
- Enrichment batch start/completion with progress
- Single enrichment operations (on-demand)
- Errors only (no routine state changes or renders)

**Example:**
```typescript
// hooks/useClientEnrichedTrends.ts
const logger = createLogger('Hook:useClientEnrichedTrends');

const enrichBatch = async (batch: TrendItem[], batchIndex: number) => {
  const timer = startTimer();
  logger.info(`Enriching batch ${batchIndex + 1}/${totalBatches}`);

  try {
    const results = await Promise.all(/* ... */);
    logger.success(
      `Batch ${batchIndex + 1}/${totalBatches} enriched: ${results.length} trends`,
      timer.end()
    );
  } catch (error) {
    logger.error(`Batch ${batchIndex + 1} failed`, error, timer.end());
  }
};
```

#### External API Calls (`lib/searchAPI.ts`)

**Logger tag pattern**: `External:<apiName>` (e.g., `External:SearchAPI`)

**Log these events:**
- Keyword variant attempts (when exact match fails)
- Search API response status + product count
- Rate limiting errors (429 responses)
- CloudFront blocking errors (403 with x-cache header)

**Example:**
```typescript
// lib/searchAPI.ts
const logger = createLogger('External:SearchAPI');

export async function fetchSearchDirect(keyword: string, siteId: SiteId) {
  const timer = startTimer();
  const variants = getKeywordVariants(keyword);

  for (const variant of variants) {
    logger.info(`Trying keyword variant: "${variant}"`);

    const response = await fetch(/* ... */);

    if (response.status === 429) {
      logger.warn('Rate limited (429), retrying with delay');
      continue;
    }

    if (response.status === 403) {
      logger.error('CloudFront blocking detected (403)', { headers: response.headers });
      continue;
    }

    const data = await response.json();
    logger.success(
      `Search completed: ${data.results.length} products (variant: "${variant}")`,
      timer.end()
    );
    return data;
  }
}
```

### Error Logging Standards

All error logs must include:
- Error message and stack trace
- Request context (URL, method, params)
- Retry attempts or fallback strategy used
- Duration before failure

**Example:**
```typescript
logger.error('Failed to enrich trend', error, {
  keyword: trend.keyword,
  siteId: trend.site_id,
  variantsTried: ['exact', 'simplified', 'first-word'],
  duration: timer.end(),
});
```

## Security & Sensitive Data

### Never Log These

- `MELI_CLIENT_SECRET` (environment variable)
- `access_token` values
- Full URLs with query parameters containing tokens

### Safe to Log

- Token fetch success/failure (boolean)
- API response status codes
- Trend counts, product counts
- Error messages (sanitized)

### Sanitization Utility

Create `sanitizeUrl()` helper in `utils.ts`:
```typescript
function sanitizeUrl(url: string): string {
  const urlObj = new URL(url);
  return `${urlObj.origin}${urlObj.pathname}`; // Strip query params
}
```

**Usage:**
```typescript
logger.info(`Fetching: ${sanitizeUrl(apiUrl)}`);
// Output: Fetching: https://api.mercadolibre.com/sites/MLA/search
// NOT: Fetching: https://api.mercadolibre.com/sites/MLA/search?access_token=APP_USR-123...
```

## Environment Handling

### Development (NODE_ENV=development)

- Full Consola instance with colors, timestamps, icons
- All log levels enabled (info, warn, error, success)
- Outputs to console

### Production (NODE_ENV=production)

- No-op logger (all methods are empty functions)
- Zero runtime overhead (tree-shaken during build)
- No console output

### Test (NODE_ENV=test)

- No-op logger (same as production)
- Keeps test output clean
- No mocking needed - tests run without modification

## Error Handling & Fallbacks

### Consola Initialization Failure

If Consola fails to load (unlikely):
1. Catch initialization error
2. Fall back to basic `console.*` methods with simple tag prefixing
3. Log warning: "Consola failed to initialize, using console fallback"

**Fallback logger:**
```typescript
const fallbackLogger = {
  info: (msg: string) => console.log(`[INFO] [${tag}] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] [${tag}] ${msg}`),
  error: (msg: string, err?: Error) => console.error(`[ERROR] [${tag}] ${msg}`, err),
  success: (msg: string) => console.log(`[SUCCESS] [${tag}] ${msg}`),
};
```

### Cross-Environment Detection

Consola automatically detects and adapts to:
- **Browser**: Uses `console` with CSS color styles
- **Node.js**: Uses ANSI color codes in terminal
- **Edge Runtime**: Uses basic console (limited color support)

No manual configuration required.

## Performance Considerations

### Production

- **Zero cost**: No-op functions are tree-shaken during build
- **No imports**: Consola is not bundled in production builds

### Development

- **Minimal overhead**: Consola is async where possible
- **Lightweight timers**: Just `Date.now()` calls (no object creation)
- **No performance impact**: Logging doesn't block operations

### Bundle Size

- **Consola**: ~8KB (dev only, not in production bundle)
- **Logger utilities**: ~2KB (tree-shaken in production)
- **Production bundle increase**: 0 bytes

## Implementation Checklist

1. **Install dependencies**
   - [ ] `npm install consola`

2. **Create logger files**
   - [ ] `lib/logger/index.ts` - Logger factory and Consola config
   - [ ] `lib/logger/types.ts` - TypeScript types
   - [ ] `lib/logger/utils.ts` - Timer, formatter, sanitization helpers

3. **Integrate into codebase**
   - [ ] Add logging to `app/api/token/route.ts`
   - [ ] Add logging to `app/api/trends/[country]/route.ts`
   - [ ] Add logging to `hooks/useClientEnrichedTrends.ts`
   - [ ] Add logging to `hooks/useEnrichTrendOnDemand.ts`
   - [ ] Add logging to `lib/searchAPI.ts`

4. **Testing**
   - [ ] Verify logs appear in development (`npm run dev`)
   - [ ] Verify logs are silent in tests (`npm run test`)
   - [ ] Verify no console output in production build
   - [ ] Test timer duration formatting (<1s and >1s)
   - [ ] Test error logging with stack traces
   - [ ] Test color coding for different contexts

5. **Documentation**
   - [ ] Update CLAUDE.md with logging guidelines
   - [ ] Add examples to logger README (if needed)

## Migration Strategy

**Phase 1: Core Setup**
- Install Consola
- Create logger infrastructure (`lib/logger/*`)
- Write unit tests for timer and sanitization utilities

**Phase 2: Server-Side Integration**
- Add logging to API routes (`/api/token`, `/api/trends/[country]`)
- Test in development and production builds

**Phase 3: Client-Side Integration**
- Add logging to enrichment hooks
- Add logging to `lib/searchAPI.ts`
- Test in browser console

**Phase 4: Validation**
- Run full test suite (ensure no console noise)
- Build production and verify no logging code in bundle
- Review log output for readability and usefulness

## Success Criteria

- ✅ Clean, colored console output in development
- ✅ Zero console output in production and tests
- ✅ All critical path events logged (API calls, enrichment, errors)
- ✅ Timestamps in NewRelic-style format
- ✅ Visual separation between contexts (API, Hook, External)
- ✅ Duration tracking for all async operations
- ✅ No sensitive data in logs
- ✅ Works in Edge Runtime, Node.js runtime, and browser

## Future Enhancements (Out of Scope)

These are explicitly **not** part of this design:

- Production logging or log shipping to external services
- Structured JSON logging for log aggregation
- Per-module log level control
- Log rotation or persistence
- Performance profiling beyond basic timers
- Distributed tracing or correlation IDs

If needed later, we can revisit, but the current requirement is **development-only logging**.
