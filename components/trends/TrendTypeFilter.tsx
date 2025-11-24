'use client';

import { Center, Chip, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import type { TrendType } from '@/types/meli';

interface TrendTypeFilterProps {
  value: 'all' | TrendType;
  onChange: (value: 'all' | TrendType) => void;
}

/**
 * Reusable filter component for trend types
 * Used across Gallery, Table, and List views
 */
export function TrendTypeFilter({ value, onChange }: TrendTypeFilterProps) {
  const t = useTranslations();

  return (
    <Center>
      <Chip.Group
        value={value}
        onChange={(val) => onChange(val as 'all' | TrendType)}
        multiple={false}
      >
        <Group justify="center" gap="xs">
          <Chip value="all" variant="filled">
            {t('trends.filters.all')}
          </Chip>
          <Chip value="fastest_growing" variant="filled">
            {t('trends.filters.fastestGrowing')}
          </Chip>
          <Chip value="most_wanted" variant="filled">
            {t('trends.filters.mostWanted')}
          </Chip>
          <Chip value="most_popular" variant="filled">
            {t('trends.filters.mostPopular')}
          </Chip>
        </Group>
      </Chip.Group>
    </Center>
  );
}
