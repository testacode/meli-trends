# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Build & Production
npm run build        # Build for production (verifies TypeScript & linting)
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run check        # Run typecheck + lint + tests (pre-commit verification)

# Testing
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

### Environment Setup
Before running the app, copy `.env.example` to `.env.local` and configure:
```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_MELI_APP_ID` - MercadoLibre App ID (public)
- `MELI_CLIENT_SECRET` - MercadoLibre Client Secret (private, server-side only)
- `NEXT_PUBLIC_REDIRECT_URI` - OAuth redirect URI

## Architecture Overview

### Core Concept
MeLi Trends is a Next.js 16 App Router application that visualizes trending products from MercadoLibre's Trends API across 7 Latin American countries. The app features two main views:

1. **Basic Trends**: Shows keyword trends from MercadoLibre Trends API
2. **Enriched Trends**: Enhances trends with real product data, metrics, and opportunity scores from the Search API

### Critical Architectural Pattern: Search API Rate Limiting

**IMPORTANT**: The MercadoLibre Search API has aggressive CloudFront-based bot detection and rate limiting:

- **Issue**: Requests from server IP addresses get blocked with 403 errors (`x-cache: Error from cloudfront`)
- **Current Solution**: Browser-like headers + OAuth tokens (reduces but doesn't eliminate blocking)
- **Impact**: The `/api/trends/[country]/enriched` endpoint may fail during heavy testing

**Key Files**:
- `app/api/trends/[country]/enriched/route.ts` - Contains retry logic, keyword variants, and browser headers
- Lines 82-97: Headers configuration to avoid bot detection
- Lines 36-62: Keyword variant fallback system (tries simplified versions if exact keyword fails)

When modifying enriched trends:
1. Never remove browser-like headers (User-Agent, Referer, Accept-Language)
2. Keep OAuth token in Authorization header (helps with rate limits)
3. Maintain keyword variant fallback logic
4. Test with small datasets first to avoid IP blocking

### Authentication Architecture

**Server-Side Only OAuth Flow**:
1. Client never sees `MELI_CLIENT_SECRET` (environment variable)
2. `/api/token` endpoint handles OAuth token acquisition
3. Token is cached server-side for 5.5 hours (expires in 6 hours)
4. All API routes use this internal token endpoint

**Security Pattern**:
```typescript
// ✅ CORRECT: Token stays server-side
const tokenResponse = await fetch(`${origin}/api/token`);
const { access_token } = await tokenResponse.json();

// ❌ WRONG: Never expose CLIENT_SECRET to client
// Don't do this in client components
```

### Data Flow Pattern

**Basic Trends**:
```
Client → /api/trends/[country] → MercadoLibre Trends API → Response
```

**Enriched Trends** (complex multi-step flow):
```
Client → /api/trends/[country]/enriched
  ↓
  1. Check server-side cache (24h TTL)
  2. Get OAuth token from /api/token
  3. Fetch base trends from /api/trends/[country]
  4. For each trend keyword:
     - Try keyword variants (exact → simplified → first word)
     - Call Search API with browser headers + OAuth
     - Calculate metrics (price ranges, sold quantity, opportunity score)
     - Retry with fallbacks on 403 errors
  5. Process in batches (CONCURRENCY_LIMIT = 5)
  6. Filter trends with 0 results
  7. Cache and return
```

### Key Type Definitions

Located in `types/meli.ts`:

**Core Types**:
- `SiteId`: Country codes ('MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE')
- `TrendItem`: Basic trend from Trends API
- `EnrichedTrendItem`: Trend + products + metrics + opportunity_score
- `SearchResponse`: MercadoLibre Search API response structure

**Opportunity Score Calculation** (`app/api/trends/[country]/enriched/route.ts:194-245`):
- Composite score (0-100) based on:
  - Search volume (30%): Higher total results = more demand
  - Sold quantity (25%): Historical sales performance
  - Free shipping (20%): Shipping availability
  - Price range (15%): Price variation indicates market opportunity
  - Available stock (10%): Inventory levels

### State Management

**No Global State Library**: Uses React hooks + Next.js caching

**Client-Side Hooks**:
- `hooks/useTrends.ts`: Fetches basic trends
- `hooks/useEnrichedTrends.ts`: Fetches enriched trends (handles pagination, infinite scroll)

**Server-Side Caching**:
- Token cache: In-memory Map in `/api/token` (5.5 hour TTL)
- Enriched trends cache: In-memory Map in `/api/trends/[country]/enriched` (24 hour TTL)
- Basic trends: No server cache (relies on MercadoLibre's CDN)

### UI Component Structure

**Mantine UI 8 Components**:
- Theme configuration: `lib/mantine-theme.ts`
- Colors: Custom `meliBlue` and `meliYellow` palettes
- All components use Mantine's built-in dark/light mode switching

**Component Patterns**:
```
components/
├── layout/
│   └── Header.tsx        # Navigation + country selector + theme toggle
├── trends/
│   ├── TrendsList.tsx    # Basic trends grid
│   ├── TrendCard.tsx     # Basic trend card
│   └── EnrichedTrendCard.tsx  # Enriched trend with metrics
└── common/
    ├── LoadingSkeleton.tsx
    └── ErrorState.tsx
```

**Styling**: PostCSS with Mantine's preset (no Tailwind, no CSS modules)

## Common Development Scenarios

### Adding a New Country

1. Update `types/meli.ts`:
```typescript
export type SiteId = 'MLA' | 'MLB' | ... | 'NEW';
```

2. Update `utils/constants.ts`:
```typescript
export const COUNTRIES: Record<SiteId, Country> = {
  NEW: {
    id: 'NEW',
    name: 'Country Name',
    flag: '🇽🇽',
    currency: 'CUR',
  },
  // ...
};
```

3. Update `app/sitemap.ts` (auto-generates from COUNTRIES)

### Modifying Enriched Trends Logic

**Before editing** `app/api/trends/[country]/enriched/route.ts`:
1. Read the CloudFront blocking notes above
2. Test with small limits first (`?limit=2`)
3. Monitor CloudFront errors in logs

**Common modifications**:
- Opportunity score weights (lines 194-245)
- Keyword variant generation (lines 36-62)
- Concurrency limit (line 24: `CONCURRENCY_LIMIT`)
- Products per keyword (line 27: `PRODUCTS_PER_KEYWORD`)

### Testing Changes

**Test Flow**:
```bash
npm run check   # Runs typecheck + lint + tests
```

**Unit Tests**: Vitest with Testing Library
- Test files: `*.test.ts` or `*.test.tsx` next to source files
- Coverage: `npm run test:coverage`

**Manual Testing**:
1. Start dev server: `npm run dev`
2. Test basic trends: `http://localhost:3000/trends/MLA`
3. Test enriched trends: `http://localhost:3000/trends/MLA/enriched`
4. Check network tab for API responses
5. Monitor terminal for 403 errors from CloudFront

### Debugging 403 Errors

If seeing `x-cache: Error from cloudfront` errors:

1. **Check headers** in `app/api/trends/[country]/enriched/route.ts:82-97`
   - User-Agent must look like a real browser
   - Referer must be mercadolibre.com.ar
   - Authorization header with OAuth token

2. **Reduce request rate**:
   - Lower `CONCURRENCY_LIMIT` (line 24)
   - Add delays between batches

3. **Test with curl**:
```bash
curl -v "https://api.mercadolibre.com/sites/MLA/search?q=samsung&limit=3" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -H "Accept: application/json"
```

If curl also fails with 403 → IP is temporarily blocked (wait 30-60 minutes)

## Deployment Notes

**Vercel Deployment** (recommended):
1. Set environment variables in Vercel dashboard
2. Update `NEXT_PUBLIC_REDIRECT_URI` to production URL
3. Update OAuth redirect URI in MercadoLibre app settings

**Build Verification**:
```bash
npm run build   # Must pass before deploying
```

Build fails if:
- TypeScript errors exist
- ESLint errors exist (warnings allowed)
- Tests fail

## Important Files to Understand

**API Routes** (all server-side):
- `app/api/token/route.ts`: OAuth token management (server cache)
- `app/api/trends/[country]/route.ts`: Basic trends proxy
- `app/api/trends/[country]/enriched/route.ts`: Enriched trends with Search API (COMPLEX - read carefully)

**Configuration**:
- `lib/mantine-theme.ts`: UI theme and colors
- `utils/constants.ts`: Country definitions
- `types/meli.ts`: All TypeScript types

**Critical for Search API**:
- Lines 68-158 in `app/api/trends/[country]/enriched/route.ts`: Search API logic with fallbacks

## What NOT to Do

- Don't expose `MELI_CLIENT_SECRET` in client-side code
- Don't remove browser headers from Search API requests (causes 403s)
- Don't remove keyword variant fallback logic (many exact keywords return 0 results)
- Don't increase `CONCURRENCY_LIMIT` above 5 (triggers rate limiting)
- Don't skip `npm run check` before committing
- Don't use Tailwind CSS (this project uses Mantine + PostCSS)
- Don't use `interface` in TypeScript (project uses `type` exclusively)
