import { describe, it, expect } from 'vitest';
import {
  COUNTRIES,
  COUNTRIES_ARRAY,
  DEFAULT_COUNTRY,
  MELI_COLORS,
  MELI_API_BASE_URL,
  TOKEN_EXPIRATION_MS,
  AUTH_TOKEN_KEY,
  DOCS_URLS,
  type SiteId,
} from './constants';

describe('constants', () => {
  describe('COUNTRIES', () => {
    it('should have 7 countries', () => {
      expect(Object.keys(COUNTRIES)).toHaveLength(7);
    });

    it('should have correct site IDs', () => {
      const siteIds: SiteId[] = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MLU', 'MPE'];
      siteIds.forEach((id) => {
        expect(COUNTRIES[id]).toBeDefined();
        expect(COUNTRIES[id].id).toBe(id);
      });
    });

    it('should have required fields for each country', () => {
      Object.values(COUNTRIES).forEach((country) => {
        expect(country).toHaveProperty('id');
        expect(country).toHaveProperty('name');
        expect(country).toHaveProperty('flag');
        expect(country).toHaveProperty('currency');
      });
    });

    it('should have correct country names', () => {
      expect(COUNTRIES.MLA.name).toBe('Argentina');
      expect(COUNTRIES.MLB.name).toBe('Brasil');
      expect(COUNTRIES.MLC.name).toBe('Chile');
      expect(COUNTRIES.MLM.name).toBe('México');
      expect(COUNTRIES.MCO.name).toBe('Colombia');
      expect(COUNTRIES.MLU.name).toBe('Uruguay');
      expect(COUNTRIES.MPE.name).toBe('Perú');
    });

    it('should have correct currencies', () => {
      expect(COUNTRIES.MLA.currency).toBe('ARS');
      expect(COUNTRIES.MLB.currency).toBe('BRL');
      expect(COUNTRIES.MLC.currency).toBe('CLP');
      expect(COUNTRIES.MLM.currency).toBe('MXN');
      expect(COUNTRIES.MCO.currency).toBe('COP');
      expect(COUNTRIES.MLU.currency).toBe('UYU');
      expect(COUNTRIES.MPE.currency).toBe('PEN');
    });
  });

  describe('COUNTRIES_ARRAY', () => {
    it('should have 7 countries', () => {
      expect(COUNTRIES_ARRAY).toHaveLength(7);
    });

    it('should match COUNTRIES object values', () => {
      expect(COUNTRIES_ARRAY).toEqual(Object.values(COUNTRIES));
    });
  });

  describe('DEFAULT_COUNTRY', () => {
    it('should be MLA (Argentina)', () => {
      expect(DEFAULT_COUNTRY).toBe('MLA');
    });

    it('should exist in COUNTRIES', () => {
      expect(COUNTRIES[DEFAULT_COUNTRY]).toBeDefined();
    });
  });

  describe('MELI_COLORS', () => {
    it('should have all brand colors', () => {
      expect(MELI_COLORS).toHaveProperty('primary');
      expect(MELI_COLORS).toHaveProperty('secondary');
      expect(MELI_COLORS).toHaveProperty('success');
      expect(MELI_COLORS).toHaveProperty('error');
      expect(MELI_COLORS).toHaveProperty('dark');
      expect(MELI_COLORS).toHaveProperty('light');
      expect(MELI_COLORS).toHaveProperty('white');
      expect(MELI_COLORS).toHaveProperty('black');
    });

    it('should have correct hex colors', () => {
      expect(MELI_COLORS.primary).toBe('#FFE600');
      expect(MELI_COLORS.secondary).toBe('#3483FA');
      expect(MELI_COLORS.success).toBe('#00A650');
      expect(MELI_COLORS.error).toBe('#F23D4F');
      expect(MELI_COLORS.white).toBe('#FFFFFF');
      expect(MELI_COLORS.black).toBe('#000000');
    });
  });

  describe('MELI_API_BASE_URL', () => {
    it('should be correct MercadoLibre API URL', () => {
      expect(MELI_API_BASE_URL).toBe('https://api.mercadolibre.com');
    });
  });

  describe('TOKEN_EXPIRATION_MS', () => {
    it('should be 6 hours in milliseconds', () => {
      const sixHoursInMs = 6 * 60 * 60 * 1000;
      expect(TOKEN_EXPIRATION_MS).toBe(sixHoursInMs);
      expect(TOKEN_EXPIRATION_MS).toBe(21600000);
    });
  });

  describe('AUTH_TOKEN_KEY', () => {
    it('should be correct localStorage key', () => {
      expect(AUTH_TOKEN_KEY).toBe('meli_trends_auth_token');
    });
  });

  describe('DOCS_URLS', () => {
    it('should have all documentation URLs', () => {
      expect(DOCS_URLS).toHaveProperty('main');
      expect(DOCS_URLS).toHaveProperty('authentication');
      expect(DOCS_URLS).toHaveProperty('trends');
      expect(DOCS_URLS).toHaveProperty('getStarted');
    });

    it('should have valid URLs', () => {
      Object.values(DOCS_URLS).forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
        expect(url).toContain('developers.mercadolibre.com.ar');
      });
    });
  });
});
