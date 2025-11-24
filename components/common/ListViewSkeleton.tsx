"use client";

import {
  Paper,
  Skeleton,
  Stack,
  Group,
  Center,
  Chip,
} from "@mantine/core";

/**
 * Skeleton for the list view (vertical list of papers)
 * Replicates the structure: Chip filters + Stack of Paper items
 */
export function ListViewSkeleton() {
  return (
    <Stack gap="lg">
      {/* Chip Filter Skeleton */}
      <Center>
        <Chip.Group value="all" multiple={false}>
          <Group justify="center" gap="xs">
            <Chip value="all" variant="filled" disabled>
              Todos
            </Chip>
            <Chip value="fastest_growing" variant="filled" disabled>
              Mayor Crecimiento
            </Chip>
            <Chip value="most_wanted" variant="filled" disabled>
              Más Buscados
            </Chip>
            <Chip value="most_popular" variant="filled" disabled>
              Más Populares
            </Chip>
          </Group>
        </Chip.Group>
      </Center>

      {/* List Skeleton */}
      <Stack gap="xs">
        {Array.from({ length: 12 }).map((_, index) => (
          <Paper
            key={index}
            shadow="xs"
            p="md"
            radius="md"
            withBorder
          >
            <Group justify="space-between" wrap="nowrap">
              {/* Left side: Rank + Keyword + Type */}
              <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
                {/* Rank Badge */}
                <Skeleton height={32} width={70} radius="md" />

                {/* Keyword */}
                <Skeleton height={20} width="40%" />

                {/* Type Badge */}
                <Skeleton height={24} width={120} radius="md" />
              </Group>

              {/* Right side: Actions */}
              <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                <Skeleton height={28} width={28} radius="sm" />
                <Skeleton height={28} width={28} radius="sm" />
              </Group>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
