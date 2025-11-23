# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start (3-Minute Read)

### What Is This Project?

MeLi Trends visualizes trending products from MercadoLibre's Trends API across 7 Latin American countries (Argentina, Brazil, Chile, Mexico, Colombia, Uruguay, Peru). Two main views:

1. **Basic Trends**: Keyword trends only ✅ **WORKING**
2. **Enriched Trends**: Keywords + real product data + metrics + opportunity scores ⚠️ **TEMPORARILY UNAVAILABLE**

### ⚠️ CRITICAL STATUS UPDATE (November 2025)

**Search API is currently blocked by MercadoLibre's CloudFront (403 errors)**

- **Working**: Basic trends (Trends API)
- **Broken**: Enriched trends (Search API)
- **Cause**: CloudFront IP-based blocking, likely requires certified integrator status
- **Details**: See `/docs/architecture/search-api-403-investigation-2025-11.md`
- **Action**: Contact MercadoLibre support to request certified integrator status and IP whitelisting

### Essential Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run check        # Pre-commit verification (typecheck + lint + tests)
npm run build        # Production build
```

### Critical Architecture Rules

**MUST follow these** (violations cause production failures):

1. **Search API calls = client-side only** (server-side gets CloudFront 403)

   - Use: `lib/searchAPI.ts` in browser
   - Never: Server-side routes for Search API

2. **Client Secret = server-side only**

   - Never expose `MELI_CLIENT_SECRET` to client

3. **Batching limits**: Max 2-3 trends per batch, 1000ms+ delay (rate limiting)

4. **Keyword variants required**: Exact match often fails, use fallbacks

### Key Files by Task

- **Add country**: `types/meli.ts` → `utils/constants.ts` → `app/sitemap.ts`
- **Add translation**: `locales/es.json`, `locales/en.json`, `locales/pt-BR.json`
- **Add new page**: Create under `app/[locale]/` (not `app/` directly)
- **Fix trends fetch**: `hooks/useTrends.ts` → `lib/searchAPI.ts`
- **Adjust metrics**: `hooks/useClientEnrichedTrends.ts` or `hooks/useEnrichTrendOnDemand.ts` → `calculateMetrics()`
- **Overview page customization**: `app/[locale]/trends/[country]/overview/page.tsx` → `components/trends/CategoryColumn.tsx`
- **OAuth/tokens**: `app/api/token/route.ts`

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Mantine 8 (no Tailwind)
- **i18n**: next-intl (ES, EN, PT-BR)
- **Testing**: Vitest + Testing Library
- **TypeScript**: Use `type`, not `interface`
- **APIs**: MercadoLibre Trends API (server-side OAuth) + Search API (client-side direct calls)

---

## 📚 LLM-Optimized Documentation

This project includes comprehensive documentation optimized for AI assistants (LLMs) following the `llms.txt` convention.

### Main Documentation Files

**Start here:** [`/llms.txt`](llms.txt) - Main index (~200 lines, ~500 tokens)

This file provides:
- Quick project overview
- Navigation guide to specific topics
- Critical architecture rules
- Common patterns (copy-paste ready)
- Quick reference for types, hooks, and utilities

**Complete reference:** [`/docs/llms/meli-trends.txt`](docs/llms/meli-trends.txt) (~1500 lines, ~4000 tokens)

Contains detailed documentation for:
- All React components with usage examples
- All React hooks with signatures and examples
- API endpoints with request/response examples
- TypeScript type definitions
- Utilities & constants
- Common code examples
- Troubleshooting guides

**External reference:** [`/docs/llms/external/mantine/mantine.txt`](docs/llms/external/mantine/mantine.txt) (79k lines)
- Complete Mantine UI library documentation
- Use when user asks about Mantine components

### How to Use This Documentation

**Token-efficient approach (recommended):**

1. Read `/llms.txt` first (~500 tokens) to understand structure
2. Identify relevant section based on user question
3. Read only that section from complete docs (~250-500 tokens)
4. **Total: ~750-1000 tokens** (75% savings vs reading everything)

**Example workflows:**

```
User asks about components
→ Read /llms.txt (500 tokens)
→ Search "CORE COMPONENTS" in complete docs (300 tokens)
→ Total: 800 tokens ✅

