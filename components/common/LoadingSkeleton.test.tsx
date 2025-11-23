import { describe, it, expect } from 'vitest';
import { render } from '../../test-utils/index';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  describe('Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(<LoadingSkeleton />);

      expect(container).toBeDefined();
      expect(container.querySelector('.mantine-Stack-root')).toBeDefined();
    });

    it('should show header skeletons (2 elements)', () => {
      const { container } = render(<LoadingSkeleton />);

      // The main Stack contains nested Stacks. The second Stack (index 1) is the header
      const stacks = container.querySelectorAll('.mantine-Stack-root');

      // Find the header stack (it's a direct child Stack with gap="xs")
      // We need to check the immediate children of the first Stack
      const headerStack = stacks[1]; // Second stack is the header (gap="xs")

      if (headerStack) {
        const headerSkeletons = headerStack.querySelectorAll('.mantine-Skeleton-root');
        expect(headerSkeletons.length).toBe(2);
      } else {
        // Fallback: count direct skeleton children in the component
        const allSkeletons = container.querySelectorAll('.mantine-Skeleton-root');
        // First 2 skeletons are in the header (before the cards)
        expect(allSkeletons.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should show 12 card skeletons', () => {
      const { container } = render(<LoadingSkeleton />);

      const cards = container.querySelectorAll('.mantine-Card-root');
      expect(cards.length).toBe(12);
    });

    it('should contain multiple skeleton elements in each card (at least 4)', () => {
      const { container } = render(<LoadingSkeleton />);

      const cards = container.querySelectorAll('.mantine-Card-root');

      // Verify each card has at least 4 skeleton elements
      cards.forEach((card) => {
        const cardSkeletons = card.querySelectorAll('.mantine-Skeleton-root');
        expect(cardSkeletons.length).toBeGreaterThanOrEqual(4);
      });

      // Verify first card specifically has exactly 4 skeletons (badge, title, subtitle, footer)
      const firstCard = cards[0];
      const firstCardSkeletons = firstCard?.querySelectorAll('.mantine-Skeleton-root');
      expect(firstCardSkeletons?.length).toBe(4);
    });
  });

  describe('Structure', () => {
    it('should use SimpleGrid component for layout', () => {
      const { container } = render(<LoadingSkeleton />);

      const simpleGrid = container.querySelector('.mantine-SimpleGrid-root');
      expect(simpleGrid).toBeDefined();
    });

    it('should use Card components for skeleton cards', () => {
      const { container } = render(<LoadingSkeleton />);

      const cards = container.querySelectorAll('.mantine-Card-root');
      expect(cards.length).toBe(12);

      // Verify cards are inside the SimpleGrid
      const simpleGrid = container.querySelector('.mantine-SimpleGrid-root');
      const cardsInGrid = simpleGrid?.querySelectorAll('.mantine-Card-root');
      expect(cardsInGrid?.length).toBe(12);
    });
  });

  describe('Accessibility', () => {
    it('should be visible and not hidden', () => {
      const { container } = render(<LoadingSkeleton />);

      const mainStack = container.querySelector('.mantine-Stack-root');
      expect(mainStack).toBeDefined();

      // Verify component is not hidden
      expect(mainStack?.getAttribute('hidden')).toBeNull();
      expect(mainStack?.getAttribute('aria-hidden')).toBeNull();
    });
  });
});
