/**
 * Test Data Factories
 *
 * Factory functions for creating mock data with sensible defaults.
 * Each factory accepts partial overrides to customize the generated data.
 *
 * Usage:
 *   const trend = createMockTrendItem({ keyword: 'custom keyword' });
 *   const product = createMockSearchProduct({ price: 50000 });
 */

import type {
  ApiError,
  Category,
  EnrichedTrendItem,
  OAuthTokenResponse,
  SearchProduct,
  SearchResponse,
  SiteId,
  TrendItem,
  TrendType,
} from '@/types/meli';

/**
 * Creates a mock TrendItem with sensible defaults
 */
export function createMockTrendItem(
  overrides?: Partial<TrendItem>
): TrendItem {
  return {
    keyword: 'samsung galaxy s24',
    url: 'https://www.mercadolibre.com.ar/samsung-galaxy-s24',
    ...overrides,
  };
}

/**
 * Creates a mock SearchProduct with realistic data
 */
export function createMockSearchProduct(
  overrides?: Partial<SearchProduct>
): SearchProduct {
  const defaults: SearchProduct = {
    id: 'MLA123456789',
    title: 'Samsung Galaxy S24 256gb 8gb Ram Dual Sim',
    price: 899999,
    currency_id: 'ARS',
    thumbnail:
      'https://http2.mlstatic.com/D_NQ_NP_123456-MLA12345678901-012024-O.webp',
    permalink: 'https://www.mercadolibre.com.ar/samsung-galaxy-s24-256gb',
    condition: 'new',
    available_quantity: 15,
    sold_quantity: 234,
    shipping: {
      free_shipping: true,
      logistic_type: 'fulfillment',
      store_pick_up: false,
    },
    accepts_mercadopago: true,
    original_price: 999999,
    seller: {
      id: 98765432,
      nickname: 'TECH_STORE_ARG',
      reputation: {
        level_id: '5_green',
        power_seller_status: 'platinum',
      },
    },
    attributes: [
      {
        id: 'BRAND',
        name: 'Marca',
        value_name: 'Samsung',
      },
      {
        id: 'MODEL',
        name: 'Modelo',
        value_name: 'Galaxy S24',
      },
      {
        id: 'INTERNAL_MEMORY',
        name: 'Memoria interna',
        value_name: '256 GB',
      },
    ],
    installments: {
      quantity: 12,
      amount: 75000,
      rate: 0,
    },
  };

  return {
    ...defaults,
    ...overrides,
    shipping: overrides?.shipping
      ? { ...defaults.shipping, ...overrides.shipping }
      : defaults.shipping,
    seller: overrides?.seller
      ? {
          ...defaults.seller,
          ...overrides.seller,
          reputation: overrides.seller.reputation
            ? {
                ...defaults.seller?.reputation,
                ...overrides.seller.reputation,
              }
            : defaults.seller?.reputation,
        }
      : defaults.seller,
  };
}

/**
 * Creates a mock SearchResponse with configurable results
 */
export function createMockSearchResponse(
  overrides?: Partial<SearchResponse> & { resultsCount?: number }
): SearchResponse {
  const { resultsCount, ...restOverrides } = overrides || {};

  // Generate products based on resultsCount
  const products = resultsCount
    ? Array.from({ length: resultsCount }, (_, i) =>
        createMockSearchProduct({
          id: `MLA${123456789 + i}`,
          title: `Product ${i + 1}`,
          price: 100000 + i * 10000,
        })
      )
    : [createMockSearchProduct()];

  const defaults: SearchResponse = {
    site_id: 'MLA',
    query: 'samsung galaxy s24',
    paging: {
      total: resultsCount ?? 1247,
      offset: 0,
      limit: products.length,
      primary_results: resultsCount ?? 1247,
    },
    results: products,
    sort: {
      id: 'relevance',
      name: 'Más relevantes',
    },
    available_sorts: [
      {
        id: 'relevance',
        name: 'Más relevantes',
      },
      {
        id: 'price_asc',
        name: 'Menor precio',
      },
      {
        id: 'price_desc',
        name: 'Mayor precio',
      },
    ],
  };

  return {
    ...defaults,
    ...restOverrides,
    paging: restOverrides?.paging
      ? { ...defaults.paging, ...restOverrides.paging }
      : defaults.paging,
  };
}

/**
 * Creates a mock EnrichedTrendItem with products and metrics
 */
