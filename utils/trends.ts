import type { TrendItem, TrendType, TrendsResponse } from '@/types/meli';

/**
 * Get trend type based on position in the trends array
 * According to MercadoLibre API documentation:
 * - Elements 0-9: Fastest-growing searches (highest revenue increase)
 * - Elements 10-29: Most wanted searches (highest search volume)
 * - Elements 30-49: Most popular trends (significant rise vs 2 weeks ago)
 */
export function getTrendType(index: number): TrendType {
  if (index < 10) return 'fastest_growing';
  if (index < 30) return 'most_wanted';
  return 'most_popular';
}

/**
 * Enrich trends response with trend_type field based on position
 */
export function enrichTrendsWithType(trends: TrendsResponse): TrendItem[] {
  return trends.map((trend, index) => ({
    ...trend,
    trend_type: getTrendType(index),
  }));
}

/**
 * Get human-readable label for trend type
 */
export function getTrendTypeLabel(type: TrendType): string {
  const labels: Record<TrendType, string> = {
    fastest_growing: 'Mayor crecimiento',
    most_wanted: 'Más buscados',
    most_popular: 'Más populares',
  };
  return labels[type];
}

/**
 * Get color for trend type badge
 */
export function getTrendTypeColor(type: TrendType): string {
  const colors: Record<TrendType, string> = {
    fastest_growing: 'red',
    most_wanted: 'blue',
    most_popular: 'green',
  };
  return colors[type];
}
