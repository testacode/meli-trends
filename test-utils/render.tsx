import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { mantineTheme } from '@/lib/mantine-theme';
import { ReactElement, ReactNode } from 'react';
import messages from '@/locales/es.json';

/**
 * Custom render function for testing React components with Mantine, TanStack Query, and next-intl.
 *
 * This wrapper provides:
 * - NextIntlClientProvider with Spanish (es) locale
 * - QueryClientProvider with retry: false (prevents unnecessary retries in tests)
 * - MantineProvider with theme and env="test" (disables browser-only features)
 *
 * @see https://mantine.dev/guides/vitest/
 * @see https://tanstack.com/query/v5/docs/framework/react/guides/testing
 * @see https://next-intl-docs.vercel.app/docs/workflows/testing
 */

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  queryClient?: QueryClient;
};

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: Infinity, // Prevent garbage collection during tests
        staleTime: Infinity, // Prevent refetching during tests
      },
      mutations: {
        retry: false, // Disable retries in tests
      },
    },
  });
}

function AllTheProviders({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={mantineTheme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const queryClient = options?.queryClient || createTestQueryClient();

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
    ),
    ...options,
  });
}

export { customRender as render, createTestQueryClient };
