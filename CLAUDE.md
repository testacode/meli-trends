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

### Critical Architectural Pattern: Client-Side Search API Calls

**IMPORTANT**: The MercadoLibre Search API uses CloudFront with aggressive bot detection that blocks datacenter IPs (Vercel, AWS).

- **Problem**: Server-side requests from datacenter IPs get 403 errors (`x-cache: Error from cloudfront`)
- **Solution**: Client-side API calls using end-user IPs (bypasses CloudFront blocking completely)
- **Implementation**: Direct browser→API calls via `lib/searchAPI.ts`

**Key Files**:
- `lib/searchAPI.ts` - Client-side Search API with keyword variant fallbacks
- `hooks/useClientEnrichedTrends.ts` - Progressive batching for multiple trends
- `hooks/useEnrichTrendOnDemand.ts` - On-demand single trend enrichment
- `docs/architecture/api-cloudfront-blocking.md` - Comprehensive CloudFront blocking guide

**Keyword Variant System** (`lib/searchAPI.ts:15-35`):
- Many trend keywords don't match Search API exactly
- System tries progressively simpler variants: exact → simplified → first word
- Example: "samsung galaxy s24 ultra" → "samsung galaxy s24" → "samsung galaxy" → "samsung"

When modifying enriched trends:
1. Keep keyword variant fallback logic (prevents 0-result issues)
2. Maintain batching delays (prevents rate limiting even client-side)
3. Use client-side API calls only (never server-side for Search API)
4. Refer to `/docs/architecture/api-cloudfront-blocking.md` for patterns

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

**Enriched Trends** (client-side multi-step flow):

**Option 1: Progressive Batching** (`useClientEnrichedTrends`):
```
Client → /api/trends/[country] (fetch basic keywords only)
  ↓
Browser → useClientEnrichedTrends hook
  ↓
  1. Fetch basic trends list (keywords only)
  2. For each trend in batches of 2:
     - Call lib/searchAPI.ts → fetchSearchDirect()
     - Try keyword variants (exact → simplified → first word)
     - Calculate metrics (prices, sold quantity, opportunity score)
     - Update UI progressively after each batch
  3. Delay 1s between batches (prevents rate limiting)
  4. Filter trends with 0 results
  5. Display enriched cards with all metrics
```

**Option 2: On-Demand** (`useEnrichTrendOnDemand`):
```
Client → /api/trends/[country] (fetch basic keywords)
  ↓
Browser → Display cards with "+" button
  ↓
User clicks "+" → useEnrichTrendOnDemand hook
  ↓
  1. Single Search API call for that trend
  2. Try keyword variants if needed
  3. Calculate metrics
  4. Expand card with enriched data
```

### Key Type Definitions

Located in `types/meli.ts`:

**Core Types**:
- `SiteId`: Country codes ('MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE')
- `TrendItem`: Basic trend from Trends API
- `EnrichedTrendItem`: Trend + products + metrics + opportunity_score
- `SearchResponse`: MercadoLibre Search API response structure

**Opportunity Score Calculation** (`hooks/useClientEnrichedTrends.ts` and `hooks/useEnrichTrendOnDemand.ts`):
- Function: `calculateMetrics()`
- Composite score (0-100) based on:
  - Search volume (30%): Higher total results = more demand
  - Sold quantity (25%): Historical sales performance
  - Free shipping (20%): Shipping availability
  - Price range (15%): Price variation indicates market opportunity
  - Available stock (10%): Inventory levels

### State Management

**No Global State Library**: Uses React hooks + Next.js caching

**Client-Side Hooks**:
- `hooks/useTrends.ts`: Fetches basic trends (keywords only)
- `hooks/useClientEnrichedTrends.ts`: Progressive batching enrichment (client-side)
- `hooks/useEnrichTrendOnDemand.ts`: On-demand single trend enrichment
- `hooks/useEnrichedTrends.ts`: Legacy server-side enrichment (deprecated, kept for reference)

