# MSW Mock Configuration

This directory contains Mock Service Worker (MSW) configuration for testing the meli-trends application.

## Overview

MSW intercepts HTTP requests at the network level, allowing tests to use realistic API mocking without modifying application code. This implementation uses MSW 2.0 syntax.

## Files

### `data.ts`
Mock data fixtures that match the MercadoLibre API responses:

- **`mockAccessToken`**: OAuth token response
- **`mockTrends`**: Array of trending keywords
- **`mockProducts`**: Array of realistic product data (Argentine market)
- **`mockSearchResponse`**: Complete Search API response structure

All data uses realistic values (Argentine pesos for MLA, proper product attributes, etc.).

### `handlers.ts`
MSW request handlers for intercepting API calls:

- **`/api/token`**: Returns mock OAuth access token
- **`/api/trends/:country`**: Returns trending keywords for specified country
- **`https://api.mercadolibre.com/sites/:siteId/search`**: Returns search results with pagination support

Additional handler for testing CloudFront 403 blocking scenario.

### `server.ts`
Server instance configuration for Node.js (Vitest) environment.

### `index.ts`
Centralized exports for convenient imports:
```typescript
import { server, handlers, mockTrends } from '@/mocks';
```

## Usage

### In Test Files

```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '@/mocks/server';

describe('My Component', () => {
  // Start server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Close server after all tests
  afterAll(() => server.close());

  it('should fetch trends', async () => {
    // Your test here - API calls will be intercepted
  });
});
```

### Customizing Responses per Test

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

it('should handle API errors', async () => {
  // Override handler for this test only
  server.use(
    http.get('http://localhost:3000/api/trends/MLA', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    })
  );

  // Test error handling
});
```

### Testing Different Countries

The Search API handler supports all valid site IDs:
- `MLA` (Argentina)
- `MLB` (Brazil)
- `MLC` (Chile)
- `MLM` (Mexico)
- `MCO` (Colombia)
- `MLU` (Uruguay)
- `MPE` (Peru)

```typescript
const response = await fetch(
  'https://api.mercadolibre.com/sites/MLB/search?q=iphone'
);
```

## Key Features

1. **Type-Safe**: All mock data uses types from `types/meli.ts`
2. **Realistic Data**: Mock products include authentic Argentine market data
3. **Validation**: Handlers validate site IDs and return proper error responses
4. **Pagination Support**: Search API handler respects `limit` and `offset` parameters
5. **Query Parameter Support**: Handles all standard Search API query parameters

## Testing CloudFront Blocking

The handlers include a special endpoint to test CloudFront 403 blocking scenarios:

```typescript
const response = await fetch(
  'https://api.mercadolibre.com/sites/MLA/search-blocked'
);
// Returns 403 with x-cache: Error from cloudfront header
```

## Adding New Mock Data

To add new mock responses:

1. Add data to `data.ts`:
```typescript
export const mockNewFeature = {
  // Your mock data
};
```

2. Add handler to `handlers.ts`:
```typescript
http.get('/api/new-endpoint', () => {
  return HttpResponse.json(mockNewFeature);
});
```

3. Export from `index.ts` if needed

## Best Practices

1. **Reset handlers after each test**: Prevents test pollution
2. **Use `onUnhandledRequest: 'error'`**: Catches unintended network requests
3. **Match real API structure**: Keep mocks aligned with actual API responses
4. **Update types first**: When API types change, update `types/meli.ts` before mocks
5. **Test edge cases**: Use handler overrides to test error scenarios

## MSW 2.0 Migration Notes

This implementation uses MSW 2.0 syntax:
- `http.get()` instead of `rest.get()`
- `HttpResponse.json()` instead of `res(ctx.json())`
- Request handlers receive `{ params, request }` instead of `req, res, ctx`

## Resources

- [MSW Documentation](https://mswjs.io/docs/)
- [MSW 2.0 Migration Guide](https://mswjs.io/docs/migrations/1.x-to-2.x)
- [Testing Library Best Practices](https://testing-library.com/docs/)
