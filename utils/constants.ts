import type { Country, SiteId } from '@/types/meli';

// Re-export types for convenience
export type { SiteId, Country };

/**
 * MercadoLibre brand colors
 */
export const MELI_COLORS = {
  primary: '#FFE600', // Yellow
  secondary: '#3483FA', // Blue
  success: '#00A650', // Green
  error: '#F23D4F', // Red
  dark: '#333333', // Dark Gray
  light: '#EDEDED', // Light Gray
  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * Available countries in MercadoLibre with their site IDs
 */
export const COUNTRIES: Record<SiteId, Country> = {
  MLA: {
    id: 'MLA',
    name: 'Argentina',
    flag: '🇦🇷',
    currency: 'ARS',
  },
  MLB: {
    id: 'MLB',
    name: 'Brasil',
    flag: '🇧🇷',
    currency: 'BRL',
  },
  MLC: {
    id: 'MLC',
    name: 'Chile',
    flag: '🇨🇱',
    currency: 'CLP',
  },
  MLM: {
    id: 'MLM',
    name: 'México',
    flag: '🇲🇽',
    currency: 'MXN',
  },
  MCO: {
    id: 'MCO',
    name: 'Colombia',
    flag: '🇨🇴',
    currency: 'COP',
  },
  MLU: {
    id: 'MLU',
    name: 'Uruguay',
    flag: '🇺🇾',
    currency: 'UYU',
  },
  MPE: {
    id: 'MPE',
    name: 'Perú',
    flag: '🇵🇪',
    currency: 'PEN',
  },
} as const;

/**
 * Array of all available countries
 */
export const COUNTRIES_ARRAY = Object.values(COUNTRIES);

/**
 * Default country to show when user first visits
 */
export const DEFAULT_COUNTRY: SiteId = 'MLA';

/**
 * MercadoLibre API base URL
 */
export const MELI_API_BASE_URL = 'https://api.mercadolibre.com';

/**
 * Token expiration time in milliseconds (6 hours)
 */
export const TOKEN_EXPIRATION_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * localStorage key for auth token
 */
export const AUTH_TOKEN_KEY = 'meli_trends_auth_token';

/**
 * MercadoLibre Developers documentation URLs
 */
export const DOCS_URLS = {
  main: 'https://developers.mercadolibre.com.ar',
  authentication: 'https://developers.mercadolibre.com.ar/en_us/authentication-and-authorization',
  trends: 'https://developers.mercadolibre.com.ar/en_us/trends',
  getStarted: 'https://developers.mercadolibre.com.ar/en_us/getting-started',
} as const;
