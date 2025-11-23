"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AppShell,
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Button,
  Paper,
  Box,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowLeft, IconDeviceDesktop } from "@tabler/icons-react";
import Link from "next/link";
import { useTrends } from "@/hooks/useTrends";
import { Header } from "@/components/layout/Header";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { CategoryColumn } from "@/components/trends/CategoryColumn";
import { COUNTRIES, type SiteId } from "@/utils/constants";
import { analyzeProductDistribution } from "@/utils/productCategories";

export default function TrendsOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const country = params.country as SiteId;

  // Media query for responsive behavior
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Validate country
  const isValidCountry = country && country in COUNTRIES;

  // Fetch trends
  const { data, loading, error, refetch } = useTrends({
    siteId: country,
  });

  // Filter trends by type
  const trendsByType = useMemo(() => {
    if (!data) {
      return {
        fastest_growing: [],
        most_wanted: [],
        most_popular: [],
      };
    }

    return {
      fastest_growing: data.filter(
        (trend) => trend.trend_type === "fastest_growing"
      ),
      most_wanted: data.filter((trend) => trend.trend_type === "most_wanted"),
      most_popular: data.filter((trend) => trend.trend_type === "most_popular"),
    };
  }, [data]);

  // Analyze product distribution for each category
  const distributions = useMemo(() => {
    return {
      fastest_growing: analyzeProductDistribution(
        trendsByType.fastest_growing
      ),
      most_wanted: analyzeProductDistribution(trendsByType.most_wanted),
      most_popular: analyzeProductDistribution(trendsByType.most_popular),
    };
  }, [trendsByType]);

  // Redirect to default country if invalid
  useEffect(() => {
    if (!isValidCountry) {
      router.push("/");
    }
  }, [isValidCountry, router]);

  // Show nothing if invalid country (will redirect)
  if (!isValidCountry) {
    return null;
  }

  const countryData = COUNTRIES[country];

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header currentCountry={country} />

      <AppShell.Main>
        <Container size="xl" py="xl">
          {/* Page Header */}
          <Stack gap="lg" mb="xl">
            <Box>
              <Button
                component={Link}
                href={`/trends/${country}`}
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                size="sm"
              >
                Volver a vista lista
              </Button>
            </Box>

            <Stack gap="xs">
              <Title order={1}>
                {countryData.flag} Análisis de Tendencias en{" "}
                {countryData.name}
              </Title>
              <Text size="lg" c="dimmed">
                Vista por categorías con análisis de tipos de productos
              </Text>
            </Stack>
          </Stack>

          {/* Mobile Warning */}
          {isMobile && (
            <Paper p="xl" withBorder bg="meliBlue.0" mb="xl">
              <Stack align="center" gap="md">
                <IconDeviceDesktop size={48} />
                <Title order={3} ta="center">
                  Vista optimizada para desktop
                </Title>
                <Text ta="center" c="dimmed">
                  Esta vista funciona mejor en pantallas más grandes. Te
                  recomendamos usar una computadora para una mejor experiencia.
                </Text>
                <Button component={Link} href={`/trends/${country}`}>
                  Volver a vista lista
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Loading State */}
          {loading && <LoadingSkeleton />}

          {/* Error State */}
          {error && !loading && <ErrorState error={error} onRetry={refetch} />}

          {/* Content - 3 Column Layout */}
          {data && !loading && !error && (
            <SimpleGrid
              cols={{ base: 1, md: 3 }}
              spacing="lg"
              style={{ alignItems: "start" }}
            >
              <CategoryColumn
                trendType="fastest_growing"
                trends={trendsByType.fastest_growing}
                distribution={distributions.fastest_growing}
              />

              <CategoryColumn
                trendType="most_wanted"
                trends={trendsByType.most_wanted}
                distribution={distributions.most_wanted}
              />

              <CategoryColumn
                trendType="most_popular"
                trends={trendsByType.most_popular}
                distribution={distributions.most_popular}
              />
            </SimpleGrid>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
