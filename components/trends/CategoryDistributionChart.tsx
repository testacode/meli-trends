"use client";

import { BarChart } from "@mantine/charts";
import { Stack, Text, Box } from "@mantine/core";
import { useTranslations } from "next-intl";
import type { CategoryDistribution } from "@/utils/productCategories";

type CategoryDistributionChartProps = {
  distribution: CategoryDistribution[];
};

/**
 * Displays a horizontal bar chart showing distribution of product categories
 * Note: This component is loaded dynamically with ssr: false in CategoryColumn.tsx
 */
export function CategoryDistributionChart({
  distribution,
}: CategoryDistributionChartProps) {
  const t = useTranslations();

  if (distribution.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        {t('overview.insufficientData')}
      </Text>
    );
  }

  // Prepare data for chart - map to format expected by Mantine BarChart
  const chartData = distribution.map((item) => ({
    category: item.label,
    percentage: item.percentage,
  }));

  return (
    <Stack gap="xs">
      {/* Summary text */}
      <Stack gap={4}>
        {distribution.slice(0, 3).map((item) => (
          <Text key={item.category} size="sm" c="dimmed">
            {item.label}{" "}
            <Text component="span" fw={600}>
              {item.percentage}%
            </Text>
          </Text>
        ))}
      </Stack>

      {/* Bar chart */}
      <Box style={{ minHeight: 80, width: "100%", minWidth: 200 }}>
        <BarChart
          h={80}
          data={chartData}
          dataKey="category"
          series={[
            {
              name: "percentage",
              color: "meliBlue.6",
            },
          ]}
          orientation="horizontal"
          withLegend={false}
          withYAxis={false}
          gridAxis="none"
          tickLine="none"
          withTooltip={false}
        />
      </Box>
    </Stack>
  );
}
