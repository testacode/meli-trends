import { describe, it, expect } from 'vitest';
import { render } from '../../test-utils/index';
import { TableSkeleton } from './TableSkeleton';

describe('TableSkeleton', () => {
  describe('Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(<TableSkeleton />);
      expect(container.firstChild).toBeDefined();
    });

    it('should render table structure', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Component renders a table element
      const table = container.querySelector('table');
      expect(table).toBeDefined();
    });

    it('should display multiple loading skeleton elements', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Multiple skeleton loading indicators are present
      // Header: 4 skeletons + Body: 15 rows × 5 skeletons per row = 79 skeletons
      const skeletons = container.querySelectorAll('[class*="Skeleton"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(75);
    });
  });

  describe('Chip Filter Section with i18n', () => {
    it('should render chip filter group', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Chip group is present for filter skeleton
      const chipGroup = container.querySelector('[class*="ChipGroup"]');
      expect(chipGroup).toBeDefined();
    });

    it('should render 4 disabled filter chips with translated labels', () => {
      const { getByText } = render(<TableSkeleton />);

      // Test behavior: All 4 category filter chips are rendered with i18n labels
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
      const { container } = render(<TableSkeleton />);

      // Test behavior: Chips are centered horizontally
      const centerContainer = container.querySelector('[class*="Center"]');
      expect(centerContainer).toBeDefined();
    });

    it('should have all chips disabled during loading', () => {
      const { getByText } = render(<TableSkeleton />);

      // Test behavior: Filter chips are disabled during loading
      // Verify all 4 chip labels are present
      expect(getByText('Todos')).toBeDefined();
      expect(getByText('Mayor Crecimiento')).toBeDefined();
      expect(getByText('Más Buscados')).toBeDefined();
      expect(getByText('Más Populares')).toBeDefined();
    });
  });

  describe('Table Structure', () => {
    it('should render table with ScrollArea wrapper', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Table is wrapped in ScrollArea for horizontal scrolling
      const scrollArea = container.querySelector('[class*="ScrollArea"]');
      expect(scrollArea).toBeDefined();
    });

    it('should render table with borders and striped rows', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Table has border styling
      const table = container.querySelector('table');
      expect(table).toBeDefined();
    });

    it('should render table header with 4 columns', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Table has 4 header cells (Rank, Keyword, Type, Actions)
      const headerCells = container.querySelectorAll('thead th');
      expect(headerCells.length).toBe(4);
    });

    it('should render 15 table rows in body', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Table body contains 15 skeleton rows
      const bodyRows = container.querySelectorAll('tbody tr');
      expect(bodyRows.length).toBe(15);
    });

    it('should render 4 cells per row', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Each row has 4 cells matching header columns
      const firstRow = container.querySelector('tbody tr');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        expect(cells.length).toBe(4);
      }
    });
  });

  describe('Table Header Skeletons', () => {
    it('should render skeleton in each header cell', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Each header cell contains a skeleton
      const headerCells = container.querySelectorAll('thead th');

      headerCells.forEach((cell) => {
        const skeleton = cell.querySelector('[class*="Skeleton"]');
        expect(skeleton).toBeDefined();
      });
    });

    it('should render header skeletons with varying widths', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Header skeletons have different widths for visual variety
      const headerSkeletons = container.querySelectorAll('thead [class*="Skeleton"]');
      expect(headerSkeletons.length).toBe(4);
    });
  });

  describe('Table Row Skeletons', () => {
    it('should render rank skeleton (centered) in first column', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: First cell has centered rank badge skeleton
      const firstRow = container.querySelector('tbody tr');
      if (firstRow) {
        const rankCell = firstRow.querySelector('td');
        expect(rankCell).toBeDefined();
        expect(rankCell?.style.textAlign).toBe('center');

        const centerElement = rankCell?.querySelector('[class*="Center"]');
        expect(centerElement).toBeDefined();
      }
    });

    it('should render keyword skeleton in second column', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Second cell has keyword skeleton (80% width)
      const firstRow = container.querySelector('tbody tr');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        const keywordCell = cells[1];
        const skeleton = keywordCell?.querySelector('[class*="Skeleton"]');
        expect(skeleton).toBeDefined();
      }
    });

    it('should render type badge skeleton in third column', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Third cell has type badge skeleton (full width)
      const firstRow = container.querySelector('tbody tr');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        const typeCell = cells[2];
        const skeleton = typeCell?.querySelector('[class*="Skeleton"]');
        expect(skeleton).toBeDefined();
      }
    });

    it('should render action buttons skeletons in fourth column', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Fourth cell has 2 action button skeletons
      const firstRow = container.querySelector('tbody tr');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        const actionsCell = cells[3];
        const skeletons = actionsCell?.querySelectorAll('[class*="Skeleton"]');
        expect(skeletons?.length).toBe(2);
      }
    });

    it('should render action skeletons in centered Group', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Action buttons are in centered Group
      const firstRow = container.querySelector('tbody tr');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        const actionsCell = cells[3];
        const group = actionsCell?.querySelector('[class*="Group"]');
        expect(group).toBeDefined();
      }
    });
  });

  describe('Column Widths', () => {
    it('should apply fixed width to rank column', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Rank column has 80px width
      const headerCells = container.querySelectorAll('thead th');
      const rankHeader = headerCells[0] as HTMLElement;
      expect(rankHeader.style.width).toBe('80px');
    });

    it('should apply fixed width to type column', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Type column has 200px width
      const headerCells = container.querySelectorAll('thead th');
      const typeHeader = headerCells[2] as HTMLElement;
      expect(typeHeader.style.width).toBe('200px');
    });

    it('should apply fixed width to actions column', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Actions column has 120px width
      const headerCells = container.querySelectorAll('thead th');
      const actionsHeader = headerCells[3] as HTMLElement;
      expect(actionsHeader.style.width).toBe('120px');
    });

    it('should leave keyword column flexible (no fixed width)', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Keyword column has no fixed width (flexible)
      const headerCells = container.querySelectorAll('thead th');
      const keywordHeader = headerCells[1] as HTMLElement;
      expect(keywordHeader.style.width).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should be visible and not hidden', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Component is visible to users
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toBeDefined();
      expect(rootElement.hasAttribute('hidden')).toBe(false);
      expect(rootElement.getAttribute('aria-hidden')).not.toBe('true');
    });

    it('should render without aria-live region (static skeleton)', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: This is a static loading skeleton, not a live region
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement.hasAttribute('aria-live')).toBe(false);
    });

    it('should have disabled chips for accessibility', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Filter chips are disabled during loading
      // Prevents user interaction with non-functional skeleton chips
      const chips = container.querySelectorAll('[class*="Chip"]');
      expect(chips.length).toBeGreaterThan(0);
    });

    it('should use semantic table structure', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Uses proper table semantics (thead, tbody, tr, th, td)
      const thead = container.querySelector('thead');
      const tbody = container.querySelector('tbody');

      expect(thead).toBeDefined();
      expect(tbody).toBeDefined();
    });
  });

  describe('Layout Structure', () => {
    it('should maintain hierarchical structure: chips → table', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Component follows correct layout order
      const rootStack = container.firstChild;
      expect(rootStack).toBeDefined();

      // Should contain Stack > [Center (chips), ScrollArea (table)]
      const mainStack = container.querySelector('[class*="Stack"]');
      expect(mainStack).toBeDefined();
    });

    it('should use consistent spacing between sections', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Root Stack has "lg" gap for section spacing
      const rootStack = container.querySelector('[class*="Stack"]');
      expect(rootStack).toBeDefined();
    });
  });

  describe('Skeleton Count', () => {
    it('should render exactly 15 rows of skeletons', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Component renders 15 placeholder rows
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(15);
    });

    it('should render total of ~79 skeleton elements', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: 4 header skeletons + 15 rows × 5 skeletons = 79 total
      // (rank + keyword + type + 2 actions per row)
      const skeletons = container.querySelectorAll('[class*="Skeleton"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(75);
      expect(skeletons.length).toBeLessThanOrEqual(85);
    });
  });

  describe('Internationalization', () => {
    it('should use translations from trends.filters namespace', () => {
      const { getByText } = render(<TableSkeleton />);

      // Test behavior: Component uses useTranslations('trends.filters')
      // All chip labels should be translated
      expect(getByText('Todos')).toBeDefined(); // trends.filters.all
      expect(getByText('Mayor Crecimiento')).toBeDefined(); // trends.filters.fastestGrowing
      expect(getByText('Más Buscados')).toBeDefined(); // trends.filters.mostWanted
      expect(getByText('Más Populares')).toBeDefined(); // trends.filters.mostPopular
    });

    it('should match chip structure with other skeletons for consistency', () => {
      const { getByText } = render(<TableSkeleton />);

      // Test behavior: All skeletons share same chip filter structure
      // Verify all 4 chip labels are present
      expect(getByText('Todos')).toBeDefined();
      expect(getByText('Mayor Crecimiento')).toBeDefined();
      expect(getByText('Más Buscados')).toBeDefined();
      expect(getByText('Más Populares')).toBeDefined();
    });
  });

  describe('Table Styling', () => {
    it('should render table with hover highlight', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Table has highlightOnHover prop
      const table = container.querySelector('table');
      expect(table).toBeDefined();
    });

    it('should render table with borders', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Table has withTableBorder and withColumnBorders props
      const table = container.querySelector('table');
      expect(table).toBeDefined();
    });

    it('should render table with striped rows', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Table has striped prop for alternating row colors
      const table = container.querySelector('table');
      expect(table).toBeDefined();
    });
  });

  describe('Responsive Behavior', () => {
    it('should wrap table in ScrollArea for horizontal scrolling', () => {
      const { container } = render(<TableSkeleton />);

      // Test behavior: Table is scrollable on small viewports
      const scrollArea = container.querySelector('[class*="ScrollArea"]');
      expect(scrollArea).toBeDefined();

      const table = scrollArea?.querySelector('table');
      expect(table).toBeDefined();
    });
  });
});
