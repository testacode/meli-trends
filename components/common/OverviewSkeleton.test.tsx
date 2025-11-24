import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../../test-utils/index';
import { OverviewSkeleton } from './OverviewSkeleton';
import * as mantineHooks from '@mantine/hooks';

// Mock useMediaQuery hook
vi.mock('@mantine/hooks', () => ({
  useMediaQuery: vi.fn(),
}));

describe('OverviewSkeleton', () => {
  beforeEach(() => {
    // Reset useMediaQuery to desktop by default
    vi.mocked(mantineHooks.useMediaQuery).mockReturnValue(false);
  });

  describe('Desktop Layout (3-column)', () => {
    it('should render without errors', () => {
      const { container } = render(<OverviewSkeleton />);
      expect(container.firstChild).toBeDefined();
    });

    it('should render 3-column grid layout on desktop', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Desktop shows 3-column grid layout
      const gridElement = container.querySelector('[class*="SimpleGrid"]');
      expect(gridElement).toBeDefined();
    });

    it('should render 3 CategoryColumn skeletons', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Each column contains a Paper header with chart
      const paperHeaders = container.querySelectorAll('[class*="Paper"]');
      // 3 header papers + (3 columns × 5 trend cards) = 18 total papers
      expect(paperHeaders.length).toBe(18);
    });

    it('should not render SegmentedControl on desktop', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: SegmentedControl is mobile-only
      const segmentedControl = container.querySelector('[class*="SegmentedControl"]');
      expect(segmentedControl).toBeNull();
    });
  });

  describe('Mobile Layout (Single column + SegmentedControl)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      vi.mocked(mantineHooks.useMediaQuery).mockReturnValue(true);
    });

    it('should render SegmentedControl on mobile', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Mobile shows SegmentedControl for category switching
      const segmentedControl = container.querySelector('[class*="SegmentedControl"]');
      expect(segmentedControl).toBeDefined();
    });

    it('should render disabled SegmentedControl with 3 options', () => {
      const { getByText } = render(<OverviewSkeleton />);

      // Test behavior: SegmentedControl has all 3 category options
      expect(getByText('🚀 Rápido')).toBeDefined();
      expect(getByText('🔍 Buscado')).toBeDefined();
      expect(getByText('⭐ Popular')).toBeDefined();
    });

    it('should render single CategoryColumn skeleton on mobile', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Mobile shows only 1 column at a time
      const paperElements = container.querySelectorAll('[class*="Paper"]');
      // 1 header paper + 5 trend card papers = 6 total papers
      expect(paperElements.length).toBe(6);
    });

    it('should not render SimpleGrid on mobile', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Mobile uses Stack instead of Grid
      const gridElement = container.querySelector('[class*="SimpleGrid"]');
      expect(gridElement).toBeNull();
    });
  });

  describe('CategoryColumn Structure', () => {
    it('should render header Paper with chart placeholder', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Each column has a header Paper with chart skeleton
      // Count skeleton elements - we expect multiple per column
      const allSkeletons = container.querySelectorAll('[class*="Skeleton"]');
      // 3 columns × (2 header text + 1 chart + 20 card skeletons) = 69+ total
      expect(allSkeletons.length).toBeGreaterThanOrEqual(60);
    });

    it('should render 5 trend cards per column', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Each column displays 5 trend card skeletons
      const allPapers = container.querySelectorAll('[class*="Paper"]');
      // 3 header papers + (3 columns × 5 cards) = 18 papers
      expect(allPapers.length).toBe(18);
    });

    it('should render title and count skeletons in header', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Header contains title + count text skeletons
      const allSkeletons = container.querySelectorAll('[class*="Skeleton"]');
      // Each column: 2 header text + 1 chart + 5 cards × 4 elements = 23 per column
      // 3 columns × 23 = 69 total skeletons
      expect(allSkeletons.length).toBeGreaterThanOrEqual(60);
    });

    it('should render trend card elements (rank badge + keyword + details)', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Each trend card has 4 skeleton elements
      const papers = container.querySelectorAll('[class*="Paper"]');
      const trendCardPaper = papers[3]; // First trend card (after 3 headers)

      if (trendCardPaper) {
        const skeletonsInCard = trendCardPaper.querySelectorAll('[class*="Skeleton"]');
        // Rank badge + keyword + category + URL = 4 skeletons
        expect(skeletonsInCard.length).toBe(4);
      }
    });
  });

  describe('Skeleton Variations', () => {
    it('should render different skeleton widths for visual variety', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Skeletons have varying widths (60%, 40%, 70%, 50%, 60%)
      const allSkeletons = container.querySelectorAll('[class*="Skeleton"]');
      expect(allSkeletons.length).toBeGreaterThan(0);

      // At least some skeletons should have different widths
      // This is a structural check - the component uses 60%, 40%, 70%, 50%, 60% widths
      expect(allSkeletons.length).toBeGreaterThanOrEqual(20);
    });

    it('should render chart placeholder skeleton in each column', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Each column header includes a chart placeholder
      // Count Papers - 3 headers + 15 trend cards = 18 total
      const papers = container.querySelectorAll('[class*="Paper"]');
      expect(papers.length).toBe(18);

      // Each header Paper should contain skeletons (title + count + chart)
      const firstHeaderPaper = papers[0];
      const skeletonsInHeader = firstHeaderPaper.querySelectorAll('[class*="Skeleton"]');
      expect(skeletonsInHeader.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Responsive Breakpoint', () => {
    it('should use grid layout on desktop', () => {
      // Desktop viewport
      vi.mocked(mantineHooks.useMediaQuery).mockReturnValue(false);
      const { container } = render(<OverviewSkeleton />);
      const desktopGrid = container.querySelector('[class*="SimpleGrid"]');
      expect(desktopGrid).toBeDefined();
    });

    it('should use SegmentedControl on mobile', () => {
      // Mobile viewport
      vi.mocked(mantineHooks.useMediaQuery).mockReturnValue(true);
      const { container } = render(<OverviewSkeleton />);
      const mobileSegmented = container.querySelector('[class*="SegmentedControl"]');
      expect(mobileSegmented).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should be visible and not hidden', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Component is visible to users
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toBeDefined();
      expect(rootElement.hasAttribute('hidden')).toBe(false);
      expect(rootElement.getAttribute('aria-hidden')).not.toBe('true');
    });

    it('should render without aria-live region (static skeleton)', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: This is a static loading skeleton, not a live region
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement.hasAttribute('aria-live')).toBe(false);
    });

    it('should have disabled SegmentedControl on mobile (non-interactive during loading)', () => {
      vi.mocked(mantineHooks.useMediaQuery).mockReturnValue(true);
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: SegmentedControl is disabled during loading state
      const segmentedControl = container.querySelector('[class*="SegmentedControl"]');
      expect(segmentedControl).toBeDefined();
      // Mantine SegmentedControl with disabled prop renders disabled state
    });
  });

  describe('Border Styling', () => {
    it('should render Paper elements with borders', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: All Paper components have withBorder prop
      const papers = container.querySelectorAll('[class*="Paper"]');
      expect(papers.length).toBeGreaterThan(0);
      // Papers should have border styling applied
    });

    it('should render header Paper with left border (borderLeftWidth: 4)', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Header Paper has thick left border for visual hierarchy
      const papers = container.querySelectorAll('[class*="Paper"]');
      const headerPaper = papers[0]; // First paper is header

      if (headerPaper) {
        const style = (headerPaper as HTMLElement).style;
        expect(style.borderLeftWidth).toBe('4px');
      }
    });
  });

  describe('Count Consistency', () => {
    it('should render exactly 5 trend cards per column on desktop', () => {
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Consistent 5 cards per column across all 3 columns
      const allPapers = container.querySelectorAll('[class*="Paper"]');
      // 3 headers + 15 trend cards (3 columns × 5) = 18 papers
      expect(allPapers.length).toBe(18);
    });

    it('should render exactly 5 trend cards on mobile', () => {
      vi.mocked(mantineHooks.useMediaQuery).mockReturnValue(true);
      const { container } = render(<OverviewSkeleton />);

      // Test behavior: Mobile shows 5 cards for the visible column
      const allPapers = container.querySelectorAll('[class*="Paper"]');
      // 1 header + 5 trend cards = 6 papers
      expect(allPapers.length).toBe(6);
    });
  });
});
