'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell, Container, Select, Stack, Group, Text } from '@mantine/core';
import { IconCategory } from '@tabler/icons-react';
import { useTrends } from '@/hooks/useTrends';
import { useCategories } from '@/hooks/useCategories';
import { Header } from '@/components/layout/Header';
import { TrendsList } from '@/components/trends/TrendsList';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { COUNTRIES, type SiteId } from '@/utils/constants';

export default function TrendsPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const country = params.country as SiteId;

  // Validate country
  const isValidCountry = country && country in COUNTRIES;

  // Fetch categories for the current country
  const { data: categories, loading: loadingCategories } = useCategories({
    siteId: country,
  });

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

  // Category options for the dropdown
  const categoryOptions = categories
    ? [
        { value: '', label: 'Todas las categorías' },
        ...categories.map((cat) => ({
          value: cat.id,
          label: cat.name,
        })),
      ]
    : [{ value: '', label: 'Todas las categorías' }];

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header currentCountry={country} />

      <AppShell.Main>
        <Container size="xl" py="xl">
          <Stack gap="lg">
            {/* Category Filter */}
            <Group justify="space-between" align="flex-end">
              <Select
                placeholder="Selecciona una categoría"
                data={categoryOptions}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value || null)}
                leftSection={<IconCategory size={18} />}
                clearable
                searchable
                disabled={loadingCategories}
                styles={{ root: { maxWidth: 400 } }}
                comboboxProps={{ withinPortal: true }}
              />
              {selectedCategory && (
                <Text size="sm" c="dimmed">
                  Filtrando por categoría
                </Text>
              )}
            </Group>

            {/* Trends List */}
            {loading && <LoadingSkeleton />}

            {error && !loading && <ErrorState error={error} onRetry={refetch} />}

            {data && !loading && !error && <TrendsList trends={data} country={country} />}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
