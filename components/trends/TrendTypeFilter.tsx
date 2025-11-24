"use client";

import { SegmentedControl, Center, Chip, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import type { TrendType } from "@/types/meli";

interface TrendTypeFilterProps {
  value: "all" | TrendType;
  onChange: (value: "all" | TrendType) => void;
}

/**
 * Reusable filter component for trend types
 * Used across Gallery, Table, and List views
 * Responsive: Chip.Group on mobile, SegmentedControl on desktop
 */
export function TrendTypeFilter({ value, onChange }: TrendTypeFilterProps) {
  const t = useTranslations();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Mobile: Chip.Group (allows wrapping for 4+ options)
  if (isMobile) {
    return (
      <Center>
        <Chip.Group
          value={value}
          onChange={(val) => onChange(val as "all" | TrendType)}
          multiple={false}
        >
          <Group justify="center" gap="xs">
            <Chip value="all" variant="filled" size="md" radius="xl">
              {t("trends.filters.all")}
            </Chip>
            <Chip value="fastest_growing" variant="filled" size="md" radius="xl">
              {t("trends.filters.fastestGrowing")}
            </Chip>
            <Chip value="most_wanted" variant="filled" size="md" radius="xl">
              {t("trends.filters.mostWanted")}
            </Chip>
            <Chip value="most_popular" variant="filled" size="md" radius="xl">
              {t("trends.filters.mostPopular")}
            </Chip>
          </Group>
        </Chip.Group>
      </Center>
    );
  }

  // Desktop: SegmentedControl (cleaner look for wider screens)
  return (
    <SegmentedControl
      value={value}
      onChange={(val) => onChange(val as "all" | TrendType)}
      data={[
        { label: t("trends.filters.all"), value: "all" },
        { label: t("trends.filters.fastestGrowing"), value: "fastest_growing" },
        { label: t("trends.filters.mostWanted"), value: "most_wanted" },
        { label: t("trends.filters.mostPopular"), value: "most_popular" },
      ]}
      fullWidth
      color="meliBlue"
      size="lg"
      radius="xl"
    />
  );
}
