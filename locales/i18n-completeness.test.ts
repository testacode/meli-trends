import { describe, it, expect } from 'vitest';
import esTranslations from './es.json';
import enTranslations from './en.json';
import ptBRTranslations from './pt-BR.json';

/**
 * i18n Completeness Tests
 *
 * These tests ensure that all translation keys are present in all locale files.
 * If a key exists in one locale, it must exist in all others.
 *
 * This prevents runtime errors like "MISSING_MESSAGE: Could not resolve `key` in messages for locale `xx`"
 */

describe('i18n Completeness', () => {
  /**
   * Recursively extract all keys from a nested object
   * Example: { foo: { bar: 'value' } } → ['foo.bar']
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function extractKeys(obj: Record<string, any>, prefix = ''): string[] {
    const keys: string[] = [];

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Recursive: nested object
        keys.push(...extractKeys(obj[key], fullKey));
      } else {
        // Leaf node: actual translation string
        keys.push(fullKey);
      }
    }

    return keys;
  }

  /**
   * Check if a key exists in a nested object
   * Example: hasKey({ foo: { bar: 'value' } }, 'foo.bar') → true
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function hasKey(obj: Record<string, any>, key: string): boolean {
    const parts = key.split('.');
    let current = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }

    return true;
  }

  const locales = {
    es: esTranslations,
    en: enTranslations,
    'pt-BR': ptBRTranslations,
  };

  // Extract all keys from all locales
  const allKeys = {
    es: extractKeys(esTranslations),
    en: extractKeys(enTranslations),
    'pt-BR': extractKeys(ptBRTranslations),
  };

  // Get unique keys across all locales
  const uniqueKeys = new Set([
    ...allKeys.es,
    ...allKeys.en,
    ...allKeys['pt-BR'],
  ]);

  describe('All keys exist in all locales', () => {
    for (const key of uniqueKeys) {
      it(`Key "${key}" should exist in es, en, and pt-BR`, () => {
        expect(hasKey(locales.es, key), `Missing in ES: ${key}`).toBe(true);
        expect(hasKey(locales.en, key), `Missing in EN: ${key}`).toBe(true);
        expect(hasKey(locales['pt-BR'], key), `Missing in PT-BR: ${key}`).toBe(true);
      });
    }
  });

  describe('No extra keys in any locale', () => {
    it('ES should not have keys missing in other locales', () => {
      for (const key of allKeys.es) {
        expect(hasKey(locales.en, key), `ES has key "${key}" but EN does not`).toBe(true);
        expect(hasKey(locales['pt-BR'], key), `ES has key "${key}" but PT-BR does not`).toBe(true);
      }
    });

    it('EN should not have keys missing in other locales', () => {
      for (const key of allKeys.en) {
        expect(hasKey(locales.es, key), `EN has key "${key}" but ES does not`).toBe(true);
        expect(hasKey(locales['pt-BR'], key), `EN has key "${key}" but PT-BR does not`).toBe(true);
      }
    });

    it('PT-BR should not have keys missing in other locales', () => {
      for (const key of allKeys['pt-BR']) {
        expect(hasKey(locales.es, key), `PT-BR has key "${key}" but ES does not`).toBe(true);
        expect(hasKey(locales.en, key), `PT-BR has key "${key}" but EN does not`).toBe(true);
      }
    });
  });

  describe('Key counts match', () => {
    it('All locales should have the same number of keys', () => {
      const esCount = allKeys.es.length;
      const enCount = allKeys.en.length;
      const ptBRCount = allKeys['pt-BR'].length;

      expect(enCount, `EN has ${enCount} keys, ES has ${esCount} keys`).toBe(esCount);
      expect(ptBRCount, `PT-BR has ${ptBRCount} keys, ES has ${esCount} keys`).toBe(esCount);
    });
  });

  describe('No empty values', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function findEmptyValues(obj: Record<string, any>, prefix = ''): string[] {
      const empty: string[] = [];

      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          empty.push(...findEmptyValues(obj[key], fullKey));
        } else if (typeof obj[key] === 'string' && obj[key].trim() === '') {
          empty.push(fullKey);
        }
      }

      return empty;
    }

    it('ES should not have empty translation strings', () => {
      const emptyKeys = findEmptyValues(esTranslations);
      expect(emptyKeys, `ES has empty values for: ${emptyKeys.join(', ')}`).toEqual([]);
    });

    it('EN should not have empty translation strings', () => {
      const emptyKeys = findEmptyValues(enTranslations);
      expect(emptyKeys, `EN has empty values for: ${emptyKeys.join(', ')}`).toEqual([]);
    });

    it('PT-BR should not have empty translation strings', () => {
      const emptyKeys = findEmptyValues(ptBRTranslations);
      expect(emptyKeys, `PT-BR has empty values for: ${emptyKeys.join(', ')}`).toEqual([]);
    });
  });

  describe('No duplicate keys (case-sensitivity check)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function checkDuplicateKeys(obj: Record<string, any>, prefix = ''): string[] {
      const duplicates: string[] = [];
      const keysLower: Record<string, string> = {};

      for (const key in obj) {
        const lowerKey = key.toLowerCase();

        if (lowerKey in keysLower) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          const existingFullKey = prefix ? `${prefix}.${keysLower[lowerKey]}` : keysLower[lowerKey];
          duplicates.push(`"${fullKey}" and "${existingFullKey}" differ only in case`);
        } else {
          keysLower[lowerKey] = key;
        }

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          duplicates.push(...checkDuplicateKeys(obj[key], fullKey));
        }
      }

      return duplicates;
    }

    it('ES should not have duplicate keys differing only in case', () => {
      const duplicates = checkDuplicateKeys(esTranslations);
      expect(duplicates, `ES has duplicate keys: ${duplicates.join(', ')}`).toEqual([]);
    });

    it('EN should not have duplicate keys differing only in case', () => {
      const duplicates = checkDuplicateKeys(enTranslations);
      expect(duplicates, `EN has duplicate keys: ${duplicates.join(', ')}`).toEqual([]);
    });

    it('PT-BR should not have duplicate keys differing only in case', () => {
      const duplicates = checkDuplicateKeys(ptBRTranslations);
      expect(duplicates, `PT-BR has duplicate keys: ${duplicates.join(', ')}`).toEqual([]);
    });
  });
});
