"use client";

import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Select,
  Card,
  Badge,
  Group,
  Alert,
  Button,
  Table,
  Anchor,
  Code,
} from "@mantine/core";
import { IconAlertCircle, IconTrophy, IconExternalLink } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useBestSellers } from "@/hooks/useBestSellers";
import type { SiteId } from "@/types/meli";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { ErrorState } from "@/components/common/ErrorState";

// Common MercadoLibre category IDs for testing
// These are examples - actual IDs may vary by country
const TEST_CATEGORIES = [
  { value: "MLA1051", label: "Celulares y Teléfonos" },
  { value: "MLA1648", label: "Computación" },
  { value: "MLA1000", label: "Electrónica, Audio y Video" },
  { value: "MLA1144", label: "Consolas y Videojuegos" },
  { value: "MLA1039", label: "Cámaras y Accesorios" },
  { value: "MLA1367", label: "Industrias y Oficinas" },
  { value: "MLA1368", label: "Hogar y Muebles" },
  { value: "MLA1430", label: "Ropa y Accesorios" },
  { value: "MLA1132", label: "Juegos y Juguetes" },
  { value: "MLA1071", label: "Animales y Mascotas" },
];

// Default country for testing
const DEFAULT_COUNTRY: SiteId = "MLA";

export default function BestSellersPrototypePage() {
  const t = useTranslations("bestSellers");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, isLoading, error } = useBestSellers({
    country: DEFAULT_COUNTRY,
    categoryId: selectedCategory,
    enabled: !!selectedCategory,
  });

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={1}>{t("title")}</Title>
          <Text c="dimmed" mt="xs">
            {t("description")}
          </Text>
        </div>

        {/* Testing Info Alert */}
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t("testingInfo")}
          color="blue"
          variant="light"
        >
          <Text size="sm">
            {t("selectCategory")}
          </Text>
        </Alert>

        {/* Category Selector */}
        <Card withBorder>
          <Select
            label={t("categoryLabel")}
            placeholder={t("categoryPlaceholder")}
            data={TEST_CATEGORIES}
            value={selectedCategory}
            onChange={setSelectedCategory}
            searchable
            clearable
            size="md"
          />
        </Card>

        {/* CloudFront Status (if data available) */}
        {data?._meta && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="CloudFront Status"
            color={
              data._meta.cloudfront_status.includes("Error") ||
              data._meta.cloudfront_status.includes("cloudfront")
                ? "red"
                : "green"
            }
            variant="light"
          >
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {t("statusLabel")}
                </Text>
                <Code>{data._meta.cloudfront_status}</Code>
              </Group>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  Server:
                </Text>
                <Code>{data._meta.server}</Code>
              </Group>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {t("testedAt")}
                </Text>
                <Code>{new Date(data._meta.tested_at).toLocaleString()}</Code>
              </Group>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {t("testedFrom")}
                </Text>
                <Code>{data._meta.tested_from}</Code>
              </Group>
            </Stack>
          </Alert>
        )}

        {/* CloudFront Error (if blocked) */}
        {error?.message.includes("CloudFront blocking") && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t("cloudFrontWarning")}
            color="red"
            variant="filled"
          >
            <Text size="sm" mb="md">
              {t("cloudFrontDetails")}
            </Text>
            <Button
              component="a"
              href="/docs/architecture/search-api-403-investigation-2025-11.md"
              target="_blank"
              size="xs"
              variant="white"
              color="red"
            >
              View Documentation
            </Button>
          </Alert>
        )}

        {/* Results */}
        {!selectedCategory && (
          <Card withBorder>
            <Text c="dimmed" ta="center">
              {t("noCategory")}
            </Text>
          </Card>
        )}

        {isLoading && <ListSkeleton count={20} />}

        {error && !error.message.includes("CloudFront blocking") && (
          <ErrorState
            message={error.message}
            onRetry={() => {
              // Query will auto-retry
            }}
          />
        )}

        {data && data.content && data.content.length > 0 && (
          <Card withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Title order={2} size="h3">
                    <Group gap="xs">
                      <IconTrophy size={24} />
                      {t("top20")}
                    </Group>
                  </Title>
                  <Text size="sm" c="dimmed" mt={4}>
                    {t("resultsCount", { count: data.content.length })}
                  </Text>
                </div>
                <Badge size="lg" variant="light" color="blue">
                  {data.query_data.criteria}
                </Badge>
              </Group>

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("position")}</Table.Th>
                    <Table.Th>Item ID</Table.Th>
                    <Table.Th>{t("itemType")}</Table.Th>
                    <Table.Th>{t("viewProduct")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.content.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Badge
                          size="lg"
                          variant="gradient"
                          gradient={
                            item.position === 1
                              ? { from: "yellow", to: "orange" }
                              : item.position <= 3
                                ? { from: "gray", to: "dark" }
                                : { from: "blue", to: "cyan" }
                          }
                        >
                          #{item.position}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Code>{item.id}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={item.type === "ITEM" ? "green" : "blue"}
                          variant="light"
                        >
                          {item.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Anchor
                          href={`https://www.mercadolibre.com.ar/p/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Group gap="xs">
                            {t("viewProduct")}
                            <IconExternalLink size={14} />
                          </Group>
                        </Anchor>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
