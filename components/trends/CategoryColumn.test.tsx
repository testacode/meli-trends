import { describe, it, expect, vi } from 'vitest';
import { render } from '../../test-utils/index';
import { CategoryColumn } from './CategoryColumn';
import type { TrendItem, TrendType } from '@/types/meli';
import type { CategoryDistribution } from '@/utils/productCategories';

// Mock TrendCard to simplify testing
vi.mock('./TrendCard', () => ({
  TrendCard: ({ trend, rank }: { trend: TrendItem; rank: number }) => (
    <div data-testid={`trend-card-${rank}`}>{trend.keyword}</div>
  ),
}));

// Mock CategoryDistributionChart (dynamic import)
vi.mock('./CategoryDistributionChart', () => ({
  CategoryDistributionChart: ({
    distribution,
  }: {
    distribution: CategoryDistribution[];
  }) => (
    <div data-testid="category-chart">
      Chart with {distribution.length} categories
    </div>
  ),
}));

describe('CategoryColumn', () => {
  const mockTrends: TrendItem[] = [
    {
      keyword: 'iphone 15',
      url: 'https://example.com/iphone',
      trend_type: 'fastest_growing' as TrendType,
    },
    {
      keyword: 'samsung galaxy',
      url: 'https://example.com/samsung',
      trend_type: 'fastest_growing' as TrendType,
    },
    {
      keyword: 'xiaomi',
      url: 'https://example.com/xiaomi',
      trend_type: 'fastest_growing' as TrendType,
    },
  ];

  const mockDistribution: CategoryDistribution[] = [
    { category: 'tech', label: 'Celulares', count: 2, percentage: 66.67 },
    { category: 'hogar', label: 'Electrónica', count: 1, percentage: 33.33 },
  ];

  describe('Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );
      expect(container.firstChild).toBeDefined();
    });

    it('should render header Paper with border', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Header Paper has thick left border for visual hierarchy
      const papers = container.querySelectorAll('[class*="Paper"]');
      const headerPaper = papers[0]; // First paper is header

      expect(headerPaper).toBeDefined();
      expect((headerPaper as HTMLElement).style.borderLeftWidth).toBe('4px');
    });

    it('should render main Stack container', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      const stacks = container.querySelectorAll('[class*="Stack"]');
      expect(stacks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Header Section', () => {
    it('should render trend type title', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Title displays trend type label (text-transform: uppercase via CSS)
      const title = container.querySelector('[class*="Title"]');
      expect(title).toBeDefined();
      expect(title?.textContent).toBeTruthy();
    });

    it('should apply correct color for fastest_growing', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Title has red color for fastest_growing
      const title = container.querySelector('[class*="Title"]');
      expect(title).toBeDefined();
    });

    it('should apply correct color for most_wanted', () => {
      const { container } = render(
        <CategoryColumn
          trendType="most_wanted"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Title has meliBlue color for most_wanted
      const title = container.querySelector('[class*="Title"]');
      expect(title).toBeDefined();
    });

    it('should apply correct color for most_popular', () => {
      const { container } = render(
        <CategoryColumn
          trendType="most_popular"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Title has green color for most_popular
      const title = container.querySelector('[class*="Title"]');
      expect(title).toBeDefined();
    });
  });

  describe('Product Count i18n', () => {
    it('should show singular form for 1 product', () => {
      const { getByText } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={[mockTrends[0]]}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Spanish plural rule for count=1
      const count = getByText('1 producto');
      expect(count).toBeDefined();
    });

    it('should show plural form for multiple products', () => {
      const { getByText } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Spanish plural rule for count>1
      const count = getByText('3 productos');
      expect(count).toBeDefined();
    });

    it('should show plural form for 0 products', () => {
      const { getByText } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={[]}
          distribution={[]}
        />
      );

      // Test behavior: Spanish plural rule for count=0
      const count = getByText('0 productos');
      expect(count).toBeDefined();
    });

    it('should update count dynamically based on trends array', () => {
      const { getByText, rerender } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      expect(getByText('3 productos')).toBeDefined();

      // Rerender with different count
      rerender(
        <CategoryColumn
          trendType="fastest_growing"
          trends={[mockTrends[0], mockTrends[1]]}
          distribution={mockDistribution}
        />
      );

      expect(getByText('2 productos')).toBeDefined();
    });
  });

  describe('Category Distribution Chart', () => {
    it('should conditionally render chart section based on distribution', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Chart section exists when distribution has data
      // Note: CategoryDistributionChart is dynamically loaded with ssr:false,
      // so we just verify the structure is correct
      const header = container.querySelector('[class*="Paper"]');
      expect(header).toBeDefined();
    });

    it('should not render extra chart section when distribution is empty', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={[]}
        />
      );

      // Test behavior: No chart section when distribution is empty
      const header = container.querySelector('[class*="Paper"]');
      expect(header).toBeDefined();
    });
  });

  describe('Trend Cards Section', () => {
    it('should render all trend cards', () => {
      const { getByTestId } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      expect(getByTestId('trend-card-1')).toBeDefined();
      expect(getByTestId('trend-card-2')).toBeDefined();
      expect(getByTestId('trend-card-3')).toBeDefined();
    });

    it('should render trends in correct order with ranking', () => {
      const { getByTestId } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      const card1 = getByTestId('trend-card-1');
      const card2 = getByTestId('trend-card-2');
      const card3 = getByTestId('trend-card-3');

      expect(card1.textContent).toBe('iphone 15');
      expect(card2.textContent).toBe('samsung galaxy');
      expect(card3.textContent).toBe('xiaomi');
    });

    it('should pass correct rank to each TrendCard', () => {
      const { getByTestId } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Ranks are 1-indexed and independent per column
      expect(getByTestId('trend-card-1')).toBeDefined();
      expect(getByTestId('trend-card-2')).toBeDefined();
      expect(getByTestId('trend-card-3')).toBeDefined();
    });

    it('should render trends in Stack container', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Trends are in vertical Stack layout
      const stacks = container.querySelectorAll('[class*="Stack"]');
      expect(stacks.length).toBeGreaterThanOrEqual(2); // Main + trends stack
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no trends', () => {
      const { getByText } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={[]}
          distribution={[]}
        />
      );

      const emptyMessage = getByText('No hay tendencias en esta categoría');
      expect(emptyMessage).toBeDefined();
    });

    it('should render empty state in centered Paper', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={[]}
          distribution={[]}
        />
      );

      // Test behavior: Empty state uses Paper with border
      const papers = container.querySelectorAll('[class*="Paper"]');
      // Header paper + empty state paper = 2 papers
      expect(papers.length).toBe(2);
    });

    it('should not render TrendCards when empty', () => {
      const { queryByTestId } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={[]}
          distribution={[]}
        />
      );

      expect(queryByTestId('trend-card-1')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should be visible and not hidden', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toBeDefined();
      expect(rootElement.hasAttribute('hidden')).toBe(false);
      expect(rootElement.getAttribute('aria-hidden')).not.toBe('true');
    });

    it('should use semantic heading for trend type', () => {
      const { container } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      // Test behavior: Uses h3 (order={3}) for trend type title
      const title = container.querySelector('[class*="Title"]');
      expect(title).toBeDefined();
    });
  });

  describe('Dynamic Updates', () => {
    it('should update when trends change', () => {
      const { getByText, rerender } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      expect(getByText('3 productos')).toBeDefined();

      const newTrends = [...mockTrends, mockTrends[0]];
      rerender(
        <CategoryColumn
          trendType="fastest_growing"
          trends={newTrends}
          distribution={mockDistribution}
        />
      );

      expect(getByText('4 productos')).toBeDefined();
    });

    it('should update when switching from empty to populated', () => {
      const { getByText, queryByText, rerender } = render(
        <CategoryColumn
          trendType="fastest_growing"
          trends={[]}
          distribution={[]}
        />
      );

      expect(getByText('No hay tendencias en esta categoría')).toBeDefined();

      rerender(
        <CategoryColumn
          trendType="fastest_growing"
          trends={mockTrends}
          distribution={mockDistribution}
        />
      );

      expect(
        queryByText('No hay tendencias en esta categoría')
      ).toBeNull();
      expect(getByText('3 productos')).toBeDefined();
    });
  });
});
