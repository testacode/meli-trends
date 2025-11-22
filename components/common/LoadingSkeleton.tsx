'use client';

import { SimpleGrid, Skeleton, Stack, Card } from '@mantine/core';

export function LoadingSkeleton() {
  return (
    <Stack gap="lg">
      {/* Header Skeleton */}
      <Stack gap="xs">
        <Skeleton height={32} width="40%" radius="md" />
        <Skeleton height={16} width="25%" radius="md" />
      </Stack>

      {/* Grid Skeleton */}
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
        spacing={{ base: 'md', sm: 'lg' }}
        verticalSpacing={{ base: 'md', sm: 'lg' }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="sm">
              <Skeleton height={28} width={60} radius="md" />
              <Skeleton height={24} width="100%" radius="md" />
              <Skeleton height={20} width="80%" radius="md" />
              <Skeleton height={16} width="50%" radius="md" mt="auto" />
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
