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
  SegmentedControl,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { useTrends } from '@/hooks/useTrends';
import { EnrichedTrendCard } from '@/components/trends/EnrichedTrendCard';
import { COUNTRIES } from '@/utils/constants';
import type { SiteId, TrendType } from '@/types/meli';

interface PageProps {
  params: Promise<{
    country: string;
  }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

export default function EnrichedTrendsPage({ params, searchParams }: PageProps) {
  const { country } = use(params);
  const { category } = use(searchParams);
  const siteId = country as SiteId;
  const countryData = COUNTRIES[siteId];
  const [selectedType, setSelectedType] = useState<'all' | TrendType>('all');

  const {
    data: trendsData,
    loading,
    error,
    refetch,
  } = useTrends({
    siteId,
    categoryId: category || undefined,
  });

  const trends = trendsData || [];

  // Filter trends by selected type
  const filteredTrends = selectedType === 'all'
    ? trends
    : trends.filter(trend => trend.trend_type === selectedType);

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

          {/* Stats */}
          {trends.length > 0 && (
            <Group gap="md">
              <Badge size="lg" variant="light" color="blue">
                {filteredTrends.length} de {trends.length} trends disponibles
              </Badge>
            </Group>
          )}
        </Box>

        {/* Trend Type Filter */}
        {trends.length > 0 && (
          <Center>
            <SegmentedControl
              value={selectedType}
              onChange={(value) => setSelectedType(value as 'all' | TrendType)}
              data={[
                { label: 'Todos', value: 'all' },
                { label: 'Mayor Crecimiento', value: 'fastest_growing' },
                { label: 'Más Buscados', value: 'most_wanted' },
                { label: 'Más Populares', value: 'most_popular' },
              ]}
              size="md"
              radius="md"
              fullWidth
              styles={{
                root: {
                  maxWidth: '800px',
                },
              }}
            />
          </Center>
        )}

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
        {filteredTrends.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {filteredTrends.map((trend, index) => (
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
