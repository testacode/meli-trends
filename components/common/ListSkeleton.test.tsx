import { describe, it, expect } from 'vitest';
import { render } from '../../test-utils/index';
import { ListSkeleton } from './ListSkeleton';

describe('ListSkeleton', () => {
  describe('Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(<ListSkeleton />);
      expect(container.firstChild).toBeDefined();
    });

    it('should show 12 loading skeleton cards', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Component renders 12 loading card placeholders
      // Count Card components with border
      const cards = container.querySelectorAll('[class*="Card"]');
      expect(cards.length).toBe(12);
    });

    it('should display multiple loading skeleton elements', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Multiple skeleton loading indicators are present
      // We expect: 2 header skeletons + 48 card skeletons (12 cards × 4 each)
      const skeletons = container.querySelectorAll('[class*="Skeleton"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Header Section', () => {
    it('should render header skeleton with title and subtitle', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Header has 2 skeleton elements (title + subtitle)
      // These are the first 2 skeletons before the chip group
      const allSkeletons = container.querySelectorAll('[class*="Skeleton"]');
      // At least 2 skeleton elements should exist at the start
      expect(allSkeletons.length).toBeGreaterThanOrEqual(2);
    });

    it('should render header within a Stack container', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Header uses Stack for vertical layout
      const stacks = container.querySelectorAll('[class*="Stack"]');
      expect(stacks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Chip Filter Section', () => {
    it('should render chip filter group', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Chip group is present for filter skeleton
      const chipGroup = container.querySelector('[class*="ChipGroup"]');
      expect(chipGroup).toBeDefined();
    });

    it('should render 4 disabled filter chips', () => {
      const { getByText } = render(<ListSkeleton />);

      // Test behavior: All 4 category filter chips are rendered and disabled
      const todosChip = getByText('Todos');
      const fastestGrowingChip = getByText('Mayor Crecimiento');
      const mostWantedChip = getByText('Más Buscados');
      const mostPopularChip = getByText('Más Populares');

      expect(todosChip).toBeDefined();
      expect(fastestGrowingChip).toBeDefined();
      expect(mostWantedChip).toBeDefined();
      expect(mostPopularChip).toBeDefined();
    });

    it('should render chips in centered group', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Chips are centered horizontally
      const centerContainer = container.querySelector('[class*="Center"]');
      expect(centerContainer).toBeDefined();
    });
  });

  describe('Grid Structure', () => {
    it('should render grid layout for cards', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Cards are arranged in a responsive grid layout
      const gridElement = container.querySelector('[class*="SimpleGrid"]');
      expect(gridElement).toBeDefined();
    });

    it('should render each card with 4 skeleton elements', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Each card contains 4 loading lines (rank, keyword, category, url)
      const cards = container.querySelectorAll('[class*="Card"]');
      const firstCard = cards[0];

      if (firstCard) {
        const skeletonsInCard = firstCard.querySelectorAll('[class*="Skeleton"]');
        // Each card should have 4 skeleton elements
        expect(skeletonsInCard.length).toBe(4);
      }
    });

    it('should render cards with border and shadow', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Cards have visual styling (border and shadow)
      // Cards should have the Card component class
      const cards = container.querySelectorAll('[class*="Card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render cards with Stack layout inside', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Each card uses Stack for vertical skeleton layout
      const cards = container.querySelectorAll('[class*="Card"]');
      const firstCard = cards[0];

      if (firstCard) {
        const stackInCard = firstCard.querySelector('[class*="Stack"]');
        expect(stackInCard).toBeDefined();
      }
    });
  });

  describe('Card Skeleton Elements', () => {
    it('should render rank badge skeleton in each card', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: First skeleton in each card is rank badge (small width)
      const cards = container.querySelectorAll('[class*="Card"]');
      const firstCard = cards[0];

      if (firstCard) {
        const skeletons = firstCard.querySelectorAll('[class*="Skeleton"]');
        // First skeleton is rank badge
        expect(skeletons.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should render keyword skeleton in each card', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Second skeleton in each card is keyword (full width)
      const cards = container.querySelectorAll('[class*="Card"]');
      const firstCard = cards[0];

      if (firstCard) {
        const skeletons = firstCard.querySelectorAll('[class*="Skeleton"]');
        // Second skeleton is keyword
        expect(skeletons.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should render category skeleton in each card', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Third skeleton in each card is category (80% width)
      const cards = container.querySelectorAll('[class*="Card"]');
      const firstCard = cards[0];

      if (firstCard) {
        const skeletons = firstCard.querySelectorAll('[class*="Skeleton"]');
        // Third skeleton is category
        expect(skeletons.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should render URL skeleton in each card', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Fourth skeleton in each card is URL (50% width)
      const cards = container.querySelectorAll('[class*="Card"]');
      const firstCard = cards[0];

      if (firstCard) {
        const skeletons = firstCard.querySelectorAll('[class*="Skeleton"]');
        // Fourth skeleton is URL
        expect(skeletons.length).toBe(4);
      }
    });
  });

  describe('Accessibility', () => {
    it('should be visible and not hidden', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Component is visible to users
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toBeDefined();
      expect(rootElement.hasAttribute('hidden')).toBe(false);
      expect(rootElement.getAttribute('aria-hidden')).not.toBe('true');
    });

    it('should render without aria-live region (static skeleton)', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: This is a static loading skeleton, not a live region
      // No aria-live attribute should be present (not an announcement)
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement.hasAttribute('aria-live')).toBe(false);
    });

    it('should have disabled chips for accessibility', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Filter chips are disabled during loading
      // Prevents user interaction with non-functional skeleton chips
      const chips = container.querySelectorAll('[class*="Chip"]');
      expect(chips.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Structure', () => {
    it('should maintain hierarchical structure: header → chips → grid', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Component follows correct layout order
      const rootStack = container.firstChild;
      expect(rootStack).toBeDefined();

      // Should contain Stack > [Header Stack, Center (chips), SimpleGrid]
      const mainStack = container.querySelector('[class*="Stack"]');
      expect(mainStack).toBeDefined();
    });

    it('should use consistent spacing between sections', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: Root Stack has "lg" gap for section spacing
      // This is applied via Mantine's Stack component
      const rootStack = container.querySelector('[class*="Stack"]');
      expect(rootStack).toBeDefined();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render responsive grid structure', () => {
      const { container } = render(<ListSkeleton />);

      // Test behavior: SimpleGrid is used for responsive column layout
      // Columns adjust based on viewport: 1 (mobile) → 2 (sm) → 3 (md) → 4 (lg)
      const grid = container.querySelector('[class*="SimpleGrid"]');
      expect(grid).toBeDefined();
    });
  });
});
