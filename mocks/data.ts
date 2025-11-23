import type {
  OAuthTokenResponse,
  SearchProduct,
  SearchResponse,
  TrendItem,
} from '@/types/meli';

/**
 * Mock OAuth access token response
 */
export const mockAccessToken: OAuthTokenResponse = {
  access_token: 'TEST-1234567890-mock-access-token',
  token_type: 'Bearer',
  expires_in: 21600, // 6 hours
  scope: 'offline_access read',
  user_id: 123456789,
  refresh_token: 'TEST-refresh-token-mock',
};

/**
 * Mock trends data for Argentina (MLA)
 */
export const mockTrends: TrendItem[] = [
  {
    keyword: 'samsung galaxy s24',
    url: 'https://www.mercadolibre.com.ar/samsung-galaxy-s24',
  },
  {
    keyword: 'iphone 15 pro max',
    url: 'https://www.mercadolibre.com.ar/iphone-15-pro-max',
  },
  {
    keyword: 'notebook lenovo',
    url: 'https://www.mercadolibre.com.ar/notebook-lenovo',
  },
  {
    keyword: 'playstation 5',
    url: 'https://www.mercadolibre.com.ar/playstation-5',
  },
  {
    keyword: 'zapatillas nike',
    url: 'https://www.mercadolibre.com.ar/zapatillas-nike',
  },
];

/**
 * Mock products with realistic Argentine data
 */
export const mockProducts: SearchProduct[] = [
  {
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
  },
  {
    id: 'MLA987654321',
    title: 'Samsung Galaxy S24 128gb 8gb Ram - Importado',
    price: 799999,
    currency_id: 'ARS',
    thumbnail:
      'https://http2.mlstatic.com/D_NQ_NP_987654-MLA98765432109-012024-O.webp',
    permalink: 'https://www.mercadolibre.com.ar/samsung-galaxy-s24-128gb',
    condition: 'new',
    available_quantity: 8,
    sold_quantity: 156,
    shipping: {
      free_shipping: true,
      logistic_type: 'cross_docking',
      store_pick_up: true,
    },
    accepts_mercadopago: true,
    seller: {
      id: 12345678,
      nickname: 'ELECTRONICA_PLUS',
      reputation: {
        level_id: '4_light_green',
        power_seller_status: 'gold',
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
        value_name: '128 GB',
      },
    ],
    installments: {
      quantity: 12,
      amount: 66666,
      rate: 0,
    },
  },
  {
    id: 'MLA111222333',
    title: 'Samsung Galaxy S24 Ultra 512gb 12gb Ram Negro',
    price: 1299999,
    currency_id: 'ARS',
    thumbnail:
      'https://http2.mlstatic.com/D_NQ_NP_111222-MLA33344455566-012024-O.webp',
    permalink: 'https://www.mercadolibre.com.ar/samsung-galaxy-s24-ultra',
    condition: 'new',
    available_quantity: 5,
    sold_quantity: 89,
    shipping: {
      free_shipping: true,
      logistic_type: 'fulfillment',
      store_pick_up: false,
    },
    accepts_mercadopago: true,
    original_price: 1399999,
    seller: {
      id: 55566677,
      nickname: 'SAMSUNG_OFFICIAL',
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
        value_name: 'Galaxy S24 Ultra',
      },
      {
        id: 'INTERNAL_MEMORY',
        name: 'Memoria interna',
        value_name: '512 GB',
      },
    ],
    installments: {
      quantity: 12,
      amount: 108333,
      rate: 0,
    },
  },
];

/**
 * Mock Search API response
 */
export const mockSearchResponse: SearchResponse = {
  site_id: 'MLA',
  query: 'samsung galaxy s24',
  paging: {
    total: 1247,
    offset: 0,
    limit: 50,
    primary_results: 1247,
  },
  results: mockProducts,
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
