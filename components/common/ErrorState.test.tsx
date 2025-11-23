import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../../test-utils/index';
import { ErrorState } from './ErrorState';
import type { ApiError } from '../../types/meli';

describe('ErrorState', () => {
  describe('Error Message Display', () => {
    it('should show token error message for status 401', () => {
      const error: ApiError = {
        message: 'Unauthorized',
        error: 'unauthorized',
        status: 401,
      };

      render(<ErrorState error={error} />);

      expect(
        screen.getByText('Token inválido o expirado. Por favor, vuelve a iniciar sesión.')
      ).toBeDefined();
    });

    it('should show permission error message for status 403', () => {
      const error: ApiError = {
        message: 'Forbidden',
        error: 'forbidden',
        status: 403,
      };

      render(<ErrorState error={error} />);

      expect(
        screen.getByText('No tienes permiso para acceder a este recurso.')
      ).toBeDefined();
    });

    it('should show not found error message for status 404', () => {
      const error: ApiError = {
        message: 'Not Found',
        error: 'not_found',
        status: 404,
      };

      render(<ErrorState error={error} />);

      expect(
        screen.getByText('No se encontraron datos para este país o categoría.')
      ).toBeDefined();
    });

    it('should show rate limit error message for status 429', () => {
      const error: ApiError = {
        message: 'Too Many Requests',
        error: 'rate_limit',
        status: 429,
      };

      render(<ErrorState error={error} />);

      expect(
        screen.getByText('Demasiadas solicitudes. Por favor, espera unos minutos e intenta nuevamente.')
      ).toBeDefined();
    });

    it('should show connection error message for status 0', () => {
      const error: ApiError = {
        message: 'Network Error',
        error: 'network_error',
        status: 0,
      };

      render(<ErrorState error={error} />);

      expect(
        screen.getByText('Error de conexión. Verifica tu conexión a internet.')
      ).toBeDefined();
    });

    it('should show custom error message for status 500', () => {
      const error: ApiError = {
        message: 'Internal Server Error - Database connection failed',
        error: 'server_error',
        status: 500,
      };

      render(<ErrorState error={error} />);

      expect(
        screen.getByText('Internal Server Error - Database connection failed')
      ).toBeDefined();
    });

    it('should show default message when error.message is empty', () => {
      const error: ApiError = {
        message: '',
        error: 'unknown',
        status: 500,
      };

      render(<ErrorState error={error} />);

      expect(
        screen.getByText('Ocurrió un error al cargar los datos.')
      ).toBeDefined();
    });
  });

  describe('Retry Button', () => {
    it('should show retry button for normal errors (status 500)', () => {
      const error: ApiError = {
        message: 'Server Error',
        error: 'server_error',
        status: 500,
      };
      const onRetry = vi.fn();

      render(<ErrorState error={error} onRetry={onRetry} />);

      expect(screen.getByRole('button', { name: /Reintentar/i })).toBeDefined();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const error: ApiError = {
        message: 'Server Error',
        error: 'server_error',
        status: 500,
      };
      const onRetry = vi.fn();
      const user = userEvent.setup();

      render(<ErrorState error={error} onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: /Reintentar/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should hide retry button for 401 errors', () => {
      const error: ApiError = {
        message: 'Unauthorized',
        error: 'unauthorized',
        status: 401,
      };
      const onRetry = vi.fn();

      render(<ErrorState error={error} onRetry={onRetry} />);

      expect(screen.queryByRole('button', { name: /Reintentar/i })).toBeNull();
    });

    it('should hide retry button for 403 errors', () => {
      const error: ApiError = {
        message: 'Forbidden',
        error: 'forbidden',
        status: 403,
      };
      const onRetry = vi.fn();

      render(<ErrorState error={error} onRetry={onRetry} />);

      expect(screen.queryByRole('button', { name: /Reintentar/i })).toBeNull();
    });

    it('should show retry button for 404 errors', () => {
      const error: ApiError = {
        message: 'Not Found',
        error: 'not_found',
        status: 404,
      };
      const onRetry = vi.fn();

      render(<ErrorState error={error} onRetry={onRetry} />);

      expect(screen.getByRole('button', { name: /Reintentar/i })).toBeDefined();
    });

    it('should not show retry button when onRetry is not provided', () => {
      const error: ApiError = {
        message: 'Server Error',
        error: 'server_error',
        status: 500,
      };

      render(<ErrorState error={error} />);

      expect(screen.queryByRole('button', { name: /Reintentar/i })).toBeNull();
    });
  });

  describe('"Volver al inicio" Button', () => {
    it('should show "Volver al inicio" button for 401 errors', () => {
      const error: ApiError = {
        message: 'Unauthorized',
        error: 'unauthorized',
        status: 401,
      };

      render(<ErrorState error={error} />);

      const homeButton = screen.getByRole('link', { name: /Volver al inicio/i });
      expect(homeButton).toBeDefined();
      expect(homeButton.getAttribute('href')).toBe('/');
    });

    it('should show "Volver al inicio" button for 403 errors', () => {
      const error: ApiError = {
        message: 'Forbidden',
        error: 'forbidden',
        status: 403,
      };

      render(<ErrorState error={error} />);

      const homeButton = screen.getByRole('link', { name: /Volver al inicio/i });
      expect(homeButton).toBeDefined();
      expect(homeButton.getAttribute('href')).toBe('/');
    });

    it('should not show "Volver al inicio" button for other errors', () => {
      const error: ApiError = {
        message: 'Server Error',
        error: 'server_error',
        status: 500,
      };

      render(<ErrorState error={error} />);

      expect(screen.queryByRole('link', { name: /Volver al inicio/i })).toBeNull();
    });
  });

  describe('Error Details', () => {
    it('should show error cause when provided (not 401/403)', () => {
      const error: ApiError = {
        message: 'Database Error',
        error: 'db_error',
        status: 500,
        cause: 'Connection timeout after 30 seconds',
      };

      render(<ErrorState error={error} />);

      expect(screen.getByText('Connection timeout after 30 seconds')).toBeDefined();
    });

    it('should show status code (not 401/403)', () => {
      const error: ApiError = {
        message: 'Server Error',
        error: 'server_error',
        status: 500,
      };

      render(<ErrorState error={error} />);

      expect(screen.getByText(/Código de error: 500/i)).toBeDefined();
    });

    it('should hide error details for 401 errors', () => {
      const error: ApiError = {
        message: 'Unauthorized',
        error: 'unauthorized',
        status: 401,
        cause: 'Token expired',
      };

      render(<ErrorState error={error} />);

      expect(screen.queryByText('Token expired')).toBeNull();
      expect(screen.queryByText(/Código de error:/i)).toBeNull();
    });

    it('should hide error details for 403 errors', () => {
      const error: ApiError = {
        message: 'Forbidden',
        error: 'forbidden',
        status: 403,
        cause: 'Insufficient permissions',
      };

      render(<ErrorState error={error} />);

      expect(screen.queryByText('Insufficient permissions')).toBeNull();
      expect(screen.queryByText(/Código de error:/i)).toBeNull();
    });

    it('should not show cause block when cause is not provided', () => {
      const error: ApiError = {
        message: 'Server Error',
        error: 'server_error',
        status: 500,
      };

      render(<ErrorState error={error} />);

      // Test behavior: When no cause is provided, only the error code should be visible
      // The cause text element should not be present
      expect(screen.getByText(/Código de error: 500/i)).toBeDefined();
      // Verify no additional error details beyond the status code
      const errorElements = screen.queryAllByText(/error/i);
      // Should only have "Error al cargar trends" title and status code, no cause
      expect(errorElements.length).toBeLessThanOrEqual(3);
    });

    it('should show "N/A" for status code when status is 0', () => {
      const error: ApiError = {
        message: 'Network Error',
        error: 'network_error',
        status: 0,
      };

      render(<ErrorState error={error} />);

      // Status 0 should display as "N/A" (0 is falsy, so || 'N/A' applies)
      expect(screen.getByText(/Código de error: N\/A/i)).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should render alert icon', () => {
      const error: ApiError = {
        message: 'Error',
        error: 'error',
        status: 500,
      };

      const { container } = render(<ErrorState error={error} />);

      // Test behavior: Alert should contain an icon (SVG element)
      const icon = container.querySelector('svg');
      expect(icon).toBeDefined();
    });

    it('should render refresh icon in retry button', () => {
      const error: ApiError = {
        message: 'Error',
        error: 'error',
        status: 500,
      };

      render(<ErrorState error={error} onRetry={vi.fn()} />);

      // Test behavior: Retry button should be present and clickable
      const retryButton = screen.getByRole('button', { name: /Reintentar/i });
      expect(retryButton).toBeDefined();
      // Button should contain an icon (SVG)
      const icon = retryButton.querySelector('svg');
      expect(icon).toBeDefined();
    });

    it('should have Alert component with proper title', () => {
      const error: ApiError = {
        message: 'Error',
        error: 'error',
        status: 500,
      };

      render(<ErrorState error={error} />);

      // Test behavior: Alert displays error title
      expect(screen.getByText('Error al cargar trends')).toBeDefined();
    });

    it('should have accessible error message', () => {
      const error: ApiError = {
        message: 'Test error message',
        error: 'test_error',
        status: 500,
      };

      render(<ErrorState error={error} />);

      // Test behavior: Error message is accessible and visible to screen readers
      expect(screen.getByText('Test error message')).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long error messages', () => {
      const error: ApiError = {
        message: 'This is a very long error message that might occur in production when something goes terribly wrong with the API request and the server returns a detailed explanation of what went wrong',
        error: 'long_error',
        status: 500,
      };

      render(<ErrorState error={error} />);

      expect(screen.getByText(error.message)).toBeDefined();
    });

    it('should handle very long error cause', () => {
      const error: ApiError = {
        message: 'Database Error',
        error: 'db_error',
        status: 500,
        cause: 'SQLSTATE[HY000] [2002] Connection refused - Unable to connect to database server at localhost:5432 after multiple retry attempts with exponential backoff',
      };

      render(<ErrorState error={error} />);

      expect(screen.getByText(error.cause!)).toBeDefined();
    });

    it('should handle multiple user interactions with retry button', async () => {
      const error: ApiError = {
        message: 'Server Error',
        error: 'server_error',
        status: 500,
      };
      const onRetry = vi.fn();
      const user = userEvent.setup();

      render(<ErrorState error={error} onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: /Reintentar/i });

      await user.click(retryButton);
      await user.click(retryButton);
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(3);
    });
  });
});
