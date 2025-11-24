"use client";

import {
  SimpleGrid,
  Skeleton,
  Stack,
  Card,
  Center,
  Group,
  Chip,
} from "@mantine/core";

/**
 * Skeleton for the gallery view (grid of cards)
 * Replicates the structure: Header + Chip filters + Grid of cards
 */
export function GallerySkeleton() {
  return (
    <Stack gap="lg">
      {/* Header Skeleton */}
      <Stack gap="xs">
        <Skeleton height={32} width="40%" radius="md" />
        <Skeleton height={16} width="25%" radius="md" />
      </Stack>

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

      {/* Grid Skeleton */}
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
        spacing={{ base: "md", sm: "lg" }}
        verticalSpacing={{ base: "md", sm: "lg" }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="sm">
              {/* Rank badge skeleton */}
              <Skeleton height={28} width={60} radius="md" />

              {/* Keyword skeleton */}
              <Skeleton height={24} width="100%" radius="md" />

              {/* Category skeleton */}
              <Skeleton height={20} width="80%" radius="md" />

              {/* URL skeleton */}
              <Skeleton height={16} width="50%" radius="md" mt="auto" />
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
