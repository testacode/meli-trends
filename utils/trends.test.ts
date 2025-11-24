/**
 * Unit Tests for Trend Utilities
 *
 * Tests all exported functions from utils/trends.ts with comprehensive coverage:
 * - getTrendType: Position-based trend type determination
 * - enrichTrendsWithType: Add trend_type field to trends array
 * - getTrendTypeLabel: Human-readable labels for trend types
 * - getTrendTypeColor: Color mapping for trend type badges
 */

import { describe, it, expect } from 'vitest';
import {
  getTrendType,
  enrichTrendsWithType,
  getTrendTypeLabel,
  getTrendTypeColor,
} from './trends';
import {
  createMockTrendItem,
  createMockTrendItems,
} from '@/test-utils/factories';
import type { TrendType, TrendsResponse } from '@/types/meli';

describe('getTrendType', () => {
  describe('fastest_growing category (index 0-9)', () => {
    it('should return fastest_growing for index 0', () => {
      expect(getTrendType(0)).toBe('fastest_growing');
    });

    it('should return fastest_growing for index 5 (mid-range)', () => {
      expect(getTrendType(5)).toBe('fastest_growing');
    });

    it('should return fastest_growing for index 9 (boundary)', () => {
      expect(getTrendType(9)).toBe('fastest_growing');
    });
  });

  describe('most_wanted category (index 10-29)', () => {
    it('should return most_wanted for index 10 (boundary)', () => {
      expect(getTrendType(10)).toBe('most_wanted');
    });

    it('should return most_wanted for index 20 (mid-range)', () => {
      expect(getTrendType(20)).toBe('most_wanted');
    });

    it('should return most_wanted for index 29 (boundary)', () => {
      expect(getTrendType(29)).toBe('most_wanted');
    });
  });

  describe('most_popular category (index 30+)', () => {
    it('should return most_popular for index 30 (boundary)', () => {
      expect(getTrendType(30)).toBe('most_popular');
    });

    it('should return most_popular for index 40 (mid-range)', () => {
      expect(getTrendType(40)).toBe('most_popular');
    });

    it('should return most_popular for index 49 (last expected index)', () => {
      expect(getTrendType(49)).toBe('most_popular');
    });

    it('should return most_popular for index 100 (beyond expected range)', () => {
      expect(getTrendType(100)).toBe('most_popular');
    });
  });

  describe('edge cases', () => {
    it('should handle negative index as fastest_growing', () => {
      // Negative indices satisfy the first condition (index < 10)
      expect(getTrendType(-1)).toBe('fastest_growing');
      expect(getTrendType(-100)).toBe('fastest_growing');
    });

    it('should handle very large index values', () => {
      expect(getTrendType(1000)).toBe('most_popular');
      expect(getTrendType(999999)).toBe('most_popular');
    });

    it('should handle zero correctly', () => {
      expect(getTrendType(0)).toBe('fastest_growing');
    });
  });
});

