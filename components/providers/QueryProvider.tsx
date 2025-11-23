'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 hour (matches server-side Redis cache TTL)
            staleTime: 60 * 60 * 1000,
            // Keep unused data in cache for 24 hours
            gcTime: 24 * 60 * 60 * 1000,
            // Disable automatic refetch on window focus
            refetchOnWindowFocus: false,
            // Custom retry logic for rate limiting
            retry: (failureCount, error) => {
              // Don't retry on 403 (CloudFront blocking) - it won't help
              if (error instanceof Error && error.message.includes('403')) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
