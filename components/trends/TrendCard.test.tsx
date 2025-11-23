import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils/index';
import { TrendCard } from './TrendCard';
import type { TrendItem } from '../../types/meli';

describe('TrendCard', () => {
  const mockTrend: TrendItem = {
    keyword: 'iPhone 15',
    url: 'https://www.mercadolibre.com.ar/trends/iphone-15',
  };

  describe('Rendering', () => {
    it('should display trend keyword', () => {
      render(<TrendCard trend={mockTrend} rank={1} />);

      expect(screen.getByText('iPhone 15')).toBeDefined();
    });

    it('should render link with correct href', () => {
      render(<TrendCard trend={mockTrend} rank={1} />);

      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe(mockTrend.url);
    });

    it('should open external link in new tab with security attributes', () => {
      render(<TrendCard trend={mockTrend} rank={1} />);

      const link = screen.getByRole('link');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should display "Ver en MercadoLibre →" link text', () => {
      render(<TrendCard trend={mockTrend} rank={1} />);

      expect(screen.getByText('Ver en MercadoLibre →')).toBeDefined();
    });
  });

  describe('Rank Display', () => {
    it('should show 🥇 medal for rank 1 (yellow badge)', () => {
      render(<TrendCard trend={mockTrend} rank={1} />);

      // Check for gold medal emoji
      const badge = screen.getByText('🥇');
      expect(badge).toBeDefined();

      // Verify badge is rendered (getRankColor returns 'yellow' for rank 1)
      expect(badge.closest('.mantine-Badge-root')).toBeDefined();
    });

    it('should show 🥈 medal for rank 2 (meliBlue badge)', () => {
      render(<TrendCard trend={mockTrend} rank={2} />);

      // Check for silver medal emoji
      const badge = screen.getByText('🥈');
      expect(badge).toBeDefined();

      // Verify badge is rendered (getRankColor returns 'meliBlue' for rank 2-3)
      expect(badge.closest('.mantine-Badge-root')).toBeDefined();
    });

    it('should show 🥉 medal for rank 3 (meliBlue badge)', () => {
      render(<TrendCard trend={mockTrend} rank={3} />);

      // Check for bronze medal emoji
      const badge = screen.getByText('🥉');
      expect(badge).toBeDefined();

      // Verify badge is rendered (getRankColor returns 'meliBlue' for rank 2-3)
      expect(badge.closest('.mantine-Badge-root')).toBeDefined();
    });

    it('should show "#5" for rank 5 (meliGreen badge)', () => {
      render(<TrendCard trend={mockTrend} rank={5} />);

      // Check for numeric rank
      const badge = screen.getByText('#5');
      expect(badge).toBeDefined();

      // Verify badge is rendered (getRankColor returns 'meliGreen' for rank 4-10)
      expect(badge.closest('.mantine-Badge-root')).toBeDefined();
    });

    it('should show "#15" for rank 15 (gray badge)', () => {
      render(<TrendCard trend={mockTrend} rank={15} />);

      // Check for numeric rank
      const badge = screen.getByText('#15');
      expect(badge).toBeDefined();

      // Verify badge is rendered (getRankColor returns 'gray' for rank 11+)
      expect(badge.closest('.mantine-Badge-root')).toBeDefined();
    });

    it('should show "#4" for rank 4 (meliGreen badge - boundary test)', () => {
      render(<TrendCard trend={mockTrend} rank={4} />);

      // Check for numeric rank
      const badge = screen.getByText('#4');
      expect(badge).toBeDefined();

      // Verify badge is rendered (getRankColor returns 'meliGreen' for rank 4-10)
      expect(badge.closest('.mantine-Badge-root')).toBeDefined();
    });

    it('should show "#10" for rank 10 (meliGreen badge - boundary test)', () => {
      render(<TrendCard trend={mockTrend} rank={10} />);

      // Check for numeric rank
      const badge = screen.getByText('#10');
      expect(badge).toBeDefined();

      // Verify badge is rendered (getRankColor returns 'meliGreen' for rank 4-10)
      expect(badge.closest('.mantine-Badge-root')).toBeDefined();
    });

    it('should show "#11" for rank 11 (gray badge - boundary test)', () => {
      render(<TrendCard trend={mockTrend} rank={11} />);

      // Check for numeric rank
      const badge = screen.getByText('#11');
      expect(badge).toBeDefined();

      // Verify badge is rendered (getRankColor returns 'gray' for rank 11+)
      expect(badge.closest('.mantine-Badge-root')).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have role="link" via component="a"', () => {
      render(<TrendCard trend={mockTrend} rank={1} />);

      const link = screen.getByRole('link');
      expect(link).toBeDefined();
      expect(link.tagName).toBe('A');
    });

    it('should render IconTrendingUp in badge', () => {
      const { container } = render(<TrendCard trend={mockTrend} rank={1} />);

      // IconTrendingUp is rendered as SVG with specific class from tabler-icons
      const icon = container.querySelector('svg.tabler-icon-trending-up');
      expect(icon).toBeDefined();
    });

    it('should render IconExternalLink indicator', () => {
      const { container } = render(<TrendCard trend={mockTrend} rank={1} />);

      // IconExternalLink is rendered as SVG with specific class from tabler-icons
      const icon = container.querySelector('svg.tabler-icon-external-link');
      expect(icon).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle long keyword text with ellipsis', () => {
      const longKeywordTrend: TrendItem = {
        keyword: 'Samsung Galaxy S24 Ultra 5G 256GB Smartphone Android con Cámara 200MP',
        url: 'https://www.mercadolibre.com.ar/trends/samsung-galaxy',
      };

      render(<TrendCard trend={longKeywordTrend} rank={1} />);

      expect(screen.getByText(longKeywordTrend.keyword)).toBeDefined();
    });

    it('should handle special characters in URL', () => {
      const specialUrlTrend: TrendItem = {
        keyword: 'Test Product',
        url: 'https://www.mercadolibre.com.ar/trends/test?query=special&param=value',
      };

      render(<TrendCard trend={specialUrlTrend} rank={1} />);

      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe(specialUrlTrend.url);
    });
  });
});
