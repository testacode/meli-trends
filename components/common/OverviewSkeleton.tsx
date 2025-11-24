"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  SimpleGrid,
  Paper,
  Skeleton,
  Box,
  SegmentedControl,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslations } from "next-intl";

/**
 * Skeleton for a single CategoryColumn
 * Replicates the structure: Paper header + chart placeholder + trend cards
 */
function CategoryColumnSkeleton() {
  return (
    <Stack gap="md">
      {/* Header Paper with Chart Placeholder */}
      <Paper p="md" withBorder style={{ borderLeftWidth: 4 }}>
        <Stack gap="xs">
          {/* Title skeleton */}
          <Skeleton height={24} width="60%" radius="sm" />

          {/* Count text skeleton */}
          <Skeleton height={16} width="40%" radius="sm" />
        </Stack>

        {/* Chart placeholder (circular) */}
        <Box mt="md" style={{ display: "flex", justifyContent: "center" }}>
          <Skeleton height={200} circle />
        </Box>
      </Paper>

      {/* Trend Cards Stack */}
      <Stack gap="md">
        {[...Array(5)].map((_, index) => (
          <Paper key={index} p="md" withBorder>
            <Stack gap="sm">
              {/* Rank badge + keyword */}
              <Box style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Skeleton height={32} width={32} radius="sm" />
                <Skeleton height={20} width="70%" radius="sm" />
              </Box>

              {/* Category + URL */}
              <Skeleton height={14} width="50%" radius="sm" />
              <Skeleton height={14} width="60%" radius="sm" />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}

/**
 * Overview page skeleton that replicates the exact structure:
 * - Desktop: 3-column grid
 * - Mobile: SegmentedControl + single column
 */
export function OverviewSkeleton() {
  const t = useTranslations('overview.segments');
  // Defer mobile detection until after mount to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid: Mounted flag pattern to prevent SSR/client hydration mismatch
    setMounted(true);
  }, []);

  // Before mount, always render desktop layout (matches SSR)
  if (!mounted) {
    return (
      <SimpleGrid
        cols={{ base: 1, md: 3 }}
        spacing="lg"
        style={{ alignItems: "start" }}
      >
        <CategoryColumnSkeleton />
        <CategoryColumnSkeleton />
        <CategoryColumnSkeleton />
      </SimpleGrid>
    );
  }

  // After mount, use actual media query result
  if (isMobile) {
    return (
      <Stack gap="lg">
        {/* SegmentedControl Skeleton */}
        <SegmentedControl
          value="fastest_growing"
          data={[
            { label: t('fast'), value: "fastest_growing" },
            { label: t('wanted'), value: "most_wanted" },
            { label: t('popular'), value: "most_popular" },
          ]}
          fullWidth
          disabled
          size="lg"
          radius="xl"
        />

        {/* Single Column Skeleton */}
        <CategoryColumnSkeleton />
      </Stack>
    );
  }

  // Desktop: 3-column grid
  return (
    <SimpleGrid
      cols={{ base: 1, md: 3 }}
      spacing="lg"
      style={{ alignItems: "start" }}
    >
      <CategoryColumnSkeleton />
      <CategoryColumnSkeleton />
      <CategoryColumnSkeleton />
    </SimpleGrid>
  );
}
