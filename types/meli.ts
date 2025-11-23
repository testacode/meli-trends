// MercadoLibre API Types

/**
 * Site IDs for different countries in MercadoLibre
 */
export type SiteId = 'MLA' | 'MLB' | 'MLC' | 'MLM' | 'MCO' | 'MLU' | 'MPE';

/**
 * Country information
 */
export interface Country {
  id: SiteId;
  name: string;
  flag: string;
  currency: string;
}

/**
 * Trend item from MercadoLibre Trends API
 */
export interface TrendItem {
  keyword: string;
  url: string;
}

/**
 * Trends API response
 */
export type TrendsResponse = TrendItem[];

/**
 * Category information
 */
export interface Category {
  id: string;
  name: string;
}

/**
 * Auth token data stored in localStorage
 */
export interface AuthTokenData {
  token: string;
  expiresAt?: number; // timestamp when token expires (6 hours from creation)
  createdAt: number; // timestamp when token was saved
}

/**
 * API Error response
 */
export interface ApiError {
  message: string;
  error: string;
  status: number;
  cause?: string;
}

/**
 * OAuth Token Response from MercadoLibre
 */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds until expiration (typically 21600 = 6 hours)
  scope: string;
  user_id: number;
  refresh_token: string;
}

/**
 * Product from Search API
 */
export interface SearchProduct {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  thumbnail: string;
  permalink: string;
  condition: 'new' | 'used';
  available_quantity: number;
  sold_quantity?: number;
  shipping?: {
    free_shipping: boolean;
    logistic_type?: string;
    store_pick_up?: boolean;
  };
  accepts_mercadopago?: boolean;
  original_price?: number;
  seller?: {
    id: number;
    nickname?: string;
    reputation?: {
      level_id?: string;
      power_seller_status?: string;
    };
  };
  attributes?: Array<{
    id: string;
    name: string;
    value_name: string;
  }>;
  installments?: {
    quantity: number;
    amount: number;
    rate: number;
  };
}

/**
 * Search API Response
 */
export interface SearchResponse {
  site_id: string;
  query: string;
  paging: {
    total: number;
    offset: number;
    limit: number;
    primary_results: number;
  };
  results: SearchProduct[];
  sort: {
    id: string;
    name: string;
  };
  available_sorts: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * Enriched Trend Item with product data
 */
export interface EnrichedTrendItem extends TrendItem {
  products: SearchProduct[];
  total_results: number;
  avg_price?: number;
  min_price?: number;
  max_price?: number;
  total_sold?: number;
  free_shipping_percentage?: number;
  opportunity_score?: number; // 0-100 score based on multiple factors
}

/**
 * Enriched Trends API Response
 */
export interface EnrichedTrendsResponse {
  site_id: SiteId;
  trends: EnrichedTrendItem[];
  total: number;
  offset: number;
  limit: number;
  cached_at: string; // ISO timestamp
  cache_ttl: number; // seconds
}
