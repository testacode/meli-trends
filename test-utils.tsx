import { render, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';
import messages from '@/locales/es.json';

/**
 * Creates a new QueryClient instance with default options for testing
 * Disables retries and logging to make tests faster and cleaner
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper component that provides QueryClient and NextIntlClientProvider to children
 */
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale="es" messages={messages}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </NextIntlClientProvider>
    );
  };
}

/**
 * Custom render that wraps components with QueryClientProvider
 */
export function renderWithQueryClient(
  ui: ReactElement,
  queryClient = createTestQueryClient()
) {
  const Wrapper = createWrapper(queryClient);
  return {
    ...render(ui, { wrapper: Wrapper }),
    queryClient,
  };
}

/**
 * Custom renderHook that wraps hooks with QueryClientProvider
 */
export function renderHookWithQueryClient<TResult, TProps>(
  hook: (props: TProps) => TResult,
  queryClient = createTestQueryClient()
) {
  const Wrapper = createWrapper(queryClient);
  return {
    ...renderHook(hook, { wrapper: Wrapper }),
    queryClient,
  };
}

// Re-export everything from Testing Library
export * from '@testing-library/react';
export { renderHookWithQueryClient as renderHook };
