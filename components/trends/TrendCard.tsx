'use client';

import { useState, useEffect } from 'react';
import { Card, Text, Badge, Group, Stack, ActionIcon, CopyButton, Tooltip } from '@mantine/core';
import { IconExternalLink, IconCopy, IconCheck } from '@tabler/icons-react';
import type { TrendItem } from '@/types/meli';
import { getTrendTypeLabel, getTrendTypeColor } from '@/utils/trends';
import { getRankBadgeColor, getRankBadgeVariant } from '@/utils/categoryColors';
import { getBadgeStyle, type BadgeStyle } from '@/utils/storage';
import { useTranslations } from 'next-intl';

interface TrendCardProps {
  trend: TrendItem;
  rank: number;
}

export function TrendCard({ trend, rank }: TrendCardProps) {
  const t = useTranslations();
  const [badgeStyle, setBadgeStyle] = useState<BadgeStyle>('gradient');

  // Load badge style preference on mount
  useEffect(() => {
    const savedStyle = getBadgeStyle();
    if (savedStyle !== badgeStyle) {
      setBadgeStyle(savedStyle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              variant={getRankBadgeVariant(rank, badgeStyle)}
              color={getRankBadgeColor(rank, badgeStyle)}
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
          <Group gap={4} wrap="nowrap">
            <CopyButton value={trend.keyword} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t('trends.copiedTrend') : t('trends.copyTrend')} withArrow position="left">
                  <ActionIcon
                    color={copied ? 'teal' : undefined}
                    variant="subtle"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copy();
                    }}
                    aria-label={t('trends.copyTrend')}
                    style={{ opacity: copied ? 1 : 0.6 }}
                  >
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
            <IconExternalLink size={18} style={{ opacity: 0.6, flexShrink: 0 }} />
          </Group>
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
      </Stack>
    </Card>
  );
}
