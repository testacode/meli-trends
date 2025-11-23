'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppShell, Container, Transition } from '@mantine/core';
import { useTrends } from '@/hooks/useTrends';
import { Header } from '@/components/layout/Header';
import { TrendsList } from '@/components/trends/TrendsList';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { COUNTRIES, type SiteId } from '@/utils/constants';
import { fadeSlide } from '@/lib/transitions';

export default function TrendsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const country = params.country as SiteId;
  const selectedCategory = searchParams.get('category');

  // Validate country
  const isValidCountry = country && country in COUNTRIES;

  // Fetch trends (no auth required - handled server-side)
  const { data, loading, error, refetch } = useTrends({
    siteId: country,
    categoryId: selectedCategory || undefined,
  });

  // Redirect to default country if invalid country
  useEffect(() => {
    if (!isValidCountry) {
      router.push('/');
    }
  }, [isValidCountry, router]);

  // Show nothing if invalid country (will redirect)
  if (!isValidCountry) {
    return null;
  }

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header currentCountry={country} currentCategory={selectedCategory} />

      <AppShell.Main>
        <Container size="xl" py="xl">
          {/* Loading State */}
          {loading && <ListSkeleton />}

          {/* Error State */}
          {error && !loading && <ErrorState error={error} onRetry={refetch} />}

          {/* Content with Transition */}
          <Transition
            mounted={!loading && !error && !!data}
            transition={fadeSlide}
            duration={300}
            timingFunction="ease-out"
          >
            {(styles) => (
              <div style={styles}>
                {data && !loading && !error && <TrendsList trends={data} country={country} />}
              </div>
            )}
          </Transition>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