**Client-Side API Layer**:
- `lib/searchAPI.ts`: Direct browser→Search API calls with keyword variant fallbacks

**Server-Side Caching**:
- Token cache: In-memory Map in `/api/token` (5.5 hour TTL)
- Basic trends: No cache (relies on MercadoLibre's CDN)
- Note: Enriched trends are NO LONGER cached server-side (client-side only)

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

**Key Files to Edit**:
- `lib/searchAPI.ts`: Keyword variant generation and Search API calls
- `hooks/useClientEnrichedTrends.ts`: Progressive batching logic and opportunity score
- `hooks/useEnrichTrendOnDemand.ts`: On-demand enrichment logic

**Before editing**:
1. Read `/docs/architecture/api-cloudfront-blocking.md` for CloudFront patterns
2. Test with small datasets first
3. Remember: All Search API calls MUST be client-side (never server-side)

**Common modifications**:
- **Keyword variants**: `lib/searchAPI.ts` → `getKeywordVariants()` function
- **Opportunity score weights**: Hooks → `calculateMetrics()` function
- **Batch size**: `hooks/useClientEnrichedTrends.ts` → `BATCH_SIZE` constant (default: 2)
- **Batch delay**: `hooks/useClientEnrichedTrends.ts` → `BATCH_DELAY_MS` constant (default: 1000ms)
- **Products per keyword**: `PRODUCTS_PER_KEYWORD` constant in hooks (default: 3)

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

### CloudFront 403 Errors (Historical Context)

**Note**: This issue is RESOLVED by using client-side API calls. This section is kept for reference.

The previous server-side implementation suffered from CloudFront blocking (`x-cache: Error from cloudfront`). This was completely solved by migrating to client-side Search API calls.

**Current Architecture** (no 403 errors):
- ✅ Browser makes Search API calls using end-user IPs
- ✅ CloudFront doesn't block residential IPs
- ✅ No special headers needed (browser provides them)

**If you ever see 403 errors** (very unlikely with current architecture):
1. Verify Search API calls are client-side (check `lib/searchAPI.ts` is being used)
2. Check you're not accidentally making server-side Search API calls
3. Refer to `/docs/architecture/api-cloudfront-blocking.md` for troubleshooting

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

**API Routes** (server-side only):
- `app/api/token/route.ts`: OAuth token management for Trends API (server cache)
- `app/api/trends/[country]/route.ts`: Basic trends proxy (requires OAuth)

**Client-Side Search API** (CRITICAL - this is where enrichment happens):
- `lib/searchAPI.ts`: Direct browser→Search API calls with keyword variant fallbacks
- `hooks/useClientEnrichedTrends.ts`: Progressive batching enrichment (batch of 2, 1s delay)
- `hooks/useEnrichTrendOnDemand.ts`: On-demand single trend enrichment (user-triggered)
- `hooks/useTrends.ts`: Basic trends fetching (keywords only)

**Configuration**:
- `lib/mantine-theme.ts`: UI theme and colors
- `utils/constants.ts`: Country definitions
- `types/meli.ts`: All TypeScript types

**Documentation**:
- `docs/architecture/api-cloudfront-blocking.md`: CloudFront blocking patterns and solutions
- `CLAUDE.md`: This file - development guide

## What NOT to Do

- ❌ Don't expose `MELI_CLIENT_SECRET` in client-side code
- ❌ Don't make Search API calls from server-side routes (causes CloudFront 403 blocking)
- ❌ Don't remove keyword variant fallback logic (many exact keywords return 0 results)
- ❌ Don't increase batch size above 2-3 or remove delays (triggers rate limiting)
- ❌ Don't skip `npm run check` before committing
- ❌ Don't use Tailwind CSS (this project uses Mantine + PostCSS)
- ❌ Don't use `interface` in TypeScript (project uses `type` exclusively)
- ❌ Don't cache enriched trends server-side (defeats purpose of client-side approach)
