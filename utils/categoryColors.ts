/**
 * Automatic category color generation based on category name
 * Uses a hash function to generate consistent colors for each category
 */

/**
 * Simple hash function to convert string to number
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Predefined color palette for categories
 * Using Mantine's built-in colors for consistency
 */
const CATEGORY_COLORS = [
  'meliBlue',
  'meliGreen',
  'meliRed',
  'meliYellow',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'yellow',
  'orange',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
] as const;

/**
 * Get a consistent color for a category name
 * Same category name will always return the same color
 */
export function getCategoryColor(categoryName: string): string {
  const hash = hashString(categoryName);
  const colorIndex = hash % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[colorIndex];
}

/**
 * Get a consistent rank badge color based on position
 * Supports both gradient (default) and flat styles
 */
export function getRankBadgeColor(
  position: number,
  style: 'gradient' | 'flat' = 'gradient'
): string {
  if (style === 'flat') {
    // Flat style - simple color based on position ranges
    if (position === 1) return 'yellow';
    if (position <= 3) return 'meliBlue';
    if (position <= 10) return 'meliGreen';
    return 'gray';
  }

  // Gradient style - more sophisticated coloring
  if (position === 1) return 'yellow';
  if (position === 2) return 'orange';
  if (position === 3) return 'meliBlue';
  if (position <= 5) return 'cyan';
  if (position <= 10) return 'meliGreen';
  if (position <= 20) return 'teal';
  return 'gray';
}

/**
 * Get rank badge variant based on style
 */
export function getRankBadgeVariant(
  position: number,
  style: 'gradient' | 'flat' = 'gradient'
): 'gradient' | 'filled' | 'light' {
  if (style === 'flat') {
    return 'filled';
  }

  // Gradient style - use gradient for top positions
  if (position <= 3) return 'gradient';
  if (position <= 10) return 'filled';
  return 'light';
}