describe('enrichTrendsWithType', () => {
  describe('basic functionality', () => {
    it('should add trend_type to single trend item', () => {
      const trends: TrendsResponse = [
        createMockTrendItem({ keyword: 'samsung galaxy s24' }),
      ];

      const enriched = enrichTrendsWithType(trends);

      expect(enriched).toHaveLength(1);
      expect(enriched[0]).toHaveProperty('trend_type', 'fastest_growing');
      expect(enriched[0].keyword).toBe('samsung galaxy s24');
    });

    it('should add trend_type to multiple trend items', () => {
      const trends: TrendsResponse = createMockTrendItems(3);

      const enriched = enrichTrendsWithType(trends);

      expect(enriched).toHaveLength(3);
      enriched.forEach((trend) => {
        expect(trend).toHaveProperty('trend_type');
        expect(trend.trend_type).toBe('fastest_growing');
      });
    });

    it('should preserve original trend data', () => {
      const trends: TrendsResponse = [
        createMockTrendItem({
          keyword: 'test keyword',
          url: 'https://example.com',
        }),
      ];

      const enriched = enrichTrendsWithType(trends);

      expect(enriched[0].keyword).toBe('test keyword');
      expect(enriched[0].url).toBe('https://example.com');
    });
  });

  describe('trend type assignment by position', () => {
    it('should assign fastest_growing to first 10 items (0-9)', () => {
      const trends: TrendsResponse = createMockTrendItems(10);
      const enriched = enrichTrendsWithType(trends);

      enriched.forEach((trend) => {
        expect(trend.trend_type).toBe('fastest_growing');
      });
    });

    it('should assign most_wanted to items 10-29', () => {
      const trends: TrendsResponse = createMockTrendItems(30);
      const enriched = enrichTrendsWithType(trends);

      enriched.slice(10, 30).forEach((trend) => {
        expect(trend.trend_type).toBe('most_wanted');
      });
    });

    it('should assign most_popular to items 30+', () => {
      const trends: TrendsResponse = createMockTrendItems(50);
      const enriched = enrichTrendsWithType(trends);

      enriched.slice(30).forEach((trend) => {
        expect(trend.trend_type).toBe('most_popular');
      });
    });

    it('should handle full 50-item trends list', () => {
      const trends: TrendsResponse = createMockTrendItems(50);
      const enriched = enrichTrendsWithType(trends);

      expect(enriched).toHaveLength(50);

      // Check boundaries
      expect(enriched[0].trend_type).toBe('fastest_growing');
      expect(enriched[9].trend_type).toBe('fastest_growing');
      expect(enriched[10].trend_type).toBe('most_wanted');
      expect(enriched[29].trend_type).toBe('most_wanted');
      expect(enriched[30].trend_type).toBe('most_popular');
      expect(enriched[49].trend_type).toBe('most_popular');
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const trends: TrendsResponse = [];
      const enriched = enrichTrendsWithType(trends);

      expect(enriched).toEqual([]);
      expect(enriched).toHaveLength(0);
    });

    it('should not mutate original array', () => {
      const trends: TrendsResponse = createMockTrendItems(5);
      const originalTrends = JSON.parse(JSON.stringify(trends));

      enrichTrendsWithType(trends);

      expect(trends).toEqual(originalTrends);
      trends.forEach((trend) => {
        expect(trend).not.toHaveProperty('trend_type');
      });
    });

    it('should handle trends array with more than 50 items', () => {
      const trends: TrendsResponse = createMockTrendItems(100);
      const enriched = enrichTrendsWithType(trends);

      expect(enriched).toHaveLength(100);
      expect(enriched[99].trend_type).toBe('most_popular');
    });

    it('should handle single item at boundary positions', () => {
      // Index 9 (last fastest_growing)
      const trend9 = enrichTrendsWithType(createMockTrendItems(10));
      expect(trend9[9].trend_type).toBe('fastest_growing');

      // Index 10 (first most_wanted)
      const trend10 = enrichTrendsWithType(createMockTrendItems(11));
      expect(trend10[10].trend_type).toBe('most_wanted');

      // Index 29 (last most_wanted)
      const trend29 = enrichTrendsWithType(createMockTrendItems(30));
      expect(trend29[29].trend_type).toBe('most_wanted');

      // Index 30 (first most_popular)
      const trend30 = enrichTrendsWithType(createMockTrendItems(31));
      expect(trend30[30].trend_type).toBe('most_popular');
    });
  });
});

