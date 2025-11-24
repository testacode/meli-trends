/**
 * LocalStorage utilities for user preferences
 */

const STORAGE_KEYS = {
  SELECTED_CATEGORY: 'meli-trends-selected-category',
  VIEW_MODE: 'meli-trends-view-mode',
} as const;

/**
 * View modes for trends display
 */
export type ViewMode = 'gallery' | 'table' | 'list';

/**
 * Save selected category to localStorage
 */
export function saveSelectedCategory(countryId: string, categoryId: string | null): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `${STORAGE_KEYS.SELECTED_CATEGORY}-${countryId}`;
    if (categoryId) {
      localStorage.setItem(key, categoryId);
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Failed to save category to localStorage:', error);
  }
}

/**
 * Get saved category from localStorage for a specific country
 */
export function getSavedCategory(countryId: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = `${STORAGE_KEYS.SELECTED_CATEGORY}-${countryId}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read category from localStorage:', error);
    return null;
  }
}

/**
 * Clear all saved categories
 */
export function clearSavedCategories(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEYS.SELECTED_CATEGORY)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear categories from localStorage:', error);
  }
}

/**
 * Save view mode preference to localStorage
 */
export function saveViewMode(mode: ViewMode): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  } catch (error) {
    console.warn('Failed to save view mode to localStorage:', error);
  }
}

/**
 * Get saved view mode from localStorage
 * Defaults to 'gallery' if not set
 */
export function getViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'gallery';

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    if (saved === 'table' || saved === 'list' || saved === 'gallery') {
      return saved;
    }
    return 'gallery';
  } catch (error) {
    console.warn('Failed to read view mode from localStorage:', error);
    return 'gallery';
  }
}
