'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppShell, Container, Transition } from '@mantine/core';
import { useTrends } from '@/hooks/useTrends';
import { Header } from '@/components/layout/Header';
import { TrendsList } from '@/components/trends/TrendsList';
import { TrendsTableView } from '@/components/trends/TrendsTableView';
import { GallerySkeleton } from '@/components/common/GallerySkeleton';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { COUNTRIES, type SiteId } from '@/utils/constants';
import { fadeSlide } from '@/lib/transitions';
import { getViewMode, type ViewMode } from '@/utils/storage';

export default function TrendsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const country = params.country as SiteId;
  const selectedCategory = searchParams.get('category');

  // View mode state - initialize with saved value
  const [viewMode] = useState<ViewMode>(() => {
    // This runs only once on mount
    if (typeof window !== 'undefined') {
      return getViewMode();
    }
    return 'gallery';
  });

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

  // Render the appropriate skeleton based on viewMode
  const renderSkeleton = () => {
    switch (viewMode) {
      case 'table':
        return <TableSkeleton />;
      case 'gallery':
      default:
        return <GallerySkeleton />;
    }
  };

  // Render the appropriate view based on viewMode
  const renderTrendsView = () => {
    if (!data || loading || error) return null;

    switch (viewMode) {
      case 'table':
        return <TrendsTableView trends={data} />;
      case 'gallery':
      default:
        return <TrendsList trends={data} country={country} />;
    }
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header currentCountry={country} currentCategory={selectedCategory} />

      <AppShell.Main>
        <Container size="xl" py="xl">
          {/* Loading State */}
          {loading && renderSkeleton()}

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
                {renderTrendsView()}
              </div>
            )}
          </Transition>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
