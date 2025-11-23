'use client';

import { use, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Loader,
  Center,
  Alert,
  Badge,
  Group,
  Button,
  Box,
  Select,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconRefresh,
  IconCategory,
} from '@tabler/icons-react';
import { useTrends } from '@/hooks/useTrends';
import { useCategories } from '@/hooks/useCategories';
import { EnrichedTrendCard } from '@/components/trends/EnrichedTrendCard';
import { COUNTRIES } from '@/utils/constants';
import type { SiteId } from '@/types/meli';

interface PageProps {
  params: Promise<{
    country: string;
  }>;
}

export default function EnrichedTrendsPage({ params }: PageProps) {
  const { country } = use(params);
  const siteId = country as SiteId;
  const countryData = COUNTRIES[siteId];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories for the current country
  const { data: categories, loading: loadingCategories } = useCategories({
    siteId,
  });

  const {
    data: trendsData,
    loading,
    error,
    refetch,
  } = useTrends({
    siteId,
    categoryId: selectedCategory || undefined,
  });

  const trends = trendsData || [];

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

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
        >
          {error.message}
        </Alert>
        <Center mt="md">
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={refetch}
            variant="light"
          >
            Reintentar
          </Button>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Group justify="space-between" align="flex-start" mb="md">
            <Box>
              <Group gap="xs" mb="xs">
                <Title order={1}>
                  {countryData.flag} Tendencias Enriquecidas - {countryData.name}
                </Title>
              </Group>
              <Text size="lg" c="dimmed">
                Análisis detallado de los productos más buscados con métricas de
                negocio
              </Text>
            </Box>

            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={refetch}
              variant="light"
              loading={loading}
            >
              Actualizar
            </Button>
          </Group>

          {/* Category Filter */}
          <Group justify="space-between" align="flex-end" mb="md">
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

          {/* Stats */}
          {trends.length > 0 && (
            <Group gap="md">
              <Badge size="lg" variant="light" color="blue">
                {trends.length} trends disponibles
              </Badge>
            </Group>
          )}
        </Box>

        {/* Loading first page */}
        {loading && trends.length === 0 && (
          <Center py={60}>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text c="dimmed">Cargando trends...</Text>
            </Stack>
          </Center>
        )}

        {/* Trends Grid */}
        {trends.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {trends.map((trend, index) => (
              <EnrichedTrendCard
                key={trend.keyword}
                trend={trend}
                rank={index + 1}
                siteId={siteId}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}
