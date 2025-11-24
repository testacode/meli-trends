# MeLi Trends

> A modern, responsive web application for visualizing trending products from MercadoLibre across Latin America.

[![CI](https://img.shields.io/github/actions/workflow/status/testacode/meli-trends/ci.yml?branch=master&label=CI&logo=github)](https://github.com/testacode/meli-trends/actions/workflows/ci.yml)
[![Build](https://img.shields.io/github/actions/workflow/status/testacode/meli-trends/build.yml?branch=master&label=Build&logo=github)](https://github.com/testacode/meli-trends/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/testacode/meli-trends/branch/master/graph/badge.svg)](https://codecov.io/gh/testacode/meli-trends)
[![Vercel](https://vercelbadge.vercel.app/api/testacode/meli-trends)](https://meli-trends.vercel.app)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen?logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Mantine](https://img.shields.io/badge/Mantine-8-339af0)](https://mantine.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Supported Countries](#supported-countries)
- [API Integration](#api-integration)
- [SEO Implementation](#seo-implementation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

MeLi Trends visualizes trending products from MercadoLibre's Trends API across 7 Latin American countries (Argentina, Brazil, Chile, Mexico, Colombia, Uruguay, and Peru). The application provides keyword trends with automatic classification into three categories: Fastest-Growing, Most Wanted, and Most Popular.

## Screenshots

### Overview Page
Category-based analysis with distribution charts showing trend types across different product categories.

![Trends Overview](docs/screenshots/trends-overview.png)

### List View
Grid view displaying all trends with filtering options by category and trend type.

![Trends List](docs/screenshots/trends-list.png)

## Features

- **📈 Real-Time Trends**: View the 50 most popular products across 7 Latin American countries
- **🏷️ Automatic Classification**: Trends categorized into 3 types with color-coded badges
  - 🔴 Fastest-Growing (positions 1-10)
  - 🔵 Most Wanted (positions 11-30)
  - 🟢 Most Popular (positions 31-50)
- **📊 Overview Page**: Organized view by trend type with category distribution charts
- **📂 Category Filtering**: Filter trends by specific categories to find market niches
- **🌎 Multi-Country Support**: Argentina, Brazil, Chile, Mexico, Colombia, Uruguay, Peru
- **🌍 Multi-Language Support**: Spanish, English, Portuguese (Brazil)
- **📱 Mobile-First Design**: Fully responsive UI that works on all devices
- **🌓 Dark/Light Mode**: Theme switching for comfortable viewing
- **🔒 Secure**: Server-side authentication with no exposed credentials
- **⚡ Fast**: Built with Next.js 16 and optimized for performance
- **🎨 Modern UI**: Clean interface using Mantine UI components
- **📱 PWA**: Installable as a native app on mobile devices
- **🔍 SEO Optimized**: Complete SEO implementation with Open Graph, Twitter Cards, hreflang tags, canonical URLs, JSON-LD structured data, and professional OG image
- **ℹ️ About Page**: Complete guide on trends and business strategies
- **🎮 Easter Egg**: Hidden surprise (↑↑↓↓)

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [Mantine UI 8](https://mantine.dev/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Icons**: [Tabler Icons](https://tabler.io/icons)
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- **API**: [MercadoLibre Trends API](https://developers.mercadolibre.com.ar/en_us/trends)
- **Deployment**: [Vercel](https://vercel.com)

## Prerequisites

- Node.js 20+ (with npm, yarn, pnpm, or bun)
- A MercadoLibre Developer account

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/testacode/meli-trends.git
cd meli-trends
```

### 2. Use the correct Node.js version

If using nvm (Node Version Manager):

```bash
nvm use
# Automatically uses Node.js 20 from .nvmrc
```

### 3. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Set up environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your MercadoLibre credentials:

```env
# Public - Can be exposed in the browser
NEXT_PUBLIC_MELI_APP_ID=your_app_id_here

# Private - Server-side only (NEVER commit this!)
MELI_CLIENT_SECRET=your_client_secret_here

# OAuth Redirect URI
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

> ⚠️ **Important**: Never commit your `.env.local` file. It's already in `.gitignore`.

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Obtaining MercadoLibre API Credentials

1. Go to [MercadoLibre Developers](https://developers.mercadolibre.com.ar/)
2. Sign in with your MercadoLibre account
3. Navigate to **My Applications** → **Create Application**
4. Fill in the required information:
   - **Name**: Your app name (e.g., "MeLi Trends")
   - **Short name**: A short identifier
   - **Redirect URI**: `http://localhost:3000/api/auth/callback` (for development)
5. After creating the app, you'll receive:
   - **APP_ID**: Use for `NEXT_PUBLIC_MELI_APP_ID`
   - **CLIENT_SECRET**: Use for `MELI_CLIENT_SECRET`

### Customizing the Theme

Mantine theme can be customized in `lib/mantine-theme.ts`:

```typescript
export const mantineTheme = createTheme({
  colors: {
    meliBlue: [...],
    meliYellow: [...],
  },
  // ... other theme options
});
```

### Adding/Modifying Countries

Edit `utils/constants.ts`:

```typescript
export const COUNTRIES: Record<SiteId, Country> = {
  MLA: {
    id: 'MLA',
    name: 'Argentina',
    flag: '🇦🇷',
    currency: 'ARS',
  },
  // ... add more countries
};
```

## Usage

### Viewing Trends

Navigate to trends for any supported country (with language selection):

```
http://localhost:3000/es/trends/MLA  (Argentina - Spanish)
http://localhost:3000/en/trends/MLB  (Brazil - English)
http://localhost:3000/pt-BR/trends/MLB  (Brazil - Portuguese)
http://localhost:3000/trends/MLC  (Chile - auto-detected language)
```

**Supported languages:** Spanish (`/es`), English (`/en`), Portuguese-BR (`/pt-BR`)

### Viewing Overview

For an organized view by trend type:

```
http://localhost:3000/es/trends/MLA/overview  (Argentina overview)
http://localhost:3000/en/trends/MLB/overview  (Brazil overview)
```

### Filtering by Category

Use the category filter on any trends page to view trends specific to a market category.

### Understanding Trend Types

- **🔴 Fastest-Growing** (1-10): Products with highest revenue increase in the last week
- **🔵 Most Wanted** (11-30): Highest search volume during the last week
- **🟢 Most Popular** (31-50): Largest search increase vs. 2 weeks ago

## Project Structure

```
meli-trends/
├── app/                             # Next.js App Router
│   ├── [locale]/                   # i18n routes (es, en, pt-BR)
│   │   ├── trends/[country]/      # Dynamic country pages
│   │   │   ├── page.tsx           # Basic trends list
│   │   │   └── overview/          # Overview by trend type
│   │   ├── about/                 # About page
│   │   ├── layout.tsx             # Locale layout with i18n
│   │   └── page.tsx               # Home page
│   ├── api/                        # API routes (server-side)
│   │   ├── categories/[country]/  # Categories endpoint
│   │   ├── token/                 # Token management
│   │   └── trends/[country]/      # Trends endpoint
│   ├── layout.tsx                  # Root layout with SEO
│   ├── manifest.ts                 # PWA manifest
│   └── sitemap.ts                  # Dynamic sitemap
├── components/                     # React components
│   ├── layout/                    # Layout components (Header)
│   ├── trends/                    # Trend components
│   │   ├── TrendCard.tsx
│   │   ├── TrendsList.tsx
│   │   ├── CategoryColumn.tsx              # Overview column
│   │   └── CategoryDistributionChart.tsx   # Category chart
│   └── common/                    # Common components
│       ├── ErrorState.tsx
│       ├── LoadingSkeleton.tsx
│       ├── ListSkeleton.tsx              # List loading skeleton
│       └── OverviewSkeleton.tsx          # Overview loading skeleton
├── hooks/                          # Custom React hooks
│   ├── useTrends.ts
│   └── useCategories.ts
├── i18n/                           # Internationalization config
│   ├── config.ts                  # next-intl setup
│   ├── navigation.ts              # Locale-aware navigation
│   └── request.ts                 # Server-side locale detection
├── locales/                        # Translation files
│   ├── es.json                    # Spanish
│   ├── en.json                    # English
│   └── pt-BR.json                 # Portuguese (Brazil)
├── lib/                            # Library configurations
│   ├── logger/                    # Logging system
│   ├── searchAPI.ts               # Client-side Search API
│   ├── mantine-theme.ts           # Mantine theme
│   └── transitions.ts             # Reusable transitions
├── types/                          # TypeScript definitions
│   └── meli.ts                    # MercadoLibre API types
├── utils/                          # Utility functions
│   ├── constants.ts               # Countries and constants
│   ├── metadata.ts                # SEO metadata utility
│   └── trends.ts                  # Trend utilities
├── public/                         # Static assets
│   └── og-image.png               # Open Graph image (1200x630)
├── proxy.ts                        # Next.js 16 locale routing proxy
└── docs/                           # Documentation
    ├── architecture/              # Architecture docs
    ├── audits/                    # Audit reports
    ├── llms/                      # LLM-optimized docs
    └── plans/                     # Implementation plans
```

## Supported Countries

| Country   | Site ID | Flag | Currency |
| --------- | ------- | ---- | -------- |
| Argentina | `MLA`   | 🇦🇷   | ARS      |
| Brazil    | `MLB`   | 🇧🇷   | BRL      |
| Chile     | `MLC`   | 🇨🇱   | CLP      |
| Mexico    | `MLM`   | 🇲🇽   | MXN      |
| Colombia  | `MCO`   | 🇨🇴   | COP      |
| Uruguay   | `MLU`   | 🇺🇾   | UYU      |
| Peru      | `MPE`   | 🇵🇪   | PEN      |

## API Integration

### MercadoLibre Trends API

**Endpoints**:

```
GET https://api.mercadolibre.com/trends/{SITE_ID}
GET https://api.mercadolibre.com/trends/{SITE_ID}/{CATEGORY_ID}
GET https://api.mercadolibre.com/sites/{SITE_ID}/categories
```

**Response Format**:

```json
[
  {
    "keyword": "iphone 15 pro max",
    "url": "https://listado.mercadolibre.com.ar/iphone-15-pro-max"
  }
]
```

**Limitations**:

- Update frequency: Weekly
- Results per country: 50 products
- Authentication: Required (OAuth 2.0)

### Security Implementation

- ✅ No credentials in code: All sensitive data in environment variables
- ✅ Server-side authentication: CLIENT_SECRET never exposed to client
- ✅ Token caching: Access tokens cached server-side for 5.5 hours
- ✅ Secure repository: No sensitive data committed to git
- ✅ HTTPS required: Production uses secure connections

For detailed security audit, see [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md).

## SEO Implementation

MeLi Trends includes comprehensive SEO optimization to maximize visibility and social media engagement.

### Open Graph & Twitter Cards

All pages include rich metadata for social sharing:

- **Open Graph tags**: Title, description, image, URL, type, site name, locale
- **Twitter Cards**: Large image cards with title and description
- **Professional OG Image**: Custom 1200x630px image featuring "Data Cartography" design
- **Dynamic Metadata**: Page-specific titles and descriptions for all routes

**Test your social shares:**
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Multi-Language SEO

Complete internationalization support for search engines:

- **Hreflang tags**: Proper alternate language links for ES, EN, PT-BR
- **Canonical URLs**: Prevent duplicate content issues
- **x-default**: Fallback to Spanish for unsupported locales
- **Language-specific metadata**: Localized titles and descriptions

### Structured Data

JSON-LD structured data for enhanced search results:

```json
{
  "@type": "WebApplication",
  "name": "MeLi Trends",
  "applicationCategory": "BusinessApplication",
  "inLanguage": ["es", "en", "pt-BR"]
}
```

**Validate structured data:**
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

### SEO Files

- **Sitemap**: `https://meli-trends.carlosmonti.com/sitemap.xml` (9 URLs)
- **Robots.txt**: `https://meli-trends.carlosmonti.com/robots.txt`
- **Manifest**: Progressive Web App manifest for installability

### Implementation Details

- **Reusable Utility**: `utils/metadata.ts` for consistent metadata generation
- **Page Layouts**: SEO metadata in layout files for all routes
- **Performance**: Optimized bundle (-51% dependency reduction)
- **Zero Impact**: 100% test coverage maintained (613 tests passing)

For complete SEO audit details, see [docs/audits/2025-11-24-seo-dependency-audit.md](docs/audits/2025-11-24-seo-dependency-audit.md).

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run check        # Run typecheck + lint + tests

# Testing
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

### Logging System

The application uses Consola for development logging. Logs are automatically disabled in production and test environments.

**Usage**:

```typescript
import { createLogger, startTimer } from "@/lib/logger";

const logger = createLogger("API:myroute");
const timer = startTimer();

logger.info("Starting operation");
logger.success("Operation completed", timer.end());
```

See [Logging System Design](docs/plans/2025-11-23-logging-system-design.md) for details.

### Pre-commit Hooks

Run quality checks before committing:

```bash
npm run check
```

This runs:

- TypeScript type checking
- ESLint linting
- Vitest tests

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- Unit tests: `*.test.ts` or `*.test.tsx` next to source files
- Framework: Vitest with Testing Library
- Mocking: MSW (Mock Service Worker) for API mocking

See [TESTING.md](docs/TESTING.md) for comprehensive testing documentation.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_MELI_APP_ID`
   - `MELI_CLIENT_SECRET`
   - `NEXT_PUBLIC_REDIRECT_URI` (use your production URL)
4. Deploy!

**Post-deployment**:

- Update Redirect URI in your MercadoLibre app with production URL
- Verify sitemap in Google Search Console: `/sitemap.xml`
- Test Open Graph with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- Validate Twitter Cards with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- Check structured data with [Google Rich Results Test](https://search.google.com/test/rich-results)
- Verify hreflang tags are properly indexed
- Test OG image loads correctly: `/og-image.png`

### Other Platforms

This is a standard Next.js application and can be deployed on:

- AWS Amplify
- Netlify
- Railway
- Fly.io
- Docker

Ensure environment variables are configured on your chosen platform.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Use TypeScript for all new code
- Follow existing code conventions
- Write tests when possible
- Update documentation as needed
- Run `npm run check` before committing
- Use `type` instead of `interface` for TypeScript definitions
- Follow the architecture constraints in [CLAUDE.md](CLAUDE.md)

### Development Documentation

For detailed development guidance:

- [CLAUDE.md](CLAUDE.md) - Development guide for AI assistants
- [Architecture Documentation](docs/architecture/) - System architecture details
- [LLM Documentation](docs/llms/) - LLM-optimized project documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [MercadoLibre](https://www.mercadolibre.com/) for providing the Trends API
- [Mantine](https://mantine.dev/) for excellent UI components
- [Next.js](https://nextjs.org/) for the powerful React framework
- [Vercel](https://vercel.com) for hosting infrastructure

---

**Legal Notice**: This application is not affiliated with or endorsed by MercadoLibre. It uses MercadoLibre's public API in accordance with their [terms of use](https://developers.mercadolibre.com.ar/en_us/terms-and-conditions).

**Project Repository**: [https://github.com/testacode/meli-trends](https://github.com/testacode/meli-trends)

---

_Dedicado a mi amigo "El Chango 💪"_
