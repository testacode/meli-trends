'use client';

import { Table, Badge, ActionIcon, Tooltip, Text, Stack, CopyButton, Group, ScrollArea } from '@mantine/core';
import { IconTrendingUp, IconExternalLink, IconCopy, IconCheck } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { TrendsResponse } from '@/types/meli';
import { getTrendTypeLabel, getTrendTypeColor } from '@/utils/trends';

interface TrendsTableViewProps {
  trends: TrendsResponse;
}

export function TrendsTableView({ trends }: TrendsTableViewProps) {
  const t = useTranslations();

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
    return `${position}`;
  };

  const getRankColor = (position: number): string => {
    if (position === 1) return 'yellow';
    if (position <= 3) return 'meliBlue';
    if (position <= 10) return 'meliGreen';
    return 'gray';
  };

  return (
    <ScrollArea>
      <Table highlightOnHover withTableBorder withColumnBorders striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '80px', textAlign: 'center' }}>
              {t('trends.table.rank')}
            </Table.Th>
            <Table.Th>{t('trends.table.keyword')}</Table.Th>
            <Table.Th style={{ width: '200px' }}>{t('trends.table.type')}</Table.Th>
            <Table.Th style={{ width: '120px', textAlign: 'center' }}>
              {t('trends.table.actions')}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {trends.map((trend, index) => {
            const rank = index + 1;
            return (
              <Table.Tr
                key={`${trend.keyword}-${index}`}
                style={{
                  backgroundColor: rank <= 3 ? 'var(--mantine-color-blue-light-hover)' : undefined,
                }}
              >
                {/* Rank */}
                <Table.Td style={{ textAlign: 'center' }}>
                  <Badge
                    size="lg"
                    variant="filled"
                    color={getRankColor(rank)}
                    leftSection={rank <= 3 ? undefined : <IconTrendingUp size={14} />}
                  >
                    {getRankIcon(rank)}
                  </Badge>
                </Table.Td>

                {/* Keyword */}
                <Table.Td>
                  <Text fw={rank <= 10 ? 600 : 500} size="sm">
                    {trend.keyword}
                  </Text>
                </Table.Td>

                {/* Type */}
                <Table.Td>
                  {trend.trend_type && (
                    <Badge
                      size="md"
                      variant="light"
                      color={getTrendTypeColor(trend.trend_type)}
                      fullWidth
                    >
                      {getTrendTypeLabel(trend.trend_type)}
                    </Badge>
                  )}
                </Table.Td>

                {/* Actions */}
                <Table.Td>
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
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
