"use client";

import dynamic from "next/dynamic";
import { Stack, Title, Text, Paper, Box } from "@mantine/core";
import { useTranslations } from "next-intl";
import type { TrendItem, TrendType } from "@/types/meli";
import type { CategoryDistribution } from "@/utils/productCategories";
import { getTrendTypeLabel } from "@/utils/trends";
import { TrendCard } from "./TrendCard";

// Dynamic import with SSR disabled to prevent Recharts dimension warnings
const CategoryDistributionChart = dynamic(
  () =>
    import("./CategoryDistributionChart").then(
      (mod) => mod.CategoryDistributionChart
    ),
  { ssr: false }
);

type CategoryColumnProps = {
  trendType: TrendType;
  trends: TrendItem[];
  distribution: CategoryDistribution[];
};

/**
 * Color mapping for trend type headers
 */
const TREND_TYPE_COLORS: Record<TrendType, string> = {
  fastest_growing: "red.6",
  most_wanted: "meliBlue.6",
  most_popular: "green.6",
};

/**
 * Displays a column with trends of a specific category type
 */
export function CategoryColumn({
  trendType,
  trends,
  distribution,
}: CategoryColumnProps) {
  const t = useTranslations();

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper p="md" withBorder style={{ borderLeftWidth: 4 }}>
        <Stack gap="xs">
          <Title
            order={3}
            size="h4"
            c={TREND_TYPE_COLORS[trendType]}
            style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {getTrendTypeLabel(trendType)}
          </Title>
          <Text size="sm" c="dimmed">
            {t('overview.productCount', { count: trends.length })}
          </Text>
        </Stack>

        {/* Product Category Distribution */}
        {distribution.length > 0 && (
          <Box mt="md">
            <CategoryDistributionChart distribution={distribution} />
          </Box>
        )}
      </Paper>

      {/* Trend Cards */}
      <Stack gap="md">
        {trends.length === 0 ? (
          <Paper p="xl" withBorder>
            <Text size="sm" c="dimmed" ta="center">
              {t('overview.noTrendsInCategory')}
            </Text>
          </Paper>
        ) : (
          trends.map((trend, index) => {
            // Independent ranking within this category column
            const rank = index + 1;

            return <TrendCard key={`${trend.keyword}-${rank}`} trend={trend} rank={rank} />;
          })
        )}
      </Stack>
    </Stack>
  );
}
