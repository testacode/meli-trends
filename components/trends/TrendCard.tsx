'use client';

import { Card, Text, Badge, Group, Stack } from '@mantine/core';
import { IconTrendingUp, IconExternalLink } from '@tabler/icons-react';
import type { TrendItem } from '@/types/meli';
import { getTrendTypeLabel, getTrendTypeColor } from '@/utils/trends';

interface TrendCardProps {
  trend: TrendItem;
  rank: number;
}

export function TrendCard({ trend, rank }: TrendCardProps) {
  const getRankColor = (position: number): string => {
    if (position === 1) return 'yellow';
    if (position <= 3) return 'meliBlue';
    if (position <= 10) return 'meliGreen';
    return 'gray';
  };

  const getRankLabel = (position: number): string => {
    return `#${position}`;
  };

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        height: '100%',
      }}
      component="a"
      href={trend.url}
      target="_blank"
      rel="noopener noreferrer"
      styles={{
        root: {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 'var(--mantine-shadow-md)',
          },
        },
      }}
    >
      <Stack gap="sm" h="100%">
        {/* Rank Badge and Trend Type */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" wrap="wrap">
            <Badge
              size="lg"
              variant="filled"
              color={getRankColor(rank)}
              leftSection={<IconTrendingUp size={14} />}
            >
              {getRankLabel(rank)}
            </Badge>
            {trend.trend_type && (
              <Badge
                size="sm"
                variant="light"
                color={getTrendTypeColor(trend.trend_type)}
              >
                {getTrendTypeLabel(trend.trend_type)}
              </Badge>
            )}
          </Group>
          <IconExternalLink size={18} style={{ opacity: 0.6, flexShrink: 0 }} />
        </Group>

        {/* Keyword */}
        <Text
          fw={600}
          size="lg"
          style={{
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {trend.keyword}
        </Text>

        {/* View Link */}
        <Group justify="flex-end">
          <Text size="sm" fw={500} c="meliBlue">
            Ver en MercadoLibre →
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
