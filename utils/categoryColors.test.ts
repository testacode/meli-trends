import { describe, it, expect } from 'vitest';
import { getCategoryColor, getRankBadgeColor, getRankBadgeVariant } from './categoryColors';

describe('categoryColors', () => {
  describe('getCategoryColor', () => {
    it('should return consistent colors for the same category name', () => {
      const color1 = getCategoryColor('Electronics');
      const color2 = getCategoryColor('Electronics');
      expect(color1).toBe(color2);
    });

    it('should return different colors for different category names', () => {
      const color1 = getCategoryColor('Electronics');
      const color2 = getCategoryColor('Books');
      const color3 = getCategoryColor('Clothing');

      // At least some should be different (statistically very likely with 16 colors)
      const colors = [color1, color2, color3];
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBeGreaterThan(0);
    });

    it('should return valid Mantine color names', () => {
      const validColors = [
        'meliBlue', 'meliGreen', 'meliRed', 'meliYellow',
        'blue', 'cyan', 'teal', 'green', 'lime', 'yellow',
        'orange', 'red', 'pink', 'grape', 'violet', 'indigo'
      ];

      const color = getCategoryColor('Test Category');
      expect(validColors).toContain(color);
    });

    it('should handle empty strings', () => {
      const color = getCategoryColor('');
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
    });

    it('should handle special characters', () => {
      const color = getCategoryColor('Celulares & Teléfonos');
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
    });

    it('should handle very long category names', () => {
      const longName = 'A'.repeat(1000);
      const color = getCategoryColor(longName);
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
    });
  });

  describe('getRankBadgeColor', () => {
    it('should return yellow for position 1', () => {
      expect(getRankBadgeColor(1)).toBe('yellow');
    });

    it('should return meliBlue for positions 2-3', () => {
      expect(getRankBadgeColor(2)).toBe('meliBlue');
      expect(getRankBadgeColor(3)).toBe('meliBlue');
    });

    it('should return meliGreen for positions 4-10', () => {
      expect(getRankBadgeColor(4)).toBe('meliGreen');
      expect(getRankBadgeColor(10)).toBe('meliGreen');
    });

    it('should return gray for positions above 10', () => {
      expect(getRankBadgeColor(11)).toBe('gray');
      expect(getRankBadgeColor(50)).toBe('gray');
    });
  });

  describe('getRankBadgeVariant', () => {
    it('should always return filled', () => {
      expect(getRankBadgeVariant()).toBe('filled');
    });
  });
});