export function createMockEnrichedTrendItem(
  overrides?: Partial<EnrichedTrendItem> & { productsCount?: number }
): EnrichedTrendItem {
  const { productsCount, ...restOverrides } = overrides || {};

  const products = productsCount
    ? Array.from({ length: productsCount }, (_, i) =>
        createMockSearchProduct({
          id: `MLA${123456789 + i}`,
          price: 800000 + i * 50000,
          sold_quantity: 200 - i * 20,
        })
      )
    : [
        createMockSearchProduct({ price: 800000, sold_quantity: 200 }),
        createMockSearchProduct({ price: 900000, sold_quantity: 180 }),
        createMockSearchProduct({ price: 1000000, sold_quantity: 150 }),
      ];

  // Calculate realistic metrics based on products
  const prices = products.map((p) => p.price);
  const avg_price = prices.reduce((a, b) => a + b, 0) / prices.length;
  const min_price = Math.min(...prices);
  const max_price = Math.max(...prices);
  const total_sold = products.reduce(
    (sum, p) => sum + (p.sold_quantity || 0),
    0
  );
  const free_shipping_count = products.filter(
    (p) => p.shipping?.free_shipping
  ).length;
  const free_shipping_percentage = (free_shipping_count / products.length) * 100;

  const defaults: EnrichedTrendItem = {
    keyword: 'samsung galaxy s24',
    url: 'https://www.mercadolibre.com.ar/samsung-galaxy-s24',
    products,
    total_results: 1247,
    avg_price,
    min_price,
    max_price,
    total_sold,
    free_shipping_percentage,
    opportunity_score: 75,
  };

  return {
    ...defaults,
    ...restOverrides,
  };
}

/**
 * Creates a mock OAuth token response
 */
export function createMockOAuthToken(
  overrides?: Partial<OAuthTokenResponse>
): OAuthTokenResponse {
  return {
    access_token: 'TEST-1234567890-mock-access-token',
    token_type: 'Bearer',
    expires_in: 21600, // 6 hours
    scope: 'offline_access read',
    user_id: 123456789,
    refresh_token: 'TEST-refresh-token-mock',
    ...overrides,
  };
}

/**
 * Creates a mock API error response
 */
export function createMockApiError(overrides?: Partial<ApiError>): ApiError {
  return {
    message: 'An error occurred',
    error: 'internal_error',
    status: 500,
    ...overrides,
  };
}

/**
 * Creates a mock Category
 */
export function createMockCategory(overrides?: Partial<Category>): Category {
  return {
    id: 'MLA1055',
    name: 'Celulares y Teléfonos',
    ...overrides,
  };
}

/**
 * Creates multiple mock trend items with sequential data
 */
export function createMockTrendItems(
  count: number,
  overridesFn?: (index: number) => Partial<TrendItem>
): TrendItem[] {
  const keywords = [
    'samsung galaxy s24',
    'iphone 15 pro max',
    'notebook lenovo',
    'playstation 5',
    'zapatillas nike',
    'smart tv 55 pulgadas',
    'auriculares bluetooth',
    'bicicleta rodado 29',
    'aire acondicionado split',
    'camara nikon',
  ];

  return Array.from({ length: count }, (_, i) => {
    const keyword = keywords[i % keywords.length];
    const baseKeyword = i >= keywords.length ? `${keyword} ${i}` : keyword;

    return createMockTrendItem({
      keyword: baseKeyword,
      url: `https://www.mercadolibre.com.ar/${baseKeyword.replace(/\s+/g, '-')}`,
      ...(overridesFn?.(i) || {}),
    });
  });
}

/**
 * Creates multiple mock products with varied prices
 */
export function createMockProducts(
  count: number,
  basePrice: number = 100000
): SearchProduct[] {
  return Array.from({ length: count }, (_, i) =>
    createMockSearchProduct({
      id: `MLA${123456789 + i}`,
      title: `Product ${i + 1}`,
      price: basePrice + i * 10000,
      sold_quantity: 200 - i * 10,
      available_quantity: 20 - i,
    })
  );
}

/**
 * Creates a mock SearchResponse with no results (empty state)
 */
export function createEmptySearchResponse(
  query: string = 'nonexistent product'
): SearchResponse {
  return createMockSearchResponse({
    query,
    resultsCount: 0,
    paging: {
      total: 0,
      offset: 0,
      limit: 0,
      primary_results: 0,
    },
  });
}

/**
 * Creates a mock SearchResponse for a specific site/country
 */
export function createSearchResponseForSite(
  siteId: SiteId,
  overrides?: Partial<SearchResponse>
): SearchResponse {
  const currencyMap: Record<SiteId, string> = {
    MLA: 'ARS',
    MLB: 'BRL',
    MLC: 'CLP',
    MLM: 'MXN',
    MCO: 'COP',
    MLU: 'UYU',
    MPE: 'PEN',
  };

  return createMockSearchResponse({
    site_id: siteId,
    results: [
      createMockSearchProduct({
        currency_id: currencyMap[siteId],
      }),
    ],
    ...overrides,
  });
}

/**
 * Adds trend_type to trend items based on their index position
 */
export function withTrendTypes(trends: TrendItem[]): TrendItem[] {
  return trends.map((trend, index) => {
    let trend_type: TrendType;
    if (index < 10) {
      trend_type = 'fastest_growing';
    } else if (index < 30) {
      trend_type = 'most_wanted';
    } else {
      trend_type = 'most_popular';
    }

    return {
      ...trend,
      trend_type,
    };
  });
}
