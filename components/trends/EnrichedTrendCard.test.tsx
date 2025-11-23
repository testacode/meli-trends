import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils/index';
import userEvent from '@testing-library/user-event';
import { EnrichedTrendCard } from './EnrichedTrendCard';
import type { TrendItem, EnrichedTrendItem, SearchProduct } from '../../types/meli';

// Mock the useEnrichTrendOnDemand hook
vi.mock('../../hooks/useEnrichTrendOnDemand');

import { useEnrichTrendOnDemand } from '../../hooks/useEnrichTrendOnDemand';

describe('EnrichedTrendCard', () => {
  const mockTrend: TrendItem = {
    keyword: 'iPhone 15 Pro',
    url: 'https://www.mercadolibre.com.ar/trends/iphone-15-pro',
  };

  const mockProducts: SearchProduct[] = [
    {
      id: 'MLA1234',
      title: 'iPhone 15 Pro 256GB',
      price: 1200000,
      currency_id: 'ARS',
      thumbnail: 'https://example.com/thumb1.jpg',
      permalink: 'https://example.com/product1',
      condition: 'new',
      available_quantity: 10,
      sold_quantity: 50,
      shipping: {
        free_shipping: true,
      },
    },
    {
      id: 'MLA5678',
      title: 'iPhone 15 Pro 512GB',
      price: 1500000,
      currency_id: 'ARS',
      thumbnail: 'https://example.com/thumb2.jpg',
      permalink: 'https://example.com/product2',
      condition: 'new',
      available_quantity: 5,
      sold_quantity: 30,
      shipping: {
        free_shipping: false,
      },
    },
    {
      id: 'MLA9012',
      title: 'iPhone 15 Pro 128GB',
      price: 1000000,
      currency_id: 'ARS',
      thumbnail: 'https://example.com/thumb3.jpg',
      permalink: 'https://example.com/product3',
      condition: 'new',
      available_quantity: 15,
      sold_quantity: 80,
      shipping: {
        free_shipping: true,
      },
    },
  ];

  const mockEnrichedTrend: EnrichedTrendItem = {
    ...mockTrend,
    products: mockProducts,
    total_results: 1500,
    avg_price: 1233333,
    min_price: 1000000,
    max_price: 1500000,
    total_sold: 160,
    free_shipping_percentage: 66.67,
    opportunity_score: 78,
  };

  const mockEnrich = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render trend keyword', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'idle' },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText('iPhone 15 Pro')).toBeDefined();
    });

    it('should show rank badge with correct label', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'idle' },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      const badge = screen.getByText('🥇');
      expect(badge).toBeDefined();
      expect(badge.closest('.mantine-Badge-root')).toBeDefined();
    });

    it('should show "+" button in idle state', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'idle' },
        enrich: mockEnrich,
      });

      const { container } = render(
        <EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />
      );

      // ActionIcon with IconPlus
      const plusIcon = container.querySelector('svg.tabler-icon-plus');
      expect(plusIcon).toBeDefined();
    });
  });

  describe('Enrichment Button Interaction', () => {
    it('should call enrich() when clicking "+" button', async () => {
      const user = userEvent.setup();

      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'idle' },
        enrich: mockEnrich,
      });

      const { container } = render(
        <EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />
      );

      const button = container.querySelector('.mantine-ActionIcon-root');
      expect(button).toBeDefined();

      await user.click(button!);

      expect(mockEnrich).toHaveBeenCalledTimes(1);
    });

    it('should show loader while enriching', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'loading' },
        enrich: mockEnrich,
      });

      const { container } = render(
        <EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />
      );

      // Check for loader (ActionIcon has loading state)
      const loader = container.querySelector('.mantine-Loader-root');
      expect(loader).toBeDefined();
    });

    it('should hide "+" button after successful enrichment', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'success', data: mockEnrichedTrend },
        enrich: mockEnrich,
      });

      const { container } = render(
        <EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />
      );

      // Plus icon should not be present
      const plusIcon = container.querySelector('svg.tabler-icon-plus');
      expect(plusIcon).toBeNull();

      // Instead, opportunity score badge should be present
      expect(screen.getByText(/78%/)).toBeDefined();
    });
  });

  describe('Enriched Data Display', () => {
    beforeEach(() => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'success', data: mockEnrichedTrend },
        enrich: mockEnrich,
      });
    });

    it('should show opportunity score badge after enrichment', () => {
      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      // Badge shows "78% Excelente"
      expect(screen.getByText(/78%/)).toBeDefined();
      expect(screen.getByText(/Excelente/)).toBeDefined();
    });

    it('should show opportunity score progress bar', () => {
      const { container } = render(
        <EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />
      );

      expect(screen.getByText('Oportunidad de Negocio')).toBeDefined();
      expect(screen.getByText('78/100')).toBeDefined();

      // Check for Progress component
      const progress = container.querySelector('.mantine-Progress-root');
      expect(progress).toBeDefined();
    });

    it('should show product thumbnails (up to 3)', () => {
      const { container } = render(
        <EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />
      );

      // Check for Image components (should show 3 products)
      const images = container.querySelectorAll('.mantine-Image-root');
      expect(images.length).toBe(3);
    });

    it('should show price range', () => {
      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText('Rango de precio:')).toBeDefined();
      // Check for formatted prices (NumberFormatter renders them)
      expect(screen.getByText(/1,000,000/)).toBeDefined();
      expect(screen.getByText(/1,500,000/)).toBeDefined();
    });

    it('should show total sold', () => {
      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText('Ventas totales:')).toBeDefined();
      expect(screen.getByText(/160 unidades/)).toBeDefined();
    });

    it('should show free shipping percentage', () => {
      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText('Envío gratis:')).toBeDefined();
      // 66.67 rounds to 67
      expect(screen.getByText('67%')).toBeDefined();
    });
  });

  describe('Opportunity Score Colors', () => {
    it('should show green badge and "Excelente" for score >= 75', () => {
      const highScoreTrend: EnrichedTrendItem = {
        ...mockEnrichedTrend,
        opportunity_score: 85,
      };

      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'success', data: highScoreTrend },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText(/85%/)).toBeDefined();
      expect(screen.getByText(/Excelente/)).toBeDefined();
    });

    it('should show blue badge and "Buena" for score >= 50', () => {
      const mediumHighScoreTrend: EnrichedTrendItem = {
        ...mockEnrichedTrend,
        opportunity_score: 60,
      };

      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'success', data: mediumHighScoreTrend },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText(/60%/)).toBeDefined();
      expect(screen.getByText(/Buena/)).toBeDefined();
    });

    it('should show yellow badge and "Media" for score >= 25', () => {
      const mediumScoreTrend: EnrichedTrendItem = {
        ...mockEnrichedTrend,
        opportunity_score: 40,
      };

      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'success', data: mediumScoreTrend },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText(/40%/)).toBeDefined();
      expect(screen.getByText(/Media/)).toBeDefined();
    });

    it('should show red badge and "Baja" for score < 25', () => {
      const lowScoreTrend: EnrichedTrendItem = {
        ...mockEnrichedTrend,
        opportunity_score: 15,
      };

      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'success', data: lowScoreTrend },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText(/15%/)).toBeDefined();
      expect(screen.getByText(/Baja/)).toBeDefined();
    });
  });

  describe('Error State', () => {
    it('should show error alert when enrichment fails', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'error', error: 'Failed to fetch data' },
        enrich: mockEnrich,
      });

      const { container } = render(
        <EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />
      );

      // Check for Alert component
      const alert = container.querySelector('.mantine-Alert-root');
      expect(alert).toBeDefined();
    });

    it('should show error message from hook', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'error', error: 'Network timeout' },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText(/Error al cargar detalles:/)).toBeDefined();
      expect(screen.getByText(/Network timeout/)).toBeDefined();
    });
  });

  describe('External Link', () => {
    it('should link keyword to trend.url with target="_blank"', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'idle' },
        enrich: mockEnrich,
      });

      const { container } = render(
        <EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />
      );

      // Find the link wrapping the keyword (Box component="a")
      const link = container.querySelector('a[href="' + mockTrend.url + '"]');
      expect(link).toBeDefined();
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  describe('Rank Display', () => {
    it('should show 🥈 medal for rank 2', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'idle' },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={2} siteId="MLA" />);

      const badge = screen.getByText('🥈');
      expect(badge).toBeDefined();
    });

    it('should show 🥉 medal for rank 3', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'idle' },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={3} siteId="MLA" />);

      const badge = screen.getByText('🥉');
      expect(badge).toBeDefined();
    });

    it('should show "#5" for rank 5', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'idle' },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={5} siteId="MLA" />);

      const badge = screen.getByText('#5');
      expect(badge).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle enriched trend with no products', () => {
      const noProductsTrend: EnrichedTrendItem = {
        ...mockTrend,
        products: [],
        total_results: 0,
        opportunity_score: 0,
      };

      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'success', data: noProductsTrend },
        enrich: mockEnrich,
      });

      const { container } = render(
        <EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />
      );

      // Should not show product images
      const images = container.querySelectorAll('.mantine-Image-root');
      expect(images.length).toBe(0);
    });

    it('should show idle hint text when not enriched', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'idle' },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      expect(screen.getByText('Haz click en + para ver métricas detalladas')).toBeDefined();
    });

    it('should show "Nuevo" badge on first product if condition is new', () => {
      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'success', data: mockEnrichedTrend },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      // First product is new, should show "Nuevo" badge
      expect(screen.getByText('Nuevo')).toBeDefined();
    });

    it('should show "+X más" when more than 3 products exist', () => {
      const manyProductsTrend: EnrichedTrendItem = {
        ...mockEnrichedTrend,
        products: [
          ...mockProducts,
          {
            id: 'MLA3456',
            title: 'iPhone 15 Pro Extra',
            price: 1100000,
            currency_id: 'ARS',
            thumbnail: 'https://example.com/thumb4.jpg',
            permalink: 'https://example.com/product4',
            condition: 'new',
            available_quantity: 8,
            sold_quantity: 20,
          },
          {
            id: 'MLA7890',
            title: 'iPhone 15 Pro Another',
            price: 1300000,
            currency_id: 'ARS',
            thumbnail: 'https://example.com/thumb5.jpg',
            permalink: 'https://example.com/product5',
            condition: 'new',
            available_quantity: 12,
            sold_quantity: 40,
          },
        ],
      };

      vi.mocked(useEnrichTrendOnDemand).mockReturnValue({
        state: { status: 'success', data: manyProductsTrend },
        enrich: mockEnrich,
      });

      render(<EnrichedTrendCard trend={mockTrend} rank={1} siteId="MLA" />);

      // Should show "+2 más" (5 products - 3 shown = 2 more)
      expect(screen.getByText('+2 más')).toBeDefined();
    });
  });
});
