'use client';

import { useState } from 'react';
import { Paper, Group, Badge, Text, ActionIcon, Tooltip, CopyButton, Stack } from '@mantine/core';
import { IconTrendingUp, IconExternalLink, IconCopy, IconCheck } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { TrendsResponse, TrendType } from '@/types/meli';
import { getTrendTypeLabel, getTrendTypeColor } from '@/utils/trends';
import { TrendTypeFilter } from './TrendTypeFilter';

interface TrendsListViewProps {
  trends: TrendsResponse;
}

export function TrendsListView({ trends }: TrendsListViewProps) {
  const t = useTranslations();
  const [selectedType, setSelectedType] = useState<'all' | TrendType>('all');

  // Filter trends by selected type
  const filteredTrends = selectedType === 'all'
    ? trends
    : trends.filter(trend => trend.trend_type === selectedType);

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

  const getRankIcon = (position: number): string => {
    if (position === 1) return '🏆';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '📊';
  };

  const getRankColor = (position: number): string => {
    if (position === 1) return 'yellow';
    if (position <= 3) return 'meliBlue';
    if (position <= 10) return 'meliGreen';
    return 'gray';
  };

  return (
    <Stack gap="lg">
      {/* Filter */}
      <TrendTypeFilter value={selectedType} onChange={setSelectedType} />

      {/* List */}
      <Stack gap="xs">
        {filteredTrends.map((trend, index) => {
        const rank = index + 1;
        const isTopThree = rank <= 3;

        return (
          <Paper
            key={`${trend.keyword}-${index}`}
            shadow="xs"
            p="md"
            radius="md"
            withBorder
            style={{
              transition: 'all 0.2s ease',
              borderLeft: isTopThree ? '4px solid var(--mantine-color-meliBlue-5)' : undefined,
              backgroundColor: isTopThree
                ? 'var(--mantine-color-blue-light-hover)'
                : undefined,
            }}
            styles={{
              root: {
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: 'var(--mantine-shadow-sm)',
                },
              },
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              {/* Left side: Rank + Keyword + Type */}
              <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
                {/* Rank Badge */}
                <Badge
                  size="lg"
                  variant="filled"
                  color={getRankColor(rank)}
                  style={{ flexShrink: 0 }}
                >
                  {getRankIcon(rank)} #{rank}
                </Badge>

                {/* Keyword */}
                <Text
                  fw={isTopThree ? 600 : 500}
                  size={isTopThree ? 'md' : 'sm'}
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {trend.keyword}
                </Text>

                {/* Type Badge */}
                {trend.trend_type && (
                  <Badge
                    size="sm"
                    variant="light"
                    color={getTrendTypeColor(trend.trend_type)}
                    style={{ flexShrink: 0 }}
                  >
                    {getTrendTypeLabel(trend.trend_type)}
                  </Badge>
                )}
              </Group>

              {/* Right side: Actions */}
              <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
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
            </Group>
          </Paper>
        );
        })}
      </Stack>
    </Stack>
  );
}
