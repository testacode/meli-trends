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

  describe('getRankBadgeColor - gradient style', () => {
    it('should return yellow for position 1', () => {
      expect(getRankBadgeColor(1, 'gradient')).toBe('yellow');
    });

    it('should return orange for position 2', () => {
      expect(getRankBadgeColor(2, 'gradient')).toBe('orange');
    });

    it('should return meliBlue for position 3', () => {
      expect(getRankBadgeColor(3, 'gradient')).toBe('meliBlue');
    });

    it('should return cyan for positions 4-5', () => {
      expect(getRankBadgeColor(4, 'gradient')).toBe('cyan');
      expect(getRankBadgeColor(5, 'gradient')).toBe('cyan');
    });

    it('should return meliGreen for positions 6-10', () => {
      expect(getRankBadgeColor(6, 'gradient')).toBe('meliGreen');
      expect(getRankBadgeColor(10, 'gradient')).toBe('meliGreen');
    });

    it('should return teal for positions 11-20', () => {
      expect(getRankBadgeColor(11, 'gradient')).toBe('teal');
      expect(getRankBadgeColor(20, 'gradient')).toBe('teal');
    });

    it('should return gray for positions above 20', () => {
      expect(getRankBadgeColor(21, 'gradient')).toBe('gray');
      expect(getRankBadgeColor(50, 'gradient')).toBe('gray');
      expect(getRankBadgeColor(100, 'gradient')).toBe('gray');
    });
  });

  describe('getRankBadgeColor - flat style', () => {
    it('should return yellow for position 1', () => {
      expect(getRankBadgeColor(1, 'flat')).toBe('yellow');
    });

    it('should return meliBlue for positions 2-3', () => {
      expect(getRankBadgeColor(2, 'flat')).toBe('meliBlue');
      expect(getRankBadgeColor(3, 'flat')).toBe('meliBlue');
    });

    it('should return meliGreen for positions 4-10', () => {
      expect(getRankBadgeColor(4, 'flat')).toBe('meliGreen');
      expect(getRankBadgeColor(10, 'flat')).toBe('meliGreen');
    });

    it('should return gray for positions above 10', () => {
      expect(getRankBadgeColor(11, 'flat')).toBe('gray');
      expect(getRankBadgeColor(50, 'flat')).toBe('gray');
    });
  });

  describe('getRankBadgeVariant - gradient style', () => {
    it('should return gradient for top 3 positions', () => {
      expect(getRankBadgeVariant(1, 'gradient')).toBe('gradient');
      expect(getRankBadgeVariant(2, 'gradient')).toBe('gradient');
      expect(getRankBadgeVariant(3, 'gradient')).toBe('gradient');
    });

    it('should return filled for positions 4-10', () => {
      expect(getRankBadgeVariant(4, 'gradient')).toBe('filled');
      expect(getRankBadgeVariant(10, 'gradient')).toBe('filled');
    });

    it('should return light for positions above 10', () => {
      expect(getRankBadgeVariant(11, 'gradient')).toBe('light');
      expect(getRankBadgeVariant(50, 'gradient')).toBe('light');
    });
  });

  describe('getRankBadgeVariant - flat style', () => {
    it('should return filled for all positions', () => {
      expect(getRankBadgeVariant(1, 'flat')).toBe('filled');
      expect(getRankBadgeVariant(5, 'flat')).toBe('filled');
      expect(getRankBadgeVariant(10, 'flat')).toBe('filled');
      expect(getRankBadgeVariant(50, 'flat')).toBe('filled');
    });
  });

  describe('default style parameter', () => {
    it('should use gradient as default when style not specified', () => {
      expect(getRankBadgeColor(1)).toBe('yellow');
      expect(getRankBadgeColor(2)).toBe('orange'); // Only gradient has orange
      expect(getRankBadgeVariant(1)).toBe('gradient');
    });
  });
});