describe('getTrendTypeLabel', () => {
  describe('basic functionality', () => {
    it('should return correct label for fastest_growing', () => {
      expect(getTrendTypeLabel('fastest_growing')).toBe('Mayor crecimiento');
    });

    it('should return correct label for most_wanted', () => {
      expect(getTrendTypeLabel('most_wanted')).toBe('Más buscados');
    });

    it('should return correct label for most_popular', () => {
      expect(getTrendTypeLabel('most_popular')).toBe('Más populares');
    });
  });

  describe('type safety', () => {
    it('should handle all valid TrendType values', () => {
      const validTypes: TrendType[] = [
        'fastest_growing',
        'most_wanted',
        'most_popular',
      ];

      validTypes.forEach((type) => {
        const label = getTrendTypeLabel(type);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('label consistency', () => {
    it('should return Spanish labels (default language)', () => {
      expect(getTrendTypeLabel('fastest_growing')).toMatch(/Mayor/);
      expect(getTrendTypeLabel('most_wanted')).toMatch(/Más/);
      expect(getTrendTypeLabel('most_popular')).toMatch(/Más/);
    });

    it('should return unique labels for each type', () => {
      const labels = [
        getTrendTypeLabel('fastest_growing'),
        getTrendTypeLabel('most_wanted'),
        getTrendTypeLabel('most_popular'),
      ];

      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid type gracefully via type system', () => {
      // TypeScript should prevent this at compile time
      // Runtime behavior for invalid values would return undefined
      // but we rely on TypeScript's type safety
      const invalidType = 'invalid_type' as TrendType;
      const label = getTrendTypeLabel(invalidType);
      expect(label).toBeUndefined();
    });
  });
});

describe('getTrendTypeColor', () => {
  describe('basic functionality', () => {
    it('should return red for fastest_growing', () => {
      expect(getTrendTypeColor('fastest_growing')).toBe('red');
    });

    it('should return blue for most_wanted', () => {
      expect(getTrendTypeColor('most_wanted')).toBe('blue');
    });

    it('should return green for most_popular', () => {
      expect(getTrendTypeColor('most_popular')).toBe('green');
    });
  });

  describe('type safety', () => {
    it('should handle all valid TrendType values', () => {
      const validTypes: TrendType[] = [
        'fastest_growing',
        'most_wanted',
        'most_popular',
      ];

      validTypes.forEach((type) => {
        const color = getTrendTypeColor(type);
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      });
    });
  });

  describe('color consistency', () => {
    it('should return unique colors for each type', () => {
      const colors = [
        getTrendTypeColor('fastest_growing'),
        getTrendTypeColor('most_wanted'),
        getTrendTypeColor('most_popular'),
      ];

      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(3);
    });

    it('should return valid Mantine color names', () => {
      // Mantine supports these color names by default
      const validMantineColors = [
        'red',
        'blue',
        'green',
        'yellow',
        'orange',
        'pink',
        'purple',
        'cyan',
        'teal',
        'gray',
      ];

      const colorFastestGrowing = getTrendTypeColor('fastest_growing');
      const colorMostWanted = getTrendTypeColor('most_wanted');
      const colorMostPopular = getTrendTypeColor('most_popular');

      expect(validMantineColors).toContain(colorFastestGrowing);
      expect(validMantineColors).toContain(colorMostWanted);
      expect(validMantineColors).toContain(colorMostPopular);
    });
  });

  describe('visual semantics', () => {
    it('should use semantically appropriate colors', () => {
      // Red typically indicates urgency/growth
      expect(getTrendTypeColor('fastest_growing')).toBe('red');

      // Blue typically indicates importance/popularity
      expect(getTrendTypeColor('most_wanted')).toBe('blue');

      // Green typically indicates positive/success
      expect(getTrendTypeColor('most_popular')).toBe('green');
    });
  });

  describe('edge cases', () => {
    it('should handle invalid type gracefully via type system', () => {
      // TypeScript should prevent this at compile time
      // Runtime behavior for invalid values would return undefined
      const invalidType = 'invalid_type' as TrendType;
      const color = getTrendTypeColor(invalidType);
      expect(color).toBeUndefined();
    });
  });
});

describe('integration tests', () => {
  describe('enrichment workflow', () => {
    it('should enrich trends and get corresponding labels/colors', () => {
      const trends: TrendsResponse = createMockTrendItems(50);
      const enriched = enrichTrendsWithType(trends);

      enriched.forEach((trend, index) => {
        const trendType = trend.trend_type as TrendType;
        const label = getTrendTypeLabel(trendType);
        const color = getTrendTypeColor(trendType);

        expect(trendType).toBeDefined();
        expect(label).toBeDefined();
        expect(color).toBeDefined();

        // Verify consistency
        if (index < 10) {
          expect(trendType).toBe('fastest_growing');
          expect(label).toBe('Mayor crecimiento');
          expect(color).toBe('red');
        } else if (index < 30) {
          expect(trendType).toBe('most_wanted');
          expect(label).toBe('Más buscados');
          expect(color).toBe('blue');
        } else {
          expect(trendType).toBe('most_popular');
          expect(label).toBe('Más populares');
          expect(color).toBe('green');
        }
      });
    });

    it('should maintain data integrity throughout enrichment', () => {
      const trends: TrendsResponse = createMockTrendItems(10, (i) => ({
        keyword: `keyword ${i}`,
        url: `https://example.com/${i}`,
      }));

      const enriched = enrichTrendsWithType(trends);

      enriched.forEach((trend, index) => {
        // Original data preserved
        expect(trend.keyword).toBe(`keyword ${index}`);
        expect(trend.url).toBe(`https://example.com/${index}`);

        // New field added
        expect(trend.trend_type).toBe('fastest_growing');
      });
    });
  });

  describe('boundary transitions', () => {
    it('should handle transitions between categories correctly', () => {
      const trends: TrendsResponse = createMockTrendItems(50);
      const enriched = enrichTrendsWithType(trends);

      // Check transition from fastest_growing to most_wanted
      expect(enriched[9].trend_type).toBe('fastest_growing');
      expect(enriched[10].trend_type).toBe('most_wanted');

      // Check transition from most_wanted to most_popular
      expect(enriched[29].trend_type).toBe('most_wanted');
      expect(enriched[30].trend_type).toBe('most_popular');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle partial trends list (less than 50 items)', () => {
      // Sometimes API might return fewer trends
      const trends: TrendsResponse = createMockTrendItems(25);
      const enriched = enrichTrendsWithType(trends);

      expect(enriched).toHaveLength(25);
      expect(enriched[0].trend_type).toBe('fastest_growing');
      expect(enriched[9].trend_type).toBe('fastest_growing');
      expect(enriched[10].trend_type).toBe('most_wanted');
      expect(enriched[24].trend_type).toBe('most_wanted');
    });

    it('should handle exactly 10 items (all fastest_growing)', () => {
      const trends: TrendsResponse = createMockTrendItems(10);
      const enriched = enrichTrendsWithType(trends);

      expect(enriched).toHaveLength(10);
      enriched.forEach((trend) => {
        expect(trend.trend_type).toBe('fastest_growing');
      });
    });

    it('should handle exactly 30 items (fastest_growing + most_wanted)', () => {
      const trends: TrendsResponse = createMockTrendItems(30);
      const enriched = enrichTrendsWithType(trends);

      expect(enriched).toHaveLength(30);
      expect(enriched.filter((t) => t.trend_type === 'fastest_growing')).toHaveLength(10);
      expect(enriched.filter((t) => t.trend_type === 'most_wanted')).toHaveLength(20);
      expect(enriched.filter((t) => t.trend_type === 'most_popular')).toHaveLength(0);
    });
  });
});