User asks about hooks
→ Read /llms.txt (500 tokens)
→ Search "REACT HOOKS" in complete docs (250 tokens)
→ Total: 750 tokens ✅

User needs comprehensive overview
→ Read /docs/llms/meli-trends.txt (4000 tokens)
→ Total: 4000 tokens (acceptable for overview) ✅
```

### When to Use Each File

| Scenario | File to Read | Tokens |
|----------|-------------|--------|
| Quick component lookup | `/llms.txt` → "Quick Reference" | ~500 |
| Detailed component docs | Complete docs → "CORE COMPONENTS" | ~800 |
| Hook implementation | Complete docs → "REACT HOOKS" | ~750 |
| API endpoint details | Complete docs → "API ENDPOINTS" | ~900 |
| Code examples | Complete docs → "COMMON CODE EXAMPLES" | ~1000 |
| Troubleshooting | Complete docs → "TROUBLESHOOTING" | ~800 |
| Mantine UI components | `/docs/llms/external/mantine/mantine.txt` | Variable |
| Complete overview | Complete docs (all sections) | ~4000 |

### Documentation Principles

- **Token efficiency:** Minimize token consumption through indexing
- **Completeness:** Comprehensive examples with copy-paste ready code
- **Discoverability:** Clear navigation and search guides
- **Up-to-date:** Synchronized with codebase changes

**For more details:** See [`/docs/llms/README.md`](docs/llms/README.md)

---

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

### CLI Tools Available

This project can be managed using the following CLI tools:

**GitHub CLI (`gh`)**:

```bash
# Manage pull requests
gh pr create                 # Create a new PR
gh pr list                   # List PRs
gh pr view [number]          # View PR details
gh pr merge [number]         # Merge a PR

# Manage issues
gh issue create              # Create an issue
gh issue list                # List issues
gh issue view [number]       # View issue details

# Repository management
gh repo view                 # View repo details
gh workflow list             # List GitHub Actions workflows
gh run list                  # List workflow runs
```

**Vercel CLI (`vercel`)**:

```bash
# Project management
vercel login                 # Authenticate with Vercel
vercel link                  # Link local project to Vercel
vercel                       # Deploy to preview
vercel --prod                # Deploy to production

# Environment variables
vercel env ls                # List environment variables
vercel env add [name]        # Add environment variable
vercel env pull              # Download env vars to .env.local
vercel env rm [name]         # Remove environment variable

# Project info
vercel ls                    # List deployments
vercel logs                  # View deployment logs
vercel inspect               # Get project details

# Domain management
vercel domains ls            # List domains
vercel domains add [domain]  # Add domain
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

### Logging System

The application uses Consola for development logging. Logs are automatically disabled in production and test environments.

**Logger usage:**

```typescript
import { createLogger, startTimer } from "@/lib/logger";

const logger = createLogger("API:myroute");

export async function GET() {
  const timer = startTimer();

  logger.info("Starting operation");

  try {
    // ... do work ...
    logger.success("Operation completed", timer.end());
  } catch (error) {
    logger.error("Operation failed", error, timer.end());
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

## Architecture Overview

### Terminology

To avoid confusion, here's how key terms are used throughout this codebase:

**Trends Types**:

- **Basic Trends**: Keyword list only, fetched from MercadoLibre Trends API (no product data)
- **Enriched Trends**: Keywords + real product data + calculated metrics + opportunity scores

**Enrichment Process**:

- **Enrichment**: The process of taking basic trend keywords and adding product data, prices, sold quantities, and calculated opportunity scores
- **Enrichment Hooks**: Client-side React hooks that perform enrichment
  - `useClientEnrichedTrends`: Progressive batching (enriches full list in batches of 2)
  - `useEnrichTrendOnDemand`: On-demand enrichment (single item on user click)

**Data Structures** (in `types/meli.ts`):

- `TrendItem`: Basic trend from Trends API (keyword + metadata)
- `EnrichedTrendItem`: Trend + products[] + metrics + opportunity_score
- `SearchResponse`: Raw MercadoLibre Search API response

### Core Concept

MeLi Trends is a Next.js 16 App Router application that visualizes trending products from MercadoLibre's Trends API across 7 Latin American countries. The app features:

**Main Views**:
1. **Basic Trends** (`/[locale]/trends/[country]`): Shows keyword trends only
2. **Overview** (`/[locale]/trends/[country]/overview`): Organized view by trend type (Fastest-Growing, Most Wanted, Most Popular)
3. **Enriched Trends** (`/[locale]/trends/[country]/enriched`): Keywords + real product data + metrics + opportunity scores ⚠️ _Currently unavailable_

**Internationalization**: Supports 3 languages (Spanish, English, Portuguese-BR) via next-intl with locale-based routing (`/es`, `/en`, `/pt-BR`)

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
- **Note**: Keep variant fallback logic when modifying (prevents 0-result issues)

**For more details**: See `/docs/architecture/api-cloudfront-blocking.md`

### Authentication Architecture

**Server-Side Only OAuth Flow**:

1. Client never sees `MELI_CLIENT_SECRET` (environment variable)
2. `/api/token` endpoint handles OAuth token acquisition
3. Token is cached server-side for 5.5 hours (expires in 6 hours)
4. All API routes use this internal token endpoint

**Security Pattern**:

```typescript
// CORRECT: Token stays server-side
const tokenResponse = await fetch(`${origin}/api/token`);
const { access_token } = await tokenResponse.json();

