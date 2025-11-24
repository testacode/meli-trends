'use client';

import { useState, useMemo } from 'react';
import { Badge, ActionIcon, Tooltip, Text, Stack, CopyButton, Group } from '@mantine/core';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import { IconTrendingUp, IconExternalLink, IconCopy, IconCheck, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { TrendsResponse, TrendType, TrendItem } from '@/types/meli';
import { getTrendTypeLabel, getTrendTypeColor } from '@/utils/trends';
import { TrendTypeFilter } from './TrendTypeFilter';

interface TrendsTableViewProps {
  trends: TrendsResponse;
}

// Extended TrendItem with rank for display
type TrendWithRank = TrendItem & { rank: number };

export function TrendsTableView({ trends }: TrendsTableViewProps) {
  const t = useTranslations();
  const [selectedType, setSelectedType] = useState<'all' | TrendType>('all');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<TrendWithRank>>({
    columnAccessor: 'rank',
    direction: 'asc',
  });

  // Add rank to trends and filter by type
  const trendsWithRank: TrendWithRank[] = useMemo(() => {
    const filtered = selectedType === 'all'
      ? trends
      : trends.filter(trend => trend.trend_type === selectedType);

    return filtered.map((trend, index) => ({
      ...trend,
      rank: index + 1,
    }));
  }, [trends, selectedType]);

  // Sort the data based on sortStatus
  const sortedTrends = useMemo(() => {
    const sorted = [...trendsWithRank];

    if (sortStatus.columnAccessor === 'rank') {
      sorted.sort((a, b) =>
        sortStatus.direction === 'asc' ? a.rank - b.rank : b.rank - a.rank
      );
    } else if (sortStatus.columnAccessor === 'keyword') {
      sorted.sort((a, b) =>
        sortStatus.direction === 'asc'
          ? a.keyword.localeCompare(b.keyword)
          : b.keyword.localeCompare(a.keyword)
      );
    } else if (sortStatus.columnAccessor === 'trend_type') {
      sorted.sort((a, b) => {
        const typeA = a.trend_type || '';
        const typeB = b.trend_type || '';
        return sortStatus.direction === 'asc'
          ? typeA.localeCompare(typeB)
          : typeB.localeCompare(typeA);
      });
    }

    return sorted;
  }, [trendsWithRank, sortStatus]);

  const getRankIcon = (position: number): string => {
    if (position === 1) return '🏆';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `${position}`;
  };

  const getRankColor = (position: number): string => {
    if (position === 1) return 'yellow';
    if (position <= 3) return 'meliBlue';
    if (position <= 10) return 'meliGreen';
    return 'gray';
  };

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

  return (
    <Stack gap="lg">
      {/* Filter */}
      <TrendTypeFilter value={selectedType} onChange={setSelectedType} />

      {/* DataTable */}
      <DataTable
        idAccessor="url"
        columns={[
          {
            accessor: 'rank',
            title: t('trends.table.rank'),
            sortable: true,
            width: 80,
            textAlign: 'center',
            render: (trend) => (
              <Badge
                size="lg"
                variant="filled"
                color={getRankColor(trend.rank)}
                leftSection={trend.rank <= 3 ? undefined : <IconTrendingUp size={14} />}
              >
                {getRankIcon(trend.rank)}
              </Badge>
            ),
          },
          {
            accessor: 'keyword',
            title: t('trends.table.keyword'),
            sortable: true,
            render: (trend) => (
              <Text fw={trend.rank <= 10 ? 600 : 500} size="sm">
                {trend.keyword}
              </Text>
            ),
          },
          {
            accessor: 'trend_type',
            title: t('trends.table.type'),
            sortable: true,
            width: 200,
            render: (trend) => (
              trend.trend_type ? (
                <Badge
                  size="md"
                  variant="light"
                  color={getTrendTypeColor(trend.trend_type)}
                  fullWidth
                >
                  {getTrendTypeLabel(trend.trend_type)}
                </Badge>
              ) : null
            ),
          },
          {
            accessor: 'actions',
            title: t('trends.table.actions'),
            width: 120,
            textAlign: 'center',
            render: (trend) => (
              <Group gap={4} justify="center" wrap="nowrap">
                <CopyButton value={trend.keyword} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={copied ? t('trends.copiedTrend') : t('trends.copyTrend')}
                      withArrow
                      position="left"
                    >
                      <ActionIcon
                        color={copied ? 'teal' : 'gray'}
                        variant="subtle"
                        onClick={copy}
                        aria-label={t('trends.copyTrend')}
                      >
                        {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
                <Tooltip label={t('trends.viewOnMeli')} withArrow position="right">
                  <ActionIcon
                    component="a"
                    href={trend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="subtle"
                    color="meliBlue"
                    aria-label={t('trends.viewOnMeli')}
                  >
                    <IconExternalLink size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
        records={sortedTrends}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        sortIcons={{
          sorted: <IconArrowUp size={14} />,
          unsorted: <IconArrowDown size={14} />,
        }}
        highlightOnHover
        striped
        withTableBorder
        withColumnBorders
        rowStyle={(trend) => ({
          backgroundColor: trend.rank <= 3 ? 'var(--mantine-color-blue-light-hover)' : undefined,
        })}
      />
    </Stack>
  );
}
