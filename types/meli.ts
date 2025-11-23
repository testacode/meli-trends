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