// WRONG: Never expose CLIENT_SECRET to client
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
│   └── Header.tsx        # Navigation + country selector + language selector + theme toggle + settings menu
├── trends/
│   ├── TrendsList.tsx    # Basic trends grid
│   ├── TrendCard.tsx     # Basic trend card
│   ├── EnrichedTrendCard.tsx  # Enriched trend with metrics
│   ├── CategoryColumn.tsx     # Overview page column by trend type
│   └── CategoryDistributionChart.tsx  # Category distribution visualization
└── common/
    ├── LoadingSkeleton.tsx    # Basic loading skeleton
    ├── ListSkeleton.tsx       # List view loading skeleton with smooth transitions
    ├── OverviewSkeleton.tsx   # Overview page loading skeleton
    └── ErrorState.tsx         # Error display component
```

**Styling**: PostCSS with Mantine's preset (no Tailwind, no CSS modules)

### Key Constants Reference

These constants control critical system behavior. Modify with caution and test thoroughly.

**Batching & Rate Limiting**:

- `BATCH_SIZE`: `2` trends per batch (in `hooks/useClientEnrichedTrends.ts`)

  - **Why**: Empirically determined rate limiting threshold - higher values trigger API blocks
  - **Location**: `hooks/useClientEnrichedTrends.ts:12`

- `BATCH_DELAY_MS`: `1000` milliseconds between batches
  - **Why**: Prevents rate limiting even with client-side calls; tested to be safe minimum
  - **Location**: `hooks/useClientEnrichedTrends.ts:13`

**Data Fetching**:

- `PRODUCTS_PER_KEYWORD`: `3` products per search (default in hooks)
  - **Why**: Balance between data richness and API performance
  - **Location**: Both enrichment hooks (useClientEnrichedTrends, useEnrichTrendOnDemand)

**Opportunity Score Weights** (in `calculateMetrics()` function):

- **Search Volume**: 30% - Higher total results = more demand
- **Sold Quantity**: 25% - Historical sales performance indicator
- **Free Shipping**: 20% - Shipping availability affects conversion
- **Price Range**: 15% - Price variation indicates market opportunity
- **Available Stock**: 10% - Current inventory levels

**OAuth Token Caching**:

- **Cache TTL**: 5.5 hours (token expires in 6 hours)
- **Location**: `app/api/token/route.ts` (in-memory Map)

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
    id: "NEW",
    name: "Country Name",
    flag: "🇽🇽",
    currency: "CUR",
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

## Important Files by Task Domain

Files are organized by the task domain they relate to. Use this as a quick reference when working on specific features.

### OAuth & Authentication

- `app/api/token/route.ts`
  - **Purpose**: Server-side OAuth token management for Trends API
  - **Key feature**: In-memory token cache (5.5 hour TTL)
  - **Used by**: All API routes requiring MercadoLibre authentication

### Basic Trends (Keywords Only)

- `app/api/trends/[country]/route.ts`

  - **Purpose**: Server-side proxy for MercadoLibre Trends API
  - **Returns**: Basic trend keywords without product data
  - **Auth**: Uses `/api/token` endpoint

- `hooks/useTrends.ts`
  - **Purpose**: Client-side hook for fetching and managing basic trends
  - **Returns**: `TrendItem[]` (keywords + metadata)

### Enriched Trends (Client-Side Enrichment)

**CRITICAL**: All Search API calls must be client-side to avoid CloudFront blocking.

- `lib/searchAPI.ts`

  - **Purpose**: Direct browser → Search API calls with keyword variant fallbacks
  - **Key feature**: Progressive keyword simplification for 0-result prevention
  - **Functions**: `fetchSearchDirect()`, `getKeywordVariants()`

- `hooks/useClientEnrichedTrends.ts`

  - **Purpose**: Progressive batching enrichment (enriches full list)
  - **Batching**: 2 trends per batch, 1000ms delay
  - **Returns**: `EnrichedTrendItem[]` with products, metrics, opportunity scores
  - **Contains**: `calculateMetrics()` function for opportunity score calculation

- `hooks/useEnrichTrendOnDemand.ts`
  - **Purpose**: On-demand single trend enrichment (user-triggered via "+" button)
  - **Use case**: Lazy loading individual trends
  - **Contains**: Same `calculateMetrics()` logic as batch hook

### Internationalization (i18n)

- `i18n/config.ts`

  - **Purpose**: next-intl configuration
  - **Locales**: ES (Spanish), EN (English), PT-BR (Portuguese-BR)
  - **Default locale**: ES

- `i18n/navigation.ts`

  - **Purpose**: Locale-aware navigation utilities
  - **Exports**: `Link`, `redirect`, `usePathname`, `useRouter`

- `i18n/request.ts`

  - **Purpose**: Server-side locale detection and setup
  - **Used by**: App layout and middleware

- `locales/[locale].json`

  - **Purpose**: Translation files for each supported language
  - **Files**: `es.json`, `en.json`, `pt-BR.json`
  - **Format**: Nested JSON with translation keys

- `proxy.ts`
  - **Purpose**: Next.js 16 proxy setup for locale routing
  - **Migration**: Replaces deprecated middleware convention

### Type Definitions & Configuration

- `types/meli.ts`

  - **Purpose**: All TypeScript types for the application
  - **Key types**: `SiteId`, `TrendItem`, `EnrichedTrendItem`, `SearchResponse`, `Country`

- `utils/constants.ts`

  - **Purpose**: Country definitions and site configurations
  - **Exports**: `COUNTRIES` object (Record<SiteId, Country>)

- `lib/mantine-theme.ts`

  - **Purpose**: Mantine UI theme configuration
  - **Custom colors**: `meliBlue`, `meliYellow` palettes

- `lib/transitions.ts`
  - **Purpose**: Reusable Mantine transition configurations
  - **Exports**: `fadeSlide` transition for smooth animations

### UI Components

- `components/layout/Header.tsx`

  - **Purpose**: Navigation, country selector, language selector, theme toggle, settings menu
  - **Features**: Mobile-responsive with hierarchical menu system

- `components/trends/TrendsList.tsx`

  - **Purpose**: Grid layout for trend cards

- `components/trends/TrendCard.tsx`

  - **Purpose**: Basic trend card (keyword display only)

- `components/trends/EnrichedTrendCard.tsx`

  - **Purpose**: Enriched trend card with products, metrics, opportunity score

- `components/trends/CategoryColumn.tsx`

  - **Purpose**: Overview page column displaying trends by type
  - **Used in**: `/[locale]/trends/[country]/overview`

- `components/trends/CategoryDistributionChart.tsx`

  - **Purpose**: Visual chart showing category distribution for trends

- `components/common/LoadingSkeleton.tsx`

  - **Purpose**: Basic loading skeleton for simple lists

- `components/common/ListSkeleton.tsx`

  - **Purpose**: Advanced list loading skeleton with smooth fade transitions

- `components/common/OverviewSkeleton.tsx`

  - **Purpose**: Loading skeleton for overview page (3-column layout)

- `components/common/ErrorState.tsx`
  - **Purpose**: Reusable error display component

### Documentation & Architecture

- `docs/architecture/api-cloudfront-blocking.md`

  - **Purpose**: Comprehensive guide to CloudFront blocking patterns and solutions
  - **Read this**: Before modifying Search API integration

- `CLAUDE.md`
  - **Purpose**: This file - development guide for Claude Code

## Critical Constraints

These aren't preferences—violating them causes production failures or breaks existing architecture. Each constraint includes the **why**.

### 1. Search API: Client-Side Only

**Rule**: Never make Search API calls from server-side routes or API endpoints.

**Why**: MercadoLibre's Search API uses CloudFront with aggressive bot detection that blocks datacenter IPs (Vercel, AWS, etc.). Server-side requests get 403 errors (`x-cache: Error from cloudfront`).

**How to comply**:

- **DO**: Use `lib/searchAPI.ts` for direct browser → Search API calls
- **DON'T**: Create server routes like `/api/search` or `/api/trends/[country]/enriched`

### 2. Client Secret: Server-Side Only

**Rule**: Never expose `MELI_CLIENT_SECRET` in client-side code or environment variables starting with `NEXT_PUBLIC_`.

**Why**: Security - this secret grants full API access to your MercadoLibre app.

**How to comply**:

- **DO**: Use `/api/token` endpoint for server-side token acquisition
- **DON'T**: Import or use `MELI_CLIENT_SECRET` in client components

### 3. Batching Limits: Max 2-3 Per Batch, 1000ms+ Delay

**Rule**: Don't increase batch size above 2-3 trends or reduce delay below 1000ms.

**Why**: Rate limiting - higher batch sizes or shorter delays trigger API blocking, even with client-side calls. Values empirically tested.

**How to comply**:

- **DO**: Keep `BATCH_SIZE = 2` and `BATCH_DELAY_MS = 1000` (or higher)
- **DON'T**: Optimize for speed by increasing batch size or reducing delay without extensive testing

### 4. Keyword Variant Fallbacks Required

**Rule**: Don't remove keyword variant fallback logic from `lib/searchAPI.ts`.

**Why**: Many trend keywords don't match Search API exactly - exact match often returns 0 results. Progressive simplification ("samsung galaxy s24 ultra" → "samsung galaxy s24" → "samsung") ensures data retrieval.

**How to comply**:

- **DO**: Maintain `getKeywordVariants()` function in `lib/searchAPI.ts`
- **DON'T**: Skip variant attempts or remove fallback logic

### 5. Mantine-Only Styling (No Tailwind)

**Rule**: Don't use Tailwind CSS classes or install Tailwind dependencies.

**Why**: Project uses Mantine 8's theming system with PostCSS. Tailwind conflicts with Mantine's styling approach and increases bundle size unnecessarily.

**How to comply**:

- **DO**: Use Mantine components and `sx` prop for styling
- **DON'T**: Add Tailwind config or use Tailwind utility classes

### 6. TypeScript: Use `type`, Not `interface`

**Rule**: Use `type` for all type definitions.

**Why**: Project convention for consistency - makes codebase easier to scan and maintain.

**How to comply**:

- **DO**: `export type MyType = { ... }`
- **DON'T**: `export interface MyInterface { ... }`

### 7. No Server-Side Caching for Enriched Trends

**Rule**: Don't cache enriched trends server-side or create server-side enrichment routes.

**Why**: Defeats the purpose of client-side approach (avoiding CloudFront blocking). Enrichment must happen in the browser.

**How to comply**:

- **DO**: Use `useClientEnrichedTrends` or `useEnrichTrendOnDemand` hooks
- **DON'T**: Create `/api/trends/[country]/enriched` or cache enriched results server-side

### 8. Pre-Commit Verification

**Rule**: Always run `npm run check` before committing.

**Why**: Catches TypeScript errors, linting issues, and test failures before they reach CI/CD.

**How to comply**:

- **DO**: Run `npm run check` (or use pre-commit hooks)
- **DON'T**: Skip verification or commit with known failures

---

## Development Best Practices

- Use `gh` or `vercel` CLI commands for GitHub and Vercel operations
- Reference `/docs/architecture/api-cloudfront-blocking.md` for CloudFront patterns
- Test enriched trends with small datasets first (rate limiting can occur during development)
- Always try to use the "AskUserQuestion" tool for questions
