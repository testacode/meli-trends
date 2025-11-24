"use client";

import {
  Table,
  Skeleton,
  Stack,
  ScrollArea,
  Center,
  Group,
  Chip,
} from "@mantine/core";
import { useTranslations } from "next-intl";

/**
 * Skeleton for the table view
 * Replicates the structure: Chip filters + Table with headers and rows
 */
export function TableSkeleton() {
  const t = useTranslations('trends.filters');

  return (
    <Stack gap="lg">
      {/* Chip Filter Skeleton */}
      <Center>
        <Chip.Group value="all" multiple={false}>
          <Group justify="center" gap="xs">
            <Chip value="all" variant="filled" disabled>
              {t('all')}
            </Chip>
            <Chip value="fastest_growing" variant="filled" disabled>
              {t('fastestGrowing')}
            </Chip>
            <Chip value="most_wanted" variant="filled" disabled>
              {t('mostWanted')}
            </Chip>
            <Chip value="most_popular" variant="filled" disabled>
              {t('mostPopular')}
            </Chip>
          </Group>
        </Chip.Group>
      </Center>

      {/* Table Skeleton */}
      <ScrollArea>
        <Table highlightOnHover withTableBorder withColumnBorders striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '80px', textAlign: 'center' }}>
                <Skeleton height={16} width="100%" />
              </Table.Th>
              <Table.Th>
                <Skeleton height={16} width={120} />
              </Table.Th>
              <Table.Th style={{ width: '200px' }}>
                <Skeleton height={16} width={100} />
              </Table.Th>
              <Table.Th style={{ width: '120px', textAlign: 'center' }}>
                <Skeleton height={16} width={80} />
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.from({ length: 15 }).map((_, index) => (
              <Table.Tr key={index}>
                {/* Rank */}
                <Table.Td style={{ textAlign: 'center' }}>
                  <Center>
                    <Skeleton height={28} width={60} radius="md" />
                  </Center>
                </Table.Td>

                {/* Keyword */}
                <Table.Td>
                  <Skeleton height={16} width="80%" />
                </Table.Td>

                {/* Type */}
                <Table.Td>
                  <Skeleton height={24} width="100%" radius="md" />
                </Table.Td>

                {/* Actions */}
                <Table.Td>
                  <Group gap={4} justify="center" wrap="nowrap">
                    <Skeleton height={28} width={28} radius="sm" />
                    <Skeleton height={28} width={28} radius="sm" />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
}
