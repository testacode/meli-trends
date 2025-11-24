/**
 * Tests for localStorage utilities
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveSelectedCategory,
  getSavedCategory,
  clearSavedCategories,
  saveViewMode,
  getViewMode,
  saveBadgeStyle,
  getBadgeStyle,
  type ViewMode,
  type BadgeStyle,
} from './storage';

describe('Storage Utilities', () => {
  // Mock localStorage
  let store: Record<string, string> = {};

  const localStorageMock = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    // Helper method to get all keys (for testing)
    keys: () => Object.keys(store),
  };

  beforeEach(() => {
    // Reset the store before each test
    store = {};
    vi.clearAllMocks();

    // Set up global localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    // Make localStorage enumerable so Object.keys(localStorage) works
    Object.defineProperty(window, 'localStorage', {
      value: new Proxy(localStorageMock, {
        ownKeys: () => Object.keys(store),
        getOwnPropertyDescriptor: (target, key) => {
          if (typeof key === 'string' && key in store) {
            return {
              enumerable: true,
              configurable: true,
            };
          }
          return undefined;
        },
      }),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveSelectedCategory', () => {
    it('should save category to localStorage with correct key', () => {
      const countryId = 'MLA';
      const categoryId = 'electronics';

      saveSelectedCategory(countryId, categoryId);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'meli-trends-selected-category-MLA',
        'electronics'
      );
      expect(localStorageMock.getItem('meli-trends-selected-category-MLA')).toBe('electronics');
    });

    it('should save category for different countries independently', () => {
      saveSelectedCategory('MLA', 'electronics');
      saveSelectedCategory('MLB', 'sports');

      expect(localStorageMock.getItem('meli-trends-selected-category-MLA')).toBe('electronics');
      expect(localStorageMock.getItem('meli-trends-selected-category-MLB')).toBe('sports');
    });

    it('should remove category when categoryId is null', () => {
      // First save a category
      saveSelectedCategory('MLA', 'electronics');
      expect(localStorageMock.getItem('meli-trends-selected-category-MLA')).toBe('electronics');

      // Then remove it
      saveSelectedCategory('MLA', null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('meli-trends-selected-category-MLA');
      expect(localStorageMock.getItem('meli-trends-selected-category-MLA')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('localStorage is full');

      localStorageMock.setItem.mockImplementationOnce(() => {
        throw error;
      });

      // Should not throw
      expect(() => saveSelectedCategory('MLA', 'electronics')).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to save category to localStorage:',
        error
      );

      consoleWarnSpy.mockRestore();
    });

    it('should do nothing when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Simulating SSR environment
      delete global.window;

      // Should not throw
      expect(() => saveSelectedCategory('MLA', 'electronics')).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });

    it('should update existing category value', () => {
      saveSelectedCategory('MLA', 'electronics');
      expect(localStorageMock.getItem('meli-trends-selected-category-MLA')).toBe('electronics');

      saveSelectedCategory('MLA', 'sports');
      expect(localStorageMock.getItem('meli-trends-selected-category-MLA')).toBe('sports');
    });

    it('should handle special characters in categoryId', () => {
      const categoryId = 'electronics & computers';
      saveSelectedCategory('MLA', categoryId);

      expect(localStorageMock.getItem('meli-trends-selected-category-MLA')).toBe(categoryId);
    });
  });

  describe('getSavedCategory', () => {
    it('should retrieve saved category from localStorage', () => {
      localStorageMock.setItem('meli-trends-selected-category-MLA', 'electronics');

      const result = getSavedCategory('MLA');

      expect(localStorageMock.getItem).toHaveBeenCalledWith('meli-trends-selected-category-MLA');
      expect(result).toBe('electronics');
    });

    it('should return null when category is not saved', () => {
      const result = getSavedCategory('MLA');

      expect(result).toBeNull();
    });

    it('should retrieve different categories for different countries', () => {
      localStorageMock.setItem('meli-trends-selected-category-MLA', 'electronics');
      localStorageMock.setItem('meli-trends-selected-category-MLB', 'sports');

      expect(getSavedCategory('MLA')).toBe('electronics');
      expect(getSavedCategory('MLB')).toBe('sports');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('localStorage access denied');

      localStorageMock.getItem.mockImplementationOnce(() => {
        throw error;
      });

      const result = getSavedCategory('MLA');

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to read category from localStorage:',
        error
      );

      consoleWarnSpy.mockRestore();
    });

    it('should return null when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Simulating SSR environment
      delete global.window;

      const result = getSavedCategory('MLA');

      expect(result).toBeNull();

      // Restore window
      global.window = originalWindow;
    });

    it('should retrieve category with special characters', () => {
      const categoryId = 'electronics & computers';
      localStorageMock.setItem('meli-trends-selected-category-MLA', categoryId);

      const result = getSavedCategory('MLA');

      expect(result).toBe(categoryId);
    });
  });

  describe('clearSavedCategories', () => {
    it('should remove all saved categories', () => {
      localStorageMock.setItem('meli-trends-selected-category-MLA', 'electronics');
      localStorageMock.setItem('meli-trends-selected-category-MLB', 'sports');
      localStorageMock.setItem('meli-trends-selected-category-MLC', 'fashion');

      clearSavedCategories();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('meli-trends-selected-category-MLA');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('meli-trends-selected-category-MLB');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('meli-trends-selected-category-MLC');

      expect(getSavedCategory('MLA')).toBeNull();
      expect(getSavedCategory('MLB')).toBeNull();
      expect(getSavedCategory('MLC')).toBeNull();
    });

    it('should only remove category keys, not other localStorage items', () => {
      localStorageMock.setItem('meli-trends-selected-category-MLA', 'electronics');
      localStorageMock.setItem('other-app-data', 'some-value');
      localStorageMock.setItem('user-preferences', 'dark-mode');

      clearSavedCategories();

      expect(localStorageMock.getItem('meli-trends-selected-category-MLA')).toBeNull();
      expect(localStorageMock.getItem('other-app-data')).toBe('some-value');
      expect(localStorageMock.getItem('user-preferences')).toBe('dark-mode');
    });

    it('should do nothing when no categories are saved', () => {
      localStorageMock.setItem('other-key', 'value');

      clearSavedCategories();

      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(localStorageMock.getItem('other-key')).toBe('value');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('localStorage access denied');

      // Mock localStorage.removeItem to throw error
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw error;
      });

      // Set up a category to trigger removeItem
      localStorageMock.setItem('meli-trends-selected-category-MLA', 'electronics');

      // Should not throw
      expect(() => clearSavedCategories()).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to clear categories from localStorage:',
        error
      );

      consoleWarnSpy.mockRestore();
    });

    it('should do nothing when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Simulating SSR environment
      delete global.window;

      // Should not throw
      expect(() => clearSavedCategories()).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });

    it('should handle partial prefix matches correctly', () => {
      // These should be removed
      localStorageMock.setItem('meli-trends-selected-category-MLA', 'electronics');
      localStorageMock.setItem('meli-trends-selected-category-MLB-extra', 'sports');

      // This should NOT be removed (different prefix)
      localStorageMock.setItem('meli-trends-other-MLA', 'value');

      clearSavedCategories();

      expect(localStorageMock.getItem('meli-trends-selected-category-MLA')).toBeNull();
      expect(localStorageMock.getItem('meli-trends-selected-category-MLB-extra')).toBeNull();
      expect(localStorageMock.getItem('meli-trends-other-MLA')).toBe('value');
    });
  });

  describe('saveViewMode', () => {
    it('should save view mode to localStorage', () => {
      saveViewMode('table');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('meli-trends-view-mode', 'table');
      expect(localStorageMock.getItem('meli-trends-view-mode')).toBe('table');
    });

    it('should save different view modes', () => {
      const viewModes: ViewMode[] = ['gallery', 'table'];

      viewModes.forEach((mode) => {
        saveViewMode(mode);
        expect(localStorageMock.getItem('meli-trends-view-mode')).toBe(mode);
      });
    });

    it('should update existing view mode value', () => {
      saveViewMode('gallery');
      expect(localStorageMock.getItem('meli-trends-view-mode')).toBe('gallery');

      saveViewMode('table');
      expect(localStorageMock.getItem('meli-trends-view-mode')).toBe('table');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('localStorage is full');

      localStorageMock.setItem.mockImplementationOnce(() => {
        throw error;
      });

      // Should not throw
      expect(() => saveViewMode('table')).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save view mode to localStorage:', error);

      consoleWarnSpy.mockRestore();
    });

    it('should do nothing when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Simulating SSR environment
      delete global.window;

      // Should not throw
      expect(() => saveViewMode('table')).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('getViewMode', () => {
    it('should retrieve saved view mode from localStorage', () => {
      localStorageMock.setItem('meli-trends-view-mode', 'table');

      const result = getViewMode();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('meli-trends-view-mode');
      expect(result).toBe('table');
    });

    it('should return "gallery" as default when nothing is saved', () => {
      const result = getViewMode();

      expect(result).toBe('gallery');
    });

    it('should retrieve all valid view modes', () => {
      const viewModes: ViewMode[] = ['gallery', 'table'];

      viewModes.forEach((mode) => {
        localStorageMock.setItem('meli-trends-view-mode', mode);
        expect(getViewMode()).toBe(mode);
      });
    });

    it('should return "gallery" for invalid saved values', () => {
      // Save an invalid value
      localStorageMock.setItem('meli-trends-view-mode', 'invalid-mode');

      const result = getViewMode();

      expect(result).toBe('gallery');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('localStorage access denied');

      localStorageMock.getItem.mockImplementationOnce(() => {
        throw error;
      });

      const result = getViewMode();

      expect(result).toBe('gallery');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to read view mode from localStorage:',
        error
      );

      consoleWarnSpy.mockRestore();
    });

    it('should return "gallery" when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Simulating SSR environment
      delete global.window;

      const result = getViewMode();

      expect(result).toBe('gallery');

      // Restore window
      global.window = originalWindow;
    });

    it('should handle empty string as invalid value', () => {
      localStorageMock.setItem('meli-trends-view-mode', '');

      const result = getViewMode();

      expect(result).toBe('gallery');
    });

    it('should handle null value from localStorage', () => {
      // localStorage.getItem returns null when key doesn't exist
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = getViewMode();

      expect(result).toBe('gallery');
    });
  });

  describe('Integration scenarios', () => {
    it('should save, retrieve, and clear category in sequence', () => {
      // Save
      saveSelectedCategory('MLA', 'electronics');

      // Retrieve
      expect(getSavedCategory('MLA')).toBe('electronics');

      // Update
      saveSelectedCategory('MLA', 'sports');
      expect(getSavedCategory('MLA')).toBe('sports');

      // Clear
      clearSavedCategories();
      expect(getSavedCategory('MLA')).toBeNull();
    });

    it('should handle multiple countries in parallel', () => {
      const countries = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO'];
      const categories = ['electronics', 'sports', 'fashion', 'home', 'toys'];

      // Save categories for all countries
      countries.forEach((country, index) => {
        saveSelectedCategory(country, categories[index]);
      });

      // Verify all saved correctly
      countries.forEach((country, index) => {
        expect(getSavedCategory(country)).toBe(categories[index]);
      });

      // Clear one country
      saveSelectedCategory('MLB', null);
      expect(getSavedCategory('MLB')).toBeNull();
      expect(getSavedCategory('MLA')).toBe('electronics'); // Others remain

      // Clear all
      clearSavedCategories();
      countries.forEach((country) => {
        expect(getSavedCategory(country)).toBeNull();
      });
    });

    it('should handle rapid successive saves', () => {
      saveSelectedCategory('MLA', 'electronics');
      saveSelectedCategory('MLA', 'sports');
      saveSelectedCategory('MLA', 'fashion');
      saveSelectedCategory('MLA', 'home');

      expect(getSavedCategory('MLA')).toBe('home');
    });

    it('should handle viewMode and category storage independently', () => {
      // Save both
      saveSelectedCategory('MLA', 'electronics');
      saveViewMode('table');

      // Verify both saved correctly
      expect(getSavedCategory('MLA')).toBe('electronics');
      expect(getViewMode()).toBe('table');

      // Update category shouldn't affect viewMode
      saveSelectedCategory('MLA', 'sports');
      expect(getViewMode()).toBe('table');
      expect(getSavedCategory('MLA')).toBe('sports');

      // Update viewMode shouldn't affect category
      saveViewMode('table');
      expect(getSavedCategory('MLA')).toBe('sports');
      expect(getViewMode()).toBe('table');

      // Clear categories shouldn't affect viewMode
      clearSavedCategories();
      expect(getSavedCategory('MLA')).toBeNull();
      expect(getViewMode()).toBe('table');
    });

    it('should save, retrieve, and update view mode in sequence', () => {
      // Initial save
      saveViewMode('gallery');
      expect(getViewMode()).toBe('gallery');

      // Update
      saveViewMode('table');
      expect(getViewMode()).toBe('table');

      // Back to gallery
      saveViewMode('gallery');
      expect(getViewMode()).toBe('gallery');
    });
  });

  describe('saveBadgeStyle', () => {
    it('should save badge style to localStorage', () => {
      saveBadgeStyle('flat');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('meli-trends-badge-style', 'flat');
      expect(localStorageMock.getItem('meli-trends-badge-style')).toBe('flat');
    });

    it('should save different badge styles', () => {
      const badgeStyles: BadgeStyle[] = ['gradient', 'flat'];

      badgeStyles.forEach((style) => {
        saveBadgeStyle(style);
        expect(localStorageMock.getItem('meli-trends-badge-style')).toBe(style);
      });
    });

    it('should update existing badge style value', () => {
      saveBadgeStyle('gradient');
      expect(localStorageMock.getItem('meli-trends-badge-style')).toBe('gradient');

      saveBadgeStyle('flat');
      expect(localStorageMock.getItem('meli-trends-badge-style')).toBe('flat');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('localStorage is full');

      localStorageMock.setItem.mockImplementationOnce(() => {
        throw error;
      });

      // Should not throw
      expect(() => saveBadgeStyle('flat')).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save badge style to localStorage:', error);

      consoleWarnSpy.mockRestore();
    });

    it('should do nothing when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Simulating SSR environment
      delete global.window;

      // Should not throw
      expect(() => saveBadgeStyle('flat')).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('getBadgeStyle', () => {
    it('should retrieve saved badge style from localStorage', () => {
      localStorageMock.setItem('meli-trends-badge-style', 'flat');

      const result = getBadgeStyle();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('meli-trends-badge-style');
      expect(result).toBe('flat');
    });

    it('should return "gradient" as default when nothing is saved', () => {
      const result = getBadgeStyle();

      expect(result).toBe('gradient');
    });

    it('should retrieve all valid badge styles', () => {
      const badgeStyles: BadgeStyle[] = ['gradient', 'flat'];

      badgeStyles.forEach((style) => {
        localStorageMock.setItem('meli-trends-badge-style', style);
        expect(getBadgeStyle()).toBe(style);
      });
    });

    it('should return "gradient" for invalid saved values', () => {
      // Save an invalid value
      localStorageMock.setItem('meli-trends-badge-style', 'invalid-style');

      const result = getBadgeStyle();

      expect(result).toBe('gradient');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('localStorage access denied');

      localStorageMock.getItem.mockImplementationOnce(() => {
        throw error;
      });

      const result = getBadgeStyle();

      expect(result).toBe('gradient');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to read badge style from localStorage:',
        error
      );

      consoleWarnSpy.mockRestore();
    });

    it('should return "gradient" when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Simulating SSR environment
      delete global.window;

      const result = getBadgeStyle();

      expect(result).toBe('gradient');

      // Restore window
      global.window = originalWindow;
    });

    it('should handle empty string as invalid value', () => {
      localStorageMock.setItem('meli-trends-badge-style', '');

      const result = getBadgeStyle();

      expect(result).toBe('gradient');
    });

    it('should handle null value from localStorage', () => {
      // localStorage.getItem returns null when key doesn't exist
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = getBadgeStyle();

      expect(result).toBe('gradient');
    });
  });

  describe('Badge Style Integration', () => {
    it('should save, retrieve, and update badge style in sequence', () => {
      // Initial save
      saveBadgeStyle('gradient');
      expect(getBadgeStyle()).toBe('gradient');

      // Update
      saveBadgeStyle('flat');
      expect(getBadgeStyle()).toBe('flat');

      // Back to gradient
      saveBadgeStyle('gradient');
      expect(getBadgeStyle()).toBe('gradient');
    });

    it('should handle badgeStyle, viewMode and category storage independently', () => {
      // Save all three
      saveSelectedCategory('MLA', 'electronics');
      saveViewMode('table');
      saveBadgeStyle('flat');

      // Verify all saved correctly
      expect(getSavedCategory('MLA')).toBe('electronics');
      expect(getViewMode()).toBe('table');
      expect(getBadgeStyle()).toBe('flat');

      // Update category shouldn't affect others
      saveSelectedCategory('MLA', 'sports');
      expect(getViewMode()).toBe('table');
      expect(getBadgeStyle()).toBe('flat');
      expect(getSavedCategory('MLA')).toBe('sports');

      // Update viewMode shouldn't affect others
      saveViewMode('gallery');
      expect(getSavedCategory('MLA')).toBe('sports');
      expect(getBadgeStyle()).toBe('flat');
      expect(getViewMode()).toBe('gallery');

      // Update badge style shouldn't affect others
      saveBadgeStyle('gradient');
      expect(getSavedCategory('MLA')).toBe('sports');
      expect(getViewMode()).toBe('gallery');
      expect(getBadgeStyle()).toBe('gradient');

      // Clear categories shouldn't affect viewMode or badgeStyle
      clearSavedCategories();
      expect(getSavedCategory('MLA')).toBeNull();
      expect(getViewMode()).toBe('gallery');
      expect(getBadgeStyle()).toBe('gradient');
    });
  });
});
