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
} from '@mantine/core';
import {
  IconTrendingUp,
  IconExternalLink,
  IconTruck,
  IconShoppingCart,
  IconStar,
  IconChartBar,
} from '@tabler/icons-react';
import type { EnrichedTrendItem } from '@/types/meli';

interface EnrichedTrendCardProps {
  trend: EnrichedTrendItem;
  rank: number;
}

export function EnrichedTrendCard({ trend, rank }: EnrichedTrendCardProps) {
  const getRankColor = (position: number): string => {
    if (position === 1) return 'yellow';
    if (position <= 3) return 'meliBlue';
    if (position <= 10) return 'meliGreen';
    return 'gray';
  };

  const getRankLabel = (position: number): string => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
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
    if (!score) return 'Sin datos';
    if (score >= 75) return 'Excelente';
    if (score >= 50) return 'Buena';
    if (score >= 25) return 'Media';
    return 'Baja';
  };

  const currency = trend.products[0]?.currency_id || 'USD';
  const hasProducts = trend.products.length > 0;

  return (
    <Card
      shadow="sm"
      padding="lg"
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
            boxShadow: 'var(--mantine-shadow-lg)',
          },
        },
      }}
    >
      <Stack gap="md" h="100%">
        {/* Header: Rank + Opportunity Score */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Badge
            size="lg"
            variant="filled"
            color={getRankColor(rank)}
            leftSection={<IconTrendingUp size={14} />}
          >
            {getRankLabel(rank)}
          </Badge>

          <Tooltip label="Puntuación de oportunidad de negocio">
            <Badge
              size="lg"
              variant="light"
              color={getOpportunityColor(trend.opportunity_score)}
              leftSection={<IconStar size={14} />}
            >
              {trend.opportunity_score || 0}% {getOpportunityLabel(trend.opportunity_score)}
            </Badge>
          </Tooltip>

          <IconExternalLink size={18} style={{ opacity: 0.6 }} />
        </Group>

        {/* Keyword */}
        <Text
          fw={700}
          size="xl"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {trend.keyword}
        </Text>

        {/* Opportunity Score Progress Bar */}
        {trend.opportunity_score !== undefined && (
          <Box>
            <Group justify="space-between" mb={5}>
              <Text size="xs" c="dimmed" fw={500}>
                Oportunidad de Negocio
              </Text>
              <Text size="xs" fw={600}>
                {trend.opportunity_score}/100
              </Text>
            </Group>
            <Progress
              value={trend.opportunity_score}
              color={getOpportunityColor(trend.opportunity_score)}
              size="sm"
              radius="xl"
            />
          </Box>
        )}

        {/* Product Thumbnails */}
        {hasProducts && (
          <Group gap="xs">
            {trend.products.slice(0, 3).map((product, idx) => (
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
                    Nuevo
                  </Badge>
                )}
              </Box>
            ))}
            {trend.products.length > 3 && (
              <Text size="xs" c="dimmed" fw={500}>
                +{trend.products.length - 3} más
              </Text>
            )}
          </Group>
        )}

        {/* Metrics Grid */}
        <Stack gap="xs">
          {/* Price Range */}
          {trend.min_price !== undefined && trend.max_price !== undefined && (
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs">
                <IconChartBar size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" fw={500} c="dimmed">
                  Rango de precio:
                </Text>
              </Group>
              <Text size="sm" fw={600}>
                <NumberFormatter
                  value={trend.min_price}
                  prefix={currency + ' '}
                  thousandSeparator
                  decimalScale={0}
                />{' '}
                -{' '}
                <NumberFormatter
                  value={trend.max_price}
                  prefix={currency + ' '}
                  thousandSeparator
                  decimalScale={0}
                />
              </Text>
            </Group>
          )}

          {/* Average Price */}
          {trend.avg_price !== undefined && (
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs">
                <IconChartBar size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" fw={500} c="dimmed">
                  Precio promedio:
                </Text>
              </Group>
              <Text size="sm" fw={700} c="blue">
                <NumberFormatter
                  value={trend.avg_price}
                  prefix={currency + ' '}
                  thousandSeparator
                  decimalScale={0}
                />
              </Text>
            </Group>
          )}

          {/* Total Sold */}
          {trend.total_sold !== undefined && trend.total_sold > 0 && (
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs">
                <IconShoppingCart size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" fw={500} c="dimmed">
                  Ventas totales:
                </Text>
              </Group>
              <Text size="sm" fw={600} c="green">
                <NumberFormatter
                  value={trend.total_sold}
                  thousandSeparator
                  suffix=" unidades"
                />
              </Text>
            </Group>
          )}

          {/* Free Shipping */}
          {trend.free_shipping_percentage !== undefined && (
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs">
                <IconTruck size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" fw={500} c="dimmed">
                  Envío gratis:
                </Text>
              </Group>
              <Text size="sm" fw={600} c={trend.free_shipping_percentage >= 50 ? 'green' : 'orange'}>
                {Math.round(trend.free_shipping_percentage)}%
              </Text>
            </Group>
          )}

          {/* Total Results */}
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" fw={500} c="dimmed">
              Resultados de búsqueda:
            </Text>
            <Text size="sm" fw={600}>
              <NumberFormatter value={trend.total_results} thousandSeparator />
            </Text>
          </Group>
        </Stack>

        {/* Footer */}
        <Group justify="flex-end" mt="auto" pt="md">
          <Text size="sm" fw={600} c="meliBlue">
            Ver productos →
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
