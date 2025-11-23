'use client';

import { useState } from 'react';
import { SimpleGrid, Stack, Title, Text, Group, Chip, Center } from '@mantine/core';
import { IconTrendingUp } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { TrendsResponse, TrendType } from '@/types/meli';
import { TrendCard } from './TrendCard';
import { COUNTRIES, type SiteId } from '@/utils/constants';

interface TrendsListProps {
  trends: TrendsResponse;
  country: SiteId;
}

export function TrendsList({ trends, country }: TrendsListProps) {
  const t = useTranslations();
  const countryData = COUNTRIES[country];
  const [selectedType, setSelectedType] = useState<'all' | TrendType>('all');

  if (!trends || trends.length === 0) {
    return (
      <Stack align="center" justify="center" mih={400}>
        <IconTrendingUp size={48} style={{ opacity: 0.3 }} />
        <Text size="lg" c="dimmed">
          {t('trends.noTrendsAvailable')}
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
          {countryData.flag} {t('trends.trendsIn')} {countryData.name}
        </Title>
      </Group>

      <Text size="sm" c="dimmed">
        {t('trends.showingResults', { showing: filteredTrends.length, total: trends.length })}
      </Text>

      {/* Trend Type Filter */}
      <Center>
        <Chip.Group
          value={selectedType}
          onChange={(value) => setSelectedType(value as 'all' | TrendType)}
          multiple={false}
        >
          <Group justify="center" gap="xs">
            <Chip value="all" variant="filled">{t('trends.filters.all')}</Chip>
            <Chip value="fastest_growing" variant="filled">{t('trends.filters.fastestGrowing')}</Chip>
            <Chip value="most_wanted" variant="filled">{t('trends.filters.mostWanted')}</Chip>
            <Chip value="most_popular" variant="filled">{t('trends.filters.mostPopular')}</Chip>
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
