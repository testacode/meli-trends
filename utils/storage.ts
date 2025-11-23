/**
 * LocalStorage utilities for user preferences
 */

const STORAGE_KEYS = {
  SELECTED_CATEGORY: 'meli-trends-selected-category',
} as const;

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
