'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell, Container } from '@mantine/core';
import { useAuth } from '@/contexts/AuthContext';
import { useTrends } from '@/hooks/useTrends';
import { Header } from '@/components/layout/Header';
import { TrendsList } from '@/components/trends/TrendsList';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { COUNTRIES, type SiteId } from '@/utils/constants';

export default function TrendsPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  const country = params.country as SiteId;

  // Validate country
  const isValidCountry = country && country in COUNTRIES;

  // Fetch trends
  const { data, loading, error, refetch } = useTrends({
    token,
    siteId: country,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect to default country if invalid country
  useEffect(() => {
    if (!isValidCountry && !authLoading) {
      router.push('/');
    }
  }, [isValidCountry, authLoading, router]);

  // Show nothing while checking auth
  if (authLoading) {
    return null;
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show nothing if invalid country (will redirect)
  if (!isValidCountry) {
    return null;
  }

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header currentCountry={country} />

      <AppShell.Main>
        <Container size="xl" py="xl">
          {loading && <LoadingSkeleton />}

          {error && !loading && <ErrorState error={error} onRetry={refetch} />}

          {data && !loading && !error && <TrendsList trends={data} country={country} />}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
