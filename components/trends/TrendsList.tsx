'use client';

import { SimpleGrid, Stack, Title, Text, Group } from '@mantine/core';
import { IconTrendingUp } from '@tabler/icons-react';
import type { TrendsResponse } from '@/types/meli';
import { TrendCard } from './TrendCard';
import { COUNTRIES, type SiteId } from '@/utils/constants';

interface TrendsListProps {
  trends: TrendsResponse;
  country: SiteId;
}

export function TrendsList({ trends, country }: TrendsListProps) {
  const countryData = COUNTRIES[country];

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

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group gap="xs">
        <Title order={2}>
          {countryData.flag} Tendencias en {countryData.name}
        </Title>
      </Group>

      <Text size="sm" c="dimmed">
        Mostrando los {trends.length} productos más buscados
      </Text>

      {/* Grid of Trend Cards */}
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
        spacing={{ base: 'md', sm: 'lg' }}
        verticalSpacing={{ base: 'md', sm: 'lg' }}
      >
        {trends.map((trend, index) => (
          <TrendCard key={`${trend.keyword}-${index}`} trend={trend} rank={index + 1} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
