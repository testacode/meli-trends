'use client';

import { useState } from 'react';
import { SimpleGrid, Stack, Title, Text, Group, Chip, Center } from '@mantine/core';
import { IconTrendingUp } from '@tabler/icons-react';
import type { TrendsResponse, TrendType } from '@/types/meli';
import { TrendCard } from './TrendCard';
import { COUNTRIES, type SiteId } from '@/utils/constants';

interface TrendsListProps {
  trends: TrendsResponse;
  country: SiteId;
}

export function TrendsList({ trends, country }: TrendsListProps) {
  const countryData = COUNTRIES[country];
  const [selectedType, setSelectedType] = useState<'all' | TrendType>('all');

  if (!trends || trends.length === 0) {
    return (
      <Stack align="center" justify="center" mih={400}>
        <IconTrendingUp size={48} style={{ opacity: 0.3 }} />
        <Text size="lg" c="dimmed">
          No hay trends disponibles en este momento
        </Text>
      </Stack>
    );
  }

  // Filter trends by selected type
  const filteredTrends = selectedType === 'all'
    ? trends
    : trends.filter(trend => trend.trend_type === selectedType);

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group gap="xs">
        <Title order={2}>
          {countryData.flag} Tendencias en {countryData.name}
        </Title>
      </Group>

      <Text size="sm" c="dimmed">
        Mostrando {filteredTrends.length} de {trends.length} productos más buscados
      </Text>

      {/* Trend Type Filter */}
      <Center>
        <Chip.Group
          value={selectedType}
          onChange={(value) => setSelectedType(value as 'all' | TrendType)}
          multiple={false}
        >
          <Group justify="center" gap="xs">
            <Chip value="all" variant="filled">Todos</Chip>
            <Chip value="fastest_growing" variant="filled">Mayor Crecimiento</Chip>
            <Chip value="most_wanted" variant="filled">Más Buscados</Chip>
            <Chip value="most_popular" variant="filled">Más Populares</Chip>
          </Group>
        </Chip.Group>
      </Center>

      {/* Grid of Trend Cards */}
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
        spacing={{ base: 'md', sm: 'lg' }}
        verticalSpacing={{ base: 'md', sm: 'lg' }}
      >
        {filteredTrends.map((trend, index) => (
          <TrendCard key={`${trend.keyword}-${index}`} trend={trend} rank={index + 1} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
