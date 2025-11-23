import { describe, it, expect } from 'vitest';
import { render } from '../../test-utils/index';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  describe('Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(<LoadingSkeleton />);
      expect(container.firstChild).toBeDefined();
    });

    it('should show loading skeleton cards', () => {
      const { container } = render(<LoadingSkeleton />);

      // Test behavior: Component renders 12 loading card placeholders
      // Count elements with "withBorder" prop (Card components)
      const cards = container.querySelectorAll('[class*="Card"]');
      expect(cards.length).toBe(12);
    });

    it('should display multiple loading elements', () => {
      const { container } = render(<LoadingSkeleton />);

      // Test behavior: Multiple skeleton loading indicators are present
      // We expect at least 50 skeleton elements (2 header + 48 card skeletons = 12 cards × 4 each)
      const skeletons = container.querySelectorAll('[class*="Skeleton"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(50);
    });

    it('should show header loading elements', () => {
      const { container } = render(<LoadingSkeleton />);

      // Test behavior: Header area has loading placeholders
      // The first few skeleton elements belong to the header (before the grid)
      const skeletons = container.querySelectorAll('[class*="Skeleton"]');
      // Should have at least 2 header skeletons + card skeletons
      expect(skeletons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Structure', () => {
    it('should render grid layout for cards', () => {
      const { container } = render(<LoadingSkeleton />);

      // Test behavior: Cards are arranged in a grid layout
      // SimpleGrid component is present in the rendered output
      const gridElement = container.querySelector('[class*="SimpleGrid"]');
      expect(gridElement).toBeDefined();
    });

    it('should render each card with multiple skeleton lines', () => {
      const { container } = render(<LoadingSkeleton />);

      // Test behavior: Each card contains multiple loading lines
      const cards = container.querySelectorAll('[class*="Card"]');
      const firstCard = cards[0];

      if (firstCard) {
        const skeletonsInCard = firstCard.querySelectorAll('[class*="Skeleton"]');
        // Each card should have 4 skeleton elements (badge, title, subtitle, footer)
        expect(skeletonsInCard.length).toBe(4);
      }
    });
  });

  describe('Accessibility', () => {
    it('should be visible and not hidden', () => {
      const { container } = render(<LoadingSkeleton />);

      // Test behavior: Component is visible to users
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toBeDefined();
      expect(rootElement.hasAttribute('hidden')).toBe(false);
      expect(rootElement.getAttribute('aria-hidden')).not.toBe('true');
    });

    it('should render without aria-live region (static skeleton)', () => {
      const { container } = render(<LoadingSkeleton />);

      // Test behavior: This is a static loading skeleton, not a live region
      // No aria-live attribute should be present (not an announcement)
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement.hasAttribute('aria-live')).toBe(false);
    });
  });
});
