"use client";

import { useState, useEffect } from "react";
import { BarChart } from "@mantine/charts";
import { Stack, Text, Box } from "@mantine/core";
import type { CategoryDistribution } from "@/utils/productCategories";

type CategoryDistributionChartProps = {
  distribution: CategoryDistribution[];
};

/**
 * Displays a horizontal bar chart showing distribution of product categories
 */
export function CategoryDistributionChart({
  distribution,
}: CategoryDistributionChartProps) {
  // Wait for client-side mount to avoid Recharts dimension warnings
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Legitimate use case: preventing hydration mismatches with Recharts
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (distribution.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        No hay datos suficientes
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

      {/* Bar chart - only render after mount to avoid dimension warnings */}
      {isMounted && (
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
      )}
    </Stack>
  );
}
