'use client';

import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Progress,
  Image,
  Tooltip,
  Box,
  NumberFormatter,
  ActionIcon,
  Loader,
  Alert,
  CopyButton,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconExternalLink,
  IconTruck,
  IconShoppingCart,
  IconStar,
  IconChartBar,
  IconPlus,
  IconAlertCircle,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';
import { useEnrichTrendOnDemand } from '@/hooks/useEnrichTrendOnDemand';
import type { TrendItem, SiteId } from '@/types/meli';
import { useTranslations } from 'next-intl';

interface EnrichedTrendCardProps {
  trend: TrendItem;
  rank: number;
  siteId: SiteId;
}

export function EnrichedTrendCard({ trend, rank, siteId }: EnrichedTrendCardProps) {
  const { state, enrich } = useEnrichTrendOnDemand(siteId, trend);
  const t = useTranslations();

  const getRankColor = (position: number): string => {
    if (position === 1) return 'yellow';
    if (position <= 3) return 'meliBlue';
    if (position <= 10) return 'meliGreen';
    return 'gray';
  };

  const getRankLabel = (position: number): string => {
    return `#${position}`;
  };

  const getOpportunityColor = (score?: number): string => {
    if (!score) return 'gray';
    if (score >= 75) return 'green';
    if (score >= 50) return 'blue';
    if (score >= 25) return 'yellow';
    return 'red';
  };

  const getOpportunityLabel = (score?: number): string => {
    if (!score) return t('trends.opportunityLabels.noData');
    if (score >= 75) return t('trends.opportunityLabels.excellent');
    if (score >= 50) return t('trends.opportunityLabels.good');
    if (score >= 25) return t('trends.opportunityLabels.medium');
    return t('trends.opportunityLabels.low');
  };

  const enrichedData = state.status === 'success' ? state.data : null;
  const currency = enrichedData?.products[0]?.currency_id || 'ARS';
  const hasProducts = enrichedData?.products && enrichedData.products.length > 0;
  const isEnriched = state.status === 'success';

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        height: '100%',
      }}
      styles={{
        root: {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'var(--mantine-shadow-md)',
          },
        },
      }}
    >
      <Stack gap="md" h="100%">
        {/* Header: Rank + Enrich Button or Opportunity Score */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Badge
            size="lg"
            variant="filled"
            color={getRankColor(rank)}
            leftSection={<IconTrendingUp size={14} />}
          >
            {getRankLabel(rank)}
          </Badge>

          {/* Show Enrich Button if not enriched */}
          {!isEnriched && state.status !== 'error' && (
            <Tooltip label={t('trends.viewDetailsTooltip')}>
              <ActionIcon
                variant="light"
                color="meliBlue"
                size="lg"
                onClick={enrich}
                loading={state.status === 'loading'}
              >
                {state.status === 'loading' ? <Loader size="sm" /> : <IconPlus size={18} />}
              </ActionIcon>
            </Tooltip>
          )}

          {/* Show Opportunity Score if enriched */}
          {isEnriched && enrichedData && (
            <Tooltip label={t('trends.opportunityTooltip')}>
              <Badge
                size="lg"
                variant="light"
                color={getOpportunityColor(enrichedData.opportunity_score)}
                leftSection={<IconStar size={14} />}
              >
                {enrichedData.opportunity_score || 0}% {getOpportunityLabel(enrichedData.opportunity_score)}
              </Badge>
            </Tooltip>
          )}
        </Group>

        {/* Keyword */}
        <Box
          component="a"
          href={trend.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Group gap="xs">
            <Text
              fw={700}
              size="xl"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {trend.keyword}
            </Text>
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
        </Box>

        {/* Error State */}
        {state.status === 'error' && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {t('trends.errorLoadingDetails')} {state.error}
          </Alert>
        )}

        {/* Enriched Data */}
        {isEnriched && enrichedData && (
          <>
            {/* Opportunity Score Progress Bar */}
            {enrichedData.opportunity_score !== undefined && (
              <Box>
                <Group justify="space-between" mb={5}>
                  <Text size="xs" c="dimmed" fw={500}>
                    {t('trends.businessOpportunity')}
                  </Text>
                  <Text size="xs" fw={600}>
                    {enrichedData.opportunity_score}/100
                  </Text>
                </Group>
                <Progress
                  value={enrichedData.opportunity_score}
                  color={getOpportunityColor(enrichedData.opportunity_score)}
                  size="sm"
                  radius="xl"
                />
              </Box>
            )}

            {/* Product Thumbnails */}
            {hasProducts && (
              <Group gap="xs">
                {enrichedData.products.slice(0, 3).map((product, idx) => (
                  <Box key={product.id} style={{ position: 'relative' }}>
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      w={60}
                      h={60}
                      fit="contain"
                      radius="sm"
                      style={{ border: '1px solid var(--mantine-color-gray-3)' }}
                    />
                    {idx === 0 && product.condition === 'new' && (
                      <Badge
                        size="xs"
                        variant="filled"
                        color="blue"
                        style={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                        }}
                      >
                        {t('trends.new')}
                      </Badge>
                    )}
                  </Box>
                ))}
                {enrichedData.products.length > 3 && (
                  <Text size="xs" c="dimmed" fw={500}>
                    +{enrichedData.products.length - 3} {t('trends.more')}
                  </Text>
                )}
              </Group>
            )}

            {/* Metrics Grid */}
            <Stack gap="xs">
              {/* Price Range */}
              {enrichedData.min_price !== undefined && enrichedData.max_price !== undefined && (
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs">
                    <IconChartBar size={16} style={{ opacity: 0.6 }} />
                    <Text size="sm" fw={500} c="dimmed">
                      {t('trends.priceRangeLabel')}
                    </Text>
                  </Group>
                  <Text size="sm" fw={600}>
                    <NumberFormatter
                      value={enrichedData.min_price}
                      prefix={currency + ' '}
                      thousandSeparator
                      decimalScale={0}
                    />{' '}
                    -{' '}
                    <NumberFormatter
                      value={enrichedData.max_price}
                      prefix={currency + ' '}
                      thousandSeparator
                      decimalScale={0}
                    />
                  </Text>
                </Group>
              )}

              {/* Average Price */}
              {enrichedData.avg_price !== undefined && (
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs">
                    <IconChartBar size={16} style={{ opacity: 0.6 }} />
                    <Text size="sm" fw={500} c="dimmed">
                      {t('trends.averagePrice')}
                    </Text>
                  </Group>
                  <Text size="sm" fw={700} c="blue">
                    <NumberFormatter
                      value={enrichedData.avg_price}
                      prefix={currency + ' '}
                      thousandSeparator
                      decimalScale={0}
                    />
                  </Text>
                </Group>
              )}

              {/* Total Sold */}
              {enrichedData.total_sold !== undefined && enrichedData.total_sold > 0 && (
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs">
                    <IconShoppingCart size={16} style={{ opacity: 0.6 }} />
                    <Text size="sm" fw={500} c="dimmed">
                      {t('trends.totalSold')}
                    </Text>
                  </Group>
                  <Text size="sm" fw={600} c="green">
                    <NumberFormatter
                      value={enrichedData.total_sold}
                      thousandSeparator
                      suffix={` ${t('trends.units')}`}
                    />
                  </Text>
                </Group>
              )}

              {/* Free Shipping */}
              {enrichedData.free_shipping_percentage !== undefined && (
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs">
                    <IconTruck size={16} style={{ opacity: 0.6 }} />
                    <Text size="sm" fw={500} c="dimmed">
                      {t('trends.freeShippingLabel')}
                    </Text>
                  </Group>
                  <Text size="sm" fw={600} c={enrichedData.free_shipping_percentage >= 50 ? 'green' : 'orange'}>
                    {Math.round(enrichedData.free_shipping_percentage)}%
                  </Text>
                </Group>
              )}

              {/* Total Results */}
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" fw={500} c="dimmed">
                  {t('trends.searchResults')}
                </Text>
                <Text size="sm" fw={600}>
                  <NumberFormatter value={enrichedData.total_results} thousandSeparator />
                </Text>
              </Group>
            </Stack>
          </>
        )}

        {/* Not Enriched State - Show Hint */}
        {!isEnriched && state.status === 'idle' && (
          <Box mt="auto" pt="md">
            <Text size="sm" c="dimmed" ta="center">
              {t('trends.clickToSeeMetrics')}
            </Text>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
